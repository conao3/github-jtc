import clsx from "clsx";
import type { PropsWithChildren } from "react";

import { PANEL_CLASS, PANEL_HEADER_CLASS, PANEL_TITLE_CLASS } from "../styles.ts";

interface PanelProps extends PropsWithChildren {
  readonly title: string;
  readonly action?: JSX.Element;
  readonly className?: string;
}

export function Panel({ title, action, className, children }: PanelProps): JSX.Element {
  return (
    <section className={clsx(PANEL_CLASS, className)}>
      <header className={PANEL_HEADER_CLASS}>
        <h2 className={PANEL_TITLE_CLASS}>{title}</h2>
        {action}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}
