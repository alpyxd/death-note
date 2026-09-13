import React, { useState, useEffect, useRef } from 'react';
import { Skull, AlertTriangle, X, Heart, ShieldAlert } from 'lucide-react';
import soundEngine from '../audio/soundEngine';

export default function DeathTimerModal({ entry, onClose, onUpdateEntry }) {
  const [timeLeft, setTimeLeft] = useState(40);
  const [cause, setCause] = useState(entry.cause || 'Heart Attack (心臓麻痺)');
  const [details, setDetails] = useState(entry.details || '');
  const [isExecuted, setIsExecuted] = useState(false);
  const timerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    // Start countdown
    soundEngine.playHeartbeat(0.9);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleExecute();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, []);

  // Heartbeat sound effects matching countdown urgency
  useEffect(() => {
    if (timeLeft > 0 && !isExecuted) {
      if (timeLeft <= 10) {
        soundEngine.playHeartbeat(1.4); // Faster & more urgent
      } else if (timeLeft % 3 === 0) {
        soundEngine.playHeartbeat(0.9);
      }
    }
  }, [timeLeft, isExecuted]);

  const handleExecute = () => {
    setIsExecuted(true);
    soundEngine.playHeartAttackExecute();
    if (onUpdateEntry) {
      onUpdateEntry(entry.id, { cause, details, executed: true });
    }
  };

  const handleSaveCause = () => {
    soundEngine.playPenScratch();
    if (onUpdateEntry) {
      onUpdateEntry(entry.id, { cause, details });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      
      {/* Background Red Flash Vignette on Execution */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isExecuted ? 'bg-red-950/40 opacity-100' : 'opacity-0'}`}></div>

      <div className="relative w-full max-w-lg bg-neutral-950 border-2 border-red-900 rounded-xl p-6 sm:p-8 shadow-[0_0_50px_rgba(180,20,20,0.4)] text-white overflow-hidden">
        
        {/* Corner Shinigami Skull / Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-full bg-red-950/80 border border-red-800 text-red-500 animate-pulse">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-gothic text-2xl text-red-500 tracking-wider">
              RULE: 40 SECONDS COUNTDOWN
            </h3>
            <p className="text-xs text-neutral-400 font-serif">
              "If the cause of death is not specified, the person will simply die of a heart attack."
            </p>
          </div>
        </div>

        {/* Target Info */}
        <div className="bg-neutral-900/90 rounded-lg p-4 border border-neutral-800 mb-6 text-center">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-serif block mb-1">
            TARGET
          </span>
          <div className="text-3xl font-bold font-light-neat text-white tracking-wide">
            {entry.name}
          </div>
          {entry.romaji && (
            <div className="text-xs text-neutral-400 font-serif italic mt-0.5">
              {entry.romaji}
            </div>
          )}
        </div>

        {/* Big Countdown Timer */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-neutral-100'}`}>
            <Heart className={`w-8 h-8 text-red-600 ${timeLeft <= 10 ? 'animate-ping' : 'animate-pulse'}`} />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>
          
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-600' : 'bg-red-800'}`}
              style={{ width: `${(timeLeft / 40) * 100}%` }}
            ></div>
          </div>
          
          <span className="text-xs text-neutral-400 font-mono mt-2">
            {isExecuted ? '💀 INFAZ GERÇEKLEŞTI (HEART ATTACK)' : 'Ölüm nedeni belirleniyor...'}
          </span>
        </div>

        {/* Input cause & conditions within time */}
        {!isExecuted ? (
          <div className="space-y-3 bg-neutral-900/60 p-4 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-300 font-serif">Ölüm Sebebi (40 sn içinde değiştirilebilir):</label>
              <span className="text-[10px] text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Rule I
              </span>
            </div>
            
            <input
              type="text"
              value={cause}
              onChange={(e) => {
                soundEngine.playPenScratch();
                setCause(e.target.value);
              }}
              placeholder="Örn: Trafik kazası, İntihar, Kalp Krizi..."
              className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-red-500"
            />

            <input
              type="text"
              value={details}
              onChange={(e) => {
                soundEngine.playPenScratch();
                setDetails(e.target.value);
              }}
              placeholder="Ölümün Detayları (Sonraki 6 dk 40 sn içinde de yazılabilir)..."
              className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSaveCause}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded text-xs text-white transition-colors"
              >
                Nedeni Güncelle
              </button>

              <button
                type="button"
                onClick={handleExecute}
                className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-xs text-white font-semibold transition-colors flex items-center gap-1"
              >
                <Skull className="w-3.5 h-3.5" />
                <span>Anında İnfaz Et</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-center animate-pulse">
            <h4 className="text-lg font-bold text-red-400 font-serif">
              Şahsın Ölümü Gerçekleşti
            </h4>
            <p className="text-xs text-neutral-300 mt-1">
              {cause} — {details || 'Kalp yetmezliği ve ani kriz.'}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-xs text-white uppercase tracking-wider transition-colors"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
