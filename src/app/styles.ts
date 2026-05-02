import clsx from "clsx";

import type { ColorTheme, FontScale } from "./state.tsx";

export const FONT_FAMILY_CLASS =
  "font-['MS_Gothic','MS_PGothic','Hiragino_Kaku_Gothic_ProN','Yu_Gothic_UI','Noto_Sans_JP',sans-serif]";

export const FONT_SCALE_CLASS: Record<FontScale, string> = {
  small: "text-[12px] leading-[1.35]",
  medium: "text-[14px] leading-[1.45]",
  large: "text-[16px] leading-[1.55]",
};

export const THEME_CLASS: Record<
  ColorTheme,
  {
    readonly brand: string;
    readonly mainNavActive: string;
    readonly sideNavActive: string;
    readonly primaryButton: string;
    readonly tabActive: string;
    readonly fileActive: string;
    readonly kpiValue: string;
  }
> = {
  navy: {
    brand: "border-b-2 border-b-[#081425] bg-gradient-to-b from-[#10243f] to-[#33577f]",
    mainNavActive: "bg-gradient-to-b from-[#28568a] to-[#12365a] text-white",
    sideNavActive: "border-[#3f6186] bg-gradient-to-b from-[#dbe8f4] to-[#a8c1db] font-bold",
    primaryButton: "border-[#1a4672] bg-gradient-to-b from-[#376da6] to-[#174067] text-white",
    tabActive:
      "data-[selected]:bg-gradient-to-b data-[selected]:from-[#2f608f] data-[selected]:to-[#163b61] data-[selected]:text-white",
    fileActive: "border-[#3c6287] bg-gradient-to-b from-[#dce9f6] to-[#b7cee4]",
    kpiValue: "text-[#10243f]",
  },
  green: {
    brand: "border-b-2 border-b-[#0f2516] bg-gradient-to-b from-[#1d3b27] to-[#4e7655]",
    mainNavActive: "bg-gradient-to-b from-[#407657] to-[#1f492f] text-white",
    sideNavActive: "border-[#44684f] bg-gradient-to-b from-[#dcecd9] to-[#b4d0b3] font-bold",
    primaryButton: "border-[#2c5d3c] bg-gradient-to-b from-[#4f8a60] to-[#285036] text-white",
    tabActive:
      "data-[selected]:bg-gradient-to-b data-[selected]:from-[#477f5a] data-[selected]:to-[#245036] data-[selected]:text-white",
    fileActive: "border-[#4f765a] bg-gradient-to-b from-[#dcebdf] to-[#bdd7c2]",
    kpiValue: "text-[#1d3b27]",
  },
  brown: {
    brand: "border-b-2 border-b-[#2d170b] bg-gradient-to-b from-[#4f311d] to-[#8b6244]",
    mainNavActive: "bg-gradient-to-b from-[#8f653f] to-[#5d3821] text-white",
    sideNavActive: "border-[#7b5638] bg-gradient-to-b from-[#f1e2d6] to-[#d9bea7] font-bold",
    primaryButton: "border-[#7b4f2e] bg-gradient-to-b from-[#aa7950] to-[#6d4325] text-white",
    tabActive:
      "data-[selected]:bg-gradient-to-b data-[selected]:from-[#9a7148] data-[selected]:to-[#6b4225] data-[selected]:text-white",
    fileActive: "border-[#886245] bg-gradient-to-b from-[#f2e4d6] to-[#d9c2ad]",
    kpiValue: "text-[#4f311d]",
  },
};

export const APP_CHROME_CLASS = clsx(
  FONT_FAMILY_CLASS,
  "min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0)),linear-gradient(90deg,rgba(16,36,63,0.06)_0,rgba(16,36,63,0.06)_1px,transparent_1px,transparent_24px),linear-gradient(#c8ced5,#b9c2cb)] p-3 text-[#17202d]",
);

export const FRAME_CLASS = clsx(
  "border border-[#445063]",
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.25))]",
  "shadow-[0_14px_32px_rgba(17,26,39,0.16)]",
);

export const TOP_STATUS_CLASS = clsx(
  "flex flex-wrap items-center justify-between gap-3 border-b border-[#d7dde5]",
  "bg-gradient-to-b from-[#f5f6f9] to-[#dde4eb] px-2.5 py-1.5 text-[12px]",
);

export const BRAND_BAR_CLASS = "flex flex-wrap justify-between gap-4 px-4 py-3.5";
export const BRAND_TITLE_CLASS =
  "mt-1 text-[2rem] font-bold tracking-[0.03em] text-white [text-shadow:0_1px_0_rgba(0,0,0,0.45)]";

export const MAIN_MENU_CLASS =
  "flex overflow-x-auto border-b border-[#445063] bg-gradient-to-b from-[#f0f3f7] to-[#d7dde4]";
export const MAIN_MENU_LINK_CLASS = clsx(
  "inline-flex min-w-44 items-center justify-center border-r border-[#a8b1bc]",
  "bg-gradient-to-b from-[#f9fbfd] to-[#d7dee7] px-3 py-2.5 font-bold text-[#203249]",
);

export const CONTENT_GRID_CLASS = "grid gap-3.5 p-3.5 xl:grid-cols-[16rem_minmax(0,1fr)_18rem]";
export const RAIL_COLUMN_CLASS = "flex flex-col gap-3";

export const PANEL_CLASS = clsx(
  "overflow-hidden border border-[#8892a0]",
  "bg-gradient-to-b from-white to-[#fbfbfc]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
);

export const PANEL_HEADER_CLASS = clsx(
  "flex items-center justify-between gap-3 border-b border-[#b6bec8]",
  "bg-gradient-to-b from-[#e5eaef] to-[#cfd8e1] px-2.5 py-2",
);
export const PANEL_TITLE_CLASS = "m-0 text-[1rem]";

export const PAGE_HEADER_CLASS =
  "flex flex-wrap items-start justify-between gap-3 border border-[#8892a0] bg-gradient-to-b from-white to-[#eef3f8] p-3";
export const PAGE_TITLE_CLASS = "m-0 text-[1.45rem] tracking-[0.02em]";
export const PAGE_SUMMARY_CLASS = "m-0 text-[0.95rem] text-[#4f5b6e]";
export const PAGE_ACTIONS_CLASS = "flex flex-wrap items-center gap-2";

export const BREADCRUMBS_CLASS = "m-0 flex flex-wrap items-center gap-1.5 p-0 text-[12px] text-[#4f5b6e]";
export const TEXT_LINK_CLASS = "text-[#0c4170] underline-offset-2 hover:underline";

export const SIDE_NAV_CLASS = "m-0 list-none space-y-1.5 p-0";
export const SIDE_NAV_LINK_CLASS = clsx(
  "block border border-[#c6ced8] bg-gradient-to-b from-[#fdfefe] to-[#e7edf3] px-2.5 py-2",
  "text-[#17202d]",
);

export const MINI_LIST_CLASS = "m-0 list-none space-y-2.5 p-0 text-[13px]";
export const BULLET_LIST_CLASS = "space-y-2 pl-[18px]";

export const FIELD_STACK_CLASS = "flex flex-col gap-1";
export const FIELD_LABEL_CLASS = "text-[12px] font-bold text-[#17202d]";
export const INPUT_CLASS = clsx(
  "min-h-[34px] border border-[#717f91] bg-gradient-to-b from-white to-[#eef2f6] px-2 py-1.5",
  "shadow-[inset_1px_1px_1px_rgba(0,0,0,0.06)] outline-none [font:inherit]",
);
export const FILTER_GRID_CLASS = "grid gap-3 md:grid-cols-3";
export const SEARCH_FIELD_CLASS = "flex min-w-[min(100%,26rem)] flex-col gap-1";
export const SEARCH_INPUT_CLASS = clsx(INPUT_CLASS, "min-w-[20rem]");
export const FILTER_INPUT_CLASS = clsx(INPUT_CLASS, "w-full");

export const BUTTON_BASE_CLASS = clsx(
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 border px-3 py-1.5 font-bold",
  "bg-gradient-to-b from-[#fffef7] to-[#dce3ec] text-[#17202d] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
  "[font:inherit]",
);
export const BUTTON_DANGER_CLASS = "border-[#7f1621] bg-gradient-to-b from-[#cf4652] to-[#971923] text-white";

export const SELECT_ROOT_CLASS = "flex min-w-[12rem] flex-col gap-1";
export const SELECT_BUTTON_CLASS = clsx(
  INPUT_CLASS,
  "flex items-center justify-between gap-3 px-2 text-left [font:inherit]",
);
export const POPOVER_CLASS = "border border-[#717f91] bg-white shadow-[0_8px_18px_rgba(17,26,39,0.22)]";
export const LISTBOX_CLASS = "max-h-72 overflow-auto p-1";
export const LISTBOX_ITEM_CLASS =
  "cursor-default rounded-none px-2 py-1.5 data-[focused]:bg-[#dce7f3] data-[selected]:bg-[#b9cee2]";

export const TABLE_CLASS = clsx(
  "w-full border-collapse text-[0.92rem]",
  "[&_td]:align-top [&_td]:border [&_td]:border-[#bcc5cf] [&_td]:px-2 [&_td]:py-[7px]",
  "[&_th]:align-top [&_th]:border [&_th]:border-[#bcc5cf] [&_th]:px-2 [&_th]:py-[7px] [&_th]:text-left",
  "[&_thead_th]:bg-gradient-to-b [&_thead_th]:from-[#edf1f5] [&_thead_th]:to-[#d7dfe8]",
  "[&_tbody_th]:bg-gradient-to-b [&_tbody_th]:from-[#edf1f5] [&_tbody_th]:to-[#d7dfe8]",
);
export const COMPACT_TABLE_CLASS = clsx(
  TABLE_CLASS,
  "[&_td]:px-1.5 [&_td]:py-1.5 [&_th]:px-1.5 [&_th]:py-1.5",
);

export const KPI_GRID_CLASS = "grid gap-3 md:grid-cols-2 xl:grid-cols-4";
export const KPI_CARD_CLASS =
  "border border-[#7d8a9c] bg-gradient-to-b from-[#fffdf1] to-[#eceef3] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";
export const KPI_LABEL_CLASS = "text-[12px] font-bold tracking-[0.08em] text-[#4f5b6e]";
export const KPI_NOTE_CLASS = "text-[12px] text-[#59677b]";

export const FILE_LIST_CLASS = "m-0 list-none space-y-1.5 p-0";
export const FILE_ROW_CLASS = clsx(
  "flex w-full justify-between gap-2 border border-[#cad1db]",
  "bg-gradient-to-b from-[#fcfcfd] to-[#edf1f5] px-2 py-2 text-left",
  "[font:inherit]",
);
export const CODE_VIEW_CLASS = clsx(
  "mt-3 overflow-auto border border-[#b5c0cb] bg-[#f8fafc] p-3 text-[12px] leading-[1.7]",
  "font-['MS_Gothic','MS_PGothic','Cascadia_Mono',monospace]",
);

export const TAB_LIST_CLASS = "flex flex-wrap gap-1";
export const TAB_CLASS = clsx(
  "border border-[#758392] bg-gradient-to-b from-[#f8fbfd] to-[#d7dee7] px-3 py-2",
  "[font:inherit]",
);
export const TAB_PANEL_CLASS = clsx(PANEL_CLASS, "p-3");

export const DIALOG_OVERLAY_CLASS =
  "fixed inset-0 flex items-center justify-center bg-[rgba(12,22,34,0.42)] p-5";
export const DIALOG_CLASS =
  "w-full max-w-[42rem] overflow-hidden border border-[#445063] bg-gradient-to-b from-white to-[#eef3f7] shadow-[0_18px_34px_rgba(17,26,39,0.28)]";

export const FOOTER_CLASS = clsx(
  "flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-[#445063]",
  "bg-gradient-to-b from-[#e6ebf0] to-[#d0d8e1] px-3 py-2 text-[12px]",
);

export const LOADING_CLASS =
  "border border-[#8892a0] bg-gradient-to-b from-[#fffef7] to-[#f1f4f8] px-6 py-10 text-center font-bold";
