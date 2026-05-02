import clsx from "clsx";
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

import { INPUT_CLASS, LISTBOX_CLASS, LISTBOX_ITEM_CLASS, POPOVER_CLASS } from "../styles.ts";

export interface SelectOption {
  readonly id: string;
  readonly label: string;
}

interface JtcSelectProps {
  readonly label: string;
  readonly options: SelectOption[];
  readonly selectedKey: string;
  readonly onSelectionChange: (key: string) => void;
  readonly ariaLabel?: string;
}

export function JtcSelect({
  label,
  options,
  selectedKey,
  onSelectionChange,
  ariaLabel,
}: JtcSelectProps): JSX.Element {
  return (
    <Select
      aria-label={ariaLabel ?? label}
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (typeof key === "string") {
          onSelectionChange(key);
        }
      }}
      className="flex min-w-[12rem] flex-col gap-1"
    >
      <Label className="text-[11px] font-bold text-[#222]">{label}</Label>
      <Button
        className={clsx(INPUT_CLASS, "flex min-h-[22px] items-center justify-between gap-3 px-2 text-left")}
      >
        <SelectValue />
        <span aria-hidden="true">▼</span>
      </Button>
      <Popover className={POPOVER_CLASS}>
        <ListBox className={LISTBOX_CLASS}>
          {options.map((option) => (
            <ListBoxItem
              key={option.id}
              textValue={option.label}
              className={({ isFocused, isSelected }) =>
                clsx(LISTBOX_ITEM_CLASS, isFocused && "bg-[#dce7f3]", isSelected && "bg-[#b9cee2]")
              }
            >
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}
