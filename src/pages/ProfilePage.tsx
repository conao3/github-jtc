import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryPath,
  describeGitHubError,
  formatGitHubDate,
  formatGitHubDateTime,
  formatJapaneseEraDateTime,
  formatGitHubPermission,
} from "../app/github.ts";
import {
  ViewerProfileDocument,
  ViewerProfileOrganizationsDocument,
  ViewerProfileRepositoriesDocument,
} from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  KPI_CARD_CLASS,
  KPI_LABEL_CLASS,
  KPI_ROW_CLASS,
  KPI_UNIT_CLASS,
  KPI_VALUE_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const PROFILE_ORGANIZATIONS_PAGE_SIZE = 10;
const PROFILE_REPOSITORIES_PAGE_SIZE = 5;

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getProfileQueryRange(): { readonly from: string; readonly to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function ProfileScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const organizationsPager = useCursorPagerState();
  const repositoriesPager = useCursorPagerState();
  const range = getProfileQueryRange();
  const profileQuery = useQuery(ViewerProfileDocument, {
    skip: accessToken === undefined,
    variables: {
      ...range,
    },
    fetchPolicy: "network-only",
  });
  const repositoryQuery = useQuery(ViewerProfileRepositoriesDocument, {
    skip: accessToken === undefined,
    variables: {
      first: PROFILE_REPOSITORIES_PAGE_SIZE,
      after: repositoriesPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const organizationsQuery = useQuery(ViewerProfileOrganizationsDocument, {
    skip: accessToken === undefined,
    variables: {
      first: PROFILE_ORGANIZATIONS_PAGE_SIZE,
      after: organizationsPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const profile = profileQuery.data?.viewer ?? profileQuery.previousData?.viewer;
  const repositoriesConnection =
    repositoryQuery.data?.viewer.repositories ?? repositoryQuery.previousData?.viewer.repositories;
  const organizationsConnection =
    organizationsQuery.data?.viewer.organizations ?? organizationsQuery.previousData?.viewer.organizations;
  const organizations = (organizationsConnection?.nodes ?? []).filter(isPresent);
  const repositories = (repositoriesConnection?.nodes ?? []).filter(isPresent);

  return (
    <JtcChrome
      screenId="JTC-USR-005"
      crumbs={[
        { label: "共通管理", to: "/profile" },
        { label: "ユーザー管理", to: "/profile" },
        { label: "ユーザー詳細（プロフィール）" },
      ]}
      activeTopMenu="共通管理"
      activeSideItem="ユーザー管理"
      rightColumn={
        <>
          <Panel title="操作メニュー">
            <div className="flex flex-col gap-1">
              {["プロフィール編集", "SSH鍵管理", "アクセストークン", "通知設定", "公開プロフィール確認"].map(
                (label) => (
                  <button key={label} type="button" className={buttonClassName()}>
                    {label}
                  </button>
                ),
              )}
            </div>
          </Panel>

          <Panel title="GitHubサマリ" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["所属組織", String(profile?.organizationCount.totalCount ?? 0)],
                  ["閲覧可能リポジトリ", String(profile?.repositoryCount.totalCount ?? 0)],
                  ["フォロワー", String(profile?.followers.totalCount ?? 0)],
                  ["フォロー中", String(profile?.following.totalCount ?? 0)],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td className={clsx("text-right", MONO_CLASS)}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="最近更新したリポジトリ" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {repositories.length === 0 ? (
                  repositoryQuery.loading ? (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="empty"
                      title="最近更新したリポジトリを取得しています。"
                      detail="GitHub からリポジトリ一覧を読み込んでいます。"
                    />
                  ) : repositoryQuery.error ? (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="error"
                      {...describeGitHubError(
                        repositoryQuery.error,
                        "最近更新したリポジトリの取得に失敗しました。",
                      )}
                    />
                  ) : (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="empty"
                      title="最近更新したリポジトリはありません。"
                      detail="最近更新したリポジトリの表示対象データがありません。"
                    />
                  )
                ) : (
                  repositories.map((repository) => (
                    <tr key={repository.id}>
                      <td className={MONO_CLASS}>
                        <Link
                          to={`/repositories/${createRepositoryPath(repository.nameWithOwner)}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {repository.name}
                        </Link>
                      </td>
                      <td className="text-center">
                        <JtcStatusTag tone={repository.isPrivate ? "pending" : "done"}>
                          {repository.isPrivate ? "非公開" : "公開"}
                        </JtcStatusTag>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <CursorPager
              currentPage={repositoriesPager.currentPage}
              pageSize={PROFILE_REPOSITORIES_PAGE_SIZE}
              visibleCount={repositories.length}
              totalCount={repositoriesConnection?.totalCount}
              hasNextPage={repositoriesConnection?.pageInfo.hasNextPage ?? false}
              isLoading={repositoryQuery.loading}
              onFirstPage={repositoriesPager.goToFirstPage}
              onPreviousPage={repositoriesPager.goToPreviousPage}
              onNextPage={() => repositoriesPager.goToNextPage(repositoriesConnection?.pageInfo.endCursor)}
            />
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="基本情報"
        action={
          <span className={MUTED_CLASS}>
            {profile === undefined
              ? "GitHub から読込中..."
              : `最終同期：${formatJapaneseEraDateTime(new Date())}`}
          </span>
        }
      >
        {profileQuery.loading && profile === undefined ? (
          <div className="py-8 text-center text-slate-600">GitHub プロフィール情報を取得しています。</div>
        ) : profileQuery.error || profile === undefined ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(profileQuery.error, "プロフィール情報の取得に失敗しました。")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="text-center">
              <img
                src={profile.avatarUrl}
                alt={profile.login}
                className="mx-auto h-32 w-32 border-2 border-slate-600 bg-slate-200 object-cover"
              />
              <div className="mt-1 text-xs text-slate-600">
                GitHub アバター
                <br />
                ログインID: <span className={MONO_CLASS}>{profile.login}</span>
              </div>
              <a
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ size: "sm", className: "mt-1 inline-flex" })}
              >
                GitHubで開く
              </a>
            </div>
            <div>
              <table className={TABLE_CLASS}>
                <tbody>
                  <tr>
                    <th>
                      ユーザーID<span className="font-bold text-red-700">※</span>
                    </th>
                    <td className={MONO_CLASS}>
                      <b>{profile.login}</b>
                    </td>
                    <th>ノードID</th>
                    <td className={MONO_CLASS}>{profile.id}</td>
                  </tr>
                  <tr>
                    <th>氏名</th>
                    <td>{profile.name ?? "未設定"}</td>
                    <th>表示名</th>
                    <td>{sessionQuery.data?.user.displayName ?? profile.name ?? profile.login}</td>
                  </tr>
                  <tr>
                    <th>所属</th>
                    <td>{profile.company ?? "未設定"}</td>
                    <th>所在地</th>
                    <td>{profile.location ?? "未設定"}</td>
                  </tr>
                  <tr>
                    <th>メール</th>
                    <td className={MONO_CLASS}>{profile.email.length > 0 ? profile.email : "非公開"}</td>
                    <th>ウェブサイト</th>
                    <td className={MONO_CLASS}>{profile.websiteUrl ?? "未設定"}</td>
                  </tr>
                  <tr>
                    <th>プロフィールURL</th>
                    <td colSpan={3} className={MONO_CLASS}>
                      <a href={profile.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                        {profile.url}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th>GitHub参加日</th>
                    <td className={MONO_CLASS}>{formatGitHubDate(profile.createdAt)}</td>
                    <th>認証方式</th>
                    <td>{sessionQuery.data?.user.providerLabel ?? "GitHub App"}</td>
                  </tr>
                  <tr>
                    <th>フォロワー / フォロー中</th>
                    <td className={MONO_CLASS}>
                      {profile.followers.totalCount} / {profile.following.totalCount}
                    </td>
                    <th>組織数</th>
                    <td className={MONO_CLASS}>{profile.organizationCount.totalCount}</td>
                  </tr>
                  <tr>
                    <th>自己紹介</th>
                    <td colSpan={3}>{profile.bio ?? "自己紹介は設定されていません。"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="アクセス可能リポジトリ（直近更新順）" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>リポジトリ</th>
              <th className="w-20">権限</th>
              <th className="w-20">公開</th>
              <th className="w-36">最終更新</th>
            </tr>
          </thead>
          <tbody>
            {repositories.length === 0 ? (
              repositoryQuery.loading ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="アクセス可能リポジトリを取得しています。"
                  detail="GitHub からリポジトリ一覧を読み込んでいます。"
                />
              ) : repositoryQuery.error ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="error"
                  {...describeGitHubError(
                    repositoryQuery.error,
                    "アクセス可能リポジトリの取得に失敗しました。",
                  )}
                />
              ) : (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="表示可能なリポジトリ情報がありません。"
                  detail="このユーザートークンで参照できるリポジトリが存在しません。"
                />
              )
            ) : (
              repositories.map((repository, index) => (
                <tr key={repository.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className={MONO_CLASS}>
                    <Link
                      to={`/repositories/${createRepositoryPath(repository.nameWithOwner)}`}
                      className={TEXT_LINK_CLASS}
                    >
                      {repository.nameWithOwner}
                    </Link>
                  </td>
                  <td className="text-center">{formatGitHubPermission(repository.viewerPermission)}</td>
                  <td className="text-center">
                    <JtcStatusTag tone={repository.isPrivate ? "pending" : "done"}>
                      {repository.isPrivate ? "非公開" : "公開"}
                    </JtcStatusTag>
                  </td>
                  <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(repository.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={repositoriesPager.currentPage}
          pageSize={PROFILE_REPOSITORIES_PAGE_SIZE}
          visibleCount={repositories.length}
          totalCount={repositoriesConnection?.totalCount}
          hasNextPage={repositoriesConnection?.pageInfo.hasNextPage ?? false}
          isLoading={repositoryQuery.loading}
          onFirstPage={repositoriesPager.goToFirstPage}
          onPreviousPage={repositoriesPager.goToPreviousPage}
          onNextPage={() => repositoriesPager.goToNextPage(repositoriesConnection?.pageInfo.endCursor)}
        />
      </Panel>

      <Panel title="活動実績（直近30日）">
        <div className={KPI_ROW_CLASS}>
          {[
            ["コミット数", String(profile?.contributionsCollection.totalCommitContributions ?? 0)],
            [
              "プルリクエスト作成数",
              String(profile?.contributionsCollection.totalPullRequestContributions ?? 0),
            ],
            [
              "レビュー対応",
              String(profile?.contributionsCollection.totalPullRequestReviewContributions ?? 0),
            ],
            ["チケット対応数", String(profile?.contributionsCollection.totalIssueContributions ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className={KPI_CARD_CLASS}>
              <div className={KPI_LABEL_CLASS}>{label}</div>
              <div className={KPI_VALUE_CLASS}>
                {value}
                <span className={KPI_UNIT_CLASS}>件</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="所属組織" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>組織ID</th>
              <th>名称</th>
              <th className="w-32">URL</th>
            </tr>
          </thead>
          <tbody>
            {organizations.length === 0 ? (
              organizationsQuery.loading ? (
                <GitHubTableStateRow
                  colSpan={4}
                  tone="empty"
                  title="所属組織を取得しています。"
                  detail="GitHub から組織一覧を読み込んでいます。"
                />
              ) : organizationsQuery.error ? (
                <GitHubTableStateRow
                  colSpan={4}
                  tone="error"
                  {...describeGitHubError(organizationsQuery.error, "所属組織の取得に失敗しました。")}
                />
              ) : (
                <GitHubTableStateRow
                  colSpan={4}
                  tone="empty"
                  title="所属組織はありません。"
                  detail="所属組織の表示対象データがありません。"
                />
              )
            ) : (
              organizations.map((organization, index) => (
                <tr key={organization.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className={MONO_CLASS}>{organization.login}</td>
                  <td>{organization.name ?? "名称未設定"}</td>
                  <td className={MONO_CLASS}>
                    <a href={organization.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                      開く
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={organizationsPager.currentPage}
          pageSize={PROFILE_ORGANIZATIONS_PAGE_SIZE}
          visibleCount={organizations.length}
          totalCount={organizationsConnection?.totalCount}
          hasNextPage={organizationsConnection?.pageInfo.hasNextPage ?? false}
          isLoading={organizationsQuery.loading}
          onFirstPage={organizationsPager.goToFirstPage}
          onPreviousPage={organizationsPager.goToPreviousPage}
          onNextPage={() => organizationsPager.goToNextPage(organizationsConnection?.pageInfo.endCursor)}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function ProfilePage(): JSX.Element {
  return <ProfileScreen />;
}
