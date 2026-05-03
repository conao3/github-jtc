import clsx from "clsx";

export interface GitHubStateDescriptor {
  readonly title: string;
  readonly detail?: string;
}

interface GitHubInlineStateProps extends GitHubStateDescriptor {
  readonly tone: "empty" | "error";
  readonly className?: string;
}

export function GitHubInlineState({ tone, title, detail, className }: GitHubInlineStateProps): JSX.Element {
  return (
    <div
      className={clsx(
        "space-y-1 text-center",
        tone === "error" ? "text-red-800" : "text-slate-600",
        className,
      )}
    >
      <div className="font-bold">{title}</div>
      {detail === undefined || detail.length === 0 ? null : <div className="text-xs">{detail}</div>}
    </div>
  );
}

interface GitHubTableStateRowProps extends GitHubStateDescriptor {
  readonly colSpan: number;
  readonly tone: "empty" | "error";
}

export function GitHubTableStateRow({ colSpan, tone, title, detail }: GitHubTableStateRowProps): JSX.Element {
  return (
    <tr>
      <td colSpan={colSpan} className="py-6">
        <GitHubInlineState tone={tone} title={title} detail={detail} />
      </td>
    </tr>
  );
}
