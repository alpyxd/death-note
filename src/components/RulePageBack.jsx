import React from 'react';

export default function RulePageBack() {
  return (
    <div className="relative w-full h-full page-verso-bleed text-white p-6 sm:p-8 flex flex-col justify-between select-text overflow-hidden left-page-gutter">
      
      {/* Reverse Bleed-Through of the Front Page (Faint Mirrored Ghost from the other side) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none scale-x-[-1] filter blur-[0.6px]">
        <img 
          src="/images/rule-reference.png" 
          alt="" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Verso Page Content: Clearly the back side of the rules page */}
      <div className="relative z-10 text-center pt-2">
        <div className="flex items-center justify-center mb-1 opacity-70">
          <img 
            src="/images/skull-sunburst.png" 
            alt="Shinigami Seal" 
            className="w-10 sm:w-12 object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
          />
        </div>
        <h2 
          className="text-xl sm:text-2xl text-neutral-200 tracking-widest uppercase"
          style={{ fontFamily: 'DeathNote, serif' }}
        >
          DEATH NOTE
        </h2>
        <h3 
          className="text-xs sm:text-sm text-neutral-400 tracking-wider mt-0.5"
          style={{ fontFamily: 'DeathNote, serif' }}
        >
          HOW TO USE IT (PAGE BACK / VERSO)
        </h3>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mx-auto mt-2"></div>
      </div>

      {/* Rules on the back side */}
      <div className="relative z-10 my-auto space-y-4 px-3 sm:px-6 text-left">
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-white text-xs select-none mt-0.5">☉</span>
            <p 
              className="text-neutral-200 text-xs sm:text-sm leading-relaxed tracking-wider"
              style={{ fontFamily: 'DeathNote, serif' }}
            >
              The pages of the DEATH NOTE will never run out.
            </p>
          </div>
          <p className="text-neutral-400 text-[10px] sm:text-[11px] font-serif pl-5">
            デスノートのページ数は尽きることがない。(無限)
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-white text-xs select-none mt-0.5">☉</span>
            <p 
              className="text-neutral-200 text-xs sm:text-sm leading-relaxed tracking-wider"
              style={{ fontFamily: 'DeathNote, serif' }}
            >
              One page taken from the DEATH NOTE , or even a fragment of the page , contains the full effects of the note.
            </p>
          </div>
          <p className="text-neutral-400 text-[10px] sm:text-[11px] font-serif pl-5">
            デスノートから切り取った１ページ、又はその切れ端でもノートと同等の効力を持つ。
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-white text-xs select-none mt-0.5">☉</span>
            <p 
              className="text-neutral-200 text-xs sm:text-sm leading-relaxed tracking-wider"
              style={{ fontFamily: 'DeathNote, serif' }}
            >
              The instrument to write with can be anything as long as it can write directly onto the note and remains as legible letters.
            </p>
          </div>
          <p className="text-neutral-400 text-[10px] sm:text-[11px] font-serif pl-5">
            文字として残る物であれば、書く道具は文字が直接ノートに記せれば何でもよい。
          </p>
        </div>
      </div>

      {/* Footer indication showing it is the verso / back side */}
      <div className="relative z-10 text-center pb-1 text-[10px] text-neutral-500 font-serif select-none">
        <span>— HOW TO USE IT • REVERSE (ARKA YÜZ) —</span>
      </div>

      {/* Right Gutter Spine Shadow (Opposite side shadow indicating verso) */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
