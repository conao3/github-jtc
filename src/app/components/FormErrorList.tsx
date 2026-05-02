import clsx from "clsx";

import { FORM_ERROR_LIST_CLASS } from "../styles.ts";

interface FormErrorListProps {
  readonly errors: readonly unknown[];
  readonly className?: string;
}

function collectValidationMessages(error: unknown): string[] {
  if (Array.isArray(error)) {
    return error.flatMap((item) => collectValidationMessages(item));
  }

  if (typeof error === "string") {
    return [error];
  }

  if (error !== null && typeof error === "object" && "message" in error) {
    const message = error.message;

    if (typeof message === "string") {
      return [message];
    }
  }

  return ["入力内容を確認してください。"];
}

export function FormErrorList({ errors, className }: FormErrorListProps): JSX.Element | null {
  const messages = [...new Set(errors.flatMap((error) => collectValidationMessages(error)))];

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={clsx(FORM_ERROR_LIST_CLASS, className)}>
      {messages.map((message, index) => (
        <div key={`${message}-${index}`}>※ {message}</div>
      ))}
    </div>
  );
}
