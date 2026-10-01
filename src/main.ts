import { assertContent, drillQueue, sentenceQueue, taleQueue, wordQueue } from "./content";
import {
  accuracyOf,
  backspace,
  commitWord,
  correctCharCount,
  createSession,
  glossVis,
  hasTyped,
  isPeeking,
  remainingMs,
  tick,
  typeChar,
  wpmAt,
  type Session,
} from "./engine";
import { sceneView } from "./scenes";
import { addWeak, loadStore, recordPractice, saveSettings } from "./storage";
import type { Duration, GlossMode, SourceMode, Store, Token } from "./types";

assertContent();

const configEl = document.querySelector<HTMLElement>("#config")!;
const miniEl = document.querySelector<HTMLElement>("#mini")!;
const bannerEl = document.querySelector<HTMLElement>("#banner")!;
const warnEl = document.querySelector<HTMLElement>("#warn")!;
const liveEl = document.querySelector<HTMLElement>("#live")!;
const sceneEl = document.querySelector<HTMLElement>("#scene")!;
const maskEl = document.querySelector<HTMLElement>("#mask")!;
const wordsEl = document.querySelector<HTMLElement>("#words")!;
const resultsEl = document.querySelector<HTMLElement>("#results")!;
const hintEl = document.querySelector<HTMLElement>("#hint")!;
const catcher = document.querySelector<HTMLInputElement>("#catcher")!;
const meterEl = document.querySelector<HTMLElement>("#meter")!;
const meterFill = document.querySelector<HTMLElement>("#meter-fill")!;
const caretEl = document.createElement("span");
caretEl.className = "slide-caret no-move";
caretEl.hidden = true;
maskEl.appendChild(caretEl);
let caretReady = false;

let store: Store = loadStore();
let session: Session = beginQueue();
let warnTimer = 0;
let lastPeek = false;
let lastSecond = -1;
let handledAt = 0;

function beginQueue(): Session {
  const queue = store.source === "words" ? wordQueue() : store.source === "tales" ? taleQueue() : sentenceQueue();
  return createSession(queue, store.duration, store.gloss);
}

function beginDrill(tokens: Token[], banner: string): void {
  session = createSession(drillQueue(tokens), store.duration, store.gloss, banner);
  render();
  focusCatcher();
}

function restart(): void {
  session = beginQueue();
  render();
  focusCatcher();
}

function persist(finished: Session): void {
  if (finished.saved) return;
  finished.saved = true;
  if (!hasTyped(finished)) return;
  if (finished.missed.length > 0) {
    const tokens = finished.missed.flatMap((item) =>
      Array.from({ length: item.count }, () => ({ en: item.en, th: item.th })),
    );
    store = addWeak(tokens);
  }
  store = recordPractice();
}

function focusCatcher(): void {
  catcher.focus({ preventScroll: true });
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function btn(label: string, active: boolean, attrs: string, disabled = false): string {
  return `<button type="button" class="text-btn${active ? " active" : ""}" ${attrs}${disabled ? " disabled" : ""}>${label}</button>`;
}

function segment(label: string, buttons: string): string {
  return `<div class="control"><span class="control-label">${label}</span><div class="segment">${buttons}</div></div>`;
}

function renderConfig(): void {
  const times: Duration[] = [15, 30, 60];
  const glosses: [GlossMode, string][] = [
    ["full", "เห็นทุกคำ"],
    ["focus", "ทีละคำ"],
    ["peek", "ซ่อนไว้"],
  ];
  const sources: [SourceMode, string][] = [
    ["sentences", "ประโยค"],
    ["words", "คำเดี่ยว"],
    ["tales", "นิทาน"],
  ];
  configEl.innerHTML = [
    segment("โหมด", sources.map(([id, label]) => btn(label, store.source === id, `data-source="${id}"`)).join("")),
    segment("เวลา", times.map((time) => btn(`${time} วิ`, store.duration === time, `data-time="${time}"`)).join("")),
    segment("คำแปล", glosses.map(([id, label]) => btn(label, store.gloss === id, `data-gloss="${id}"`)).join("")),
    `<span class="level-pill">ระดับ A1</span>`,
  ].join("");

  const weakDisabled = store.weak.length === 0;
  miniEl.innerHTML = [
    `<span class="chip quiet">สตรีค ${store.streak} วัน</span>`,
    `<button type="button" class="chip" id="weak"${weakDisabled ? " disabled" : ""}>ซ้อมคำอ่อน ${store.weak.length}</button>`,
  ].join("");
}

function letterHtml(wordTyped: string, expected: string, showCaret: boolean, missed = false): string {
  const parts: string[] = [];
  const extra = wordTyped.slice(expected.length);
  for (let i = 0; i < expected.length; i++) {
    const typedHere = i < wordTyped.length;
    const wrong = (typedHere && wordTyped[i] !== expected[i]) || (missed && !typedHere);
    const state = wrong ? "incorrect" : typedHere ? "correct" : "pending";
    const filled = wordTyped.length >= expected.length;
    const next = showCaret && extra.length === 0 && (i === wordTyped.length || (filled && i === expected.length - 1));
    parts.push(`<span class="letter ${state}${next ? " next" : ""}">${esc(expected[i])}</span>`);
  }
  for (let i = 0; i < extra.length; i++) {
    const next = showCaret && i === extra.length - 1;
    parts.push(`<span class="letter extra${next ? " next" : ""}">${esc(extra[i])}</span>`);
  }
  return parts.join("");
}

function renderWords(now: number): void {
  const html: string[] = [];
  for (let i = 0; i < session.words.length; i++) {
    const word = session.words[i];
    const current = i === session.index;
    const classes = ["word"];
    if (current) classes.push("current");
    else if (word.completed) classes.push("done");
    else classes.push("next");
    if (word.token.sentenceEnd) classes.push("end");
    if (current && now < session.rejectUntil) classes.push("reject");
    const vis = glossVis(session, i, now);
    html.push(
      `<div class="${classes.join(" ")}"><div class="gloss" data-vis="${vis}">${esc(word.token.th)}</div><div class="letters" lang="en">${letterHtml(word.typed, word.token.en, current && session.phase !== "finished", word.completed && word.typed !== word.token.en)}</div></div>`,
    );
  }
  wordsEl.innerHTML = html.join("");
  const currentEl = wordsEl.querySelector<HTMLElement>(".word.current");
  if (currentEl) {
    const rowTop = currentEl.offsetTop;
    for (const word of wordsEl.querySelectorAll<HTMLElement>(".word")) {
      word.classList.toggle("later", word.offsetTop > rowTop + 2);
    }
  }
  wordsEl.style.transform = currentEl ? `translateY(-${currentEl.offsetTop}px)` : "";
  placeCaret();
}

function placeCaret(): void {
  const letter = wordsEl.querySelector<HTMLElement>(".letter.next");
  if (!letter) {
    caretEl.hidden = true;
    return;
  }
  caretEl.hidden = false;
  const shift = Number(/translateY\((-?[\d.]+)px\)/.exec(wordsEl.style.transform)?.[1] ?? 0);
  const x = letter.offsetLeft;
  const y = letter.offsetTop + letter.offsetHeight - 3 + shift;
  if (!caretReady) caretEl.classList.add("no-move");
  caretEl.style.width = `${letter.offsetWidth}px`;
  caretEl.style.transform = `translate(${x}px, ${y}px)`;
  if (!caretReady) {
    requestAnimationFrame(() => {
      caretEl.classList.remove("no-move");
      caretReady = true;
    });
  }
}

function chartSvg(samples: number[]): string {
  if (samples.length === 0) return "";
  const width = 460;
  const height = 72;
  const max = Math.max(20, ...samples);
  const step = samples.length === 1 ? 0 : width / (samples.length - 1);
  const points = samples
    .map((value, index) => {
      const x = index * step;
      const y = height - 6 - (value / max) * (height - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" /></svg>`;
}

function renderResults(): void {
  const elapsed = session.durationMs;
  const wpm = wpmAt(correctCharCount(session), elapsed);
  const acc = accuracyOf(session);
  const misses = session.missed
    .map(
      (item) =>
        `<li><span class="en">${esc(item.en)}</span><span aria-hidden="true">·</span><span class="th">${esc(item.th)}</span>${item.count > 1 ? `<span class="times">${item.count}</span>` : ""}</li>`,
    )
    .join("");
  resultsEl.innerHTML = `
    <div class="result-grid">
      <article class="stat"><span>ความเร็ว</span><strong>${Math.round(wpm)}</strong><small>คำต่อนาที</small></article>
      <article class="stat"><span>ความแม่น</span><strong>${acc.toFixed(0)}%</strong><small>จากปุ่มที่กดถูก</small></article>
      <article class="stat"><span>สตรีค</span><strong>${store.streak}</strong><small>วันติดกัน</small></article>
    </div>
    <div class="chart-wrap">${chartSvg(session.samples)}</div>
    ${
      session.missed.length
        ? `<div><p class="miss-title">คำที่ยังไม่คล่อง ${session.missed.length}</p><ul class="missed">${misses}</ul></div>`
        : `<p class="clean">รอบนี้ไม่มีคำผิด</p>`
    }
    <div class="result-actions">
      <button type="button" class="btn primary" id="again">เล่นอีกรอบ</button>
      ${session.missed.length ? `<button type="button" class="btn ghost" id="drill">ซ้อมเฉพาะคำที่พลาด</button>` : ""}
    </div>
  `;
}

function updateMeter(now: number): void {
  const finished = session.phase === "finished";
  meterEl.hidden = finished;
  if (finished) return;
  const ratio = session.phase === "ready" ? 1 : remainingMs(session, now) / session.durationMs;
  meterFill.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  if (session.phase === "running") {
    const secs = Math.ceil(remainingMs(session, now) / 1000);
    liveEl.textContent = `เหลือ ${secs} วินาที`;
  } else {
    liveEl.textContent = "พิมพ์ตัวแรกเพื่อเริ่มจับเวลา";
  }
}

function renderScene(finished: boolean): void {
  const scene = finished ? "" : (session.words[session.index]?.token.scene ?? "");
  document.body.classList.toggle("has-scene", scene.length > 0);
  if (!scene) {
    sceneEl.hidden = true;
    sceneEl.dataset.scene = "";
    return;
  }
  const view = sceneView(scene);
  if (!view) {
    sceneEl.hidden = true;
    sceneEl.dataset.scene = "";
    document.body.classList.remove("has-scene");
    return;
  }
  sceneEl.hidden = false;
  if (sceneEl.dataset.scene === scene) return;
  sceneEl.dataset.scene = scene;
  sceneEl.innerHTML = `<img src="${view.src}" alt="${esc(view.label)}">`;
  sceneEl.classList.remove("swap");
  void sceneEl.offsetWidth;
  sceneEl.classList.add("swap");
}

function render(): void {
  const now = performance.now();
  if (session.phase === "finished") persist(session);
  const finished = session.phase === "finished";
  document.body.classList.toggle("running", session.phase === "running");
  document.body.classList.toggle("finished", finished);
  renderConfig();
  const tale = session.words[session.index]?.token.tale ?? "";
  const banner = session.banner || tale;
  bannerEl.hidden = banner.length === 0 || finished;
  bannerEl.textContent = banner;
  renderScene(finished);
  maskEl.hidden = finished;
  resultsEl.hidden = !finished;
  if (finished) {
    renderResults();
  } else {
    renderWords(now);
    resultsEl.innerHTML = "";
  }
  updateMeter(now);
  if (finished) {
    hintEl.textContent = session.missed.length
      ? "คำที่พลาดถูกเก็บไว้ในคลังคำอ่อนแล้ว"
      : "รอบนี้พิมพ์ได้ครบ ไม่มีคำผิด";
    return;
  }
  const glossHint =
    store.gloss === "full"
      ? "คำแปลโชว์ทุกคำ"
      : store.gloss === "focus"
        ? "คำแปลชัดแค่คำที่กำลังพิมพ์กับคำถัดไป"
        : "คำแปลซ่อนอยู่ กด Alt ค้างหรือหยุดพิมพ์ครู่หนึ่งเพื่อดู";
  hintEl.textContent = `${glossHint} · กดเว้นวรรคเพื่อไปคำถัดไป · ตัวพิมพ์เล็กใหญ่มีผล`;
}

function showThaiWarning(): void {
  warnEl.hidden = false;
  window.clearTimeout(warnTimer);
  warnTimer = window.setTimeout(() => {
    warnEl.hidden = true;
  }, 1600);
}

function afterInput(now: number): void {
  if (session.phase === "finished") persist(session);
  if (now < session.rejectUntil) {
    window.setTimeout(render, session.rejectUntil - now + 20);
  }
  render();
}

function markHandled(): void {
  handledAt = performance.now();
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === "Alt") {
    event.preventDefault();
    session.peekHold = true;
    focusCatcher();
    render();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    restart();
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === "Backspace") {
    event.preventDefault();
    markHandled();
    const now = performance.now();
    backspace(session, now);
    afterInput(now);
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    markHandled();
    const now = performance.now();
    commitWord(session, now);
    afterInput(now);
    return;
  }
  if (event.key.length === 1) {
    event.preventDefault();
    markHandled();
    if (/[\u0E00-\u0E7F]/.test(event.key)) {
      showThaiWarning();
      return;
    }
    const now = performance.now();
    typeChar(session, event.key, now);
    afterInput(now);
  }
}

function onBeforeInput(event: InputEvent): void {
  if (event.defaultPrevented || performance.now() - handledAt < 40) return;
  if (event.inputType === "insertText" && event.data) {
    event.preventDefault();
    if (/[\u0E00-\u0E7F]/.test(event.data)) {
      showThaiWarning();
      return;
    }
    const now = performance.now();
    for (const char of event.data) {
      if (char === " ") commitWord(session, now);
      else typeChar(session, char, now);
    }
    afterInput(now);
    return;
  }
  if (event.inputType === "deleteContentBackward") {
    event.preventDefault();
    const now = performance.now();
    backspace(session, now);
    afterInput(now);
  }
}

configEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!target) return;
  const source = target.dataset.source as SourceMode | undefined;
  const time = target.dataset.time;
  const gloss = target.dataset.gloss as GlossMode | undefined;
  if (source && source !== store.source) {
    store = saveSettings(store.duration, store.gloss, source);
    restart();
    return;
  }
  if (time) {
    const duration = Number(time) as Duration;
    if (duration !== store.duration) {
      store = saveSettings(duration, store.gloss, store.source);
      restart();
    } else focusCatcher();
    return;
  }
  if (gloss && gloss !== store.gloss) {
    store = saveSettings(store.duration, gloss, store.source);
    session.glossMode = gloss;
    render();
  }
  focusCatcher();
});

miniEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("#weak");
  if (!target || store.weak.length === 0) return;
  beginDrill(store.weak, "ซ้อมคำอ่อน");
});

document.querySelector("#restart")!.addEventListener("click", () => restart());

resultsEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!target) return;
  if (target.id === "again") restart();
  if (target.id === "drill") {
    beginDrill(
      session.missed.map((item) => ({ en: item.en, th: item.th })),
      "ซ้อมคำที่พลาด",
    );
  }
});

window.addEventListener("keydown", onKeyDown, true);
window.addEventListener("keyup", (event) => {
  if (event.key === "Alt") {
    event.preventDefault();
    session.peekHold = false;
    focusCatcher();
    render();
  }
}, true);
catcher.addEventListener("beforeinput", onBeforeInput);
document.addEventListener("pointerdown", (event) => {
  const target = event.target as HTMLElement;
  if (target.closest("button")) return;
  focusCatcher();
});
window.addEventListener("blur", () => {
  session.peekHold = false;
});

setInterval(() => {
  const before = session.phase;
  const now = performance.now();
  tick(session, now);
  updateMeter(now);
  const finishedNow = session.phase === "finished" && before !== "finished";
  const peekChanged = store.gloss === "peek" && isPeeking(session, now) !== lastPeek;
  const second = Math.ceil(remainingMs(session, now) / 1000);
  if (finishedNow || peekChanged || (session.phase === "running" && second !== lastSecond)) {
    lastPeek = isPeeking(session, now);
    lastSecond = second;
    render();
  }
}, 100);

render();
focusCatcher();
