import { GraphQLObjectType } from "graphql";
import { accountMutations } from "../modules/accounts/mutations/accountMutationts";
import { transactionMutations } from "../modules/transactions/mutations/transactionMutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...accountMutations,
    ...transactionMutations,
  }),
});
