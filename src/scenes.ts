export interface SceneView {
  src: string;
  label: string;
}

const scenes: Record<string, SceneView> = {
  "lion-sleep": { src: "/scenes/lion-sleep.jpg?v=2", label: "สิงโตหลับใต้ต้นไม้" },
  "lion-paw": { src: "/scenes/lion-paw.jpg?v=2", label: "หนูวิ่งผ่านอุ้งเท้าสิงโต" },
  "lion-catch": { src: "/scenes/lion-catch.jpg?v=4", label: "สิงโตจับหนูได้" },
  "lion-please": { src: "/scenes/lion-please.jpg?v=3", label: "หนูขอให้สิงโตปล่อย" },
  "lion-lets": { src: "/scenes/lion-lets.jpg?v=2", label: "สิงโตยิ้มแล้วปล่อยหนูไป" },
  "lion-net": { src: "/scenes/lion-net.jpg?v=4", label: "สิงโตติดอยู่ในตาข่าย" },
  "lion-runs": { src: "/scenes/lion-runs.jpg?v=3", label: "หนูวิ่งกลับไปช่วย" },
  "lion-bites": { src: "/scenes/lion-bites.jpg?v=4", label: "หนูกัดตาข่ายจนสิงโตเป็นอิสระ" },
  "lion-thanks": { src: "/scenes/lion-thanks.jpg?v=2", label: "สิงโตขอบคุณหนู" },
  "hare-laugh": { src: "/scenes/hare-laugh.jpg?v=2", label: "กระต่ายหัวเราะเยาะเต่า" },
  "hare-start": { src: "/scenes/hare-start.jpg?v=2", label: "กระต่ายชวนเต่าแข่งไปที่ต้นไม้" },
  "hare-ahead": { src: "/scenes/hare-ahead.jpg?v=2", label: "กระต่ายวิ่งนำแล้วหยุดพัก" },
  "hare-sleep": { src: "/scenes/hare-sleep.jpg?v=2", label: "กระต่ายหลับข้างทาง" },
  "tortoise-walk": { src: "/scenes/tortoise-walk.jpg?v=2", label: "เต่ายังเดินต่อไป" },
  "tortoise-pass": { src: "/scenes/tortoise-pass.jpg?v=2", label: "เต่าเดินผ่านกระต่ายที่หลับ" },
  "hare-late": { src: "/scenes/hare-late.jpg?v=2", label: "กระต่ายตื่นมาช้าไป" },
  "tortoise-win": { src: "/scenes/tortoise-win.jpg?v=2", label: "เต่าชนะการแข่ง" },
  "red-walk": { src: "/scenes/red-walk.jpg?v=2", label: "เด็กหญิงผ้าคลุมแดงเดินไปหาคุณย่า" },
  "red-basket": { src: "/scenes/red-basket.jpg?v=2", label: "เด็กหญิงถือตะกร้าขนมและผลไม้" },
  "red-stop": { src: "/scenes/red-stop.jpg?v=2", label: "หมาป่าหิวขวางทางในป่า" },
  "red-ask": { src: "/scenes/red-ask.jpg?v=2", label: "หมาป่าถามว่าจะไปไหน" },
  "red-answer": { src: "/scenes/red-answer.jpg?v=2", label: "เด็กหญิงบอกว่าจะไปหาคุณย่า" },
  "wolf-house": { src: "/scenes/wolf-house.jpg?v=2", label: "หมาป่าวิ่งไปถึงบ้านก่อน" },
  "wolf-bed": { src: "/scenes/wolf-bed.jpg?v=2", label: "หมาป่าสวมหมวกแล้วนอนบนเตียง" },
  "red-eyes": { src: "/scenes/red-eyes.jpg?v=2", label: "เด็กหญิงเห็นตาโตของหมาป่า" },
  hunter: { src: "/scenes/hunter.jpg?v=2", label: "พรานไล่หมาป่าออกไป" },
};

export function sceneView(id: string): SceneView | undefined {
  return scenes[id];
}
