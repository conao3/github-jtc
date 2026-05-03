import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  fetchGitHubRepositoryDetail,
  formatGitHubByteSize,
  formatGitHubDate,
  formatGitHubDateTime,
  formatGitHubPermission,
  formatGitHubVisibility,
  parseRepositoryRouteId,
  sumLanguageSizes,
} from "../app/github.ts";
import {
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TABS_ROW_CLASS,
  TAB_ACTIVE_CLASS,
  TAB_BADGE_CLASS,
  TAB_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

function getEntryKindLabel(value: string): string {
  switch (value) {
    case "tree":
      return "ディレクトリ";
    case "blob":
      return "ファイル";
    case "commit":
      return "submodule";
    default:
      return value;
  }
}

function getOwnerLabel(
  owner: { readonly __typename: string; readonly login: string; readonly name?: string | null } | undefined,
): string {
  if (owner === undefined) {
    return "－";
  }

  return owner.name ?? owner.login;
}

export function RepositoryDetailScreen({
  repoId = "payment-system-core",
}: {
  readonly repoId?: string;
}): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryRouteId(repoId, sessionQuery.data?.user.login);
  const repositoryQuery = useQuery({
    queryKey: ["github", "repository-detail", coordinates?.owner, coordinates?.name],
    enabled: accessToken !== undefined && coordinates !== null,
    queryFn: () =>
      fetchGitHubRepositoryDetail(accessToken ?? "", {
        owner: coordinates?.owner ?? "",
        name: coordinates?.name ?? "",
        rootExpression: "HEAD:",
        readmeExpression: "HEAD:README.md",
      }),
  });
  const repository = repositoryQuery.data;
  const latestCommit =
    repository?.defaultBranchRef?.target?.__typename === "Commit" ? repository.defaultBranchRef.target : null;
  const rootEntries =
    repository?.rootEntries?.__typename === "Tree"
      ? (repository.rootEntries.entries ?? []).filter((entry) => entry !== null)
      : [];
  const readmeText =
    repository?.readme?.__typename === "Blob" && !repository.readme.isBinary ? repository.readme.text : null;
  const languageEdges = repository?.languages?.edges ?? [];
  const totalLanguageSize = sumLanguageSizes(languageEdges);

  return (
    <JtcChrome
      screenId="JTC-RPO-002"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "リポジトリ一覧", to: "/repositories" },
        { label: "リポジトリ詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ一覧"
      rightColumn={
        <>
          <Panel title="権限情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>あなたの権限</th>
                  <td>
                    <b>{formatGitHubPermission(repository?.viewerPermission)}</b>
                  </td>
                </tr>
                <tr>
                  <th>公開範囲</th>
                  <td>{formatGitHubVisibility(repository?.visibility)}</td>
                </tr>
                <tr>
                  <th>Owner</th>
                  <td className={MONO_CLASS}>{repository?.owner.login ?? coordinates?.owner ?? "－"}</td>
                </tr>
                <tr>
                  <th>default branch</th>
                  <td className={MONO_CLASS}>{repository?.defaultBranchRef?.name ?? "－"}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="統計情報" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["総コミット数", String(latestCommit?.history.totalCount ?? 0)],
                ["ブランチ数", String(repository?.refs?.totalCount ?? 0)],
                ["Watchers", String(repository?.watchers.totalCount ?? 0)],
                ["Stars", String(repository?.stargazerCount ?? 0)],
                ["Open Issue", `${repository?.issues.totalCount ?? 0} 件`],
                ["Open PR", `${repository?.pullRequests.totalCount ?? 0} 件`],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-blue-900">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="ブランチ一覧" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {(repository?.refs?.nodes ?? []).map((branch) =>
                  branch?.target?.__typename === "Commit" ? (
                    <tr key={branch.id}>
                      <td className={MONO_CLASS}>{branch.name}</td>
                      <td className="text-center">{formatGitHubDate(branch.target.committedDate)}</td>
                    </tr>
                  ) : null,
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
        title="リポジトリ基本情報"
        action={
          <span className={MUTED_CLASS}>
            {repository == null
              ? "リポジトリ未検出"
              : `最終更新：${formatGitHubDateTime(repository?.updatedAt ?? null)}`}
          </span>
        }
        bodyClassName="p-0"
      >
        {coordinates === null ? (
          <div className="py-8 text-center text-red-800">リポジトリ識別子を解釈できませんでした。</div>
        ) : repositoryQuery.isPending ? (
          <div className="py-8 text-center text-slate-600">GitHub からリポジトリ詳細を取得しています。</div>
        ) : repositoryQuery.isError ? (
          <div className="py-8 text-center text-red-800">
            {repositoryQuery.error instanceof Error
              ? repositoryQuery.error.message
              : "リポジトリ詳細の取得に失敗しました。"}
          </div>
        ) : repository == null ? (
          <div className="py-8 text-center text-slate-600">
            {coordinates.owner}/{coordinates.name} は参照できません。
          </div>
        ) : (
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>
                  リポジトリ名<span className="font-bold text-red-700">※</span>
                </th>
                <td className={MONO_CLASS}>
                  <b>{repository.nameWithOwner}</b>
                </td>
                <th>URL</th>
                <td className={MONO_CLASS}>
                  <a href={repository.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                    open
                  </a>
                </td>
              </tr>
              <tr>
                <th>Owner</th>
                <td>{getOwnerLabel(repository.owner)}</td>
                <th>主要言語</th>
                <td>{repository.primaryLanguage?.name ?? "未設定"}</td>
              </tr>
              <tr>
                <th>公開範囲</th>
                <td>{formatGitHubVisibility(repository.visibility)}</td>
                <th>Viewer権限</th>
                <td>{formatGitHubPermission(repository.viewerPermission)}</td>
              </tr>
              <tr>
                <th>説明</th>
                <td colSpan={3}>{repository.description ?? "説明は設定されていません。"}</td>
              </tr>
              <tr>
                <th>Homepage</th>
                <td className={MONO_CLASS}>{repository.homepageUrl ?? "未設定"}</td>
                <th>default branch</th>
                <td className={MONO_CLASS}>{repository.defaultBranchRef?.name ?? "－"}</td>
              </tr>
              <tr>
                <th>作成日</th>
                <td className={MONO_CLASS}>{formatGitHubDate(repository.createdAt)}</td>
                <th>最終 push</th>
                <td className={MONO_CLASS}>{formatGitHubDateTime(repository.pushedAt)}</td>
              </tr>
              <tr>
                <th>最新コミット</th>
                <td colSpan={3}>
                  <div className="font-bold">{latestCommit?.messageHeadline ?? "情報なし"}</div>
                  <div className="text-slate-600">
                    {latestCommit?.author?.user?.login ?? latestCommit?.author?.name ?? "unknown"} ／{" "}
                    {formatGitHubDateTime(latestCommit?.committedDate)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Panel>

      <Panel
        title="ファイルツリー"
        action={
          <span>
            ブランチ：
            <span className="inline-flex min-w-24 items-center border border-slate-400 bg-white px-1.5 py-0.5">
              {repository?.defaultBranchRef?.name ?? "HEAD"} ▼
            </span>
            <span className="px-1" />
            <button type="button" className={buttonClassName({ size: "sm" })}>
              更新
            </button>
            <span className="px-1" />
            <a
              href={repository?.url}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ size: "sm", tone: "primary", className: "inline-flex" })}
            >
              GitHubで開く
            </a>
          </span>
        }
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <label>パス：</label>
          <span className={MONO_CLASS}>/</span>
          <label>表示：</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>全て</option>
          </select>
          <label>並び順：</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>名前順</option>
          </select>
          <span className="text-xs text-slate-600">※ root tree の実データを表示しています。</span>
        </div>

        <div className={TABS_ROW_CLASS}>
          <span className={clsx(TAB_CLASS, TAB_ACTIVE_CLASS)}>ファイル一覧</span>
          <span className={TAB_CLASS}>
            コミット履歴 <span className={TAB_BADGE_CLASS}>{latestCommit?.history.totalCount ?? 0}</span>
          </span>
          <span className={TAB_CLASS}>
            プルリクエスト <span className={TAB_BADGE_CLASS}>{repository?.pullRequests.totalCount ?? 0}</span>
          </span>
          <span className={TAB_CLASS}>
            ブランチ／タグ <span className={TAB_BADGE_CLASS}>{repository?.refs?.totalCount ?? 0}</span>
          </span>
        </div>

        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th>名前</th>
              <th className="w-20">種別</th>
              <th className="w-20">サイズ</th>
              <th className="w-16">mode</th>
              <th className="w-32">OID</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {rootEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-600">
                  ルートディレクトリに表示可能なファイルがありません。
                </td>
              </tr>
            ) : (
              rootEntries.map((entry) => (
                <tr key={entry.oid}>
                  <td className={MONO_CLASS}>
                    {entry.type === "tree" ? `📁 ${entry.name}` : `📄 ${entry.name}`}
                  </td>
                  <td className="text-center">{getEntryKindLabel(entry.type)}</td>
                  <td className={clsx("text-right", MONO_CLASS)}>
                    {entry.object?.__typename === "Blob" ? formatGitHubByteSize(entry.object.byteSize) : "－"}
                  </td>
                  <td className={clsx("text-center", MONO_CLASS)}>{entry.mode}</td>
                  <td className={MONO_CLASS}>{entry.oid.slice(0, 12)}</td>
                  <td className="text-center">
                    <a href={repository?.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                      GitHub
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="border-t border-t-slate-300 bg-slate-50 px-1.5 py-1 text-xs text-slate-600">
          root tree: {rootEntries.length} 件を表示中
        </div>
      </Panel>

      <Panel title="README プレビュー">
        <div className={clsx("min-h-32 bg-amber-50 p-3 text-xs whitespace-pre-wrap", MONO_CLASS)}>
          {readmeText === null || readmeText.length === 0
            ? "README.md は見つからないか、binary / 非対応形式のためプレビューできません。"
            : readmeText}
        </div>
      </Panel>

      <Panel title="言語構成" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th>言語</th>
              <th className="w-20">サイズ</th>
              <th className="w-16">比率</th>
            </tr>
          </thead>
          <tbody>
            {languageEdges.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-600">
                  言語情報がありません。
                </td>
              </tr>
            ) : (
              languageEdges.map((edge) =>
                edge?.node === null || edge?.node === undefined ? null : (
                  <tr key={edge.node.id}>
                    <td>{edge.node.name}</td>
                    <td className={clsx("text-right", MONO_CLASS)}>{formatGitHubByteSize(edge.size)}</td>
                    <td className={clsx("text-right", MONO_CLASS)}>
                      {totalLanguageSize === 0
                        ? "0%"
                        : `${Math.round((edge.size / totalLanguageSize) * 100)}%`}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoryDetailPage(): JSX.Element {
  const { repoId } = useParams();

  return <RepositoryDetailScreen repoId={repoId ?? "payment-system-core"} />;
}
