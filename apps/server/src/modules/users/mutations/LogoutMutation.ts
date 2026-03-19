import { GraphQLBoolean, GraphQLNonNull } from "graphql";
import { deleteUserSession } from "../../sessions/sessionService";
import type { GraphQLContext } from "../../../types/auth";

export const LogoutMutation = {
  type: new GraphQLNonNull(GraphQLBoolean),
  resolve: async (
    _source: unknown,
    _args: unknown,
    context: GraphQLContext,
  ) => {
    if (context.sessionToken) {
      await deleteUserSession(context.sessionToken);
    }

    context.requestContext?.clearSessionCookie();

    return true;
  },
};