import { GraphQLObjectType } from "graphql";
import { notificationSubscriptions } from "../modules/notifications/subscriptions/notificationSubscriptions";

export const SubscriptionType = new GraphQLObjectType({
  name: "Subscription",
  fields: () => ({
    ...notificationSubscriptions,
  }),
});