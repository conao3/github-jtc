import clsx from "clsx";
import type { PropsWithChildren, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatSessionTimestamp, useAuthSession, useLogoutMutation } from "../auth.tsx";
import { useUiPreferences } from "../state.tsx";
import {
  APP_FRAME_CLASS,
  BODY_BG_CLASS,
  BODY_GRID_CLASS,
  BREADCRUMBS_CLASS,
  CONTACT_BOX_CLASS,
  CONTACT_BOX_TITLE_CLASS,
  FOOTER_CLASS,
  FONT_SCALE_CLASS,
  FONT_SWITCHER_CLASS,
  HEADER_ACTIONS_CLASS,
  HEADER_ROW_CLASS,
  IE_NOTICE_CLASS,
  LOGO_CELL_CLASS,
  MAIN_COL_CLASS,
  MENU_BAR_CLASS,
  MENU_BAR_LEFT_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_ITEMS_ROW_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  PRODUCT_EDITION_CLASS,
  PRODUCT_NAME_CLASS,
  PRODUCT_SUBTITLE_CLASS,
  RIGHT_COL_CLASS,
  SCREEN_ID_CELL_CLASS,
  SIDE_GROUP_ITEM_ACTIVE_CLASS,
  SIDE_GROUP_ITEM_CLASS,
  SIDE_GROUP_LIST_CLASS,
  SIDE_GROUP_SUMMARY_CLASS,
  SIDE_MENU_CLASS,
  SIDE_MENU_TITLE_CLASS,
  STATUS_BOX_BODY_CLASS,
  STATUS_BOX_CLASS,
  STATUS_BOX_TITLE_CLASS,
  TEXT_LINK_CLASS,
  USER_INFO_CELL_CLASS,
  USER_INFO_TABLE_CLASS,
  buttonClassName,
} from "../styles.ts";

interface CrumbItem {
  readonly label: string;
  readonly to?: string;
}

interface NavEntry {
  readonly label: string;
  readonly to?: string;
}

interface NavGroup {
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly items: NavEntry[];
}

interface JtcChromeProps extends PropsWithChildren {
  readonly screenId: string;
  readonly crumbs: CrumbItem[];
  readonly activeTopMenu: string;
  readonly activeSideItem: string;
  readonly rightColumn?: ReactNode;
}

const topMenus: NavEntry[] = [
  { label: "ポータル", to: "/" },
  { label: "開発管理", to: "/repositories" },
  { label: "構成管理" },
  { label: "変更管理" },
  { label: "リリース管理" },
  { label: "品質管理" },
  { label: "資産管理" },
  { label: "共通管理", to: "/profile" },
];

const sideGroups: NavGroup[] = [
  {
    title: "ポータル",
    defaultOpen: true,
    items: [
      { label: "ダッシュボード", to: "/" },
      { label: "お知らせ一覧" },
      { label: "個人設定", to: "/profile" },
      { label: "ToDo一覧" },
      { label: "スケジュール" },
    ],
  },
  {
    title: "開発管理",
    defaultOpen: true,
    items: [
      { label: "リポジトリ一覧", to: "/repositories" },
      { label: "リポジトリ登録申請", to: "/repositories/new" },
      { label: "プルリクエスト一覧", to: "/pull-requests" },
      { label: "課題（Issue）一覧", to: "/issues" },
      { label: "ブランチ一覧" },
      { label: "コミット履歴", to: "/commits" },
      { label: "マージ申請" },
    ],
  },
  {
    title: "構成管理",
    items: [{ label: "構成情報一覧" }, { label: "タグ管理" }, { label: "構成図出力" }],
  },
  {
    title: "変更管理",
    items: [{ label: "変更要求一覧" }, { label: "承認依頼一覧" }, { label: "変更履歴" }],
  },
  {
    title: "リリース管理",
    items: [{ label: "リリース予定" }, { label: "リリース実績" }, { label: "CABレビュー" }],
  },
  {
    title: "品質管理",
    items: [{ label: "レビュー記録" }, { label: "テスト結果一覧" }, { label: "脆弱性検知履歴" }],
  },
  {
    title: "資産管理",
    items: [{ label: "資産一覧" }, { label: "ライセンス管理" }],
  },
  {
    title: "共通管理",
    items: [
      { label: "ユーザー管理", to: "/profile" },
      { label: "権限管理" },
      { label: "組織管理" },
      { label: "ログ管理" },
    ],
  },
];

function SideEntry({ entry, active }: { entry: NavEntry; active: boolean }): JSX.Element {
  const content = (
    <>
      <span className={clsx("absolute left-3.5 top-1", active ? "text-xs text-red-700" : "text-slate-400")}>
        {active ? "▶" : "・"}
      </span>
      {entry.to === undefined ? (
        <span className={clsx(active && "font-bold")}>{entry.label}</span>
      ) : (
        <Link
          to={entry.to}
          className={clsx(TEXT_LINK_CLASS, "no-underline", active && "font-bold text-slate-900")}
        >
          {entry.label}
        </Link>
      )}
    </>
  );

  return <li className={clsx(SIDE_GROUP_ITEM_CLASS, active && SIDE_GROUP_ITEM_ACTIVE_CLASS)}>{content}</li>;
}

export function JtcChrome({
  screenId,
  crumbs,
  activeTopMenu,
  activeSideItem,
  rightColumn,
  children,
}: JtcChromeProps): JSX.Element {
  const navigate = useNavigate();
  const { fontScale, setFontScale } = useUiPreferences();
  const sessionQuery = useAuthSession();
  const logoutMutation = useLogoutMutation();
  const session = sessionQuery.data;
  const userLogin = session?.user.login ?? "yamada.taro";
  const displayName = session?.user.displayName ?? "山田 太郎";
  const department = session?.user.department ?? "第一システム事業本部 デジタル基盤統括部 基盤開発二課";
  const role = session?.user.role ?? "開発者（一般）";
  const providerLabel = session?.user.providerLabel ?? "JTC 社内認証";
  const lastLoginAt = formatSessionTimestamp(session?.lastLoginAt);
  const expiresAt =
    session?.expiresAt === undefined ? "ブラウザセッション有効" : formatSessionTimestamp(session.expiresAt);

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
    void navigate("/login", { replace: true });
  }

  return (
    <div className={clsx(BODY_BG_CLASS, FONT_SCALE_CLASS[fontScale])}>
      <div className={APP_FRAME_CLASS}>
        <header className={HEADER_ROW_CLASS}>
          <div className={LOGO_CELL_CLASS}>
            <div className={PRODUCT_NAME_CLASS}>
              JTC GitHub<span className="align-super text-xs">®</span>
            </div>
            <div className={PRODUCT_EDITION_CLASS}>Enterprise Edition 5.2.1</div>
            <div className={PRODUCT_SUBTITLE_CLASS}>統合ソースコード管理基盤</div>
          </div>

          <div className={USER_INFO_CELL_CLASS}>
            <table className={USER_INFO_TABLE_CLASS}>
              <tbody>
                <tr>
                  <td>
                    <span className="lbl">ユーザーID：</span>
                    <span className={clsx("val", MONO_CLASS)}>{userLogin}</span>
                  </td>
                  <td>
                    <span className="lbl">氏名：</span>
                    <span className="val">{displayName}</span>
                  </td>
                  <td>
                    <span className="lbl">所属：</span>
                    <span className="val">{department}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="lbl">ロール：</span>
                    <span className="val">{role}</span>
                  </td>
                  <td>
                    <span className="lbl">認証方式：</span>
                    <span className="val">{providerLabel}</span>
                  </td>
                  <td>
                    <span className="lbl">前回ログイン：</span>
                    <span className={clsx("val", MONO_CLASS)}>{lastLoginAt}</span>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <span className="lbl">セッション有効期限：</span>
                    <span className={clsx("val", MONO_CLASS)}>{expiresAt}</span>
                    <span className="ml-3 lbl">GitHub GraphQL：</span>
                    <span className="val">
                      {session?.provider === "github" ? "viewer 取得済" : "未接続（社内認証のみ）"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={HEADER_ACTIONS_CLASS}>
            <div className={FONT_SWITCHER_CLASS}>
              <span className={MUTED_CLASS}>文字サイズ</span>
              <button
                type="button"
                className={buttonClassName({
                  size: "sm",
                  tone: fontScale === "small" ? "primary" : "default",
                })}
                onClick={() => setFontScale("small")}
              >
                小
              </button>
              <button
                type="button"
                className={buttonClassName({
                  size: "sm",
                  tone: fontScale === "medium" ? "primary" : "default",
                })}
                onClick={() => setFontScale("medium")}
              >
                中
              </button>
              <button
                type="button"
                className={buttonClassName({
                  size: "sm",
                  tone: fontScale === "large" ? "primary" : "default",
                })}
                onClick={() => setFontScale("large")}
              >
                大
              </button>
            </div>
            <button type="button" className={buttonClassName({ size: "sm" })}>
              ヘルプ
            </button>
            <button type="button" className={buttonClassName({ size: "sm" })}>
              マニュアル
            </button>
            <button type="button" className={buttonClassName({ size: "sm" })}>
              お問い合わせ
            </button>
            <button
              type="button"
              className={buttonClassName({ size: "sm", tone: "primary" })}
              disabled={logoutMutation.isPending}
              onClick={() => void handleLogout()}
            >
              {logoutMutation.isPending ? "ログアウト中..." : "ログアウト"}
            </button>
          </div>
        </header>

        <nav className={MENU_BAR_CLASS} aria-label="メインメニュー">
          <div className={MENU_BAR_LEFT_CLASS}>≡ メインメニュー</div>
          <div className={MENU_ITEMS_ROW_CLASS}>
            {topMenus.map((item) =>
              item.to === undefined ? (
                <span
                  key={item.label}
                  className={clsx(MENU_ITEM_CLASS, item.label === activeTopMenu && MENU_ITEM_ACTIVE_CLASS)}
                >
                  {item.label}
                  <span className="text-xs">▼</span>
                </span>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={clsx(MENU_ITEM_CLASS, item.label === activeTopMenu && MENU_ITEM_ACTIVE_CLASS)}
                >
                  {item.label}
                  <span className="text-xs">▼</span>
                </Link>
              ),
            )}
          </div>
        </nav>

        <div className="flex border-b border-b-slate-300 bg-gradient-to-b from-white to-slate-200 text-xs">
          <div className={SCREEN_ID_CELL_CLASS}>
            画面ID：<span className={MONO_CLASS}>{screenId}</span>
          </div>
          <div className={BREADCRUMBS_CLASS}>
            <Link to="/" className={TEXT_LINK_CLASS}>
              ホーム
            </Link>
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}:${index}`} className="flex items-center">
                <span className="px-1 text-slate-400">＞</span>
                {crumb.to === undefined || index === crumbs.length - 1 ? (
                  <span className={index === crumbs.length - 1 ? "font-bold text-black" : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.to} className={TEXT_LINK_CLASS}>
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className={BODY_GRID_CLASS}>
          <aside className={SIDE_MENU_CLASS}>
            <div className={SIDE_MENU_TITLE_CLASS}>メインメニュー</div>
            {sideGroups.map((group) => (
              <details
                key={group.title}
                open={group.defaultOpen || group.items.some((item) => item.label === activeSideItem)}
                className="border-b border-b-dotted border-b-slate-400"
              >
                <summary className={SIDE_GROUP_SUMMARY_CLASS}>
                  <span className="absolute left-1.5 text-xs">▼</span>
                  {group.title}
                </summary>
                <ul className={SIDE_GROUP_LIST_CLASS}>
                  {group.items.map((item) => (
                    <SideEntry key={item.label} entry={item} active={item.label === activeSideItem} />
                  ))}
                </ul>
              </details>
            ))}

            <div className={STATUS_BOX_CLASS}>
              <div className={STATUS_BOX_TITLE_CLASS}>システム稼働状況</div>
              <div className={STATUS_BOX_BODY_CLASS}>
                <div>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-700" />
                  <b>全体：</b>正常稼働中
                </div>
                <div className="mt-1 space-y-0.5 text-xs">
                  <div>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-700" />
                    Web/API
                  </div>
                  <div>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-700" />
                    リポジトリDB
                  </div>
                  <div>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-300" />
                    CIランナー <span className={MUTED_CLASS}>(縮退)</span>
                  </div>
                  <div>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-700" />
                    認証基盤
                  </div>
                </div>
                <div className="mt-1 text-right">
                  <span className={clsx(TEXT_LINK_CLASS, "text-xs")}>▶ 詳細はこちら</span>
                </div>
              </div>
            </div>

            <div className={IE_NOTICE_CLASS}>
              本システムは Internet Explorer 11 / Microsoft Edge IE モードでの動作を推奨します。
            </div>
          </aside>

          <main className={MAIN_COL_CLASS}>{children}</main>
          <aside className={RIGHT_COL_CLASS}>{rightColumn}</aside>
        </div>

        <footer className={FOOTER_CLASS}>
          <div>Copyright © 2026 JTC Corporation, All rights reserved.</div>
          <div className="justify-self-center">
            <span className={TEXT_LINK_CLASS}>サイトマップ</span>｜
            <span className={TEXT_LINK_CLASS}>プライバシーポリシー</span>｜
            <span className={TEXT_LINK_CLASS}>利用規約</span>｜
            <span className={TEXT_LINK_CLASS}>情報セキュリティ方針</span>｜
            <span className={TEXT_LINK_CLASS}>推奨環境</span>
          </div>
          <div className={clsx("justify-self-end", MONO_CLASS)}>{screenId} ／ Ver.5.2.1.0428</div>
        </footer>
      </div>
    </div>
  );
}

export function HelpDeskPanel(): JSX.Element {
  return (
    <div className={CONTACT_BOX_CLASS}>
      <div className={CONTACT_BOX_TITLE_CLASS}>▶ ヘルプデスク</div>
      ご利用に関するお問い合わせは下記までご連絡ください。
      <br />
      <span className={clsx("font-bold", MONO_CLASS)}>内線：9999</span>
      <br />
      <span className={clsx("text-xs", MONO_CLASS)}>外線：03-1234-5678</span>
      <br />
      <span className="text-xs">
        Mail：<span className={TEXT_LINK_CLASS}>helpdesk@jtc-github.example.co.jp</span>
      </span>
      <br />
      <span className="text-xs">対応時間：平日 9:00～17:30</span>
      <br />
      <span className={clsx("text-xs", MUTED_CLASS)}>（土日祝・年末年始は除く）</span>
    </div>
  );
}
