import clsx from "clsx";
import { useState } from "react";

import { MUTED_CLASS, PAGER_CLASS, PAGER_LINK_ACTIVE_CLASS, PAGER_LINK_CLASS } from "../styles.ts";

interface CursorPagerProps {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly visibleCount: number;
  readonly totalCount?: number;
  readonly summary?: string;
  readonly hasNextPage: boolean;
  readonly isLoading?: boolean;
  readonly onFirstPage: () => void;
  readonly onPreviousPage: () => void;
  readonly onNextPage: () => void;
}

export function useCursorPagerState(): {
  readonly currentCursor: string | null;
  readonly currentPage: number;
  readonly goToFirstPage: () => void;
  readonly goToNextPage: (endCursor: string | null | undefined) => void;
  readonly goToPreviousPage: () => void;
  readonly resetPager: () => void;
} {
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const currentCursor = cursorHistory[currentPage - 1] ?? null;

  function resetPager(): void {
    setCursorHistory([null]);
    setCurrentPage(1);
  }

  function goToFirstPage(): void {
    setCurrentPage(1);
  }

  function goToPreviousPage(): void {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  }

  function goToNextPage(endCursor: string | null | undefined): void {
    if (endCursor === null || endCursor === undefined) {
      return;
    }

    setCursorHistory((previous) => {
      if (previous[currentPage] === endCursor) {
        return previous;
      }

      return [...previous.slice(0, currentPage), endCursor];
    });
    setCurrentPage((previous) => previous + 1);
  }

  return {
    currentCursor,
    currentPage,
    goToFirstPage,
    goToNextPage,
    goToPreviousPage,
    resetPager,
  };
}

export function CursorPager({
  currentPage,
  pageSize,
  visibleCount,
  totalCount,
  summary,
  hasNextPage,
  isLoading = false,
  onFirstPage,
  onPreviousPage,
  onNextPage,
}: CursorPagerProps): JSX.Element | null {
  const shouldRender =
    currentPage > 1 ||
    hasNextPage ||
    (totalCount !== undefined && totalCount > Math.max(visibleCount, pageSize));

  if (!shouldRender) {
    return null;
  }

  const from = visibleCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = visibleCount === 0 ? 0 : from + visibleCount - 1;

  function renderButton(label: string, disabled: boolean, onClick: () => void): JSX.Element {
    return (
      <button
        type="button"
        className={clsx(PAGER_LINK_CLASS, disabled && "cursor-default text-slate-400")}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={PAGER_CLASS}>
      <span className={MUTED_CLASS}>
        {summary ??
          (isLoading
            ? `ページ ${currentPage} を取得中...`
            : totalCount === undefined
              ? `${from}～${to}件を表示 / ページ ${currentPage}`
              : `全 ${totalCount}件中 ${from}～${to}件を表示`)}
      </span>
      {renderButton("≪先頭", currentPage === 1 || isLoading, onFirstPage)}
      {renderButton("＜前", currentPage === 1 || isLoading, onPreviousPage)}
      <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>{currentPage}</span>
      {renderButton("次＞", !hasNextPage || isLoading, onNextPage)}
    </div>
  );
}
