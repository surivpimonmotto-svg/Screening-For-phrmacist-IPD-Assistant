/* ===== crrt.js — CRRT: ปริมาณน้ำยาต่อวัน · สูตรน้ำยา 25 สูตร (ใบสั่ง CRRT รพ.มหาสารคาม) · จำนวนยาที่ต้องเตรียม/จ่าย =====
 สูตรในตารางคิดต่อ 1,000 ml (ผลรวมทุกช่อง = 1,000 ml) — Final = Na (mEq/L) ของน้ำยาที่ผสมแล้ว
 Na: 7.5% NaHCO3 0.893 · 0.45% NaCl 0.077 · 0.9% NaCl 0.154 · 3% NaCl 0.513 mEq/ml
 ⚑ สูตร 20–25 อ่านจากภาพได้บางส่วน คำนวณย้อนจากค่า Final — ยืนยันกับใบสั่ง CRRT ฉบับจริง
*/
const CRRT_NA={b:0.893,h:0.077,n:0.154,s:0.513};
const CRRT_PH=['>7.46','7.36-7.45','7.21-7.35','7.00-7.20','<7.00'];
const CRRT_NAG=['110-120','121-130','131-150','151-160','161-170'];
// [bicarb 7.5%, 0.45%NaCl, 0.9%NaCl, 3%NaCl, SW, Final Na ในใบสั่ง, ยืนยันจากภาพ]
const CRRT_F=[
 [25,0,650,0,325,122.4,1],[50,0,500,0,450,121.6,1],[75,700,0,0,225,120.8,1],[100,0,200,0,700,120,1],[135,0,0,0,865,120.4,1],
 [25,0,700,0,275,130.1,1],[50,0,550,0,400,129.3,1],[75,0,400,0,525,128.5,1],[100,0,0,80,820,130.2,1],[150,0,0,0,850,133.8,1],
 [25,0,775,0,200,141.7,1],[50,900,0,50,0,139.6,1],[75,925,0,0,0,138.1,1],[100,0,0,100,800,140.5,1],[150,0,50,0,800,141.5,1],
 [25,0,850,0,125,153.2,1],[50,0,700,0,250,152.4,1],[75,0,550,0,375,151.6,1],[100,0,400,0,500,150.8,1],[150,0,100,0,750,149.2,0],
 [25,0,900,0,75,160.9,0],[50,300,600,0,50,160.1,0],[75,600,300,0,25,159.3,0],[100,800,50,0,50,158.5,0],[150,0,0,50,800,159.5,0]];
const crrtNa=f=>f[0]*CRRT_NA.b+f[1]*CRRT_NA.h+f[2]*CRRT_NA.n+f[3]*CRRT_NA.s;
function crrtPick(na,ph){ if(na==null||ph==null) return null; const g=na<=120?0:na<=130?1:na<=150?2:na<=160?3:4; const p=ph>=7.46?0:ph>=7.36?1:ph>=7.21?2:ph>=7.00?3:4; return g*5+p+1; }
const CRRT_STOCK={b:['7.5% NaHCO3',50,'amp'],h:['0.45% NaCl',1000,'ถุง'],n:['0.9% NaCl',1000,'ขวด'],s:['3% NaCl',500,'ขวด'],w:['SWI',1000,'ถุง'],k:['KCl (20 mEq/10 ml)',10,'amp']};
function crrtV(id){ const v=($(id)||{}).value; return v===''||v==null?null:+v; }
function renderCrrt(){ const out=$('cOut'); if(!out) return;
  const wt=crrtV('cWt'), dose=crrtV('cDose'), pre=crrtV('cPre')||0, post=crrtV('cPost')||0, qd=crrtV('cQd')||0, hrs=crrtV('cHr')||24, setL=crrtV('cSet')||1, kL=crrtV('cK')||0, fno=crrtV('cF');
  const flow=pre+post+qd, mode=$('cMode').value, na=crrtV('cNa'), ph=crrtV('cPh'), sug=crrtPick(na,ph);
  $('cSug').innerHTML=sug?`แนะนำตามตาราง: <b>สูตร ${sug}</b> (Na ${na} · pH ${ph})${fno&&fno!==sug?` — <span style="color:var(--warn)">ใบสั่งเลือกสูตร ${fno}</span>`:''}`:'<span class="hint">กรอก Na และ pH เพื่อดูสูตรที่ตรงตาราง</span>';
  const L=[], li=(l,m)=>L.push(`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`), kv=[];
  let totMl=null, src='';
  if(flow>0){ totMl=flow*hrs; src=`(Pre ${fmtN(pre)} + Post ${fmtN(post)} + Dialysate ${fmtN(qd)}) = ${fmtN(flow)} ml/hr × ${fmtN(hrs)} ชม.`; }
  else if(wt&&dose){ totMl=dose*wt*hrs; src=`${fmtN(dose)} ml/kg/hr × ${fmtN(wt)} kg × ${fmtN(hrs)} ชม.`; }
  if(wt&&dose){ kv.push(['CRRT dose ที่สั่ง',`${fmtN(dose)} ml/kg/hr × ${fmtN(wt)} kg = <b>${fmtN(dose*wt)}</b> ml/hr`]); }
  if(flow>0&&wt){ const del=flow/wt; kv.push(['Dose จากอัตราไหล',`${fmtN(flow)} ml/hr ÷ ${fmtN(wt)} kg = <b>${fmtN(Math.round(del*10)/10)}</b> ml/kg/hr`]);
    if(dose&&Math.abs(flow-dose*wt)/(dose*wt)>0.1) li('warn',`ผลรวมอัตราไหล ${fmtN(flow)} ml/hr ต่างจาก dose ที่สั่ง ${fmtN(dose*wt)} ml/hr เกิน 10% — ยืนยันกับแพทย์ (ใช้อัตราไหลคำนวณน้ำยา)`);
    if(pre>0&&flow) li('info',`Pre-dilution ${fmtN(Math.round(pre/flow*100))}% ของน้ำยาแทนที่ทั้งหมด — dose ที่ได้ผลจริงต่ำกว่าค่าที่คำนวณ (ทั่วไปตั้งเป้าสั่ง 25–30 ml/kg/hr เพื่อให้ได้จริง ≥20–25)`); }
  if(mode==='SCUF') li('info','SCUF: ไม่มี replacement/dialysate — ไม่ต้องเตรียมน้ำยา');
  if(totMl){ kv.push(['น้ำยาที่ใช้ต่อ '+fmtN(hrs)+' ชม.',`${src} = <b>${fmtN(totMl)}</b> ml ≈ <b>${fmtN(Math.round(totMl/100)/10)}</b> ลิตร`]); }
  let tbl='';
  if(fno>=1&&fno<=25&&totMl){ const f=CRRT_F[fno-1], nSet=Math.ceil(totMl/(setL*1000)-1e-9), sc=setL, Na=crrtNa(f), HCO3=f[0]*CRRT_NA.b;
    kv.push(['จำนวนชุดน้ำยา',`${fmtN(totMl)} ml ÷ ${fmtN(setL*1000)} ml/ชุด = <b>${nSet}</b> ชุด`]);
    const cols=[['b',f[0]],['h',f[1]],['n',f[2]],['s',f[3]],['w',f[4]]]; const kml=kL*setL*0.5; // KCl 20 mEq/10 ml = 2 mEq/ml
    const rows=cols.filter(c=>c[1]>0).map(([k,ml])=>{ const per=ml*sc, day=per*nSet, st=CRRT_STOCK[k]; return {k,name:st[0],per,day,cnt:Math.ceil(day/st[1]-1e-9),unit:st[2],size:st[1]}; });
    if(kL>0){ const day=kml*nSet; rows.push({k:'k',name:`KCl ${fmtN(kL)} mEq/L`,per:kml,day,cnt:Math.ceil(day/10-1e-9),unit:'amp',size:10,meq:kL*setL*nSet}); }
    tbl=`<h2 style="margin-top:14px">สูตร ${fno} — Serum Na ${CRRT_NAG[Math.floor((fno-1)/5)]} · pH ${CRRT_PH[(fno-1)%5]}</h2>
     <table class="ctbl" style="width:100%;text-align:right"><thead><tr><th style="text-align:left">ส่วนประกอบ</th><th>ต่อ 1 ลิตร (ตาราง)</th><th>ต่อชุด ${fmtN(setL)} ลิตร</th><th>รวม ${nSet} ชุด</th><th>ต้องเตรียม</th></tr></thead><tbody>
     ${rows.map(r=>`<tr><td style="text-align:left">${esc(r.name)}</td><td>${fmtN(r.k==='k'?kL*0.5:r.per/sc)} ml</td><td>${fmtN(r.per)} ml</td><td>${fmtN(r.day)} ml${r.meq?` (${fmtN(r.meq)} mEq)`:''}</td><td><b>${r.cnt}</b> ${r.unit} <span class="hint">(${r.size} ml)</span></td></tr>`).join('')}
     </tbody></table>
     <dl class="kv" style="margin-top:8px"><dt>Na ในน้ำยา</dt><dd>${Na.toFixed(1)} mEq/L (ใบสั่ง ${f[5]})</dd><dt>HCO3 ในน้ำยา</dt><dd>${HCO3.toFixed(1)} mEq/L</dd>${kL?`<dt>K ในน้ำยา</dt><dd>${fmtN(kL)} mEq/L</dd>`:''}</dl>`;
    if(!f[6]) li('warn',`สูตร ${fno} อ่านจากภาพใบสั่งได้ไม่ครบ คำนวณย้อนจากค่า Final Na — ตรวจสัดส่วนกับใบสั่ง CRRT ฉบับจริง`);
    if(Math.abs(Na-f[5])>1) li('warn',`Na ที่คำนวณ ${Na.toFixed(1)} ต่างจากค่าในใบสั่ง ${f[5]} — ตรวจสูตร`);
    if(setL!==1) li('info',`ตารางเป็นสูตรต่อ 1,000 ml — ชุด ${fmtN(setL)} ลิตร ต้องใช้ทุกส่วนประกอบ × ${fmtN(setL)} (ถ้าใช้ปริมาณต่อ 1 ลิตรกับถุง ${fmtN(setL)} ลิตร ความเข้มข้น Na/HCO3 จะผิด)`);
    li('info','จำนวนที่ต้องเตรียมคิดจากปริมาณรวมทั้งวัน (ใช้ขวด/ถุงที่เปิดแล้วต่อกับชุดถัดไป) — ถ้าเปิดใหม่ทุกชุด ให้คิดต่อชุดแล้วคูณจำนวนชุด');
    if(sug&&sug!==fno) li('warn',`ค่า Na ${na} / pH ${ph} ตรงกับสูตร ${sug} แต่ใบสั่งเลือกสูตร ${fno}`); }
  else if(totMl) li('info','เลือกสูตรน้ำยา (1–25) เพื่อคำนวณส่วนประกอบ');
  { const ca=crrtV('cCa'), mg=crrtV('cMg'); const ex=[];
    if(ca){ const d=ca*hrs; ex.push(`10% Calcium gluconate ${fmtN(ca)} ml/hr × ${fmtN(hrs)} = ${fmtN(d)} ml = <b>${Math.ceil(d/10-1e-9)}</b> amp (10 ml)`); }
    if(mg){ ex.push(`50% MgSO4 ${fmtN(mg)} ml/วัน = <b>${Math.ceil(mg/2-1e-9)}</b> amp (1 g/2 ml) = ${fmtN(mg*0.5)} g`); }
    if(ex.length) tbl+=`<h2 style="margin-top:14px">ยาอื่นในใบสั่ง</h2><ul style="margin:0;padding-left:18px">${ex.map(x=>`<li>${x}</li>`).join('')}</ul>`; }
  if(!totMl){ out.innerHTML='<div class="empty">กรอกน้ำหนัก + CRRT dose หรือ อัตราไหล (pre/post/dialysate)</div>'; return; }
  out.innerHTML=`<h2>ผลคำนวณ</h2><dl class="kv" style="margin-bottom:10px">${kv.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><ul class="msgs">${L.join('')}</ul>${tbl}`; }
(function(){ if(!$('cOut')) return;
  $('cFt').innerHTML=`<table class="ctbl" style="width:100%;text-align:center;font-size:13px"><thead><tr><th>สูตร</th><th>Serum Na</th><th>pH</th><th>7.5% NaHCO3</th><th>0.45% NaCl</th><th>0.9% NaCl</th><th>3% NaCl</th><th>SW</th><th>Final Na</th></tr></thead><tbody>${CRRT_F.map((f,i)=>`<tr data-cf="${i+1}" style="cursor:pointer"><td><b>${i+1}</b>${f[6]?'':' ⚑'}</td>${i%5===0?`<td rowspan="5">${CRRT_NAG[i/5]}</td>`:''}<td>${CRRT_PH[i%5]}</td>${f.slice(0,5).map(v=>`<td>${v||'0'}</td>`).join('')}<td>${f[5]}</td></tr>`).join('')}</tbody></table><p class="hint" style="margin:4px 0 0">คลิกแถวเพื่อเลือกสูตร · ทุกสูตรรวม 1,000 ml · ⚑ = อ่านจากภาพได้ไม่ครบ คำนวณย้อนจาก Final Na — ยืนยันกับใบสั่งจริง</p>`;
  $('cFt').querySelectorAll('[data-cf]').forEach(r=>r.onclick=()=>{ $('cF').value=r.dataset.cf; renderCrrt(); });
  ['cWt','cDose','cPre','cPost','cQd','cHr','cSet','cK','cF','cNa','cPh','cCa','cMg','cMode'].forEach(id=>{ $(id).addEventListener('input',renderCrrt); $(id).addEventListener('change',renderCrrt); });
  $('t-crrt').addEventListener('click',()=>{ const pt=getPt(); if(!$('cWt').value&&pt.bw) $('cWt').value=pt.ibw?Math.round(pt.ibw):pt.bw; const ln=$('L_na'), lp=$('L_ph'); if(!$('cNa').value&&ln&&ln.value) $('cNa').value=ln.value; if(!$('cPh').value&&lp&&lp.value) $('cPh').value=lp.value; renderCrrt(); });
  renderCrrt(); })();
