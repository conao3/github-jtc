import { Link } from "react-router-dom";

import { BREADCRUMBS_CLASS, TEXT_LINK_CLASS } from "../styles.ts";

interface BreadcrumbItem {
  readonly label: string;
  readonly to?: string;
}

interface PageHeaderProps {
  readonly title: string;
  readonly summary: string;
  readonly breadcrumbs: BreadcrumbItem[];
  readonly actions?: JSX.Element;
}

export function PageHeader({ title, summary, breadcrumbs, actions }: PageHeaderProps): JSX.Element {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border border-[#999] bg-white p-3">
      <div className="flex flex-col gap-2">
        <nav aria-label="パンくず">
          <ol className={BREADCRUMBS_CLASS}>
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}:${item.to ?? "current"}`} className="flex items-center gap-1.5">
                {item.to === undefined ? (
                  <span>{item.label}</span>
                ) : (
                  <Link to={item.to} className={TEXT_LINK_CLASS}>
                    {item.label}
                  </Link>
                )}
                {index === breadcrumbs.length - 1 ? null : <span aria-hidden="true">›</span>}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[18px] font-bold text-[#16386b]">{title}</h1>
          <p className="m-0 text-[11px] text-[#555]">{summary}</p>
        </div>
      </div>
      {actions === undefined ? null : <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
