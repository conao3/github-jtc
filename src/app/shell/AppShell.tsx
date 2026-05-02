import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Dialog, DialogTrigger, Input, Label, Modal, ModalOverlay, SearchField } from "react-aria-components";
import { NavLink, useLocation } from "react-router-dom";

import { systemNotices, todoItems } from "../../data/mockData.ts";
import { JtcButton } from "../components/JtcButton.tsx";
import { JtcSelect } from "../components/JtcSelect.tsx";
import { Panel } from "../components/Panel.tsx";
import { StatusBadge } from "../components/StatusBadge.tsx";
import { type ColorTheme, useUiPreferences } from "../state.tsx";
import {
  APP_CHROME_CLASS,
  BRAND_BAR_CLASS,
  BRAND_TITLE_CLASS,
  CONTENT_GRID_CLASS,
  DIALOG_CLASS,
  DIALOG_OVERLAY_CLASS,
  FIELD_LABEL_CLASS,
  FONT_SCALE_CLASS,
  FOOTER_CLASS,
  FRAME_CLASS,
  MAIN_MENU_CLASS,
  MAIN_MENU_LINK_CLASS,
  MINI_LIST_CLASS,
  PANEL_HEADER_CLASS,
  RAIL_COLUMN_CLASS,
  SEARCH_FIELD_CLASS,
  SEARCH_INPUT_CLASS,
  SIDE_NAV_CLASS,
  SIDE_NAV_LINK_CLASS,
  THEME_CLASS,
  TOP_STATUS_CLASS,
} from "../styles.ts";

interface NavigationItem {
  readonly label: string;
  readonly path: string;
}

const topMenu: NavigationItem[] = [
  { label: "ポータル", path: "/" },
  { label: "リポジトリ管理", path: "/repositories" },
  { label: "変更申請", path: "/pull-requests" },
  { label: "課題管理", path: "/issues" },
  { label: "履歴監査", path: "/commits" },
  { label: "利用者情報", path: "/profile" },
];

const sideMenuSections = [
  {
    title: "開発管理メニュー",
    items: [
      { label: "ダッシュボード照会", path: "/" },
      { label: "担当リポジトリ一覧", path: "/repositories" },
      { label: "承認待ちプルリク", path: "/pull-requests" },
      { label: "未対応課題一覧", path: "/issues" },
    ],
  },
  {
    title: "構成管理メニュー",
    items: [
      { label: "コミット履歴照会", path: "/commits" },
      { label: "監査証跡ダウンロード", path: "/commits" },
      { label: "個人設定", path: "/profile" },
    ],
  },
];

function isActivePath(currentPath: string, targetPath: string): boolean {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(targetPath);
}

function formatReiwaDate(): string {
  const now = new Date();
  const reiwaYear = now.getFullYear() - 2018;

  return `令和${String(reiwaYear)}年${String(now.getMonth() + 1)}月${String(now.getDate())}日`;
}

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const { pathname } = useLocation();
  const { theme, fontScale, setTheme, setFontScale } = useUiPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={clsx(APP_CHROME_CLASS, FONT_SCALE_CLASS[fontScale])}>
      <div className={FRAME_CLASS}>
        <header className={TOP_STATUS_CLASS}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">統合ソースコード管理システム</span>
            <StatusBadge tone="ok">稼働中</StatusBadge>
            <span>稼働監視: 正常</span>
            <span>前回ログイン: 令和8年5月2日 17:42</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span>利用者ID: GIT-031482</span>
            <span>所属: 開発統括本部 第二システム部</span>
            <span>{formatReiwaDate()}</span>
          </div>
        </header>

        <div className={clsx(BRAND_BAR_CLASS, THEME_CLASS[theme].brand)}>
          <div className="flex min-w-0 flex-col">
            <div className="text-xs font-bold tracking-[0.28em] text-white/75">
              JTC CORPORATE ENGINEERING PORTAL
            </div>
            <div className={BRAND_TITLE_CLASS}>JTC GitHub</div>
            <div className="text-xs text-white/80">
              情報共有・変更申請・課題管理・監査証跡を一元管理する社内専用ポータル
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <SearchField
              aria-label="横断検索"
              value={searchQuery}
              onChange={setSearchQuery}
              className={SEARCH_FIELD_CLASS}
            >
              <Label className={FIELD_LABEL_CLASS}>横断検索</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input className={SEARCH_INPUT_CLASS} />
                <JtcButton>検索</JtcButton>
              </div>
            </SearchField>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <JtcSelect
                label="配色"
                selectedKey={theme}
                onSelectionChange={(key) => setTheme(key as ColorTheme)}
                options={[
                  { id: "navy", label: "標準(紺)" },
                  { id: "green", label: "緑系" },
                  { id: "brown", label: "茶系" },
                ]}
              />
              <div className="flex items-center gap-2">
                <span className={FIELD_LABEL_CLASS}>文字サイズ</span>
                <div className="flex gap-1">
                  <JtcButton
                    tone={fontScale === "small" ? "primary" : "default"}
                    onPress={() => setFontScale("small")}
                  >
                    小
                  </JtcButton>
                  <JtcButton
                    tone={fontScale === "medium" ? "primary" : "default"}
                    onPress={() => setFontScale("medium")}
                  >
                    中
                  </JtcButton>
                  <JtcButton
                    tone={fontScale === "large" ? "primary" : "default"}
                    onPress={() => setFontScale("large")}
                  >
                    大
                  </JtcButton>
                </div>
              </div>
              <DialogTrigger>
                <JtcButton>ご利用上の注意</JtcButton>
                <ModalOverlay className={DIALOG_OVERLAY_CLASS}>
                  <Modal className={DIALOG_CLASS}>
                    <Dialog>
                      <div className={PANEL_HEADER_CLASS}>
                        <h2 className="m-0 text-[1rem]">ご利用上の注意</h2>
                      </div>
                      <div className="space-y-3 p-4 text-sm leading-6">
                        <p>
                          本システムは PoC
                          版です。実データ連携、承認実行、差分表示、配布申請はモック表示です。
                        </p>
                        <p>
                          画面デザインは社内基幹システム様式を踏襲しており、情報量および申請様式を優先しています。
                        </p>
                        <p className="text-red-800">
                          Internet Explorer は非対応です。ただし、社内標準端末の表示密度を再現するため旧来風の
                          UI 表現を含みます。
                        </p>
                        <div className="flex justify-end">
                          <JtcButton slot="close" tone="primary">
                            閉じる
                          </JtcButton>
                        </div>
                      </div>
                    </Dialog>
                  </Modal>
                </ModalOverlay>
              </DialogTrigger>
            </div>
          </div>
        </div>

        <nav className={MAIN_MENU_CLASS} aria-label="横断メニュー">
          {topMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  MAIN_MENU_LINK_CLASS,
                  (isActive || isActivePath(pathname, item.path)) && THEME_CLASS[theme].mainNavActive,
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={CONTENT_GRID_CLASS}>
          <aside className={RAIL_COLUMN_CLASS}>
            {sideMenuSections.map((section) => (
              <Panel key={section.title} title={section.title}>
                <ul className={SIDE_NAV_CLASS}>
                  {section.items.map((item) => (
                    <li key={`${section.title}:${item.path}`}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          clsx(
                            SIDE_NAV_LINK_CLASS,
                            (isActive || isActivePath(pathname, item.path)) &&
                              THEME_CLASS[theme].sideNavActive,
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </aside>

          <main className="min-w-0">{children}</main>

          <aside className={RAIL_COLUMN_CLASS}>
            <Panel title="お知らせ" action={<StatusBadge tone="warn">必読</StatusBadge>}>
              <ul className={MINI_LIST_CLASS}>
                {systemNotices.map((notice) => (
                  <li key={notice.title}>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={notice.tone}>{notice.level}</StatusBadge>
                      <span>{notice.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">{notice.date}</div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="本日のToDo">
              <ul className={MINI_LIST_CLASS}>
                {todoItems.map((item) => (
                  <li key={item.title}>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">{item.owner}</div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="お問い合わせ">
              <div className="space-y-2 text-sm">
                <p>社内ヘルプデスク: 内線 8842</p>
                <p>構成管理室: scm-office@jtc.example.jp</p>
                <p>障害一次受付: 平日 08:30 - 19:00</p>
                <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">
                  障害時は件名先頭に【緊急】を付与してください。
                </p>
              </div>
            </Panel>
          </aside>
        </div>

        <footer className={FOOTER_CLASS}>
          <span>推奨環境: Microsoft Edge 最新版 / 画面解像度 1366x768 以上</span>
          <span>帳票出力時は社内標準 PDF ビューアをご利用ください。</span>
          <span>Copyright (C) JTC Information Systems Department. All Rights Reserved.</span>
        </footer>
      </div>
    </div>
  );
}
