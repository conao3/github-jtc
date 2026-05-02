import { createContext, type PropsWithChildren, useContext, useState } from "react";

export type FontScale = "small" | "medium" | "large";

interface UiPreferences {
  readonly fontScale: FontScale;
  readonly setFontScale: (scale: FontScale) => void;
}

const UiPreferencesContext = createContext<UiPreferences | null>(null);

export function UiPreferencesProvider({ children }: PropsWithChildren): JSX.Element {
  const [fontScale, setFontScale] = useState<FontScale>("medium");

  return (
    <UiPreferencesContext.Provider
      value={{
        fontScale,
        setFontScale,
      }}
    >
      {children}
    </UiPreferencesContext.Provider>
  );
}

export function useUiPreferences(): UiPreferences {
  const context = useContext(UiPreferencesContext);

  if (context === null) {
    throw new Error("UiPreferencesContext is not available");
  }

  return context;
}
