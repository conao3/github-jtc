import clsx from "clsx";

import type { FontScale } from "./state.tsx";

export const FONT_FAMILY_CLASS = "font-jtc-ui";
export const MONO_CLASS = "font-jtc-mono";
export const MUTED_CLASS = "text-jtc-555";
export const TEXT_LINK_CLASS =
  "text-jtc-0033aa underline underline-offset-2 visited:text-jtc-5a2a8a hover:bg-jtc-ffefa0";

export const FONT_SCALE_CLASS: Record<FontScale, string> = {
  small: "text-11",
  medium: "text-xs",
  large: "text-13",
};

export const BODY_BG_CLASS = clsx(FONT_FAMILY_CLASS, "h-screen overflow-hidden bg-jtc-e6e9ef text-jtc-222");
export const APP_FRAME_CLASS = "flex h-full w-full flex-col border border-jtc-888 bg-jtc-e6e9ef";

export const HEADER_ROW_CLASS = clsx(
  "grid min-h-jtc-54 grid-cols-jtc-header items-center border-b border-b-jtc-888",
  "bg-gradient-to-b from-white to-jtc-e8edf3 pr-2",
);
export const LOGO_CELL_CLASS = clsx(
  "flex h-jtc-54 flex-col justify-center border-r border-r-jtc-1a3e72 px-2.5 py-1.5 text-white",
  "bg-gradient-to-b from-jtc-3b6aa3 to-jtc-1a3e72",
);
export const PRODUCT_NAME_CLASS = "text-lg font-bold tracking-jtc-half text-white text-shadow-jtc-40";
export const PRODUCT_EDITION_CLASS = "mt-px text-10 text-jtc-d8e2f0";
export const PRODUCT_SUBTITLE_CLASS =
  "mt-0.5 border-t border-dotted border-t-jtc-aac4e6 pt-0.5 text-11 font-bold text-white";
export const USER_INFO_CELL_CLASS = "px-2 text-11";
export const USER_INFO_TABLE_CLASS = "jtc-user-info-table";
export const HEADER_ACTIONS_CLASS = "flex items-center gap-1 text-11";
export const FONT_SWITCHER_CLASS = "mr-1.5 inline-flex items-center gap-1";

export const MENU_BAR_CLASS =
  "grid grid-cols-jtc-menu border-b-2 border-b-jtc-555 border-t border-t-white bg-gradient-to-b from-jtc-3b6aa3 to-jtc-1a3e72";
export const MENU_BAR_LEFT_CLASS =
  "border-r border-r-black bg-gradient-to-b from-jtc-16386b to-jtc-0e2547 px-3 py-1.5 text-xs font-bold text-white";
export const MENU_ITEMS_ROW_CLASS = "flex";
export const MENU_ITEM_CLASS = clsx(
  "inline-flex items-center gap-1 border-l border-l-jtc-black-20 border-r border-r-jtc-white-25",
  "px-jtc-18 py-1.5 text-xs font-bold text-white text-shadow-jtc-40",
  "hover:bg-gradient-to-b hover:from-jtc-5a8ac4 hover:to-jtc-2a5894",
);
export const MENU_ITEM_ACTIVE_CLASS =
  "bg-gradient-to-b from-jtc-ffd968 to-jtc-d99a00 text-jtc-2a1500 text-shadow-none";

export const SCREEN_ID_CELL_CLASS = "bg-jtc-f0f3f7 px-2.5 py-jtc-3 text-jtc-555 border-r border-r-jtc-aab";
export const BREADCRUMBS_CLASS = "flex flex-wrap items-center px-2.5 py-jtc-3";

export const BODY_GRID_CLASS = "grid min-h-0 flex-1 grid-cols-jtc-body overflow-auto";
export const SIDE_MENU_CLASS =
  "border-r border-r-jtc-aab bg-gradient-to-r from-jtc-f0f3f7 to-jtc-e2e8f0 pb-2 text-11";
export const SIDE_MENU_TITLE_CLASS =
  "bg-gradient-to-b from-jtc-1f4f8a to-jtc-16386b px-2 py-1 text-11 font-bold text-white text-shadow-jtc-40";
export const SIDE_GROUP_SUMMARY_CLASS =
  "relative list-none cursor-pointer bg-gradient-to-b from-jtc-e9eef5 to-jtc-d4dbe4 px-2 py-1 pl-jtc-18 text-11 font-bold text-jtc-16386b";
export const SIDE_GROUP_LIST_CLASS = "m-0 list-none bg-white px-0 py-0.5";
export const SIDE_GROUP_ITEM_CLASS =
  "relative border-b border-b-dotted border-b-jtc-ddd px-2 py-0.5 pl-jtc-26";
export const SIDE_GROUP_ITEM_ACTIVE_CLASS = "bg-jtc-fff7c0 font-bold";
export const STATUS_BOX_CLASS = "mx-1.5 mt-2 border border-jtc-999 bg-white";
export const STATUS_BOX_TITLE_CLASS =
  "bg-gradient-to-b from-jtc-f9fbfd to-jtc-d9e0ea px-2 py-1 text-11 font-bold";
export const STATUS_BOX_BODY_CLASS = "px-2 py-1.5 text-10";
export const IE_NOTICE_CLASS =
  "mx-1.5 mt-2 border border-jtc-c8001a bg-jtc-fff0c0 px-2 py-1 text-10 text-jtc-8e0014";

export const MAIN_COL_CLASS = "min-w-0 bg-jtc-f7f8fb p-2";
export const RIGHT_COL_CLASS = "border-l border-l-jtc-aab bg-jtc-eef2f6 p-2";

export const FOOTER_CLASS = clsx(
  "grid grid-cols-jtc-footer items-center gap-2 border-t border-t-jtc-aab",
  "bg-gradient-to-b from-jtc-f8fafc to-jtc-dce3ec px-2.5 py-1.5 text-10 text-jtc-555",
);

export const WARN_LINE_CLASS = "mb-2 border border-jtc-d4a000 bg-jtc-fff0c0 px-2.5 py-1.5 text-11";

export const PANEL_CLASS = "mb-2 overflow-hidden border border-jtc-999 bg-white shadow-jtc-line";
export const PANEL_HEADER_CLASS = clsx(
  "flex items-center justify-between gap-2 border-b border-b-jtc-7c8b9d",
  "bg-gradient-to-b from-jtc-e8edf4 to-jtc-c7d1df px-2 py-1 text-11 font-bold text-jtc-10233f",
);
export const PANEL_BODY_CLASS = "p-2";

export const BUTTON_BASE_CLASS = clsx(
  "inline-flex items-center justify-center font-bold shadow-jtc-inset font-inherit",
);
export const BUTTON_DEFAULT_CLASS =
  "border border-jtc-888 bg-gradient-to-b from-jtc-fafafa to-jtc-d6d6d6 text-jtc-222";
export const BUTTON_PRIMARY_CLASS =
  "border-jtc-555 bg-gradient-to-b from-jtc-5a8ac4 to-jtc-2a5894 text-white text-shadow-jtc-35";
export const BUTTON_DANGER_CLASS =
  "border-jtc-7b2d2d bg-gradient-to-b from-jtc-e07474 to-jtc-b64242 text-white text-shadow-jtc-30";
export const BUTTON_MD_CLASS = "min-h-jtc-24 px-3 py-1";
export const BUTTON_SM_CLASS = "min-h-jtc-20 px-2 py-0.5 text-10";
export const BUTTON_LG_CLASS = "min-h-jtc-32 px-6 py-1.5 text-13";
export const FORM_CONTROL_INVALID_CLASS = "border-jtc-c8001a bg-jtc-fff7f7";
export const FORM_ERROR_LIST_CLASS = "mt-1 space-y-0.5 text-10 text-jtc-8e0014";

export const TABLE_CLASS = "jtc-data-table";
export const TABS_ROW_CLASS = "flex flex-wrap gap-1 border-b border-b-jtc-c5c5c5 bg-jtc-eef2f6 px-2 pt-1";
export const TAB_CLASS = "border border-b-0 border-jtc-999 bg-jtc-e0e6ef px-2.5 py-1 text-11 font-bold";
export const TAB_ACTIVE_CLASS = "bg-white";
export const TAB_BADGE_CLASS =
  "ml-1 inline-flex min-w-jtc-16 items-center justify-center rounded-full bg-jtc-c8001a px-1 text-10 text-white";

export const KPI_ROW_CLASS = "grid grid-cols-4 gap-2 p-2";
export const KPI_CARD_CLASS =
  "border border-jtc-aab bg-gradient-to-b from-jtc-fffef7 to-jtc-eef2f7 px-2.5 py-2 shadow-jtc-inset";
export const KPI_LABEL_CLASS = "text-11 font-bold text-jtc-444";
export const KPI_VALUE_CLASS = "mt-1 text-28 font-bold text-jtc-16386b";
export const KPI_UNIT_CLASS = "ml-1 text-xs";
export const KPI_DELTA_CLASS = "mt-1 text-10";

export const STATUS_TAG_BASE_CLASS =
  "inline-flex min-w-jtc-52 items-center justify-center border px-1.5 py-px text-10 font-bold";
export const PRIORITY_TAG_BASE_CLASS =
  "inline-flex min-w-jtc-22 items-center justify-center border px-1 py-px text-10 font-bold";

export const FLOW_WRAP_CLASS = "flex flex-wrap gap-2 p-2";
export const FLOW_STEP_BASE_CLASS =
  "relative min-h-jtc-124 flex-1 basis-jtc-152 border p-2 text-11 shadow-jtc-inset";
export const FLOW_STEP_DONE_CLASS = "border-jtc-7aa07f bg-gradient-to-b from-jtc-ecf8ee to-jtc-d8ebdc";
export const FLOW_STEP_CURRENT_CLASS = "border-jtc-d4a000 bg-gradient-to-b from-jtc-fff7cc to-jtc-ffe59c";
export const FLOW_STEP_FUTURE_CLASS = "border-jtc-aab bg-gradient-to-b from-jtc-f8fafc to-jtc-e1e6ee";
export const FLOW_STEP_NO_CLASS = "text-10 font-bold text-jtc-555";
export const FLOW_STEP_NAME_CLASS = "mt-1 font-bold text-jtc-16386b";
export const FLOW_STEP_META_CLASS = "mt-1";

export const TODO_LIST_CLASS = "m-0 list-none p-0";
export const TODO_LIST_ITEM_CLASS =
  "flex items-center justify-between gap-2 border-b border-b-dotted border-b-jtc-bbb px-1.5 py-1 text-11";
export const SHORTCUT_GRID_CLASS = "grid grid-cols-3 gap-1.5 p-2";
export const SHORTCUT_CLASS =
  "flex min-h-jtc-54 flex-col items-center justify-center gap-1 border border-jtc-9aa7b8 bg-gradient-to-b from-white to-jtc-dbe4f1 px-1 py-1 text-center text-10 font-bold";
export const SHORTCUT_ICON_CLASS =
  "flex h-6 w-6 items-center justify-center rounded-sm border border-jtc-6c7c90 bg-gradient-to-b from-jtc-fdfefe to-jtc-d7e1ef text-11";
export const CONTACT_BOX_CLASS = "border border-jtc-c5c5c5 bg-jtc-fffce8 p-2 text-11";
export const CONTACT_BOX_TITLE_CLASS = "mb-1 font-bold";

export const PAGER_CLASS =
  "flex flex-wrap items-center gap-1 border-t border-t-jtc-c5c5c5 bg-jtc-f4f6fa px-2 py-1";
export const PAGER_LINK_CLASS = "border border-jtc-aaa bg-white px-1.5 py-0.5 text-10";
export const PAGER_LINK_ACTIVE_CLASS = "bg-jtc-fff7c0 font-bold";

export const CANVAS_BG_CLASS = "min-h-screen bg-jtc-canvas-grid p-6 text-jtc-2a251f";
export const CANVAS_SECTION_CLASS = "mb-8 rounded-md border border-jtc-canvas-border bg-jtc-white-35 p-4";
export const ARTBOARD_CARD_CLASS =
  "relative rounded-md border border-jtc-canvas-border bg-white/80 p-3 shadow-jtc-artboard";
export const ARTBOARD_FRAME_CLASS =
  "overflow-hidden rounded border border-jtc-9ca7b5 bg-jtc-e6e9ef shadow-jtc-line";

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
    tone === "new" && "border-jtc-49739d bg-jtc-dce8f6 text-jtc-16386b",
    tone === "review" && "border-jtc-d4a000 bg-jtc-fff0c0 text-jtc-8a5200",
    tone === "pending" && "border-jtc-b18d24 bg-jtc-fff7d0 text-jtc-7a5e00",
    tone === "inProgress" && "border-jtc-d08200 bg-jtc-ffe1a8 text-jtc-8b4600",
    tone === "done" && "border-jtc-2a7f45 bg-jtc-dff3e5 text-jtc-176535",
    tone === "rejected" && "border-jtc-a03333 bg-jtc-ffdede text-jtc-8e0014",
    tone === "confirmed" && "border-jtc-49739d bg-jtc-e0ebf8 text-jtc-16386b",
    tone === "required" && "border-jtc-8f8f8f bg-jtc-efefef text-jtc-555",
    tone === "warning" && "border-jtc-d4a000 bg-jtc-fff0c0 text-jtc-8a5200",
  );
}

export function priorityTagClassName(priority: "high" | "medium" | "low"): string {
  return clsx(
    PRIORITY_TAG_BASE_CLASS,
    priority === "high" && "border-jtc-a03333 bg-jtc-ffdede text-jtc-8e0014",
    priority === "medium" && "border-jtc-d08200 bg-jtc-ffe1a8 text-jtc-8b4600",
    priority === "low" && "border-jtc-49739d bg-jtc-dce8f6 text-jtc-16386b",
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
  "flex h-screen w-full items-center justify-center overflow-hidden border border-jtc-999 bg-gradient-to-b from-jtc-fffef7 to-jtc-eef2f7 px-6 py-10 text-center font-bold text-jtc-222",
);
