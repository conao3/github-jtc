import clsx from "clsx";

interface StatusBadgeProps {
  readonly tone: "neutral" | "ok" | "warn" | "danger" | "info";
  readonly children: string;
}

const toneClassName = {
  neutral: "border-[#8f99a8] bg-[#e3e8ef] text-[#445063]",
  ok: "border-[#3c7b52] bg-[#e0f0e6] text-[#1e5b37]",
  warn: "border-[#aa6b20] bg-[#fbecd2] text-[#8c5100]",
  danger: "border-[#a0323e] bg-[#f5d6da] text-[#8e1724]",
  info: "border-[#49739d] bg-[#d7e7f8] text-[#1e5488]",
} as const;

export function StatusBadge({ tone, children }: StatusBadgeProps): JSX.Element {
  return (
    <span
      className={clsx(
        "inline-flex min-w-[4.7rem] items-center justify-center border px-2 py-[3px] text-[11px] font-bold tracking-[0.04em]",
        toneClassName[tone],
      )}
    >
      {children}
    </span>
  );
}
