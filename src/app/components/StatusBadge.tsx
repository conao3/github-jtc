interface StatusBadgeProps {
  readonly tone: "neutral" | "ok" | "warn" | "danger" | "info";
  readonly children: string;
}

export function StatusBadge({ tone, children }: StatusBadgeProps): JSX.Element {
  return <span className={`jtc-badge jtc-badge-${tone}`}>{children}</span>;
}
