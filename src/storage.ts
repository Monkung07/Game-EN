import { LEVELS, type Duration, type GlossMode, type Level, type SourceMode, type Store, type Token, type WeakWord } from "./types";

const KEY = "typegloss";

const defaults: Store = {
  streak: 0,
  lastDay: "",
  weak: [],
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
    if (!raw) return { ...defaults, weak: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastDay: typeof parsed.lastDay === "string" ? parsed.lastDay : "",
      weak: Array.isArray(parsed.weak) ? parsed.weak.filter(isWeak) : [],
      duration: parsed.duration === 15 || parsed.duration === 30 || parsed.duration === 60 ? parsed.duration : 30,
      gloss: parsed.gloss === "full" || parsed.gloss === "focus" || parsed.gloss === "peek" ? parsed.gloss : "focus",
      source: parsed.source === "words" || parsed.source === "sentences" || parsed.source === "tales" ? parsed.source : "sentences",
      level: typeof parsed.level === "string" && (LEVELS as readonly string[]).includes(parsed.level) ? (parsed.level as Level) : "A1",
    };
  } catch {
    return { ...defaults, weak: [] };
  }
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
  for (const token of tokens) {
    const found = store.weak.find((word) => word.en === token.en && word.th === token.th);
    if (found) found.count += 1;
    else store.weak.push({ en: token.en, th: token.th, count: 1 });
  }
  store.weak.sort((a, b) => b.count - a.count);
  store.weak = store.weak.slice(0, 80);
  saveStore(store);
  return store;
}
