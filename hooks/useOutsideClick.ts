'use client';
import { useEffect } from "react";

function useOutsideClick(
  refs: React.RefObject<HTMLElement>[],
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!event.target) return;
      
      // Check if click is outside all provided refs
      const isOutside = refs.every(ref => 
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