import {
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { AccountType } from "../accounts/AccountType";
import { Account } from "../accounts/AccountModel";

export const TransactionType = new GraphQLObjectType({
  name: "Transaction",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    fromAccount: {
      type: new GraphQLNonNull(AccountType),
      resolve: async (transaction) =>
        Account.findById(transaction.fromAccountId),
    },
    toAccount: {
      type: new GraphQLNonNull(AccountType),
      resolve: async (transaction) =>
        Account.findById(transaction.toAccountId),
    },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    idempotencyKey: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
