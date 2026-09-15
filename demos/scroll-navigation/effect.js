import {instance,scope} from '../../js/library/runtime.js';
export function init(root,options={}){return instance(root,{lerp:.1,duration:1.5},options,(el,p)=>{
  const scroller=el.querySelector('[data-scroller]'),content=el.querySelector('[data-scroll-content]'),buttons=[...el.querySelectorAll('[data-jump]')],sections=[...el.querySelectorAll('[data-section]')],header=el.querySelector('[data-scroll-header]');let lenis=null;
  const life=scope(el,(dt,t)=>lenis?.raf(t*1000));
  function update(){const top=scroller.getBoundingClientRect().top;let active=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=top+150)active=i;});buttons.forEach((b,i)=>{b.setAttribute('aria-current',i===active?'location':'false');});header.dataset.dark=String(active===1);el.dataset.active=String(active);}
  life.on(scroller,'scroll',update,{passive:true});life.resize(update);
  buttons.forEach((button,i)=>life.on(button,'click',()=>{const position=sections[i].offsetTop-content.offsetTop-100;if(lenis&&!life.motion.matches)lenis.scrollTo(position,{duration:p.duration});else scroller.scrollTop=position;update();}));
  async function setup(){lenis?.destroy();lenis=null;if(life.motion.matches)return;try {const {default:Lenis}=await import('https://cdn.jsdelivr.net/npm/lenis@1.3.21/dist/lenis.mjs');if(life.signal.aborted||life.motion.matches)return;lenis=new Lenis({wrapper:scroller,content,autoRaf:false,lerp:p.lerp,syncTouch:false});el.querySelector('[data-scroll-status]').textContent='Lenis 1.3.21 · 慣性捲動';life.refresh();}catch{el.querySelector('[data-scroll-status]').textContent='原生捲動 · CDN 無法使用';}}
  life.on(life.motion,'change',setup);life.add(()=>lenis?.destroy());setup();life.refresh();return {...life,replay(){lenis?.scrollTo(0,{immediate:true});scroller.scrollTop=0;update();}};
});}
