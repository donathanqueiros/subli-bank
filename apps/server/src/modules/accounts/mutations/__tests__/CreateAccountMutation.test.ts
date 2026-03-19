jest.mock("../../AccountModel", () => {
  const Account = Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
  });

  return { Account };
});

import { Account } from "../../AccountModel";
import { createAccountDocument } from "../../../../__tests__/factories/createAccountDocument";
import { executeGraphQL } from "../../../../__tests__/helpers/executeGraphQL";

const AccountModel = Account as unknown as jest.Mock & {
  find: jest.Mock;
  findById: jest.Mock;
};

describe("CreateAccount mutation", () => {
  it("cria uma conta com o schema registrado no root mutation", async () => {
    const account = createAccountDocument({
      holderName: "Joao Silva",
    });

    AccountModel.mockImplementation(() => account);

    const result = await executeGraphQL(`
      mutation {
        CreateAccount(holderName: "Joao Silva") {
          id
          holderName
          balance
        }
      }
    `);

    expect(result.errors).toBeUndefined();
    expect(AccountModel).toHaveBeenCalledWith({ holderName: "Joao Silva" });
    expect(account.save).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({
      CreateAccount: {
        id: "account-1",
        holderName: "Joao Silva",
        balance: 0,
      },
    });
  });
});