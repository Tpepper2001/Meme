import { useState, useRef, useEffect } from 'react';

export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Popular meme templates
  const memeTemplates = [
    { name: 'Drake', url: 'https://i.imgflip.com/30b1gx.jpg' },
    { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
    { name: 'Disaster Girl', url: 'https://i.imgflip.com/23ls.jpg' },
    { name: 'Success Kid', url: 'https://i.imgflip.com/1bhk.jpg' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setTexts([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadTemplate = (url) => {
    setImage(url);
    setTexts([]);
  };

  const addText = () => {
    const newText = {
      id: Date.now(),
      content: 'New Text',
      x: 50,
      y: 50,
      fontSize: 48,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 3,
      fontFamily: 'Impact',
      rotation: 0,
      uppercase: true
    };
    setTexts([...texts, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (id, updates) => {
    setTexts(texts.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteText = (id) => {
    setTexts(texts.filter(t => t.id !== id));
    setSelectedText(null);
  };

  const drawCanvas = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      texts.forEach(text => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        
        ctx.fillStyle = text.color;
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${text.fontSize}px ${text.fontFamily}, Impact, sans-serif`;

        const displayText = text.uppercase ? text.content.toUpperCase() : text.content;
        
        ctx.strokeText(displayText, 0, 0);
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      });
    };

    img.src = image;
  };

  useEffect(() => {
    drawCanvas();
  }, [image, texts]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clickedText = texts.find(t => {
      const distance = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
      return distance < t.fontSize;
    });

    if (clickedText) {
      setSelectedText(clickedText.id);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (!selectedText) return;
    setDragging(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragging || !selectedText) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    updateText(selectedText, { x, y });
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const selectedTextObj = texts.find(t => t.id === selectedText);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Advanced Meme Generator
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
        {/* Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Image Upload */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Upload Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          {/* Meme Templates */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {memeTemplates.map(template => (
                <button
                  key={template.name}
                  onClick={() => loadTemplate(template.url)}
                  style={{
                    padding: '10px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text Controls */}
          {image && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Text Controls</h3>
              <button
                onClick={addText}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '15px'
                }}
              >
                Add Text
              </button>

              {selectedTextObj && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={selectedTextObj.content}
                    onChange={(e) => updateText(selectedText, { content: e.target.value })}
                    placeholder="Text content"
                    style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />

                  <label style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Font Size: {selectedTextObj.fontSize}px
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={selectedTextObj.fontSize}
                      onChange={(e) => updateText(selectedText, { fontSize: parseInt(e.target.value) })}
                    />
                  </label>

                  <label style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Text Color
                    <input
                      type="color"
                      value={selectedTextObj.color}
                      onChange={(e) => updateText(selectedText, { color: e.target.value })}
                      style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Outline Color
                    <input
                      type="color"
                      value={selectedTextObj.strokeColor}
                      onChange={(e) => updateText(selectedText, { strokeColor: e.target.value })}
                      style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Outline Width: {selectedTextObj.strokeWidth}px
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedTextObj.strokeWidth}
                      onChange={(e) => updateText(selectedText, { strokeWidth: parseInt(e.target.value) })}
                    />
                  </label>

                  <label style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Rotation: {selectedTextObj.rotation}°
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedTextObj.rotation}
                      onChange={(e) => updateText(selectedText, { rotation: parseInt(e.target.value) })}
                    />
                  </label>

                  <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTextObj.uppercase}
                      onChange={(e) => updateText(selectedText, { uppercase: e.target.checked })}
                    />
                    UPPERCASE
                  </label>

                  <button
                    onClick={() => deleteText(selectedText)}
                    style={{
                      padding: '10px',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete Text
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Download */}
          {image && (
            <button
              onClick={handleDownload}
              style={{
                padding: '15px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Download Meme
            </button>
          )}
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px'
          }}
        >
          {image ? (
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                maxWidth: '100%',
                height: 'auto',
                cursor: dragging ? 'grabbing' : selectedText ? 'grab' : 'default',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          ) : (
            <p style={{ color: '#999', fontSize: '18px' }}>Upload an image or select a template to get started</p>
          )}
        </div>
      </div>
    </div>
  );
      }
