/**
 * Озвучка аккордов — Web Audio, ноты из аппликатуры, лёгкий strum.
 * Стандартный строй: E A D G B e (6 → 1).
 */

const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
let audioCtx = null;

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
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

/** Разбор data-play-frets="−1,0,2,2,1,0" */
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
  // бас → верх: толстые струны первыми при strum
  notes.sort((a, b) => a.string - b.string);
  return notes;
}

function pluckString(ctx, freq, when, duration = 1.35, gainPeak = 0.22) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, when);
  master.gain.linearRampToValueAtTime(gainPeak, when + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0008, when + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(4200, freq * 6), when);
  filter.frequency.exponentialRampToValueAtTime(Math.max(800, freq * 2.2), when + duration * 0.65);
  filter.Q.value = 0.7;

  // Несколько частичных — ближе к струне, чем чистый sine
  const partials = [
    { ratio: 1, gain: 1 },
    { ratio: 2, gain: 0.35 },
    { ratio: 3, gain: 0.12 },
    { ratio: 0.5, gain: 0.08 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.ratio < 1 ? "triangle" : "sine";
    osc.frequency.value = freq * p.ratio;
    g.gain.value = p.gain;
    osc.connect(g);
    g.connect(filter);
    osc.start(when);
    osc.stop(when + duration + 0.08);
  }

  filter.connect(master);
  master.connect(ctx.destination);
}

async function playVoicing(frets, opts = {}) {
  const ctx = await ensureAudio();
  if (!ctx) return false;

  const notes = fretsToNotes(frets);
  if (!notes.length) return false;

  const now = ctx.currentTime + 0.02;
  const strumMs = opts.strumMs ?? 0.038;
  const baseGain = opts.gain ?? 0.2;

  notes.forEach((n, i) => {
    const t = now + i * strumMs;
    // бас чуть громче
    const g = baseGain * (n.string <= 2 ? 1.05 : 0.92);
    pluckString(ctx, n.freq, t, 1.4, g);
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

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bindChordAudio(document.getElementById("stage") || document));
  } else {
    bindChordAudio(document.getElementById("stage") || document);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { playVoicing, playChord, fretsToNotes, parseFrets, midiToFreq };
}
