import {instance,scope} from '../../js/library/runtime.js';
import {threeStage} from '../../js/library/three-stage.js';
export function init(root,options={}){return instance(root,{grid:20,interval:8.33,expansion:10},options,(el,p)=>{
  let gpu,mesh,ctx,manual=null,angle=0;
  const points=[];for(let z=0;z<p.grid;z++)for(let y=0;y<p.grid;y++)for(let x=0;x<p.grid;x++)points.push((x/(p.grid-1)-.5)*2.1,(y/(p.grid-1)-.5)*2.1,(z/(p.grid-1)-.5)*2.1);
  function draw(dt,t,reduced){const large=manual??(!reduced&&Math.floor(t/p.interval)%2===1);const scale=large?p.expansion:1;if(!reduced)angle+=dt*.105;
    if(mesh){mesh.rotation.set(angle,angle,angle);mesh.scale.setScalar(scale);gpu.renderer.render(gpu.scene,gpu.camera);}
    else if(ctx){const {width:w,height:h}=ctx.canvas;ctx.clearRect(0,0,w,h);ctx.fillStyle='#fafafabb';for(let i=0;i<points.length;i+=3){const x=points[i],y=points[i+1],z=points[i+2];const xx=x*Math.cos(angle)+z*Math.sin(angle),zz=-x*Math.sin(angle)+z*Math.cos(angle),yy=y*Math.cos(angle)-zz*Math.sin(angle);const q=Math.min(w,h)*.13*scale;ctx.fillRect(w*.5+xx*q,h*.5+yy*q,2,2);}}
    el.dataset.expanded=String(large);
  }
  const life=scope(el,draw);
  threeStage(el,life).then(stage=>{if(!stage)return;gpu=stage;const {THREE,scene,camera}=stage;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));mesh=new THREE.Points(geo,new THREE.PointsMaterial({size:.018,color:0xffffff}));scene.add(mesh);camera.position.z=6;draw(0,0,life.motion.matches);life.refresh();}).catch(()=>{if(life.signal.aborted)return;const canvas=document.createElement('canvas');el.querySelector('canvas').replaceWith(canvas);ctx=canvas.getContext('2d');life.resize(()=>{canvas.width=el.clientWidth;canvas.height=el.clientHeight;draw(0,0,life.motion.matches);});el.dataset.renderer='Canvas 2D';el.querySelector('[data-render-status]').textContent='Canvas 2D · 互動備援';life.refresh();});
  life.on(el.querySelector('[data-expand]'),'click',()=>{manual=el.dataset.expanded!=='true';draw(0,0,life.motion.matches);});
  return {...life,replay(){manual=null;angle=0;life.resetTime();draw(0,0,life.motion.matches);}};
});}
