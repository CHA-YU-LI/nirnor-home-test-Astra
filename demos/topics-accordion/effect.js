import {instance,scope} from '../../js/library/runtime.js';
export function init(root,options={}){return instance(root,{duration:300},options,(el,p)=>{
  const life=scope(el),button=el.querySelector('[data-topic]'),panel=el.querySelector('[data-topic-panel]');let open=false;
  function render(){button.setAttribute('aria-expanded',String(open));panel.dataset.open=String(open);panel.inert=!open;el.dataset.open=String(open);el.style.setProperty('--duration',`${life.motion.matches?0:p.duration}ms`);}
  life.on(button,'click',()=>{open=!open;render();});life.on(life.motion,'change',render);render();life.refresh();return {...life,replay(){open=false;render();}};
});}
