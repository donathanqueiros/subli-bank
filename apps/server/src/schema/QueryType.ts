import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from "graphql";
import { AccountType } from "../modules/accounts/AccountType";
import { Account } from "../modules/accounts/AccountModel";
import { TransactionType } from "../modules/transactions/TransactionType";
import { Transaction } from "../modules/transactions/TransactionModel";

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    account: {
      type: AccountType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }: { id: string }) => {
        return await Account.findById(id);
      },
    },

    accounts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(AccountType)),
      ),
      resolve: async () => {
        return await Account.find();
      },
    },

    transaction: {
      type: TransactionType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }: { id: string }) => {
        return await Transaction.findById(id);
      },
    },

    transactions: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(TransactionType)),
      ),
      resolve: async () => {
        return await Transaction.find();
      },
    },
  },
});
