import {instance,scope} from '../../js/library/runtime.js';
export function init(root,options={}){return instance(root,{duration:150},options,(el,p)=>{
  const life=scope(el),form=el.querySelector('form'),status=el.querySelector('[data-form-status]');el.style.setProperty('--duration',`${p.duration}ms`);
  life.on(form,'submit',event=>{event.preventDefault();if(form.reportValidity())status.textContent='欄位格式正確。資料僅存在此頁，未送出。';});life.on(form,'input',()=>{status.textContent='';});life.refresh();return {...life,replay(){form.reset();status.textContent='已清空展示欄位。';}};
});}
