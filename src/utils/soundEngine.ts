/**
 * Pure Web Audio API meditative soundscape engine for PetalBreath.
 * - Singing Bowl: warm harmonic partials for slow contraction / exhale
 * - Water Drop: crisp organic pitch-swept droplet for relaxation / inhale
 * - Soft Rain Ambience: gentle low-pass filtered noise
 */

class PetalSoundEngine {
  private ctx: AudioContext | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainPlaying = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Gentle Tibetan singing bowl tone (for contraction / lifting phase)
   */
  public playSingingBowl(durationSec = 2.6, volume = 0.16): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(volume, now + 0.14);
    master.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    master.connect(ctx.destination);

    // Warm harmonic partials with gentle meditative shimmer
    const partials = [
      { freq: 256, gain: 1.0 },
      { freq: 258.2, gain: 0.45 }, // subtle acoustic beating
      { freq: 512, gain: 0.22 },
      { freq: 769.5, gain: 0.08 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);
      oscGain.gain.setValueAtTime(p.gain, now);
      osc.connect(oscGain);
      oscGain.connect(master);
      osc.start(now);
      osc.stop(now + durationSec + 0.05);
    });
  }

  /**
   * Crisp gentle water drop (for relaxation / opening phase)
   */
  public playWaterDrop(volume = 0.18): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.075);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);

    // Tiny soft ripple echo
    const echoOsc = ctx.createOscillator();
    const echoGain = ctx.createGain();
    echoOsc.type = 'sine';
    echoOsc.frequency.setValueAtTime(860, now + 0.11);
    echoOsc.frequency.exponentialRampToValueAtTime(1320, now + 0.17);
    echoGain.gain.setValueAtTime(0.0001, now + 0.11);
    echoGain.gain.exponentialRampToValueAtTime(volume * 0.28, now + 0.125);
    echoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    echoOsc.connect(echoGain);
    echoGain.connect(ctx.destination);
    echoOsc.start(now + 0.11);
    echoOsc.stop(now + 0.32);
  }

  /**
   * Soft wooden chime for quick pulse cues
   */
  public playSoftPulse(high: boolean, volume = 0.12): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(high ? 440 : 330, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * Warm gentle completion arpeggio
   */
  public playBloomChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [392, 493.88, 587.33, 783.99]; // G4 B4 D5 G5 warm major
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  /**
   * Toggle gentle pink-filtered rain ambience
   */
  public setRainAmbience(enabled: boolean): void {
    if (enabled === this.isRainPlaying) return;
    if (!enabled) {
      this.stopRain();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink-ish warm rain noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.8);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    this.rainSource = source;
    this.rainGain = gain;
    this.isRainPlaying = true;
  }

  public stopRain(): void {
    if (!this.isRainPlaying || !this.ctx) return;
    try {
      if (this.rainGain) {
        this.rainGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
      }
      const src = this.rainSource;
      setTimeout(() => {
        try {
          src?.stop();
          src?.disconnect();
        } catch {
          // ignore
        }
      }, 380);
    } catch {
      // ignore
    }
    this.rainSource = null;
    this.rainGain = null;
    this.isRainPlaying = false;
  }
}

export const soundEngine = new PetalSoundEngine();
