/* ---------- ADR: timeline + causality + HPVC (ไม่มีช่องชื่อ/HN — ข้อมูลอยู่ในเบราว์เซอร์เท่านั้น) ---------- */
const ADR_SRC='ระยะเวลาอ้างอิง: Cutaneous Drug Eruptions in Clinical Practices (นพ.สัญชัย สมบัติไมไทย, คณะแพทยศาสตร์ มมส.)';
const ADR_RT=[ // [id, label, [min,max] วัน, คำอธิบายช่วงที่พบบ่อย, major?]
 ['','— เลือกชนิดอาการ —',null,''],
 ['ana','Anaphylaxis',[0,1],'นาที–ชั่วโมง (ส่วนใหญ่ภายในชั่วโมงแรก)',1],
 ['urt','Urticaria / Angioedema',[0,1],'นาที–ชั่วโมง (immediate ภายใน 1–6 ชม.)',0],
 ['mpe','Maculopapular rash (MPE)',[7,14],'7–14 วัน (มักภายใน 1 สัปดาห์; เคยได้ยามาก่อนเร็วกว่านี้)',0],
 ['fde','Fixed drug eruption',[0,2],'ภายใน 48 ชม. หลังได้ยาซ้ำ',0],
 ['agep','AGEP',[0,2],'ภายใน 48 ชม. – ไม่กี่วัน',1],
 ['em','Erythema multiforme (minor)',[3,21],'วัน–3 สัปดาห์',0],
 ['sjs','SJS / TEN',[7,21],'7–21 วัน',1],
 ['dress','DRESS / Hypersensitivity syndrome',[14,56],'14–48 วัน (2–8 สัปดาห์)',1],
 ['exfol','Exfoliative dermatitis',[7,42],'สัปดาห์',1],
 ['vasc','Drug-induced vasculitis',[7,21],'1–3 สัปดาห์',1],
 ['warf','Warfarin-induced skin necrosis',[3,10],'3–10 วันหลังเริ่ม warfarin',1],
 ['dili','Drug-induced liver injury',[5,90],'5–90 วัน',0],
 ['flu','Flu-like / ไข้จากยา',[0,21],'ชั่วโมง–3 สัปดาห์',0],
 ['other','อื่น ๆ',null,'',0]];
const ADR_EV=[['adr','อาการ (ADR)'],['relief','ยาบรรเทา'],['lab','Lab'],['note','หมายเหตุ']];
const NAR_Q=[
 ['มีรายงานหรือหลักฐานการเกิดอาการนี้จากยานี้มาก่อน',[1,0,0]],
 ['อาการเกิดขึ้นหลังได้รับยาที่สงสัย',[2,-1,0]],
 ['อาการดีขึ้นเมื่อหยุดยา หรือได้ยาต้านเฉพาะ',[1,0,0]],
 ['อาการเกิดซ้ำเมื่อได้รับยาซ้ำ',[2,-1,0]],
 ['มีสาเหตุอื่น (นอกจากยา) ที่ทำให้เกิดอาการได้',[-1,2,0]],
 ['อาการเกิดเมื่อได้ยาหลอก',[-1,1,0]],
 ['ตรวจพบยาในเลือดในระดับที่เป็นพิษ',[1,0,0]],
 ['อาการรุนแรงขึ้นเมื่อเพิ่มขนาด หรือลดลงเมื่อลดขนาด',[1,0,0]],
 ['ผู้ป่วยเคยมีอาการคล้ายกันกับยานี้หรือยาที่คล้ายกัน',[1,0,0]],
 ['ยืนยันด้วยหลักฐานที่ตรวจวัดได้ (objective evidence)',[1,0,0]]];
const narCat=s=>s>=9?['Definite','ใช่แน่นอน']:s>=5?['Probable','น่าจะใช่']:s>=1?['Possible','อาจจะใช่']:['Unlikely','ไม่น่าใช่'];
const WHO_UMC=[['Certain','ใช่แน่นอน','ความสัมพันธ์ทางเวลาเหมาะสม · อธิบายด้วยโรค/ยาอื่นไม่ได้ · หยุดยาแล้วดีขึ้น · อาการจำเพาะต่อยา · ให้ยาซ้ำเกิดซ้ำ (ถ้าจำเป็น)'],
 ['Probable','น่าจะใช่','ความสัมพันธ์ทางเวลาเหมาะสม · ไม่น่าเกิดจากโรค/ยาอื่น · หยุดยาแล้วดีขึ้น · ไม่ต้องให้ยาซ้ำ'],
 ['Possible','อาจจะใช่','ความสัมพันธ์ทางเวลาเหมาะสม · แต่อธิบายด้วยโรค/ยาอื่นได้ · ข้อมูลการหยุดยาไม่ชัด'],
 ['Unlikely','ไม่น่าใช่','ความสัมพันธ์ทางเวลาไม่น่าเป็นไปได้ · โรค/ยาอื่นอธิบายได้ดีกว่า'],
 ['Unclassified','ไม่สามารถระบุระดับ','ข้อมูลไม่พอ / ขัดแย้ง ต้องหาข้อมูลเพิ่ม']];
const REGI=[ // RegiSCAR DRESS score
 ['fever','ไข้ ≥38.5°C',[['y','มี',0],['n','ไม่มี / ไม่ทราบ',-1]]],
 ['ln','ต่อมน้ำเหลืองโต (>1 cm, ≥2 ตำแหน่ง)',[['y','มี',1],['n','ไม่มี / ไม่ทราบ',0]]],
 ['eos','Eosinophilia',[['n','ไม่มี / ไม่ทราบ',0],['1','0.7–1.499 ×10⁹/L หรือ 10–19.9%',1],['2','≥1.5 ×10⁹/L หรือ ≥20%',2]]],
 ['atl','Atypical lymphocytes',[['y','มี',1],['n','ไม่มี / ไม่ทราบ',0]]],
 ['bsa','ผื่น >50% BSA',[['y','ใช่',1],['n','ไม่ / ไม่ทราบ',0]]],
 ['skin','ลักษณะผื่นเข้าได้ (≥2: หน้าบวม, infiltration, purpura, scaling)',[['y','ใช่',1],['u','ไม่ทราบ',0],['n','ไม่ใช่',-1]]],
 ['bx','ผลชิ้นเนื้อเข้าได้กับ DRESS',[['u','ใช่ / ไม่ได้ทำ',0],['n','ไม่ใช่',-1]]],
 ['org','อวัยวะภายในผิดปกติ (ตับ ไต ปอด ฯลฯ)',[['0','ไม่มี',0],['1','1 อวัยวะ',1],['2','≥2 อวัยวะ',2]]],
 ['res','หายช้า ≥15 วัน',[['y','ใช่',0],['n','ไม่ / ไม่ทราบ',-1]]],
 ['oth','ตรวจแยกสาเหตุอื่นแล้วลบ ≥3 อย่าง (ANA, H/C, HAV/HBV/HCV, mycoplasma/chlamydia)',[['y','ใช่',1],['n','ไม่',0]]]];
const regiCat=s=>s>=6?'Definite':s>=4?'Probable':s>=2?'Possible':'No case';
const SER=[['non','ไม่ร้ายแรง'],['death','ร้ายแรง: เสียชีวิต'],['life','ร้ายแรง: อันตรายถึงชีวิต'],['hosp','ร้ายแรง: ต้องเข้ารักษาใน รพ. / นอนนานขึ้น'],['disab','ร้ายแรง: พิการถาวร/ไร้ความสามารถ'],['cong','ร้ายแรง: ความผิดปกติแต่กำเนิด'],['med','ร้ายแรง: Medically significant'],['oth','ร้ายแรง: อื่น ๆ']];
const ACT=[['',''],['stop_imp','หยุดยา → อาการดีขึ้นชัดเจน'],['stop_not','หยุดยา → อาการไม่ดีขึ้น'],['stop_unk','หยุดยา → ไม่ทราบ'],['cont_same','ใช้ต่อขนาดเดิม'],['cont_red','ใช้ต่อแต่ลดขนาด'],['cont_route','เปลี่ยนวิธีบริหารยา']];
const RECH=[['',''],['recur','ให้ยาซ้ำ → เกิดอาการซ้ำ'],['norecur','ให้ยาซ้ำ → ไม่เกิดอาการ'],['unk','ให้ยาซ้ำ → ไม่ทราบ'],['none','ไม่มีการให้ยาซ้ำ']];
const OUTC=[['',''],['rec','หายเป็นปกติไม่มีร่องรอย'],['seq','หายโดยมีร่องรอย'],['imp','อาการดีขึ้นแต่ยังไม่หาย'],['not','ยังมีอาการอยู่'],['death','เสียชีวิต'],['lost','ไม่สามารถติดตามผลได้']];
const ADR0=()=>({drugs:[],evs:[],rtype:'',nar:{},narSel:null,who:'',regi:{},f:{ser:'non',act:'',rech:'',out:'',lab:'',treat:'',hx:''}});
let ADR=ADR0(), adrSeq=0;
const ADR_NAMES=[...new Set([...KB.map(k=>k.name),...(typeof DM!=='undefined'?DM.map(m=>m[1]):[])])];

function adrInit(){
  const s=document.getElementById('p-adr'); if(!s) return;
  $('aRt').innerHTML=ADR_RT.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('');
  $('aSer').innerHTML=SER.map(r=>`<option value="${r[0]}">${esc(r[1])}</option>`).join('');
  $('aAct').innerHTML=ACT.map(r=>`<option value="${r[0]}">${esc(r[1]||'—')}</option>`).join('');
  $('aRech').innerHTML=RECH.map(r=>`<option value="${r[0]}">${esc(r[1]||'—')}</option>`).join('');
  $('aOut').innerHTML=OUTC.map(r=>`<option value="${r[0]}">${esc(r[1]||'—')}</option>`).join('');
  $('aDrugList').innerHTML=ADR_NAMES.map(n=>`<option value="${esc(n)}">`).join('');
  $('aRegi').innerHTML=REGI.map(([k,l,o])=>`<label class="f">${esc(l)}<select data-regi="${k}"><option value="">—</option>${o.map(x=>`<option value="${x[0]}">${esc(x[1])} (${x[2]>0?'+':''}${x[2]})</option>`).join('')}</select></label>`).join('');
  $('aRegi').querySelectorAll('[data-regi]').forEach(s=>s.addEventListener('change',()=>{ADR.regi[s.dataset.regi]=s.value;adrOut();}));
  $('aRt').addEventListener('change',()=>{ADR.rtype=$('aRt').value;adrOut();});
  [['aSer','ser'],['aAct','act'],['aRech','rech'],['aOut','out'],['aLabel','lab']].forEach(([id,k])=>$(id).addEventListener('change',()=>{ADR.f[k]=$(id).value;adrOut();}));
  [['aTreat','treat'],['aHx','hx']].forEach(([id,k])=>$(id).addEventListener('input',()=>{ADR.f[k]=$(id).value;adrOut();}));
  document.querySelectorAll('[data-who]').forEach(r=>r.addEventListener('change',()=>{ADR.who=r.value;adrOut();}));
  $('aAddDrug').onclick=()=>{adrAddDrug();};
  $('aPasteBtn').onclick=()=>{ const ls=joinLines($('aPaste').value.split(/\n/)); ls.forEach(L=>{ const p=parseLine(L); const d=p&&KB.find(k=>k.id===p.drugId), mm=p&&masterOf(p);
      const nm=d?d.name:mm?mm[1]:(L.replace(/\s+(?:\d+(?:\.\d+)?|\d*[½¼¾])\s*[x×*]\s*\d.*$|\s+(?:รับประทาน|ครั้งละ|วันละ|q\s*\d|od\b|bid\b|tid\b|qid\b|hs\b|iv\b|po\b).*$/i,'').trim()||L); adrAddDrug({name:nm,dose:L},true);}); $('aPaste').value=''; adrDrugs(); };
  ADR_EV.forEach(([t])=>{const b=$('aAdd_'+t); if(b) b.onclick=()=>{adrAddEv(t);};});
  $('aNarSel').addEventListener('change',()=>{ADR.narSel=$('aNarSel').value;adrNar();adrOut();});
  $('aClear').onclick=()=>{ if(!confirmClear()) return; ADR=ADR0(); adrSync(); };
  $('aSave').onclick=adrSave; $('aLoad').addEventListener('change',adrLoad);
  $('aCopy1').onclick=()=>adrCopy('aOutTxt'); $('aCopy2').onclick=()=>adrCopy('aNoteTxt');
  adrSync();
}
function confirmClear(){ const b=$('aClear'); if(b.dataset.armed){delete b.dataset.armed;b.textContent='ล้างเคส ADR';return true;} b.dataset.armed='1'; b.textContent='กดอีกครั้งเพื่อยืนยันล้าง'; setTimeout(()=>{delete b.dataset.armed;b.textContent='ล้างเคส ADR';},3000); return false; }
function adrSync(){ if(typeof m48Init==='function'&&$('m48Box')) setTimeout(()=>m48Init(),0); $('aRt').value=ADR.rtype||''; $('aSer').value=ADR.f.ser||'non'; $('aAct').value=ADR.f.act||''; $('aRech').value=ADR.f.rech||''; $('aOut').value=ADR.f.out||''; $('aLabel').value=ADR.f.lab||''; $('aTreat').value=ADR.f.treat||''; $('aHx').value=ADR.f.hx||'';
  document.querySelectorAll('[data-who]').forEach(r=>r.checked=r.value===ADR.who);
  $('aRegi').querySelectorAll('[data-regi]').forEach(s=>s.value=ADR.regi[s.dataset.regi]||'');
  adrDrugs(); adrEvs(); }
function adrAddDrug(pre={},silent){ ADR.drugs.push({id:'d'+(++adrSeq),name:'',role:ADR.drugs.length?'O':'S',dose:'',sd:'',st:'',ed:'',et:'',ind:'',src:'1',...pre}); if(!silent) adrDrugs(); }
function adrAddEv(type,pre={}){ ADR.evs.push({id:'e'+(++adrSeq),type,d:'',t:'',text:'',sev:'',lab:'',val:'',unit:'',lo:'',hi:'',...pre}); adrEvs(); }
const adrInp=(o,k,ph='',ex='')=>`<input data-k="${k}" value="${esc(o[k]??'')}" placeholder="${esc(ph)}" ${ex}>`;
function adrBind(box,arr){ box.querySelectorAll('[data-row]').forEach(row=>{ const o=arr.find(x=>x.id===row.dataset.row);
  row.querySelectorAll('[data-k]').forEach(i=>{ const ev=i.tagName==='SELECT'?'change':'input'; i.addEventListener(ev,()=>{o[i.dataset.k]=i.value; if(i.dataset.k==='role'||i.dataset.k==='type'){ if(arr===ADR.evs) adrEvs(); else {row.dataset.role=i.value; adrNarSelOpts();} } adrOut();}); });
  row.querySelector('[data-del]').onclick=()=>{arr.splice(arr.indexOf(o),1); arr===ADR.evs?adrEvs():adrDrugs();}; }); }
function adrDrugs(){
  const box=$('aDrugs');
  box.innerHTML=ADR.drugs.length?ADR.drugs.map(d=>`<div class="arow" data-row="${d.id}" data-role="${d.role}">
    <label class="f a-wide">ยา<input data-k="name" list="aDrugList" value="${esc(d.name)}" placeholder="ชื่อยา (พิมพ์เพื่อค้นหาในบัญชียา)"></label>
    <label class="f">บทบาท<select data-k="role">${[['S','S = ยาที่สงสัย'],['O','O = ยาที่ใช้ร่วม'],['I','I = ยาที่เกิดปฏิกิริยาต่อกัน']].map(r=>`<option value="${r[0]}"${d.role===r[0]?' selected':''}>${r[1]}</option>`).join('')}</select></label>
    <label class="f a-wide">ขนาด/วิธีใช้/ความถี่${adrInp(d,'dose','เช่น 100 mg 1x1 pc')}</label>
    <label class="f">เริ่มใช้${adrInp(d,'sd','dd/mm/2569')}</label><label class="f">เวลา${adrInp(d,'st','08:00')}</label>
    <label class="f">หยุดใช้ (ว่าง = ยังใช้อยู่)${adrInp(d,'ed','dd/mm/2569')}</label><label class="f">เวลา${adrInp(d,'et','')}</label>
    <label class="f a-wide">โรค/ข้อบ่งใช้${adrInp(d,'ind','')}</label>
    <label class="f">แหล่งที่ได้รับ<select data-k="src"><option value="1"${d.src==='1'?' selected':''}>1 = ใน รพ.</option><option value="2"${d.src==='2'?' selected':''}>2 = แหล่งอื่น</option></select></label>
    <button class="x" data-del type="button" title="ลบ">✕</button></div>`).join(''):'<div class="empty">ยังไม่มีรายการยา — กด "+ ยา" หรือวางรายการยา</div>';
  adrBind(box,ADR.drugs); adrNarSelOpts(); adrOut(); }
function adrEvs(){
  const box=$('aEvs'), lab=ADR.evs.filter(e=>e.type==='lab');
  const sorted=[...ADR.evs].sort((a,b)=>((tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0)));
  box.innerHTML=sorted.length?sorted.map(e=>`<div class="arow ev-${e.type}" data-row="${e.id}">
    <label class="f">ประเภท<select data-k="type">${ADR_EV.map(t=>`<option value="${t[0]}"${e.type===t[0]?' selected':''}>${t[1]}</option>`).join('')}</select></label>
    <label class="f">วันที่${adrInp(e,'d','dd/mm/2569')}</label><label class="f">เวลา${adrInp(e,'t','')}</label>
    ${e.type==='lab'?`<label class="f">Lab${adrInp(e,'lab','เช่น Eosinophil','list="aLabList"')}</label><label class="f">ค่า${adrInp(e,'val','','inputmode="decimal"')}</label><label class="f">หน่วย${adrInp(e,'unit','%')}</label><label class="f">ค่าปกติต่ำ${adrInp(e,'lo','','inputmode="decimal"')}</label><label class="f">ค่าปกติสูง${adrInp(e,'hi','','inputmode="decimal"')}</label>`
      :`<label class="f a-wide">${e.type==='adr'?'อาการ / รายละเอียด':e.type==='relief'?'ยาบรรเทา (ชื่อ ขนาด)':'หมายเหตุ'}${adrInp(e,'text',e.type==='adr'?'เช่น MP rash ทั้งตัว คันมาก ไข้ 38.5':'')}</label>${e.type==='adr'?`<label class="f">ความรุนแรง<select data-k="sev"><option value="">—</option>${['เล็กน้อย','ปานกลาง','รุนแรง'].map(s=>`<option${e.sev===s?' selected':''}>${s}</option>`).join('')}</select></label>`:''}`}
    <button class="x" data-del type="button" title="ลบ">✕</button></div>`).join(''):'<div class="empty">ยังไม่มีเหตุการณ์ — เพิ่มอาการ ยาบรรเทา หรือ Lab</div>';
  adrBind(box,ADR.evs); adrOut(); }
function adrNarSelOpts(){ const s=$('aNarSel'), cur=ADR.narSel; const ds=ADR.drugs.filter(d=>d.name);
  s.innerHTML=ds.length?ds.map(d=>`<option value="${d.id}">${d.role} · ${esc(d.name)}</option>`).join(''):'<option value="">— เพิ่มยาก่อน —</option>';
  if(ds.some(d=>d.id===cur)) s.value=cur; else { const sp=ds.find(d=>d.role==='S')||ds[0]; ADR.narSel=sp?sp.id:null; if(sp) s.value=sp.id; }
  adrNar(); }
function adrOnset(){ const t=ADR.evs.filter(e=>e.type==='adr').map(e=>tlDate(e.d,e.t||'0:00')).filter(Boolean).sort((a,b)=>a-b); return t[0]||null; }
function adrLat(d,on){ const s=tlDate(d.sd,d.st||'0:00'), e=d.ed?tlDate(d.ed,d.et||'23:59'):null; if(!s||!on) return null;
  const days=(on-s)/864e5, rt=ADR_RT.find(r=>r[0]===ADR.rtype), w=rt&&rt[2]; let v=null,txt='',lvl='info';
  if(days<0){v='after';txt='เริ่มยาหลังเกิดอาการ — ไม่น่าเป็นสาเหตุ';lvl='ok';}
  else if(e&&e<on&&(on-e)/864e5>(ADR.rtype==='dress'?14:7)){v='gap';txt=`หยุดยาไปก่อนเกิดอาการ ${fmtN((on-e)/864e5)} วัน — ความสัมพันธ์ทางเวลาอ่อน`;lvl='warn';}
  else if(w){ if(days<w[0]){v='early';txt=`เร็วกว่าช่วงที่พบบ่อยของ ${rt[1]} (${rt[3]}) — เข้าได้ถ้าเคยได้รับ/เคยแพ้ยานี้มาก่อน`;lvl='warn';}
    else if(days>w[1]){v='late';txt=`ช้ากว่าช่วงที่พบบ่อยของ ${rt[1]} (${rt[3]})`;lvl='warn';}
    else {v='fit';txt=`อยู่ในช่วงที่พบบ่อยของ ${rt[1]} (${rt[3]})`;lvl='flag';} }
  else txt='เลือกชนิดอาการเพื่อเทียบช่วงเวลาที่พบบ่อย';
  return {days,v,txt,lvl}; }
function adrNar(){ const id=ADR.narSel, box=$('aNar'); const d=ADR.drugs.find(x=>x.id===id); if(!d){box.innerHTML='';return;}
  const a=ADR.nar[id]||(ADR.nar[id]=Array(10).fill('')); const on=adrOnset(), L=adrLat(d,on);
  const hint=i=> i===1&&L?(L.v==='after'?' (timeline: ไม่ใช่)':' (timeline: ใช่)'):i===2&&ADR.f.act?(ADR.f.act==='stop_imp'?' (การจัดการ: ใช่)':ADR.f.act.startsWith('stop')?' (การจัดการ: ไม่/ไม่ทราบ)':''):i===3&&ADR.f.rech?(ADR.f.rech==='recur'?' (ให้ยาซ้ำ: ใช่)':ADR.f.rech==='norecur'?' (ให้ยาซ้ำ: ไม่)':''):'';
  box.innerHTML=NAR_Q.map(([q,p],i)=>`<div class="nq"><span class="nqn">${i+1}</span><span class="nqt">${esc(q)}<span class="hint">${hint(i)}</span></span><span class="seg nseg">${[['y','ใช่',p[0]],['n','ไม่ใช่',p[1]],['u','ไม่ทราบ',p[2]]].map(([v,l,s])=>`<button type="button" data-q="${i}" data-v="${v}" aria-pressed="${a[i]===v}">${l} <small>${s>0?'+':''}${s}</small></button>`).join('')}</span></div>`).join('');
  box.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{a[+b.dataset.q]=b.dataset.v; adrNar(); adrOut();}); }
const narScore=id=>{const a=ADR.nar[id]; if(!a||!a.some(Boolean)) return null; return a.reduce((s,v,i)=>s+(v==='y'?NAR_Q[i][1][0]:v==='n'?NAR_Q[i][1][1]:v==='u'?NAR_Q[i][1][2]:0),0);};
function adrOut(){
  const pt=getPt(), on=adrOnset(), msgs=[], li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  const ds=ADR.drugs.filter(d=>d.name);
  // latency table
  const lat=ds.map(d=>({d,L:adrLat(d,on)}));
  $('aLat').innerHTML=!on?'<div class="empty">ใส่อาการ (ADR) พร้อมวันที่ เพื่อคำนวณระยะเวลาตั้งแต่เริ่มยาถึงเกิดอาการ</div>':
    `<p class="hint" style="margin:0 0 6px">เริ่มมีอาการ ${tlFmt(on)} · ${ADR_SRC} · ใช้ประกอบการประเมิน ไม่ใช่เกณฑ์ตัดสิน · อาการทุกชนิดเกิดเร็วขึ้นได้ถ้าเคยได้รับยามาก่อน</p><ul class="msgs">${lat.map(({d,L})=>L?li(L.lvl==='flag'&&d.role!=='S'?'warn':L.lvl,`${d.role} · ${d.name}: ${L.v==='after'?'':'เริ่มยาก่อนเกิดอาการ '+fmtN(L.days)+' วัน — '}${L.txt}`):li('info',`${d.role} · ${d.name}: ไม่มีวันเริ่มยา`)).join('')}</ul>`;
  // naranjo summary
  const narTxt=ds.map(d=>{const s=narScore(d.id); return s==null?null:`${d.name} = ${s} (${narCat(s)[0]} · ${narCat(s)[1]})`;}).filter(Boolean);
  const ns=narScore(ADR.narSel); $('aNarRes').innerHTML=(ns==null?'<span class="hint">ตอบคำถามเพื่อคำนวณคะแนน</span>':`<div class="big"><span class="n">${ns}</span><span class="u">${narCat(ns)[0]} · ${narCat(ns)[1]} (≥9 Definite · 5–8 Probable · 1–4 Possible · ≤0 Unlikely)</span></div>`)
    +(ds.length>1?`<div style="margin-top:10px"><div class="hint" style="margin-bottom:4px">คะแนนทุกยา — กดชื่อยาเพื่อสลับไปประเมิน (แบบพิมพ์ MKH-FR-PHA-048 แสดงได้ 3 ยา เรียง S ก่อน)</div>${ds.map(d=>{const s=narScore(d.id),n=(ADR.nar[d.id]||[]).filter(Boolean).length;return `<button type="button" class="btn sm${d.id===ADR.narSel?' pri':''}" data-nsw="${d.id}" style="margin:2px">${d.role} · ${esc(d.name)} — ${s==null?'ยังไม่ประเมิน':`${s} ${narCat(s)[0]} (${n}/10)`}</button>`;}).join('')}</div>`:'');
  $('aNarRes').querySelectorAll('[data-nsw]').forEach(b=>b.onclick=()=>{ADR.narSel=b.dataset.nsw;$('aNarSel').value=ADR.narSel;adrNar();adrOut();});
  // RegiSCAR
  const rk=Object.keys(ADR.regi).filter(k=>ADR.regi[k]); const rs=REGI.reduce((s,[k,,o])=>{const x=o.find(z=>z[0]===ADR.regi[k]); return s+(x?x[2]:0);},0);
  $('aRegiRes').innerHTML=rk.length?`<div class="big"><span class="n">${rs}</span><span class="u">${regiCat(rs)} DRESS (<2 no case · 2–3 possible · 4–5 probable · ≥6 definite) · ตอบแล้ว ${rk.length}/10</span></div>`:'<span class="hint">เลือกคำตอบแต่ละข้อ</span>';
  // timeline
  adrChart(on); if(typeof aldOut==='function'&&!$('asm-alden').hidden) aldOut();
  // output text
  const age=ageTxt(), bw=$('bw').value, rt=ADR_RT.find(r=>r[0]===ADR.rtype);
  const role={S:'ยาที่สงสัย (S)',O:'ยาที่ใช้ร่วม (O)',I:'ยาที่เกิดปฏิกิริยาต่อกัน (I)'};
  const dline=d=>{const L=adrLat(d,on), s=narScore(d.id); return `- ${d.name}${d.dose?` · ${d.dose}`:''} · เริ่ม ${d.sd||'–'}${d.st?' '+d.st:''} · หยุด ${d.ed?d.ed+(d.et?' '+d.et:''):'ยังใช้อยู่'}${d.ind?` · ข้อบ่งใช้ ${d.ind}`:''} · แหล่ง ${d.src}${L&&L.v!=='after'?` · ก่อนเกิดอาการ ${fmtN(L.days)} วัน`:''}${s!=null?` · Naranjo ${s} (${narCat(s)[0]})`:''}`;};
  const evs=[...ADR.evs].sort((a,b)=>((tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0)));
  const evl=t=>evs.filter(e=>e.type===t);
  const labTxt=e=>`${e.lab} ${e.val}${e.unit?' '+e.unit:''}${e.lo!==''&&e.hi!==''?` [${e.lo}-${e.hi}]`:e.hi!==''?` [≤${e.hi}]`:e.lo!==''?` [≥${e.lo}]`:''}${labAbn(e)?' *':''} (${e.d}${e.t?' '+e.t:''})`;
  const out=[`แบบรายงาน ADR (HPVC) — ข้อมูลสรุป`,`ผู้ป่วย: ${sex==='F'?'หญิง':'ชาย'} ${age||'–'} น้ำหนัก ${bw||'–'} kg${ADR.f.hx?` · ประวัติ/โรคประจำตัว: ${ADR.f.hx}`:''}`,
    `ชนิดอาการ: ${rt&&rt[0]?rt[1]:'–'}`,
    ...['S','I','O'].flatMap(r=>{const x=ds.filter(d=>d.role===r); return x.length?[`${role[r]}:`,...x.map(dline)]:[];}),
    `เหตุการณ์ไม่พึงประสงค์:`,...(evl('adr').length?evl('adr').map(e=>`- ${e.d}${e.t?' '+e.t:''} ${e.text}${e.sev?` (${e.sev})`:''}`):['- –']),
    ...(evl('lab').length?[`ค่า Lab ผิดปกติ/ที่เกี่ยวข้อง:`,...evl('lab').map(e=>'- '+labTxt(e))]:[]),
    `การรักษาอาการไม่พึงประสงค์: ${[...evl('relief').map(e=>`${e.text} (${e.d})`),ADR.f.treat].filter(Boolean).join(' · ')||'–'}`,
    `Labeled/Non-labeled: ${ADR.f.lab==='lab'?'Labeled (มีในฉลากยา)':ADR.f.lab==='non'?'Non-labeled':'–'}`,
    `ความร้ายแรง: ${(SER.find(s=>s[0]===ADR.f.ser)||['',''])[1]}`,
    `การจัดการยาที่สงสัย: ${(ACT.find(s=>s[0]===ADR.f.act)||['',''])[1]||'–'} · ${(RECH.find(s=>s[0]===ADR.f.rech)||['',''])[1]||'–'}`,
    `ผลลัพธ์: ${(OUTC.find(s=>s[0]===ADR.f.out)||['',''])[1]||'–'}`,
    ...(ADR.m48?[`แบบบันทึก MKH-FR-PHA-048: ${ADR.m48.cls==='ADR'?'ADR':ADR.m48.cls==='non'?'non-ADR':ADR.m48.cls==='insuf'?'ข้อมูลไม่เพียงพอ':'–'} · ${m48Type()?'Type '+m48Type()+' ADR':'Type –'} · ${m48Prev()||'Preventability –'}${ADR.m48.me==='y'?` · ME ${ADR.m48.meType||''} ${ADR.m48.meDet||''}`:''}${ADR.m48.ncc?` · NCC MERP ${ADR.m48.ncc}`:''}`,
      ...(ADR.m48.rep?[`การแพ้ยาซ้ำ: ${{sys:'เนื่องจากระบบโรงพยาบาล',nonsys:'ไม่ใช่สาเหตุจากโรงพยาบาล',int:'ตั้งใจเพื่อประโยชน์ในการรักษา'}[ADR.m48.rep]}`]:[]),
      ...(ADR.m48.cross?[`แพ้ยาในกลุ่มเดียวกัน (${ADR.m48.crossOld||'?'} → ${ADR.m48.crossNew||'?'}): ${{sys:'เนื่องจากระบบโรงพยาบาล',nonsys:'ไม่ใช่จากระบบโรงพยาบาล',int:'เพื่อประโยชน์ในการรักษา'}[ADR.m48.cross]}`]:[]),
      ...(ADR.m48.sjs?[`กลุ่มเฝ้าระวัง SJS/TEN: ${ADR.m48.sjs==='got'?'ได้รับ':'ไม่ได้รับ'}สติ๊กเกอร์/ข้อมูลเฝ้าระวัง`]:[]),...(ADR.m48.di?[`ADR จาก DI: ${ADR.m48.di}`]:[])]:[]),
    `ระดับความน่าจะเป็น (WHO-UMC): ${ADR.who?ADR.who+' ('+(WHO_UMC.find(w=>w[0]===ADR.who)||['',''])[1]+')':'–'}${narTxt.length?` · Naranjo: ${narTxt.join('; ')}`:''}${rk.length?` · RegiSCAR ${rs} (${regiCat(rs)})`:''}${ADR.agep?` · EuroSCAR AGEP ${ADR.agep.s} (${ADR.agep.c})`:''}${ADR.aldenRes&&ADR.aldenRes.length?` · ALDEN: ${ADR.aldenRes.join('; ')}`:''}${ADR.penfast?` · PEN-FAST ${ADR.penfast.s} (${ADR.penfast.r})`:''}`];
  $('aOutTxt').value=out.join('\n');
  const sp=ds.filter(d=>d.role==='S');
  const note=[`Pharmacist note (ADR)`,`S/O: ${sex==='F'?'หญิง':'ชาย'} ${age||'–'}${ADR.f.hx?' · '+ADR.f.hx:''}`,
    ...evl('adr').map(e=>`  ${e.d}${e.t?' '+e.t:''}: ${e.text}`),...evl('lab').filter(labAbn).map(e=>'  '+labTxt(e)),
    `  Timeline: ${ds.map(d=>`${d.name} ${d.sd||'?'}→${d.ed||'ปัจจุบัน'}`).join(' · ')||'–'}`,
    `A: suspected ${rt&&rt[0]?rt[1]:'ADR'} due to ${sp.map(d=>d.name).join(', ')||'–'}${sp.map(d=>{const L=adrLat(d,on);return L&&L.v!=='after'?` (latency ${fmtN(L.days)} d)`:''}).join('')}`,
    `   WHO-UMC: ${ADR.who||'–'}${narTxt.length?' · Naranjo '+narTxt.join('; '):''}${rk.length?` · RegiSCAR ${rs} (${regiCat(rs)})`:''}${ADR.agep?` · AGEP score ${ADR.agep.s} (${ADR.agep.c})`:''}${ADR.aldenRes&&ADR.aldenRes.length?` · ALDEN ${ADR.aldenRes.join('; ')}`:''}${ADR.penfast?` · PEN-FAST ${ADR.penfast.s} (${ADR.penfast.r})`:''} · ${(SER.find(s=>s[0]===ADR.f.ser)||['',''])[1]}`,
    `P: ${(ACT.find(s=>s[0]===ADR.f.act)||['',''])[1]||'…'}${ADR.f.treat?' · '+ADR.f.treat:''} · ออกบัตรแพ้ยา/บันทึกประวัติแพ้ยา · ติดตามอาการ`];
  $('aNoteTxt').value=note.join('\n');
}
const labAbn=e=>{const v=parseFloat(e.val),lo=parseFloat(e.lo),hi=parseFloat(e.hi); return !isNaN(v)&&((!isNaN(lo)&&v<lo)||(!isNaN(hi)&&v>hi));};
function adrChart(on){
  const ds=ADR.drugs.filter(d=>d.name&&tlDate(d.sd,d.st||'0:00')), evs=ADR.evs.map(e=>({...e,tt:tlDate(e.d,e.t||'12:00')})).filter(e=>e.tt);
  if(!ds.length&&!evs.length){$('aChart').innerHTML='<div class="empty">เพิ่มยา (มีวันเริ่ม) และเหตุการณ์ เพื่อสร้าง timeline</div>';return;}
  const D=864e5, ts=[...ds.map(d=>tlDate(d.sd,d.st||'0:00').getTime()),...ds.filter(d=>d.ed).map(d=>tlDate(d.ed,d.et||'23:59').getTime()),...evs.map(e=>e.tt.getTime())];
  const t0=new Date(Math.min(...ts)); t0.setHours(0,0,0,0); const tEnd=Math.max(...ts)+D, days=Math.max(1,Math.ceil((tEnd-t0)/D));
  const labs=[...new Set(evs.filter(e=>e.type==='lab'&&e.lab).map(e=>e.lab.trim()))];
  const W=1000,L=200,R=46,top=34,evH=40,dH=28,lH=44, H=top+evH+ds.length*dH+labs.length*lH+16, x=t=>L+(t-t0)/(days*D)*(W-L-R);
  const step=days<=21?1:days<=45?2:days<=100?7:14; let g='';
  for(let i=0;i<=days;i+=step){const tx=x(t0.getTime()+i*D); g+=`<line x1="${tx}" y1="${top-6}" x2="${tx}" y2="${H-10}" stroke="var(--line2)"/><text x="${tx}" y="${top-12}" font-size="11" text-anchor="middle">${tlFmtS(new Date(t0.getTime()+i*D))}</text>`;}
  // event lane
  let y=top; g+=`<text x="${L-8}" y="${y+22}" font-size="12" text-anchor="end" style="fill:var(--ink);font-weight:600">เหตุการณ์</text>`;
  evs.filter(e=>e.type!=='lab').forEach(e=>{const ex=x(e.tt.getTime()), c=e.type==='adr'?'var(--flag)':e.type==='relief'?'var(--info)':'var(--muted)';
    g+=e.type==='note'?`<rect x="${ex-5}" y="${y+10}" width="10" height="10" transform="rotate(45 ${ex} ${y+15})" fill="${c}"><title>${esc(e.d+' '+e.text)}</title></rect>`
      :`<path d="M${ex-7},${y+8} L${ex+7},${y+8} L${ex},${y+22} Z" fill="${c}"><title>${esc((e.type==='adr'?'อาการ: ':'ยาบรรเทา: ')+e.d+' '+e.text)}</title></path><text x="${ex}" y="${y+34}" font-size="10" text-anchor="middle" style="fill:${c}">${esc((e.text||'').slice(0,14))}</text>`;});
  y+=evH;
  // drug lanes
  const RC={S:'var(--flag)',I:'var(--warn)',O:'var(--muted)'};
  ds.forEach(d=>{ const s=tlDate(d.sd,d.st||'0:00').getTime(), e=d.ed?tlDate(d.ed,d.et||'23:59').getTime():null, xe=e?x(e):W-R+6, c=RC[d.role]||'var(--muted)';
    g+=`<text x="${L-8}" y="${y+15}" font-size="12" text-anchor="end" style="fill:var(--ink)"><tspan style="fill:${c};font-weight:700">${d.role}</tspan> ${esc(d.name.length>24?d.name.slice(0,23)+'…':d.name)}</text>`;
    g+=`<rect x="${x(s)}" y="${y+5}" width="${Math.max(2,xe-x(s))}" height="13" rx="3" fill="${c}" opacity="${d.role==='O'?.45:.85}"><title>${esc(d.name)} ${d.sd} → ${d.ed||'ยังใช้อยู่'}</title></rect>`;
    g+=`<circle cx="${x(s)}" cy="${y+11.5}" r="5" fill="var(--surface)" stroke="${c}" stroke-width="2"/>`;
    if(e) g+=`<circle cx="${xe}" cy="${y+11.5}" r="5" fill="var(--surface)" stroke="${c}" stroke-width="2"/><circle cx="${xe}" cy="${y+11.5}" r="2" fill="${c}"/>`; else g+=`<path d="M${xe},${y+5} L${xe+8},${y+11.5} L${xe},${y+18} Z" fill="${c}"/>`;
    if(on&&s<=on.getTime()) g+=`<text x="${x(on.getTime())+4}" y="${y+4}" font-size="10" style="fill:${c};font-weight:700">D${Math.floor((on-s)/D)}</text>`;
    y+=dH; });
  // lab lanes
  labs.forEach(nm=>{ const pts=evs.filter(e=>e.type==='lab'&&e.lab.trim()===nm&&!isNaN(parseFloat(e.val))).sort((a,b)=>a.tt-b.tt); const vs=pts.map(p=>parseFloat(p.val)); const mn=Math.min(...vs), mx=Math.max(...vs), sc=v=>mx===mn?y+lH/2:y+lH-8-(v-mn)/(mx-mn)*(lH-20);
    g+=`<text x="${L-8}" y="${y+lH/2+4}" font-size="12" text-anchor="end" style="fill:#7c3aed">${esc(nm)}</text>`;
    if(pts.length>1) g+=`<polyline fill="none" stroke="#7c3aed" stroke-width="1.5" points="${pts.map(p=>`${x(p.tt.getTime())},${sc(parseFloat(p.val))}`).join(' ')}"/>`;
    pts.forEach(p=>{const ab=labAbn(p); g+=`<circle cx="${x(p.tt.getTime())}" cy="${sc(parseFloat(p.val))}" r="4" fill="${ab?'var(--flag)':'#7c3aed'}"/><text x="${x(p.tt.getTime())}" y="${sc(parseFloat(p.val))-7}" font-size="10" text-anchor="middle" style="fill:${ab?'var(--flag)':'var(--muted)'}">${esc(p.val)}</text>`;});
    y+=lH; });
  if(on){const ox=x(on.getTime()); g+=`<line x1="${ox}" y1="${top-4}" x2="${ox}" y2="${H-10}" stroke="var(--flag)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${ox+4}" y="${H-12}" font-size="11" style="fill:var(--flag)">เริ่มมีอาการ</text>`;}
  $('aChart').innerHTML=`<svg class="tlsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="ADR timeline">${g}</svg>
   <p class="hint" style="margin:6px 0 0">ยา: ○ เริ่มใช้ · ◉ หยุดใช้ · ▶ ยังใช้อยู่ · สีแดง = S, ส้ม = I, เทา = O · เหตุการณ์: <span style="color:var(--flag)">▼ อาการ</span> · <span style="color:var(--info)">▼ ยาบรรเทา</span> · ◆ หมายเหตุ · Lab: <span style="color:#7c3aed">● ค่า</span> (<span style="color:var(--flag)">●</span> = นอกค่าปกติ) · D = วันที่นับจากเริ่มยาถึงเกิดอาการ</p>`;
}
function adrCopy(id){ const t=$(id); t.select(); try{navigator.clipboard.writeText(t.value);}catch(e){document.execCommand('copy');} }
function adrSave(){ const blob=new Blob([JSON.stringify({v:1,adr:ADR},null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); const n=new Date(); a.download=`ADR-case-${n.getFullYear()+543}${pad2(n.getMonth()+1)}${pad2(n.getDate())}-${pad2(n.getHours())}${pad2(n.getMinutes())}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
function adrLoad(ev){ const f=ev.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); if(!o.adr) throw 0; ADR={...ADR0(),...o.adr,f:{...ADR0().f,...o.adr.f}}; adrSeq=Math.max(0,...[...ADR.drugs,...ADR.evs].map(x=>+String(x.id).slice(1)||0)); adrSync(); }catch(e){ $('aLoadMsg').textContent='เปิดไฟล์ไม่ได้ — ต้องเป็นไฟล์ ADR-case จากโปรแกรมนี้'; } }); ev.target.value=''; }
adrInit();
document.addEventListener('input',e=>{ if(!$('p-adr').hidden&&e.target.closest&&e.target.closest('.pt')) adrOut(); });

/* ---------- ช่วยแยกชนิดผื่นแพ้ยา (สรุปจากสไลด์ Cutaneous Drug Eruptions, นพ.สัญชัย สมบัติไมไทย) ---------- */
const RASH_F=[
 ['ผิวหนัง',[['wheal','ผื่นนูนแดง (wheal) คัน แต่ละผื่นหายภายใน 24 ชม.'],['angio','บวมลึกใต้ผิว ปาก/ตา/หน้า (angioedema)'],['mp','ผื่นแดง macule/papule สมมาตร เริ่มที่ลำตัว อาจรวมเป็นปื้น'],['fixed','ผื่นวงขอบชัด สีแดงคล้ำ/ม่วง แสบร้อน เป็นที่เดิมเมื่อได้ยาซ้ำ หายแล้วทิ้งรอยดำ'],
   ['target','target / iris lesion แบบชัด (3 วง)'],['atyp','atypical target / ปื้นแดงคล้ำขยายเร็ว'],['blister','ตุ่มน้ำ / หนังกำพร้าหลุดลอก'],['nik','Nikolsky sign บวก'],['mucosa','แผลเยื่อบุ ≥2 ตำแหน่ง (ปาก ตา อวัยวะเพศ)'],
   ['pustule','ตุ่มหนองเล็กจำนวนมาก (ไม่อยู่ที่รูขุมขน) บนผื่นแดงบวม เริ่มที่หน้า/ข้อพับ'],['face','หน้าบวม / รอบตาบวม'],['exfol','แดงและลอกเป็นขุยเกือบทั้งตัว (>90% BSA)'],['purpura','palpable purpura (คลำได้ กดไม่จาง) ที่ขา'],
   ['necro','ผิวหนังตาย/ม่วงดำ บริเวณเต้านม ต้นขา สะโพก'],['lichen','ผื่นนูนแบนสีม่วงคล้าย lichen planus'],['pain','เจ็บ/แสบผิวหนังมาก']]],
 ['ระบบอื่น / Lab',[['hypo','ความดันต่ำ / หายใจลำบาก / wheeze / stridor'],['fever','ไข้ ≥38.5°C'],['ln','ต่อมน้ำเหลืองโต'],['eos','Eosinophilia'],['atl','Atypical lymphocyte'],['organ','ตับ/ไต/ปอดผิดปกติ'],['neut','Neutrophil สูง'],['plt','เกล็ดเลือดต่ำ / WBC ต่ำ']]]];
const RASH_T={ // weights ต่อ feature, ข้อมูลจากสไลด์
 ana:{w:{hypo:5,wheal:2,angio:2},t:'Anaphylaxis',m:'ปฏิกิริยาทั้งระบบภายในนาที–ชั่วโมง: ผิวหนัง (คัน ลมพิษ บวม) + ทางเดินหายใจ (หายใจลำบาก wheeze stridor) + หัวใจหลอดเลือด (ความดันต่ำ ช็อก)',d:'beta-lactam, ยาฉีดโปรตีน/วัคซีน, contrast media (anaphylactoid: NSAIDs, opiates, contrast)',rx:'Epinephrine 0.01 ml/kg IM ซ้ำได้ทุก 15 นาที · ดูแลทางเดินหายใจ · IV fluid/vasopressor · antihistamine · steroid',maj:1,sl:'20–25'},
 urt:{w:{wheal:4,angio:3},t:'Urticaria / Angioedema',m:'ผื่นนูนแดงคัน ขนาดต่าง ๆ แต่ละผื่นไม่เกิน 24 ชม. · angioedema = บวมชั้นลึก อาจมีเยื่อบุ',d:'penicillins, cephalosporins, NSAIDs/salicylates, contrast media · angioedema ไม่มีลมพิษ: ACEI, ARB, fibrinolytic, estrogen, NSAIDs',rx:'หยุดยา · antihistamine · หลีกเลี่ยง NSAIDs และ ACEI · angioedema ทางเดินหายใจ = ฉุกเฉิน',maj:0,sl:'28–35'},
 mpe:{w:{mp:4,fever:1},neg:{mucosa:2,blister:2,pustule:1,face:2,ln:2,eos:1,organ:2,nik:2},t:'Maculopapular (morbilliform) eruption',m:'พบบ่อยที่สุด (46%) · ผื่นแดง macule/papule สมมาตร เริ่มที่ลำตัว/จุดกดทับ อาจรวมเป็นปื้น คัน มีไข้ได้ · อยู่ 1–2 สัปดาห์ · แยกจาก viral exanthem',d:'aminopenicillins, sulfonamides, anticonvulsants, allopurinol ฯลฯ',rx:'หยุดยา (หรือใช้ต่อถ้าจำเป็นและไม่รุนแรง) · antihistamine · topical steroid · emollient',maj:0,sl:'26–27'},
 fde:{w:{fixed:5},t:'Fixed drug eruption',m:'ผื่นขอบชัด ≥1 วง สีแดงคล้ำ แสบร้อน · เป็นที่เดิมเมื่อได้ยาซ้ำ · หายแล้วทิ้งรอยดำ · ที่ริมฝีปาก มือ ขา หน้า อวัยวะเพศ เยื่อบุปาก',d:'tetracyclines, sulfonamides (co-trimoxazole), NSAIDs, barbiturates, phenolphthalein',rx:'หยุดยา · topical steroid · บันทึกแพ้ยา',maj:0,sl:'36–37'},
 em:{w:{target:4,mp:1},neg:{mucosa:1,blister:1},t:'Erythema multiforme (minor)',m:'ผื่น macule/papule/urticarial และ target (iris) แบบชัด อาจมีตุ่มน้ำกลาง · EM minor ไม่มีเยื่อบุ · EM major มีเยื่อบุ >1 ตำแหน่ง',d:'ยา หรือการติดเชื้อ (HSV, mycoplasma)',rx:'หาสาเหตุ หยุดยาที่สงสัย · รักษาตามอาการ',maj:0,sl:'38–39'},
 sjs:{w:{atyp:3,blister:3,nik:3,mucosa:3,pain:1,fever:1,target:1},t:'SJS / TEN',m:'atypical target ขยายเร็ว + เยื่อบุ >1 ตำแหน่ง + ตุ่มน้ำ/หนังหลุด Nikolsky บวก ไข้ เจ็บคอ เจ็บผิว · SJS <10% BSA · overlap 10–30% · TEN >30%',d:'sulfonamides/co-trimoxazole, anticonvulsants (carbamazepine, phenytoin, phenobarbital, lamotrigine, valproate), allopurinol, nevirapine, oxicam NSAIDs, aminopenicillins, quinolones · HLA-B*1502 กับ carbamazepine',rx:'หยุดยาทันที · admit (burn unit/ICU) · สารน้ำ/เกลือแร่ · ป้องกันติดเชื้อ · ดูแลตา · ปรึกษาแพทย์ผิวหนัง',maj:1,sl:'40–53'},
 agep:{w:{pustule:5,fever:1,neut:1},t:'AGEP',m:'ตุ่มหนองเล็กจำนวนมากไม่อยู่ที่รูขุมขน บนผื่นแดงบวม เริ่มที่หน้า/ข้อพับ · ไข้ neutrophil สูง · เยื่อบุ ~50%',d:'beta-lactams, macrolides, calcium channel blockers ฯลฯ',rx:'หยุดยา · topical steroid · หายใน 1–2 สัปดาห์',maj:1,sl:'61–62'},
 dress:{w:{face:2,fever:2,ln:2,eos:3,atl:1,organ:3,mp:1,exfol:1},t:'DRESS / Hypersensitivity syndrome',m:'ไข้ หน้า/รอบตาบวม ต่อมน้ำเหลืองโตกดเจ็บ WBC/eosinophil สูง ตับอักเสบ ไต ปอดอักเสบ · ผื่นไม่จำเพาะ (diffuse erythema, morbilliform, EM, exfoliative) · ผื่นอยู่ได้นานหลายเดือนหลังหยุดยา',d:'phenytoin, carbamazepine, barbiturates, lamotrigine, allopurinol, dapsone ("dapsone syndrome"), sulfonamides, minocycline, abacavir (HLA-B*5701)',rx:'หยุดยาทันที · admit · systemic steroid · ติดตาม LFT/ไต · ใช้ RegiSCAR ช่วยประเมิน',maj:1,sl:'54–55'},
 exfol:{w:{exfol:5,fever:1,ln:1},t:'Exfoliative dermatitis',m:'ผื่นแดงและลอกเป็นขุยมากกว่า 90% BSA · ไข้ หัวใจเต้นเร็ว ต่อมน้ำเหลืองโต ตับม้ามโต',d:'CCB, anticonvulsants, penicillins, sulfonamides, vancomycin, allopurinol, gold, lithium, dapsone',rx:'หยุดยา · admit · ดูแลสารน้ำ อุณหภูมิ ผิวหนัง',maj:1,sl:'56–57'},
 vasc:{w:{purpura:5,organ:1},t:'Drug-induced vasculitis',m:'palpable purpura คัน ทั่วตัวหรือที่ขา/ส่วนห้อย · อาจมี urticarial ulcer ตุ่มน้ำเลือด · มีตับ ไต สมอง ข้อร่วมได้ · ใช้ diascopy test',d:'propylthiouracil, hydralazine, allopurinol, thiazides, sulfonamides, penicillin, NSAIDs',rx:'หยุดยา · ตรวจ UA/ไต · ปรึกษาแพทย์',maj:1,sl:'58–60'},
 warf:{w:{necro:5},t:'Warfarin-induced skin necrosis',m:'ผิวหนังตายบริเวณไขมันมาก (เต้านม ต้นขา สะโพก) วันที่ 3–10 ของ warfarin · พบในหญิงมากกว่า · สัมพันธ์กับ protein C deficiency',d:'warfarin',rx:'แจ้งแพทย์ด่วน · หยุด warfarin · พิจารณา heparin / vitamin K / protein C',maj:1,sl:'64–65'},
 lichen:{w:{lichen:5},t:'Lichenoid drug eruption',m:'แยกไม่ออกจาก lichen planus ทางคลินิก',d:'gold, antimalarials, sulfonamides, thiazides, beta blockers, captopril',rx:'หยุดยา · topical steroid',maj:0,sl:'66–67'}};
const RASH_SER=['blister','nik','mucosa','face','purpura','necro','pain','exfol','hypo','organ','plt'];
let RASH={};
function rashInit(){ const b=$('rashF'); if(!b) return;
  b.innerHTML=RASH_F.map(([g,fs])=>`<div class="rg"><div class="rgh">${g}</div>${fs.map(([k,l])=>`<label class="rchk"><input type="checkbox" data-rf="${k}"><span>${esc(l)}</span></label>`).join('')}</div>`).join('');
  b.querySelectorAll('[data-rf]').forEach(c=>c.addEventListener('change',()=>{RASH[c.dataset.rf]=c.checked;rashOut();}));
  $('rashBsa').addEventListener('input',rashOut); $('rashClear').onclick=()=>{RASH={};b.querySelectorAll('[data-rf]').forEach(c=>c.checked=false);$('rashBsa').value='';rashOut();};
  rashOut(); }
function rashOut(){ const on=Object.keys(RASH).filter(k=>RASH[k]), bsa=parseFloat($('rashBsa').value);
  if(!on.length){$('rashRes').innerHTML='<div class="empty">ติ๊กลักษณะที่พบ โปรแกรมจะเรียงชนิดผื่นที่เข้าได้มากที่สุด</div>';return;}
  const res=Object.entries(RASH_T).map(([id,r])=>{ const max=Object.values(r.w).reduce((a,b)=>a+b,0); let s=on.reduce((a,k)=>a+(r.w[k]||0),0)-on.reduce((a,k)=>a+((r.neg||{})[k]||0),0);
      if(id==='sjs'&&bsa>0) s+=2; const ex=on.filter(k=>r.w[k]).length; return {id,r,s,p:Math.max(0,Math.round(Math.min(1,s/max)*(0.5+0.5*ex/on.length)*100))}; }).filter(x=>x.s>0).sort((a,b)=>b.p-a.p||b.s-a.s).slice(0,4);
  const ser=on.filter(k=>RASH_SER.includes(k)); const lab=k=>RASH_F.flatMap(g=>g[1]).find(f=>f[0]===k)[1];
  let h='';
  if(ser.length||on.includes('fever')&&on.length>2) h+=`<div class="rflag"><b>พบลักษณะของผื่นแพ้ยารุนแรง (major drug eruption)</b> — ${esc(ser.map(lab).join(' · ')||'ไข้ร่วมกับหลายระบบ')}<br>หยุดยาที่สงสัย แจ้งแพทย์ ตรวจ CBC, LFT, UA และพิจารณา admit</div>`;
  if(bsa>0) h+=`<p class="hint" style="margin:0 0 8px">หนังกำพร้าหลุดลอก ${fmtN(bsa)}% BSA → <b>${bsa<10?'SJS (<10%)':bsa<=30?'SJS-TEN overlap (10–30%)':'TEN (>30%)'}</b></p>`;
  h+=res.length?res.map((x,i)=>{const rt=ADR_RT.find(r=>r[0]===x.id);return `<div class="rcard${x.r.maj?' maj':''}"><div class="rch"><span class="rk">${i+1}</span><b>${esc(x.r.t)}</b><span class="rp">${x.p}%</span>${x.r.maj?'<span class="pill flag">major</span>':'<span class="pill ok">minor</span>'}${rt?`<button class="btn sm" type="button" data-use="${x.id}">ใช้เป็นชนิดอาการ</button>`:''}</div>
    <div class="rcb"><div><b>ลักษณะ:</b> ${esc(x.r.m)}</div>${rt&&rt[3]?`<div><b>ระยะเวลาหลังเริ่มยา:</b> ${esc(rt[3])}</div>`:''}<div><b>ยาที่พบบ่อย:</b> ${esc(x.r.d)}</div><div><b>การจัดการ:</b> ${esc(x.r.rx)}</div><div class="hint">ดูรูปตัวอย่าง: สไลด์ Cutaneous Drug Eruptions หน้า ${x.r.sl}</div></div></div>`;}).join(''):'<div class="empty">ลักษณะที่เลือกยังไม่เข้ากับชนิดใดชัดเจน</div>';
  h+=`<p class="hint" style="margin:8px 0 0">เป็นเครื่องมือช่วยคิด เรียงตามลักษณะที่ตรง ไม่ใช่การวินิจฉัย — ยืนยันโดยแพทย์ · สรุปจาก Cutaneous Drug Eruptions in Clinical Practices (นพ.สัญชัย สมบัติไมไทย)</p>`;
  $('rashRes').innerHTML=h;
  $('rashRes').querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{ADR.rtype=b.dataset.use;$('aRt').value=ADR.rtype;
    if(!ADR.evs.some(e=>e.type==='adr')) adrAddEv('adr',{text:on.filter(k=>!['eos','atl','neut','plt','organ'].includes(k)).map(lab).join(', ')}); adrOut(); $('aRt').scrollIntoView({behavior:'smooth',block:'center'});}); }
rashInit();

/* ---------- แบบประเมินเฉพาะ: SCORTEN (TEN), MALA, Fentanyl chest wall rigidity ---------- */
const SCORTEN=[['age','อายุ ≥40 ปี'],['ca','มีมะเร็ง (malignancy)'],['hr','ชีพจร ≥120 ครั้ง/นาที'],['bsa','หนังกำพร้าหลุด ≥10% BSA (วันแรก)'],['bun','BUN >28 mg/dL (>10 mmol/L)'],['glu','Glucose >252 mg/dL (>14 mmol/L)'],['hco3','Bicarbonate <20 mmol/L']];
const SCORTEN_M=['3.2%','3.2%','12.1%','35.3%','58.3%','>90%'];
function scInit(){ const b=$('scBox'); if(!b) return;
  b.innerHTML=SCORTEN.map(([k,l])=>`<label class="rchk"><input type="checkbox" data-sc="${k}"><span>${esc(l)} <small>(+1)</small></span></label>`).join('');
  b.querySelectorAll('[data-sc]').forEach(c=>c.addEventListener('change',scOut)); $('scAuto').onclick=scAuto; scOut(); }
function scAuto(){ const age=+$('age').value; const set=(k,v)=>{const c=document.querySelector(`[data-sc="${k}"]`); if(c&&v!=null) c.checked=v;};
  if(age>0) set('age',age>=40); const b=parseFloat($('rashBsa').value); if(b>0) set('bsa',b>=10);
  const lab=(re)=>{const e=ADR.evs.filter(e=>e.type==='lab'&&re.test(e.lab||'')).sort((a,b)=>(tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0)); return e.length?parseFloat(e[0].val):null;};
  const bun=lab(/bun|urea/i), glu=lab(/glu|fbs|dtx|sugar/i), hc=lab(/hco3|bicarb|co2/i);
  if(bun!=null) set('bun',bun>28); if(glu!=null) set('glu',glu>252); if(hc!=null) set('hco3',hc<20); scOut(); }
function scOut(){ const n=[...document.querySelectorAll('[data-sc]')].filter(c=>c.checked).length;
  $('scRes').innerHTML=`<div class="big"><span class="n">${n}</span><span class="u">SCORTEN · อัตราตายที่คาดการณ์ ${SCORTEN_M[Math.min(n,5)]} (0–1: 3.2% · 2: 12.1% · 3: 35.3% · 4: 58.3% · ≥5: >90%)</span></div><p class="hint" style="margin:6px 0 0">ประเมินภายใน 24 ชม. แรกที่รับไว้ และวันที่ 3 · ปุ่ม "ดึงจากข้อมูล" ใช้อายุ %BSA และ Lab (BUN, Glucose, HCO3) ที่กรอกไว้ในแท็บนี้</p>`; }
function malaOut(){ const v=id=>{const x=parseFloat($(id).value);return isNaN(x)?null:x;}; const ph=v('mlPh'), lac=v('mlLac'), hc=v('mlHco3'), na=v('mlNa'), cl=v('mlCl'); const pt=getPt(), eg=pt.egfr;
  const out=[], li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  const ag=na!=null&&cl!=null&&hc!=null?na-(cl+hc):null;
  if(lac!=null&&ph!=null){ if(lac>5&&ph<7.35) out.push(li('flag',`เข้าเกณฑ์ MALA: lactate ${lac} mmol/L (>5) และ pH ${ph} (<7.35) ในผู้ป่วยที่ได้ metformin — หยุด metformin แจ้งแพทย์ พิจารณา HD`));
    else if(lac>5||ph<7.35) out.push(li('warn',`เข้าเกณฑ์บางส่วน (lactate >5 mmol/L และ pH <7.35 ต้องมีทั้งคู่) — lactate ${lac}, pH ${ph}`));
    else out.push(li('ok',`ไม่เข้าเกณฑ์ MALA (lactate ${lac}, pH ${ph})`)); }
  else out.push(li('info','กรอก pH (arterial) และ lactate เพื่อประเมิน · เกณฑ์ MALA: lactate >5 mmol/L และ pH <7.35 ในผู้ป่วยที่ได้ metformin'));
  if(ag!=null) out.push(li(ag>12?'warn':'ok',`Anion gap = ${fmtN(ag)} (Na − Cl − HCO3; ปกติ 8–12)${ag>12?' — high anion gap metabolic acidosis':''}`));
  if(eg!=null) out.push(li(eg<30?'flag':eg<45?'warn':'info',`eGFR ${fmtN(eg)} — ${eg<30?'ห้ามใช้ metformin (แนวทาง รพ.มค)':eg<45?'ไม่ควรเริ่ม metformin, ไม่เกิน 1,000 mg/day':eg<60?'ไม่เกิน 2,000 mg/day':'ไม่เกิน 2,550 mg/day'}`));
  out.push(li('info','ปัจจัยเสี่ยงที่ควรตรวจ: ไตเสื่อม/AKI · sepsis/ช็อก · ภาวะขาดออกซิเจน (หัวใจล้มเหลว, ปอด) · ตับวาย · ดื่มสุรา · ได้ contrast media · ผ่าตัด/งดน้ำงดอาหาร · ขาดน้ำ'));
  $('mlRes').innerHTML=`<ul class="msgs">${out.join('')}</ul>`; }
const WCS=[['drug','ได้รับ fentanyl (หรือ opioid กลุ่ม fentanyl) ทาง IV'],['fast','ให้แบบ bolus เร็ว / ขนาดสูง'],['time','อาการเกิดภายในไม่กี่นาทีหลังให้ยา'],['rigid','กล้ามเนื้อหน้าอก/ท้องแข็งเกร็ง'],['vent','ช่วยหายใจด้วย bag-mask ยาก / compliance ลดลง'],['hypox','SpO2 ลดลง / CO2 คั่ง'],['other','ไม่มีสาเหตุอื่นที่อธิบายได้ (bronchospasm, pneumothorax, ท่อหลุด/อุดตัน)']];
function wcInit(){ const b=$('wcBox'); if(!b) return; b.innerHTML=WCS.map(([k,l])=>`<label class="rchk"><input type="checkbox" data-wc="${k}"><span>${esc(l)}</span></label>`).join(''); b.querySelectorAll('[data-wc]').forEach(c=>c.addEventListener('change',wcOut)); wcOut(); }
function wcOut(){ const s=Object.fromEntries([...document.querySelectorAll('[data-wc]')].map(c=>[c.dataset.wc,c.checked])); const n=Object.values(s).filter(Boolean).length;
  const core=s.drug&&s.time&&s.rigid&&s.vent; const li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  $('wcRes').innerHTML=`<ul class="msgs">${n?li(core?'flag':'warn',core?'เข้าได้กับ fentanyl-induced chest wall rigidity (wooden chest syndrome) — แจ้งแพทย์ทันที':`พบ ${n}/7 ลักษณะ — ยังไม่ครบลักษณะหลัก (ได้ fentanyl + เกิดภายในนาที + กล้ามเนื้อแข็ง + ช่วยหายใจยาก)`):li('info','ติ๊กลักษณะที่พบ')}
   ${li('info','การจัดการ: หยุดให้ยา · ช่วยหายใจ · naloxone · ถ้าไม่ตอบสนองให้ neuromuscular blocker แล้วใส่ท่อช่วยหายใจ (ตามแพทย์) · ป้องกัน: ให้ fentanyl IV ช้า ๆ')}
   ${li('info','ไม่มีระบบคะแนนมาตรฐาน — ใช้ลักษณะทางคลินิกและ Naranjo/WHO-UMC ประเมินความสัมพันธ์กับยา')}</ul>`; }
scInit(); wcInit(); ['mlPh','mlLac','mlHco3','mlNa','mlCl'].forEach(id=>{const e=$(id); if(e) e.addEventListener('input',malaOut);}); if($('mlRes')) malaOut();
document.querySelectorAll('[data-asm]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-asm]').forEach(x=>x.setAttribute('aria-pressed',x===b)); document.querySelectorAll('.asm').forEach(p=>p.hidden=p.id!=='asm-'+b.dataset.asm); if(b.dataset.asm==='mala') malaOut(); if(b.dataset.asm==='alden'){aldOut();adrOut();}});

/* ---------- EuroSCAR AGEP validation score (Sidoroff 2001) ---------- */
const AGEPS=[
 ['pus','ตุ่มหนอง (pustules)',[['t','ลักษณะ typical',2],['c','compatible',1],['i','ข้อมูลไม่พอ',0]]],
 ['ery','ผื่นแดง (erythema)',[['t','typical',2],['c','compatible',1],['i','ข้อมูลไม่พอ',0]]],
 ['pat','การกระจาย (เริ่มข้อพับ/หน้า แล้วกระจาย)',[['t','typical',2],['c','compatible',1],['i','ข้อมูลไม่พอ',0]]],
 ['des','ลอกหลังตุ่มหนองหาย (postpustular desquamation)',[['y','มี',1],['n','ไม่มี / ข้อมูลไม่พอ',0]]],
 ['muc','เยื่อบุผิดปกติ',[['n','ไม่มี',0],['y','มี',-2]]],
 ['ons','เกิดเฉียบพลัน ≤10 วัน',[['y','ใช่',0],['n','ไม่ใช่',-2]]],
 ['res','หายภายใน ≤15 วัน',[['y','ใช่',0],['n','ไม่ใช่',-4]]],
 ['fev','ไข้ ≥38°C',[['y','มี',1],['n','ไม่มี',0]]],
 ['pmn','Neutrophil (PMN) ≥7,000/mm³',[['y','ใช่',1],['n','ไม่ใช่',0]]],
 ['his','ผลชิ้นเนื้อ',[['0','ไม่ได้ทำ / ไม่เป็นตัวแทน',0],['ex','exocytosis ของ PMN',1],['p2','subcorneal/intraepidermal pustule (non-spongiform + papillary oedema หรือ spongiform ไม่มี oedema)',2],['p3','spongiform subcorneal/intraepidermal pustule + papillary oedema',3],['oth','เป็นโรคอื่น',-10]]]];
const agepCat=s=>s>=8?'Definite':s>=5?'Probable':s>=1?'Possible':'No AGEP';
const AGEPV={};
function agepInit(){ const b=$('agBox'); if(!b) return;
  b.innerHTML=AGEPS.map(([k,l,o])=>`<label class="f">${esc(l)}<select data-ag="${k}"><option value="">—</option>${o.map(x=>`<option value="${x[0]}">${esc(x[1])} (${x[2]>0?'+':''}${x[2]})</option>`).join('')}</select></label>`).join('');
  b.querySelectorAll('[data-ag]').forEach(s=>s.addEventListener('change',()=>{AGEPV[s.dataset.ag]=s.value;agepOut();})); agepOut(); }
function agepOut(){ const ks=Object.keys(AGEPV).filter(k=>AGEPV[k]); const sc=AGEPS.reduce((s,[k,,o])=>{const x=o.find(z=>z[0]===AGEPV[k]);return s+(x?x[2]:0);},0);
  $('agRes').innerHTML=ks.length?`<div class="big"><span class="n">${sc}</span><span class="u">${agepCat(sc)} AGEP (≤0 no · 1–4 possible · 5–7 probable · 8–12 definite) · ตอบแล้ว ${ks.length}/10</span></div>`:'<span class="hint">เลือกคำตอบแต่ละข้อ · EuroSCAR AGEP validation score</span>';
  ADR.agep=ks.length?{s:sc,c:agepCat(sc)}:null; adrOut(); }
agepInit();

/* ---------- แบบบันทึก ADR รพ.มค (MKH-FR-PHA-048 แก้ไขครั้งที่ 05) ---------- */
const TA_Q=['ADR อธิบายได้ด้วยฤทธิ์ทางเภสัชวิทยาของยา','ADR สัมพันธ์กับขนาดยา','ADR จัดการได้โดยการปรับลดขนาดยา'];
const PREV_Q=['ยาที่สงสัยไม่เหมาะสมต่อโรค/เงื่อนไขของผู้ป่วย (ME)','ขนาด วิธีให้ ความถี่ไม่เหมาะสมกับอายุ น้ำหนัก หรือภาวะโรค (ME)','ไม่มีการติดตามและตรวจทางห้องปฏิบัติการที่เหมาะสม','ผู้ป่วยไม่ให้ความร่วมมือกับแผนการรักษาด้วยยา','ผู้ป่วยมีประวัติแพ้หรือเคยเกิดปฏิกิริยาต่อยามาก่อน (ME)','ปฏิกิริยานี้มีส่วนเกี่ยวข้องกับอันตรกิริยาของยา (ME)','มีบันทึกการตรวจระดับยาหรือผลตรวจทางห้องปฏิบัติการที่บ่งบอกความเป็นพิษ'];
const NCC=[['A','A: มีเหตุการณ์ที่อาจทำให้เกิดความคลาดเคลื่อน'],['B','B: เกิดความคลาดเคลื่อน แต่ยังไม่ถึงผู้ป่วย'],['C','C: ถึงผู้ป่วย ไม่เกิดอันตราย'],['D','D: ถึงผู้ป่วย ต้องเฝ้าติดตาม ไม่เกิดอันตราย'],['E','E (harm): อันตรายชั่วคราว ต้องรักษา'],['F','F (harm): อันตรายชั่วคราว ต้องนอน รพ./นอนนานขึ้น'],['G','G (harm): อันตรายถาวร'],['H','H (harm): ต้องช่วยชีวิต'],['I','I (harm): เสียชีวิต']];
function m48Init(){ const b=$('m48Box'); if(!b) return; if(!ADR.m48) ADR.m48={cls:'',ta:['','',''],prev:Array(7).fill(''),me:'',meDet:'',meType:'',ncc:'',rep:'',cross:'',crossOld:'',crossNew:'',sjs:'',di:''};
  const M=ADR.m48, yn=(k,i,v)=>`<span class="seg nseg">${[['y','ใช่'],['n','ไม่ใช่']].map(([x,l])=>`<button type="button" data-m="${k}" data-i="${i}" data-v="${x}" aria-pressed="${v===x}">${l}</button>`).join('')}</span>`;
  const rad=(k,opts)=>`<div style="display:grid;gap:4px">${opts.map(([v,l])=>`<label class="rchk"><input type="radio" name="m48${k}" data-mr="${k}" value="${v}"${M[k]===v?' checked':''}><span>${esc(l)}</span></label>`).join('')}</div>`;
  b.innerHTML=`<div class="adr2"><div>
   <div class="hint" style="margin-bottom:4px">สรุปเหตุการณ์</div>${rad('cls',[['ADR','ADR'],['non','non-ADR'],['insuf','ข้อมูลไม่เพียงพอต่อการประเมิน']])}
   <h2 style="margin-top:12px">ประเมิน Type ADR</h2>${TA_Q.map((q,i)=>`<div class="nq"><span class="nqn">${i+1}</span><span class="nqt">${q}</span>${yn('ta',i,M.ta[i])}</div>`).join('')}<div id="m48Type" style="margin-top:6px"></div>
   <h2 style="margin-top:12px">การแพ้ยาซ้ำ / แพ้ยาในกลุ่มเดียวกัน / กลุ่มเฝ้าระวัง SJS-TEN</h2>
   <div class="hint">การแพ้ยาซ้ำ</div>${rad('rep',[['','ไม่ใช่กรณีแพ้ซ้ำ'],['sys','แพ้ยาซ้ำเนื่องจากระบบโรงพยาบาล'],['nonsys','แพ้ยาซ้ำที่ไม่ใช่สาเหตุจากโรงพยาบาล'],['int','แพ้ยาซ้ำจากความตั้งใจเพื่อประโยชน์ในการรักษา']])}
   <div class="hint" style="margin-top:6px">การแพ้ยาในกลุ่มเดียวกัน</div><div class="tlg"><label class="f">ยาเดิมที่แพ้<input data-mt="crossOld" value="${esc(M.crossOld)}"></label><label class="f">ยาที่แพ้ครั้งนี้<input data-mt="crossNew" value="${esc(M.crossNew)}"></label></div>${rad('cross',[['','ไม่ใช่กรณีแพ้ในกลุ่มเดียวกัน'],['sys','เนื่องจากระบบโรงพยาบาล'],['nonsys','ไม่ใช่จากระบบโรงพยาบาล'],['int','เพื่อประโยชน์ในการรักษา']])}
   <div class="hint" style="margin-top:6px">ยาในกลุ่มที่เฝ้าระวังการเกิด SJS/TEN</div>${rad('sjs',[['','ไม่ใช่ยากลุ่มเฝ้าระวัง'],['got','ผู้ป่วยได้รับสติ๊กเกอร์เฝ้าระวัง/ข้อมูลการเฝ้าระวัง'],['not','ผู้ป่วยไม่ได้รับสติ๊กเกอร์เฝ้าระวัง/ข้อมูลการเฝ้าระวัง']])}
   <label class="f" style="margin-top:6px">ADR จาก DI (ระบุคู่ยา)<input data-mt="di" value="${esc(M.di)}"></label>
  </div><div>
   <h2>ประเมิน Preventable ADE (ทุกเคส) — Schumock & Thornton</h2>${PREV_Q.map((q,i)=>`<div class="nq"><span class="nqn">${['I','II','III','IV','V','VI','VII'][i]}</span><span class="nqt">${q}</span>${yn('prev',i,M.prev[i])}</div>`).join('')}
   <div class="nq"><span class="nqn">2</span><span class="nqt">เป็นเหตุการณ์ที่เกิดจากความคลาดเคลื่อนทางยา (Medication Error)</span>${yn('me',0,M.me)}</div>
   <div class="tlg"><label class="f">ระบุรายละเอียด ME<input data-mt="meDet" value="${esc(M.meDet)}"></label><label class="f">ME ชนิด<select data-ms="meType"><option value="">—</option>${['PE','DE','AE'].map(x=>`<option${M.meType===x?' selected':''}>${x}</option>`).join('')}</select></label>
   <label class="f">ระดับความรุนแรง (NCC MERP)<select data-ms="ncc"><option value="">—</option>${NCC.map(([v,l])=>`<option value="${v}"${M.ncc===v?' selected':''}>${l}</option>`).join('')}</select></label></div>
   <div id="m48Prev" style="margin-top:8px"></div></div></div>`;
  b.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{const k=x.dataset.m; if(k==='me') M.me=x.dataset.v; else M[k][+x.dataset.i]=x.dataset.v; m48Init(); adrOut();});
  b.querySelectorAll('[data-mr]').forEach(x=>x.addEventListener('change',()=>{M[x.dataset.mr]=x.value;m48Res();adrOut();}));
  b.querySelectorAll('[data-mt]').forEach(x=>x.addEventListener('input',()=>{M[x.dataset.mt]=x.value;adrOut();}));
  b.querySelectorAll('[data-ms]').forEach(x=>x.addEventListener('change',()=>{M[x.dataset.ms]=x.value;adrOut();}));
  m48Res(); }
const m48Type=()=>{const t=ADR.m48&&ADR.m48.ta; if(!t||t.every(v=>!v)) return null; return t.includes('y')?'A':t.every(v=>v==='n')?'B':null;};
const m48Prev=()=>{const M=ADR.m48; if(!M) return null; const any=M.prev.includes('y')||M.me==='y'; const done=M.prev.every(Boolean)&&M.me; return any?'Preventable':done?'Non-preventable':null;};
function m48Res(){ if(!$('m48Type')) return; const t=m48Type(), p=m48Prev(), li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  $('m48Type').innerHTML=`<ul class="msgs">${t?li(t==='A'?'warn':'info',t==='A'?'Type A ADR (ตอบ "ใช่" ≥1 ข้อ) — สัมพันธ์กับฤทธิ์ยา/ขนาดยา':'Type B ADR (ไม่มีข้อใดตอบ "ใช่") — ประเมินต่อด้วย Naranjo'):li('info','ถ้าตอบ "ใช่" 1 ข้อ → Type A · ไม่มีข้อใดตอบ "ใช่" → Type B (ประเมินต่อด้วย Naranjo)')}</ul>`;
  $('m48Prev').innerHTML=`<ul class="msgs">${p?li(p==='Preventable'?'flag':'ok',`สรุป: ${p} ADR${p==='Preventable'?' (ตอบ YES ข้อ 1 หรือข้อ 2)':''}`):li('info','ประเมินให้ครบทุกข้อ — ตอบ YES ข้อใดข้อหนึ่ง = Preventable ADR')}</ul>`; }
m48Init();

/* ---------- ALDEN (Sassolas 2010) — ประเมินยาที่เป็นสาเหตุ SJS/TEN ทีละตัว ---------- */
const ALD_STRONG=/allopurinol|carbamazep|tegretol|co-?trimox|bactrim|sulfameth|sulfasalaz|sulfadiaz|lamotrig|nevirap|piroxicam|meloxicam|tenoxicam|oxicam|phenobarb|phenytoin|dilantin/i;
const ALD_ASSOC=/diclofenac|indometh|aceclofenac|amoxi|ampicillin|augmentin|amoksiklav|unasyn|cef|ceph|azithro|clarithro|erythro|roxithro|floxacin|tetracycl|doxycyc|minocyc/i;
const ALD_OPT={
 c2:[['0','0 ยังใช้อยู่ หรือหยุดก่อนวันเกิดอาการ <5 เท่าของ half-life'],['-1','−1 หยุด >5 half-life แต่มีตับ/ไตผิดปกติ หรือ DDI'],['-3','−3 หยุด >5 half-life ไม่มีปัจจัยข้างต้น']],
 c3:[['0','0 ไม่เคยได้รับ / ไม่ทราบ'],['4','+4 เคยเกิด SJS/TEN จากยาเดียวกัน'],['2','+2 เคยเกิด SJS/TEN จากยาคล้ายกัน หรือแพ้อย่างอื่นจากยาเดียวกัน'],['1','+1 เคยแพ้อย่างอื่นจากยาคล้ายกัน'],['-2','−2 เคยได้รับยาเดียวกันโดยไม่แพ้']],
 c4:[['0','0 หยุดยาแล้ว (หรือไม่ทราบ)'],['-2','−2 ใช้ยาต่อโดยอาการไม่แย่ลง']],
 c5:[['3','+3 Strongly associated (high-risk)'],['2','+2 Associated'],['1','+1 Suspected (มีรายงานหลายราย)'],['0','0 Unknown'],['-1','−1 Not suspected']]};
const aldCat=s=>s<0?'Very unlikely':s<=1?'Unlikely':s<=3?'Possible':s<=5?'Probable':'Very probable';
function aldRow(d,on){ const A=(ADR.alden=ADR.alden||{})[d.id]=(ADR.alden||{})[d.id]||{};
  const s=tlDate(d.sd,d.st||'0:00'), e=d.ed?tlDate(d.ed,d.et||'23:59'):null; let c1=null,lat=null;
  if(s&&on){ lat=Math.floor((on-s)/864e5); c1= (on-s)<=0||lat<=0?-3: A.prior? (lat<=4?3:lat<=56?1:-1) : (lat<=4?1:lat<=28?3:lat<=56?2:-1); }
  const c2d=!e||e>=on?'0':''; const c5d=ALD_STRONG.test(d.name)?'3':ALD_ASSOC.test(d.name)?'2':'0';
  const v={c1,lat,c2:A.c2??c2d,c3:A.c3??'0',c4:A.c4??'0',c5:A.c5??c5d}; v.inter=(c1??0)+[v.c2,v.c3,v.c4,v.c5].reduce((a,x)=>a+(x===''?0:+x),0); v.miss=c1==null||v.c2===''; return {A,v}; }
function aldOut(){ const box=$('alBox'); if(!box) return; const on=adrOnset(), ds=ADR.drugs.filter(d=>d.name);
  if(!ds.length||!on){box.innerHTML='<div class="empty">ต้องมีรายการยา (วันเริ่ม) และอาการ (ADR) พร้อมวันที่ — วันเกิดอาการ = index day</div>';$('alRes').innerHTML='';return;}
  const rows=ds.map(d=>({d,...aldRow(d,on)})); rows.forEach(r=>{ r.c6=rows.some(o=>o!==r&&!o.v.miss&&o.v.inter>3)?-1:0; r.fin=r.v.inter+r.c6; });
  const sel=(r,k)=>`<select data-al="${r.d.id}" data-k="${k}"><option value=""${r.v[k]===''?' selected':''}>— เลือก —</option>${ALD_OPT[k].map(([v,l])=>`<option value="${v}"${r.v[k]===v?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
  box.innerHTML=rows.map(r=>`<div class="arow" data-role="${r.d.role}" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
    <div style="grid-column:1/-1;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>${esc(r.d.role+' · '+r.d.name)}</b><span class="pill ${r.fin>=4?'flag':r.fin>=2?'warn':'ok'}">ALDEN ${r.v.miss?'?':r.fin} · ${r.v.miss?'ข้อมูลไม่ครบ':aldCat(r.fin)}</span><label class="rchk" style="margin:0"><input type="checkbox" data-al="${r.d.id}" data-k="prior"${r.A.prior?' checked':''}><span>เคยแพ้ยานี้มาก่อน</span></label></div>
    <label class="f">1. ระยะเวลาเริ่มยา→วันเกิดอาการ<input readonly value="${r.v.c1==null?'ไม่มีวันเริ่มยา':`${r.v.lat} วัน → ${r.v.c1>0?'+':''}${r.v.c1}`}"></label>
    <label class="f">2. ยายังอยู่ในร่างกาย ณ วันเกิดอาการ${sel(r,'c2')}</label>
    <label class="f">3. Prechallenge / rechallenge${sel(r,'c3')}</label>
    <label class="f">4. Dechallenge${sel(r,'c4')}</label>
    <label class="f">5. ชนิดยา (notoriety)${sel(r,'c5')}</label>
    <label class="f">6. สาเหตุอื่น (อัตโนมัติ)<input readonly value="${r.c6} (${r.c6?'มียาอื่นคะแนนกลาง >3':'ไม่มียาอื่นคะแนนกลาง >3'})"></label></div>`).join('');
  box.querySelectorAll('[data-al]').forEach(x=>x.addEventListener('change',()=>{const A=ADR.alden[x.dataset.al]; if(x.dataset.k==='prior') A.prior=x.checked; else A[x.dataset.k]=x.value; aldOut(); adrOut();}));
  ADR.aldenRes=rows.filter(r=>!r.v.miss).map(r=>`${r.d.name} ${r.fin} (${aldCat(r.fin)})`);
  $('alRes').innerHTML=`<p class="hint" style="margin:6px 0 0">ALDEN: <0 very unlikely · 0–1 unlikely · 2–3 possible · 4–5 probable · ≥6 very probable · ข้อ 5 เติมอัตโนมัติจากรายการยาความเสี่ยงสูง/ปานกลางของ EuroSCAR (allopurinol, carbamazepine, sulfonamides, lamotrigine, nevirapine, oxicam NSAIDs, phenobarbital, phenytoin = +3) แก้ได้</p>`; }

/* ---------- PEN-FAST (Trubiano 2020) — ความเสี่ยงแพ้ penicillin จริง ---------- */
const PF=[['f','F — เกิดอาการแพ้ภายใน 5 ปีที่ผ่านมา (หรือไม่ทราบเวลา)',2],['as','A/S — เป็น Anaphylaxis/Angioedema หรือ SCAR (SJS/TEN, DRESS, AGEP)',2],['t','T — ต้องได้รับการรักษาอาการแพ้ (หรือไม่ทราบ)',1]];
function pfInit(){ const b=$('pfBox'); if(!b) return;
  b.innerHTML=`<label class="rchk"><input type="checkbox" data-pf="pen"><span><b>PEN</b> — ผู้ป่วยมีประวัติแพ้ยากลุ่ม penicillin (เงื่อนไขก่อนใช้ PEN-FAST)</span></label>`+PF.map(([k,l,s])=>`<label class="rchk"><input type="checkbox" data-pf="${k}"><span>${esc(l)} <small>(+${s})</small></span></label>`).join('');
  b.querySelectorAll('[data-pf]').forEach(c=>c.addEventListener('change',pfOut)); pfOut(); }
function pfOut(){ const v=k=>document.querySelector(`[data-pf="${k}"]`).checked; const sc=PF.reduce((a,[k,,s])=>a+(v(k)?s:0),0);
  const risk=sc===0?['<1%','ความเสี่ยงต่ำมาก']:sc<=2?['~5%','ความเสี่ยงต่ำ']:sc===3?['~20%','ความเสี่ยงปานกลาง']:['~50%','ความเสี่ยงสูง'];
  const li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  ADR.penfast=v('pen')?{s:sc,r:risk[1]}:null;
  $('pfRes').innerHTML=v('pen')?`<div class="big"><span class="n">${sc}</span><span class="u">PEN-FAST · ${risk[1]} — โอกาสผลทดสอบแพ้ penicillin จริง ${risk[0]}</span></div><ul class="msgs" style="margin-top:8px">${sc<3?li('ok','<3 คะแนน = ความเสี่ยงต่ำ — พิจารณา direct oral challenge (เช่น amoxicillin) ภายใต้การดูแลของแพทย์ เพื่อถอดฉลากแพ้ยา'):li('warn','≥3 คะแนน — ไม่ควร challenge โดยตรง พิจารณาส่งปรึกษา allergist / skin test หรือใช้ยากลุ่มอื่น')}${v('as')?li('flag','ถ้าเป็น SCAR (SJS/TEN, DRESS, AGEP) ห้าม rechallenge'):''}${li('info','คะแนน 0: <1% · 1–2: ~5% · 3: ~20% · 4–5: ~50%')}</ul>`:'<span class="hint">ใช้เฉพาะผู้ป่วยที่มีประวัติแพ้ penicillin — ติ๊ก PEN ก่อน</span>';
  adrOut(); }
pfInit();

/* ---------- Cross-allergy checker (UI) ---------- */
function xaInit(){ if(!$('xaIn')) return; ['xaIn','xaTest'].forEach(id=>$(id).addEventListener('input',xaOut)); ['xaSev','xaNs'].forEach(id=>$(id).addEventListener('change',xaOut));
  $('xaFill').onclick=()=>{ const v=[$('allergy').value,...ADR.drugs.filter(d=>d.role==='S'&&d.name).map(d=>d.name)].filter(Boolean).join(', '); $('xaIn').value=v; xaOut(); }; xaOut(); }
function xaOut(){ const al=$('xaIn').value.trim(), o={nsType:$('xaNs').value,severe:$('xaSev').checked||XA_SEVERE.test(al)}; const box=$('xaRes');
  if(!al){box.innerHTML='<div class="empty">ระบุยาที่ผู้ป่วยแพ้ (หรือกด "ดึงจากประวัติแพ้ยา / ยาที่สงสัย") แล้วโปรแกรมจะเทียบกับยาทุกตัวในกลุ่ม และยาในใบสั่ง/แท็บ ADR</div>';return;}
  const lvTxt={flag:'ห้ามใช้',warn:'ระวัง',ok:'ใช้ได้'}; const chip=(n,r)=>`<span class="xchip ${r?r.lvl:'na'}" title="${esc(r?r.txt:'')}">${esc(n)}</span>`;
  const allergens=xaSplit(al).flatMap(p=>xaFind(p).length?xaFind(p):[]); let h='';
  if(o.severe) h+=`<div class="rflag"><b>แพ้แบบรุนแรงชนิดล่าช้า</b> (SJS/TEN, DRESS, AGEP, exfoliative, ไตอักเสบ, ตับอักเสบ, hemolytic anemia) — ถ้าเป็น beta-lactam ให้หลีกเลี่ยง beta-lactam ทุกตัว และห้าม rechallenge ยาที่สงสัย</div>`;
  // ยาในใบสั่ง + แท็บ ADR + ยาที่พิมพ์ทดสอบ
  const cands=[...new Set([...(typeof rows!=='undefined'?rows:[]).map(r=>r.raw),...ADR.drugs.filter(d=>d.name&&d.role!=='S').map(d=>d.name),...xaSplit($('xaTest').value)])].filter(Boolean);
  const res=cands.flatMap(t=>xaCheck(al,t,o).map(r=>({...r,src:t}))); const uniq=[]; res.forEach(r=>{if(!uniq.some(u=>u.a===r.a&&u.d===r.d)) uniq.push(r);});
  h+=`<h2 style="margin-top:4px">ยาในใบสั่ง / แท็บ ADR / ที่พิมพ์ทดสอบ</h2>`+(uniq.length?`<ul class="msgs">${uniq.sort((a,b)=>LV[b.lvl==='ok'?'ok':b.lvl]-LV[a.lvl==='ok'?'ok':a.lvl]).map(r=>`<li><span class="tag ${r.lvl}">${lvTxt[r.lvl]}</span><span><b>${esc(r.d)}</b> (แพ้ ${esc(r.a)}) — ${esc(r.txt)}</span></li>`).join('')}</ul>`:'<p class="hint">ไม่พบยาในกลุ่มเดียวกับที่แพ้ในรายการปัจจุบัน — พิมพ์ชื่อยาในช่อง "ทดสอบยา" เพื่อเช็ก</p>');
  // ตารางอ้างอิงทั้งกลุ่ม
  const grps=[...new Set(allergens.map(a=>a[2]))]; const partTxt=xaSplit(al).join(' ');
  if(/penicillin|เพนนิ|cephalo|เซฟา/i.test(partTxt)&&!grps.includes('bl')) grps.push('bl'); if(/sulfa|ซัลฟา/i.test(partTxt)&&!grps.includes('sul')) grps.push('sul'); if(/nsaid/i.test(partTxt)&&!grps.includes('ns')) grps.push('ns');
  for(const g of grps){ const as=allergens.filter(a=>a[2]===g); const members=XA.filter(x=>x[2]===g);
    const verdict=m=>{ let best=null; if(as.length){ for(const a of as){ const r=xaPair(a,m,o); if(r&&(!best||LV[r.lvl==='ok'?'ok':r.lvl]>LV[best.lvl==='ok'?'ok':best.lvl])) best=r; } return best; }
      const r=xaCheck(partTxt,m[0],o)[0]; return r||null; };
    const sub=g==='bl'?[['Penicillins',m=>m[3].c==='pen'],['Cephalosporins',m=>m[3].c==='ceph'],['Carbapenems / Monobactam',m=>m[3].c==='carb'||m[3].c==='mono']]
      :g==='ns'?[['ยับยั้ง COX-1 แรง',m=>m[3].x==='1'],['Preferential COX-2',m=>m[3].x==='p'],['Selective COX-2 (coxib)',m=>m[3].x==='2'],['Paracetamol',m=>m[3].x==='a']]
      :g==='aed'?[['Aromatic',m=>m[3].ar],['Non-aromatic',m=>!m[3].ar]]:[['Sulfonamide antibiotic',m=>m[3].ab],['Non-antibiotic sulfonamide',m=>!m[3].ab]];
    h+=`<h2 style="margin-top:12px">${XA_GRP[g]} — เทียบกับ ${esc(as.map(a=>a[0]).join(', ')||partTxt)}</h2><div class="xgrid">${sub.map(([t,f])=>`<div class="xg"><div class="xgh">${t}</div>${members.filter(f).map(m=>chip(m[0]+(g==='ns'?` · ${m[3].k}`:''),verdict(m))).join('')}</div>`).join('')}</div>`; }
  h+=`<p class="hint" style="margin:8px 0 0"><span class="xchip flag">ห้ามใช้</span> <span class="xchip warn">ระวัง / challenge ภายใต้การดูแล</span> <span class="xchip ok">ใช้ได้</span> · ชี้ที่ชื่อยาเพื่อดูเหตุผล · อ้างอิง: Beta-lactam cross-allergy chart (Interior Health Authority) · EAACI/ENDA NSAID classification (Kowalski 2013, Doña 2020) · ไม่ทดแทนการประเมินทางคลินิก</p>`;
  box.innerHTML=h; }
xaInit();

/* ---------- Lund & Browder (%BSA) ---------- */
const LB_AGE=[[1,9.5,2.75,2.5],[5,8.5,3.25,2.5],[10,6.5,4,2.75],[15,5.5,4.25,3],[18,4.5,4.5,3.25],[999,3.5,4.75,3.5]]; // [age<, A head(each side), B thigh, C leg]
const LB=(f)=>[ // [id,label,pct-key or number, shape]
 [f+'head','ศีรษะ','A',['e',120,46,32,38]],[f+'neck','คอ',1,['r',108,84,24,14]],[f+'trunk',f==='F'?'ลำตัวหน้า':'แผ่นหลัง',13,['r',80,98,80,150]],
 ...(f==='F'?[[f+'gen','อวัยวะเพศ',1,['r',110,248,20,14]]]:[[f+'butR','ก้นขวา',2.5,['r',80,248,39,22]],[f+'butL','ก้นซ้าย',2.5,['r',121,248,39,22]]]),
 [f+'uaR','ต้นแขน',2,['r',f==='F'?52:164,100,24,72]],[f+'uaL','ต้นแขน',2,['r',f==='F'?164:52,100,24,72]],
 [f+'faR','แขนล่าง',1.5,['r',f==='F'?48:168,176,24,60]],[f+'faL','แขนล่าง',1.5,['r',f==='F'?168:48,176,24,60]],
 [f+'hR','มือ',1.25,['r',f==='F'?46:168,240,26,28]],[f+'hL','มือ',1.25,['r',f==='F'?168:46,240,26,28]],
 [f+'thR','ต้นขา','B',['r',f==='F'?82:122,f==='F'?264:272,36,f==='F'?100:92]],[f+'thL','ต้นขา','B',['r',f==='F'?122:82,f==='F'?264:272,36,f==='F'?100:92]],
 [f+'lgR','ขาล่าง','C',['r',f==='F'?84:124,368,32,90]],[f+'lgL','ขาล่าง','C',['r',f==='F'?124:84,368,32,90]],
 [f+'ftR','เท้า',1.75,['r',f==='F'?80:122,462,38,20]],[f+'ftL','เท้า',1.75,['r',f==='F'?122:80,462,38,20]]];
const LB_ALL=[...LB('F'),...LB('B')];
let LBS={d:{},r:{}}, lbMode='d';
const lbPct=(k)=>{ if(typeof k==='number') return k; const a=+$('age').value; const row=LB_AGE.find(r=>(a>=0&&$('age').value!==''?a:99)<r[0])||LB_AGE[5]; return k==='A'?row[1]:k==='B'?row[2]:row[3]; };
function lbInit(){ if(!$('lbFig')) return;
  const fig=f=>{ const rs=LB(f); return `<div class="lbf"><div class="lbt">${f==='F'?'ด้านหน้า':'ด้านหลัง'} <span id="lbSum${f}" class="pill none">0%</span></div><svg viewBox="30 0 180 490" class="lbsvg">${rs.map(([id,l,k,s])=>{const sh=s[0]==='e'?`<ellipse data-lb="${id}" cx="${s[1]}" cy="${s[2]}" rx="${s[3]}" ry="${s[4]}"/>`:`<rect data-lb="${id}" x="${s[1]}" y="${s[2]}" width="${s[3]}" height="${s[4]}" rx="5"/>`; const cx=s[0]==='e'?s[1]:s[1]+s[3]/2, cy=s[0]==='e'?s[2]:s[2]+s[4]/2; return sh+`<text x="${cx}" y="${cy+3}" text-anchor="middle" data-lbt="${id}" font-size="${s[3]<30?8.5:10}"></text>`;}).join('')}</svg></div>`;};
  $('lbFig').innerHTML=fig('F')+fig('B');
  $('lbFig').querySelectorAll('[data-lb]').forEach(x=>x.addEventListener('click',()=>{const id=x.dataset.lb, S=LBS[lbMode]; S[id]=!S[id]; lbOut();}));
  document.querySelectorAll('[data-lbm]').forEach(b=>b.onclick=()=>{lbMode=b.dataset.lbm; document.querySelectorAll('[data-lbm]').forEach(x=>x.setAttribute('aria-pressed',x===b)); lbOut();});
  $('lbClear').onclick=()=>{LBS[lbMode]={};lbOut();}; $('age').addEventListener('input',()=>{if(!$('p-adr').hidden) lbOut();}); lbOut(); }
function lbOut(){ const sum=(S,f)=>LB_ALL.filter(r=>S[r[0]]&&(!f||r[0][0]===f)).reduce((a,r)=>a+lbPct(r[2]),0);
  LB_ALL.forEach(([id,l,k])=>{ const el=document.querySelector(`[data-lb="${id}"]`), t=document.querySelector(`[data-lbt="${id}"]`); if(!el) return;
    el.setAttribute('class',(LBS.d[id]?'lbd ':'')+(LBS.r[id]?'lbr ':'')+(lbMode==='d'?'mD':'mR')); t.textContent=`${id.endsWith('trunk')||id.endsWith('head')?l+' ':''}${fmtN(lbPct(k))}`; });
  const S=LBS[lbMode]; ['F','B'].forEach(f=>$('lbSum'+f).textContent=`${fmtN(sum(S,f))}%`);
  const d=sum(LBS.d), r=sum(LBS.r); const li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  $('lbRes').innerHTML=`<div class="adr2" style="gap:10px"><div class="big"><span class="n" style="color:var(--flag)">${fmtN(d)}%</span><span class="u">หนังกำพร้าหลุด / ตุ่มน้ำ (detachment)</span></div><div class="big"><span class="n" style="color:var(--warn)">${fmtN(r)}%</span><span class="u">พื้นที่ผื่น</span></div></div>
   <ul class="msgs" style="margin-top:8px">${d>0?li(d>30?'flag':d>=10?'flag':'warn',`Detachment ${fmtN(d)}% BSA → ${d<10?'SJS (<10%)':d<=30?'SJS-TEN overlap (10–30%)':'TEN (>30%)'}`):li('info','เลือกโหมด "หนังหลุด/ตุ่มน้ำ" แล้วคลิกบริเวณบนรูปเพื่อแยก SJS / overlap / TEN')}
   ${r>0?li(r>50?'warn':'info',`ผื่น ${fmtN(r)}% BSA ${r>50?'(>50% — RegiSCAR ข้อผื่น +1)':''}`):''}
   ${li('info',`ค่าตามอายุ ${ageTxt()||'ผู้ใหญ่'} (Lund & Browder: ศีรษะ ต้นขา ขาล่าง ปรับตามอายุ) · คลิกซ้ำเพื่อยกเลิก · รูปด้านหน้ามองจากผู้ตรวจ (ซ้ายของภาพ = ข้างขวาผู้ป่วย)`)}</ul>`;
  if(d>0){ $('rashBsa').value=+d.toFixed(2); rashOut(); const sc=document.querySelector('[data-sc="bsa"]'); if(sc){sc.checked=d>=10; scOut();} }
  const rb=document.querySelector('[data-regi="bsa"]'); if(rb&&r>0){ rb.value=r>50?'y':'n'; ADR.regi.bsa=rb.value; }
  ADR.bsa={d,r}; adrOut(); }
lbInit();

/* ---------- พิมพ์ A4 ---------- */
function adrPrint(){ adrOut(); let pa=document.getElementById('printArea'); if(!pa){pa=document.createElement('div');pa.id='printArea';document.body.appendChild(pa);}
  const ds=ADR.drugs.filter(d=>d.name), evs=[...ADR.evs].sort((a,b)=>((tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0))), on=adrOnset(), n=new Date();
  const svg=$('aChart').querySelector('svg'); const role={S:'S',O:'O',I:'I'};
  pa.innerHTML=`<div class="ph"><div><b style="font-size:15pt">ADR Timeline / แบบบันทึกติดตามอาการไม่พึงประสงค์จากการใช้ยา</b><br>กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม</div><div style="text-align:right">พิมพ์ ${tlFmt(n)}</div></div>
   <table class="pt4"><tr><td>ชื่อ-สกุล ..........................................................</td><td>HN ........................</td><td>AN ........................</td><td>หอผู้ป่วย ........................</td></tr>
   <tr><td>เพศ ${sex==='F'?'หญิง':'ชาย'} · อายุ ${ageTxt()||'.... ปี'} · น้ำหนัก ${$('bw').value||'....'} kg</td><td colspan="3">ประวัติแพ้ยา/โรคประจำตัว: ${esc([$('allergy').value,ADR.f.hx].filter(Boolean).join(' · ')||'..................................................................')}</td></tr></table>
   ${svg?`<div class="psvg">${svg.outerHTML}</div>`:''}
   <table class="pt4 grid"><tr><th>บทบาท</th><th>ยา / ขนาด / วิธีใช้</th><th>เริ่ม</th><th>หยุด</th><th>ก่อนเกิดอาการ</th><th>Naranjo</th></tr>
   ${ds.map(d=>{const L=adrLat(d,on), s=narScore(d.id); return `<tr><td>${role[d.role]}</td><td>${esc(d.name)}${d.dose&&d.dose!==d.name?`<br><small>${esc(d.dose)}</small>`:''}</td><td>${esc(d.sd)} ${esc(d.st)}</td><td>${esc(d.ed||'ยังใช้อยู่')}</td><td>${L&&L.v!=='after'?fmtN(L.days)+' วัน':'–'}</td><td>${s!=null?`${s} (${narCat(s)[0]})`:'–'}</td></tr>`;}).join('')}</table>
   <table class="pt4 grid"><tr><th>วันที่</th><th>เหตุการณ์</th><th>รายละเอียด</th></tr>${evs.map(e=>`<tr><td>${esc(e.d)} ${esc(e.t)}</td><td>${{adr:'อาการ (ADR)',relief:'ยาบรรเทา',lab:'Lab',note:'หมายเหตุ'}[e.type]}</td><td>${e.type==='lab'?esc(`${e.lab} ${e.val} ${e.unit}`)+(labAbn(e)?' *':''):esc(e.text)}${e.sev?` (${esc(e.sev)})`:''}</td></tr>`).join('')}</table>
   <div class="pbox"><b>สรุปการประเมิน</b><pre>${esc($('aOutTxt').value.split('\n').filter(l=>/^(ชนิดอาการ|ความร้ายแรง|การจัดการ|ผลลัพธ์|ระดับความน่าจะเป็น|แบบบันทึก|การแพ้ยาซ้ำ|แพ้ยาในกลุ่ม|กลุ่มเฝ้าระวัง|ADR จาก DI|Labeled)/.test(l)).join('\n'))}${ADR.bsa&&ADR.bsa.d?`\nDetachment ${fmtN(ADR.bsa.d)}% BSA`:''}</pre></div>
   <div class="pbox"><b>Pharmacist Note</b><pre>${esc($('aNoteTxt').value)}</pre></div>
   <div class="psign">ผู้ประเมิน/เภสัชกร ...................................................... วันที่ ............................</div>`;
  window.print(); }
if($('aPrint')) $('aPrint').onclick=adrPrint;

/* ---------- Naranjo: เพิ่มยาจากหัวข้อ 5 ได้เลย + ตารางสรุปหลายยา ---------- */
function narQuickInit(){ if(!$('aNarAdd')) return; $('aNarAdd').onclick=()=>{ const v=$('aNarNew').value.trim(); if(!v) return; adrAddDrug({name:v,role:ADR.drugs.some(d=>d.role==='S')?'O':'S'},true); $('aNarNew').value=''; adrDrugs(); const d=ADR.drugs[ADR.drugs.length-1]; ADR.narSel=d.id; adrNarSelOpts(); adrOut(); }; }
narQuickInit();

/* ---------- พิมพ์แบบบันทึก MKH-FR-PHA-048 (หลักฐาน HA) ---------- */
function adrPrintMKH(){ adrOut(); let pa=document.getElementById('printArea'); if(!pa){pa=document.createElement('div');pa.id='printArea';document.body.appendChild(pa);}
  const M=ADR.m48||{cls:'',ta:['','',''],prev:Array(7).fill(''),me:'',meDet:'',meType:'',ncc:'',rep:'',cross:'',crossOld:'',crossNew:'',sjs:'',di:''};
  const bx=c=>c?'☑':'☐', ds=ADR.drugs.filter(d=>d.name), nd=[...ds.filter(d=>d.role==='S'),...ds.filter(d=>d.role!=='S')].slice(0,3), on=adrOnset();
  const svg=$('aChart').querySelector('svg'); const evs=[...ADR.evs].sort((a,b)=>((tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0)));
  const t=m48Type(), pv=m48Prev();
  const nq=(i,d)=>{const a=(ADR.nar[d.id]||[])[i]; if(!a) return ''; const p=NAR_Q[i][1]; const s=a==='y'?p[0]:a==='n'?p[1]:p[2]; return `${a==='y'?'ใช่':a==='n'?'ไม่ใช่':'ไม่ทราบ'} (${s>0?'+':''}${s})`;};
  pa.innerHTML=`<div class="mk"><div style="text-align:right;font-size:9pt">MKH-FR-PHA-048 (แก้ไขครั้งที่ : 05) บังคับใช้วันที่ 1/ส.ค./60</div>
  <div class="mkt">แบบบันทึกกิจกรรมการติดตามอาการไม่พึงประสงค์จากการใช้ยา กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม</div>
  <table class="pt4"><tr><td>ชื่อ-สกุล ................................................</td><td>HN ....................</td><td>AN ....................</td><td>หอผู้ป่วย ....................</td></tr>
  <tr><td colspan="2">เพศ ${sex==='F'?'หญิง':'ชาย'} อายุ ${ageTxt()||'.... ปี'} น้ำหนัก ${$('bw').value||'....'} kg</td><td colspan="2">${bx(M.cls==='ADR')} ADR &nbsp; ${bx(M.cls==='non')} non-ADR &nbsp; ${bx(M.cls==='insuf')} ข้อมูลไม่เพียงพอต่อการประเมิน</td></tr></table>
  <table class="pt4 grid"><tr><th style="width:22%">ยาที่ได้รับ/อาการที่เกิด</th><td>${ds.map(d=>`${d.role} · ${esc(d.name)}${d.dose&&d.dose!==d.name?` (${esc(d.dose)})`:''} เริ่ม ${esc(d.sd||'-')} หยุด ${esc(d.ed||'ยังใช้อยู่')}`).join('<br>')||'–'}<br><b>อาการ:</b> ${evs.filter(e=>e.type==='adr').map(e=>`${esc(e.d)} ${esc(e.text)}`).join(' · ')||'–'}</td></tr>
  <tr><th>ลำดับเหตุการณ์</th><td>${svg?`<div class="psvg">${svg.outerHTML}</div>`:''}${evs.map(e=>`${esc(e.d)} ${esc(e.t)} — ${{adr:'อาการ',relief:'ยาบรรเทา',lab:'Lab',note:'หมายเหตุ'}[e.type]}: ${e.type==='lab'?esc(`${e.lab} ${e.val} ${e.unit}`)+(labAbn(e)?' *':''):esc(e.text)}`).join('<br>')}</td></tr>
  <tr><th>Pharmacist Note</th><td><pre>${esc($('aNoteTxt').value)}</pre></td></tr></table>
  <div class="mkh">ประเมิน Type ADR</div><table class="pt4 grid">${TA_Q.map((q,i)=>`<tr><td>${i+1}. ${q}ใช่หรือไม่</td><td style="width:70px">${bx(M.ta[i]==='y')} ใช่</td><td style="width:80px">${bx(M.ta[i]==='n')} ไม่ใช่</td></tr>`).join('')}
   <tr><td colspan="3">สรุป Adverse drug reaction นี้เป็น ADR type ${bx(t==='A')} A &nbsp; ${bx(t==='B')} B &nbsp; <small>(ตอบ "ใช่" 1 ข้อ → Type A · ไม่มีข้อใดตอบ "ใช่" → Type B)</small></td></tr></table>
  <div class="mkh">ประเมิน Type B ADR ต่อด้วย Naranjo's ADR probability scale</div>
  <table class="pt4 grid sm"><tr><th>คำถาม</th><th>ใช่</th><th>ไม่ใช่</th><th>ไม่ทราบ</th>${nd.map(d=>`<th>${esc(d.name)}</th>`).join('')}</tr>
   ${NAR_Q.map(([q,p],i)=>`<tr><td>${i+1}. ${esc(q)}</td><td>${p[0]>0?'+':''}${p[0]}</td><td>${p[1]>0?'+':''}${p[1]}</td><td>${p[2]}</td>${nd.map(d=>`<td>${nq(i,d)}</td>`).join('')}</tr>`).join('')}
   <tr><td colspan="4">รวมคะแนน และผล: ① Definite (≥9) ② Probable (5–8) ③ Possible (1–4) ④ Unlikely (≤0)</td>${nd.map(d=>{const s=narScore(d.id);return `<td><b>${s==null?'':s+' '+narCat(s)[0]}</b></td>`;}).join('')}</tr></table>
  <div class="mkh">ประเมิน Preventable ADE (ทุกเคส)</div>
  <table class="pt4 grid sm"><tr><th>1. การประเมิน Preventability (Schumock &amp; Thornton)</th><th>YES</th><th>NO</th><th style="width:38%">2. เป็นเหตุการณ์ที่เกิดจากความคลาดเคลื่อนทางยา (Medication Error) หรือไม่</th></tr>
   ${PREV_Q.map((q,i)=>`<tr><td>${['I','II','III','IV','V','VI','VII'][i]}. ${esc(q)}</td><td>${bx(M.prev[i]==='y')}</td><td>${bx(M.prev[i]==='n')}</td>${i===0?`<td rowspan="7">${bx(M.me==='n')} NO &nbsp; ${bx(M.me==='y')} YES<br>ระบุ: ${esc(M.meDet||'')}<br><br>เป็น ME ชนิด ${bx(M.meType==='PE')} PE ${bx(M.meType==='DE')} DE ${bx(M.meType==='AE')} AE</td>`:''}</tr>`).join('')}
   <tr><td colspan="4">3. สรุปผลการประเมิน ${bx(pv==='Preventable')} Preventable &nbsp; ${bx(pv==='Non-preventable')} Non-preventable</td></tr>
   <tr><td colspan="4">4. ระดับความรุนแรง (NCC MERP Severity Category): ${['A','B','C','D'].map(x=>`${bx(M.ncc===x)} ${x}`).join(' ')} &nbsp; Harm level: ${['E','F','G','H','I'].map(x=>`${bx(M.ncc===x)} ${x}`).join(' ')}</td></tr></table>
  <table class="pt4 grid sm"><tr><th>การแพ้ยาซ้ำ</th><th>การแพ้ยาในกลุ่มเดียวกัน</th><th>การแพ้ยาในกลุ่มที่เฝ้าระวังการเกิด SJS/TEN</th></tr>
   <tr><td>${bx(M.rep==='sys')} 1. เนื่องจากระบบโรงพยาบาล<br>${bx(M.rep==='nonsys')} 2. ที่ไม่ใช่สาเหตุจากโรงพยาบาล<br>${bx(M.rep==='int')} 3. จากความตั้งใจเพื่อประโยชน์ในการรักษา</td>
   <td>ยาเดิมที่แพ้ ${esc(M.crossOld||'.........')} ยาที่แพ้ครั้งนี้ ${esc(M.crossNew||'.........')}<br>${bx(M.cross==='sys')} 1. เนื่องจากระบบโรงพยาบาล<br>${bx(M.cross==='nonsys')} 2. ที่ไม่ใช่จากระบบโรงพยาบาล<br>${bx(M.cross==='int')} 3. เพื่อประโยชน์ในการรักษา</td>
   <td>${bx(M.sjs==='got')} 1. ผู้ป่วยได้รับสติ๊กเกอร์เฝ้าระวัง/ข้อมูลการเฝ้าระวัง<br>${bx(M.sjs==='not')} 2. ผู้ป่วยไม่ได้รับสติ๊กเกอร์เฝ้าระวัง/ข้อมูลการเฝ้าระวัง<br>ADR จาก DI: ${esc(M.di||'........')}</td></tr></table>
  <div class="psign">ผู้ประเมิน/เภสัชกร ...................................................... วันที่ ............................ <small>(พิมพ์ ${tlFmt(new Date())})</small></div></div>`;
  window.print(); }
if($('aPrintMK')) $('aPrintMK').onclick=adrPrintMKH;

/* ---------- Phlebitis scale ---------- */
const PHLEB=[
 [0,'ไม่มีอาการ (No symptoms)','สังเกตตำแหน่งแทงเข็ม (IV site) · Monitor และบันทึกตามนโยบาย'],
 [1,'แดงรอบรอยเข็ม มีอาการปวดหรือไม่มีก็ได้ (Erythema at access site ± pain)','เปลี่ยน IV site · รายงานอุบัติการณ์ · Monitor และบันทึกรอยแทงเข็มเก่าทุกเวร'],
 [2,'ปวดและแดงรอบรอยเข็ม บวมหรือไม่บวมก็ได้ (Pain with erythema and/or edema)','เปลี่ยน IV site และรายงานแพทย์ · ประคบเย็นลดปวด / ประคบร้อนลดบวม · รายงานอุบัติการณ์ · Monitor และบันทึกรอยแทงเข็มเก่าทุกเวร'],
 [3,'ปวดและแดง + มีรอยแดงเป็นทาง (streak) + คลำได้หลอดเลือดแข็ง (palpable venous cord)','เปลี่ยน IV site และรายงานแพทย์ · ประคบเย็นลดปวด / ประคบร้อนลดบวม · รายงานอุบัติการณ์ · Monitor และบันทึกรอยแทงเข็มเก่าทุกเวร'],
 [4,'ปวดและแดง + streak + หลอดเลือดแข็งยาว >1 นิ้ว + มีหนอง (purulent drainage)','เปลี่ยน IV site และรายงานแพทย์ (แพทย์อาจส่งปลายเข็มเพาะเชื้อ C/S) · ประคบเย็นลดปวด / ประคบร้อนลดบวม · รายงานอุบัติการณ์ · Monitor และบันทึกรอยแทงเข็มเก่าทุกเวร']];
(function(){ const box=$('phBox'); if(!box) return;
  box.innerHTML=PHLEB.map(([g,c])=>`<label class="chk" style="display:flex;gap:8px;align-items:flex-start;padding:6px 8px;border:1px solid var(--line);border-radius:8px"><input type="radio" name="phG" value="${g}"><span><b>Grade ${g}</b> — ${c}</span></label>`).join('');
  box.querySelectorAll('input').forEach(i=>i.onchange=()=>{ const p=PHLEB[+i.value];
    $('phRes').innerHTML=`<div class="band ${p[0]>=3?'f':p[0]>=1?'w':''}"><b>Phlebitis grade ${p[0]}</b> — ${esc(p[2])}</div><p class="hint">ยาที่ทำให้หลอดเลือดอักเสบบ่อย: KCl, Vancomycin, Erythromycin, Amiodarone, Dextrose >10%, Calcium, ยาเคมีบำบัด, สารละลาย pH/osmolarity สูง — พิจารณาเจือจาง/ลดอัตรา/central line · อ้างอิง: Phlebitis scale (INS) จาก Nurse Soulciety</p>`; });
})();
