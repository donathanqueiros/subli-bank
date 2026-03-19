import { GraphQLFloat, GraphQLNonNull, GraphQLString } from "graphql";
import { TransactionType } from "../TransactionType";
import { Account } from "../../accounts/AccountModel";
import { Transaction } from "../TransactionModel";

export const TransferMutation = {
  type: new GraphQLNonNull(TransactionType),
  args: {
    fromAccountId: { type: new GraphQLNonNull(GraphQLString) },
    toAccountId: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    description: { type: GraphQLString },
  },
  resolve: async (
    _,
    {
      fromAccountId,
      toAccountId,
      amount,
      description,
    }: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description?: string;
    }
  ) => {
    if (amount <= 0) throw new Error("Valor deve ser maior que zero");

    const fromAccount = await Account.findById(fromAccountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount || !toAccount)
      throw new Error("Uma ou ambas as contas não existem");
    if (fromAccount.balance < amount) throw new Error("Saldo insuficiente");

    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save();
    await toAccount.save();

    const transaction = new Transaction({
      fromAccountId,
      toAccountId,
      amount,
      description,
    });
    await transaction.save();
    return transaction;
  },
};
