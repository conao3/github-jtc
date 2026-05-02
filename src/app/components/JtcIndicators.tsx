import { priorityTagClassName, statusTagClassName } from "../styles.ts";

interface StatusTagProps {
  readonly tone:
    | "new"
    | "review"
    | "pending"
    | "inProgress"
    | "done"
    | "rejected"
    | "confirmed"
    | "required"
    | "warning";
  readonly children: string;
}

interface PriorityTagProps {
  readonly priority: "high" | "medium" | "low";
  readonly children: string;
}

export function JtcStatusTag({ tone, children }: StatusTagProps): JSX.Element {
  return <span className={statusTagClassName(tone)}>{children}</span>;
}

export function JtcPriorityTag({ priority, children }: PriorityTagProps): JSX.Element {
  return <span className={priorityTagClassName(priority)}>{children}</span>;
}
