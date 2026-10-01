import type { Token } from "./types";

function line(pairs: [string, string][]): Token[] {
  const tokens: Token[] = pairs.map(([en, th]) => ({ en, th }));
  const last = tokens[tokens.length - 1];
  if (last) last.sentenceEnd = true;
  return tokens;
}

/** A1 sentences. Each Thai gloss follows that English word in context. */
export const sentences: Token[][] = [
  line([
    ["I", "ฉัน"],
    ["go", "ไป"],
    ["to", "ที่"],
    ["school", "โรงเรียน"],
    ["every", "ทุก"],
    ["morning", "เช้า"],
  ]),
  line([
    ["She", "เธอ"],
    ["drinks", "ดื่ม"],
    ["milk", "นม"],
    ["before", "ก่อน"],
    ["she", "เธอ"],
    ["sleeps", "หลับ"],
  ]),
  line([
    ["We", "เรา"],
    ["eat", "กิน"],
    ["rice", "ข้าว"],
    ["with", "กับ"],
    ["soup", "ซุป"],
    ["at", "ที่"],
    ["home", "บ้าน"],
  ]),
  line([
    ["He", "เขา"],
    ["walks", "เดิน"],
    ["to", "ไป"],
    ["the", "ที่"],
    ["market", "ตลาด"],
    ["after", "หลัง"],
    ["work", "เลิกงาน"],
  ]),
  line([
    ["My", "ของฉัน"],
    ["sister", "พี่สาว"],
    ["reads", "อ่าน"],
    ["a", "หนึ่งเล่ม"],
    ["book", "หนังสือ"],
    ["every", "ทุก"],
    ["night", "คืน"],
  ]),
  line([
    ["They", "พวกเขา"],
    ["play", "เล่น"],
    ["football", "ฟุตบอล"],
    ["in", "ใน"],
    ["the", "นั้น"],
    ["park", "สวน"],
    ["today", "วันนี้"],
  ]),
  line([
    ["I", "ฉัน"],
    ["want", "อยาก"],
    ["to", "จะ"],
    ["buy", "ซื้อ"],
    ["fresh", "สด"],
    ["fruit", "ผลไม้"],
    ["today", "วันนี้"],
  ]),
  line([
    ["Please", "โปรด"],
    ["open", "เปิด"],
    ["the", "นั้น"],
    ["window", "หน้าต่าง"],
    ["for", "ให้"],
    ["me", "ฉัน"],
    ["now", "เดี๋ยวนี้"],
  ]),
  line([
    ["The", "นั้น"],
    ["children", "เด็กๆ"],
    ["are", "กำลัง"],
    ["happy", "มีความสุข"],
    ["at", "ที่"],
    ["school", "โรงเรียน"],
    ["today", "วันนี้"],
  ]),
  line([
    ["Please", "โปรด"],
    ["give", "ให้"],
    ["me", "ฉัน"],
    ["a", "หนึ่ง"],
    ["cup", "ถ้วย"],
    ["of", "ของ"],
    ["water", "น้ำ"],
  ]),
  line([
    ["I", "ฉัน"],
    ["brush", "แปรง"],
    ["my", "ของฉัน"],
    ["teeth", "ฟัน"],
    ["every", "ทุก"],
    ["morning", "เช้า"],
  ]),
  line([
    ["She", "เธอ"],
    ["is", "เป็น"],
    ["a", "คนหนึ่ง"],
    ["teacher", "ครู"],
    ["at", "ที่"],
    ["my", "ของฉัน"],
    ["school", "โรงเรียน"],
  ]),
  line([
    ["We", "เรา"],
    ["go", "ไป"],
    ["to", "ที่"],
    ["the", "นั้น"],
    ["shop", "ร้าน"],
    ["on", "ใน"],
    ["Sunday", "วันอาทิตย์"],
  ]),
  line([
    ["He", "เขา"],
    ["never", "ไม่เคย"],
    ["likes", "ชอบ"],
    ["cold", "หนาว"],
    ["weather", "อากาศ"],
    ["here", "ที่นี่"],
  ]),
  line([
    ["There", "มี"],
    ["is", "อยู่"],
    ["a", "หนึ่ง"],
    ["cat", "แมว"],
    ["under", "ใต้"],
    ["the", "นั้น"],
    ["table", "โต๊ะ"],
  ]),
  line([
    ["I", "ฉัน"],
    ["take", "นั่ง"],
    ["the", "นั้น"],
    ["bus", "รถเมล์"],
    ["to", "ไป"],
    ["work", "ทำงาน"],
    ["every", "ทุก"],
    ["day", "วัน"],
  ]),
  line([
    ["Her", "ของเธอ"],
    ["father", "พ่อ"],
    ["works", "ทำงาน"],
    ["in", "ใน"],
    ["a", "หนึ่ง"],
    ["small", "เล็ก"],
    ["office", "สำนักงาน"],
  ]),
  line([
    ["I", "ฉัน"],
    ["am", "กำลัง"],
    ["learning", "เรียน"],
    ["English", "ภาษาอังกฤษ"],
    ["with", "กับ"],
    ["my", "ของฉัน"],
    ["friend", "เพื่อน"],
  ]),
  line([
    ["Do", "ไหม"],
    ["you", "คุณ"],
    ["want", "อยาก"],
    ["to", "จะ"],
    ["eat", "กิน"],
    ["lunch", "อาหารเที่ยง"],
    ["now", "ตอนนี้"],
  ]),
  line([
    ["The", "นั้น"],
    ["sky", "ท้องฟ้า"],
    ["is", "เป็น"],
    ["blue", "สีฟ้า"],
    ["and", "และ"],
    ["very", "มาก"],
    ["bright", "สว่าง"],
  ]),
  line([
    ["Please", "โปรด"],
    ["sit", "นั่ง"],
    ["down", "ลง"],
    ["and", "และ"],
    ["open", "เปิด"],
    ["your", "ของคุณ"],
    ["book", "หนังสือ"],
  ]),
  line([
    ["We", "เรา"],
    ["have", "มี"],
    ["two", "สอง"],
    ["cats", "แมว"],
    ["and", "และ"],
    ["one", "หนึ่ง"],
    ["dog", "สุนัข"],
  ]),
  line([
    ["She", "เธอ"],
    ["walks", "เดิน"],
    ["home", "กลับบ้าน"],
    ["after", "หลังจาก"],
    ["class", "ชั้นเรียน"],
    ["ends", "จบ"],
  ]),
  line([
    ["I", "ฉัน"],
    ["need", "ต้องการ"],
    ["a", "หนึ่ง"],
    ["pen", "ปากกา"],
    ["and", "และ"],
    ["some", "บางส่วน"],
    ["paper", "กระดาษ"],
  ]),
  line([
    ["He", "เขา"],
    ["gets", "ตื่น"],
    ["up", "ขึ้น"],
    ["early", "แต่เช้า"],
    ["and", "และ"],
    ["drinks", "ดื่ม"],
    ["coffee", "กาแฟ"],
  ]),
  line([
    ["My", "ของฉัน"],
    ["friends", "เพื่อน"],
    ["and", "และ"],
    ["I", "ฉัน"],
    ["study", "เรียน"],
    ["after", "หลัง"],
    ["dinner", "มื้อเย็น"],
  ]),
  line([
    ["It", "อากาศ"],
    ["is", "เป็น"],
    ["cold", "หนาว"],
    ["so", "ดังนั้น"],
    ["I", "ฉัน"],
    ["wear", "สวม"],
    ["a", "หนึ่ง"],
    ["coat", "เสื้อโค้ท"],
  ]),
  line([
    ["Can", "ได้ไหม"],
    ["we", "เรา"],
    ["meet", "พบ"],
    ["at", "ที่"],
    ["the", "นั้น"],
    ["station", "สถานี"],
    ["at", "ตอน"],
    ["noon", "เที่ยง"],
  ]),
  line([
    ["I", "ฉัน"],
    ["like", "ชอบ"],
    ["to", "ที่จะ"],
    ["listen", "ฟัง"],
    ["to", "ถึง"],
    ["music", "เพลง"],
    ["at", "ตอน"],
    ["night", "กลางคืน"],
  ]),
  line([
    ["This", "นี้"],
    ["bag", "กระเป๋า"],
    ["is", "เป็น"],
    ["too", "เกินไป"],
    ["heavy", "หนัก"],
    ["for", "สำหรับ"],
    ["me", "ฉัน"],
  ]),
  line([
    ["I", "ฉัน"],
    ["don't", "ไม่"],
    ["like", "ชอบ"],
    ["very", "มาก"],
    ["sweet", "หวาน"],
    ["coffee", "กาแฟ"],
  ]),
  line([
    ["I'm", "ฉัน"],
    ["ready", "พร้อม"],
    ["to", "ที่จะ"],
    ["go", "ไป"],
    ["to", "ที่"],
    ["school", "โรงเรียน"],
    ["now", "ตอนนี้"],
  ]),
];

export function assertContent(): void {
  for (const sentence of sentences) {
    if (sentence.length < 6 || sentence.length > 12) {
      throw new Error(`Sentence length out of range: ${sentence.map((t) => t.en).join(" ")}`);
    }
    for (const token of sentence) {
      if (!/^[A-Za-z'-]+$/.test(token.en) || token.th.length === 0) {
        throw new Error(`Bad token: ${token.en}`);
      }
    }
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

export function sentenceQueue(): Token[] {
  const deck = shuffle(sentences).flat();
  return [...deck, ...deck];
}

export function wordQueue(): Token[] {
  const unique = new Map<string, Token>();
  for (const token of sentences.flat()) {
    unique.set(`${token.en}\0${token.th}`, { en: token.en, th: token.th });
  }
  const deck = shuffle([...unique.values()]);
  return [...deck, ...deck, ...deck];
}

export function drillQueue(tokens: Token[], min = 24): Token[] {
  if (tokens.length === 0) return [];
  const clean = tokens.map((token) => ({ en: token.en, th: token.th }));
  const out: Token[] = [];
  while (out.length < Math.max(min, clean.length)) out.push(...clean);
  return out;
}
