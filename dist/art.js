'use strict';
// A lyric is composed as a moving poster. Audio time governs every entrance.
window.MV_ART = (g, sc, time, beat, intensity) => {
const C={night:'#3d3557',paper:'#fcf6e9',sage:'#a4dbcc',rose:'#f28e9b',moss:'#388577',muted:'#a89acb'};
const clamp=(v)=>Math.max(0,Math.min(1,v)),ease=v=>1-Math.pow(1-clamp(v),4),smooth=v=>{v=clamp(v);return v*v*(3-2*v)},age=time-sc.start,p=clamp(age/(sc.end-sc.start)),entry=ease(age/.48),out=1;
const m=sc.motif,final=sc.section==='Final Hook',bridge=sc.section==='Bridge',night=false;
const designId=['map','compare','direction'].includes(m)?47:['wishes','bag'].includes(m)?68:({30:29,33:32,76:75,79:78}[sc.id]??sc.id);
const colors=bridge?['#f4eddd','#fcf6e9','#cde7dc']:final?['#edf0a9','#d4e4ef','#f7d6c8','#f5efdd']:['#fcf6e9','#d5e9dc','#f5eedf','#f4d6c8'];
const hero={8:['#4053e5','#fff6df','#e9ef40'],28:['#e9ef40','#353051','#4053e5'],55:['#f46d83','#37304e','#344ee4'],86:['#4053e5','#fff6df','#a4dbcc'],93:['#e9ef40','#353051','#4053e5']}[sc.id];
const bg=hero?hero[0]:colors[Math.floor(designId/2)%colors.length],ink=hero?hero[1]:C.night,accent=hero?hero[2]:['#4053d8','#277e70','#d94d62','#4d6245'][Math.floor(designId/4)%4],pink=hero?'#f6d732':'#ee456c';
const rc=window.rough?(g.canvas._rough||(g.canvas._rough=rough.canvas(g.canvas))):null,boil=Math.floor(time*8)%3,seed=3+sc.id*17+boil;
g.save();g.fillStyle=bg;g.fillRect(0,0,1920,1080);const grounds=['paper-warm','paper-blue','paper-coral','paper-mint','paper-yellow','paper-lilac'];const groundName=bridge?grounds[3+Math.floor(designId/3)%3]:grounds[Math.floor(designId/4)%grounds.length],framed=['paper-blue','paper-mint','paper-lilac'].includes(groundName);const ground=window.MV_COLLAGE?.[groundName];if(ground){g.save();g.globalAlpha=hero?.16:.82;if(hero)g.globalCompositeOperation='soft-light';g.drawImage(ground,0,0,1920,1080);g.restore()}g.globalAlpha=out;
function shape(fn,c=accent,a=1){g.save();g.globalAlpha*=a*entry;const z=.93+.07*entry;g.translate(960,540);g.scale(z,z);g.translate(-960,-540);g.fillStyle=c;g.beginPath();fn();g.fill();if(window.MV_CRAYON){g.clip();g.globalAlpha*=.23;g.fillStyle=window.MV_CRAYON;g.fillRect(0,0,1920,1080)}g.restore()}
function box(x,y,w,h,c=accent,r=0,a=1){shape(()=>g.roundRect(x,y,Math.max(0,w),Math.max(0,h),Math.min(r,w/2,h/2)),c,a);if(rc&&r===0&&w>140&&h>80&&a>.12){g.save();g.globalAlpha*=a*.48*entry;rc.rectangle(x,y,w,h,{stroke:c,strokeWidth:2.3,roughness:1.65,seed});g.restore()}}
function disc(x,y,r,c=accent,a=1){shape(()=>g.arc(x,y,Math.max(0,r),0,Math.PI*2),c,a);if(rc&&r>70&&a>.12){g.save();g.globalAlpha*=a*.6*entry;rc.circle(x,y,r*2,{stroke:c,strokeWidth:2,roughness:1.45,seed});g.restore()}}
function polygon(points,c=accent,a=1){shape(()=>{points.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.closePath()},c,a);if(rc&&a>.3){g.save();g.globalAlpha*=a*.4;rc.polygon(points,{stroke:c,strokeWidth:2,roughness:1.3,seed});g.restore()}}
function stroke(points,c=accent,w=6,a=1){g.save();g.globalAlpha*=a;g.beginPath();points.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke();g.restore()}
function rotate(x,y,angle,fn){g.save();g.translate(x,y);g.rotate(angle);fn();g.restore()}
function bounds(kind,name,x,y,w,h){if(!window.MV_LAYOUT)return;const t=g.getTransform(),pts=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>[t.a*a+t.c*b+t.e,t.b*a+t.d*b+t.f]);window.MV_LAYOUT.push({kind,name,x:Math.min(...pts.map(p=>p[0])),y:Math.min(...pts.map(p=>p[1])),r:Math.max(...pts.map(p=>p[0])),b:Math.max(...pts.map(p=>p[1]))})}
function sprite(name,x,y,w,o={}){const im=window.MV_COLLAGE?.[name];if(!im)return;const en=o.persist?1:entry,step=Math.floor(time*10)/10,jitter=Math.sin(step*23+sc.id)*.7*intensity;g.save();g.globalAlpha*=(o.alpha??1)*en;g.translate(x+(1-en)*(o.fromX??130)+jitter,y+(1-en)*70+Math.sin(step*2.2)*((o.bob??9)*intensity));g.rotate((o.angle||0)+(1-en)*-.16+Math.sin(step*1.4)*.014*intensity);g.scale(o.flipX??1,o.flipY??1);const z=(o.scale??1)*1.075,r=window.MV_TRIMS?.[name]||[0,0,im.width,im.height],h=w*z*r[3]/r[2];if((o.alpha??1)>.2)bounds('image',name,-w*z/2,-h/2,w*z,h);g.drawImage(im,...r,-w*z/2,-h/2,w*z,h);g.restore()}
function glyphs(name,x,y,total=1440){const im=window.MV_COLLAGE?.[name],rs=window.MV_GLYPHS?.[name];if(!im||!rs)return;const cell=total/4;for(let i=0;i<4;i++){const r=rs[i],local=age-i*.085,en=ease(local/.38),tm=sc.chars[i]?.start??sc.start+i*.14,dt=time-tm,kick=dt>=0?Math.exp(-dt*9)*Math.sin(dt*20)*.07:0;g.save();g.globalAlpha*=en;g.translate(x+(i-1.5)*cell+(1-en)*(i-1.5)*55,y+(1-en)*50+kick*45*intensity);g.rotate((i%2?1:-1)*((1-en)*.18+kick*.35)*intensity);const k=Math.min(cell*.83/r[2],350/r[3])*(1+(1-en)*.16+kick*intensity),w=r[2]*k,h=r[3]*k;if(en>.2)bounds('text',name+':'+i,-w/2,-h/2,w,h);g.drawImage(im,...r,-w/2,-h/2,w,h);g.restore()}}
function star(x,y,r,c=accent,n=10){const points=[];for(let i=0;i<n*2;i++){const a=i/n*Math.PI,rr=i%2?r*.7:r;points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}polygon(points,c)}
function arrow(x,y,w,c=accent,a=0){rotate(x,y,a,()=>polygon([[0,-24],[w-80,-24],[w-80,-73],[w,0],[w-80,73],[w-80,24],[0,24]],c))}
function norm(s){return s.toLowerCase().replace('94','九十四').replace('22','二十二').replace(/儿/g,'').replace(/[^\u4e00-\u9fffa-z0-9]/g,'')}
function font(size,f){return f==='hand'?`${size}px WenKai`:f==='en'?`italic ${size}px Georgia`:`${size}px Smiley`}
function metrics(text,size,space,f){g.font=font(size,f);return [...text].reduce((a,ch)=>a+g.measureText(ch).width,0)+Math.max(0,text.length-1)*space}
function label(text,x,y,size=170,o={}){
 text=text.replace(/[a-z]/g,ch=>ch.toUpperCase());const f=o.font||'display';let space=o.space??size*.12,max=o.max??1620;
 const initial=metrics(text,size,space,f);if(initial>max){const factor=max/initial;size*=factor;space*=factor}
 const width=metrics(text,size,space,f),align=o.align||'center',left=align==='left'?x:align==='right'?x-width:x-width/2;
 let cursor=left;const base=norm(sc.text).indexOf(norm(text)),chars=[...text],modes=['rise','slide','fold','assemble','press'];
 const mode=o.static?'still':gentle?'float':o.punch?'press':modes[sc.id%modes.length];
 for(let i=0;i<chars.length;i++){
  const ch=chars[i];g.font=font(size,f);const w=g.measureText(ch).width,delay=(o.delay||0)+i*Math.min(.032,.24/Math.max(1,chars.length-1)),local=age-delay,reveal=o.static?1:ease(local/.42),index=(base<0?0:base)+norm(chars.slice(0,i).join('')).length,tm=sc.chars[index]?.start??sc.start;
  const hit=time-tm,bell=hit>=0&&hit<.52?Math.sin(hit/.52*Math.PI):0,settle=Math.sin(Math.max(0,local)*14)*Math.exp(-Math.max(0,local)*8),pulse=o.static?0:bell*(gentle?.023:.045)*intensity;
  let dx=0,dy=0,angle=0,sx=1,sy=1;
  if(mode==='rise'){dy=(1-reveal)*52;sy=.88+.12*reveal}
  if(mode==='slide'){dx=(1-reveal)*(i%2?1:-1)*Math.min(14,space*.42);dy=(1-reveal)*18;angle=(i%2?1:-1)*(1-reveal)*.05}
  if(mode==='fold'){sx=.22+.78*reveal;dy=(1-reveal)*25;angle=(1-reveal)*-.12}
  if(mode==='assemble'){dx=(i-(chars.length-1)/2)*(1-reveal)*12;dy=(i%2?1:-1)*(1-reveal)*24;angle=(i%2?1:-1)*(1-reveal)*.14}
  if(mode==='press'){sx=sy=1+(1-reveal)*.10+settle*.02;dy=-(1-reveal)*28}
  if(mode==='float'){dy=(1-reveal)*22;sy=.97+.03*reveal}
  g.save();g.globalAlpha*=reveal*(o.alpha??1);g.translate(cursor+w/2+dx*intensity,y+dy*intensity);g.rotate(angle*intensity);g.scale(1+(sx-1)*intensity+pulse,1+(sy-1)*intensity+pulse);
  g.font=font(size,f);g.textAlign='center';g.textBaseline='middle';g.fillStyle=o.color||ink;if(o.optical){const fm=g.measureText(ch);g.translate(0,(fm.actualBoundingBoxAscent-fm.actualBoundingBoxDescent)/2)}
  if(reveal>.2&&(o.alpha??1)>.2)bounds('text',text+' / '+i,-w/2,-size*.56,w,size*1.12);
  if(mode==='press'&&local>0&&local<.3){g.save();g.globalAlpha*=(1-reveal)*.18;g.fillStyle=accent;g.fillText(ch,5,7);g.restore()}
  g.fillText(ch,0,0);g.restore();cursor+=w+space;
 }
}
function lines(arr,o={}){const size=o.size||180,gap=o.gap||size*1.48;let y=o.y??520;const excluded=['map','compare','direction','street','phone','notifications','write','rewrite'];if(!excluded.includes(m)&&y>=340&&y<=520)y+=framed?12:48;arr.forEach((s,i)=>label(s,o.x??960,y+(i-(arr.length-1)/2)*gap,size,{...o,delay:(o.delay||0)+i*.075}))}
function auto(text=sc.text){const a=text.split(/[，。—]+/).filter(Boolean);if(a.length>1)return a;if(text.length>11){const n=Math.ceil(text.length/2);return[text.slice(0,n),text.slice(n)]}return a}
function caption(text=sc.text,y=930,o={}){label(text,o.x??960,y,72,{font:'hand',space:7,max:1610,...o})}
function tape(x,y,w,h,angle,c=accent){rotate(x,y,angle,()=>{polygon([[-w/2,-h/2],[w/2-20,-h/2+5],[w/2,h/2],[-w/2+16,h/2-7]],c);for(let i=0;i<10;i++)box(-w/2+28+i*(w-50)/10,-h/2+14,5,5,bg,2,.38)})}
function road(){polygon([[840,560],[1080,560],[1780,1080],[140,1080]],accent,.18);polygon([[934,560],[976,560],[1010,1080],[890,1080]],bg);for(let i=0;i<5;i++){const z=(i/5+time*.085)%1,y=570+z*z*530;box(948-z*24,y,22+z*30,15+z*45,accent,3,.7)}}
function pocket(x,y,scale=1){rotate(x,y,-.07,()=>{g.scale(scale,scale);polygon([[-170,-140],[170,-140],[153,124],[0,227],[-153,124]],accent);polygon([[-155,-121],[153,-121],[115,-70],[-111,-70]],bg,.8);stroke([[-127,-30],[-116,94],[0,174],[116,94],[127,-30]],bg,4,.6)})}
function paper(x,y,scale=1,angle=0,c=C.paper){rotate(x,y,angle,()=>{box(-72*scale,-98*scale,144*scale,196*scale,c,4);polygon([[35*scale,-98*scale],[72*scale,-61*scale],[35*scale,-61*scale]],bg,.3)})}
function feature(word,rest,o={}){if(rest)caption(rest,o.captionY||875,{x:o.x||960});label(word,o.x||960,o.y||480,o.size||330,{space:24,color:o.color||accent,punch:true,max:o.max||1620,...o})}
const gentle=['breathe','space','quiet','pause','plain','resolve','enough','heal','wait'].includes(m);g.save();if(!gentle){const z=1+beat*.009*intensity;g.translate(960,540);g.scale(z,z);g.translate(-960,-540)}
switch(m){
case 'footsteps':{
 const step=Math.floor(time*10)/10,walk=Math.sin(step*94/60*Math.PI);for(let i=0;i<5;i++){const x=210+i*310;rotate(x,895,-.12,()=>box(-45,-10,90,28,accent,14,.15))}
 sprite('sneaker',1490+walk*25,895-Math.max(0,walk)*30,480,{angle:walk*.12,bob:0});
 label('02:30',1590,210,160,{font:'en',color:accent,space:3,alpha:.45});lines(['鞋底踩过','凌晨两点半'],{x:185,y:365,size:178,align:'left',gap:246,max:1170,fromX:-140});break}
case 'wind':case 'windwalk':{
 for(let i=0;i<4;i++){const x=(((time*.14+i*.31)%1)*2400)-300;rotate(x,150+i*245,-.10,()=>box(-200,-13,400,26,accent,13,.2))}
 sprite('sneaker',1530,900,330,{persist:true,angle:-.1+Math.sin(time*3)*.06,bob:12});const a=auto();lines(a,{size:205,x:960,y:430,gap:250,tilt:-.08});break}
case 'advice':{
 const labels=['简单','他们','简单','他们'];[[235,200],[1600,200],[180,860],[1530,860]].forEach(([x,y],i)=>{rotate(x,y,(i%2?1:-1)*.09,()=>{box(-125,-50,250,100,accent,48,.18);label(labels[i],0,0,58,{static:true,color:accent,space:14})})});
 lines(['他们都劝我','活得简单'],{size:205,gap:265});break}
case 'disorder':{
 box(220,208,1480,620,accent,3,.13);rotate(960,536,-.045*entry,()=>lines(['可简单的人生','我不太习惯'],{x:0,y:0,size:190,gap:270,max:1430}));star(1700,870,74,pink,8);break}
case 'phone':{
 const hit=clamp((time-(sc.chars[2]?.start||sc.start)-.05)/.68),flip=Math.max(.035,Math.abs(Math.cos(hit*Math.PI)));
 box(185,846,1550,28,accent,14,.23);sprite(hit<.5?'phone':'phone-back',465,520+hit*55,410,{flipX:flip,angle:-.15*(1-hit),bob:0,fromX:-80});
 if(hit>.7&&hit<.98)for(let i=0;i<3;i++)stroke([[240+i*200,840],[230+i*200,800]],pink,5,(1-hit)*3);
 label('手机扣桌上',815,340,154,{align:'left',max:970,space:10});label('不回',1270,608,350,{color:accent,space:44,punch:true});break}
case 'notifications':{
 label('消息太多了',960,245,160,{space:18,max:1430});
 for(let i=0;i<5;i++){const arrival=ease((age-i*.085)/.24),leave=smooth((p-.36-i*.035)*2.3),x=530+i*210+leave*(i-2)*170,y=425+(i%2?25:-20);g.save();g.globalAlpha*=arrival*(1-leave);rotate(x,y,(i-2)*.055+leave*(i-2)*.04,()=>{g.scale(1-leave*.68,1-leave*.68);box(-98,-40,196,80,i%2?'#4053e5':'#f04f6d',8,.9);polygon([[-56,38],[-66,64],[-20,38]],i%2?'#4053e5':'#f04f6d');for(let j=0;j<3;j++)disc(-36+j*36,0,6,C.paper)});g.restore()}
 sprite('phone-back',1590,770,290,{persist:true,angle:.13,bob:3});label('不追',900,715,340,{color:accent,space:70,punch:true,max:1040,delay:.12});break}
case 'crowd':{for(let i=0;i<11;i++){const x=155+i*161;disc(x,220,18,accent,.22);box(x-23,255,46,90,accent,21,.22)}lines(['以前想证明','给所有人看'],{size:195,y:600,gap:265});break}
case 'prove':{box(1350,160,330,760,accent,165,.17);lines(['现在','我只想证明'],{x:230,y:490,size:230,align:'left',gap:300,fromX:-130});break}
case 'stamp':{star(245,245,65,'#f04f6d',8);star(1675,835,80,'#e9ef40',8);glyphs('type-effort-v2',960,530,1470);break}
case 'clock':{sprite('clock',550,530,610,{angle:Math.sin(time*2.5)*.08,bob:0});label('22',1350,225,145,{font:'en',space:12,color:accent});lines(['时间','开始变快'],{x:1090,y:570,size:172,align:'left',gap:246,max:700});break}
case 'depart':{box(150,170,745,715,accent,40,.12);box(1025,170,745,715,accent,40,.3);label('有人离场',522-entry*40,440,145,{alpha:1-p*.5,max:660});label('有人还在',1397,615,145,{color:accent,max:660});disc(1397,335,33,pink);break}
case 'pocket':case 'pocketmany':case 'bag':case 'wishes':{
 const bag=m==='bag'||m==='wishes',close=bag&&m==='bag'?smooth((p-.45)*2):0;
 for(let i=0;i<3;i++){const z=clamp(p*1.65-i*.22);g.save();g.globalAlpha*=1-smooth((z-.75)*4);paper(1430+z*70,180+z*405,.65*(1-z*.45),z*.7-i*.3,i%2?C.rose:accent);g.restore()}
 if(bag){sprite('backpack',1520,660,550,{alpha:1-close,persist:true,bob:5});sprite('backpack-closed',1520,660,550,{alpha:close,persist:true,bob:5})}else sprite('pocket',1500,690,590,{persist:true,bob:4,angle:-.03});
 const rows=m==='pocket'?['我把没说完的话','塞进口袋']:m==='wishes'?['我把那些','没实现的愿望']:auto();lines(rows,{x:170,y:420,size:158,align:'left',gap:240,max:970,font:bridge?'hand':'display',fromX:-100});break}
case 'unfold':case 'own':{rotate(960,515,-.025*(1-p),()=>{box(-790,-218,1580,436,accent,8,.15);polygon([[-790,-218],[-790+(1-entry)*900,-218],[-790+(1-entry)*850,218],[-790,218]],accent,.5);lines(auto(),{x:0,y:0,size:200,max:1420,font:sc.section==='Outro'?'hand':'display'})});break}
case 'win':case 'grow':case 'arrive':{for(let i=0;i<4;i++)box(1230+i*132,740-i*102,105,300+i*102,accent,8,.12+i*.025);lines(auto(),{x:210,y:450,size:205,align:'left',max:1460,gap:260});arrow(235,780,640*entry,accent);break}
case 'street':{sprite('street',960-p*95,865,1630,{persist:true,bob:0});lines(['我见过热闹','散场后的街'],{y:330,size:150,gap:210,max:1580});break}
case 'road':case 'longroad':case 'path':case 'distance':{
 road();sprite('sneaker',1340,860,430,{persist:true,angle:Math.sin(time*4.92)*.1,bob:14});const rows=m==='street'?['我见过热闹','散场后的街']:auto();lines(rows,{y:360,size:m==='road'&&sc.text.length<5?320:190,gap:260,font:bridge?'hand':'display',space:16,max:1600});if(m==='path')arrow(1270,790,380*entry,pink,-.22);break}
case 'face':{disc(1480,650,210,accent,.28);disc(1405,610,20,ink);disc(1555,610,20,ink);const d=50*(1-p);stroke([[1390,720],[1480,720+d],[1570,720]],ink,12);lines(['也见过笑脸','突然变得敷衍'],{x:190,y:375,size:180,gap:270,align:'left',max:1210});break}
case 'forever':{rotate(1450,650,p*.3,()=>{g.save();g.strokeStyle=accent;g.lineWidth=88;g.beginPath();g.arc(0,0,270,.3+p*.25,Math.PI*1.9);g.stroke();g.restore()});lines(['所以我不太','相信永远'],{x:225,y:430,size:215,align:'left',max:1330,gap:290});break}
case 'stay':{label('但你说',960,185,95,{font:'hand',space:18});disc(960,520,235,accent);label('在',960,520,345,{color:C.paper,space:0,optical:true,punch:true});label('我还是会信一点',960,865,104,{font:'hand',space:20,max:1420});break}
case 'slow':{label('Okay',230,245,145,{font:'en',align:'left',space:8});box(390,425,1140,345,accent,172,.19);label('慢一点',960,594,275,{space:45,color:accent,fromX:100});break}
case 'world':case 'orbit':{disc(1480,510,360,accent,.23);rotate(1480,510,time*.15,()=>{box(-410,-24,820,48,pink,24,.4);disc(410,0,55,pink)});lines(m==='world'?['让我跟','这个世界']:auto(),{x:190,y:470,size:190,align:'left',gap:280,max:980});break}
case 'answer':case 'late':case 'future':{rotate(960,530,-.035,()=>{box(-760,-260,1520,520,accent,28,.15);box(-760,-260,180,45,accent,7);box(580,215,180,45,accent,7);lines(auto(),{x:0,y:0,size:sc.text.length<6?255:190,gap:260,max:1360})});break}
case 'wrap':{
 sprite('heart',1510,555,575,{persist:true,scale:1+beat*.045,bob:8});
 for(let i=0;i<2;i++){g.save();g.translate(1510,555);g.rotate(-.25+i*.45);g.strokeStyle=i?pink:accent;g.globalAlpha*=.45;g.lineWidth=8;g.beginPath();g.ellipse(0,0,280+i*20,220+i*24,0,time*.7+i, time*.7+i+Math.PI*(.8+p));g.stroke();g.restore()}
 lines(['我把心事','缠上一圈','又一圈'],{x:175,y:framed?550:582,size:197,align:'left',gap:240,max:920,fromX:-100});break}
case 'crack':{
 sprite('heart',1510,540,570,{persist:true,bob:8});const z=ease(age/.65);tape(1510,500,430*z,76,-.18,C.paper);tape(1510,665,420*z,74,.14,C.paper);
 lines(['像绷带盖住','昨天留下的裂'],{x:170,y:430,size:187,align:'left',gap:285,max:995});break}
case 'groove':{rotate(655,500,Math.sin(time*2.45)*.035*intensity,()=>{disc(0,0,355,accent,.22);label('94',0,0,425,{font:'en',color:accent,space:15,static:true})});label('BPM',1390,360,200,{font:'en',space:16});label('晃过这条街',1370,660,155,{max:850,space:12});break}
case 'question':case 'ask':{sprite('question',1540,520,315,{angle:Math.sin(time*1.6)*.08,bob:10,scale:1+beat*.025});lines(m==='ask'?['别问我最近','过得怎样']:auto(),{x:185,y:460,size:m==='ask'?184:230,align:'left',gap:265,max:1030,font:bridge?'hand':'display'});break}
case 'breathe':{
 const inhale=Math.sin(p*Math.PI),r=265+inhale*50;disc(960,530,r,accent,.12);disc(960,530,r-78,bg);label('Let it',960,352,158,{font:'en',space:12+inhale*14,highlight:false});label('breathe',960,664,252,{font:'en',space:18+inhale*20,color:accent,highlight:false,max:1600});break}
case 'space':case 'silence':{
 const words=m==='space'?['别把每个空拍','全部填满']:['鼓点落下的时候','别讲话'];box(200,695,1520,135,accent,68,.14);lines(words,{size:195,y:465,gap:286,space:24,max:1580});break}
case 'cover':{sprite('heart',1530,610,540,{persist:true,bob:5});for(let i=0;i<2;i++)tape(1530,510+i*165,540*entry,110,-.13+i*.2,C.paper);lines(['有些伤口','没必要让谁看见'],{x:180,y:425,size:173,align:'left',gap:290,max:1010});break}
case 'sun':case 'light':{sprite('sun',1540,875-285*smooth(p*1.5),520,{angle:time*.035,bob:0,persist:true});polygon([[0,875],[280,832],[580,885],[890,844],[1140,865],[1460,830],[1920,871],[1920,1080],[0,1080]],'#a4dbcc');lines(m==='sun'?['如果明天太阳','还是会出现']:auto(),{x:170,y:380,size:180,align:'left',gap:260,max:1000,font:bridge?'hand':'display'});break}
case 'night':{sprite('moon',1530,475-100*smooth(p),420,{angle:Math.sin(time*.6)*.07,bob:4});for(let i=0;i<3;i++)star(1370+i*160,750+Math.sin(time+i)*35,16+i*5,accent,4);lines(['那我今晚','就再熬一夜'],{x:200,y:465,size:205,gap:290,max:1020,align:'left'});break}
case 'loosen':{const a=auto();lines(a,{y:455,size:180,gap:285,space:10+p*14,max:1590});for(let i=0;i<4;i++)box(450+i*280+(i-1.5)*entry*60,830,120,34,accent,17,.5*(1-p));break}
case 'quiet':{for(let i=0;i<3;i++){const z=1-clamp(p*1.4-i*.22);box(240+i*560,220,210*z+20,105*z+20,accent,40,.18*z)}lines(auto(),{y:565,size:190,gap:280,font:sc.section==='Outro'?'en':'hand',space:14});break}
case 'pause':{box(1490,265,62,220,accent,12,.5);box(1585,265,62,220,accent,12,.5);lines(['学会','不急着反驳'],{x:215,y:465,size:235,gap:310,align:'left',space:22});break}
case 'race':{for(let i=0;i<6;i++){const x=((time*(.35+i*.05)+i*.19)%1)*2700-390;rotate(x,150+i*156,-.11,()=>box(0,0,180+i*25,24,accent,12,.15))}disc(960,530,350,bg);lines(auto(),{size:195,y:515,gap:270});break}
case 'station':{for(let i=0;i<3;i++){box(145,790+i*70,1630,22,accent,11,.24);disc(360+q(i)*1200,800+i*70,32,accent,.6)}lines(['同一起点','怎么有人已经到下一站'],{y:380,size:195,gap:265,max:1600});break}
case 'reveal':{box(160,330,1600*entry,420,accent,10,.22);label(sc.text,960,540,290,{space:30,fromX:-140});break}
case 'map':case 'compare':case 'direction':{
 const im=window.MV_COLLAGE?.map;if(im){const z=m==='map'?smooth(age/.75):1,w=640,h=w/im.width*im.height,cw=w/3;g.save();g.translate(1500,570);bounds('image','map',-w/2,-h/2,w,h);for(let i=0;i<3;i++){const fold=.25+.75*z;g.save();g.translate((i-1)*cw*fold,0);g.scale(fold,1);g.rotate((i-1)*(1-z)*.16);g.drawImage(im,i*im.width/3,0,im.width/3,im.height,-cw/2,-h/2,cw,h);g.restore()}g.restore()}
 const rows=m==='map'?['每个人拿的地图','都不一样']:m==='compare'?['我干嘛非要拿','他的终点']:auto();lines(rows,{x:170,y:520,size:170,gap:255,max:990,align:'left'});if(m==='direction')arrow(1380,870,240,accent,-.15);break}
case 'wait':{disc(960,530,255,accent,.14);label(sc.text,960,535,265,{font:'en',space:14});break}
case 'write':case 'rewrite':{box(130,155,1660,785,accent,0,.07);const rows=m==='write'?['我还在写','还在练']:['还在凌晨把不满意的那段','删掉重来一遍'];lines(rows,{x:230,y:395,size:m==='write'?210:145,gap:275,align:'left',max:1410,font:'hand'});
 const z=smooth(p*1.4),x=370+z*1020,im=window.MV_COLLAGE?.pencil;stroke([[220,815],[x-135,815]],accent,6,.75);sprite('pencil',x,855,320,{persist:true,bob:0,angle:.03+Math.sin(Math.floor(time*10)*2)*.02});if(m==='rewrite'&&p>.54){const q=smooth((p-.54)*2.2);stroke([[230,667],[230+q*1080,667]],pink,9,.75);paper(1570+q*180,780-q*100,.45,q*.8,accent)}break}
case 'unfinished':{lines(auto(),{x:210,y:450,size:245,gap:340,align:'left',space:25});for(let i=0;i<5;i++)box(1320,260+i*128,360*(.2+p*.8),50,accent,25,.12+i*.1);break}
case 'big':{disc(1440,640,300,accent,.18);label('大',1440,630,460,{color:accent,alpha:.6,static:true,space:0});lines(['还没成为小时候','吹牛说的那个','“大人物”'],{x:195,y:420,size:145,align:'left',gap:225,max:1110,font:'hand'});break}
case 'still':{box(175,600,1570,265,accent,7,.25);label("But I'm",245,290,172,{font:'en',align:'left',space:9});label('still here',960,664,260,{font:'en',space:16,color:accent,max:1450});break}
case 'enough':{disc(1540,695,58,accent);label(sc.text,960,505,280,{space:32,font:'hand'});break}
case 'seat':case 'waiting':{const land=1-entry;sprite('chair',1550,660-land*200,510,{persist:m==='waiting',angle:land*.2,bob:3,scale:1-beat*.035});if(m==='waiting')for(let i=0;i<3;i++)disc(1410+i*70,235,10+Math.sin(time*4-i)*4,accent,.6);lines(auto(),{x:170,y:420,size:177,align:'left',gap:280,max:970});break}
case 'joke':case 'loud':case 'listen':{if(m==='loud'){sprite('exclamation',1550,560,190,{angle:Math.sin(time*3)*.035,bob:5,scale:1+beat*.065})}else if(m==='listen'){for(let i=2;i>=0;i--)disc(1580,565,80+i*75,i%2?bg:accent,.35)}else{disc(1540,630,270,accent,.15);label(':) ',1540,630,220,{font:'en',color:accent,static:true})}lines(m==='loud'?['那最好笑','大声点']:m==='joke'?['如果命运真的','喜欢开玩笑']:auto(),{x:205,y:425,size:m==='loud'?220:185,align:'left',gap:265,max:1100});break}
case 'plain':{lines(auto(),{x:960,y:520,size:180,space:18,font:'hand',max:1480});break}
case 'weight':{['累','忙','逃'].forEach((s,i)=>{const y=430+i*90;box(270+i*530,y-190,330,390,accent,30,.13+i*.06);label(s,435+i*530,y,275,{color:i===2?accent:ink,space:0,punch:true,delay:i*.1})});caption();break}
case 'stand':{rotate(960,495,(1-entry)*.16,()=>label(sc.text,0,0,240,{space:22,punch:true}));box(235,800,1450,55,accent,25);break}
case 'open':{sprite('heart',1530,580,550,{persist:true});tape(1530+p*280,510-p*200,460,85,-.2+p*.7,C.paper);lines(['不是为了','藏住伤'],{x:190,y:430,size:215,align:'left',gap:300,max:930});break}
case 'memory':{sprite('clock',1570,670,430,{angle:.12,bob:8});lines(['是提醒自己','别忘了从前'],{x:190,y:420,size:195,align:'left',gap:290,max:1050});break}
case 'unwrap':{const z=smooth(p*1.65);sprite('heart',1530,610,560,{alpha:1-z,persist:true,bob:0});sprite('heart-open',1530,610,560,{alpha:z,persist:true,bob:0});for(let i=0;i<2;i++){const v=smooth((p-i*.13)*2);g.save();g.globalAlpha*=1-v;tape(1530+v*350,500+i*175-v*240,500*(1-v*.4),86,-.2+i*.33+v*(i?1:-1),C.paper);g.restore()}lines(auto(),{x:170,y:435,size:210,align:'left',gap:280,max:920});break}
case 'years':{for(let i=0;i<6;i++)paper(225+i*285,850,.6+(i%2)*.16,(i-3)*.08,accent);sprite('clock',1690,170,180,{angle:-.15,bob:5});label(sc.text,960,475,265,{space:30,font:'hand'});break}
case 'heal':{sprite('heart-open',1530,575,550,{persist:true,scale:1+Math.sin(time*2)*.025,bob:4});lines(['伤口会','自己愈合'],{x:190,y:410,size:208,align:'left',gap:300,font:'hand',max:980});break}
case 'resolve':{road();const walk=Math.sin(Math.floor(time*10)/10*4.92);sprite('sneaker',1380+walk*20,855-Math.max(walk,0)*30,440,{persist:true,angle:walk*.08,bob:0});glyphs('type-own-v2',960,360,1400);break}
case 'rest':{road();sprite(sc.id<90?'heart-open':'backpack-closed',960,460,480,{persist:true,bob:12});break}

default:lines(auto(),{size:190,space:18,gap:280});
}
function q(i){return (p+i*.21)%1}
g.restore();g.restore();
};

