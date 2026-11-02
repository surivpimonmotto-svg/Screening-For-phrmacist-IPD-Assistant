/* ===== neo.js — แท็บ "ยาทารกแรกเกิด" (รอตรวจ): ขนาดยา/ช่วงห่างตาม GA · PNA · PMA + ตรวจคำสั่งที่วาง
 แหล่งข้อมูล: NeoFax (ตาราง PMA/PNA ฉบับที่ใช้แพร่หลาย) · AAP Red Book 2024 (meningitis) · CDC STI 2021 (congenital syphilis)
 ⚠ เป็นไกด์ไลน์อ้างอิงสำหรับเภสัชกร — รอเภสัชกรด้านกุมารเวชตรวจ · ยึดแนวทาง/คำสั่งกุมารแพทย์ รพ. เป็นหลัก */
// ตาราง A (NeoFax): ampicillin, cefotaxime, cloxacillin/oxacillin, ceftazidime — PMA ≤29: PNA 0–28 q12h >28 q8h · 30–36: 0–14 q12h >14 q8h · 37–44: 0–7 q12h >7 q8h · ≥45 q6h
const neoChartA=(pma,pna,last=6)=>pma<30?(pna<=28?12:8):pma<37?(pna<=14?12:8):pma<45?(pna<=7?12:8):last;
const neoBand=(pma,pna,cuts)=>pma<30?`PMA ≤29 · PNA ${pna<=cuts[0]?'0–'+cuts[0]:'>'+cuts[0]} วัน`:pma<37?`PMA 30–36 · PNA ${pna<=cuts[1]?'0–'+cuts[1]:'>'+cuts[1]} วัน`:pma<45?`PMA 37–44 · PNA ${pna<=cuts[2]?'0–'+cuts[2]:'>'+cuts[2]} วัน`:'PMA ≥45';
const neoBandA=(pma,pna)=>neoBand(pma,pna,[28,14,7]);
// อะมิโนไกลโคไซด์ (NeoFax): PMA ≤29: PNA 0–7 / 8–28 / ≥29 · 30–34: 0–7 / ≥8 · ≥35: ทุก PNA
const neoAG=(pma,pna,t)=>pma<30?(pna<=7?t[0]:pna<=28?t[1]:t[2]):pma<35?(pna<=7?t[3]:t[4]):t[5];
const neoAGband=(pma,pna)=>pma<30?`PMA ≤29 · PNA ${pna<=7?'0–7':pna<=28?'8–28':'≥29'} วัน`:pma<35?`PMA 30–34 · PNA ${pna<=7?'0–7':'≥8'} วัน`:'PMA ≥35';
// แต่ละยา: f(c) → {d:[mg/kg ต่ำ,สูง], q:ชั่วโมง, ld?:loading, band, note} · c={ga,pna,pma,ind}
const NEO=[
 {id:'ampi',nm:'Ampicillin',re:/ampicil/i,u:'mg',f:c=>c.ind==='men'?(c.pna<=7?{d:[100,100],q:8,band:'meningitis (GBS) PNA ≤7 วัน',note:'300 mg/kg/วัน'}:{d:[75,75],q:6,band:'meningitis (GBS) PNA >7 วัน',note:'300 mg/kg/วัน'}):{d:[25,50],q:neoChartA(c.pma,c.pna),band:neoBandA(c.pma,c.pna),note:'sepsis 50 mg/kg/ครั้ง (GBS bacteremia ใช้ 50 q8h ใน GA ≥35 wk)'}},
 {id:'cefotaxime',nm:'Cefotaxime',re:/cefotax|claforan/i,u:'mg',f:c=>c.ind==='men'?{d:[50,50],q:c.pna<=7?8:6,band:`meningitis PNA ${c.pna<=7?'≤7':'>7'} วัน`,note:'Red Book: 0–7 วัน 100–150 mg/kg/วัน · 8–28 วัน 150–200 mg/kg/วัน'}:{d:[50,50],q:neoChartA(c.pma,c.pna),band:neoBandA(c.pma,c.pna),note:'sepsis — ถ้าใช้ q6h ในทารก = ขนาด meningitis ตรวจข้อบ่งใช้'}},
 {id:'genta',nm:'Gentamicin',re:/gentam/i,u:'mg',f:c=>{ const t=neoAG(c.pma,c.pna,[[5,48],[4,36],[4,24],[4.5,36],[4,24],[4,24]]); return {d:[t[0],t[0]],q:t[1],band:neoAGband(c.pma,c.pna),note:'IV drip 30 นาที · เจาะระดับยา (trough <1–2) ถ้าให้ >48 ชม. หรือไตไม่ดี · ระวังให้ร่วม indomethacin/ibuprofen'}; }},
 {id:'amikacin',nm:'Amikacin',re:/amikac|amikin/i,u:'mg',f:c=>{ const t=neoAG(c.pma,c.pna,[[18,48],[15,36],[15,24],[18,36],[15,24],[15,24]]); return {d:[t[0],t[0]],q:t[1],band:neoAGband(c.pma,c.pna),note:'IV drip 30 นาที · เจาะระดับยา (peak 20–30, trough 2–5) · ระวังให้ร่วม indomethacin/ibuprofen'}; }},
 {id:'vanco',nm:'Vancomycin',re:/vanco/i,u:'mg',f:c=>({d:c.ind==='men'?[15,15]:[10,15],q:c.pma<30?(c.pna<=14?18:12):c.pma<37?(c.pna<=14?12:8):c.pma<45?(c.pna<=7?12:8):6,band:neoBand(c.pma,c.pna,[14,14,7]),note:'drip ≥60 นาที · ติดตาม trough/AUC ตามแนวทาง รพ. · meningitis 15 mg/kg'})},
 {id:'mero',nm:'Meropenem',re:/merop|meronem/i,u:'mg',f:c=>c.ind==='men'?{d:[40,40],q:8,band:'meningitis / Pseudomonas',note:''}:{d:[20,20],q:c.ga<32&&c.pna<14?12:8,band:`GA ${c.ga<32?'<32':'≥32'} wk · PNA ${c.pna<14?'<14':'≥14'} วัน`,note:'sepsis 20 mg/kg · drip 30 นาที'}},
 {id:'ceftaz',nm:'Ceftazidime',re:/ceftazid|fortum/i,u:'mg',f:c=>({d:[30,30],q:neoChartA(c.pma,c.pna,8),band:neoBandA(c.pma,c.pna),note:'meningitis ใช้ 50 mg/kg (ปรึกษาแพทย์)'})},
 {id:'clox',nm:'Cloxacillin / Oxacillin',re:/cloxac|oxacil|nafcil/i,u:'mg',f:c=>({d:c.ind==='men'?[50,50]:[25,25],q:neoChartA(c.pma,c.pna),band:neoBandA(c.pma,c.pna),note:'ใช้ตาราง oxacillin/nafcillin (NeoFax) · meningitis 50 mg/kg'})},
 {id:'metro',nm:'Metronidazole',re:/metronid|flagyl/i,u:'mg',f:c=>({ld:15,d:[7.5,7.5],q:c.pma<30?(c.pna<=28?48:24):c.pma<37?(c.pna<=14?24:12):c.pma<45?(c.pna<=7?24:12):8,band:neoBandA(c.pma,c.pna),note:'loading 15 mg/kg แล้ว maintenance เริ่มหลัง loading 1 ช่วงห่าง'})},
 {id:'pen',nm:'Penicillin G (congenital syphilis)',re:/penicillin\s*g|pen\s*g|benzyl\s*pen|aqueous/i,u:'unit',f:c=>({d:[50000,50000],q:c.pna<=7?12:8,band:`PNA ${c.pna<=7?'≤7':'>7'} วัน`,note:'aqueous crystalline Pen G IV 10 วัน (CDC 2021)'})},
 {id:'ceftri',nm:'Ceftriaxone',re:/ceftriax|rocephin/i,u:'mg',f:c=>({d:[50,50],q:24,band:'ทั่วไป',note:'⚠ หลีกเลี่ยงในทารกตัวเหลือง (แทนที่ bilirubin) และห้ามให้ร่วม Ca IV ในทารก ≤28 วัน — ใช้ cefotaxime แทน'})},
 {id:'acy',nm:'Acyclovir (HSV)',re:/acyclo|zovirax/i,u:'mg',f:c=>({d:[20,20],q:c.pma<30?12:8,band:c.pma<30?'PMA <30':'PMA ≥30',note:'14 วัน (SEM) · 21 วัน (CNS/disseminated) · ดื่ม/ให้สารน้ำพอ ระวังไต'})},
 {id:'fluco',nm:'Fluconazole (รักษา)',re:/flucon|diflucan/i,u:'mg',f:c=>({ld:25,d:[12,12],q:c.ga<30?(c.pna<=14?48:24):(c.pna<=7?48:24),band:`GA ${c.ga<30?'≤29':'30–40'} wk · PNA ${c.ga<30?(c.pna<=14?'0–14':'>14'):(c.pna<=7?'0–7':'>7')} วัน`,note:'prophylaxis (ELBW) 3–6 mg/kg สัปดาห์ละ 2 ครั้ง'})},
 {id:'caffeine',nm:'Caffeine citrate',re:/caffein/i,u:'mg',f:c=>({ld:20,d:[5,10],q:24,band:'apnea of prematurity',note:'loading 20 mg/kg แล้ว maintenance เริ่ม 24 ชม.หลัง loading · ขนาดเป็น caffeine citrate (base = ครึ่งหนึ่ง)'})},
 {id:'aminoph',nm:'Aminophylline',re:/aminoph|theophyl/i,u:'mg',f:c=>({ld:8,d:[1.5,3],q:c.pna<=7?12:8,band:'apnea',note:'ติดตามระดับยา (5–15 mcg/ml) · HR >180 ให้ระวังพิษ'})},
 {id:'pheno',nm:'Phenobarbital',re:/phenobarb|gardenal/i,u:'mg',f:c=>({ld:20,d:[3,5],q:24,band:'neonatal seizure',note:'loading 20 mg/kg (เพิ่มทีละ 5–10 ได้ถึงรวม 40) · maintenance เริ่ม 12–24 ชม.หลัง loading'})},
 {id:'ibu',nm:'Ibuprofen (PDA)',re:/ibupro|pedcel/i,u:'mg',f:c=>({d:[5,10],q:24,band:'PDA 3 ครั้ง',note:'10 mg/kg → 5 mg/kg ที่ 24 และ 48 ชม. · งดถ้า UO <0.6 ml/kg/h, plt <50,000, มีเลือดออก/NEC · ระวังร่วม aminoglycoside'})},
 {id:'para',nm:'Paracetamol',re:/paracet|acetamin|tylenol|sara\b/i,u:'mg',f:c=>c.ind==='pda'?{d:[15,15],q:6,band:'PDA',note:'15 mg/kg q6h 3–7 วัน · ติดตาม LFT'}:{d:c.pma<33?[10,12]:[10,15],q:c.pma<33?8:c.pma<38?6:4,band:c.pma<33?'PMA 28–32 (สูงสุด 40 mg/kg/วัน)':c.pma<38?'PMA 33–37 (สูงสุด 60 mg/kg/วัน)':'PMA >37 (สูงสุด 90 mg/kg/วัน)',note:'ขนาดชนิดกิน (NeoFax) · IV ใช้ขนาดต่ำกว่า'}},
 {id:'vitk',nm:'Vitamin K1',re:/vit(amin)?\s*k|phytonad|konakion/i,u:'mg',f:c=>({fixed:c.bw>=1?'1 mg IM ครั้งเดียว':'0.3–0.5 mg/kg IM ครั้งเดียว',d:null,q:null,band:'แรกคลอด',note:''})},
];
const neoFind=t=>NEO.find(x=>x.re.test(t));
function neoParse(line){ const d=neoFind(line); if(!d) return null; const L=line.replace(/,/g,'');
  const m=L.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|units?|u|iu)\b/i), q=L.match(/q\s*(\d+)\s*(?:hr?s?|ชม|ชั่วโมง)?\b/i);
  let h=q?+q[1]:/\b(od|o\.d\.|daily|q\s*day)\b/i.test(L)?24:/\bbid\b/i.test(L)?12:/\btid\b/i.test(L)?8:/\bqid\b/i.test(L)?6:null;
  let v=m?+m[1]:null; if(m&&/mcg/i.test(m[2])) v=v/1000; return {d,line,v,h}; }
function neoRender(){ const out=$('neOut'); if(!out) return; const ga=+$('neGa').value, pna=+$('nePna').value, bw=+$('neBw').value, ind=$('neInd').value;
  if(!(ga>0)||!($('nePna').value!=='')||!(bw>0)){ out.innerHTML='<div class="empty">กรอก GA (สัปดาห์) · PNA (วัน) · น้ำหนักที่ใช้คำนวณ (kg)</div>'; return; }
  const pma=ga+pna/7, c={ga,pna,pma,ind,bw}, F=x=>fmtN(Math.round(x*100)/100);
  const doseTxt=(r,u)=>r.fixed?r.fixed:`${r.ld?`LD ${r.ld} ${u}/kg = <b>${F(r.ld*bw)}</b> ${u} → `:''}${r.d[0]===r.d[1]?r.d[0]:r.d[0]+'–'+r.d[1]} ${u}/kg = <b>${r.d[0]===r.d[1]?F(r.d[0]*bw):F(r.d[0]*bw)+'–'+F(r.d[1]*bw)}</b> ${u} q${r.q}h`;
  // ตรวจคำสั่งที่วาง
  const lines=($('nePaste').value||'').split(/\n/).map(s=>s.trim()).filter(Boolean), chk=[];
  lines.forEach(l=>{ const p=neoParse(l); if(!p) return; const r=p.d.f(c), u=p.d.u, it=[];
    if(r.fixed){ it.push(['info',`แนะนำ ${r.fixed}`]); chk.push([l,p.d.nm,it]); return; }
    if(p.v!=null){ const k=p.v/bw, lo=r.d[0]*0.9, hi=r.d[1]*1.1, isLd=r.ld&&Math.abs(k-r.ld)<=r.ld*0.15;
      if(isLd) it.push(['ok',`${F(k)} ${u}/kg = ขนาด loading (${r.ld} ${u}/kg)`]);
      else if(k<lo) it.push(['warn',`${F(k)} ${u}/kg ต่ำกว่าแนะนำ (${r.d[0]}${r.d[0]!==r.d[1]?'–'+r.d[1]:''} ${u}/kg)`]);
      else if(k>hi) it.push([k>r.d[1]*1.5?'flag':'warn',`${F(k)} ${u}/kg สูงกว่าแนะนำ (${r.d[0]}${r.d[0]!==r.d[1]?'–'+r.d[1]:''} ${u}/kg)`]);
      else it.push(['ok',`${F(k)} ${u}/kg อยู่ในช่วง`]); } else it.push(['warn','อ่านขนาดยาไม่ได้ — ระบุ mg/unit']);
    if(p.h!=null&&!isNaN(p.h)){ if(p.h<r.q) it.push([p.h<=r.q/2?'flag':'warn',`ให้ทุก ${p.h} ชม. ถี่กว่าแนะนำ (q${r.q}h · ${r.band})${p.d.id==='cefotaxime'&&p.h===6&&ind!=='men'?' — q6h เป็นขนาด meningitis: ยืนยันข้อบ่งใช้/เปลี่ยนข้อบ่งใช้ด้านบน':''}`]);
      else if(p.h>r.q) it.push(['warn',`ให้ทุก ${p.h} ชม. ห่างกว่าแนะนำ (q${r.q}h · ${r.band})`]); else it.push(['ok',`ช่วงห่าง q${p.h}h ตรงตาราง (${r.band})`]); } else it.push(['warn','อ่านช่วงห่างไม่ได้ — ระบุ q…h']);
    if(r.note) it.push(['info',r.note]); chk.push([l,p.d.nm,it]); });
  const unk=lines.filter(l=>!neoFind(l));
  const chkH=lines.length?`<h2>ตรวจคำสั่งที่วาง</h2>${chk.length?`<table class="ctbl"><thead><tr><th>คำสั่ง</th><th>ผลตรวจ (เทียบตาราง)</th></tr></thead><tbody>${chk.map(([l,nm,it])=>`<tr><td><b>${esc(nm)}</b><div class="hint">${esc(l)}</div></td><td><ul class="msgs" style="margin:0">${it.map(([lv,t])=>`<li><span class="tag ${lv}">${LVL_TXT[lv]}</span><span>${esc(t)}</span></li>`).join('')}</ul></td></tr>`).join('')}</tbody></table>`:''}${unk.length?`<p class="hint">ไม่มีในตารางทารก: ${unk.map(esc).join(' · ')}</p>`:''}`:'';
  const tbl=`<table class="ctbl"><thead><tr><th>ยา</th><th>ขนาด (น้ำหนัก ${F(bw)} kg)</th><th>กลุ่มตาราง</th><th>หมายเหตุ</th></tr></thead><tbody>${NEO.map(d=>{ const r=d.f(c); return `<tr><td><b>${d.nm}</b></td><td>${doseTxt(r,d.u)}</td><td class="hint">${esc(r.band)}</td><td class="hint">${esc(r.note||'')}</td></tr>`; }).join('')}</tbody></table>`;
  out.innerHTML=`<div class="band" style="margin-bottom:8px"><b>GA ${fmtN(ga)} wk · PNA ${pna} วัน · PMA ${fmtN(Math.round(pma*10)/10)} wk</b> · น้ำหนัก ${F(bw)} kg · ข้อบ่งใช้: ${$('neInd').selectedOptions[0].text}${pna>=28?' · <span style="color:#b45309">PNA ≥28 วัน — พ้นช่วง neonate แล้ว ตรวจกับขนาดยาเด็ก (infant) ด้วย</span>':''}</div>
   ${chkH}<h2>ตารางขนาดยาสำหรับทารกรายนี้</h2>${tbl}
   <p class="hint" style="margin-top:6px">ที่มา: NeoFax (ตารางช่วงห่างตาม PMA/PNA) · AAP Red Book 2024 (meningitis) · CDC STI Guidelines 2021 (congenital syphilis) — ใช้เป็นไกด์ไลน์ ยึดแนวทางกุมารแพทย์ รพ. · ทารกไตบกพร่อง/asphyxia/รับ cooling ให้ปรับช่วงห่างและเจาะระดับยา</p>`; }
function neoFromPt(){ const pt=getPt(); if(pt.pna!=null&&pt.pna<=120) $('nePna').value=pt.pna; if(+$('bw').value>0) $('neBw').value=$('bw').value; }
(function(){ if(!$('neOut')) return;
  $('neInd').innerHTML=[['sep','Sepsis / ทั่วไป'],['men','Meningitis'],['pda','PDA (paracetamol)']].map(([v,t])=>`<option value="${v}">${t}</option>`).join('');
  ['neGa','nePna','neBw','nePaste'].forEach(id=>$(id).addEventListener('input',neoRender)); $('neInd').addEventListener('change',neoRender);
  $('neFromPt').onclick=()=>{ neoFromPt(); neoRender(); };
  $('neFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('neMsg'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('nePaste').value=rows.map(r=>r.raw).join('\n'); neoRender(); };
  $('neEx').onclick=()=>{ $('neGa').value=36; $('nePna').value=9; $('neBw').value=2.79; $('nePaste').value='Cefotaxime 145 mg IV q 6 hr\nAmikin 33.5 mg + 5% DW up to 4 ml IV drip in 1 hr q 24 hr'; neoRender(); };
  $('neClr').onclick=()=>{ $('nePaste').value=''; neoRender(); };
  $('t-neo').addEventListener('click',()=>{ if(!$('nePna').value&&!$('neBw').value) neoFromPt(); neoRender(); });
  neoRender(); })();
