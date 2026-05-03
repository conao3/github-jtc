import { Suspense } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { githubApolloClient } from "./apollo.ts";
import { queryClient } from "./queryClient.ts";
import { AppRoutes } from "./router.tsx";
import { UiPreferencesProvider } from "./state.tsx";
import { LOADING_CLASS } from "./styles.ts";

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={githubApolloClient}>
        <UiPreferencesProvider>
          <Suspense
            fallback={<div className={LOADING_CLASS}>画面を読込中です。しばらくお待ちください...</div>}
          >
            <AppRoutes />
          </Suspense>
        </UiPreferencesProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
