'use strict';
(() => {
const $=id=>document.getElementById(id),film=$('film'),g=film.getContext('2d'),audio=$('audio'),wave=$('wave'),wg=wave.getContext('2d');
const story=window.MV_STORY,beatData=window.MV_TIMING,scenes=story.scenes,D=story.duration,W=1920,H=1080;
const palette={night:'#fcf6e9',paper:'#3d3557',green:'#4053d8',rose:'#ef8997',muted:'#a89acb'};
const sectionNames={'Verse 1':'第一段 · 夜路','Pre-Hook':'慢一点','Hook':'副歌 · 绷带','Verse 2':'第二段 · 我的方向','Bridge':'灯灭了，天会亮','Final Hook':'最终副歌 · 拆开绷带','Outro':'路，我自己来'};
let t=0,playing=false,raf=0,intensity=matchMedia('(prefers-reduced-motion: reduce)').matches?.4:1,shift=0,loaded=false,recorder=null,recording=false,audioContext=null,mediaSource=null,mix=null,check=false,frames=0;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=n=>1-Math.pow(1-clamp(n),3),smooth=n=>{n=clamp(n);return n*n*(3-2*n)},fract=n=>n-Math.floor(n),rand=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
const accents=[];for(const e of [...beatData.events].filter(e=>e.strength>.64).sort((a,b)=>b.strength-a.strength)){if(accents.every(a=>Math.abs(a.t-e.t)>1.05))accents.push(e)}accents.sort((a,b)=>a.t-b.t);
const clean=s=>s.toLowerCase().replace(/94/g,'九十四').replace(/22/g,'二十二').replace(/儿/g,'').replace(/[^\u4e00-\u9fffa-z0-9]/g,'');
const measureCache=new Map();
function font(size,f='display'){return f==='hand'?`${size}px WenKai,serif`:f==='english'?`italic ${size}px Georgia,serif`:`${size}px Smiley,sans-serif`}
function width(s,size,f='display'){const key=s+'|'+size+'|'+f;if(!measureCache.has(key)){g.font=font(size,f);measureCache.set(key,g.measureText(s).width)}return measureCache.get(key)}
function auditBounds(kind,name,x,y,w,h){if(!window.MV_LAYOUT)return;const t=g.getTransform(),pts=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>[t.a*a+t.c*b+t.e,t.b*a+t.d*b+t.f]);window.MV_LAYOUT.push({kind,name,x:Math.min(...pts.map(p=>p[0])),y:Math.min(...pts.map(p=>p[1])),r:Math.max(...pts.map(p=>p[0])),b:Math.max(...pts.map(p=>p[1]))})}
function txt(s,x,y,size,color,o={}){g.save();g.font=font(size,o.font);g.textAlign=o.align||'center';g.textBaseline='middle';g.fillStyle=color;if(o.alpha!==undefined)g.globalAlpha*=o.alpha;if(o.rotate){g.translate(x,y);g.rotate(o.rotate);x=y=0}if((o.alpha??1)>.2){const w=g.measureText(s).width;auditBounds('text',s,x-(o.align==='left'?0:o.align==='right'?w:w/2),y-size*.55,w,size*1.1)}if(o.stroke){g.strokeStyle=color;g.lineWidth=o.stroke;g.strokeText(s,x,y)}else g.fillText(s,x,y);g.restore()}
function line(x1,y1,x2,y2,color,weight=3,alpha=1){g.save();g.globalAlpha*=alpha;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=weight;g.lineCap='round';g.stroke();g.restore()}
function rect(x,y,w,h,color,alpha=1){g.save();g.globalAlpha*=alpha;g.fillStyle=color;g.fillRect(x,y,w,h);g.restore()}
function path(points,color,weight=3,alpha=1,close=false){g.save();g.globalAlpha*=alpha;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));if(close)g.closePath();g.strokeStyle=color;g.lineWidth=weight;g.lineJoin='round';g.lineCap='round';g.stroke();g.restore()}
function circle(x,y,r,color,weight=3,alpha=1,start=0,end=Math.PI*2){g.save();g.globalAlpha*=alpha;g.beginPath();g.arc(x,y,Math.max(0,r),start,end);g.strokeStyle=color;g.lineWidth=weight;g.stroke();g.restore()}
function timeOf(scene,s){const j=clean(scene.text).indexOf(clean(s));return scene.chars[Math.max(0,j)]?.start??scene.start}
function pulse(time){let p=0;for(const e of accents){const age=time-e.t;if(age>=0&&age<.45)p=Math.max(p,Math.exp(-age/.10)*e.strength)}return p*intensity}
function split(s){const parts=s.split(/[，。—]+/).filter(Boolean);if(parts.length>1)return parts;const cleaned=parts[0]||s;if([...cleaned].length>13){const n=Math.ceil(cleaned.length/2);return [cleaned.slice(0,n),cleaned.slice(n)]}return[cleaned]}
function type(s,x,y,size,color,scene,time,o={}){
const f=o.font||'display',max=o.max||1640;size=Math.min(size,size*max/Math.max(width(s,size,f),1));
const chars=[...s],spacing=o.spacing||0,total=width(s,size,f)+(chars.length-1)*spacing;let cursor=x-total/2;
const found=clean(scene.text).indexOf(clean(s)),base=found>=0?found:0;
chars.forEach((ch,i)=>{const advance=width(ch,size,f),k=base+clean(chars.slice(0,i).join('')).length,tm=Math.min(scene.end-.23,scene.chars[Math.min(k,scene.chars.length-1)]?.start??scene.start);
const a=ease((time-tm+.035)/.16),age=time-tm;if(a<=0){cursor+=advance+spacing;return}
let dy=(1-a)*42*intensity,dx=0,rot=0,scale=1;
if(o.motion==='wind'){dx=Math.sin(time*2.1+i*.4)*12*intensity;dy+=Math.sin(time*1.6-i*.5)*13*intensity;rot=(1-a)*-.14}
if(o.motion==='scatter'){dx=(1-a)*(rand(i+scene.id)*2-1)*160*intensity;dy=(1-a)*(rand(i+28)*2-1)*140*intensity}
if(o.motion==='stamp'){dy=0;scale=1+(1-a)*.22*intensity}
if(o.motion==='tilt')rot=((i%3)-1)*.035*intensity+(1-a)*.13;
if(o.motion==='fold'){dx=(1-a)*100;scale=.6+a*.4}
g.save();g.translate(cursor+advance/2+dx,y+dy);g.rotate(rot);g.scale(scale,scale);txt(ch,0,0,size,age>=0&&age<.15&&o.highlight!==false?palette.rose:color,{font:f,alpha:a});g.restore();cursor+=advance+spacing;
});
}
function sentence(scene,time,ink,opts={}){const parts=opts.parts||split(scene.text),size=opts.size||165,gap=opts.gap||Math.max(210,size*1.2),mid=opts.y??525;const f=opts.font||(scene.section==='Bridge'||scene.section==='Outro'?'hand':'display');parts.forEach((s,i)=>type(s,opts.x??960,mid+(i-(parts.length-1)/2)*gap,size,ink,scene,time,{font:f,motion:opts.motion||'rise',max:opts.max||1650}))}
function caption(scene,time,ink,y=840){type(scene.text,960,y,72,ink,scene,time,{font:'hand',max:1650,highlight:false})}
function arrow(x,y,angle,len,ink,alpha=1){g.save();g.translate(x,y);g.rotate(angle);line(0,0,len,0,ink,5,alpha);path([[len-22,-16],[len,0],[len-22,16]],ink,5,alpha);g.restore()}
function arcWords(s,cx,cy,r,angle,ink,size=52,extent=Math.PI*1.65){const chars=[...s];chars.forEach((ch,i)=>{const a=angle+i/chars.length*extent;g.save();g.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);g.rotate(a+Math.PI/2);txt(ch,0,0,size,ink,{font:'hand'});g.restore()})}
function road(time,ink,progress=1){const y=490;line(860,y,300,990,ink,3,.5);line(1060,y,1640,990,ink,3,.5);for(let i=0;i<8;i++){const p=fract(i/8+time*.12),yy=y+p*p*500;line(960,yy,960,yy+12+p*32,ink,2+p*3,.4)}line(690,490,1230,490,ink,2,.25)}
const noise=document.createElement('canvas');noise.width=noise.height=512;const ng=noise.getContext('2d'),pixels=ng.createImageData(512,512);for(let i=0;i<pixels.data.length;i+=4){const v=rand(i);pixels.data[i]=v>.55?255:90;pixels.data[i+1]=v>.55?250:70;pixels.data[i+2]=v>.55?233:100;pixels.data[i+3]=Math.round(9+v*22)}ng.putImageData(pixels,0,0);for(let i=0;i<850;i++){const x=rand(i+3)*512,y=rand(i+984)*512;ng.strokeStyle=i%3?'#fff8e544':'#765e3922';ng.lineWidth=.4;ng.beginPath();ng.moveTo(x,y);ng.lineTo(x+2+rand(i+61)*9,y-2-rand(i+36)*5);ng.stroke()}const texture=g.createPattern(noise,'repeat');
function background(scene){let dark=scene.section==='Bridge'||scene.section==='Outro'||scene.id%4===0||scene.id%4===3;if(scene.motif==='breathe'||scene.motif==='space')dark=false;const final=scene.section==='Final Hook';return {dark,ink:dark?palette.paper:palette.night,bg:dark?palette.night:(final&&scene.id%3===0?palette.green:palette.paper),accent:dark?palette.green:'#62786b'}}
function chrome(ink){return;txt('绷带',92,69,26,ink,{font:'display',align:'left',alpha:.75});txt('鹤我这豹脾气',1828,69,24,ink,{font:'hand',align:'right',alpha:.75})}
function collageImage(name,x,y,w,angle=0,alpha=1){const im=window.MV_COLLAGE?.[name];if(!im)return;g.save();g.globalAlpha*=alpha;g.translate(x,y);g.rotate(angle);if(alpha>.2)auditBounds('image',name,-w/2,-w*im.height/im.width/2,w,w*im.height/im.width);g.drawImage(im,-w/2,-w*im.height/im.width/2,w,w*im.height/im.width);g.restore()}
function paperGround(name='paper-warm'){const im=window.MV_COLLAGE?.[name];if(im)g.drawImage(im,0,0,W,H)}
function intro(time){rect(0,0,W,H,'#fcf6e9');paperGround();const ink='#3d3557',k=pulse(time),step=Math.floor(time*10)/10;
 if(time<5.2){const a=ease((time-.188)/.5),b=ease((time-.827)/.45);collageImage('heart',1470,550,520,-.06,a);txt('绷',520,510+(1-a)*130,400*(1+k*.035),ink,{alpha:a});txt('带',950+(1-b)*140,510,400,'#4053e5',{alpha:b});txt('鹤我这豹脾气',710,825,49,ink,{font:'hand',alpha:smooth((time-1.1)/.5)});}
 else if(time<10.25){const p=(time-5.2)/5.05;collageImage('backpack',280,570,445,Math.sin(step*2)*.035);collageImage('phone',1660,540,310,.14-p*.15);txt('LET IT',960,360,100,'#4053e5',{font:'english'});txt('BREATHE',960,590,130,ink,{font:'english'});path([[700,835],[970,800+Math.sin(time)*30],[1280,840]],'#f04f6d',18);}
 else if(time<15.35){const p=(time-10.25)/5.1;rect(0,0,W,H,'#e9ef40');collageImage('clock',550,535,640,-.1+p*.18);txt('02:30',1310,460,185,ink,{font:'english'});txt('夜  路  开  始',1320,695,61,ink,{font:'hand'});}
 else{road(time,'#4053e5');const w=Math.sin(step*4.92);collageImage('sneaker',990+w*55,590-Math.max(w,0)*70,770,w*.12);txt('LET IT BREATHE',960,190,49,ink,{font:'english'});}
}
function sceneFrame(scene,time){if(window.MV_ART)return window.MV_ART(g,scene,time,pulse(time),intensity);const {ink,bg,accent}=background(scene);rect(0,0,W,H,bg);const age=time-scene.start,p=clamp(age/Math.max(.3,scene.end-scene.start)),k=pulse(time),q=smooth(p),m=scene.motif;
// Visual accents follow selected strong transients; lyric timing controls the main choreography.
g.save();const gentle=['breathe','space','silence','quiet','wait','pause','enough','resolve'].includes(m);if(!gentle){g.translate(960,540);g.scale(1+k*.016,1+k*.016);g.translate(-960,-540)}
switch(m){
case 'footsteps':{for(let i=0;i<7;i++){const a=clamp(p*9-i);g.save();g.translate(270+i*220,750+(i%2?65:0));g.rotate(-.3+i%2*.6);rect(-22,-50,44,95,accent,a*.45);line(-22,12,22,12,bg,4);g.restore()}txt('02:30',960,395,330,accent,{font:'english',alpha:.18});sentence(scene,time,ink,{size:185,y:490,motion:'stamp'});break}
case 'wind':case 'windwalk':{for(let i=0;i<13;i++){const x=fract(time*(.10+i*.013)+rand(i))*2400-240,y=220+i*55;line(x,y,x+150+rand(i+4)*220,y,accent,2,.25)}sentence(scene,time,ink,{size:185,motion:'wind'});break}
case 'advice':{const tokens=['简单','他们','简单','他们','简单','他们'];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;txt(tokens[i],960+Math.cos(a)*(690-q*120),525+Math.sin(a)*330,55,accent,{font:'hand',alpha:.28})}sentence(scene,time,ink,{size:180,y:510});break}
case 'disorder':{line(210,764,1710,764,accent,2,.4);sentence(scene,time,ink,{size:170,motion:'tilt'});break}
case 'phone':{const flip=Math.max(.07,Math.abs(Math.cos(p*Math.PI))),xx=470,yy=505;g.save();g.translate(xx,yy);g.rotate(-.12);g.scale(1,flip);g.strokeStyle=ink;g.lineWidth=7;g.strokeRect(-160,-265,320,530);line(-100,-217,100,-217,ink,4);circle(0,212,17,ink,4);if(p<.5){rect(-122,-164,244,220,accent,.25);txt('消息',0,-45,63,ink,{font:'hand'})}g.restore();line(190,817,1730,817,accent,4);type('手机扣桌上',1240,380,160,ink,scene,time,{font:'hand',max:930});type('不回',1250,642,310,accent,scene,time,{motion:'stamp',max:1000});break}
case 'notifications':{for(let i=0;i<6;i++){const out=smooth((p-.45)*2),x=370+i*190+out*(i-2)*180,y=265+i%3*140-out*390;g.save();g.globalAlpha=.38*(1-out);g.strokeStyle=accent;g.lineWidth=3;g.strokeRect(x,y,360,94);txt('消息',x+180,y+48,50,accent,{font:'hand'});g.restore()}type('消息太多了',960,454,175,ink,scene,time,{font:'hand'});type('不追',960,695,255,accent,scene,time,{motion:'stamp'});break}
case 'crowd':{for(let i=0;i<24;i++)txt('人',180+i%12*140,225+Math.floor(i/12)*600,36+rand(i)*25,accent,{font:'hand',alpha:.18});sentence(scene,time,ink,{size:162});break}
case 'prove':case 'stamp':{sentence(scene,time,ink,{size:m==='stamp'?340:190,font:'display',motion:'stamp'});line(375,787,375+1170*q,787,accent,10);break}
case 'clock':{txt('22',970,470,510,accent,{font:'english',alpha:.3});for(let i=0;i<32;i++){const a=i/32*Math.PI*2+time*.7;line(960+Math.cos(a)*365,520+Math.sin(a)*365,960+Math.cos(a)*385,520+Math.sin(a)*385,ink,3,.3)}caption(scene,time,ink,812);break}
case 'depart':{const drift=smooth((p-.15)/.65);type('有人离场',605-drift*95,424,180,ink,scene,time,{font:'hand',max:840});type('有人还在',1260,661,180,accent,scene,time,{font:'hand',max:940});line(960,210,960,850,accent,2,.2);break}
case 'pocket':case 'pocketmany':case 'bag':case 'wishes':{const cx=1390,cy=665;path([[cx-155,cy-50],[cx-140,cy+160],[cx,cy+240],[cx+140,cy+160],[cx+155,cy-50]],accent,5);line(cx-160,cy-55,cx+160,cy-55,accent,7);for(let j=0;j<6;j++){const z=clamp(p*1.5-j*.12);if(z>0&&z<1){g.save();g.translate(cx-280+z*280,cy-350+z*500);g.rotate(z*1.1);txt(m==='bag'?'愿望':m==='wishes'?'愿望':'话',0,0,66*(1-z*.6),accent,{font:'hand',alpha:1-z});g.restore()}}sentence(scene,time,ink,{x:785,y:430,size:145,max:1250});break}
case 'unfold':case 'open':case 'own':{const a=ease(p*1.8);g.save();g.translate(960,510);g.scale(.65+.35*a,.3+.7*a);txt(scene.text,0,0,Math.min(230,1500/scene.text.length),ink,{font:'hand',alpha:a});g.restore();line(280,753,280+1360*a,753,accent,4);break}
case 'win':case 'grow':case 'arrive':{line(250,810,1660,810,accent,4);sentence(scene,time,ink,{size:185,y:520-40*q,motion:'stamp'});arrow(1430,816,-.8,190*q,accent,.5);break}
case 'street':case 'road':case 'longroad':case 'path':case 'distance':{road(time,accent);if(m==='path')arrow(650,680,0,560*q,accent,.6);sentence(scene,time,ink,{size:m==='road'?(scene.text.length<4?330:235):160,y:m==='road'?370:350,font:m==='road'?'display':'hand'});break}
case 'face':{circle(1550,660,110,accent,4,.6);circle(1515,640,5,accent,8);circle(1585,640,5,accent,8);const smile=1-smooth(p);path([[1508,695],[1548,695+smile*28],[1590,695]],accent,5);sentence(scene,time,ink,{x:820,y:455,size:165,max:1270});break}
case 'forever':{circle(960,530,330,accent,4,.4,.18,Math.PI*2-.15-q*.7);type(scene.text,960,523,152,ink,scene,time,{font:'hand'});break}
case 'stay':{type('在',1360,492,400,accent,scene,time,{motion:'stamp'});const parts=split(scene.text);type(parts[0],670,385,125,ink,scene,time,{font:'hand',max:850});type(parts[1]||'',690,647,112,ink,scene,time,{font:'hand',max:1000});rect(1510,715,13,35,palette.rose);break}
case 'slow':{type('Okay',500,333,133,ink,scene,time,{font:'english',max:620});type('慢一点',1120,610,320,accent,scene,time,{motion:'fold',max:1200});break}
case 'world':case 'orbit':{arcWords('世 界 世 界 世 界 ',960,535,355,time*.11,accent,55,Math.PI*2);sentence(scene,time,ink,{size:200,font:'hand'});break}
case 'answer':case 'late':case 'future':{const box=650+q*240;path([[960-box,335],[960-box,250],[1060-box,250]],accent,4,.5);path([[960+box,710],[960+box,795],[860+box,795]],accent,4,.5);sentence(scene,time,ink,{size:200,motion:'fold'});break}
case 'wrap':{const final=scene.section==='Final Hook';for(let i=0;i<3;i++){const radius=245+i*68,angle=-.5+time*(i%2?-.15:.14);circle(960,470,radius,accent,35,.10,angle,angle+Math.PI*1.9);arcWords('一圈又一圈 · 一圈又一圈 · 一圈又一圈 · ',960,470,radius,angle,accent,35+i*3,Math.PI*1.94)}type('心事',960,470,220,ink,scene,time,{motion:'stamp'});caption(scene,time,ink,970);if(final)line(1640,550,1810,580,accent,3);break}
case 'crack':case 'heal':{const close=m==='heal'?1-q:1;const pts=[];for(let i=0;i<9;i++)pts.push([960+(rand(i+8)-.5)*130*close,160+i*96]);path(pts,accent,7*close+1,.5);if(m==='crack'){g.save();g.translate(960,530);g.rotate(-.13);rect(-1050+Math.min(1,p*2)*100,12,1900,72,accent,.82);g.restore()}sentence(scene,time,ink,{size:180,y:m==='crack'?360:515});break}
case 'groove':{g.save();g.translate(650,490);g.rotate(Math.sin(time*2.46)*.04*intensity);txt('94',0,0,460,accent,{font:'english'});g.restore();type('BPM',1370,400,180,ink,scene,time,{font:'english',max:670});type('晃过这条街',1320,648,145,ink,scene,time,{font:'hand',max:960});break}
case 'question':case 'ask':{txt('?',1510,489,600,accent,{font:'english',alpha:.25,rotate:.09});sentence(scene,time,ink,{size:m==='ask'?165:200,x:880,max:1500});break}
case 'breathe':{const breath=Math.sin(p*Math.PI)*1.5;type('Let it',960,397,150,ink,scene,time,{font:'english',spacing:4+breath*8,highlight:false});type('breathe',960,641,250,accent,scene,time,{font:'english',spacing:4+breath*12,highlight:false});break}
case 'space':case 'silence':{const parts=split(scene.text);sentence(scene,time,ink,{size:166,y:505,font:'hand',parts});break}
case 'cover':{for(let i=0;i<3;i++){g.save();g.translate(960,535);g.rotate(-.18+i*.09);rect(-820,-160+i*160,1640,70,accent,.2);g.restore()}sentence(scene,time,ink,{size:170});break}
case 'sun':case 'light':{const y=810;g.save();g.beginPath();g.rect(0,0,W,y);g.clip();circle(1440,y+100-q*200,145,accent,4,.6);g.restore();line(165,y,1755,y,accent,3,.4);sentence(scene,time,ink,{size:180,y:420});break}
case 'night':{for(let i=0;i<17;i++){const x=180+rand(i)*1560,y=200+rand(i+77)*500;circle(x,y,1.5,accent,2,.28)}sentence(scene,time,ink,{size:205,y:510});break}
case 'loosen':{const parts=split(scene.text);type(parts[0],960,385,175,ink,scene,time,{font:'hand',spacing:q*8,max:1570});type(parts[1]||'',960,650,168,ink,scene,time,{font:'hand',spacing:q*11,max:1550});for(let i=0;i<5;i++)line(390+i*285-q*30,810,450+i*285+q*30,810,accent,3,.4*(1-q));break}
case 'quiet':{if(scene.section!=='Outro'){for(let i=0;i<4;i++){const a=clamp(1-p*1.6+i*.15);g.save();g.globalAlpha=a*.3;g.strokeStyle=accent;g.lineWidth=3;const x=350+i*380,y=i%2?780:235;g.strokeRect(x,y,180*a+30,65*a+15);g.restore()}}sentence(scene,time,ink,{size:170,font:/[a-z]/i.test(scene.text)?'english':'hand'});break}
case 'pause':{txt('“',310,405,285,accent,{font:'hand',alpha:.4});txt('”',1610,650,285,accent,{font:'hand',alpha:.4});line(830,775,830+260*smooth((p-.55)/.4),775,accent,4);sentence(scene,time,ink,{size:195,font:'hand'});break}
case 'plain':{for(let i=0;i<3;i++){line(310,265+i*30,1610,265+i*30,accent,2,(1-q)*.2);line(310,785+i*30,1610,785+i*30,accent,2,(1-q)*.2)}sentence(scene,time,ink,{size:170,font:'hand'});break}
case 'wait':case 'enough':{sentence(scene,time,ink,{size:m==='wait'?255:285,font:m==='wait'?'english':'hand',y:525});if(m==='enough'&&p>.65)circle(1480,675,13,accent,22);break}
case 'race':{for(let i=0;i<8;i++){const x=fract(time*(.34+i*.06)+i*.15)*2400-300;txt('快',x,240+i*83,55,accent,{font:'hand',alpha:.13})}sentence(scene,time,ink,{size:165});break}
case 'station':{for(let i=0;i<3;i++){const yy=660+i*90;line(155,yy,1770,yy,accent,3,.4);circle(360+q*980,yy,13,accent,4)}sentence(scene,time,ink,{size:160,y:390});break}
case 'reveal':{sentence(scene,time,ink,{size:280,font:'display',motion:'fold'});break}
case 'map':case 'compare':case 'direction':{for(let i=0;i<4;i++){const pts=[];for(let j=0;j<6;j++){const a=clamp(p*6-j);if(a<=0)break;pts.push([180+j*310,690+Math.sin(j*1.4+i*1.3)*180+i*22])}if(pts.length>1)path(pts,i===2?palette.rose:accent,i===2?5:2,i===2?.6:.3)}if(m==='direction')arrow(1300,685,-.65,220*q,accent);sentence(scene,time,ink,{size:170,y:380});break}
case 'write':case 'rewrite':{sentence(scene,time,ink,{size:m==='rewrite'?134:240,font:'hand',motion:'fold'});if(m==='rewrite'){line(260,700,260+1400*smooth((p-.15)*2),660,palette.rose,5,.7);line(320,787,320+1200*smooth((p-.5)*2),787,accent,3)}else line(300,770,300+1320*p,770,accent,3);break}
case 'unfinished':{sentence(scene,time,ink,{size:260,font:'display'});for(let i=0;i<6;i++)rect(360+i*220,823,120,7,accent,i/6<p?.8:.15);break}
case 'big':{const s=clamp((time-timeOf(scene,'大人物'))/.25);txt('大人物',960,520,300+s*80,accent,{alpha:s*.22});sentence(scene,time,ink,{size:130,font:'hand'});break}
case 'still':{type("But I'm",960,380,130,ink,scene,time,{font:'english'});type('still here',960,645,260,accent,scene,time,{font:'english',motion:'stamp'});break}
case 'seat':case 'waiting':{const x=m==='seat'?1400:1370,y=680;path([[x-100,y-125],[x-100,y+90],[x+120,y+90],[x+120,y+250]],accent,7,.55);line(x-100,y+90,x-100,y+250,accent,7,.55);if(m==='waiting')txt('…',x+10,y-20,115,accent,{font:'hand'});sentence(scene,time,ink,{size:152,x:800,y:430,max:1190});break}
case 'joke':case 'loud':case 'listen':{if(m==='joke'){txt('(',250,570,620,accent,{font:'english',alpha:.28});txt(')',1680,570,620,accent,{font:'english',alpha:.28})}if(m==='listen')for(let i=0;i<3;i++)circle(1600,535,65+i*53,accent,3,.3,-1.0,1.0);sentence(scene,time,ink,{size:m==='loud'?225:163,motion:m==='loud'?'stamp':'tilt'});break}
case 'weight':{const labels=['累','忙','逃'];labels.forEach((s,i)=>type(s,460+i*500,425+i*85,275, i===2?accent:ink,scene,time,{motion:'stamp',max:420}));caption(scene,time,ink,849);break}
case 'stand':{g.save();g.translate(960,525);g.rotate((1-ease(p*2))*.14*intensity);sentence(scene,time,ink,{x:0,y:0,size:220,font:'display'});g.restore();line(285,793,1635,793,accent,4);break}
case 'memory':{txt('22',270,350,155,accent,{font:'english',alpha:.24});path([[1570,265],[1570,475],[1700,550],[1820,475],[1820,265]],accent,3,.25);line(310,850,1720,850,accent,3,.25);sentence(scene,time,ink,{size:177});break}
case 'unwrap':{for(let i=0;i<3;i++){g.save();g.translate(960,525);g.rotate(-.15+i*.09);rect(-1000-(i%2?-1:1)*q*1600,-170+i*170,2000,90,accent,.5*(1-q));g.restore()}sentence(scene,time,ink,{size:250,font:'display',motion:'fold'});break}
case 'years':{for(let i=0;i<16;i++)line(190+i*100,740,190+i*100,760+(i%4?0:30),accent,3,.4);sentence(scene,time,ink,{size:240,font:'hand'});break}
case 'resolve':{road(time,accent);type('我自己来',960,430,295,ink,scene,time,{font:'hand',motion:'stamp'});break}
default:sentence(scene,time,ink,{size:180});
}
g.restore();chrome(ink);
}
function ending(time){const p=clamp((time-215.5)/6.26);rect(0,0,W,H,'#fcf6e9');paperGround();collageImage('backpack-closed',1500,680,440,.06);collageImage('heart-open',380,430,350,-.13);txt('绷  带',960,430,215,'#3d3557');txt('鹤我这豹脾气',960,650,55,'#4053e5',{font:'hand'});txt('路，我自己来。',960,845,64,'#3d3557',{font:'hand',alpha:smooth(p*4)});if(p>.92)rect(0,0,W,H,'#fcf6e9',smooth((p-.92)/.08)*.35)}
function findScene(time){let lo=0,hi=scenes.length-1,result=null;while(lo<=hi){const mid=(lo+hi)>>1;if(scenes[mid].start<=time){result=scenes[mid];lo=mid+1}else hi=mid-1}return result}
const transitionCanvas=document.createElement('canvas');transitionCanvas.width=W;transitionCanvas.height=H;const tg=transitionCanvas.getContext('2d');let transitionKey='';
function paintFrame(time){const sc=findScene(time);if(time>=215.5)ending(time);else if(!sc)intro(time);else sceneFrame(sc,time);return sc}
function transition(time,sc){if(window.MV_LAYOUT)return;
 if(time>=215.5)sc={id:96,start:215.5,end:D};
 else if(!sc){const cuts=[5.2,10.25,15.35],i=cuts.findLastIndex(v=>time>=v);if(i<0)return;sc={id:97+i,start:cuts[i],end:cuts[i+1]||18.56}}
 const prev=scenes[sc.id-1],family=m=>['map','compare','direction'].includes(m)?'map':['wrap','crack','cover','open','unwrap'].includes(m)?'heart':['wishes','bag'].includes(m)?'bag':m;
 if(prev&&sc.motif&&family(prev.motif)===family(sc.motif))return;
 const age=time-sc.start,dur=Math.min(intensity<.5?.25:.42,(sc.end-sc.start)*.19);if(age>=dur||age<0)return;const key=sc.id+'|'+intensity;if(transitionKey!==key){const hold=document.createElement('canvas');hold.width=W;hold.height=H;hold.getContext('2d').drawImage(film,0,0);g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;paintFrame(Math.max(0,sc.start-.012));tg.clearRect(0,0,W,H);tg.drawImage(film,0,0);g.restore();g.clearRect(0,0,W,H);g.drawImage(hold,0,0);transitionKey=key}
 const z=smooth(age/dur),mode=sc.id%3;g.save();g.beginPath();
 if(mode===0){const edge=z*(W+80)-40;g.moveTo(W,0);g.lineTo(W,H);for(let y=H;y>=0;y-=24)g.lineTo(edge+Math.sin(y*.07+sc.id)*7+(y/H-.5)*45,y)}
 else if(mode===1){const edge=z*(H+50)-25;g.moveTo(0,H);g.lineTo(W,H);for(let x=W;x>=0;x-=24)g.lineTo(x,edge+Math.sin(x*.09+sc.id)*6)}
 else{const half=z*W/2;g.rect(0,0,W/2-half,H);g.rect(W/2+half,0,W/2-half,H)}
 g.closePath();g.clip();g.drawImage(transitionCanvas,0,0);g.restore();
}
function render(time,diagnostics=true){time=clamp(time,0,D);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;const sc=paintFrame(time);transition(time,sc);g.save();g.globalAlpha=.56;g.fillStyle=texture;g.fillRect(0,0,W,H);g.restore();frames++;if(diagnostics){film.dataset.time=t.toFixed(4);film.dataset.visualTime=time.toFixed(4);film.dataset.audioTime=audio.currentTime.toFixed(4);film.dataset.scene=sc?String(sc.id):'intro';film.dataset.motif=sc?.motif||'intro';film.dataset.frames=String(frames);film.dataset.playing=String(playing);film.dataset.ready=String(audio.readyState)}return sc}
function fmt(n){const s=Math.floor(n+.00001);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function waveform(){wg.clearRect(0,0,wave.width,wave.height);const values=beatData.waveform;values.forEach((v,i)=>{const h=3+clamp(v)*29;wg.fillStyle=i/values.length*D<=t?palette.green:'#c9c0cf';wg.fillRect(i/values.length*wave.width,21-h/2,3.4,h)});wg.fillStyle=palette.paper;wg.fillRect(t/D*wave.width,0,2,42)}
function ui(sc){$('clock').textContent=fmt(t);$('seek').value=t;$('sceneLabel').textContent=t>=215.5?'尾声 · 路，我自己来':sc?(sectionNames[sc.section]+' · '+sc.text):'前奏 · 绷带';waveform()}
function state(on){playing=on;film.dataset.playing=String(on);$('play').textContent=on?'暂停':'播放';$('play').setAttribute('aria-label',on?'暂停':'播放');$('start').hidden=on||t>.02}
function tick(){if(!playing)return;t=clamp(audio.currentTime,0,D);const sc=render(t+shift);ui(sc);if(t>=D-.02){audio.pause();t=D;state(false);render(D);ui(sc);finishRecording();$('status').textContent=recording?'正在保存视频…':'播放完毕。路，我自己来。';return}raf=requestAnimationFrame(tick)}
async function play(){if(!loaded)return;if(playing){audio.pause();state(false);cancelAnimationFrame(raf);return}if(t>=D-.03){t=0;audio.currentTime=0}try{if(audioContext)await audioContext.resume();await audio.play();state(true);$('status').textContent=recording?'正在实时导出，请保持此页开启。':'正在播放 · 空格暂停';cancelAnimationFrame(raf);tick()}catch(e){state(false);$('status').textContent='播放未开始，请再次点击播放。'}}
function seek(value){if(recording)return;t=clamp(value,0,D);audio.currentTime=t;if(t>=D){audio.pause();state(false)}ui(render(t+shift));$('start').hidden=playing||t>.02;if(!playing)$('status').textContent='已定位到 '+fmt(t)+'。点击播放继续。'}
async function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);return{name};}
function finishRecording(){if(recorder&&recorder.state==='recording')recorder.stop()}
function exportLock(on){for(const id of ['start','record','seek','replay','chapter','play','mute','intensity','sync','sceneSelect','allcontact','contact','motioncheck','trialrecord'])if($(id))$(id).disabled=on;$('start').hidden=on||playing||t>.02}
async function record(options={}){
if(recording)return;if(!window.MediaRecorder||!film.captureStream){$('status').textContent='当前浏览器不支持录制，请使用桌面 Chrome 或 Edge。';return}
audio.pause();state(false);cancelAnimationFrame(raf);seek(options.start||0);let canvasStream;
try{
audioContext=audioContext||new AudioContext();await audioContext.resume();
if(!mediaSource){mediaSource=audioContext.createMediaElementSource(audio);mix=audioContext.createMediaStreamDestination();mediaSource.connect(mix);mediaSource.connect(audioContext.destination)}
canvasStream=film.captureStream(30);const stream=new MediaStream([...canvasStream.getVideoTracks(),...mix.stream.getAudioTracks()]);
const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:7000000,audioBitsPerSecond:192000});const chunks=[];let failed=false;
recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
recorder.onerror=e=>{failed=true;$('status').textContent='录制出错：'+(e.error?.message||'请重试');finishRecording()};
recorder.onstop=async()=>{try{if(!failed){await saveBlob(new Blob(chunks,{type:mime}),options.name||'绷带-鹤我这豹脾气-完整版.webm');film.dataset.export='complete'}}catch(e){film.dataset.export='failed';$('status').textContent='保存未完成：'+e.message}finally{canvasStream.getTracks().forEach(tr=>tr.stop());recording=false;exportLock(false)}};
recorder.start(1000);recording=true;film.dataset.export='recording';exportLock(true);await play();if(!playing)throw new Error('音频未开始播放');
}catch(e){recording=false;finishRecording();canvasStream?.getTracks().forEach(tr=>tr.stop());exportLock(false);film.dataset.export='failed';$('status').textContent='录制未启动：'+e.message}
}
function capture(){film.toBlob(blob=>blob&&saveBlob(blob,`绷带-画面-${t.toFixed(2)}s.png`),'image/png')}
async function contactSheet(){const times=[1.4,12,19.7,29.9,45.6,71.9,82.3,94.8,118.4,135.1,160.9,196.1],out=document.createElement('canvas');out.width=1920;out.height=1224;const cg=out.getContext('2d');cg.fillStyle=palette.night;cg.fillRect(0,0,out.width,out.height);for(let i=0;i<times.length;i++){render(times[i],false);const x=i%4*480,y=Math.floor(i/4)*408;cg.drawImage(film,x,y,480,270);cg.fillStyle=palette.paper;cg.font='19px WenKai';const sc=findScene(times[i]);cg.fillText(fmt(times[i])+'  '+(sc?.text||'绷带 · 前奏'),x+17,y+307,447);cg.fillStyle=palette.green;cg.font='15px WenKai';cg.fillText(sc?.direction||'歌名、署名与缠绕字带',x+17,y+345,447)}render(t+shift);out.toBlob(async b=>{if(b){await saveBlob(b,'绷带-分镜验收图.png');$('qaStatus').textContent='验收图已保存'}},'image/png')}
$('play').onclick=play;$('start').onclick=play;$('replay').onclick=()=>{audio.pause();state(false);cancelAnimationFrame(raf);seek(0);play()};$('seek').oninput=()=>seek(Number($('seek').value));$('mute').onclick=()=>{audio.muted=!audio.muted;$('mute').textContent=audio.muted?'声音 关':'声音 开'};$('capture').onclick=capture;$('record').onclick=()=>record();
$('intensity').value=String(intensity);$('intensity').onchange=()=>{intensity=Number($('intensity').value);render(t+shift)};$('sync').onchange=()=>{shift=clamp(Number($('sync').value)||0,-500,500)/1000;$('sync').value=Math.round(shift*1000);render(t+shift)};
const sections=new Set();for(const sc of scenes)if(!sections.has(sc.section)){sections.add(sc.section);const op=document.createElement('option');op.value=sc.start;op.textContent=sectionNames[sc.section];$('chapter').append(op)}$('chapter').onchange=()=>seek(Number($('chapter').value));
async function full(){if(document.fullscreenElement){await document.exitFullscreen();return}if(document.body.classList.contains('mv-full')){document.body.classList.remove('mv-full');return}try{if($('screen').requestFullscreen){await $('screen').requestFullscreen();return}}catch{}document.body.classList.add('mv-full')}$('full').onclick=full;$('exit').onclick=full;
audio.addEventListener('pause',()=>{if(!audio.paused)return;state(false);cancelAnimationFrame(raf);if(!recording&&t<D-.05)$('status').textContent='已暂停。'});audio.addEventListener('ended',()=>{state(false);t=D;ui(render(D));finishRecording()});audio.addEventListener('error',()=>{$('status').textContent='音频加载失败，请保留完整文件或使用单文件版。';state(false);finishRecording()});
document.addEventListener('keydown',e=>{if($('watchPage').hidden||['INPUT','BUTTON','SELECT'].includes(document.activeElement.tagName)||recording)return;if(e.code==='Space'){e.preventDefault();play()}else if(e.code==='ArrowRight'){e.preventDefault();seek(t+1)}else if(e.code==='ArrowLeft'){e.preventDefault();seek(t-1)}});
for(const b of document.querySelectorAll('#qa button'))b.disabled=true;
$('duration').textContent=fmt(Math.ceil(D));$('seek').max=D;
Promise.all([document.fonts.load('80px Smiley').then(()=>window.MV_LOAD.done()),document.fonts.load('80px WenKai').then(()=>window.MV_LOAD.done()),window.MV_ASSETS_READY,window.MV_AUDIO_READY]).then(()=>{loaded=true;for(const b of document.querySelectorAll('#qa button'))b.disabled=false;$('play').disabled=false;$('start').disabled=false;$('play').textContent='播放';$('start').innerHTML='<span>▶</span>播放完整 MV';$('status').textContent='点击播放，开启声音。';ui(render(1.6));window.MV_LOAD.ready()}).catch(e=>{$('status').textContent='画面准备失败：'+e.message;window.MV_LOAD.fail();console.error(e)});
})();

