/* ===== wfdi.js — แบบส่งต่อเพื่อติดตามค่า INR อย่างใกล้ชิด จากคู่ยาที่เกิด DI กับ Warfarin (MKH-FR-PHA-059) =====
 Short term (Fluoroquinolone, Itraconazole, Fluconazole, Azithromycin, Roxithromycin, Co-trimoxazole, Metronidazole, COX-II):
   INR หลังเริ่มใช้ร่วม ทุก 3 วัน (Day 3, 6, 9, 12 — เฉพาะวันที่ยังใช้ยาร่วม) · หลังหยุดยาร่วม Day 5
 Long term (Amiodarone, Fluoxetine, Valproic acid, Phenytoin + inducer ในทะเบียน): INR Day 7 หลังเริ่ม · หลังหยุด 1–3 เดือน
 ไม่มีช่องชื่อ/HN ในโปรแกรม — เว้นบรรทัดให้เขียนบนกระดาษ */
const WDI_FORM_SHORT='Fluoroquinolone, Itraconazole, Fluconazole, Azithromycin, Roxithromycin, Cotrimoxazole, Metronidazole, COX II: Celecoxib, Etoricoxib';
const WDI_FORM_LONG='Amiodarone, Fluoxetine, Valproic acid, Phenytoin';
const WDI_DRUGS=['Azithromycin','Roxithromycin','Clarithromycin','Ciprofloxacin','Levofloxacin','Norfloxacin','Ofloxacin','Fluconazole','Itraconazole','Co-trimoxazole (Bactrim)','Metronidazole','Celecoxib','Etoricoxib','Amiodarone','Fluoxetine','Valproic acid','Phenytoin','Phenobarbital','Carbamazepine','Rifampicin'];
const WDI_AMIO='ติดตาม INR อย่างใกล้ชิดในช่วง 1 สัปดาห์แรกที่เริ่มใช้ยา amiodarone · พิจารณาปรับลดขนาดยา warfarin ลง 25% ภายใน 1 สัปดาห์แรก · ในผู้ป่วยที่ได้ยา amiodarone maintenance dose 100, 200, 300, 400 mg ควรปรับลดขนาดยา warfarin ลง 25%, 30%, 35%, 40% ตามลำดับ · หลังหยุดยา amiodarone ติดตาม INR ต่อ 1–3 เดือน';
function wdiInfo(name){ const k=(typeof WARF_DI!=='undefined'?WARF_DI:[]).find(x=>x.re.test(name)); return k||null; }
function wdiCalc(){ const nm=$('wdDrug').value.trim(), info=wdiInfo(nm), st=mrDate($('wdStart').value), sp=$('wdStop').value.trim();
  let stop=null; if(sp){ const m=sp.match(/^(\d+)\s*(วัน|days?|d)$/i); stop=m&&st?mrAdd(st,+m[1]-1):mrDate(sp,st||new Date()); }
  const formSel=$('wdForm').value, form=formSel==='auto'?(info?info.form:'short'):formSel;
  return {nm,info,st,stop,form,inr:$('wdInr').value.trim(),tgt:$('wdTgt').value.trim()}; }
const wdF=d=>d?`${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()+543).slice(2)}`:'............';
function wdiHtml(o,forPrint){ const L=x=>`<span style="display:inline-block;min-width:${x||90}px;border-bottom:1px dotted #64748b;text-align:center">&nbsp;</span>`, V=(v,w)=>v?`<b style="display:inline-block;min-width:${w||70}px;border-bottom:1px dotted #64748b;text-align:center">${esc(v)}</b>`:L(w);
  const head=`<div style="font-size:10px;text-align:right;color:#475569">MKH-FR-PHA-059</div>
   <div style="border:1.5px solid #0f172a;padding:6px 10px;text-align:center;font-weight:700;margin:4px 0 8px">แบบส่งต่อเพื่อติดตามค่า INR อย่างใกล้ชิด จากคู่ยาที่เกิด Drug interaction กับ ยา Warfarin<br>โรงพยาบาลมหาสารคาม</div>
   <div style="text-align:center;font-size:12.5px;margin-bottom:8px">สำหรับคู่ยาที่ใช้ร่วมกัน ${o.form==='long'?`(${WDI_FORM_LONG})`:`Short term (${WDI_FORM_SHORT})`}</div>
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
  else { const isAmio=/amiodar|cordarone/i.test(o.nm), i=o.info;
    body=`<table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:8px" border="1"><tr><td style="padding:3px 6px;width:70px">Drug I :</td><td style="padding:3px 6px;width:110px">Warfarin</td><td rowspan="2" style="padding:3px 6px">${esc(i?`${i.eff}${i.mg?' · '+i.mg:''}`:'เมื่อมีการใช้ร่วมกัน อาจทำให้ค่า INR เปลี่ยนแปลง และเพิ่มความเสี่ยงในการเกิด bleeding')}</td></tr><tr><td style="padding:3px 6px">Drug II :</td><td style="padding:3px 6px">${esc(o.nm||'')}</td></tr></table>
     ${isAmio?`<p style="margin:0 0 6px;font-size:12.5px"><b>Management :</b> ${WDI_AMIO}</p>`:i&&i.mon?`<p style="margin:0 0 6px;font-size:12.5px"><b>Management :</b> ${esc(i.mon)}</p>`:''}
     <p style="margin:6px 0 2px"><b>Follow up &amp; Monitoring :</b></p>
     <p style="margin:2px 0">○ <u><b>ติดตาม INR เมื่อเริ่มใช้ร่วมกัน</b></u></p>
     <p style="margin:2px 0 2px 2em">เริ่มใช้ร่วมกัน วันที่ ${V(o.st?wdF(o.st):'',70)} &nbsp; INR = ${V(o.inr,60)}</p>
     <p style="margin:2px 0 2px 2em">ติดตาม INR หลังเริ่มใช้ร่วมกัน Day 7 วันที่ ${V(o.st?wdF(mrAdd(o.st,7)):'',70)} &nbsp; INR = ${L(70)}<br><span style="font-size:12px">(พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR)</span></p>
     <p style="margin:8px 0 2px">○ <u><b>ติดตาม INR หลังหยุดใช้ร่วมกัน</b></u></p>
     <p style="margin:2px 0 2px 2em">หยุดใช้ยาร่วมกัน วันที่ ${V(o.stop?wdF(o.stop):'',70)}</p>
     <p style="margin:2px 0 2px 2em">ติดตาม INR หลังหยุดใช้ยาร่วมกัน 1-3 เดือน วันที่ ${L(80)} &nbsp; INR = ${L(70)}${o.stop?`<br><span style="font-size:12px">(ช่วงวันที่ ${wdF(mrAddMon(o.stop,1))} – ${wdF(mrAddMon(o.stop,3))} · พิจารณาปรับขนาดยา warfarin ให้เหมาะสมตามผล INR)</span>`:''}</p>`; }
  return `<div class="wdform" style="font-family:Sarabun,Tahoma,sans-serif;color:#0f172a;background:#fff;padding:${forPrint?0:'14px'};border:${forPrint?'0':'1px solid #cbd5e1'};border-radius:8px;max-width:760px">${head}${body}${foot}</div>`; }
function wdiText(o){ const L=[`แบบติดตาม INR — DI Warfarin + ${o.nm} (${o.form==='long'?'Long term':'Short term'})${o.tgt?` · Target INR ${o.tgt}`:''}`,`เริ่มใช้ร่วมกัน ${wdF(o.st)}${o.inr?` · INR ${o.inr}`:''}`];
  if(o.form==='short'){ [3,6,9,12].forEach(n=>{ const d=o.st?mrAdd(o.st,n):null; if(!o.stop||!d||d<=o.stop) L.push(`  Day ${n}: ${wdF(d)} INR = ....`); }); L.push(`หยุดยา ${o.nm} ${wdF(o.stop)}`,`  Day 5 หลังหยุด: ${wdF(o.stop?mrAdd(o.stop,5):null)} INR = ....`); }
  else { L.push(`  Day 7: ${wdF(o.st?mrAdd(o.st,7):null)} INR = ....`,`หยุดใช้ร่วมกัน ${wdF(o.stop)}`,`  หลังหยุด 1-3 เดือน: ${o.stop?`${wdF(mrAddMon(o.stop,1))} – ${wdF(mrAddMon(o.stop,3))}`:'....'} INR = ....`); }
  L.push('หาก INR มีแนวโน้มเพิ่มขึ้น เรียนปรึกษาแพทย์เพื่อปรับลดขนาด warfarin หรือหยุดยาได้'); return L.join('\n'); }
function wdiRender(){ const out=$('wdOut'); if(!out) return; const o=wdiCalc();
  $('wdFormTxt').textContent=o.nm?(o.info?`${o.info.name} · ${o.info.form==='long'?'Long term':'Short term'} · ${o.info.eff}`:'ไม่พบในทะเบียน DI warfarin ของ รพ. — เลือกชนิดแบบฟอร์มเอง'):'';
  if(!o.nm){ out.innerHTML='<div class="empty">เลือก/พิมพ์ยาที่ใช้ร่วมกับ warfarin</div>'; return; }
  out.innerHTML=`<h2>แบบส่งต่อติดตาม INR (DI Warfarin)</h2>${wdiHtml(o)}<div style="display:flex;gap:6px;margin-top:8px"><button class="btn sm pri" type="button" id="wdPr">พิมพ์แบบฟอร์ม</button><button class="btn sm" type="button" id="wdCp">คัดลอกตารางวันนัด</button><span class="toast" id="wdMsg"></span></div>`;
  $('wdPr').onclick=()=>printHtml(`<div class="mk">${wdiHtml(o,true)}</div>`);
  $('wdCp').onclick=()=>{ const t=wdiText(o); copyRich(txtHtml(t),t,$('wdMsg')); }; }
(function(){ if(!$('wdOut')) return; $('wdDrugL').innerHTML=WDI_DRUGS.map(x=>`<option value="${x}">`).join('');
  ['wdDrug','wdStart','wdStop','wdInr','wdTgt'].forEach(id=>$(id).addEventListener('input',wdiRender)); $('wdForm').addEventListener('change',wdiRender);
  $('wdFromScr').onclick=()=>{ const w=rows.find(r=>r.drugId==='warfarin'||/warfarin/i.test(r.raw)); const d=rows.map(r=>r.raw+' '+((masterOf(r)||[])[1]||'')).find(t=>!/warfarin/i.test(t)&&wdiInfo(t));
    if(!d){ cpMsg($('wdMsg0'),w?'ไม่พบยาที่เกิด DI กับ warfarin ในหน้าคัดกรอง':'หน้าคัดกรองไม่มี warfarin'); return; }
    const nm=(WDI_DRUGS.find(x=>new RegExp(x.split(/[ (]/)[0],'i').test(d))||wdiInfo(d).name); $('wdDrug').value=nm; if(!$('wdStart').value) $('wdStart').value=tlFmt(new Date(),false); const inr=$('inr').value; if(inr&&!$('wdInr').value) $('wdInr').value=inr; wdiRender(); };
  wdiRender(); })();
