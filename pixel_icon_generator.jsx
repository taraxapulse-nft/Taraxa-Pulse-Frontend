import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PixelIconGenerator() {
  const canvasRef = useRef(null);
  const size = 16; // grid 16x16
  const pixel = 16; // pixel size (16px)

  const colors = [
    "#ff0000", // red
    "#00ff00", // green
    "#0000ff", // blue
    "#ffff00", // yellow
    "#ff00ff", // magenta
    "#00ffff", // cyan
    "#000000", // black
    "#ffffff", // white
  ];

  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function generateIcon() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Procedural generation: symmetry left-right
    for (let x = 0; x < size / 2; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() > 0.65) { // 35% chance to paint a pixel
          ctx.fillStyle = randomColor();
          ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
          // mirror pixel on the right side
          ctx.fillRect((size - 1 - x) * pixel, y * pixel, pixel, pixel);
        }
      }
    }
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "pixel-icon.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  useEffect(() => {
    generateIcon();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-xl font-bold">🎨 Pixel Icon Generator</h1>
      <canvas
        ref={canvasRef}
        width={size * pixel}
        height={size * pixel}
        className="border rounded-lg shadow-lg"
      />
      <div className="flex gap-2">
        <Button onClick={generateIcon}>🔄 Generate</Button>
        <Button onClick={downloadImage}>💾 Download</Button>
      </div>
    </div>
  );
}
