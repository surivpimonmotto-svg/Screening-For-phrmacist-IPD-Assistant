/* ===== foodac.js — รายการยาที่ควรรับประทานก่อนอาหาร/ท้องว่าง (กลุ่มงานเภสัชกรรม รพ.มค 2565 edit)
 ถ้าคำสั่งระบุ "pc / หลังอาหาร / พร้อมอาหาร" กับยาในรายการ → ขึ้น "ข้อมูล" พร้อมเหตุผล (ไม่เปลี่ยนสถานะรายการ) */
const SRC_FOODAC='รายการยาที่ควรรับประทานก่อนอาหารหรือท้องว่าง รพ.มค (2565)';
const FOOD_AC=[
 [/domperidone|motilium/i,'กรณีแก้อาเจียน ให้ก่อนอาหาร 15–30 นาที (ข้อบ่งใช้อื่น เช่น กระตุ้นน้ำนม ให้หลังอาหารได้)'],
 [/mebeverine|duspatalin/i,'ดูดซึมดีที่สุดเมื่อกินก่อนอาหาร 20 นาที'],
 [/metoclopramide|plasil/i,'กรณีแก้อาเจียน กินก่อนอาหาร 30 นาที'],
 [/bismuth/i,'อาจรบกวนการดูดซึมยาอื่น ควรกินก่อนอาหาร'],
 [/esomeprazole|nexium/i,'อาหารลด AUC 43–53% — กินก่อนอาหาร 1 ชม.'],
 [/lansoprazole/i,'อาหารลด Cmax/AUC 50–70% — กินตอนท้องว่าง'],
 [/omeprazole|miracid/i,'อาหารลด Cmax 63%, AUC 24% — กินก่อนอาหาร 1 ชม.'],
 [/sucralfate|ulsanic/i,'ต้องเคลือบกระเพาะ — กินก่อนอาหาร 1 ชม. และก่อนนอน'],
 [/captopril/i,'อาหารลดการดูดซึม 30–40% — กินก่อนอาหาร 1 ชม.'],
 [/isosorbide\s*dinitrate|\bisdn\b|isordil/i,'กินก่อนอาหาร 30 นาที'],
 [/cilostazol|pletaal/i,'อาหารไขมันสูงเพิ่มการดูดซึม — กินก่อนอาหาร 30 นาที หรือหลังอาหาร 2 ชม.'],
 [/gemfibrozil/i,'อาหารลด AUC 14–44%, Cmax 50–60% — กินก่อนอาหาร 30 นาที'],
 [/cyproheptadine/i,'กรณีกระตุ้นความอยากอาหาร ให้ก่อนอาหาร 30 นาที'],
 [/madopar|vopar|levodopa/i,'อาหารลด AUC/Cmax และ Tmax นานขึ้น — กินก่อนอาหาร 30 นาที'],
 [/dicloxacillin/i,'อาหารลดการดูดซึม — กินก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.'],
 [/penicillin\s*v|pen\s*v\b/i,'อาหารลด peak — ควรกินก่อนอาหาร 1 ชม. (จำเป็นอาจกินพร้อมอาหารได้)'],
 [/azithromycin.*(cap|250)|zithromax\s*cap/i,'(แคปซูล) อาหารกระตุ้นกรดทำลายยา — กินก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.'],
 [/erythromycin/i,'ดูดซึมดีตอนท้องว่าง — กินก่อนอาหาร 0.5–1 ชม. หรือหลังอาหาร 2 ชม.'],
 [/roxithromycin|rulid/i,'อาหารลดการดูดซึม 21% — กินก่อนอาหาร (ถ้าระคายเคืองทางเดินอาหาร กินหลังอาหารได้)'],
 [/ciprofloxacin|levofloxacin|norfloxacin|ofloxacin|moxifloxacin|cravit|avelox/i,'จับกับ Ca²⁺/Fe²⁺/Mg²⁺/Al³⁺ ในอาหาร/ยา — กินห่างจากนม แคลเซียม เหล็ก antacid 2 ชม.'],
 [/isoniazid|\binh\b|rifampicin|rifinah|rifafour|rimstar/i,'อาหารลด Cmax — กินตอนท้องว่าง (ก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.) · ถ้าทน S/E ไม่ได้ ให้หลังอาหารได้'],
 [/entecavir|baraclude/i,'อาหารลด Cmax 44–46%, AUC 18–20% — กินก่อนหรือหลังอาหาร 2 ชม.'],
 [/ivermectin/i,'อาหารเพิ่มการดูดซึม 2.5 เท่า (เพิ่ม ADR) — กินตอนท้องว่าง'],
 [/gliclazide|glipizide|minidiab|diamicron/i,'onset 15–60 นาที — กินก่อนอาหาร 30 นาที ให้ออกฤทธิ์ตรงกับน้ำตาลที่ขึ้นหลังอาหาร'],
 [/levothyroxine|euthyrox|eltroxin|thyrox/i,'อาหารลดการดูดซึม — กินก่อนอาหาร 0.5–1 ชม. และห่างจาก Ca/Fe 4 ชม.'],
 [/alendronate|fosamax/i,'อาหารลดการดูดซึม 60% — กินก่อนอาหาร 30 นาที กับน้ำเปล่าเต็มแก้ว ห้ามนอนหลังกิน 30 นาที'],
 [/trospium|spasmo-?lyt/i,'อาหารไขมันสูงลด AUC/Cmax 70–80% — กินก่อนอาหาร 1 ชม.'],
 [/melphalan|alkeran/i,'อาหารไขมันสูงลด AUC 36–54% — กินก่อนอาหาร 1 ชม. หรือหลังอาหาร 2 ชม.'],
 [/nilotinib|tasigna/i,'อาหารไขมันสูงเพิ่ม AUC 80% — กินก่อนอาหาร 1 ชม. (และหลังอาหาร 2 ชม.)'],
 [/mycophenolate|cellcept/i,'อาหารลด Cmax 40% — กินตอนท้องว่าง (stable แล้วกินพร้อมอาหารได้)'],
 [/deferasirox|exjade/i,'อาหารเพิ่ม AUC — กินก่อนอาหาร 30 นาที'],
];
function foodAcCheck(row){ const raw=row.raw||'', mm=typeof masterOf==='function'?masterOf(row):null, t=raw+' '+(mm?mm[1]+' '+(mm[2]||''):'');
  if(/\b(inj|iv|im|sc)\b|ฉีด/i.test(raw)) return null;
  const hit=FOOD_AC.find(f=>f[0].test(t)); if(!hit) return null;
  const pc=/\bp\.?c\.?\b|หลังอาหาร|พร้อมอาหาร|with\s*(food|meal)/i.test(raw), ac=/\ba\.?c\.?\b|ก่อนอาหาร|ท้องว่าง|empty/i.test(raw);
  if(pc&&!ac) return {lvl:'info',txt:`ควรกินก่อนอาหาร/ท้องว่าง แต่คำสั่งระบุหลังอาหาร: ${hit[1]} (${SRC_FOODAC})`};
  return null; }
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ const f=foodAcCheck(row); if(f&&r&&r.items&&!r.items.some(i=>i.txt===f.txt)) r.items.push(f); }catch(e){} return r; })(evaluate);
