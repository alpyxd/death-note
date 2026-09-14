import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import soundEngine from '../audio/soundEngine';
import musicPlayer from '../audio/musicPlayer';
import { RotateCw } from 'lucide-react';

const Book3D = forwardRef(function Book3D({
  currentSpread,
  onNext,
  onPrev,
  onOpenCover,
  getSpread,
  scale = 1.0,
  onToggleViewMode
}, ref) {
  const [animState, setAnimState] = useState(null); // null | { dir: 'forward' | 'backward', fromSpread: number, toSpread: number, flipping: boolean }
  const [isCoverOpening, setIsCoverOpening] = useState(false);
  const [isCoverClosing, setIsCoverClosing] = useState(false);
  const [showBackCover, setShowBackCover] = useState(false);
  const animTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flipNext: handleNextClick,
    flipPrev: handlePrevClick,
    openCover: handleCoverClick
  }));

  // Touch swipe support
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped left -> next page
        if (currentSpread === 0) handleCoverClick();
        else handleNextClick();
      } else {
        // Swiped right -> prev page
        handlePrevClick();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const handleNextClick = () => {
    if (animState || isCoverOpening || isCoverClosing) return;

    soundEngine.playPageFlip();
    const fromSpread = currentSpread;
    const toSpread = currentSpread + 1;

    setAnimState({ dir: 'forward', fromSpread, toSpread, flipping: true });

    animTimerRef.current = setTimeout(() => {
      onNext();
      setAnimState(null);
    }, 650);
  };

  const handlePrevClick = () => {
    if (animState || isCoverOpening || isCoverClosing || currentSpread <= 0) return;

    soundEngine.playPageFlip();
    const fromSpread = currentSpread;
    const toSpread = currentSpread - 1;

    if (toSpread === 0) {
      // Closing back to cover
      setIsCoverClosing(true);
      animTimerRef.current = setTimeout(() => {
        onPrev();
        setIsCoverClosing(false);
      }, 650);
      return;
    }

    setAnimState({ dir: 'backward', fromSpread, toSpread, flipping: true });

    animTimerRef.current = setTimeout(() => {
      onPrev();
      setAnimState(null);
    }, 650);
  };

  const handleCoverClick = () => {
    if (showBackCover) {
      setShowBackCover(false);
    }
    soundEngine.playPageFlip();
    musicPlayer.play();
    setIsCoverOpening(true);

    animTimerRef.current = setTimeout(() => {
      onOpenCover();
      setIsCoverOpening(false);
    }, 650);
  };

  // If closed at spread 0: Rendered in the exact same max-w-5xl container shifted by -25%,
  // making the right half (closed notebook) sit EXACTLY in the horizontal center of the screen!
  if (currentSpread === 0 && !isCoverOpening && !isCoverClosing) {
    const spread1 = getSpread(1);
    return (
      <div 
        className="relative w-full max-w-5xl aspect-[1.46/1] min-h-[260px] sm:min-h-[420px] md:min-h-[560px] max-h-[88vh] mx-auto select-none transition-transform duration-200"
        style={{ transform: `scale(${scale})`, perspective: '2600px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative w-full h-full flex flex-row"
          style={{ 
            transform: 'translateX(-25%)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Left side: completely absent when book is closed */}
          <div className="relative w-1/2 h-full opacity-0 pointer-events-none"></div>

          {/* Central Book Spine */}
          <div className="relative hidden md:block w-3.5 h-full bg-gradient-to-r from-neutral-900/70 via-black to-neutral-900/70 z-20 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]">
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-neutral-700/50 border-dashed"></div>
          </div>

          {/* Right side: Lined Page 1 (waiting under cover) */}
          <div className="relative w-1/2 h-full rounded-r-2xl overflow-hidden flex flex-col bg-[#f7f3e8]">
            {spread1.right}
          </div>

          {/* ================= CLOSED COVER ON RIGHT HALF (CENTERED ON SCREEN) ================= */}
          <div 
            onClick={handleCoverClick}
            className="group absolute left-1/2 top-0 bottom-0 w-1/2 h-full z-40 cursor-pointer transition-transform duration-300 hover:scale-[1.008]"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d'
            }}
          >
            {!showBackCover ? (
              /* Front Cover */
              <div className="relative w-full h-full rounded-r-2xl overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <img 
                  src="/images/leather-user-portrait.png" 
                  alt="Death Note Cover" 
                  className="w-full h-full object-cover pointer-events-none select-none rounded-r-2xl"
                />
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
                <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-r from-transparent via-[#ded8cc] to-[#aba08d] rounded-r-md opacity-60 pointer-events-none"></div>
              </div>
            ) : (
              /* Back Cover (Rules on leather) */
              <div className="relative w-full h-full rounded-l-2xl overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                <img 
                  src="/images/leather-user-portrait.png" 
                  alt="Leather Back" 
                  className="w-full h-full object-cover pointer-events-none select-none rounded-l-2xl"
                />
                <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center pointer-events-none mix-blend-screen">
                  <img 
                    src="/images/rule-reference.png" 
                    alt="Rules on Leather" 
                    className="w-full h-full max-h-full object-contain filter contrast-125 brightness-105"
                  />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/80 to-transparent pointer-events-none"></div>
                <div className="absolute left-0 top-2 bottom-2 w-2 bg-gradient-to-l from-transparent via-[#ded8cc] to-[#aba08d] rounded-l-md opacity-60 pointer-events-none"></div>
              </div>
            )}

            {/* Flip to Back / Front Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playPageFlip();
                setShowBackCover(!showBackCover);
              }}
              title={showBackCover ? "Ön Kapak" : "Arka Kapak"}
              className="absolute bottom-4 right-4 z-50 p-2 rounded-full bg-black/70 hover:bg-black/95 text-neutral-400 hover:text-white border border-neutral-700 transition-all opacity-60 hover:opacity-100 backdrop-blur"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cover opening animation view: smoothly translates from translateX(-25%) to translateX(0%)
  // while the front cover swings 180° around the spine!
  if (isCoverOpening) {
    const spread1 = getSpread(1);
    return (
      <div 
        className="relative w-full max-w-5xl aspect-[1.46/1] min-h-[260px] sm:min-h-[420px] md:min-h-[560px] max-h-[88vh] mx-auto select-none transition-transform duration-200"
        style={{ transform: `scale(${scale})`, perspective: '2600px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative w-full h-full flex flex-row"
          style={{ 
            transformStyle: 'preserve-3d',
            animation: 'bookSlideToCenter 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards'
          }}
        >
          {/* Left side: completely transparent so NO brown slab or premature box is visible while cover is in mid-air */}
          <div className="relative w-1/2 h-full opacity-0 pointer-events-none"></div>

          {/* Central Book Spine */}
          <div className="relative hidden md:block w-3.5 h-full bg-gradient-to-r from-neutral-900/70 via-black to-neutral-900/70 z-20 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]">
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-neutral-700/50 border-dashed"></div>
          </div>

          {/* Right side: Revealed Lined Page 1 with natural shadow */}
          <div className="relative w-1/2 h-full rounded-r-2xl overflow-hidden flex flex-col bg-[#f7f3e8] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
            {spread1.right}
          </div>

          {/* ================= 3D SWINGING COVER LEAF ================= */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-1/2 h-full z-40 pointer-events-none"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              animation: 'coverSwingOpen 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards'
            }}
          >
            {/* Front of leaf: Front Cover ("DEATH NOTE" on leather) - hidden once rotated past 90° so it NEVER appears mirrored */}
            <div 
              className="absolute inset-0 w-full h-full rounded-r-2xl shadow-2xl bg-black backface-hidden"
              style={{ 
                transform: 'rotateY(0deg) translateZ(1px)',
                animation: 'hideAtHalfWay 0.65s linear forwards' 
              }}
            >
              <div className="relative w-full h-full rounded-r-2xl overflow-hidden">
                <img 
                  src="/images/leather-user-portrait.png" 
                  alt="Leather Cover" 
                  className="w-full h-full object-cover pointer-events-none select-none rounded-r-2xl"
                />
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
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/85 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-r from-transparent via-[#ded8cc] to-[#aba08d] rounded-r-md opacity-60 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/15 pointer-events-none"></div>
              </div>
            </div>

            {/* Back of leaf: RulePage (Rules on leather) - becomes visible at 90° and lands at -180° right-side up */}
            <div 
              className="absolute inset-0 w-full h-full rounded-l-2xl shadow-2xl bg-[#080808] backface-hidden"
              style={{ 
                transform: 'rotateY(180deg) translateZ(1px)',
                animation: 'showAtHalfWay 0.65s linear forwards'
              }}
            >
              <div className="relative w-full h-full rounded-l-2xl overflow-hidden">
                {spread1.left}
                <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-black/15 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cover closing animation view (closing from spread 1 back to spread 0)
  if (isCoverClosing) {
    const spread1 = getSpread(1);
    return (
      <div 
        className="relative w-full max-w-5xl aspect-[1.46/1] min-h-[260px] sm:min-h-[420px] md:min-h-[560px] max-h-[88vh] mx-auto select-none transition-transform duration-200"
        style={{ transform: `scale(${scale})`, perspective: '2600px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative w-full h-full flex flex-row"
          style={{ 
            transformStyle: 'preserve-3d',
            animation: 'bookSlideFromCenter 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards'
          }}
        >
          {/* Left side: completely transparent as cover lifts and closes */}
          <div className="relative w-1/2 h-full opacity-0 pointer-events-none"></div>

          {/* Central Book Spine */}
          <div className="relative hidden md:block w-3.5 h-full bg-gradient-to-r from-neutral-900/70 via-black to-neutral-900/70 z-20 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]">
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-neutral-700/50 border-dashed"></div>
          </div>

          {/* Right side: Lined Page 1 being covered */}
          <div className="relative w-1/2 h-full rounded-r-2xl overflow-hidden flex flex-col bg-[#f7f3e8] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
            {spread1.right}
          </div>

          {/* ================= 3D SWINGING COVER LEAF (CLOSING) ================= */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-1/2 h-full z-40 pointer-events-none"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              animation: 'coverSwingClose 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards'
            }}
          >
            {/* Front of leaf: Front Cover - starts hidden, reveals past 90° */}
            <div 
              className="absolute inset-0 w-full h-full rounded-r-2xl shadow-2xl bg-black backface-hidden"
              style={{ 
                transform: 'rotateY(0deg) translateZ(1px)',
                animation: 'showAtHalfWay 0.65s linear forwards' 
              }}
            >
              <div className="relative w-full h-full rounded-r-2xl overflow-hidden">
                <img 
                  src="/images/leather-user-portrait.png" 
                  alt="Leather Cover" 
                  className="w-full h-full object-cover pointer-events-none select-none rounded-r-2xl"
                />
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
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/85 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-r from-transparent via-[#ded8cc] to-[#aba08d] rounded-r-md opacity-60 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/15 pointer-events-none"></div>
              </div>
            </div>

            {/* Back of leaf: RulePage - starts visible on left, hides past 90° */}
            <div 
              className="absolute inset-0 w-full h-full rounded-l-2xl shadow-2xl bg-[#080808] backface-hidden"
              style={{ 
                transform: 'rotateY(180deg) translateZ(1px)',
                animation: 'hideAtHalfWay 0.65s linear forwards' 
              }}
            >
              <div className="relative w-full h-full rounded-l-2xl overflow-hidden">
                {spread1.left}
                <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-black/15 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active spread components
  const baseSpread = getSpread(currentSpread);

  // During 3D page flip
  let leftPageContent = baseSpread.left;
  let rightPageContent = baseSpread.right;
  let leafFrontContent = null;
  let leafBackContent = null;
  let animKeyframes = '';

  if (animState) {
    if (animState.dir === 'forward') {
      const nextSpread = getSpread(animState.toSpread);
      // Stationary Left: current spread left
      leftPageContent = baseSpread.left;
      // Stationary Right: upcoming spread right (waiting under leaf)
      rightPageContent = nextSpread.right;
      // Flipping Leaf Front: outgoing right page
      leafFrontContent = baseSpread.right;
      // Flipping Leaf Back: incoming left page
      leafBackContent = nextSpread.left;
      animKeyframes = 'flipLeafForward 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards';
    } else if (animState.dir === 'backward') {
      const prevSpread = getSpread(animState.toSpread);
      // Stationary Left: incoming spread left (waiting under leaf)
      leftPageContent = prevSpread.left;
      // Stationary Right: current spread right
      rightPageContent = baseSpread.right;
      // Flipping Leaf Front: incoming right page
      leafFrontContent = prevSpread.right;
      // Flipping Leaf Back: outgoing left page
      leafBackContent = baseSpread.left;
      animKeyframes = 'flipLeafBackward 0.65s cubic-bezier(0.4, 0, 0.6, 1) forwards';
    }
  }

  return (
    <div 
      className="relative w-full max-w-5xl aspect-[1.46/1] min-h-[260px] sm:min-h-[420px] md:min-h-[560px] max-h-[88vh] mx-auto select-none transition-transform duration-200"
      style={{ transform: `scale(${scale})`, perspective: '2600px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Realistic Open Notebook Container */}
      <div 
        className="relative w-full h-full rounded-2xl flex flex-row shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95)]"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* ================= LEFT STATIC PAGE ================= */}
        <div className="relative w-1/2 h-full rounded-l-2xl overflow-hidden flex flex-col bg-[#080808]">
          {leftPageContent}

          {/* Left Page Turn Button (Bottom Corner, never blocks entries or delete buttons) */}
          {currentSpread > 0 && !animState && (
            <button
              type="button"
              onClick={handlePrevClick}
              title="Önceki Sayfa"
              className="absolute left-3 bottom-3 w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center shadow-lg text-sm font-bold border border-neutral-700/60 hover:scale-110 transition-transform cursor-pointer z-20"
            >
              ‹
            </button>
          )}
        </div>

        {/* Central Book Spine / Gutter Depth */}
        <div className="relative w-2 sm:w-3.5 h-full bg-gradient-to-r from-neutral-900/70 via-black to-neutral-900/70 shadow-[inset_0_0_10px_rgba(0,0,0,0.95)] z-20 pointer-events-none">
          <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-neutral-700/50 border-dashed"></div>
        </div>

        {/* ================= RIGHT STATIC PAGE ================= */}
        <div className="relative w-1/2 h-full rounded-r-2xl overflow-hidden flex flex-col bg-[#f7f3e8]">
          {rightPageContent}

          {/* Right Page Turn Button (Bottom Corner, never blocks entries or delete buttons) */}
          {!animState && (
            <button
              type="button"
              onClick={handleNextClick}
              title="Sonraki Sayfa"
              className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center shadow-lg text-sm font-bold border border-neutral-700/60 hover:scale-110 transition-transform cursor-pointer z-20"
            >
              ›
            </button>
          )}
        </div>

        {/* ================= 3D ANIMATING FLIPPING LEAF (SAĞDAN SOLA KATLANAN YAPRAK) ================= */}
        {animState && (
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-1/2 h-full z-40 pointer-events-none"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              animation: animKeyframes,
            }}
          >
            {/* Front of leaf (faces right at 0deg) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-r-2xl overflow-hidden shadow-2xl bg-[#f7f3e8] backface-hidden"
              style={{ 
                transform: 'rotateY(0deg) translateZ(1px)',
                animation: animState.dir === 'forward' 
                  ? 'hideAtHalfWay 0.65s linear forwards' 
                  : 'showAtHalfWay 0.65s linear forwards'
              }}
            >
              {leafFrontContent}
              {/* 3D dynamic page crease shadow */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/15 pointer-events-none"></div>
            </div>

            {/* Back of leaf (faces left at -180deg) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-l-2xl overflow-hidden shadow-2xl bg-[#080808] backface-hidden"
              style={{ 
                transform: 'rotateY(180deg) translateZ(1px)',
                animation: animState.dir === 'forward' 
                  ? 'showAtHalfWay 0.65s linear forwards' 
                  : 'hideAtHalfWay 0.65s linear forwards'
              }}
            >
              {leafBackContent}
              {/* 3D dynamic page crease shadow */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-black/15 pointer-events-none"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Book3D;
