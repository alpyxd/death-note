import React, { useState } from 'react';
import soundEngine from '../audio/soundEngine';

export default function LinedPage({ 
  entries = [], 
  onAddEntry, 
  onToggleStrike, 
  onDeleteEntry,
  pageNumber,
  pageSide = 'right'
}) {
  const [inputText, setInputText] = useState('');

  const handleChange = (e) => {
    soundEngine.playPenScratch();
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      soundEngine.playPenScratch();
      onAddEntry({
        id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        text: inputText.trim(),
        crossedOut: false,
      });
      setInputText('');
    }
  };

  return (
    <div className={`relative w-full h-full lined-paper-authentic text-neutral-900 p-4 sm:p-8 md:p-12 flex flex-col justify-between overflow-hidden select-text ${pageSide === 'left' ? 'left-page-gutter' : 'right-page-gutter'}`}>
      
      {/* Red Margin Line */}
      <div className="absolute left-6 sm:left-10 md:left-14 top-0 bottom-0 w-px bg-red-400/40 pointer-events-none"></div>

      {/* Notebook Lines Area */}
      <div className="relative z-10 flex-1 ml-2 sm:ml-4 md:ml-8 flex flex-col justify-start space-y-1">
        
        {/* Render written entries */}
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="group flex items-center justify-between h-8 border-b border-transparent leading-8 select-text"
          >
            <span 
              onClick={() => onToggleStrike && onToggleStrike(entry.id, !entry.crossedOut)}
              className={`text-base sm:text-xl md:text-2xl text-neutral-900 cursor-pointer transition-all truncate pr-2 ${entry.crossedOut ? 'line-through decoration-neutral-800 decoration-2 opacity-50' : ''}`}
              style={{ fontFamily: 'DeathNote, serif' }}
              title="Üstünü çiz / kaldır"
            >
              {entry.text}
            </span>

            {onDeleteEntry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEntry(entry.id);
                }}
                className="opacity-50 sm:opacity-0 group-hover:opacity-100 text-xs sm:text-sm text-neutral-400 hover:text-red-700 transition-opacity p-1.5 sm:px-2 touch-manipulation flex-shrink-0 cursor-pointer relative z-10"
                title="Sil"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Active Typing Line (Pure empty line, no placeholder) */}
        {onAddEntry && (
          <form onSubmit={handleSubmit} className="h-8 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              enterKeyHint="enter"
              autoCapitalize="words"
              className="w-full bg-transparent outline-none text-base sm:text-xl md:text-2xl text-neutral-900 caret-black"
              style={{ fontFamily: 'DeathNote, serif' }}
            />
          </form>
        )}
      </div>

      {/* Page Number */}
      <div className="relative z-10 text-right pr-2 text-neutral-400 text-[10px] sm:text-xs select-none">
        {pageNumber}
      </div>

      {/* Gutter Spine Shadow */}
      <div className={`absolute top-0 bottom-0 w-6 pointer-events-none ${pageSide === 'left' ? 'right-0 bg-gradient-to-l from-neutral-800/30 to-transparent' : 'left-0 bg-gradient-to-r from-neutral-800/30 to-transparent'}`}></div>
    </div>
  );
}
