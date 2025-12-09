import { useState, useRef, useEffect } from "react";

export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const canvasRef = useRef(null);

  const memeTemplates = [
    { name: "Drake Hotline", url: "https://corsproxy.io/?https://i.imgflip.com/30b1gx.jpg" },
    { name: "Distracted BF", url: "https://corsproxy.io/?https://i.imgflip.com/1ur9b0.jpg" },
    { name: "Two Buttons", url: "https://corsproxy.io/?https://i.imgflip.com/1g8my4.jpg" },
    { name: "Success Kid", url: "https://corsproxy.io/?https://i.imgflip.com/1bhk.jpg" },
  ];

  const loadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result); // base64
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
    const file = e.dataTransfer.files?.[0];
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
    setTexts((prev) => [...prev, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (id, updates) => {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteText = (id) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    if (selectedText === id) setSelectedText(null);
  };

  // 🔥 FIXED: draw only when image is really loaded
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Only apply CORS to external image URLs, never to base64 uploads
    if (image.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      texts.forEach((text) => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        ctx.font = `bold ${text.fontSize}px Impact, Arial Black, sans-serif`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const str = text.uppercase ? text.content.toUpperCase() : text.content;

        if (text.strokeWidth > 0) ctx.strokeText(str, 0, 0);
        ctx.fillText(str, 0, 0);

        ctx.restore();
      });
    };

    img.src = image;
  }, [image, texts]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clicked = texts.find((t) => Math.hypot(t.x - x, t.y - y) < t.fontSize * 1.2);
    setSelectedText(clicked ? clicked.id : null);
  };

  const handleMouseDown = () => selectedText && setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging || !selectedText) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    updateText(selectedText, { x, y });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const selectedTextObj = texts.find((t) => t.id === selectedText);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px", background: "#f9fafb" }}>
      <h1 style={{ textAlign: "center", fontSize: "3rem", marginBottom: "30px", color: "#1f2937" }}>
        Meme Generator
      </h1>

      {/* Upload + Templates */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Upload Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            background: isDraggingOver ? "#dbeafe" : "white",
            border: `4px dashed ${isDraggingOver ? "#3b82f6" : "#94a3b8"}`,
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "80px" }}>Drop Image</div>
          <p style={{ fontSize: "20px", marginTop: "16px" }}>or click to upload</p>
          <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </div>

        {/* Templates */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Templates</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {memeTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => setImage(t.url)}
                style={{
                  padding: "14px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Section */}
      {image && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "32px" }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <button
              onClick={addText}
              style={{
                padding: "18px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              + Add Text
            </button>

            {selectedTextObj && (
              <div
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <input
                  type="text"
                  value={selectedTextObj.content}
                  onChange={(e) => updateText(selectedText, { content: e.target.value })}
                  style={{
                    padding: "12px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                  }}
                />

                <input
                  type="range"
                  min="20"
                  max="150"
                  value={selectedTextObj.fontSize}
                  onChange={(e) => updateText(selectedText, { fontSize: +e.target.value })}
                />

                <input type="color" value={selectedTextObj.color} onChange={(e) => updateText(selectedText, { color: e.target.value })} />
                <input type="color" value={selectedTextObj.strokeColor} onChange={(e) => updateText(selectedText, { strokeColor: e.target.value })} />

                <input
                  type="range"
                  min="0"
                  max="15"
                  value={selectedTextObj.strokeWidth}
                  onChange={(e) => updateText(selectedText, { strokeWidth: +e.target.value })}
                />

                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedTextObj.rotation}
                  onChange={(e) => updateText(selectedText, { rotation: +e.target.value })}
                />

                <label>
                  <input
                    type="checkbox"
                    checked={selectedTextObj.uppercase}
                    onChange={(e) => updateText(selectedText, { uppercase: e.target.checked })}
                  />{" "}
                  UPPERCASE
                </label>

                <button
                  onClick={() => deleteText(selectedText)}
                  style={{
                    padding: "12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  Delete Text
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              style={{
                padding: "20px",
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Download Meme
            </button>
          </div>

          {/* Canvas */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                cursor: dragging ? "grabbing" : selectedText ? "grab" : "crosshair",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
