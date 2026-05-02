import { Button, type ButtonProps } from "react-aria-components";

type Tone = "default" | "primary" | "danger";

interface JtcButtonProps extends ButtonProps {
  readonly tone?: Tone;
}

const toneClassName: Record<Tone, string> = {
  default: "jtc-button",
  primary: "jtc-button jtc-button-primary",
  danger: "jtc-button jtc-button-danger",
};

export function JtcButton({ tone = "default", className, ...props }: JtcButtonProps): JSX.Element {
  return <Button {...props} className={[toneClassName[tone], className].filter(Boolean).join(" ")} />;
}
