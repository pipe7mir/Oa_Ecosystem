import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useOasisCamera from "./useOasisCamera";
import SlideWrapper from "./SlideWrapper";

const GRID_SIZE = 80;
const gridBg = (offsetX, offsetY, scale) => ({
  background: `
    repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, transparent 1px, transparent ${GRID_SIZE * scale}px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, transparent 1px, transparent ${GRID_SIZE * scale}px)
  `,
  backgroundPosition: `${offsetX}px ${offsetY}px`,
});

export default function OasisInfiniteEngine({ initialSlides = [] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [active, setActive] = useState(0);
  const [presentMode, setPresentMode] = useState(false);
  const camera = useOasisCamera(slides, active, presentMode);

  React.useEffect(() => {
    if (!presentMode) return;
    const handler = (e) => {
      if (e.key === "ArrowRight" && active < slides.length - 1) setActive(a => a + 1);
      if (e.key === "ArrowLeft" && active > 0) setActive(a => a - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [presentMode, active, slides.length]);

  const gridOffsetX = -camera.x * camera.scale;
  const gridOffsetY = -camera.y * camera.scale;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: "Inter, San Francisco, Arial, sans-serif" }}>
      {/* Fondo grid */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          ...gridBg(gridOffsetX, gridOffsetY, camera.scale),
          transition: "background-position 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      {/* Cámara cinemática */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1 }}
        animate={{
          x: -camera.x,
          y: -camera.y,
          scale: camera.scale,
          rotate: camera.rotate,
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {slides.map((slide, idx) => (
          <SlideWrapper
            key={slide.id}
            slide={slide}
            isActive={idx === active}
            presentMode={presentMode}
            onUpdate={updated => {
              setSlides(slides => slides.map((s, i) => i === idx ? updated : s));
            }}
            onAssetUpload={async (file) => {
              const data = new FormData();
              data.append("file", file);
              data.append("upload_preset", "default");
              const res = await fetch("https://api.cloudinary.com/v1_1/dlls51qjo/image/upload", {
                method: "POST",
                body: data,
              });
              const result = await res.json();
              return result.secure_url;
            }}
            assetQuality={idx === active ? "w_1920,q_auto,f_auto" : "w_400,e_blur:200"}
          />
        ))}
      </motion.div>
      {/* UI Glassmorphism */}
      {!presentMode && (
        <div className="absolute top-8 left-8 z-10 flex gap-4 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/20 shadow-2xl"
          style={{ boxShadow: "0 8px 32px rgba(255,255,255,0.12)" }}>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 shadow"
            onClick={() => setSlides([...slides, { ...slides[0], id: Date.now(), x: camera.x + 400, y: camera.y }])}>
            + Slide
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 shadow"
            onClick={() => setPresentMode(true)}>
            Presentar
          </button>
        </div>
      )}
      {/* Modo Presentación */}
      {presentMode && (
        <button className="absolute top-8 right-8 z-20 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 shadow"
          onClick={() => setPresentMode(false)}>
          Salir presentación
        </button>
      )}
    </div>
  );
}
