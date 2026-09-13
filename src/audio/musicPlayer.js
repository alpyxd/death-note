// Background music player for Death Note - Light's Themes
// Plays in random shuffle order, picking a different track on every page refresh/visit.

export const PLAYLIST = [
  { id: 0, title: "Light's Theme A", url: "/music/Death Note - (Light's Theme A) Music.mp3" },
  { id: 1, title: "Light's Theme B", url: "/music/Death Note - (Light's Theme B) Music.mp3" },
  { id: 2, title: "Light's Theme C", url: "/music/Death Note - (Light's Theme C) Music.mp3" },
  { id: 3, title: "Light's Theme D", url: "/music/Death Note - (Light's Theme D) Music.mp3" },
  { id: 4, title: "Light's Theme E", url: "/music/Death Note - (Light's Theme E) Music.mp3" },
  { id: 5, title: "Light's Theme F", url: "/music/Death Note - (Light's Theme F) Music.mp3" }
];

const LAST_PLAYED_KEY = 'death_note_last_played_track_id';

class MusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.userPaused = false;
    this.volume = 0.5;
    this.audio.volume = this.volume;

    this.listeners = new Set();
    this.currentIndex = 0;

    // Pick random starting track different from the previous session's track on each page refresh
    this.initInitialTrack();

    // Auto-advance to next track in sequential order when current track ends
    this.audio.addEventListener('ended', () => {
      this.next();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    // Listen for user gesture fallback if browser blocks initial autoplay
    this.setupGestureUnlock();
  }

  initInitialTrack() {
    let lastTrackId = null;
    try {
      const saved = localStorage.getItem(LAST_PLAYED_KEY) || sessionStorage.getItem(LAST_PLAYED_KEY);
      if (saved !== null && saved !== undefined) {
        lastTrackId = parseInt(saved, 10);
      }
    } catch {
      lastTrackId = null;
    }

    // Pick starting track from candidates excluding lastTrackId (guarantees a different song on refresh)
    const candidates = Number.isInteger(lastTrackId) 
      ? PLAYLIST.filter(track => track.id !== lastTrackId) 
      : PLAYLIST;

    const startTrack = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : PLAYLIST[Math.floor(Math.random() * PLAYLIST.length)];

    this.currentIndex = startTrack.id;
    this.audio.src = startTrack.url;
    this.saveCurrentTrack();
  }

  get currentTrack() {
    return PLAYLIST[this.currentIndex] || PLAYLIST[0];
  }

  saveCurrentTrack() {
    try {
      localStorage.setItem(LAST_PLAYED_KEY, String(this.currentTrack.id));
      sessionStorage.setItem(LAST_PLAYED_KEY, String(this.currentTrack.id));
    } catch (e) {
      // Ignore storage errors
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((callback) => {
      try {
        callback({
          isPlaying: this.isPlaying,
          currentIndex: this.currentIndex,
          currentTrack: this.currentTrack,
          volume: this.volume
        });
      } catch (e) {
        console.error("MusicPlayer listener error:", e);
      }
    });
  }

  play() {
    this.userPaused = false;
    if (!this.audio.src) {
      this.audio.src = this.currentTrack.url;
    }

    return this.audio.play()
      .then(() => {
        this.isPlaying = true;
        this.saveCurrentTrack();
        this.notify();
      })
      .catch((err) => {
        // Handled via gesture unlock listener
        console.log("Autoplay waiting for user gesture:", err?.name || err);
      });
  }

  pause() {
    this.userPaused = true;
    this.audio.pause();
    this.isPlaying = false;
    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % PLAYLIST.length;
    this.audio.src = this.currentTrack.url;
    this.saveCurrentTrack();
    this.notify();

    if (this.isPlaying) {
      this.audio.play().catch(console.error);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audio.volume = this.volume;
    this.notify();
  }

  setupGestureUnlock() {
    const handleGesture = () => {
      // If user hasn't explicitly clicked pause, start playing on first interaction
      if (!this.isPlaying && !this.userPaused) {
        this.play();
      }
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', handleGesture, { once: true });
      window.addEventListener('keydown', handleGesture, { once: true });

      // Immediate attempt if browser permits
      setTimeout(() => {
        if (!this.isPlaying && !this.userPaused) {
          this.play();
        }
      }, 300);
    }
  }
}

export const musicPlayer = new MusicPlayer();
export default musicPlayer;
