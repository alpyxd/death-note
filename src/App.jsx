import React, { useState, useEffect, useRef } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import Book3D from './components/Book3D';
import RulePage from './components/RulePage';
import LinedPage, { MAX_PAGE_ENTRIES } from './components/LinedPage';
import MobileBookView from './components/MobileBookView';
import AudioAndScaleControls from './components/AudioAndScaleControls';
import wallSocket from './services/wallSocket';
import soundEngine from './audio/soundEngine';

const STORAGE_KEY = 'death_note_clean_entries';

export default function App() {
  // Spreads:
  // 0: Closed Notebook (Front Cover / Back Cover)
  // 1: Open Book (Left: Rules Page, Right: Lined Page 1)
  // 2+: Infinite Lined Pages (Left: Page 2, Right: Page 3; Left: Page 4, Right: Page 5; etc.)
  const [currentSpread, setCurrentSpread] = useState(0);
  const [scale, setScale] = useState(1.0);

  // Live Wall Connection State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // View Mode: 'single' (optimized for mobile portrait) or 'spread' (classic 2-page 3D book)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'single' : 'spread';
    }
    return 'spread';
  });

  // Mobile single page index:
  // 0: Cover
  // 1: Rules
  // 2: Lined Page 1
  // 3: Lined Page 2
  // etc.
  const [mobilePage, setMobilePage] = useState(0);

  // User-written entries organized by page number: { [pageNumber]: [ { id, text, crossedOut } ] }
  const [pagesData, setPagesData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Connect to live public wall WebSocket server
  useEffect(() => {
    wallSocket.connect();

    const unsubInit = wallSocket.on('init', ({ data, onlineCount }) => {
      if (data && Object.keys(data).length > 0) {
        setPagesData(data);
      }
      setOnlineCount(onlineCount || 1);
      setIsLiveConnected(true);
    });

    const unsubStatus = wallSocket.on('status', ({ connected }) => {
      setIsLiveConnected(connected);
    });

    const unsubOnline = wallSocket.on('online_count', (count) => {
      setOnlineCount(count);
    });

    const unsubAdd = wallSocket.on('add_entry', ({ pageNum, entry }) => {
      setPagesData((prev) => {
        const existing = prev[pageNum] || [];
        if (existing.some((item) => item.id === entry.id)) return prev;
        return {
          ...prev,
          [pageNum]: [...existing, entry]
        };
      });
      // Play fountain pen scratch sound when another user writes on the wall
      soundEngine.playPenScratch();
    });

    const unsubStrike = wallSocket.on('toggle_strike', ({ pageNum, id, crossedOut }) => {
      setPagesData((prev) => {
        const existing = prev[pageNum] || [];
        return {
          ...prev,
          [pageNum]: existing.map((item) =>
            item.id === id ? { ...item, crossedOut: typeof crossedOut === 'boolean' ? crossedOut : !item.crossedOut } : item
          )
        };
      });
    });

    const unsubDelete = wallSocket.on('delete_entry', ({ pageNum, id }) => {
      setPagesData((prev) => {
        const existing = prev[pageNum] || [];
        return {
          ...prev,
          [pageNum]: existing.filter((item) => item.id !== id)
        };
      });
    });

    return () => {
      unsubInit();
      unsubStatus();
      unsubOnline();
      unsubAdd();
      unsubStrike();
      unsubDelete();
      wallSocket.disconnect();
    };
  }, []);

  // Save to localStorage as secondary backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pagesData));
    } catch (e) {
      console.error(e);
    }
  }, [pagesData]);

  const book3dRef = useRef(null);
  const mobileBookRef = useRef(null);

  const handlePageFull = (filledPageNum) => {
    if (viewMode === 'single') {
      // In single-page mode (mobile):
      // Page 1 is mobilePage 2. Next page (Page 2) is mobilePage 3.
      // General formula: mobilePage for lined page K is K + 1.
      const targetMobilePage = filledPageNum + 2;
      if (mobileBookRef.current?.triggerPageChange) {
        mobileBookRef.current.triggerPageChange(targetMobilePage, 'forward');
      } else {
        handleMobilePageChange(targetMobilePage);
      }
    } else {
      // In desktop 3D spread mode:
      if (filledPageNum === 1 || filledPageNum % 2 === 1) {
        // Page 1 or any right-side page (3, 5, 7, ...) fills up -> flip forward to next spread!
        book3dRef.current?.flipNext?.();
      }
      // If left-side page (2, 4, 6, ...) fills up, right side of the same spread is already visible!
    }
  };

  const handleAddEntry = (pageNum, entry) => {
    let targetPage = pageNum;
    // If the chosen page is already full, find the first available page with room
    while ((pagesData[targetPage] || []).length >= MAX_PAGE_ENTRIES) {
      targetPage++;
    }

    const currentCount = (pagesData[targetPage] || []).length;
    const willBeFull = currentCount + 1 >= MAX_PAGE_ENTRIES;

    setPagesData((prev) => {
      const existing = prev[targetPage] || [];
      return {
        ...prev,
        [targetPage]: [...existing, entry]
      };
    });

    // Broadcast to public wall
    wallSocket.addEntry(targetPage, entry);

    // If this entry fills the page (reaching MAX_PAGE_ENTRIES):
    if (willBeFull) {
      setTimeout(() => {
        handlePageFull(targetPage);
      }, 400);
    }
  };

  const handleToggleStrike = (pageNum, id, forceState) => {
    let targetState;
    if (typeof forceState === 'boolean') {
      targetState = forceState;
    } else {
      const existing = pagesData[pageNum] || [];
      const currentItem = existing.find((item) => item.id === id);
      targetState = currentItem ? !currentItem.crossedOut : true;
    }

    setPagesData((prev) => {
      const existing = prev[pageNum] || [];
      return {
        ...prev,
        [pageNum]: existing.map((item) =>
          item.id === id ? { ...item, crossedOut: targetState } : item
        )
      };
    });
    // Broadcast explicit state to public wall so sender never double-toggles
    wallSocket.toggleStrike(pageNum, id, targetState);
  };

  const handleDeleteEntry = (pageNum, id) => {
    setPagesData((prev) => {
      const existing = prev[pageNum] || [];
      return {
        ...prev,
        [pageNum]: existing.filter((item) => item.id !== id)
      };
    });
    // Broadcast to public wall
    wallSocket.deleteEntry(pageNum, id);
  };

  // Helper returning the components of any spread
  const getSpread = (spreadIndex) => {
    if (spreadIndex <= 0) {
      return { left: null, right: null };
    }

    if (spreadIndex === 1) {
      const page1Entries = pagesData[1] || [];
      return {
        left: <RulePage pageSide="left" />,
        right: (
          <LinedPage
            entries={page1Entries}
            onAddEntry={(entry) => handleAddEntry(1, entry)}
            onToggleStrike={(id, forceState) => handleToggleStrike(1, id, forceState)}
            onDeleteEntry={(id) => handleDeleteEntry(1, id)}
            onNextPage={() => handlePageFull(1)}
            pageNumber={1}
            pageSide="right"
          />
        )
      };
    }

    // Infinite Lined Pages (spreadIndex >= 2)
    const leftPageNum = (spreadIndex - 2) * 2 + 2;
    const rightPageNum = (spreadIndex - 2) * 2 + 3;

    const leftEntries = pagesData[leftPageNum] || [];
    const rightEntries = pagesData[rightPageNum] || [];

    return {
      left: (
        <LinedPage
          entries={leftEntries}
          onAddEntry={(entry) => handleAddEntry(leftPageNum, entry)}
          onToggleStrike={(id, forceState) => handleToggleStrike(leftPageNum, id, forceState)}
          onDeleteEntry={(id) => handleDeleteEntry(leftPageNum, id)}
          onNextPage={() => handlePageFull(leftPageNum)}
          pageNumber={leftPageNum}
          pageSide="left"
        />
      ),
      right: (
        <LinedPage
          entries={rightEntries}
          onAddEntry={(entry) => handleAddEntry(rightPageNum, entry)}
          onToggleStrike={(id, forceState) => handleToggleStrike(rightPageNum, id, forceState)}
          onDeleteEntry={(id) => handleDeleteEntry(rightPageNum, id)}
          onNextPage={() => handlePageFull(rightPageNum)}
          pageNumber={rightPageNum}
          pageSide="right"
        />
      )
    };
  };

  const handleMobilePageChange = (newMobilePage) => {
    setMobilePage(newMobilePage);
    if (newMobilePage === 0) {
      setCurrentSpread(0);
    } else if (newMobilePage === 1 || newMobilePage === 2) {
      setCurrentSpread(1);
    } else {
      const linedNum = newMobilePage - 1;
      const spread = Math.floor((linedNum - 2) / 2) + 2;
      setCurrentSpread(spread);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'single' ? 'spread' : 'single'));
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-2 sm:p-4 md:p-6 relative select-none overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40"></div>

      {/* Real-time Global Wall Live Indicator */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 rounded-full px-3 py-1 flex items-center gap-2 shadow-2xl text-[11px] select-none text-neutral-300">
        <span 
          className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`}
          title={isLiveConnected ? "Canlı Duvar Sunucusuna Bağlı" : "Bağlantı Kuruluyor..."}
        ></span>
        <span className="font-serif text-[10px] sm:text-[11px] text-neutral-300 tracking-wide">
          {isLiveConnected ? 'Canlı Duvar' : 'Bağlanıyor...'}
        </span>
        {isLiveConnected && (
          <div className="flex items-center gap-1 pl-1.5 border-l border-neutral-800 text-neutral-400">
            <Users className="w-3 h-3 text-neutral-400" />
            <span className="font-mono text-[10px] text-neutral-300">{onlineCount}</span>
          </div>
        )}
      </div>

      {/* Main Book Display */}
      {viewMode === 'single' ? (
        <div className="w-full max-w-md flex items-center justify-center pb-14 sm:pb-0">
          <MobileBookView
            ref={mobileBookRef}
            page={mobilePage}
            onPageChange={handleMobilePageChange}
            pagesData={pagesData}
            onAddEntry={handleAddEntry}
            onToggleStrike={handleToggleStrike}
            onDeleteEntry={handleDeleteEntry}
            scale={scale}
            onToggleViewMode={toggleViewMode}
          />
        </div>
      ) : (
        <div className="w-full max-w-5xl flex items-center justify-center pb-14 sm:pb-0">
          <Book3D
            ref={book3dRef}
            currentSpread={currentSpread}
            onOpenCover={() => {
              setCurrentSpread(1);
              setMobilePage(2);
            }}
            onNext={() => {
              setCurrentSpread((prev) => {
                const next = prev + 1;
                setMobilePage(next === 1 ? 2 : (next - 2) * 2 + 3);
                return next;
              });
            }}
            onPrev={() => {
              setCurrentSpread((prev) => {
                const next = Math.max(0, prev - 1);
                if (next === 0) setMobilePage(0);
                else if (next === 1) setMobilePage(2);
                else setMobilePage((next - 2) * 2 + 3);
                return next;
              });
            }}
            getSpread={getSpread}
            scale={scale}
          />
        </div>
      )}

      {/* Discreet Audio & Scale Controls in Corners (Responsive Mobile Dock & Desktop Pills) */}
      <AudioAndScaleControls 
        scale={scale} 
        onScaleChange={setScale} 
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
      />

    </div>
  );
}
