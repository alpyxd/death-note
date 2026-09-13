import React from 'react';

export default function RulePage({ pageSide = 'left' }) {
  return (
    <div className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none ${pageSide === 'left' ? 'left-page-gutter' : 'right-page-gutter'}`}>
      {/* User's Leather Texture as Background */}
      <img 
        src="/images/leather-user-portrait.png" 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />

      {/* Rules Asset Blended Directly Onto Leather */}
      <div className="relative z-10 w-full h-full p-2 sm:p-3 flex items-center justify-center mix-blend-screen pointer-events-none">
        <img 
          src="/images/rule-reference.png" 
          alt="Death Note Rules - How to Use It" 
          className="w-full h-full max-h-full max-w-full object-contain filter contrast-125 brightness-105"
        />
      </div>

      {/* Gutter Spine Shadow */}
      <div className={`absolute top-0 bottom-0 w-6 pointer-events-none z-20 ${pageSide === 'left' ? 'right-0 bg-gradient-to-l from-black/80 to-transparent' : 'left-0 bg-gradient-to-r from-black/80 to-transparent'}`}></div>
    </div>
  );
}
