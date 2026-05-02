import { Button, type ButtonProps } from "react-aria-components";

import { buttonClassName } from "../styles.ts";

type Tone = "default" | "primary" | "danger";
type Size = "sm" | "md" | "lg";

interface JtcButtonProps extends ButtonProps {
  readonly tone?: Tone;
  readonly size?: Size;
}

export function JtcButton({
  tone = "default",
  size = "md",
  className,
  ...props
}: JtcButtonProps): JSX.Element {
  return (
    <Button
      {...props}
      className={buttonClassName({
        tone,
        size,
        className: typeof className === "string" ? className : undefined,
      })}
    />
  );
}
