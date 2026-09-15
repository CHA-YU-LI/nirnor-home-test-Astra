import {artwork} from './art.js';
const images=Array.from({length:6},()=>null);
export function panel(index){const face=document.createElement('div');face.className='fx-face';images[index%6]??=artwork(index%6,400).toDataURL();face.style.backgroundImage=`url("${images[index%6]}")`;face.setAttribute('aria-hidden','true');return face;}
export function solidCube(parent,index=0){const box=document.createElement('div');box.className='fx-cube';['translateZ(var(--half))','rotateY(180deg) translateZ(var(--half))','rotateY(90deg) translateZ(var(--half))','rotateY(-90deg) translateZ(var(--half))','rotateX(90deg) translateZ(var(--half))','rotateX(-90deg) translateZ(var(--half))'].forEach((transform,i)=>{const face=panel(i+index);face.style.transform=transform;box.append(face);});parent.append(box);return box;}
export function cubeNet(parent,variant='art'){
  // Parent / edge / phase. The 5 layouts retain distinct staged opening paths.
  const trees={art:[[0,'top',1],[0,'left',1],[0,'right',1],[0,'bottom',1],[4,'bottom',2]],digital:[[0,'top',1],[0,'left',1],[0,'bottom',1],[1,'right',2],[2,'left',2]],graphic:[[0,'top',1],[0,'left',1],[0,'right',1],[0,'bottom',1],[1,'top',2]],logo:[[0,'top',1],[0,'left',1],[0,'bottom',1],[1,'right',2],[4,'right',3]],movie:[[0,'top',1],[0,'left',1],[0,'bottom',1],[1,'right',2],[4,'top',3]]};
  const group=document.createElement('div');group.className='fx-net';const first=document.createElement('div');first.className='fx-net-node';first.append(panel(0));group.append(first);const nodes=[first],hinges=[];
  for(const [i,edge,phase] of trees[variant]||trees.art){const hinge=document.createElement('div');hinge.className=`fx-hinge fx-hinge--${edge}`;const node=document.createElement('div');node.className='fx-net-node';node.append(panel(nodes.length));hinge.append(node);nodes[i].append(hinge);nodes.push(node);hinges.push({hinge,phase,edge});}
  parent.append(group);return {group,hinges};
}
