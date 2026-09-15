import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Cindy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules/playwright-core');
await fs.mkdir('evidence/source', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const mode = process.argv[2] || 'home';
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', async response => {
  const url = response.url();
  if (url.startsWith('https://nirnor.jp/assets/') && /\.(js|css)$/.test(url)) {
    try { await fs.writeFile('evidence/source/' + url.split('/').pop(), await response.body()); } catch {}
  }
});
await page.goto(mode === 'works' ? 'https://nirnor.jp/works' : mode === 'contact' ? 'https://nirnor.jp/contact' : mode === 'detail' ? process.argv[3] : 'https://nirnor.jp/', { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: 'evidence/source/home-loading.png' });
await page.waitForTimeout(6500);
await page.screenshot({ path: `evidence/source/${mode}-loaded.png` });
const info = await page.evaluate(() => ({ url: location.href, title: document.title, height: document.documentElement.scrollHeight, text: document.body.innerText, buttons: [...document.querySelectorAll('button')].map(e => ({ text: e.innerText, label: e.getAttribute('aria-label'), class: e.className })), links: [...document.querySelectorAll('a')].map(e => ({ text: e.innerText, href: e.getAttribute('href'), class: e.className })), canvas: [...document.querySelectorAll('canvas')].map(e => ({ width: e.width, height:e.height, engine:e.dataset.engine })), lenis: window.lenisVersion }));
await fs.writeFile(`evidence/source/${mode}-info.json`, JSON.stringify(info, null, 2));
console.log(JSON.stringify({mode,url:info.url,height:info.height,canvas:info.canvas,lenis:info.lenis,buttons:info.buttons,links:info.links.filter(l=>l.text && l.href.startsWith('/works/')).slice(0,18)}, null, 2));
if(mode === 'home') {
  await page.mouse.move(200, 150); await page.waitForTimeout(600); await page.mouse.move(1200, 700); await page.waitForTimeout(600);
  for(let n=1;n<=14;n++) { await page.mouse.wheel(0, 950); await page.waitForTimeout(1100); await page.screenshot({path:`evidence/source/home-scroll-${n}.png`}); }
  const topic = page.getByRole('button').filter({hasText:'2025.10.01'});
  await topic.click(); await page.waitForTimeout(800); await page.screenshot({path:'evidence/source/home-topic-open.png'}); await topic.click();
  await page.mouse.wheel(0,-8500); await page.waitForTimeout(1500); await page.screenshot({path:'evidence/source/home-reverse.png'});
  await page.getByRole('button').filter({hasText:'WEB DESIGN'}).click(); await page.waitForTimeout(700); await page.screenshot({path:'evidence/source/home-service-open.png'});
  await page.reload(); await page.waitForTimeout(160); await page.screenshot({path:'evidence/source/home-reload.png'});
} else if(mode === 'works') {
  await page.mouse.move(900,450); await page.waitForTimeout(1000); await page.screenshot({path:'evidence/source/works-hover.png'});
  await page.mouse.wheel(0,650); await page.waitForTimeout(1200); await page.screenshot({path:'evidence/source/works-scroll.png'});
} else if(mode === 'detail' || mode === 'contact') {
  for(let n=1;n<=Math.min(12,Math.ceil(info.height/800));n++){await page.mouse.wheel(0,800);await page.waitForTimeout(700);await page.screenshot({path:`evidence/source/${mode}-scroll-${n}.png`});}
  await page.mouse.wheel(0,-1600);await page.waitForTimeout(700);
}
if(mode === 'mobile') {
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(1800); await page.screenshot({path:'evidence/source/mobile-home.png'});
  await page.locator('header button').click(); await page.waitForTimeout(500); await page.screenshot({path:'evidence/source/mobile-menu.png'});
  await page.locator('header button').click(); await page.waitForTimeout(500);
  await page.mouse.wheel(0,2300); await page.waitForTimeout(1500); await page.screenshot({path:'evidence/source/mobile-scroll.png'});
  await page.setViewportSize({width:768,height:1024});await page.waitForTimeout(1000);await page.screenshot({path:'evidence/source/tablet-resize.png'});
}
if(mode === 'tour') {
  const snap = async (name, delay=600) => { await page.waitForTimeout(delay); await page.screenshot({path:`evidence/source/${name}.png`}); };
  await page.getByRole('link',{name:'WORKS',exact:true}).first().click(); await snap('navigation-works',1800);
  await page.getByRole('button',{name:'Graphic',exact:true}).click(); await snap('works-filter',800);
  await page.getByRole('button',{name:'All',exact:true}).click(); await page.waitForTimeout(900);
  await page.locator('[data-works-image]').first().hover(); await snap('works-stretch',180); await snap('works-stretch-end',1100);
  await page.getByRole('link',{name:'ReoNa Calendar 2022',exact:true}).click(); await snap('detail-navigation',1500);
  await page.goBack();await snap('navigation-back',1200);
  for(const slug of ['ReoNaCalendar2022','SumireHanaTen','YanagiharaYoichiroSaiseiJinta','acidandroid2010-2018']) {
    await page.goto('https://nirnor.jp/works/'+slug,{waitUntil:'domcontentloaded'});await snap(slug+'-top',2200);
    const data=await page.evaluate(()=>({height:document.documentElement.scrollHeight,text:document.body.innerText,iframes:[...document.querySelectorAll('iframe')].map(e=>e.src),images:document.querySelectorAll('img').length,canvas:document.querySelectorAll('canvas').length,buttons:[...document.querySelectorAll('button')].map(e=>e.innerText)}));
    await fs.writeFile(`evidence/source/${slug}.json`,JSON.stringify(data,null,2));
    await fs.writeFile(`evidence/source/${slug}.html`,await page.content());
    for(let i=1;i<=Math.min(6,Math.ceil(data.height/1000));i++){await page.mouse.wheel(0,1000);await snap(slug+'-'+i,600);}
    console.log(slug,data.height,data.iframes,data.buttons);
  }
  await page.goto('https://nirnor.jp/contact',{waitUntil:'domcontentloaded'});await snap('contact-top',1800);
  await fs.writeFile('evidence/source/contact-dom.html',await page.content());
  console.log('contact',await page.locator('body').innerText());
  await page.mouse.wheel(0,650);await snap('contact-bottom',800);
  await page.goto('https://nirnor.jp/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1600);
  await page.setViewportSize({width:390,height:844});await snap('mobile-home',1500);
  await page.locator('header button').click();await snap('mobile-menu',500);await page.locator('header button').click();await snap('mobile-menu-closed',500);
  await page.mouse.wheel(0,2400);await snap('mobile-scroll',1500);
  await page.setViewportSize({width:768,height:1024});await snap('tablet-resize',1000);
  await page.setViewportSize({width:1440,height:1000});await page.reload();await snap('home-reload',100);await snap('home-reload-complete',2000);
  console.log('tour complete');
}
await fs.writeFile(`evidence/source/${mode}-dom.html`, await page.content());
console.log('errors:', errors);
await browser.close();
