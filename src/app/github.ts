import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { ViewerDocument } from "../gql/graphql.ts";

export interface GitHubViewerProfile {
  readonly id: string;
  readonly login: string;
  readonly name: string | null;
  readonly avatarUrl: string;
  readonly url: string;
  readonly company: string | null;
}

function createGitHubApolloClient(accessToken: string): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: import.meta.env.VITE_GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql",
      fetch,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
    },
  });
}

export async function fetchGitHubViewer(accessToken: string): Promise<GitHubViewerProfile> {
  const client = createGitHubApolloClient(accessToken);
  const result = await client.query({ query: ViewerDocument });
  const viewer = result.data?.viewer;

  if (viewer === undefined || viewer === null) {
    throw new Error("GitHub GraphQL viewer query did not return a user.");
  }

  return viewer;
}
