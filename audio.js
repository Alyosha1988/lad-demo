/**
 * Озвучка аккордов — Web Audio.
 * Инструменты: acoustic | distortion | piano
 * Ноты из аппликатуры (строй E A D G B e).
 */

const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const INSTRUMENTS = ["acoustic", "distortion", "piano"];
const INSTRUMENT_KEY = "lad-instrument";

let audioCtx = null;
let sharedDistortion = null;
let currentInstrument =
  (typeof localStorage !== "undefined" && localStorage.getItem(INSTRUMENT_KEY)) || "acoustic";

if (!INSTRUMENTS.includes(currentInstrument)) currentInstrument = "acoustic";

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getInstrument() {
  return currentInstrument;
}

function setInstrument(id) {
  if (!INSTRUMENTS.includes(id)) return currentInstrument;
  currentInstrument = id;
  try {
    localStorage.setItem(INSTRUMENT_KEY, id);
  } catch (_) {}
  syncInstrumentUI();
  return currentInstrument;
}

function syncInstrumentUI(root = document) {
  root.querySelectorAll("[data-instrument]").forEach((btn) => {
    const on = btn.dataset.instrument === currentInstrument;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

async function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
  return audioCtx;
}

function parseFrets(raw) {
  return String(raw)
    .split(",")
    .map((n) => parseInt(n.trim(), 10));
}

function fretsToNotes(frets) {
  const notes = [];
  for (let s = 0; s < 6; s++) {
    const f = frets[s];
    if (f === undefined || f < 0) continue;
    notes.push({
      string: s,
      midi: OPEN_MIDI[s] + f,
      freq: midiToFreq(OPEN_MIDI[s] + f),
    });
  }
  notes.sort((a, b) => a.string - b.string);
  return notes;
}

function makeDistortionCurve(amount = 480) {
  const n = 44100;
  const curve = new Float32Array(n);
  const k = Number(amount);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function getDistortionNode(ctx) {
  if (!sharedDistortion || sharedDistortion.context !== ctx) {
    sharedDistortion = ctx.createWaveShaper();
    sharedDistortion.curve = makeDistortionCurve(520);
    sharedDistortion.oversample = "4x";
  }
  return sharedDistortion;
}

/** Акустическая гитара — мягкий щипок со струнами */
function voiceAcoustic(ctx, freq, when, duration, gainPeak, dest) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.01);
  master.gain.exponentialRampToValueAtTime(0.0008, when + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(4800, freq * 7), when);
  filter.frequency.exponentialRampToValueAtTime(Math.max(700, freq * 2), when + duration * 0.7);
  filter.Q.value = 0.85;

  const partials = [
    { ratio: 1, gain: 1, type: "sine" },
    { ratio: 2, gain: 0.38, type: "sine" },
    { ratio: 3, gain: 0.14, type: "triangle" },
    { ratio: 4, gain: 0.06, type: "sine" },
    { ratio: 0.5, gain: 0.07, type: "triangle" },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = freq * p.ratio;
    g.gain.value = p.gain;
    osc.connect(g);
    g.connect(filter);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  // короткий noise-transient атаки
  const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(gainPeak * 0.25, when);
  nGain.gain.exponentialRampToValueAtTime(0.001, when + 0.03);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = "bandpass";
  nFilter.frequency.value = Math.min(2500, freq * 3);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(master);
  noise.start(when);
  noise.stop(when + 0.04);

  filter.connect(master);
  master.connect(dest);
}

/** Электро с дисторшн — пила + waveshaper, быстрый strum */
function voiceDistortion(ctx, freq, when, duration, gainPeak, dest) {
  const pre = ctx.createGain();
  pre.gain.value = 0.35;

  const drive = ctx.createGain();
  drive.gain.value = 3.2;

  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(720);
  shaper.oversample = "4x";

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(3200, when);
  tone.frequency.exponentialRampToValueAtTime(1800, when + duration * 0.5);
  tone.Q.value = 1.1;

  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 90;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, when);
  master.gain.linearRampToValueAtTime(gainPeak * 0.55, when + 0.006);
  master.gain.exponentialRampToValueAtTime(0.0008, when + duration);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  const osc2 = ctx.createOscillator();
  osc2.type = "square";
  osc2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.18;

  osc.connect(pre);
  osc2.connect(g2);
  g2.connect(pre);
  pre.connect(drive);
  drive.connect(shaper);
  shaper.connect(high);
  high.connect(tone);
  tone.connect(master);
  master.connect(dest);

  osc.start(when);
  osc2.start(when);
  osc.stop(when + duration + 0.05);
  osc2.stop(when + duration + 0.05);
}

/** Фортепиано — почти одновременный удар, молоточковая атака */
function voicePiano(ctx, freq, when, duration, gainPeak, dest) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.004);
  master.gain.exponentialRampToValueAtTime(gainPeak * 0.35, when + 0.18);
  master.gain.exponentialRampToValueAtTime(0.0008, when + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(6000, freq * 10), when);
  filter.frequency.exponentialRampToValueAtTime(Math.max(900, freq * 3), when + duration * 0.4);

  // inharmonic-ish partials for piano-ish color
  const partials = [
    { ratio: 1, gain: 1 },
    { ratio: 2, gain: 0.55 },
    { ratio: 3.01, gain: 0.22 },
    { ratio: 4.02, gain: 0.1 },
    { ratio: 5.04, gain: 0.05 },
    { ratio: 0.5, gain: 0.04 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * p.ratio;
    g.gain.value = p.gain;
    // чуть быстрее гасим верх
    const decay = duration * (p.ratio > 2 ? 0.55 : 1);
    g.gain.setValueAtTime(p.gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + decay);
    osc.connect(g);
    g.connect(filter);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  // hammer noise
  const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(gainPeak * 0.35, when);
  nGain.gain.exponentialRampToValueAtTime(0.001, when + 0.02);
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = "highpass";
  nFilter.frequency.value = 1200;
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(master);
  noise.start(when);
  noise.stop(when + 0.025);

  filter.connect(master);
  master.connect(dest);
}

function instrumentParams(id) {
  if (id === "distortion") {
    return { strum: 0.018, gain: 0.2, duration: 1.05, voice: voiceDistortion };
  }
  if (id === "piano") {
    return { strum: 0.006, gain: 0.17, duration: 1.55, voice: voicePiano };
  }
  return { strum: 0.038, gain: 0.2, duration: 1.4, voice: voiceAcoustic };
}

async function playVoicing(frets, opts = {}) {
  const ctx = await ensureAudio();
  if (!ctx) return false;

  const notes = fretsToNotes(frets);
  if (!notes.length) return false;

  const instrument = opts.instrument || currentInstrument;
  const params = instrumentParams(instrument);
  const now = ctx.currentTime + 0.02;
  const strum = opts.strumMs ?? params.strum;
  const baseGain = opts.gain ?? params.gain;
  const duration = opts.duration ?? params.duration;
  const dest = ctx.destination;

  notes.forEach((n, i) => {
    const t = now + i * strum;
    const g =
      instrument === "piano"
        ? baseGain * (0.95 + (i % 3) * 0.02)
        : baseGain * (n.string <= 2 ? 1.05 : 0.9);
    params.voice(ctx, n.freq, t, duration, g, dest);
  });
  return true;
}

async function playChord(symbol) {
  if (typeof getVoicings !== "function") return false;
  const voicings = getVoicings(symbol);
  if (!voicings.length) return false;
  return playVoicing(voicings[0].frets);
}

async function playProgression(path, gapMs = 900) {
  const ctx = await ensureAudio();
  if (!ctx || !path?.length) return false;
  for (let i = 0; i < path.length; i++) {
    await playChord(path[i]);
    if (i < path.length - 1) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
  return true;
}

function bindInstrumentPicker(root = document) {
  root.querySelectorAll("[data-instrument]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.instrument;
      setInstrument(id);
      await ensureAudio();
      // короткий превью-аккорд Am
      if (typeof getVoicings === "function") {
        const v = getVoicings("Am")[0];
        if (v) playVoicing(v.frets);
      }
    });
  });
  syncInstrumentUI(root);
}

function bindChordAudio(root = document) {
  if (root.__ladAudioBound) return;
  root.__ladAudioBound = true;

  root.addEventListener(
    "click",
    async (e) => {
      const playBtn = e.target.closest("[data-play-frets], [data-play-chord]");
      if (!playBtn) return;

      e.preventDefault();
      e.stopPropagation();

      playBtn.classList.add("is-playing");
      try {
        await ensureAudio();
        if (playBtn.dataset.playFrets) {
          await playVoicing(parseFrets(playBtn.dataset.playFrets));
        } else if (playBtn.dataset.playChord) {
          await playChord(playBtn.dataset.playChord);
        }
      } finally {
        setTimeout(() => playBtn.classList.remove("is-playing"), 420);
      }
    },
    true
  );
}

function initAudioUI() {
  bindChordAudio(document.getElementById("stage") || document);
  bindInstrumentPicker(document);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAudioUI);
  } else {
    initAudioUI();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    playVoicing,
    playChord,
    fretsToNotes,
    parseFrets,
    midiToFreq,
    setInstrument,
    getInstrument,
    INSTRUMENTS,
  };
}
