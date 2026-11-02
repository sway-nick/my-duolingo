import fs from 'fs';
import path from 'path';

const manualOverrides = {
  6752: "虚假的、错误的",
  6912: "真实的、正确的",
  2146: "该死的、极其",
  2148: "下午、晚上",
  2208: "在一边、在旁边",
  2273: "脱氧核糖核酸、DNA",
  2283: "母狗、泼妇",
  2387: "玫瑰、上升",
  3142: "她的",
  3680: "面团、钱财",
  3781: "她、她的",
  3784: "是、在",
  3788: "在……里面、在……期间",
  3789: "他们、她们、它们",
  3798: "我",
  3806: "制作、做",
  3808: "我的、矿山",
  3813: "我们",
  3817: "谁",
  3823: "他",
  3832: "屎、胡说",
  3859: "这、那个",
  3901: "招致、遭受",
  3927: "会、将要",
  3930: "不是、没有",
  3932: "打算、将要",
  3954: "小混混、小流氓",
  3977: "少于",
  4216: "仙人掌",
  4217: "焦点",
  4218: "真菌",
  4219: "细胞核",
  4220: "教学大纲",
  4221: "分析",
  4222: "基础",
  4223: "危机",
  4224: "论文",
  4225: "现象",
  4226: "标准",
  4229: "半径",
  4270: "滚开",
  4294: "羊",
  4295: "鹿",
  4296: "鱼",
  4310: "不得不、必须",
  4331: "嗨，你好",
  4376: "不是、没有",
  4394: "锯、看见",
  5020: "想要",
  5021: "必须、得",
  5023: "不会、不愿",
  5057: "结账退房、查看",
  5064: "太阳打西边出来、绝不可能",
  5202: "犯下、实施",
  6767: "鸽子、潜水",
  6940: "不新鲜的、陈腐的",
  6941: "极度饥饿的、挨饿的",
  6951: "在船上、在飞机上、在车上",
};

const targetFiles = [
  path.resolve('frontend/assets/data/words.json'),
  path.resolve('assets/data/words.json'),
  path.resolve('docs/assets/data/words.json')
];

function cleanChinese(id, originalZh) {
  if (manualOverrides[id] !== undefined) return manualOverrides[id];
  if (!originalZh) return originalZh;
  let val = originalZh.replace(/\s*[（(][^）)]*[）)]/g, '').trim();
  const parts = val.split(/[;；,，、/／]/).map(s => s.trim()).filter(Boolean);
  return [...new Set(parts)].join('、');
}

let totalUpdatedWords = 0;

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) continue;
  console.log(`Processing ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let fileUpdated = 0;
  for (const item of data) {
    if (!item.translations) continue;
    const orig = item.translations.zh || '';
    const cleaned = cleanChinese(item.id, orig);
    if (cleaned !== orig) {
      item.translations.zh = cleaned;
      fileUpdated++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${fileUpdated} words in ${path.basename(filePath)}`);
  totalUpdatedWords = fileUpdated;
}

console.log(`Finished applying Chinese refinements. Modified words count: ${totalUpdatedWords}`);
