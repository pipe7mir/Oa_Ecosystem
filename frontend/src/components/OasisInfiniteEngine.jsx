import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Assets locales ───────────────────────────────────────────────────────────
import logoOasis from "../img/logos/LOGO1.png";
import logoIasd from "../img/logos/IASD1.png";

// ─── Configuración ────────────────────────────────────────────────────────────
const GRADIENTS = [
  { label: "Oasis", value: "linear-gradient(135deg,#5b2ea6,#8b5cf6)" },
  { label: "Noche", value: "linear-gradient(135deg,#1a1a2e,#16213e)" },
  { label: "Fuego", value: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { label: "Bosque", value: "linear-gradient(135deg,#11998e,#38ef7d)" },
  { label: "Carbón", value: "linear-gradient(135deg,#232526,#414345)" },
  { label: "Cielo", value: "linear-gradient(135deg,#00c6ff,#0072ff)" },
  { label: "Atardecer", value: "linear-gradient(135deg,#f7971e,#ffd200)" },
  { label: "Coral", value: "linear-gradient(135deg,#f953c6,#b91d73)" },
];

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=70",
  "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=70",
  "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1600&q=70",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=70",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=70",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=70",
];

const FONTS = [
  "MoonRising", "AdventSans", "ModernAge",
  "Arial", "Georgia", "Impact", "Courier New",
];

const QUICK_COLORS = [
  "#ffffff", "#f1f5f9", "#000000", "#5b2ea6",
  "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#3b82f6",
];

const LOGO_ASSETS = [
  { label: "Oasis", url: "/src/img/logos/LOGO1.png" },
  { label: "IASD", url: "/src/img/logos/IASD1.png" },
  { label: "Icono", url: "/src/img/logos/T1.png" },
];

// ─── Factories ─────────────────────────────────────────────────────────────────
let _eid = 0;
const mkNode = (type, x, y, extra = {}) => ({
  id: `n-${Date.now()}-${++_eid}`,
  type,                  // 'card' | 'text' | 'image'
  x, y,
  width: type === "image" ? 160 : type === "text" ? 280 : 400,
  height: type === "image" ? 120 : type === "text" ? 60 : 260,
  content: type === "image" ? (extra.url || "") : "Doble clic para editar",
  style: {
    fontFamily: "MoonRising",
    fontSize: type === "text" ? 28 : 22,
    color: "#ffffff",
    bold: false,
    italic: false,
    underline: false,
    bgColor: "transparent",
    ...extra,
  },
  gradient: type === "card" ? GRADIENTS[0].value : "",
  bgColor: type === "card" ? "#1a1a2e" : "transparent",
  bgImage: type === "card" ? "" : "",
  overlayColor: "#000000",
  overlayOp: type === "card" ? 0.3 : 0,
});

// ═════════════════════════════════════════════════════════════════════════════
export default function OasisInfiniteEngine({ onExitToClassic }) {
  // ── Canvas state ──────────────────────────────────────────────────────────
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [nodes, setNodes] = useState([]);
  const [selId, setSelId] = useState(null);
  const [editId, setEditId] = useState(null);  // node being text-edited
  const [dragging, setDragging] = useState(null);  // { nodeId, startX, startY, oX, oY }
  const [panning, setPanning] = useState(null);  // { startX, startY, oX, oY }
  const [presentMode, setPresentMode] = useState(false);

  // ── UI panel state ─────────────────────────────────────────────────────────
  const [panel, setPanel] = useState("");    // '' | 'bg' | 'elements' | 'style'
  const [toolbarPos, setToolbarPos] = useState({ x: 40, y: 40 });
  const [toolDragging, setToolDragging] = useState(null);

  const canvasRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sel = nodes.find(n => n.id === selId) || null;

  const updateNode = (id, changes) =>
    setNodes(ns => ns.map(n => n.id === id ? { ...n, ...changes } : n));
  const updateNodeStyle = (id, sChanges) =>
    setNodes(ns => ns.map(n => n.id === id ? { ...n, style: { ...n.style, ...sChanges } } : n));

  const screenToCanvas = useCallback((sx, sy) => ({
    x: (sx - offset.x) / scale,
    y: (sy - offset.y) / scale,
  }), [offset, scale]);

  // ── Add node ────────────────────────────────────────────────────────────────
  const addNode = (type, extra = {}) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const pos = screenToCanvas(cx, cy);
    const n = mkNode(type, pos.x - 200, pos.y - 130, extra);
    setNodes(ns => [...ns, n]);
    setSelId(n.id);
    setPanel("style");
  };

  // ── Zoom ────────────────────────────────────────────────────────────────────
  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(s => Math.min(3, Math.max(0.15, s * factor)));
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pan ────────────────────────────────────────────────────────────────────
  const onCanvasMouseDown = (e) => {
    if (e.target !== canvasRef.current && e.target !== canvasRef.current?.firstChild) return;
    setSelId(null);
    setPanel("");
    setPanning({ startX: e.clientX, startY: e.clientY, oX: offset.x, oY: offset.y });
  };
  const onMouseMove = (e) => {
    if (panning) {
      setOffset({ x: panning.oX + e.clientX - panning.startX, y: panning.oY + e.clientY - panning.startY });
    }
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      updateNode(dragging.nodeId, { x: dragging.oX + dx, y: dragging.oY + dy });
    }
    if (toolDragging) {
      setToolbarPos({ x: toolDragging.oX + e.clientX - toolDragging.startX, y: toolDragging.oY + e.clientY - toolDragging.startY });
    }
  };
  const onMouseUp = () => { setPanning(null); setDragging(null); setToolDragging(null); };

  // ── Node mouse down ────────────────────────────────────────────────────────
  const onNodeMouseDown = (e, n) => {
    e.stopPropagation();
    if (editId === n.id) return;
    setSelId(n.id);
    setDragging({ nodeId: n.id, startX: e.clientX, startY: e.clientY, oX: n.x, oY: n.y });
  };

  const onNodeDblClick = (e, n) => {
    e.stopPropagation();
    setEditId(n.id);
    setSelId(n.id);
    setPanel("style");
  };

  const stopEdit = () => setEditId(null);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") { setEditId(null); setSelId(null); setPanel(""); }
      if (e.key === "Delete" && selId && editId !== selId) {
        setNodes(ns => ns.filter(n => n.id !== selId));
        setSelId(null);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selId, editId]);

  // ── Fit to all nodes ────────────────────────────────────────────────────────
  const fitAll = () => {
    if (nodes.length === 0) return;
    const xs = nodes.flatMap(n => [n.x, n.x + n.width]);
    const ys = nodes.flatMap(n => [n.y, n.y + n.height]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pw = window.innerWidth, ph = window.innerHeight;
    const newScale = Math.min(0.9, pw / (maxX - minX + 200), ph / (maxY - minY + 200));
    setScale(newScale);
    setOffset({
      x: pw / 2 - ((minX + maxX) / 2) * newScale,
      y: ph / 2 - ((minY + maxY) / 2) * newScale,
    });
  };

  // ── Zoom to node ─────────────────────────────────────────────────────────────
  const zoomTo = (n) => {
    const pw = window.innerWidth, ph = window.innerHeight;
    const newScale = Math.min(1.2, pw / (n.width + 160), ph / (n.height + 120));
    setScale(newScale);
    setOffset({
      x: pw / 2 - (n.x + n.width / 2) * newScale,
      y: ph / 2 - (n.y + n.height / 2) * newScale,
    });
  };

  // ── Render toolbar drag ──────────────────────────────────────────────────────
  const onToolbarMouseDown = (e) => {
    e.stopPropagation();
    setToolDragging({ startX: e.clientX, startY: e.clientY, oX: toolbarPos.x, oY: toolbarPos.y });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // NODE RENDERING
  // ─────────────────────────────────────────────────────────────────────────────
  const renderNode = (n) => {
    const isSelected = selId === n.id;
    const isEditing = editId === n.id;

    const containerStyle = {
      position: "absolute",
      left: n.x,
      top: n.y,
      width: n.width,
      height: n.type === "text" || n.type === "image" ? "auto" : n.height,
      minHeight: n.type === "card" ? n.height : undefined,
      borderRadius: n.type === "card" ? "16px" : "6px",
      overflow: "hidden",
      cursor: isEditing ? "text" : "grab",
      outline: isSelected ? "2px dashed #00d3df" : "none",
      outlineOffset: "4px",
      boxShadow: n.type === "card" ? "0 24px 60px rgba(0,0,0,0.45)" : "none",
      userSelect: isEditing ? "text" : "none",
    };

    const bgStyle = (() => {
      if (n.type !== "card") return {};
      if (n.bgImage) return { backgroundImage: `url(${n.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" };
      if (n.gradient) return { background: n.gradient };
      return { background: n.bgColor || "#1a1a2e" };
    })();

    return (
      <div
        key={n.id}
        style={containerStyle}
        onMouseDown={e => onNodeMouseDown(e, n)}
        onDoubleClick={e => onNodeDblClick(e, n)}
        onClick={e => e.stopPropagation()}
      >
        {/* Card node */}
        {n.type === "card" && (
          <div style={{ width: "100%", height: "100%", minHeight: n.height, position: "relative", ...bgStyle }}>
            {/* Overlay */}
            {n.overlayColor && n.overlayOp > 0 && (
              <div style={{ position: "absolute", inset: 0, background: n.overlayColor, opacity: n.overlayOp, pointerEvents: "none" }} />
            )}
            {/* Gradient-on-image */}
            {n.bgImage && (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
            )}
            {/* Editable title inside card */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              {isEditing ? (
                <textarea
                  autoFocus
                  defaultValue={n.content}
                  onBlur={e => { updateNode(n.id, { content: e.target.value }); stopEdit(); }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: "transparent", border: "none", outline: "none", resize: "none",
                    textAlign: "center", width: "100%",
                    fontFamily: n.style.fontFamily, fontSize: n.style.fontSize,
                    color: n.style.color, fontWeight: n.style.bold ? "bold" : "normal",
                    fontStyle: n.style.italic ? "italic" : "normal",
                    textDecoration: n.style.underline ? "underline" : "none",
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    caretColor: "#fff",
                  }}
                />
              ) : (
                <p style={{
                  margin: 0, textAlign: "center",
                  fontFamily: n.style.fontFamily, fontSize: n.style.fontSize,
                  color: n.style.color, fontWeight: n.style.bold ? "bold" : "normal",
                  fontStyle: n.style.italic ? "italic" : "normal",
                  textDecoration: n.style.underline ? "underline" : "none",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  whiteSpace: "pre-wrap",
                }}>
                  {n.content}
                </p>
              )}
            </div>
            {/* Doble clic hint */}
            {isSelected && !isEditing && (
              <div style={{
                position: "absolute", bottom: "8px", right: "10px",
                fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", pointerEvents: "none",
              }}>
                Doble clic para editar
              </div>
            )}
          </div>
        )}

        {/* Text node */}
        {n.type === "text" && (
          isEditing ? (
            <textarea
              autoFocus
              defaultValue={n.content}
              onBlur={e => { updateNode(n.id, { content: e.target.value }); stopEdit(); }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "transparent", border: "none", outline: "none", resize: "none",
                width: "100%", minHeight: "40px",
                fontFamily: n.style.fontFamily, fontSize: n.style.fontSize,
                color: n.style.color, fontWeight: n.style.bold ? "bold" : "normal",
                fontStyle: n.style.italic ? "italic" : "normal",
                textDecoration: n.style.underline ? "underline" : "none",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                caretColor: n.style.color,
              }}
            />
          ) : (
            <p style={{
              margin: 0,
              fontFamily: n.style.fontFamily, fontSize: n.style.fontSize,
              color: n.style.color, fontWeight: n.style.bold ? "bold" : "normal",
              fontStyle: n.style.italic ? "italic" : "normal",
              textDecoration: n.style.underline ? "underline" : "none",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              whiteSpace: "pre-wrap", userSelect: "none",
            }}>
              {n.content}
            </p>
          )
        )}

        {/* Image node */}
        {n.type === "image" && (
          <img src={n.content} alt="img"
            style={{
              width: "100%", height: "auto", objectFit: "contain", display: "block",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
            }}
          />
        )}

        {/* Resize handle (card) */}
        {isSelected && n.type === "card" && (
          <div
            style={{
              position: "absolute", right: -6, bottom: -6,
              width: 16, height: 16, background: "#00d3df", borderRadius: "50%",
              cursor: "se-resize", zIndex: 5,
            }}
            onMouseDown={e => {
              e.stopPropagation();
              const startX = e.clientX, startY = e.clientY;
              const ow = n.width, oh = n.height;
              const onMove = (ev) => updateNode(n.id, {
                width: Math.max(200, ow + (ev.clientX - startX) / scale),
                height: Math.max(120, oh + (ev.clientY - startY) / scale),
              });
              const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FLOATING PANEL (side panel for properties)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (!panel) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            width: "260px", zIndex: 80,
            background: "rgba(14,12,28,0.92)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            padding: "12px",
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: "12px",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
              {panel === "bg" ? "Fondo del Nodo" :
                panel === "elements" ? "Insertar" :
                  panel === "style" ? "Estilo" : "Panel"}
            </span>
            <button onClick={() => setPanel("")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
          </div>

          {/* ── FONDOS ── */}
          {panel === "bg" && sel?.type === "card" && (
            <>
              <label style={lblStyle}>Degradados</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {GRADIENTS.map(g => (
                  <button key={g.value}
                    title={g.label}
                    onClick={() => updateNode(sel.id, { gradient: g.value, bgImage: "" })}
                    style={{
                      width: "36px", height: "36px", background: g.value, borderRadius: "6px", cursor: "pointer", border: "none",
                      outline: sel.gradient === g.value ? "2px solid #00d3df" : "2px solid transparent",
                    }}
                  />
                ))}
              </div>

              <label style={lblStyle}>Color sólido</label>
              <input type="color" style={colorInputStyle}
                value={sel.bgColor || "#1a1a2e"}
                onChange={e => updateNode(sel.id, { bgColor: e.target.value, gradient: "", bgImage: "" })} />

              <label style={lblStyle}>Imagen de fondo</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {BG_IMAGES.map((url, i) => (
                  <div key={i}
                    onClick={() => updateNode(sel.id, { bgImage: url, gradient: "" })}
                    style={{
                      width: "70px", height: "46px", borderRadius: "6px", cursor: "pointer",
                      backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center",
                      border: sel.bgImage === url ? "2px solid #00d3df" : "2px solid transparent",
                    }}
                  />
                ))}
                {sel.bgImage && (
                  <button onClick={() => updateNode(sel.id, { bgImage: "" })}
                    style={{ ...smBtn, marginTop: "4px" }}>✕ Quitar imagen</button>
                )}
              </div>

              <label style={lblStyle}>Máscara de color</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="color" style={colorInputStyle}
                  value={sel.overlayColor || "#000000"}
                  onChange={e => updateNode(sel.id, { overlayColor: e.target.value })} />
                <input type="range" min="0" max="1" step="0.05"
                  style={{ flex: 1 }}
                  value={sel.overlayOp ?? 0.3}
                  onChange={e => updateNode(sel.id, { overlayOp: parseFloat(e.target.value) })} />
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", minWidth: "30px" }}>
                  {Math.round((sel.overlayOp ?? 0.3) * 100)}%
                </span>
              </div>
            </>
          )}

          {/* ── ELEMENTOS ── */}
          {panel === "elements" && (
            <>
              <label style={lblStyle}>Nodos</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { label: "📦 Tarjeta (card)", type: "card" },
                  { label: "✏️ Texto libre", type: "text" },
                ].map(b => (
                  <button key={b.type} onClick={() => { addNode(b.type); }}
                    style={{ ...smBtn, textAlign: "left", padding: "10px 12px", fontSize: "0.8rem" }}>
                    {b.label}
                  </button>
                ))}
              </div>

              <label style={lblStyle}>Logos</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {LOGO_ASSETS.map(l => (
                  <button key={l.label}
                    onClick={() => addNode("image", { url: l.url })}
                    style={{ ...smBtn, display: "flex", flexDirection: "column", alignItems: "center", width: "60px", height: "60px", padding: "6px" }}>
                    <img src={l.url} alt={l.label} style={{ height: "26px", objectFit: "contain" }} />
                    <span style={{ fontSize: "0.5rem", marginTop: "3px", color: "rgba(255,255,255,0.7)" }}>{l.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── ESTILO ── */}
          {panel === "style" && sel && (
            <>
              {/* Texto */}
              {(sel.type === "text" || sel.type === "card") && (
                <>
                  <label style={lblStyle}>Fuente</label>
                  <select style={selectStyle}
                    value={sel.style.fontFamily}
                    onChange={e => updateNodeStyle(sel.id, { fontFamily: e.target.value })}>
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <label style={lblStyle}>Tamaño</label>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button style={smBtn} onClick={() => updateNodeStyle(sel.id, { fontSize: Math.max(8, (sel.style.fontSize || 24) - 2) })}>−</button>
                    <span style={{ color: "#fff", fontWeight: 700, minWidth: "32px", textAlign: "center" }}>{sel.style.fontSize}</span>
                    <button style={smBtn} onClick={() => updateNodeStyle(sel.id, { fontSize: Math.min(200, (sel.style.fontSize || 24) + 2) })}>+</button>
                  </div>

                  <label style={lblStyle}>Color de texto</label>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    <input type="color" style={colorInputStyle}
                      value={sel.style.color}
                      onChange={e => updateNodeStyle(sel.id, { color: e.target.value })} />
                    {QUICK_COLORS.map(c => (
                      <button key={c} onClick={() => updateNodeStyle(sel.id, { color: c })}
                        style={{
                          width: "22px", height: "22px", background: c, borderRadius: "4px",
                          border: sel.style.color === c ? "2px solid #00d3df" : "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>

                  <label style={lblStyle}>Formato</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[
                      { key: "bold", label: "N", style: { fontWeight: "bold" } },
                      { key: "italic", label: "I", style: { fontStyle: "italic" } },
                      { key: "underline", label: "S", style: { textDecoration: "underline" } },
                    ].map(f => (
                      <button key={f.key}
                        onClick={() => updateNodeStyle(sel.id, { [f.key]: !sel.style[f.key] })}
                        style={{
                          ...smBtn, ...f.style, width: "36px", height: "36px",
                          background: sel.style[f.key] ? "#5b2ea6" : "rgba(255,255,255,0.1)",
                        }}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Editar contenido */}
                  <label style={lblStyle}>Contenido</label>
                  <textarea
                    value={sel.content}
                    onChange={e => updateNode(sel.id, { content: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "6px", padding: "8px", color: "#fff", fontSize: "0.8rem", resize: "vertical",
                    }}
                  />
                </>
              )}

              {/* Fondo del card desde estilo */}
              {sel.type === "card" && (
                <>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                  <button style={{ ...smBtn, fontSize: "0.75rem" }} onClick={() => setPanel("bg")}>
                    🎨 Editar fondo del nodo →
                  </button>
                </>
              )}

              {/* Eliminar */}
              <button
                onClick={() => { setNodes(ns => ns.filter(n => n.id !== sel.id)); setSelId(null); setPanel(""); }}
                style={{ ...smBtn, background: "rgba(220,53,69,0.3)", marginTop: "auto", padding: "8px" }}>
                🗑 Eliminar nodo
              </button>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FLOATING TOOLBAR
  // ─────────────────────────────────────────────────────────────────────────────
  const renderToolbar = () => (
    <div
      style={{
        position: "fixed", left: toolbarPos.x, top: toolbarPos.y,
        zIndex: 100, display: "flex", flexDirection: "column", gap: "6px",
        background: "rgba(14,12,28,0.90)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px",
        padding: "10px 8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        userSelect: "none",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onToolbarMouseDown}
        style={{ textAlign: "center", cursor: "grab", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", paddingBottom: "4px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        ⠿
      </div>

      {/* Logo */}
      <div style={{ textAlign: "center", paddingBottom: "4px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={logoOasis} style={{ height: "22px", filter: "brightness(10)" }} alt="Oasis" />
      </div>

      {/* Tools */}
      {[
        { icon: "bi-collection-play", label: "Zoom Al", action: fitAll, },
        { icon: "bi-plus-circle", label: "Tarjeta", action: () => { addNode("card"); }, },
        { icon: "bi-fonts", label: "Texto", action: () => { addNode("text"); }, },
        { icon: "bi-image", label: "Logos", action: () => { setPanel(p => p === "elements" ? "" : "elements"); setSelId(null); } },
        { icon: "bi-palette2", label: "Fondo", action: () => { if (sel?.type === "card") setPanel(p => p === "bg" ? "" : "bg"); } },
        { icon: "bi-pencil-square", label: "Estilo", action: () => { if (sel) setPanel(p => p === "style" ? "" : "style"); } },
      ].map(t => (
        <button key={t.label} onClick={t.action} title={t.label}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.75)", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "2px", padding: "6px 10px", borderRadius: "8px",
            transition: "background 0.15s",
            fontSize: "0.55rem",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <i className={`bi ${t.icon} fs-5`}></i>
          {t.label}
        </button>
      ))}

      <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

      {/* Zoom controls */}
      <button onClick={() => setScale(s => Math.min(3, s * 1.2))}
        style={{ ...floatBtn }}
        title="Acercar">
        <i className="bi bi-zoom-in"></i>
      </button>
      <button onClick={() => setScale(s => Math.max(0.15, s / 1.2))}
        style={{ ...floatBtn }}
        title="Alejar">
        <i className="bi bi-zoom-out"></i>
      </button>
      <span style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.6rem" }}>
        {Math.round(scale * 100)}%
      </span>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

      {/* Presentar */}
      <button onClick={() => setPresentMode(true)}
        style={{ ...floatBtn, background: "rgba(91,46,166,0.5)", color: "#d0b4ff" }}
        title="Presentar">
        <i className="bi bi-play-circle fs-5"></i>
      </button>

      {/* Volver al modo clásico */}
      {onExitToClassic && (
        <button onClick={onExitToClassic}
          style={{ ...floatBtn, color: "rgba(255,255,255,0.5)", fontSize: "0.55rem" }}
          title="Modo Clásico">
          <i className="bi bi-grid-3x3-gap"></i>
        </button>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // PRESENT MODE
  // ─────────────────────────────────────────────────────────────────────────────
  const renderPresentOverlay = () => (
    <AnimatePresence>
      {presentMode && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setPresentMode(false)}
        >
          <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "6px" }}>Modo Presentación</p>
            <p style={{ fontSize: "0.75rem" }}>Haz clic en cualquier nodo para hacer zoom · Clic en el fondo para volver · ESC para salir</p>
          </div>
          {/* Clickeable nodes in present mode */}
          {nodes.map(n => (
            <div key={n.id}
              style={{
                position: "absolute",
                left: offset.x + n.x * scale,
                top: offset.y + n.y * scale,
                width: n.width * scale,
                height: n.type === "card" ? n.height * scale : "auto",
                cursor: "pointer",
                borderRadius: n.type === "card" ? "12px" : "4px",
                border: "2px solid rgba(255,255,255,0.25)",
              }}
              onClick={e => { e.stopPropagation(); zoomTo(n); setPresentMode(false); }}
            />
          ))}
          <button
            style={{
              position: "fixed", top: 20, right: 20, background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(10px)",
              color: "#fff", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontSize: "0.85rem",
            }}
            onClick={() => setPresentMode(false)}>
            ✕ Salir presentación
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN CANVAS
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#0f0e1a" }}>

      {/* Dot grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: `${28 * scale}px ${28 * scale}px`,
        backgroundPosition: `${offset.x % (28 * scale)}px ${offset.y % (28 * scale)}px`,
        transition: "background-size 0.1s, background-position 0.05s",
      }} />

      {/* Main canvas surface */}
      <div
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 1, cursor: "default" }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Transformed world */}
        <div style={{
          position: "absolute",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}>
          {nodes.map(renderNode)}
        </div>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && !panel && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", color: "rgba(255,255,255,0.2)", textAlign: "center",
        }}>
          <i className="bi bi-infinity" style={{ fontSize: "5rem", marginBottom: "16px" }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "4px" }}>Lienzo Infinito</p>
          <p style={{ fontSize: "0.8rem" }}>
            Usa la barra izquierda para agregar tarjetas y texto.<br />
            Arrastra para mover · Scroll para zoom · Doble clic para editar
          </p>
        </div>
      )}

      {/* Floating toolbar */}
      {renderToolbar()}

      {/* Side panel */}
      {renderPanel()}

      {/* Present overlay */}
      {renderPresentOverlay()}

      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
      `}</style>
    </div>
  );
}

// ── Shared micro-styles ────────────────────────────────────────────────────────
const lblStyle = {
  color: "rgba(255,255,255,0.5)", fontSize: "0.62rem", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px",
};

const smBtn = {
  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", borderRadius: "6px", padding: "5px 10px", cursor: "pointer",
  fontSize: "0.72rem", fontWeight: 600, transition: "background 0.15s",
};

const floatBtn = {
  background: "transparent", border: "none", color: "rgba(255,255,255,0.75)",
  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", padding: "5px", borderRadius: "8px",
  fontSize: "0.55rem", transition: "background 0.15s",
};

const colorInputStyle = {
  width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer",
  border: "2px solid rgba(255,255,255,0.2)", padding: 0, background: "transparent",
};

const selectStyle = {
  width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "6px", padding: "5px 8px", color: "#fff", fontSize: "0.75rem",
};
