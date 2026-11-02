/* ===== adra.js — แท็บ ADR: (ก) ADR Type A ที่ต้องออกบัตรแพ้ยา + ลงคอมพิวเตอร์ (นโยบาย รพ.มค) พร้อมอาการ/Lab/การจัดการ
   (ข) Drug provocation test (DPT) — ทำได้หรือไม่
 แหล่ง: ประกาศรายการ ADR Type A ที่ต้องลงบันทึกและออกบัตรแพ้ยา รพ.มค · Academic in-service "Type A ADR" (นสภ. ม.มหาสารคาม, รพ.มค)
        · Sahiner UM et al. Pro and Contra: Provocation Tests in Drug Hypersensitivity. Int J Mol Sci 2017;18:1437 (Table 3) */
const ADRA=[
 {g:'ยาจิตเวช',d:'Haloperidol inj',re:/haloperidol|haldol/i,adr:'Arrhythmia, AF, QT prolongation',k:'qt'},
 {g:'ยาจิตเวช',d:'Clozapine',re:/clozapin|clozaril/i,adr:'Agranulocytosis, Seizure, Myocarditis',k:'agran|seiz|myo'},
 {g:'ยาจิตเวช',d:'Chlorpromazine',re:/chlorpromazin|largactil/i,adr:'Agranulocytosis',k:'agran'},
 {g:'ยาจิตเวช',d:'Antipsychotic (haloperidol, fluphenazine, perphenazine ฯลฯ)',re:/haloperidol|fluphenazin|perphenazin|trifluoperazin|risperid|olanzap|quetiap|aripipraz|chlorpromazin|zuclopenth|flupent/i,adr:'Acute dystonia',k:'dyst'},
 {g:'Palliative',d:'Fentanyl',re:/fentanyl|durogesic/i,adr:'Chest wall rigidity',k:'rigid'},
 {g:'Anti-inflammatory',d:'Sulfasalazine',re:/sulfasalaz|salazopyrin/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Antithyroid',d:'Methimazole (MMI)',re:/methimazol|thiamazol|\bmmi\b/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Antithyroid',d:'Propylthiouracil (PTU)',re:/propylthio|\bptu\b/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Antiepileptic',d:'Phenytoin',re:/phenytoin|dilantin/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Antibiotic',d:'Co-trimoxazole',re:/cotrimox|co-trimox|bactrim|sulfameth|trimethoprim/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Antibiotic',d:'Dapsone',re:/dapsone/i,adr:'Agranulocytosis',k:'agran|methb'},
 {g:'Oral chemotherapy',d:'Methotrexate (MTX)',re:/methotrex|\bmtx\b/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Oral chemotherapy',d:'Cyclophosphamide (Endoxan)',re:/cyclophosph|endoxan/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Oral chemotherapy',d:'Hydroxyurea',re:/hydroxyurea|hydrea/i,adr:'Agranulocytosis',k:'agran'},
 {g:'Iron chelator',d:'Deferiprone (GPO-L-ONE)',re:/deferipron|gpo-?l/i,adr:'Agranulocytosis',k:'agran'},
 {g:'ARV',d:'Zidovudine (AZT)',re:/zidovud|\bazt\b|zilarvir/i,adr:'Anemia (bone marrow suppression)',k:'anemia'},
 {g:'ARV',d:'Tenofovir disoproxil (TDF)',re:/tenofovir(?!.*alafen)|\btdf\b|teno-?em|acriptega|\btld\b|gpovir/i,adr:'Fanconi syndrome',k:'fanconi'},
 {g:'Antimalarial',d:'Chloroquine / Hydroxychloroquine',re:/chloroquin|plaquenil/i,adr:'Maculopathy',k:'macul'},
 {g:'ยาวัณโรค',d:'Isoniazid / Rifampicin / Pyrazinamide',re:/isoniazid|\binh\b|rifamp|pyrazinam|rifinah|rifafour|rimstar/i,adr:'Hepatitis (DILI)',k:'hep'},
 {g:'ยาวัณโรค',d:'Ethambutol',re:/ethambut/i,adr:'Optic neuritis',k:'optic'},
 {g:'Antihyperlipidemic',d:'Statins',re:/statin\b|simvast|atorvast|rosuvast|pravast|pitavast/i,adr:'Rhabdomyolysis',k:'rhabdo'},
 {g:'Aminoglycoside',d:'Amikacin',re:/amikac|amikin/i,adr:'Ototoxicity',k:'oto'},
 {g:'Diuretic',d:'Furosemide',re:/furosem|lasix/i,adr:'Ototoxicity',k:'oto'},
 {g:'Antidiabetic',d:'Metformin',re:/metformin/i,adr:'Lactic acidosis (MALA)',k:'mala'},
 {g:'Cardiovascular',d:'Digoxin, Beta-blocker, CCB (verapamil/diltiazem), Amiodarone, Ivabradine ฯลฯ',re:/digoxin|olol\b|verapamil|diltiazem|amiodaron|cordarone|ivabradin/i,adr:'Bradycardia / Heart block',k:'brady'},
];
// การจัดการ (สรุปจาก academic in-service Type A ADR รพ.มค)
const ADRA_MX={
 qt:['QT prolongation','ใจสั่น เวียนศีรษะ เป็นลม หัวใจหยุดเต้นเฉียบพลัน','EKG: QTc ปกติ ชาย <440, หญิง <470 ms · >500 ms หรือเพิ่ม >25% จาก baseline → เสี่ยง TdP · K, Mg, Ca, TSH','แก้ปัจจัยเสี่ยง (K/Mg/Ca ต่ำ, ยาเสริม QT) · QTc ยาวแต่ไม่มี TdP/หมดสติ อาจใช้ยาต่อพร้อมเฝ้าระวัง · QTc >500 หรือเพิ่ม >25% ควรหยุดยา · TdP: MgSO4 2 g (50% 4 ml เจือจาง D5W ≥10 ml) IV แล้วพิจารณา overdrive pacing'],
 brady:['Bradycardia / Heart block','HR <50 ขณะตื่น เวียนศีรษะ เป็นลม เหนื่อยง่าย สับสน เจ็บหน้าอก BP ต่ำ','ECG (PR >200 ms, Mobitz II, CHB) · ระดับยา digoxin · electrolyte · ไต','หยุด/ลดยา · มีอาการ: Atropine IV → ไม่ตอบสนองให้ dopamine/epinephrine · Mobitz II/CHB: temporary pacing'],
 myo:['Myocarditis (clozapine)','เจ็บหน้าอก เหนื่อย ใจสั่น ไข้ (มักใน 4–8 สัปดาห์แรก)','Troponin, CRP, EKG, Echo (LV function)','หยุด clozapine · ไม่มีอาการ LV ปกติ: รักษาตามอาการ · มี LV dysfunction/arrhythmia/HF/hemodynamic ไม่คงที่: ICU, IV steroid/IVIG, mechanical support'],
 agran:['Agranulocytosis','ไข้ เจ็บคอ กลืนเจ็บ แผลในปาก','ANC <500/mm³ โดย Hb/plt ไม่ลดมาก · เกิดระหว่างใช้ยาหรือภายใน 7 วันหลังหยุด และฟื้น ANC >1,500 ภายใน 1 เดือนหลังหยุดยา · แยกโรค: ไวรัส, เคมีบำบัด, โรคเลือด','หยุดยาทันที · มีไข้: เริ่ม empirical ATB (pip/tazo, cefepime หรือ carbapenem) · พิจารณา G-CSF (filgrastim) 5 mcg/kg/day SC · oral care, สารน้ำ, โภชนาการ'],
 anemia:['Anemia / bone marrow suppression (AZT)','ซีด อ่อนเพลีย ใจสั่น เหนื่อยง่าย','Hb↓ (WBC/plt↓) · MCV↑ (macrocytosis) · reticulocyte↓ · folate/B12 ปกติ','หยุด AZT เปลี่ยนสูตร ARV · รายงาน ADR · PRC เมื่อ Hb <7 g/dL'],
 methb:['Methemoglobinemia (dapsone)','cyanosis เหนื่อย SpO2 ต่ำไม่ตอบสนอง O2','Co-oximetry (MetHb) · SpO2 − SaO2 >5%','O2, สารน้ำ · Methylene blue เมื่อมีอาการขาด O2 หรือ MetHb สูง — ห้ามใน G6PD deficiency'],
 seiz:['Seizure (clozapine)','ชักเกร็งกระตุก myoclonus','ระดับ clozapine >1,000 ng/mL เสี่ยงสูง · electrolyte, glucose','hold clozapine · benzodiazepine PRN · กลับมาใช้ขนาดต่ำลง · พิจารณา valproate ป้องกันชัก'],
 dyst:['Acute dystonia','ตาเหลือก (oculogyric crisis) คอบิด ขากรรไกรเกร็ง หลังแอ่น laryngospasm','ไม่มี lab เฉพาะ (CK, electrolyte เพื่อแยกโรค)','Benztropine 1–2 mg IV/IM หรือ Diphenhydramine 25–50 mg IV/IM (ซ้ำได้) · ให้ anticholinergic กินต่อ 7 วัน (trihexyphenidyl/benztropine) · ไม่ดีขึ้นหลัง 2 ครั้ง ทบทวนการวินิจฉัย'],
 rigid:['Chest wall rigidity (fentanyl)','กล้ามเนื้อทรวงอกแข็ง ช่วยหายใจไม่ได้ (มักฉีดเร็ว/ขนาดสูง)','—','หยุด/ลดอัตราการให้ · naloxone · ถ้าจำเป็นให้ neuromuscular blocker + ช่วยหายใจ · ให้ fentanyl IV ช้า ๆ'],
 fanconi:['Fanconi syndrome (TDF)','อ่อนเพลีย ปวดกระดูก กล้ามเนื้ออ่อนแรง ปัสสาวะมาก','PO4↓ K↓ uric acid↓ metabolic acidosis (HCO3↓) Cr↑ glycosuria/proteinuria','หยุด TDF เปลี่ยนเป็น TAF (หรือยาอื่น) · ทดแทน PO4/K/bicarbonate'],
 macul:['Maculopathy (HCQ/CQ)','ระยะแรกไม่มีอาการ ตามัว ดวงมืดกลางลานสายตา','ลานสายตา, OCT, mfERG (คัดกรองตามระยะ)','หยุดยา (ไม่มียารักษา · การดำเนินโรคอาจไม่หยุดหลังหยุดยา)'],
 hep:['Hepatitis / DILI (ยา TB)','คลื่นไส้ อาเจียน เบื่ออาหาร ปวดท้องขวาบน ดีซ่าน','ALT ≥5×ULN หรือ ALP ≥2×ULN หรือ ALT ≥3×ULN + bilirubin >2×ULN','Grade 1 ติดตาม LFT · Grade 2 hold ยา · Grade 3–4 หยุดยา แล้ว reintroduce ทีละตัวตามแนวทาง TB'],
 optic:['Optic neuritis (ethambutol)','มองเห็นลดลง central scotoma แยกสีแดง-เขียวผิดปกติ (มักสองข้าง)','ตรวจตา (visual acuity, color vision)','หยุด ethambutol · ปรับสูตร TB (เช่น HRZ + levofloxacin/moxifloxacin)'],
 rhabdo:['Rhabdomyolysis (statin)','ปวด/อ่อนแรง/บวมกล้ามเนื้อ ปัสสาวะสีเข้ม','CPK >10×ULN · Cr, K, Ca, PO4','หยุด statin · NSS 10–15 ml/kg/h ให้ UO >2 ml/kg/h · แก้ K สูง · พิจารณา HD ตามข้อบ่งชี้'],
 oto:['Ototoxicity','หูอื้อ เวียนศีรษะ บ้านหมุน การได้ยินลดลง ทรงตัวไม่ได้','Pure tone audiometry (เสียงความถี่สูงเสียก่อน)','ติดตามการได้ยิน · หยุด/ลดยา (ไม่รุนแรงอาจดีขึ้น) · รุนแรง: เครื่องช่วยฟัง/ประสาทหูเทียม'],
 mala:['Lactic acidosis (MALA)','อ่อนเพลีย หายใจเร็วลึก คลื่นไส้ ปวดท้อง ซึม ช็อก','lactate ≥5 mmol/L, pH <7.35, HCO3↓, AG↑ (มักมี CKD/hypoxia/sepsis)','หยุด metformin · supportive · NaHCO3 เฉพาะ pH <7.1 หรือ hemodynamic ไม่คงที่ · HD เมื่อ lactate >15, pH ≤7.0, ไตวาย หรือไม่ตอบสนอง (ดูแบบประเมิน MALA ข้อ 6)'],
};
function adraFind(name){ return ADRA.filter(x=>x.re.test(name||'')); }
function adraRender(){ const box=$('adaOut'); if(!box) return; const q=($('adaQ').value||'').trim().toLowerCase();
  const ds=(typeof ADR!=='undefined'&&ADR.drugs?ADR.drugs.filter(d=>d.name):[]), hits=[];
  ds.forEach(d=>adraFind(d.name).forEach(a=>hits.push([d,a])));
  const mx=k=>k.split('|').map(x=>ADRA_MX[x]).filter(Boolean).map(m=>`<div style="margin:4px 0 6px;padding:6px 8px;border-left:3px solid var(--accent);background:color-mix(in srgb,var(--accent) 6%,transparent);border-radius:4px"><b>${m[0]}</b><div class="hint" style="margin:2px 0">อาการ: ${esc(m[1])}</div><div class="hint" style="margin:2px 0">Lab/เกณฑ์: ${esc(m[2])}</div><div style="font-size:13px">การจัดการ: ${esc(m[3])}</div></div>`).join('');
  const alert=hits.length?`<ul class="msgs">${hits.map(([d,a])=>`<li><span class="tag ${d.role==='S'?'flag':'warn'}">${d.role==='S'?'ต้องทำ':'เฝ้าระวัง'}</span><span><b>${esc(d.name)}</b> (${d.role==='S'?'ยาที่สงสัย':'ยาร่วม'}) อยู่ในรายการ ADR Type A ของ รพ. — <b>${esc(a.adr)}</b>${d.role==='S'?' · ถ้าเกิดอาการนี้: <b>ออกบัตรแพ้ยา + ลงบันทึกในคอมพิวเตอร์</b>':''}</span></li>`).join('')}</ul>`:'<p class="hint" style="margin:0 0 6px">ยังไม่พบยาในข้อ 2 ที่อยู่ในรายการ — ใส่ยาที่สงสัยแล้วจะเตือนอัตโนมัติ</p>';
  const rows=ADRA.filter(a=>!q||(a.g+a.d+a.adr).toLowerCase().includes(q));
  box.innerHTML=`${alert}<table class="ctbl"><thead><tr><th>กลุ่มยา</th><th>ยา</th><th>อาการ (ADR Type A)</th></tr></thead><tbody>${rows.map(a=>`<tr><td class="hint">${esc(a.g)}</td><td><b>${esc(a.d)}</b></td><td><details><summary>${esc(a.adr)}</summary>${mx(a.k)}</details></td></tr>`).join('')}</tbody></table>
   <p class="hint" style="margin-top:6px"><b>ADR type A อื่น ๆ:</b> ออกบัตร + ลงคอม เมื่อแพทย์วินิจฉัยว่าใช้ยาต่อไม่ได้ หรือผู้ป่วยปฏิเสธการใช้ยาเพราะอาการข้างเคียง · ที่มา: ประกาศรายการ ADR Type A ที่ต้องออกบัตรแพ้ยา รพ.มค · การจัดการสรุปจาก academic in-service Type A ADR (รพ.มค)</p>`; }
// ---- DPT
const DPT_C=[
 ['p','ผู้ป่วย','Asthma ที่ยังควบคุมไม่ได้'],['p','ผู้ป่วย','โรคเรื้อรังที่ยังควบคุมไม่ได้ (หัวใจ ปอด ติดเชื้อ จิตเวช)'],['p','ผู้ป่วย','ตั้งครรภ์'],['p','ผู้ป่วย','ใช้ β-blocker (หรือ ACEI)'],['p','ผู้ป่วย','โรคหัวใจที่ห้ามใช้ adrenaline'],
 ['r','ปฏิกิริยาเดิม','Vasculitis'],['r','ปฏิกิริยาเดิม','ผื่นตุ่มน้ำ: SJS / TEN / bullous FDE'],['r','ปฏิกิริยาเดิม','AGEP'],['r','ปฏิกิริยาเดิม','Drug-induced autoimmune (SLE, pemphigus)'],['r','ปฏิกิริยาเดิม','DRESS / drug hypersensitivity syndrome'],['r','ปฏิกิริยาเดิม','อวัยวะภายใน: ตับอักเสบ ไตอักเสบ เม็ดเลือดผิดปกติ'],['r','ปฏิกิริยาเดิม','Anaphylaxis รุนแรง'],
 ['d','ตัวยา','ไม่จำเป็นต้องใช้ยานี้ และมียาทางเลือกโครงสร้างต่างกันหลายตัว'],
];
function dptRender(){ const out=$('dptRes'); if(!out) return; const on=[...document.querySelectorAll('#dptBox input:checked')].map(x=>DPT_C[+x.value]);
  const abs=on.filter(c=>c[0]==='r'&&!/Anaphylaxis/.test(c[2])), rel=on.filter(c=>c[0]!=='r'||/Anaphylaxis/.test(c[2]));
  out.innerHTML=abs.length?`<div class="rflag"><b>ไม่ควรทำ DPT</b> — ปฏิกิริยาเดิมรุนแรง (${abs.map(c=>esc(c[2])).join(', ')}) · หลีกเลี่ยงยาเดิม/ยาโครงสร้างใกล้เคียงตลอดไป ออกบัตรแพ้ยา</div>`
   :rel.length?`<ul class="msgs"><li><span class="tag warn">ทบทวน</span><span>มีข้อห้าม/ไม่เหมาะ: ${rel.map(c=>esc(c[2])).join(', ')} — เลื่อนหรือใช้ยาทางเลือก · ถ้าจำเป็นต้องทำ ให้แพทย์ภูมิแพ้ประเมิน ทำในที่ที่พร้อมกู้ชีพ</span></li></ul>`
   :`<ul class="msgs"><li><span class="tag ok">OK</span><span>ไม่พบข้อห้ามจากรายการ — DPT ทำได้โดยแพทย์ (ภูมิแพ้) ในหน่วยที่พร้อมกู้ชีพ · เว้น ≥4–6 สัปดาห์หลังหายจากปฏิกิริยา · หยุด antihistamine ก่อนตามกำหนด · เริ่มขนาดต่ำแล้วเพิ่มทีละขั้นพร้อมเฝ้าระวัง</span></li></ul>`; }
(function(){ if(!$('adaOut')) return;
  $('dptBox').innerHTML=DPT_C.map((c,i)=>`<label class="rchk"><input type="checkbox" value="${i}"><span><span class="hint">${c[1]}:</span> ${esc(c[2])}</span></label>`).join('');
  $('dptBox').addEventListener('change',dptRender); $('adaQ').addEventListener('input',adraRender);
  let t=0; const p=$('p-adr'); ['input','change','click'].forEach(ev=>p.addEventListener(ev,e=>{ if(e.target.closest&&e.target.closest('#adaOut,#dptBox')) return; clearTimeout(t); t=setTimeout(adraRender,300); }));
  $('t-adr').addEventListener('click',()=>setTimeout(adraRender,50));
  adraRender(); dptRender(); })();
