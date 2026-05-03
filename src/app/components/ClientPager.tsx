import clsx from "clsx";

import { MUTED_CLASS, PAGER_CLASS, PAGER_LINK_ACTIVE_CLASS, PAGER_LINK_CLASS } from "../styles.ts";

interface ClientPagerProps {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, pageCount: number): number[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function ClientPager({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: ClientPagerProps): JSX.Element | null {
  if (totalCount <= 0) {
    return null;
  }

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalCount, currentPage * pageSize);
  const pages = getVisiblePages(currentPage, pageCount);

  function renderNavButton(label: string, page: number, disabled: boolean): JSX.Element {
    return (
      <button
        key={`${label}:${page}`}
        type="button"
        className={clsx(PAGER_LINK_CLASS, disabled && "cursor-default text-slate-400")}
        disabled={disabled}
        onClick={() => onPageChange(page)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={PAGER_CLASS}>
      <span className={MUTED_CLASS}>
        全 {totalCount}件中 {from}～{to}件を表示
      </span>
      {renderNavButton("≪先頭", 1, currentPage === 1)}
      {renderNavButton("＜前", currentPage - 1, currentPage === 1)}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={clsx(PAGER_LINK_CLASS, currentPage === page && PAGER_LINK_ACTIVE_CLASS)}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {renderNavButton("次＞", currentPage + 1, currentPage === pageCount)}
      {renderNavButton("末尾≫", pageCount, currentPage === pageCount)}
    </div>
  );
}
