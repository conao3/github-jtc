import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

export type ColorTheme = "navy" | "green" | "brown";
export type FontScale = "small" | "medium" | "large";

interface UiPreferences {
  readonly theme: ColorTheme;
  readonly fontScale: FontScale;
  readonly setTheme: (theme: ColorTheme) => void;
  readonly setFontScale: (scale: FontScale) => void;
}

const UiPreferencesContext = createContext<UiPreferences | null>(null);

export function UiPreferencesProvider({ children }: PropsWithChildren): JSX.Element {
  const [theme, setTheme] = useState<ColorTheme>("navy");
  const [fontScale, setFontScale] = useState<FontScale>("medium");

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset["fontScale"] = fontScale;
  }, [fontScale]);

  return (
    <UiPreferencesContext.Provider
      value={{
        theme,
        fontScale,
        setTheme,
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
