import React, { useEffect, useRef, useState } from "react";

/**
 * AdvancedMemeGenerator — responsive + 50 templates + touch support
 * Drop-in replacement for your previous component.
 */
export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const canvasRef = useRef(null);

  // 50 templates (use corsproxy prefix like you had)
  const cors = "https://corsproxy.io/?";
  const memeTemplates = [
    { name: "Drake Hotline", url: cors + "https://i.imgflip.com/30b1gx.jpg" },
    { name: "Distracted BF", url: cors + "https://i.imgflip.com/1ur9b0.jpg" },
    { name: "Two Buttons", url: cors + "https://i.imgflip.com/1g8my4.jpg" },
    { name: "Success Kid", url: cors + "https://i.imgflip.com/1bhk.jpg" },
    { name: "Roll Safe", url: cors + "https://i.imgflip.com/1h7in3.jpg" },
    { name: "Change My Mind", url: cors + "https://i.imgflip.com/24y43o.jpg" },
    { name: "Mocking Spongebob", url: cors + "https://i.imgflip.com/1otk96.jpg" },
    { name: "Gru's Plan", url: cors + "https://i.imgflip.com/26jxvz.jpg" },
    { name: "Expanding Brain", url: cors + "https://i.imgflip.com/1jwhww.jpg" },
    { name: "Left Exit 12 Off Ramp", url: cors + "https://i.imgflip.com/22bdq6.jpg" },
    { name: "Is This a Pigeon?", url: cors + "https://i.imgflip.com/1o00in.jpg" },
    { name: "Surprised Pikachu", url: cors + "https://i.imgflip.com/2k5h6k.jpg" },
    { name: "Batman Slapping Robin", url: cors + "https://i.imgflip.com/9ehk.jpg" },
    { name: "One Does Not Simply", url: cors + "https://i.imgflip.com/1bij.jpg" },
    { name: "Ancient Aliens", url: cors + "https://i.imgflip.com/26gxvz.jpg" },
    { name: "The Scroll of Truth", url: cors + "https://i.imgflip.com/3lmzyx.jpg" },
    { name: "Hide the Pain Harold", url: cors + "https://i.imgflip.com/1bip.jpg" },
    { name: "Change My Mind 2", url: cors + "https://i.imgflip.com/2gnnjh.jpg" },
    { name: "Leonardo DiCaprio Cheers", url: cors + "https://i.imgflip.com/39t1o.jpg" },
    { name: "Arthur Fist", url: cors + "https://i.imgflip.com/2d3al0.jpg" },
    { name: "Distracted Boyfriend 2", url: cors + "https://i.imgflip.com/4acd5.jpg" },
    { name: "The Office - No God Please", url: cors + "https://i.imgflip.com/2fm6x.jpg" },
    { name: "Waiting Skeleton", url: cors + "https://i.imgflip.com/2wifvo.jpg" },
    { name: "Oprah You Get A", url: cors + "https://i.imgflip.com/1ihzfe.jpg" },
    { name: "First World Problems", url: cors + "https://i.imgflip.com/1f8odt.jpg" },
    { name: "Confused Nick Young", url: cors + "https://i.imgflip.com/1g8my4.jpg" },
    { name: "Panik Kalm Panik", url: cors + "https://i.imgflip.com/3qj6f.jpg" },
    { name: "Blinking White Guy", url: cors + "https://i.imgflip.com/1y0g6.jpg" },
    { name: "Gru Laughing", url: cors + "https://i.imgflip.com/3vzej.jpg" },
    { name: "Bernie I Am Once Again Asking", url: cors + "https://i.imgflip.com/3oevdk.jpg" },
    { name: "This Is Fine", url: cors + "https://i.imgflip.com/1ihzfe.jpg" },
    { name: "Woman Yelling at Cat", url: cors + "https://i.imgflip.com/345v97.jpg" },
    { name: "You vs. The Guy She Told You Not to Worry About", url: cors + "https://i.imgflip.com/2wifvo.jpg" },
    { name: "Sweating Jordan Peele", url: cors + "https://i.imgflip.com/2wifvo.jpg" },
    { name: "Captain Picard Facepalm", url: cors + "https://i.imgflip.com/1o00in.jpg" },
    { name: "Roll Safe 2", url: cors + "https://i.imgflip.com/3lmzyx.jpg" },
    { name: "Philosoraptor", url: cors + "https://i.imgflip.com/1otk96.jpg" },
    { name: "Dr Evil 'One Million Dollars'", url: cors + "https://i.imgflip.com/1h7in3.jpg" },
    { name: "They Had Us in the First Half", url: cors + "https://i.imgflip.com/2wifvo.jpg" },
    { name: "Laughing Leo", url: cors + "https://i.imgflip.com/39t1o.jpg" },
    { name: "Stonks", url: cors + "https://i.imgflip.com/327b1.jpg" },
    { name: "Y U NO", url: cors + "https://i.imgflip.com/1bhk.jpg" },
    { name: "Imagination Spongebob", url: cors + "https://i.imgflip.com/2k5h6k.jpg" },
    { name: "Skeptical Baby", url: cors + "https://i.imgflip.com/1bij.jpg" },
    { name: "Ancient Aliens 2", url: cors + "https://i.imgflip.com/26gxvz.jpg" },
    { name: "Distracted Boyfriend 3", url: cors + "https://i.imgflip.com/1ur9b0.jpg" },
    { name: "Minor Mistake Marvin", url: cors + "https://i.imgflip.com/2gnnjh.jpg" },
  ];

  // Helpers
  const loadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result); // base64 DataURL
      setTexts([]);
      setSelectedText(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) loadImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) loadImageFile(file);
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const newText = {
      id: Date.now(),
      content: "YOUR TEXT",
      x: canvas ? canvas.width / 2 : 300,
      y: canvas ? canvas.height / 4 : 100,
      fontSize: 60,
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 5,
      rotation: 0,
      uppercase: true,
    };
    setTexts((p) => [...p, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (id, updates) => {
    setTexts((p) => p.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteText = (id) => {
    setTexts((p) => p.filter((t) => t.id !== id));
    if (selectedText === id) setSelectedText(null);
  };

  // Draw image + texts to canvas. Set crossOrigin only for external http URLs.
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (typeof image === "string" && image.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      // Set canvas internal pixel size for crisp rendering
      canvas.width = img.width;
      canvas.height = img.height;

      // Make canvas visually responsive: scale to container width (CSS)
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      for (const text of texts) {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        ctx.font = `bold ${text.fontSize}px Impact, Arial Black, sans-serif`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const display = text.uppercase ? text.content.toUpperCase() : text.content;
        if (text.strokeWidth > 0) ctx.strokeText(display, 0, 0);
        ctx.fillText(display, 0, 0);
        ctx.restore();
      }
    };

    img.src = image;
  }, [image, texts]);

  // Click to select (works with CSS scaled canvas)
  const getCanvasPointerPos = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleCanvasClick = (e) => {
    const p = getCanvasPointerPos(e.clientX, e.clientY);
    if (!p) return;
    const clicked = texts.find((t) => Math.hypot(t.x - p.x, t.y - p.y) < t.fontSize * 1.2);
    setSelectedText(clicked ? clicked.id : null);
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    const p = getCanvasPointerPos(e.clientX, e.clientY);
    if (!p) return;
    const clicked = texts.find((t) => Math.hypot(t.x - p.x, t.y - p.y) < t.fontSize * 1.2);
    if (clicked) {
      setSelectedText(clicked.id);
      setDragging(true);
    }
  };
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e) => {
    if (!dragging || !selectedText) return;
    const p = getCanvasPointerPos(e.clientX, e.clientY);
    if (!p) return;
    updateText(selectedText, { x: p.x, y: p.y });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!e.touches?.length) return;
    const t0 = e.touches[0];
    const p = getCanvasPointerPos(t0.clientX, t0.clientY);
    if (!p) return;
    const clicked = texts.find((t) => Math.hypot(t.x - p.x, t.y - p.y) < t.fontSize * 1.2);
    if (clicked) {
      setSelectedText(clicked.id);
      setDragging(true);
      e.preventDefault();
    }
  };
  const handleTouchMove = (e) => {
    if (!dragging || !selectedText || !e.touches?.length) return;
    const t0 = e.touches[0];
    const p = getCanvasPointerPos(t0.clientX, t0.clientY);
    if (!p) return;
    updateText(selectedText, { x: p.x, y: p.y });
    e.preventDefault();
  };
  const handleTouchEnd = () => setDragging(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Create a temporary link to download the current canvas image
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const selectedTextObj = texts.find((t) => t.id === selectedText);

  return (
    <div className="amg-root">
      <h1 className="amg-title">Meme Generator</h1>

      <div className="amg-top">
        <div
          className={`amg-drop ${isDraggingOver ? "amg-drop--over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("amg-file")?.click()}
        >
          <div className="amg-drop-icon">📤</div>
          <p>Drop image here or click to upload</p>
          <input id="amg-file" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </div>

        <div className="amg-templates">
          <h3>Templates</h3>
          <div className="amg-template-grid">
            {memeTemplates.map((t) => (
              <button key={t.name} className="amg-template-btn" onClick={() => setImage(t.url)}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {image && (
        <div className="amg-editor">
          <div className="amg-controls">
            <button className="amg-btn amg-btn--accent" onClick={addText}>
              + Add Text
            </button>

            {selectedTextObj && (
              <div className="amg-panel">
                <input
                  className="amg-input"
                  type="text"
                  value={selectedTextObj.content}
                  onChange={(e) => updateText(selectedText, { content: e.target.value })}
                />

                <label className="amg-label">Size: {selectedTextObj.fontSize}px</label>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={selectedTextObj.fontSize}
                  onChange={(e) => updateText(selectedText, { fontSize: +e.target.value })}
                />

                <label className="amg-label">Outline: {selectedTextObj.strokeWidth}px</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={selectedTextObj.strokeWidth}
                  onChange={(e) => updateText(selectedText, { strokeWidth: +e.target.value })}
                />

                <div className="amg-color-row">
                  <label>
                    Fill
                    <input type="color" value={selectedTextObj.color} onChange={(e) => updateText(selectedText, { color: e.target.value })} />
                  </label>
                  <label>
                    Stroke
                    <input type="color" value={selectedTextObj.strokeColor} onChange={(e) => updateText(selectedText, { strokeColor: e.target.value })} />
                  </label>
                </div>

                <label className="amg-label">Rotate: {selectedTextObj.rotation}°</label>
                <input type="range" min="-180" max="180" value={selectedTextObj.rotation} onChange={(e) => updateText(selectedText, { rotation: +e.target.value })} />

                <label className="amg-checkbox">
                  <input type="checkbox" checked={selectedTextObj.uppercase} onChange={(e) => updateText(selectedText, { uppercase: e.target.checked })} />
                  UPPERCASE
                </label>

                <button className="amg-btn amg-btn--danger" onClick={() => deleteText(selectedText)}>
                  Delete Text
                </button>
              </div>
            )}

            <button className="amg-btn amg-btn--primary" onClick={handleDownload}>
              Download Meme
            </button>
          </div>

          <div className="amg-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="amg-canvas"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              // accessibility
              role="img"
            />
            <div className="amg-hint">Tap text to select • drag to move (touch & mouse supported)</div>
          </div>
        </div>
      )}

      {/* Minimal responsive styling */}
      <style>{`
        .amg-root {
          max-width: 1200px;
          margin: 20px auto;
          padding: 16px;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #0f172a;
        }
        .amg-title { text-align: center; font-size: 2.2rem; margin-bottom: 16px; }
        .amg-top {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 16px;
          margin-bottom: 20px;
        }
        .amg-drop {
          background: white;
          border-radius: 12px;
          border: 3px dashed #94a3b8;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(2,6,23,0.06);
        }
        .amg-drop--over { background: #eef2ff; border-color: #2563eb; }
        .amg-drop-icon { font-size: 48px; margin-bottom: 6px; }
        .amg-templates { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 8px 24px rgba(2,6,23,0.06); }
        .amg-templates h3 { margin: 0 0 10px 0; }
        .amg-template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 420px; overflow:auto; }
        .amg-template-btn {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e6eef8;
          background: #f8fafc;
          cursor: pointer;
          text-align: left;
          font-weight: 600;
        }

        .amg-editor {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 18px;
        }
        .amg-controls { display:flex; flex-direction: column; gap: 12px; }
        .amg-btn { padding: 12px; border-radius: 10px; border: none; cursor:pointer; font-weight:700; }
        .amg-btn--accent { background:#10b981; color:white; }
        .amg-btn--primary { background:#8b5cf6; color:white; }
        .amg-btn--danger { background:#ef4444; color:white; }
        .amg-panel { background: white; padding: 12px; border-radius: 10px; box-shadow: 0 8px 18px rgba(2,6,23,0.06); display:flex; flex-direction:column; gap:10px; }
        .amg-input { padding:8px; border-radius:8px; border:1px solid #e6eef8; font-size: 14px; }
        .amg-label { font-size: 13px; margin-top: 4px; color: #334155; }

        .amg-color-row { display:flex; gap:12px; align-items:center; }
        .amg-checkbox { display:flex; align-items:center; gap:8px; font-size: 14px; }

        .amg-canvas-wrap { background: white; padding: 12px; border-radius: 12px; box-shadow: 0 8px 30px rgba(2,6,23,0.08); display:flex; flex-direction:column; gap:10px; align-items:stretch; }
        .amg-canvas { width:100%; height:auto; border-radius:8px; display:block; touch-action: none; } /* touch-action none prevents page scrolling while dragging on canvas */
        .amg-hint { font-size: 13px; color: #64748b; text-align: center; }

        /* Responsive adjustments */
        @media (max-width: 980px) {
          .amg-top { grid-template-columns: 1fr; }
          .amg-editor { grid-template-columns: 1fr; }
          .amg-templates { order: 2; }
          .amg-drop { order: 1; }
          .amg-template-grid { grid-template-columns: repeat(3, 1fr); }
          .amg-controls { order: 2; }
        }
        @media (max-width: 520px) {
          .amg-template-grid { grid-template-columns: repeat(2, 1fr); }
          .amg-template-btn { font-size: 13px; padding:8px; }
          .amg-title { font-size: 1.6rem; }
          .amg-drop { padding: 18px; }
        }
      `}</style>
    </div>
  );
     }
