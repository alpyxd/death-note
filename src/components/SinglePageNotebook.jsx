import React from 'react';
import soundEngine from '../audio/soundEngine';

export default function SinglePageNotebook({
  children,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  scale = 1.0,
  isCover = false
}) {
  return (
    <div 
      className="relative transition-transform duration-200 select-none flex items-center justify-center"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Book Container with Realistic Depth */}
      <div 
        className="relative w-[480px] max-w-[90vw] aspect-[620/980] max-h-[88vh] bg-black rounded-r-2xl rounded-l-sm overflow-hidden flex flex-col"
        style={{
          boxShadow: isCover 
            ? '0 30px 80px -15px rgba(0,0,0,0.98), 0 0 50px rgba(0,0,0,0.9), -8px 0 25px rgba(0,0,0,0.95)'
            : '0 25px 70px -15px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.85), -6px 0 20px rgba(0,0,0,0.9)'
        }}
      >
        {/* Leather Base / Under-rim */}
        <div className="absolute inset-0 leather-texture pointer-events-none rounded-r-2xl"></div>

        {/* Inner Page Content */}
        <div className="relative z-10 w-full h-full overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Left Spine Thickness */}
        <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black via-black/60 to-transparent pointer-events-none z-20"></div>

        {/* Right Paper Stack Depth Edge */}
        <div className="absolute right-0 top-2 bottom-2 w-2.5 bg-gradient-to-r from-transparent via-[#c2b7a3] to-[#998e7a] rounded-r-md opacity-60 pointer-events-none z-20"></div>

        {/* Left Page Turn Click Area */}
        {hasPrev && (
          <div
            onClick={() => {
              soundEngine.playPageFlip();
              onPrev();
            }}
            title="Önceki Sayfa"
            className="absolute left-0 top-0 bottom-0 w-16 hover:bg-white/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-start pl-3 cursor-pointer z-30 group"
          >
            <div className="w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center text-sm font-bold border border-neutral-700 shadow-xl group-hover:scale-110 transition-transform">
              ‹
            </div>
          </div>
        )}

        {/* Right Page Turn Click Area */}
        {hasNext && (
          <div
            onClick={() => {
              soundEngine.playPageFlip();
              onNext();
            }}
            title="Sonraki Sayfa"
            className="absolute right-0 top-0 bottom-0 w-16 hover:bg-white/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-3 cursor-pointer z-30 group"
          >
            <div className="w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center text-sm font-bold border border-neutral-700 shadow-xl group-hover:scale-110 transition-transform">
              ›
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
