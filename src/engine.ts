import type { GlossMode, Phase, Token } from "./types";

export interface WordState {
  token: Token;
  typed: string;
  hadError: boolean;
  completed: boolean;
}

export interface MissedWord {
  en: string;
  th: string;
  count: number;
}

export interface Session {
  words: WordState[];
  index: number;
  phase: Phase;
  startedAt: number | null;
  durationMs: number;
  incorrectChars: number;
  samples: number[];
  lastSampleSec: number;
  missed: MissedWord[];
  glossMode: GlossMode;
  peekHold: boolean;
  lastInputAt: number | null;
  createdAt: number;
  rejectUntil: number;
  saved: boolean;
  banner: string;
  queue: Token[];
  queuePos: number;
}

const PEEK_IDLE_MS = 800;
const MAX_EXTRA = 24;

export function createSession(queue: Token[], durationSec: number, glossMode: GlossMode, banner = ""): Session {
  const session: Session = {
    words: [],
    index: 0,
    phase: "ready",
    startedAt: null,
    durationMs: durationSec * 1000,
    incorrectChars: 0,
    samples: [],
    lastSampleSec: 0,
    missed: [],
    glossMode,
    peekHold: false,
    lastInputAt: null,
    createdAt: performance.now(),
    rejectUntil: 0,
    saved: false,
    banner,
    queue,
    queuePos: 0,
  };
  fillAhead(session, 80);
  return session;
}

function fillAhead(session: Session, targetAhead: number): void {
  if (session.queue.length === 0) return;
  while (session.words.length < session.index + targetAhead) {
    const token = session.queue[session.queuePos % session.queue.length];
    session.queuePos += 1;
    session.words.push({
      token: { en: token.en, th: token.th, sentenceEnd: token.sentenceEnd, tale: token.tale, scene: token.scene },
      typed: "",
      hadError: false,
      completed: false,
    });
  }
}

export function correctCharCount(session: Session): number {
  let count = 0;
  for (let i = 0; i < session.words.length; i++) {
    const word = session.words[i];
    if (word.completed) {
      count += word.typed === word.token.en ? word.token.en.length + 1 : matchedPrefix(word);
      continue;
    }
    if (i === session.index) count += matchedPrefix(word);
    break;
  }
  return count;
}

export function wpmAt(correct: number, elapsedMs: number): number {
  const minutes = elapsedMs / 60000;
  if (minutes <= 0 || correct <= 0) return 0;
  return correct / 5 / minutes;
}

export function accuracyOf(session: Session): number {
  const correct = correctCharCount(session);
  const total = correct + session.incorrectChars;
  if (total === 0) return 100;
  return (correct / total) * 100;
}

export function remainingMs(session: Session, now: number): number {
  if (session.phase === "ready" || session.startedAt == null) return session.durationMs;
  return Math.max(0, session.durationMs - (now - session.startedAt));
}

export function isPeeking(session: Session, now: number): boolean {
  if (session.glossMode !== "peek") return false;
  if (session.peekHold) return true;
  const since = session.lastInputAt ?? session.createdAt;
  return now - since >= PEEK_IDLE_MS;
}

export type GlossVis = "bright" | "normal" | "dim" | "hidden";

export function glossVis(session: Session, index: number, now: number): GlossVis {
  const current = session.index;
  if (session.glossMode === "peek") {
    if (!isPeeking(session, now)) return "hidden";
    return index === current ? "bright" : "hidden";
  }
  if (session.glossMode === "focus") {
    if (index === current) return "bright";
    if (index === current + 1) return "normal";
    return "dim";
  }
  if (index === current) return "bright";
  if (index < current) return "dim";
  return "normal";
}

function noteMiss(session: Session, word: WordState): void {
  if (!word.hadError) return;
  const found = session.missed.find((item) => item.en === word.token.en && item.th === word.token.th);
  if (found) found.count += 1;
  else session.missed.push({ en: word.token.en, th: word.token.th, count: 1 });
}

function finish(session: Session, now: number): void {
  if (session.phase === "finished") return;
  const word = session.words[session.index];
  if (word && !word.completed) noteMiss(session, word);
  session.phase = "finished";
  const elapsed = session.startedAt == null ? session.durationMs : Math.min(session.durationMs, now - session.startedAt);
  const value = wpmAt(correctCharCount(session), elapsed);
  const slots = Math.round(session.durationMs / 1000);
  while (session.samples.length < slots) session.samples.push(value);
}

function ensureRunning(session: Session, now: number): void {
  if (session.phase === "ready") {
    session.phase = "running";
    session.startedAt = now;
    session.lastSampleSec = 0;
  }
}

export function tick(session: Session, now: number): void {
  if (session.phase !== "running" || session.startedAt == null) return;
  const elapsed = now - session.startedAt;
  if (elapsed >= session.durationMs) {
    finish(session, now);
    return;
  }
  const sec = Math.floor(elapsed / 1000);
  if (sec > session.lastSampleSec) {
    const value = wpmAt(correctCharCount(session), elapsed);
    for (let s = session.lastSampleSec + 1; s <= sec; s++) session.samples.push(value);
    session.lastSampleSec = sec;
  }
}

export function typeChar(session: Session, char: string, now: number): void {
  if (session.phase === "finished") return;
  if (!/^[A-Za-z'-]$/.test(char)) return;
  ensureRunning(session, now);
  session.lastInputAt = now;
  const word = session.words[session.index];
  if (!word) return;
  if (word.typed.length >= word.token.en.length + MAX_EXTRA) return;
  const expected = word.token.en[word.typed.length];
  if (expected !== char) {
    word.hadError = true;
    session.incorrectChars += 1;
  }
  word.typed += char;
}

export function backspace(session: Session, now: number): void {
  if (session.phase === "finished") return;
  const word = session.words[session.index];
  if (!word || word.typed.length === 0) return;
  ensureRunning(session, now);
  session.lastInputAt = now;
  word.typed = word.typed.slice(0, -1);
}

function matchedPrefix(word: WordState): number {
  const { en } = word.token;
  let matched = 0;
  while (matched < word.typed.length && matched < en.length && word.typed[matched] === en[matched]) {
    matched += 1;
  }
  return matched;
}

export function commitWord(session: Session, now: number): boolean {
  if (session.phase === "finished") return false;
  const word = session.words[session.index];
  if (!word) return false;
  ensureRunning(session, now);
  session.lastInputAt = now;
  if (word.typed !== word.token.en) word.hadError = true;
  word.completed = true;
  noteMiss(session, word);
  session.index += 1;
  fillAhead(session, 80);
  return true;
}

export function hasTyped(session: Session): boolean {
  return correctCharCount(session) + session.incorrectChars > 0;
}
