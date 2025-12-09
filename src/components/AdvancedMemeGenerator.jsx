
import React, { useEffect, useRef, useState } from "react";

/**
 * AdvancedMemeGenerator (iOS Optimized)
 * 
 * Fixes for Apple/Mobile:
 * 1. preventedDefault on touchmove to stop page scrolling while dragging.
 * 2. -webkit-touch-callout: none to prevent the "Save Image" popup on long press.
 * 3. try/catch on download to handle Safari CORS security errors.
 */
export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef(null);

  // Using corsproxy.io to bypass CORS issues with external images
  const cors = "https://corsproxy.io/?";
  const memeTemplates = [
    { name: "Drake Hotline", url: cors + "https://i.imgflip.com/30b1gx.jpg" },
    { name: "Distracted BF", url: cors + "https://i.imgflip.com/1ur9b0.jpg" },
    { name: "Two Buttons", url: cors + "https://i.imgflip.com/1g8my4.jpg" },
    { name: "Success Kid", url: cors + "https://i.imgflip.com/1bhk.jpg" },
    { name: "Change My Mind", url: cors + "https://i.imgflip.com/24y43o.jpg" },
    { name: "Left Exit 12", url: cors + "https://i.imgflip.com/22bdq6.jpg" },
    { name: "Batman Slapping Robin", url: cors + "https://i.imgflip.com/9ehk.jpg" },
    { name: "Disaster Girl", url: cors + "https://i.imgflip.com/23ls.jpg" },
    { name: "Mocking Spongebob", url: cors + "https://i.imgflip.com/1otk96.jpg" },
    { name: "Oprah You Get A", url: cors + "https://i.imgflip.com/1ihzfe.jpg" },
    { name: "Bernie I Am Once Again", url: cors + "https://i.imgflip.com/3oevdk.jpg" },
    { name: "Waiting Skeleton", url: cors + "https://i.imgflip.com/2wifvo.jpg" },
    { name: "Futurama Fry", url: cors + "https://i.imgflip.com/1bgw.jpg" },
    { name: "One Does Not Simply", url: cors + "https://i.imgflip.com/1bij.jpg" },
    { name: "Leonardo DiCaprio Cheers", url: cors + "https://i.imgflip.com/39t1o.jpg" },
    { name: "Woman Yelling at Cat", url: cors + "https://i.imgflip.com/345v97.jpg" },
  ];

  // 1. Load Image Helper
  const loadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result); // Base64 is always safe (no CORS)
      setTexts([]);
      setSelectedText(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
  };

  // 2. Add Text - Smart positioning based on canvas size
  const addText = () => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 500;
    const height = canvas ? canvas.height : 500;
    
    const newText = {
      id: Date.now(),
      content: "TAP TO EDIT",
      x: width / 2,
      y: height / 2,
      fontSize: Math.floor(width * 0.1), // Responsive font size
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 4,
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
    setSelectedText(null);
  };

  // 3. Render Canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Critical for Safari CORS handling
    if (typeof image === "string" && image.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      // Set resolution to actual image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // CSS handles the visual sizing (width: 100%)

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw Texts
      for (const text of texts) {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        ctx.font = `bold ${text.fontSize}px Impact, Arial Black, sans-serif`;
        ctx.lineJoin = "round"; // Smoother corners on stroke
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Stroke
        if (text.strokeWidth > 0) {
          ctx.strokeStyle = text.strokeColor;
          ctx.lineWidth = text.strokeWidth;
          ctx.strokeText(text.uppercase ? text.content.toUpperCase() : text.content, 0, 0);
        }

        // Fill
        ctx.fillStyle = text.color;
        ctx.fillText(text.uppercase ? text.content.toUpperCase() : text.content, 0, 0);
        
        // Highlight selection
        if (selectedText === text.id) {
            ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
                -ctx.measureText(text.content).width / 2 - 10,
                -text.fontSize / 2 - 5,
                ctx.measureText(text.content).width + 20,
                text.fontSize + 10
            );
        }
        
        ctx.restore();
      }
    };
    
    // Handle image load error (often CORS)
    img.onerror = () => {
        alert("Failed to load image template due to browser privacy settings. Please try uploading a file from your device instead.");
    };

    img.src = image;
  }, [image, texts, selectedText]);

  // 4. Coordinate Math (Pointer -> Canvas)
  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // 5. iOS Touch Event Listeners (Non-Passive)
  // We use this useEffect because React's onTouchMove is "passive" by default,
  // which allows scrolling. We need { passive: false } to stop scrolling.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefault = (e) => {
        // Only prevent scrolling if we are dragging text
        if (dragging) e.preventDefault();
    }

    // Attach non-passive listener
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventDefault);
  }, [dragging]);

  // Unified Start Handler (Mouse + Touch)
  const handleStart = (clientX, clientY) => {
    const p = getCanvasCoords(clientX, clientY);
    if (!p) return;

    // Hit detection: Check distance to text center
    // Increased hit radius for fat fingers (fontSize * 1.5)
    const clicked = texts.slice().reverse().find(t => { // reverse to check top-most text first
        const dist = Math.hypot(t.x - p.x, t.y - p.y);
        return dist < (t.fontSize * 1.5) + 20; 
    });

    if (clicked) {
      setSelectedText(clicked.id);
      setDragging(true);
    } else {
      setSelectedText(null);
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!dragging || !selectedText) return;
    const p = getCanvasCoords(clientX, clientY);
    if (!p) return;
    updateText(selectedText, { x: p.x, y: p.y });
  };

  const handleEnd = () => {
    setDragging(false);
  };

  // React Event Wrappers
  const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  
  const onTouchStart = (e) => {
      // Prevent default is crucial here for iOS
      // But we call handleStart first to see if we hit text
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
  };
  const onTouchMove = (e) => {
      if (dragging && e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
        // Deselect text before saving so the selection box doesn't appear
        setSelectedText(null);
        
        // Slight delay to allow state update to re-render canvas without selection box
        setTimeout(() => {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `meme-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        }, 50);
    } catch (err) {
        alert("Security Error: Safari cannot download this image directly because of 'Tainted Canvas' CORS rules.\n\nTip: Take a screenshot instead!");
        console.error(err);
    }
  };

  const selectedTextObj = texts.find((t) => t.id === selectedText);

  return (
    <div className="amg-root">
      <h1 className="amg-title">Meme Generator</h1>

      {!image ? (
        <div className="amg-start-screen">
            <div className="amg-upload-box" onClick={() => document.getElementById("file-input").click()}>
                <span style={{fontSize: "3rem"}}>📂</span>
                <p><b>Tap to upload image</b><br/>or choose a template below</p>
                <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </div>

            <div className="amg-grid-title">Popular Templates</div>
            <div className="amg-template-grid">
                {memeTemplates.map((t) => (
                    <div key={t.name} className="amg-card" onClick={() => setImage(t.url)}>
                        <img src={t.url} alt={t.name} loading="lazy" />
                        <span>{t.name}</span>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="amg-editor">
          
          <div className="amg-canvas-wrapper">
             <canvas
              ref={canvasRef}
              className="amg-canvas"
              // Mouse Events
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              // Touch Events
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={handleEnd}
             />
             <div className="amg-hint">Drag text to move • Tap text to edit</div>
          </div>

          <div className="amg-controls">
            <div className="amg-main-actions">
                <button className="amg-btn amg-btn-add" onClick={addText}>+ Text</button>
                <button className="amg-btn amg-btn-dl" onClick={handleDownload}>Download</button>
                <button className="amg-btn amg-btn-reset" onClick={() => setImage(null)}>Reset</button>
            </div>

            {selectedTextObj && (
              <div className="amg-text-options">
                <input
                    type="text"
                    className="amg-text-input"
                    value={selectedTextObj.content}
                    onChange={(e) => updateText(selectedText, { content: e.target.value })}
                    autoFocus
                />
                
                <div className="amg-sliders">
                    <label>
                        Size
                        <input type="range" min="10" max="200" value={selectedTextObj.fontSize} 
                            onChange={(e) => updateText(selectedText, { fontSize: +e.target.value })} />
                    </label>
                    <label>
                        Rotate
                        <input type="range" min="-180" max="180" value={selectedTextObj.rotation} 
                            onChange={(e) => updateText(selectedText, { rotation: +e.target.value })} />
                    </label>
                </div>

                <div className="amg-colors">
                    <input type="color" value={selectedTextObj.color} onChange={(e) => updateText(selectedText, { color: e.target.value })} />
                    <input type="color" value={selectedTextObj.strokeColor} onChange={(e) => updateText(selectedText, { strokeColor: e.target.value })} />
                    <button className="amg-btn-del" onClick={() => deleteText(selectedText)}>Remove</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* Reset & Base */
        * { box-sizing: border-box; }
        .amg-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .amg-title { text-align: center; margin-bottom: 20px; font-weight: 800; }

        /* Start Screen */
        .amg-upload-box {
            background: #f0f4f8;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            margin-bottom: 30px;
            transition: 0.2s;
        }
        .amg-upload-box:active { background: #e2e8f0; }
        
        .amg-grid-title { font-weight: bold; margin-bottom: 10px; font-size: 1.1rem; }
        .amg-template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
        }
        .amg-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            text-align: center;
            font-size: 0.8rem;
            background: #fff;
        }
        .amg-card img { width: 100%; height: 100px; object-fit: cover; display: block; }
        .amg-card span { display: block; padding: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Editor Layout */
        .amg-editor { display: flex; flex-direction: column; gap: 20px; }
        
        .amg-canvas-wrapper {
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 4px;
            overflow: hidden;
            background: #eee;
            /* CRITICAL FOR APPLE TOUCH */
            touch-action: none; 
        }

        .amg-canvas {
            width: 100%;
            height: auto;
            display: block;
            cursor: crosshair;
            /* CRITICAL: Prevents iOS context menu on long press */
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }

        .amg-hint {
            font-size: 0.75rem;
            color: #666;
            text-align: center;
            background: #f9f9f9;
            padding: 5px;
            border-top: 1px solid #ddd;
        }

        /* Controls */
        .amg-controls {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 15px;
        }
        .amg-main-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        .amg-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
        }
        .amg-btn-add { background: #3b82f6; color: white; }
        .amg-btn-dl { background: #10b981; color: white; }
        .amg-btn-reset { background: #ef4444; color: white; }

        .amg-text-options {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            animation: slideIn 0.2s ease;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .amg-text-input {
            padding: 10px;
            font-size: 1.1rem;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
        }
        .amg-sliders { display: flex; gap: 15px; justify-content: space-between; }
        .amg-sliders label { display: flex; flex-direction: column; font-size: 0.8rem; width: 100%; }
        
        .amg-colors { display: flex; align-items: center; gap: 10px; }
        .amg-colors input[type="color"] { border: none; width: 40px; height: 40px; padding: 0; background: none; }
        .amg-btn-del {
            margin-left: auto;
            background: #fff;
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 5px 12px;
            border-radius: 4px;
            font-weight: 600;
        }

        @media (min-width: 768px) {
            .amg-editor { flex-direction: row; align-items: flex-start; }
            .amg-canvas-wrapper { flex: 2; }
            .amg-controls { flex: 1; position: sticky; top: 20px; }
        }
      `}</style>
    </div>
  );
}
