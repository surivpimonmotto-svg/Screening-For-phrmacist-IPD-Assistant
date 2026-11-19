/* ===== amb.js — Amphotericin B (conventional / liposomal) + Fluconazole ขนาดสูง (Cryptococcal meningitis) ===== */
const SRC_AMB='WHO Cryptococcal guideline 2022 · IDSA 2010 · แนวทาง HIV ประเทศไทย ⚑';
if(!KB.some(d=>d.id==='amphob')) KB.push({id:'amphob',name:'Amphotericin B',match:/amphotericin|fungizone|ambisome|abelcet/i,unit:'mg',forms:[[/lipo|ambisome/i,'Liposomal 50 mg vial',50,'vial'],[/50/,'50 mg vial',50,'vial']],note:'Conventional 0.7–1 mg/kg/วัน (max 1.5) ใน D5W ≤0.1 mg/ml drip 4–6 ชม. · Liposomal 3–4 mg/kg/วัน (crypto) · ห้ามผสม NSS',src:SRC_AMB});
function ambDose(row){ const s=String(row.raw||'').replace(/\([^)]*\)/g,' '); const m=s.match(/(\d+(?:\.\d+)?)\s*mg(?!\s*\/\s*kg)/i); return m?+m[1]:(row.D&&row.unitG==='mg'?row.D:null); }
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items) return r; const raw=String(row.raw||''), add=(l,t)=>{ if(r.items.some(i=>i.txt===t)) return; r.items.push({lvl:l,txt:t}); if(l==='flag') r.status='flag'; else if(l==='warn'&&r.status!=='flag') r.status='warn'; else if(l==='ok'&&(r.status==='none'||r.status==='nr'||!r.status)) r.status='ok'; };
  const R=rows||[], bw=pt&&pt.bw, f=x=>fmtN(Math.round(x*100)/100);
  // ---------- Amphotericin B ----------
  if(/amphotericin|fungizone|ambisome|abelcet/i.test(raw)){
    const lipo=/lipo|ambisome|abelcet|l-?amb/i.test(raw), mg=ambDose(row), dur=(raw.match(/(?:in|นาน)\s*(\d+(?:\.\d+)?)\s*(?:hr|h|ชม)/i)||[])[1];
    if(mg&&bw){ const mk=mg/bw;
      if(lipo){ add(mk>10.5?'flag':mk>6.5?'warn':mk<2.5?'warn':'ok',`Liposomal AmB ${f(mg)} mg ÷ ${f(bw)} kg = ${f(mk)} mg/kg/วัน — crypto 3–4 · mucor/mould 5–10 · single high-dose 10 mg/kg ครั้งเดียว (WHO 2022)`); }
      else{ const lv=mk>1.5?'flag':mk>1.05?'warn':mk<0.5?'warn':'ok';
        add(lv,`Amphotericin B (conventional) ${f(mg)} mg ÷ ${f(bw)} kg = ${f(mk)} mg/kg/วัน — เป้า crypto 0.7–1 mg/kg/วัน (= ${f(0.7*bw)}–${f(bw)} mg)${mk>1.5?' · เกิน 1.5 mg/kg/วัน อันตรายถึงชีวิต (หัวใจหยุดเต้น) — ตรวจว่าสับสนกับ liposomal หรือไม่':''}`); }
      add('info',`จ่าย: ${f(mg)} mg ÷ 50 mg/vial = ${f(mg/50)} → ${Math.ceil(mg/50-1e-9)} vial/วัน`); }
    else if(mg) add('warn',`Amphotericin B ${f(mg)} mg — ใส่น้ำหนักเพื่อตรวจ mg/kg/วัน (conventional 0.7–1 · max 1.5)`);
    // สารละลาย: D5W เท่านั้น
    const sameLine=raw.toLowerCase(), nssMix=/\b(nss|0\.9\s*%?\s*nacl|normal\s*saline)\b/i.test(sameLine);
    if(nssMix) add('flag','Amphotericin B ห้ามผสมใน NSS/สารละลายที่มีเกลือ — ตกตะกอน · ผสมใน D5W เท่านั้น');
    const d5=R.filter(x=>x!==row&&/d-?5-?w|5\s*%\s*d\s*\/?\s*w|dextrose\s*5/i.test(x.raw)).map(x=>{ const m=String(x.raw).match(/(\d{2,4})\s*ml/i); return m?+m[1]:null; }).filter(Boolean);
    if(mg&&!lipo){ if(d5.length){ const v=Math.min(...d5), c=mg/v; add(c>0.1?'warn':'ok',`ความเข้มข้น: ${f(mg)} mg ÷ D5W ${v} ml = ${f(c)} mg/ml${c>0.1?` — เกิน 0.1 mg/ml (peripheral) · ใช้ D5W ${[100,250,500,1000].find(v=>v>=mg/0.1)||1000} ml (≥ ${f(mg/0.1)} ml) หรือให้ทาง central line`:' (≤0.1 mg/ml ✓)'}`); }
      else add('info',`ผสมใน D5W ให้ความเข้มข้น ≤0.1 mg/ml → ${f(mg)} mg ใช้ D5W ${[100,250,500,1000].find(v=>v>=mg/0.1)||1000} ml`); }
    if(dur&&!lipo) add(+dur<2?'flag':+dur<4?'warn':'ok',`เวลาให้ ${dur} ชม. — conventional ให้ 4–6 ชม. (ขั้นต่ำ 2 ชม.)`);
    // prehydration + K/Mg
    const nss=R.some(x=>x!==row&&/\b(nss|0\.9\s*%\s*nacl)\b/i.test(x.raw)), kcl=R.some(x=>/kcl|pot\.?\s*chlor|potassium\s*chlor|elixir\s*kcl/i.test(x.raw)), mgs=R.some(x=>/mgso4|mag\.?\s*sulf|magnesium/i.test(x.raw));
    add(nss?'ok':'warn',nss?'มี NSS — ให้ก่อน AmB 500–1,000 ml (prehydration) ลดพิษต่อไต':'ไม่พบ NSS — แนะนำ NSS 500–1,000 ml ก่อนให้ AmB ทุกครั้ง (ลดพิษต่อไต)');
    if(!lipo&&(!kcl||!mgs)) add('info',`เสริม K/Mg ระหว่างได้ AmB (WHO): KCl 20 mEq/วัน${kcl?' ✓':''} · Mg 8 mEq/วัน${mgs?' ✓':''} · ตรวจ Cr/K/Mg สัปดาห์ละ 2–3 ครั้ง + CBC สัปดาห์ละครั้ง`);
    // One Day + Continuous ของ AmB ซ้ำ
    const dup=R.filter(x=>/amphotericin|fungizone|ambisome/i.test(x.raw)).length; if(dup>1) add('warn',`พบ Amphotericin B ${dup} รายการ (One Day + Continuous) — ยืนยันว่าวันนี้ให้ครั้งเดียว ไม่ซ้ำ (จ่ายวันนี้ 1 ชุด)`);
    if(pt&&pt.crcl!=null&&!lipo) add('info',`AmB ไม่ปรับขนาดตาม CrCl — ถ้า Cr เพิ่ม >2 เท่าจากเดิม พิจารณาเว้น 1 วัน/ลดเป็น 0.5–0.7 mg/kg หรือเปลี่ยน liposomal`);
  }
  // ---------- Fluconazole ขนาดสูง (crypto) ----------
  if(/fluconazole|diflucan/i.test(raw)&&row.doseVal!=null&&row.F!=null){ const per=row.strength||(/200/.test(raw)?200:/100/.test(raw)?100:/50\b/.test(raw)?50:1), mgD=row.doseUnit==='mg'?row.doseVal:row.doseVal*per, day=mgD*row.F;
    const amb=R.some(x=>/amphotericin|fungizone|ambisome/i.test(x.raw));
    if(day>=600&&amb){ const cr=pt&&pt.crcl; add(day>1200?'flag':'ok',`Fluconazole ${f(mgD)} mg × ${row.F} = ${f(day)} mg/วัน + Amphotericin B → induction cryptococcal meningitis: WHO (ไม่มี flucytosine) AmB 1 mg/kg + Fluconazole 1,200 mg/วัน × 1 สัปดาห์ แล้ว Fluconazole 1,200 mg/วัน ต่ออีก 1 สัปดาห์ · IDSA/ไทย: 800 mg/วัน${day>1200?' · เกิน 1,200 mg/วัน':''}`);
      if(cr!=null&&cr<50) add('warn',`CrCl ${Math.round(cr)} (<50) → ลด fluconazole 50% = ${f(day/2)} mg/วัน (หลังให้ loading วันแรกขนาดเต็ม)`);
      add('info','ระยะต่อ: consolidation 400–800 mg/วัน × 8 สัปดาห์ → maintenance 200 mg/วัน ≥1 ปี (CD4 >100–200 + VL undetectable จึงหยุดได้) · AmB + fluconazole ↑ QT/ตับ — ตรวจ LFT, K'); }
  }
  // ---------- Itraconazole ----------
  if(/itraconazole|sporal|sporanox/i.test(raw)){ const oth=R.filter(x=>x!==row).map(x=>x.raw).join(' | '), pulse=/pulse|x\s*7\s*วัน|×\s*7\s*วัน|7\s*วัน\s*\/\s*เดือน|7\s*days/i.test(raw), load=/load|tid|วันละ\s*3\s*ครั้ง|x\s*3\s*วัน/i.test(raw);
    r.items=r.items.filter(i=>!(pulse||load)||!/เกินขนาดสูงสุด|เกิน max|> ?max/i.test(i.txt));
    if(pulse) add('ok','Pulse therapy (onychomycosis): 200 mg วันละ 2 ครั้ง × 7 วัน แล้วหยุด 3 สัปดาห์ = 1 รอบ · เล็บมือ 2 รอบ · เล็บเท้า 3 รอบ (แนวทางโรคเชื้อราที่เล็บ 2568 ⚑)');
    if(/onycho|เชื้อราที่เล็บ|tinea\s*ungu/i.test(raw+' '+oth)&&!pulse) add('info','Onychomycosis: แบบต่อเนื่อง 200 mg วันละครั้ง — เล็บมือ 6 สัปดาห์ · เล็บเท้า 12 สัปดาห์ · ตรวจ LFT ก่อนและหลังใช้ยา 4–6 สัปดาห์');
    const ddi=[[/simvastatin|lovastatin/i,'flag','Simvastatin/Lovastatin — ห้ามใช้ร่วม (CYP3A4 → rhabdomyolysis)'],[/atorvastatin/i,'warn','Atorvastatin — ระดับยาเพิ่ม จำกัด ≤20 mg/วัน หรือหยุดชั่วคราว'],[/midazolam|triazolam/i,'warn','Midazolam/Triazolam — ระดับยาเพิ่มมาก (oral ห้ามใช้ร่วม)'],[/colchicine/i,'warn','Colchicine — ระดับยาเพิ่ม (ห้ามถ้าไต/ตับบกพร่อง)'],[/ergot|ergotamine|cafergot/i,'flag','Ergotamine — ห้ามใช้ร่วม'],[/rivaroxaban|apixaban|ticagrelor/i,'warn','Rivaroxaban/Apixaban/Ticagrelor — ระดับยาเพิ่ม เลือดออกง่าย หลีกเลี่ยง'],[/digoxin/i,'warn','Digoxin — ระดับยาเพิ่ม ติดตามระดับยา/อาการพิษ'],[/rifampi|phenytoin|carbamazepine|phenobarb/i,'flag','Rifampicin/Phenytoin/Carbamazepine — ลดระดับ itraconazole จนไม่ได้ผล หลีกเลี่ยง'],[/omeprazole|pantoprazole|esomeprazole|lansoprazole|famotidine|ranitidine|antacid|alum/i,'warn','PPI/H2RA/ยาลดกรด — ลดการดูดซึม itraconazole แคปซูล (ใช้ชนิดน้ำตอนท้องว่าง หรือกินแคปซูลกับน้ำอัดลม/อาหาร)'],[/amiodarone|quinidine|dofetilide|methadone|domperidone/i,'flag','ยาที่ทำให้ QT ยาว (amiodarone/quinidine/domperidone/methadone) — ห้ามใช้ร่วม']];
    ddi.forEach(([re,l,t])=>{ if(re.test(oth)) add(l,'Itraconazole + '+t); });
    add('info',`Itraconazole: ${/sol|syr|10\s*mg\s*\/\s*ml/i.test(raw)?'ชนิดน้ำ กินตอนท้องว่าง':'แคปซูล กินหลังอาหารทันที'} · ห้ามใน CHF/ventricular dysfunction · ไม่ปรับตามไต · ตรวจ LFT`); }
  // ---------- Fluconazole รายสัปดาห์ (onychomycosis) ----------
  if(/fluconazole|diflucan/i.test(raw)&&/สัปดาห์ละ|weekly|ทุกสัปดาห์|once\s*a\s*week|\/\s*wk/i.test(raw)){ const mg=(row.doseUnit==='mg'?row.doseVal:(row.doseVal||1)*(row.strength||((raw.match(/(\d{2,3})\s*mg/i)||[])[1]||0)));
    if(mg) add(mg>450?'warn':mg<150?'warn':'ok',`Fluconazole ${f(mg)} mg สัปดาห์ละครั้ง — onychomycosis 150–450 mg/สัปดาห์ (เล็บมือ 3–9 · เล็บเท้า 6–18 เดือน) · ประสิทธิภาพด้อยกว่า itraconazole/terbinafine (แนวทางโรคเชื้อราที่เล็บ 2568 ⚑)`); }
 }catch(e){} return r; })(evaluate);
