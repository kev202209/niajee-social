'use client';
import { useEffect, RefObject } from "react";

// Overloaded function signatures
function useOutsideClick(
  refs: RefObject<HTMLElement>,
  callback: () => void
): void;
function useOutsideClick(
  refs: ReadonlyArray<RefObject<HTMLElement>>,
  callback: () => void
): void;
function useOutsideClick(
  refs: RefObject<HTMLElement> | ReadonlyArray<RefObject<HTMLElement>>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!event.target) return;

      // Normalize refs to always be an array
      const refArray = Array.isArray(refs) ? refs : [refs];

      // Check if click is outside all provided refs
      const isOutside = refArray.every(ref =>
        ref.current && !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [refs, callback]);
}

export default useOutsideClick;