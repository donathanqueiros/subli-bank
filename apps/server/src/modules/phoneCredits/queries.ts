import { GraphQLInt, GraphQLList, GraphQLNonNull } from "graphql";
import { getAuthenticatedAccount } from "../auth/authorization";
import { PhoneCreditPurchase } from "./PhoneCreditPurchaseModel";
import { PhoneCreditPurchaseType } from "./PhoneCreditPurchaseType";
import type { GraphQLContext } from "../../types/auth";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function getPagination(page?: number | null, limit?: number | null) {
  const safePage =
    typeof page === "number" && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit =
    typeof limit === "number" && limit > 0
      ? Math.min(Math.floor(limit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export const phoneCreditQueries = {
  myPhoneCreditPurchases: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(PhoneCreditPurchaseType)),
    ),
    args: {
      page: { type: GraphQLInt },
      limit: { type: GraphQLInt },
    },
    resolve: async (
      _source: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      const account = await getAuthenticatedAccount(context);
      const { limit, skip } = getPagination(args.page, args.limit);

      return await PhoneCreditPurchase.find({ accountId: account.id }, null, {
        sort: { createdAt: -1 },
        skip,
        limit,
      });
    },
  },

  myPhoneCreditPurchasesCount: {
    type: new GraphQLNonNull(GraphQLInt),
    resolve: async (_source: unknown, _args: unknown, context: GraphQLContext) => {
      const account = await getAuthenticatedAccount(context);

      return await PhoneCreditPurchase.countDocuments({ accountId: account.id });
    },
  },
};
