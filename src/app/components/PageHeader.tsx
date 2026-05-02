import { Link } from "react-router-dom";

import {
  BREADCRUMBS_CLASS,
  PAGE_ACTIONS_CLASS,
  PAGE_HEADER_CLASS,
  PAGE_SUMMARY_CLASS,
  PAGE_TITLE_CLASS,
  TEXT_LINK_CLASS,
} from "../styles.ts";

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
    <header className={PAGE_HEADER_CLASS}>
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
          <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
          <p className={PAGE_SUMMARY_CLASS}>{summary}</p>
        </div>
      </div>
      {actions === undefined ? null : <div className={PAGE_ACTIONS_CLASS}>{actions}</div>}
    </header>
  );
}
