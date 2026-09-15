import {instance,scope} from '../../js/library/runtime.js';
export function init(root,options={}){return instance(root,{duration:300,loop:2},options,(el,p)=>{
  const life=scope(el);el.style.setProperty('--duration',`${p.duration}ms`);el.style.setProperty('--loop',`${p.loop}s`);
  el.querySelectorAll('[data-local-link]').forEach(link=>life.on(link,'click',e=>{e.preventDefault();el.querySelector('[data-feedback]').textContent=`已選擇 ${link.textContent.trim()}`;}));life.refresh();return {...life,replay(){el.querySelector('[data-feedback]').textContent='移入連結，觀察底線方向。';const arrow=el.querySelector('.fx-scroll-arrow');arrow.getAnimations().forEach(a=>a.currentTime=0);}};
});}
