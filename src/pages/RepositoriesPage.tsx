import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryRouteId,
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

const PAGE_SIZE = 10;

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
    return { tone: "pending", label: "課題あり" };
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

export function RepositoriesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const repositoriesQuery = useQuery({
    queryKey: ["github", "viewer-repositories", PAGE_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () => fetchGitHubViewerRepositories(accessToken ?? "", { first: PAGE_SIZE, after: null }),
  });
  const repositories = (repositoriesQuery.data?.nodes ?? []).filter(isPresent);
  const languageStats = getLanguageStats(repositories);
  const privateCount = repositories.filter((repository) => repository.visibility === "PRIVATE").length;
  const internalCount = repositories.filter((repository) => repository.visibility === "INTERNAL").length;
  const publicCount = repositories.filter((repository) => repository.visibility === "PUBLIC").length;
  const issueTotal = repositories.reduce((total, repository) => total + repository.issues.totalCount, 0);
  const pullRequestTotal = repositories.reduce(
    (total, repository) => total + repository.pullRequests.totalCount,
    0,
  );

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
              {[
                "★ 直近 push 順",
                "★ 自分が書込権限を持つもの",
                "★ Open PR があるもの",
                "★ Open Issue があるもの",
                "★ Public リポジトリ",
              ].map((item) => (
                <li key={item} className={TODO_LIST_ITEM_CLASS}>
                  <span className={TEXT_LINK_CLASS}>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="統計（GitHub実データ）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["非公開", String(privateCount)],
                  ["組織内", String(internalCount)],
                  ["公開", String(publicCount)],
                  ["Open PR", String(pullRequestTotal)],
                  ["Open Issue", String(issueTotal)],
                  ["合計", String(repositoriesQuery.data?.totalCount ?? repositories.length)],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className={label === "合計" ? "font-bold" : undefined}>{label}</td>
                    <td className="text-right font-bold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="主要言語（上位6件）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {languageStats.length === 0 ? (
                  <tr>
                    <td className="text-center text-slate-600">データなし</td>
                  </tr>
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
        action={<span className={MUTED_CLASS}>※ 次段で GitHub API の条件検索に接続予定</span>}
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-1 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <label>リポジトリ名：</label>
            <input className="border border-slate-400 px-1.5 py-0.5" placeholder="example-repo" />
            <label>Owner：</label>
            <input className="border border-slate-400 px-1.5 py-0.5" placeholder="conao3" />
            <label>公開範囲：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>──全て──</option>
              <option>非公開</option>
              <option>組織内</option>
              <option>公開</option>
            </select>
            <label>主要言語：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>──全て──</option>
              {languageStats.map(([label]) => (
                <option key={label}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label>権限：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>──全て──</option>
              <option>管理者</option>
              <option>保守</option>
              <option>書込</option>
              <option>一次対応</option>
              <option>閲覧</option>
            </select>
            <label>Open PR：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>──全て──</option>
              <option>あり</option>
              <option>なし</option>
            </select>
            <label>表示件数：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>10</option>
            </select>
            <button type="button" className={buttonClassName({ tone: "primary" })}>
              検索実行
            </button>
            <button type="button" className={buttonClassName()}>
              条件クリア
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        title="検索結果"
        action={
          <span className={MUTED_CLASS}>
            {repositoriesQuery.isPending
              ? "GitHub から読込中..."
              : `該当 ${repositoriesQuery.data?.totalCount ?? repositories.length}件 ／ ${new Date().toLocaleString("ja-JP")}`}
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
              <th className="w-16">Issue</th>
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
              <tr>
                <td colSpan={12} className="py-6 text-center text-red-800">
                  {repositoriesQuery.error instanceof Error
                    ? repositoriesQuery.error.message
                    : "リポジトリ一覧の取得に失敗しました。"}
                </td>
              </tr>
            ) : repositories.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-6 text-center text-slate-600">
                  閲覧可能なリポジトリがありません。
                </td>
              </tr>
            ) : (
              repositories.map((repository, index) => {
                const state = getRepositoryState(repository);
                const commitCount =
                  repository.defaultBranchRef?.target?.__typename === "Commit"
                    ? repository.defaultBranchRef.target.history.totalCount
                    : 0;

                return (
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

        <div className="border-t border-t-slate-300 bg-slate-50 px-1.5 py-1 text-xs text-slate-600">
          {repositoriesQuery.data?.pageInfo.hasNextPage
            ? "※ GitHub 側にはまだ続きがあります。pagination 対応は次段で実装します。"
            : "※ 現在表示している一覧が取得結果の全件です。"}
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoriesPage(): JSX.Element {
  return <RepositoriesScreen />;
}
