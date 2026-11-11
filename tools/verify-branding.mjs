// Checks optional provider/design branding in owned product content. Run after the build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const motion=fs.existsSync('studio/index.html');
const inputs=motion?['index.html','README.md','README.en.md','studio','assets','api','packs','skills','dist','.vercel/output/static']:['index.html','preview.html','README.md','README.en.md','src','data','sources','.vercel/output/static'];
const forbidden=/\b(?:detent|aimran|lucian|claude|anthropic|openai|chatgpt|codex|sonnet|gpt|shadcn|assistant-ui|cuelark|steadicam)\b|(?:inspired by|based on|derived from)\s+(?:shohei|detent|aimran)/i;
const sourceCredit=/built (?:on|with) motion prompt|powered by motion prompt|基于\s*Motion Prompt/i;
const author=/Shohei|showheyohtaki/i;
const findings=[];let files=0,legalFiles=0;
function visit(file){
 const stat=fs.statSync(file);if(stat.isDirectory()){for(const name of fs.readdirSync(file))visit(path.join(file,name));return;}
 if(!/\.(html|js|jsx|vue|css|mjs|json|txt|tsv|md)$/i.test(file))return;
 if(/(?:^|\/)(?:LICENSE|THIRD-PARTY-NOTICES\.md|fonts)(?:\/|$)/.test(file))return;
 const text=fs.readFileSync(file,'utf8');files++;
 if(forbidden.test(text)||sourceCredit.test(text))findings.push(file+': optional branding');
 if(author.test(text)){
  legalFiles++;
  for(const line of text.split('\n'))if(author.test(line)&&!/copyright|\(c\)|MIT License/i.test(line))findings.push(file+': attribution outside copyright notice');
 }
}
for(const input of inputs)if(fs.existsSync(input))visit(input);
assert.deepEqual(findings,[]);
console.log(`PASS: ${files} product/source/export files; no optional provider or design-source branding. ${legalFiles} files retain required copyright notices.`);
