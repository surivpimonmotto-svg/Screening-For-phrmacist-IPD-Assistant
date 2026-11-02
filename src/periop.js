/* ===== periop.js — หยุด/เริ่มยาต้านการแข็งตัวของเลือดและต้านเกล็ดเลือดก่อน-หลังผ่าตัด/หัตถการ
 Warfarin: Government of Western Australia, Guidelines for Anticoagulation using Warfarin (ตาราง thrombotic risk, Table 2 + flow)
 Bleeding risk ของหัตถการ: EHRA Practical Guide 2018 (Table 1) · DOAC: EHRA 2021 Practical Guide (เวลาหยุดตาม CrCl)
 Antiplatelet: ESC/ACC (ทั่วไป) — ผู้ป่วยใส่ stent ไม่หยุด DAPT เองโดยไม่ปรึกษาแพทย์หัวใจ */
const PO_THR=[['high','สูง: mechanical mitral / caged-ball aortic valve · stroke/TIA <6 เดือน (ลิ้นหัวใจ) หรือ <3 เดือน (AF) · AF CHA₂DS₂ ≥3 (เดิม CHADS2 5–6) · rheumatic valvular AF · VTE <3 เดือน · มะเร็ง active · thrombophilia รุนแรง (protein C/S, antithrombin, APS)'],['mid','ปานกลาง: bileaflet aortic valve + AF/stroke/HT/DM/HF/อายุ >75 · AF CHA₂DS₂ 1–2 · VTE 3–12 เดือน · thrombophilia ไม่รุนแรง (factor V Leiden heterozygous) · VTE ซ้ำ'],['low','ต่ำ: bileaflet aortic valve ไม่มี AF/ปัจจัยเสี่ยง · VTE ครั้งเดียว >12 เดือน ไม่มีปัจจัยอื่น']];
const PO_BLD=[['min','เลือดออกน้อยมาก: ถอนฟัน 1–3 ซี่, ผ่าตัดเหงือก, ใส่รากฟัน · ต้อกระจก/ต้อหิน · ส่องกล้องไม่ตัดชิ้นเนื้อ · ผ่าตัดผิวหนังตื้น (ผ่าฝี ตัดก้อนเล็ก)'],['low','เลือดออกต่ำ: ส่องกล้องตัดชิ้นเนื้อ · biopsy ต่อมลูกหมาก/กระเพาะปัสสาวะ · EP study/catheter ablation ทั่วไป · non-coronary angiography'],['high','เลือดออกสูง: ส่องกล้องซับซ้อน (polypectomy, ERCP+sphincterotomy) · spinal/epidural, lumbar puncture · biopsy ตับ/ไต · ผ่าตัดช่องท้อง · ผ่าตัดกระดูกใหญ่ · complex left-sided ablation']];
const PO_DOAC={dabi:['Dabigatran',[[80,24,48],[50,36,72],[30,48,96]]],riva:['Rivaroxaban',[[30,24,48],[15,36,48]]],apix:['Apixaban',[[30,24,48],[15,36,48]]],edox:['Edoxaban',[[30,24,48],[15,36,48]]]};
const PO_AP=[['Aspirin','ส่วนใหญ่ให้ต่อ (secondary prevention/stent) · หยุด 7 วันเฉพาะผ่าตัดเลือดออกอันตราย (สมอง ไขสันหลัง ตา posterior chamber, TURP) หรือใช้เพื่อ primary prevention'],['Clopidogrel','หยุด 5 วันก่อนผ่าตัด'],['Ticagrelor','หยุด 3–5 วัน'],['Prasugrel','หยุด 7 วัน'],['Cilostazol','หยุด 2–3 วัน (หลายแหล่งแนะนำ 3 วัน)'],['Stent','DES <6 เดือน (ACS <12 เดือน) / BMS <1 เดือน: เลื่อนผ่าตัด elective · ถ้าจำเป็น ให้ aspirin ต่อ และปรึกษาแพทย์หัวใจก่อนหยุด P2Y12']];
function poDay(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function periopRender(){ const out=$('poOut'); if(!out) return; const drug=$('poDrug').value, thr=$('poThr').value, bld=$('poBld').value, op=tlDate($('poDate').value,'08:00'), pt=getPt(), crcl=pt.crcl!=null?pt.crcl:null;
  const D=n=>op?`<b>${tlFmt(poDay(op,n),false)}</b>`:`<b>วัน ${n>0?'+':''}${n}</b>`, L=[], warn=[];
  if(drug==='warf'){
    if(bld==='min'){ L.push(`หัตถการเลือดออกน้อยมาก: <b>ให้ warfarin ต่อ</b> ถ้า INR อยู่ในช่วงเป้าหมาย (พิจารณา INR เป้าหมาย ~2 ช่วงผ่าตัด) · ตรวจ INR ก่อนวันทำ`); }
    else { L.push(`หยุด warfarin มื้อสุดท้าย ${D(-6)} (หยุด 5 วันก่อนผ่าตัด: ไม่กิน ${D(-5)} ถึง ${D(-1)})`); L.push(`ตรวจ INR ${D(-1)} — เป้าหมาย <1.5 (ถ้ายังสูง พิจารณา vitamin K1 1–2 mg กิน)`);
      if(thr==='low') L.push('ไม่ต้อง bridging (AF ไม่ bridging ยกเว้น CHADS2 5–6) · ถ้าหัตถการเสี่ยง VTE ให้ LMWH ขนาดป้องกันตามชนิดผ่าตัด');
      if(thr==='mid'){ L.push(`พิจารณา bridging แบบระมัดระวังเฉพาะถ้าความเสี่ยงลิ่มเลือดเกินความเสี่ยงเลือดออก: enoxaparin <b>ขนาดป้องกัน</b> เริ่ม ${D(-3)} หรือ ${D(-2)}`); L.push(`enoxaparin ขนาดป้องกันเข็มสุดท้าย ≥12 ชม.ก่อนผ่าตัด (เย็น ${D(-1)}) — ไตปกติ`); }
      if(thr==='high'){ L.push(`<b>ปรึกษาแพทย์โลหิตวิทยา/หัวใจ</b> เรื่อง bridging (ลิ้นหัวใจเทียมโลหะอาจต้อง UFH drip)`); L.push(`enoxaparin <b>ขนาดรักษา</b> 1 mg/kg q12h เริ่ม ${D(-3)} หรือ ${D(-2)} เมื่อ INR ต่ำกว่าเป้าหมาย · เข็มสุดท้าย ≥24 ชม.ก่อนผ่าตัด (เช้า ${D(-1)}, ให้ครึ่งขนาดรายวัน)`); L.push('เสี่ยงสูงมาก/ไตเสื่อม: เปลี่ยนเป็น UFH IV หยุด 4–6 ชม.ก่อนผ่าตัด'); }
      L.push(`เริ่ม warfarin ขนาดเดิม <b>เย็นวันผ่าตัด</b> ${D(0)} (หรือวันถัดไป) ถ้าไม่มีเลือดออก`);
      if(thr!=='low') L.push(`เริ่ม LMWH/UFH ใหม่เมื่อห้ามเลือดได้ดี: ผ่าตัดเลือดออกต่ำ ~24 ชม. (${D(1)}) · เลือดออกสูง 48–72 ชม. (${D(2)}–${D(3)}) หรือเริ่มขนาดป้องกัน 12 ชม.หลังผ่าตัด · UFH ไม่ bolus · หยุด LMWH เมื่อ INR ในช่วงเป้าหมาย 2 วันติด`);
      if(bld==='high'&&thr==='high') L.push('ผ่าตัดเสี่ยงเลือดออกสูง + ลิ่มเลือดสูง: เริ่ม UFH IV วันก่อนผ่าตัด หยุด 6 ชม.ก่อนผ่าตัด เริ่มใหม่เมื่อห้ามเลือดได้');
    }
    if(pt.crcl!=null&&pt.crcl<30&&thr!=='low') warn.push(`CrCl ${r0(pt.crcl)} <30: enoxaparin ขนาดรักษาเป็น 1 mg/kg q24h หรือใช้ UFH แทน`);
  } else if(PO_DOAC[drug]){ const [nm,tab]=PO_DOAC[drug];
    if(bld==='min'){ L.push(`หัตถการเลือดออกน้อยมาก: ทำที่ระดับยาต่ำสุด (trough) ~12–24 ชม.หลังมื้อสุดท้าย หรือ<b>งด 1 มื้อ</b> แล้วกินต่อหลังทำ 6 ชม.`); }
    else if(crcl==null) warn.push('ไม่มี CrCl — ใส่ SCr/น้ำหนัก/อายุในแผงผู้ป่วยเพื่อคำนวณเวลาหยุด');
    else { const row=tab.find(r=>crcl>=r[0]);
      if(!row) warn.push(`CrCl ${r0(crcl)}: ${nm} ไม่แนะนำในระดับไตนี้ / ไม่มีข้อมูล — ปรึกษาแพทย์`);
      else { const h=bld==='high'?row[2]:row[1]; L.push(`${nm} (CrCl ${r0(crcl)}): หยุด <b>≥${h} ชม.</b> ก่อนผ่าตัด (เลือดออก${bld==='high'?'สูง':'ต่ำ'}) → มื้อสุดท้ายประมาณ ${D(-Math.ceil(h/24))}${h%24?' (ปัดเป็นวัน)':''}`); }
      L.push('ไม่ต้อง bridging ด้วย heparin/LMWH');
      L.push(`เริ่มยาใหม่: เลือดออกต่ำ 6–8 ชม.–24 ชม.หลังผ่าตัด · เลือดออกสูง 48–72 ชม. (${D(2)}–${D(3)}) ระหว่างนั้นให้ LMWH ขนาดป้องกันถ้าจำเป็น`);
      L.push('spinal/epidural: ใช้เวลาหยุดแบบเลือดออกสูง และตามแนวทางวิสัญญี'); }
  } else if(drug==='ap'){ L.push(...PO_AP.map(([a,b])=>`<b>${a}</b>: ${b}`)); }
  out.innerHTML=`${warn.length?`<ul class="msgs">${warn.map(w=>`<li><span class="tag warn">${LVL_TXT.warn}</span><span>${w}</span></li>`).join('')}</ul>`:''}<ol style="margin:0;padding-left:20px">${L.filter(Boolean).map(x=>`<li style="margin:3px 0">${x}</li>`).join('')}</ol>
   <p class="hint" style="margin-top:6px">${op?'':'ใส่วันผ่าตัดเพื่อคำนวณวันที่ · '}ที่มา: WA Health Warfarin guideline (thrombotic risk, peri-operative warfarin) · EHRA 2018/2021 (bleeding risk, DOAC) · antiplatelet ตามแนวทาง ESC/ACC — ยืนยันกับแพทย์ผ่าตัด/วิสัญญีทุกครั้ง</p>`; }
(function(){ if(!$('poOut')) return;
  $('poThr').innerHTML=PO_THR.map(([k,t])=>`<option value="${k}">${t}</option>`).join(''); $('poThr').value='mid';
  $('poBld').innerHTML=PO_BLD.map(([k,t])=>`<option value="${k}">${t}</option>`).join(''); $('poBld').value='high';
  ['poDrug','poThr','poBld'].forEach(id=>$(id).addEventListener('change',()=>{ $('poThrW').hidden=$('poDrug').value!=='warf'; periopRender(); })); $('poDate').addEventListener('input',periopRender);
  ['scr','bw','ageIn','mode','crclIn'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',periopRender); el.addEventListener('change',periopRender); } });
  periopRender(); })();
