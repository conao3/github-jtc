import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

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
  return (
    <Tabs aria-label={label} className="flex flex-col gap-2">
      <TabList className="jtc-tab-list">
        {tabs.map((tab) => (
          <Tab key={tab.id} id={tab.id} className="jtc-tab">
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id} id={tab.id} className="jtc-panel p-3">
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}
