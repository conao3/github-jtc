export interface RepositoryFile {
  readonly path: string;
  readonly kind: string;
  readonly size: string;
  readonly updatedAt: string;
  readonly preview: string;
}

export interface RepositorySummary {
  readonly id: string;
  readonly name: string;
  readonly team: string;
  readonly visibility: "社内限定" | "部門限定";
  readonly language: string;
  readonly updatedAt: string;
  readonly status: "運用中" | "監査中" | "更新準備";
  readonly openPrs: number;
  readonly openIssues: number;
  readonly compliance: "対応中" | "未対応" | "承認済";
  readonly defaultBranch: string;
  readonly reviewLead: string;
  readonly deploymentWindow: string;
  readonly description: string;
  readonly files: RepositoryFile[];
}

export interface PullRequestSummary {
  readonly id: string;
  readonly repositoryId: string;
  readonly title: string;
  readonly sourceBranch: string;
  readonly targetBranch: string;
  readonly author: string;
  readonly status: "承認待ち" | "差戻し" | "承認済";
  readonly priority: "高" | "中" | "低";
  readonly submittedAt: string;
  readonly changedFiles: number;
  readonly comments: number;
  readonly summary: string;
  readonly reviewPoints: string[];
  readonly workflow: Array<{
    readonly step: string;
    readonly owner: string;
    readonly status: "完了" | "対応中" | "未着手" | "却下";
  }>;
}

export interface IssueSummary {
  readonly id: string;
  readonly repositoryId: string;
  readonly title: string;
  readonly category: string;
  readonly status: "未対応" | "対応中" | "回答待ち" | "完了";
  readonly assignee: string;
  readonly priority: "S" | "A" | "B";
  readonly dueDate: string;
  readonly openedAt: string;
  readonly description: string;
  readonly history: Array<{
    readonly date: string;
    readonly actor: string;
    readonly action: string;
  }>;
}

export interface CommitSummary {
  readonly sha: string;
  readonly repositoryId: string;
  readonly message: string;
  readonly author: string;
  readonly date: string;
  readonly risk: "低" | "中" | "高";
  readonly ticket: string;
}

export const repositories: RepositorySummary[] = [
  {
    id: "portal-core",
    name: "portal-core",
    team: "第二システム部",
    visibility: "社内限定",
    language: "React / TypeScript",
    updatedAt: "令和8年5月3日 03:18",
    status: "運用中",
    openPrs: 3,
    openIssues: 7,
    compliance: "対応中",
    defaultBranch: "main",
    reviewLead: "高橋 主任",
    deploymentWindow: "毎週木曜 19:00-20:00",
    description: "社内ポータルおよび認証連携の共通フロントエンド。",
    files: [
      {
        path: "src/app/router.tsx",
        kind: "TSX",
        size: "12 KB",
        updatedAt: "令和8年5月2日 18:12",
        preview: `export function AppRoutes() {\n  return <Routes>{/* route definitions */}</Routes>;\n}`,
      },
      {
        path: "src/pages/DashboardPage.tsx",
        kind: "TSX",
        size: "18 KB",
        updatedAt: "令和8年5月2日 21:09",
        preview: `function DashboardPage() {\n  return <section>重点管理情報を表示</section>;\n}`,
      },
      {
        path: "docs/approval-flow.md",
        kind: "Markdown",
        size: "5 KB",
        updatedAt: "令和8年4月30日 09:44",
        preview: `# 承認フロー\n1. 開発担当申請\n2. 係長承認\n3. 品質保証確認`,
      },
    ],
  },
  {
    id: "workflow-gateway",
    name: "workflow-gateway",
    team: "業務改革室",
    visibility: "部門限定",
    language: "Bun / TypeScript",
    updatedAt: "令和8年5月2日 22:05",
    status: "監査中",
    openPrs: 5,
    openIssues: 4,
    compliance: "未対応",
    defaultBranch: "release",
    reviewLead: "伊藤 課長",
    deploymentWindow: "毎月第1土曜 08:00-09:30",
    description: "ワークフロー・稟議データを周辺システムに中継する API 群。",
    files: [
      {
        path: "src/gateway/approval.ts",
        kind: "TS",
        size: "10 KB",
        updatedAt: "令和8年5月2日 16:33",
        preview: `export async function submitApproval(payload: ApprovalPayload) {\n  return await client.post("/approvals", payload);\n}`,
      },
      {
        path: "src/gateway/audit.ts",
        kind: "TS",
        size: "8 KB",
        updatedAt: "令和8年4月27日 10:20",
        preview: `export function exportAuditCsv(from: string, to: string) {\n  return [from, to].join(",");\n}`,
      },
      {
        path: "config/prod.env",
        kind: "ENV",
        size: "2 KB",
        updatedAt: "令和8年4月29日 14:00",
        preview: `APP_MODE=production\nAPP_APPROVAL_ENDPOINT=https://internal.example.jp/api`,
      },
    ],
  },
  {
    id: "repo-audit-viewer",
    name: "repo-audit-viewer",
    team: "情報システム監査室",
    visibility: "社内限定",
    language: "React / Tailwind",
    updatedAt: "令和8年5月1日 19:44",
    status: "更新準備",
    openPrs: 1,
    openIssues: 2,
    compliance: "承認済",
    defaultBranch: "main",
    reviewLead: "中村 係長",
    deploymentWindow: "随時",
    description: "リポジトリ監査証跡の横断閲覧ツール。",
    files: [
      {
        path: "src/pages/CommitAuditPage.tsx",
        kind: "TSX",
        size: "16 KB",
        updatedAt: "令和8年5月1日 18:40",
        preview: `return <table>{/* commit history */}</table>;`,
      },
      {
        path: "src/components/AuditFilters.tsx",
        kind: "TSX",
        size: "7 KB",
        updatedAt: "令和8年4月25日 13:01",
        preview: `export function AuditFilters() {\n  return <form>...</form>;\n}`,
      },
      {
        path: "reports/monthly-template.xlsx",
        kind: "XLSX",
        size: "44 KB",
        updatedAt: "令和8年4月20日 09:01",
        preview: "バイナリファイルのためプレビュー対象外です。",
      },
    ],
  },
];

export const pullRequests: PullRequestSummary[] = [
  {
    id: "PR-24051",
    repositoryId: "portal-core",
    title: "ダッシュボード右ペインに緊急お知らせ枠を追加",
    sourceBranch: "feature/urgent-notice-panel",
    targetBranch: "main",
    author: "佐藤 美咲",
    status: "承認待ち",
    priority: "高",
    submittedAt: "令和8年5月3日 01:32",
    changedFiles: 8,
    comments: 5,
    summary: "緊急障害周知の即時掲示要件に伴い、ポータル右ペイン最上部に赤枠の通知領域を新設。",
    reviewPoints: ["既存 ToDo 枠との優先順位", "モバイル表示時の積み順", "監査ログ出力への影響"],
    workflow: [
      { step: "開発担当申請", owner: "佐藤 美咲", status: "完了" },
      { step: "課長一次承認", owner: "高橋 主任", status: "完了" },
      { step: "品質保証確認", owner: "品質保証G", status: "対応中" },
      { step: "構成管理承認", owner: "SCM 室", status: "未着手" },
    ],
  },
  {
    id: "PR-24033",
    repositoryId: "workflow-gateway",
    title: "承認経路 CSV の文字コードを Shift_JIS に変更",
    sourceBranch: "hotfix/shift-jis-export",
    targetBranch: "release",
    author: "鈴木 健介",
    status: "差戻し",
    priority: "中",
    submittedAt: "令和8年5月2日 14:05",
    changedFiles: 3,
    comments: 9,
    summary: "社内端末の Excel 互換要件対応。差戻し理由は監査用列不足。",
    reviewPoints: ["帳票列の欠落", "二重引用符の扱い", "既存利用部署への周知"],
    workflow: [
      { step: "開発担当申請", owner: "鈴木 健介", status: "完了" },
      { step: "課長一次承認", owner: "伊藤 課長", status: "却下" },
      { step: "品質保証確認", owner: "品質保証G", status: "未着手" },
      { step: "構成管理承認", owner: "SCM 室", status: "未着手" },
    ],
  },
  {
    id: "PR-24018",
    repositoryId: "repo-audit-viewer",
    title: "監査画面に月次集計タブを追加",
    sourceBranch: "feature/monthly-summary",
    targetBranch: "main",
    author: "山田 玲子",
    status: "承認済",
    priority: "低",
    submittedAt: "令和8年4月30日 19:28",
    changedFiles: 11,
    comments: 2,
    summary: "月次監査報告に必要な件数・差戻し率を表形式で追加。",
    reviewPoints: ["印刷レイアウト", "CSV 出力整合", "旧画面との数値一致"],
    workflow: [
      { step: "開発担当申請", owner: "山田 玲子", status: "完了" },
      { step: "課長一次承認", owner: "中村 係長", status: "完了" },
      { step: "品質保証確認", owner: "品質保証G", status: "完了" },
      { step: "構成管理承認", owner: "SCM 室", status: "完了" },
    ],
  },
];

export const issues: IssueSummary[] = [
  {
    id: "ISS-1182",
    repositoryId: "portal-core",
    title: "前回ログイン日時が所属切替後に更新されない",
    category: "表示不具合",
    status: "対応中",
    assignee: "井上 翼",
    priority: "A",
    dueDate: "令和8年5月7日",
    openedAt: "令和8年5月1日 09:15",
    description: "人事マスタ反映直後の利用者で、トップバーの前回ログイン日時が旧所属の値のままになる。",
    history: [
      { date: "令和8年5月1日 09:15", actor: "運用窓口", action: "起票" },
      { date: "令和8年5月1日 11:20", actor: "井上 翼", action: "調査着手" },
      { date: "令和8年5月2日 17:40", actor: "人事連携班", action: "再現条件追記" },
    ],
  },
  {
    id: "ISS-1179",
    repositoryId: "workflow-gateway",
    title: "承認経路 CSV 出力時に監査区分列が欠落",
    category: "帳票不備",
    status: "未対応",
    assignee: "鈴木 健介",
    priority: "S",
    dueDate: "令和8年5月4日",
    openedAt: "令和8年5月2日 13:30",
    description: "監査室向けの月次提出帳票に必要な監査区分列が出力対象外。",
    history: [
      { date: "令和8年5月2日 13:30", actor: "監査室", action: "起票" },
      { date: "令和8年5月2日 14:10", actor: "伊藤 課長", action: "優先度 S 指定" },
    ],
  },
  {
    id: "ISS-1168",
    repositoryId: "repo-audit-viewer",
    title: "月次集計で 0 件の担当者が非表示になる",
    category: "集計仕様",
    status: "回答待ち",
    assignee: "山田 玲子",
    priority: "B",
    dueDate: "令和8年5月9日",
    openedAt: "令和8年4月29日 16:12",
    description: "監査報告上は 0 件でも対象者一覧に残したい要望。",
    history: [
      { date: "令和8年4月29日 16:12", actor: "監査室", action: "起票" },
      { date: "令和8年4月30日 10:00", actor: "山田 玲子", action: "仕様確認依頼" },
    ],
  },
];

export const commits: CommitSummary[] = [
  {
    sha: "4f9bd30",
    repositoryId: "portal-core",
    message: "feat: add urgent notice strip to dashboard shell",
    author: "佐藤 美咲",
    date: "令和8年5月3日 00:54",
    risk: "中",
    ticket: "PR-24051",
  },
  {
    sha: "ce119e2",
    repositoryId: "portal-core",
    message: "fix: normalize branch summary card spacing",
    author: "井上 翼",
    date: "令和8年5月2日 20:12",
    risk: "低",
    ticket: "ISS-1182",
  },
  {
    sha: "d82a1f4",
    repositoryId: "workflow-gateway",
    message: "refactor: split approval export serializer",
    author: "鈴木 健介",
    date: "令和8年5月2日 13:11",
    risk: "高",
    ticket: "ISS-1179",
  },
  {
    sha: "819fa08",
    repositoryId: "repo-audit-viewer",
    message: "feat: add monthly summary tab",
    author: "山田 玲子",
    date: "令和8年4月30日 18:02",
    risk: "低",
    ticket: "PR-24018",
  },
  {
    sha: "ab414f9",
    repositoryId: "workflow-gateway",
    message: "chore: update release checklist wording",
    author: "伊藤 課長",
    date: "令和8年4月30日 08:22",
    risk: "低",
    ticket: "OPS-902",
  },
];

export const systemNotices = [
  {
    level: "重要",
    tone: "danger" as const,
    title: "5/7(水) 19:00 より承認系サーバ保守",
    date: "令和8年5月3日",
  },
  { level: "周知", tone: "info" as const, title: "監査 CSV の提出締切は 5/10 17:00", date: "令和8年5月2日" },
  { level: "更新", tone: "ok" as const, title: "構成管理手順書 第4版を掲示板へ掲載", date: "令和8年5月1日" },
];

export const todoItems = [
  { status: "承認待ち", tone: "warn" as const, title: "PR-24051 品質保証確認", owner: "品質保証G" },
  { status: "未対応", tone: "danger" as const, title: "ISS-1179 監査区分列欠落", owner: "鈴木 健介" },
  { status: "本日", tone: "info" as const, title: "月次監査帳票ダウンロード", owner: "情報システム監査室" },
];

export const profile = {
  userId: "GIT-031482",
  name: "田中 一郎",
  department: "開発統括本部 第二システム部",
  role: "主任",
  mail: "ichiro.tanaka@jtc.example.jp",
  extension: "8842",
  permissions: [
    { area: "リポジトリ参照", level: "全社" },
    { area: "承認ワークフロー", level: "一次承認者" },
    { area: "監査証跡出力", level: "所属部門" },
    { area: "構成変更申請", level: "申請可" },
  ],
};

export const dashboardMetrics = [
  { label: "管理対象リポジトリ", value: "27 件", note: "前月比 +2" },
  { label: "承認待ちプルリク", value: "9 件", note: "高優先度 2 件" },
  { label: "未対応課題", value: "13 件", note: "期限超過 3 件" },
  { label: "本日配布予定", value: "4 件", note: "夜間帯 2 件" },
];

export function getRepositoryById(repoId: string): RepositorySummary | undefined {
  return repositories.find((repository) => repository.id === repoId);
}

export function getPullRequestById(prId: string): PullRequestSummary | undefined {
  return pullRequests.find((pullRequest) => pullRequest.id === prId);
}

export function getIssueById(issueId: string): IssueSummary | undefined {
  return issues.find((issue) => issue.id === issueId);
}
