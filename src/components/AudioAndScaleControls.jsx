import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, ZoomIn, ZoomOut, BookOpen, FileText } from 'lucide-react';
import musicPlayer from '../audio/musicPlayer';

const TRACK_NAMES = [
  "Light's Theme A",
  "Light's Theme B",
  "Light's Theme C",
  "Light's Theme D",
  "Light's Theme E",
  "Light's Theme F"
];

export default function AudioAndScaleControls({ scale, onScaleChange, viewMode, onToggleViewMode }) {
  const [isPlaying, setIsPlaying] = useState(() => musicPlayer.isPlaying);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => musicPlayer.currentIndex);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Immediate subscription to music player events
    const unsubscribe = musicPlayer.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrackIndex(state.currentIndex);
    });

    // Periodic safety sync
    const interval = setInterval(() => {
      setIsPlaying(musicPlayer.isPlaying);
      setCurrentTrackIndex(musicPlayer.currentIndex);
    }, 500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const togglePlay = () => {
    const playing = musicPlayer.toggle();
    setIsPlaying(playing);
  };

  const handleNext = () => {
    musicPlayer.next();
    setCurrentTrackIndex(musicPlayer.currentIndex);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    musicPlayer.setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      musicPlayer.setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      musicPlayer.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Mobile Unified Dock (< 640px) */}
      <div className="fixed bottom-3 inset-x-3 max-w-sm mx-auto z-40 sm:hidden bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-full px-3 py-1.5 flex items-center justify-between shadow-2xl select-none">
        {/* Left: Play / Next / Track */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Müziği Duraklat" : "Müziği Çal"}
            className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center transition-colors touch-manipulation"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleNext}
            title="Sonraki Parça"
            className="text-neutral-400 hover:text-white transition-colors touch-manipulation p-1"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="flex items-center max-w-[120px]">
            <span className="text-[10px] font-serif text-neutral-300 truncate">
              {TRACK_NAMES[currentTrackIndex]}
            </span>
          </div>
        </div>

        {/* Right: Mute & View Switcher */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1 text-neutral-400 hover:text-white touch-manipulation"
            title={isMuted ? "Sesi Aç" : "Sessize Al"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {onToggleViewMode && (
            <button
              type="button"
              onClick={onToggleViewMode}
              title={viewMode === 'single' ? "Çift Sayfa Görünümü" : "Tek Sayfa Görünümü"}
              className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full text-[10px] border border-neutral-700/60 touch-manipulation"
            >
              {viewMode === 'single' ? (
                <>
                  <BookOpen className="w-3 h-3" />
                  <span>Çift</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3" />
                  <span>Tek</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Desktop Bottom Left: Music Player (>= 640px) */}
      <div className="hidden sm:flex fixed bottom-4 left-4 z-40 bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-full px-4 py-2 items-center gap-3 shadow-2xl select-none transition-opacity duration-300 opacity-70 hover:opacity-100">
        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? "Müziği Duraklat" : "Müziği Çal"}
          className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleNext}
          title="Sonraki Parça"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex items-center min-w-[105px]">
          <span className="text-[11px] font-serif text-neutral-300 truncate">
            {TRACK_NAMES[currentTrackIndex]}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-800">
          <button
            type="button"
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 accent-neutral-400 h-1 bg-neutral-800 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Desktop Bottom Right: Scale / Zoom Controls (>= 640px) */}
      <div className="hidden sm:flex fixed bottom-4 right-4 z-40 bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-full px-3 py-1.5 items-center gap-2 shadow-2xl select-none transition-opacity duration-300 opacity-70 hover:opacity-100">
        <button
          type="button"
          onClick={() => onScaleChange(Math.max(0.65, scale - 0.05))}
          title="Küçült"
          className="p-1 text-neutral-400 hover:text-white transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono text-neutral-300 min-w-[36px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={() => onScaleChange(Math.min(1.35, scale + 0.05))}
          title="Büyüt"
          className="p-1 text-neutral-400 hover:text-white transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {scale !== 1.0 && (
          <button
            type="button"
            onClick={() => onScaleChange(1.0)}
            title="Sıfırla"
            className="text-[10px] text-neutral-500 hover:text-neutral-300 pl-1 underline"
          >
            100%
          </button>
        )}

        {onToggleViewMode && (
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'single' ? "Çift Sayfa Modu" : "Tek Sayfa Modu"}
            className="ml-1 pl-2 border-l border-neutral-800 flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
          >
            {viewMode === 'single' ? <BookOpen className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{viewMode === 'single' ? 'Çift Sayfa' : 'Tek Sayfa'}</span>
          </button>
        )}
      </div>
    </>
  );
}
