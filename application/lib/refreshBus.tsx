type RefreshFn = () => void | Promise<void>;

let homeRefresh: RefreshFn | null = null;

export function registerHomeRefresh(fn: RefreshFn | null) {
  homeRefresh = fn;
}

export function triggerHomeRefresh() {
  homeRefresh?.();
}
