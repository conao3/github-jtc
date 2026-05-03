import clsx from "clsx";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { ClientPager } from "../app/components/ClientPager.tsx";
import { GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  createRepositoryRouteId,
  describeGitHubError,
  fetchGitHubViewerRepositories,
  formatGitHubDateTime,
  formatGitHubPermission,
  formatGitHubVisibility,
  type GitHubViewerRepository,
} from "../app/github.ts";
import {
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const QUERY_SIZE = 60;
const pageSizeOptions = ["10", "20", "50"] as const;
const visibilityOptions = ["all", "PRIVATE", "INTERNAL", "PUBLIC"] as const;
const permissionOptions = ["all", "ADMIN", "MAINTAIN", "WRITE", "TRIAGE", "READ"] as const;
const yesNoOptions = ["all", "yes", "no"] as const;

const repositoryFilterFieldValidators = {
  repositoryName: z.string(),
  owner: z.string(),
  visibility: z.enum(visibilityOptions),
  language: z.string(),
  permission: z.enum(permissionOptions),
  hasOpenPr: z.enum(yesNoOptions),
  pageSize: z.enum(pageSizeOptions),
} as const;

type RepositoryFilterValues = {
  repositoryName: string;
  owner: string;
  visibility: (typeof visibilityOptions)[number];
  language: string;
  permission: (typeof permissionOptions)[number];
  hasOpenPr: (typeof yesNoOptions)[number];
  pageSize: (typeof pageSizeOptions)[number];
};

const initialRepositoryFilterValues: RepositoryFilterValues = {
  repositoryName: "",
  owner: "",
  visibility: "all",
  language: "",
  permission: "all",
  hasOpenPr: "all",
  pageSize: "10",
};

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getRepositoryState(repository: GitHubViewerRepository): {
  readonly tone: "done" | "review" | "pending";
  readonly label: string;
} {
  if (repository.pullRequests.totalCount > 0) {
    return { tone: "review", label: "PRあり" };
  }

  if (repository.issues.totalCount > 0) {
    return { tone: "pending", label: "チケットあり" };
  }

  return { tone: "done", label: "運用中" };
}

function getOwnerLabel(repository: GitHubViewerRepository): string {
  return repository.owner.name ?? repository.owner.login;
}

function getLanguageStats(repositories: readonly GitHubViewerRepository[]): Array<[string, number]> {
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
    filters.permission !== "all" ||
    filters.hasOpenPr !== "all"
  );
}

function filterRepositories(
  repositories: readonly GitHubViewerRepository[],
  filters: RepositoryFilterValues,
): GitHubViewerRepository[] {
  const repositoryName = filters.repositoryName.trim().toLowerCase();
  const owner = filters.owner.trim().toLowerCase();
  const language = filters.language.trim().toLowerCase();

  return repositories.filter((repository) => {
    if (
      repositoryName.length > 0 &&
      !repository.nameWithOwner.toLowerCase().includes(repositoryName) &&
      !(repository.description ?? "").toLowerCase().includes(repositoryName)
    ) {
      return false;
    }

    if (
      owner.length > 0 &&
      !repository.owner.login.toLowerCase().includes(owner) &&
      !(repository.owner.name ?? "").toLowerCase().includes(owner)
    ) {
      return false;
    }

    if (filters.visibility !== "all" && repository.visibility !== filters.visibility) {
      return false;
    }

    if (language.length > 0 && !(repository.primaryLanguage?.name ?? "").toLowerCase().includes(language)) {
      return false;
    }

    if (filters.permission !== "all" && repository.viewerPermission !== filters.permission) {
      return false;
    }

    if (filters.hasOpenPr === "yes" && repository.pullRequests.totalCount === 0) {
      return false;
    }

    if (filters.hasOpenPr === "no" && repository.pullRequests.totalCount > 0) {
      return false;
    }

    return true;
  });
}

export function RepositoriesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const repositoriesQuery = useQuery({
    queryKey: ["github", "viewer-repositories", QUERY_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () => fetchGitHubViewerRepositories(accessToken ?? "", { first: QUERY_SIZE, after: null }),
  });
  const repositories = (repositoriesQuery.data?.nodes ?? []).filter(isPresent);
  const [appliedFilters, setAppliedFilters] = useState<RepositoryFilterValues>(initialRepositoryFilterValues);
  const [currentPage, setCurrentPage] = useState(1);
  const form = useForm({
    defaultValues: initialRepositoryFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      setCurrentPage(1);
    },
  });

  function applyPreset(next: RepositoryFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
    setCurrentPage(1);
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
  const issueTotal = filteredRepositories.reduce(
    (total, repository) => total + repository.issues.totalCount,
    0,
  );
  const pullRequestTotal = filteredRepositories.reduce(
    (total, repository) => total + repository.pullRequests.totalCount,
    0,
  );
  const pageSize = Number(appliedFilters.pageSize);
  const pageCount = Math.max(1, Math.ceil(Math.max(filteredRepositories.length, 1) / pageSize));

  useEffect(() => {
    if (currentPage <= pageCount) {
      return;
    }

    setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedRepositories = filteredRepositories.slice(startIndex, startIndex + pageSize);
  const quickFilters = [
    {
      label: "★ 直近 push 順",
      filters: initialRepositoryFilterValues,
    },
    {
      label: "★ 自分が書込権限を持つもの",
      filters: { ...initialRepositoryFilterValues, permission: "WRITE" },
    },
    {
      label: "★ Open PR があるもの",
      filters: { ...initialRepositoryFilterValues, hasOpenPr: "yes" },
    },
    {
      label: "★ Open PR がないもの",
      filters: { ...initialRepositoryFilterValues, hasOpenPr: "no" },
    },
    {
      label: "★ Public リポジトリ",
      filters: { ...initialRepositoryFilterValues, visibility: "PUBLIC" },
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

          <Panel title="統計（絞込結果）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["非公開", String(privateCount)],
                  ["組織内", String(internalCount)],
                  ["公開", String(publicCount)],
                  ["Open PR", String(pullRequestTotal)],
                  ["Open チケット", String(issueTotal)],
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

          <Panel title="主要言語（絞込結果 上位6件）" bodyClassName="p-0">
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
        action={<span className={MUTED_CLASS}>client-side filter / pagination</span>}
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
            <label>Owner：</label>
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
            <label>権限：</label>
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
            <label>Open PR：</label>
            <form.Field
              name="hasOpenPr"
              validators={zodValidators(repositoryFilterFieldValidators.hasOpenPr)}
            >
              {(field) => (
                <select
                  className="border border-slate-400 px-1 py-0.5"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as RepositoryFilterValues["hasOpenPr"])
                  }
                >
                  <option value="all">──全て──</option>
                  <option value="yes">あり</option>
                  <option value="no">なし</option>
                </select>
              )}
            </form.Field>
            <label>表示件数：</label>
            <form.Field name="pageSize" validators={zodValidators(repositoryFilterFieldValidators.pageSize)}>
              {(field) => (
                <select
                  className="border border-slate-400 px-1 py-0.5"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value as RepositoryFilterValues["pageSize"])
                  }
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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
            {repositoriesQuery.isPending
              ? "GitHub から読込中..."
              : `絞込 ${filteredRepositories.length}件 / 全 ${repositoriesQuery.data?.totalCount ?? repositories.length}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>リポジトリ名／説明</th>
              <th className="w-24">Owner</th>
              <th className="w-20">主要言語</th>
              <th className="w-16">Commit</th>
              <th className="w-16">PR</th>
              <th className="w-16">チケット</th>
              <th className="w-20">状態</th>
              <th className="w-16">権限</th>
              <th className="w-16">公開</th>
              <th className="w-28">最終 push</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {repositoriesQuery.isPending ? (
              <tr>
                <td colSpan={12} className="py-6 text-center text-slate-600">
                  GitHub GraphQL からリポジトリ一覧を取得しています。
                </td>
              </tr>
            ) : repositoriesQuery.isError ? (
              <GitHubTableStateRow
                colSpan={12}
                tone="error"
                {...describeGitHubError(repositoriesQuery.error, "リポジトリ一覧の取得に失敗しました。")}
              />
            ) : pagedRepositories.length === 0 ? (
              <GitHubTableStateRow
                colSpan={12}
                tone="empty"
                title={
                  hasActiveRepositoryFilters(appliedFilters)
                    ? "条件に一致するリポジトリはありません。"
                    : "閲覧可能なリポジトリはありません。"
                }
                detail={
                  hasActiveRepositoryFilters(appliedFilters)
                    ? "検索条件を緩めるか、ページサイズを変更して再確認してください。"
                    : "GitHub App が参照できる repository がない可能性があります。"
                }
              />
            ) : (
              pagedRepositories.map((repository, index) => {
                const state = getRepositoryState(repository);
                const commitCount =
                  repository.defaultBranchRef?.target?.__typename === "Commit"
                    ? repository.defaultBranchRef.target.history.totalCount
                    : 0;

                return (
                  <tr key={repository.id}>
                    <td className="text-center">{String(startIndex + index + 1).padStart(3, "0")}</td>
                    <td>
                      <div className={MONO_CLASS}>
                        <Link
                          to={`/repositories/${createRepositoryRouteId(repository.nameWithOwner)}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {repository.nameWithOwner}
                        </Link>
                      </div>
                      <div className="text-slate-700">{repository.description ?? "説明なし"}</div>
                      <div className="text-slate-500">
                        default branch: {repository.defaultBranchRef?.name ?? "－"} ／ stars:{" "}
                        {repository.stargazerCount} ／ forks: {repository.forkCount}
                      </div>
                    </td>
                    <td className="text-center">{getOwnerLabel(repository)}</td>
                    <td className="text-center">{repository.primaryLanguage?.name ?? "－"}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{commitCount}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{repository.pullRequests.totalCount}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{repository.issues.totalCount}</td>
                    <td className="text-center">
                      <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                    </td>
                    <td className="text-center">{formatGitHubPermission(repository.viewerPermission)}</td>
                    <td className="text-center">{formatGitHubVisibility(repository.visibility)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {formatGitHubDateTime(repository.pushedAt)}
                    </td>
                    <td className="text-center">
                      <a href={repository.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                        GitHub
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <ClientPager
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={filteredRepositories.length}
          onPageChange={setCurrentPage}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoriesPage(): JSX.Element {
  return <RepositoriesScreen />;
}
