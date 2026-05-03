import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";

let githubAccessToken: string | undefined;

export function setGitHubAccessToken(accessToken: string | undefined): void {
  githubAccessToken = accessToken;
}

function createGitHubApolloClient(): ApolloClient {
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: {
        ...headers,
        Accept: "application/vnd.github+json",
        ...(githubAccessToken === undefined ? {} : { Authorization: `Bearer ${githubAccessToken}` }),
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }));

    return forward(operation);
  });
  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: 2_000,
      jitter: true,
    },
    attempts: {
      max: 2,
      retryIf: (error) => {
        if (!error) {
          return false;
        }

        const withStatus = error as { statusCode?: number; response?: { status?: number } };
        const status = withStatus.statusCode ?? withStatus.response?.status;

        if (status === 408 || status === 429) {
          return true;
        }

        if (status !== undefined) {
          return status >= 500;
        }

        return true;
      },
    },
  });

  const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql",
    fetch,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(retryLink).concat(httpLink),
    devtools: {
      enabled: true,
      name: "GitHub JTC",
    },
  });

  if (typeof window !== "undefined") {
    (
      window as typeof window & {
        __APOLLO_CLIENT__?: ApolloClient;
      }
    ).__APOLLO_CLIENT__ = client;
  }

  return client;
}

export const githubApolloClient = createGitHubApolloClient();

export async function clearGitHubApolloStore(): Promise<void> {
  await githubApolloClient.clearStore();
}

export function getCachedQueryFetchPolicy<TData, TVariables extends Record<string, unknown>>(
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  skip = false,
): "cache-first" | "cache-only" | undefined {
  if (skip) {
    return undefined;
  }

  try {
    const cached = githubApolloClient.readQuery({
      query,
      variables,
    });

    return cached === null ? "cache-first" : "cache-only";
  } catch {
    return "cache-first";
  }
}
