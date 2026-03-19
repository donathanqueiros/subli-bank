import { graphql } from "graphql";
import { schema } from "../../schema/schema";

export async function executeGraphQL(source: string) {
  return graphql({
    schema,
    source,
  });
}