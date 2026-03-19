import { GraphQLNonNull, GraphQLObjectType } from "graphql";
import { AccountType } from "../accounts/AccountType";
import { UserType } from "./UserType";

export const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  fields: {
    user: { type: new GraphQLNonNull(UserType) },
    account: { type: new GraphQLNonNull(AccountType) },
  },
});
