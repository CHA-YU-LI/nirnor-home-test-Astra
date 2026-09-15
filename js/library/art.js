// Original geometric studies. Reusable Canvas 2D source, no remote image rights.
const palettes=[['#143330','#c5dd8e','#ebeee1'],['#283849','#9eb8ca','#e9aa89'],['#332522','#e7a681','#efddad'],['#30283d','#bcb0d9','#e4efd8'],['#33352e','#cfc09a','#ededdf'],['#142931','#93c3c9','#f1a06e']];
export function artwork(index=0,size=800) {
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const c=canvas.getContext('2d');const [bg,fg,ink]=palettes[index%palettes.length];
  c.fillStyle=bg;c.fillRect(0,0,size,size);
  const gradient=c.createLinearGradient(0,size,size,0);gradient.addColorStop(0,bg);gradient.addColorStop(1,fg);
  c.fillStyle=gradient;c.fillRect(size*.08,size*.08,size*.84,size*.84);
  c.save();c.translate(size*.5,size*.48);c.rotate((index%3-1)*.3);
  for(let j=0;j<14;j++){c.strokeStyle=j%2?ink:fg;c.lineWidth=size*(.01+j*.0005);c.beginPath();c.ellipse(0,0,size*(.08+j*.021),size*(.25+j*.007),.38,0,Math.PI*2);c.stroke();}
  c.restore();c.fillStyle=ink;c.font=`${size*.035}px monospace`;c.fillText(`FORM / ${String(index+1).padStart(2,'0')}`,size*.1,size*.15);
  c.font=`italic ${size*.14}px Georgia`;c.fillText(['still','echo','forms','field','trace','orbit'][index%6],size*.1,size*.86);
  c.font=`${size*.018}px monospace`;c.fillText('INDEPENDENT MOTION STUDY',size*.1,size*.93);
  return canvas;
}
export function paintPosters(root) {
  root.querySelectorAll('[data-art]').forEach((el,i)=>{const art=artwork(Number(el.dataset.art)||i,600);el.style.backgroundImage=`url("${art.toDataURL()}")`;});
}
