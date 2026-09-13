import React from 'react';

export default function InsideCover() {
  return (
    <div className="relative w-full h-full rule-page-bg text-neutral-200 p-8 sm:p-12 flex flex-col justify-between left-page-gutter select-text overflow-hidden">
      {/* Weathered Inner Texture */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Decorative inner frame */}
      <div className="absolute inset-4 border border-neutral-800 pointer-events-none rounded-sm"></div>

      {/* Ryuk's Handwriting Title */}
      <div className="relative z-10 text-center pt-4">
        <span className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-serif">
          SHINIGAMI REALM PROPERTY
        </span>
        <h2 className="death-note-rule-title text-3xl sm:text-4xl text-neutral-100 tracking-[0.18em] my-3">
          DEATH NOTE
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-red-900 to-transparent mx-auto"></div>
      </div>

      {/* Ryuk's Note to the Human World */}
      <div className="relative z-10 my-auto text-center space-y-4 px-4">
        <p className="font-gothic text-xl sm:text-2xl text-red-500/90 tracking-wide font-bold">
          "The human whose name is written in this note shall die."
        </p>

        <p className="font-serif italic text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
          This notebook was dropped into the human world by Ryuk, a Shinigami (God of Death).
          Whosoever touches this book gains ownership and will be followed by the Shinigami until their demise.
        </p>

        <div className="pt-4 flex items-center justify-center gap-2 text-neutral-500 text-xs">
          <span className="font-japanese text-sm">死神界</span>
          <span>•</span>
          <span className="font-serif uppercase tracking-widest text-[11px]">RULES ENCLOSED WITHIN</span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-[10px] tracking-[0.25em] text-neutral-600 uppercase font-serif">
          TURN THE PAGE TO READ THE RULES
        </p>
      </div>
    </div>
  );
}
