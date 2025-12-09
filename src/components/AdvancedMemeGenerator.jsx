import React, { useEffect, useRef, useState } from "react";

/**
 * 🎨 MemeStudio Pro
 * A professional, zero-dependency React meme generator.
 * Features: Deep Etch (Eraser), Filters, Rich Text, Smart Cropping, Native Sharing.
 */

// --- ASSETS & CONSTANTS ---
const CORS_PROXY = "https://corsproxy.io/?";
const TEMPLATES = [
  { id: 't1', name: "Drake Hotline", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: 't2', name: "Distracted BF", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: 't3', name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: 't4', name: "Batman Slapping", url: "https://i.imgflip.com/9ehk.jpg" },
  { id: 't5', name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: 't6', name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
  { id: 't7', name: "Left Exit 12", url: "https://i.imgflip.com/22bdq6.jpg" },
  { id: 't8', name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { id: 't9', name: "Bernie Support", url: "https://i.imgflip.com/3oevdk.jpg" },
  { id: 't10', name: "Oprah GiveAway", url: "https://i.imgflip.com/1ihzfe.jpg" },
  { id: 't11', name: "Success Kid", url: "https://i.imgflip.com/1bhk.jpg" },
  { id: 't12', name: "Evil Kermit", url: "https://i.imgflip.com/1e7ql7.jpg" },
  { id: 't13', name: "Waiting Skeleton", url: "https://i.imgflip.com/2wifvo.jpg" },
  { id: 't14', name: "Always Has Been", url: "https://i.imgflip.com/46e43q.jpg" },
  { id: 't15', name: "Buff Doge", url: "https://i.imgflip.com/43a45p.jpg" },
  { id: 't16', name: "Trade Offer", url: "https://i.imgflip.com/54hjww.jpg" },
  { id: 't17', name: "Leonardo Toast", url: "https://i.imgflip.com/39t1o.jpg" },
  { id: 't18', name: "Sad Pablo", url: "https://i.imgflip.com/1c1uej.jpg" },
  { id: 't19', name: "Woman Yelling Cat", url: "https://i.imgflip.com/345v97.jpg" },
  { id: 't20', name: "Think About It", url: "https://i.imgflip.com/1h7in3.jpg" },
  { id: 't21', name: "Markiplier E", url: "https://i.imgflip.com/26am.jpg" },
  { id: 't22', name: "Uno Draw 25", url: "https://i.imgflip.com/3lmzyx.jpg" },
  { id: 't23', name: "Clown", url: "https://i.imgflip.com/38el31.jpg" },
  { id: 't24', name: "This Is Fine", url: "https://i.imgflip.com/wxica.jpg" },
];

const FONTS = ["Impact", "Arial", "Courier New", "Georgia", "Verdana", "Brush Script MT"];

export default function MemeStudio() {
  // --- STATE ---
  const [stage, setStage] = useState("home"); // home | crop | edit
  const [activeTab, setActiveTab] = useState("text"); // text | image | draw
  
  // Image Data
  const [originalImg, setOriginalImg] = useState(null); // The raw loaded file
  const [editorImg, setEditorImg] = useState(null); // The processed background (cropped/erased)
  
  // Crop State
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(1); // 1 = square

  // Edit State
  const [texts, setTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0 });
  const [brushSize, setBrushSize] = useState(30);
  const [isErasing, setIsErasing] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const cropRef = useRef(null);
  const dragRef = useRef({ active: false, x: 0, y: 0 });

  // --- ACTIONS ---

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImg(ev.target.result);
        setStage("crop");
        setCropScale(1); 
        setCropPos({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const loadTemplate = (url) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        setEditorImg(c.toDataURL());
        setStage("edit");
        setTexts([]);
        setFilters({ brightness: 100, contrast: 100, grayscale: 0 });
    };
    img.src = CORS_PROXY + url;
  };

  // --- CROP ENGINE ---
  const renderCrop = () => {
    const c = cropRef.current;
    if (!c || !originalImg) return;
    const ctx = c.getContext("2d");
    const img = new Image();
    img.onload = () => {
        // Fixed canvas size for UI
        c.width = 600; 
        c.height = 600 / aspectRatio; // Adjust height based on aspect ratio
        
        ctx.clearRect(0, 0, c.width, c.height);
        
        // Background Fill
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, c.width, c.height);

        // Draw Image Transformed
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2);
        ctx.scale(cropScale, cropScale);
        ctx.translate(cropPos.x, cropPos.y);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
        
        // Grid Overlay
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.width * 0.33, 0); ctx.lineTo(c.width * 0.33, c.height);
        ctx.moveTo(c.width * 0.66, 0); ctx.lineTo(c.width * 0.66, c.height);
        ctx.moveTo(0, c.height * 0.33); ctx.lineTo(c.width, c.height * 0.33);
        ctx.moveTo(0, c.height * 0.66); ctx.lineTo(c.width, c.height * 0.66);
        ctx.stroke();
    };
    img.src = originalImg;
  };
  
  useEffect(renderCrop, [originalImg, cropScale, cropPos, aspectRatio, stage]);

  const saveCrop = () => {
    const c = cropRef.current;
    setEditorImg(c.toDataURL());
    setStage("edit");
    setTexts([]);
    setFilters({ brightness: 100, contrast: 100, grayscale: 0 });
  };

  // --- EDIT ENGINE ---
  const renderEditor = () => {
    const c = canvasRef.current;
    if (!c || !editorImg) return;
    const ctx = c.getContext("2d");
    const img = new Image();
    img.onload = () => {
        if (c.width !== img.width) {
            c.width = img.width;
            c.height = img.height;
        }

        ctx.clearRect(0, 0, c.width, c.height);
        
        // 1. Apply Filters
        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%)`;
        
        // 2. Draw Background
        ctx.drawImage(img, 0, 0);
        ctx.filter = "none"; // Reset for text

        // 3. Draw Texts
        texts.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate((t.rotation * Math.PI) / 180);
            ctx.font = `bold ${t.fontSize}px "${t.fontFamily}"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineJoin = "round";
            
            if (t.shadow) {
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }

            if (t.strokeWidth > 0) {
                ctx.strokeStyle = t.strokeColor;
                ctx.lineWidth = t.strokeWidth;
                ctx.strokeText(t.uppercase ? t.text.toUpperCase() : t.text, 0, 0);
            }
            
            ctx.fillStyle = t.color;
            ctx.fillText(t.uppercase ? t.text.toUpperCase() : t.text, 0, 0);
            
            // Selection Box
            if (selectedId === t.id && !isErasing) {
                const m = ctx.measureText(t.text);
                const w = m.width + 20;
                const h = t.fontSize + 10;
                ctx.shadowColor = "transparent";
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-w/2, -h/2, w, h);
            }
            ctx.restore();
        });
    };
    img.src = editorImg;
  };

  useEffect(renderEditor, [editorImg, texts, selectedId, filters, stage]);

  // --- INTERACTION HANDLERS ---
  const getPointerPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        rawX: clientX,
        rawY: clientY
    };
  };

  const handleStart = (e) => {
    if (stage === "crop") {
        const { rawX, rawY } = getPointerPos(e, cropRef.current);
        dragRef.current = { active: true, lx: rawX, ly: rawY };
        return;
    }
    
    if (isErasing) {
        const { x, y } = getPointerPos(e, canvasRef.current);
        dragRef.current = { active: true, lx: x, ly: y };
        handleEraseMove(x, y); // Erase on tap
        return;
    }

    const { x, y } = getPointerPos(e, canvasRef.current);
    // Text Hit Detection
    const clicked = texts.slice().reverse().find(t => Math.hypot(t.x - x, t.y - y) < t.fontSize);
    if (clicked) {
        setSelectedId(clicked.id);
        dragRef.current = { active: true, lx: x, ly: y };
        setActiveTab("text");
    } else {
        setSelectedId(null);
    }
  };

  const handleMove = (e) => {
    if (!dragRef.current.active) return;
    e.preventDefault(); // Stop Scroll

    if (stage === "crop") {
        const { rawX, rawY } = getPointerPos(e, cropRef.current);
        const dx = rawX - dragRef.current.lx;
        const dy = rawY - dragRef.current.ly;
        setCropPos(p => ({ x: p.x + (dx/cropScale), y: p.y + (dy/cropScale) }));
        dragRef.current.lx = rawX;
        dragRef.current.ly = rawY;
        return;
    }

    const { x, y } = getPointerPos(e, canvasRef.current);

    if (isErasing) {
        handleEraseMove(x, y);
    } else if (selectedId) {
        setTexts(prev => prev.map(t => t.id === selectedId ? { ...t, x, y } : t));
    }
  };

  const handleEnd = () => {
    if (isErasing && dragRef.current.active) {
        // Commit erase to image
        setEditorImg(canvasRef.current.toDataURL());
    }
    dragRef.current.active = false;
  };

  const handleEraseMove = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  };

  // --- TEXT TOOLS ---
  const addText = () => {
    const c = canvasRef.current;
    const newText = {
        id: Date.now(),
        text: "DOUBLE TAP",
        x: c.width / 2,
        y: c.height / 2,
        fontSize: c.width * 0.1,
        fontFamily: "Impact",
        color: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 5,
        rotation: 0,
        uppercase: true,
        shadow: true
    };
    setTexts([...texts, newText]);
    setSelectedId(newText.id);
    setIsErasing(false);
    setActiveTab("text");
  };

  const updateText = (key, val) => {
    if (!selectedId) return;
    setTexts(p => p.map(t => t.id === selectedId ? { ...t, [key]: val } : t));
  };

  // --- EXPORT & SHARE ---
  const handleShare = async () => {
    setSelectedId(null); // Hide selection box
    setTimeout(async () => {
        try {
            const dataUrl = canvasRef.current.toDataURL("image/png");
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "meme_studio_export.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "MemeStudio Export",
                    text: "Created with MemeStudio 🎨"
                });
            } else {
                // Fallback for Desktop
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = "meme_studio.png";
                a.click();
            }
        } catch (e) {
            alert("Sharing failed. Image downloaded instead.");
        }
    }, 100);
  };

  // --- RENDER UI ---
  const selText = texts.find(t => t.id === selectedId);

  return (
    <div className="ms-root">
      {/* 1. HEADER */}
      <div className="ms-header">
        <div className="ms-logo">✨ MemeStudio</div>
        {stage !== "home" && <button className="ms-btn-icon" onClick={() => setStage("home")}>✕</button>}
      </div>

      {/* 2. MAIN STAGE */}
      <div className="ms-stage">
        
        {/* HOME SCREEN */}
        {stage === "home" && (
            <div className="ms-home">
                <div className="ms-hero" onClick={() => document.getElementById("up-in").click()}>
                    <div className="ms-hero-icon">📸</div>
                    <h3>Open Photo</h3>
                    <p>Tap to upload from gallery</p>
                    <input id="up-in" type="file" accept="image/*" onChange={handleUpload} hidden />
                </div>
                
                <div className="ms-section-title">Trending Templates</div>
                <div className="ms-grid">
                    {TEMPLATES.map(t => (
                        <div key={t.id} className="ms-card" onClick={() => loadTemplate(t.url)}>
                            <img src={t.url} alt={t.name} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CROP SCREEN */}
        {stage === "crop" && (
            <div className="ms-crop">
                <div className="ms-canvas-box">
                    <canvas 
                        ref={cropRef} 
                        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                    />
                </div>
                <div className="ms-tools-panel">
                    <div className="ms-row">
                        <label>Aspect Ratio</label>
                        <div className="ms-btn-group">
                            <button className={aspectRatio===1 ? 'active' : ''} onClick={() => setAspectRatio(1)}>1:1</button>
                            <button className={aspectRatio===0.8 ? 'active' : ''} onClick={() => setAspectRatio(0.8)}>4:5</button>
                            <button className={aspectRatio===1.77 ? 'active' : ''} onClick={() => setAspectRatio(1.77)}>16:9</button>
                        </div>
                    </div>
                    <div className="ms-row">
                        <label>Zoom</label>
                        <input type="range" min="0.5" max="3" step="0.1" value={cropScale} onChange={e=>setCropScale(+e.target.value)} />
                    </div>
                    <button className="ms-btn-primary" onClick={saveCrop}>Continue →</button>
                </div>
            </div>
        )}

        {/* EDIT SCREEN */}
        {stage === "edit" && (
            <div className="ms-edit">
                <div className="ms-canvas-box edit-mode">
                    <canvas 
                        ref={canvasRef} 
                        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
                    />
                </div>

                {/* BOTTOM TOOLBAR */}
                <div className="ms-toolbar">
                    {/* MENU TABS */}
                    <div className="ms-tabs">
                        <button className={activeTab==='text' ? 'active' : ''} onClick={()=>{setActiveTab('text'); setIsErasing(false);}}>
                            🅰️ Text
                        </button>
                        <button className={activeTab==='image' ? 'active' : ''} onClick={()=>{setActiveTab('image'); setIsErasing(false);}}>
                            🎨 Filters
                        </button>
                        <button className={activeTab==='draw' ? 'active' : ''} onClick={()=>{setActiveTab('draw'); setIsErasing(true); setSelectedId(null);}}>
                            🧹 Eraser
                        </button>
                    </div>

                    {/* DYNAMIC CONTROLS */}
                    <div className="ms-controls">
                        
                        {activeTab === 'text' && (
                            <div className="ms-panel-text">
                                <div className="ms-row-quick">
                                    <button className="ms-btn-add" onClick={addText}>+ New Text</button>
                                    {selText && <button className="ms-btn-danger" onClick={() => {
                                        setTexts(texts.filter(t => t.id !== selectedId));
                                        setSelectedId(null);
                                    }}>Delete</button>}
                                </div>
                                {selText ? (
                                    <>
                                        <input className="ms-input-text" value={selText.text} onChange={e=>updateText('text', e.target.value)} />
                                        <div className="ms-scroll-row">
                                            {FONTS.map(f => (
                                                <button key={f} className={`ms-pill ${selText.fontFamily===f?'active':''}`} 
                                                    onClick={()=>updateText('fontFamily', f)} style={{fontFamily:f}}>
                                                    Aa
                                                </button>
                                            ))}
                                        </div>
                                        <div className="ms-row-compact">
                                            <input type="color" value={selText.color} onChange={e=>updateText('color', e.target.value)} />
                                            <div className="ms-slider-wrap">
                                                <span>Size</span>
                                                <input type="range" min="10" max="200" value={selText.fontSize} onChange={e=>updateText('fontSize', +e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="ms-row-compact">
                                            <input type="color" value={selText.strokeColor} onChange={e=>updateText('strokeColor', e.target.value)} />
                                            <div className="ms-slider-wrap">
                                                <span>Outline</span>
                                                <input type="range" min="0" max="20" value={selText.strokeWidth} onChange={e=>updateText('strokeWidth', +e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                ) : <div className="ms-hint">Tap text to edit or add new</div>}
                            </div>
                        )}

                        {activeTab === 'image' && (
                            <div className="ms-panel-filters">
                                <div className="ms-row">
                                    <label>Brightness</label>
                                    <input type="range" min="0" max="200" value={filters.brightness} onChange={e=>setFilters({...filters, brightness: +e.target.value})} />
                                </div>
                                <div className="ms-row">
                                    <label>Contrast</label>
                                    <input type="range" min="0" max="200" value={filters.contrast} onChange={e=>setFilters({...filters, contrast: +e.target.value})} />
                                </div>
                                <div className="ms-row">
                                    <label>B&W</label>
                                    <input type="range" min="0" max="100" value={filters.grayscale} onChange={e=>setFilters({...filters, grayscale: +e.target.value})} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'draw' && (
                            <div className="ms-panel-draw">
                                <label>Eraser Size: {brushSize}px</label>
                                <input type="range" min="5" max="100" value={brushSize} onChange={e=>setBrushSize(+e.target.value)} />
                                <p className="ms-hint-sm">Rub finger on image to make background transparent</p>
                            </div>
                        )}
                    </div>
                    
                    {/* EXPORT BUTTON */}
                    <button className="ms-btn-share" onClick={handleShare}>
                        <span className="ms-icon">🚀</span> Share to Apps
                        <div className="ms-subtext">WhatsApp • Insta • X • Facebook</div>
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* 3. STYLES */}
      <style>{`
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --accent: #3b82f6;
            --text: #f8fafc;
            --subtext: #94a3b8;
            --border: #334155;
            --danger: #ef4444;
        }
        .ms-root {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex; flex-direction: column;
            max-width: 600px; margin: 0 auto;
            position: relative; overflow: hidden;
        }
        /* Header */
        .ms-header {
            padding: 16px; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid var(--border); background: var(--bg); z-index: 10;
        }
        .ms-logo { font-weight: 900; font-size: 1.2rem; background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ms-btn-icon { background: none; border: none; color: var(--text); font-size: 1.5rem; cursor: pointer; }

        /* Stage */
        .ms-stage { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

        /* Home */
        .ms-home { padding: 20px; }
        .ms-hero {
            background: var(--surface); border: 2px dashed var(--border); border-radius: 16px;
            padding: 40px; text-align: center; margin-bottom: 30px; cursor: pointer;
            transition: 0.2s;
        }
        .ms-hero:active { background: #2d3e56; }
        .ms-hero-icon { font-size: 3rem; margin-bottom: 10px; }
        .ms-hero h3 { margin: 0 0 5px 0; }
        .ms-hero p { margin: 0; color: var(--subtext); font-size: 0.9rem; }
        
        .ms-section-title { font-weight: bold; margin-bottom: 15px; color: var(--subtext); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .ms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-bottom: 40px; }
        .ms-card { aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #000; cursor: pointer; border: 1px solid var(--border); }
        .ms-card img { width: 100%; height: 100%; object-fit: cover; transition: 0.2s; }
        .ms-card:active img { opacity: 0.7; }

        /* Crop & Edit Common */
        .ms-canvas-box {
            flex: 1; background: #000; display: flex; align-items: center; justify-content: center;
            overflow: hidden; touch-action: none; position: relative;
        }
        .ms-canvas-box.edit-mode {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2nk5eX9z0SRgXrAAKQI500g6wZ0Y4g2A6oR7B50A9A8iGoGVDWjmgFkAwCAMx0Ff/QW3gAAAABJRU5ErkJggg==');
        }
        canvas { max-width: 100%; max-height: 100%; box-shadow: 0 0 20px rgba(0,0,0,0.5); }

        /* Tools Panel */
        .ms-tools-panel { padding: 20px; background: var(--surface); border-top: 1px solid var(--border); }
        .ms-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .ms-btn-group { display: flex; background: var(--bg); padding: 4px; border-radius: 8px; }
        .ms-btn-group button {
            background: none; border: none; color: var(--subtext); padding: 6px 12px;
            border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
        }
        .ms-btn-group button.active { background: var(--surface); color: var(--text); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        
        input[type=range] { flex: 1; margin-left: 15px; accent-color: var(--accent); }

        .ms-btn-primary { width: 100%; padding: 14px; background: var(--accent); color: white; border: none; border-radius: 12px; font-weight: bold; font-size: 1rem; cursor: pointer; }
        
        /* Edit Toolbar */
        .ms-toolbar { background: var(--surface); border-top: 1px solid var(--border); }
        .ms-tabs { display: flex; border-bottom: 1px solid var(--border); }
        .ms-tabs button {
            flex: 1; padding: 12px; background: none; border: none; color: var(--subtext);
            font-size: 0.9rem; font-weight: 600; cursor: pointer;
        }
        .ms-tabs button.active { color: var(--accent); border-bottom: 2px solid var(--accent); background: rgba(59, 130, 246, 0.1); }
        
        .ms-controls { padding: 16px; min-height: 180px; }
        
        /* Text Controls */
        .ms-row-quick { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .ms-btn-add { background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; }
        .ms-btn-danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; }
        
        .ms-input-text { width: 100%; padding: 10px; background: var(--bg); border: 1px solid var(--border); color: white; border-radius: 8px; margin-bottom: 12px; font-size: 1rem; }
        
        .ms-scroll-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 10px; }
        .ms-pill {
            background: var(--bg); border: 1px solid var(--border); color: var(--text);
            padding: 6px 12px; border-radius: 6px; white-space: nowrap; font-size: 1rem;
        }
        .ms-pill.active { border-color: var(--accent); color: var(--accent); }
        
        .ms-row-compact { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
        .ms-slider-wrap { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--subtext); }
        input[type=color] { width: 32px; height: 32px; border: none; padding: 0; background: none; border-radius: 50%; overflow: hidden; cursor: pointer; }
        
        .ms-hint { text-align: center; color: var(--subtext); padding: 20px; font-size: 0.9rem; opacity: 0.7; }
        .ms-hint-sm { text-align: center; color: var(--subtext); font-size: 0.8rem; margin-top: 5px; }

        /* Share Button */
        .ms-btn-share {
            width: calc(100% - 32px); margin: 0 16px 16px 16px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white; border: none; padding: 14px; border-radius: 12px;
            font-weight: bold; font-size: 1.1rem; cursor: pointer;
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .ms-btn-share:active { transform: scale(0.98); }
        .ms-subtext { font-size: 0.75rem; font-weight: normal; opacity: 0.9; }

      `}</style>
    </div>
  );
}
