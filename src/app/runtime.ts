function normalizeBasePath(value: string | undefined): string {
  if (value === undefined || value.length === 0 || value === "./") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function getPublicBasePath(): string {
  return normalizeBasePath(import.meta.env.VITE_PUBLIC_BASE_PATH);
}

export function getAppOriginBaseUrl(): URL {
  return new URL(getPublicBasePath(), window.location.origin);
}
