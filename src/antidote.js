/* ===== antidote.js — ยาต้านพิษที่ใช้บ่อยใน รพ.มค: Protamine · Naloxone · EPS (benztropine/diphenhydramine) · Leucovorin
 สรุปจาก academic in-service "Antidote use in MSKH" (รพ.มค) และ Micromedex/Lexicomp · กฎตรวจคำสั่งยาที่เกี่ยวข้อง */
function protCalc(){ const out=$('atOut'); if(!out) return; const ag=$('atAg').value, amt=+$('atAmt').value, h=+$('atHr').value, L=[];
  if(ag==='hep'){ if(!(amt>0)){ out.innerHTML='<div class="empty">ใส่ปริมาณ heparin (unit) — bolus ที่เพิ่งให้ หรือ drip = ปริมาณที่ให้ใน 2–3 ชม.ล่าสุด</div>'; return; }
    const b=!(h>0)||h<0.5?[1,1.5,'ทันที (<30 นาที)']:h<=1?[0.5,0.75,'30–60 นาที']:h<=2?[0.375,0.5,'1–2 ชม. (ระหว่างช่วงในตาราง)']:[0.25,0.375,'>2 ชม.'];
    const lo=amt/100*b[0], hi=amt/100*b[1]; L.push(`เวลาหลังให้ heparin ${b[2]}: protamine ${b[0]}–${b[1]} mg ต่อ heparin 100 unit → <b>${fmtN(r1(Math.min(lo,50)))}–${fmtN(r1(Math.min(hi,50)))} mg</b>${hi>50?' (จำกัด 50 mg/ครั้ง)':''}`);
    L.push('heparin drip: คิดจากปริมาณที่ให้ใน 2–3 ชม.ล่าสุด (half-life ~1–1.5 ชม.)'); }
  else { if(!(amt>0)){ out.innerHTML='<div class="empty">ใส่ขนาด enoxaparin เข็มล่าสุด (mg)</div>'; return; }
    if(h>12) L.push(`ผ่านมา ${h} ชม. (>12 ชม.): อาจไม่จำเป็นต้องให้ protamine — พิจารณาตามภาวะเลือดออก`);
    else { const k=!(h>0)||h<=8?1:0.5; L.push(`${!(h>0)||h<=8?'≤8 ชม.':'8–12 ชม.'}หลังฉีด: protamine ${k} mg ต่อ enoxaparin 1 mg → <b>${fmtN(r1(Math.min(amt*k,50)))} mg</b>${amt*k>50?' (จำกัด 50 mg/ครั้ง)':''}`); }
    L.push('ถ้า aPTT ยังยาวหลังให้ 2–4 ชม. หรือยังมีเลือดออก ให้ซ้ำ 0.5 mg ต่อ enoxaparin 1 mg · protamine แก้ฤทธิ์ anti-Xa ได้ ~60%'); }
  L.push('ให้ IV ช้า ๆ ≤5 mg/นาที (push 1–3 นาที หรือเจือจางใน NSS/D5W 100 ml) · max 50 mg/ครั้ง ซ้ำได้ทุก 10 นาที · ระวัง hypotension/anaphylaxis (แพ้ปลา, เคยได้ protamine insulin, หมันชาย)');
  out.innerHTML=`<ol style="margin:0;padding-left:20px">${L.map(x=>`<li style="margin:3px 0">${x}</li>`).join('')}</ol>`; }
const AT_REF=`<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">Naloxone · EPS · Leucovorin — ขนาดยาย่อ</summary><dl class="rxdl" style="margin-top:6px">
 <dt>Naloxone</dt><dd>opioid กดการหายใจ: เริ่ม 0.04 mg IV แล้ว titrate 0.4 → 2 → 4 → 8–10 mg (ถ้าถึง 10 mg ไม่ตอบสนอง ทบทวนสาเหตุอื่น) · ผู้ป่วยใช้ opioid ประจำ/มะเร็ง: 0.04–0.1 mg ทีละน้อย กันถอนยาและปวดกลับ · ให้ IV (IM ดูดซึมไม่แน่นอน) · <b>ถอดแผ่น fentanyl ออกก่อน</b> · opioid ออกฤทธิ์ยาว (methadone, MST, patch) ต้องให้ซ้ำ/drip เพราะ naloxone หมดฤทธิ์ 30–90 นาที</dd>
 <dt>EPS — Benztropine</dt><dd>ผู้ใหญ่ 1–2 mg IV/IM · เด็ก >3 ปี 0.02 mg/kg (max 1 mg) · ต่อด้วยยากิน 1–2 mg q12h 1–2 สัปดาห์ (max 6 mg/วัน)</dd>
 <dt>EPS — Diphenhydramine</dt><dd>ผู้ใหญ่ 50 mg IV/IM ซ้ำได้ (max 100 mg/ครั้ง) แล้วกิน 25–50 mg q4–6h 2–3 วัน (max 400 mg/วัน) · เด็ก 0.5–1 mg/kg IV/IM หรือ 12.5–25 mg q4–6h (max 300 mg/วัน)</dd>
 <dt>Leucovorin (folinic acid)</dt><dd>MTX toxicity/high-dose rescue: 15 mg (~10 mg/m²) q6h เริ่มภายใน 24 ชม.หลัง MTX จนระดับ MTX <0.05 µmol/L · ป้องกันโลหิตจางจาก trimethoprim/pyrimethamine: 5–15 mg วันละครั้ง · ใช้ร่วมสูตร 5-FU (ไม่ใช่ antidote)</dd>
 <dt>Metoclopramide IV ในเด็ก</dt><dd><6 ปี 0.1 mg/kg · 6–14 ปี 2.5–5 mg · ≥15 ปี 10 mg (ครั้งเดียว) — เด็กเกิด EPS ง่าย</dd></dl>
 <p class="hint">ที่มา: academic in-service Antidote use in MSKH (รพ.มค) · Micromedex/Lexicomp · คู่มือยาต้านพิษ DIS 2564</p></details>`;
// ---- กฎตรวจคำสั่งยา
const AT_APSY=/haloperidol|fluphenazin|perphenazin|trifluoperazin|chlorpromazin|risperid|zuclopenth|flupentix|olanzap|aripipra|quetiap|sulpirid|amisulpr/i, AT_HIPOT=/haloperidol|fluphenazin|perphenazin|trifluoperazin|zuclopenth|flupentix/i, AT_ANTIEPS=/trihexyphen|benzhexol|artane|benztrop|diphenhydr|benadryl/i;
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items) return r; const raw=row.raw||'', all=(rows||[]).map(x=>x.raw||'').join('\n'), add=(l,t)=>{ if(!r.items.some(i=>i.txt===t)) r.items.push({lvl:l,txt:t}); if(l==='warn'&&r.status!=='flag') r.status='warn'; };
  if(/metoclopramid|plasil/i.test(raw)){ const age=+pt.age; const m=raw.replace(/,/g,'').match(/(\d+(?:\.\d+)?)\s*mg/i), D=m?+m[1]:null, bw=+pt.bw;
    if(age>0&&age<15&&D!=null){ const lim=age<6?(bw>0?0.1*bw:null):5; if(lim!=null&&D>lim*1.1) add('warn',`Metoclopramide เด็ก ${age<6?'<6 ปี: 0.1 mg/kg = '+fmtN(r1(lim))+' mg':'6–14 ปี: 2.5–5 mg'} ต่อครั้ง — สั่ง ${fmtN(D)} mg สูงกว่าแนะนำ (เด็กเสี่ยง EPS สูง)`); }
    if(AT_APSY.test(all)) add('warn','Metoclopramide ร่วมกับยาต้านโรคจิต — เสริมฤทธิ์เกิด EPS/NMS · หลีกเลี่ยง พิจารณา domperidone/ondansetron'); }
  if(AT_HIPOT.test(raw)&&/\b(inj|iv|im)\b|ฉีด|decanoate/i.test(raw)&&!AT_ANTIEPS.test(all)) add('info','ยาต้านโรคจิต high-potency ชนิดฉีด — ไม่พบยาป้องกัน EPS (trihexyphenidyl/benztropine/diphenhydramine) ในคำสั่ง · เฝ้าระวังลิ้นแข็ง คอบิด ตาเหลือก');
  if(/naloxone/i.test(raw)&&/fentanyl.*(patch|durogesic|mcg\/h)|durogesic/i.test(all)) add('warn','ให้ naloxone ในผู้ป่วยที่ใช้ fentanyl patch — ถอดแผ่นแปะออกก่อน และเฝ้าระวังซ้ำ (ยายังซึมจากผิวหนังต่อ 12–24 ชม.)');
  if(/methotrexat|\bmtx\b/i.test(raw)){ const m=raw.replace(/,/g,'').match(/(\d+(?:\.\d+)?)\s*(mg|g)\b/i); const mg=m?(+m[1])*(/^g$/i.test(m[2])?1000:1):null;
    if(mg!=null&&mg>=500&&!/leucovorin|folinic|calcium folinate/i.test(all)) add('warn',`Methotrexate ${fmtN(mg)} mg (ขนาดสูง) — ไม่พบ leucovorin rescue ในคำสั่ง · ต้องให้ leucovorin 15 mg q6h เริ่มภายใน 24 ชม. + hydration/ปัสสาวะเป็นด่าง + ติดตามระดับ MTX`); }
 }catch(e){} return r; })(evaluate);
(function(){ if(!$('atOut')) return; $('atRef').innerHTML=AT_REF; ['atAmt','atHr'].forEach(id=>$(id).addEventListener('input',protCalc)); $('atAg').addEventListener('change',protCalc); protCalc(); })();
