import clsx from "clsx";
import { useState } from "react";
import { Tab, TabList, Tabs } from "react-aria-components";

import { useUiPreferences } from "../state.tsx";
import { PANEL_CLASS, TAB_CLASS, TAB_LIST_CLASS, THEME_CLASS } from "../styles.ts";

export interface TabDefinition {
  readonly id: string;
  readonly label: string;
  readonly content: JSX.Element;
}

interface JtcTabsProps {
  readonly label: string;
  readonly tabs: TabDefinition[];
}

export function JtcTabs({ label, tabs }: JtcTabsProps): JSX.Element {
  const { theme } = useUiPreferences();
  const [selectedKey, setSelectedKey] = useState(tabs[0]?.id ?? "");
  const selectedTab = tabs.find((tab) => tab.id === selectedKey) ?? tabs[0];

  return (
    <Tabs
      aria-label={label}
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (typeof key === "string") {
          setSelectedKey(key);
        }
      }}
      className="flex flex-col gap-2"
    >
      <TabList items={tabs} className={TAB_LIST_CLASS}>
        {(tab) => <Tab className={clsx(TAB_CLASS, THEME_CLASS[theme].tabActive)}>{tab.label}</Tab>}
      </TabList>
      <div className={clsx(PANEL_CLASS, "p-3")}>{selectedTab?.content}</div>
    </Tabs>
  );
}
