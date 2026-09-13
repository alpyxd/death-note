// Death Note Procedural Web Audio API Sound Engine
// Zero external file dependencies, zero latency, runs directly in browser

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isAmbientPlaying = false;
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  // Realistic scratchy fountain pen stroke sound
  playPenScratch() {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const duration = 0.05 + Math.random() * 0.04;

    // Buffer of white noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Noise with varying grain
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to emulate scratch on paper
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800 + Math.random() * 1200, t);
    filter.Q.setValueAtTime(3.5, t);

    const gain = this.ctx.createGain();
    const vol = 0.07 + Math.random() * 0.05;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(t);
  }

  // Authentic book page flip sound from user's pageflip.mp3
  playPageFlip() {
    if (this.isMuted) return;
    try {
      const audio = new Audio('/sfx/pageflip.mp3');
      audio.volume = 0.85;
      audio.play().catch(() => {
        this.playPageFlipSynth();
      });
    } catch {
      this.playPageFlipSynth();
    }
  }

  playPageFlipSynth() {
    this.init();
    const t = this.ctx.currentTime;
    const duration = 0.35;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(200, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(t);
  }

  // Tense Heartbeat (Lub-Dub)
  playHeartbeat(urgency = 1.0) {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    // First beat (Lub)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65 * urgency, t);
    osc1.frequency.exponentialRampToValueAtTime(38, t + 0.15);

    gain1.gain.setValueAtTime(0.35 * urgency, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.17);

    // Second beat (Dub) 0.12s later
    const t2 = t + 0.13;
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55 * urgency, t2);
    osc2.frequency.exponentialRampToValueAtTime(30, t2 + 0.2);

    gain2.gain.setValueAtTime(0.4 * urgency, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.22);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.23);
  }

  // Dramatic Death Note Bell & Sub-Bass Strike (Execute Moment)
  playHeartAttackExecute() {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;

    // 1. Deep sub bass impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 1.2);
    subGain.gain.setValueAtTime(0.6, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 1.6);

    // 2. Chilling Bell Toll / Church Bell partials
    const bellFrequencies = [130.81, 261.63, 392.00, 523.25, 783.99, 1046.50];
    const bellAmps = [0.25, 0.2, 0.15, 0.1, 0.06, 0.03];

    bellFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Inharmonicity of bells
      osc.frequency.setValueAtTime(freq * (1 + (idx * 0.015)), t);

      const decayTime = 2.5 + idx * 0.4;
      gain.gain.setValueAtTime(bellAmps[idx] * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + decayTime);
    });

    // 3. Flatline tone shortly after
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const ft = this.ctx.currentTime;
      const flatlineOsc = this.ctx.createOscillator();
      const flatlineGain = this.ctx.createGain();
      flatlineOsc.type = 'sine';
      flatlineOsc.frequency.setValueAtTime(880, ft); // Medical ECG flatline pitch
      flatlineGain.gain.setValueAtTime(0.08, ft);
      flatlineGain.gain.exponentialRampToValueAtTime(0.0001, ft + 1.8);
      flatlineOsc.connect(flatlineGain);
      flatlineGain.connect(this.ctx.destination);
      flatlineOsc.start(ft);
      flatlineOsc.stop(ft + 1.8);
    }, 400);
  }

  // Ryuk Creepy Chuckle / Shinigami whisper effect
  playRyukChuckle() {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const laughPitches = [95, 110, 85, 105, 80, 92, 75];

    laughPitches.forEach((pitch, i) => {
      const startTime = t + (i * 0.11);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, startTime);
      osc.frequency.exponentialRampToValueAtTime(pitch - 20, startTime + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // Ambient Dark Solipsism Theme Drone (Gothic Choir Chord & Low Drone)
  toggleAmbientMusic() {
    this.init();
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    if (this.isMuted) return;
    this.init();
    this.stopAmbient();

    const t = this.ctx.currentTime;
    // D Minor triad / modal dark drone: D2 (73.42Hz), A2 (110Hz), F3 (174.61Hz), D4 (293.66Hz)
    const chord = [73.42, 110.0, 174.61, 293.66];
    this.ambientNodes = [];

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    masterGain.gain.linearRampToValueAtTime(0.12, t + 3.0); // Gentle fade in
    masterGain.connect(this.ctx.destination);
    this.ambientNodes.push(masterGain);

    chord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass filter for warm dark choir-like pad
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);

      // LFO for slow breathing movement
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.2 + Math.random() * 0.15;
      lfoGain.gain.value = 90;
      lfo.connect(filter.frequency);
      lfo.start(t);
      this.ambientNodes.push(lfo);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start(t);
      this.ambientNodes.push(osc);
    });

    this.isAmbientPlaying = true;
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;
    const t = this.ctx ? this.ctx.currentTime : 0;
    this.ambientNodes.forEach(node => {
      try {
        if (node.stop) node.stop(t + 0.5);
        if (node.disconnect) setTimeout(() => node.disconnect(), 600);
      } catch {
        // ignore already stopped
      }
    });
    this.ambientNodes = [];
    this.isAmbientPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
