jest.mock("../../AccountModel", () => {
  const Account = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
  });

  return { Account };
});

jest.mock("../../../transactions/TransactionModel", () => {
  const Transaction = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Transaction };
});

jest.mock("../../../idempotency/IdempotencyRequestModel", () => {
  const IdempotencyRequest = Object.assign(jest.fn(), {
    findOne: jest.fn(),
  });

  return { IdempotencyRequest };
});

jest.mock("../../../ledger/LedgerEntryModel", () => {
  const LedgerEntry = Object.assign(jest.fn(), {
    aggregate: jest.fn(),
  });

  return { LedgerEntry };
});

jest.mock("../../../notifications/transferNotificationBus", () => ({
  transferNotificationBus: {
    publishTransferReceived: jest.fn(),
  },
}));

import mongoose from "mongoose";
import { executeGraphQL } from "../../../../__tests__/helpers/executeGraphQL";
import { createAccountDocument } from "../../../../__tests__/factories/createAccountDocument";
import { createTransactionDocument } from "../../../../__tests__/factories/createTransactionDocument";
import { Account } from "../../AccountModel";
import { Transaction } from "../../../transactions/TransactionModel";
import { IdempotencyRequest } from "../../../idempotency/IdempotencyRequestModel";
import { LedgerEntry } from "../../../ledger/LedgerEntryModel";
import { transferNotificationBus } from "../../../notifications/transferNotificationBus";

const AccountModel = Account as unknown as jest.Mock & {
  findById: jest.Mock;
  findOne: jest.Mock;
};

const TransactionModel = Transaction as unknown as jest.Mock;

const IdempotencyRequestModel = IdempotencyRequest as unknown as {
  new (...args: unknown[]): { save: jest.Mock };
  findOne: jest.Mock;
};

const LedgerEntryModel = LedgerEntry as unknown as jest.Mock & {
  aggregate: jest.Mock;
};

const TransferNotificationBus = transferNotificationBus as unknown as {
  publishTransferReceived: jest.Mock;
};

describe("AddCredit mutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registra credito administrativo como entrada e notifica igual transferencia", async () => {
    const adminAccount = createAccountDocument({
      id: "account-admin-1",
      userId: "admin-user-1",
      holderName: "Administrador",
    });
    const beneficiaryAccount = createAccountDocument({
      id: "account-beneficiary-1",
      userId: "user-2",
      holderName: "Cliente",
    });
    const transaction = createTransactionDocument({
      id: "transaction-admin-credit-1",
      fromAccountId: "account-admin-1",
      toAccountId: "account-beneficiary-1",
      amount: 150,
      idempotencyKey: "idem-admin-credit-1",
      description: "Credito administrativo",
      createdAt: new Date("2026-02-02T10:00:00.000Z"),
    });

    IdempotencyRequestModel.findOne.mockResolvedValue(null);
    AccountModel.findById.mockResolvedValue(beneficiaryAccount);
    AccountModel.findOne.mockResolvedValue(adminAccount);
    TransactionModel.mockImplementation(() => transaction);
    LedgerEntryModel.aggregate.mockResolvedValue([{ balance: 150 }]);

    const ledgerEntryDoc = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    LedgerEntryModel.mockImplementation(() => ledgerEntryDoc);

    const idempotencyRequestDoc = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    (IdempotencyRequest as unknown as jest.Mock).mockImplementation(
      () => idempotencyRequestDoc,
    );

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
        AddCredit(
          accountId: "account-beneficiary-1"
          amount: 150
          idempotencyKey: "idem-admin-credit-1"
        ) {
          id
          balance
        }
      }
    `,
      {
        auth: {
          userId: "admin-user-1",
          role: "ADMIN",
        },
      },
    );

    expect(result.errors).toBeUndefined();
    expect(TransactionModel).toHaveBeenCalledWith({
      fromAccountId: "account-admin-1",
      toAccountId: "account-beneficiary-1",
      amount: 150,
      idempotencyKey: "idem-admin-credit-1",
      description: "Credito administrativo",
    });
    expect(LedgerEntryModel).toHaveBeenCalledWith({
      accountId: "account-beneficiary-1",
      transferId: "transaction-admin-credit-1",
      amount: 150,
      type: "ADMIN_CREDIT",
    });
    expect(TransferNotificationBus.publishTransferReceived).toHaveBeenCalledWith({
      transactionId: "transaction-admin-credit-1",
      fromAccountId: "account-admin-1",
      fromAccountHolderName: "Administrador",
      toAccountId: "account-beneficiary-1",
      amount: 150,
      description: "Credito administrativo",
      createdAt: "2026-02-02T10:00:00.000Z",
    });
    expect(endSession).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({
      AddCredit: {
        id: "account-beneficiary-1",
        balance: 150,
      },
    });
  });

  it("falha quando a conta de destino esta inativa", async () => {
    const inactiveAccount = createAccountDocument({
      id: "account-inactive-1",
      userId: "user-inactive-1",
      holderName: "Conta Inativa",
      active: false,
    });
    const adminAccount = createAccountDocument({
      id: "account-admin-1",
      userId: "admin-user-1",
      holderName: "Administrador",
    });

    IdempotencyRequestModel.findOne.mockResolvedValue(null);
    AccountModel.findById.mockResolvedValue(inactiveAccount);
    AccountModel.findOne.mockResolvedValue(adminAccount);
    const transaction = createTransactionDocument({
      id: "transaction-inactive-1",
      fromAccountId: "account-admin-1",
      toAccountId: "account-inactive-1",
      amount: 150,
      idempotencyKey: "idem-admin-credit-inactive",
      description: "Credito administrativo",
    });
    TransactionModel.mockImplementation(() => transaction);

    const ledgerEntryDoc = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    LedgerEntryModel.mockImplementation(() => ledgerEntryDoc);

    const idempotencyRequestDoc = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    (IdempotencyRequest as unknown as jest.Mock).mockImplementation(
      () => idempotencyRequestDoc,
    );
    jest.spyOn(mongoose, "startSession").mockResolvedValue({
      withTransaction: async (callback: () => Promise<void>) => {
        await callback();
      },
      endSession: jest.fn(),
    } as never);

    const result = await executeGraphQL(
      `
      mutation {
        AddCredit(
          accountId: "account-inactive-1"
          amount: 150
          idempotencyKey: "idem-admin-credit-inactive"
        ) {
          id
        }
      }
    `,
      {
        auth: {
          userId: "admin-user-1",
          role: "ADMIN",
        },
      },
    );

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain(
      "Credito administrativo permitido apenas para conta ativa",
    );
    expect(TransactionModel).not.toHaveBeenCalled();
    expect(LedgerEntryModel).not.toHaveBeenCalled();
    expect(TransferNotificationBus.publishTransferReceived).not.toHaveBeenCalled();
  });
});
