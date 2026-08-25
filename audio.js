/**
 * Озвучка аккордов — Web Audio.
 * Инструменты: acoustic | distortion | piano
 *
 * Важно для iOS/Safari: не ждать await до старта звука —
 * иначе жест пользователя теряется и звук молчит.
 */

const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const INSTRUMENTS = ["acoustic", "distortion", "piano"];
const INSTRUMENT_KEY = "lad-instrument";

let audioCtx = null;
let audioUnlocked = false;
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

/** Синхронно создать контекст (без await). */
function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/**
 * Разблокировка для мобильных браузеров.
 * Должна вызываться прямо в обработчике click/touch, без await до звука.
 */
function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  if (!audioUnlocked) {
    try {
      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      audioUnlocked = true;
    } catch (_) {}
  }

  return ctx;
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
    if (f === undefined || Number.isNaN(f) || f < 0) continue;
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
  const n = 2048;
  const curve = new Float32Array(n);
  const k = Number(amount);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function safeExpRamp(param, value, time) {
  const v = Math.max(value, 0.0001);
  try {
    param.exponentialRampToValueAtTime(v, time);
  } catch (_) {
    param.linearRampToValueAtTime(v, time);
  }
}

function voiceAcoustic(ctx, freq, when, duration, gainPeak, dest) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.012);
  safeExpRamp(master.gain, 0.0001, when + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(5200, freq * 8), when);
  safeExpRamp(filter.frequency, Math.max(800, freq * 2.2), when + duration * 0.7);
  filter.Q.value = 0.8;

  const partials = [
    { ratio: 1, gain: 1, type: "sine" },
    { ratio: 2, gain: 0.42, type: "sine" },
    { ratio: 3, gain: 0.16, type: "triangle" },
    { ratio: 4, gain: 0.07, type: "sine" },
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

  filter.connect(master);
  master.connect(dest);
}

function voiceDistortion(ctx, freq, when, duration, gainPeak, dest) {
  const pre = ctx.createGain();
  pre.gain.value = 0.4;

  const drive = ctx.createGain();
  drive.gain.value = 2.8;

  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(650);
  shaper.oversample = "2x";

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(2800, when);
  safeExpRamp(tone.frequency, 1600, when + duration * 0.5);
  tone.Q.value = 0.9;

  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 80;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, when);
  master.gain.linearRampToValueAtTime(gainPeak * 0.7, when + 0.008);
  safeExpRamp(master.gain, 0.0001, when + duration);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  const osc2 = ctx.createOscillator();
  osc2.type = "square";
  osc2.frequency.value = freq * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.15;

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

function voicePiano(ctx, freq, when, duration, gainPeak, dest) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.005);
  safeExpRamp(master.gain, gainPeak * 0.4, when + 0.2);
  safeExpRamp(master.gain, 0.0001, when + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(6500, freq * 11), when);
  safeExpRamp(filter.frequency, Math.max(1000, freq * 3), when + duration * 0.45);

  const partials = [
    { ratio: 1, gain: 1 },
    { ratio: 2, gain: 0.5 },
    { ratio: 3, gain: 0.2 },
    { ratio: 4, gain: 0.09 },
    { ratio: 5, gain: 0.04 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * p.ratio;
    const decay = duration * (p.ratio > 2 ? 0.5 : 1);
    g.gain.setValueAtTime(Math.max(p.gain, 0.0001), when);
    safeExpRamp(g.gain, 0.0001, when + decay);
    osc.connect(g);
    g.connect(filter);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  filter.connect(master);
  master.connect(dest);
}

function instrumentParams(id) {
  if (id === "distortion") {
    return { strum: 0.02, gain: 0.28, duration: 1.1, voice: voiceDistortion };
  }
  if (id === "piano") {
    return { strum: 0.008, gain: 0.26, duration: 1.6, voice: voicePiano };
  }
  return { strum: 0.04, gain: 0.32, duration: 1.45, voice: voiceAcoustic };
}

/** Главный play — синхронный, без await. */
function playVoicing(frets, opts = {}) {
  const ctx = unlockAudio();
  if (!ctx) return false;

  const notes = fretsToNotes(frets);
  if (!notes.length) return false;

  const instrument = opts.instrument || currentInstrument;
  const params = instrumentParams(instrument);
  // небольшой запас, если resume ещё догоняет
  const now = ctx.currentTime + 0.03;
  const strum = opts.strumMs ?? params.strum;
  const baseGain = opts.gain ?? params.gain;
  const duration = opts.duration ?? params.duration;

  notes.forEach((n, i) => {
    const t = now + i * strum;
    const g =
      instrument === "piano"
        ? baseGain * (0.95 + (i % 3) * 0.02)
        : baseGain * (n.string <= 2 ? 1.08 : 0.92);
    params.voice(ctx, n.freq, t, duration, g, ctx.destination);
  });

  // повторный resume на случай iOS
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  return true;
}

function playChord(symbol) {
  if (typeof getVoicings !== "function") return false;
  const voicings = getVoicings(symbol);
  if (!voicings.length) return false;
  return playVoicing(voicings[0].frets);
}

function playProgression(path, gapMs = 900) {
  if (!path?.length) return false;
  unlockAudio();
  path.forEach((chord, i) => {
    setTimeout(() => playChord(chord), i * gapMs);
  });
  return true;
}

function flashPlaying(el) {
  if (!el) return;
  el.classList.add("is-playing");
  setTimeout(() => el.classList.remove("is-playing"), 450);
}

function handlePlayEvent(e) {
  const playBtn = e.target.closest("[data-play-frets], [data-play-chord]");
  if (!playBtn) return false;

  e.preventDefault();
  e.stopPropagation();

  // Сначала unlock+play синхронно
  unlockAudio();
  flashPlaying(playBtn);

  let ok = false;
  try {
    if (playBtn.dataset.playFrets) {
      ok = playVoicing(parseFrets(playBtn.dataset.playFrets));
    } else if (playBtn.dataset.playChord) {
      ok = playChord(playBtn.dataset.playChord);
    }
  } catch (err) {
    console.warn("Лад audio error:", err);
  }

  if (!ok) {
    playBtn.classList.add("is-muted");
    setTimeout(() => playBtn.classList.remove("is-muted"), 800);
  }
  return true;
}

function handleInstrumentEvent(e) {
  const btn = e.target.closest("[data-instrument]");
  if (!btn) return false;

  e.preventDefault();
  e.stopPropagation();

  setInstrument(btn.dataset.instrument);
  unlockAudio();
  flashPlaying(btn);

  try {
    if (typeof getVoicings === "function") {
      const v = getVoicings("Am")[0];
      if (v) playVoicing(v.frets);
    } else {
      // fallback: одиночная нота A3
      playVoicing([-1, 0, 2, 2, 1, 0]);
    }
  } catch (err) {
    console.warn("Лад instrument preview error:", err);
  }
  return true;
}

function bindAudioEvents(root = document) {
  if (root.__ladAudioBound) return;
  root.__ladAudioBound = true;

  let lastTs = 0;
  const onPointer = (e) => {
    const now = Date.now();
    if (now - lastTs < 350) return;
    if (handleInstrumentEvent(e) || handlePlayEvent(e)) {
      lastTs = now;
    }
  };

  root.addEventListener("pointerup", onPointer, true);
  root.addEventListener("click", onPointer, true);

  syncInstrumentUI(root);
}

function initAudioUI() {
  bindAudioEvents(document);
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
    unlockAudio,
    INSTRUMENTS,
  };
}
