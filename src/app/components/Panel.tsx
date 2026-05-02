import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  readonly title: string;
  readonly action?: JSX.Element;
  readonly className?: string;
}

export function Panel({ title, action, className, children }: PanelProps): JSX.Element {
  return (
    <section className={["jtc-panel", className].filter(Boolean).join(" ")}>
      <header className="jtc-panel-header">
        <h2>{title}</h2>
        {action}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
