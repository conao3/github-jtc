import clsx from "clsx";
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

import {
  FIELD_LABEL_CLASS,
  LISTBOX_CLASS,
  LISTBOX_ITEM_CLASS,
  POPOVER_CLASS,
  SELECT_BUTTON_CLASS,
  SELECT_ROOT_CLASS,
} from "../styles.ts";

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
      className={SELECT_ROOT_CLASS}
    >
      <Label className={FIELD_LABEL_CLASS}>{label}</Label>
      <Button className={SELECT_BUTTON_CLASS}>
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
