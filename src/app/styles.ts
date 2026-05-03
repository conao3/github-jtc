import clsx from "clsx";

import type { FontScale } from "./state.tsx";

export const FONT_FAMILY_CLASS = "font-sans";
export const MONO_CLASS = "font-mono";
export const DATE_CELL_CLASS = clsx("text-center whitespace-nowrap", MONO_CLASS);
export const MUTED_CLASS = "text-slate-600";
export const TEXT_LINK_CLASS =
  "text-blue-700 underline underline-offset-2 visited:text-violet-700 hover:text-blue-900";

export const FONT_SCALE_CLASS: Record<FontScale, string> = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

export const BODY_BG_CLASS = clsx(FONT_FAMILY_CLASS, "h-screen overflow-hidden bg-slate-300 text-slate-900");
export const APP_FRAME_CLASS = "flex h-full w-full flex-col border border-slate-500 bg-slate-200 shadow-lg";

export const HEADER_ROW_CLASS = clsx(
  "flex min-h-14 items-stretch border-b border-slate-500",
  "bg-gradient-to-b from-white via-slate-100 to-blue-100",
);
export const LOGO_CELL_CLASS = clsx(
  "flex w-60 shrink-0 flex-col justify-center border-r border-blue-950 px-3 py-2 text-white shadow-inner xl:w-72",
  "bg-gradient-to-b from-sky-600 via-blue-800 to-blue-950",
);
export const PRODUCT_NAME_CLASS = "text-lg font-bold tracking-wide text-white drop-shadow-sm";
export const PRODUCT_EDITION_CLASS = "mt-0.5 text-xs text-blue-100";
export const PRODUCT_SUBTITLE_CLASS =
  "mt-1 border-t border-dashed border-blue-200 pt-1 text-xs font-semibold text-amber-100";
export const USER_INFO_CELL_CLASS = "min-w-0 flex-1 px-3 py-2 text-xs";
export const USER_INFO_TABLE_CLASS = "jtc-user-info-table";
export const HEADER_ACTIONS_CLASS =
  "flex shrink-0 flex-col items-end justify-center gap-1 px-2 py-1 text-xs whitespace-nowrap";
export const FONT_SWITCHER_CLASS = "flex items-center gap-1 whitespace-nowrap";

export const MENU_BAR_CLASS =
  "flex border-y border-t-white border-b-stone-700 bg-gradient-to-b from-sky-700 via-blue-800 to-blue-950";
export const MENU_BAR_LEFT_CLASS =
  "w-60 shrink-0 border-r border-black/50 bg-gradient-to-b from-blue-950 to-slate-950 px-3 py-1.5 text-xs font-bold text-white xl:w-72";
export const MENU_ITEMS_ROW_CLASS = "flex min-w-0 flex-1 overflow-x-auto whitespace-nowrap";
export const MENU_ITEM_CLASS = clsx(
  "inline-flex shrink-0 items-center gap-1 border-l border-black/20 border-r border-white/20 px-3 py-1.5 xl:px-4",
  "text-xs font-bold text-white hover:bg-blue-600 hover:text-amber-50",
);
export const MENU_ITEM_ACTIVE_CLASS =
  "bg-gradient-to-b from-amber-300 to-yellow-500 text-stone-900 shadow-inner";

export const SCREEN_ID_CELL_CLASS =
  "shrink-0 border-r border-slate-400 bg-slate-100 px-3 py-1 text-slate-700";
export const BREADCRUMBS_CLASS =
  "flex min-w-0 flex-1 items-center overflow-x-auto bg-gradient-to-b from-white to-slate-200 px-3 py-1 whitespace-nowrap";

export const BODY_GRID_CLASS = "flex min-h-0 flex-1 overflow-hidden";
export const SIDE_MENU_CLASS =
  "w-40 shrink-0 overflow-auto border-r border-slate-400 bg-gradient-to-r from-slate-100 to-slate-200 pb-2 text-xs xl:w-44";
export const SIDE_MENU_TITLE_CLASS =
  "bg-gradient-to-b from-blue-900 to-blue-950 px-2 py-1 text-xs font-bold text-white";
export const SIDE_GROUP_SUMMARY_CLASS =
  "relative list-none cursor-pointer bg-gradient-to-b from-slate-100 to-slate-300 px-2 py-1 pl-4 text-xs font-bold text-blue-950";
export const SIDE_GROUP_LIST_CLASS = "m-0 list-none bg-white px-0 py-0.5";
export const SIDE_GROUP_ITEM_CLASS = "relative border-b border-dotted border-slate-200 px-2 py-0.5 pl-6";
export const SIDE_GROUP_ITEM_ACTIVE_CLASS = "bg-amber-100 font-bold text-red-900";
export const STATUS_BOX_CLASS = "mx-2 mt-2 border border-slate-500 bg-white shadow-sm";
export const STATUS_BOX_TITLE_CLASS =
  "bg-gradient-to-b from-slate-100 to-slate-200 px-2 py-1 text-xs font-bold";
export const STATUS_BOX_BODY_CLASS = "px-2 py-1.5 text-xs";
export const IE_NOTICE_CLASS =
  "mx-2 mt-2 border border-red-800 bg-gradient-to-b from-yellow-100 to-amber-200 px-2 py-1 text-xs text-red-900";

export const MAIN_COL_CLASS = "min-w-0 flex-1 overflow-auto bg-slate-50 p-2";
export const RIGHT_COL_CLASS =
  "w-52 shrink-0 overflow-auto border-l border-slate-400 bg-gradient-to-b from-slate-100 to-slate-200 p-2 xl:w-60";

export const FOOTER_CLASS = clsx(
  "flex shrink-0 items-center justify-between gap-2 overflow-x-auto whitespace-nowrap border-t border-slate-400",
  "bg-gradient-to-b from-slate-100 to-slate-200 px-3 py-1.5 text-xs text-slate-700",
);

export const WARN_LINE_CLASS =
  "mb-2 border border-amber-600 bg-gradient-to-r from-yellow-100 to-amber-200 px-3 py-2 text-xs text-red-900";

export const PANEL_CLASS = "mb-2 overflow-hidden border border-slate-500 bg-white shadow-sm";
export const PANEL_HEADER_CLASS =
  "flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-400 bg-gradient-to-b from-slate-100 to-slate-200 px-2 py-1 text-xs font-bold text-slate-950 whitespace-nowrap";
export const PANEL_BODY_CLASS = "p-2";

export const BUTTON_BASE_CLASS = clsx(
  "inline-flex items-center justify-center font-bold shadow-sm",
  FONT_FAMILY_CLASS,
);
export const BUTTON_DEFAULT_CLASS =
  "border border-slate-500 bg-gradient-to-b from-white to-slate-300 text-slate-900 hover:from-yellow-50 hover:to-amber-200";
export const BUTTON_PRIMARY_CLASS =
  "border border-blue-950 bg-gradient-to-b from-sky-500 to-blue-900 text-white hover:from-sky-400 hover:to-blue-800";
export const BUTTON_DANGER_CLASS =
  "border border-red-950 bg-gradient-to-b from-red-500 to-red-900 text-white hover:from-red-400 hover:to-red-800";
export const BUTTON_MD_CLASS = "min-h-6 px-3 py-1 text-xs";
export const BUTTON_SM_CLASS = "min-h-5 px-2 py-0.5 text-xs";
export const BUTTON_LG_CLASS = "min-h-8 px-6 py-1.5 text-sm";
export const FORM_CONTROL_INVALID_CLASS = "border-red-700 bg-red-50";
export const FORM_ERROR_LIST_CLASS = "mt-1 space-y-0.5 text-xs text-red-800";

export const TABLE_CLASS = "jtc-data-table";
export const TABS_ROW_CLASS =
  "flex gap-1 overflow-x-auto border-b border-slate-400 bg-gradient-to-b from-slate-100 to-slate-200 px-2 pt-1 whitespace-nowrap";
export const TAB_CLASS =
  "shrink-0 border border-b-0 border-slate-500 bg-gradient-to-b from-slate-100 to-slate-300 px-3 py-1 text-xs font-bold";
export const TAB_ACTIVE_CLASS = "bg-white";
export const TAB_BADGE_CLASS =
  "ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-700 px-1 text-xs text-white";

export const KPI_ROW_CLASS = "grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-4";
export const KPI_CARD_CLASS =
  "border border-slate-400 bg-gradient-to-b from-white to-blue-50 px-3 py-2 shadow-sm";
export const KPI_LABEL_CLASS = "text-xs font-bold text-slate-800";
export const KPI_VALUE_CLASS = "mt-1 text-3xl font-bold text-blue-950";
export const KPI_UNIT_CLASS = "ml-1 text-sm";
export const KPI_DELTA_CLASS = "mt-1 text-xs text-slate-600";

export const STATUS_TAG_BASE_CLASS =
  "inline-flex min-w-12 items-center justify-center border px-1.5 py-px text-xs font-bold";

export const FLOW_WRAP_CLASS = "flex flex-wrap gap-2 p-2";
export const FLOW_STEP_BASE_CLASS = "relative min-h-32 flex-1 basis-40 border p-2 text-xs shadow-sm";
export const FLOW_STEP_DONE_CLASS = "border-green-300 bg-green-50";
export const FLOW_STEP_CURRENT_CLASS = "border-amber-400 bg-amber-100";
export const FLOW_STEP_FUTURE_CLASS = "border-slate-300 bg-slate-50";
export const FLOW_STEP_NO_CLASS = "text-xs font-bold text-slate-600";
export const FLOW_STEP_NAME_CLASS = "mt-1 font-bold text-blue-900";
export const FLOW_STEP_META_CLASS = "mt-1 text-slate-700";

export const TODO_LIST_CLASS = "m-0 list-none p-0";
export const TODO_LIST_ITEM_CLASS =
  "flex items-center justify-between gap-2 border-b border-dotted border-slate-300 px-2 py-1 text-xs";
export const SHORTCUT_GRID_CLASS = "grid grid-cols-3 gap-1.5 p-2";
export const SHORTCUT_CLASS =
  "flex min-h-14 flex-col items-center justify-center gap-1 border border-slate-400 bg-gradient-to-b from-white to-slate-100 px-1 py-1 text-center text-xs font-bold shadow-sm";
export const SHORTCUT_ICON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded-sm border border-slate-500 bg-white text-xs";
export const CONTACT_BOX_CLASS =
  "border border-amber-500 bg-gradient-to-b from-yellow-50 to-amber-100 p-2 text-xs";
export const CONTACT_BOX_TITLE_CLASS = "mb-1 font-bold";

export const PAGER_CLASS =
  "flex items-center gap-1 overflow-x-auto border-t border-slate-400 bg-gradient-to-b from-slate-50 to-slate-100 px-2 py-1 whitespace-nowrap";
export const PAGER_LINK_CLASS =
  "border border-slate-500 bg-gradient-to-b from-white to-slate-200 px-1.5 py-0.5 text-xs";
export const PAGER_LINK_ACTIVE_CLASS = "bg-gradient-to-b from-amber-200 to-yellow-400 font-bold";

export const CANVAS_BG_CLASS = "min-h-screen bg-stone-100 p-6 text-stone-800";
export const CANVAS_SECTION_CLASS = "mb-8 rounded-md border border-stone-300 bg-white/70 p-4";
export const ARTBOARD_CARD_CLASS = "relative rounded-md border border-stone-300 bg-white/90 p-3 shadow-lg";
export const ARTBOARD_FRAME_CLASS = "overflow-hidden rounded border border-slate-300 bg-slate-200 shadow-sm";

export function buttonClassName(options?: {
  readonly tone?: "default" | "primary" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}): string {
  const { tone = "default", size = "md", className } = options ?? {};

  return clsx(
    BUTTON_BASE_CLASS,
    tone === "default" && BUTTON_DEFAULT_CLASS,
    tone === "primary" && BUTTON_PRIMARY_CLASS,
    tone === "danger" && BUTTON_DANGER_CLASS,
    size === "sm" && BUTTON_SM_CLASS,
    size === "md" && BUTTON_MD_CLASS,
    size === "lg" && BUTTON_LG_CLASS,
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
    tone === "new" && "border-blue-500 bg-blue-100 text-blue-950",
    tone === "review" && "border-amber-500 bg-amber-200 text-amber-950",
    tone === "pending" && "border-yellow-500 bg-yellow-100 text-amber-950",
    tone === "inProgress" && "border-orange-500 bg-orange-200 text-orange-950",
    tone === "done" && "border-green-500 bg-green-200 text-green-950",
    tone === "rejected" && "border-red-500 bg-red-200 text-red-950",
    tone === "confirmed" && "border-sky-500 bg-sky-200 text-sky-950",
    tone === "required" && "border-slate-400 bg-slate-200 text-slate-800",
    tone === "warning" && "border-yellow-500 bg-yellow-200 text-yellow-950",
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
  "flex h-screen w-full items-center justify-center overflow-hidden border border-slate-300 bg-slate-50 px-6 py-10 text-center font-bold text-slate-900",
);
