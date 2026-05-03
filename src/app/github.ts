import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import {
  DashboardDocument,
  type DashboardQuery,
  type DashboardQueryVariables,
  RepositoryDetailDocument,
  type RepositoryDetailQuery,
  type RepositoryDetailQueryVariables,
  ViewerDocument,
  type ViewerProfileQuery,
  type ViewerProfileQueryVariables,
  ViewerProfileDocument,
  type ViewerQuery,
  type ViewerRepositoriesQuery,
  type ViewerRepositoriesQueryVariables,
  ViewerRepositoriesDocument,
} from "../gql/graphql.ts";

export type GitHubViewerProfile = ViewerQuery["viewer"];
export type GitHubViewerExtendedProfile = ViewerProfileQuery["viewer"];
export type GitHubViewerRepositoriesConnection = ViewerRepositoriesQuery["viewer"]["repositories"];
export type GitHubViewerRepository = NonNullable<
  NonNullable<GitHubViewerRepositoriesConnection["nodes"]>[number]
>;
export type GitHubRepositoryDetail = NonNullable<RepositoryDetailQuery["repository"]>;
export type GitHubDashboardPayload = DashboardQuery;

export interface GitHubRepositoryCoordinates {
  readonly owner: string;
  readonly name: string;
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

async function executeGitHubQuery<TData, TVariables extends Record<string, unknown>>(
  accessToken: string,
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData> {
  const client = createGitHubApolloClient(accessToken);
  const result = await client.query({ query, variables });

  if (result.data === undefined || result.data === null) {
    throw new Error("GitHub GraphQL query returned no data.");
  }

  return result.data;
}

export async function fetchGitHubViewer(accessToken: string): Promise<GitHubViewerProfile> {
  const data = await executeGitHubQuery(accessToken, ViewerDocument, {});
  const viewer = data.viewer;

  if (viewer === undefined || viewer === null) {
    throw new Error("GitHub GraphQL viewer query did not return a user.");
  }

  return viewer;
}

export async function fetchGitHubViewerProfile(
  accessToken: string,
  variables: ViewerProfileQueryVariables,
): Promise<GitHubViewerExtendedProfile> {
  const data = await executeGitHubQuery(accessToken, ViewerProfileDocument, variables);
  return data.viewer;
}

export async function fetchGitHubViewerRepositories(
  accessToken: string,
  variables: ViewerRepositoriesQueryVariables,
): Promise<GitHubViewerRepositoriesConnection> {
  const data = await executeGitHubQuery(accessToken, ViewerRepositoriesDocument, variables);
  return data.viewer.repositories;
}

export async function fetchGitHubRepositoryDetail(
  accessToken: string,
  variables: RepositoryDetailQueryVariables,
): Promise<GitHubRepositoryDetail | null> {
  const data = await executeGitHubQuery(accessToken, RepositoryDetailDocument, variables);
  return data.repository ?? null;
}

export async function fetchGitHubDashboard(
  accessToken: string,
  variables: DashboardQueryVariables,
): Promise<GitHubDashboardPayload> {
  return await executeGitHubQuery(accessToken, DashboardDocument, variables);
}

export function createRepositoryRouteId(input: GitHubRepositoryCoordinates | string): string {
  const [owner, name] = typeof input === "string" ? input.split("/", 2) : [input.owner, input.name];

  if (owner === undefined || name === undefined || owner.length === 0 || name.length === 0) {
    throw new Error("Repository route id requires both owner and name.");
  }

  return `${encodeURIComponent(owner)}:${encodeURIComponent(name)}`;
}

export function parseRepositoryRouteId(
  routeId: string | undefined,
  fallbackOwner?: string,
): GitHubRepositoryCoordinates | null {
  if (routeId === undefined || routeId.length === 0) {
    return null;
  }

  const separatorIndex = routeId.indexOf(":");

  if (separatorIndex < 0) {
    if (fallbackOwner === undefined || fallbackOwner.length === 0) {
      return null;
    }

    return {
      owner: fallbackOwner,
      name: decodeURIComponent(routeId),
    };
  }

  const owner = decodeURIComponent(routeId.slice(0, separatorIndex));
  const name = decodeURIComponent(routeId.slice(separatorIndex + 1));

  if (owner.length === 0 || name.length === 0) {
    return null;
  }

  return { owner, name };
}

export function formatGitHubDateTime(value: string | null | undefined): string {
  if (value === undefined || value === null || value.length === 0) {
    return "－";
  }

  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatGitHubDate(value: string | null | undefined): string {
  if (value === undefined || value === null || value.length === 0) {
    return "－";
  }

  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatGitHubVisibility(value: string | null | undefined): string {
  switch (value) {
    case "PRIVATE":
      return "非公開";
    case "INTERNAL":
      return "組織内";
    case "PUBLIC":
      return "公開";
    default:
      return "－";
  }
}

export function formatGitHubPermission(value: string | null | undefined): string {
  switch (value) {
    case "ADMIN":
      return "管理者";
    case "MAINTAIN":
      return "保守";
    case "WRITE":
      return "書込";
    case "TRIAGE":
      return "一次対応";
    case "READ":
      return "閲覧";
    default:
      return "未設定";
  }
}

export function formatGitHubByteSize(value: number | null | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "－";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function sumLanguageSizes(
  edges: NonNullable<GitHubRepositoryDetail["languages"]>["edges"] | null | undefined,
): number {
  return (edges ?? []).reduce((total, edge) => total + (edge?.size ?? 0), 0);
}
