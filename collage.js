'use strict';
window.MV_COLLAGE={};
window.MV_ASSETS_READY=Promise.all(['sneaker','backpack','heart','phone','chair','map','clock','sun','heart-open','phone-back','backpack-closed','pocket','pencil','street','moon','paper-warm','paper-mint','paper-blue','paper-coral','paper-yellow','paper-lilac','question','exclamation','type-effort-v2','type-own-v2'].map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{window.MV_COLLAGE[name]=im;window.MV_LOAD.done();resolve()};im.onerror=()=>reject(new Error('素材加载失败：'+name));im.src=window.MV_EMBEDDED?.[name]||'assets/collage/'+name+'.webp'})));

// Small reusable wax-grain tile, drawn once and shared by filled paper shapes.
{const tile=document.createElement('canvas');tile.width=tile.height=128;const q=tile.getContext('2d');for(let i=0;i<360;i++){const x=(Math.sin(i*17.2)*.5+.5)*128,y=(Math.sin(i*29.7)*.5+.5)*128;q.strokeStyle=i%3?'#fff6df':'#3d3557';q.globalAlpha=i%3?.5:.2;q.lineWidth=.5+i%2;q.beginPath();q.moveTo(x,y);q.lineTo(x+2+i%8,y-2-i%5);q.stroke()}window.MV_CRAYON=q.createPattern(tile,'repeat')}

window.MV_GLYPHS={"type-effort-v2": [[44, 89, 479, 543], [601, 110, 511, 506], [1169, 106, 417, 497], [1690, 87, 436, 555]], "type-own-v2": [[41, 90, 525, 545], [650, 93, 369, 532], [1153, 127, 458, 487], [1657, 80, 494, 550]]};

window.MV_TRIMS={"question": [451, 20, 634, 974], "exclamation": [617, 28, 308, 959]};
