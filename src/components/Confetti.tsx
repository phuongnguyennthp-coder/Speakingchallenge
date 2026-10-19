import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speedY: number;
  speedX: number;
  char?: string;
}

const COLORS = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#fbbf24'];
const EMOJIS = ['⭐', '🌟', '🎉', '✨', '🎈', '🏆'];

export const Confetti: React.FC<{ duration?: number; onDone?: () => void }> = ({
  duration = 4500,
  onDone,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const generated: ConfettiPiece[] = [];
    const count = 65;

    for (let i = 0; i < count; i++) {
      const isEmoji = i % 5 === 0;
      generated.push({
        id: i,
        x: Math.random() * 100, // percentage vw
        y: -10 - Math.random() * 20, // start above viewport
        size: isEmoji ? 20 + Math.random() * 12 : 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 1.5,
        char: isEmoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
      });
    }

    setPieces(generated);

    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDone]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block animate-confetti-fall select-none"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            fontSize: p.char ? `${p.size}px` : undefined,
            width: !p.char ? `${p.size}px` : undefined,
            height: !p.char ? `${p.size * 1.6}px` : undefined,
            backgroundColor: !p.char ? p.color : undefined,
            borderRadius: !p.char ? '3px' : undefined,
            transform: `rotate(${p.rotation}deg)`,
            animationDuration: `${2.5 + (p.id % 4) * 0.5}s`,
            animationDelay: `${(p.id % 10) * 0.15}s`,
            animationIterationCount: 'infinite',
          }}
        >
          {p.char}
        </span>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(115vh) rotate(720deg);
            opacity: 0.2;
          }
        }
        .animate-confetti-fall {
          animation-name: confettiFall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};
