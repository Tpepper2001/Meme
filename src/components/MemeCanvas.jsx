import { useEffect, useRef } from 'react';

export default function MemeCanvas({ image, topText, bottomText }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.font = `${img.height / 15}px Impact, 'Arial Black', sans-serif`;
      ctx.textTransform = 'uppercase';

      // Draw top text
      if (topText) {
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, img.height / 10);
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, img.height / 10);
      }

      // Draw bottom text
      if (bottomText) {
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, img.height - img.height / 15);
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, img.height - img.height / 15);
      }
    };

    img.src = image;
  }, [image, topText, bottomText]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
