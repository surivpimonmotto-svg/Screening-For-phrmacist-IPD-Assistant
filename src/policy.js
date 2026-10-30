/* ===== policy.js — มาตรการ/ระเบียบการสั่งยาของ รพ. ===== */

/* ---------- ยาพ่น Asthma/COPD ---------- */
const SRC_INH='มาตรการควบคุมค่าใช้จ่ายด้านยา Asthma/COPD รพ.มค. ปีงบ 2570 (มติประชุม 29/09/2569)';
const INH_DEVICE=/\bmdi\b|inhaler|\binh\b|accuhaler|accu\b|evohaler|\bevo\b|respimat|ellipta|turbuhaler|handihaler|refill|\bdose\b.*\binh|anoro|spiolto|symbicort|trelegy|seretide|spiriva/i;
const INH_NEB=/nebul|respule|\bnb\b/i;
const INH_RELIEVER=/(salbutamol|ventolin|berodual).*(inhaler|mdi|\binh)|(inhaler|mdi).*(salbutamol|ventolin|berodual)/i;
const INH_STAFF=/anoro|spiolto|symbicort/i, INH_CHEST=/trelegy/i, INH_SYMB=/symbicort/i;
const inhTxt=r=>{const mm=masterOf(r);return r.raw+' '+(mm?mm[1]+' '+mm[2]:'');};
function inhalerChk(row,rows,pt,add){
  const s=inhTxt(row); if(!INH_DEVICE.test(s)||INH_NEB.test(s)) return false;
  const others=rows.filter(r=>r!==row).map(inhTxt);
  add('info',`ยาพ่น: ผู้ป่วยรับใหม่ ตรวจประวัติยาพ่นเดิม (MR) ภายใน 48 ชม. — มียาเดิม: พิมพ์สติ๊กเกอร์จำนวน 0 + "ใช้ยาเดิมของผู้ป่วย" · ไม่มีประวัติ/นำมาไม่ได้: consult แพทย์ · เปลี่ยนสูตร/Device ได้เฉพาะคำสั่ง Staff MED/Chest MED (${SRC_INH})`);
  if(INH_CHEST.test(s)) add('warn','ยาพ่น: Trelegy Ellipta start ได้เฉพาะ Chest MED — ตรวจแพทย์ผู้สั่ง (ยกเว้นเป็นยาเดิมของผู้ป่วย)');
  else if(INH_STAFF.test(s)) add('warn','ยาพ่น: LABA/LAMA (Anoro, Spiolto) และ Symbicort Turbuhaler start ได้เฉพาะ Staff MED/Chest MED — ตรวจแพทย์ผู้สั่ง (ยกเว้นเป็นยาเดิมของผู้ป่วย)');
  if(INH_SYMB.test(s)&&others.some(o=>INH_RELIEVER.test(o))) add('warn','ยาพ่น: ใช้ Symbicort อยู่ ไม่แนะนำให้ใช้ Reliever (Berodual MDI, Salbutamol MDI) ร่วม — เพิ่มอัตราการกำเริบของโรค');
  if(INH_RELIEVER.test(s)){
    if(others.some(o=>INH_SYMB.test(o))) add('warn','ยาพ่น: ผู้ป่วยมี Symbicort ไม่แนะนำให้ใช้ Reliever MDI ร่วม — เพิ่มอัตราการกำเริบของโรค');
    const q=s.match(/#\s*(\d+)|(\d+)\s*(?:หลอด|ขวด|canister)/i); const n=q?+(q[1]||q[2]):null;
    add(n>1?'warn':'info',`ยาพ่น: Reliever (Salbutamol/Berodual MDI) จ่าย 1 หลอด/4 เดือน และครั้งละ 1 หลอดเท่านั้น (ยกเว้นผู้ป่วยร้องขอ)${n>1?` — คำสั่งระบุ ${n} หลอด`:''}`); }
  if(/pre-?op|ก่อนผ่าตัด|ก่อน\s*or\b/i.test(s)) add('warn','ยาพ่น: Pre-OP ให้ใช้รูปแบบ Nebulizer (Pulmicort NB, Salbutamol NB, Berodual NB) แทนการเบิก MDI หรือใช้ยาเดิมของผู้ป่วย');
  return true;
}

/* ---------- Fentanyl patch (TTS) ---------- */
const SRC_FTTS='แผ่นพับการใช้ Fentanyl ชนิดแผ่นแปะ กลุ่มงานเภสัชกรรม รพ.มค. · ตาราง OME ห้องยา (patch mcg/hr ×2)';
function fentPatchChk(row,rows,pt,add){
  const mm=masterOf(row); const s=row.raw+' '+(mm?mm[1]+' '+mm[2]:'');
  if(!/fentanyl|durogesic/i.test(s)||!/tts|patch|แผ่น|transdermal|durogesic/i.test(s)) return false;
  const st=(s.match(/(\d+(?:\.\d+)?)\s*mcg/i)||[])[1]; const mcg=st?+st:null;
  const nq=row.raw.match(/(\d+(?:\.\d+)?|ครึ่ง)\s*แผ่น/); const n=nq?(nq[1]==='ครึ่ง'?0.5:+nq[1]):1;
  if(mcg&&![25,50].includes(mcg)) add('warn',`Fentanyl patch: ความแรง ${mcg} mcg/hr — รพ. มี 25 และ 50 mcg/hr`);
  const F=row.F; const hrs=F?24/F:null;
  if(hrs==null) add('warn','Fentanyl patch: ไม่พบความถี่ — ต้องเปลี่ยนแผ่นทุก 72 ชม. (บางรายตอบสนองสั้น ทุก 48 ชม.)');
  else if(Math.abs(hrs-72)<1) add('ok','Fentanyl patch: เปลี่ยนแผ่นทุก 72 ชม. ถูกต้อง');
  else if(Math.abs(hrs-48)<1) add('info','Fentanyl patch: ทุก 48 ชม. — ใช้ได้ในผู้ป่วยบางรายที่ตอบสนองต่อยาสั้นกว่าปกติ (ปกติ 72 ชม.)');
  else add('flag',`Fentanyl patch: ความถี่ทุก ${fmtN(Math.round(hrs*10)/10)} ชม. ไม่ถูกต้อง — เปลี่ยนแผ่นทุก 72 ชม. (บางราย 48 ชม.)`);
  if(n<1) add('info','Fentanyl patch: ห้ามตัด/แบ่งแผ่นยา ยกเว้นแพทย์สั่งใช้ขนาดต่ำ — ยืนยันคำสั่ง');
  if(mcg){ const tot=mcg*n; add('info',`Fentanyl patch ${fmtN(tot)} mcg/hr ≈ OME ${fmtN(tot*2)} mg/วัน (×2 ตามตาราง OME ห้องยา) — ออกฤทธิ์เต็มที่ 12–24 ชม. หลังแปะ ยังมีผล ~17 ชม. หลังลอก · คำนวณรวมกับ opioid อื่นในแท็บ Opioid (OME)`); }
  add('info','Fentanyl patch: แปะหน้าอก หลัง สีข้าง ต้นแขน (ผิวเรียบ ไม่มีแผล) · ทำความสะอาดด้วยน้ำเปล่า ห้ามโกน/สบู่/น้ำมัน · กดแผ่น 30 วินาที · ห้ามประคบร้อนบริเวณแผ่นยา · เปลี่ยนบริเวณใหม่ทุกครั้ง');
  if(rows.some(r=>r!==row&&/morphine|pethidine|tramadol|oxycodone|methadone|codeine|fentanyl inj/i.test(r.raw+' '+((masterOf(r)||[])[1]||'')))) add('warn','Fentanyl patch + opioid อื่น — ตรวจ OME รวม และ breakthrough dose (แท็บ Opioid)');
  return true;
}

/* ---------- ยาต้านการแข็งตัวของเลือด (Academic in-service Gen-med2 รพ.มค.) ---------- */
const SRC_AC='Academic in-service Gen-med2 รพ.มค.: Heparin/Enoxaparin/Dabigatran + warfarin ในหญิงตั้งครรภ์ (UpToDate, EHRA 2018, ESC 2018)';
const AC_RE={heparin:/heparin(?!.*(flush|lock|capd|1,?000\s*unit))/i,enox:/enoxaparin|clexane/i,warf:/warfarin|orfarin/i,dabi:/dabigatran|pradaxa/i,riva:/rivaroxaban|xarelto/i,apix:/apixaban|eliquis/i,fonda:/fondaparinux|arixtra/i};
const AC_NM={heparin:'Heparin',enox:'Enoxaparin',warf:'Warfarin',dabi:'Dabigatran',riva:'Rivaroxaban',apix:'Apixaban',fonda:'Fondaparinux'};
const AC_TR={'heparin>warf':'เริ่ม warfarin ต่อ heparin IV จน INR ถึงเป้า (4–5 วัน)','warf>heparin':'หยุด warfarin เมื่อ INR ลงถึงช่วงเป้า เริ่ม heparin IV (ไม่ bolus)',
 'heparin>enox':'หยุด heparin แล้วเริ่ม enoxaparin ภายใน 1 ชม.','enox>heparin':'เริ่ม heparin IV 1–2 ชม. ก่อนถึงเวลา enoxaparin dose ถัดไป',
 'enox>warf':'เริ่ม warfarin ต่อ enoxaparin จน INR ถึงเป้า (4–5 วัน)','enox>dabi':'เริ่ม dabigatran ภายใน 2 ชม. ก่อนเวลา enoxaparin dose ถัดไป','heparin>dabi':'เริ่ม dabigatran เมื่อหยุด heparin infusion',
 'dabi>heparin':'รอ 12–24 ชม. หลัง dabigatran dose สุดท้าย แล้วเริ่ม heparin','dabi>enox':'รอ 12–24 ชม. หลัง dabigatran dose สุดท้าย แล้วเริ่ม LMWH','warf>dabi':'หยุด warfarin เริ่ม dabigatran เมื่อ INR <2',
 'dabi>warf':'เริ่ม warfarin ก่อนหยุด dabigatran: CrCl >50 = 3 วัน · 30–50 = 2 วัน · 15–30 = 1 วัน'};
const acOf=r=>{const s=r.raw+' '+((masterOf(r)||[])[1]||''); return Object.keys(AC_RE).find(k=>AC_RE[k].test(s));};
const DABI_DI=[[/dronedarone/i,'flag','ห้ามใช้/ไม่แนะนำ (ระดับยาสูงขึ้นมาก)'],[/ketoconazole|itraconazole|voriconazole/i,'flag','เพิ่มระดับ dabigatran 140–150% — ไม่แนะนำ'],[/cyclosporin|tacrolimus/i,'flag','P-gp inhibitor แรง — ไม่แนะนำ'],
 [/rifampi|carbamazepine|phenytoin|phenobarb|st\.?\s*john/i,'flag','P-gp inducer ลดระดับ dabigatran (rifampicin −66%) — หลีกเลี่ยง'],[/dexamethasone/i,'warn','P-gp/CYP3A4 inducer ลดระดับยา — หลีกเลี่ยง'],
 [/amiodarone|verapamil|clarithromycin|erythromycin|ticagrelor|quinidine/i,'warn','เพิ่มระดับ dabigatran — ระวัง พิจารณาลดขนาด (โดยเฉพาะมีปัจจัยเลือดออก ≥2)'],
 [/aspirin|clopidogrel|nsaid|ibuprofen|naproxen|diclofenac|celecoxib|etoricoxib|prednisolone|methylpred|hydrocortisone/i,'warn','เพิ่มความเสี่ยงเลือดออก (antiplatelet/NSAID/steroid) — ระวัง'],
 [/omeprazole|esomeprazole|pantoprazole|lansoprazole|famotidine|ranitidine|antacid/i,'info','PPI/H2 blocker/antacid ลดระดับ dabigatran 12–30% — ไม่ต้องปรับขนาด']];
function acChk(row,rows,pt,add){
  const me=acOf(row); if(!me) return false;
  const others=rows.filter(r=>r!==row), ot=others.map(r=>r.raw+' '+((masterOf(r)||[])[1]||'')).join(' | ');
  const oac=[...new Set(others.map(acOf).filter(Boolean))].filter(k=>k!==me);
  oac.forEach(o=>{ const t=AC_TR[o+'>'+me]||AC_TR[me+'>'+o]; add('warn',`ยาต้านการแข็งตัวของเลือด: ${AC_NM[me]} + ${AC_NM[o]} — ตรวจว่าเป็นช่วงเปลี่ยนยา (bridging)${t?' · '+t:''} (${SRC_AC})`); });
  if(me==='dabi'){ DABI_DI.forEach(([re,l,m])=>{ const mm=ot.match(re); if(mm) add(l,`DI Dabigatran + ${mm[0]}: ${m}`); });
    if(+pt.age>=75||(+pt.bw>0&&+pt.bw<=60)) add('warn',`Dabigatran: ${+pt.age>=75?'อายุ ≥75':''}${+pt.age>=75&&+pt.bw<=60?' · ':''}${+pt.bw>0&&+pt.bw<=60?'น้ำหนัก ≤60 kg':''} — ระดับยาสูงขึ้น ระวังเลือดออก`);
    add('info','Dabigatran: เลือดออกรุนแรง → idarucizumab 5 g IV (2.5 g × 2 ห่างไม่เกิน 15 นาที) หรือ PCC 50 U/kg · ไม่แนะนำ FFP'); }
  if(me==='enox'){ const D=+row.doseVal, F=row.F;
    if(pt.crcl!=null&&pt.crcl<30&&!pt.dial&&row.doseUnit==='mg'&&D>=40&&D<=40.5&&F===1) add('warn','Enoxaparin prophylaxis CrCl <30: 30 mg SC OD (treatment 1 mg/kg SC OD)');
    if(+pt.age>=75&&/\biv\b|bolus/i.test(row.raw)) add('warn','Enoxaparin STEMI อายุ ≥75: ไม่ให้ IV bolus · maintenance 0.75 mg/kg SC q12h (ตามแนวทาง) — ตรวจคำสั่ง'); }
  if(me==='heparin') add('info','Heparin: ติดตาม CBC/platelet (HIT 1–2%), aPTT · เลือดออก → protamine 1–1.5 mg ต่อ heparin 100 unit');
  if(me==='warf'&&pt.preg) add('flag','Warfarin ในหญิงตั้งครรภ์: ไตรมาส 1 (สัปดาห์ 6–12) เปลี่ยนเป็น LMWH/UFH (ลิ้นหัวใจเทียมโลหะ + warfarin ≤5 mg/วัน อาจใช้ต่อได้) · ไตรมาส 2–3 ใช้ warfarin ได้ · สัปดาห์ 36 เปลี่ยนเป็น LMWH/heparin · 36 ชม. ก่อนคลอดใช้ heparin (aPTT ≥2× control) หยุด 4–6 ชม. ก่อนคลอด — consult แพทย์ (ESC 2018 / แนวทางไทย)');
  return true;
}

/* ---------- ยาวัณโรค: พิษต่อตับ / B6 (การจัดการ ADR จากยาต้านวัณโรค) ---------- */
const SRC_TBADR='การจัดการอาการไม่พึงประสงค์จากยาต้านวัณโรค (สมาคมอุรเวชช์ฯ 2551, ATS/CDC/IDSA 2003, WHO TB/HIV)';
function tbAdrChk(row,rows,pt,add){
  const s=row.raw+' '+((masterOf(row)||[])[1]||''); const isH=/isoniazid|\binh\b|rifinah|rimactazid|rifafour|rimstar/i.test(s), isR=/rifamp|rifinah|rimactazid|rifafour|rimstar/i.test(s), isZ=/pyrazinamide|\bpza\b|rifafour|rimstar/i.test(s);
  if(!(isH||isR||isZ)) return false;
  const L=pt.lab||{}, uln=40, mx=Math.max(L.ast||0,L.alt||0);
  if(mx>5*uln) add('flag',`ยาวัณโรค + AST/ALT ${L.ast??'–'}/${L.alt??'–'} (>5×ULN) — เข้าเกณฑ์ hepatotoxicity: หยุด H/R/Z (ส่วนใหญ่จาก PZA, INH) · ระหว่างหยุดถ้ารุนแรง/แพร่เชื้อ ใช้ SM + EMB (± quinolone) · rechallenge เมื่ออาการหายและ LFT <2×ULN, T.bil <1.5 — ${SRC_TBADR}`);
  else if(mx>3*uln) add('warn',`ยาวัณโรค + AST/ALT >3×ULN — ถ้ามีอาการ (เบื่ออาหาร คลื่นไส้ อาเจียน อ่อนเพลีย ตัวเหลือง) เข้าเกณฑ์ hepatotoxicity ให้หยุดยา · ถ้าไม่มีอาการ ตรวจ LFT ซ้ำทุก 3–5 วัน`);
  if(isR&&L.tbil!=null&&L.tbil>1.5&&mx<=3*uln) add('warn',`Rifampicin + bilirubin ${L.tbil} (ขึ้นเด่น, AST/ALT ไม่สูง) — cholestasis จาก rifampicin: ถ้า TB/DB ขึ้นอย่างเดียว หยุดเฉพาะ RFP`);
  if(isH&&!rows.some(r=>/pyridoxine|vitamin\s*b\s*6|\bb6\b|vit\.?\s*b\s*1-?6-?12|neurobion/i.test(r.raw+' '+((masterOf(r)||[])[1]||'')))) add('info','INH: ไม่พบ pyridoxine — ป้องกัน peripheral neuropathy 10 mg/วัน (กลุ่มเสี่ยง: HIV, ไตวาย, สุรา, ขาดอาหาร, ตับเรื้อรัง, ตั้งครรภ์ 25–50 mg/วัน) · รักษา 100–200 mg/วัน');
  return true;
}

/* ---------- Opioid (Pitfalls in symptom management, palliative care) ---------- */
const SRC_PAL='Pitfalls in Symptoms Management for Palliative care Patient (ศูนย์การุณรักษ์ มข.)';
const RE_OPI=/morphine|\bmst\b|kapanol|oxycodone|oxycontin|targin|tramadol|codeine|methadone|pethidine|meperidine|fentanyl/i, RE_LAX=/senna|senokot|bisacodyl|dulcolax|lactulose|milk\s*of\s*mag|\bmom\b|picosulfate|docusate|glycerin|enema|unison|forlax|macrogol|\bpeg\b|magnesium\s*hydrox/i;
function opiChk(row,rows,pt,add){
  const s=row.raw+' '+((masterOf(row)||[])[1]||''); if(!RE_OPI.test(s)||/codeine.*\+|\+.*gg|guaif/i.test(s)) return false;
  const prn=/\bprn\b|เมื่อ(มี)?อาการ|เมื่อปวด|as\s*need/i.test(row.raw); const reg=!prn&&row.F!=null&&row.F>=1;
  const all=rows.map(r=>r.raw+' '+((masterOf(r)||[])[1]||''));
  if(reg&&!all.some(t=>RE_LAX.test(t))) add('warn','Opioid regular แต่ไม่มียาระบาย — ให้ stimulant ± softener laxative ป้องกันท้องผูก (ไม่ใช้ fiber laxative) — '+SRC_PAL);
  if(reg&&/morphine|oxycodone/i.test(s)&&!rows.some(r=>r!==row&&RE_OPI.test(r.raw+' '+((masterOf(r)||[])[1]||''))&&/\bprn\b|เมื่อ/i.test(r.raw))) add('info','Opioid regular: ควรมี rescue dose สำหรับ breakthrough pain (morphine ~1/6 ของ dose ต่อวัน หรือ 10–20%) · ใช้ rescue ≥3 ครั้ง/วัน → เพิ่ม background dose');
  if(/morphine/i.test(s)&&(pt.dial||(pt.crcl!=null&&pt.crcl<30))) add('warn',`Morphine + ${pt.dial||'CrCl <30'}: metabolite (M3G/M6G) สะสม — ลดขนาด 50% (ESRD ลด 75%) หรือเปลี่ยนเป็น fentanyl`);
  if(/pethidine|meperidine/i.test(s)&&reg) add('warn','Pethidine: ไม่ควรใช้ต่อเนื่องระยะยาว (metabolite ทำให้ชัก) — ใช้ morphine/fentanyl แทน');
  if(/oxycodone|oxycontin|targin/i.test(s)&&(pt.dial||(pt.crcl!=null&&pt.crcl<15))) add('warn','Oxycodone: ควรหลีกเลี่ยงใน ESRD');
  if(/tramadol/i.test(s)&&row.doseUnit==='mg'&&row.F&&+row.doseVal*row.F>400) add('warn',`Tramadol ${fmtN(+row.doseVal*row.F)} mg/วัน — เกิน 400 mg/วัน`);
  return true;
}

/* ---------- ยาจิตเวช: Antipsychotics (Pharmacotherapy in Psychiatry, มข.) ---------- */
const SRC_PSY='Pharmacotherapy in Psychiatry Part II: Antipsychotics (ภาควิชาจิตเวชศาสตร์ มข.) · APA 2020';
// [ชื่อ, regex, ขนาด mg/วัน ปกติ [lo,hi], CPZ eq (mg ≈ CPZ 100), CYP]
const APS=[['Chlorpromazine',/chlorpromazine|largactil/i,[300,800],100,''],['Thioridazine',/thioridazine/i,[200,600],90,'2D6'],['Perphenazine',/perphenazine/i,[8,32],10,'2D6'],['Trifluoperazine',/trifluoperazine/i,[6,20],5,'1A2'],['Fluphenazine',/fluphenazine(?!.*decan)/i,[2,20],5,'2D6'],
 ['Haloperidol',/haloperidol(?!.*decan)/i,[5,20],2,'3A4/2D6'],['Pimozide',/pimozide/i,[2,10],1,'3A4'],['Clozapine',/clozapine|clozaril/i,[300,900],50,'1A2/3A4'],['Risperidone',/risperidone|risperdal/i,[2,10],1,'2D6'],['Olanzapine',/olanzapine|zyprexa/i,[5,20],2,'1A2'],
 ['Quetiapine',/quetiapine|seroquel/i,[100,750],50,'3A4'],['Ziprasidone',/ziprasidone/i,[60,160],10,'3A4'],['Aripiprazole',/aripiprazole|abilify/i,[15,30],2,'2D6/3A4'],['Paliperidone',/paliperidone|invega/i,[3,12],1,''],['Lurasidone',/lurasidone|latuda/i,[40,120],16,'3A4']];
const AP_INT=[['1A2',/fluvoxamine|ciprofloxacin/i,'ยับยั้ง CYP1A2 → ระดับยาสูงขึ้น'],['1A2i',/cigarette|smok|บุหรี่/i,'บุหรี่เหนี่ยวนำ CYP1A2 → ระดับยาลดลง'],['2D6',/fluoxetine|paroxetine|sertraline/i,'SSRI ยับยั้ง CYP2D6 → ระดับยาสูงขึ้น'],
 ['3A4',/erythromycin|clarithromycin|ketoconazole|itraconazole|voriconazole|ritonavir|lopinavir|darunavir|atazanavir|cobicistat/i,'ยับยั้ง CYP3A4 → ระดับยาสูงขึ้น'],['3A4i',/carbamazepine|phenytoin|phenobarb|rifamp/i,'เหนี่ยวนำ CYP3A4 → ระดับยาลดลง']];
function apChk(row,rows,pt,add){
  const s=row.raw+' '+((masterOf(row)||[])[1]||''); const ap=APS.find(a=>a[1].test(s)); if(!ap) return false;
  const [nm,,rng,eq,cyp]=ap; const mm=masterOf(row); const per=mm&&mm[7]&&mm[7][0]==='u'?mm[7][1]:+((s.match(/(\d+(?:\.\d+)?)\s*mg/i)||[])[1]||0)||null;
  const one=row.doseUnit==='mg'&&+row.doseVal>0?+row.doseVal:row.doseUnit==='unit'&&per?+row.doseVal*per:null; const D=one!=null?one*(row.F||1):null;
  const prn=/\bprn\b|เมื่อ/i.test(row.raw);
  if(D!=null&&!prn&&!/decanoate|\binj|\bim\b/i.test(s)){ if(D>rng[1]) add('warn',`${nm} ${fmtN(D)} mg/วัน — สูงกว่าขนาดทั่วไป ${rng[0]}–${rng[1]} mg/วัน (${SRC_PSY})`); else add('info',`${nm} ${fmtN(D)} mg/วัน (ขนาดทั่วไป ${rng[0]}–${rng[1]}) ≈ chlorpromazine ${fmtN(Math.round(D/eq*100))} mg/วัน`); }
  const others=rows.filter(r=>r!==row).map(r=>r.raw+' '+((masterOf(r)||[])[1]||''));
  const dup=others.filter(t=>APS.some(a=>a[0]!==nm&&a[1].test(t)));
  if(dup.length&&!prn) add('warn',`ใช้ antipsychotic มากกว่า 1 ตัว — ตรวจข้อบ่งใช้ (augmentation/ช่วงเปลี่ยนยา) และ EPS/QT`);
  AP_INT.forEach(([c,re,m])=>{ const base=c.replace('i',''); if(!cyp.includes(base)) return; const hit=others.join(' | ').match(re); if(hit) add('warn',`DI ${nm} (CYP${base}) + ${hit[0]}: ${m}`); });
  if(nm==='Clozapine'){ const L=pt.lab||{}; if(L.anc!=null) add(L.anc<1500?'flag':'ok',`Clozapine: ANC ${fmtN(Math.round(L.anc))}${L.anc<1500?' <1,500 — neutropenia/agranulocytosis (0.8%) หยุดยา/ปรึกษาจิตแพทย์':' — ติดตาม ANC ตามรอบ'}`); else add('warn','Clozapine: ต้องติดตาม ANC (neutropenia 2.7%, agranulocytosis 0.8%) — ใส่ WBC + Neutrophil ในกล่องผล Lab');
    add('info','Clozapine: เริ่ม 12.5 mg/วัน ค่อยๆ เพิ่ม max 900 mg/วัน · ชักเมื่อ >600 mg/วัน · เฝ้าระวัง myocarditis, ท้องผูกรุนแรง, น้ำลายมาก'); }
  if(/haloperidol|fluphenazine|pimozide|trifluoperazine/i.test(nm)) add('info',`${nm}: high-potency FGA — EPS/NMS สูง · NMS: หยุด antipsychotic ให้สารน้ำ ลดไข้ bromocriptine/dantrolene เริ่มใหม่ ≥2 สัปดาห์หลังหาย`);
  return true;
}
