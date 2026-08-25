/**
 * Лад — интерактивный помощник гармонических и мелодических ходов.
 * Логика: вопросы → ответы → варианты, понятные гитаристу.
 */

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_ALIASES = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const START_CHORDS = [
  "C", "Am", "G", "Em", "D", "Dm", "F", "E",
  "A", "Bm", "Em7", "Am7", "Cmaj7", "G7", "Fmaj7", "B7",
];

const MOODS = [
  { id: "bright", title: "Светлое, открытое", desc: "Как будто окно распахнули" },
  { id: "dark", title: "Тёмное, замкнутое", desc: "Тише, ниже, внутрь себя" },
  { id: "tense", title: "Напряжённое", desc: "Хочется разрешения" },
  { id: "dream", title: "Мечтательное", desc: "Плавающее, немного «мимо»" },
];

const MOVES = [
  { id: "home", title: "Остаться «дома»", desc: "Рядом с исходным аккордом" },
  { id: "lift", title: "Поднять энергию", desc: "Вверх, в припевный характер" },
  { id: "fall", title: "Спуститься", desc: "Мягче, тише, глубже" },
  { id: "twist", title: "Неожиданный поворот", desc: "Сюрприз, но чтобы звучало" },
];

const PARTS = [
  { id: "verse", title: "Куплет", desc: "Рассказ, движение внутри" },
  { id: "chorus", title: "Припев", desc: "Крючок, чтобы запомнить" },
  { id: "bridge", title: "Бридж / проигрыш", desc: "Контраст перед возвратом" },
  { id: "intro", title: "Интро / аутро", desc: "Вход или выход из песни" },
];

const state = {
  start: null,
  mood: null,
  move: null,
  part: null,
};

const stage = document.getElementById("stage");
const brandSub = document.getElementById("brandSub");

function parseChord(raw) {
  const m = String(raw).trim().match(/^([A-G][b#]?)(.*)$/);
  if (!m) return null;
  let root = m[1];
  if (NOTE_ALIASES[root]) root = NOTE_ALIASES[root];
  const quality = m[2] || "";
  const isMinor = /(^m(?!aj)|min|minor)/i.test(quality) || quality === "m";
  const isDom7 = /(^7|dom)/i.test(quality) && !/maj7/i.test(quality);
  const isMaj7 = /maj7|Δ/i.test(quality);
  return { label: raw, root, quality, isMinor, isDom7, isMaj7 };
}

function noteIndex(note) {
  const n = NOTE_ALIASES[note] || note;
  return NOTES.indexOf(n);
}

function transpose(note, semitones) {
  const i = noteIndex(note);
  if (i < 0) return note;
  return NOTES[(i + semitones + 120) % 12];
}

function chordName(root, quality) {
  return `${root}${quality}`;
}

/** Диатоника мажора от тоники */
function majorScale(root) {
  const steps = [0, 2, 4, 5, 7, 9, 11];
  return steps.map((s) => transpose(root, s));
}

function minorScale(root) {
  const steps = [0, 2, 3, 5, 7, 8, 10];
  return steps.map((s) => transpose(root, s));
}

/** Предполагаем тональность по стартовому аккорду */
function guessKey(chord) {
  if (chord.isMinor) {
    return { tonic: chord.root, mode: "minor", label: `${chord.root}m` };
  }
  return { tonic: chord.root, mode: "major", label: chord.root };
}

function diatonicTriads(key) {
  const scale = key.mode === "minor" ? minorScale(key.tonic) : majorScale(key.tonic);
  const quals =
    key.mode === "minor"
      ? ["m", "", "m", "m", "", "", ""]
      : ["", "m", "m", "", "", "m", "dim"];
  // natural minor: i iidim bIII iv v bVI bVII — adjust
  const minorQuals = ["m", "dim", "", "m", "m", "", ""];
  const q = key.mode === "minor" ? minorQuals : quals;
  return scale.map((n, i) => chordName(n, q[i] === "dim" ? "dim" : q[i]));
}

function relativeMajor(minorRoot) {
  return transpose(minorRoot, 3);
}

function relativeMinor(majorRoot) {
  return transpose(majorRoot, -3);
}

function progressionsFor(answers) {
  const start = parseChord(answers.start);
  const key = guessKey(start);
  const dia = diatonicTriads(key);
  const i = dia[0];
  const ii = dia[1];
  const iii = dia[2];
  const iv = dia[3];
  const v = dia[4];
  const vi = dia[5];
  const bVII =
    key.mode === "minor"
      ? chordName(transpose(key.tonic, 10), "")
      : chordName(transpose(key.tonic, 10), "");
  const bVI =
    key.mode === "minor"
      ? chordName(transpose(key.tonic, 8), "")
      : chordName(transpose(key.tonic, 8), "");

  const startLabel = start.label;
  const ideas = [];

  const push = (kind, path, why) => {
    ideas.push({ kind, path, why });
  };

  // Mood + move + part shape the suggestions
  if (answers.mood === "bright" && answers.move === "home") {
    push(
      "Гармония",
      [startLabel, iv, v, i].filter(Boolean),
      "Классический «домашний» круг: туда-сюда вокруг тоники. На гитаре звучит уверенно и песенно."
    );
    push(
      "Гармония",
      [startLabel, vi, iv, v],
      "Чуть больше воздуха: уход в родственный минор и возврат через доминанту."
    );
  }

  if (answers.mood === "bright" && answers.move === "lift") {
    push(
      "Гармония",
      [startLabel, v, vi, iv],
      "Ход «вверх»: доминанта поднимает, потом мягкий спад — любимый приёмный ход поп/рок-песен."
    );
    push(
      "Гармония",
      key.mode === "minor"
        ? [startLabel, bVII, bVI, bVII]
        : [startLabel, chordName(transpose(key.tonic, 7), ""), vi, iv],
      "Энергия без жёсткого разрешения — хорошо для припева, который «несёт»."
    );
  }

  if (answers.mood === "dark" && answers.move === "fall") {
    push(
      "Гармония",
      key.mode === "minor"
        ? [startLabel, bVI, bVII, startLabel]
        : [startLabel, vi, iv, startLabel],
      "Спуск внутрь: аккорды ниже по настроению, без резкого света."
    );
    push(
      "Гармония",
      [startLabel, iv, ii, startLabel],
      "Субдоминанта и второй аккорд держат тень — удобно для тихого куплета."
    );
  }

  if (answers.mood === "dark" && answers.move === "home") {
    push(
      "Гармония",
      key.mode === "minor"
        ? [startLabel, iv, v, startLabel]
        : [startLabel, chordName(relativeMinor(key.tonic), "m"), iv, startLabel],
      "Остаёмся в тёплой тени, но с ощущением «песня идёт»."
    );
  }

  if (answers.mood === "tense") {
    const dom = key.mode === "minor"
      ? chordName(transpose(key.tonic, 7), "7")
      : chordName(transpose(key.tonic, 7), "7");
    push(
      "Гармония",
      [startLabel, dom, i],
      "Доминантсептаккорд тянет обратно в тонику — самое понятное «напряжение → разрядка»."
    );
    push(
      "Гармония",
      [startLabel, ii, dom, i],
      "Почти джазовый подход: ii → V → I. На акустике звучит благородно."
    );
  }

  if (answers.mood === "dream") {
    const colorStart = start.isMinor
      ? chordName(start.root, "m7")
      : chordName(start.root, "maj7");
    const ivRoot = parseChord(iv)?.root ?? transpose(key.tonic, 5);
    const colorIv = key.mode === "minor"
      ? chordName(ivRoot, "m7")
      : chordName(ivRoot, "maj7");
    push(
      "Гармония",
      [startLabel, colorStart, iv, colorIv],
      "Септаккорды размывают края — мелодия может «плыть» над гармонией."
    );
    const sus = chordName(start.root, "sus2");
    push(
      "Гармония",
      [startLabel, sus, iv, startLabel],
      "Sus снимает «мажор/минор» на секунду — мечтательный эффект без смены тональности."
    );
  }

  if (answers.move === "twist") {
    if (key.mode === "major") {
      const parallel = chordName(key.tonic, "m");
      push(
        "Поворот",
        [startLabel, parallel, bVI, bVII],
        "Внезапный параллельный минор — знакомый трюк: свет → тень, и песня «поворачивает»."
      );
    } else {
      const parallel = key.tonic;
      push(
        "Поворот",
        [startLabel, parallel, bVII, parallel],
        "Выход в одноимённый мажор — как будто тучи разошлись на один куплет."
      );
    }
    push(
      "Поворот",
      [startLabel, chordName(transpose(start.root, 1), start.isMinor ? "m" : ""), v, i],
      "Полутоновый сдвиг — дерзко, но если потом вернуться через V, ухо прощает."
    );
  }

  if (answers.part === "chorus" && !ideas.some((x) => x.path.join() === [startLabel, v, vi, iv].join())) {
    push(
      "Припев",
      key.mode === "minor" ? [startLabel, bVII, bVI, bVII] : [startLabel, v, vi, iv],
      "Форма припева: проще и повторнее, чем куплет. Повторите 2 раза — уже крючок."
    );
  }

  if (answers.part === "bridge") {
    push(
      "Бридж",
      key.mode === "minor"
        ? [iv, bVI, bVII, startLabel]
        : [vi, iv, ii, v],
      "Бридж любит другие ступени, чтобы возврат к куплету/припеву ощущался как домой."
    );
  }

  if (answers.part === "intro") {
    push(
      "Интро",
      [iv, startLabel],
      "Короткий вход: один «чужой» аккорд → ваш старт. Гитаристу удобно играть арпеджио."
    );
  }

  // Fallbacks so we always have options
  if (ideas.length < 3) {
    push(
      "Гармония",
      [startLabel, iv, v, i],
      "Универсальный каркас I–IV–V. От него можно уйти куда угодно."
    );
    push(
      "Гармония",
      [startLabel, vi, iv, i],
      "Мягкий круг без доминанты — спокойнее, «авторская песня»."
    );
    push(
      "Гармония",
      key.mode === "minor" ? [startLabel, bVII, bVI, startLabel] : [startLabel, ii, iv, v],
      "Альтернативный контур — попробуйте медленнее, слушая бас."
    );
  }

  // Deduplicate by path
  const seen = new Set();
  return ideas.filter((idea) => {
    const keyPath = idea.path.join("-");
    if (seen.has(keyPath)) return false;
    seen.add(keyPath);
    return true;
  }).slice(0, 4);
}

function melodyFor(answers) {
  const start = parseChord(answers.start);
  const key = guessKey(start);
  const scale = key.mode === "minor" ? minorScale(key.tonic) : majorScale(key.tonic);
  const pent =
    key.mode === "minor"
      ? [scale[0], scale[2], scale[3], scale[4], scale[6]]
      : [scale[0], scale[1], scale[2], scale[4], scale[5]];

  let tip = "";
  if (answers.mood === "bright") {
    tip = "Попробуйте мелодию на 1–3–5 ступенях, с прыжком вверх на припеве.";
  } else if (answers.mood === "dark") {
    tip = "Держитесь ниже тоники и чаще касайтесь b3 / b6 — тень сама появится.";
  } else if (answers.mood === "tense") {
    tip = "Задержитесь на 7-й ступени (или на ноте доминанты) — и только потом разрешите в тонику.";
  } else {
    tip = "Длинные ноты и соседние ступени (секунды). Не спешите к тонике.";
  }

  if (answers.part === "chorus") {
    tip += " В припеве повторите один короткий мотив 2–3 раза.";
  }

  return { notes: pent, scale, tip };
}

function fixKeyLabel(key) {
  if (key.mode === "minor") return `${key.tonic} минор`;
  return `${key.tonic} мажор`;
}

function renderProgress(step, total) {
  const dots = Array.from({ length: total }, (_, i) =>
    `<span class="dot${i < step ? " on" : ""}"></span>`
  ).join("");
  return `<div class="progress" aria-hidden="true">${dots}</div>`;
}

function renderChoices(list, className, mapFn) {
  return `<div class="choices ${className}">${list.map(mapFn).join("")}</div>`;
}

function showStart() {
  brandSub.textContent = "С какого аккорда начинается ваш ход?";
  stage.innerHTML = `
    <div class="panel">
      ${renderProgress(0, 4)}
      <p class="step-label">Шаг 1 из 4</p>
      <h2 class="question">Какой аккорд у вас сейчас под пальцами?</h2>
      <p class="hint">Выберите стартовый. Потом спросим про настроение и куда хотите двигаться.</p>
      ${renderChoices(
        START_CHORDS,
        "chords",
        (c) => `<button type="button" class="choice chord" data-value="${c}">${c}</button>`
      )}
    </div>
  `;
  stage.querySelectorAll("[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.start = btn.dataset.value;
      showMood();
    });
  });
}

function showMood() {
  brandSub.textContent = `Старт: ${state.start}`;
  stage.innerHTML = `
    <div class="panel">
      ${renderProgress(1, 4)}
      <p class="step-label">Шаг 2 из 4</p>
      <h2 class="question">Какое настроение хотите удержать?</h2>
      <p class="hint">Не «правильно», а как ощущается песня.</p>
      ${renderChoices(
        MOODS,
        "moods",
        (m) => `<button type="button" class="choice" data-value="${m.id}">
          <span class="title">${m.title}</span>
          <span class="desc">${m.desc}</span>
        </button>`
      )}
    </div>
  `;
  stage.querySelectorAll("[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mood = btn.dataset.value;
      showMove();
    });
  });
}

function showMove() {
  stage.innerHTML = `
    <div class="panel">
      ${renderProgress(2, 4)}
      <p class="step-label">Шаг 3 из 4</p>
      <h2 class="question">Куда тянет следующий ход?</h2>
      <p class="hint">Это про энергию, не про теорию.</p>
      ${renderChoices(
        MOVES,
        "moods",
        (m) => `<button type="button" class="choice" data-value="${m.id}">
          <span class="title">${m.title}</span>
          <span class="desc">${m.desc}</span>
        </button>`
      )}
    </div>
  `;
  stage.querySelectorAll("[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.move = btn.dataset.value;
      showPart();
    });
  });
}

function showPart() {
  stage.innerHTML = `
    <div class="panel">
      ${renderProgress(3, 4)}
      <p class="step-label">Шаг 4 из 4</p>
      <h2 class="question">Для какой части песни это?</h2>
      <p class="hint">От ответа зависят и гармония, и советы по мелодии.</p>
      ${renderChoices(
        PARTS,
        "moods",
        (m) => `<button type="button" class="choice" data-value="${m.id}">
          <span class="title">${m.title}</span>
          <span class="desc">${m.desc}</span>
        </button>`
      )}
    </div>
  `;
  stage.querySelectorAll("[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.part = btn.dataset.value;
      showResults();
    });
  });
}

function showResults() {
  const answers = { ...state };
  const paths = progressionsFor(answers);
  const mel = melodyFor(answers);
  const key = guessKey(parseChord(answers.start));
  const moodTitle = MOODS.find((m) => m.id === answers.mood)?.title ?? "";
  const moveTitle = MOVES.find((m) => m.id === answers.move)?.title ?? "";
  const partTitle = PARTS.find((m) => m.id === answers.part)?.title ?? "";

  brandSub.textContent = "Вот варианты — берите и пробуйте на грифе";

  const pathBlocks = paths
    .map(
      (p) => `
      <article class="result">
        <p class="result-kind">${p.kind}</p>
        <p class="result-path">${p.path.map((c, i) => (i === 0 ? c : ` → ${c}`)).join("")}</p>
        <p class="result-why">${p.why}</p>
      </article>`
    )
    .join("");

  stage.innerHTML = `
    <div class="panel">
      ${renderProgress(4, 4)}
      <p class="step-label">Варианты</p>
      <h2 class="question">От ${answers.start} можно пойти так</h2>
      <p class="summary">
        <strong>${answers.start}</strong> · ${moodTitle.toLowerCase()} · ${moveTitle.toLowerCase()} · ${partTitle.toLowerCase()}
        <br />Ориентир тональности: <strong>${fixKeyLabel(key)}</strong>
      </p>
      <div class="results">
        ${pathBlocks}
        <article class="result">
          <p class="result-kind">Мелодия</p>
          <p class="result-path">Опорные ноты <span>над этими аккордами</span></p>
          <p class="result-why">${mel.tip}</p>
          <div class="melody-notes" aria-label="Ноты">
            ${mel.notes.map((n) => `<span class="note">${n}</span>`).join("")}
          </div>
        </article>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-primary" id="again">Ещё раз с другим аккордом</button>
        <button type="button" class="btn btn-ghost" id="sameStart">Те же вопросы, тот же старт</button>
      </div>
    </div>
  `;

  document.getElementById("again").addEventListener("click", () => {
    state.start = null;
    state.mood = null;
    state.move = null;
    state.part = null;
    showStart();
  });
  document.getElementById("sameStart").addEventListener("click", () => {
    state.mood = null;
    state.move = null;
    state.part = null;
    showMood();
  });
}

showStart();
