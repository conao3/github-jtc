import type { ZodType } from "zod";

export function zodValidators<TSchema extends ZodType>(schema: TSchema) {
  return {
    onChange: schema,
    onSubmit: schema,
  } as const;
}
