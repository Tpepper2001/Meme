import { useState } from 'react';
import MemeCanvas from './MemeCanvas';

export default function MemeEditor() {
  const [image, setImage] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="meme-editor">
      <h1>Meme Generator</h1>
      
      <div className="controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        
        <input
          type="text"
          placeholder="Top text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
        />
        
        <input
          type="text"
          placeholder="Bottom text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
        />
        
        {image && (
          <button onClick={handleDownload}>Download Meme</button>
        )}
      </div>

      {image && (
        <MemeCanvas 
          image={image} 
          topText={topText} 
          bottomText={bottomText} 
        />
      )}
    </div>
  );
}
