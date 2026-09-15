import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Cindy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  const page=await browser.newPage();await page.setContent('<html><body><canvas width="640" height="360"></canvas></body></html>');
  const base64=await page.evaluate(async()=>{
    const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
    const stream=canvas.captureStream(30);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:600000});const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
    const finished=new Promise(resolve=>{recorder.onstop=async()=>{const blob=new Blob(chunks,{type:'video/webm'});const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);};});
    const start=performance.now();let frame;function draw(now){const t=(now-start)/1000;ctx.fillStyle='#18281f';ctx.fillRect(0,0,640,360);ctx.save();ctx.translate(320,180);ctx.rotate(t*Math.PI/2);for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(0,0,50+i*10,90+i*3,i*.08,0,Math.PI*2);ctx.strokeStyle=i%2?'#e6f6be':'#8eb188';ctx.lineWidth=2;ctx.stroke();}ctx.restore();ctx.fillStyle='#d8e8bf';ctx.font='12px monospace';ctx.fillText('FORM / ORIGINAL MOTION STUDY',24,32);ctx.fillText('04 SECONDS / LOOP',24,335);frame=requestAnimationFrame(draw);}
    draw(start);recorder.start();await new Promise(r=>setTimeout(r,4000));recorder.stop();cancelAnimationFrame(frame);stream.getTracks().forEach(t=>t.stop());return await finished;
  });
  await fs.mkdir('assets',{recursive:true});await fs.writeFile('assets/motion-study.webm',Buffer.from(base64,'base64'));console.log('自製 4 秒 WebM 已產生。');
}finally{await browser.close();}
