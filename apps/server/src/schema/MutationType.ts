import { GraphQLObjectType } from "graphql";
import { accountMutations } from "../modules/accounts/mutations/accountMutationts";
import { depositMutations } from "../modules/deposits/mutations/depositMutations";
import { phoneCreditMutations } from "../modules/phoneCredits/mutations/phoneCreditMutations";
import { transactionMutations } from "../modules/transactions/mutations/transactionMutations";
import { userMutations } from "../modules/users/mutations/userMutations";
import { kycMutations } from "../modules/kyc/mutations/kycMutations";

export const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    ...accountMutations,
    ...depositMutations,
    ...phoneCreditMutations,
    ...transactionMutations,
    ...userMutations,
    ...kycMutations,
  }),
});
