#!/usr/bin/env node
// يفحص نصوص القسم العربية بحثاً عن كلمات بلا تشكيل.
// الاستخدام:  node scripts/check-tashkeel.mjs [مسار المجلد]   (الافتراضي: src/islamic)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'src/islamic';
const HARAKAT = /[\u064B-\u0652\u0670]/;
const ARABIC_WORD = /[\u0621-\u064A\u064B-\u0652\u0670]{3,}/g;
// كلمات قصيرة لا يلزم تشكيلها (حروف جر وأدوات شائعة)
const IGNORE = new Set(['في', 'من', 'على', 'إلى', 'عن', 'أو', 'ما', 'لا', 'هل', 'ثم', 'مع', 'كل']);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(p) && !p.endsWith('validateContent.ts') ? [p] : [];
  });

let bad = 0;
for (const file of walk(root)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || line.includes('console.')) return; // تجاهل التعليقات ورسائل المطوّر
    const strings = line.match(/'[^']*'|"[^"]*"|`[^`]*`|>[^<{]+</g) ?? [];
    for (const s of strings) {
      for (const w of s.match(ARABIC_WORD) ?? []) {
        if (!HARAKAT.test(w) && !IGNORE.has(w)) {
          bad += 1;
          console.log(`${file}:${i + 1}  ${w}`);
        }
      }
    }
  });
}
console.log(bad ? `\nكلمات بلا تشكيل: ${bad}` : 'كل النصوص العربية مشكّلة ✓');
process.exit(bad ? 1 : 0);
