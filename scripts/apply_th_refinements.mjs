import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manualOverrides = {
  44: "พื้นเมือง, เจ้าของภาษา",
  1396: "มัน, สิ่งนี้",
  1415: "ขึ้น, ข้างบน",
  1537: "ดังนั้น, มาก",
  1641: "ร้านค้า, ซื้อของ",
  1923: "ชุดเดรส, แต่งตัว",
  2046: "เกี่ยวกับ, ประมาณ",
  3772: "ยิง, ถ่ายภาพ",
  3784: "เป็น, อยู่, คือ",
  3786: "ของ, จาก",
  3788: "ใน, ข้างใน",
  3802: "กว่า, มากกว่า",
  3809: "พูด, คุย",
  3815: "ถ้า, หาก",
  3842: "ที่, ใน",
  3859: "นี้, นั้น",
  3865: "เข้าไปใน, สู่",
  4091: "เคย, เคยชิน",
  4112: "คบเพลิง, ไฟฉาย",
  4124: "กลัว, หวาดกลัว",
  4160: "เบื่อหน่าย, เอือมระอา",
  4174: "ความซึมเศร้า, ความหดหู่",
  4184: "อย่างไรก็ตาม, เหมือนกันหมด",
  4197: "ไม่เป็นไร, ไม่ขัดข้อง",
  4308: "ไม่สามารถ, ทำไม่ได้",
  4457: "ห้องน้ำ",
  4787: "ทางอ้อม, โดยอ้อม",
  4989: "ออกมา, ปรากฏ",
  5018: "ร่วมกัน, ด้วยกัน",
  5031: "มองข้ามความสำคัญ, ทึกทักเอาเอง",
  5064: "ไม่มีทางเป็นไปได้, ชาติหน้าตอนบ่ายๆ",
  5202: "ก่อกรรม, ก่ออาชญากรรม",
  5775: "ประทาน, พระราชทาน, มอบให้",
  6012: "ความรุนแรง, ความเจ็บแค้น",
  6013: "ความเฉียบแหลม, ไหวพริบ",
  6037: "อย่างยิ่ง, โดยสิ้นเชิง",
  6142: "ดังขึ้นเรื่อยๆ, เครเชนโด",
  6496: "ความกล้าหาญ, ความทรหด",
  6510: "การขับไล่, การคว่ำบาตร, การเนรเทศ",
  6743: "ไม่มีความสำเร็จใดได้มาโดยง่าย, ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น",
  6752: "เท็จ, ปลอม",
  6940: "ไม่สดใหม่, ค้างคืน",
  6941: "หิวโซ, อดอยาก"
};

function cleanTh(id, val) {
  if (val === null || val === undefined) return val;
  if (manualOverrides[id] !== undefined) {
    return manualOverrides[id];
  }

  let res = val;
  if (res.includes('(') || res.includes(')')) {
    res = res.replace(/\(.*?\)/g, '');
  }

  const parts = res.split(/[,;]/).map(p => p.trim()).filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      deduped.push(p);
    }
  }
  return deduped.join(', ');
}

const targetFiles = [
  path.join(rootDir, 'frontend', 'assets', 'data', 'words.json'),
  path.join(rootDir, 'assets', 'data', 'words.json'),
  path.join(rootDir, 'docs', 'assets', 'data', 'words.json')
];

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const words = JSON.parse(content);
  let updatedCount = 0;

  for (const w of words) {
    const tr = w.translations || {};
    const orig = tr.th;
    if (orig !== undefined) {
      const cleaned = cleanTh(w.id, orig);
      if (cleaned !== orig) {
        tr.th = cleaned;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} Thai translations in ${filePath}`);
}
