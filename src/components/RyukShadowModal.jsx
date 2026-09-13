import React, { useEffect, useState } from 'react';
import { X, Apple, Sparkles } from 'lucide-react';
import soundEngine from '../audio/soundEngine';

const RYUK_QUOTES = [
  "Humans are so... interesting! (人間って、面白！！)",
  "Apples in the human world are worth it. To me, apples are like cigarettes and alcohol are to humans.",
  "I dropped the notebook because I was bored. Don't think I'm on your side, Light.",
  "All humans die the same. The place they go after death is nothingness (MU).",
  "Hyuk hyuk hyuk... Are you sure you want to write that name?"
];

export default function RyukShadowModal({ isOpen, onClose }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      soundEngine.playRyukChuckle();
      setQuoteIndex(Math.floor(Math.random() * RYUK_QUOTES.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-center text-white shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-900 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ryuk Silhouette Graphics */}
        <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
          {/* Glowing Eyes */}
          <div className="absolute top-16 left-16 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-ping"></div>
          <div className="absolute top-16 right-16 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-ping"></div>

          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {/* Spiky Ryuk Hair & Head */}
            <path
              d="M100 30 L115 10 L120 35 L145 20 L135 45 L160 40 L140 60 L165 70 L135 85 L145 110 L130 115 L125 150 L110 160 L100 170 L90 160 L75 150 L70 115 L55 110 L65 85 L35 70 L60 60 L40 40 L65 45 L55 20 L80 35 L85 10 Z"
              fill="#080808"
              stroke="#262626"
              strokeWidth="2"
            />
            {/* Glowing Golden Eyes */}
            <ellipse cx="80" cy="80" rx="7" ry="9" fill="#facc15" />
            <circle cx="80" cy="80" r="3" fill="#dc2626" />
            
            <ellipse cx="120" cy="80" rx="7" ry="9" fill="#facc15" />
            <circle cx="120" cy="80" r="3" fill="#dc2626" />

            {/* Piercing Grin */}
            <path
              d="M 68 115 Q 100 145 132 115"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="3"
            />
            {/* Grin Stitches / Teeth */}
            <line x1="80" y1="116" x2="80" y2="124" stroke="#e5e5e5" strokeWidth="2" />
            <line x1="90" y1="120" x2="90" y2="128" stroke="#e5e5e5" strokeWidth="2" />
            <line x1="100" y1="122" x2="100" y2="130" stroke="#e5e5e5" strokeWidth="2" />
            <line x1="110" y1="120" x2="110" y2="128" stroke="#e5e5e5" strokeWidth="2" />
            <line x1="120" y1="116" x2="120" y2="124" stroke="#e5e5e5" strokeWidth="2" />
          </svg>
        </div>

        {/* Shinigami Name Header */}
        <h3 className="font-gothic text-3xl text-neutral-100 tracking-widest mt-2">
          RYUK (リューク)
        </h3>
        <p className="text-[11px] text-neutral-500 font-serif uppercase tracking-widest mb-4">
          SHINIGAMI - ORIGINAL OWNER OF THE DEATH NOTE
        </p>

        {/* Dialog / Quote */}
        <div className="bg-neutral-900/80 p-4 rounded-lg border border-neutral-800 text-neutral-300 font-serif italic text-sm leading-relaxed mb-5">
          "{RYUK_QUOTES[quoteIndex]}"
        </div>

        {/* Apple Interaction Button */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              soundEngine.playRyukChuckle();
              setQuoteIndex((prev) => (prev + 1) % RYUK_QUOTES.length);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-lg hover:scale-105"
          >
            <Apple className="w-4 h-4 text-red-500 fill-red-500" />
            <span>Bir Elma Daha Ver 🍎</span>
          </button>
        </div>
      </div>
    </div>
  );
}
