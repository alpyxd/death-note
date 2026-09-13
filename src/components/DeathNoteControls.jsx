import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Book, 
  Scroll, 
  PenTool, 
  Volume2, 
  VolumeX, 
  Music, 
  Eye, 
  Apple, 
  FileText,
  RotateCcw
} from 'lucide-react';
import soundEngine from '../audio/soundEngine';

export default function DeathNoteControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToCover,
  onGoToRules,
  onGoToCanon,
  onGoToWrite,
  isMuted,
  onToggleMute,
  isAmbientPlaying,
  onToggleAmbient,
  shinigamiEyesActive,
  onToggleShinigamiEyes,
  onOpenRyuk,
  onOpenTornPage,
  onResetNotebook
}) {
  return (
    <header className="w-full max-w-5xl mx-auto mb-4 px-3 select-none">
      <div className="bg-neutral-950/90 backdrop-blur-md border border-neutral-800/80 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Quick Jump Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onGoToCover}
            title="Kapağa Git"
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase flex items-center gap-1.5 transition-all ${currentPage === 0 ? 'bg-neutral-800 text-white border border-neutral-600' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
          >
            <Book className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Kapak</span>
          </button>

          <button
            onClick={onGoToRules}
            title="Kurallara Git (How to Use It)"
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase flex items-center gap-1.5 transition-all ${currentPage >= 1 && currentPage <= 7 ? 'bg-neutral-800 text-white border border-red-900/80' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
          >
            <Scroll className="w-3.5 h-3.5 text-red-500" />
            <span>Kurallar</span>
          </button>

          <button
            onClick={onGoToCanon}
            title="Light'ın Orijinal Yazdığı Sayfalar"
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase flex items-center gap-1.5 transition-all ${currentPage >= 8 && currentPage <= 9 ? 'bg-neutral-800 text-white border border-neutral-600' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Light'ın Notları</span>
          </button>

          <button
            onClick={onGoToWrite}
            title="Kendi İsimlerini Yazabileceğin Sayfalar"
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase flex items-center gap-1.5 transition-all ${currentPage >= 10 ? 'bg-red-950/80 text-white border border-red-700' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
          >
            <PenTool className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold text-red-300">Yazma Modu</span>
          </button>
        </div>

        {/* Center: Page Controls (< 1 / 12 >) */}
        <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-800">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 0}
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            title="Önceki Sayfa"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs text-neutral-300 min-w-[70px] text-center">
            {currentPage === 0 ? 'KAPAK' : `${currentPage} / ${totalPages}`}
          </span>

          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            title="Sonraki Sayfa"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Audio & Shinigami Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Shinigami Eyes */}
          <button
            onClick={onToggleShinigamiEyes}
            title={shinigamiEyesActive ? 'Shinigami Gözlerini Kapat' : 'Shinigami Gözlerini Aç (Ömür & İsimler Görünsün)'}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${shinigamiEyesActive ? 'bg-red-900/80 text-white border border-red-600 animate-pulse shadow-[0_0_12px_rgba(255,0,0,0.5)]' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
          >
            <Eye className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Shinigami Gözü</span>
          </button>

          {/* Feed Ryuk Apple */}
          <button
            onClick={onOpenRyuk}
            title="Ryuk'a Elma Ver 🍎 (Shinigami Çağır)"
            className="px-2.5 py-1 rounded text-xs bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-red-900 flex items-center gap-1.5 transition-colors"
          >
            <Apple className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">Ryuk</span>
          </button>

          {/* Torn Page Fragment */}
          <button
            onClick={onOpenTornPage}
            title="Kopuk Sayfa Parçası (Light'ın Saatindeki Gizli Sayfa)"
            className="px-2.5 py-1 rounded text-xs bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-600 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden md:inline">Kopuk Parça</span>
          </button>

          {/* Ambient Music Toggle */}
          <button
            onClick={onToggleAmbient}
            title={isAmbientPlaying ? 'Death Note Ambians Müziğini Durdur' : 'Death Note Tematik Müziğini Başlat'}
            className={`p-1.5 rounded transition-colors ${isAmbientPlaying ? 'bg-red-950 text-red-400 border border-red-700' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Sesleri Aç' : 'Sesleri Kapat'}
            className={`p-1.5 rounded transition-colors ${isMuted ? 'bg-neutral-900 text-neutral-500 border border-neutral-800' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>

          {/* Reset Notebook */}
          <button
            onClick={onResetNotebook}
            title="Tüm Yazılan İsimleri Sıfırla"
            className="p-1.5 rounded bg-neutral-900 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
