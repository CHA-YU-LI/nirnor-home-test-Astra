import {instance,scope,reveal} from '../../js/library/runtime.js';
import {init as imageEffect} from '../pixel-stretch/effect.js';
export function init(root,options={}){return instance(root,{duration:1},options,(el,p)=>{
  const life=scope(el),buttons=[...el.querySelectorAll('[data-filter]')],cards=[...el.querySelectorAll('[data-card]')];let effects=[];
  function select(category){effects.forEach(e=>e.destroy());effects=[];buttons.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.filter===category));reveal(life,b.querySelector('span'),{spread:500});});cards.forEach((card,i)=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden)effects.push(imageEffect(card.querySelector('[data-image]'),{duration:p.duration,art:i}));});el.dataset.filter=category;const url=new URL(location.href);url.searchParams.set('category',category);history.replaceState(history.state,'',url);}
  buttons.forEach(b=>life.on(b,'click',()=>select(b.dataset.filter)));life.add(()=>effects.forEach(e=>e.destroy()));let first=new URL(location.href).searchParams.get('category');if(!buttons.some(b=>b.dataset.filter===first))first='all';select(first);life.refresh();return {...life,replay(){select('all');},pause(value){life.pause(value);effects.forEach(e=>e.pause(value));}};
});}
