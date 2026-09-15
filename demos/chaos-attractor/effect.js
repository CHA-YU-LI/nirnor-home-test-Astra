import {instance,scope,clamp} from '../../js/library/runtime.js';
import {threeStage} from '../../js/library/three-stage.js';
function attractor(count,second) {
  const a=second?[-.918,1.541,2.28,1.364,1.946,-.202]:[-1.339,-2.565,-2.527,1.814,3.542,.311];
  const positions=new Float32Array(count*3);let x=0,y=0,z=0;
  for(let i=0;i<count+100;i++){const nextX=Math.sin(a[0]*y)-Math.cos(a[1]*x);const nextY=Math.sin(a[2]*x)-Math.cos(a[3]*y);z=Math.sin(a[4]*x)-Math.cos(a[5]*z);x=nextX;y=nextY;if(i>=100){let n=(i-100)*3;positions[n]=x*2+(second?.65:-.65);positions[n+1]=y*2;positions[n+2]=z*2;}}
  return positions;
}
export function init(root,options={}) {
  return instance(root,{count:100000,duration:1.5,speed:1},options,(el,p)=>{
    const count=Math.min(p.count,matchMedia('(max-width:760px)').matches?80000:360000);
    const a=attractor(count,false),b=attractor(count,true);
    let gpu,mesh,material,ctx,progress=0,target=0,angle=0;
    const scroller=el.querySelector('[data-scroller]');
    function draw(dt,time,reduced){
      const step=reduced?1:dt/Math.max(.1,p.duration);progress+=clamp(target-progress,-step,step);if(!reduced)angle+=dt*.035*p.speed;
      if(gpu&&mesh){material.uniforms.uMorph.value=progress;mesh.rotation.set(angle*.65,angle,0);gpu.renderer.render(gpu.scene,gpu.camera);}
      else if(ctx){const {width:w,height:h}=ctx.canvas;ctx.clearRect(0,0,w,h);ctx.fillStyle='#5b635b55';const unit=Math.max(w,h)*.1;const stride=Math.max(1,Math.ceil(count/16000));for(let i=0;i<count;i+=stride){const n=i*3;const x=a[n]*(1-progress)+b[n]*progress,y=a[n+1]*(1-progress)+b[n+1]*progress,z=a[n+2]*(1-progress)+b[n+2]*progress;ctx.fillRect(w*.5+(x*Math.cos(angle)+z*Math.sin(angle))*unit,h*.5-y*unit,1,1);}}
      el.dataset.progress=progress.toFixed(3);
    }
    const life=scope(el,draw);
    function fallback(){if(life.signal.aborted)return;const old=el.querySelector('canvas');const canvas=document.createElement('canvas');old.replaceWith(canvas);ctx=canvas.getContext('2d');life.resize(()=>{canvas.width=el.clientWidth;canvas.height=el.clientHeight;draw(0,0,life.motion.matches);});el.dataset.renderer='Canvas 2D';el.querySelector('[data-render-status]').textContent='Canvas 2D · 互動備援';life.refresh();}
    threeStage(el,life).then(stage=>{
      if(!stage)return;gpu=stage;const {THREE,scene,camera}=stage;
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(a,3));geometry.setAttribute('aTarget',new THREE.BufferAttribute(b,3));
      material=new THREE.ShaderMaterial({uniforms:{uMorph:{value:0}},vertexShader:'attribute vec3 aTarget; uniform float uMorph; void main(){ vec3 p = position + (aTarget - position) * uMorph; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); gl_PointSize=1.0; }',fragmentShader:'void main(){gl_FragColor=vec4(0.69,0.72,0.68,0.65);}',transparent:true,depthWrite:false});
      mesh=new THREE.Points(geometry,material);mesh.frustumCulled=false;scene.add(mesh);camera.position.z=8;draw(0,0,life.motion.matches);life.refresh();
    }).catch(fallback);
    const setMorph=value=>{target=clamp(Number(value));if(life.motion.matches){progress=target;draw(0,0,true);}};
    if(scroller)life.on(scroller,'scroll',()=>setMorph(scroller.scrollTop>scroller.clientHeight*.6?1:0),{passive:true});
    const button=el.querySelector('[data-morph]');if(button)life.on(button,'click',()=>setMorph(1-target));
    return {...life,setMorph,replay(){angle=0;target=0;progress=0;if(scroller)scroller.scrollTop=0;life.resetTime();draw(0,0,life.motion.matches);}};
  });
}
