import { useEffect, type RefObject } from "react";

/** Writes --p (0..1) on the element as it scrolls through the viewport. Fixed at 0.5 for reduced motion. */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return el.style.setProperty("--p", "0.5");
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--p", Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))).toFixed(3));
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", update); removeEventListener("resize", update); };
  }, [ref]);
}
