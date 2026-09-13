import React from 'react';
import { Eye } from 'lucide-react';

export default function ShinigamiEyesOverlay({ active, onClose }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-700 select-none">
      {/* Red Spectral Hue & Vignette */}
      <div className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(255,0,0,0.4)]"></div>

      {/* Top Banner Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-black/90 border border-red-600/80 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse">
        <Eye className="w-4 h-4 text-red-500" />
        <span className="text-xs font-serif font-bold text-red-400 tracking-widest uppercase">
          SHINIGAMI EYES ACTIVE (死神の目)
        </span>
        <button
          onClick={onClose}
          className="ml-2 text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
