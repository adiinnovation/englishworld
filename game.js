(() => {
const $=id=>document.getElementById(id);
const places=[
{name:"Town Square",x:0,z:-4,color:0xf1c75b,emoji:"🏙",desc:"Meet people and practise everyday English"},
{name:"Restaurant",x:-24,z:-23,color:0xe98255,emoji:"🍽",desc:"Order meals and speak politely"},
{name:"Shopping Mall",x:24,z:-23,color:0x68a9d8,emoji:"🛍",desc:"Ask for products, sizes and prices"},
{name:"Airport",x:-43,z:-55,color:0x80c9c0,emoji:"✈️",desc:"Travel and check-in conversations"},
{name:"Railway Station",x:43,z:-55,color:0xdaa65f,emoji:"🚆",desc:"Tickets, platforms and travel questions"},
{name:"Hotel",x:-24,z:20,color:0x9a8bd2,emoji:"🏨",desc:"Reservations and guest services"},
{name:"Office",x:24,z:20,color:0x7b9fbd,emoji:"🏢",desc:"Professional and workplace English"},
{name:"School",x:-48,z:8,color:0x83b96c,emoji:"🏫",desc:"Introductions and classroom English"},
{name:"Hospital",x:48,z:8,color:0xe58c9d,emoji:"🏥",desc:"Reception and patient conversations"},
{name:"Supermarket",x:0,z:39,color:0x85b88b,emoji:"🛒",desc:"Shopping and everyday vocabulary"},
{name:"Police Station",x:0,z:-69,color:0x7295bf,emoji:"🚓",desc:"Ask for help and report an issue"},
{name:"Conference Hall",x:0,z:69,color:0x987dbb,emoji:"🎤",desc:"Presentations and advanced speaking"}
];
let scene,camera,renderer,clock,player,buildings=[],npcs=[],keys={},touch={},activeMission=null,missionIndex=0,sessionStart=Date.now(),near=null,coins=+(localStorage.ewCoins||0),xp=+(localStorage.ewXP||0),completed=JSON.parse(localStorage.ewDone||"[]"),sentences=+(localStorage.ewSentences||0),words=+(localStorage.ewWords||0),paused=false,playerGender=localStorage.ewGender||"male";
function mat(color,rough=.8){return new THREE.MeshStandardMaterial({color,roughness:rough})}
function box(w,h,d,color,x,y,z){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function makeAvatar(color=0x167f80){let g=new THREE.Group();let skin=mat(0xc98e68),shirt=mat(color),pants=mat(0x24364f),shoe=mat(0x18212a);
let torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,4,8),shirt);torso.position.y=1.35;g.add(torso);
let head=new THREE.Mesh(new THREE.SphereGeometry(.29,16,12),skin);head.position.y=2.15;g.add(head);
let hair=new THREE.Mesh(new THREE.SphereGeometry(.3,16,8,0,Math.PI*2,0,Math.PI*.55),mat(playerGender==="female"?0x21150f:0x20170f));hair.position.y=2.28;g.add(hair);
for(let x of [-.48,.48]){let arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.58,4,6),skin);arm.position.set(x,1.38,0);arm.rotation.z=x>0?-.15:.15;g.add(arm)}
for(let x of [-.19,.19]){let leg=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.7,4,6),pants);leg.position.set(x,.48,0);g.add(leg);let foot=new THREE.Mesh(new THREE.BoxGeometry(.28,.14,.42),shoe);foot.position.set(x,.1,-.08);g.add(foot)}
g.userData.torso=torso;return g}
function addBuilding(p){let g=new THREE.Group();let h=5+Math.random()*3,w=10,d=8;let base=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(p.color));base.position.y=h/2;g.add(base);
let roof=new THREE.Mesh(new THREE.BoxGeometry(w+.5,.35,d+.5),mat(0x263b50));roof.position.y=h+.17;g.add(roof);
for(let y=1.4;y<h-.3;y+=1.25)for(let x=-3.5;x<=3.5;x+=2.3){let win=new THREE.Mesh(new THREE.BoxGeometry(1.15,.65,.08),new THREE.MeshStandardMaterial({color:0xbde7ef,emissive:0x23414a}));win.position.set(x,y,d/2+.05);g.add(win)}
g.position.set(p.x,0,p.z);scene.add(g);buildings.push(g);
let sign=new THREE.Mesh(new THREE.BoxGeometry(5,.8,.18),mat(0x102a42));sign.position.set(p.x,h+1,p.z+d/2+.2);scene.add(sign);
let canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;let ctx=canvas.getContext('2d');ctx.fillStyle='#102a42';ctx.fillRect(0,0,512,128);ctx.fillStyle='white';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.fillText(p.name.toUpperCase(),256,82);let tex=new THREE.CanvasTexture(canvas);sign.material=new THREE.MeshBasicMaterial({map:tex});
}
function addNPC(p,i){let npc=makeAvatar([0xe28c55,0x557fc2,0x9a6bc2,0x3e987f][i%4]);npc.position.set(p.x+(p.x<0?7:-7),0,p.z+10);npc.userData.place=p.name;scene.add(npc);npcs.push(npc)}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x91c7dc);scene.fog=new THREE.Fog(0x91c7dc,65,190);
 camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,400);camera.position.set(0,8,15);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('world').appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xe4f7ff,0x52664d,2));let sun=new THREE.DirectionalLight(0xfff2d6,2.2);sun.position.set(-35,55,30);sun.castShadow=true;scene.add(sun);
 let ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),mat(0x78a96c));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;scene.add(ground);
 // road grid
 for(let z=-110;z<=110;z+=35){let r=new THREE.Mesh(new THREE.BoxGeometry(12,.06,300),mat(0x394752));r.rotation.y=Math.PI/2;r.position.set(0,.01,z);scene.add(r)}
 for(let x=-100;x<=100;x+=35){let r=new THREE.Mesh(new THREE.BoxGeometry(300,.06,12),mat(0x394752));r.position.set(x,.015,0);scene.add(r)}
 for(let p of places){addBuilding(p);addNPC(p,places.indexOf(p))}
 // trees / lamp posts
 for(let i=0;i<55;i++){let x=(Math.random()-.5)*230,z=(Math.random()-.5)*230;if(Math.abs(x)<12||Math.abs(z)<12)continue;let trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,2,7),mat(0x725033));trunk.position.set(x,1,z);scene.add(trunk);let crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,7),mat(0x34764b));crown.position.set(x,3,z);scene.add(crown)}
 player=makeAvatar();player.position.set(0,0,8);scene.add(player);clock=new THREE.Clock();addEvents();animate();
}
function addEvents(){window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e')interact();if(e.key==='Escape')closeModal()});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-move]').forEach(b=>{let k=b.dataset.move;b.addEventListener('pointerdown',e=>{e.preventDefault();touch[k]=true;b.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>touch[k]=false))});
$('menuBtn').onclick=()=>openPanel('menu');$('closeModal').onclick=closeModal;$('missionsBtn').onclick=()=>openPanel('missions');$('mapBtn').onclick=()=>openPanel('map');$('learnBtn').onclick=()=>openPanel('notebook');$('dashBtn').onclick=()=>openPanel('dashboard');$('interactBtn').onclick=interact;$('fullscreenBtn').onclick=toggleFullscreen;
}
function toggleFullscreen(){if(!document.fullscreenElement){document.documentElement.requestFullscreen?.().catch(()=>toast('Full-screen is not available in this browser'))}else{document.exitFullscreen?.()}}
function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.04);move(dt);renderer.render(scene,camera)}
function move(dt){let f=keys.w||keys.arrowup||touch.forward,b=keys.s||keys.arrowdown||touch.back,l=keys.a||keys.arrowleft||touch.left,r=keys.d||keys.arrowright||touch.right;let dx=(r?1:0)-(l?1:0),dz=(b?1:0)-(f?1:0);let len=Math.hypot(dx,dz)||1;player.position.x+=dx/len*dt*10;player.position.z+=dz/len*dt*10;player.position.x=THREE.MathUtils.clamp(player.position.x,-125,125);player.position.z=THREE.MathUtils.clamp(player.position.z,-125,125);if(dx||dz){player.rotation.y=Math.atan2(dx,dz);player.position.y=Math.abs(Math.sin(Date.now()*.012))*.035}
camera.position.x+=(player.position.x-camera.position.x)*dt*3;camera.position.z+=(player.position.z+13-camera.position.z)*dt*3;camera.lookAt(player.position.x,1.2,player.position.z-5);
let best=null,dist=1e9;for(let p of places){let d=Math.hypot(player.position.x-p.x,player.position.z-p.z);if(d<dist){dist=d;best=p}}near=dist<22?best:null;$('nearby').textContent=near?`Tap TALK to visit ${near.name} ${near.emoji}`:'Explore the city and approach a location';$('interactBtn').disabled=!near;$('interactBtn').classList.toggle('ready',!!near);}
function level(){let n=xp<500?1:xp<1500?2:3;return ['','BEGINNER','INTERMEDIATE','ADVANCED'][n]}
function refresh(){ $('xp').textContent=xp;$('coins').textContent=coins;$('levelName').textContent=level();$('levelProgress').style.width=(xp%500)/5+'%';$('streak').textContent=localStorage.ewStreak||1}
function toast(t){let el=$('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function show(html){$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){ $('modal').classList.add('hidden');activeMission=null}
function openPanel(type){
 if(type==='menu'){show(`<div class="eyebrow">WELCOME BACK, EXPLORER</div><h1>ENGLISH WORLD</h1><p class="muted">Learn English by exploring, speaking and completing real-life missions.</p><div class="grid"><button class="btn" onclick="window.openPanel('missions')">📍 Missions</button><button class="btn" onclick="window.openPanel('map')">🗺 Explore city</button><button class="btn" onclick="window.openPanel('dashboard')">📊 My progress</button><button class="btn" onclick="window.openPanel('profile')">👤 Character</button></div>`);return}
 if(type==='missions'){let html=`<div class="eyebrow">YOUR LEARNING JOURNEY</div><h1>MISSIONS</h1><p class="muted">Choose your level and practise real-life conversations.</p>`;for(let band of [{n:1,t:'BEGINNER',d:'Simple sentences, greetings and everyday English'},{n:2,t:'INTERMEDIATE',d:'Daily situations, travel, workplace and longer replies'},{n:3,t:'ADVANCED',d:'Presentations, negotiation and professional communication'}]){html+=`<h2 class="level-heading">${band.t}</h2><p class="muted level-desc">${band.d}</p><div class="grid">`;for(let m of MISSIONS.filter(x=>x.level===band.n)){let done=completed.includes(m.id);html+=`<button class="mission" onclick="window.startMission(${m.id})"><b>${done?'✅ ':''}${String(m.id).padStart(2,'0')} · ${m.title}</b><small>${m.place}</small></button>`}html+='</div>'}show(html);return}
 if(type==='map'){let html=`<div class="eyebrow">OPEN WORLD</div><h1>CITY MAP</h1><p class="muted">Choose a destination. Your character will move close to it.</p><div class="maplist">`;places.forEach(p=>html+=`<div class="mapitem" onclick="window.goPlace('${p.name}')">${p.emoji} ${p.name}</div>`);html+='</div>';show(html);return}
 if(type==='notebook'){let all={};MISSIONS.filter(m=>completed.includes(m.id)).forEach(m=>m.words.forEach(w=>all[w[0]]=w[1]));let html=`<div class="eyebrow">PERSONAL VOCABULARY</div><h1>MY NOTEBOOK</h1><p class="muted">Words from completed missions.</p>`;html+=Object.keys(all).length?Object.entries(all).map(([a,b])=>`<span class="word">${a} · ${b}</span>`).join(''):'<p>Complete missions to collect new vocabulary.</p>';show(html);return}
 if(type==='dashboard'){let pct=Math.round(completed.length/20*100),mins=Math.floor((Date.now()-sessionStart)/60000);show(`<div class="eyebrow">YOUR PERFORMANCE</div><h1>LEARNING DASHBOARD</h1><div class="statgrid"><div class="stat"><b>${xp}</b>XP earned</div><div class="stat"><b>${completed.length}/20</b>Missions done</div><div class="stat"><b>${sentences}</b>Sentences practised</div><div class="stat"><b>${words}</b>Words learned</div><div class="stat"><b>${pct}%</b>Completion</div><div class="stat"><b>${mins}m</b>This session</div></div><p class="muted">Current level: ${level()} · Coins: ${coins}</p>`);return}
 if(type==='profile'){show(`<div class="eyebrow">PLAYER PROFILE</div><h1>YOUR AVATAR</h1><p>Choose your character style.</p><button class="btn" onclick="window.setGender('male')">Male avatar</button><button class="btn" onclick="window.setGender('female')">Female avatar</button><p class="muted">Your avatar appearance updates in the 3D city.</p>`)}
}
window.openPanel=openPanel;
window.goPlace=name=>{let p=places.find(x=>x.name===name);if(p){player.position.set(p.x,p.z?0:0,p.z+18);closeModal();toast('Destination selected: '+name)}};
window.setGender=g=>{playerGender=g;localStorage.ewGender=g;scene.remove(player);player=makeAvatar();player.position.set(0,0,8);scene.add(player);closeModal();toast('Avatar updated')};
window.startMission=id=>{let m=MISSIONS.find(x=>x.id===id);if(!m)return;activeMission=m;closeModal();renderMission(m)};
function renderMission(m){show(`<div class="eyebrow">MISSION ${String(m.id).padStart(2,'0')} · LEVEL ${m.level}</div><h1>${m.title}</h1><p class="muted">Location: ${m.place} · Speaking with ${m.npc}</p><div class="dialogue"><strong>${m.npc}</strong>${m.question}</div><p><b>Malayalam meaning</b><br><span class="translation">${m.ml}</span></p><p><b>Useful vocabulary</b><br>${m.words.map(w=>`<span class="word">${w[0]} · ${w[1]}</span>`).join('')}</p><p><b>Grammar tip</b><br><span class="translation">${m.grammar}</span></p><div class="dialogue"><strong>Your speaking challenge</strong>Answer the character in English. You can use your microphone or type your answer.</div><div class="answerrow"><input id="answer" placeholder="Type your English answer…" autocomplete="off"><button class="btn" id="submitAnswer">CHECK</button></div><button class="btn pink" id="speakBtn">🎙 SPEAK</button><button class="btn alt" id="listenBtn">🔊 LISTEN TO MODEL</button><div id="speechStatus" class="muted"></div><div id="feedback"></div><p class="muted">Model answer: ${m.model}</p>`);$('submitAnswer').onclick=()=>checkAnswer($('answer').value,m);$('speakBtn').onclick=()=>listen(m);$('listenBtn').onclick=()=>say(m.model)}
function normal(s){return s.toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()}
function checkAnswer(answer,m){if(!answer.trim()){toast('Please speak or type an answer first');return}sentences++;localStorage.ewSentences=sentences;let a=normal(answer),best=m.expected.map(normal).sort((x,y)=>similarity(y,a)-similarity(x,a))[0],score=Math.round(similarity(best,a)*100);let good=score>=48||m.expected.some(x=>a===normal(x));let missing=best.split(' ').filter(w=>!a.includes(w));let fb=good?`<b>Nice work! 🎉</b> Your response communicates the idea. Similarity: ${score}%.`:`<b>Good try! Keep practising.</b> Your response is understandable only if the key idea is clear. Try adding: ${missing.slice(0,5).join(', ')||'more details'}.`;fb+=`<br><br><b>Suggested answer:</b> ${m.model}<br><b>Tip:</b> ${m.grammar}`;$('feedback').innerHTML=`<div class="feedback">${fb}</div>`;if(good&&!completed.includes(m.id)){completed.push(m.id);xp+=100;coins+=20;words+=m.words.length;localStorage.ewDone=JSON.stringify(completed);localStorage.ewXP=xp;localStorage.ewCoins=coins;localStorage.ewWords=words;toast('Mission complete! +100 XP · +20 coins')}else if(good){toast('Great practice! Mission already completed')}refresh()}
function similarity(a,b){let aa=a.split(' '),bb=b.split(' '),hit=aa.filter(w=>bb.includes(w)).length;return hit/Math.max(aa.length,bb.length,1)}
function listen(m){let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$('speechStatus').textContent='Speech recognition is not supported in this browser. Please type your answer.';return}let rec=new SR();rec.lang='en-IN';rec.interimResults=false;rec.maxAlternatives=3;$('speechStatus').textContent='Listening… Speak clearly.';rec.onresult=e=>{let text=e.results[0][0].transcript;$('answer').value=text;$('speechStatus').textContent='Recognised: '+text;checkAnswer(text,m)};rec.onerror=e=>$('speechStatus').textContent='Microphone issue: '+e.error+'. You can type instead.';rec.start()}
function say(text){if(!('speechSynthesis'in window)){toast('Speech playback is not supported');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.rate=.88;speechSynthesis.speak(u)}
function interact(){if(near){let m=MISSIONS.find(m=>m.place===near.name&&!completed.includes(m.id))||MISSIONS.find(m=>m.place===near.name);if(m)startMission(m.id);else{openPanel('missions');toast('Explore the missions list')}}else toast('Move closer to a city location')}
window.addEventListener('beforeunload',()=>{localStorage.ewCoins=coins;localStorage.ewXP=xp});
init();refresh();
})();