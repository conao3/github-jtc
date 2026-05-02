import clsx from "clsx";
import type { PropsWithChildren } from "react";

import { PANEL_BODY_CLASS, PANEL_CLASS, PANEL_HEADER_CLASS } from "../styles.ts";

interface PanelProps extends PropsWithChildren {
  readonly title: string;
  readonly action?: JSX.Element;
  readonly className?: string;
  readonly bodyClassName?: string;
}

export function Panel({ title, action, className, bodyClassName, children }: PanelProps): JSX.Element {
  return (
    <section className={clsx(PANEL_CLASS, className)}>
      <header className={PANEL_HEADER_CLASS}>
        <h2 className="m-0 text-[11px] font-bold text-[#10233f]">{title}</h2>
        {action}
      </header>
      <div className={clsx(PANEL_BODY_CLASS, bodyClassName)}>{children}</div>
    </section>
  );
}
