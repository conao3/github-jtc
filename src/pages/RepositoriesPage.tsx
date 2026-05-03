import clsx from "clsx";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
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

const QUERY_SIZE = 10;
const REPOSITORIES_STALE_TIME_MS = 5 * 60 * 1000;
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

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
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
    filters.permission !== "all"
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

    return true;
  });
}

export function RepositoriesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const repositoriesQuery = useQuery({
    queryKey: ["github", "viewer-repositories", QUERY_SIZE],
    enabled: accessToken !== undefined,
    staleTime: REPOSITORIES_STALE_TIME_MS,
    queryFn: () => fetchGitHubViewerRepositories(accessToken ?? "", { first: QUERY_SIZE, after: null }),
  });
  const repositories = (repositoriesQuery.data?.nodes ?? []).filter(isPresent);
  const [appliedFilters, setAppliedFilters] = useState<RepositoryFilterValues>(initialRepositoryFilterValues);
  const form = useForm({
    defaultValues: initialRepositoryFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
    },
  });

  function applyPreset(next: RepositoryFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
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
  const quickFilters = [
    {
      label: "★ 直近プッシュ順",
      filters: initialRepositoryFilterValues,
    },
    {
      label: "★ 自分が書込権限を持つもの",
      filters: { ...initialRepositoryFilterValues, permission: "WRITE" },
    },
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

          <Panel title="統計（表示中）" bodyClassName="p-0">
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

          <Panel title="主要言語（表示中 上位6件）" bodyClassName="p-0">
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
        action={<span className={MUTED_CLASS}>画面内絞込 / 初回表示は直近10件</span>}
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
              : `表示 ${filteredRepositories.length}件 / 利用可能全 ${repositoriesQuery.data?.totalCount ?? repositories.length}件`}
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
              <th className="w-28">最終プッシュ</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {repositoriesQuery.isPending ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  GitHub GraphQL からリポジトリ一覧を取得しています。
                </td>
              </tr>
            ) : repositoriesQuery.isError ? (
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
                    ? "条件に一致するリポジトリはありません。"
                    : "閲覧可能なリポジトリはありません。"
                }
                detail={
                  hasActiveRepositoryFilters(appliedFilters)
                    ? "検索条件を緩めて再確認してください。"
                    : "GitHub App が参照できるリポジトリがない可能性があります。"
                }
              />
            ) : (
              filteredRepositories.map((repository, index) => (
                <tr key={repository.id}>
                  <td className="text-center">{String(index + 1).padStart(3, "0")}</td>
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
                      既定ブランチ: {repository.defaultBranchRef?.name ?? "－"} ／ スター:{" "}
                      {repository.stargazerCount} ／ フォーク: {repository.forkCount}
                    </div>
                  </td>
                  <td className="text-center">{getOwnerLabel(repository)}</td>
                  <td className="text-center">{repository.primaryLanguage?.name ?? "－"}</td>
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
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoriesPage(): JSX.Element {
  return <RepositoriesScreen />;
}
