'use client';
import { useEffect, type RefObject } from "react";

// Generic version that accepts RefObject<T | null> or readonly array of them
function useOutsideClick<T extends HTMLElement>(
  refs: RefObject<T | null>,
  callback: () => void
): void;
function useOutsideClick<T extends HTMLElement>(
  refs: ReadonlyArray<RefObject<T | null>>,
  callback: () => void
): void;
function useOutsideClick<T extends HTMLElement>(
  refs: RefObject<T | null> | ReadonlyArray<RefObject<T | null>>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!event.target) return;

      // Normalize refs to always be an array
      const refArray = Array.isArray(refs) ? refs : [refs];

      // Check if click is outside all provided refs
      const isOutside = refArray.every(ref =>
        ref.current ? !ref.current.contains(event.target as Node) : true
      );

      if (isOutside) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
    // We intentionally depend only on callback because ref objects are stable.
    // If you pass a newly created array of refs on every render, prefer calling
    // the hook with a single ref or memoizing the refs array.
  }, [callback]);
}

export default useOutsideClick;