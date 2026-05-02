import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

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
      className="jtc-select"
    >
      <Label className="jtc-field-label">{label}</Label>
      <Button className="jtc-select-button">
        <SelectValue />
        <span aria-hidden="true">▼</span>
      </Button>
      <Popover className="jtc-popover">
        <ListBox className="jtc-listbox">
          {options.map((option) => (
            <ListBoxItem key={option.id} id={option.id} className="jtc-listbox-item">
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}
