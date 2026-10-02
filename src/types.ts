export type GlossMode = "full" | "focus" | "peek";
export type TestMode = "time" | "words" | "quote" | "weak" | "slow";
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];
export type Duration = 15 | 30 | 60;
export type WordCount = 10 | 25 | 50 | 100;
export type Phase = "ready" | "running" | "finished";

export interface Token {
  en: string;
  th: string;
  sentenceEnd?: boolean;
  /** Natural Thai for the whole tale line. Shown once, above the English. */
  sentenceTh?: string;
  tale?: string;
  scene?: string;
}

export interface WeakWord extends Token {
  count: number;
  due: string;
  step: number;
}

export interface Best {
  wpm: number;
  acc: number;
}

export interface Store {
  streak: number;
  lastDay: string;
  weak: WeakWord[];
  slow: WeakWord[];
  bests: Record<string, Best>;
  duration: Duration;
  wordCount: WordCount;
  quote: number;
  gloss: GlossMode;
  testMode: TestMode;
  level: Level;
}
