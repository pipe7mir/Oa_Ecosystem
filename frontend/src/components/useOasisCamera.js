import { useMemo } from "react";

export default function useOasisCamera(slides, active, presentMode) {
  const slide = slides[active] || { x: 0, y: 0, z: 0, rotate: 0 };
  return useMemo(() => ({
    x: slide.x || 0,
    y: slide.y || 0,
    scale: presentMode ? 1.2 : 0.7 + (slide.z || 0) * 0.1,
    rotate: slide.rotate || 0,
  }), [slide, presentMode]);
}
