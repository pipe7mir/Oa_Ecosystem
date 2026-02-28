import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SlideWrapper({
  slide,
  isActive,
  presentMode,
  onUpdate,
  onAssetUpload,
  assetQuality
}) {
  const [editing, setEditing] = useState(false);

  // Renderiza los assets con optimización dinámica
  const getCloudinaryUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/upload/");
    return parts.length === 2
      ? `${parts[0]}/upload/${assetQuality}/${parts[1]}`
      : url;
  };

  return (
    <motion.div
      className={`relative rounded-2xl shadow-2xl border border-white/20 ${isActive ? "ring-4 ring-white/30" : ""}`}
      style={{
        width: 900,
        height: 600,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(32px)",
        boxShadow: "0 8px 32px rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}
      drag={!presentMode}
      dragMomentum={false}
      dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
      animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.5 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Asset principal */}
      {slide.image && (
        <img
          src={getCloudinaryUrl(slide.image)}
          alt="slide"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: slide.filter || "none" }}
        />
      )}
      {/* Texto editable */}
      <div
        className="absolute left-8 top-8 text-4xl font-bold text-white drop-shadow-lg"
        style={{ fontFamily: "Inter, San Francisco, Arial, sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        contentEditable={!presentMode}
        suppressContentEditableWarning
        onBlur={e => onUpdate({ ...slide, text: e.target.innerText })}
      >
        {slide.text || "Haz doble click para editar"}
      </div>
      {/* Botón de subir imagen */}
      {!presentMode && (
        <input
          type="file"
          accept="image/*"
          className="absolute bottom-8 left-8"
          onChange={async e => {
            const url = await onAssetUpload(e.target.files[0]);
            onUpdate({ ...slide, image: url });
          }}
        />
      )}
      {/* Micro-interacciones */}
      <div className="absolute bottom-8 right-8 flex gap-2">
        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/30 transition-all duration-200 shadow"
          onClick={() => onUpdate({ ...slide, filter: "blur(8px)" })}>
          Blur
        </button>
        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/30 transition-all duration-200 shadow"
          onClick={() => onUpdate({ ...slide, filter: "none" })}>
          Sin filtro
        </button>
      </div>
    </motion.div>
  );
}
