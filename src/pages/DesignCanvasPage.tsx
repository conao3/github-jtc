import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { LoginScreen } from "./LoginPage.tsx";
import { DashboardScreen } from "./DashboardPage.tsx";
import { RepositoryCreateScreen } from "./RepositoryCreatePage.tsx";
import { RepositoriesScreen } from "./RepositoriesPage.tsx";
import { RepositoryDetailScreen } from "./RepositoryDetailPage.tsx";
import { CommitsScreen } from "./CommitsPage.tsx";
import { PullRequestDetailScreen } from "./PullRequestDetailPage.tsx";
import { PullRequestDiffScreen } from "./PullRequestDiffPage.tsx";
import { IssueDetailScreen } from "./IssueDetailPage.tsx";
import { ProfileScreen } from "./ProfilePage.tsx";
import {
  ARTBOARD_CARD_CLASS,
  ARTBOARD_FRAME_CLASS,
  BUTTON_BASE_CLASS,
  BUTTON_DEFAULT_CLASS,
  BUTTON_MD_CLASS,
  BUTTON_PRIMARY_CLASS,
  CANVAS_BG_CLASS,
  CANVAS_SECTION_CLASS,
  MONO_CLASS,
} from "../app/styles.ts";

interface ArtboardDefinition {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly width: number;
  readonly height: number;
  readonly render: () => JSX.Element;
}

interface SectionDefinition {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly artboards: ArtboardDefinition[];
}

const sections: SectionDefinition[] = [
  {
    id: "entry",
    title: "入口",
    subtitle: "ログインから入る最初の画面",
    artboards: [
      {
        id: "login",
        label: "① ログイン画面",
        route: "/login",
        width: 1280,
        height: 648,
        render: () => <LoginScreen />,
      },
    ],
  },
  {
    id: "portal",
    title: "ポータル",
    subtitle: "ログイン後のホーム画面（ダッシュボード）",
    artboards: [
      {
        id: "dashboard",
        label: "② ポータル画面（ダッシュボード）",
        route: "/",
        width: 1280,
        height: 1260,
        render: () => <DashboardScreen />,
      },
    ],
  },
  {
    id: "repo",
    title: "リポジトリ",
    subtitle: "ソースコード管理（登録申請／一覧／詳細／履歴）",
    artboards: [
      {
        id: "repo-create",
        label: "③-1 リポジトリ登録申請",
        route: "/repositories/new",
        width: 1280,
        height: 1258,
        render: () => <RepositoryCreateScreen />,
      },
      {
        id: "repo-list",
        label: "③-2 リポジトリ一覧",
        route: "/repositories",
        width: 1280,
        height: 1026,
        render: () => <RepositoriesScreen />,
      },
      {
        id: "repo-detail",
        label: "④ リポジトリ詳細（ファイルツリー）",
        route: "/repositories/payment-system-core",
        width: 1280,
        height: 1102,
        render: () => <RepositoryDetailScreen repoId="payment-system-core" />,
      },
      {
        id: "commits",
        label: "④-2 コミット履歴",
        route: "/commits",
        width: 1280,
        height: 968,
        render: () => <CommitsScreen />,
      },
    ],
  },
  {
    id: "pr-issue",
    title: "プルリク・課題",
    subtitle: "変更管理プロセスの中核",
    artboards: [
      {
        id: "pr-detail",
        label: "⑤-1 プルリクエスト詳細（承認フロー付き）",
        route: "/pull-requests/PR-2025-00089",
        width: 1280,
        height: 1321,
        render: () => <PullRequestDetailScreen prId="PR-2025-00089" />,
      },
      {
        id: "pr-diff",
        label: "⑤-2 PR差分表示（コードdiff）",
        route: "/pull-requests/PR-2025-00089/diff",
        width: 1280,
        height: 878,
        render: () => <PullRequestDiffScreen prId="PR-2025-00089" />,
      },
      {
        id: "issue-detail",
        label: "⑥ 課題（Issue）詳細",
        route: "/issues/ISS-2025-00125",
        width: 1280,
        height: 992,
        render: () => <IssueDetailScreen issueId="ISS-2025-00125" />,
      },
    ],
  },
  {
    id: "user",
    title: "ユーザー",
    subtitle: "社員プロフィール／権限管理",
    artboards: [
      {
        id: "profile",
        label: "⑦ ユーザープロフィール",
        route: "/profile",
        width: 1280,
        height: 955,
        render: () => <ProfileScreen />,
      },
    ],
  },
];

const artboardOrder = sections.flatMap((section) => section.artboards);

export default function DesignCanvasPage(): JSX.Element {
  const [zoom, setZoom] = useState(0.24);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedIndex = useMemo(
    () => artboardOrder.findIndex((artboard) => artboard.id === selectedId),
    [selectedId],
  );
  const selected = selectedIndex >= 0 ? artboardOrder[selectedIndex] : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (selected === null) {
        return;
      }

      if (event.key === "Escape") {
        setSelectedId(null);
      } else if (event.key === "ArrowRight") {
        setSelectedId(artboardOrder[(selectedIndex + 1) % artboardOrder.length]?.id ?? null);
      } else if (event.key === "ArrowLeft") {
        setSelectedId(
          artboardOrder[(selectedIndex - 1 + artboardOrder.length) % artboardOrder.length]?.id ?? null,
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, selectedIndex]);

  return (
    <div className={CANVAS_BG_CLASS}>
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 text-28 font-bold text-jtc-canvas-ink">JTC GitHub Design Canvas</h1>
            <p className="m-0 mt-1 text-sm text-jtc-canvas-soft">
              bundle で定義された 10
              画面を、実コンポーネントのまま一覧・拡大・ルート遷移できるキャンバスです。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
              onClick={() => setZoom((value) => Math.max(0.18, value - 0.02))}
            >
              －
            </button>
            <span className={clsx("min-w-jtc-72 text-center text-xs", MONO_CLASS)}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
              onClick={() => setZoom((value) => Math.min(0.34, value + 0.02))}
            >
              ＋
            </button>
            <button
              type="button"
              className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
              onClick={() => setZoom(0.24)}
            >
              リセット
            </button>
          </div>
        </div>

        {sections.map((section) => (
          <section key={section.id} className={CANVAS_SECTION_CLASS}>
            <div className="mb-4">
              <h2 className="m-0 text-xl font-bold text-jtc-canvas-ink">{section.title}</h2>
              <p className="m-0 mt-1 text-13 text-jtc-canvas-muted">{section.subtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.artboards.map((artboard) => {
                const scaledHeight = artboard.height * zoom;

                return (
                  <article key={artboard.id} className={ARTBOARD_CARD_CLASS}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-jtc-canvas-strong">{artboard.label}</div>
                        <div className={clsx("text-11 text-jtc-canvas-muted", MONO_CLASS)}>
                          {artboard.route}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Link
                          to={artboard.route}
                          className={clsx(
                            BUTTON_BASE_CLASS,
                            BUTTON_MD_CLASS,
                            BUTTON_PRIMARY_CLASS,
                            "no-underline",
                          )}
                        >
                          開く
                        </Link>
                        <button
                          type="button"
                          className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
                          onClick={() => setSelectedId(artboard.id)}
                        >
                          拡大
                        </button>
                      </div>
                    </div>

                    <div className={ARTBOARD_FRAME_CLASS} style={{ height: `${scaledHeight}px` }}>
                      <div
                        aria-hidden="true"
                        className="origin-top-left pointer-events-none"
                        style={{
                          width: `${artboard.width}px`,
                          transform: `scale(${zoom})`,
                          transformOrigin: "top left",
                        }}
                      >
                        {artboard.render()}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selected === null ? null : (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-jtc-overlay-72 p-6"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-jtc-92vh w-full overflow-hidden rounded-md border border-jtc-canvas-border-strong bg-jtc-f0eee9 shadow-jtc-overlay"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-b-jtc-canvas-border-soft bg-white/70 px-4 py-3">
              <div>
                <div className="font-bold text-jtc-canvas-ink">{selected.label}</div>
                <div className={clsx("text-xs text-jtc-canvas-muted", MONO_CLASS)}>{selected.route}</div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
                  onClick={() =>
                    setSelectedId(
                      artboardOrder[(selectedIndex - 1 + artboardOrder.length) % artboardOrder.length]?.id ??
                        null,
                    )
                  }
                >
                  ← 前へ
                </button>
                <button
                  type="button"
                  className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
                  onClick={() =>
                    setSelectedId(artboardOrder[(selectedIndex + 1) % artboardOrder.length]?.id ?? null)
                  }
                >
                  次へ →
                </button>
                <Link
                  to={selected.route}
                  className={clsx(BUTTON_BASE_CLASS, BUTTON_MD_CLASS, BUTTON_PRIMARY_CLASS, "no-underline")}
                >
                  実画面を開く
                </Link>
                <button
                  type="button"
                  className={clsx(BUTTON_BASE_CLASS, BUTTON_DEFAULT_CLASS, BUTTON_MD_CLASS)}
                  onClick={() => setSelectedId(null)}
                >
                  閉じる
                </button>
              </div>
            </div>

            <div className="max-h-jtc-preview overflow-auto bg-jtc-d8ddd9 p-4">
              <div className="w-full shadow-jtc-preview">{selected.render()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
