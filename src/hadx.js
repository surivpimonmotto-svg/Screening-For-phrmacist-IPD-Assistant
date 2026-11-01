/* ===== hadx.js — แท็บ HAD: Methylprednisolone inj (pulse / mg/kg → vial 40 mg · 1 g, การผสม, เทียบสเตียรอยด์) · rt-PA Alteplase (Actilyse 50 mg)
 ⚑ อ้างอิงทั่วไป: Solu-Medrol SPC · Actilyse SPC · AHA/ASA stroke 2019 · ACC/AHA STEMI · ESC PE — ยืนยันกับแนวทาง รพ.มค */
const MP_VIAL=[1000,40]; // mg ตามบัญชียา รพ.
const MP_REG=[{k:'p1000',nm:'Pulse 1,000 mg/วัน',mg:1000,f:1},{k:'p500',nm:'Pulse 500 mg/วัน',mg:500,f:1},{k:'ped',nm:'Pulse เด็ก 30 mg/kg/วัน (max 1 g)',mgkg:30,cap:1000,f:1},{k:'kg',nm:'ตาม mg/kg/วัน (ระบุ)',f:null},{k:'fix',nm:'ขนาดคงที่ต่อครั้ง (ระบุ)',f:null}];
function mpCalc(){ const out=$('mOut'); if(!out) return; const pt=getPt(), bw=+$('mBw').value||+pt.bw||0, R=MP_REG.find(x=>x.k===$('mReg').value), F=+$('mF').value||1, days=+$('mDays').value||0, inp=+$('mVal').value||0;
  if(!$('mBw').value&&pt.bw) $('mBw').value=pt.bw; $('mValW').hidden=!['kg','fix'].includes(R.k); $('mValL').textContent=R.k==='kg'?'mg/kg/วัน':'mg ต่อครั้ง'; $('mFW').hidden=!!R.f;
  let per=null, f=R.f||F, txt='';
  if(R.mg){ per=R.mg; txt=`${R.mg} mg วันละครั้ง`; }
  else if(R.mgkg){ if(!(bw>0)){ out.innerHTML='<div class="empty">ใส่น้ำหนัก</div>'; return; } per=Math.min(R.mgkg*bw,R.cap); txt=`30 mg/kg × ${fmtN(bw)} kg = ${fmtN(R.mgkg*bw)} mg${R.mgkg*bw>R.cap?` → cap ${R.cap} mg`:''}`; }
  else if(R.k==='kg'){ if(!(bw>0&&inp>0)){ out.innerHTML='<div class="empty">ใส่น้ำหนักและ mg/kg/วัน</div>'; return; } per=inp*bw/f; txt=`${fmtN(inp)} mg/kg/วัน × ${fmtN(bw)} kg = ${fmtN(inp*bw)} mg/วัน ÷ ${f} ครั้ง`; }
  else { if(!(inp>0)){ out.innerHTML='<div class="empty">ใส่ขนาด mg ต่อครั้ง</div>'; return; } per=inp; txt=`${fmtN(inp)} mg × ${f} ครั้ง/วัน`; }
  per=Math.round(per*10)/10; const day=per*f;
  // vial ต่อครั้ง: เหลือทิ้งน้อยสุด แล้วจำนวน vial น้อยสุด (vial ที่ผสมแล้วไม่เก็บข้ามครั้ง)
  // >240 mg ใช้ vial 1 g (ส่วนที่เหลือ ≤240 mg เติมด้วย 40 mg) · ≤240 mg ใช้ vial 40 mg
  let a=Math.floor(per/1000+1e-9), rem=per-a*1000; if(rem>240+1e-9){ a++; rem=0; } const b=Math.ceil(rem/40-1e-9), best={a,b,t:a*1000+b*40}; best.w=Math.round((best.t-per)*10)/10;
  const vTxt=c=>[c.a?`1 g × ${c.a}`:'',c.b?`40 mg × ${c.b}`:''].filter(Boolean).join(' + ');
  const n40=Math.ceil(per/40-1e-9), altTxt=best.a&&n40<=15&&n40*40-per<best.w?` · ทางเลือกเหลือทิ้งน้อยกว่า: 40 mg × ${n40} (ทิ้ง ${fmtN(Math.round((n40*40-per)*10)/10)} mg)`:'';
  const how=per>250?`ผสม NSS หรือ D5W <b>100–250 ml</b> ให้ทาง IV drip <b>อย่างน้อย 30–60 นาที</b> (ขนาดสูงให้เร็วกว่า 10 นาที เสี่ยงหัวใจเต้นผิดจังหวะ/หัวใจหยุดเต้น)`:per>125?'ผสม NSS/D5W 50–100 ml drip 15–30 นาที':'IV ช้า ๆ อย่างน้อย 3–5 นาที (หรือผสม 50 ml drip)';
  const eq=day; const L=[];
  if(day>=500) L.push(['warn','Pulse: ติดตามน้ำตาล · ความดัน · K · อาการติดเชื้อ · ให้ยาลดกรด/PPI ป้องกันแผลกระเพาะถ้ามีความเสี่ยง']);
  if(days>=14||(+$('mDays').value>=14)) L.push(['info','ใช้ ≥2–3 สัปดาห์: ต้องค่อย ๆ ลดขนาด (taper) · พิจารณาป้องกัน PCP/กระดูกพรุน']);
  if(pt.isPed&&R.k==='p1000') L.push(['warn','ผู้ป่วยเด็ก: ใช้ 30 mg/kg/วัน (max 1 g)']);
  out.innerHTML=`<h2>Methylprednisolone</h2><div class="big" style="font-size:2rem;font-weight:800">${fmtN(per)} mg <span style="font-size:1rem;font-weight:500">IV ${f>1?`q${24/f}h`:'วันละครั้ง'}${days?` × ${days} วัน`:''}</span></div>
   <dl class="kv"><dt>คำนวณ</dt><dd>${txt} → <b>${fmtN(per)} mg/ครั้ง · ${fmtN(day)} mg/วัน</b></dd>
   <dt>Vial ต่อครั้ง</dt><dd><b>${vTxt(best)}</b>${best.w?` · ทิ้ง ${fmtN(best.w)} mg`:''}${altTxt}</dd>
   ${days?`<dt>รวม ${days} วัน</dt><dd>${fmtN(day*days)} mg · ${[best.a?`1 g × ${best.a*f*days}`:'',best.b?`40 mg × ${best.b*f*days}`:''].filter(Boolean).join(' + ')}</dd>`:''}
   <dt>การผสม/ให้ยา</dt><dd>${how} · ละลาย vial ด้วยน้ำกลั่นที่มากับยา ใช้ภายใน 12–24 ชม.</dd>
   <dt>เทียบเท่า (ต่อวัน)</dt><dd>Prednisolone ${fmtN(Math.round(eq*1.25))} mg · Hydrocortisone ${fmtN(eq*5)} mg · Dexamethasone ${fmtN(Math.round(eq*0.1875*10)/10)} mg <span class="hint">(MP 4 = Pred 5 = HC 20 = Dexa 0.75 mg)</span></dd></dl>
   ${L.length?`<ul class="msgs">${L.map(([l,m])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`).join('')}</ul>`:''}
   <p class="hint" style="margin:6px 0 0">⚑ อ้างอิง Solu-Medrol SPC — ยืนยันกับแนวทาง รพ. · vial ในบัญชี: 40 mg · 1 g</p>`; }

/* rt-PA: Alteplase (Actilyse 50 mg/vial · ผสม SWI 50 ml = 1 mg/ml) */
const TPA_IND=[{k:'stroke',nm:'Acute ischemic stroke — 0.9 mg/kg (max 90 mg) · bolus 10% ใน 1 นาที + 90% ใน 60 นาที'},
 {k:'stroke6',nm:'Stroke low dose 0.6 mg/kg (max 60 mg) · bolus 15% + 85% ใน 60 นาที (ตามแพทย์สั่ง)'},
 {k:'stemi',nm:'STEMI — accelerated 90 นาที (15 mg bolus · 0.75 mg/kg/30 นาที · 0.5 mg/kg/60 นาที)'},
 {k:'pe',nm:'Pulmonary embolism — 100 mg ใน 2 ชม. (10 mg bolus + 90 mg ใน 2 ชม.)'}];
function tpaCalc(){ const out=$('tOut'); if(!out) return; const pt=getPt(), bw=+$('tBw').value||+pt.bw||0, k=$('tInd').value;
  if(!$('tBw').value&&pt.bw) $('tBw').value=pt.bw;
  if(!(bw>0)&&k!=='pe'){ out.innerHTML='<div class="empty">ใส่น้ำหนักจริง (kg) — ถ้าไม่ทราบให้ประเมิน/ชั่งก่อน</div>'; return; }
  const st=[]; let tot=0, rows='', notes=[];
  const r1=x=>Math.round(x*10)/10;
  if(k==='stroke'||k==='stroke6'){ const mk=k==='stroke'?0.9:0.6, cap=k==='stroke'?90:60, bp=k==='stroke'?0.1:0.15; tot=Math.min(mk*bw,cap);
    tot=r1(tot); const bo=r1(tot*bp); st.push(['Bolus IV push 1 นาที',bo,null],[`Infusion 60 นาที`,r1(tot-bo),60]);
    notes=['ก่อนให้: BP <185/110 mmHg · ระหว่างและหลังให้ 24 ชม. BP <180/105','ห้ามให้ antiplatelet/anticoagulant ภายใน 24 ชม. (ทำ CT ซ้ำก่อนเริ่ม)','ติดตาม neuro signs/BP: ทุก 15 นาที × 2 ชม. → ทุก 30 นาที × 6 ชม. → ทุก 1 ชม. × 16 ชม.','สงสัยเลือดออกในสมอง (ปวดหัวรุนแรง, ซึมลง, อาเจียน): หยุดยาทันที ส่ง CT'];
    if(mk*bw>cap) notes.unshift(`น้ำหนัก ${fmtN(bw)} kg × ${mk} = ${r1(mk*bw)} mg เกิน max → ใช้ ${cap} mg`); }
  else if(k==='stemi'){ const a=Math.min(0.75*bw,50), b=Math.min(0.5*bw,35); tot=15+a+b; st.push(['Bolus IV 1–2 นาที',15,null],['Infusion 30 นาที',a,30],['แล้ว infusion 60 นาที',b,60]);
    notes=[bw>67?'น้ำหนัก >67 kg: 15 + 50 + 35 = 100 mg':'น้ำหนัก ≤67 kg: คิดตาม mg/kg','ให้ร่วม aspirin + heparin ตามแนวทาง']; }
  else { tot=100; st.push(['Bolus IV 1–2 นาที',10,null],['Infusion 2 ชม.',90,120]); notes=['น้ำหนัก <65 kg: total ไม่เกิน 1.5 mg/kg','หยุด heparin ระหว่างให้ · เริ่มใหม่เมื่อ aPTT <2 เท่า']; }
  tot=r1(tot); const vial=Math.ceil(tot/50-1e-9), waste=r1(vial*50-tot);
  rows=st.map(([n,mg,min])=>`<tr><td>${n}</td><td><b>${fmtN(r1(mg))} mg = ${fmtN(r1(mg))} ml</b></td><td>${min?`<b>${fmtN(r1(mg*60/min))} ml/h</b> × ${min} นาที`:'push'}</td></tr>`).join('');
  out.innerHTML=`<h2>rt-PA (Alteplase)</h2><div class="big" style="font-size:2rem;font-weight:800">${fmtN(tot)} mg <span style="font-size:1rem;font-weight:500">${k==='pe'?'':`(${fmtN(bw)} kg)`}</span></div>
   <dl class="kv"><dt>เตรียมยา</dt><dd>Actilyse 50 mg × <b>${vial} vial</b> · ผสม SWI 50 ml/vial = <b>1 mg/ml</b> (หมุนเบา ๆ ห้ามเขย่า)${waste>0?` · <b style="color:#b91c1c">ดูดยาส่วนเกินทิ้ง ${fmtN(waste)} ml ก่อนให้</b> (กันได้เกินขนาด)`:''}</dd></dl>
   <table class="ctbl"><thead><tr><th>ขั้นตอน</th><th>ขนาด (1 mg/ml)</th><th>ตั้ง pump</th></tr></thead><tbody>${rows}</tbody></table>
   <ul class="msgs">${notes.map(m=>`<li><span class="tag info">${LVL_TXT.info}</span><span>${esc(m)}</span></li>`).join('')}<li><span class="tag info">${LVL_TXT.info}</span><span>หลังยาหมด ไล่สายด้วย NSS ที่ rate เดิมให้ยาค้างสายเข้าครบ</span></li></ul>
   <p class="hint" style="margin:6px 0 0">⚑ Actilyse SPC · AHA/ASA 2019 · ACC/AHA STEMI · ESC PE — ยืนยันกับแนวทาง stroke fast track / ใบสั่ง รพ.มค · ใช้น้ำหนักจริง</p>`; }
(function(){ if(!$('mOut')) return; $('mReg').innerHTML=MP_REG.map(x=>`<option value="${x.k}">${x.nm}</option>`).join(''); $('tInd').innerHTML=TPA_IND.map(x=>`<option value="${x.k}">${x.nm}</option>`).join('');
  ['mBw','mVal','mF','mDays'].forEach(id=>$(id).addEventListener('input',mpCalc)); ['mReg','mF'].forEach(id=>$(id).addEventListener('change',mpCalc));
  $('tBw').addEventListener('input',tpaCalc); $('tInd').addEventListener('change',tpaCalc);
  ['bw','ageIn'].forEach(id=>{ const el=$(id); if(el) el.addEventListener('input',()=>{mpCalc();tpaCalc();}); });
  mpCalc(); tpaCalc(); })();
