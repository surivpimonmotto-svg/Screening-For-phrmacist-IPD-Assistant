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
// ---- ยาที่ขนาดเด็กเป็น "ช่วงน้ำหนัก" (fixed dose ต่อช่วง) — Oseltamivir (Tamiflu)
const PED_BAND={oseltamivir:{bands:[[15,30],[23,45],[40,60],[999,75]],labs:['≤15 kg','>15–23 kg','>23–40 kg','>40 kg'],tx:'วันละ 2 ครั้ง (q12h) นาน 5 วัน',px:'ป้องกัน (post-exposure): ขนาดเดียวกัน วันละครั้ง นาน 7–10 วัน',
  infant:m=>m<9?3:3.5, infNote:'อายุ <1 ปี: 3 mg/kg/ครั้ง (9–11 เดือน 3.5 mg/kg) วันละ 2 ครั้ง · ป้องกันใน <3 เดือนไม่แนะนำ ยกเว้นสถานการณ์วิกฤต',
  extra:'เริ่มเร็วที่สุดภายใน 48 ชม.หลังมีอาการ (ผู้ป่วยใน/อาการรุนแรง/กลุ่มเสี่ยงให้ได้แม้เกิน 48 ชม.) · กินพร้อมอาหารลดคลื่นไส้ · เฝ้าระวังอาการทางจิตประสาท (สับสน เพ้อ) ในเด็ก',
  src:'CDC/AAP influenza antiviral 2024–25 · Tamiflu PI · กรมการแพทย์: คำแนะนำการใช้ยารักษาไข้หวัดใหญ่'}};
function pedAgeM(){ const v=+$('ageIn').value, u=$('ageU')?$('ageU').value:'y'; if(!(v>0)) return null; return u==='m'?v:u==='d'?v/30:v*12; }
function pedBand(id,bw){ const B=PED_BAND[id]; if(!B||!(bw>0)) return null; const am=pedAgeM();
  if(am!=null&&am<12){ const k=B.infant(am), mg=Math.round(k*bw*10)/10; return {mg,lab:`อายุ ${fmtN(Math.round(am*10)/10)} เดือน: ${k} mg/kg × ${fmtN(bw)} kg`,inf:true,B}; }
  const i=B.bands.findIndex(b=>bw<=b[0]); return {mg:B.bands[i][1],lab:`น้ำหนัก ${B.labs[i]}`,B}; }
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items||!r.drug||!PED_BAND[r.drug.id]) return r;
  const id=r.drug.id, bw=+(pt.dw||pt.bw), am=pedAgeM(), ped=pt.isPed||(am!=null&&am<13*12)||(bw>0&&bw<40&&!(+pt.age>=13));
  if(!ped) return r; const add=(l,t,top)=>{ if(r.items.some(i=>i.txt===t)) return; const it={lvl:l,txt:t}; top?r.items.unshift(it):r.items.push(it); if(l==='warn'&&(r.status==='ok'||r.status==='none')) r.status='warn'; if(l==='flag') r.status='flag'; };
  r.items=r.items.filter(i=>!/ยังไม่มีขนาดเด็ก|ไม่มีข้อมูลขนาดยาเด็ก|ผู้ป่วยเด็ก: (ยังไม่มีกฎ|ไม่มีกฎ)/.test(i.txt));
  if(!(bw>0)){ add('warn','Oseltamivir เด็ก: ขนาดตามช่วงน้ำหนัก — ใส่น้ำหนัก'); return r; }
  const b=pedBand(id,bw), form=r.drug.forms&&row.formIdx>=0?r.drug.forms[row.formIdx]:null, mlPer=form&&form[3]==='ml'?form[2]:15, F=row.F||null, D=r.D;
  const okD=D!=null&&Math.abs(D-b.mg)/b.mg<=0.1, pxLike=F===1;
  const S=[`ขั้นตอนคำนวณ (${b.B.src})`,`① น้ำหนัก ${fmtN(bw)} kg${am!=null?` · อายุ ${am<24?fmtN(Math.round(am*10)/10)+' เดือน':fmtN(Math.round(am/12*10)/10)+' ปี'}`:''}`,
   `② ตาราง: ${b.lab} → ${fmtN(b.mg)} mg/ครั้ง ${b.B.tx}`+(b.inf?'':` (≤15 kg 30 · 15–23 kg 45 · 23–40 kg 60 · >40 kg 75 mg)`),
   `③ Syrup ${mlPer} mg/ml → ${fmtN(Math.round(b.mg/mlPer*100)/100)} ml/ครั้ง`,
   D!=null?`④ สั่ง: ${fmtN(D)} mg × ${F?fmtN(F):'?'} ครั้ง/วัน → ${okD?'ขนาดต่อครั้งตรงตามตาราง':`ไม่ตรง (ควรเป็น ${fmtN(b.mg)} mg)`}${F===2?' · BID = ขนาดรักษา':F===1?' · OD = ขนาดป้องกัน':''}`:'④ อ่านขนาดที่สั่งไม่ได้',
   `⑤ ปริมาณรวม (รักษา 5 วัน): ${fmtN(Math.round(b.mg/mlPer*100)/100)} ml × 2 × 5 = ${fmtN(Math.round(b.mg/mlPer*10*100)/100)} ml${mlPer===15?` → ${Math.ceil(b.mg/mlPer*10/40-1e-9)} ขวด (40 ml)`:''}`];
  add('info',S.join('\n'),true);
  if(D!=null&&!okD) add(D>b.mg*1.1?'flag':'warn',`Oseltamivir เด็ก ${b.lab}: ควรได้ ${fmtN(b.mg)} mg/ครั้ง (${fmtN(Math.round(b.mg/mlPer*100)/100)} ml ของ ${mlPer} mg/ml) — สั่ง ${fmtN(D)} mg`);
  else if(okD){ if(r.status==='none') r.status='ok'; } if(okD) add('ok',`Oseltamivir เด็ก: ${fmtN(D)} mg/ครั้ง ตรงตาม${b.lab}`);
  if(F&&F>2) add('warn',`ความถี่ ${freqLabel(F)} — oseltamivir ให้ BID (รักษา) หรือ OD (ป้องกัน)`);
  if(pxLike) add('info',b.B.px); if(b.inf){ add('info',b.B.infNote); add('info','อ้างอิงเสริม (รพ.ควนเนียง/คู่มือการใช้ยาในเด็ก จุฬาฯ): อายุ <3 เดือน 12 mg · 3–5 เดือน 20 mg · 6–11 เดือน 25 mg ต่อครั้ง วันละ 2 ครั้ง'); } add('info',b.B.extra);
  if(pt.crcl!=null&&pt.crcl<60&&!b.inf) add('warn',`CrCl ${r1(pt.crcl)} — oseltamivir ปรับตามไต (CrCl 30–60: ลดขนาดครึ่งหนึ่ง · 10–30: วันละครั้ง) ตรวจกับแพทย์`);
 }catch(e){ console.warn(e); } return r; })(evaluate);
// ---- เอกสารเสริม "ขนาดยาในเด็ก" (PED2) — ยาที่ตาราง รพ.มค ไม่มี: กฎตามช่วงอายุ/น้ำหนัก
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items||!r.drug||typeof PED2==='undefined'||!PED2[r.drug.id]) return r;
  const id=r.drug.id, G=PED2[id], bw=+(pt.dw||pt.bw), am=pedAgeM(), ay=am!=null?am/12:null, ped=pt.isPed||(ay!=null&&ay<13)||(bw>0&&bw<40&&!(+pt.age>=13)&&PED_FORM.test(row.raw||''));
  if(!ped) return r; const add=(l,t,top)=>{ if(r.items.some(i=>i.txt===t)) return; const it={lvl:l,txt:t}; top?r.items.unshift(it):r.items.push(it); if(l==='warn'&&(r.status==='ok'||r.status==='none')) r.status='warn'; if(l==='flag') r.status='flag'; if(l==='ok'&&r.status==='none') r.status='ok'; };
  r.items=r.items.filter(i=>!/ผู้ป่วยเด็ก: (ยังไม่มีกฎ|ไม่มีกฎ)|ยังไม่มีกฎในฐาน/.test(i.txt));
  const kgOnly=G.rules.length===1&&G.rules[0].a[0]===0&&G.rules[0].a[1]>=99;
  const R=kgOnly?G.rules[0]:ay!=null?G.rules.find(x=>ay>=x.a[0]&&ay<x.a[1]):null;
  if(!R){ add('warn',`${r.drug.name} เด็ก: ${ay==null?'ใส่อายุเพื่อตรวจขนาดตามช่วงอายุ':`อายุ ${fmtN(Math.round(ay*10)/10)} ปี ไม่อยู่ในช่วงที่เอกสารระบุ`} — ${G.note}`); return r; }
  const u=r.drug.unit||'mg', D=r.D, F=row.F||null, form=r.drug.forms&&row.formIdx>=0?r.drug.forms[row.formIdx]:null, mlPer=form&&form[3]==='ml'?form[2]:null;
  const mlD=D!=null?(u==='ml'?D:mlPer?D/mlPer:null):null, rg=(x,y)=>x===y?fmtN(x):`${fmtN(x)}–${fmtN(y)}`, rd=v=>Math.round(v*100)/100;
  let lo,hi,got,unitTxt,need=null;
  if(R.kgDay){ if(!(bw>0)) need='น้ำหนัก'; else { lo=R.kgDay[0]*bw*(1-(R.tol||0)); hi=R.kgDay[1]*bw*(1+(R.tol||0)); got=D!=null&&F?D*F:null; unitTxt=`${u}/วัน`; } }
  else if(R.kgDose){ if(!(bw>0)) need='น้ำหนัก'; else { lo=R.kgDose[0]*bw; hi=R.kgDose[1]*bw; got=D; unitTxt=`${u}/ครั้ง`; } }
  else if(R.kgMlDose){ if(!(bw>0)) need='น้ำหนัก'; else { lo=R.kgMlDose[0]*bw; hi=R.kgMlDose[1]*bw; got=mlD; unitTxt='ml/ครั้ง'; } }
  else if(R.mgDose){ lo=R.mgDose[0]; hi=R.mgDose[1]; got=D; unitTxt=`${u}/ครั้ง`; }
  else if(R.mlDose){ lo=R.mlDose[0]; hi=R.mlDose[1]; got=mlD; unitTxt='ml/ครั้ง'; }
  else if(R.mlDay){ lo=R.mlDay[0]; hi=R.mlDay[1]; got=mlD!=null&&F?mlD*F:null; unitTxt='ml/วัน'; }
  else if(R.tsp){ lo=R.tsp[0]*5; hi=R.tsp[1]*5; got=mlD; unitTxt='ml/ครั้ง'; }
  const S=[`ขั้นตอนคำนวณ (ตาราง รพ.มค 2568 ไม่มียานี้ — ใช้แหล่งอ้างอิงเสริม)`,`① ${bw>0?`น้ำหนัก ${fmtN(bw)} kg`:'ไม่มีน้ำหนัก'}${ay!=null?` · อายุ ${ay<2?fmtN(Math.round(am*10)/10)+' เดือน':fmtN(Math.round(ay*10)/10)+' ปี'}`:''}`,`② เอกสาร: ${G.note}`];
  if(need){ S.push(`③ ต้องใช้${need}ในการคำนวณ`); add('info',S.join('\n'),true); add('warn',`${r.drug.name} เด็ก: ใส่${need}เพื่อตรวจขนาด`); return r; }
  const tol=0.1, st=got==null?null:got>hi*(1+tol)?'high':got<lo*(1-tol)?'low':'ok', mlTxt=v=>mlPer&&!/ml/.test(unitTxt)?` (${rg(rd(v[0]/mlPer),rd(v[1]/mlPer))} ml)`:'';
  S.push(`③ ควรได้: ${rg(rd(lo),rd(hi))} ${unitTxt}${R.kgDay&&F?` → ÷ ${fmtN(F)} ครั้ง = ${rg(rd(lo/F),rd(hi/F))} ${u}/ครั้ง${mlPer?` (${rg(rd(lo/F/mlPer),rd(hi/F/mlPer))} ml)`:''}`:mlTxt([lo,hi])}${R.tsp?` (= ${rg(R.tsp[0],R.tsp[1])} ช้อนชา)`:''}`);
  S.push(got!=null?`④ สั่ง: ${D!=null?fmtN(D)+' '+u:''}${F?` × ${fmtN(F)} ครั้ง/วัน`:''} → ${fmtN(rd(got))} ${unitTxt}${R.kgDay&&bw>0?` = ${fmtN(rd(got/bw))} ${u}/kg/วัน`:''}`:'④ อ่านขนาดที่สั่งไม่ได้ (หรือยาไม่มีความเข้มข้นในบัญชี — สั่งเป็น ml/ช้อนชา)');
  if(st) S.push(`⑤ ผล: ${st==='ok'?'อยู่ในช่วง':st==='high'?'สูงกว่าช่วง':'ต่ำกว่าช่วง'}${R.F&&F&&(F<R.F[0]||F>R.F[1])?` · ความถี่ ${fmtN(F)} ครั้ง/วัน ต่างจากเอกสาร (${rg(R.F[0],R.F[1])} ครั้ง/วัน)`:''}`);
  if(G.bwml&&bw>0){ const i=[5,10,15,20].findIndex(w=>bw<=w), c=i<0?3:i; S.push(`⑥ ตาราง ml/ครั้งตามน้ำหนัก (รพ.ควนเนียง · ${G.bwml.lab}): ${[5,10,15,20][c]} kg → ${G.bwml.v[c]} ml${bw>20?' (น้ำหนักเกินตาราง 20 kg)':''}`); }
  S.push('อ้างอิง: '+G.ref.map((k,j)=>`[${j+1}] ${PED2_REF[k]} — ${G.mkd[k]}`).join('\n         '));
  add('info',S.join('\n'),true);
  if(st==='high') add(got>hi*1.5?'flag':'warn',`${r.drug.name} เด็ก: ${fmtN(rd(got))} ${unitTxt} สูงกว่า ${rg(rd(lo),rd(hi))} ${unitTxt} (${G.note})`);
  else if(st==='low') add('warn',`${r.drug.name} เด็ก: ${fmtN(rd(got))} ${unitTxt} ต่ำกว่า ${rg(rd(lo),rd(hi))} ${unitTxt}`);
  else if(st==='ok') add('ok',`${r.drug.name} เด็ก: ขนาดอยู่ในช่วงตามเอกสารเสริม`);
  if(R.maxDose&&D>R.maxDose) add('warn',`เกินขนาดสูงสุด ${R.maxDose} ${u}/ครั้ง`);
  if(R.maxMl&&mlD>R.maxMl) add('warn',`เกินปริมาณสูงสุด ${R.maxMl} ml/ครั้ง`);
  if(G.warn) add('warn',G.warn);
  if(id==='hyoscine'&&ay!=null&&ay<6) add('info','Hyoscine butylbromide ในเด็ก <6 ปี: เอกสารกำกับยาบางผลิตภัณฑ์ไม่แนะนำ — ใช้เมื่อแพทย์พิจารณาแล้ว เฝ้าระวังท้องผูก ปัสสาวะคั่ง หัวใจเต้นเร็ว');
  if(id==='mom') add('info','Milk of Magnesia: ระวังในผู้ป่วยไตบกพร่อง (Mg สะสม) · ห่างจากยาอื่น 2 ชม.');
 }catch(e){ console.warn(e); } return r; })(evaluate);
// ---- Fluconazole ในทารก/เด็ก: prophylaxis สัปดาห์ละ 2 ครั้ง (NICU) · รักษา · นับจำนวนครั้ง/ปริมาตรที่ต้องจ่าย
// อ้างอิง: IDSA Candidiasis guideline 2016 (Pappas) · NeoFax/Lexicomp pediatric · AAP Red Book
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items||!r.drug||r.drug.id!=='fluconazole') return r;
  const am=pedAgeM(), ped=pt.isPed||(am!=null&&am<18*12); if(!ped) return r; const bw=+(pt.dw||pt.bw), raw=row.raw||'';
  const add=(l,t,top)=>{ if(r.items.some(i=>i.txt===t)) return; const it={lvl:l,txt:t}; top?r.items.unshift(it):r.items.push(it); if(l==='warn'&&(r.status==='ok'||r.status==='none')) r.status='warn'; if(l==='flag') r.status='flag'; if(l==='ok'&&r.status==='none') r.status='ok'; };
  const form=row.formIdx>=0?r.drug.forms[row.formIdx]:null, mlMg=form&&form[3]==='ml'?form[2]:(+((raw.match(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*ml/i)||[])[1])||null);
  const ml=row.doseUnit==='ml'?+row.doseVal:null, mg=ml!=null&&mlMg?ml*mlMg:r.D, nW=row.weekly?row.weekly.covered.length:null, days=row.weekly?row.weekly.segs[0].days.map(d=>DAY_TH[d]).join(' '):'';
  const du=raw.match(/(?:จนครบ|นาน|ครบ|x|×|for)\s*(\d+)\s*(วัน|สัปดาห์|week|wk|days?|d)(?![a-z])/i), dur=du?(/สัปดาห์|week|wk/i.test(du[2])?+du[1]*7:+du[1]):null;
  r.items=r.items.filter(i=>!/คำนวณ mg ไม่ได้|ไม่มีกฎขนาดยาเด็ก|จำนวนจ่าย: .*เม็ด\/สัปดาห์/.test(i.txt));
  if(!(bw>0)){ add('warn','Fluconazole เด็ก/ทารก: ใส่น้ำหนักเพื่อคิด mg/kg'); return r; }
  const proph=nW&&nW<=3, mk=mg!=null?mg/bw:null, S=[`ขั้นตอนคำนวณ (IDSA Candidiasis 2016 · NeoFax)`,`① น้ำหนัก ${fmtN(bw)} kg${am!=null?` · อายุ ${am<1?fmtN(Math.round(am*30))+' วัน':am<24?fmtN(Math.round(am*10)/10)+' เดือน':fmtN(Math.round(am/12*10)/10)+' ปี'}`:''}`];
  if(proph){ const lo=3*bw, hi=6*bw;
    S.push(`② ข้อบ่งใช้: ป้องกัน invasive candidiasis ในทารกน้ำหนักน้อยมาก (ELBW <1,000 g) ใน NICU — 3–6 mg/kg/ครั้ง สัปดาห์ละ 2 ครั้ง นาน 6 สัปดาห์`);
    S.push(`③ ควรได้: 3–6 × ${fmtN(bw)} = ${fmtN(Math.round(lo*100)/100)}–${fmtN(Math.round(hi*100)/100)} mg/ครั้ง${mlMg?` (${fmtN(Math.round(lo/mlMg*100)/100)}–${fmtN(Math.round(hi/mlMg*100)/100)} ml ของ ${mlMg} mg/ml)`:''}`);
    S.push(mg!=null?`④ สั่ง: ${ml!=null?fmtN(ml)+' ml × '+mlMg+' mg/ml = ':''}${fmtN(Math.round(mg*100)/100)} mg/ครั้ง ÷ ${fmtN(bw)} kg = ${fmtN(Math.round(mk*100)/100)} mg/kg/ครั้ง · ${days} (สัปดาห์ละ ${nW} ครั้ง)`:'④ อ่านขนาดที่สั่งไม่ได้');
    if(mk!=null) S.push(`⑤ ผล: ${mk>6.6?'สูงกว่าช่วง':mk<2.7?'ต่ำกว่าช่วง':'อยู่ในช่วง'} (3–6 mg/kg/ครั้ง)`);
    if(dur&&ml!=null){ const n=Math.round(dur/7*nW), tot=Math.round(n*ml*100)/100; S.push(`⑥ จำนวนครั้ง: ${dur} วัน ≈ ${fmtN(Math.round(dur/7*10)/10)} สัปดาห์ × ${nW} = ${n} ครั้ง → ${fmtN(ml)} ml × ${n} = ${fmtN(tot)} ml (นับจริงตามวันเริ่ม — ดูปฏิทินแท็บ Timeline)`); }
    add('info',S.join('\n'),true);
    if(mk!=null) add(mk>6.6?'warn':mk<2.7?'warn':'ok',`Fluconazole prophylaxis: ${fmtN(Math.round(mk*100)/100)} mg/kg/ครั้ง ${mk>6.6?'สูงกว่า':mk<2.7?'ต่ำกว่า':'อยู่ใน'}ช่วง 3–6 mg/kg สัปดาห์ละ 2 ครั้ง`);
    if(bw>2.5) add('warn',`น้ำหนัก ${fmtN(bw)} kg — prophylaxis แนะนำในทารก ELBW (<1 kg) เป็นหลัก · ตรวจว่าน้ำหนักถูกต้อง/ข้อบ่งใช้`); }
  else { S.push('② รักษา: ทารก 12 mg/kg/วัน (loading 25 mg/kg) · เด็ก 6–12 mg/kg/วัน (max 800 mg/วัน) · oropharyngeal candidiasis 6 mg/kg วันแรก แล้ว 3 mg/kg/วัน'); if(mk!=null) S.push(`④ สั่ง ${fmtN(Math.round(mg*100)/100)} mg = ${fmtN(Math.round(mk*100)/100)} mg/kg/ครั้ง`); add('info',S.join('\n'),true); }
  if(mlMg===20||/susp/i.test(raw)) add('info','Fluconazole suspension หลังผสมน้ำเก็บได้ 14 วัน (Diflucan; บางยี่ห้อ 28 วัน — ตรวจฉลาก) · ใช้ 6 สัปดาห์ อาจต้องเปลี่ยนขวดใหม่ทุก 2 สัปดาห์ · ใช้ syringe ตวง 0.1 ml');
  if(pt.crcl!=null&&pt.crcl<50&&am!=null&&am>=1) add('info',`CrCl ${r1(pt.crcl)} — fluconazole ขับทางไต: ลดขนาด 50% เมื่อ CrCl ≤50 (เด็ก) · ทารกแรกเกิดใช้ช่วงห่างตาม GA/PNA`);
 }catch(e){ console.warn(e); } return r; })(evaluate);
// ---- ข้อมูลไม่สอดคล้อง: ทารก/เด็กเล็กแต่น้ำหนัก/ส่วนสูงแบบผู้ใหญ่ (มักค้างจากผู้ป่วยรายก่อน)
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ const a0=$('ageIn').value.trim()==='0'&&$('ageU').value==='y', am=a0?6:pedAgeM(), bw=+pt.bw, ht=+$('ht').value;
  const bad=am!=null&&((am<1&&bw>7)||(am<12&&bw>15)||(am<24&&bw>25)||(am<12&&ht>100));
  if(bad&&r&&r.items){ const t=`⚠ ข้อมูลผู้ป่วยไม่สอดคล้อง: อายุ ${a0?'0 ปี (ทารก)':am<1?Math.round(am*30)+' วัน':am<24?fmtN(Math.round(am*10)/10)+' เดือน':''} แต่น้ำหนัก ${fmtN(bw)} kg${ht?` สูง ${ht} cm`:''} — อาจค้างจากผู้ป่วยรายก่อน ตรวจ/กรอกน้ำหนักจริงก่อนคำนวณ`; if(!r.items.some(i=>i.txt===t)){ r.items.unshift({lvl:'flag',txt:t}); r.status='flag'; } } }catch(e){} return r; })(evaluate);
