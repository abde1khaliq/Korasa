// Mirrors the registerAuthHandlers pattern in lib/api.ts: lets a
// context-free caller (TabBar) trigger a refresh in whatever screen
// currently owns the subjects list, without circular imports or lifting
// useSubjects() into a shared context just for this one case.

type RefreshFn = () => void | Promise<void>;

let homeRefresh: RefreshFn | null = null;

export function registerHomeRefresh(fn: RefreshFn | null) {
  homeRefresh = fn;
}

export function triggerHomeRefresh() {
  homeRefresh?.();
}