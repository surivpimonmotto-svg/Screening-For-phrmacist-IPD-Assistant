/* ===== pedx.js — ยาเด็กผู้ป่วยใน: ใช้ "ตารางขนาดยาที่ใช้บ่อยในเด็ก รพ.มค 2568" (งานวิชาการเภสัชสนเทศ) แทนการตรวจตาม CrCl
 · ไม่มีอายุ แต่เป็นยาน้ำ/ระบุ mg/kg (เช่น "8 mg mkd") → ตรวจแบบเด็ก
 · แสดงขั้นตอนคำนวณ ① น้ำหนัก ② ขนาดตามตาราง ③ ขนาดที่ควรได้ ④ ขนาดที่สั่ง ⑤ เทียบ ⑥ ตารางน้ำหนัก รพ. ⑦ ปริมาตร
 · ตรวจ mg/kg/day ที่แพทย์เขียนในคำสั่ง เทียบกับขนาดที่สั่งจริง
 · Budesonide nebule (Pulmicort respules) */
// ตารางน้ำหนัก (kg) → ปริมาณต่อครั้ง ตามตารางยาเด็ก รพ. 2568 (คอลัมน์ 5 8 10 13 15 18 20 25 kg)
const PED_TBL={
 cefixime:[{lab:'Cefixime 100 mg/5 ml · 8 mg/kg/day q12h',u:'ml',v:[1,2,2,3,3,4,4,5]}],
 augpo:[{lab:'Amox-clav 457 mg/5 ml · Sinusitis 45 mg/kg/day q12h',u:'ช้อนชา',v:['¼','½','½','¾','¾','1','1','1½'],re:/sinus/i},
        {lab:'Amox-clav 457 mg/5 ml · Otitis media 90 mg/kg/day q12h',u:'ช้อนชา',v:['½','1','1','1½','1¾','2','2¼','2¾'],re:/otitis|\baom\b|หูน้ำหนวก|หูชั้นกลาง/i}],
 amoxi:[{lab:'Amoxicillin 250 mg/5 ml · 20-40 mg/kg/day q8h',u:'ช้อนชา',v:['¼','½','½','¾','1','1','1¼','1½']},{lab:'Amoxicillin 250 mg/5 ml · AOM 80-90 mg/kg/day q12h',u:'ช้อนชา',v:['1','1¼','1½','2','2½','2¾','3¼','4'],re:/otitis|\baom\b/i}]};
const PED_W=[5,8,10,13,15,18,20,25];
// เติมกฎเด็กที่ยังไม่มีในฐาน (ตามตาราง รพ. 2568)
(function(){ const k=KB.find(x=>x.id==='cefixime'); if(k&&!k.peds) k.peds={type:'day',kg:[8,8],kgHi:10,max:400,note:'8 mg/kg/day แบ่ง q12h (หรือ q24h) · max 400 mg/วัน',src:'ตารางขนาดยาที่ใช้บ่อยในเด็ก รพ.มค 2568'}; })();
const PED_FORM=/\b(syr|syrup|susp|suspension|drops?|elixir|dry\s*syr)\b|ยาน้ำ|\/\s*5\s*ml/i, PED_MKD=/(\d+(?:\.\d+)?)\s*(?:mg)?\s*(?:\/\s*kg\s*\/\s*(?:d(?:ay)?|วัน)|mkd\b|mg\s*\/\s*kg\s*\/\s*วัน)/i;
function pedTblRow(id,bw,raw){ const T=PED_TBL[id]; if(!T||!(bw>0)) return []; const hit=T.find(x=>x.re&&x.re.test(raw)), L=hit?[hit]:T.filter(x=>!x.re).length?T.filter(x=>!x.re):T;
  let i=PED_W.findIndex(w=>bw<=w); if(i<0) i=PED_W.length-1; const lo=i>0&&bw<PED_W[i]?i-1:i;
  return L.map(t=>({t,col:PED_W[i],v:t.v[i],near:bw!==PED_W[i]?`(น้ำหนัก ${fmtN(bw)} kg อยู่ระหว่างคอลัมน์ ${PED_W[lo]}–${PED_W[i]} kg — ใช้คอลัมน์ ${PED_W[i]} kg)`:''})); }
evaluate=(orig=>function(row,pt,rows){
  const raw=row.raw||'', noAge=pt.age==null||pt.age===''||isNaN(+pt.age)||(+pt.age===0&&!pt.ageUnk);
  const guess=!pt.isPed&&noAge&&(PED_FORM.test(raw)||PED_MKD.test(raw))&&!(+pt.bw>=40);
  const P=guess?{...pt,isPed:true,pedGuess:true}:pt;
  const r=orig(row,P,rows); try{ if(!r||!r.items) return r;
  const add=(l,t,top)=>{ if(r.items.some(i=>i.txt===t)) return; const it={lvl:l,txt:t}; top?r.items.unshift(it):r.items.push(it); if(l==='warn'&&r.status==='ok') r.status='warn'; if(l==='flag') r.status='flag'; };
  const d=r.drug, bw=+(P.dw||P.bw);
  // ---- Budesonide nebule
  if(/budeson|pulmicort/i.test(raw+' '+((masterOf(row)||[])[1]||''))&&/respul|nebul|พ่น|neb/i.test(raw)){
    const mcg=(raw.match(/(\d+(?:\.\d+)?)\s*mcg\s*\/\s*2\s*ml/i)||[])[1]||(raw.match(/(\d+(?:\.\d+)?)\s*mcg/i)||[])[1], n=+((raw.match(/(\d+(?:\.\d+)?)\s*(?:nebule|neb|respule|amp|หลอด)/i)||[])[1]||1), F=row.F||null;
    if(mcg&&F){ const per=+mcg*n/1000, day=per*F, ped=P.isPed, unk=noAge&&!P.isPed, lim=ped||unk?1:4;
      r.items=r.items.filter(i=>!/ยังไม่มีกฎในฐาน/.test(i.txt)); if(r.status==='none') r.status='ok';
      add(day>lim*1.05?'warn':'ok',`Budesonide nebule ${fmtN(per)} mg/ครั้ง × ${fmtN(F)} = ${fmtN(day)} mg/วัน — ${unk?'ไม่มีอายุ: เด็ก ≤1 mg/วัน · ผู้ใหญ่ ≤4 mg/วัน (maintenance)':ped?'เด็ก maintenance 0.25–1 mg/วัน (แบ่ง 1–2 ครั้ง · สูงสุด 1 mg/วันตามเอกสารกำกับยา)':'ผู้ใหญ่ 1–2 mg วันละ 2 ครั้ง (สูงสุด 4 mg/วัน)'}${day>lim*1.05?' · เกินขนาด maintenance — ใช้ได้ระยะสั้นใน acute exacerbation/croup ตามแพทย์':''}`);
      if(F>2) add('info',`พ่น ${freqLabel(F)}: ICS แบบพ่นปกติวันละ 1–2 ครั้ง · ความถี่สูงใช้ระยะสั้นในหอบกำเริบ — ยืนยันระยะเวลากับแพทย์ · บ้วนปาก/เช็ดหน้าหลังพ่น (เชื้อราในปาก)`);
      if(ped||unk) add('info','เด็ก — Croup: budesonide neb 2 mg ครั้งเดียว (หรือ dexamethasone 0.15–0.6 mg/kg PO/IM ครั้งเดียว)'); } }
  if(!P.isPed||!d) return r;
  // ---- mg/kg/day ที่เขียนในคำสั่ง เทียบขนาดที่สั่งจริง
  const mk=raw.match(PED_MKD);
  if(mk&&r.T!=null&&bw>0){ const w=+mk[1], want=w*bw, got=r.T, ratio=got/want, u=(d.unit||'mg').replace(/^mg.*/,'mg');
    if(Math.abs(ratio-1)>0.15){ const form=d.forms&&row.formIdx>=0?d.forms[row.formIdx]:null, mlPer=form&&form[3]==='ml'?form[2]:null, F=row.F||1;
      const asMl=mlPer&&r.D!=null?r.D*mlPer:null;
      add('flag',`คำสั่งเขียน ${w} mg/kg/วัน แต่ขนาดที่สั่ง ${fmtN(r.D)} ${u} × ${fmtN(F)} = ${fmtN(got)} ${u}/วัน (= ${fmtN(Math.round(got/bw*100)/100)} mg/kg/วัน) ไม่ตรงกัน — BW ${fmtN(bw)} kg ควรได้ ${fmtN(Math.round(want))} ${u}/วัน = ${fmtN(Math.round(want/F*10)/10)} ${u}/ครั้ง${mlPer?` (${fmtN(Math.round(want/F/mlPer*10)/10)} ml)`:''}${asMl&&Math.abs(asMl*F/want-1)<0.2?` · ถ้าตั้งใจเขียน ${fmtN(r.D)} ml (= ${fmtN(asMl)} ${u}) จะใกล้เคียง`:''} — ยืนยันกับแพทย์`); }
    else add('ok',`ขนาดที่สั่งตรงกับ ${w} mg/kg/วัน ที่เขียนในคำสั่ง`); }
  else if(mk&&!(bw>0)) add('warn',`คำสั่งเขียน ${mk[1]} mg/kg/วัน — ใส่น้ำหนักเพื่อตรวจว่าขนาดที่สั่งตรงหรือไม่`);
  // ---- ขั้นตอนคำนวณ (ยาที่มีกฎเด็ก)
  if(d.peds&&d.peds.kg&&r.D!=null&&row.F&&bw>0){ const p=d.peds, F=row.F, u=(d.unit||'mg').replace(/^mg.*/,'mg'), lab=p.type==='dose'?'mg/kg/ครั้ง':'mg/kg/วัน';
    const [a,b]=p.kg, perKg=p.type==='dose'?r.D/bw:r.D*F/bw, dayLo=p.type==='dose'?a*bw*F:a*bw, dayHi=p.type==='dose'?b*bw*F:b*bw;
    const form=d.forms&&row.formIdx>=0?d.forms[row.formIdx]:null, mlPer=form&&form[3]==='ml'?form[2]:null, rg=(x,y)=>x===y?fmtN(x):`${fmtN(x)}–${fmtN(y)}`;
    const st=perKg>(p.kgHi||b)*1.1?'สูงเกินขนาดสูงสุด':perKg>b*1.1?'สูงกว่าช่วงปกติ':perKg<a*0.9?'ต่ำกว่าช่วงปกติ':'อยู่ในช่วง';
    const tb=pedTblRow(d.id,bw,raw);
    const S=[`ขั้นตอนคำนวณ (${p.src||SRC_PED})`,
     `① น้ำหนัก ${fmtN(bw)} kg${P.dw&&+P.dw!==+P.bw?' (น้ำหนักที่ใช้คำนวณ)':''}`,
     `② ขนาดตามตาราง: ${rg(a,b)} ${lab}${p.note?' — '+p.note:''}`,
     `③ ควรได้: ${rg(a,b)} × ${fmtN(bw)} = ${rg(Math.round(dayLo*10)/10,Math.round(dayHi*10)/10)} ${u}/วัน → ÷ ${fmtN(F)} ครั้ง = ${rg(Math.round(dayLo/F*10)/10,Math.round(dayHi/F*10)/10)} ${u}/ครั้ง${mlPer?` (${rg(Math.round(dayLo/F/mlPer*10)/10,Math.round(dayHi/F/mlPer*10)/10)} ml/ครั้ง)`:''}`,
     `④ สั่ง: ${fmtN(r.D)} ${u} × ${fmtN(F)} ครั้ง = ${fmtN(r.T)} ${u}/วัน ÷ ${fmtN(bw)} kg = ${fmtN(Math.round(perKg*100)/100)} ${lab}`,
     `⑤ ผล: ${st} (${rg(a,b)} ${lab})${p.max?` · สูงสุด ${fmtN(p.max)} ${u}/วัน`:''}`];
    tb.forEach((x,j)=>S.push(`${j?'   ':'⑥ '}ตารางน้ำหนัก รพ. (${x.t.lab}): ${x.col} kg → ${x.v} ${x.t.u}/ครั้ง ${j?'':x.near}`.trimEnd()));
    if(mlPer) S.push(`${tb.length?'⑦':'⑥'} ปริมาตรที่สั่ง: ${fmtN(r.D)} ${u} ÷ ${fmtN(mlPer)} ${u}/ml = ${fmtN(Math.round(r.D/mlPer*100)/100)} ml/ครั้ง`);
    add('info',S.join('\n'),true); }
  if(guess){ r.items=r.items.filter(i=>!/ไม่มี CrCl|ไม่มี eGFR/.test(i.txt)); add('info','ไม่มีอายุผู้ป่วย — คำสั่งเป็นยาน้ำ/ระบุ mg/kg จึงตรวจแบบผู้ป่วยเด็กตามตารางยาเด็ก รพ. (ไม่ใช้ CrCl) · กรอกอายุเพื่อยืนยัน',true); }
 }catch(e){ console.warn(e); } return r; })(evaluate);
