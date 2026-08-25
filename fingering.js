/**
 * Аппликатуры: гитара (удобная последовательность форм)
 * и рояль (клавиатура + голосоведение).
 */

const FRET_MUTE = -1;
const FRET_OPEN = 0;

const OPEN_VOICINGS = {
  C: [{ name: "open", frets: [-1, 3, 2, 0, 1, 0], form: "C" }],
  Cm: [{ name: "barre 3", frets: [-1, 3, 5, 5, 4, 3], baseFret: 3, form: "Am" }],
  "C#": [{ name: "barre 4", frets: [-1, 4, 6, 6, 6, 4], baseFret: 4, form: "A" }],
  "C#m": [{ name: "barre 4", frets: [-1, 4, 6, 6, 5, 4], baseFret: 4, form: "Am" }],
  Db: [{ name: "barre 4", frets: [-1, 4, 6, 6, 6, 4], baseFret: 4, form: "A" }],
  Dbm: [{ name: "barre 4", frets: [-1, 4, 6, 6, 5, 4], baseFret: 4, form: "Am" }],
  D: [{ name: "open", frets: [-1, -1, 0, 2, 3, 2], form: "D" }],
  Dm: [{ name: "open", frets: [-1, -1, 0, 2, 3, 1], form: "D" }],
  Eb: [{ name: "barre 6", frets: [-1, 6, 8, 8, 8, 6], baseFret: 6, form: "A" }],
  Ebm: [{ name: "barre 6", frets: [-1, 6, 8, 8, 7, 6], baseFret: 6, form: "Am" }],
  E: [{ name: "open", frets: [0, 2, 2, 1, 0, 0], form: "E" }],
  Em: [{ name: "open", frets: [0, 2, 2, 0, 0, 0], form: "E" }],
  F: [
    { name: "barre 1", frets: [1, 3, 3, 2, 1, 1], baseFret: 1, form: "E" },
    { name: "mini", frets: [-1, -1, 3, 2, 1, 1], baseFret: 1, form: "D" },
  ],
  Fm: [{ name: "barre 1", frets: [1, 3, 3, 1, 1, 1], baseFret: 1, form: "E" }],
  "F#": [{ name: "barre 2", frets: [2, 4, 4, 3, 2, 2], baseFret: 2, form: "E" }],
  "F#m": [{ name: "barre 2", frets: [2, 4, 4, 2, 2, 2], baseFret: 2, form: "E" }],
  G: [
    { name: "open", frets: [3, 2, 0, 0, 0, 3], form: "G" },
    { name: "E-form 3", frets: [3, 5, 5, 4, 3, 3], baseFret: 3, form: "E" },
  ],
  Gm: [{ name: "barre 3", frets: [3, 5, 5, 3, 3, 3], baseFret: 3, form: "E" }],
  Ab: [{ name: "barre 4", frets: [4, 6, 6, 5, 4, 4], baseFret: 4, form: "E" }],
  Abm: [{ name: "barre 4", frets: [4, 6, 6, 4, 4, 4], baseFret: 4, form: "E" }],
  A: [{ name: "open", frets: [-1, 0, 2, 2, 2, 0], form: "A" }],
  Am: [{ name: "open", frets: [-1, 0, 2, 2, 1, 0], form: "A" }],
  Bb: [{ name: "barre 1", frets: [-1, 1, 3, 3, 3, 1], baseFret: 1, form: "A" }],
  Bbm: [{ name: "barre 1", frets: [-1, 1, 3, 3, 2, 1], baseFret: 1, form: "A" }],
  B: [{ name: "barre 2", frets: [-1, 2, 4, 4, 4, 2], baseFret: 2, form: "A" }],
  Bm: [{ name: "barre 2", frets: [-1, 2, 4, 4, 3, 2], baseFret: 2, form: "A" }],

  C7: [{ name: "open", frets: [-1, 3, 2, 3, 1, 0], form: "C" }],
  Cmaj7: [{ name: "open", frets: [-1, 3, 2, 0, 0, 0], form: "C" }],
  Cm7: [{ name: "barre 3", frets: [-1, 3, 5, 3, 4, 3], baseFret: 3, form: "Am" }],
  D7: [{ name: "open", frets: [-1, -1, 0, 2, 1, 2], form: "D" }],
  Dmaj7: [{ name: "open", frets: [-1, -1, 0, 2, 2, 2], form: "D" }],
  Dm7: [{ name: "open", frets: [-1, -1, 0, 2, 1, 1], form: "D" }],
  E7: [{ name: "open", frets: [0, 2, 0, 1, 0, 0], form: "E" }],
  Emaj7: [{ name: "open", frets: [0, 2, 1, 1, 0, 0], form: "E" }],
  Em7: [{ name: "open", frets: [0, 2, 0, 0, 0, 0], form: "E" }],
  Fmaj7: [{ name: "open-ish", frets: [-1, -1, 3, 2, 1, 0], baseFret: 1, form: "D" }],
  F7: [{ name: "barre 1", frets: [1, 3, 1, 2, 1, 1], baseFret: 1, form: "E" }],
  G7: [{ name: "open", frets: [3, 2, 0, 0, 0, 1], form: "G" }],
  Gmaj7: [{ name: "open", frets: [3, 2, 0, 0, 0, 2], form: "G" }],
  Gm7: [{ name: "barre 3", frets: [3, 5, 3, 3, 3, 3], baseFret: 3, form: "E" }],
  A7: [{ name: "open", frets: [-1, 0, 2, 0, 2, 0], form: "A" }],
  Amaj7: [{ name: "open", frets: [-1, 0, 2, 1, 2, 0], form: "A" }],
  Am7: [{ name: "open", frets: [-1, 0, 2, 0, 1, 0], form: "A" }],
  B7: [{ name: "open", frets: [-1, 2, 1, 2, 0, 2], form: "open" }],
  Bm7: [{ name: "barre 2", frets: [-1, 2, 4, 2, 3, 2], baseFret: 2, form: "A" }],
  Bmaj7: [{ name: "barre 2", frets: [-1, 2, 4, 3, 4, 2], baseFret: 2, form: "A" }],

  Asus2: [{ name: "open", frets: [-1, 0, 2, 2, 0, 0], form: "A" }],
  Asus4: [{ name: "open", frets: [-1, 0, 2, 2, 3, 0], form: "A" }],
  Dsus2: [{ name: "open", frets: [-1, -1, 0, 2, 3, 0], form: "D" }],
  Dsus4: [{ name: "open", frets: [-1, -1, 0, 2, 3, 3], form: "D" }],
  Esus4: [{ name: "open", frets: [0, 2, 2, 2, 0, 0], form: "E" }],
  A7sus4: [{ name: "open", frets: [-1, 0, 2, 0, 3, 0], form: "A" }],
  D7sus4: [{ name: "open", frets: [-1, -1, 0, 2, 1, 3], form: "D" }],
  Cadd9: [{ name: "open", frets: [-1, 3, 2, 0, 3, 0], form: "C" }],
  Gadd9: [{ name: "open", frets: [3, 2, 0, 0, 0, 5], form: "G" }],
  Emadd9: [{ name: "open", frets: [0, 2, 2, 0, 0, 2], form: "E" }],
  Am9: [{ name: "open", frets: [-1, 0, 2, 0, 0, 0], form: "A" }],
  C6: [{ name: "open", frets: [-1, 3, 2, 2, 1, 0], form: "C" }],
  G6: [{ name: "open", frets: [3, 2, 0, 0, 0, 0], form: "G" }],
};

const MOVABLE = {
  "": [
    { rootString: 0, pattern: [0, 2, 2, 1, 0, 0], label: "E-form", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 2, 0], label: "A-form", form: "A" },
  ],
  m: [
    { rootString: 0, pattern: [0, 2, 2, 0, 0, 0], label: "Em-form", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 1, 0], label: "Am-form", form: "A" },
  ],
  "7": [
    { rootString: 0, pattern: [0, 2, 0, 1, 0, 0], label: "E7-form", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 2, 0], label: "A7-form", form: "A" },
  ],
  maj7: [
    { rootString: 0, pattern: [0, 2, 1, 1, 0, 0], label: "Emaj7-form", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 1, 2, 0], label: "Amaj7-form", form: "A" },
  ],
  m7: [
    { rootString: 0, pattern: [0, 2, 0, 0, 0, 0], label: "Em7-form", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 1, 0], label: "Am7-form", form: "A" },
  ],
  m7b5: [
    { rootString: 1, pattern: [-1, 0, 1, 0, 1, -1], label: "ø A-form", form: "A" },
    { rootString: 0, pattern: [0, 1, 2, 0, 2, 0], label: "ø E-ish", form: "E" },
  ],
  dim: [{ rootString: 1, pattern: [-1, 0, 1, 2, 1, -1], label: "dim", form: "A" }],
  dim7: [{ rootString: 1, pattern: [-1, 0, 1, 2, 1, 2], label: "dim7", form: "A" }],
  sus2: [
    { rootString: 1, pattern: [-1, 0, 2, 2, 0, 0], label: "Asus2-form", form: "A" },
    { rootString: 0, pattern: [0, 2, 4, 2, 0, 0], label: "Esus2-form", form: "E" },
  ],
  sus4: [
    { rootString: 1, pattern: [-1, 0, 2, 2, 3, 0], label: "Asus4-form", form: "A" },
    { rootString: 0, pattern: [0, 2, 2, 2, 0, 0], label: "Esus4-form", form: "E" },
  ],
  "7sus4": [
    { rootString: 0, pattern: [0, 2, 0, 2, 0, 0], label: "E7sus", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 3, 0], label: "A7sus", form: "A" },
  ],
  add9: [
    { rootString: 0, pattern: [0, 2, 2, 1, 0, 2], label: "Eadd9", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 0, 0], label: "Aadd9-ish", form: "A" },
  ],
  madd9: [{ rootString: 0, pattern: [0, 2, 2, 0, 0, 2], label: "Emadd9", form: "E" }],
  "6": [
    { rootString: 0, pattern: [0, 2, 2, 1, 2, 0], label: "E6", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 2, 2], label: "A6", form: "A" },
  ],
  m6: [{ rootString: 0, pattern: [0, 2, 2, 0, 2, 0], label: "Em6", form: "E" }],
  "9": [
    { rootString: 1, pattern: [-1, 0, 2, 0, 2, 2], label: "A9-form", form: "A" },
    { rootString: 0, pattern: [0, 2, 0, 1, 0, 2], label: "E9-ish", form: "E" },
  ],
  maj9: [{ rootString: 1, pattern: [-1, 0, 2, 1, 0, 0], label: "Amaj9-ish", form: "A" }],
  m9: [{ rootString: 1, pattern: [-1, 0, 2, 0, 0, 0], label: "Am9-form", form: "A" }],
  "13": [{ rootString: 1, pattern: [-1, 0, 2, 0, 2, 2], label: "A13-ish", form: "A" }],
  "5": [
    { rootString: 0, pattern: [0, 2, 2, -1, -1, -1], label: "power E", form: "E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, -1, -1], label: "power A", form: "A" },
  ],
  "7alt": [
    { rootString: 1, pattern: [-1, 0, 1, 2, 2, 3], label: "7#9-ish", form: "A" },
    { rootString: 0, pattern: [0, 2, 0, 1, 3, 0], label: "7b9-ish", form: "E" },
  ],
  "m(maj7)": [{ rootString: 0, pattern: [0, 2, 1, 0, 0, 0], label: "Em(maj7)", form: "E" }],
};

const QUALITY_ALIASES = {
  "": "", maj: "", major: "", M: "",
  m: "m", min: "m", minor: "m",
  "7": "7", dom7: "7",
  maj7: "maj7", Maj7: "maj7", Δ: "maj7", M7: "maj7",
  m7: "m7", min7: "m7",
  m7b5: "m7b5", "ø": "m7b5", "ø7": "m7b5",
  dim: "dim", "°": "dim", dim7: "dim7", "°7": "dim7",
  sus2: "sus2", sus4: "sus4", sus: "sus4",
  "7sus4": "7sus4", "7sus": "7sus4",
  add9: "add9", madd9: "madd9",
  "6": "6", m6: "m6",
  "9": "9", maj9: "maj9", m9: "m9", "13": "13",
  "5": "5", "7alt": "7alt", alt: "7alt",
  "m(maj7)": "m(maj7)", mmaj7: "m(maj7)",
};

const ROOT_ALIAS = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
  "C#": "C#", "D#": "D#", "F#": "F#", "G#": "G#", "A#": "A#",
};
const ROOTS_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ROOTS_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const PC_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function splitChordSymbol(symbol) {
  const m = String(symbol).trim().match(/^([A-G][b#]?)(.*)$/i);
  if (!m) return null;
  let root = m[1][0].toUpperCase() + m[1].slice(1);
  let quality = (m[2] || "").replace(/Δ/g, "maj7").replace(/ø/g, "m7b5");
  return { root, quality, symbol };
}

function canonicalRoot(root) {
  return ROOT_ALIAS[root] || root;
}

function rootIndex(root) {
  const c = canonicalRoot(root);
  const i = ROOTS_SHARP.indexOf(c);
  if (i >= 0) return i;
  return ROOTS_FLAT.indexOf(root);
}

function normalizeQuality(q) {
  if (!q) return "";
  if (QUALITY_ALIASES[q] !== undefined) return QUALITY_ALIASES[q];
  const low = q.toLowerCase();
  for (const [k, v] of Object.entries(QUALITY_ALIASES)) {
    if (k.toLowerCase() === low) return v;
  }
  if (/^m\(maj7\)$/i.test(q) || /mmaj7/i.test(q)) return "m(maj7)";
  if (/^maj7/i.test(q)) return "maj7";
  if (/^m7b5/i.test(q)) return "m7b5";
  if (/^m7/i.test(q)) return "m7";
  if (/^m9/i.test(q)) return "m9";
  if (/^madd9/i.test(q)) return "madd9";
  if (/^m6/i.test(q)) return "m6";
  if (/^m(?!aj)/i.test(q) && q.length <= 2) return "m";
  if (/^7alt/i.test(q)) return "7alt";
  if (/^7sus/i.test(q)) return "7sus4";
  if (/^13/.test(q)) return "13";
  if (/^9/.test(q)) return "9";
  if (/^7/.test(q)) return "7";
  if (/^6/.test(q)) return "6";
  if (/^5$/.test(q)) return "5";
  if (/sus2/i.test(q)) return "sus2";
  if (/sus4?/i.test(q)) return "sus4";
  if (/add9/i.test(q)) return "add9";
  if (/dim7/i.test(q)) return "dim7";
  if (/dim/i.test(q)) return "dim";
  return q;
}

function openKeyVariants(root, quality) {
  const i = rootIndex(root);
  const keys = [];
  if (i >= 0) {
    keys.push(ROOTS_SHARP[i] + quality);
    keys.push(ROOTS_FLAT[i] + quality);
  }
  keys.push(root + quality);
  return keys;
}

function buildFromMovable(root, quality) {
  const shapes = MOVABLE[quality] || MOVABLE[""];
  const ri = rootIndex(root);
  if (ri < 0) return [];
  const out = [];
  for (const shape of shapes) {
    const openRoot = shape.rootString === 0 ? 4 : 9;
    const fret = (ri - openRoot + 12) % 12;
    const frets = shape.pattern.map((p) => (p === -1 ? FRET_MUTE : fret + p));
    const played = frets.filter((f) => f >= 0);
    if (!played.length) continue;
    if (Math.max(...played) > 15) continue;
    out.push({
      name: `${shape.label} @${fret || "open"}`,
      frets,
      baseFret: fret > 0 ? fret : undefined,
      movable: true,
      form: shape.form || "E",
    });
  }
  return out;
}

function getVoicings(symbol) {
  const parsed = splitChordSymbol(symbol);
  if (!parsed) return [];
  const quality = normalizeQuality(parsed.quality);
  const root = parsed.root;

  const sortVoicings = (list) =>
    [...list].sort((a, b) => voicingCenter(a.frets) - voicingCenter(b.frets));

  for (const key of openKeyVariants(root, quality || parsed.quality || "")) {
    if (OPEN_VOICINGS[key]) {
      return OPEN_VOICINGS[key].map((v) => ({ ...v, frets: [...v.frets] }));
    }
  }
  for (const key of openKeyVariants(root, parsed.quality)) {
    if (OPEN_VOICINGS[key]) {
      return OPEN_VOICINGS[key].map((v) => ({ ...v, frets: [...v.frets] }));
    }
  }

  const q = quality || "";
  if (MOVABLE[q]) return sortVoicings(buildFromMovable(root, q));
  if (/alt/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "7alt"));
  if (/maj9/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "maj9"));
  if (/m9/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "m9"));
  if (/m7/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "m7"));
  if (/maj7/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "maj7"));
  if (/^m/i.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "m"));
  if (/7/.test(parsed.quality)) return sortVoicings(buildFromMovable(root, "7"));
  return sortVoicings(buildFromMovable(root, ""));
}

function voicingCenter(frets) {
  if (!frets || !frets.length) return 0;
  const played = frets.filter((f) => f > 0);
  if (!played.length) return 0;
  return played.reduce((a, b) => a + b, 0) / played.length;
}

function voicingSpan(frets) {
  if (!frets || !frets.length) return 0;
  const played = frets.filter((f) => f > 0);
  if (played.length < 2) return 0;
  return Math.max(...played) - Math.min(...played);
}

function guitarTransitionCost(prev, next) {
  if (!next?.frets) return 99;
  if (!prev?.frets) {
    return voicingCenter(next.frets) * 1.2 + voicingSpan(next.frets) * 0.4;
  }
  const jump = Math.abs(voicingCenter(prev.frets) - voicingCenter(next.frets));
  const formPenalty = prev.form && next.form && prev.form === next.form ? -2.5 : 0;
  const openBonus = next.frets.some((f) => f === 0) && prev.frets.some((f) => f === 0) ? -1.5 : 0;
  const span = voicingSpan(next.frets);
  return jump * 2.2 + span * 0.35 + formPenalty + openBonus;
}

/** Подбирает формы по пути: минимум прыжков по грифу, одна «семья» форм. */
function pickGuitarSequence(path) {
  const options = path.map((sym) => {
    const list = getVoicings(sym);
    return list.length ? list : [{ name: "?", frets: [-1, -1, -1, -1, -1, -1], form: "?" }];
  });

  // Greedy with light look-ahead
  const chosen = [];
  for (let i = 0; i < options.length; i++) {
    const prev = chosen[i - 1]?.voicing || null;
    let best = options[i][0];
    let bestScore = Infinity;
    for (const cand of options[i]) {
      let score = guitarTransitionCost(prev, cand);
      if (i + 1 < options.length) {
        // look ahead: best next from this cand
        let nextBest = Infinity;
        for (const nxt of options[i + 1]) {
          nextBest = Math.min(nextBest, guitarTransitionCost(cand, nxt));
        }
        score += nextBest * 0.55;
      }
      if (score < bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    chosen.push({ symbol: path[i], voicing: best });
  }
  return chosen;
}

function computeBaseFret(frets) {
  const played = frets.filter((f) => f > 0);
  if (!played.length) return 1;
  const min = Math.min(...played);
  const max = Math.max(...played);
  if (max <= 4) return 1;
  return min;
}

function renderChordSvg(symbol, voicing, opts = {}) {
  const frets = voicing.frets;
  const base = voicing.baseFret || computeBaseFret(frets);
  const showFrets = 4;
  const w = opts.width || 84;
  const h = opts.height || 112;
  const padL = 16;
  const padR = 10;
  const padT = 34;
  const padB = 14;
  const gridW = w - padL - padR;
  const gridH = h - padT - padB;
  const stringXs = [0, 1, 2, 3, 4, 5].map((i) => padL + (gridW * i) / 5);
  const fretYs = [0, 1, 2, 3, 4].map((i) => padT + (gridH * i) / 4);

  let marks = "";
  if (base === 1) {
    marks += `<rect x="${padL - 1}" y="${padT - 3}" width="${gridW + 2}" height="3.5" fill="#e8b86a"/>`;
  } else {
    marks += `<text x="${padL - 5}" y="${padT + gridH / 8 + 3}" fill="#c4b09a" font-size="9" font-family="Manrope,sans-serif" text-anchor="end">${base}fr</text>`;
  }

  for (const x of stringXs) {
    marks += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + gridH}" stroke="#c4b09a" stroke-width="1" opacity="0.7"/>`;
  }
  for (const y of fretYs) {
    marks += `<line x1="${padL}" y1="${y}" x2="${padL + gridW}" y2="${y}" stroke="#c4b09a" stroke-width="1" opacity="0.55"/>`;
  }

  const rel = frets.map((f) => (f <= 0 ? f : f - base + 1));
  let barreFret = null;
  let barreFrom = null;
  let barreTo = null;
  for (let f = 1; f <= showFrets; f++) {
    const idxs = [];
    for (let s = 0; s < 6; s++) if (rel[s] === f) idxs.push(s);
    if (idxs.length >= 3 && idxs[idxs.length - 1] - idxs[0] + 1 === idxs.length && idxs[idxs.length - 1] - idxs[0] >= 2) {
      barreFret = f; barreFrom = idxs[0]; barreTo = idxs[idxs.length - 1];
      break;
    }
  }
  if (!barreFret) {
    for (let f = 1; f <= showFrets; f++) {
      const idxs = [];
      for (let s = 0; s < 6; s++) if (rel[s] === f) idxs.push(s);
      if (idxs.length >= 4) {
        barreFret = f; barreFrom = idxs[0]; barreTo = idxs[idxs.length - 1];
        break;
      }
    }
  }

  if (barreFret !== null) {
    const y = padT + ((barreFret - 0.5) * gridH) / 4;
    marks += `<rect x="${stringXs[barreFrom] - 5}" y="${y - 5}" width="${stringXs[barreTo] - stringXs[barreFrom] + 10}" height="10" rx="5" fill="#d4a05a"/>`;
  }

  for (let s = 0; s < 6; s++) {
    const f = frets[s];
    const x = stringXs[s];
    if (f === FRET_MUTE) {
      marks += `<text x="${x}" y="${padT - 10}" fill="#8a7664" font-size="11" text-anchor="middle" font-family="Manrope,sans-serif">×</text>`;
    } else if (f === FRET_OPEN) {
      marks += `<circle cx="${x}" cy="${padT - 12}" r="3.8" fill="none" stroke="#e8b86a" stroke-width="1.3"/>`;
    } else {
      const relF = f - base + 1;
      if (relF < 1 || relF > showFrets) continue;
      if (barreFret === relF && s > barreFrom && s < barreTo) continue;
      const y = padT + ((relF - 0.5) * gridH) / 4;
      marks += `<circle cx="${x}" cy="${y}" r="5.2" fill="#f3e6d4"/>`;
    }
  }

  const step = opts.step != null ? `<span class="diag-step">${opts.step}</span>` : "";
  const sub = voicing.name || "";
  return `
    <figure class="chord-diag">
      ${step}
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Аппликатура ${symbol}">
        <text x="${w / 2}" y="14" text-anchor="middle" fill="#f3e6d4" font-size="12" font-weight="600" font-family="Literata,Georgia,serif">${symbol}</text>
        ${marks}
      </svg>
      <button type="button" class="chord-play-btn" data-play-frets="${frets.join(",")}" aria-label="Послушать ${symbol}">▶</button>
      ${sub ? `<figcaption>${sub}</figcaption>` : ""}
    </figure>
  `;
}

/* ---------- Piano ---------- */

function chordPitchClasses(symbol) {
  const parsed = splitChordSymbol(symbol);
  if (!parsed) return [0];
  const root = rootIndex(parsed.root);
  const q = normalizeQuality(parsed.quality);
  const intervals = {
    "": [0, 4, 7],
    m: [0, 3, 7],
    "7": [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    m7: [0, 3, 7, 10],
    m7b5: [0, 3, 6, 10],
    dim: [0, 3, 6],
    dim7: [0, 3, 6, 9],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    "7sus4": [0, 5, 7, 10],
    add9: [0, 4, 7, 14],
    madd9: [0, 3, 7, 14],
    "6": [0, 4, 7, 9],
    m6: [0, 3, 7, 9],
    "9": [0, 4, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14],
    m9: [0, 3, 7, 10, 14],
    "13": [0, 4, 7, 10, 21],
    "5": [0, 7],
    "7alt": [0, 4, 10, 13], // 7#9-ish
    "m(maj7)": [0, 3, 7, 11],
  };
  const ints = intervals[q] || intervals[""];
  return ints.map((iv) => (root + iv) % 12);
}

function buildCloseVoicing(pcs, preferMidi = 60) {
  // Place each pitch class near preferMidi, sorted low→high, within ~1 octave+
  const tones = [];
  for (const pc of pcs.slice(0, 4)) {
    let midi = preferMidi - ((preferMidi - pc) % 12);
    if (midi > preferMidi + 6) midi -= 12;
    if (midi < preferMidi - 6) midi += 12;
    tones.push(midi);
  }
  tones.sort((a, b) => a - b);
  // ensure ascending unique
  for (let i = 1; i < tones.length; i++) {
    while (tones[i] <= tones[i - 1]) tones[i] += 12;
  }
  // compress if span too wide
  while (tones[tones.length - 1] - tones[0] > 14 && tones.length > 2) {
    tones[tones.length - 1] -= 12;
    tones.sort((a, b) => a - b);
  }
  return tones;
}

function voiceLeadPiano(prevMidis, pcs) {
  const uniquePcs = [...new Set(pcs.map((p) => ((p % 12) + 12) % 12))];
  if (!prevMidis || !prevMidis.length) {
    return buildCloseVoicing(uniquePcs, 60);
  }

  const center = Math.round(prevMidis.reduce((a, b) => a + b, 0) / prevMidis.length);
  const next = [];
  const usedPc = new Set();

  // Keep common tones / move each previous voice to nearest chord tone
  for (const m of prevMidis) {
    let best = null;
    let bestDist = 99;
    for (const pc of uniquePcs) {
      let cand = pc;
      // bring near m
      while (cand < m - 6) cand += 12;
      while (cand > m + 6) cand -= 12;
      const d = Math.abs(cand - m);
      if (d < bestDist && !usedPc.has(pc)) {
        bestDist = d;
        best = cand;
      }
    }
    if (best != null) {
      next.push(best);
      usedPc.add(((best % 12) + 12) % 12);
    }
  }

  // Add missing chord tones near center
  for (const pc of uniquePcs) {
    if (usedPc.has(pc)) continue;
    let cand = pc;
    while (cand < center - 6) cand += 12;
    while (cand > center + 8) cand -= 12;
    next.push(cand);
    usedPc.add(pc);
  }

  next.sort((a, b) => a - b);
  const dedup = [];
  for (const n of next) {
    if (!dedup.length || dedup[dedup.length - 1] !== n) dedup.push(n);
  }
  return dedup.slice(0, Math.min(4, Math.max(3, uniquePcs.length)));
}

function pianoFingers(midis) {
  // Right-hand style numbering low→high: 1 2 3 5 or 1 2 3 4 5
  const map = {
    1: [1],
    2: [1, 3],
    3: [1, 3, 5],
    4: [1, 2, 3, 5],
    5: [1, 2, 3, 4, 5],
  };
  return map[midis.length] || midis.map((_, i) => i + 1);
}

function pickPianoSequence(path) {
  const seq = [];
  let prev = null;
  for (const sym of path) {
    const pcs = chordPitchClasses(sym);
    const midis = voiceLeadPiano(prev, pcs);
    const fingers = pianoFingers(midis);
    seq.push({ symbol: sym, midis, fingers, notes: midis.map((m) => PC_NAMES[((m % 12) + 12) % 12]) });
    prev = midis;
  }
  return seq;
}

function renderPianoSvg(item, opts = {}) {
  const midis = item.midis;
  const minM = Math.min(...midis);
  const maxM = Math.max(...midis);
  // window of white keys covering the voicing + padding
  let start = minM - 1;
  while ([1, 3, 6, 8, 10].includes(((start % 12) + 12) % 12)) start--; // land on white
  let end = maxM + 1;
  while ([1, 3, 6, 8, 10].includes(((end % 12) + 12) % 12)) end++;

  const isBlack = (m) => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
  const whites = [];
  for (let m = start; m <= end; m++) if (!isBlack(m)) whites.push(m);

  const whiteW = 14;
  const w = Math.max(120, whites.length * whiteW + 16);
  const h = 100;
  const padL = 8;
  const padT = 28;
  const whiteH = 58;
  const blackH = 36;
  const blackW = 9;

  const active = new Set(midis);
  const fingerOf = {};
  midis.forEach((m, i) => {
    fingerOf[m] = item.fingers[i];
  });

  let svg = "";
  // white keys
  whites.forEach((m, i) => {
    const x = padL + i * whiteW;
    const on = active.has(m);
    svg += `<rect x="${x}" y="${padT}" width="${whiteW - 1.2}" height="${whiteH}" rx="1.5" fill="${on ? "#e8b86a" : "#f3e6d4"}" stroke="#3d2e22" stroke-width="1"/>`;
    if (on && fingerOf[m]) {
      svg += `<text x="${x + (whiteW - 1.2) / 2}" y="${padT + whiteH - 8}" text-anchor="middle" fill="#1a1410" font-size="10" font-weight="700" font-family="Manrope,sans-serif">${fingerOf[m]}</text>`;
    }
  });

  // black keys
  whites.forEach((m, i) => {
    const nextBlack = m + 1;
    if (nextBlack <= end && isBlack(nextBlack)) {
      const x = padL + i * whiteW + whiteW - blackW / 2 - 0.6;
      const on = active.has(nextBlack);
      svg += `<rect x="${x}" y="${padT}" width="${blackW}" height="${blackH}" rx="1" fill="${on ? "#d4a05a" : "#1a1410"}" stroke="#0d0a08" stroke-width="0.5"/>`;
      if (on && fingerOf[nextBlack]) {
        svg += `<text x="${x + blackW / 2}" y="${padT + blackH - 6}" text-anchor="middle" fill="#1a1410" font-size="9" font-weight="700" font-family="Manrope,sans-serif">${fingerOf[nextBlack]}</text>`;
      }
    }
  });

  const noteLabel = item.notes.join("·");
  const step = opts.step != null ? `<span class="diag-step">${opts.step}</span>` : "";
  const playNotes = midis.join(",");

  return `
    <figure class="chord-diag chord-diag-piano">
      ${step}
      <svg viewBox="0 0 ${w} ${h}" width="${Math.min(w, 200)}" height="${h}" role="img" aria-label="Рояль ${item.symbol}">
        <text x="${w / 2}" y="14" text-anchor="middle" fill="#f3e6d4" font-size="12" font-weight="600" font-family="Literata,Georgia,serif">${item.symbol}</text>
        ${svg}
      </svg>
      <button type="button" class="chord-play-btn" data-play-notes="${playNotes}" aria-label="Послушать ${item.symbol}">▶</button>
      <figcaption>${noteLabel}</figcaption>
    </figure>
  `;
}

function currentDiagramInstrument() {
  if (typeof getInstrument === "function") return getInstrument();
  try {
    return localStorage.getItem("lad-instrument") || "acoustic";
  } catch (_) {
    return "acoustic";
  }
}

function renderPathDiagrams(path) {
  const instrument = currentDiagramInstrument();
  const isPiano = instrument === "piano";

  const hint = isPiano
    ? "Последовательность для рояля · цифры — пальцы правой руки (1=большой)"
    : "Удобная последовательность на грифе · формы подобраны с малым сдвигом руки";

  let body = "";
  if (isPiano) {
    const seq = pickPianoSequence(path);
    body = seq
      .map((item, i) => {
        const arrow = i < seq.length - 1 ? `<span class="diag-arrow" aria-hidden="true">→</span>` : "";
        return `${renderPianoSvg(item, { step: i + 1 })}${arrow}`;
      })
      .join("");
  } else {
    const seq = pickGuitarSequence(path);
    body = seq
      .map((item, i) => {
        const arrow = i < seq.length - 1 ? `<span class="diag-arrow" aria-hidden="true">→</span>` : "";
        return `${renderChordSvg(item.symbol, item.voicing, { step: i + 1 })}${arrow}`;
      })
      .join("");
  }

  return `
    <div class="diag-block" data-path="${path.join("|")}">
      <p class="diag-hint">${hint}</p>
      <div class="diag-row diag-sequence">${body}</div>
    </div>
  `;
}

function refreshAllPathDiagrams() {
  document.querySelectorAll(".diag-block[data-path]").forEach((block) => {
    const path = block.dataset.path.split("|").filter(Boolean);
    if (!path.length) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = renderPathDiagrams(path);
    const next = tmp.firstElementChild;
    if (next) block.replaceWith(next);
  });
}

if (typeof window !== "undefined") {
  window.refreshAllPathDiagrams = refreshAllPathDiagrams;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getVoicings,
    renderPathDiagrams,
    pickGuitarSequence,
    pickPianoSequence,
    normalizeQuality,
    splitChordSymbol,
    chordPitchClasses,
  };
}
