/* ===== wfdi.js — แบบส่งต่อเพื่อติดตามค่า INR อย่างใกล้ชิด จากคู่ยาที่เกิด DI กับ Warfarin (MKH-FR-PHA-059) =====
 Short term (Fluoroquinolone, Itraconazole, Fluconazole, Azithromycin, Roxithromycin, Co-trimoxazole, Metronidazole, COX-II):
   INR หลังเริ่มใช้ร่วม ทุก 3 วัน (Day 3, 6, 9, 12 — เฉพาะวันที่ยังใช้ยาร่วม) · หลังหยุดยาร่วม Day 5
 Long term (Amiodarone, Fluoxetine, Valproic acid, Phenytoin + inducer ในทะเบียน): INR Day 7 หลังเริ่ม · หลังหยุด 1–3 เดือน
 ไม่มีช่องชื่อ/HN ในโปรแกรม — เว้นบรรทัดให้เขียนบนกระดาษ */
const WDI_FORM_SHORT='Fluoroquinolone, Itraconazole, Fluconazole, Azithromycin, Roxithromycin, Cotrimoxazole, Metronidazole, COX II: Celecoxib, Etoricoxib';
const WDI_FORM_LONG='Amiodarone, Fluoxetine, Valproic acid, Phenytoin';
const WDI_DRUGS=['Azithromycin','Roxithromycin','Clarithromycin','Ciprofloxacin','Levofloxacin','Norfloxacin','Ofloxacin','Fluconazole','Itraconazole','Co-trimoxazole (Bactrim)','Metronidazole','Celecoxib','Etoricoxib','Amiodarone','Fluoxetine','Valproic acid','Phenytoin','Phenobarbital','Carbamazepine','Rifampicin'];
const WDI_AMIO='ติดตาม INR อย่างใกล้ชิดในช่วง 1 สัปดาห์แรกที่เริ่มใช้ยา amiodarone · พิจารณาปรับลดขนาดยา warfarin ลง 25% ภายใน 1 สัปดาห์แรก · ในผู้ป่วยที่ได้ยา amiodarone maintenance dose 100, 200, 300, 400 mg ควรปรับลดขนาดยา warfarin ลง 25%, 30%, 35%, 40% ตามลำดับ · หลังหยุดยา amiodarone ติดตาม INR ต่อ 1–3 เดือน';
// รูปแบบเฉพาะยา (จากแบบฟอร์มจริง): start = วันติดตามหลังเริ่ม · stopD = วันหลังหยุด · stopM = ช่วงเดือนหลังหยุด · ind = กลุ่ม inducer ติดตามหลังหยุด Day 7/21/35
const WDI_PROF=[[/amiodar|cordarone/i,{form:'long',start:7,stopM:[1,3],stopTxt:'1-3 เดือน',mg:null}],
 [/valpro|depakin/i,{form:'long',start:3,stopD:14,stopTxt:'14 วัน',mg:'ติดตามค่า INR ภายใน 3 วันหลังใช้ยาร่วมกัน และปรับขนาดยา warfarin ให้เหมาะสม'}],
 [/phenytoin|dilantin/i,{form:'long',start:7,stopD:14,stopTxt:'14 วัน',mg:'ในช่วง 1 สัปดาห์แรกที่มีการใช้ร่วมกัน INR เพิ่ม ติดตาม INR หลังเริ่มใช้ร่วมกัน ภายใน 1 สัปดาห์ · จากนั้นอาจมี INR ลดลงจาก enzyme inducer · หลังหยุดใช้ร่วมกัน ติดตาม INR ภายใน 1-2 สัปดาห์'}],
 [/fluoxet|prozac/i,{form:'long',start:7,stopD:14,stopTxt:'14 วัน',mg:null}],
 [/rifamp|\brifam\b|rifinah|rimstar|carbamaz|tegretol|phenobarb/i,{form:'ind',stopDays:[7,21,35]}]];
const wdiProf=nm=>(WDI_PROF.find(x=>x[0].test(nm))||[])[1]||null;
const WDI_FORM_IND='Rifampin, Carbamazepine, Phenobarbital';
function wdiInfo(name){ const k=(typeof WARF_DI!=='undefined'?WARF_DI:[]).find(x=>x.re.test(name)); return k||null; }
function wdiCalc(){ const nm=$('wdDrug').value.trim(), info=wdiInfo(nm), st=mrDate($('wdStart').value), sp=$('wdStop').value.trim();
  let stop=null; if(sp){ const m=sp.match(/^(\d+)\s*(วัน|days?|d)$/i); stop=m&&st?mrAdd(st,+m[1]-1):mrDate(sp,st||new Date()); }
  const prof=wdiProf(nm), formSel=$('wdForm').value, form=formSel==='auto'?(prof?prof.form:info?info.form:'short'):formSel;
  return {nm,info,prof:prof||{form:'long',start:7,stopD:14,stopTxt:'14 วัน'},st,stop,form,inr:$('wdInr').value.trim(),tgt:$('wdTgt').value.trim(),phase:$('wdPhase').value,hosp:$('wdHosp').value.trim(),card:$('wdCard').value,inrStop:$('wdInrStop').value.trim()}; }
const wdF=d=>d?`${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()+543).slice(2)}`:'............';
function wdiHtml(o,forPrint){ const L=x=>`<span style="display:inline-block;min-width:${x||90}px;border-bottom:1px dotted #64748b;text-align:center">&nbsp;</span>`, V=(v,w)=>v?`<b style="display:inline-block;min-width:${w||70}px;border-bottom:1px dotted #64748b;text-align:center">${esc(v)}</b>`:L(w);
  const head=`<div style="font-size:10px;text-align:right;color:#475569">MKH-FR-PHA-059</div>${o.hosp?`<div style="font-size:20px;font-weight:700;color:#be185d;text-align:right">ติดตาม ${esc(o.hosp)}</div>`:''}
   <div style="border:1.5px solid #0f172a;padding:6px 10px;text-align:center;font-weight:700;margin:4px 0 8px">แบบส่งต่อเพื่อติดตามค่า INR อย่างใกล้ชิด จากคู่ยาที่เกิด Drug interaction กับ ยา Warfarin<br>โรงพยาบาลมหาสารคาม</div>
   <div style="text-align:center;font-size:12.5px;margin-bottom:8px">สำหรับคู่ยาที่ใช้ร่วมกัน ${o.form==='long'?`(${WDI_FORM_LONG})`:o.form==='ind'?`(${WDI_FORM_IND})`:`Short term (${WDI_FORM_SHORT})`}</div>
   <p style="margin:4px 0">ชื่อผู้ป่วย ${L(200)} HN ${L(80)} Target INR ${V(o.tgt,60)} วันที่ ${V(o.st?wdF(o.st):'',70)}</p>
   <p style="margin:4px 0 10px;text-indent:2em">มีความจำเป็นต้องใช้ยา Warfarin ร่วมกับยา ${V(o.nm,120)} จึงต้องมีการติดตาม INR อย่างใกล้ชิด เพื่อเฝ้าระวังการเกิดอาการไม่พึงประสงค์จากยา</p>`;
  const foot=`<p style="margin:14px 0 2px;font-weight:700;text-align:center">* กรุณาแนบแบบติดตาม INR ระหว่างคู่ยา Warfarin นี้ในสมุดประจำตัวผู้ป่วยที่รับประทานยา Warfarin ทุกครั้งที่มาพบแพทย์ *</p>
   <p style="margin:0;text-align:center">เมื่อหยุดใช้ยาร่วมกัน ครบ 1-2 สัปดาห์ หรือ INR in target สามารถดึงแบบติดตามออกได้</p>
   <p style="margin:8px 0 0;font-size:10.5px;color:#475569">หากมีข้อสงสัยสามารถติดต่อสอบถามได้ที่ กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม โทร.043-711750 ต่อ ห้องยาผู้ป่วยนอก 9250, 9246 / ห้องยาผู้ป่วยใน 9248, 9249 / ห้องยาฉุกเฉิน 9286</p>`;
  const row=(lab,d,note)=>`<tr><td style="padding:3px 6px">${lab}</td><td style="padding:3px 6px">วันที่ติดตาม ${V(d?wdF(d):'',70)}</td><td style="padding:3px 6px">INR = ${L(70)}</td>${note||''}</tr>`;
  let body='';
  if(o.form==='short'){ const days=[3,6,9,12].map(n=>({n,d:o.st?mrAdd(o.st,n):null})).filter(x=>!o.stop||!x.d||x.d<=o.stop);
    const box=`<td rowspan="${days.length+3}" style="vertical-align:middle;padding-left:10px"><div style="border:1px dashed #0f172a;padding:6px;font-size:12px;width:150px">หาก INR มีแนวโน้มเพิ่มขึ้น เรียนปรึกษาแพทย์เพื่อปรับลดขนาด warfarin หรือหยุดยาได้</div></td>`;
    body=`<table style="border-collapse:collapse;width:100%;font-size:13.5px">
     <tr><td colspan="3" style="padding:3px 0"><b>➜ เริ่มใช้ยาร่วมกัน</b> วันที่ ${V(o.st?wdF(o.st):'',70)} &nbsp; INR = ${V(o.inr,60)}</td>${box}</tr>
     <tr><td colspan="3" style="padding:2px 0"><u><b>ติดตาม INR หลังเริ่มใช้ยาร่วมกัน ทุก 3 วัน</b></u></td></tr>
     ${days.map((x,i)=>row(`Day ${x.n}`,x.d)).join('')}
     <tr><td colspan="3" style="padding:8px 0 2px"><b>➜ หยุดใช้ยา</b> ${V(o.nm,100)} วันที่ ${V(o.stop?wdF(o.stop):'',70)}</td></tr>
     <tr><td colspan="4" style="padding:2px 0"><u><b>ติดตาม INR หลังหยุดใช้ยา ร่วมกัน 5 วัน</b></u></td></tr>
     ${row('Day5 หลังหยุดยา',o.stop?mrAdd(o.stop,5):null)}</table>
     ${o.stop&&o.st&&[3,6,9,12].some(n=>mrAdd(o.st,n)>o.stop)?`<p style="font-size:11px;color:#64748b;margin:4px 0 0">ตัดวันติดตามหลังวันหยุดยาออกแล้ว (Day ${[3,6,9,12].filter(n=>mrAdd(o.st,n)>o.stop).join(', ')})</p>`:''}`; }
  else if(o.form==='ind'){ const sd=o.prof.stopDays||[7,21,35];
    body=`<table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:8px" border="1"><tr><td style="padding:3px 6px;width:70px">Drug I :</td><td style="padding:3px 6px;width:110px">Warfarin</td><td rowspan="2" style="padding:3px 6px">${esc(o.info?o.info.eff:'enzyme inducer ↓INR · หลังหยุดยา INR สูงขึ้น เสี่ยงเลือดออก')}</td></tr><tr><td style="padding:3px 6px">Drug II :</td><td style="padding:3px 6px">${esc(o.nm)}</td></tr></table>
     <p style="margin:0 0 6px;font-size:12.5px"><b>Management :</b> หลังหยุดยา ${esc(o.nm)} ติดตาม INR ภายใน 1 สัปดาห์ เพื่อพิจารณาลดขนาดยา Warfarin ลง ติดตาม INR ต่ออย่างใกล้ชิด จนถึง 5 สัปดาห์ (เนื่องจากหลังหยุดใช้ร่วมกันยังมีผลต่อถึง 5 สัปดาห์)</p>
     <p style="margin:6px 0 2px"><b>Follow up &amp; Monitoring :</b></p>
     <p style="margin:2px 0"># <u><b>ต้องมีการติดตามค่า INR หลังหยุดใช้ยาร่วมกัน</b></u></p>
     <p style="margin:2px 0 2px 2em">หลังหยุดยา ${esc(o.nm)} ควรติดตามค่า INR ภายใน 1 สัปดาห์ · พิจารณาลดขนาดยา Warfarin ลง และอาจจำเป็นต้องติดตาม INR ต่อไปจนถึง 5 สัปดาห์</p>
     <p style="margin:6px 0 2px 2em">หยุดใช้ยาร่วมกันวันที่ ${V(o.stop?wdF(o.stop):'',70)} (INR ก่อนหยุดยาล่าสุด = ${V(o.inrStop,50)})</p>
     <div style="border:1.5px dashed #0f172a;padding:6px 10px;margin:8px 0"><b><u>นัดติดตาม INR หลังหยุดใช้ร่วมกัน ที่</u></b><table style="margin-left:12em;font-size:13.5px">${sd.map(n=>`<tr><td style="padding:2px 8px"><u>Day ${n}</u> =</td><td>วันที่ ${V(o.stop?wdF(mrAdd(o.stop,n)):'',80)}</td><td style="padding-left:8px">INR = ${L(60)} *</td></tr>`).join('')}</table><div style="text-align:center;font-size:12.5px">( * ) พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR</div></div>`; }
  else { const pf=o.prof, isAmio=/amiodar|cordarone/i.test(o.nm), i=o.info, offS=o.phase==='stop', offE=o.phase==='start', X=off=>off?'opacity:.35;text-decoration:line-through;':'';
    const mg=isAmio?WDI_AMIO:pf.mg||(i&&i.mon)||'';
    const stopLine=pf.stopM?`ติดตาม INR หลังหยุดใช้ยาร่วมกัน ${pf.stopTxt} วันที่ ${V(o.stop?wdF(mrAddMon(o.stop,pf.stopM[0])):'',80)} &nbsp; INR = ${L(70)}${o.stop?`<br><span style="font-size:12px">(ช่วงวันที่ ${wdF(mrAddMon(o.stop,pf.stopM[0]))} – ${wdF(mrAddMon(o.stop,pf.stopM[1]))} · พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR)</span>`:''}`
      :`ติดตาม INR หลังหยุดใช้ยา ร่วมกัน ${pf.stopTxt} วันที่ ${V(o.stop?wdF(mrAdd(o.stop,pf.stopD)):'',80)} &nbsp; INR = ${L(70)}<br><span style="font-size:12px">(พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR)</span>`;
    body=`<table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:8px" border="1"><tr><td style="padding:3px 6px;width:70px">Drug I :</td><td style="padding:3px 6px;width:110px">Warfarin</td><td rowspan="2" style="padding:3px 6px">เมื่อมีการใช้ร่วมกัน อาจทำให้ค่า INR เพิ่มขึ้น และเพิ่มความเสี่ยงในการเกิด bleeding${i?` <span style="font-size:11.5px;color:#475569">(${esc(i.eff)})</span>`:''}</td></tr><tr><td style="padding:3px 6px">Drug II :</td><td style="padding:3px 6px">${esc(o.nm||'')}</td></tr></table>
     ${mg?`<p style="margin:0 0 6px;font-size:12.5px"><b>Management :</b> ${esc(mg)}</p>`:''}
     <p style="margin:6px 0 2px"><b>Follow up &amp; Monitoring :</b></p>
     <div style="${X(offE)}"><p style="margin:2px 0">${offE?'○':'☑'} <u><b>ติดตาม INR เมื่อเริ่มใช้ร่วมกัน</b></u></p>
     <p style="margin:2px 0 2px 2em">เริ่มใช้ร่วมกัน วันที่ ${V(o.st?wdF(o.st):'',70)} &nbsp; INR = ${V(o.inr,60)}</p>
     <p style="margin:2px 0 2px 2em">ติดตาม INR หลังเริ่มใช้ร่วมกัน Day ${pf.start} วันที่ ${V(o.st?wdF(mrAdd(o.st,pf.start)):'',70)} &nbsp; INR = ${L(70)}<br><span style="font-size:12px">(พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR)</span></p></div>
     <div style="${X(offS)}"><p style="margin:8px 0 2px">${offS?'○':'☑'} <u><b>ติดตาม INR หลังหยุดใช้ร่วมกัน</b></u></p>
     <p style="margin:2px 0 2px 2em">หยุดใช้ยาร่วมกัน วันที่ ${V(o.stop?wdF(o.stop):'',70)}</p>
     <p style="margin:2px 0 2px 2em">${stopLine}</p></div>`; }
  const card=o.card==='none'?'':wdiCard(o);
  return `<div class="wdform" style="font-family:Sarabun,Tahoma,sans-serif;color:#0f172a;background:#fff;padding:${forPrint?0:'14px'};border:${forPrint?'0':'1px solid #cbd5e1'};border-radius:8px;max-width:760px">${head}${body}${foot}</div>${card}`; }
// ใบนำทางผู้ป่วย: เหลือง = ติดตามที่ รพ.มค · ฟ้า = ส่งต่อ รพ.ชุมชน
function wdiCard(o){ const blue=o.card==='blue', bg=blue?'#cfe8f3':'#fde047', H=o.hosp||'..............................';
  return `<div style="page-break-inside:avoid;margin-top:14px;border:1.5px dashed #0f172a;background:${bg};padding:10px 14px;font-family:Sarabun,Tahoma,sans-serif;color:#0f172a;max-width:760px;font-size:13px">
   ${blue?`<p style="margin:0 0 6px"><b>ส่งต่อโรงพยาบาล</b> ${esc(H)}</p><p style="margin:0 0 8px;border-bottom:1px dashed #0f172a;padding-bottom:6px">เนื่องจากผู้ป่วยมีความจำเป็นต้องมีการติดตามค่า INR อย่างใกล้ชิด รายละเอียดตามเอกสารที่แนบมาด้วย ทางโรงพยาบาลมหาสารคามจึงมีความจำเป็นขอส่งต่อผู้ป่วยเจาะเลือดติดตามค่า INR ตามวันที่ระบุ</p>`:`<div style="display:flex;justify-content:space-between"><b>ใบนำทางช่องทางด่วน เคสติดตาม INR</b><span style="font-size:11px">สำหรับผู้ป่วยที่มารับบริการที่ รพ.มหาสารคาม</span></div>`}
   <p style="margin:4px 0"><u><b>${blue?'สำหรับผู้ป่วย ไปตามนัดเพื่อติดตามผลเลือด':'ข้อแนะนำ สำหรับผู้ป่วย เพื่อมาตามนัดเพื่อติดตามผลเลือด'}</b></u></p>
   <ol style="margin:2px 0 6px;padding-left:20px"><li>กรุณาเก็บเอกสารแบบส่งต่อเพื่อติดตามค่า INR ${blue?'นี้ไว้':'และใบนัดทั้งหมดนี้ไว้ นำมายื่นตรวจตามนัดหมาย'}</li>
   <li>${blue?`เมื่อถึงกำหนดนัดหมายนำเอกสารทั้งหมดไปยื่นเภสัชกรที่ห้องยา โรงพยาบาล ${esc(H)}`:'เมื่อถึงกำหนดนัดหมายนำเอกสารมายื่นห้องบัตร (เพื่อส่งต่อห้องตรวจ)'}</li><li>เมื่อหน้าห้องตรวจส่งเจาะเลือด <b>**กรุณาอยู่รอฟังผลเลือด**</b></li></ol>
   <p style="margin:4px 0"><u><b>สิ่งที่ต้องนำมาพร้อม</b></u> ✱ ใบส่งต่อติดตามค่า INR และใบนัดทั้งหมด · ✱ บัตรประชาชนผู้ป่วย · ✱ สมุดประจำตัวสำหรับผู้ป่วยที่รับประทานยาวาร์ฟาริน · ✱ ยาเดิม</p>
   <p style="margin:4px 0;font-weight:700;text-decoration:underline">ระหว่างที่ยังไม่ถึงวันนัด หากมีเลือดออกผิดปกติ สามารถไปโรงพยาบาลติดต่อเจาะเลือดก่อนกำหนดได้</p>
   ${blue?`<p style="margin:6px 0 0;border-top:1px dashed #0f172a;padding-top:6px"><u><b>สำหรับเจ้าหน้าที่โรงพยาบาลชุมชน</b></u> ส่งต่อ INR และปฏิบัติตามรายละเอียดในแบบส่งต่อเพื่อติดตามค่า INR จากคู่ยาที่เกิด Drug interaction ที่แนบมาด้วย</p>`:''}
   <p style="margin:6px 0 0">เบอร์โทรติดต่อผู้ป่วย/ญาติ ............................................</p></div>`; }
function wdiText(o){ const L=[`แบบติดตาม INR — DI Warfarin + ${o.nm} (${o.form==='long'?'Long term':o.form==='ind'?'Inducer':'Short term'})${o.tgt?` · Target INR ${o.tgt}`:''}`]; if(o.form!=='ind'&&!(o.form==='long'&&o.phase==='stop')) L.push(`เริ่มใช้ร่วมกัน ${wdF(o.st)}${o.inr?` · INR ${o.inr}`:''}`);
  if(o.form==='short'){ [3,6,9,12].forEach(n=>{ const d=o.st?mrAdd(o.st,n):null; if(!o.stop||!d||d<=o.stop) L.push(`  Day ${n}: ${wdF(d)} INR = ....`); }); L.push(`หยุดยา ${o.nm} ${wdF(o.stop)}`,`  Day 5 หลังหยุด: ${wdF(o.stop?mrAdd(o.stop,5):null)} INR = ....`); }
  else if(o.form==='ind'){ L.push(`หยุดใช้ร่วมกัน ${wdF(o.stop)}${o.inrStop?` (INR ก่อนหยุด ${o.inrStop})`:''}`); (o.prof.stopDays||[7,21,35]).forEach(n=>L.push(`  Day ${n} หลังหยุด: ${wdF(o.stop?mrAdd(o.stop,n):null)} INR = ....`)); }
  else { const pf=o.prof; if(o.phase!=='stop') L.push(`  Day ${pf.start} หลังเริ่ม: ${wdF(o.st?mrAdd(o.st,pf.start):null)} INR = ....`); if(o.phase!=='start'){ L.push(`หยุดใช้ร่วมกัน ${wdF(o.stop)}`, pf.stopM?`  หลังหยุด ${pf.stopTxt}: ${o.stop?`${wdF(mrAddMon(o.stop,pf.stopM[0]))} – ${wdF(mrAddMon(o.stop,pf.stopM[1]))}`:'....'} INR = ....`:`  หลังหยุด ${pf.stopTxt}: ${wdF(o.stop?mrAdd(o.stop,pf.stopD):null)} INR = ....`); } }
  if(o.hosp) L.push(`ติดตามที่ ${o.hosp}`);
  L.push('หาก INR มีแนวโน้มเพิ่มขึ้น เรียนปรึกษาแพทย์เพื่อปรับลดขนาด warfarin หรือหยุดยาได้'); return L.join('\n'); }
function wdiRender(){ const out=$('wdOut'); if(!out) return; const o=wdiCalc();
  $('wdFormTxt').textContent=o.nm?(o.info?`${o.info.name} · ${o.form==='long'?'Long term':o.form==='ind'?'Inducer (ติดตามหลังหยุด Day 7/21/35)':'Short term'} · ${o.info.eff}`:'ไม่พบในทะเบียน DI warfarin ของ รพ. — เลือกชนิดแบบฟอร์มเอง'):'';
  if(!o.nm){ out.innerHTML='<div class="empty">เลือก/พิมพ์ยาที่ใช้ร่วมกับ warfarin</div>'; return; }
  const need=[]; if(o.form!=='ind'&&o.phase!=='stop'&&!o.st) need.push('วันเริ่มใช้ยาร่วมกัน → คำนวณวันนัด Day '+(o.form==='short'?'3/6/9/12':o.prof.start));
  if(o.form==='ind'||o.phase!=='start'){ if(!o.stop) need.push('วันหยุดยา (พิมพ์วันที่ หรือ "5 วัน") → คำนวณวันนัดหลังหยุด'); }
  if(o.form==='ind'&&!o.inrStop) need.push('INR ก่อนหยุดยาล่าสุด'); else if(o.form!=='ind'&&o.phase!=='stop'&&!o.inr) need.push('INR วันเริ่ม (ถ้ามี)');
  const hint=need.length?`<div data-nocopy style="background:#fff7ed;border:1px solid #fb923c;color:#9a3412;border-radius:8px;padding:6px 10px;margin:0 0 8px;font-size:13px"><b>ยังไม่ได้กรอก (ช่องด้านบน):</b> ${need.map(esc).join(' · ')}<br><span style="font-size:12px">ช่องที่เว้นว่างจะพิมพ์เป็นเส้นประให้เขียนมือ · ชื่อผู้ป่วย / HN / เบอร์โทร เขียนมือเสมอ</span></div>`:`<div data-nocopy style="color:#15803d;font-size:13px;margin:0 0 8px">✓ กรอกครบ วันนัดคำนวณแล้ว · เหลือเขียนมือ ชื่อผู้ป่วย / HN / ผล INR</div>`;
  out.innerHTML=`<h2>แบบส่งต่อติดตาม INR (DI Warfarin)</h2>${hint}${wdiHtml(o)}<div style="display:flex;gap:6px;margin-top:8px"><button class="btn sm pri" type="button" id="wdPr">พิมพ์แบบฟอร์ม</button><button class="btn sm" type="button" id="wdCp">คัดลอกตารางวันนัด</button><span class="toast" id="wdMsg"></span></div>`;
  $('wdPr').onclick=()=>printHtml(`<div class="mk">${wdiHtml(o,true)}</div>`);
  $('wdCp').onclick=()=>{ const t=wdiText(o); copyRich(txtHtml(t),t,$('wdMsg')); }; }
(function(){ if(!$('wdOut')) return; $('wdDrugL').innerHTML=WDI_DRUGS.map(x=>`<option value="${x}">`).join('');
  ['wdDrug','wdStart','wdStop','wdInr','wdTgt','wdHosp','wdInrStop'].forEach(id=>$(id).addEventListener('input',wdiRender)); ['wdForm','wdPhase','wdCard'].forEach(id=>$(id).addEventListener('change',wdiRender));
  $('wdFromScr').onclick=()=>{ const w=rows.find(r=>r.drugId==='warfarin'||/warfarin/i.test(r.raw)); const d=rows.map(r=>r.raw+' '+((masterOf(r)||[])[1]||'')).find(t=>!/warfarin/i.test(t)&&wdiInfo(t));
    if(!d){ cpMsg($('wdMsg0'),w?'ไม่พบยาที่เกิด DI กับ warfarin ในหน้าคัดกรอง':'หน้าคัดกรองไม่มี warfarin'); return; }
    const nm=(WDI_DRUGS.find(x=>new RegExp(x.split(/[ (]/)[0],'i').test(d))||wdiInfo(d).name); $('wdDrug').value=nm; if(!$('wdStart').value) $('wdStart').value=tlFmt(new Date(),false); const inr=$('inr').value; if(inr&&!$('wdInr').value) $('wdInr').value=inr; wdiRender(); };
  wdiRender(); })();
