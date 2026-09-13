import React, { useState } from 'react';
import soundEngine from '../audio/soundEngine';
import musicPlayer from '../audio/musicPlayer';
import { RotateCw } from 'lucide-react';

export default function NotebookCover({ onOpen, scale = 1.0 }) {
  const [showBack, setShowBack] = useState(false);

  const handleOpenBook = () => {
    if (onOpen) onOpen();
  };

  const toggleFlip = (e) => {
    e.stopPropagation();
    soundEngine.playPageFlip();
    setShowBack(!showBack);
  };

  return (
    <div 
      className="relative w-full max-w-[460px] aspect-[400/600] mx-auto select-none transition-transform duration-200"
      style={{ transform: `scale(${scale})` }}
    >
      <div 
        onClick={handleOpenBook}
        className="group relative w-full h-full cursor-pointer transition-transform duration-300 hover:scale-[1.012] overflow-hidden rounded-r-xl rounded-l-xs border border-neutral-900 bg-black"
        style={{
          boxShadow: showBack
            ? '0 30px 70px -10px rgba(0,0,0,0.98), 0 0 40px rgba(0,0,0,0.9), 6px 0 20px rgba(0,0,0,0.95)'
            : '0 30px 70px -10px rgba(0,0,0,0.98), 0 0 40px rgba(0,0,0,0.9), -6px 0 20px rgba(0,0,0,0.95)'
        }}
      >
        {!showBack ? (
          /* ================= ÖN KAPAK ================= */
          <div className="relative w-full h-full bg-black">
            {/* User's Leather Asset */}
            <img 
              src="/images/leather-user-portrait.png" 
              alt="Leather Cover" 
              className="w-full h-full object-cover pointer-events-none select-none"
            />

            {/* DEATH NOTE Title Stamped onto Leather */}
            <div className="absolute inset-x-0 top-20 sm:top-24 md:top-28 flex justify-center pointer-events-none select-none px-4">
              <h1 
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-[#f2efe9] tracking-[0.14em] sm:tracking-[0.18em] uppercase select-none text-center whitespace-nowrap"
                style={{ 
                  fontFamily: 'DeathNote, serif',
                  textShadow: '0 2px 5px rgba(0,0,0,0.95), 0 -1px 1px rgba(255,255,255,0.35), 0 0 15px rgba(255,255,255,0.15)'
                }}
              >
                DEATH NOTE
              </h1>
            </div>

            {/* Left Spine Thickness / Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/85 to-transparent pointer-events-none"></div>

            {/* Right Paper Edge Stack Depth */}
            <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-r from-transparent via-[#b5aa96] to-[#8c816e] rounded-r-md opacity-60 pointer-events-none"></div>
          </div>
        ) : (
          /* ================= ARKA KAPAK (DERİ ÜZERİNDE KURALLAR) ================= */
          <div className="relative w-full h-full bg-black">
            {/* User's Leather Asset as Background */}
            <img 
              src="/images/leather-user-portrait.png" 
              alt="Leather Back" 
              className="w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Rules Asset Blended Directly Onto Leather */}
            <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center pointer-events-none mix-blend-screen">
              <img 
                src="/images/rule-reference.png" 
                alt="Rules on Leather" 
                className="w-full h-full max-h-full object-contain filter contrast-125 brightness-105"
              />
            </div>

            {/* Right Spine Thickness / Shadow (Viewed from back) */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/85 to-transparent pointer-events-none"></div>

            {/* Left Paper Edge Stack Depth */}
            <div className="absolute left-0 top-2 bottom-2 w-2 bg-gradient-to-l from-transparent via-[#b5aa96] to-[#8c816e] rounded-l-md opacity-60 pointer-events-none"></div>
          </div>
        )}

        {/* Minimal Flip Icon */}
        <button
          type="button"
          onClick={toggleFlip}
          title={showBack ? "Ön Kapak" : "Arka Kapak"}
          className="absolute bottom-3 right-3 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-neutral-400 hover:text-white border border-neutral-800 transition-all opacity-40 hover:opacity-100 backdrop-blur"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
