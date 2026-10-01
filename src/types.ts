export type GlossMode = "full" | "focus" | "peek";
export type SourceMode = "sentences" | "words" | "tales";
export type Duration = 15 | 30 | 60;
export type Phase = "ready" | "running" | "finished";

export interface Token {
  en: string;
  th: string;
  sentenceEnd?: boolean;
  tale?: string;
}

export interface WeakWord extends Token {
  count: number;
}

export interface Store {
  streak: number;
  lastDay: string;
  weak: WeakWord[];
  duration: Duration;
  gloss: GlossMode;
  source: SourceMode;
}
