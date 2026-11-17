// Procedural Web Audio API Sound Synthesizer for GestureCAD
class SoundFXEngine {
  private ctx: AudioContext | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subtle futuristic UI click sound
  public playClick(pitch: number = 800) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  // Futuristic gesture recognition chime
  public playGestureDetect(type: string) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs: Record<string, number> = {
        open_palm: 520,
        pinch: 680,
        pointing: 880,
        fist: 440,
        peace: 990,
        rock: 740,
        shaka: 620,
        thumbs_up: 840,
      };

      const freq = freqs[type] || 600;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  // Success chime on safety validation
  public playValidationSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.05, this.ctx!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.22);
      });
    } catch {}
  }

  // Continuous brushless motor turbine spool
  public setMotorSpinning(spinning: boolean, rpmMultiplier: number = 1.0) {
    if (!this.enabled && spinning) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      if (spinning) {
        if (!this.motorOsc) {
          this.motorOsc = this.ctx.createOscillator();
          this.motorGain = this.ctx.createGain();
          this.motorFilter = this.ctx.createBiquadFilter();

          this.motorOsc.type = 'sawtooth';
          this.motorOsc.frequency.setValueAtTime(90, this.ctx.currentTime);
          this.motorOsc.frequency.exponentialRampToValueAtTime(260 * rpmMultiplier, this.ctx.currentTime + 1.2);

          this.motorFilter.type = 'lowpass';
          this.motorFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

          this.motorGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          this.motorGain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 0.8);

          this.motorOsc.connect(this.motorFilter);
          this.motorFilter.connect(this.motorGain);
          this.motorGain.connect(this.ctx.destination);

          this.motorOsc.start();
        } else if (this.motorOsc && this.motorGain) {
          this.motorOsc.frequency.linearRampToValueAtTime(260 * rpmMultiplier, this.ctx.currentTime + 0.3);
          this.motorGain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 0.3);
        }
      } else {
        if (this.motorOsc && this.motorGain) {
          this.motorOsc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.6);
          this.motorGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
          setTimeout(() => {
            if (this.motorOsc) {
              try {
                this.motorOsc.stop();
                this.motorOsc.disconnect();
              } catch {}
              this.motorOsc = null;
              this.motorGain = null;
              this.motorFilter = null;
            }
          }, 650);
        }
      }
    } catch {}
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled && this.motorOsc) {
      this.setMotorSpinning(false);
    }
    return this.enabled;
  }
}

export const soundFX = new SoundFXEngine();
