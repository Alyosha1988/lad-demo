/**
 * Аппликатуры гитарных аккордов: база форм + SVG-схемы.
 * Струны слева направо: E A D G B e (6 → 1).
 */

const FRET_MUTE = -1;
const FRET_OPEN = 0;

/** Открытые/позиционные формы: точное имя → список войсингов */
const OPEN_VOICINGS = {
  C: [{ name: "open", frets: [-1, 3, 2, 0, 1, 0] }],
  Cm: [{ name: "barre 3", frets: [-1, 3, 5, 5, 4, 3], baseFret: 3 }],
  "C#": [{ name: "barre 4", frets: [-1, 4, 6, 6, 6, 4], baseFret: 4 }],
  "C#m": [{ name: "barre 4", frets: [-1, 4, 6, 6, 5, 4], baseFret: 4 }],
  Db: [{ name: "barre 4", frets: [-1, 4, 6, 6, 6, 4], baseFret: 4 }],
  Dbm: [{ name: "barre 4", frets: [-1, 4, 6, 6, 5, 4], baseFret: 4 }],
  D: [{ name: "open", frets: [-1, -1, 0, 2, 3, 2] }],
  Dm: [{ name: "open", frets: [-1, -1, 0, 2, 3, 1] }],
  Eb: [{ name: "barre 6", frets: [-1, 6, 8, 8, 8, 6], baseFret: 6 }],
  Ebm: [{ name: "barre 6", frets: [-1, 6, 8, 8, 7, 6], baseFret: 6 }],
  E: [{ name: "open", frets: [0, 2, 2, 1, 0, 0] }],
  Em: [{ name: "open", frets: [0, 2, 2, 0, 0, 0] }],
  F: [
    { name: "barre 1", frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
    { name: "mini", frets: [-1, -1, 3, 2, 1, 1], baseFret: 1 },
  ],
  Fm: [{ name: "barre 1", frets: [1, 3, 3, 1, 1, 1], baseFret: 1 }],
  "F#": [{ name: "barre 2", frets: [2, 4, 4, 3, 2, 2], baseFret: 2 }],
  "F#m": [{ name: "barre 2", frets: [2, 4, 4, 2, 2, 2], baseFret: 2 }],
  G: [{ name: "open", frets: [3, 2, 0, 0, 0, 3] }],
  Gm: [{ name: "barre 3", frets: [3, 5, 5, 3, 3, 3], baseFret: 3 }],
  Ab: [{ name: "barre 4", frets: [4, 6, 6, 5, 4, 4], baseFret: 4 }],
  Abm: [{ name: "barre 4", frets: [4, 6, 6, 4, 4, 4], baseFret: 4 }],
  A: [{ name: "open", frets: [-1, 0, 2, 2, 2, 0] }],
  Am: [{ name: "open", frets: [-1, 0, 2, 2, 1, 0] }],
  Bb: [{ name: "barre 1", frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 }],
  Bbm: [{ name: "barre 1", frets: [-1, 1, 3, 3, 2, 1], baseFret: 1 }],
  B: [{ name: "barre 2", frets: [-1, 2, 4, 4, 4, 2], baseFret: 2 }],
  Bm: [{ name: "barre 2", frets: [-1, 2, 4, 4, 3, 2], baseFret: 2 }],

  C7: [{ name: "open", frets: [-1, 3, 2, 3, 1, 0] }],
  Cmaj7: [{ name: "open", frets: [-1, 3, 2, 0, 0, 0] }],
  Cm7: [{ name: "barre 3", frets: [-1, 3, 5, 3, 4, 3], baseFret: 3 }],
  D7: [{ name: "open", frets: [-1, -1, 0, 2, 1, 2] }],
  Dmaj7: [{ name: "open", frets: [-1, -1, 0, 2, 2, 2] }],
  Dm7: [{ name: "open", frets: [-1, -1, 0, 2, 1, 1] }],
  E7: [{ name: "open", frets: [0, 2, 0, 1, 0, 0] }],
  Emaj7: [{ name: "open", frets: [0, 2, 1, 1, 0, 0] }],
  Em7: [{ name: "open", frets: [0, 2, 0, 0, 0, 0] }],
  Fmaj7: [{ name: "open-ish", frets: [-1, -1, 3, 2, 1, 0], baseFret: 1 }],
  F7: [{ name: "barre 1", frets: [1, 3, 1, 2, 1, 1], baseFret: 1 }],
  G7: [{ name: "open", frets: [3, 2, 0, 0, 0, 1] }],
  Gmaj7: [{ name: "open", frets: [3, 2, 0, 0, 0, 2] }],
  Gm7: [{ name: "barre 3", frets: [3, 5, 3, 3, 3, 3], baseFret: 3 }],
  A7: [{ name: "open", frets: [-1, 0, 2, 0, 2, 0] }],
  Amaj7: [{ name: "open", frets: [-1, 0, 2, 1, 2, 0] }],
  Am7: [{ name: "open", frets: [-1, 0, 2, 0, 1, 0] }],
  B7: [{ name: "open", frets: [-1, 2, 1, 2, 0, 2] }],
  Bm7: [{ name: "barre 2", frets: [-1, 2, 4, 2, 3, 2], baseFret: 2 }],
  Bmaj7: [{ name: "barre 2", frets: [-1, 2, 4, 3, 4, 2], baseFret: 2 }],

  Asus2: [{ name: "open", frets: [-1, 0, 2, 2, 0, 0] }],
  Asus4: [{ name: "open", frets: [-1, 0, 2, 2, 3, 0] }],
  Dsus2: [{ name: "open", frets: [-1, -1, 0, 2, 3, 0] }],
  Dsus4: [{ name: "open", frets: [-1, -1, 0, 2, 3, 3] }],
  Esus4: [{ name: "open", frets: [0, 2, 2, 2, 0, 0] }],
  A7sus4: [{ name: "open", frets: [-1, 0, 2, 0, 3, 0] }],
  D7sus4: [{ name: "open", frets: [-1, -1, 0, 2, 1, 3] }],
  Cadd9: [{ name: "open", frets: [-1, 3, 2, 0, 3, 0] }],
  Gadd9: [{ name: "open", frets: [3, 2, 0, 0, 0, 5] }],
  Emadd9: [{ name: "open", frets: [0, 2, 2, 0, 0, 2] }],
  Am9: [{ name: "open", frets: [-1, 0, 2, 0, 0, 0] }],
  C6: [{ name: "open", frets: [-1, 3, 2, 2, 1, 0] }],
  G6: [{ name: "open", frets: [3, 2, 0, 0, 0, 0] }],
};

/**
 * Подвижные формы: quality → { rootString: 0=E или 1=A, pattern относительно баррэ }
 * pattern: 6 чисел, 0 = лад баррэ / открытая относительная позиция.
 */
const MOVABLE = {
  "": [
    { rootString: 0, pattern: [0, 2, 2, 1, 0, 0], label: "E-form" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 2, 0], label: "A-form" },
  ],
  m: [
    { rootString: 0, pattern: [0, 2, 2, 0, 0, 0], label: "Em-form" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 1, 0], label: "Am-form" },
  ],
  "7": [
    { rootString: 0, pattern: [0, 2, 0, 1, 0, 0], label: "E7-form" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 2, 0], label: "A7-form" },
  ],
  maj7: [
    { rootString: 0, pattern: [0, 2, 1, 1, 0, 0], label: "Emaj7-form" },
    { rootString: 1, pattern: [-1, 0, 2, 1, 2, 0], label: "Amaj7-form" },
  ],
  m7: [
    { rootString: 0, pattern: [0, 2, 0, 0, 0, 0], label: "Em7-form" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 1, 0], label: "Am7-form" },
  ],
  m7b5: [
    { rootString: 1, pattern: [-1, 0, 1, 0, 1, -1], label: "ø A-form" },
    { rootString: 0, pattern: [0, 1, 2, 0, 2, 0], label: "ø E-ish" },
  ],
  dim: [
    { rootString: 1, pattern: [-1, 0, 1, 2, 1, -1], label: "dim" },
  ],
  dim7: [
    { rootString: 1, pattern: [-1, 0, 1, 2, 1, 2], label: "dim7" },
  ],
  sus2: [
    { rootString: 1, pattern: [-1, 0, 2, 2, 0, 0], label: "Asus2-form" },
    { rootString: 0, pattern: [0, 2, 4, 2, 0, 0], label: "Esus2-form" },
  ],
  sus4: [
    { rootString: 1, pattern: [-1, 0, 2, 2, 3, 0], label: "Asus4-form" },
    { rootString: 0, pattern: [0, 2, 2, 2, 0, 0], label: "Esus4-form" },
  ],
  "7sus4": [
    { rootString: 0, pattern: [0, 2, 0, 2, 0, 0], label: "E7sus" },
    { rootString: 1, pattern: [-1, 0, 2, 0, 3, 0], label: "A7sus" },
  ],
  add9: [
    { rootString: 0, pattern: [0, 2, 2, 1, 0, 2], label: "Eadd9" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 0, 0], label: "Aadd9-ish" },
  ],
  madd9: [
    { rootString: 0, pattern: [0, 2, 2, 0, 0, 2], label: "Emadd9" },
  ],
  "6": [
    { rootString: 0, pattern: [0, 2, 2, 1, 2, 0], label: "E6" },
    { rootString: 1, pattern: [-1, 0, 2, 2, 2, 2], label: "A6" },
  ],
  m6: [
    { rootString: 0, pattern: [0, 2, 2, 0, 2, 0], label: "Em6" },
  ],
  "9": [
    { rootString: 1, pattern: [-1, 0, 2, 0, 2, 2], label: "A9-form" },
    { rootString: 0, pattern: [0, 2, 0, 1, 0, 2], label: "E9-ish" },
  ],
  maj9: [
    { rootString: 1, pattern: [-1, 0, 2, 1, 0, 0], label: "Amaj9-ish" },
  ],
  m9: [
    { rootString: 1, pattern: [-1, 0, 2, 0, 0, 0], label: "Am9-form" },
  ],
  "13": [
    { rootString: 1, pattern: [-1, 0, 2, 0, 2, 2], label: "A13-ish" },
  ],
  "5": [
    { rootString: 0, pattern: [0, 2, 2, -1, -1, -1], label: "power E" },
    { rootString: 1, pattern: [-1, 0, 2, 2, -1, -1], label: "power A" },
  ],
  "7alt": [
    { rootString: 1, pattern: [-1, 0, 1, 2, 2, 3], label: "7#9-ish" },
    { rootString: 0, pattern: [0, 2, 0, 1, 3, 0], label: "7b9-ish" },
  ],
  "m(maj7)": [
    { rootString: 0, pattern: [0, 2, 1, 0, 0, 0], label: "Em(maj7)" },
  ],
};

const QUALITY_ALIASES = {
  "": "",
  maj: "",
  major: "",
  M: "",
  m: "m",
  min: "m",
  minor: "m",
  "7": "7",
  dom7: "7",
  maj7: "maj7",
  Maj7: "maj7",
  Δ: "maj7",
  M7: "maj7",
  m7: "m7",
  min7: "m7",
  "m7b5": "m7b5",
  "ø": "m7b5",
  "ø7": "m7b5",
  dim: "dim",
  "°": "dim",
  dim7: "dim7",
  "°7": "dim7",
  sus2: "sus2",
  sus4: "sus4",
  sus: "sus4",
  "7sus4": "7sus4",
  "7sus": "7sus4",
  add9: "add9",
  madd9: "madd9",
  "6": "6",
  m6: "m6",
  "9": "9",
  maj9: "maj9",
  m9: "m9",
  "13": "13",
  "5": "5",
  "7alt": "7alt",
  alt: "7alt",
  "m(maj7)": "m(maj7)",
  mmaj7: "m(maj7)",
};

const ROOT_ALIAS = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  "C#": "C#",
  "D#": "D#",
  "F#": "F#",
  "G#": "G#",
  "A#": "A#",
};

const ROOTS_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ROOTS_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function splitChordSymbol(symbol) {
  const m = String(symbol).trim().match(/^([A-G][b#]?)(.*)$/i);
  if (!m) return null;
  let root = m[1][0].toUpperCase() + m[1].slice(1);
  let quality = m[2] || "";
  quality = quality.replace(/Δ/g, "maj7").replace(/ø/g, "m7b5");
  return { root, quality, symbol };
}

function canonicalRoot(root) {
  return ROOT_ALIAS[root] || root;
}

function rootIndex(root) {
  const c = canonicalRoot(root);
  return ROOTS_SHARP.indexOf(c);
}

function displayRoot(root, preferFlat) {
  const i = rootIndex(root);
  if (i < 0) return root;
  return preferFlat ? ROOTS_FLAT[i] : ROOTS_SHARP[i];
}

function normalizeQuality(q) {
  if (!q) return "";
  if (QUALITY_ALIASES[q] !== undefined) return QUALITY_ALIASES[q];
  // try lowercase
  const low = q.toLowerCase();
  for (const [k, v] of Object.entries(QUALITY_ALIASES)) {
    if (k.toLowerCase() === low) return v;
  }
  // strip leading junk
  if (/^m\(maj7\)$/i.test(q)) return "m(maj7)";
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
    // open E = index 4, open A = index 9
    const openRoot = shape.rootString === 0 ? 4 : 9;
    let fret = (ri - openRoot + 12) % 12;
    if (fret === 0 && shape.rootString === 0 && quality === "") {
      // E major open already in OPEN
    }
    // Prefer frets 1–12; if 0, it's the open shape position
    const frets = shape.pattern.map((p) => {
      if (p === -1) return FRET_MUTE;
      return fret + p;
    });
    // Skip unreasonably high or empty
    const played = frets.filter((f) => f >= 0);
    if (!played.length) continue;
    const max = Math.max(...played);
    if (max > 15) continue;
    out.push({
      name: `${shape.label} @${fret || "open"}`,
      frets,
      baseFret: fret > 0 ? fret : undefined,
      movable: true,
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
    [...list].sort((a, b) => {
      const score = (v) => {
        const played = v.frets.filter((f) => f > 0);
        if (!played.length) return 0;
        return Math.min(...played) * 2 + Math.max(...played);
      };
      return score(a) - score(b);
    });

  // Exact open dictionary first
  for (const key of openKeyVariants(root, quality || (parsed.quality || ""))) {
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
    for (let s = 0; s < 6; s++) {
      if (rel[s] === f) idxs.push(s);
    }
    if (idxs.length >= 3 && idxs[idxs.length - 1] - idxs[0] + 1 === idxs.length && idxs[idxs.length - 1] - idxs[0] >= 2) {
      barreFret = f;
      barreFrom = idxs[0];
      barreTo = idxs[idxs.length - 1];
      break;
    }
  }
  if (!barreFret) {
    for (let f = 1; f <= showFrets; f++) {
      const idxs = [];
      for (let s = 0; s < 6; s++) if (rel[s] === f) idxs.push(s);
      if (idxs.length >= 4) {
        barreFret = f;
        barreFrom = idxs[0];
        barreTo = idxs[idxs.length - 1];
        break;
      }
    }
  }

  if (barreFret !== null) {
    const y = padT + ((barreFret - 0.5) * gridH) / 4;
    const x1 = stringXs[barreFrom];
    const x2 = stringXs[barreTo];
    marks += `<rect x="${x1 - 5}" y="${y - 5}" width="${x2 - x1 + 10}" height="10" rx="5" fill="#d4a05a"/>`;
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

  const title = symbol;
  const sub = voicing.name ? voicing.name : "";
  const fretAttr = frets.join(",");
  return `
    <figure class="chord-diag">
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Аппликатура ${title}">
        <text x="${w / 2}" y="14" text-anchor="middle" fill="#f3e6d4" font-size="12" font-weight="600" font-family="Literata,Georgia,serif">${title}</text>
        ${marks}
      </svg>
      <button type="button" class="chord-play-btn" data-play-frets="${fretAttr}" aria-label="Послушать ${title}">▶</button>
      ${sub ? `<figcaption>${sub}</figcaption>` : ""}
    </figure>
  `;
}

function renderChordDiagrams(symbol, { maxVoicings = 1 } = {}) {
  const voicings = getVoicings(symbol).slice(0, maxVoicings);
  if (!voicings.length) {
    return `<figure class="chord-diag chord-diag-missing">
      <div class="chord-missing">${symbol}</div>
      <button type="button" class="chord-play-btn" data-play-chord="${symbol}" aria-label="Послушать ${symbol}">▶</button>
      <figcaption>нет схемы</figcaption>
    </figure>`;
  }
  return voicings.map((v) => renderChordSvg(symbol, v)).join("");
}

function renderPathDiagrams(path, { maxVoicings = 1 } = {}) {
  // unique in order
  const seen = new Set();
  const ordered = [];
  for (const c of path) {
    if (seen.has(c)) continue;
    seen.add(c);
    ordered.push(c);
  }
  return `
    <div class="diag-row">
      ${ordered.map((c) => renderChordDiagrams(c, { maxVoicings })).join("")}
    </div>
  `;
}

// export for node tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getVoicings, renderPathDiagrams, normalizeQuality, splitChordSymbol };
}
