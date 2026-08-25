/**
 * Озвучка аккордов — живые сэмплы FluidR3 (jsDelivr)
 * acoustic / overdriven guitar / grand piano
 * Синтез только если сэмпл не загрузился.
 */

const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const INSTRUMENTS = ["acoustic", "distortion", "piano"];
const INSTRUMENT_KEY = "lad-instrument";

const SOUNDFONT_BASE =
  "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM";

const INSTRUMENT_FONT = {
  acoustic: "acoustic_guitar_nylon-mp3",
  distortion: "overdriven_guitar-mp3",
  piano: "acoustic_grand_piano-mp3",
};

const NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

let audioCtx = null;
let audioUnlocked = false;
let masterBus = null;
const bufferCache = new Map();
const inflight = new Map();

let currentInstrument =
  (typeof localStorage !== "undefined" && localStorage.getItem(INSTRUMENT_KEY)) || "acoustic";
if (!INSTRUMENTS.includes(currentInstrument)) currentInstrument = "acoustic";

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function midiToNoteName(midi) {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
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
  prefetchCommon(id);
  if (typeof window !== "undefined" && typeof window.refreshAllPathDiagrams === "function") {
    window.refreshAllPathDiagrams();
  }
  return currentInstrument;
}

function syncInstrumentUI(root = document) {
  root.querySelectorAll("[data-instrument]").forEach((btn) => {
    const on = btn.dataset.instrument === currentInstrument;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function getMasterBus(ctx) {
  if (!masterBus || masterBus.context !== ctx) {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.2;

    masterBus = ctx.createGain();
    masterBus.gain.value = 1;
    masterBus.connect(comp);
    comp.connect(ctx.destination);
    masterBus._comp = comp;
  }
  return masterBus;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  if (!audioUnlocked) {
    try {
      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(getMasterBus(ctx));
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

function sampleUrl(instrument, midi) {
  const font = INSTRUMENT_FONT[instrument] || INSTRUMENT_FONT.acoustic;
  return `${SOUNDFONT_BASE}/${font}/${midiToNoteName(midi)}.mp3`;
}

function loadSample(instrument, midi) {
  const key = `${instrument}:${midi}`;
  if (bufferCache.has(key)) return Promise.resolve(bufferCache.get(key));
  if (inflight.has(key)) return inflight.get(key);

  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve(null);

  const promise = fetch(sampleUrl(instrument, midi), { mode: "cors" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((arr) => ctx.decodeAudioData(arr.slice(0)))
    .then((buf) => {
      bufferCache.set(key, buf);
      return buf;
    })
    .catch((err) => {
      console.warn("sample load fail", instrument, midiToNoteName(midi), err);
      bufferCache.set(key, null);
      return null;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

function prefetchCommon(instrument = currentInstrument) {
  const midis = [40, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
  midis.forEach((m) => loadSample(instrument, m));
}

function playBuffer(ctx, buffer, when, gainPeak, dest, durationCap) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  const dur = Math.min(durationCap, buffer.duration);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gainPeak, when + 0.015);
  const fadeAt = when + Math.max(0.2, dur - 0.35);
  try {
    g.gain.setValueAtTime(gainPeak, fadeAt);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  } catch (_) {
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
  }
  src.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + dur + 0.03);
}

function synthFallback(ctx, freq, when, duration, gainPeak, dest, instrument) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.01);
  try {
    master.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  } catch (_) {
    master.gain.linearRampToValueAtTime(0.0001, when + duration);
  }

  const osc = ctx.createOscillator();
  osc.type = instrument === "distortion" ? "sawtooth" : instrument === "piano" ? "sine" : "triangle";
  osc.frequency.value = freq;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = instrument === "distortion" ? 2400 : 3500;
  osc.connect(filter);
  filter.connect(master);
  master.connect(dest);
  osc.start(when);
  osc.stop(when + duration);
}

function instrumentPlayStyle(id) {
  if (id === "distortion") return { strum: 0.03, gain: 0.48, duration: 2.0 };
  if (id === "piano") return { strum: 0.01, gain: 0.42, duration: 2.4 };
  return { strum: 0.048, gain: 0.55, duration: 2.2 };
}

function playVoicing(frets, opts = {}) {
  const ctx = unlockAudio();
  if (!ctx) return false;

  const notes = fretsToNotes(frets);
  if (!notes.length) return false;

  const instrument = opts.instrument || currentInstrument;
  const style = instrumentPlayStyle(instrument);
  const strum = opts.strumMs ?? style.strum;
  const baseGain = opts.gain ?? style.gain;
  const duration = opts.duration ?? style.duration;
  const dest = getMasterBus(ctx);

  const jobs = notes.map((n) => loadSample(instrument, n.midi));

  Promise.all(jobs).then((buffers) => {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const start = ctx.currentTime + 0.04;
    notes.forEach((n, i) => {
      const when = start + i * strum;
      const g = baseGain * (instrument === "piano" ? 1 : n.string <= 2 ? 1.08 : 0.88);
      const buf = buffers[i];
      if (buf) playBuffer(ctx, buf, when, g, dest, duration);
      else synthFallback(ctx, n.freq, when, duration * 0.8, g * 0.5, dest, instrument);
    });
  });

  return true;
}

function playChord(symbol) {
  if (typeof getVoicings !== "function") return false;
  const voicings = getVoicings(symbol);
  if (!voicings.length) return false;
  return playVoicing(voicings[0].frets);
}

function flashPlaying(el) {
  if (!el) return;
  el.classList.add("is-playing");
  setTimeout(() => el.classList.remove("is-playing"), 500);
}

function handlePlayEvent(e) {
  const playBtn = e.target.closest("[data-play-frets], [data-play-chord], [data-play-notes]");
  if (!playBtn) return false;
  e.preventDefault();
  e.stopPropagation();
  unlockAudio();
  flashPlaying(playBtn);
  try {
    if (playBtn.dataset.playNotes) {
      playMidiNotes(playBtn.dataset.playNotes.split(",").map((n) => parseInt(n, 10)));
    } else if (playBtn.dataset.playFrets) {
      playVoicing(parseFrets(playBtn.dataset.playFrets));
    } else if (playBtn.dataset.playChord) {
      playChord(playBtn.dataset.playChord);
    }
  } catch (err) {
    console.warn("Лад audio error:", err);
  }
  return true;
}

function playMidiNotes(midis) {
  const ctx = unlockAudio();
  if (!ctx || !midis?.length) return false;
  const instrument = currentInstrument;
  const style = instrumentPlayStyle(instrument);
  const dest = getMasterBus(ctx);
  const jobs = midis.map((m) => loadSample(instrument, m));
  Promise.all(jobs).then((buffers) => {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const start = ctx.currentTime + 0.03;
    midis.forEach((m, i) => {
      const when = start + i * (instrument === "piano" ? 0.012 : 0.03);
      const buf = buffers[i];
      const g = style.gain * 0.95;
      if (buf) playBuffer(ctx, buf, when, g, dest, style.duration);
      else synthFallback(ctx, midiToFreq(m), when, style.duration * 0.8, g * 0.5, dest, instrument);
    });
  });
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
    playVoicing([-1, 0, 2, 2, 1, 0]);
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
    if (handleInstrumentEvent(e) || handlePlayEvent(e)) lastTs = now;
  };

  root.addEventListener("pointerup", onPointer, true);
  root.addEventListener("click", onPointer, true);
  syncInstrumentUI(root);
}

function initAudioUI() {
  bindAudioEvents(document);
  // После первого жеста сэмплы подтянутся; заранее прогреем список URL в кэш браузера по возможности
  prefetchCommon(currentInstrument);
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
    midiToNoteName,
    setInstrument,
    getInstrument,
    unlockAudio,
    loadSample,
    INSTRUMENTS,
  };
}
