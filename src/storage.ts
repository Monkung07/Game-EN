import { LEVELS, type Best, type Duration, type GlossMode, type Level, type SourceMode, type Store, type Token, type WeakWord } from "./types";

const KEY = "typegloss";

const defaults: Store = {
  streak: 0,
  lastDay: "",
  weak: [],
  slow: [],
  bests: {},
  duration: 30,
  gloss: "focus",
  source: "sentences",
  level: "A1",
};

function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayKey(date);
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastDay: typeof parsed.lastDay === "string" ? parsed.lastDay : "",
      weak: Array.isArray(parsed.weak) ? parsed.weak.filter(isWeak) : [],
      slow: Array.isArray(parsed.slow) ? parsed.slow.filter(isWeak) : [],
      bests: readBests(parsed.bests),
      duration: parsed.duration === 15 || parsed.duration === 30 || parsed.duration === 60 ? parsed.duration : 30,
      gloss: parsed.gloss === "full" || parsed.gloss === "focus" || parsed.gloss === "peek" ? parsed.gloss : "focus",
      source: parsed.source === "words" || parsed.source === "sentences" || parsed.source === "tales" ? parsed.source : "sentences",
      level: typeof parsed.level === "string" && (LEVELS as readonly string[]).includes(parsed.level) ? (parsed.level as Level) : "A1",
    };
  } catch {
    return freshStore();
  }
}

function freshStore(): Store {
  return { ...defaults, weak: [], slow: [], bests: {} };
}

function readBests(value: unknown): Record<string, Best> {
  if (!value || typeof value !== "object") return {};
  const bests: Record<string, Best> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!item || typeof item !== "object") continue;
    const best = item as Best;
    if (typeof best.wpm === "number" && typeof best.acc === "number") bests[key] = { wpm: best.wpm, acc: best.acc };
  }
  return bests;
}

function isWeak(value: unknown): value is WeakWord {
  if (!value || typeof value !== "object") return false;
  const word = value as WeakWord;
  return typeof word.en === "string" && typeof word.th === "string" && typeof word.count === "number";
}

export function saveStore(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function saveSettings(duration: Duration, gloss: GlossMode, source: SourceMode, level: Level): Store {
  const store = loadStore();
  store.duration = duration;
  store.gloss = gloss;
  store.source = source;
  store.level = level;
  saveStore(store);
  return store;
}

export function recordPractice(): Store {
  const store = loadStore();
  const today = dayKey();
  if (store.lastDay === today) return store;
  store.streak = store.lastDay === yesterdayKey() ? store.streak + 1 : 1;
  store.lastDay = today;
  saveStore(store);
  return store;
}

export function addWeak(tokens: Token[]): Store {
  const store = loadStore();
  pushWords(store.weak, tokens);
  saveStore(store);
  return store;
}

export function addSlow(tokens: Token[]): Store {
  const store = loadStore();
  pushWords(store.slow, tokens);
  saveStore(store);
  return store;
}

function pushWords(bank: WeakWord[], tokens: Token[]): void {
  for (const token of tokens) {
    const found = bank.find((word) => word.en === token.en && word.th === token.th);
    if (found) found.count += 1;
    else bank.push({ en: token.en, th: token.th, count: 1 });
  }
  bank.sort((a, b) => b.count - a.count);
  bank.splice(80);
}

export function bestKey(source: SourceMode, level: Level, duration: Duration): string {
  return `${source}:${level}:${duration}`;
}

export function recordBest(
  source: SourceMode,
  level: Level,
  duration: Duration,
  wpm: number,
  acc: number,
): { store: Store; isRecord: boolean; bestWpm: number } {
  const store = loadStore();
  const key = bestKey(source, level, duration);
  const prev = store.bests[key];
  const isRecord = wpm > 0 && (!prev || wpm > prev.wpm);
  if (isRecord) {
    store.bests[key] = { wpm, acc };
    saveStore(store);
  }
  return { store, isRecord, bestWpm: store.bests[key]?.wpm ?? 0 };
}
