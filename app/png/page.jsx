"use client"
import { useState, useCallback, useRef } from "react";
import NextImage from "next/image";

// Load JSZip from CDN
let _jszip = null;
function loadJSZip() {
  if (_jszip) return Promise.resolve(_jszip);
  return new Promise((resolve, reject) => {
    if (window.JSZip) { _jszip = window.JSZip; resolve(_jszip); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => { _jszip = window.JSZip; resolve(_jszip); };
    s.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(s);
  });
}

const SUPPORTED_EXT = [".png",".jpg",".jpeg",".gif",".bmp",".tiff",".tif",".avif",".svg",".webp",".ico"];
const OUTPUT_FORMATS = [
  { label: "WebP", mime: "image/webp", ext: "webp" },
  { label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  { label: "PNG",  mime: "image/png",  ext: "png" },
];

function isSupported(file) {
  if (file.type.startsWith("image/")) return true;
  const name = file.name.toLowerCase();
  return SUPPORTED_EXT.some((e) => name.endsWith(e));
}

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

function getExt(name) { return name.split(".").pop().toUpperCase(); }

// Convert file → blob using canvas
function convertImage(file, mime, quality) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("canvas.toBlob returned null")),
        mime,
        mime === "image/png" ? undefined : quality / 100
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image failed to load")); };
    img.src = url;
  });
}

// Trigger a browser download from a Blob object directly
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; color: #f0ede8; font-family: 'Syne', sans-serif; min-height: 100vh; }
  .app { min-height: 100vh; position: relative; overflow: hidden; }
  .bg-grid {
    position: fixed; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(255,200,80,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,200,80,.03) 1px,transparent 1px);
    background-size: 60px 60px;
  }
  .bg-glow { position: fixed; top: -200px; right: -200px; width: 600px; height: 600px; pointer-events: none; background: radial-gradient(circle,rgba(255,200,80,.06) 0%,transparent 70%); }
  .wrap { max-width: 900px; margin: 0 auto; padding: 60px 24px 80px; position: relative; z-index: 1; }
  .badge { display:inline-block; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:#ffc850; border:1px solid rgba(255,200,80,.3); padding:4px 12px; border-radius:2px; margin-bottom:20px; }
  h1 { font-size:clamp(2.2rem,6vw,4rem); font-weight:800; line-height:1; letter-spacing:-.03em; margin-bottom:12px; }
  h1 span { color:#ffc850; }
  .sub { font-family:'DM Mono',monospace; font-size:13px; color:rgba(240,237,232,.4); margin-bottom:48px; }

  .drop { border:1.5px dashed rgba(255,200,80,.25); border-radius:12px; padding:56px 40px; text-align:center; cursor:pointer; transition:.2s; background:rgba(255,255,255,.02); position:relative; overflow:hidden; }
  .drop::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at center,rgba(255,200,80,.04) 0%,transparent 70%); opacity:0; transition:.3s; }
  .drop:hover::before, .drop.drag::before { opacity:1; }
  .drop:hover, .drop.drag { border-color:rgba(255,200,80,.6); }
  .drop.drag { transform:scale(1.01); }
  .drop-icon { width:56px;height:56px;margin:0 auto 18px;background:rgba(255,200,80,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px; }
  .drop-title { font-size:18px;font-weight:700;margin-bottom:6px; }
  .drop-sub { font-family:'DM Mono',monospace;font-size:11px;color:rgba(240,237,232,.35);line-height:1.8; }
  .pick-btn { margin-top:18px;padding:10px 28px;background:#ffc850;color:#0a0a0a;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;border:none;border-radius:4px;cursor:pointer;transition:.15s; }
  .pick-btn:hover { background:#ffd870;transform:translateY(-1px); }

  .ctrl { margin-top:28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:18px 22px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px; }
  .clabel { font-family:'DM Mono',monospace;font-size:12px;color:rgba(240,237,232,.5);letter-spacing:.08em;white-space:nowrap; }
  .fmt-tabs { display:flex;gap:6px; }
  .fmt-tab { padding:5px 14px;font-family:'DM Mono',monospace;font-size:12px;background:transparent;border:1px solid rgba(255,255,255,.12);color:rgba(240,237,232,.4);border-radius:3px;cursor:pointer;transition:.15s; }
  .fmt-tab:hover { border-color:rgba(255,200,80,.4);color:rgba(240,237,232,.8); }
  .fmt-tab.on { background:rgba(255,200,80,.15);border-color:rgba(255,200,80,.5);color:#ffc850; }
  .vdiv { width:1px;height:28px;background:rgba(255,255,255,.1);flex-shrink:0; }
  .slider { flex:1;min-width:80px;-webkit-appearance:none;height:2px;background:rgba(255,255,255,.1);border-radius:2px;outline:none; }
  .slider::-webkit-slider-thumb { -webkit-appearance:none;width:16px;height:16px;background:#ffc850;border-radius:50%;cursor:pointer;transition:.15s; }
  .slider::-webkit-slider-thumb:hover { transform:scale(1.3); }
  .qval { font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:#ffc850;min-width:36px;text-align:right; }
  .lossless { font-family:'DM Mono',monospace;font-size:10px;color:rgba(240,237,232,.25); }

  .flist { margin-top:28px;display:flex;flex-direction:column;gap:10px; }
  .fitem { display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;transition:.2s; }
  .fitem.done { border-color:rgba(80,255,160,.2);background:rgba(80,255,160,.03); }
  .fitem.err  { border-color:rgba(255,80,80,.2);background:rgba(255,80,80,.03); }
  .thumb { width:42px;height:42px;border-radius:4px;object-fit:cover;background:rgba(255,255,255,.05);flex-shrink:0; }
  .finfo { flex:1;min-width:0; }
  .fname { font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .fmeta { font-family:'DM Mono',monospace;font-size:11px;color:rgba(240,237,232,.35);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
  .ftag { padding:1px 6px;border-radius:2px;background:rgba(255,200,80,.1);color:rgba(255,200,80,.7);font-size:9px;letter-spacing:.08em;text-transform:uppercase; }
  .saving { font-family:'DM Mono',monospace;font-size:12px;color:#50ffa0;white-space:nowrap; }
  .bigger { font-family:'DM Mono',monospace;font-size:12px;color:#ffc850;white-space:nowrap; }
  .errtxt { color:rgba(255,80,80,.7); }
  .save-btn { padding:7px 14px;background:rgba(80,255,160,.1);border:1px solid rgba(80,255,160,.3);color:#50ffa0;font-family:'DM Mono',monospace;font-size:12px;border-radius:4px;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0; }
  .save-btn:hover { background:rgba(80,255,160,.2);transform:translateY(-1px); }
  .rm-btn { padding:4px 8px;background:transparent;border:1px solid rgba(255,255,255,.08);color:rgba(240,237,232,.2);font-size:11px;border-radius:3px;cursor:pointer;transition:.15s;flex-shrink:0; }
  .rm-btn:hover { border-color:rgba(255,80,80,.4);color:rgba(255,80,80,.6); }
  .spin { width:16px;height:16px;border:2px solid rgba(255,200,80,.2);border-top-color:#ffc850;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .actions { margin-top:20px;display:flex;gap:10px;justify-content:flex-end;align-items:center; }
  .clear-btn { padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,.1);color:rgba(240,237,232,.45);font-family:'Syne',sans-serif;font-weight:700;font-size:13px;border-radius:4px;cursor:pointer;transition:.15s; }
  .clear-btn:hover { border-color:rgba(255,255,255,.25);color:#f0ede8; }
  .zip-btn { padding:10px 18px;background:rgba(80,255,160,.1);border:1px solid rgba(80,255,160,.3);color:#50ffa0;font-family:'DM Mono',monospace;font-size:12px;border-radius:4px;cursor:pointer;transition:.15s; }
  .zip-btn:hover:not(:disabled) { background:rgba(80,255,160,.2); }
  .zip-btn:disabled { opacity:.45;cursor:not-allowed; }
  .conv-btn { padding:10px 28px;background:#ffc850;color:#0a0a0a;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;border:none;border-radius:4px;cursor:pointer;transition:.15s;letter-spacing:.04em; }
  .conv-btn:hover:not(:disabled) { background:#ffd870;transform:translateY(-1px); }
  .conv-btn:disabled { opacity:.4;cursor:not-allowed; }

  .stats { margin-top:28px;padding:18px 22px;background:rgba(80,255,160,.04);border:1px solid rgba(80,255,160,.15);border-radius:8px;display:flex;gap:36px;flex-wrap:wrap; }
  .stat { display:flex;flex-direction:column;gap:4px; }
  .slbl { font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,237,232,.35); }
  .sval { font-size:20px;font-weight:800;letter-spacing:-.02em; }
`;

export default function App() {
  const [files, setFiles]         = useState([]);
  const [quality, setQuality]     = useState(85);
  const [fmt, setFmt]             = useState(OUTPUT_FORMATS[0]);
  const [dragging, setDragging]   = useState(false);
  const [converting, setConverting] = useState(false);
  const [zipping, setZipping]     = useState(false);
  const inputRef = useRef();

  const addFiles = useCallback((raw) => {
    const valid = Array.from(raw).filter(isSupported);
    if (!valid.length) return;
    setFiles((prev) => [...prev, ...valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      status: "idle",  // idle | converting | done | error
      blob: null,      // ← store raw Blob, not just a URL
      size: null,
      savings: null,
      error: null,
    }))]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (id) => setFiles((prev) => {
    const f = prev.find((x) => x.id === id);
    if (f) URL.revokeObjectURL(f.preview);
    return prev.filter((x) => x.id !== id);
  });

  const convertAll = async () => {
    setConverting(true);
    // snapshot to avoid stale closure issues
    const pending = files.filter((f) => f.status !== "done");
    for (const item of pending) {
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "converting", error: null } : f));
      try {
        const blob = await convertImage(item.file, fmt.mime, quality);
        const savings = (((item.file.size - blob.size) / item.file.size) * 100).toFixed(1);
        setFiles((prev) => prev.map((f) => f.id === item.id
          ? { ...f, status: "done", blob, size: blob.size, savings }
          : f
        ));
      } catch (err) {
        setFiles((prev) => prev.map((f) => f.id === item.id
          ? { ...f, status: "error", error: err.message }
          : f
        ));
      }
    }
    setConverting(false);
  };

  const downloadOne = (item) => {
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    triggerDownload(item.blob, `${baseName}.${fmt.ext}`);
  };

  const downloadZip = async () => {
    const done = files.filter((f) => f.status === "done");
    if (!done.length) return;
    if (done.length === 1) { downloadOne(done[0]); return; }

    setZipping(true);
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      for (const item of done) {
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}.${fmt.ext}`, item.blob);  // pass blob directly — no fetch needed
      }
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      triggerDownload(zipBlob, "converted-images.zip");
    } catch (err) {
      console.error("Zip error:", err);
      alert("Zip failed: " + err.message);
    }
    setZipping(false);
  };

  const clear = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  const done = files.filter((f) => f.status === "done");
  const totalOrig = done.reduce((s, f) => s + f.file.size, 0);
  const totalNew  = done.reduce((s, f) => s + f.size, 0);
  const totalSave = totalOrig > 0 ? (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1) : 0;
  const isPng = fmt.mime === "image/png";
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="bg-grid" /><div className="bg-glow" />
        <div className="wrap">
          <div className="badge">Image Converter</div>
          <h1>Convert <span>Any</span> Image</h1>
          <p className="sub">// png · jpg · gif · bmp · tiff · avif · svg · ico · webp → webp / jpeg / png</p>

          {/* Drop zone */}
          <div
            className={`drop${dragging ? " drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <div className="drop-icon">🖼️</div>
            <div className="drop-title">Drop images here</div>
            <div className="drop-sub">PNG · JPG · GIF · BMP · TIFF · AVIF · SVG · ICO · WebP<br />or click to browse</div>
            <button className="pick-btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>Choose Files</button>
            <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
          </div>

          {files.length > 0 && (<>
            {/* Controls */}
            <div className="ctrl">
              <span className="clabel">OUTPUT</span>
              <div className="fmt-tabs">
                {OUTPUT_FORMATS.map((f) => (
                  <button key={f.ext} className={`fmt-tab${fmt.ext === f.ext ? " on" : ""}`} onClick={() => setFmt(f)}>{f.label}</button>
                ))}
              </div>
              <div className="vdiv" />
              <span className="clabel" style={{ opacity: isPng ? .3 : 1 }}>QUALITY</span>
              <input type="range" min="1" max="100" value={quality} className="slider"
                disabled={isPng} style={{ opacity: isPng ? .3 : 1 }}
                onChange={(e) => setQuality(+e.target.value)} />
              <span className="qval" style={{ opacity: isPng ? .3 : 1 }}>{quality}%</span>
              {isPng && <span className="lossless">lossless</span>}
            </div>

            {/* File list */}
            <div className="flist">
              {files.map((item) => {
                const n = parseFloat(item.savings);
                return (
                  <div key={item.id} className={`fitem${item.status === "done" ? " done" : item.status === "error" ? " err" : ""}`}>
                    <NextImage className="thumb" src={item.preview} alt="" width={42} height={42} unoptimized onError={(e) => { e.currentTarget.style.opacity = ".2"; }} />
                    <div className="finfo">
                      <div className="fname">{item.file.name}</div>
                      <div className="fmeta">
                        <span className="ftag">{getExt(item.file.name)}</span>
                        {formatBytes(item.file.size)}
                        {item.status === "done" && <> → {formatBytes(item.size)}</>}
                        {item.status === "error" && <span className="errtxt">{item.error}</span>}
                      </div>
                    </div>
                    {item.status === "converting" && <div className="spin" />}
                    {item.status === "idle"       && <span style={{ color: "rgba(240,237,232,.15)", fontSize: 15 }}>○</span>}
                    {item.status === "error"      && <span style={{ color: "#ff5050", fontSize: 15 }}>✕</span>}
                    {item.status === "done"       && <>
                      <span className={n < 0 ? "bigger" : "saving"}>{n < 0 ? "+" : "−"}{Math.abs(n).toFixed(1)}%</span>
                      <button className="save-btn" onClick={() => downloadOne(item)}>↓ Save</button>
                    </>}
                    <button className="rm-btn" onClick={() => removeFile(item.id)}>✕</button>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="clear-btn" onClick={clear}>Clear All</button>
              {done.length > 0 && (
                <button className="zip-btn" onClick={downloadZip} disabled={zipping}>
                  {zipping ? "Zipping…" : done.length === 1 ? "↓ Download" : `↓ ZIP All (${done.length})`}
                </button>
              )}
              <button className="conv-btn" onClick={convertAll} disabled={converting || allDone}>
                {converting ? "Converting…" : `→ Convert to ${fmt.label}`}
              </button>
            </div>

            {/* Stats */}
            {done.length > 0 && (
              <div className="stats">
                <div className="stat"><span className="slbl">Converted</span><span className="sval" style={{ color: "#50ffa0" }}>{done.length}</span></div>
                <div className="stat"><span className="slbl">Original</span><span className="sval" style={{ color: "#f0ede8" }}>{formatBytes(totalOrig)}</span></div>
                <div className="stat"><span className="slbl">New Size</span><span className="sval" style={{ color: "#f0ede8" }}>{formatBytes(totalNew)}</span></div>
                <div className="stat">
                  <span className="slbl">Saved</span>
                  <span className="sval" style={{ color: parseFloat(totalSave) < 0 ? "#ffc850" : "#50ffa0" }}>
                    {parseFloat(totalSave) < 0 ? "+" : "−"}{Math.abs(parseFloat(totalSave)).toFixed(1)}%
                  </span>
                </div>
                <div className="stat"><span className="slbl">Format</span><span className="sval" style={{ color: "#ffc850", fontSize: 16 }}>.{fmt.ext}</span></div>
              </div>
            )}
          </>)}
        </div>
      </div>
    </>
  );
}