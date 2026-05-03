import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

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

  const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql",
    fetch,
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
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
