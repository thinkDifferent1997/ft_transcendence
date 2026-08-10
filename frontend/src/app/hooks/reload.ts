let handled = false;

export function consumeReload(): boolean {
  if (handled) return false;
  handled = true;
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === "reload";
}
