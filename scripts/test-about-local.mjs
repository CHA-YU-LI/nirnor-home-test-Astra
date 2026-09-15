import { chromium } from 'file:///C:/Users/Cindy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules/playwright-core/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    const response=await page.goto('http://127.0.0.1:8090/about.html',{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    await page.locator('[data-ready]').waitFor();
    assert.equal(await page.locator('.site-navigation [aria-current="page"]').textContent(),'關於本站');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    const small=await page.locator('.about-page p, .about-page a').evaluateAll(els=>els.filter(el=>parseFloat(getComputedStyle(el).fontSize)<14).map(el=>el.textContent));
    assert.deepEqual(small,[]);
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    assert.equal(await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().top),0);
    if(width<761) {
      await page.locator('.site-menu-toggle').click();
      assert.equal(await page.locator('.site-navigation a').count(),4);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.site-menu-toggle').getAttribute('aria-expanded'),'false');
    }
    if([390,1440].includes(width)) await page.screenshot({path:`evidence/about-${width}.png`,fullPage:true});
    console.log(`PASS about ${width}px`);
  }
  await page.goto('http://127.0.0.1:8090/demos/mobile-menu/');
  await page.locator('.site-navigation a').filter({hasText:'關於本站'}).click();
  await page.waitForURL('**/about.html');
  await page.getByRole('link',{name:'從首頁開始體驗',exact:true}).click();
  await page.waitForURL('**/index.html');
  await page.locator('.site-footer-shared a').filter({hasText:'關於本站'}).click();
  await page.waitForURL('**/about.html');
  await page.getByRole('link',{name:'直接前往特效庫',exact:true}).click();
  await page.waitForURL('**/library.html');
  await page.goto('http://127.0.0.1:8090/index.html#about');
  await page.waitForURL('**/about.html');
  assert.deepEqual(errors,[]);
  console.log('PASS navigation, legacy introduction URL and no uncaught JS errors');
} finally { await browser.close(); }
