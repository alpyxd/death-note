import React from 'react';
import soundEngine from '../audio/soundEngine';

export default function PageSpread({
  leftComponent,
  rightComponent,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  scale = 1.0,
  turnDirection = null // 'forward' | 'backward' | null
}) {
  return (
    <div 
      className="relative w-full max-w-5xl aspect-[1.46/1] min-h-[560px] max-h-[88vh] mx-auto select-none transition-transform duration-200 perspective-book"
      style={{ transform: `scale(${scale})` }}
    >
      {/* 3D Realistic Open Notebook Container */}
      <div 
        className="relative w-full h-full rounded-2xl flex flex-col md:flex-row shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden bg-black"
        style={{
          boxShadow: '0 30px 80px -15px rgba(0,0,0,0.98), 0 0 50px rgba(0,0,0,0.9)'
        }}
      >
        {/* Left Leather Rim (Under the paper) */}
        <div className="absolute inset-0 bg-black pointer-events-none rounded-2xl"></div>

        {/* Notebook Main Paper Pages Spread */}
        <div className="relative z-10 w-full h-full p-2 sm:p-3 flex flex-col md:flex-row gap-0">
          
          {/* ================= LEFT PAGE ================= */}
          <div 
            className={`relative w-full md:w-1/2 h-full rounded-l-lg overflow-hidden flex flex-col bg-[#080808] shadow-lg ${
              turnDirection === 'backward' ? 'anim-page-turn-backward' : ''
            }`}
          >
            {leftComponent}

            {/* Left Page Turn Click Area */}
            {hasPrev && (
              <button
                onClick={() => {
                  soundEngine.playPageFlip();
                  onPrev();
                }}
                title="Önceki Sayfa"
                className="absolute left-0 top-0 bottom-0 w-14 hover:bg-white/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-start pl-3 cursor-pointer z-30 group"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-900/90 text-white flex items-center justify-center shadow-xl text-sm font-bold border border-neutral-700 group-hover:scale-110 transition-transform">
                  ‹
                </div>
              </button>
            )}
          </div>

          {/* Central Book Spine / Gutter Depth */}
          <div className="relative hidden md:block w-3.5 h-full bg-gradient-to-r from-neutral-900/70 via-black to-neutral-900/70 shadow-[inset_0_0_10px_rgba(0,0,0,0.95)] z-20 pointer-events-none">
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-neutral-700/50 border-dashed"></div>
          </div>

          {/* ================= RIGHT PAGE ================= */}
          <div 
            className={`relative w-full md:w-1/2 h-full rounded-r-lg overflow-hidden flex flex-col bg-[#f7f3e8] shadow-lg ${
              turnDirection === 'forward' ? 'anim-page-turn-forward' : ''
            }`}
          >
            {rightComponent}

            {/* Right Page Turn Click Area */}
            {hasNext && (
              <button
                onClick={() => {
                  soundEngine.playPageFlip();
                  onNext();
                }}
                title="Sonraki Sayfa"
                className="absolute right-0 top-0 bottom-0 w-14 hover:bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-3 cursor-pointer z-30 group"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-900/90 text-white flex items-center justify-center shadow-xl text-sm font-bold border border-neutral-700 group-hover:scale-110 transition-transform">
                  ›
                </div>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
