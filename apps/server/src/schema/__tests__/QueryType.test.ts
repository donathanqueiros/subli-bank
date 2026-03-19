jest.mock("../../modules/accounts/AccountModel", () => {
  const Account = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Account };
});

jest.mock("../../modules/transactions/TransactionModel", () => {
  const Transaction = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Transaction };
});

import { createAccountDocument } from "../../__tests__/factories/createAccountDocument";
import { createTransactionDocument } from "../../__tests__/factories/createTransactionDocument";
import { executeGraphQL } from "../../__tests__/helpers/executeGraphQL";
import { Account } from "../../modules/accounts/AccountModel";
import { Transaction } from "../../modules/transactions/TransactionModel";

const AccountModel = Account as unknown as jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
};

const TransactionModel = Transaction as unknown as jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
};

describe("QueryType", () => {
  it("lista contas pelo root query", async () => {
    AccountModel.find.mockResolvedValue([
      createAccountDocument({ id: "account-1", holderName: "Joao" }),
      createAccountDocument({ id: "account-2", holderName: "Maria" }),
    ]);

    const result = await executeGraphQL(`
      query {
        accounts {
          id
          holderName
          balance
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(AccountModel.find).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({
      accounts: [
        { id: "account-1", holderName: "Joao", balance: 0 },
        { id: "account-2", holderName: "Maria", balance: 0 },
      ],
    });
  });

  it("busca uma transacao pelo id", async () => {
    TransactionModel.findById.mockResolvedValue(
      createTransactionDocument({
        id: "transaction-9",
        amount: 300,
        description: "TED",
      }),
    );

    const result = await executeGraphQL(`
      query {
        transaction(id: "transaction-9") {
          id
          amount
          description
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(TransactionModel.findById).toHaveBeenCalledWith("transaction-9");
    expect(result.data).toEqual({
      transaction: {
        id: "transaction-9",
        amount: 300,
        description: "TED",
      },
    });
  });
});