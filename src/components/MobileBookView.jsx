import React, { useState, useRef } from 'react';
import { RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import soundEngine from '../audio/soundEngine';
import musicPlayer from '../audio/musicPlayer';
import RulePage from './RulePage';
import LinedPage from './LinedPage';

export default function MobileBookView({
  page = 0,
  onPageChange,
  pagesData = {},
  onAddEntry,
  onToggleStrike,
  onDeleteEntry,
  scale = 1.0,
  onToggleViewMode
}) {
  const [showBackCover, setShowBackCover] = useState(false);
  const [turningDir, setTurningDir] = useState(null); // 'forward' | 'backward' | null

  // Touch swipe refs
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const triggerPageChange = (newPage, dir) => {
    soundEngine.playPageFlip();
    setTurningDir(dir);
    setTimeout(() => {
      onPageChange(newPage);
      setTurningDir(null);
    }, 220);
  };

  const handleNext = () => {
    if (page === 0) {
      handleOpenCover();
    } else {
      triggerPageChange(page + 1, 'forward');
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      triggerPageChange(page - 1, 'backward');
    }
  };

  const handleOpenCover = () => {
    soundEngine.playPageFlip();
    musicPlayer.play();
    triggerPageChange(1, 'forward');
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Trigger if horizontal movement is dominant and > 40px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped left -> go to next page
        handleNext();
      } else {
        // Swiped right -> go to previous page
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Render current page content
  const renderContent = () => {
    // 0: Closed Cover
    if (page === 0) {
      return (
        <div 
          onClick={handleOpenCover}
          className="relative w-full h-full cursor-pointer select-none bg-black overflow-hidden flex flex-col items-center justify-between p-6"
        >
          {!showBackCover ? (
            /* Front Cover */
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="/images/leather-user-portrait.png" 
                alt="Death Note Cover" 
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-x-0 top-20 sm:top-24 flex justify-center px-4 pointer-events-none">
                <h1 
                  className="text-3xl sm:text-4xl md:text-5xl text-[#f2efe9] tracking-[0.12em] sm:tracking-[0.15em] uppercase text-center whitespace-nowrap"
                  style={{ 
                    fontFamily: 'DeathNote, serif',
                    textShadow: '0 2px 5px rgba(0,0,0,0.95), 0 -1px 1px rgba(255,255,255,0.35), 0 0 15px rgba(255,255,255,0.15)'
                  }}
                >
                  DEATH NOTE
                </h1>
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-r from-transparent via-[#ded8cc] to-[#aba08d] rounded-r-md opacity-60 pointer-events-none"></div>
            </div>
          ) : (
            /* Back Cover */
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="/images/leather-user-portrait.png" 
                alt="Leather Back" 
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-0 p-4 flex items-center justify-center mix-blend-screen pointer-events-none">
                <img 
                  src="/images/rule-reference.png" 
                  alt="Rules on Leather" 
                  className="w-full h-full max-h-full object-contain filter contrast-125 brightness-105"
                />
              </div>
            </div>
          )}

          {/* Flip to Back / Front button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playPageFlip();
              setShowBackCover(!showBackCover);
            }}
            title={showBackCover ? "Ön Kapak" : "Arka Kapak"}
            className="absolute bottom-4 right-4 z-30 p-2.5 rounded-full bg-black/80 text-neutral-300 hover:text-white border border-neutral-700 shadow-xl touch-manipulation"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // 1: Rules on Leather
    if (page === 1) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-black flex flex-col">
          <RulePage pageSide="left" />
        </div>
      );
    }

    // 2+: Lined Pages
    const pageNum = page - 1;
    const entries = pagesData[pageNum] || [];

    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col bg-[#f7f3e8]">
        <LinedPage
          entries={entries}
          onAddEntry={(entry) => onAddEntry(pageNum, entry)}
          onToggleStrike={(id, forceState) => onToggleStrike(pageNum, id, forceState)}
          onDeleteEntry={(id) => onDeleteEntry(pageNum, id)}
          pageNumber={pageNum}
          pageSide="right"
        />
      </div>
    );
  };

  return (
    <div 
      className="relative w-full max-w-[360px] sm:max-w-md aspect-[1/1.42] min-h-[460px] max-h-[76vh] mx-auto select-none transition-transform duration-200 flex flex-col items-center"
      style={{ transform: `scale(${scale})` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Single Page Card with Slide Transition */}
      <div 
        className={`relative w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] transition-all duration-200 ${
          turningDir === 'forward' 
            ? 'opacity-70 translate-x-[-12px] scale-[0.98]' 
            : turningDir === 'backward' 
            ? 'opacity-70 translate-x-[12px] scale-[0.98]' 
            : 'opacity-100 translate-x-0 scale-100'
        }`}
      >
        {renderContent()}

        {/* Quick Mobile Bottom Corner Nav Arrows (Never overlap entries or delete buttons) */}
        {page > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            title="Önceki Sayfa"
            className="absolute left-3 bottom-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/90 flex items-center justify-center border border-neutral-700/50 shadow-lg touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {page > 0 && (
          <button
            type="button"
            onClick={handleNext}
            title="Sonraki Sayfa"
            className="absolute right-3 bottom-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/90 flex items-center justify-center border border-neutral-700/50 shadow-lg touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
