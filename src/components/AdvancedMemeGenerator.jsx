import { useState, useRef, useEffect } from 'react';

export default function AdvancedMemeGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [texts, setTexts] = useState<any[]>([]);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Fixed: Using corsproxy.io to bypass CORS restrictions
  const memeTemplates = [
    { name: 'Drake Hotline', url: 'https://corsproxy.io/?https://i.imgflip.com/30b1gx.jpg' },
    { name: 'Distracted Boyfriend', url: 'https://corsproxy.io/?https://i.imgflip.com/1ur9b0.jpg' },
    { name: 'Two Buttons', url: 'https://corsproxy.io/?https://i.imgflip.com/1g8my4.jpg' },
    { name: 'Change My Mind', url: 'https://corsproxy.io/?https://i.imgflip.com/2/1g8my4.jpg' },
    { name: 'Disaster Girl', url: 'https://corsproxy.io/?https://i.imgflip.com/23ls.jpg' },
    { name: 'Success Kid', url: 'https://corsproxy.io/?https://i.imgflip.com/1bhk.jpg' },
    { name: 'This Is Fine', url: 'https://corsproxy.io/?https://i.imgflip.com/2/1bij.jpg' },
    { name: 'SpongeBob Mocking', url: 'https://corsproxy.io/?https://i.imgflip.com/1otk96.jpg' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  };

  const loadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setTexts([]);
      setSelectedText(null);
    };
    reader.readAsDataURL(file);
  };

  const loadTemplate = (url: string) => {
    setImage(url);
    setTexts([]);
    setSelectedText(null);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const centerX = canvas ? canvas.width / 2 : 300;
    const centerY = canvas ? canvas.height / 4 : 100;

    const newText = {
      id: Date.now(),
      content: 'DOUBLE CLICK TO EDIT',
      x: centerX,
      y: centerY,
      fontSize: 60,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 5,
      fontFamily: 'Impact',
      rotation: 0,
      uppercase: true,
    };
    setTexts([...texts, newText]);
    setSelectedText(newText.id);
  };

  const updateText = (id: number, updates: Partial<any>) => {
    setTexts(texts.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteText = (id: number) => {
    setTexts(texts.filter(t => t.id !== id));
    if (selectedText === id) setSelectedText(null);
  };

  const drawCanvas = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      texts.forEach(text => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);

        ctx.font = `bold \( {text.fontSize}px \){text.fontFamily}, Impact, Arial Black, sans-serif`;
        ctx.fillStyle = text.color;
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayText = text.uppercase ? text.content.toUpperCase() : text.content;

        if (text.strokeWidth > 0) {
          ctx.strokeText(displayText, 0, 0);
        }
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      });
    };

    img.onerror = () => {
      console.error('Failed to load image');
    };

    img.src = image + (image.includes('corsproxy.io') ? '' : '?t=' + Date.now());
  };

  useEffect(() => {
    drawCanvas();
  }, [image, texts]);

  // Canvas Interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clicked = texts.find(t => {
      const dist = Math.hypot(t.x - x, t.y - y);
      return dist < t.fontSize * 1.2;
    });

    setSelectedText(clicked ? clicked.id : null);
  };

  const handleMouseDown = () => selectedText && setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !selectedText) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    updateText(selectedText, { x, y });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Download failed. Try uploading your own image.');
    }
  };

  const selectedTextObj = texts.find(t => t.id === selectedText);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px', color: '#1a1a1a' }}>
        Advanced Meme Generator
      </h1>

      {/* Upload & Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
          style={{
            background: isDraggingOver ? '#e0f2fe' : 'white',
            border: `3px dashed ${isDraggingOver ? '#0ea5e9' : '#ccc'}`,
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '64px' }}>Drop Image Here</div>
          <p style={{ fontSize: '18px', margin: '16px 0', color: '#555' }}>or click to browse</p>
          <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <button style={{ padding: '12px 32px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Choose Image
          </button>
        </div>

        {/* Templates */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Popular Templates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {memeTemplates.map(t => (
              <button
                key={t.name}
                onClick={() => loadTemplate(t.url)}
                style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      {image && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <button
                onClick={addText}
                style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Add Text Box
              </button>

              {selectedTextObj && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    value={selectedTextObj.content}
                    onChange={e => updateText(selectedText!, { content: e.target.value })}
                    placeholder="Enter meme text..."
                    style={{ padding: '14px', fontSize: '16px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  />

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Size: {selectedTextObj.fontSize}px</label>
                    <input type="range" min="20" max="150" value={selectedTextObj.fontSize} onChange={e => updateText(selectedText!, { fontSize: +e.target.value })} style={{ width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Color</label>
                    <input type="color" value={selectedTextObj.color} onChange={e => updateText(selectedText!, { color: e.target.value })} style={{ width: '100%', height: '50px', borderRadius: '8px' }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Outline</label>
                    <input type="color" value={selectedTextObj.strokeColor} onChange={e => updateText(selectedText!, { strokeColor: e.target.value })} style={{ width: '100%', height: '50px', borderRadius: '8px' }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Outline Width: {selectedTextObj.strokeWidth}px</label>
                    <input type="range" min="0" max="15" value={selectedTextObj.strokeWidth} onChange={e => updateText(selectedText!, { strokeWidth: +e.target.value })} style={{ width: '100%' }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Rotation: {selectedTextObj.rotation}°</label>
                    <input type="range" min="-180" max="180" value={selectedTextObj.rotation} onChange={e => updateText(selectedText!, { rotation: +e.target.value })} style={{ width: '100%' }} />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={selectedTextObj.uppercase} onChange={e => updateText(selectedText!, { uppercase: e.target.checked })} />
                    UPPERCASE TEXT
                  </label>

                  <button
                    onClick={() => deleteText(selectedText!)}
                    style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Delete Text
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              style={{ padding: '20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)' }}
            >
              Download Meme (PNG)
            </button>
          </div>

          {/* Canvas */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                cursor: dragging ? 'grabbing' : selectedText ? 'grab' : 'crosshair',
              }}
            />
          </div>
        </div>
      )}

      {!image && (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>
          <div style={{ fontSize: '100px' }}>No Image Yet</div>
          <p style={{ fontSize: '24px', marginTop: '20px' }}>Upload an image or pick a template to start memeing!</p>
        </div>
      )}
    </div>
  );
}
