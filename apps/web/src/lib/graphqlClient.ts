const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql";

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

export async function graphqlRequest<TData>(
  query: string,
  variables: Record<string, unknown>,
  authHeaders?: Record<string, string>,
) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeaders ?? {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Falha na comunicacao com o servidor");
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Erro GraphQL");
  }

  if (!payload.data) {
    throw new Error("Resposta vazia do GraphQL");
  }

  return payload.data;
}
