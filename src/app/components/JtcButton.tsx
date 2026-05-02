import clsx from "clsx";
import { Button, type ButtonProps } from "react-aria-components";

import { useUiPreferences } from "../state.tsx";
import { BUTTON_BASE_CLASS, BUTTON_DANGER_CLASS, THEME_CLASS } from "../styles.ts";

type Tone = "default" | "primary" | "danger";

interface JtcButtonProps extends ButtonProps {
  readonly tone?: Tone;
}

export function JtcButton({ tone = "default", className, ...props }: JtcButtonProps): JSX.Element {
  const { theme } = useUiPreferences();

  return (
    <Button
      {...props}
      className={clsx(
        BUTTON_BASE_CLASS,
        tone === "primary" && THEME_CLASS[theme].primaryButton,
        tone === "danger" && BUTTON_DANGER_CLASS,
        className,
      )}
    />
  );
}
