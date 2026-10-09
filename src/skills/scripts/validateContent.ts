// src/skills/scripts/validateContent.ts
// يفحص: (1) التشكيل في كل نص عربي (2) سلامة بنية الأسئلة (3) إمكانية حل متاهات المسار
// (4) خلوّ حقول النطق من الإيموجي. الاستخدام: npm run validate:skills
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILLS_GAMES } from '../data/games';
import type { Question } from '../data/types';

const HARAKAT = /[\u064B-\u0652\u0670]/;
const ARABIC_WORD = /[\u0621-\u064A\u064B-\u0652\u0670]+/g;
const EMOJI = /\p{Extended_Pictographic}/u;
// كلمات/حروف يُقبل ورودها دون تشكيل (حروف مفردة، أو اختصارات)
const ALLOW = new Set(['و', '؟']);
const errors: string[] = [];
const warns: string[] = [];
const err = (m: string) => errors.push(m);

function checkText(where: string, text?: string) {
  if (!text) return;
  for (const w of text.match(ARABIC_WORD) ?? []) {
    if (ALLOW.has(w)) continue;
    if (!HARAKAT.test(w)) err(`بلا تشكيل «${w}» في ${where}`);
  }
}

function solvable(grid: string[], mustCollect: boolean): boolean {
  const h = grid.length, w = grid[0].length;
  let s: [number, number] = [0, 0]; const stars: string[] = [];
  grid.forEach((row, r) => [...row].forEach((c, i) => { if (c === 'S') s = [r, i]; if (c === '*') stars.push(`${r},${i}`); }));
  const seen = new Set<string>(); const stack: [number, number, number][] = [[s[0], s[1], 0]];
  while (stack.length) {
    const [r, c, mask] = stack.pop()!; const k = `${r},${c},${mask}`;
    if (seen.has(k)) continue; seen.add(k);
    if (grid[r][c] === 'G' && (!mustCollect || mask === (1 << stars.length) - 1)) return true;
    if (grid[r][c] === 'G') continue;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
      const cell = grid[nr][nc]; if (cell === '#' || cell === 'X') continue;
      const si = stars.indexOf(`${nr},${nc}`);
      stack.push([nr, nc, si >= 0 ? mask | (1 << si) : mask]);
    }
  }
  return false;
}

function checkQuestion(where: string, q: Question) {
  checkText(`${where} prompt`, q.prompt); checkText(`${where} hint`, q.hint); checkText(`${where} explain`, q.explain);
  if (q.speech && EMOJI.test(q.speech)) err(`${where}: حقل speech يحتوي إيموجي`);
  if (!q.prompt) err(`${where}: prompt فارغ`);
  const optIds = (opts: { id: string }[]) => { if (new Set(opts.map((o) => o.id)).size !== opts.length) err(`${where}: معرّفات مكرّرة`); };
  switch (q.type) {
    case 'choice': {
      q.options.forEach((o) => checkText(`${where} option`, o.label)); optIds(q.options);
      if (q.options.length < 2) err(`${where}: خياران على الأقل`);
      const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (!q.openEnded && !ans.every((a) => q.options.some((o) => o.id === a))) err(`${where}: answer غير موجودة في options`);
      if (q.multi && ans.length < 2) err(`${where}: multi يحتاج إجابتين`);
      if (q.options.every((o) => !o.label && !o.visual)) err(`${where}: خيارات فارغة`);
      break;
    }
    case 'order': q.items.forEach((o) => checkText(`${where} item`, o.label)); optIds(q.items); if (q.items.length < 2) err(`${where}: عنصران على الأقل`); break;
    case 'match': q.pairs.forEach((p) => { checkText(`${where} left`, p.left.label); checkText(`${where} right`, p.right.label); }); if (q.pairs.length < 2) err(`${where}: زوجان على الأقل`); break;
    case 'memory': if (q.cards.length < 2 || q.cards.length > 8) err(`${where}: عدد البطاقات 2..8`); break;
    case 'path': if (!solvable(q.grid, !!q.mustCollect)) err(`${where}: المتاهة غير قابلة للحل`); break;
    case 'scene': if (q.need > q.stickers.length * 4) warns.push(`${where}: need كبير`); break;
    case 'paint': break;
  }
}

// ---- 1) فحص بنك الأسئلة (عدة سحبات عشوائية لتغطية المولّدات) ----
const stats: string[] = [];
for (const g of SKILLS_GAMES) {
  checkText(`${g.id} title`, g.title); checkText(`${g.id} subtitle`, g.subtitle); checkText(`${g.id} desc`, g.desc); checkText(`${g.id} skill`, g.skill);
  if (g.levels.length !== 3) err(`${g.id}: يجب 3 مستويات`);
  for (const lv of g.levels) {
    checkText(`${g.id}/L${lv.level} title`, lv.title); checkText(`${g.id}/L${lv.level} goal`, lv.goal);
    const kinds = new Set<string>(); const seenIds = new Set<string>();
    for (let run = 0; run < 40; run++) {
      const qs = lv.build();
      if (qs.length < 3) err(`${g.id}/L${lv.level}: أقل من 3 أسئلة`);
      qs.forEach((q) => { kinds.add(q.type); checkQuestion(`${g.id}/L${lv.level}/${q.id}`, q); seenIds.add(q.id.replace(/_[a-z0-9]{5}$/, '')); });
    }
    stats.push(`${g.icon} ${g.id} L${lv.level}: ${seenIds.size} نمط/سؤال مختلف — الأنواع: ${[...kinds].join(', ')}`);
  }
}

// ---- 2) فحص نصوص الواجهة داخل ملفات TSX/TS (سلاسل عربية بلا تشكيل) ----
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? (f === 'scripts' ? [] : walk(p)) : /\.(tsx?|css)$/.test(f) ? [p] : []; });
}
for (const file of walk(root)) {
  const src = readFileSync(file, 'utf8').split('\n');
  src.forEach((line, i) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;           // تجاهل التعليقات الكاملة
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    for (const w of code.match(ARABIC_WORD) ?? []) if (!ALLOW.has(w) && !HARAKAT.test(w)) err(`بلا تشكيل «${w}» في ${file.replace(root, 'src/skills')}:${i + 1}`);
  });
}

console.log(stats.join('\n'));
if (warns.length) console.log('\nتحذيرات:\n' + [...new Set(warns)].join('\n'));
if (errors.length) { console.error(`\n❌ ${new Set(errors).size} مشكلة:\n` + [...new Set(errors)].slice(0, 80).join('\n')); process.exit(1); }
console.log('\n✅ المحتوى سليم: التشكيل كامل، والبنية صحيحة، والمتاهات قابلة للحل.');
