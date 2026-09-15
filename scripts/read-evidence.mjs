import fs from 'node:fs';
const home = fs.readFileSync('evidence/source/index-LtHPmhbb.js','utf8');
const shared = fs.readFileSync('evidence/source/WebGL-DCLktg0A.js','utf8');
const main = fs.readFileSync('evidence/source/main-fPdAioGW.js','utf8');
console.log('HOME CLASSES', [...home.matchAll(/class (\w+)/g)].map(m=>[m[1],m.index]));
console.log('HOME EFFECTS',home.slice(24447,30000),home.slice(77700,93137));
console.log('TEXT COMPONENTS', shared.slice(0,500));
for(const key of ['view-transition','clipPath','onMouseEnter','requestAnimationFrame','function j(','function O(','setTimeout','animation:']) {
  const matches = [...main.matchAll(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))];
  console.log('MAIN',key, matches.slice(-4).map(m=> main.slice(Math.max(0,m.index-160),m.index+500)));
}
for(const f of fs.readdirSync('evidence/source').filter(f=> /info.json$/.test(f))) {
  const info=JSON.parse(fs.readFileSync('evidence/source/'+f));
  console.log(f,{lenis:info.lenis,canvas:info.canvas,buttons:info.buttons,links:info.links.filter(l=>l.text && l.href.startsWith('/works/')).slice(0,18)});
}
