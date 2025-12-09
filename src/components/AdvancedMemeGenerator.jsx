import { useState, useRef, useEffect } from 'react';

export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);

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
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  };

  const loadImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setTexts([]);
      setSelectedText(null);
    };
    reader.readAsDataURL(file);
  };

  const loadTemplate = (url) => {
    setImage(url);
    setTexts([]);
    setSelectedText(null);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      loadImageFile(imageFile);
    }
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const centerX = canvas ? canvas.width / 2 : 250;
    const centerY = canvas ? canvas.height / 4 : 100;

    const newText = {
      id: Date.now(),
      content: 'NEW TEXT',
      x: centerX,
      y: centerY,
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
    
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Draw all text elements
      texts.forEach(text => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        
        ctx.fillStyle = text.color;
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${text.fontSize}px ${text.fontFamily}, Impact, Arial Black, sans-serif`;

        const displayText = text.uppercase ? text.content.toUpperCase() : text.content;
        
        // Draw stroke first, then fill
        if (text.strokeWidth > 0) {
          ctx.strokeText(displayText, 0, 0);
        }
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      });

      // Force canvas to update display
      canvas.style.display = 'block';
    };

    img.onerror = (err) => {
      console.error('Failed to load image:', err);
    };

    img.src = image;
  };

  useEffect(() => {
    drawCanvas();
  }, [image, texts]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clickedText = texts.find(t => {
      const distance = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
      return distance < t.fontSize * 1.5;
    });

    setSelectedText(clickedText ? clickedText.id : null);
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
    if (!canvas) return;
    
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create image. Please try again.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const selectedTextObj = texts.find(t => t.id === selectedText);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🎨 Advanced Meme Generator
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Drag & Drop Upload Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              background: isDraggingOver ? '#e3f2fd' : 'white',
              padding: '40px 20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: isDraggingOver ? '3px dashed #0070f3' : '3px dashed #ddd',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
            <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {isDraggingOver ? 'Drop image here!' : 'Drag & Drop Image'}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              or click to browse
            </p>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('fileInput').click();
              }}
              style={{
                padding: '10px 20px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Choose File
            </button>
          </div>

          {/* Meme Templates */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>🖼️ Popular Templates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseOut={(e) => e.target.style.background = '#f0f0f0'}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: image ? '300px 1fr' : '1fr', gap: '20px' }}>
          {/* Text Controls - Only show when image is loaded */}
          {image && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>✏️ Text Controls</h3>
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
                    fontWeight: 'bold',
                    marginBottom: '15px'
                  }}
                >
                  + Add Text
                </button>

                {selectedTextObj && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      value={selectedTextObj.content}
                      onChange={(e) => updateText(selectedText, { content: e.target.value })}
                      placeholder="Text content"
                      style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '2px solid #ddd' }}
                    />

                    <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong>Font Size: {selectedTextObj.fontSize}px</strong>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={selectedTextObj.fontSize}
                        onChange={(e) => updateText(selectedText, { fontSize: parseInt(e.target.value) })}
                      />
                    </label>

                    <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong>Text Color</strong>
                      <input
                        type="color"
                        value={selectedTextObj.color}
                        onChange={(e) => updateText(selectedText, { color: e.target.value })}
                        style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '6px' }}
                      />
                    </label>

                    <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong>Outline Color</strong>
                      <input
                        type="color"
                        value={selectedTextObj.strokeColor}
                        onChange={(e) => updateText(selectedText, { strokeColor: e.target.value })}
                        style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '6px' }}
                      />
                    </label>

                    <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong>Outline Width: {selectedTextObj.strokeWidth}px</strong>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={selectedTextObj.strokeWidth}
                        onChange={(e) => updateText(selectedText, { strokeWidth: parseInt(e.target.value) })}
                      />
                    </label>

                    <label style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong>Rotation: {selectedTextObj.rotation}°</strong>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedTextObj.rotation}
                        onChange={(e) => updateText(selectedText, { rotation: parseInt(e.target.value) })}
                      />
                    </label>

                    <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                      <input
                        type="checkbox"
                        checked={selectedTextObj.uppercase}
                        onChange={(e) => updateText(selectedText, { uppercase: e.target.checked })}
                      />
                      <strong>UPPERCASE</strong>
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
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Delete Text
                    </button>
                  </div>
                )}

                {!selectedTextObj && texts.length > 0 && (
                  <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                    Click on text in the canvas to edit
                  </p>
                )}
              </div>

              {/* Download Button */}
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
                ⬇️ Download Meme
              </button>
            </div>
          )}

          {/* Canvas Area */}
          <div
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
              <div style={{ maxWidth: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                    cursor: dragging ? 'grabbing' : selectedText ? 'grab' : 'crosshair',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p style={{ fontSize: '48px', marginBottom: '10px' }}>📸</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>No image loaded</p>
                <p style={{ fontSize: '14px' }}>Upload an image or select a template to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
