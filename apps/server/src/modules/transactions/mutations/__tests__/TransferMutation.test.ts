jest.mock("../../../accounts/AccountModel", () => {
  const Account = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Account };
});

jest.mock("../../TransactionModel", () => {
  const Transaction = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Transaction };
});

import { createAccountDocument } from "../../../../__tests__/factories/createAccountDocument";
import { createTransactionDocument } from "../../../../__tests__/factories/createTransactionDocument";
import { executeGraphQL } from "../../../../__tests__/helpers/executeGraphQL";
import { Account } from "../../../accounts/AccountModel";
import { Transaction } from "../../TransactionModel";

const AccountModel = Account as unknown as jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
};

const TransactionModel = Transaction as unknown as jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
};

describe("Transfer mutation", () => {
  it("transfere saldo entre contas e persiste a transacao", async () => {
    const fromAccount = createAccountDocument({
      id: "account-1",
      balance: 500,
    });
    const toAccount = createAccountDocument({
      id: "account-2",
      balance: 50,
    });
    const transaction = createTransactionDocument({
      fromAccountId: "account-1",
      toAccountId: "account-2",
      amount: 120,
      description: "Pagamento",
    });

    AccountModel.findById
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);
    TransactionModel.mockImplementation(() => transaction);

    const result = await executeGraphQL(`
      mutation {
        Transfer(
          fromAccountId: "account-1"
          toAccountId: "account-2"
          amount: 120
          description: "Pagamento"
        ) {
          id
          amount
          description
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(fromAccount.balance).toBe(380);
    expect(toAccount.balance).toBe(170);
    expect(fromAccount.save).toHaveBeenCalledTimes(1);
    expect(toAccount.save).toHaveBeenCalledTimes(1);
    expect(TransactionModel).toHaveBeenCalledWith({
      fromAccountId: "account-1",
      toAccountId: "account-2",
      amount: 120,
      description: "Pagamento",
    });
    expect(transaction.save).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({
      Transfer: {
        id: "transaction-1",
        amount: 120,
        description: "Pagamento",
      },
    });
  });

  it("falha rapido quando o valor da transferencia e invalido", async () => {
    const result = await executeGraphQL(`
      mutation {
        Transfer(
          fromAccountId: "account-1"
          toAccountId: "account-2"
          amount: 0
        ) {
          id
        }
      }
    `);

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain(
      "Valor deve ser maior que zero",
    );
    expect(AccountModel.findById).not.toHaveBeenCalled();
    expect(TransactionModel).not.toHaveBeenCalled();
  });

  it("retorna erro quando a conta de origem nao tem saldo suficiente", async () => {
    const fromAccount = createAccountDocument({
      id: "account-1",
      balance: 20,
    });
    const toAccount = createAccountDocument({
      id: "account-2",
      balance: 50,
    });

    AccountModel.findById
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);

    const result = await executeGraphQL(`
      mutation {
        Transfer(
          fromAccountId: "account-1"
          toAccountId: "account-2"
          amount: 120
        ) {
          id
        }
      }
    `);

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("Saldo insuficiente");
    expect(fromAccount.save).not.toHaveBeenCalled();
    expect(toAccount.save).not.toHaveBeenCalled();
    expect(TransactionModel).not.toHaveBeenCalled();
  });
});