import {artwork} from './art.js';

// Lightweight, decorative demonstrations. Geometry and timings use a fixed
// 640 × 400 drawing space; labels and controls remain semantic HTML outside it.
const W=640,H=400,TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const posters=[];
const art=i=>posters[i]??=artwork(i,400);
const captions={
  'blink-type':'字元閃爍 → 完整文字',
  'chaos-attractor':'粒子自轉 → 流形變換',
  'orbit-cubes':'三種尺度 · 公轉與自轉',
  'unfold-cube':'旋轉 → 擺正 → 鉸鏈展開',
  'lattice-pulse':'立體點陣 · 密集 ↔ 膨脹',
  'pixel-stretch':'掃描邊緣拉伸 → 影像還原',
  'service-slider':'切換服務 → 媒體垂直滑動',
  'topics-accordion':'消息展開 ↔ 收合',
  'mobile-menu':'雙線變叉號 → 選單進場',
  'link-feedback':'方向底線 · 箭頭接力',
  'page-transition':'舊頁淡出 → 新頁淡入',
  'scroll-navigation':'捲動 → 目錄與導覽換色',
  'video-reveal':'封面退場 → 播放示意',
  'contact-controls':'選項勾選 → 輸入焦點',
  'works-gallery':'分類切換 → 重排與揭露',
  'home-sequence':'文字 → 方塊 → 展開 → 粒子'
};

function painter(ctx,palette){
  const {ink,muted,accent,bg,surface,line}=palette;
  const rect=(x,y,w,h,color=surface)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const text=(value,x,y,size=26,color=ink)=>{ctx.fillStyle=color;ctx.font=`${size}px Arial, sans-serif`;ctx.fillText(value,x,y);};
  const stroke=(points,color=accent,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  const dot=(x,y,r=2,color=accent)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();};
  const lines=(x,y,width,count=3)=>{for(let i=0;i<count;i++)rect(x,y+i*17,width*(i===count-1?.65:1),3,muted);};
  const pointer=(x,y,click=false)=>{ctx.save();ctx.translate(x,y);ctx.fillStyle=ink;ctx.strokeStyle=bg;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(5,29);ctx.lineTo(12,20);ctx.lineTo(24,19);ctx.closePath();ctx.fill();ctx.stroke();if(click){ctx.strokeStyle=accent;ctx.beginPath();ctx.arc(0,0,19,0,TAU);ctx.stroke();}ctx.restore();};
  const project=([x,y,z],angle=0,cx=320,cy=204,scale=1)=>{
    const X=x*Math.cos(angle)+z*Math.sin(angle),Z=z*Math.cos(angle)-x*Math.sin(angle);
    const Y=y*.91-Z*.41,depth=y*.41+Z*.91,p=700/(700+depth);
    return [cx+X*p*scale,cy+Y*p*scale,depth];
  };
  const face=(points,index)=>{
    const [a,b,,d]=points;
    ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
    ctx.transform((b[0]-a[0])/400,(b[1]-a[1])/400,(d[0]-a[0])/400,(d[1]-a[1])/400,a[0],a[1]);ctx.drawImage(art(index),0,0);ctx.restore();stroke([...points,points[0]],ink,1);
  };
  const cube=(cx,cy,size,angle,index=0)=>{
    const vertices=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>project(v.map(n=>n*size/2),angle,cx,cy));
    [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[4,5,1,0],[3,2,6,7]].map((indices,i)=>({points:indices.map(n=>vertices[n]),i})).sort((a,b)=>b.points.reduce((s,p)=>s+p[2],0)-a.points.reduce((s,p)=>s+p[2],0)).forEach(f=>face(f.points,(index+f.i)%6));
  };
  const stretch=(index,x,y,w,h,progress)=>{
    const source=art(index),cut=Math.max(1,Math.round(400*clamp(progress))),dest=w*cut/400;
    ctx.drawImage(source,0,0,cut,400,x,y,dest,h);
    if(dest<w)ctx.drawImage(source,Math.min(cut,399),0,1,400,x+dest,y,w-dest,h);
  };
  const blink=(t,label='MOTION',x=97,y=224,size=78)=>{
    let left=x;ctx.font=`${size}px Arial, sans-serif`;
    [...label].forEach((char,i)=>{const age=t-((i*7)%11)*.075;ctx.globalAlpha=age<0?.08:age>.85?1:Math.sin(age*35+i)>0?1:.08;text(char,left,y,size);left+=ctx.measureText(char).width+3;});ctx.globalAlpha=1;
  };
  const chaos=t=>{
    const morph=ease((Math.sin(t*.8)+1)/2);
    for(let i=0;i<1800;i++){
      const a=i*2.39996,r=Math.sqrt(i/1800),wave=Math.sin(a*3+r*8);
      const x=(Math.cos(a)*(70+r*110))*(1-morph)+Math.sin(a*2)*150*morph;
      const y=Math.sin(a)*r*120*(1-morph)+wave*85*morph;
      const z=Math.sin(a*2)*55*(1-morph)+Math.cos(a*3)*70*morph;
      const p=project([x,y,z],t*.2);dot(p[0],p[1],1.05,i%5?accent:ink);
    }
  };
  const orbit=t=>{
    [0,1,2].map(i=>({i,a:t*.45+i*TAU/3})).sort((a,b)=>Math.sin(a.a)-Math.sin(b.a)).forEach(({i,a})=>cube(320+Math.cos(a)*145,202+Math.sin(a)*45,120-i*32,t*.5+i,i));
  };
  const unfold=t=>{
    const open=ease((t-1.3)/1.2),tail=ease((t-2.5)/.8),angle=(1-open)*(.5+t*.2),s=62,q=Math.PI/2*(1-open);
    const base=[[-s/2,-s/2,0],[s/2,-s/2,0],[s/2,s/2,0],[-s/2,s/2,0]];
    const panels=[base];
    for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]]){
      panels.push(base.map(([x,y])=>dx?[dx*s/2+(x+dx*s/2)*Math.cos(q),y,-(dx*x+s/2)*Math.sin(q)]:[x,dy*s/2+(y+dy*s/2)*Math.cos(q),-(dy*y+s/2)*Math.sin(q)]));
    }
    panels.push(base.map(([x,y])=>[x,s/2+s*Math.cos(q)+(y+s/2)*Math.cos(q+Math.PI/2*(1-tail)),-s*Math.sin(q)-(y+s/2)*Math.sin(q+Math.PI/2*(1-tail))]));
    panels.map((points,i)=>({i,points:points.map(v=>project(v,angle,320,178,1.22))})).sort((a,b)=>b.points.reduce((s,p)=>s+p[2],0)-a.points.reduce((s,p)=>s+p[2],0)).forEach(p=>face(p.points,p.i));
  };
  const lattice=t=>{
    const scale=t%5<2.5?1:2.7;
    for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++)for(let z=-4;z<=4;z++){
      const p=project([x*18*scale,y*18*scale,z*18*scale],t*.22);if(p[1]>64&&p[1]<332)dot(p[0],p[1],1.5);
    }
  };
  const service=t=>{
    const step=t/1.8,active=Math.floor(step)%3,previous=(active+2)%3,move=ease((step%1)*3);
    ctx.save();ctx.beginPath();ctx.rect(54,88,215,230);ctx.clip();
    ctx.drawImage(art(previous),54,88-move*230,215,230);ctx.drawImage(art(active),54,318-move*230,215,230);ctx.restore();
    let y=106;['ART DIRECTION','DIGITAL','MOVIE'].forEach((label,i)=>{text(label,305,y,24,i===active?accent:muted);stroke([[305,y+14],[580,y+14]],line);if(i===active){lines(305,y+34,220,3);y+=70;}y+=51;});pointer(535,112+active*52,move<.5);
  };
  const topics=t=>{
    const open=ease(Math.sin(t*1.3)*2+.5),y=131+open*105;
    text('01  MOTION STUDY',67,110,29);text(open>.5?'−':'+',546,110,30,accent);
    ctx.save();ctx.beginPath();ctx.rect(67,127,470,open*94);ctx.clip();lines(67,145,365,4);ctx.restore();
    stroke([[60,y],[580,y]],line);text('02  NEW EXPLORATION',67,y+44,27,muted);text('+',546,y+44,30);pointer(534,112,open>.2&&open<.8);
  };
  const menu=t=>{
    const open=t%5>1&&t%5<4.2,amount=ease((t%5-1)*3)*(1-ease((t%5-4)*5));
    rect(60,73,520,251);text('NIRNOR',85,113,24);rect(60,133,520,191,open?muted:bg);
    ctx.save();ctx.translate(536,104);[-1,1].forEach(sign=>{ctx.save();ctx.translate(0,sign*6*(1-amount));ctx.rotate(sign*amount*Math.PI/4);stroke([[-15,0],[15,0]],ink,2);ctx.restore();});ctx.restore();
    if(open){ctx.save();ctx.fillStyle=bg;['WORKS','ABOUT','CONTACT'].forEach((label,i)=>{ctx.globalAlpha=clamp((t%5-1-i*.15)*4);text(label,91,179+i*54,34,bg);});ctx.restore();}else text('DESIGN IN MOTION',90,233,32);
    pointer(542,112,amount>.1&&amount<.9);
  };
  const feedback=t=>{
    text('VIEW ALL WORKS',129,177,36);const p=t%3/3;
    ctx.save();ctx.beginPath();ctx.rect(129,191,344,9);ctx.clip();rect(129+(p<.6?-1+ease(p/.6):ease((p-.6)/.4))*344,191,344,2,accent);ctx.restore();
    const y=243+Math.sin(t*3)*12;stroke([[317,y-17],[317,y+19]],accent,3);stroke([[302,y+5],[317,y+20],[332,y+5]],accent,3);pointer(437,181,p<.2);
  };
  const transition=t=>{
    const phase=t%6,second=phase>=3,local=phase%3,opacity=clamp(local/.55)*(1-clamp((local-2.4)/.6));
    ctx.save();ctx.globalAlpha=opacity;rect(56,78,528,245,second?ink:surface);text(second?'WORKS / B':'HOME / A',85,127,28,second?bg:accent);ctx.drawImage(art(second?1:0),second?355:85,152,142,142);lines(second?85:266,183,210,4);ctx.restore();
    pointer(533,297,local>2.2);
  };
  const scroll=t=>{
    const progress=(1-Math.cos(t*.85))/2,offset=progress*375;
    ctx.save();ctx.beginPath();ctx.rect(54,78,532,244);ctx.clip();
    for(let i=0;i<3;i++){const y=78+i*200-offset;rect(54,y,532,200,i%2?ink:surface);text(['OUTLINE','GRAPHIC','TEAM'][i],241,y+94,34,i%2?bg:ink);}
    rect(54,78,532,38,offset>170&&offset<370?ink:bg);text('NIRNOR',70,106,23,offset>170&&offset<370?bg:accent);
    rect(66,133,150,156,bg);['Outline','Graphic','Team'].forEach((label,i)=>text(label,78,169+i*43,24,Math.round(progress*2)===i?accent:muted));ctx.restore();rect(577,86+progress*157,3,65,accent);
  };
  const video=t=>{
    const play=t%6>1.4;ctx.drawImage(art(3),65,78,510,243);
    if(play){ctx.save();ctx.translate(320,195);ctx.rotate(t);stroke([[-65,-65],[65,-65],[65,65],[-65,65],[-65,-65]],ink,5);ctx.restore();rect(65,287,510,34,bg);text('Ⅱ',81,313,26);rect(120,302,420,3,muted);rect(120,302,420*(t%6-1.4)/4.6,3,accent);}
    else {dot(320,198,42,bg);ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(310,179);ctx.lineTo(338,198);ctx.lineTo(310,217);ctx.fill();pointer(331,214,t%6>1);}
  };
  const contact=t=>{
    text('PROJECT TYPE',75,107,25,muted);['Design','Motion'].forEach((label,i)=>{const checked=t%5>i+1;ctx.strokeStyle=checked?accent:muted;ctx.lineWidth=2;ctx.beginPath();ctx.arc(88+i*250,155,13,0,TAU);ctx.stroke();if(checked){dot(88+i*250,155,13);stroke([[81+i*250,155],[86+i*250,160],[95+i*250,149]],bg,2);}text(label,113+i*250,163,27);});
    text('NAME',75,232,23,muted);const focused=t%5>2.5;text(focused?'Motion studio'.slice(0,Math.floor((t%5-2.5)*10)):'',75,276,28);stroke([[75,289],[552,289]],focused?accent:muted,focused?3:1);pointer(focused?370:100+(t%5>2?250:0),focused?270:163,t%1<.2);
  };
  const gallery=t=>{
    const phase=t%6,filtered=phase>3;
    text('ALL',67,103,25,filtered?muted:accent);text('GRAPHIC',166,103,25,filtered?accent:muted);rect(filtered?166:67,117,filtered?119:45,2,accent);
    const ids=filtered?[1,3]:[0,1,2,3,4,5];ids.forEach((id,i)=>stretch(id,67+(i%3)*171,144+Math.floor(i/3)*92,155,81,ease((phase%3)*.8-i*.07)));pointer(filtered?245:106,110,phase%3<.3);
  };
  const home=t=>{
    const phase=Math.floor(t/2.5)%4,local=t%2.5;
    [()=>blink(local,'NIRNOR',116,219,67),()=>orbit(t),()=>unfold(local*1.8),()=>chaos(t)][phase]();
    ['HERO','WORKS','CATEGORY','ABOUT'].forEach((label,i)=>text(label,63+i*147,318,20,i===phase?accent:muted));
  };
  const scenes={
    'blink-type':t=>{blink(t%4);text('DESIGN IN EVERY DETAIL',100,268,22,muted);},
    'chaos-attractor':chaos,'orbit-cubes':orbit,'unfold-cube':t=>unfold(t%5),
    'lattice-pulse':lattice,'pixel-stretch':t=>stretch(1,52,76,536,250,ease((t%4)/2.6)),
    'service-slider':service,'topics-accordion':topics,'mobile-menu':menu,
    'link-feedback':feedback,'page-transition':transition,'scroll-navigation':scroll,
    'video-reveal':video,'contact-controls':contact,'works-gallery':gallery,'home-sequence':home
  };
  return (slug,t)=>{ctx.clearRect(0,0,W,H);rect(0,0,W,H,bg);scenes[slug]?.(t);};
}

export function createPreviews(grid,toggle){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let entries=[],frame=0,last=0,paused=false;
  const observer=new IntersectionObserver(changes=>{for(const change of changes){const entry=entries.find(e=>e.canvas===change.target);if(entry)entry.visible=change.isIntersecting;}schedule();},{threshold:.01});
  function schedule(){
    cancelAnimationFrame(frame);frame=0;last=0;
    if(!paused&&!motion.matches&&!document.hidden&&entries.some(e=>e.visible))frame=requestAnimationFrame(tick);
  }
  function tick(now){
    const dt=last?Math.min((now-last)/1000,.1):0;last=now;
    for(const entry of entries)if(entry.visible){entry.time+=dt;entry.draw(entry.slug,entry.time);}
    frame=requestAnimationFrame(tick);
  }
  function update(){
    toggle.textContent=motion.matches?'已減少動態效果':paused?'播放縮圖動畫':'暫停縮圖動畫';
    toggle.disabled=motion.matches;toggle.setAttribute('aria-pressed',String(paused||motion.matches));
    if(motion.matches)entries.forEach(e=>e.draw(e.slug,3.3));schedule();
  }
  const onToggle=()=>{paused=!paused;update();};
  toggle.addEventListener('click',onToggle);motion.addEventListener('change',update);document.addEventListener('visibilitychange',schedule);
  function reset(){observer.disconnect();cancelAnimationFrame(frame);frame=0;entries=[];}
  function refresh(){
    reset();
    const styles=getComputedStyle(grid),palette=Object.fromEntries(['ink','muted','accent','bg','surface','line'].map(key=>[key,styles.getPropertyValue(`--preview-${key}`).trim()]));
    grid.querySelectorAll('[data-preview]').forEach(host=>{
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.className='lib-preview-canvas';canvas.setAttribute('aria-hidden','true');
      const ctx=canvas.getContext('2d');if(!ctx)return;
      const draw=painter(ctx,palette);draw(host.dataset.preview,3.3);
      host.prepend(canvas);host.classList.add('has-animation');
      entries.push({canvas,slug:host.dataset.preview,draw,time:0,visible:false});observer.observe(canvas);
    });update();
  }
  return {reset,refresh,destroy(){reset();toggle.removeEventListener('click',onToggle);motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',schedule);}};
}

export const previewCaption=slug=>captions[slug]||'動畫示意';
