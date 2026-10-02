import { assertContent, drillQueue, sentenceQueue, taleGroups, taleLabel, wordQueue } from "./content";
import {
  accuracyOf,
  backspace,
  skippedChars,
  charStats,
  commitWord,
  consistencyOf,
  correctCharCount,
  createSession,
  glossVis,
  hasTyped,
  isPeeking,
  rawWpm,
  remainingMs,
  slowWords,
  tick,
  typeChar,
  wpmAt,
  type Session,
} from "./engine";
import { sceneView } from "./scenes";
import { addSlow, addWeak, dueTokens, gradeBanks, loadStore, recordBest, recordPractice, saveSettings } from "./storage";
import { LEVELS, type Duration, type GlossMode, type Level, type Store, type TestMode, type Token, type WordCount } from "./types";

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
  if (store.testMode === "weak") return createSession(drillQueue(store.weak), store.duration, store.gloss, "ซ้อมคำอ่อน");
  if (store.testMode === "slow") return createSession(drillQueue(store.slow), store.duration, store.gloss, "ซ้อมคำช้า");
  if (store.testMode === "words") {
    return createSession(wordQueue(store.level), store.duration, store.gloss, "", { timed: false, wordGoal: store.wordCount });
  }
  if (store.testMode === "quote") {
    const groups = taleGroups(store.level);
    const group = groups[Math.min(store.quote, Math.max(groups.length - 1, 0))];
    const tokens = group?.tokens ?? [];
    return createSession(tokens, store.duration, store.gloss, "", { timed: false, wordGoal: tokens.length, noLoop: true });
  }
  return createSession(sentenceQueue(store.level), store.duration, store.gloss);
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

function replaySet(): void {
  const tokens = playedTokens(session);
  if (tokens.length === 0) return;
  const prior = wpmAt(correctCharCount(session), session.durationMs);
  const next = session.timed
    ? createSession(tokens, store.duration, store.gloss)
    : createSession(tokens, store.duration, store.gloss, "", { timed: false, wordGoal: tokens.length, noLoop: true });
  next.priorWpm = prior;
  session = next;
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
  const slow = slowWords(finished);
  if (slow.length > 0) store = addSlow(slow);
  store = gradeBanks(scheduleItems(finished));
  if (!finished.banner) {
    const elapsed = finished.durationMs;
    const limit = store.testMode === "words" ? store.wordCount : store.testMode === "quote" ? store.quote : store.duration;
    const saved = recordBest(store.testMode, store.level, limit, wpmAt(correctCharCount(finished), elapsed), accuracyOf(finished));
    store = saved.store;
    finished.isRecord = saved.isRecord;
    finished.bestWpm = saved.bestWpm;
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

function segment(label: string, buttons: string, slot: string): string {
  return `<div class="control" data-slot="${slot}"><span class="control-label">${label}</span><div class="segment">${buttons}</div></div>`;
}

function glossNote(): string {
  const gloss = store.gloss === "full" ? "คำแปลโชว์ทุกคำ" : store.gloss === "focus" ? "คำแปลชัดแค่คำนี้" : "กด Alt เพื่อดูคำแปล";
  return `${gloss} · ตัวพิมพ์มีผล`;
}

function scheduleItems(finished: Session): { en: string; th: string; correct: boolean }[] {
  const last = new Map<string, { en: string; th: string; correct: boolean }>();
  for (const word of finished.words) {
    if (!word.completed) continue;
    const key = `${word.token.en}\0${word.token.th}`;
    last.set(key, { en: word.token.en, th: word.token.th, correct: word.typed === word.token.en });
  }
  for (const item of finished.missed) {
    const key = `${item.en}\0${item.th}`;
    if (!last.has(key)) last.set(key, { en: item.en, th: item.th, correct: false });
  }
  if (finished.banner === "ทบทวนวันนี้") return [...last.values()];
  return [...last.values()].filter((item) => {
    const banked = store.weak.some((word) => word.en === item.en && word.th === item.th) || store.slow.some((word) => word.en === item.en && word.th === item.th);
    return banked || !item.correct;
  });
}

function playedTokens(finished: Session): Token[] {
  const tokens: Token[] = [];
  for (const word of finished.words) {
    if (!word.completed && word.typed.length === 0) break;
    tokens.push({
      en: word.token.en,
      th: word.token.th,
      sentenceEnd: word.token.sentenceEnd,
      tale: word.token.tale,
      scene: word.token.scene,
    });
  }
  return tokens;
}

function limitButtons(): string {
  if (store.testMode === "words") {
    const counts: WordCount[] = [10, 25, 50, 100];
    return counts.map((count) => btn(`${count}`, store.wordCount === count, `data-count="${count}"`)).join("");
  }
  if (store.testMode === "quote") {
    return taleGroups(store.level)
      .map((group, index) => btn(taleLabel(group.title), store.quote === index, `data-quote="${index}"`))
      .join("");
  }
  const times: Duration[] = [15, 30, 60];
  return times.map((time) => btn(`${time} วิ`, store.duration === time, `data-time="${time}"`)).join("");
}

function limitLabel(): string {
  if (store.testMode === "words") return "จำนวน";
  if (store.testMode === "quote") return "เรื่อง";
  return "เวลา";
}

function renderConfig(): void {
  const glosses: [GlossMode, string][] = [
    ["full", "เห็นทุกคำ"],
    ["focus", "ทีละคำ"],
    ["peek", "ซ่อนไว้"],
  ];
  const modes: [TestMode, string, boolean][] = [
    ["time", "เวลา", false],
    ["words", "คำ", false],
    ["quote", "นิทาน", false],
    ["weak", "ซ้อมคำอ่อน", store.weak.length === 0],
    ["slow", "ซ้อมคำช้า", store.slow.length === 0],
  ];
  const levelOptions = LEVELS.map(
    (level) => `<option value="${level}"${store.level === level ? " selected" : ""}>${level}</option>`,
  ).join("");
  const limit =
    store.testMode === "time" || store.testMode === "words" || store.testMode === "quote"
      ? segment(limitLabel(), limitButtons(), "time")
      : "";
  configEl.innerHTML = [
    `<div class="controls-line">`,
    `<div class="control" data-slot="level"><label class="control-label" for="level">ระดับ</label><div class="segment"><select id="level" class="level-select">${levelOptions}</select></div></div>`,
    segment("โหมด", modes.map(([id, label, disabled]) => btn(label, store.testMode === id, `data-mode="${id}"`, disabled)).join(""), "mode"),
    segment("คำแปล", glosses.map(([id, label]) => btn(label, store.gloss === id, `data-gloss="${id}"`)).join(""), "gloss"),
    limit,
    `</div>`,
    `<p class="control-note">${glossNote()}</p>`,
  ].join("");

  const due = dueTokens(store);
  miniEl.innerHTML = [
    due.length > 0 ? `<button type="button" class="chip btn ghost" id="review">ทบทวนวันนี้ ${due.length}</button>` : "",
    `<span class="chip streak${store.streak === 0 ? " cold" : ""}" aria-label="สตรีค ${store.streak} วัน"><svg class="flame" viewBox="0 0 16 16" aria-hidden="true"><path d="M8.2 1.2c.3 1.8-.2 3-1.1 4-.4-1.3-1.5-2-1.5-2C4.2 4.6 3 6.4 3 8.4 3 11.2 5.2 13.5 8 13.5s5-2.3 5-5.1c0-2.4-1.5-4-2.6-5.2-.2 1.3-1 2.2-1.7 2.6.4-1.6.2-3.3-.5-4.6Z"/></svg>${store.streak}</span>`,
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
    const letters = letterHtml(word.typed, word.token.en, current && session.phase !== "finished", word.completed && word.typed !== word.token.en);
    html.push(
      `<div class="${classes.join(" ")}"><div class="gloss" data-vis="${vis}">${esc(word.token.th)}</div><div class="letters" lang="en">${letters}</div></div>`,
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

function niceScale(peak: number, roughStep: number): { max: number; step: number } {
  const step = roughStep;
  const max = Math.max(step, Math.ceil(Math.max(peak, 1) / step) * step);
  return { max, step };
}

function chartHtml(pace: { wpm: number; raw: number; errors: number }[], average: number): string {
  if (pace.length === 0) return "";
  const width = 760;
  const height = 228;
  const left = 78;
  const right = 46;
  const top = 12;
  const bottom = 26;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const seconds = pace.length;
  const wpmPeak = Math.max(average, ...pace.map((point) => Math.max(point.wpm, point.raw)));
  const wpmScale = niceScale(wpmPeak, wpmPeak <= 40 ? 10 : wpmPeak <= 100 ? 20 : 40);
  const errorPeak = Math.max(0, ...pace.map((point) => point.errors));
  const errorScale = errorPeak <= 4 ? { max: 4, step: 1 } : errorPeak <= 8 ? { max: 8, step: 2 } : niceScale(errorPeak, errorPeak <= 16 ? 4 : 8);
  const xAt = (sec: number) => left + (sec / seconds) * plotW;
  const yAt = (value: number, scale: number) => top + plotH - (value / scale) * plotH;
  const xLabelStep = seconds <= 30 ? 1 : seconds <= 60 ? 2 : 5;
  const line = (key: "wpm" | "raw") =>
    pace.map((point, index) => `${xAt(index + 1).toFixed(1)},${yAt(point[key], wpmScale.max).toFixed(1)}`).join(" ");
  const grids: string[] = [];
  for (let value = 0; value <= wpmScale.max; value += wpmScale.step) {
    const y = yAt(value, wpmScale.max);
    grids.push(`<line class="pace-grid" x1="${left}" y1="${y.toFixed(1)}" x2="${left + plotW}" y2="${y.toFixed(1)}" />`);
    grids.push(`<text class="pace-tick" x="${left - 8}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${value}</text>`);
  }
  for (let value = 0; value <= errorScale.max; value += errorScale.step) {
    const y = yAt(value, errorScale.max);
    grids.push(`<text class="pace-tick" x="${left + plotW + 8}" y="${y.toFixed(1)}" text-anchor="start" dominant-baseline="middle">${value}</text>`);
  }
  for (let sec = 0; sec <= seconds; sec++) {
    const x = xAt(sec);
    grids.push(`<line class="pace-grid${sec % xLabelStep === 0 ? "" : " faint"}" x1="${x.toFixed(1)}" y1="${top}" x2="${x.toFixed(1)}" y2="${top + plotH}" />`);
    if (sec % xLabelStep === 0) {
      grids.push(`<text class="pace-tick" x="${x.toFixed(1)}" y="${top + plotH + 16}" text-anchor="middle">${sec}</text>`);
    }
  }
  const dots = pace
    .map(
      (point, index) =>
        `<circle class="pace-dot" data-sec="${index + 1}" data-wpm="${Math.round(point.wpm)}" data-raw="${Math.round(point.raw)}" data-errors="${point.errors}" cx="${xAt(index + 1).toFixed(1)}" cy="${yAt(point.wpm, wpmScale.max).toFixed(1)}" r="2.4" />`,
    )
    .join("");
  const errors = pace
    .map((point, index) => {
      if (point.errors <= 0) return "";
      const x = xAt(index + 1);
      const y = yAt(point.errors, errorScale.max);
      return `<rect class="pace-err" x="${(x - 3).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="6" height="6" />`;
    })
    .join("");
  const avgY = yAt(Math.max(0, average), wpmScale.max);
  const errorTotal = pace.reduce((sum, point) => sum + point.errors, 0);
  return `
    <div class="pace-legend">
      <span><i class="swatch wpm"></i>ความเร็ว</span>
      <span><i class="swatch raw"></i>ความเร็วดิบ</span>
      <span><i class="swatch avg"></i>เฉลี่ย</span>
      <span><i class="swatch err"></i>ผิด</span>
    </div>
    <div class="pace-frame">
      <svg class="pace" viewBox="0 0 ${width} ${height}" role="img" aria-label="ความเร็วรายวินาที สูงสุด ${Math.round(wpmPeak)} คำต่อนาที ผิด ${errorTotal} ครั้ง">
        <text class="pace-name" text-anchor="middle" transform="translate(16 ${top + plotH / 2}) rotate(-90)">คำต่อนาที</text>
        <text class="pace-name" text-anchor="middle" transform="translate(${width - 14} ${top + plotH / 2}) rotate(90)">ผิด</text>
        ${grids.join("")}
        <line class="pace-avg" x1="${left}" y1="${avgY.toFixed(1)}" x2="${left + plotW}" y2="${avgY.toFixed(1)}" />
        <polyline class="pace-raw" points="${line("raw")}" />
        <polyline class="pace-wpm" points="${line("wpm")}" />
        ${dots}
        ${errors}
        <line class="pace-guide" x1="0" y1="${top}" x2="0" y2="${top + plotH}" hidden />
        <circle class="pace-hover" r="5" cx="0" cy="0" hidden />
        <rect class="pace-hit" x="${left}" y="${top}" width="${plotW}" height="${plotH}" />
      </svg>
      <div class="pace-tip" hidden></div>
    </div>
  `;
}

function bindChartHover(): void {
  const svg = resultsEl.querySelector<SVGSVGElement>(".pace");
  const tip = resultsEl.querySelector<HTMLElement>(".pace-tip");
  const guide = resultsEl.querySelector<SVGLineElement>(".pace-guide");
  const hover = resultsEl.querySelector<SVGCircleElement>(".pace-hover");
  const hit = svg?.querySelector(".pace-hit");
  if (!svg || !tip || !guide || !hover || !hit) return;
  const dots = [...svg.querySelectorAll<SVGCircleElement>(".pace-dot")].map((dot) => ({
    x: Number(dot.getAttribute("cx") ?? 0),
    y: Number(dot.getAttribute("cy") ?? 0),
    wpm: dot.dataset.wpm ?? "0",
    raw: dot.dataset.raw ?? "0",
    errors: dot.dataset.errors ?? "0",
  }));
  if (dots.length === 0) return;
  const plotLeft = Number(hit.getAttribute("x") ?? 78);
  const plotWidth = Number(hit.getAttribute("width") ?? 636);
  const from = { x: dots[0].x, y: dots[0].y };
  const to = { x: from.x, y: from.y };
  const origin = { x: from.x, y: from.y };
  let startedAt = 0;
  let raf = 0;
  let visible = false;
  let lastSec = -1;
  const glideMs = 420;

  const place = (x: number, y: number) => {
    const text = x.toFixed(1);
    guide.setAttribute("x1", text);
    guide.setAttribute("x2", text);
    hover.setAttribute("cx", text);
    hover.setAttribute("cy", y.toFixed(1));
    const viewW = svg.viewBox.baseVal.width || 760;
    const viewH = svg.viewBox.baseVal.height || 228;
    const rect = svg.getBoundingClientRect();
    const px = (x / viewW) * rect.width;
    const py = (y / viewH) * rect.height;
    const gap = 8;
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    let left = px - tipW - gap;
    if (left < 0) left = px + gap;
    left = Math.max(0, Math.min(left, rect.width - tipW));
    const top = Math.max(0, Math.min(py - tipH / 2, rect.height - tipH));
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };

  const step = (now: number) => {
    const t = Math.min(1, (now - startedAt) / glideMs);
    const eased = 1 - (1 - t) ** 3;
    from.x = origin.x + (to.x - origin.x) * eased;
    from.y = origin.y + (to.y - origin.y) * eased;
    place(from.x, from.y);
    if (t < 1) raf = requestAnimationFrame(step);
    else raf = 0;
  };

  const glideTo = (x: number, y: number) => {
    origin.x = from.x;
    origin.y = from.y;
    to.x = x;
    to.y = y;
    startedAt = performance.now();
    if (!raf) raf = requestAnimationFrame(step);
  };

  const hide = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    lastSec = -1;
    tip.hidden = true;
    guide.setAttribute("hidden", "");
    hover.setAttribute("hidden", "");
  };

  const show = (clientX: number) => {
    const rect = svg.getBoundingClientRect();
    const viewW = svg.viewBox.baseVal.width || 760;
    const viewX = ((clientX - rect.left) / rect.width) * viewW;
    if (viewX < plotLeft || viewX > plotLeft + plotWidth) {
      hide();
      return;
    }
    const along = ((viewX - plotLeft) / plotWidth) * dots.length;
    const sec = Math.min(dots.length, Math.max(1, Math.round(along)));
    const point = dots[sec - 1];
    if (!visible) {
      from.x = point.x;
      from.y = point.y;
      to.x = point.x;
      to.y = point.y;
      visible = true;
      lastSec = sec;
      guide.removeAttribute("hidden");
      hover.removeAttribute("hidden");
      tip.hidden = false;
      tip.innerHTML = `<p class="pace-tip-time">วินาทีที่ ${sec}</p><p>ความเร็ว <strong>${point.wpm}</strong></p><p>ความเร็วดิบ <strong>${point.raw}</strong></p><p class="pace-tip-err">ผิด <strong>${point.errors}</strong></p>`;
      place(from.x, from.y);
      return;
    }
    if (sec === lastSec) return;
    lastSec = sec;
    tip.innerHTML = `<p class="pace-tip-time">วินาทีที่ ${sec}</p><p>ความเร็ว <strong>${point.wpm}</strong></p><p>ความเร็วดิบ <strong>${point.raw}</strong></p><p class="pace-tip-err">ผิด <strong>${point.errors}</strong></p>`;
    glideTo(point.x, point.y);
  };

  svg.addEventListener("pointermove", (event) => show(event.clientX));
  svg.addEventListener("pointerleave", hide);
}

function renderResults(): void {
  const elapsed = session.durationMs;
  const wpm = wpmAt(correctCharCount(session), elapsed);
  const acc = accuracyOf(session);
  const chars = charStats(session);
  const skipped = skippedChars(session);
  const slow = slowWords(session);
  const recap = recapHtml();
  const misses = session.missed
    .map(
      (item) =>
        `<li><span class="en">${esc(item.en)}</span><span aria-hidden="true">·</span><span class="th">${esc(item.th)}</span>${item.count > 1 ? `<span class="times">${item.count}</span>` : ""}</li>`,
    )
    .join("");
  const record =
    session.bestWpm > 0
      ? `<p class="${session.isRecord ? "record-line" : "char-line"}">${session.isRecord ? "สถิติใหม่" : "สถิติสูงสุด"} ${Math.round(session.bestWpm)} คำต่อนาที</p>`
      : "";
  const prior =
    session.priorWpm > 0
      ? `<p class="${wpm > session.priorWpm ? "record-line" : "char-line"}">${wpm > session.priorWpm ? "เร็วกว่าชุดเดิม" : "ชุดเดิมครั้งก่อน"} ${Math.round(session.priorWpm)} คำต่อนาที</p>`
      : "";
  const same = playedTokens(session);
  resultsEl.innerHTML = `
    <div class="result-grid">
      <article class="stat"><span>ความเร็ว</span><strong>${Math.round(wpm)}</strong><small>คำต่อนาที</small></article>
      <article class="stat"><span>ความแม่น</span><strong>${acc.toFixed(0)}%</strong><small>ตัวที่ข้ามนับเป็นผิด</small></article>
      <article class="stat"><span>สตรีค</span><strong>${store.streak}</strong><small>วันติดกัน</small></article>
    </div>
    ${record}
    ${prior}
    <div class="chart-wrap">${chartHtml(session.pace, wpm)}</div>
    <p class="stat-strip"><span>ความเร็วดิบ <strong>${Math.round(rawWpm(session, elapsed))}</strong></span><span>สม่ำเสมอ <strong>${Math.round(consistencyOf(session.samples))}%</strong></span><span>ถูก <strong>${chars.correct}</strong> · ผิด <strong>${chars.incorrect}</strong> · เกิน <strong>${chars.extra}</strong>${skipped > 0 ? ` · ข้าม <strong>${skipped}</strong>` : ""}</span></p>
    ${recap}
    ${
      session.missed.length
        ? `<div><p class="miss-title">คำที่ยังไม่คล่อง ${session.missed.length}</p><ul class="missed">${misses}</ul></div>`
        : `<p class="clean">รอบนี้ไม่มีคำผิด</p>`
    }
    <div class="result-actions">
      <button type="button" class="btn primary" id="again">เล่นอีกรอบ</button>
      ${same.length ? `<button type="button" class="btn ghost" id="same-set">ชุดเดิมอีกครั้ง</button>` : ""}
      ${session.missed.length ? `<button type="button" class="btn ghost" id="drill">ซ้อมเฉพาะคำที่พลาด</button>` : ""}
      ${slow.length ? `<button type="button" class="btn ghost" id="slow-drill">ซ้อมคำที่ช้า</button>` : ""}
    </div>
  `;
  bindChartHover();
}

function recapHtml(): string {
  const items: string[] = [];
  for (const word of session.words) {
    if (!word.completed && word.typed.length === 0) break;
    const miss = word.typed !== word.token.en;
    const end = word.token.sentenceEnd ? " end" : "";
    items.push(
      `<span class="recap-word${miss ? " miss" : ""}${end}"><span class="th">${esc(word.token.th)}</span><span class="en">${esc(word.token.en)}</span></span>`,
    );
  }
  if (items.length === 0) return "";
  return `<div class="recap"><p class="miss-title">คำในรอบนี้</p><div class="recap-words">${items.join("")}</div></div>`;
}

function updateMeter(now: number): void {
  const finished = session.phase === "finished";
  meterEl.hidden = finished;
  if (finished) return;
  const elapsed = session.startedAt == null ? 0 : now - session.startedAt;
  const wpm = session.phase === "running" && elapsed >= 1000 ? ` · ${Math.round(wpmAt(correctCharCount(session), elapsed))} คำต่อนาที` : "";
  if (!session.timed && session.wordGoal > 0) {
    const left = Math.max(0, session.wordGoal - session.index);
    const ratio = session.phase === "ready" ? 1 : left / session.wordGoal;
    meterFill.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    liveEl.textContent = session.phase === "running" ? `เหลือ ${left} คำ${wpm}` : "พิมพ์ตัวแรกเพื่อเริ่ม";
    return;
  }
  const ratio = session.phase === "ready" ? 1 : remainingMs(session, now) / session.durationMs;
  meterFill.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  if (session.phase === "running" && session.startedAt != null) {
    const secs = Math.ceil(remainingMs(session, now) / 1000);
    liveEl.textContent = `เหลือ ${secs} วินาที${wpm}`;
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
    const notes: string[] = [];
    if (session.missed.length) notes.push("คำที่พลาดถูกเก็บไว้ในคลังคำอ่อนแล้ว");
    if (slowWords(session).length) notes.push("คำที่ช้าถูกเก็บไว้แล้ว");
    hintEl.textContent = notes.length ? notes.join(" · ") : "รอบนี้พิมพ์ได้ครบ ไม่มีคำผิด";
    return;
  }
  hintEl.textContent = "เว้นวรรคไปคำถัดไป · Tab เริ่มรอบใหม่";
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
  if (event.key === "Escape" || event.key === "Tab") {
    event.preventDefault();
    restart();
    focusCatcher();
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
    if (event.repeat) return;
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
  const mode = target.dataset.mode as TestMode | undefined;
  const time = target.dataset.time;
  const count = target.dataset.count;
  const quote = target.dataset.quote;
  const gloss = target.dataset.gloss as GlossMode | undefined;
  if (mode && !target.disabled && mode !== store.testMode) {
    store = saveSettings(store.duration, store.gloss, mode, store.level, store.wordCount, store.quote);
    restart();
    return;
  }
  if (time) {
    const duration = Number(time) as Duration;
    if (duration !== store.duration) {
      store = saveSettings(duration, store.gloss, store.testMode, store.level, store.wordCount, store.quote);
      restart();
    } else focusCatcher();
    return;
  }
  if (count) {
    const wordCount = Number(count) as WordCount;
    if (wordCount !== store.wordCount) {
      store = saveSettings(store.duration, store.gloss, store.testMode, store.level, wordCount, store.quote);
      restart();
    } else focusCatcher();
    return;
  }
  if (quote) {
    const index = Number(quote);
    if (index !== store.quote) {
      store = saveSettings(store.duration, store.gloss, store.testMode, store.level, store.wordCount, index);
      restart();
    } else focusCatcher();
    return;
  }
  if (gloss && gloss !== store.gloss) {
    store = saveSettings(store.duration, gloss, store.testMode, store.level, store.wordCount, store.quote);
    session.glossMode = gloss;
    render();
  }
  focusCatcher();
});

configEl.addEventListener("change", (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== "level") return;
  const level = select.value as Level;
  if (!(LEVELS as readonly string[]).includes(level) || level === store.level) {
    focusCatcher();
    return;
  }
  store = saveSettings(store.duration, store.gloss, store.testMode, level, store.wordCount, store.quote);
  restart();
});

miniEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!target) return;
  if (target.id === "review") beginDrill(dueTokens(store), "ทบทวนวันนี้");
});

document.querySelector("#restart")!.addEventListener("click", () => restart());

resultsEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!target) return;
  if (target.id === "again") restart();
  if (target.id === "same-set") replaySet();
  if (target.id === "drill") {
    beginDrill(
      session.missed.map((item) => ({ en: item.en, th: item.th })),
      "ซ้อมคำที่พลาด",
    );
  }
  if (target.id === "slow-drill") beginDrill(slowWords(session), "ซ้อมคำช้า");
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
