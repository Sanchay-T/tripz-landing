import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * True below the mobile breakpoint.
 *
 * shadcn ships this as `useState` + `useEffect` that calls `setIsMobile` in the effect
 * body — the React compiler flags that as a cascading render, and it also means the
 * first paint always reports desktop before correcting.
 *
 * `useSyncExternalStore` is the primitive built for exactly this: subscribe to an
 * external source, read its value during render. The server snapshot returns false so
 * SSR renders the desktop layout, which is what the markup is laid out for anyway.
 */
function subscribe(onChange) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
