import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  shape: string;
}

const COLORS = ['#6366f1','#f72fb2','#f59e0b','#10b981','#3b82f6','#ef4444'];
const SHAPES = ['■','●','▲','★','♦'];

export default function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newPieces = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      size: 8 + Math.random() * 12,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece absolute top-0"
          style={{
            left: `${p.x}%`,
            color: p.color,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.shape}
        </div>
      ))}
    </div>
  );
}
