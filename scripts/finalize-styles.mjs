import fs from 'node:fs/promises';
import {catalog} from '../js/library/catalog.js';
for(const item of catalog){const file=`demos/${item.slug}/effect.scss`;let text=await fs.readFile(file,'utf8');text=text.replace('height:100%;','height:var(--effect-height,640px);');if(item.slug==='mobile-menu')text=text.replace('--duration:300ms;','');await fs.writeFile(file,text);}
