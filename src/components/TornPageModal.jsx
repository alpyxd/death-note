import React, { useState } from 'react';
import { X, Flame, AlertCircle, Watch } from 'lucide-react';
import soundEngine from '../audio/soundEngine';

export default function TornPageModal({ isOpen, onClose, onAddEntry }) {
  const [name, setName] = useState('');
  const [cause, setCause] = useState('');
  const [inkType, setInkType] = useState('blood'); // 'blood' or 'pen'

  if (!isOpen) return null;

  const handleWrite = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEngine.playPenScratch();
    const newEntry = {
      id: 'torn-' + Date.now(),
      name: name.trim(),
      cause: cause.trim() || 'Heart Attack (Emergency Fragment Execution)',
      details: `[Torn Fragment - ${inkType === 'blood' ? 'Written in Blood' : 'Fountain Pen'}]`,
      crossedOut: false,
      handwritingStyle: inkType === 'blood' ? 'font-light-frantic text-red-700' : 'font-light-frantic',
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      lifespan: Math.floor(10000000 + Math.random() * 89999999)
    };

    onAddEntry(newEntry);
    setName('');
    setCause('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-neutral-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Rule Quote Alert */}
        <div className="mb-3 px-3 py-1.5 rounded bg-neutral-900/90 border border-neutral-800 text-neutral-400 text-xs font-serif flex items-center gap-2">
          <Watch className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>Rule III: "One page taken from the Death Note, or even a fragment, contains the full effects."</span>
        </div>

        {/* Realistic Torn Jagged Paper Scrap */}
        <div 
          className="relative bg-[#f5efe2] text-neutral-900 p-8 shadow-2xl rounded-sm border border-[#e2d5be]"
          style={{
            clipPath: 'polygon(0% 2%, 3% 0%, 97% 1%, 100% 4%, 99% 96%, 96% 100%, 4% 98%, 0% 95%, 1% 50%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(180,160,120,0.3)'
          }}
        >
          {/* Faint blue notebook lines on fragment */}
          <div className="absolute inset-0 lined-notebook-page pointer-events-none opacity-40"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-400 mb-4">
              <span className="text-xs font-serif font-bold tracking-widest text-neutral-600 uppercase">
                TORN SCRAP OF DEATH NOTE
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInkType(inkType === 'blood' ? 'pen' : 'blood')}
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border transition-colors ${inkType === 'blood' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-neutral-800 text-neutral-300 border-neutral-600'}`}
                >
                  {inkType === 'blood' ? '🩸 Kanla Yaz' : '✒️ Dolma Kalem'}
                </button>
              </div>
            </div>

            <form onSubmit={handleWrite} className="space-y-4">
              <div>
                <label className="text-xs font-serif font-bold text-neutral-700 block mb-1">
                  Hedef İsim:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    soundEngine.playPenScratch();
                    setName(e.target.value);
                  }}
                  placeholder="Gizlice infaz edilecek isim..."
                  required
                  autoFocus
                  className={`w-full bg-transparent border-b-2 border-neutral-500 focus:border-red-700 outline-none py-1.5 text-xl font-light-frantic font-bold placeholder-neutral-400 ${inkType === 'blood' ? 'text-red-800' : 'text-neutral-900'}`}
                />
              </div>

              <div>
                <label className="text-xs font-serif text-neutral-600 block mb-1">
                  Ölüm Nedeni (İsteğe bağlı):
                </label>
                <input
                  type="text"
                  value={cause}
                  onChange={(e) => {
                    soundEngine.playPenScratch();
                    setCause(e.target.value);
                  }}
                  placeholder="Belirtilmezse: Kalp Krizi (40 sn)"
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-red-700 outline-none py-1 text-sm font-serif placeholder-neutral-400 text-neutral-800"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className={`px-5 py-2 rounded text-xs font-bold tracking-wider uppercase shadow-lg transition-all ${inkType === 'blood' ? 'bg-red-900 hover:bg-red-800 text-white shadow-red-900/40' : 'bg-neutral-900 hover:bg-neutral-800 text-white'}`}
                >
                  Parçaya Yaz 🩸
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
