import clsx from "clsx";

import type { FontScale } from "./state.tsx";

export const FONT_FAMILY_CLASS =
  "font-['MS_PGothic','MS_Gothic','Hiragino_Kaku_Gothic_Pro','Meiryo','Osaka',sans-serif]";
export const MONO_CLASS = "font-['MS_Gothic','Osaka-mono',monospace]";
export const MUTED_CLASS = "text-[#555]";
export const TEXT_LINK_CLASS =
  "text-[#0033aa] underline underline-offset-2 visited:text-[#5a2a8a] hover:bg-[#ffefa0]";

export const FONT_SCALE_CLASS: Record<FontScale, string> = {
  small: "text-11",
  medium: "text-xs",
  large: "text-13",
};

export const BODY_BG_CLASS = clsx(FONT_FAMILY_CLASS, "min-h-screen overflow-x-auto bg-[#e6e9ef] text-[#222]");
export const APP_FRAME_CLASS = "min-h-screen w-full border border-[#888] bg-[#e6e9ef]";

export const HEADER_ROW_CLASS = clsx(
  "grid min-h-[54px] grid-cols-[280px_minmax(0,1fr)_auto] items-center border-b border-b-[#888]",
  "bg-gradient-to-b from-white to-[#e8edf3] pr-2",
);
export const LOGO_CELL_CLASS = clsx(
  "flex h-[54px] flex-col justify-center border-r border-r-[#1a3e72] px-2.5 py-1.5 text-white",
  "bg-gradient-to-b from-[#3b6aa3] to-[#1a3e72]",
);
export const PRODUCT_NAME_CLASS =
  "text-lg font-bold tracking-[0.5px] text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.4)]";
export const PRODUCT_EDITION_CLASS = "mt-px text-10 text-[#d8e2f0]";
export const PRODUCT_SUBTITLE_CLASS =
  "mt-0.5 border-t border-dotted border-t-[#aac4e6] pt-0.5 text-11 font-bold text-white";
export const USER_INFO_CELL_CLASS = "px-2 text-11";
export const USER_INFO_TABLE_CLASS = clsx(
  "border-collapse [&_td]:align-top [&_td]:pr-1.5 [&_td]:pb-px",
  "[&_td_.lbl]:text-[#555] [&_td_.val]:font-bold",
);
export const HEADER_ACTIONS_CLASS = "flex items-center gap-1 text-11";
export const FONT_SWITCHER_CLASS = "mr-1.5 inline-flex items-center gap-1";

export const MENU_BAR_CLASS =
  "grid grid-cols-[280px_minmax(0,1fr)] border-b-2 border-b-[#555] border-t border-t-white bg-gradient-to-b from-[#3b6aa3] to-[#1a3e72]";
export const MENU_BAR_LEFT_CLASS =
  "border-r border-r-black bg-gradient-to-b from-[#16386b] to-[#0e2547] px-3 py-1.5 text-xs font-bold text-white";
export const MENU_ITEMS_ROW_CLASS = "flex";
export const MENU_ITEM_CLASS = clsx(
  "inline-flex items-center gap-1 border-l border-l-[rgba(0,0,0,0.2)] border-r border-r-[rgba(255,255,255,0.25)]",
  "px-[18px] py-1.5 text-xs font-bold text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.4)]",
  "hover:bg-gradient-to-b hover:from-[#5a8ac4] hover:to-[#2a5894]",
);
export const MENU_ITEM_ACTIVE_CLASS =
  "bg-gradient-to-b from-[#ffd968] to-[#d99a00] text-[#2a1500] [text-shadow:none]";

export const SCREEN_ID_CELL_CLASS = "bg-[#f0f3f7] px-2.5 py-[3px] text-[#555] border-r border-r-[#aab]";
export const BREADCRUMBS_CLASS = "flex flex-wrap items-center px-2.5 py-[3px]";

export const BODY_GRID_CLASS = "grid grid-cols-[180px_minmax(0,1fr)_240px]";
export const SIDE_MENU_CLASS =
  "border-r border-r-[#aab] bg-gradient-to-r from-[#f0f3f7] to-[#e2e8f0] pb-2 text-11";
export const SIDE_MENU_TITLE_CLASS =
  "bg-gradient-to-b from-[#1f4f8a] to-[#16386b] px-2 py-1 text-11 font-bold text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.4)]";
export const SIDE_GROUP_SUMMARY_CLASS =
  "relative list-none cursor-pointer bg-gradient-to-b from-[#e9eef5] to-[#d4dbe4] px-2 py-1 pl-[18px] text-11 font-bold text-[#16386b]";
export const SIDE_GROUP_LIST_CLASS = "m-0 list-none bg-white px-0 py-0.5";
export const SIDE_GROUP_ITEM_CLASS =
  "relative border-b border-b-dotted border-b-[#ddd] px-2 py-0.5 pl-[26px]";
export const SIDE_GROUP_ITEM_ACTIVE_CLASS = "bg-[#fff7c0] font-bold";
export const STATUS_BOX_CLASS = "mx-1.5 mt-2 border border-[#999] bg-white";
export const STATUS_BOX_TITLE_CLASS =
  "bg-gradient-to-b from-[#f9fbfd] to-[#d9e0ea] px-2 py-1 text-11 font-bold";
export const STATUS_BOX_BODY_CLASS = "px-2 py-1.5 text-10";
export const IE_NOTICE_CLASS =
  "mx-1.5 mt-2 border border-[#c8001a] bg-[#fff0c0] px-2 py-1 text-10 text-[#8e0014]";

export const MAIN_COL_CLASS = "min-w-0 bg-[#f7f8fb] p-2";
export const RIGHT_COL_CLASS = "border-l border-l-[#aab] bg-[#eef2f6] p-2";

export const FOOTER_CLASS = clsx(
  "grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-t-[#aab]",
  "bg-gradient-to-b from-[#f8fafc] to-[#dce3ec] px-2.5 py-1.5 text-10 text-[#555]",
);

export const WARN_LINE_CLASS = "mb-2 border border-[#d4a000] bg-[#fff0c0] px-2.5 py-1.5 text-11";

export const PANEL_CLASS =
  "mb-2 overflow-hidden border border-[#999] bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]";
export const PANEL_HEADER_CLASS = clsx(
  "flex items-center justify-between gap-2 border-b border-b-[#7c8b9d]",
  "bg-gradient-to-b from-[#e8edf4] to-[#c7d1df] px-2 py-1 text-11 font-bold text-[#10233f]",
);
export const PANEL_BODY_CLASS = "p-2";

export const BUTTON_BASE_CLASS = clsx(
  "inline-flex items-center justify-center font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] [font:inherit]",
);
export const BUTTON_DEFAULT_CLASS =
  "border border-[#888] bg-gradient-to-b from-[#fafafa] to-[#d6d6d6] text-[#222]";
export const BUTTON_PRIMARY_CLASS =
  "border-[#555] bg-gradient-to-b from-[#5a8ac4] to-[#2a5894] text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.35)]";
export const BUTTON_DANGER_CLASS =
  "border-[#7b2d2d] bg-gradient-to-b from-[#e07474] to-[#b64242] text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.3)]";
export const BUTTON_MD_CLASS = "min-h-[24px] px-3 py-1";
export const BUTTON_SM_CLASS = "min-h-[20px] px-2 py-0.5 text-10";
export const BUTTON_LG_CLASS = "min-h-[32px] px-6 py-1.5 text-13";
export const FORM_CONTROL_INVALID_CLASS = "border-[#c8001a] bg-[#fff7f7]";
export const FORM_ERROR_LIST_CLASS = "mt-1 space-y-0.5 text-10 text-[#8e0014]";

export const TABLE_CLASS = clsx(
  "w-full border-collapse text-11",
  "[&_td]:border [&_td]:border-[#c5c5c5] [&_td]:px-1.5 [&_td]:py-1 [&_td]:align-top",
  "[&_th]:border [&_th]:border-[#999] [&_th]:px-1.5 [&_th]:py-1 [&_th]:align-middle [&_th]:text-left",
  "[&_thead_th]:bg-gradient-to-b [&_thead_th]:from-[#d8dde6] [&_thead_th]:to-[#c5cdd9]",
  "[&_tbody_tr:nth-child(even)]:bg-[#f4f6fa] [&_tbody_tr:hover]:bg-[#fff7d0]",
);
export const TABS_ROW_CLASS = "flex flex-wrap gap-1 border-b border-b-[#c5c5c5] bg-[#eef2f6] px-2 pt-1";
export const TAB_CLASS = "border border-b-0 border-[#999] bg-[#e0e6ef] px-2.5 py-1 text-11 font-bold";
export const TAB_ACTIVE_CLASS = "bg-white";
export const TAB_BADGE_CLASS =
  "ml-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[#c8001a] px-1 text-10 text-white";

export const KPI_ROW_CLASS = "grid grid-cols-4 gap-2 p-2";
export const KPI_CARD_CLASS =
  "border border-[#aab] bg-gradient-to-b from-[#fffef7] to-[#eef2f7] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]";
export const KPI_LABEL_CLASS = "text-11 font-bold text-[#444]";
export const KPI_VALUE_CLASS = "mt-1 text-28 font-bold text-[#16386b]";
export const KPI_UNIT_CLASS = "ml-1 text-xs";
export const KPI_DELTA_CLASS = "mt-1 text-10";

export const STATUS_TAG_BASE_CLASS =
  "inline-flex min-w-[52px] items-center justify-center border px-1.5 py-px text-10 font-bold";
export const PRIORITY_TAG_BASE_CLASS =
  "inline-flex min-w-[22px] items-center justify-center border px-1 py-px text-10 font-bold";

export const FLOW_WRAP_CLASS = "flex flex-wrap gap-2 p-2";
export const FLOW_STEP_BASE_CLASS =
  "relative min-h-[124px] flex-1 basis-[152px] border p-2 text-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]";
export const FLOW_STEP_DONE_CLASS = "border-[#7aa07f] bg-gradient-to-b from-[#ecf8ee] to-[#d8ebdc]";
export const FLOW_STEP_CURRENT_CLASS = "border-[#d4a000] bg-gradient-to-b from-[#fff7cc] to-[#ffe59c]";
export const FLOW_STEP_FUTURE_CLASS = "border-[#aab] bg-gradient-to-b from-[#f8fafc] to-[#e1e6ee]";
export const FLOW_STEP_NO_CLASS = "text-10 font-bold text-[#555]";
export const FLOW_STEP_NAME_CLASS = "mt-1 font-bold text-[#16386b]";
export const FLOW_STEP_META_CLASS = "mt-1";

export const TODO_LIST_CLASS = "m-0 list-none p-0";
export const TODO_LIST_ITEM_CLASS =
  "flex items-center justify-between gap-2 border-b border-b-dotted border-b-[#bbb] px-1.5 py-1 text-11";
export const SHORTCUT_GRID_CLASS = "grid grid-cols-3 gap-1.5 p-2";
export const SHORTCUT_CLASS =
  "flex min-h-[54px] flex-col items-center justify-center gap-1 border border-[#9aa7b8] bg-gradient-to-b from-white to-[#dbe4f1] px-1 py-1 text-center text-10 font-bold";
export const SHORTCUT_ICON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded-sm border border-[#6c7c90] bg-gradient-to-b from-[#fdfefe] to-[#d7e1ef] text-11";
export const CONTACT_BOX_CLASS = "border border-[#c5c5c5] bg-[#fffce8] p-2 text-11";
export const CONTACT_BOX_TITLE_CLASS = "mb-1 font-bold";

export const PAGER_CLASS =
  "flex flex-wrap items-center gap-1 border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-2 py-1";
export const PAGER_LINK_CLASS = "border border-[#aaa] bg-white px-1.5 py-0.5 text-10";
export const PAGER_LINK_ACTIVE_CLASS = "bg-[#fff7c0] font-bold";

export const CANVAS_BG_CLASS =
  "min-h-screen bg-[linear-gradient(#f0eee9,#f0eee9),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[length:auto,24px_24px,24px_24px] bg-[position:0_0,0_0,0_0] p-6 text-[#2a251f]";
export const CANVAS_SECTION_CLASS =
  "mb-8 rounded-md border border-[rgba(60,50,40,0.2)] bg-[rgba(255,255,255,0.35)] p-4";
export const ARTBOARD_CARD_CLASS =
  "relative rounded-md border border-[rgba(60,50,40,0.2)] bg-white/80 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]";
export const ARTBOARD_FRAME_CLASS =
  "overflow-hidden rounded border border-[#9ca7b5] bg-[#e6e9ef] shadow-[0_1px_0_rgba(0,0,0,0.05)]";

export function buttonClassName(options?: {
  readonly tone?: "default" | "primary" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}): string {
  const { tone = "default", size = "md", className } = options ?? {};

  return clsx(
    BUTTON_BASE_CLASS,
    tone === "default" && BUTTON_DEFAULT_CLASS,
    size === "sm" && BUTTON_SM_CLASS,
    size === "md" && BUTTON_MD_CLASS,
    size === "lg" && BUTTON_LG_CLASS,
    tone === "primary" && BUTTON_PRIMARY_CLASS,
    tone === "danger" && BUTTON_DANGER_CLASS,
    className,
  );
}

export function statusTagClassName(
  tone:
    | "new"
    | "review"
    | "pending"
    | "inProgress"
    | "done"
    | "rejected"
    | "confirmed"
    | "required"
    | "warning",
): string {
  return clsx(
    STATUS_TAG_BASE_CLASS,
    tone === "new" && "border-[#49739d] bg-[#dce8f6] text-[#16386b]",
    tone === "review" && "border-[#d4a000] bg-[#fff0c0] text-[#8a5200]",
    tone === "pending" && "border-[#b18d24] bg-[#fff7d0] text-[#7a5e00]",
    tone === "inProgress" && "border-[#d08200] bg-[#ffe1a8] text-[#8b4600]",
    tone === "done" && "border-[#2a7f45] bg-[#dff3e5] text-[#176535]",
    tone === "rejected" && "border-[#a03333] bg-[#ffdede] text-[#8e0014]",
    tone === "confirmed" && "border-[#49739d] bg-[#e0ebf8] text-[#16386b]",
    tone === "required" && "border-[#8f8f8f] bg-[#efefef] text-[#555]",
    tone === "warning" && "border-[#d4a000] bg-[#fff0c0] text-[#8a5200]",
  );
}

export function priorityTagClassName(priority: "high" | "medium" | "low"): string {
  return clsx(
    PRIORITY_TAG_BASE_CLASS,
    priority === "high" && "border-[#a03333] bg-[#ffdede] text-[#8e0014]",
    priority === "medium" && "border-[#d08200] bg-[#ffe1a8] text-[#8b4600]",
    priority === "low" && "border-[#49739d] bg-[#dce8f6] text-[#16386b]",
  );
}

export function flowStepClassName(state: "done" | "current" | "future"): string {
  return clsx(
    FLOW_STEP_BASE_CLASS,
    state === "done" && FLOW_STEP_DONE_CLASS,
    state === "current" && FLOW_STEP_CURRENT_CLASS,
    state === "future" && FLOW_STEP_FUTURE_CLASS,
  );
}

export const LOADING_CLASS = clsx(
  FONT_FAMILY_CLASS,
  "flex min-h-screen w-full items-center justify-center border border-[#999] bg-gradient-to-b from-[#fffef7] to-[#eef2f7] px-6 py-10 text-center font-bold text-[#222]",
);
