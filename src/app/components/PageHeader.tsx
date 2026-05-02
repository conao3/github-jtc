import { Link } from "react-router-dom";

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
    <header className="jtc-page-header">
      <div className="flex flex-col gap-2">
        <nav aria-label="パンくず">
          <ol className="jtc-breadcrumbs">
            {breadcrumbs.map((item) => (
              <li key={`${item.label}:${item.to ?? "current"}`}>
                {item.to === undefined ? <span>{item.label}</span> : <Link to={item.to}>{item.label}</Link>}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-1">
          <h1 className="jtc-page-title">{title}</h1>
          <p className="jtc-page-summary">{summary}</p>
        </div>
      </div>
      {actions === undefined ? null : <div className="jtc-page-actions">{actions}</div>}
    </header>
  );
}
