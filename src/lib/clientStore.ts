"use client";

import { useSyncExternalStore } from "react";

/** A tiny reactive localStorage-backed string list (wishlist, recently-viewed). */
function makeStore(key: string, cap = 100) {
  const listeners = new Set<() => void>();
  let cache: string[] | null = null;

  function read(): string[] {
    if (cache) return cache;
    if (typeof window === "undefined") return (cache = []);
    try {
      cache = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      cache = [];
    }
    return cache!;
  }
  function write(next: string[]) {
    cache = next.slice(0, cap);
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(cache));
    listeners.forEach((l) => l());
  }
  return {
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    snapshot: read,
    has(id: string) {
      return read().includes(id);
    },
    toggle(id: string) {
      const cur = read();
      write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
    },
    /** Add to front, de-duped (used for recently-viewed). */
    push(id: string) {
      write([id, ...read().filter((x) => x !== id)]);
    },
  };
}

export const wishlist = makeStore("mc_wishlist");
export const recent = makeStore("mc_recent", 12);

const EMPTY: string[] = [];

export function useStoreList(store: ReturnType<typeof makeStore>): string[] {
  return useSyncExternalStore(store.subscribe, store.snapshot, () => EMPTY);
}
