import {
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { getAccountBalance } from "../ledger/balance";

export const AccountType = new GraphQLObjectType({
  name: "Account",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    holderName: { type: new GraphQLNonNull(GraphQLString) },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: async (account) => await getAccountBalance(String(account.id)),
    },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
  },
});
