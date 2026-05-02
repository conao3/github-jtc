import { statusTagClassName } from "../styles.ts";

interface StatusBadgeProps {
  readonly tone: "neutral" | "ok" | "warn" | "danger" | "info";
  readonly children: string;
}

export function StatusBadge({ tone, children }: StatusBadgeProps): JSX.Element {
  const mappedTone =
    tone === "ok"
      ? "done"
      : tone === "warn"
        ? "review"
        : tone === "danger"
          ? "rejected"
          : tone === "info"
            ? "new"
            : "required";

  return <span className={statusTagClassName(mappedTone)}>{children}</span>;
}
