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

function story(title: string, lines: [string, string][][], scenes: string[]): Token[][] {
  if (scenes.length !== lines.length) {
    throw new Error(`${title}: ${scenes.length} scenes for ${lines.length} lines`);
  }
  return lines.map((pairs, index) => {
    const tokens = line(pairs);
    for (const token of tokens) {
      token.tale = title;
      token.scene = scenes[index];
    }
    return tokens;
  });
}

/** Short A1 tales, kept in reading order. */
export const tales: Token[][] = [
  ...story("สิงโตกับหนู", [
    [
      ["A", "ตัว"],
      ["big", "ใหญ่"],
      ["lion", "สิงโต"],
      ["sleeps", "หลับ"],
      ["under", "ใต้"],
      ["a", "ต้น"],
      ["tall", "สูง"],
      ["tree", "ไม้"],
    ],
    [
      ["A", "ตัว"],
      ["small", "เล็ก"],
      ["mouse", "หนู"],
      ["runs", "วิ่ง"],
      ["across", "ผ่าน"],
      ["his", "ของเขา"],
      ["big", "ใหญ่"],
      ["paw", "อุ้งเท้า"],
    ],
    [
      ["The", "ตัว"],
      ["lion", "สิงโต"],
      ["wakes", "ตื่น"],
      ["and", "แล้ว"],
      ["catches", "จับ"],
      ["the", "ตัว"],
      ["little", "เล็ก"],
      ["mouse", "หนู"],
    ],
    [
      ["Please", "โปรด"],
      ["let", "ปล่อย"],
      ["me", "ฉัน"],
      ["go", "ไป"],
      ["says", "พูด"],
      ["the", "ตัว"],
      ["little", "เล็ก"],
      ["mouse", "หนู"],
    ],
    [
      ["The", "ตัว"],
      ["kind", "ใจดี"],
      ["lion", "สิงโต"],
      ["smiles", "ยิ้ม"],
      ["and", "แล้ว"],
      ["lets", "ปล่อย"],
      ["the", "ตัว"],
      ["mouse", "หนู"],
      ["go", "ไป"],
    ],
    [
      ["Some", "พวก"],
      ["hunters", "พราน"],
      ["catch", "จับ"],
      ["the", "ตัว"],
      ["lion", "สิงโต"],
      ["in", "ด้วย"],
      ["a", "ผืน"],
      ["strong", "แข็งแรง"],
      ["net", "ตาข่าย"],
    ],
    [
      ["The", "ตัว"],
      ["mouse", "หนู"],
      ["hears", "ได้ยิน"],
      ["him", "เขา"],
      ["and", "แล้ว"],
      ["runs", "วิ่ง"],
      ["back", "กลับ"],
      ["to", "ไป"],
      ["help", "ช่วย"],
    ],
    [
      ["She", "เธอ"],
      ["bites", "กัด"],
      ["the", "ผืน"],
      ["net", "ตาข่าย"],
      ["until", "จน"],
      ["the", "ตัว"],
      ["lion", "สิงโต"],
      ["is", "เป็น"],
      ["free", "อิสระ"],
    ],
    [
      ["Thank", "ขอบคุณ"],
      ["you", "เธอ"],
      ["my", "ของฉัน"],
      ["little", "เล็ก"],
      ["friend", "เพื่อน"],
      ["says", "พูด"],
      ["the", "ตัว"],
      ["happy", "ดีใจ"],
      ["lion", "สิงโต"],
    ],
  ], [
    "lion-sleep",
    "lion-paw",
    "lion-catch",
    "lion-please",
    "lion-lets",
    "lion-net",
    "lion-runs",
    "lion-bites",
    "lion-thanks",
  ]),
  ...story("เต่ากับกระต่าย", [
    [
      ["A", "ตัว"],
      ["fast", "เร็ว"],
      ["hare", "กระต่าย"],
      ["laughs", "หัวเราะ"],
      ["at", "ใส่"],
      ["a", "ตัว"],
      ["slow", "ช้า"],
      ["tortoise", "เต่า"],
    ],
    [
      ["Let", "มา"],
      ["us", "กัน"],
      ["race", "แข่ง"],
      ["to", "ไป"],
      ["that", "ต้น"],
      ["big", "ใหญ่"],
      ["tree", "ไม้"],
      ["says", "พูด"],
      ["the", "ตัว"],
      ["hare", "กระต่าย"],
    ],
    [
      ["The", "ตัว"],
      ["hare", "กระต่าย"],
      ["runs", "วิ่ง"],
      ["far", "ไกล"],
      ["ahead", "นำหน้า"],
      ["and", "แล้ว"],
      ["stops", "หยุด"],
      ["to", "เพื่อ"],
      ["rest", "พัก"],
    ],
    [
      ["He", "เขา"],
      ["sleeps", "หลับ"],
      ["under", "ใต้"],
      ["a", "ต้น"],
      ["tree", "ไม้"],
      ["beside", "ข้าง"],
      ["the", "เส้น"],
      ["long", "ยาว"],
      ["road", "ทาง"],
    ],
    [
      ["The", "ตัว"],
      ["slow", "ช้า"],
      ["tortoise", "เต่า"],
      ["keeps", "ยัง"],
      ["walking", "เดินต่อ"],
      ["and", "และ"],
      ["does", "ไม่"],
      ["not", "ได้"],
      ["stop", "หยุด"],
    ],
    [
      ["She", "เธอ"],
      ["passes", "ผ่าน"],
      ["the", "ตัว"],
      ["sleeping", "ที่หลับ"],
      ["hare", "กระต่าย"],
      ["and", "แล้ว"],
      ["walks", "เดิน"],
      ["to", "ถึง"],
      ["the", "ต้น"],
      ["tree", "ไม้"],
    ],
    [
      ["The", "ตัว"],
      ["hare", "กระต่าย"],
      ["wakes", "ตื่น"],
      ["and", "แล้ว"],
      ["runs", "วิ่ง"],
      ["but", "แต่"],
      ["he", "เขา"],
      ["is", "มา"],
      ["too", "สาย"],
      ["late", "เกิน"],
    ],
    [
      ["Slow", "ช้า"],
      ["and", "และ"],
      ["steady", "มั่นคง"],
      ["wins", "ชนะ"],
      ["the", "การ"],
      ["race", "แข่ง"],
      ["that", "วัน"],
      ["sunny", "แจ่มใส"],
      ["day", "นั้น"],
    ],
  ], [
    "hare-laugh",
    "hare-start",
    "hare-ahead",
    "hare-sleep",
    "tortoise-walk",
    "tortoise-pass",
    "hare-late",
    "tortoise-win",
  ]),
  ...story("เด็กหญิงผ้าคลุมแดง", [
    [
      ["A", "เด็ก"],
      ["girl", "หญิง"],
      ["in", "ใส่"],
      ["a", "ผ้า"],
      ["red", "แดง"],
      ["cloak", "คลุม"],
      ["walks", "เดิน"],
      ["to", "ไปหา"],
      ["Grandma", "คุณย่า"],
    ],
    [
      ["She", "เธอ"],
      ["carries", "ถือ"],
      ["cake", "เค้ก"],
      ["and", "กับ"],
      ["fresh", "สด"],
      ["fruit", "ผลไม้"],
      ["in", "ใน"],
      ["her", "ของเธอ"],
      ["basket", "ตะกร้า"],
    ],
    [
      ["A", "ตัว"],
      ["hungry", "หิว"],
      ["wolf", "หมาป่า"],
      ["stops", "หยุด"],
      ["her", "เธอ"],
      ["on", "บน"],
      ["the", "เส้น"],
      ["forest", "ป่า"],
      ["path", "ทางเดิน"],
    ],
    [
      ["Where", "ที่ไหน"],
      ["are", "กำลัง"],
      ["you", "เธอ"],
      ["going", "ไป"],
      ["today", "วันนี้"],
      ["little", "น้อย"],
      ["girl", "หนู"],
      ["asks", "ถาม"],
      ["the", "ตัว"],
      ["wolf", "หมาป่า"],
    ],
    [
      ["I", "ฉัน"],
      ["am", "กำลัง"],
      ["going", "ไป"],
      ["to", "หา"],
      ["my", "ของฉัน"],
      ["sick", "ไม่สบาย"],
      ["Grandma", "คุณย่า"],
      ["says", "พูด"],
      ["the", "เด็ก"],
      ["girl", "หญิง"],
    ],
    [
      ["The", "ตัว"],
      ["wolf", "หมาป่า"],
      ["runs", "วิ่ง"],
      ["to", "ไป"],
      ["the", "บ้าน"],
      ["house", "นั้น"],
      ["before", "ก่อน"],
      ["the", "เด็ก"],
      ["little", "น้อย"],
      ["girl", "หนู"],
    ],
    [
      ["He", "เขา"],
      ["puts", "สวม"],
      ["on", "ไว้"],
      ["her", "ของย่า"],
      ["cap", "หมวก"],
      ["and", "แล้ว"],
      ["lies", "นอน"],
      ["in", "บน"],
      ["the", "เตียง"],
      ["bed", "นั้น"],
    ],
    [
      ["What", "ช่าง"],
      ["big", "ใหญ่"],
      ["eyes", "ตา"],
      ["you", "เธอ"],
      ["have", "มี"],
      ["says", "พูด"],
      ["the", "เด็ก"],
      ["brave", "กล้า"],
      ["girl", "หญิง"],
    ],
    [
      ["A", "คน"],
      ["hunter", "พราน"],
      ["hears", "ได้ยิน"],
      ["her", "เธอ"],
      ["and", "แล้ว"],
      ["sends", "ไล่"],
      ["the", "ตัว"],
      ["wolf", "หมาป่า"],
      ["away", "ออกไป"],
    ],
  ], [
    "red-walk",
    "red-basket",
    "red-stop",
    "red-ask",
    "red-answer",
    "wolf-house",
    "wolf-bed",
    "red-eyes",
    "hunter",
  ]),
];

export function assertContent(): void {
  for (const sentence of [...sentences, ...tales]) {
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

export function taleQueue(): Token[] {
  return tales.flat();
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
