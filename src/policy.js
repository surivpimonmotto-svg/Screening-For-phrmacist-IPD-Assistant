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
