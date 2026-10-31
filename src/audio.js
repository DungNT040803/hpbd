// Web Audio API Synthesizer & Sound FX System
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.customAudio = null;
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.customAudio) {
      this.customAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  playChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, t + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.65);
    });
  }

  playWhoosh() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.25);
    filter.frequency.linearRampToValueAtTime(200, t + 0.6);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  playBlowCandle() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Breath / wind white noise buffer
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.7);

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  playFirework() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    // Sparkles
    setTimeout(() => this.playChime(), 100);
  }

  // Dreamy celestial music box progression for Happy Birthday
  startBackgroundMusic() {
    if (this.isPlayingBgm) return;
    this.ensureContext();
    this.isPlayingBgm = true;

    // Melody: Happy Birthday in F major / C major
    // Notes frequencies
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
    const melody = [
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: D4, d: 1 }, { note: C4, d: 1 }, { note: F4, d: 1 }, { note: E4, d: 2 },
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: D4, d: 1 }, { note: C4, d: 1 }, { note: G4, d: 1 }, { note: F4, d: 2 },
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: C5, d: 1 }, { note: A4, d: 1 }, { note: F4, d: 1 }, { note: E4, d: 1 }, { note: D4, d: 1 },
      { note: B4, d: 0.75 }, { note: B4, d: 0.25 }, { note: A4, d: 1 }, { note: F4, d: 1 }, { note: G4, d: 1 }, { note: F4, d: 2.5 }
    ];

    let noteIdx = 0;
    const tempo = 520; // ms per beat

    const playNext = () => {
      if (!this.isPlayingBgm) return;
      const item = melody[noteIdx];
      
      if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Music box / celesta tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.note * 2, t); // Octave higher for celestial bell tone

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(item.note, t);

        const duration = (item.d * tempo) / 1000;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.045, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(duration * 1.2, 0.4));

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        sub.start(t);
        osc.stop(t + duration * 1.3);
        sub.stop(t + duration * 1.3);
      }

      noteIdx = (noteIdx + 1) % melody.length;
      const delay = (item.d * tempo) + (noteIdx === 0 ? 1500 : 0);
      this.bgmTimer = setTimeout(playNext, delay);
    };

    playNext();
  }

  stopBackgroundMusic() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
  }
}

export const sound = new SoundSystem();
