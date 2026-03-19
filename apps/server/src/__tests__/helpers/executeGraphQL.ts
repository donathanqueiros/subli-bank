import { graphql } from "graphql";
import { schema } from "../../schema/schema";
import type { GraphQLContext } from "../../types/auth";

export async function executeGraphQL(
  source: string,
  contextValue: GraphQLContext = {},
) {
  return graphql({
    schema,
    source,
    contextValue,
  });
}