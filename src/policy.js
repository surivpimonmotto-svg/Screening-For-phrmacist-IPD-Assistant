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
