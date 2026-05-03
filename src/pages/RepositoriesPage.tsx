import clsx from "clsx";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useForm } from "@tanstack/react-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  createRepositoryPath,
  describeGitHubError,
  formatGitHubDateTime,
  formatGitHubPermission,
  formatGitHubVisibility,
  type GitHubSearchRepositoriesConnection,
  type GitHubSearchRepository,
} from "../app/github.ts";
import { RepositoryOwnerLookupDocument, SearchRepositoriesDocument } from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  PAGER_CLASS,
  PAGER_LINK_ACTIVE_CLASS,
  PAGER_LINK_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const QUERY_SIZE = 10;
const visibilityOptions = ["all", "PRIVATE", "INTERNAL", "PUBLIC"] as const;
const permissionOptions = ["all", "ADMIN", "MAINTAIN", "WRITE", "TRIAGE", "READ"] as const;

const repositoryFilterFieldValidators = {
  repositoryName: z.string(),
  owner: z.string(),
  visibility: z.enum(visibilityOptions),
  language: z.string(),
  permission: z.enum(permissionOptions),
} as const;

type RepositoryFilterValues = {
  repositoryName: string;
  owner: string;
  visibility: (typeof visibilityOptions)[number];
  language: string;
  permission: (typeof permissionOptions)[number];
};

const initialRepositoryFilterValues: RepositoryFilterValues = {
  repositoryName: "",
  owner: "",
  visibility: "all",
  language: "",
  permission: "all",
};

function getOwnerLabel(repository: GitHubSearchRepository): string {
  return repository.owner.name ?? repository.owner.login;
}

function getLanguageStats(repositories: readonly GitHubSearchRepository[]): Array<[string, number]> {
  const counts = new Map<string, number>();

  for (const repository of repositories) {
    const language = repository.primaryLanguage?.name ?? "未設定";
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
}

function hasActiveRepositoryFilters(filters: RepositoryFilterValues): boolean {
  return (
    filters.repositoryName.trim().length > 0 ||
    filters.owner.trim().length > 0 ||
    filters.visibility !== "all" ||
    filters.language.trim().length > 0 ||
    filters.permission !== "all"
  );
}

function filterRepositories(
  repositories: readonly GitHubSearchRepository[],
  filters: RepositoryFilterValues,
): GitHubSearchRepository[] {
  if (filters.permission === "all") {
    return [...repositories];
  }

  return repositories.filter((repository) => repository.viewerPermission === filters.permission);
}

function buildRepositorySearchQuery(filters: RepositoryFilterValues, ownerQualifier: string | null): string {
  const parts = ["archived:false", "sort:updated-desc"];
  const repositoryName = filters.repositoryName.trim();
  const language = filters.language.trim();

  if (repositoryName.length > 0) {
    if (repositoryName.includes("/")) {
      parts.push(`repo:${repositoryName}`);
    } else {
      parts.push(repositoryName);
    }
  }

  if (ownerQualifier !== null) {
    parts.push(ownerQualifier);
  }

  switch (filters.visibility) {
    case "PRIVATE":
      parts.push("visibility:private");
      break;
    case "INTERNAL":
      parts.push("visibility:internal");
      break;
    case "PUBLIC":
      parts.push("visibility:public");
      break;
    default:
      break;
  }

  if (language.length > 0) {
    parts.push(`language:${language}`);
  }

  return parts.join(" ");
}

export function RepositoriesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const viewerLogin = sessionQuery.data?.user.login ?? "";
  const [appliedFilters, setAppliedFilters] = useState<RepositoryFilterValues>(initialRepositoryFilterValues);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitializedOwnerFilter, setHasInitializedOwnerFilter] = useState(false);
  const currentCursor = cursorHistory[currentPage - 1] ?? null;
  const ownerInput = appliedFilters.owner.trim();
  const ownerLookupQuery = useQuery(RepositoryOwnerLookupDocument, {
    skip: accessToken === undefined || ownerInput.length === 0,
    variables: {
      login: ownerInput,
    },
    fetchPolicy: "network-only",
  });
  const ownerLookupResult = ownerLookupQuery.data?.repositoryOwner;
  const ownerQualifier =
    ownerInput.length === 0
      ? null
      : ownerLookupResult?.__typename === "User"
        ? `user:${ownerInput}`
        : ownerLookupResult?.__typename === "Organization"
          ? `org:${ownerInput}`
          : null;
  const shouldWaitForOwnerLookup =
    ownerInput.length > 0 && ownerLookupQuery.loading && ownerLookupResult === undefined;
  const hasOwnerLookupError = ownerInput.length > 0 && ownerLookupQuery.error !== undefined;
  const hasMissingOwner =
    ownerInput.length > 0 && !shouldWaitForOwnerLookup && !hasOwnerLookupError && ownerLookupResult === null;
  const repositoriesQuery = useQuery(SearchRepositoriesDocument, {
    skip: accessToken === undefined || shouldWaitForOwnerLookup || hasOwnerLookupError || hasMissingOwner,
    variables: {
      first: QUERY_SIZE,
      after: currentCursor,
      query: buildRepositorySearchQuery(appliedFilters, ownerQualifier),
    },
    fetchPolicy: "network-only",
  });
  const repositoriesConnection = (repositoriesQuery.data?.search ??
    repositoriesQuery.previousData?.search) as GitHubSearchRepositoriesConnection | undefined;
  const repositories = (repositoriesConnection?.nodes ?? []).filter(
    (value): value is GitHubSearchRepository => value?.__typename === "Repository",
  );
  const form = useForm({
    defaultValues: initialRepositoryFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      setCursorHistory([null]);
      setCurrentPage(1);
    },
  });

  useEffect(() => {
    if (hasInitializedOwnerFilter || viewerLogin.length === 0) {
      return;
    }

    form.setFieldValue("owner", viewerLogin);
    setAppliedFilters((previous) => ({ ...previous, owner: viewerLogin }));
    setCursorHistory([null]);
    setCurrentPage(1);
    setHasInitializedOwnerFilter(true);
  }, [form, hasInitializedOwnerFilter, viewerLogin]);

  function applyPreset(next: RepositoryFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
    setCursorHistory([null]);
    setCurrentPage(1);
  }

  function goToFirstPage(): void {
    setCurrentPage(1);
  }

  function goToPreviousPage(): void {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  }

  function goToNextPage(): void {
    const endCursor = repositoriesConnection?.pageInfo.endCursor;
    if (
      repositoriesConnection?.pageInfo.hasNextPage !== true ||
      endCursor === null ||
      endCursor === undefined
    ) {
      return;
    }

    setCursorHistory((previous) => {
      if (previous[currentPage] === endCursor) {
        return previous;
      }

      return [...previous.slice(0, currentPage), endCursor];
    });
    setCurrentPage((previous) => previous + 1);
  }

  function renderPagerButton(label: string, disabled: boolean, onClick: () => void): JSX.Element {
    return (
      <button
        type="button"
        className={clsx(PAGER_LINK_CLASS, disabled && "cursor-default text-slate-400")}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  const filteredRepositories = filterRepositories(repositories, appliedFilters);
  const languageStats = getLanguageStats(filteredRepositories);
  const privateCount = filteredRepositories.filter(
    (repository) => repository.visibility === "PRIVATE",
  ).length;
  const internalCount = filteredRepositories.filter(
    (repository) => repository.visibility === "INTERNAL",
  ).length;
  const publicCount = filteredRepositories.filter((repository) => repository.visibility === "PUBLIC").length;
  const totalCount = repositoriesConnection?.repositoryCount ?? repositories.length;
  const visibleFrom = repositories.length === 0 ? 0 : (currentPage - 1) * QUERY_SIZE + 1;
  const visibleTo = repositories.length === 0 ? 0 : visibleFrom + repositories.length - 1;
  const hasNextPage = repositoriesConnection?.pageInfo.hasNextPage ?? false;
  const hasPageLocalPermissionFilter = appliedFilters.permission !== "all";
  const quickFilters = [
    {
      label: "★ 直近プッシュ順",
      filters: initialRepositoryFilterValues,
    },
    ...(viewerLogin.length === 0
      ? []
      : [
          {
            label: "★ 自分名義リポジトリ",
            filters: { ...initialRepositoryFilterValues, owner: viewerLogin },
          },
        ]),
    {
      label: "★ 公開リポジトリ",
      filters: { ...initialRepositoryFilterValues, visibility: "PUBLIC" },
    },
    {
      label: "★ 非公開リポジトリ",
      filters: { ...initialRepositoryFilterValues, visibility: "PRIVATE" },
    },
  ] satisfies ReadonlyArray<{ readonly label: string; readonly filters: RepositoryFilterValues }>;

  return (
    <JtcChrome
      screenId="JTC-RPO-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "リポジトリ一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ一覧"
      rightColumn={
        <>
          <Panel title="よく使う検索条件" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {quickFilters.map((item) => (
                <li key={item.label} className={TODO_LIST_ITEM_CLASS}>
                  <button
                    type="button"
                    className={clsx(TEXT_LINK_CLASS, "text-left")}
                    onClick={() => applyPreset(item.filters)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="統計（表示中ページ）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["非公開", String(privateCount)],
                  ["組織内", String(internalCount)],
                  ["公開", String(publicCount)],
                  ["合計", String(filteredRepositories.length)],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className={label === "合計" ? "font-bold" : undefined}>{label}</td>
                    <td className="text-right font-bold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="主要言語（表示中ページ 上位6件）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {languageStats.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="主要言語データはありません。"
                    detail="絞込結果にリポジトリがないか、primary language が未設定です。"
                  />
                ) : (
                  languageStats.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className="text-right font-bold">{value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="検索条件"
        action={<span className={MUTED_CLASS}>権限以外は GitHub 全件検索 / 権限のみ表示中ページ絞込</span>}
        bodyClassName="p-0"
      >
        <form
          className="flex flex-col gap-1 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <label>リポジトリ名：</label>
            <form.Field
              name="repositoryName"
              validators={zodValidators(repositoryFilterFieldValidators.repositoryName)}
            >
              {(field) => (
                <input
                  className="border border-slate-400 px-1.5 py-0.5"
                  placeholder="example-repo"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
            <label>所有者：</label>
            <form.Field name="owner" validators={zodValidators(repositoryFilterFieldValidators.owner)}>
              {(field) => (
                <input
                  className="border border-slate-400 px-1.5 py-0.5"
                  placeholder="conao3"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
            <label>公開範囲：</label>
            <form.Field
              name="visibility"
              validators={zodValidators(repositoryFilterFieldValidators.visibility)}
            >
              {(field) => (
                <select
                  className="border border-slate-400 px-1 py-0.5"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as RepositoryFilterValues["visibility"])
                  }
                >
                  <option value="all">──全て──</option>
                  <option value="PRIVATE">非公開</option>
                  <option value="INTERNAL">組織内</option>
                  <option value="PUBLIC">公開</option>
                </select>
              )}
            </form.Field>
            <label>主要言語：</label>
            <form.Field name="language" validators={zodValidators(repositoryFilterFieldValidators.language)}>
              {(field) => (
                <input
                  className="border border-slate-400 px-1.5 py-0.5"
                  placeholder="TypeScript"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label>権限（ページ内）：</label>
            <form.Field
              name="permission"
              validators={zodValidators(repositoryFilterFieldValidators.permission)}
            >
              {(field) => (
                <select
                  className="border border-slate-400 px-1 py-0.5"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as RepositoryFilterValues["permission"])
                  }
                >
                  <option value="all">──全て──</option>
                  <option value="ADMIN">管理者</option>
                  <option value="MAINTAIN">保守</option>
                  <option value="WRITE">書込</option>
                  <option value="TRIAGE">一次対応</option>
                  <option value="READ">閲覧</option>
                </select>
              )}
            </form.Field>
            <button type="submit" className={buttonClassName({ tone: "primary" })}>
              検索実行
            </button>
            <button
              type="button"
              className={buttonClassName()}
              onClick={() => applyPreset(initialRepositoryFilterValues)}
            >
              条件クリア
            </button>
          </div>
        </form>
      </Panel>

      <Panel
        title="検索結果"
        action={
          <span className={MUTED_CLASS}>
            {repositoriesQuery.loading
              ? "GitHub から読込中..."
              : hasPageLocalPermissionFilter
                ? `取得 ${visibleFrom}～${visibleTo}件目 / 権限絞込後 ${filteredRepositories.length}件 / 検索結果全 ${totalCount}件`
                : `取得 ${visibleFrom}～${visibleTo}件目 / 表示 ${filteredRepositories.length}件 / 検索結果全 ${totalCount}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>リポジトリ名／説明</th>
              <th className="w-24">所有者</th>
              <th className="w-20">主要言語</th>
              <th className="w-16">権限</th>
              <th className="w-16">公開</th>
              <th className="w-36">最終プッシュ</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {repositoriesQuery.loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  GitHub GraphQL からリポジトリ一覧を取得しています。
                </td>
              </tr>
            ) : shouldWaitForOwnerLookup ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  所有者 {ownerInput} を確認しています。
                </td>
              </tr>
            ) : hasOwnerLookupError ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="error"
                {...describeGitHubError(ownerLookupQuery.error, "所有者情報の取得に失敗しました。")}
              />
            ) : hasMissingOwner ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="empty"
                title="指定した所有者は見つかりません。"
                detail={`GitHub 上で ${ownerInput} に一致する User または Organization を確認できませんでした。`}
              />
            ) : repositoriesQuery.error ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="error"
                {...describeGitHubError(repositoriesQuery.error, "リポジトリ一覧の取得に失敗しました。")}
              />
            ) : filteredRepositories.length === 0 ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="empty"
                title={
                  hasActiveRepositoryFilters(appliedFilters)
                    ? hasPageLocalPermissionFilter
                      ? "この取得ページ内で条件に一致するリポジトリはありません。"
                      : "条件に一致するリポジトリはありません。"
                    : "閲覧可能なリポジトリはありません。"
                }
                detail={
                  hasActiveRepositoryFilters(appliedFilters)
                    ? hasPageLocalPermissionFilter
                      ? "権限条件は表示中ページだけに適用されます。条件を緩めるか次ページも確認してください。"
                      : "検索条件を緩めて再確認してください。"
                    : "GitHub App が参照できるリポジトリがない可能性があります。"
                }
              />
            ) : (
              filteredRepositories.map((repository, index) => (
                <tr key={repository.id}>
                  <td className="text-center">
                    {String((currentPage - 1) * QUERY_SIZE + index + 1).padStart(3, "0")}
                  </td>
                  <td>
                    <div className={MONO_CLASS}>
                      <Link
                        to={`/repositories/${createRepositoryPath(repository.nameWithOwner)}`}
                        className={TEXT_LINK_CLASS}
                      >
                        {repository.nameWithOwner}
                      </Link>
                    </div>
                    <div className="text-slate-700">{repository.description ?? "説明なし"}</div>
                    <div className="text-slate-500">
                      既定ブランチ: {repository.defaultBranchRef?.name ?? "－"} ／ スター:{" "}
                      {repository.stargazerCount} ／ フォーク: {repository.forkCount}
                    </div>
                  </td>
                  <td className="text-center">{getOwnerLabel(repository)}</td>
                  <td className="text-center">{repository.primaryLanguage?.name ?? "－"}</td>
                  <td className="text-center">{formatGitHubPermission(repository.viewerPermission)}</td>
                  <td className="text-center">{formatGitHubVisibility(repository.visibility)}</td>
                  <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(repository.pushedAt)}</td>
                  <td className="text-center">
                    <a href={repository.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                      GitHub
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={PAGER_CLASS}>
          <span className={MUTED_CLASS}>
            {repositoriesQuery.loading
              ? `ページ ${currentPage} を取得中...`
              : `ページ ${currentPage} / 1ページ ${QUERY_SIZE}件`}
          </span>
          {renderPagerButton("≪先頭", currentPage === 1 || repositoriesQuery.loading, goToFirstPage)}
          {renderPagerButton("＜前", currentPage === 1 || repositoriesQuery.loading, goToPreviousPage)}
          <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>現在 {currentPage}</span>
          {renderPagerButton("次＞", !hasNextPage || repositoriesQuery.loading, goToNextPage)}
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoriesPage(): JSX.Element {
  return <RepositoriesScreen />;
}
