/* ===== arv.js — แท็บ ARV: สกรีนสูตรยาต้านไวรัส + ยาร่วม (DI · การเว้นเวลา · วิธีกิน · ปรับตามไต) และยาป้องกันในทารกแรกเกิดจากแม่ติดเชื้อ HIV
 อ้างอิง: แนวทางการตรวจรักษาและป้องกันการติดเชื้อเอชไอวี ประเทศไทย 2564/2565 · CPG HIV รพ.ขอนแก่น 2567 · ARV Screening IPD 2568 (รพ.มค)
         DHHS Perinatal / Pediatric ARV guidelines (ขนาดยาทารกคลอดก่อนกำหนด)
 ⚑ ข้อมูลขนาดยาทารก (ARV_NEO) รอยืนยันกับตาราง 4.8 แนวทางชาติ / protocol รพ.มค ก่อนใช้จริง */

// ---------- กฎปฏิกิริยาระหว่างยา: a = ส่วนประกอบ ARV ที่ต้องมี ('PIr' = PI ที่ boost RTV/COBI) · re = ยาร่วม · oral = เฉพาะยากิน · t = การเว้นเวลา ----------
const ARV_CATION=/calcium|caco3|chalk|ferrous|\biron\b|ferric|zinc|magnes|antacid|alum|sucralfate|multivit|\bmvi\b|obimin|triferdine|lanthanum|polystyrene|kalimate/i;
const ARV_DDI=[
 {a:['DTG'],re:ARV_CATION,oral:1,lvl:'warn',n:'ยาที่มีประจุบวก (Ca/Fe/Zn/Mg/Al, antacid, วิตามินรวม)',m:'ลดการดูดซึม DTG (chelation)',t:'DTG ก่อน 2 ชม. หรือหลัง 6 ชม. · Ca/Fe กินพร้อม DTG ได้ถ้ากินพร้อมอาหาร'},
 {a:['DTG'],re:/metformin|glucophage/i,lvl:'warn',n:'Metformin',m:'DTG เพิ่มระดับ metformin — ขนาดรวมไม่เกิน 1,000 mg/วัน ติดตามน้ำตาลเมื่อเริ่ม/หยุด DTG'},
 {a:['DTG'],re:/dofetilide/i,lvl:'flag',n:'Dofetilide',m:'ห้ามใช้ร่วม (หัวใจเต้นผิดจังหวะรุนแรง)'},
 {a:['DTG'],re:/oxcarbazepine|trileptal/i,lvl:'warn',n:'Oxcarbazepine',m:'ลดระดับ DTG — หลีกเลี่ยง หรือพิจารณา DTG 50 mg q12h'},
 {a:['RPV'],re:/famotidine|ranitidine|cimetidine|\bh2/i,lvl:'warn',n:'H2-blocker',m:'ลดการดูดซึม RPV',t:'H2RA ก่อน RPV ≥12 ชม. หรือหลัง ≥4 ชม.'},
 {a:['RPV'],re:/antacid|alum|magnes.*hydrox|caco3|chalk|calcium\s*carb/i,oral:1,lvl:'warn',n:'Antacid',m:'ลดการดูดซึม RPV',t:'Antacid ก่อน RPV ≥2 ชม. หรือหลัง ≥4 ชม.'},
 {a:['RPV'],re:/carbamazepine|tegretol|phenytoin|dilantin|phenobarb|oxcarbazepine/i,lvl:'flag',n:'ยากันชักกลุ่ม inducer',m:'ห้ามใช้ร่วม (ระดับ RPV ลดลงมาก)'},
 {a:['RPV'],re:/dexamethasone/i,lvl:'warn',n:'Dexamethasone',m:'ใช้หลายครั้งลดระดับ RPV — หลีกเลี่ยงการใช้ต่อเนื่อง'},
 {a:['RPV'],re:/clarithro|erythro|azithro|levoflox|moxiflox|ondansetron|haloperidol|domperidone|amiodarone|methadone/i,lvl:'info',n:'ยาที่ทำให้ QT ยาว',m:'RPV ทำให้ QT ยาวได้ — ระวังเมื่อใช้ร่วม ตรวจ EKG/K/Mg'},
 {a:['EFV'],re:/voriconazole|vfend/i,lvl:'flag',n:'Voriconazole',m:'ขนาดมาตรฐานห้ามใช้ร่วม — ถ้าจำเป็น Vori 400 mg q12h + EFV 300 mg/วัน'},
 {a:['EFV'],re:/methadone/i,lvl:'warn',n:'Methadone',m:'EFV ลดระดับ methadone — เฝ้าระวังอาการถอนยา อาจต้องเพิ่มขนาด'},
 {a:['EFV'],re:/carbamazepine|tegretol/i,lvl:'warn',n:'Carbamazepine',m:'ลดระดับกันและกัน — หลีกเลี่ยง ติดตามระดับยากันชัก'},
 {a:['EFV'],re:/artemether|lumefantrine|coartem/i,lvl:'warn',n:'Artemether/lumefantrine',m:'EFV ลดระดับยามาลาเรีย — ติดตามการตอบสนอง'},
 {a:['EFV'],re:/levonorg|etonogestrel|implanon|desogest|ethinyl|ยาคุม|contracep/i,lvl:'warn',n:'ฮอร์โมนคุมกำเนิด',m:'EFV ลดประสิทธิภาพ (โดยเฉพาะยาฝัง) — ใช้วิธีคุมกำเนิดเสริม'},
 {a:['EFV'],re:/simvastatin|atorvastatin|lovastatin/i,lvl:'info',n:'Statin',m:'EFV ลดระดับ statin — อาจต้องปรับขนาดตามระดับไขมัน'},
 {a:['EFV'],re:/rifampi|\brifam/i,lvl:'info',n:'Rifampicin',m:'ใช้ร่วมได้ — EFV 600 mg/วัน'},
 {a:['NVP'],re:/rifampi|\brifam/i,lvl:'flag',n:'Rifampicin',m:'ไม่แนะนำใช้ร่วม (ระดับ NVP ลดลง) — เปลี่ยนเป็น EFV หรือ DTG q12h'},
 {a:['NVP'],re:/ketoconazole/i,lvl:'flag',n:'Ketoconazole',m:'ห้ามใช้ร่วม'},
 {a:['NVP'],re:/fluconazole/i,lvl:'warn',n:'Fluconazole',m:'เพิ่มระดับ NVP — ติดตามตับอักเสบ'},
 {a:['NVP'],re:/methadone/i,lvl:'warn',n:'Methadone',m:'NVP ลดระดับ methadone — เฝ้าระวังอาการถอนยา'},
 {a:['PIr'],re:/simvastatin|lovastatin/i,lvl:'flag',n:'Simvastatin/Lovastatin',m:'ห้ามใช้ร่วม (rhabdomyolysis) — เปลี่ยนเป็น atorvastatin ขนาดต่ำ/rosuvastatin/pravastatin'},
 {a:['PIr'],re:/atorvastatin/i,lvl:'warn',n:'Atorvastatin',m:'เพิ่มระดับ — เริ่มขนาดต่ำ ไม่เกิน 20 mg/วัน (LPV/r · ATV/r)'},
 {a:['PIr'],re:/rosuvastatin/i,lvl:'warn',n:'Rosuvastatin',m:'เพิ่มระดับ — ไม่เกิน 10 mg/วัน (LPV/r · ATV/r)'},
 {a:['PIr'],re:/midazolam|triazolam|dormicum/i,lvl:'flag',n:'Midazolam/Triazolam',m:'ชนิดกินห้ามใช้ร่วม · IV ครั้งเดียวใช้ได้ในที่ติดตามการหายใจ ลดขนาด'},
 {a:['PIr'],re:/amiodarone|cordarone|dronedarone|flecainide|propafenone|quinidine/i,lvl:'flag',n:'ยาต้านหัวใจเต้นผิดจังหวะ',m:'ห้ามใช้ร่วม/หลีกเลี่ยง (ระดับยาสูง หัวใจเต้นผิดจังหวะ)'},
 {a:['PIr'],re:/ergotamine|cafergot|dihydroergot|methylergo|pimozide|lurasidone/i,lvl:'flag',n:'Ergot / Pimozide / Lurasidone',m:'ห้ามใช้ร่วม'},
 {a:['PIr'],re:/colchicine/i,lvl:'warn',n:'Colchicine',m:'เพิ่มระดับมาก — ลดขนาด · ห้ามใช้ถ้าไตหรือตับบกพร่อง'},
 {a:['PIr'],re:/sildenafil|tadalafil|revatio/i,lvl:'warn',n:'Sildenafil/Tadalafil',m:'PAH: sildenafil ห้ามใช้ร่วม · ED: ลดขนาด (sildenafil ≤25 mg/48 ชม.)'},
 {a:['PIr'],re:/salmeterol|seretide|fluticasone|budesonide|symbicort|triamcinolone/i,lvl:'warn',n:'Salmeterol / ICS (fluticasone, budesonide)',m:'เสี่ยง Cushing/ต่อมหมวกไตกด และ QT (salmeterol) — พิจารณา beclomethasone'},
 {a:['PIr'],re:/quetiapine|seroquel/i,lvl:'warn',n:'Quetiapine',m:'ลดขนาด quetiapine เหลือ 1/6 ของเดิม'},
 {a:['PIr'],re:/rivaroxaban|xarelto/i,lvl:'flag',n:'Rivaroxaban',m:'หลีกเลี่ยง (เลือดออก)'},
 {a:['PIr'],re:/apixaban|eliquis|dabigatran|pradaxa|edoxaban/i,lvl:'warn',n:'DOAC',m:'เพิ่มระดับ — apixaban ลดขนาด 50% (ถ้าใช้ 5-10 mg bid) · dabigatran ระวังเมื่อไตเสื่อม'},
 {a:['PIr'],re:/ticagrelor|brilinta/i,lvl:'flag',n:'Ticagrelor',m:'หลีกเลี่ยง (เลือดออก)'},
 {a:['PIr'],re:/clopidogrel|plavix/i,lvl:'warn',n:'Clopidogrel',m:'ลดการเปลี่ยนเป็นยาออกฤทธิ์ — พิจารณา prasugrel'},
 {a:['PIr'],re:/warfarin|orfarin/i,lvl:'warn',n:'Warfarin',m:'INR เปลี่ยนแปลงได้ — ติดตาม INR ใกล้ชิดเมื่อเริ่ม/หยุด'},
 {a:['PIr'],re:/voriconazole|vfend/i,lvl:'flag',n:'Voriconazole',m:'หลีกเลี่ยง (RTV ลดระดับ voriconazole)'},
 {a:['PIr'],re:/itraconazole|ketoconazole|posaconazole/i,lvl:'warn',n:'Azole',m:'เพิ่มระดับกันและกัน — itraconazole/ketoconazole ไม่เกิน 200 mg/วัน'},
 {a:['PIr'],re:/clarithromycin|klacid/i,lvl:'warn',n:'Clarithromycin',m:'เพิ่มระดับ — CrCl 30-60 ลด 50% · <30 ลด 75% · พิจารณา azithromycin'},
 {a:['PIr'],re:/tacrolimus|cyclosporin|sirolimus|everolimus/i,lvl:'flag',n:'ยากดภูมิ (CNI/mTOR)',m:'ระดับยาเพิ่มมาก — ลดขนาด ติดตามระดับยาใกล้ชิด'},
 {a:['PIr'],re:/carbamazepine|tegretol|phenytoin|dilantin|phenobarb/i,lvl:'flag',n:'ยากันชักกลุ่ม inducer',m:'ลดระดับ PI (ล้มเหลว/ดื้อยา) — หลีกเลี่ยง เลือก levetiracetam/valproate'},
 {a:['PIr'],re:/fentanyl|oxycodone|tramadol/i,lvl:'warn',n:'Opioid (CYP3A4)',m:'เพิ่มระดับ — เฝ้าระวังกดการหายใจ ลดขนาด'},
 {a:['PIr'],re:/methadone/i,lvl:'warn',n:'Methadone',m:'LPV/r ลดระดับ methadone — เฝ้าระวังอาการถอนยา'},
 {a:['PIr'],re:/domperidone|motilium/i,lvl:'flag',n:'Domperidone',m:'ห้ามใช้ร่วม CYP3A4 inhibitor แรง (QT ยาว)'},
 {a:['PIr'],re:/amlodipine|nifedipine|felodipine|diltiazem|verapamil|madiplot|manidipine/i,lvl:'info',n:'Calcium channel blocker',m:'เพิ่มระดับ — เริ่มขนาดต่ำ ติดตามความดัน/ชีพจร'},
 {a:['PIr'],re:/dexamethasone/i,lvl:'info',n:'Dexamethasone',m:'อาจลดระดับ PI เมื่อใช้ต่อเนื่อง'},
 {a:['ATV'],re:/famotidine|ranitidine|cimetidine/i,lvl:'warn',n:'H2-blocker',m:'ลดการดูดซึม ATV',t:'ATV/r กินพร้อม H2RA หรือหลัง H2RA ≥10 ชม.'},
 {a:['ATV'],re:/antacid|alum|magnes.*hydrox|caco3|chalk|calcium\s*carb/i,oral:1,lvl:'warn',n:'Antacid',m:'ลดการดูดซึม ATV',t:'ATV ก่อน antacid ≥2 ชม. หรือหลัง 1-2 ชม.'},
 {a:['TDF'],re:/gentamicin|amikacin|streptomycin|kanamycin|amphotericin|colistin|polymyxin|foscarnet|cidofovir|vancomycin/i,lvl:'warn',n:'ยาที่เป็นพิษต่อไต',m:'เสี่ยงไตเสื่อมเพิ่ม — ติดตาม Cr/phosphate · พิจารณาเปลี่ยนเป็น TAF/ABC ชั่วคราว'},
 {a:['TDF'],re:/ibuprofen|diclofenac|naproxen|piroxicam|meloxicam|celecoxib|etoricoxib|indomethacin|ketorolac/i,lvl:'warn',n:'NSAIDs',m:'NSAIDs ขนาดสูง/หลายตัวร่วม TDF เสี่ยงไตวายเฉียบพลัน — ใช้สั้นที่สุด ติดตาม Cr'},
 {a:['TDF'],re:/adefovir/i,lvl:'flag',n:'Adefovir',m:'ห้ามใช้ร่วม (ซ้ำซ้อน/พิษต่อไต)'},
 {a:['TDF'],re:/sofosbuvir|epclusa|harvoni|ledipasvir|velpatasvir/i,lvl:'warn',n:'Sofosbuvir-based DAA',m:'เพิ่มระดับ TDF — ติดตามไต (เสี่ยงสูงขึ้นถ้าใช้ร่วม boosted PI)'},
 {a:['TAF'],re:/rifampi|\brifam|rifabutin|rifapentine/i,lvl:'warn',n:'Rifamycin',m:'ยังไม่แนะนำใช้ TAF ร่วม (ระดับ TAF ลดลง) — พิจารณา TDF'},
 {a:['TAF'],re:/carbamazepine|tegretol|phenytoin|dilantin|phenobarb|oxcarbazepine/i,lvl:'warn',n:'ยากันชักกลุ่ม inducer',m:'ลดระดับ TAF — หลีกเลี่ยง/พิจารณา TDF'},
 {a:['AZT'],re:/ganciclovir|valganciclovir|cymevene|valcyte/i,lvl:'flag',n:'Ganciclovir/Valganciclovir',m:'กดไขกระดูกเพิ่ม — หลีกเลี่ยง ถ้าจำเป็นติดตาม CBC ใกล้ชิด'},
 {a:['AZT'],re:/ribavirin|interferon|pyrimethamine|flucytosine|dapsone|ซิสพลาติน|cisplatin|carboplatin|cyclophosphamide/i,lvl:'warn',n:'ยาที่กดไขกระดูก',m:'โลหิตจาง/เม็ดเลือดขาวต่ำเพิ่ม — ติดตาม CBC'},
 {a:['AZT'],re:/stavudine|\bd4t\b/i,lvl:'flag',n:'Stavudine',m:'ห้ามใช้ร่วม (ต้านฤทธิ์กัน)'},
 {a:['ABC'],re:/methadone/i,lvl:'info',n:'Methadone',m:'อาจลดระดับ methadone เล็กน้อย'},
];
// วิธีกิน / เวลา (ต่อส่วนประกอบ)
const ARV_ADMIN={
 DTG:'วันละครั้งเวลาเดิม พร้อม/ไม่พร้อมอาหาร · บดหรือละลายน้ำให้ทาง NG ได้',
 TDF:'พร้อม/ไม่พร้อมอาหาร', TAF:'พร้อมอาหาร', '3TC':'พร้อม/ไม่พร้อมอาหาร', FTC:'พร้อม/ไม่พร้อมอาหาร', ABC:'พร้อม/ไม่พร้อมอาหาร · เฝ้าระวังแพ้ยา (HLA-B*5701) ใน 6 สัปดาห์แรก', AZT:'พร้อม/ไม่พร้อมอาหาร (q12h)',
 EFV:'ก่อนนอน ท้องว่าง · เลี่ยงอาหารไขมันสูง (ลดเวียนหัว/ฝันร้าย)', RPV:'พร้อมอาหาร (≥400 kcal) เวลาเดิม · ห้ามกินตอนท้องว่างหรือกับเครื่องดื่มอย่างเดียว', NVP:'พร้อม/ไม่พร้อมอาหาร (lead-in 200 mg/วัน 14 วัน แล้ว q12h)',
 ATV:'พร้อมอาหาร', DRV:'พร้อมอาหาร', LPV:'เม็ด: พร้อม/ไม่พร้อมอาหาร · กลืนทั้งเม็ด ห้ามบด/หัก (ระดับยาลดลง) · ชนิดน้ำ: พร้อมอาหาร', RTV:'พร้อมอาหาร', COBI:'พร้อมอาหาร'};

function arvText(r){ const mm=masterOf(r); return r.raw+' '+(mm?mm[1]+' '+mm[2]:''); }
function arvIsOral(r){ return !/\b(iv|im|sc|inj|injection|infusion|drip)\b|ฉีด/i.test(r.raw); }
function arvTabRows(){ return joinLines(($('vPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean); }

function arvAnalyze(rws,pt){
  const A=rws.map(r=>({r,c:arvOf(r)})), arv=A.filter(x=>x.c.length), oth=A.filter(x=>!x.c.length).map(x=>x.r);
  const comp=new Set(arv.flatMap(x=>x.c)), boosted=comp.has('RTV')||comp.has('COBI'), has=k=>k==='PIr'?boosted&&[...comp].some(c=>ARV_CLS[c]==='PI'):comp.has(k);
  const nm=r=>{ const mm=masterOf(r); if(mm) return mm[1]; const k=r.drugId&&KB.find(x=>x.id===r.drugId); return k?k.name:[...r.raw].slice(0,40).join('').replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+$/,''); };
  const hits=[];
  ARV_DDI.forEach(d=>{ if(!d.a.some(has)) return; const ms=oth.filter(r=>d.re.test(arvText(r))&&(!d.oral||arvIsOral(r)));
    if(ms.length) hits.push({...d,arv:d.a.map(k=>k==='PIr'?[...comp].filter(c=>ARV_CLS[c]==='PI').join('/')+(comp.has('RTV')?'/r':'/c'):k).join(' / '),with:ms.map(nm)}); });
  // ผลตรวจจากเครื่องมือหลัก (ไต · สูตร · ARV Screening IPD 2568) — เฉพาะแถวที่เป็น ARV
  const chk=[]; const seen=new Set();
  arv.forEach(x=>{ const res=evaluate(x.r,pt,rws); res.items.forEach(i=>{ const k=i.lvl+i.txt; if(seen.has(k)) return; seen.add(k); chk.push({...i,drug:nm(x.r)}); }); });
  return {arv,oth,comp,boosted,hits,chk,nm}; }

function renderArv(){ const out=$('vOut'); if(!out) return; const rws=arvTabRows();
  if(!rws.length){ out.innerHTML='<div class="empty">วางรายการยา (ARV + ยาอื่นทั้งหมด) แล้วระบบจะตรวจให้อัตโนมัติ</div>'; return; }
  const pt=getPt(), R=arvAnalyze(rws,pt), LV={flag:3,warn:2,info:1,ok:0};
  if(!R.arv.length){ out.innerHTML='<div class="empty">ไม่พบยาต้านไวรัส HIV ในรายการ — ตรวจชื่อยา (เช่น TLD/Acriptega, Teno-EM, GPOvir, Kocitaf, Aluvia, DTG, EFV, RPV)</div>'; return; }
  const tag=l=>`<span class="tag ${l}">${LVL_TXT[l]}</span>`;
  const reg=`<table class="ctbl"><thead><tr><th>ยา ARV</th><th>ส่วนประกอบ</th><th>วิธีกิน</th></tr></thead><tbody>${R.arv.map(x=>`<tr><td>${esc(R.nm(x.r))}<div class="hint">${esc(x.r.raw)}</div></td><td>${x.c.map(c=>`${c} <span class="hint">(${ARV_CLS[c]})</span>`).join('<br>')}</td><td style="font-size:13px">${x.c.map(c=>ARV_ADMIN[c]?`<b>${c}</b>: ${esc(ARV_ADMIN[c])}`:'').filter(Boolean).join('<br>')}</td></tr>`).join('')}</tbody></table>`;
  const ddi=R.hits.sort((a,b)=>LV[b.lvl]-LV[a.lvl]);
  const ddiH=ddi.length?`<table class="ctbl"><thead><tr><th></th><th>ARV</th><th>ยาร่วม</th><th>ผล / คำแนะนำ</th><th>เว้นเวลา</th></tr></thead><tbody>${ddi.map(h=>`<tr><td>${tag(h.lvl)}</td><td><b>${esc(h.arv)}</b></td><td>${esc(h.with.join(', '))}<div class="hint">${esc(h.n)}</div></td><td>${esc(h.m)}</td><td style="font-weight:600;color:#b45309">${h.t?esc(h.t):'—'}</td></tr>`).join('')}</tbody></table>`:'<p class="hint">ไม่พบคู่ยาที่มีปฏิกิริยาสำคัญในฐานข้อมูล (ตรวจเพิ่มใน Liverpool HIV Drug Interactions สำหรับยาที่ไม่อยู่ในฐาน)</p>';
  const chk=R.chk.filter(i=>i.lvl!=='ok'||/^ARV/.test(i.txt)).sort((a,b)=>LV[b.lvl]-LV[a.lvl]);
  const chkH=chk.length?`<ul class="msgs">${chk.map(i=>`<li>${tag(i.lvl)}<span><b>${esc(i.drug)}</b>: ${esc(i.txt)}</span></li>`).join('')}</ul>`:'<p class="hint">ไม่พบปัญหา</p>';
  // ตารางเวลาแนะนำ
  const tl=[]; const c=R.comp;
  if(c.has('EFV')) tl.push('ก่อนนอน (~21:00): EFV ท้องว่าง');
  if(c.has('RPV')) tl.push('พร้อมมื้ออาหารหลักเวลาเดิมทุกวัน: RPV');
  if(c.has('ATV')||c.has('DRV')) tl.push(`พร้อมอาหาร: ${[c.has('ATV')&&'ATV',c.has('DRV')&&'DRV'].filter(Boolean).join(', ')} + ${c.has('COBI')?'COBI':'RTV'}`);
  ddi.filter(h=>h.t).forEach(h=>tl.push(`${h.arv} ↔ ${h.with.join(', ')}: ${h.t}`));
  if(c.has('DTG')&&ddi.some(h=>h.a.includes('DTG')&&h.t)) tl.push('ตัวอย่าง: DTG 08:00 (หลังอาหารเช้า) → ยาเกลือแร่/antacid/วิตามิน มื้อเย็น 18:00 ขึ้นไป (≥6 ชม.)');
  const tlH=tl.length?`<ul style="margin:4px 0;padding-left:20px">${tl.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'<p class="hint">ไม่มีข้อกำหนดเว้นเวลาพิเศษ — กินเวลาเดิมทุกวัน</p>';
  const nF=chk.filter(i=>i.lvl==='flag').length+ddi.filter(h=>h.lvl==='flag').length, nW=chk.filter(i=>i.lvl==='warn').length+ddi.filter(h=>h.lvl==='warn').length;
  out.innerHTML=`<div class="band ${nF?'f':nW?'w':''}" style="margin-bottom:8px"><b>สูตร: ${esc([...c].join(' + '))}</b> · ต้องแก้ ${nF} · ระวัง ${nW}${pt.crcl!=null?` · CrCl ${fmtN(Math.round(pt.crcl))}`:' · ยังไม่มี CrCl (กรอก Cr ในแผงผู้ป่วยเพื่อตรวจปรับตามไต)'}</div>
   <h2>สูตรยา ARV และวิธีกิน</h2>${reg}
   <h2>ปฏิกิริยากับยาอื่น (${ddi.length})</h2>${ddiH}
   <h2>ผลตรวจสูตร / ปรับตามไต (${chk.length})</h2>${chkH}
   <h2>เวลากินยาแนะนำ</h2>${tlH}
   <p class="hint" style="margin-top:8px">ยาอื่นที่ตรวจ ${R.oth.length} รายการ · ฐานข้อมูลคู่ยาเป็นกลุ่มที่พบบ่อยใน IPD — ยาที่ไม่อยู่ในฐานตรวจเพิ่มที่ hiv-druginteractions.org</p>`; }

/* ---------- ทารกแรกเกิดจากแม่ติดเชื้อ HIV ---------- ⚑ รอยืนยันกับตาราง 4.8 แนวทางชาติ 2564/65 / protocol รพ.มค
 ช่วง: [GA ต่ำสุด, ช่วงอายุ (สัปดาห์) [เริ่ม,สิ้นสุด), mg/kg, ทุก ชม.] · syrup 10 mg/ml ทุกตัว */
const ARV_NEO={
 AZT:{nm:'Zidovudine (AZT) syrup 10 mg/ml',c:10,sch:[[35,[[0,99],4,12]],[30,[[0,2],2,12],[[2,99],3,12]],[0,[[0,4],2,12],[[4,99],3,12]]]},
 '3TC':{nm:'Lamivudine (3TC) syrup 10 mg/ml',c:10,sch:[[32,[[0,4],2,12],[[4,99],4,12]]]},
 NVP:{nm:'Nevirapine (NVP) syrup 10 mg/ml',c:10,sch:[[37,[[0,99],4,24]]]}};
const ARV_NEO_RISK={std:{nm:'ความเสี่ยงมาตรฐาน',drugs:['AZT']},high:{nm:'ความเสี่ยงสูง',drugs:['AZT','3TC','NVP']}};
function neoRender(){ const out=$('nOut'); if(!out) return; const ga=+$('nGa').value, bw=+$('nBw').value, risk=$('nRisk').value, wk=+$('nWk').value||4, bd=tlDate($('nBd').value,'0:00');
  const vl=$('nVl').value, dur=$('nDur').value, bf=$('nBf').checked;
  // ประเมินความเสี่ยงจากข้อมูลมารดา (แนวทางชาติ 2564/65 ตามที่ มช. สรุป)
  let auto=null, why=[]; if(vl==='hi') why.push('VL ใกล้คลอด >50'); if(dur==='lt12') why.push('ARV <12 สัปดาห์/ไม่สม่ำเสมอ/ไม่ได้รับ'); if(bf) why.push('ได้รับนมแม่');
  if(why.length) auto='high'; else if(vl==='lo'||dur==='ge12') auto='std';
  const rk=risk==='auto'?auto:risk;
  let h=`<div style="margin:0 0 10px;padding:10px 12px;border-radius:10px;border:2px solid #f59e0b;background:color-mix(in srgb,#f59e0b 15%,transparent)"><b>⚠ รอยืนยันขนาดยา — ยังไม่ใช้สั่ง/จ่ายจริง</b><div style="font-size:.92em;margin-top:4px">แหล่งที่หาได้ไม่ตรงกัน: สรุปแนวทางชาติ 2564/65 (มช.) เสี่ยงสูง = AZT+3TC+NVP 4 สัปดาห์ (NVP 4 mg/kg q24h) · งานวิจัย รพ.มค 2559 (แนวทาง 2557) เสี่ยงสูง 6 สัปดาห์ · ทารกคลอดก่อนกำหนดใช้ตาราง DHHS — รอตาราง 4.8 / protocol รพ.มค</div></div>`;
  h+=`<p style="margin:0 0 6px">กลุ่มความเสี่ยง: <b>${rk?ARV_NEO_RISK[rk].nm:'— เลือกหรือกรอกข้อมูลมารดา'}</b>${risk==='auto'&&why.length?` <span class="hint">(${esc(why.join(' · '))})</span>`:''}</p>
   <p class="hint" style="margin:0 0 8px">มาตรฐาน: VL มารดาใกล้คลอด ≤50 copies/ml หรือไม่มีผล VL แต่กิน ARV สม่ำเสมอ ≥12 สัปดาห์ · เสี่ยงสูง: VL >50 หรือ ARV ไม่สม่ำเสมอ/&lt;12 สัปดาห์ หรือได้นมแม่ · เริ่มยาเร็วที่สุด ภายใน 1 ชม. หลังคลอด</p>`;
  if(!rk||!(bw>0)||!(ga>0)){ out.innerHTML=h+'<div class="empty">กรอกอายุครรภ์ (สัปดาห์) น้ำหนักแรกเกิด และกลุ่มความเสี่ยง</div>'; return; }
  const rows=[]; ARV_NEO_RISK[rk].drugs.forEach(k=>{ const D=ARV_NEO[k], s=D.sch.find(x=>ga>=x[0]);
    if(!s){ rows.push(`<tr><td>${esc(D.nm)}</td><td colspan="4" style="color:var(--flag)">ไม่มีขนาดยาสำหรับ GA ${ga} สัปดาห์ในตาราง — ปรึกษากุมารแพทย์โรคติดเชื้อ</td></tr>`); return; }
    s.slice(1).forEach(([[a,b],mk,q])=>{ if(a>=wk) return; const e=Math.min(b,wk), mg=Math.round(mk*bw*100)/100, ml=Math.round(mg/D.c*100)/100, dt=bd?`${tlFmt(new Date(bd.getTime()+a*7*864e5),false)} – ${tlFmt(new Date(bd.getTime()+(e*7-1)*864e5),false)}`:'';
      rows.push(`<tr><td>${esc(D.nm)}</td><td>สัปดาห์ ${a}–${e}${dt?`<div class="hint">${dt}</div>`:''}</td><td>${mk} mg/kg q${q}h</td><td><b>${fmtN(mg)} mg</b> = <b>${fmtN(ml)} ml</b> q${q}h</td><td>${fmtN(Math.ceil(ml*(24/q)*(e-a)*7))} ml</td></tr>`); }); });
  h+=`<h2>ขนาดยาทารก (น้ำหนัก ${fmtN(bw)} kg · GA ${fmtN(ga)} สัปดาห์ · ${wk} สัปดาห์)</h2><table class="ctbl"><thead><tr><th>ยา</th><th>ช่วง</th><th>ขนาด</th><th>ต่อครั้ง</th><th>ปริมาณรวม</th></tr></thead><tbody>${rows.join('')}</tbody></table>
   <p class="hint" style="margin:6px 0 0">คำนวณตามน้ำหนักแรกเกิด — ปรับตามน้ำหนักปัจจุบันเมื่อนัดติดตาม · ตรวจ HIV DNA PCR ตามนัด (แรกเกิด/1 เดือน/2-4 เดือน) · ถ้า PCR บวก เปลี่ยนเป็นขนาดรักษา · ห้ามให้นมแม่</p>`;
  out.innerHTML=h; }

(function(){ if(!$('vOut')) return;
  let t=0; $('vPaste').addEventListener('input',()=>{ clearTimeout(t); t=setTimeout(renderArv,500); });
  $('vRun').onclick=renderArv; $('vClr').onclick=()=>{ $('vPaste').value=''; renderArv(); };
  $('vFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('vMsg'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('vPaste').value=rows.map(r=>r.raw).join('\n'); renderArv(); };
  $('vEx').onclick=()=>{ $('vPaste').value='Acriptega (TDF300/3TC300/DTG50) 1 tab oral od pc เช้า\nCalcium carbonate 1000 mg 1x3 pc\nFerrous fumarate 200 mg 1x1 pc\nSimvastatin 20 mg 1 tab hs\nRifampicin 450 mg 1 tab od ac\nMetformin 500 mg 2x2 pc\nOmeprazole 20 mg 1x1 ac'; renderArv(); };
  ['nGa','nBw','nWk','nBd'].forEach(id=>$(id).addEventListener('input',neoRender)); ['nRisk','nVl','nDur','nBf','nWk'].forEach(id=>$(id).addEventListener('change',neoRender));
  renderArv(); neoRender(); })();

/* ---------- HIV Post Exposure Prophylaxis (PEP) — แบบคัดกรอง PEP / OSCC 2024 รพ.มหาสารคาม ----------
 เด็ก: AZT syr 180 mg/m² q12h + 3TC syr 4 mg/kg q12h + DTG dispersible ตามน้ำหนัก · เด็กกินเม็ดได้ 14–<35 kg · ผู้ใหญ่/≥35 kg สูตร 1–5
 กินยา 28 วัน · จ่ายครั้งละ 14 วัน นัดตรงวันคลินิก (ผู้ใหญ่ จันทร์/พฤหัส · เด็ก พุธ) */
const PEP_DTGD=[[3,6,5,'½','5'],[6,10,15,'1½','5'],[10,14,20,'2','10'],[14,20,25,'2½','10'],[20,999,30,'3','15']];
function pep3tcRenal(cr){ if(cr==null||cr>=50) return null; if(cr>=30) return ['150 mg q24h','3TC(150) 1 เม็ด q24h']; if(cr>=10) return ['100 mg q24h','3TC syrup (10 mg/ml) 10 ml q24h (เม็ด 150 แบ่งไม่ได้)']; return ['25–50 mg q24h','3TC syrup (10 mg/ml) 2.5–5 ml q24h']; }
function pepRender(){ const out=$('pOut'); if(!out) return; const pt=getPt(), bw=+pt.bw, cr=pt.dial?0:pt.crcl, tab=$('pTab').checked, typ=$('pType').value;
  const ex=tlDate($('pExD').value,$('pExT').value||'0:00'), st=tlDate($('pSt').value,'0:00')||(()=>{const d=new Date(); d.setHours(0,0,0,0); return d;})();
  const L=[], li=(l,m)=>L.push(`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`);
  if(ex){ const h=(Date.now()-ex.getTime())/36e5; if(h>72) li('flag',`สัมผัสมาแล้ว ${Math.round(h)} ชม. (>72 ชม.) — ไม่แนะนำเริ่ม PEP · ปรึกษาแพทย์`); else li(h>36?'warn':'ok',`สัมผัสมาแล้ว ${Math.round(h)} ชม. — เริ่มยาให้เร็วที่สุด (ภายใน 72 ชม.${h<=2?' · ดีที่สุดภายใน 2 ชม.':''})`); }
  if(!(bw>0)){ out.innerHTML='<div class="empty">กรอกน้ำหนักในแผงผู้ป่วย (และ Cr ถ้าผู้ใหญ่)</div>'; return; }
  const rows=[]; let perDay=[]; // [ชื่อ, ต่อครั้ง, ครั้ง/วัน, หน่วยจ่าย, จำนวนต่อวัน]
  let title='';
  if(bw<35){ const bsa=(4*bw+7)/(bw+90), dtg=PEP_DTGD.find(x=>bw>=x[0]&&bw<x[1]);
    if(!tab||bw<14){ title=`เด็กรับประทานยาน้ำ (BSA ${fmtN(Math.round(bsa*100)/100)} m² = (4×${fmtN(bw)}+7)/(${fmtN(bw)}+90))`;
      const azt=180*bsa, t3=4*bw; rows.push(['AZT syrup 10 mg/ml',`${fmtN(Math.round(azt))} mg = <b>${fmtN(Math.round(azt/10*10)/10)} ml</b> q12h`,'180 mg/m² q12h']); perDay.push(['AZT syrup 10 mg/ml (ml)',Math.round(azt/10*10)/10*2]);
      rows.push(['3TC syrup 10 mg/ml',`${fmtN(Math.round(t3*10)/10)} mg = <b>${fmtN(Math.round(t3/10*10)/10)} ml</b> q12h`,'4 mg/kg q12h']); perDay.push(['3TC syrup 10 mg/ml (ml)',Math.round(t3/10*10)/10*2]);
      if(bw<3) rows.push(['DTG dispersible 10 mg','<span style="color:var(--flag)">ใช้ได้เมื่อ BW ≥3 kg และอายุ ≥1 เดือน — ปรึกษาแพทย์</span>','']);
      else { rows.push(['DTG dispersible 10 mg',`<b>${dtg[2]} mg q24h</b>: ยา ${dtg[3]} เม็ด ผสมน้ำเปล่า ${dtg[4]} ml กิน ${dtg[4]} ml วันละครั้ง`,'ใช้ในเด็ก ≥1 เดือน, BW ≥3 kg']); perDay.push(['DTG dispersible 10 mg (เม็ด)',dtg[2]/10]); }
      if(pt.age!=null&&$('age').value!==''&&+$('age').value<1/12) li('warn','อายุ <1 เดือน: DTG dispersible ยังไม่แนะนำ — ปรึกษาแพทย์'); }
    else { title='เด็กรับประทานยาเม็ดได้ (14–<35 kg)';
      if(bw<20){ rows.push(['AZT(100)','<b>1 เม็ด q12h</b>',''],['3TC(150)','<b>1 เม็ด q24h</b>',''],['DTG dispersible(10)','<b>2½ เม็ด q24h</b> (ผสมน้ำเปล่า 10 ml กิน 10 ml)','']); perDay.push(['AZT(100) (เม็ด)',2],['3TC(150) (เม็ด)',1],['DTG dispersible(10) (เม็ด)',2.5]); }
      else if(bw<25){ rows.push(['AZT(100)','<b>2 เม็ด q12h</b>',''],['3TC(150)','<b>1½ เม็ด q24h</b>',''],['DTG(50)','<b>1 เม็ด q24h</b>','กลืนไม่ได้: DTG dispersible(10) 3 เม็ด = DTG(50) 1 เม็ด']); perDay.push(['AZT(100) (เม็ด)',4],['3TC(150) (เม็ด)',1.5],['DTG(50) (เม็ด)',1]); }
      else { rows.push(['AZT(100)','<b>2 เม็ด q12h</b>',''],['3TC(150)','<b>2 เม็ด q24h</b>',''],['DTG(50)','<b>1 เม็ด q24h</b>','กลืนไม่ได้: DTG dispersible(10) 3 เม็ด = DTG(50) 1 เม็ด']); perDay.push(['AZT(100) (เม็ด)',4],['3TC(150) (เม็ด)',2],['DTG(50) (เม็ด)',1]); } } }
  else { const ren=pep3tcRenal(cr), reg=$('pepReg').value;
    if(cr==null&&!pt.dial) li('warn','ผู้ใหญ่: ยังไม่มี CrCl — ต้องตรวจ Cr ก่อนเลือกสูตร (CrCl <50 ห้าม TDF ใช้ AZT แทน)');
    if(ren&&['1','2','3'].includes(reg)) li('flag',`CrCl ${fmtN(Math.round(cr))} (<50): ห้ามใช้ TDF (สูตร 1–3) → ใช้สูตร ${bw<50?'4':'5'}`);
    const r=ren&&['1','2','3'].includes(reg)?(bw<50?'4':'5'):reg;
    title={1:'สูตร 1 — TLD',2:'สูตร 2 — TENO-EM + DTG',3:'สูตร 3 — TDF + 3TC + DTG',4:'สูตร 4 (BW <50 kg) — AZT + DTG + 3TC ปรับตาม CrCl',5:'สูตร 5 (BW ≥50 kg) — AZT + DTG + 3TC ปรับตาม CrCl'}[r];
    if(r==='4'&&bw>=50) li('warn','สูตร 4 สำหรับ BW <50 kg — น้ำหนักนี้ใช้สูตร 5 (AZT 3 เม็ด q12h)'); if(r==='5'&&bw<50) li('warn','สูตร 5 สำหรับ BW ≥50 kg — น้ำหนักนี้ใช้สูตร 4 (AZT 2 เม็ด q12h)');
    if(r==='1'){ rows.push(['TLD (TDF300/3TC300/DTG50)','<b>1 เม็ด q24h</b>','']); perDay.push(['TLD (เม็ด)',1]); }
    if(r==='2'){ rows.push(['TENO-EM (TDF300/FTC200)','<b>1 เม็ด q24h</b>',''],['DTG(50)','<b>1 เม็ด q24h</b>','']); perDay.push(['TENO-EM (เม็ด)',1],['DTG(50) (เม็ด)',1]); }
    if(r==='3'){ rows.push(['TDF(300)','<b>1 เม็ด q24h</b>',''],['3TC(150)','<b>2 เม็ด q24h</b>',''],['DTG(50)','<b>1 เม็ด q24h</b>','']); perDay.push(['TDF(300) (เม็ด)',1],['3TC(150) (เม็ด)',2],['DTG(50) (เม็ด)',1]); }
    if(r==='4'||r==='5'){ const n=r==='4'?2:3; rows.push(['AZT(100)',`<b>${n} เม็ด q12h</b>`,r==='4'?'BW <50 kg':'BW ≥50 kg'],['DTG(50)','<b>1 เม็ด q24h</b>','']); perDay.push(['AZT(100) (เม็ด)',n*2],['DTG(50) (เม็ด)',1]);
      if(ren){ rows.push(['3TC',`<b>${ren[0]}</b> → ${ren[1]}`,`CrCl ${fmtN(Math.round(cr))}`]); if(/1 เม็ด/.test(ren[1])) perDay.push(['3TC(150) (เม็ด)',1]); else perDay.push(['3TC syrup 10 mg/ml (ml)',/10 ml/.test(ren[1])?10:5]); }
      else { rows.push(['3TC(150)','<b>1 เม็ด q12h</b> (CrCl ≥50 หรือยังไม่ทราบ — ตรวจ Cr)','']); perDay.push(['3TC(150) (เม็ด)',2]); }
      if(cr!=null&&cr<10) li('warn','CrCl <10: AZT ปรับเป็น 100 mg q8h หรือ 300 mg q24h (ARV Screening IPD 2568)'); } }
  // วันนัด: ครบ 14 วันตรงวันคลินิก (ผู้ใหญ่ จันทร์/พฤหัส · เด็ก พุธ)
  const child=bw<35||pt.isPed, cd=child?[3]:[1,4]; let ap=mrAdd(st,14); while(!cd.includes(ap.getDay())) ap=mrAdd(ap,1);
  const days=Math.round((ap-st)/864e5)+1, TH=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const disp=perDay.map(([n,q])=>`<tr><td>${esc(n)}</td><td>${fmtN(Math.round(q*100)/100)}/วัน</td><td><b>${fmtN(Math.ceil(q*days-1e-9))}</b></td><td class="hint">${fmtN(Math.ceil(q*28-1e-9))}</td></tr>`).join('');
  li('info','หลีกเลี่ยงยาที่มีประจุ 2+ (antacid, Ca, Zn, Fe, วิตามินรวม) ภายใน 6 ชม. ของ DTG');
  li('info',`ระยะเวลากินยารวม 28 วัน · จ่ายครั้งละประมาณ 14 วัน ให้มารับยาที่เหลือในวันนัดครั้งถัดไป · ถ้าวันนัดตรงวันหยุด เลื่อนเป็นวันคลินิกถัดไปและจ่ายยาเพิ่มให้พอ`);
  if(typ==='oPEP') li('info','oPEP (สัมผัสจากการทำงาน): บันทึกรายงานอุบัติเหตุ · ตรวจ anti-HIV, HBsAg/anti-HBs, anti-HCV ของผู้สัมผัสและแหล่งสัมผัส');
  if(typ==='nPEP') li('info','nPEP: พิจารณาตรวจ/ป้องกัน STI · ยาคุมฉุกเฉิน · วัคซีนตับอักเสบบี · ส่งต่อ OSCC กรณีถูกล่วงละเมิด');
  out.innerHTML=`<h2>${esc(title)}</h2><table class="ctbl"><thead><tr><th>ยา</th><th>ขนาด/วิธีใช้</th><th>หมายเหตุ</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td class="hint">${esc(r[2])}</td></tr>`).join('')}</tbody></table>
   <h2>นัดและจำนวนยา</h2><dl class="kv"><dt>เริ่มยา</dt><dd>${tlFmt(st,false)}</dd><dt>นัดครั้งถัดไป</dt><dd><b>${tlFmt(ap,false)} (วัน${TH[ap.getDay()]})</b> — ครบ 14 วันตรงคลินิก${child?'เด็ก (พุธ)':'ผู้ใหญ่ (จันทร์/พฤหัส)'}</dd><dt>จ่ายถึงวันนัด</dt><dd>${days} วัน (รวมวันนัด)</dd><dt>ครบ 28 วัน</dt><dd>${tlFmt(mrAdd(st,27),false)}</dd></dl>
   ${disp?`<table class="ctbl"><thead><tr><th>ยา</th><th>ใช้</th><th>จ่ายถึงวันนัด</th><th>ทั้ง course 28 วัน</th></tr></thead><tbody>${disp}</tbody></table>`:''}
   <ul class="msgs">${L.join('')}</ul>
   <h2>Checklist ก่อนจ่าย</h2><ul style="margin:4px 0;padding-left:20px"><li>☐ สูตรยาถูกต้องตามน้ำหนัก/อายุ/CrCl</li><li>☐ ขนาดยา/วิธีกิน (BSA, BW, CrCl) · วิธีผสม DTG dispersible</li><li>☐ วันนัด 14 วันตรงวันคลินิก (ผู้ใหญ่ จันทร์/พฤหัส · เด็ก พุธ)</li><li>☐ จำนวนยาพอถึงวันนัด</li></ul>
   <p class="hint">แบบคัดกรอง HIV Post Exposure Prophylaxis / OSCC 2024 รพ.มหาสารคาม — ไฟล์ใน คู่มือย่อ › เอกสารต้นฉบับ</p>`; }
(function(){ if(!$('pOut')) return; ['pExD','pExT','pSt'].forEach(id=>$(id).addEventListener('input',pepRender)); ['pTab','pType','pepReg'].forEach(id=>$(id).addEventListener('change',pepRender));
  ['bw','scr','ageIn','ageU','mode','crclIn'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',pepRender); el.addEventListener('change',pepRender); } }); $('t-arv').addEventListener('click',pepRender); pepRender(); })();
