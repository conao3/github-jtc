import { statusTagClassName } from "../styles.ts";

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

export function JtcStatusTag({ tone, children }: StatusTagProps): JSX.Element {
  return <span className={statusTagClassName(tone)}>{children}</span>;
}
