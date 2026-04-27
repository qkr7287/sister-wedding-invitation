// Procedural ambient pad as demo BGM — replace with real audio file later.
// Uses Web Audio API; toggled by the floating audio button.

export function initAudio() {
  const btn = document.getElementById('audio-toggle');
  let ctx = null;
  let master = null;
  let stopFn = null;
  let playing = false;

  const start = () => {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Soft chord pad
    const notes = [196.0, 246.94, 293.66, 392.0]; // G3 B3 D4 G4
    const oscs = [];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.07;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.04;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(o.frequency);
      o.connect(g).connect(master);
      o.start();
      lfo.start();
      oscs.push(o, lfo);
    });

    // Gentle high shimmer (filtered noise)
    const bufSize = 2 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 1.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.012;
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();

    // Fade in
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.6);

    stopFn = () => {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        try {
          oscs.forEach((o) => o.stop());
          noise.stop();
          ctx.close();
        } catch {
          /* noop */
        }
      }, 700);
    };
  };

  btn.addEventListener('click', () => {
    if (!playing) {
      start();
      playing = true;
      btn.setAttribute('aria-pressed', 'true');
    } else {
      stopFn?.();
      playing = false;
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}
