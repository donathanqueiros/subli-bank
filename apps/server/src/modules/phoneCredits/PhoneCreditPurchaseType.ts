import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

export const PhoneCreditPurchaseStatusType = new GraphQLEnumType({
  name: "PhoneCreditPurchaseStatus",
  values: {
    RECORDED: { value: "RECORDED" },
  },
});

export const PhoneCreditPurchaseType = new GraphQLObjectType({
  name: "PhoneCreditPurchase",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (purchase) => String(purchase.accountId),
    },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    status: { type: new GraphQLNonNull(PhoneCreditPurchaseStatusType) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
  },
});
