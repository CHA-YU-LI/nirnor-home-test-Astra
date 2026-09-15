import {catalog} from './catalog.js';
const grid=document.querySelector('#effect-grid'),search=document.querySelector('#effect-search'),packages=document.querySelector('#package-filter'),tech=document.querySelector('#tech-filter'),categories=document.querySelector('#category-filter');let category='';
const make=(tag,text,className)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};
const technologies=['Web Animations API','CanvasRenderingContext2D','requestAnimationFrame','IntersectionObserver','CSS','ShaderMaterial','Pointer Events','ResizeObserver','HTMLMediaElement','ViewTransition','Lenis','history'];
technologies.forEach(t=>tech.append(new Option(t,t)));
['',...new Set(catalog.map(i=>i.category))].forEach(c=>{const b=make('button',c||'全部效果','lib-chip');b.type='button';b.setAttribute('aria-pressed',String(!c));b.addEventListener('click',()=>{category=c;categories.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render();});categories.append(b);});
function render(){
  const query=search.value.trim().toLocaleLowerCase();const result=catalog.filter(i=>(!category||i.category===category)&&(!packages.value||i.packages.includes(packages.value))&&(!tech.value||i.apis.join(' ').toLowerCase().includes(tech.value.toLowerCase()))&&(!query||[i.name,i.summary,i.trigger,i.evidence,i.category,...i.apis,...i.packages].join(' ').toLocaleLowerCase().includes(query)));
  grid.replaceChildren(...result.map(item=>{
    const card=make('article',null,'lib-card'),preview=make('a',null,'lib-preview');preview.href=`demos/${item.slug}/`;preview.setAttribute('aria-label',`操作 ${item.name}`);
    const img=make('img');img.src=`assets/previews/${item.slug}.png`;img.alt=item.name+'效果預覽';img.loading='lazy';img.width=640;img.height=400;img.addEventListener('error',()=>{img.src=`assets/previews/${item.slug}.svg`;},{once:true});preview.append(img,make('span',item.id),make('b','↗'));
    const body=make('div',null,'lib-card-body');body.append(make('div',item.category,'lib-kicker'));const h=make('h2'),link=make('a',item.name);link.href=preview.href;h.append(link);body.append(h,make('p',item.summary));const tags=make('div',null,'lib-tags');[...item.packages,...item.apis.slice(0,2)].forEach(t=>tags.append(make('span',t,'lib-tag')));body.append(tags,make('small','原站證據已記錄 · 可操作 demo'));card.append(preview,body);return card;
  }));document.querySelector('#result-count').textContent=`${String(result.length).padStart(2,'0')} / ${catalog.length} 個效果`;document.querySelector('#empty-state').hidden=result.length!==0;
}
[search,packages,tech].forEach(el=>el.addEventListener(el===search?'input':'change',render));render();
