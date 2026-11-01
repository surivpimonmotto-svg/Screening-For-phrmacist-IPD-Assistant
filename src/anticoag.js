/* ===== anticoag.js — แท็บ HAD: Enoxaparin (ขนาดตามน้ำหนัก/ไต → syringe 40/60 mg) · Heparin ปรับ rate ตาม aPTT (weight-based nomogram)
 ⚑ อ้างอิงทั่วไป: Enoxaparin SPC / CHEST · Raschke weight-based heparin nomogram (1993) — ยืนยันกับแนวทาง/ใบสั่ง รพ.มค */
const ENOX_SYR=[40,60]; // mg ต่อ syringe (100 mg/ml) ตามบัญชียา รพ. · ขนาดปัดเป็นทวีคูณ 10 mg ตามขีด syringe
const ENOX_IND=[
 {k:'tx12',nm:'รักษา VTE / ACS (NSTE) — 1 mg/kg q12h',mgkg:1,q:12},
 {k:'tx24',nm:'รักษา VTE — 1.5 mg/kg q24h',mgkg:1.5,q:24},
 {k:'stemi75',nm:'STEMI อายุ ≥75 ปี — 0.75 mg/kg q12h (ไม่ให้ IV bolus · max 75 mg/dose 2 dose แรก)',mgkg:0.75,q:12,cap:75},
 {k:'pro',nm:'ป้องกัน VTE — 40 mg q24h',fix:40,q:24}];
function enoxCalc(){ const out=$('eOut'); if(!out) return; const pt=getPt(), bw=+$('eBw').value||+pt.bw||0, ind=ENOX_IND.find(x=>x.k===$('eInd').value), cr=pt.crcl, dial=pt.dial;
  if(!$('eBw').value&&pt.bw) $('eBw').value=pt.bw;
  const L=[], li=(l,m)=>L.push(`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`);
  let dose=null, q=ind.q, why='';
  if(ind.fix){ dose=ind.fix; if(cr!=null&&cr<30&&!dial){ dose=30; why='CrCl <30 → 30 mg q24h (แนวทาง รพ.มค)'; } if(bw>0&&(+pt.ht>0)&&bw/((+pt.ht/100)**2)>=40) li('warn','BMI ≥40: พิจารณา 40 mg q12h'); }
  else { if(!(bw>0)){ out.innerHTML='<div class="empty">ใส่น้ำหนัก (kg)</div>'; return; } dose=ind.mgkg*bw;
    if(cr!=null&&cr<30&&!dial){ q=24; dose=1*bw; why=`CrCl ${fmtN(Math.round(cr))} (<30) → ปรับเป็น 1 mg/kg q24h = ${fmtN(Math.round(bw*10)/10)} mg`; }
    if(ind.cap&&dose>ind.cap){ dose=ind.cap; why=(why?why+' · ':'')+`cap ${ind.cap} mg สำหรับ 2 dose แรก`; }
    if(bw>150) li('warn','น้ำหนัก >150 kg: ข้อมูลจำกัด — พิจารณาตรวจ anti-Xa'); }
  if(dial) li('flag','HD/CAPD: หลีกเลี่ยง enoxaparin — พิจารณา UFH (heparin)');
  if(cr==null&&!dial) li('info','ไม่มี CrCl — กรอก Cr ในแผงผู้ป่วยเพื่อปรับตามไต');
  // เลือก syringe: ชุดที่เหลือทิ้งน้อยสุด (ปัดขนาดเป็นทวีคูณ 10 mg ตามขีด syringe)
  const D=Math.round(dose/10)*10||10; let best=null;
  for(let a=0;a<=4;a++) for(let b=0;b<=4;b++){ const t=a*ENOX_SYR[0]+b*ENOX_SYR[1]; if(t<D) continue; const c={a,b,t,w:t-D,n:a+b}; if(!best||c.w<best.w||(c.w===best.w&&c.n<best.n)) best=c; }
  const sy=[best.a?`40 mg × ${best.a}`:'',best.b?`60 mg × ${best.b}`:''].filter(Boolean).join(' + '), perDay=24/q;
  out.innerHTML=`<h2>Enoxaparin</h2><div class="big" style="font-size:2rem;font-weight:800">${fmtN(D)} mg <span style="font-size:1rem;font-weight:500">SC q${q}h</span></div>
   <dl class="kv"><dt>คำนวณ</dt><dd>${ind.fix?`${fmtN(ind.fix)} mg`:`${ind.mgkg} mg/kg × ${fmtN(bw)} kg = ${fmtN(Math.round(ind.mgkg*bw*10)/10)} mg`} → ปัดตามขีด syringe <b>${fmtN(D)} mg = ${fmtN(D/100)} ml</b>${why?`<br><span style="color:#b45309">${esc(why)}</span>`:''}</dd>
   <dt>ใช้ syringe ต่อครั้ง</dt><dd><b>${sy}</b>${best.w?` · ไล่ยาทิ้ง ${fmtN(best.w)} mg (${fmtN(best.w/100)} ml) ก่อนฉีด`:''}</dd>
   <dt>ต่อวัน</dt><dd>${perDay} ครั้ง = ${fmtN(D*perDay)} mg · syringe ${[best.a?`40 mg × ${best.a*perDay}`:'',best.b?`60 mg × ${best.b*perDay}`:''].filter(Boolean).join(' + ')}</dd></dl>
   ${L.length?`<ul class="msgs">${L.join('')}</ul>`:''}
   <p class="hint" style="margin:6px 0 0">ติดตาม CBC/platelet (HIT) · Cr · อาการเลือดออก · ห้ามฉีด IM · ⚑ อ้างอิงทั่วไป (SPC/CHEST) — ยืนยันกับแนวทาง รพ.</p>`; }

/* Heparin: ปรับตาม aPTT (Raschke weight-based nomogram) — ค่าเป็นเท่าของ control (ratio) หรือวินาที */
const HEP_NOMO=[[1.2,'bolus 80 unit/kg แล้วเพิ่ม 4 unit/kg/h',80,4,0],[1.5,'bolus 40 unit/kg แล้วเพิ่ม 2 unit/kg/h',40,2,0],[2.3,'คงเดิม (อยู่ในเป้า 1.5–2.3 เท่า)',0,0,0],[3,'ลด 2 unit/kg/h',0,-2,0],[Infinity,'หยุดยา 1 ชม. แล้วลด 3 unit/kg/h',0,-3,1]];
function hepNomo(){ const out=$('jOut'); if(!out) return; const bw=+$('jBw').value||+getPt().bw||0, a=+$('jAptt').value, c=+$('jCtl').value||30, cur=+$('jRate').value, conc=+$('jConc').value||100;
  if(!$('jBw').value&&getPt().bw) $('jBw').value=getPt().bw;
  if(!(a>0)||!(bw>0)||!(cur>=0)){ out.innerHTML='<div class="empty">กรอก น้ำหนัก · aPTT · rate ปัจจุบัน (ml/h)</div>'; return; }
  const r=a/c, row=HEP_NOMO.find(x=>r<x[0]), curU=cur*conc, newU=Math.max(0,curU+row[3]*bw), bol=Math.min(row[2]*bw,row[2]===80?10000:5000);
  out.innerHTML=`<h2>Heparin ปรับตาม aPTT</h2><div class="big" style="font-size:1.8rem;font-weight:800">${fmtN(Math.round(newU/conc*10)/10)} ml/h <span style="font-size:1rem;font-weight:500">(${fmtN(Math.round(newU))} unit/h)</span></div>
   <dl class="kv"><dt>aPTT</dt><dd>${fmtN(a)} วินาที = <b>${fmtN(Math.round(r*100)/100)} เท่า</b>ของ control ${fmtN(c)} วินาที</dd><dt>คำแนะนำ</dt><dd><b>${esc(row[1])}</b></dd>
   ${row[2]?`<dt>Bolus</dt><dd>${row[2]} × ${fmtN(bw)} = <b>${fmtN(Math.round(bol))} unit</b> = <b>${fmtN(Math.round(bol/5000*100)/100)} ml</b> จาก vial 25,000 unit/5 ml IV push</dd>`:''}
   ${row[4]?'<dt>หยุดยา</dt><dd>หยุด 1 ชม. แล้วเริ่ม rate ใหม่</dd>':''}
   <dt>Rate เดิม → ใหม่</dt><dd>${fmtN(cur)} ml/h (${fmtN(Math.round(curU))} unit/h = ${fmtN(Math.round(curU/bw*10)/10)} unit/kg/h) → <b>${fmtN(Math.round(newU/conc*10)/10)} ml/h</b> (${fmtN(Math.round(newU/bw*10)/10)} unit/kg/h)</dd>
   <dt>ตรวจ aPTT ครั้งถัดไป</dt><dd>${row[3]||row[2]?'6 ชม. หลังปรับ':'6 ชม. (ถ้าอยู่ในเป้า 2 ครั้งติด ตรวจวันละครั้ง)'}</dd></dl>
   ${newU>2000?'<ul class="msgs"><li><span class="tag warn">ทบทวน</span><span>เกิน 2,000 unit/h (เกณฑ์ HAD รพ.) — ยืนยันกับแพทย์</span></li></ul>':''}
   <p class="hint" style="margin:6px 0 0">⚑ Raschke weight-based nomogram (เป้า aPTT 1.5–2.3 เท่า) — ถ้า รพ. มี nomogram ของตัวเองให้ยึดตามนั้น · ติดตาม platelet (HIT)</p>`; }
(function(){ if(!$('eOut')) return; $('eInd').innerHTML=ENOX_IND.map(x=>`<option value="${x.k}">${x.nm}</option>`).join('');
  ['eBw'].forEach(id=>$(id).addEventListener('input',enoxCalc)); $('eInd').addEventListener('change',enoxCalc);
  ['jBw','jAptt','jCtl','jRate','jConc'].forEach(id=>$(id).addEventListener('input',hepNomo));
  ['scr','bw','ht','ageIn','mode'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',()=>{enoxCalc();hepNomo();}); el.addEventListener('change',()=>{enoxCalc();hepNomo();}); } });
  enoxCalc(); hepNomo(); })();
