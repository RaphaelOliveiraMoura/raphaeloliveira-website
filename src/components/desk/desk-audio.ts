import type { DeskSound } from "./engine/desk-engine";

interface NoiseOptions {
  duration: number;
  filter: BiquadFilterType;
  freq: number;
  freqTo?: number;
  q?: number;
  gain: number;
  attack?: number;
  delay?: number;
}

interface ToneOptions {
  freq: number;
  freqTo?: number;
  duration: number;
  type?: OscillatorType;
  gain: number;
  delay?: number;
}

/**
 * Sons da mesa sintetizados com Web Audio (nenhum arquivo baixado).
 * Desligado por padrão; o AudioContext só nasce num gesto do usuário.
 */
export class DeskAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambient: AudioBufferSourceNode | null = null;
  private enabled = false;

  enable(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this.noise = this.createNoise(2);
    }
    void this.ctx.resume();
    this.enabled = true;
    this.startAmbient();
  }

  disable(): void {
    this.enabled = false;
    this.ambient?.stop();
    this.ambient = null;
    void this.ctx?.suspend();
  }

  dispose(): void {
    this.disable();
    void this.ctx?.close();
    this.ctx = null;
  }

  play(sound: DeskSound, volume = 1): void {
    if (!this.enabled || !this.ctx) return;
    const v = Math.max(0.05, Math.min(1, volume));
    switch (sound) {
      case "paper":
        this.noiseBurst({
          duration: 0.22,
          filter: "bandpass",
          freq: 2600,
          q: 0.7,
          gain: 0.35 * v,
        });
        break;
      case "flip":
        this.noiseBurst({
          duration: 0.45,
          filter: "bandpass",
          freq: 1100,
          freqTo: 3800,
          q: 0.9,
          gain: 0.4 * v,
          attack: 0.06,
        });
        break;
      case "open":
        this.noiseBurst({
          duration: 0.55,
          filter: "lowpass",
          freq: 700,
          gain: 0.35 * v,
          attack: 0.08,
        });
        this.noiseBurst({
          duration: 0.3,
          filter: "bandpass",
          freq: 2400,
          q: 0.8,
          gain: 0.25 * v,
          delay: 0.25,
        });
        break;
      case "drawer":
        this.noiseBurst({
          duration: 0.55,
          filter: "lowpass",
          freq: 420,
          freqTo: 900,
          gain: 0.55 * v,
          attack: 0.05,
        });
        this.tone({ freq: 190, duration: 0.07, gain: 0.25 * v, delay: 0.52 });
        break;
      case "ceramic":
        [1820, 2710, 4130].forEach((f, i) =>
          this.tone({
            freq: f,
            duration: 0.5 - i * 0.1,
            gain: (0.12 / (i + 1)) * v,
          }),
        );
        break;
      case "wood":
        [0, 0.045, 0.1].forEach((delay, i) =>
          this.tone({
            freq: 640 + i * 180 + Math.random() * 80,
            duration: 0.09,
            type: "triangle",
            gain: 0.18 * v,
            delay,
          }),
        );
        break;
      case "kick":
        this.tone({ freq: 150, freqTo: 48, duration: 0.2, gain: 0.6 * v });
        this.noiseBurst({
          duration: 0.08,
          filter: "lowpass",
          freq: 1200,
          gain: 0.3 * v,
        });
        break;
      case "thud":
        this.tone({ freq: 95, freqTo: 42, duration: 0.16, gain: 0.45 * v });
        break;
      case "click":
        this.tone({
          freq: 2100,
          duration: 0.025,
          type: "square",
          gain: 0.06 * v,
        });
        break;
      case "key":
        this.noiseBurst({
          duration: 0.035,
          filter: "bandpass",
          freq: 4200,
          q: 1.2,
          gain: 0.25 * v,
        });
        break;
      case "goal":
        this.noiseBurst({
          duration: 1.8,
          filter: "bandpass",
          freq: 900,
          q: 0.5,
          gain: 0.5 * v,
          attack: 0.35,
        });
        this.tone({ freq: 2900, duration: 0.22, gain: 0.12 * v, delay: 0.05 });
        this.tone({ freq: 2900, duration: 0.5, gain: 0.12 * v, delay: 0.35 });
        break;
    }
  }

  private createNoise(seconds: number): AudioBuffer {
    const ctx = this.ctx as AudioContext;
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * seconds,
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private startAmbient(): void {
    if (!this.ctx || !this.master || this.ambient) return;
    // "Tom de sala": ruído marrom bem baixo, só para a mesa não ficar muda.
    const ctx = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    this.ambient = source;
  }

  private noiseBurst(o: NoiseOptions): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter;
    filter.frequency.setValueAtTime(o.freq, t0);
    if (o.freqTo)
      filter.frequency.exponentialRampToValueAtTime(o.freqTo, t0 + o.duration);
    filter.Q.value = o.q ?? 0.7;
    const gain = ctx.createGain();
    const attack = o.attack ?? 0.008;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.gain, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t0, Math.random() * 1.5, o.duration + 0.05);
  }

  private tone(o: ToneOptions): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.freqTo)
      osc.frequency.exponentialRampToValueAtTime(o.freqTo, t0 + o.duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.gain, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);
    osc.connect(gain).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + o.duration + 0.05);
  }
}
