import { Suspense } from "react";

import { UiPreferencesProvider } from "./state.tsx";
import { AppRoutes } from "./router.tsx";
import { AppShell } from "./shell/AppShell.tsx";

export function App(): JSX.Element {
  return (
    <UiPreferencesProvider>
      <AppShell>
        <Suspense fallback={<div className="jtc-loading">画面を読込中です。しばらくお待ちください...</div>}>
          <AppRoutes />
        </Suspense>
      </AppShell>
    </UiPreferencesProvider>
  );
}
