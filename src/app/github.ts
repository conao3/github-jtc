import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

import {
  CommitHistoryDocument,
  type CommitHistoryQuery,
  type CommitHistoryQueryVariables,
  CreateRepositoryDocument,
  type CreateRepositoryMutation,
  type CreateRepositoryMutationVariables,
  DashboardDocument,
  type DashboardQuery,
  type DashboardQueryVariables,
  IssueDetailDocument,
  type IssueDetailQuery,
  type IssueDetailQueryVariables,
  PullRequestDetailDocument,
  type PullRequestDetailQuery,
  type PullRequestDetailQueryVariables,
  RepositoryDetailDocument,
  type RepositoryDetailQuery,
  type RepositoryDetailQueryVariables,
  ViewerDocument,
  type ViewerPullRequestsQuery,
  type ViewerPullRequestsQueryVariables,
  type ViewerIssuesQuery,
  type ViewerIssuesQueryVariables,
  type ViewerProfileQuery,
  type ViewerProfileQueryVariables,
  ViewerIssuesDocument,
  ViewerProfileDocument,
  ViewerPullRequestsDocument,
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
export type GitHubViewerPullRequestsConnection = ViewerPullRequestsQuery["viewer"]["pullRequests"];
export type GitHubViewerPullRequest = NonNullable<
  NonNullable<GitHubViewerPullRequestsConnection["nodes"]>[number]
>;
export type GitHubViewerIssuesConnection = ViewerIssuesQuery["viewer"]["issues"];
export type GitHubViewerIssue = NonNullable<NonNullable<GitHubViewerIssuesConnection["nodes"]>[number]>;
export type GitHubRepositoryDetail = NonNullable<RepositoryDetailQuery["repository"]>;
export type GitHubCommitHistoryRepository = NonNullable<CommitHistoryQuery["repository"]>;
export type GitHubDashboardPayload = DashboardQuery;
export type GitHubCreatedRepository = NonNullable<
  NonNullable<CreateRepositoryMutation["createRepository"]>["repository"]
>;
export type GitHubPullRequestDetail = NonNullable<
  NonNullable<PullRequestDetailQuery["repository"]>["pullRequest"]
>;
export type GitHubIssueDetail = NonNullable<NonNullable<IssueDetailQuery["repository"]>["issue"]>;
export type GitHubRestCommitDiffFile = {
  readonly sha: string;
  readonly filename: string;
  readonly status: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changes: number;
  readonly blob_url: string | null;
  readonly raw_url: string | null;
  readonly contents_url: string | null;
  readonly patch?: string;
  readonly previous_filename?: string;
};
export type GitHubRestCommitDiff = {
  readonly sha: string;
  readonly html_url: string;
  readonly commit: {
    readonly message: string;
    readonly author: {
      readonly name: string;
      readonly email: string;
      readonly date: string;
    };
    readonly committer: {
      readonly name: string;
      readonly email: string;
      readonly date: string;
    };
  };
  readonly author: {
    readonly login: string;
    readonly avatar_url: string;
    readonly html_url: string;
  } | null;
  readonly committer: {
    readonly login: string;
    readonly avatar_url: string;
    readonly html_url: string;
  } | null;
  readonly parents: ReadonlyArray<{
    readonly sha: string;
    readonly html_url: string;
    readonly url: string;
  }>;
  readonly stats: {
    readonly additions: number;
    readonly deletions: number;
    readonly total: number;
  };
  readonly files: ReadonlyArray<GitHubRestCommitDiffFile>;
};
export type GitHubRestPullRequestDiffFile = {
  readonly sha: string;
  readonly filename: string;
  readonly status: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changes: number;
  readonly blob_url: string | null;
  readonly raw_url: string | null;
  readonly contents_url: string | null;
  readonly patch?: string;
  readonly previous_filename?: string;
};

export interface GitHubErrorDescriptor {
  readonly kind: "permission_denied" | "rate_limited" | "not_found" | "network" | "unknown";
  readonly title: string;
  readonly detail: string;
}

export interface GitHubRepositoryCoordinates {
  readonly owner: string;
  readonly name: string;
}

export interface GitHubRepositoryScopedNumberCoordinates extends GitHubRepositoryCoordinates {
  readonly number: number;
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

function getGitHubRestBaseUrl(): string {
  return import.meta.env["VITE_GITHUB_REST_URL"]?.trim() ?? "https://api.github.com";
}

async function parseGitHubRestError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { message?: string };
    if (typeof payload.message === "string" && payload.message.length > 0) {
      return payload.message;
    }
  }

  const text = await response.text();
  if (text.length > 0) {
    return text;
  }

  return `${response.status} ${response.statusText}`;
}

async function executeGitHubRestRequest<TResponse>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/vnd.github+json");
  }

  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("X-GitHub-Api-Version", "2022-11-28");

  const response = await fetch(new URL(path, getGitHubRestBaseUrl()).toString(), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseGitHubRestError(response));
  }

  return (await response.json()) as TResponse;
}

async function executeGitHubQuery<TData, TVariables extends Record<string, unknown>>(
  accessToken: string,
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData> {
  const client = createGitHubApolloClient(accessToken);
  const result = await client.query({ query, variables });

  if (result.data === undefined || result.data === null) {
    throw new Error("GitHub GraphQL の問い合わせ結果にデータがありません。");
  }

  return result.data;
}

async function executeGitHubMutation<TData, TVariables extends Record<string, unknown>>(
  accessToken: string,
  mutation: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData> {
  const client = createGitHubApolloClient(accessToken);
  const result = await client.mutate({ mutation, variables });

  if (result.data === undefined || result.data === null) {
    throw new Error("GitHub GraphQL の更新結果にデータがありません。");
  }

  return result.data;
}

export async function fetchGitHubViewer(accessToken: string): Promise<GitHubViewerProfile> {
  const data = await executeGitHubQuery(accessToken, ViewerDocument, {});
  const viewer = data.viewer;

  if (viewer === undefined || viewer === null) {
    throw new Error("GitHub GraphQL の利用者情報が取得できませんでした。");
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

export async function fetchGitHubCommitHistory(
  accessToken: string,
  variables: CommitHistoryQueryVariables,
): Promise<GitHubCommitHistoryRepository | null> {
  const data = await executeGitHubQuery(accessToken, CommitHistoryDocument, variables);
  return data.repository ?? null;
}

export async function fetchGitHubDashboard(
  accessToken: string,
  variables: DashboardQueryVariables,
): Promise<GitHubDashboardPayload> {
  return await executeGitHubQuery(accessToken, DashboardDocument, variables);
}

export async function createGitHubRepository(
  accessToken: string,
  input: CreateRepositoryMutationVariables["input"],
): Promise<GitHubCreatedRepository> {
  const data = await executeGitHubMutation(accessToken, CreateRepositoryDocument, { input });
  const repository = data.createRepository?.repository;

  if (repository === undefined || repository === null) {
    throw new Error("GitHub が作成済みリポジトリ情報を返しませんでした。");
  }

  return repository;
}

export async function fetchGitHubViewerPullRequests(
  accessToken: string,
  variables: ViewerPullRequestsQueryVariables,
): Promise<GitHubViewerPullRequestsConnection> {
  const data = await executeGitHubQuery(accessToken, ViewerPullRequestsDocument, variables);
  return data.viewer.pullRequests;
}

export async function fetchGitHubViewerIssues(
  accessToken: string,
  variables: ViewerIssuesQueryVariables,
): Promise<GitHubViewerIssuesConnection> {
  const data = await executeGitHubQuery(accessToken, ViewerIssuesDocument, variables);
  return data.viewer.issues;
}

export async function fetchGitHubPullRequestDetail(
  accessToken: string,
  variables: PullRequestDetailQueryVariables,
): Promise<GitHubPullRequestDetail | null> {
  const data = await executeGitHubQuery(accessToken, PullRequestDetailDocument, variables);
  return data.repository?.pullRequest ?? null;
}

export async function fetchGitHubIssueDetail(
  accessToken: string,
  variables: IssueDetailQueryVariables,
): Promise<GitHubIssueDetail | null> {
  const data = await executeGitHubQuery(accessToken, IssueDetailDocument, variables);
  return data.repository?.issue ?? null;
}

export async function fetchGitHubCommitDiff(
  accessToken: string,
  variables: {
    readonly owner: string;
    readonly name: string;
    readonly ref: string;
  },
): Promise<GitHubRestCommitDiff> {
  const perPage = 100;
  let page = 1;
  let firstPage: Omit<GitHubRestCommitDiff, "files"> | null = null;
  const files: GitHubRestCommitDiffFile[] = [];

  for (;;) {
    const response = await executeGitHubRestRequest<GitHubRestCommitDiff>(
      accessToken,
      `/repos/${encodeURIComponent(variables.owner)}/${encodeURIComponent(variables.name)}/commits/${encodeURIComponent(variables.ref)}?per_page=${perPage}&page=${page}`,
    );

    if (firstPage === null) {
      const { files: responseFiles, ...meta } = response;
      firstPage = meta;
      files.push(...responseFiles);
    } else {
      files.push(...response.files);
    }

    if (response.files.length < perPage) {
      break;
    }

    page += 1;
    if (page > 30) {
      break;
    }
  }

  if (firstPage === null) {
    throw new Error("GitHub REST API のコミット差分結果にデータがありません。");
  }

  return {
    ...firstPage,
    files,
  };
}

export async function fetchGitHubPullRequestDiffFiles(
  accessToken: string,
  variables: {
    readonly owner: string;
    readonly name: string;
    readonly number: number;
  },
): Promise<GitHubRestPullRequestDiffFile[]> {
  const perPage = 100;
  let page = 1;
  const files: GitHubRestPullRequestDiffFile[] = [];

  for (;;) {
    const response = await executeGitHubRestRequest<GitHubRestPullRequestDiffFile[]>(
      accessToken,
      `/repos/${encodeURIComponent(variables.owner)}/${encodeURIComponent(variables.name)}/pulls/${variables.number}/files?per_page=${perPage}&page=${page}`,
    );

    files.push(...response);

    if (response.length < perPage) {
      break;
    }

    page += 1;
    if (page > 30) {
      break;
    }
  }

  return files;
}

export function createRepositoryRouteId(input: GitHubRepositoryCoordinates | string): string {
  const [owner, name] = typeof input === "string" ? input.split("/", 2) : [input.owner, input.name];

  if (owner === undefined || name === undefined || owner.length === 0 || name.length === 0) {
    throw new Error("Repository route id requires both owner and name.");
  }

  return `${encodeURIComponent(owner)}:${encodeURIComponent(name)}`;
}

export function createRepositoryPath(input: GitHubRepositoryCoordinates | string): string {
  const [owner, name] = typeof input === "string" ? input.split("/", 2) : [input.owner, input.name];

  if (owner === undefined || name === undefined || owner.length === 0 || name.length === 0) {
    throw new Error("Repository path requires both owner and name.");
  }

  return `${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
}

export function createRepositoryScopedNumberRouteId(
  input: GitHubRepositoryScopedNumberCoordinates | string,
): string {
  if (typeof input === "string") {
    const [owner, name, numberText] = input.split("/", 3);
    const number = Number(numberText);

    if (
      owner === undefined ||
      name === undefined ||
      numberText === undefined ||
      !Number.isInteger(number) ||
      number <= 0
    ) {
      throw new Error("Repository scoped route id requires owner, repository, and positive number.");
    }

    return `${encodeURIComponent(owner)}:${encodeURIComponent(name)}:${number}`;
  }

  if (!Number.isInteger(input.number) || input.number <= 0) {
    throw new Error("Repository scoped route id requires a positive integer number.");
  }

  return `${encodeURIComponent(input.owner)}:${encodeURIComponent(input.name)}:${input.number}`;
}

export function parseRepositoryRouteId(
  routeId: string | undefined,
  fallbackOwner?: string,
): GitHubRepositoryCoordinates | null {
  if (routeId === undefined || routeId.length === 0) {
    return null;
  }

  const slashParts = routeId.split("/", 2);
  if (slashParts.length === 2) {
    const owner = decodeURIComponent(slashParts[0] ?? "");
    const name = decodeURIComponent(slashParts[1] ?? "");

    if (owner.length === 0 || name.length === 0) {
      return null;
    }

    return { owner, name };
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

export function parseRepositoryScopedNumberRouteId(
  routeId: string | undefined,
  fallbackOwner?: string,
): GitHubRepositoryScopedNumberCoordinates | null {
  if (routeId === undefined || routeId.length === 0) {
    return null;
  }

  const parts = routeId.split(":");

  if (parts.length === 1) {
    return null;
  }

  if (parts.length === 2) {
    if (fallbackOwner === undefined || fallbackOwner.length === 0) {
      return null;
    }

    const [namePart, numberPart] = parts;
    const number = Number(decodeURIComponent(numberPart ?? ""));

    if (namePart === undefined || !Number.isInteger(number) || number <= 0) {
      return null;
    }

    return {
      owner: fallbackOwner,
      name: decodeURIComponent(namePart),
      number,
    };
  }

  const owner = decodeURIComponent(parts[0] ?? "");
  const name = decodeURIComponent(parts[1] ?? "");
  const number = Number(decodeURIComponent(parts[2] ?? ""));

  if (owner.length === 0 || name.length === 0 || !Number.isInteger(number) || number <= 0) {
    return null;
  }

  return { owner, name, number };
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

export function formatGitHubIssueState(value: string | null | undefined): string {
  switch (value) {
    case "OPEN":
      return "オープン";
    case "CLOSED":
      return "クローズ";
    default:
      return value ?? "－";
  }
}

export function formatGitHubIssueStateReason(value: string | null | undefined): string {
  switch (value) {
    case "COMPLETED":
      return "完了";
    case "DUPLICATE":
      return "重複";
    case "NOT_PLANNED":
      return "対応予定なし";
    case "REOPENED":
      return "再オープン";
    default:
      return "－";
  }
}

export function formatGitHubReviewDecision(value: string | null | undefined): string {
  switch (value) {
    case "APPROVED":
      return "承認済";
    case "CHANGES_REQUESTED":
      return "差戻し";
    case "REVIEW_REQUIRED":
      return "要レビュー";
    default:
      return "未判定";
  }
}

export function formatGitHubMergeableState(value: string | null | undefined): string {
  switch (value) {
    case "CONFLICTING":
      return "競合あり";
    case "MERGEABLE":
      return "マージ可能";
    case "UNKNOWN":
      return "不明";
    default:
      return value ?? "－";
  }
}

export function formatGitHubMergeStateStatus(value: string | null | undefined): string {
  switch (value) {
    case "BEHIND":
      return "後続更新あり";
    case "BLOCKED":
      return "要対応";
    case "CLEAN":
      return "問題なし";
    case "DIRTY":
      return "競合あり";
    case "DRAFT":
      return "下書き";
    case "HAS_HOOKS":
      return "フック確認";
    case "UNKNOWN":
      return "不明";
    case "UNSTABLE":
      return "不安定";
    default:
      return value ?? "－";
  }
}

export function formatGitHubViewedState(value: string | null | undefined): string {
  switch (value) {
    case "VIEWED":
      return "確認済";
    case "DISMISSED":
      return "対象外";
    case "UNVIEWED":
      return "未確認";
    default:
      return value ?? "－";
  }
}

export function formatGitHubFileChangeType(value: string | null | undefined): string {
  switch (value) {
    case "ADDED":
    case "added":
      return "追加";
    case "CHANGED":
    case "changed":
      return "変更";
    case "COPIED":
    case "copied":
      return "複製";
    case "DELETED":
    case "removed":
      return "削除";
    case "MODIFIED":
    case "modified":
      return "修正";
    case "RENAMED":
    case "renamed":
      return "名前変更";
    case "UNCHANGED":
    case "unchanged":
      return "変更なし";
    default:
      return value ?? "－";
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

export function describeGitHubError(error: unknown, fallbackTitle: string): GitHubErrorDescriptor {
  const detail =
    error instanceof Error && error.message.length > 0
      ? error.message
      : "GitHub から詳細を取得できませんでした。";
  const normalized = detail.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("secondary rate limit") ||
    normalized.includes("api rate limit exceeded")
  ) {
    return {
      kind: "rate_limited",
      title: "GitHub API の利用上限に達しました。",
      detail: "しばらく待って再試行するか、問い合わせ数を減らしてください。",
    };
  }

  if (
    normalized.includes("resource not accessible by integration") ||
    normalized.includes("forbidden") ||
    normalized.includes("not authorized") ||
    normalized.includes("insufficient scopes")
  ) {
    return {
      kind: "permission_denied",
      title: "この GitHub App / ユーザートークンでは対象データを参照できません。",
      detail: "App 権限、インストール対象、利用者権限を確認してください。",
    };
  }

  if (
    normalized.includes("could not resolve to a repository") ||
    normalized.includes("could not resolve to an issue") ||
    normalized.includes("could not resolve to a pullrequest") ||
    normalized.includes("not found")
  ) {
    return {
      kind: "not_found",
      title: "対象データが存在しないか、利用者から参照できません。",
      detail,
    };
  }

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return {
      kind: "network",
      title: "GitHub への通信に失敗しました。",
      detail: "ネットワーク接続、認証中継先、認証状態を確認してから再試行してください。",
    };
  }

  return {
    kind: "unknown",
    title: fallbackTitle,
    detail,
  };
}
