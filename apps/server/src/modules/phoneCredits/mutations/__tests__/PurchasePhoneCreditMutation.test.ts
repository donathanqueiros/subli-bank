jest.mock("../../../accounts/AccountModel", () => {
  const Account = Object.assign(jest.fn(), {
    findOne: jest.fn(),
  });

  return { Account };
});

jest.mock("../../../ledger/LedgerEntryModel", () => {
  const LedgerEntry = Object.assign(jest.fn(), {
    aggregate: jest.fn(),
  });

  return { LedgerEntry };
});

jest.mock("../../PhoneCreditPurchaseModel", () => {
  const PhoneCreditPurchase = Object.assign(jest.fn(), {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  });

  return { PhoneCreditPurchase };
});

import mongoose from "mongoose";
import { createAccountDocument } from "../../../../__tests__/factories/createAccountDocument";
import { executeGraphQL } from "../../../../__tests__/helpers/executeGraphQL";
import { Account } from "../../../accounts/AccountModel";
import { LedgerEntry } from "../../../ledger/LedgerEntryModel";
import { PhoneCreditPurchase } from "../../PhoneCreditPurchaseModel";

const AccountModel = Account as unknown as {
  findOne: jest.Mock;
};

const LedgerEntryModel = LedgerEntry as unknown as jest.Mock & {
  aggregate: jest.Mock;
};

const PhoneCreditPurchaseModel = PhoneCreditPurchase as unknown as jest.Mock & {
  findOne: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
};

describe("PurchasePhoneCredit mutation and queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna erro quando usuario nao esta autenticado", async () => {
    const result = await executeGraphQL(`
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 20, idempotencyKey: "idem-unauth") {
          id
        }
      }
    `);

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("Usuario nao autenticado");
  });

  it("retorna erro quando telefone e invalido", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "11999999999", amount: 20, idempotencyKey: "idem-phone") {
          id
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("Telefone invalido");
  });

  it("retorna erro quando valor nao faz parte da grade permitida", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 25, idempotencyKey: "idem-amount") {
          id
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("Valor de recarga invalido");
  });

  it("retorna erro quando conta do usuario esta inativa", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({
        id: "account-1",
        userId: "user-1",
        active: false,
      }),
    );

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 20, idempotencyKey: "idem-inactive") {
          id
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain(
      "Recarga permitida apenas para conta ativa",
    );
  });

  it("retorna erro quando nao ha saldo suficiente", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );
    PhoneCreditPurchaseModel.findOne.mockResolvedValue(null);
    LedgerEntryModel.aggregate.mockResolvedValue([{ balance: 10 }]);

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 20, idempotencyKey: "idem-balance") {
          id
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("Saldo insuficiente");
  });

  it("registra a recarga e debita saldo quando ha saldo suficiente", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );
    PhoneCreditPurchaseModel.findOne.mockResolvedValue(null);
    LedgerEntryModel.aggregate.mockResolvedValue([{ balance: 120 }]);

    const purchaseDoc = {
      id: "phone-credit-1",
      accountId: "account-1",
      phone: "+5511999999999",
      amount: 30,
      status: "RECORDED",
      createdAt: new Date("2026-03-20T12:00:00.000Z"),
      save: jest.fn().mockResolvedValue(undefined),
    };
    PhoneCreditPurchaseModel.mockImplementation(() => purchaseDoc);

    const ledgerEntryDoc = {
      id: "ledger-1",
      save: jest.fn().mockResolvedValue(undefined),
    };
    LedgerEntryModel.mockImplementation(() => ledgerEntryDoc);

    const endSession = jest.fn();
    jest.spyOn(mongoose, "startSession").mockResolvedValue({
      withTransaction: async (callback: () => Promise<void>) => {
        await callback();
      },
      endSession,
    } as never);

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 30, idempotencyKey: "idem-success") {
          id
          phone
          amount
          status
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(PhoneCreditPurchaseModel).toHaveBeenCalledWith({
      accountId: "account-1",
      phone: "+5511999999999",
      amount: 30,
      status: "RECORDED",
      idempotencyKey: "idem-success",
    });
    expect(LedgerEntryModel).toHaveBeenCalledWith({
      accountId: "account-1",
      amount: -30,
      type: "DEBIT",
    });
    expect(ledgerEntryDoc.save).toHaveBeenCalledWith(expect.any(Object));
    expect(purchaseDoc.save).toHaveBeenCalledWith(expect.any(Object));
    expect(result.data).toEqual({
      PurchasePhoneCredit: {
        id: "phone-credit-1",
        phone: "+5511999999999",
        amount: 30,
        status: "RECORDED",
      },
    });
    expect(endSession).toHaveBeenCalledTimes(1);
  });

  it("retorna a recarga existente quando a idempotencia ja foi usada", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );
    PhoneCreditPurchaseModel.findOne.mockResolvedValue({
      id: "phone-credit-existing",
      accountId: "account-1",
      phone: "+5511999999999",
      amount: 50,
      status: "RECORDED",
    });

    const result = await executeGraphQL(
      `
      mutation {
        PurchasePhoneCredit(phone: "+5511999999999", amount: 50, idempotencyKey: "idem-existing") {
          id
          amount
          status
        }
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(LedgerEntryModel).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      PurchasePhoneCredit: {
        id: "phone-credit-existing",
        amount: 50,
        status: "RECORDED",
      },
    });
  });

  it("retorna as recargas da conta autenticada e a contagem", async () => {
    AccountModel.findOne.mockResolvedValue(
      createAccountDocument({ id: "account-1", userId: "user-1" }),
    );
    PhoneCreditPurchaseModel.find.mockResolvedValue([
      {
        id: "phone-credit-1",
        accountId: "account-1",
        phone: "+5511999999999",
        amount: 20,
        status: "RECORDED",
        createdAt: new Date("2026-03-20T12:00:00.000Z"),
      },
    ]);
    PhoneCreditPurchaseModel.countDocuments.mockResolvedValue(1);

    const result = await executeGraphQL(
      `
      query {
        myPhoneCreditPurchases(page: 1, limit: 5) {
          id
          phone
          amount
          status
        }
        myPhoneCreditPurchasesCount
      }
    `,
      {
        auth: {
          userId: "user-1",
          role: "USER",
        },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(PhoneCreditPurchaseModel.find).toHaveBeenCalledWith(
      { accountId: "account-1" },
      null,
      expect.objectContaining({
        limit: 5,
        skip: 0,
        sort: { createdAt: -1 },
      }),
    );
    expect(PhoneCreditPurchaseModel.countDocuments).toHaveBeenCalledWith({
      accountId: "account-1",
    });
    expect(result.data).toEqual({
      myPhoneCreditPurchases: [
        {
          id: "phone-credit-1",
          phone: "+5511999999999",
          amount: 20,
          status: "RECORDED",
        },
      ],
      myPhoneCreditPurchasesCount: 1,
    });
  });
});
