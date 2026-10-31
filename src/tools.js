/* ===== tools.js — นับเม็ดยาถึงวันนัด (ARV/ยาต่อเนื่อง) · แท็บคู่มือย่อ ===== */

/* ---------- 1) นับเม็ดยาถึงวันนัด (จากไฟล์คำนวณยา ARV) ---------- */
let arvRows=[{nm:'',pd:'',left:'',add:''}];
function arvDays(){ const d=$('aCntUntil').value.trim(); if(d){ const t=tlDate(d); if(t){ const n=new Date(); n.setHours(0,0,0,0); t.setHours(0,0,0,0); return Math.round((t-n)/864e5); } } return +$('aCntDays').value||0; }
function arvCalc(){ const days=arvDays();
  $('aCntInfo').textContent=days>0?`จำนวนวันถึงนัด: ${days} วัน`:'กรอกจำนวนวันนัด หรือวันนัด';
  $('aCntTbl').querySelectorAll('tr[data-i]').forEach(tr=>{ const r=arvRows[+tr.dataset.i];
    const pd=+r.pd||0, left=+r.left||0, ad=+r.add||0, tot=left+ad, need=Math.ceil(pd*days-1e-9), diff=tot-need, sh=Math.max(0,need-left);
    const c=tr.querySelectorAll('td.o');
    c[0].textContent=pd?fmtN(tot):''; c[1].textContent=pd&&days?fmtN(need):'';
    c[2].innerHTML=!pd||!days?'':diff<0?`<span class="tag flag">ขาด ${fmtN(-diff)}</span>`:diff>pd*7?`<span class="tag warn">เกิน ${fmtN(diff)}</span>`:`<span class="tag ok">พอ${diff?` (+${fmtN(diff)})`:''}</span>`;
    c[3].innerHTML=pd&&days?`<b>${fmtN(sh)} เม็ด</b>`:''; });
}
function arvRender(){
  $('aCntTbl').innerHTML=`<table class="ctbl"><thead><tr><th>ยา</th><th>เม็ด/วัน</th><th>ยาเหลือ (เม็ด)</th><th>สั่งเพิ่ม (เม็ด)</th><th>รวมที่ได้</th><th>ต้องใช้ถึงนัด</th><th>ขาด/เกิน</th><th>ควรจ่าย (ยาเหลือแล้ว)</th><th></th></tr></thead><tbody>${arvRows.map((r,i)=>`<tr data-i="${i}"><td><input data-k="nm" value="${esc(r.nm)}" placeholder="เช่น TLD" style="min-width:130px"></td><td><input data-k="pd" type="number" step="0.5" value="${esc(r.pd)}" style="width:70px"></td><td><input data-k="left" type="number" value="${esc(r.left)}" style="width:80px"></td><td><input data-k="add" type="number" value="${esc(r.add)}" style="width:80px"></td>
      <td class="num o"></td><td class="num o"></td><td class="o"></td><td class="num o"></td><td><button type="button" class="btn sm" data-del>ลบ</button></td></tr>`).join('')}</tbody></table>`;
  $('aCntTbl').querySelectorAll('tr[data-i]').forEach(tr=>{ const r=arvRows[+tr.dataset.i];
    tr.querySelectorAll('input[data-k]').forEach(inp=>inp.addEventListener('input',()=>{ r[inp.dataset.k]=inp.value; arvCalc(); }));
    tr.querySelector('[data-del]').onclick=()=>{ arvRows.splice(+tr.dataset.i,1); if(!arvRows.length) arvRows.push({nm:'',pd:'',left:'',add:''}); arvRender(); }; });
  arvCalc();
}
(function(){ if(!$('aCntTbl')) return; $('aCntAdd').onclick=()=>{ arvRows.push({nm:'',pd:'',left:'',add:''}); arvRender(); };
  ['aCntDays','aCntUntil'].forEach(id=>$(id).addEventListener('input',arvCalc)); arvRender(); })();

/* ---------- 2) คู่มือย่อ ---------- */
const REF=[
 {id:'faq-pen',t:'คำถามพบบ่อย: แพ้ penicillin ใช้ cephalosporin ตัวไหนได้',src:'Beta-lactam cross-allergy chart (side chain R1) · ตรงกับกฎใน cross.js',h:`
 <p><b>หลักการ:</b> แพ้ข้าม penicillin → cephalosporin ต่ำ (~1–2%) และขึ้นกับ <b>side chain (R1)</b> เป็นหลัก ไม่ใช่ beta-lactam ring · ยกเว้นแพ้แบบรุนแรงชนิดล่าช้า (SJS/TEN/DRESS/AGEP, ไตอักเสบ, ตับอักเสบ, hemolytic anemia) → <b>หลีกเลี่ยง beta-lactam ทุกตัว</b></p>
 <table class="ctbl"><tr><th>Cephalosporin</th><th>แพ้ penicillin ทั่วไป / amoxicillin / ampicillin</th><th>หมายเหตุ</th></tr>
 <tr><td><b>Cefazolin</b></td><td>✓ ใช้ได้</td><td>side chain เฉพาะตัว ไม่เหมือน beta-lactam อื่น</td></tr>
 <tr><td><b>Cefotaxime / Ceftriaxone / Cefepime</b></td><td>✓ ใช้ได้</td><td>side chain (methoxyimino) ต่างจาก penicillin · แต่ 3 ตัวนี้แพ้ข้ามกันเอง</td></tr>
 <tr><td><b>Ceftazidime</b></td><td>✓ ใช้ได้</td><td>side chain เหมือน <b>aztreonam</b> (แพ้ ceftazidime ห้ามใช้ aztreonam)</td></tr>
 <tr><td>Cefuroxime / Cefixime / Cefdinir / Cefpodoxime</td><td>✓ ใช้ได้</td><td>ต่างจาก penicillin</td></tr>
 <tr><td>Cephalexin / Cefadroxil / Cefaclor (Cefprozil)</td><td>✗ <b>หลีกเลี่ยง</b> ถ้าแพ้ amoxicillin/ampicillin</td><td>side chain เหมือน/คล้าย aminopenicillin</td></tr>
 <tr><td>Cefoxitin</td><td>⚠ ระวังถ้าแพ้ penicillin G/V</td><td>side chain คล้าย benzylpenicillin</td></tr>
 <tr><td>Cefoperazone</td><td>⚠ ระวังถ้าแพ้ piperacillin</td><td>side chain คล้ายกัน</td></tr>
 <tr><td>Carbapenem</td><td>✓ ใช้ได้ (แพ้ข้าม &lt;1%)</td><td>Aztreonam ใช้ได้ (ยกเว้นแพ้ ceftazidime)</td></tr></table>
 <ul><li><b>เคย anaphylaxis จาก penicillin:</b> ใช้ cephalosporin ที่ side chain ต่างได้ แต่แนะนำ test dose / graded challenge ภายใต้การดูแล</li>
 <li><b>ไม่ทราบว่าแพ้ penicillin ตัวไหน:</b> ถือว่าอาจเป็น amoxicillin/ampicillin → เลี่ยง cephalexin/cefadroxil/cefaclor · ระบุชื่อยาและอาการที่แพ้ในช่อง "แพ้ยา" เพื่อให้โปรแกรมประเมินแม่นขึ้น</li></ul>`},
 {id:'ac',t:'ยาต้านการแข็งตัวของเลือด (Heparin · Enoxaparin · Dabigatran · Warfarin ตั้งครรภ์)',src:SRC_AC,h:`
 <h3>Enoxaparin — ปรับตามไต</h3><ul><li>CrCl ≥30: ไม่ต้องปรับ</li><li>CrCl &lt;30: VTE prophylaxis 30 mg SC OD · VTE treatment 1 mg/kg SC OD · NSTEMI 1 mg/kg SC OD · STEMI &lt;75 ปี 30 mg IV แล้ว 1 mg/kg SC OD, ≥75 ปี ไม่ให้ IV bolus</li><li>Dialysis: ไม่ได้รับรองโดย FDA · Heparin ไม่ต้องปรับตามไต/ตับ</li></ul>
 <h3>Dabigatran (110 mg cap)</h3><ul><li>AF: 150 mg bid หรือ 110 mg bid (เสี่ยงเลือดออก) · DVT/PE: 150 mg bid (provoked 3 เดือน) · THA/TKA: 110 mg 1–4 ชม. หลังผ่าตัด แล้ว 220 mg OD</li><li>ไต: VTE — CrCl ≤30/HD ไม่แนะนำ · AF — CrCl 30–50 ไม่ต้องปรับ (ยกเว้นใช้ร่วม dronedarone/ketoconazole: 75 mg) · &lt;15 ไม่แนะนำ</li>
 <li>DI: ↑ระดับยา — amiodarone, verapamil, clarithro/erythromycin, ketoconazole/itraconazole/voriconazole (140–150%), cyclosporine, tacrolimus, ticagrelor · ↓ระดับยา — rifampicin (−66%), carbamazepine, phenytoin, phenobarbital, dexamethasone, St John's wort · PPI/H2/antacid ลด 12–30%</li>
 <li>เพิ่มระดับยา: อายุ ≥75–80, น้ำหนัก ≤60 kg · เพิ่มเสี่ยงเลือดออก: antiplatelet/NSAID/steroid, เคยเลือดออก GI, ผ่าตัดอวัยวะสำคัญ, เปราะบาง/หกล้มง่าย, ซีด/เกล็ดเลือดต่ำ</li>
 <li>ลืมยา: bid ไม่เกิน 6 ชม. กินทันที · เกิน 6 ชม. ข้ามมื้อ · OD ไม่เกิน 12 ชม. กินทันที · ห้ามเพิ่มขนาด</li></ul>
 <h3>การเปลี่ยนยา</h3><table class="ctbl"><tr><th>จาก → ไป</th><th>วิธี</th></tr>${Object.entries(AC_TR).map(([k,v])=>`<tr><td>${k.split('>').map(x=>AC_NM[x]).join(' → ')}</td><td>${v}</td></tr>`).join('')}</table>
 <h3>เลือดออก / ยาแก้ฤทธิ์</h3><table class="ctbl"><tr><th>ยา</th><th>การจัดการ</th></tr><tr><td>Warfarin</td><td>INR 5–8.9: vit K 1 mg PO · INR ≥9: 5–10 mg PO · major bleeding: vit K 10 mg + FFP 15–30 ml/kg · PCC: INR 4–6 = 35 U/kg (≤3,500 U), INR &gt;6 = 50 U/kg (≤5,000 U)</td></tr><tr><td>Heparin</td><td>Protamine 1–1.5 mg ต่อ heparin 100 unit</td></tr><tr><td>Dabigatran</td><td>Idarucizumab 5 g IV (2.5 g × 2 ห่างไม่เกิน 15 นาที) · PCC 50 U/kg (+25 U/kg) · aPCC 50 U/kg (max 200 U/kg/วัน) · ไม่แนะนำ FFP · tranexamic 1 g IV q6h เสริมได้</td></tr></table>
 <h3>Warfarin ในหญิงตั้งครรภ์ (ลิ้นหัวใจเทียม · ESC 2018/แนวทางไทย)</h3><ul><li>ไตรมาส 1: warfarin ≤5 mg/วัน — ใช้ต่อได้ (INR ทุกสัปดาห์) หรือ admit เปลี่ยน enoxaparin bid / heparin (aPTT ≥2× control) · warfarin &gt;5 mg/วัน — เปลี่ยนเป็น heparin หรือ enoxaparin bid ช่วงสัปดาห์ 6–12</li><li>ไตรมาส 2–3: warfarin (INR ทุกสัปดาห์ อย่างน้อย 2 สัปดาห์)</li><li>สัปดาห์ 36: เปลี่ยนเป็น enoxaparin/heparin · 36 ชม. ก่อนคลอด: heparin (aPTT ≥2×) · หยุด 4–6 ชม. ก่อนคลอด เริ่มใหม่ 4–6 ชม. หลังคลอดถ้าไม่มีเลือดออก</li><li>VTE: ใช้ enoxaparin/heparin ตลอดการตั้งครรภ์</li></ul>`},
 {id:'tb',t:'ADR จากยาต้านวัณโรค — การจัดการและ rechallenge',src:SRC_TBADR,h:`
 <h3>คลื่นไส้ อาเจียน ปวดท้อง (มักสัปดาห์แรก, PZA บ่อยสุด)</h3><ul><li>กินพร้อม/หลังอาหารทันที · กินก่อนนอน · split dose (เช่น PZA 1500 mg OD → 500 mg tid) + domperidone ก่อนยา — ไม่ต้องหยุดยา</li></ul>
 <h3>ผื่น</h3><ul><li>ไม่รุนแรง (คัน ผื่นเล็กน้อย ไม่มี mucosa): ให้ยาต่อ + antihistamine (CPM, hydroxyzine) · ไม่ดีขึ้นใน 3 วัน → prednisolone 5 mg bid 5 วัน</li><li>รุนแรง (ผื่นกว้าง mucosa ไข้): หยุดยาทั้งหมด รักษาจนหาย · SJS/TEN/exfoliative อาจต้อง systemic steroid · SJS/TEN ห้ามให้ยาซ้ำ</li><li>Rechallenge หลังผื่น: เริ่มทีละตัว ห่าง 2–3 วัน เริ่ม RFP → INH → EMB → PZA · ครบ 3 ตัวไม่มีผื่น ไม่ต้องให้ตัวที่ 4</li></ul>
 <table class="ctbl"><tr><th>ยา (WHO)</th><th>วันที่ 1</th><th>วันที่ 2</th><th>วันที่ 3</th></tr><tr><td>INH</td><td>50</td><td>300</td><td>300</td></tr><tr><td>RMP</td><td>75</td><td>300</td><td>full</td></tr><tr><td>PZA</td><td>250</td><td>1 g</td><td>full</td></tr><tr><td>EMB</td><td>100</td><td>500</td><td>full</td></tr><tr><td>SM</td><td>125</td><td>500</td><td>full</td></tr></table>
 <p>Desensitization: เริ่ม 1/10 ของขนาดปกติ เพิ่มวันละ 1/10 จนครบวันที่ 10 (INH → EMB → RMP) ระหว่างนั้นให้ยาที่ไม่เคยได้ 2 ตัว</p>
 <h3>ตับอักเสบจากยา</h3><ul><li>เกณฑ์: AST/ALT &gt;5×ULN หรือ &gt;3×ULN ร่วมกับอาการ (เบื่ออาหาร คลื่นไส้ อาเจียน อ่อนเพลีย) และไม่พบสาเหตุอื่น</li><li>สงสัยแต่ไม่เข้าเกณฑ์: ให้ยาต่อ ตรวจ LFT ทุก 3–5 วัน แย่ลง → หยุดทุกตัว</li><li>เข้าเกณฑ์: หยุดทุกตัว (ส่วนใหญ่ PZA, INH) · TB/DB ขึ้นอย่างเดียว → หยุดเฉพาะ RFP · รุนแรง/แพร่เชื้อ ให้ SM + EMB (± quinolone) ระหว่างรอ</li><li>Rechallenge เมื่ออาการหายและ LFT &lt;2×ULN, T.bil &lt;1.5 mg/dL: INH 100 → 200 → 300 · RFP 150 เพิ่มเท่าตัวทุกวันจน 10 mg/kg · PZA 500 เพิ่มเท่าตัวจน 25 mg/kg (มักไม่แนะนำให้ซ้ำ) · หลังครบแต่ละตัวหยุด 3 วัน ตรวจ LFT ปกติจึงเริ่มตัวถัดไป · เริ่มนับยาใหม่ + EMB</li><li>สูตรทางเลือกเมื่อใช้ยาตัวใดไม่ได้: 2SHRE/6HR · 2HRE/7HR · 2HZE/10HE · 2SH(R)E/10H(R)E · 2SOE/16OE</li><li>เวลาเกิด: INH 8–12 สัปดาห์ · RFP 2 เดือนแรก (cholestasis) · PZA ~1 เดือน (dose-dependent)</li></ul>
 <h3>ADR เฉพาะยา</h3><table class="ctbl"><tr><th>อาการ</th><th>ยา</th><th>หมายเหตุ</th></tr><tr><td>ปลายประสาทอักเสบ</td><td>INH</td><td>ป้องกัน B6 10 mg/วัน (กลุ่มเสี่ยง 25–50) · รักษา 100–200 mg/วัน</td></tr><tr><td>Optic neuritis</td><td>EMB</td><td>&gt;2 เดือน · 25 mg/kg พบ 5–6%, &gt;35 mg/kg 18% · ตาพร่า ตาบอดสีแดง-เขียว</td></tr><tr><td>ปวดข้อ/เก๊าต์</td><td>PZA</td><td></td></tr><tr><td>หูตึง เวียนศีรษะ ไตวาย</td><td>Streptomycin</td><td>หูเสียถาวร</td></tr></table>
 <p><b>ห้ามให้ยาซ้ำ:</b> หูตึง/เสียการทรงตัว → SM · ไตวาย ช็อก เกล็ดเลือดต่ำ → RMP · ตามัว ตาบอดสี → EMB · ตับอักเสบ → PZA · SJS/TEN/exfoliative → ทุกตัว</p>`},
 {id:'pal',t:'Palliative: opioid และการจัดการอาการ',src:SRC_PAL,h:`
 <h3>เริ่มและปรับยา</h3><ul><li>Morphine oral เริ่ม 30 mg/วัน · ลด 50%: ปวดปานกลาง, หอบขณะพัก, สูงอายุ/เปราะบาง, ตับ/ไตบกพร่อง · ESRD ลด 75%</li><li>Fentanyl เริ่ม 0.5–1 mcg/kg/h (ผู้ใหญ่ 25–50, สูงอายุ 10–25 mcg/h)</li><li>ปรับ: เพิ่ม 30–50–100% ของ dose ต่อวัน หรือรวม rescue ที่ใช้ใน 24 ชม. · rescue ≥3 ครั้ง/วัน → เพิ่ม background</li><li>Breakthrough: morphine 1/6 ของ dose ต่อวัน (1/6–1/12 หรือ 10–20%)</li></ul>
 <h3>แปลงขนาด</h3><table class="ctbl"><tr><th>จาก → ไป</th><th>อัตราส่วน</th></tr><tr><td>Codeine PO → Morphine PO</td><td>10:1</td></tr><tr><td>Tramadol PO → Morphine PO</td><td>5:1</td></tr><tr><td>Morphine PO → Morphine SC/IV</td><td>3:1</td></tr><tr><td>Morphine PO → Oxycodone PO</td><td>1.5–2:1</td></tr><tr><td>Morphine PO → Fentanyl</td><td>100:1 (morphine 60 mg/วัน ≈ patch 25 mcg/h ตามสไลด์ · ตาราง OME ห้องยาใช้ patch ×2)</td></tr></table>
 <ul><li>Fentanyl patch: ใช้เมื่อคุมปวดได้แล้ว/กินไม่ได้ · เริ่ม 12.5–25 mcg/h ประเมิน 48–72 ชม. · ต้องให้ยาระงับปวดต่อ 12–24 ชม. หลังแปะ · เปลี่ยน patch → morphine ใน 24 ชม. แรกให้ครึ่งขนาด</li><li>Fentanyl SL 12.5 mcg ก่อนหัตถการ 5–10 นาที ซ้ำได้ 2 ครั้ง</li><li>Pethidine ไม่ควรใช้ต่อเนื่อง · Oxycodone หลีกเลี่ยงใน ESRD</li></ul>
 <h3>ผลข้างเคียง</h3><ul><li>ท้องผูก: stimulant + softener laxative, rectal ถ้าจำเป็น · ไม่ใช้ fiber laxative</li><li>คลื่นไส้: metoclopramide, haloperidol (ondansetron ทำให้ท้องผูก)</li><li>ง่วง: ลดขนาด 30–50% / methylphenidate 2.5 mg เช้า · Myoclonus: ลดขนาด 30–50%, clonazepam 0.5 tab hs, baclofen</li><li>กดการหายใจ: RR &lt;8, hypoxemia → naloxone · naïve 0.4 mg IV ซ้ำ q2 นาที · ใช้ opioid ประจำ: เจือจาง 0.4 mg + NSS 9 ml (0.04 mg/ml) ให้ 1 ml q2 นาทีจน RR &gt;10 · max 15 mg</li></ul>
 <h3>หอบเหนื่อย</h3><ul><li>Opioid-naïve: morphine 2.5–5 mg PO q4–6h prn · ใช้ &gt;2 ครั้ง/วัน → regular · ใช้ morphine อยู่แล้ว: เพิ่ม 30%</li><li>วิตกกังวล: diazepam 2–5 mg tid · lorazepam 0.5–1 mg SL/PO q8h prn · midazolam 2.5–5 mg SC q4h</li><li>ไม่แนะนำ nebulized opioid</li></ul>`},
 {id:'psy',t:'จิตเวช: Antipsychotics',src:SRC_PSY,h:`
 <table class="ctbl"><tr><th>ยา</th><th>≈ CPZ 100 mg</th><th>ขนาดปกติ (mg/วัน)</th><th>CYP</th></tr>${APS.map(a=>`<tr><td>${a[0]}</td><td>${a[3]}</td><td>${a[2][0]}–${a[2][1]}</td><td>${a[4]||'–'}</td></tr>`).join('')}</table>
 <ul><li>Acute phase 4–8 สัปดาห์ · ไม่ตอบสนอง 4 สัปดาห์ / ตอบสนองบางส่วน 8 สัปดาห์ จึงเปลี่ยน · ตรวจ: วินิจฉัย ขนาด ระยะเวลา การกินยา DI</li><li>Maintenance: ≈ CPZ 300–400 / risperidone 4–6 mg/วัน · first episode ≥18 เดือน · relapse ≥5 ปี/ตลอดชีวิต</li><li>Treatment-resistant (ไม่ตอบสนอง ≥2 ตัว ≥6 สัปดาห์) → clozapine: เริ่ม 12.5 mg/วัน max 900 · ANC (neutropenia 2.7%, agranulocytosis 0.8%) · ชักเมื่อ &gt;600 mg · myocarditis</li><li>High-potency FGA: EPS/NMS สูง · NMS: หยุดยา สารน้ำ ลดไข้ bromocriptine/dantrolene เริ่มใหม่ ≥2 สัปดาห์</li><li>SGA: น้ำหนักขึ้น · risperidone prolactin สูง · clozapine/olanzapine ลด insulin sensitivity · aripiprazole akathisia</li><li>DI: 1A2 (clozapine, olanzapine) ← fluvoxamine ↑ · บุหรี่ ↓ · 2D6 (risperidone, aripiprazole) ← fluoxetine/paroxetine ↑ · 3A4 (clozapine, quetiapine, aripiprazole) ← macrolide, azole, PI ↑ / carbamazepine, phenytoin, rifampicin, barbiturate ↓</li></ul>`},
 {id:'xa',t:'แพ้ยาข้ามกลุ่ม (Drug Allergy & Cross-Reactivity update)',src:'สไลด์ Drug Allergy & Cross-Reactivity (update) · Thai HP',h:`
 <p>ใช้ร่วมกับช่อง "แพ้ยา" ในแผงผู้ป่วย — โปรแกรมตรวจแพ้ข้ามให้อัตโนมัติ (beta-lactam, NSAIDs, ยากันชัก, sulfonamide, macrolide, quinolone, azole, PPI, antihistamine, statin) · ระบุชนิดอาการ เช่น "ciprofloxacin anaphylaxis", "omeprazole SJS"</p>
 <h3>Quinolone</h3><table class="ctbl"><tr><th>แพ้</th><th>ใช้แทนได้</th></tr><tr><td>Gen 1 (nalidixic)</td><td>Gen 3–4: levofloxacin, moxifloxacin, gatifloxacin</td></tr><tr><td>Gen 2 (norflox, cipro, oflox)</td><td>Gen 4: moxifloxacin, gatifloxacin</td></tr><tr><td>Gen 3 (levofloxacin)</td><td>Gen 1–2</td></tr><tr><td>Gen 4 (moxifloxacin)</td><td>Gen 1, 3</td></tr></table><p>Type I/IgE หรือ SJS/TEN/DRESS/AGEP → หลีกเลี่ยงทั้งกลุ่ม · อาการไม่รุนแรง (urticaria, MPE, FDE) → desensitization ภายใต้การดูแล</p>
 <h3>Macrolide</h3><p>แพ้ข้ามมีรายงานน้อย แต่ถ้าแพ้รุนแรง เปลี่ยนกลุ่มยาปลอดภัยกว่า · ถ้าจำเป็นทดสอบ/desensitization</p>
 <h3>Azole</h3><p>โครงสร้างร่วมที่มีรายงาน: imidazole (miconazole/ketoconazole) · triazole (fluconazole/itraconazole) · Cl (clotrimazole/itraconazole) · F (fluconazole/voriconazole) · propan-2-ol (fluconazole/ketoconazole กับ metronidazole/tinidazole/ornidazole)</p>
 <h3>Sulfonamide / PPI (Thai HP)</h3><ul><li>แพ้ sulfa รุนแรง (anaphylaxis, SJS/TEN, DRESS, AGEP) → ไม่ใช้ non-antimicrobial sulfonamide เว้นแต่จำเป็นและไม่มียาอื่น (test dose) · ไม่รุนแรง → ใช้ non-antimicrobial ได้ แต่ counseling + test dose</li><li>แพ้ PPI รุนแรง → หลีกเลี่ยงทั้งกลุ่ม · ไม่รุนแรง → หลีกเลี่ยงทั้งกลุ่ม หรือถ้าจำเป็นเลือกตัวอื่นและเฝ้าระวัง</li></ul>
 <h3>ยากันชัก · Antihistamine · Statin</h3><ul><li>แพ้ aromatic (phenytoin, phenobarbital, lamotrigine, carbamazepine) → ใช้ non-aromatic (valproate, levetiracetam, topiramate, gabapentin, pregabalin)</li><li>Antihistamine: แพ้ข้ามสูงในสายแม่-เมแทบอไลต์ hydroxyzine → cetirizine → levocetirizine · loratadine → desloratadine · terfenadine → fexofenadine · triprolidine → acrivastine</li><li>Statin: type I (lova, simva, prava) vs type II (atorva, rosuva, fluva, pitava) — ข้อมูลแพ้ข้ามน้อย</li></ul>`},
 {id:'pol69',t:'มาตรการควบคุมค่าใช้จ่ายด้านยาผู้ป่วยใน 2569 (ยาเดิม · ยากลับบ้าน · ยารีเฟอร์)',src:'สรุปมาตรการการควบคุมค่าใช้จ่ายด้านยาผู้ป่วยใน รพ.มหาสารคาม 2569',h:`
 <ol><li><b>MR</b> แรกรับ ระหว่างนอน และกลับบ้าน</li>
 <li><b>งดจ่ายยาพ่น/insulin ราคาแพงในผู้ป่วยรับใหม่ที่มียาเดิม*</b> — กลุ่ม 1 ยาพ่นปาก (Flixotide, Seretide, Symbicort, Spiriva, Spiolto, Anoro, Trelegy) · กลุ่ม 2 ยาพ่นจมูก (Avamys, Mar-plus, Nasonex, Budesonide) · กลุ่ม 3 insulin (Ryzodec, Degludec, Xultophy)
  <ul><li><b>แพทย์:</b> ผู้ป่วยนำยามา → เขียน "ใช้ยาเดิมของผู้ป่วย" ในออเดอร์แรกรับ/ใบ MR · ไม่ได้นำมา: กลุ่ม 2 พิจารณาใช้ยาอื่น · กลุ่ม 1 และ 3: ≤48 ชม. พิจารณาใช้ยาอื่นแทน / >48 ชม. นำมาไม่ได้ สั่งยาและแจ้งพยาบาลเบิกจากห้องยา</li>
  <li><b>พยาบาล:</b> กลุ่ม 1–2 เก็บไว้กับผู้ป่วยให้บริหารเอง (แจ้ง/Notify เภสัชกรถ้าเปลี่ยนขนาด) · กลุ่ม 3 เก็บในลิ้นชัก/ตู้เย็นวอร์ด พยาบาลบริหารตามออเดอร์ · ไม่ได้นำมา แจ้งญาตินำมาโดยเร็ว</li>
  <li><b>เภสัชกร:</b> มีประวัติยาเดิมและยาเหลือ → สติ๊กเกอร์จำนวน 0 + "ใช้ยาเดิมของผู้ป่วย" · ไม่มีประวัติรับยาที่ รพ.มค / ยังนำมาไม่ได้ → consult แพทย์ · insulin อายุ 6 สัปดาห์หลังเปิดใช้ (อุณหภูมิห้อง)</li></ul></li>
 <li><b>ค่ายากลับบ้าน/ยารีเฟอร์</b><ul><li>3.1 ค่ายากลับบ้านไม่เกิน <b>1,500 บาท</b> ถ้าเกินให้ตัดวันนัดเหลือ <b>2 สัปดาห์</b> — ยกเว้น (1) เภสัช consult แล้วแพทย์ยืนยันเหตุผลจำเป็น (เลื่อนนัดไม่ได้) (2) ยาฉีดรีเฟอร์กลับไปนอนฉีดต่อ รพช. (3) ยาจับเหล็กชนิดรับประทาน (4) ผู้ป่วยที่มาให้เลือด/Filgrastim ระหว่างยาเคมีบำบัด</li>
  <li>3.2 ยาเดิมผู้ป่วย: เภสัชตรวจสอบประวัติก่อน ถ้ายาเดิมเหลือไม่จ่าย</li>
  <li>3.3 ยารีเฟอร์กลับไปนอนต่อที่ รพช.: จ่ายเฉพาะยาที่ไม่มีในบัญชี รพ.ชุมชน (ยาฉีด antibiotic จ่ายครบคอร์สตามคำสั่งแพทย์)</li></ul></li>
 <li><b>การคืนยา:</b> สื่อสารการคืนยาที่ไม่ได้ใช้ เก็บรักษายาให้คงสภาพตามมาตรฐาน · รับคืนยาเม็ดเปลือย/ยาแผง</li>
 <li><b>วงรอบยา:</b> คีย์ จ่าย ให้ยาตามวงรอบเดิม · พยาบาลลง last dose (มื้อสุดท้ายก่อนมานอน รพ.) ในใบ MR แรกรับ</li>
 <li><b>DUE ระหว่างนอน รพ.:</b> ASP round · switch ยา · กำหนดระยะเวลาให้ยา</li>
 <li><b>จำกัดปริมาณการจ่ายยากลับบ้าน</b> (ดูหัวข้อ "จำกัดปริมาณยากลับบ้าน")</li>
 <li><b>NED1:</b> ชำระเงินทุกสิทธิ์ ยกเว้นเบิกได้จ่ายตรง (ดูหัวข้อ NED1)</li></ol>
 <p class="hint">ในโปรแกรม: แท็บ MR ยากลับบ้านเตือนจำนวนเกินมาตรการ · ช่อง "ยาเหลือ" ใช้หักยาเดิม (3.2) · แท็บตรวจใบสั่งยาเตือนยาเดิม* กลุ่ม 2–3</p>`},
 {id:'dcmax',t:'จำกัดปริมาณการสั่งใช้ยาคนไข้กลับบ้าน (สูงสุดต่อครั้ง)',src:'มาตรการการจำกัดปริมาณการสั่งใช้ยาคนไข้กลับบ้าน 33 รายการ (อ่านได้ 30 รายการจากภาพ)',h:`
 <table class="ctbl"><tr><th>รายการ</th><th>สูงสุด/ครั้ง</th></tr>${DC_MAX.map(x=>`<tr><td>${x[1]}</td><td>${x[2]}</td></tr>`).join('')}</table>
 <p class="hint">ตารางต้นฉบับ 33 รายการ แต่ภาพที่ได้รับเห็น 30 รายการ — รอเพิ่ม 3 รายการที่เหลือ</p>`},
 {id:'ned1',t:'NED1 ฟรีเฉพาะสิทธิ์เบิกได้จ่ายตรง (ปรับปรุง 2569)',src:'รายการยา NED 1 ฟรีเฉพาะคนไข้เบิกได้ จ่ายตรง ปรับปรุง 2569',h:`
 <p>สิทธิ์อื่นชำระเงิน · ยกเว้นเบิกได้จ่ายตรง</p><table class="ctbl"><tr><th>ยา</th><th>ราคา/หน่วย</th></tr>
 <tr><td>Acetylcysteine powder (NAC) 200 mg ซอง</td><td>1.5</td></tr><tr><td>Brimonidine eye drop 0.1% (Alphagan-P)</td><td>341</td></tr><tr><td>Dienogest 2 mg (กล่อง)</td><td>811</td></tr>
 <tr><td>Dinoprostone vaginal tab 3 mg (PEGE2)</td><td>727</td></tr><tr><td>Diosmin+Hesperidin (Daflon) 1000 mg</td><td>6.5</td></tr><tr><td>Estradiol 2 mg+Norgestrel 0.5 mg (Cyclo-progynova)</td><td>ยาขาด</td></tr>
 <tr><td>Nepafenac 0.1% eye drop 5 ml (Nevanac)</td><td>165</td></tr><tr><td>Paracetamol rectal suppo 325 mg</td><td>13</td></tr><tr><td>Selenium sulfide shampoo 2.5% 120 ml</td><td>91</td></tr>
 <tr><td>Testosterone gel 50 mg/5 ml</td><td>75</td></tr><tr><td>Aescin (Reparil) tab</td><td>7.5</td></tr><tr><td>Ketorolac 30 mg/1 ml amp</td><td>120 · จ่ายตรงฟรี P/O 24 hr</td></tr>
 <tr><td>Parecoxib 40 mg inj (Dynastat)</td><td>234 · จ่ายตรงฟรี P/O 24 hr</td></tr><tr><td>Desloratadine 5 mg</td><td>4.25</td></tr></table>`},
 {id:'j2',t:'บัญชี จ(2) · ยามุ่งเป้า (Targeted therapy) · บัญชียาหลักใหม่',src:'รายการยาในบัญชี จ(2) ที่ สปสช.สนับสนุน · งานบริบาลผู้ป่วยเคมีบำบัด รพ.มค · ระบบบัญชียาหลักแห่งชาติ',h:`
 <h3>ยามุ่งเป้า</h3><ul><li><b>TKI</b> (Imatinib 100/400, Nilotinib 200, Dasatinib — จ(2) · Ruxolitinib — NED): จ่ายเฉพาะผู้ป่วยนอก สั่งโดย Hematologist (ตรวจเอกสารขออนุมัติ) · <b>ห้ามจ่ายใน IPD</b> หาก admit ให้ใช้ยาเดิมผู้ป่วย</li>
 <li><b>Bortezomib (NED):</b> UC/ประกันสังคม แพทย์สั่งจากแผนก OPD คิดเงินรวม 4 ครั้งใน 1 cycle (เภสัช OPD ตรวจ dose, safety factor, counseling cycle 1, ใบรับประกันผลิต) · สิทธิ์จ่ายตรง: แพทย์สั่งจาก OPD ห้องยาคิดเงินรวม 4 ครั้งใน 1 cycle ยกรูปแบบ Oral คีย์คิดเงินตามจำนวนที่สั่งทั้งหมดเป็น One day โดยผู้ป่วย admit อายุรกรรมรวม</li></ul>
 <h3>บัญชี จ(2) (36 รายการ)</h3><p>Adalimumab · Antithymocyte globulin · Bevacizumab · Bortezomib · Botulinum toxin A 100/500 IU · Ceftazidime/avibactam · Dasatinib 50/70 · Deferasirox GPO 250 · Erlotinib · Imatinib 100/400 · Imiglucerase · IVIG 5% 50/100 ml · Infliximab · Lacosamide sterile sol · Linezolid 600 tab · Liposomal amphotericin B · Micafungin (50 mg) · Nilotinib · Octreotide LAR 20/30 · Posaconazole tab · Ribavirin · Rituximab 100/500 · Sofosbuvir+Velpatasvir · Thyrotropin alpha · Tocilizumab (80 mg/4 ml) · Trastuzumab 150/440 · Voriconazole inj/tab 200/50</p>
 <h3>บัญชียาหลักแห่งชาติ (ใหม่)</h3><ul><li><b>ยาพื้นฐาน (basic list)</b> ≈ บัญชี ก และ ข เดิม — เลือกใช้ก่อน</li><li><b>ยาทางเลือก (supplemental list)</b> ≈ บัญชี ค เดิม — ลำดับรอง</li><li><b>ยาเฉพาะโรค (exclusive list)</b> ≈ บัญชี ง เดิม — โดยแพทย์ผู้ชำนาญ ติดตามความเหมาะสม</li><li>บัญชีพิเศษ จ(1) ยาโครงการภาครัฐ · จ(2) กำกับโดยกองทุน 3 กองทุน</li></ul>`},
 {id:'pgx',t:'การส่งตรวจยีนแพ้ยา HLA-B (Allopurinol · Carbamazepine · Abacavir)',src:'การส่งตรวจยีนแพ้ยา รพ.มหาสารคาม (งานติดตามอาการไม่พึงประสงค์จากยา)',h:`
 <p><b>เกณฑ์ส่งตรวจ:</b> ไม่เคยตรวจยีน · ผู้ป่วยรายใหม่ ยังไม่เริ่มยาหรือใช้มาไม่เกิน 2–3 เดือน · ไม่เคยมีประวัติแพ้ยานั้น (สิทธิ์ สปสช.: HLA-B*15:02 ก่อน carbamazepine ทุกข้อบ่งใช้ ตั้งแต่ 2561 · HLA-B*58:01 ก่อน allopurinol ในเกาต์รายใหม่ ตั้งแต่ 2564)</p>
 <p><b>IPD:</b> แพทย์พิจารณาส่งตรวจ → พยาบาลแจ้งโปรแกรม Notify แพ้ยา "แจ้งเภสัชกรให้คำแนะนำการตรวจยีนแพ้ยา" → เภสัชกรให้ข้อมูล สอบถามความยินยอม ให้ลงนาม เก็บเอกสารเข้าระบบ · <b>OPD:</b> พยาบาลส่งพบเภสัชกร → ลงนาม → เจาะเลือด → นัดฟังผล 2 สัปดาห์</p>
 <table class="ctbl"><tr><th>ยีน / ยา</th><th>Negative</th><th>Positive</th><th>ระหว่างรอผล</th></tr>
 <tr><td>HLA-B*58:01 / Allopurinol</td><td>เริ่ม ≤50 mg/day ค่อยปรับ · เฝ้าระวัง ADR 3 เดือน</td><td>หลีกเลี่ยง allopurinol → Benzbromarone (eGFR &gt;20) หรือ Febuxostat</td><td>Colchicine / NSAIDs / Steroid ตามไต</td></tr>
 <tr><td>HLA-B*15:02 / Carbamazepine</td><td>เริ่มได้ · เฝ้าระวัง 3 เดือน</td><td>ห้ามใช้ · เลี่ยง aromatic (oxcarbazepine, eslicarbazepine, lacosamide, lamotrigine, phenytoin, phenobarbital, zonisamide)</td><td>Epilepsy: levetiracetam/valproate · Neuropathic: gabapentin/pregabalin</td></tr>
 <tr><td>HLA-B*57:01 / Abacavir</td><td>เริ่มได้ · เฝ้าระวัง 3 เดือน</td><td>ห้ามใช้ (hypersensitivity)</td><td>เร่งด่วน: สูตรที่ไม่มี abacavir · CD4 ดี/ไม่มี OI รอผลได้</td></tr></table>
 <p><b>หลังทราบผล:</b> ให้คำปรึกษา · ลงข้อมูลในระบบ · มอบบัตรเภสัชพันธุศาสตร์ + บัตรเฝ้าระวังผื่นแพ้ยารุนแรง · ติดตาม ADR 3 เดือน · <b>สงสัยแพ้:</b> หยุดยาทันที รายงานแพทย์ (สงสัย SJS/TEN ประเมินเร่งด่วน admit)</p>`},
 {id:'vac',t:'วัคซีน: ราคา/เข็ม และการใช้ (UPDATE FEB 2026)',src:'งานวิชาการเภสัชสนเทศ กลุ่มงานเภสัชกรรม รพ.มหาสารคาม · สมาคมโรคติดเชื้อฯ 2568',h:`
 <table class="ctbl"><tr><th>วัคซีน</th><th>ราคา/เข็ม</th><th>เด็ก</th><th>ผู้ใหญ่</th></tr>
 <tr><td>SKYCellflu (Influenza 4 สายพันธุ์)</td><td>356</td><td>≥6 เดือน IM ปีละ 1 ครั้ง · ครั้งแรก 2 เข็มห่าง 1 เดือน</td><td>IM ปีละ 1 · คนท้องอายุครรภ์ 12–20 สัปดาห์ · กิน oseltamivir อยู่ ฉีดหลังกินครบ &gt;48 ชม.</td></tr>
 <tr><td>QDenga (Dengue)</td><td>1,639</td><td>≥4 ปี SC 2 เข็มห่าง 3 เดือน · ไม่ต้องตรวจภูมิก่อน</td><td>อายุ 4–60 ปี SC 2 เข็มห่าง 3 เดือน · <u>ห้าม</u>ภูมิต่ำ/คนท้อง · หลังป่วยไข้เลือดออก ฉีดหลังหาย ≥6 เดือน</td></tr>
 <tr><td>ABRYSVO (RSV)</td><td>7,308</td><td>—</td><td>IM 1 ครั้ง · คนท้อง 24–36 สัปดาห์ (ป้องกันทารกถึง 6 เดือน) · อายุ ≥60 ปี หรือกลุ่มเสี่ยง</td></tr>
 <tr><td>AREXVY (RSV)</td><td>7,211</td><td>—</td><td>IM 1 ครั้ง · อายุ ≥60 ปี/กลุ่มเสี่ยง · <u>ห้าม</u>คนท้อง</td></tr>
 <tr><td>VARILRIX (Varicella)</td><td>919</td><td>≥1 ปี SC 2 เข็มห่าง &gt;3 เดือน (เข็มแรก 12–18 เดือน, เข็มสอง 18 เดือน–4 ปี) · อายุ &gt;13 ปี ห่าง 1 เดือนได้</td><td>วัคซีนเชื้อเป็น SC 2 เข็มห่าง 4–8 สัปดาห์ · <u>ห้าม</u>ภูมิต่ำ/คนท้อง</td></tr>
 <tr><td>SHINGRIX (Herpes zoster)</td><td>5,199</td><td>—</td><td>IM 2 เข็มห่าง 2–6 เดือน (≥50 ปี/กลุ่มเสี่ยง ห่าง 1–2 เดือนได้)</td></tr>
 <tr><td>Hepatitis B</td><td>111</td><td>วัคซีนจำเป็น (ฟรี) แรกเกิด, 2, 4, 6 เดือน</td><td>IM 3 เข็ม 0, 1, 6 เดือน · โรคไต double dose 4 เข็ม 0, 1, 2, 6 เดือน</td></tr>
 <tr><td>Prevnar-20 (Pneumococcal)</td><td>2,533</td><td>IM 2, 4, 6 เดือน + กระตุ้น 12–15 เดือน (ปกติอาจ 2+1)</td><td>IM 1 ครั้ง · ห้ามถ้าแพ้วัคซีนคอตีบ</td></tr>
 <tr><td>Infanrix Hexa (DTP+IPV+HepB+Hib)</td><td>1,538</td><td>IM ทดแทนวัคซีนจำเป็น 2, 4, 6 เดือน</td><td>—</td></tr>
 <tr><td>dT</td><td>26</td><td>—</td><td>IM 1 เข็มทุก 10 ปี · คนท้อง 20–32 สัปดาห์</td></tr></table><p class="hint">ยี่ห้อและราคาอาจเปลี่ยนแต่ละปี</p>`},
 {id:'notice69',t:'แจ้งเภสัช (ต.ค. 69): DUE online · ยาใหม่ปีงบ 70 · DI warfarin · แบบฟอร์ม',src:'ประกาศ/แจ้งเภสัช กลุ่มงานเภสัชกรรม รพ.มค (ต.ค. 2569) · MKH-PR-PHA (พ.ค. 2568) · MKH-FR-PHA-054',h:`
 <ol><li><b>ใบ DUE ยา Antibiotic และ Albumin</b> เปลี่ยนจากใบสแกนเป็น <b>DUE online</b> ทั้งวอร์ด paperless และวอร์ด scan · <b>Colistin / Meropenem / Tienam / Vancomycin / Tazocin อนุมัติทุก 10 วัน</b> (เดิม 7 วัน)</li>
 <li>เพิ่มการ<b>รับคืนยาเม็ดเปลือย/ยาแผง</b></li>
 <li><b>ยาเตรียม</b> (ผสมน้ำกระสายยา+ผงยา เช่น Furosemide suspension): ในเวลาราชการ จพง.เภสัชตำแหน่งเบิกยาเตรียม (ช่วงลงเวรเที่ยง = จพง.ตำแหน่งคีย์ยา New order)</li>
 <li><b>ค่าเตรียมยา TPN:</b> มีออเดอร์ TPN จพง.คีย์ code <b>ZZTPN</b> (ขึ้นเหมือนรายการยา)</li>
 <li><b>เปิด code ยาใหม่ปีงบ 70:</b> Escitalopram 10 mg (ED, local made ราคาถูก เข้าแทน 15 mg NED — 15 mg หมดแล้วปิด code) · Empagliflozin 25 mg (มี 10 และ 25 mg ระวังความแรง · DM max 25 mg/day · HF/CKD max 10 mg/day) · Drug monograph ใน website กลุ่มงาน</li>
 <li><b>DI warfarin (MKH-PR-PHA, พ.ค. 68):</b> DI-L1 ห้ามใช้ร่วม (สั่งวันเดียวกันโปรแกรมล็อก · สั่งคนละวันภายใน 120 วันถามก่อนให้ยาตัวที่ 2) → เภสัชโทร consult เปลี่ยนยา · DI-L2 ต้องระบุเหตุผล/ข้อบ่งใช้และติดตาม → consult แพทย์ ยืนยัน → ติดตามตามแนวทาง + แนบใบแจ้งเตือนคู่ยา / ไม่ยืนยัน → consult + note ไม่ต้องจ่ายยา · DI-L3 ติดตามอาการ · บันทึก: Pharmacist note · consult online · พิมพ์ใบแจ้งเตือนแนบยาขึ้นวอร์ด</li>
 <li><b>MKH-FR-PHA-054</b> แจ้งผู้ป่วยมีประวัติแพ้ยา/สงสัยแพ้ยา และทดลองใช้ยาซ้ำ (Rechallenge)/ขอยกเลิกประวัติแพ้ยา: ส่วนที่ 1 ผู้คัดกรอง · ส่วนที่ 2 แพทย์ · ส่วนที่ 3 ผู้ป่วย/ญาติลงนาม (และพยาน)</li></ol>`}
];
function renderRef(){ const q=($('refQ').value||'').toLowerCase();
  $('refOut').innerHTML=REF.map(r=>{ const txt=(r.t+' '+r.h).toLowerCase(); if(q&&!txt.includes(q)) return '';
    return `<details class="refbox"${q?' open':''}><summary>${esc(r.t)}</summary><div class="refbody">${r.h}<p class="hint">ที่มา: ${esc(r.src)}</p></div></details>`; }).join('')||'<div class="empty">ไม่พบหัวข้อ</div>'; }
(function(){ if(!$('refOut')) return; $('refQ').addEventListener('input',renderRef); renderRef(); })();

/* ---------- 3) คัดลอกรูป/ข้อความ timeline และ Naranjo ---------- */
function svgFlat(svg){ const cs=getComputedStyle(document.documentElement); let x=new XMLSerializer().serializeToString(svg);
  x=x.replace(/var\((--[\w-]+)\)/g,(m,v)=>cs.getPropertyValue(v).trim()||'#333');
  if(!/xmlns=/.test(x)) x=x.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  return x.replace(/(<svg[^>]*>)/,'$1<style>text{font-family:Sarabun,Tahoma,"Noto Sans Thai",sans-serif}text:not([fill]):not([style*="fill"]){fill:#334155}</style><rect width="100%" height="100%" fill="#fff"/>'); }
function svgPng(svg,scale=2){ return new Promise((res,rej)=>{ const vb=svg.viewBox.baseVal, w=vb&&vb.width||svg.clientWidth, h=vb&&vb.height||svg.clientHeight;
  const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); c.width=w*scale; c.height=h*scale; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height); c.toBlob(b=>b?res(b):rej(),'image/png'); };
  img.onerror=rej; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgFlat(svg)); }); }
async function svgsPng(svgs){ if(svgs.length===1) return svgPng(svgs[0]); const bs=await Promise.all(svgs.map(s=>svgPng(s))); const ims=await Promise.all(bs.map(b=>createImageBitmap(b)));
  const W=Math.max(...ims.map(i=>i.width)), H=ims.reduce((a,i)=>a+i.height+20,0); const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,W,H); let y=0; ims.forEach(i=>{g.drawImage(i,0,y); y+=i.height+20;}); return new Promise(r=>c.toBlob(r,'image/png')); }
function cpMsg(el,m){ if(!el) return; el.textContent=m; setTimeout(()=>el.textContent='',2600); }
async function copyImg(svgs,msg){ if(!svgs.length){ cpMsg(msg,'ยังไม่มีแผนภาพ'); return; }
  try{ const b=await svgsPng(svgs); await navigator.clipboard.write([new ClipboardItem({'image/png':b})]); cpMsg(msg,'คัดลอกรูปแล้ว — วางใน Word/LINE/PowerPoint ได้'); }
  catch(e){ cpMsg(msg,'เบราว์เซอร์นี้คัดลอกรูปไม่ได้ — ใช้ปุ่มบันทึกรูป PNG'); } }
async function saveImg(svgs,name,msg){ if(!svgs.length){ cpMsg(msg,'ยังไม่มีแผนภาพ'); return; } try{ const b=await svgsPng(svgs); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),3000); cpMsg(msg,'บันทึกรูปแล้ว'); }catch(e){ cpMsg(msg,'บันทึกรูปไม่ได้'); } }
const txtHtml=t=>`<pre style="font-family:Sarabun,Tahoma,sans-serif;font-size:14px;white-space:pre-wrap">${esc(t)}</pre>`;

function adrTlText(){ const ds=ADR.drugs.filter(d=>d.name), on=adrOnset();
  const evs=[...ADR.evs].filter(e=>e.d).sort((a,b)=>((tlDate(a.d,a.t)||0)-(tlDate(b.d,b.t)||0)));
  const RL={S:'S (ยาที่สงสัย)',O:'O (ยาที่ใช้ร่วม)',I:'I (ยาที่เกิดปฏิกิริยาต่อกัน)'}, TY={adr:'อาการ (ADR)',relief:'ยาบรรเทา',lab:'Lab',note:'หมายเหตุ'};
  const T=['■ ADR Timeline',`ผู้ป่วย ${sex==='F'?'หญิง':'ชาย'} อายุ ${ageTxt()||'–'} น้ำหนัก ${$('bw').value||'–'} kg${on?` · เริ่มเกิดอาการ ${tlFmt(on)}`:''}`,'','ยาที่ได้รับ:'];
  ds.forEach((d,i)=>{ const L=typeof adrLat==='function'?adrLat(d,on):null; T.push(`${i+1}. [${d.role}] ${d.name}${d.dose&&d.dose!==d.name?' · '+d.dose:''}`,`   เริ่ม ${d.sd||'–'} ${d.st||''} → หยุด ${d.ed?d.ed+' '+(d.et||''):'ยังใช้อยู่'}${L&&L.txt?` · ${L.txt}`:''}`); });
  T.push('','ลำดับเหตุการณ์:'); evs.forEach(e=>T.push(`• ${e.d} ${e.t||''} — ${TY[e.type]}: ${e.type==='lab'?`${e.lab||''} ${e.val||''}`:e.text||''}`.replace(/\s+—/,' —')));
  T.push('','S = ยาที่สงสัย · O = ยาที่ใช้ร่วม · I = ยาที่เกิดปฏิกิริยาต่อกัน'); return T.join('\n'); }
function narText(){ const ds=ADR.drugs.filter(d=>d.name&&narScore(d.id)!=null); const A={y:'ใช่',n:'ไม่ใช่',u:'ไม่ทราบ'};
  const T=['■ Naranjo\'s ADR probability scale'];
  if(!ds.length) T.push('(ยังไม่ได้ประเมิน)');
  ds.forEach(d=>{ const s=narScore(d.id), a=ADR.nar[d.id]||[]; T.push('',`ยา: ${d.name}`);
    NAR_Q.forEach(([q,p],i)=>{ const v=a[i]; const sc=v==='y'?p[0]:v==='n'?p[1]:v==='u'?p[2]:null; T.push(`  ${String(i+1).padStart(2)}. ${q} — ${v?A[v]:'–'}${sc!=null?` (${sc>0?'+':''}${sc})`:''}`); });
    T.push(`  รวม ${s} คะแนน → ${narCat(s)[0]} (${narCat(s)[1]})`); });
  T.push('','เกณฑ์: Definite ≥9 · Probable 5–8 · Possible 1–4 · Unlikely ≤0');
  if(ADR.who){ const w=WHO_UMC.find(x=>x[0]===ADR.who); T.push('',`■ WHO-UMC causality: ${ADR.who}${w?' ('+w[1]+')':''}`); }
  return T.join('\n'); }
function dtText(){ const T=['■ แผนภาพลำดับเวลาการใช้ยา (Drug Timeline)',`หอผู้ป่วย ${DT.hdr.ward||'–'} · วันที่ ${DT.hdr.date||'–'}${DT.hdr.by?' · จัดทำโดย '+DT.hdr.by:''}`,'','ยา:'];
  DT.drugs.forEach((d,i)=>T.push(`${i+1}. ${d.name}${d.dose?' · '+d.dose:''}`,`   ${d.prior?'ได้รับมาก่อน · ':''}เริ่ม ${d.sd||'–'} → ${d.ed?'หยุด '+d.ed:'ยังใช้อยู่'}`));
  const TY={adr:'อาการไม่พึงประสงค์',lab:'ผล Lab',note:'ความเห็นเภสัชกร'}; const ev=[...DT.evs].sort((a,b)=>(dtDay(a.d)||0)-(dtDay(b.d)||0));
  if(ev.length){ T.push('','เหตุการณ์:'); ev.forEach(e=>T.push(`• ${e.d} — ${TY[e.type]}: ${e.text}${e.type==='lab'?' = '+(e.val||''):''}`)); }
  return T.join('\n'); }
(function(){ const on=(id,f)=>{ const el=$(id); if(el) el.onclick=f; };
  on('aCpImg',()=>{ adrChart&&adrOut(); copyImg([...$('aChart').querySelectorAll('svg')],$('aCpMsg')); });
  on('aSvImg',()=>saveImg([...$('aChart').querySelectorAll('svg')],'ADR-timeline.png',$('aCpMsg')));
  on('aCpTxt',()=>{ const t=adrTlText(); copyRich(txtHtml(t),t,$('aCpMsg')); });
  on('aCpNar',()=>{ const t=narText(); copyRich(txtHtml(t),t,$('aNarMsg')); });
  on('dtCpImg',()=>copyImg([...$('dtChart').querySelectorAll('svg')],$('dtCpMsg')));
  on('dtSvImg',()=>saveImg([...$('dtChart').querySelectorAll('svg')],'Drug-timeline.png',$('dtCpMsg')));
  on('dtCpTxt',()=>{ const t=dtText(); copyRich(txtHtml(t),t,$('dtCpMsg')); });
})();

/* ---------- 4) วางข้อมูลผู้ป่วยจากหน้าจอ HIS → กรอกอัตโนมัติ (ไม่เก็บชื่อ/HN) ---------- */
function ptParse(txt){ const t=(txt||'').replace(/ /g,' '), o={};
  const ag=t.match(/อายุ\s*[:：]?\s*(\d+)\s*ปี(?:\s*(\d+)\s*เดือน)?(?:\s*(\d+)\s*วัน)?/)||t.match(/อายุ\s*[:：]?\s*(\d+)\s*(เดือน|วัน)/)||t.match(/\bage\s*[:：]?\s*(\d+)/i);
  if(ag){ if(ag[2]==='เดือน') o.age={v:+ag[1],u:'m'}; else if(ag[2]==='วัน') o.age={v:+ag[1],u:'d'};
    else { const y=+ag[1], m=+(ag[2]||0), d=+(ag[3]||0); o.age=y<1&&m?{v:m,u:'m'}:y===0&&d?{v:d,u:'d'}:{v:y,u:'y'}; } }
  const sx=t.match(/เพศ\s*[:：]?\s*(ชาย|หญิง|male|female)/i)||t.match(/\bsex\s*[:：]?\s*(m|f|male|female)\b/i);
  if(sx) o.sex=/หญิง|^f/i.test(sx[1])?'F':'M'; else if(/(^|\s)(นาง|นางสาว|น\.ส\.|ด\.ญ\.|เด็กหญิง)\s*\S/.test(t)) o.sex='F'; else if(/(^|\s)(นาย|ด\.ช\.|เด็กชาย)\s*\S/.test(t)) o.sex='M';
  const bw=t.match(/น้ำหนัก\s*[:：]?\s*([\d.]+)\s*(kg|กก|กิโล)?/i)||t.match(/\b(?:bw|weight|wt)\s*[:：]?\s*([\d.]+)/i); if(bw) o.bw=+bw[1];
  const ht=t.match(/(?:ส่วนสูง|สูง)\s*[:：]?\s*([\d.]+)\s*(cm|ซม)?/i)||t.match(/\b(?:height|ht)\s*[:：]?\s*([\d.]+)/i); if(ht) o.ht=+ht[1];
  const wd=t.match(/Ward\s*\/?\s*Bed\s*[:：]?\s*([^\n]+?)\s*(?:\/\s*\d+\s*)?(?:\n|$)/i); if(wd) o.ward=wd[1].replace(/\s*\/\s*\d+\s*$/,'').trim();
  const al=t.match(/ประวัติ(?:การ)?แพ้ยา\s*[:：]?\s*([\s\S]{0,160})/);
  if(al){ let a=al[1].split(/\n\s*\n|Laboratory|ผล\s*Lab|Medication|Creatinine|ดูผล|\bLab\b/i)[0].replace(/ไม่พบประวัติ(การ)?แพ้ยา/g,'').replace(/\s+/g,' ').trim();
    if(/ไม่พบ|ไม่มี|no known|nkda/i.test(al[1].slice(0,40))&&!/[a-z]{4,}/i.test(a)) a=''; o.allergy=a; o.allergyFound=true; }
  if(/ตั้งครรภ์|pregnan/i.test(t)) o.preg=true;
  return o; }
(function(){ if(!$('ptParse')) return;
  $('ptParse').onclick=()=>{ const raw=$('ptPaste').value; if(!raw.trim()) return; const o=ptParse(raw), got=[];
    if(o.sex){ setSex(o.sex); got.push(o.sex==='F'?'หญิง':'ชาย'); }
    if(o.age){ $('ageU').value=o.age.u; $('ageIn').value=o.age.v; ageSync(); got.push(`อายุ ${o.age.v} ${({y:'ปี',m:'เดือน',d:'วัน'})[o.age.u]}`); }
    if(o.bw){ $('bw').value=o.bw; $('bw').dispatchEvent(new Event('input',{bubbles:true})); got.push(`น้ำหนัก ${o.bw}`); }
    if(o.ht){ $('ht').value=o.ht; got.push(`สูง ${o.ht}`); }
    if(o.ward&&$('cnWard')){ $('cnWard').value=o.ward; got.push(`หอผู้ป่วย ${o.ward}`); }
    if(o.allergyFound){ $('allergy').value=o.allergy; got.push(o.allergy?`แพ้ยา: ${o.allergy}`:'ไม่พบประวัติแพ้ยา'); }
    if(o.preg){ $('preg').checked=true; got.push('ตั้งครรภ์'); }
    const v=labParse(raw); let nl=0; LAB_DEF.forEach(([k,,,,fld])=>{ if(v[k]==null) return; const el=$(fld||('L_'+k)); if(el){ el.value=v[k]; nl++; } }); if(nl) got.push(`Lab ${nl} ค่า`);
    $('ptPaste').value=''; // ไม่เก็บข้อความที่มีชื่อ/HN
    $('ptMsg').textContent=got.length?`อ่านได้: ${got.join(' · ')} — ตรวจค่าก่อนใช้ (ลบข้อความที่วางแล้ว)`:'อ่านค่าไม่ได้ — กรอกเองในช่อง';
    renderRows(); if(typeof renderHad==='function') renderHad(); if($('p-cmt')&&!$('p-cmt').hidden) renderCmt(); };
})();
