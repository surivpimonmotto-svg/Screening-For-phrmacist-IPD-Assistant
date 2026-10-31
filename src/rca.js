/* ===== rca.js — RCA เหตุการณ์ด้านยา: 5 Whys · ผังก้างปลา · Action plan · แบบฟอร์ม RCA (HA) =====
 ไม่เก็บชื่อ/HN ผู้ป่วย — เก็บในเครื่องนี้ (localStorage) และบันทึก/เปิดเป็นไฟล์ .json ได้
*/
const RCA_TYPES=[
 ['PE','Prescribing error (สั่งใช้ยาคลาดเคลื่อน)'],['TE','Transcribing error (คัดลอกคำสั่งคลาดเคลื่อน)'],['PDE','Pre-dispensing error (ก่อนจ่ายยา/จัดยาผิด)'],
 ['DE','Dispensing error (จ่ายยาผิด)'],['AE','Administration error (บริหารยาผิด)'],['ALG','แพ้ยาซ้ำ / แพ้ยากลุ่มเดียวกัน'],['ADR','ADR ที่ป้องกันได้'],['OTH','อื่นๆ']];
const RCA_SEV=[['A','A — มีโอกาสเกิด แต่ยังไม่เกิด'],['B','B — เกิด แต่ไม่ถึงผู้ป่วย'],['C','C — ถึงผู้ป่วย ไม่เกิดอันตราย'],['D','D — ถึงผู้ป่วย ต้องเฝ้าระวัง'],['E','E — อันตรายชั่วคราว ต้องรักษา'],['F','F — อันตรายชั่วคราว นอน รพ.นานขึ้น'],['G','G — อันตรายถาวร'],['H','H — ต้องช่วยชีวิต'],['I','I — เสียชีวิต']];
const FB_CAT=[['people','คน (Man)','บุคลากร ความรู้ ทักษะ ความเหนื่อยล้า ภาระงาน'],['method','วิธีการ/กระบวนการ (Method)','ขั้นตอน double check การส่งต่อ WI'],['machine','เครื่องมือ/IT (Machine)','HIS ระบบเตือน ปั๊ม ฉลาก printer'],['material','ยา/ฉลาก (Material)','LASA บรรจุภัณฑ์ ความแรงหลายขนาด'],['env','สิ่งแวดล้อม (Environment)','แสง เสียง สิ่งรบกวน การจัดวางยา'],['comm','การสื่อสาร/นโยบาย (Management)','คำสั่งไม่ชัด การส่งเวร นโยบาย']];
// ปัจจัยที่พบบ่อยตามชนิดเหตุการณ์ (คลิกเพิ่มลงก้างปลาได้)
const RCA_HINT={
 PE:[['people','ไม่ทราบค่าไต/น้ำหนักผู้ป่วยขณะสั่ง'],['people','ไม่ทราบประวัติแพ้ยา'],['machine','ระบบ CPOE ไม่มีการเตือนขนาดยา/ไต'],['method','ไม่มีการทบทวนยาเมื่อค่าไตเปลี่ยน'],['material','ยามีหลายความแรง'],['comm','คำสั่งใช้ยาไม่ครบ/กำกวม (ไม่ระบุ dose, rate)']],
 TE:[['comm','ลายมือ/คำย่อไม่ชัด'],['method','ไม่มีการอ่านทวนคำสั่ง (read back)'],['machine','scan order ไม่ชัด'],['people','ภาระงานสูง เร่งรีบ'],['method','คีย์คำสั่งซ้ำ/ไม่ยกเลิกคำสั่งเดิม']],
 PDE:[['material','ยา LASA วางใกล้กัน'],['material','บรรจุภัณฑ์คล้ายกัน'],['method','ไม่มี double check ก่อนส่งต่อ'],['env','มีสิ่งรบกวนขณะจัดยา'],['machine','ฉลากยาพิมพ์ไม่ชัด/ผิด']],
 DE:[['material','ยา LASA (ชื่อ/รูปคล้าย)'],['material','ความแรงหลายขนาด'],['method','ไม่ตรวจสอบยาตามฉลากก่อนจ่าย'],['method','ไม่มี double check ยา HAD'],['people','ภาระงานสูง/อัตรากำลังไม่พอ'],['env','สิ่งรบกวนขณะจ่ายยา'],['machine','ระบบ barcode/scan ไม่ครอบคลุม']],
 AE:[['method','ไม่ตรวจสอบตัวผู้ป่วย 2 identifiers'],['people','คำนวณ rate/dilution ผิด'],['machine','ตั้งปั๊มผิด/ไม่มี smart pump'],['comm','ส่งเวรไม่ครบ'],['method','ไม่มี independent double check ยา HAD'],['env','ผู้ป่วยหนาแน่น/ย้ายเตียง']],
 ALG:[['method','ไม่ได้ซักประวัติแพ้ยาก่อนให้ยา'],['machine','ประวัติแพ้ยาไม่ขึ้นเตือนใน HIS/ไม่บันทึก'],['material','ไม่มีสติ๊กเกอร์/บัตรแพ้ยา'],['people','ไม่ทราบการแพ้ข้ามกลุ่ม'],['comm','ผู้ป่วย/ญาติไม่ได้แจ้ง'],['method','ไม่ตรวจสอบแพ้ยาก่อนจ่าย']],
 ADR:[['method','ไม่ติดตาม lab ตามแนวทาง'],['people','ไม่ปรับขนาดตามไต/ตับ'],['method','ไม่ประเมิน DI'],['comm','ไม่ส่งต่อข้อมูลการเฝ้าระวัง']],
 OTH:[]};
const RCA_STR=[['strong','Strong (แข็งแรง)','เปลี่ยนระบบ/forcing function: barcode, CPOE hard stop, แยกเก็บยา LASA, ตัดยาออกจากบัญชี, standardize'],['inter','Intermediate (ปานกลาง)','checklist, double check, เพิ่มอัตรากำลัง, ลดสิ่งรบกวน, software alert, ปรับฉลาก (Tall Man)'],['weak','Weak (อ่อน)','อบรม, ตักเตือน, ออกนโยบาย/memo, ทบทวนขั้นตอนเดิม']];
const RCA0=()=>({type:'DE',date:'',ward:'',sev:'',drug:'',what:'',should:'',impact:'',seq:[{t:'',e:''}],why:[{w:'',b:''}],fb:{},root:'',contrib:'',acts:[{a:'',s:'inter',who:'',due:'',kpi:''}],lesson:'',team:'',by:''});
let RCA=RCA0();
function rcaSave(){ try{ localStorage.setItem('ipd_rca',JSON.stringify(RCA)); }catch(e){} }
(function(){ try{ const s=localStorage.getItem('ipd_rca'); if(s) RCA={...RCA0(),...JSON.parse(s)}; }catch(e){} })();

function rcaFields(){ const set=(id,k)=>{ const el=$(id); if(!el) return; el.value=RCA[k]||''; el.oninput=el.onchange=()=>{ RCA[k]=el.value; rcaSave(); if(k==='type') rcaHints(); rcaChart(); }; };
  [['rType','type'],['rDate','date'],['rWard','ward'],['rSev','sev'],['rDrug','drug'],['rWhat','what'],['rShould','should'],['rImpact','impact'],['rRoot','root'],['rContrib','contrib'],['rLesson','lesson'],['rTeam','team'],['rBy','by']].forEach(([i,k])=>set(i,k)); }
function rcaList(host,arr,cols,add){ // ตารางแก้ไขได้
  $(host).innerHTML=`<table class="ctbl"><thead><tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>${arr.map((r,i)=>`<tr data-i="${i}">${cols.map(c=>`<td>${c[2]?`<select data-k="${c[0]}">${c[2].map(o=>`<option value="${o[0]}"${r[c[0]]===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select>`:`<${c[3]?'textarea rows="2"':'input'} data-k="${c[0]}" style="width:100%;min-width:${c[4]||90}px" placeholder="${c[5]||''}">${c[3]?esc(r[c[0]]||'')+'</textarea>':''}`}</td>`).join('')}<td><button type="button" class="btn sm" data-del>ลบ</button></td></tr>`).join('')}</tbody></table><button type="button" class="btn sm" data-add style="margin-top:6px">+ ${add}</button>`;
  const h=$(host); h.querySelectorAll('tr[data-i]').forEach(tr=>{ const r=arr[+tr.dataset.i];
    tr.querySelectorAll('[data-k]').forEach(el=>{ if(el.tagName==='INPUT') el.value=r[el.dataset.k]||''; el.addEventListener('input',()=>{ r[el.dataset.k]=el.value; rcaSave(); rcaChart(); }); el.addEventListener('change',()=>{ r[el.dataset.k]=el.value; rcaSave(); rcaChart(); }); });
    tr.querySelector('[data-del]').onclick=()=>{ arr.splice(+tr.dataset.i,1); if(!arr.length) arr.push(Object.fromEntries(cols.map(c=>[c[0],c[2]?c[2][0][0]:'']))); rcaSave(); rcaRender(); }; });
  h.querySelector('[data-add]').onclick=()=>{ arr.push(Object.fromEntries(cols.map(c=>[c[0],c[2]?(c[0]==='s'?'inter':c[2][0][0]):'']))); rcaSave(); rcaRender(); };
}
function rcaFb(){ $('rFb').innerHTML=FB_CAT.map(([k,n,h])=>`<label class="f"><span><b>${n}</b> <small>${h}</small></span><textarea data-fb="${k}" rows="2" placeholder="1 บรรทัด = 1 สาเหตุ">${esc((RCA.fb[k]||[]).join('\n'))}</textarea></label>`).join('');
  $('rFb').querySelectorAll('[data-fb]').forEach(t=>t.addEventListener('input',()=>{ RCA.fb[t.dataset.fb]=t.value.split('\n').map(x=>x.trim()).filter(Boolean); rcaSave(); rcaChart(); })); }
function rcaHints(){ const hs=RCA_HINT[RCA.type]||[]; $('rHint').innerHTML=hs.length?`<span class="hint">ปัจจัยที่พบบ่อย (คลิกเพิ่มลงก้างปลา):</span> `+hs.map(([c,t],i)=>`<button type="button" class="xchip" data-h="${i}">+ ${esc(t)}</button>`).join(' '):'';
  $('rHint').querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{ const [c,t]=hs[+b.dataset.h]; RCA.fb[c]=[...(RCA.fb[c]||[])]; if(!RCA.fb[c].includes(t)) RCA.fb[c].push(t); rcaSave(); rcaFb(); rcaChart(); }); }
function rcaFishSvg(){ const prob=(RCA.what||'ปัญหา/เหตุการณ์').slice(0,60);
  const W=1180,H=520,sx=30,ex=960,cy=H/2; let g=`<rect width="${W}" height="${H}" fill="#fff"/><line x1="${sx}" y1="${cy}" x2="${ex}" y2="${cy}" stroke="#1e293b" stroke-width="4"/>`;
  g+=`<path d="M${ex},${cy-70} L${W-15},${cy} L${ex},${cy+70} Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>`;
  const wrap=(t,n)=>{const o=[];let s=t;while(s.length&&o.length<4){o.push(s.slice(0,n));s=s.slice(n);}return o;};
  wrap(prob,14).forEach((l,i,a)=>g+=`<text x="${ex+70}" y="${cy-((a.length-1)*8)+i*16+5}" font-size="13" text-anchor="middle" fill="#991b1b" font-weight="700">${esc(l)}</text>`);
  const C=['#2563eb','#0d9488','#7c3aed','#ea580c','#16a34a','#be185d'];
  FB_CAT.forEach(([k,n],i)=>{ const col=i%3, up=i<3, x=sx+250+col*240, y2=up?50:H-50, c=C[i];
    g+=`<line x1="${x+80}" y1="${cy}" x2="${x}" y2="${y2}" stroke="${c}" stroke-width="3"/><rect x="${x-110}" y="${up?y2-34:y2+6}" width="230" height="26" rx="13" fill="${c}"/><text x="${x+5}" y="${up?y2-16:y2+24}" font-size="12.5" text-anchor="middle" fill="#fff" font-weight="700">${esc(n)}</text>`;
    (RCA.fb[k]||[]).slice(0,6).forEach((t,j)=>{ const f=(j+1)/7, px=x+80*f, py=y2+(cy-y2)*f; const tx=px-8;
      g+=`<line x1="${px}" y1="${py}" x2="${px-60}" y2="${py}" stroke="${c}" stroke-width="1.5"/><text x="${tx-56}" y="${py-3}" font-size="11" text-anchor="end" fill="#0f172a">${esc(t.length>32?t.slice(0,31)+'…':t)}</text>`; }); });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fff" role="img" aria-label="ผังก้างปลา">${g}</svg>`; }
function rcaChart(){ if($('rFish')) $('rFish').innerHTML=rcaFishSvg(); }
function rcaRender(){ rcaFields();
  rcaList('rSeq',RCA.seq,[['t','วัน/เวลา',null,false,110,'เช่น 31/10 08:00'],['e','เหตุการณ์',null,true,280,'เกิดอะไรขึ้น ใครทำอะไร']],'เพิ่มลำดับเหตุการณ์');
  rcaList('rWhy',RCA.why,[['w','ทำไม (Why?)',null,true,220,'ทำไมจึงเกิด...'],['b','เพราะ (Because)',null,true,220,'เพราะ...']],'เพิ่ม Why');
  rcaList('rAct',RCA.acts,[['a','มาตรการแก้ไข/ป้องกัน',null,true,220],['s','ระดับความแข็งแรง',RCA_STR.map(x=>[x[0],x[1]])],['who','ผู้รับผิดชอบ',null,false,110],['due','กำหนดเสร็จ',null,false,90],['kpi','ตัวชี้วัด/การติดตาม',null,true,160]],'เพิ่มมาตรการ');
  rcaFb(); rcaHints(); rcaChart();
  const n=RCA.acts.filter(a=>a.a); const st=['strong','inter','weak'].map(k=>n.filter(a=>a.s===k).length);
  $('rStr').innerHTML=n.length?`มาตรการ: Strong ${st[0]} · Intermediate ${st[1]} · Weak ${st[2]}${st[0]+st[1]===0?' — <b style="color:#dc2626">มีแต่มาตรการระดับอ่อน (อบรม/ตักเตือน) ควรเพิ่มมาตรการเชิงระบบ</b>':''}`:'';
}
const RCA_TN=k=>(RCA_TYPES.find(x=>x[0]===k)||['',k])[1], RCA_SN=k=>(RCA_SEV.find(x=>x[0]===k)||['',k||'–'])[1];
function rcaText(){ const L=['■ รายงานการวิเคราะห์สาเหตุราก (RCA) — เหตุการณ์ด้านยา',`ชนิด: ${RCA_TN(RCA.type)} · ความรุนแรง: ${RCA_SN(RCA.sev)}`,`วันที่เกิด: ${RCA.date||'–'} · หน่วยงาน: ${RCA.ward||'–'} · ยาที่เกี่ยวข้อง: ${RCA.drug||'–'}`,'',
  '1. สิ่งที่เกิดขึ้น (What happened)',RCA.what||'–','','2. สิ่งที่ควรจะเป็น (What should have happened)',RCA.should||'–','','3. ผลกระทบต่อผู้ป่วย',RCA.impact||'–','','4. ลำดับเหตุการณ์',...RCA.seq.filter(s=>s.t||s.e).map(s=>`  • ${s.t} — ${s.e}`),'',
  '5. วิเคราะห์ 5 Whys',...RCA.why.filter(w=>w.w||w.b).map((w,i)=>`  Why ${i+1}: ${w.w}\n      เพราะ: ${w.b}`),'','6. ผังก้างปลา (ปัจจัยที่เกี่ยวข้อง)',...FB_CAT.filter(([k])=>(RCA.fb[k]||[]).length).map(([k,n])=>`  ${n}: ${(RCA.fb[k]||[]).join(' · ')}`),'',
  '7. สาเหตุราก (Root cause)',RCA.root||'–','','   ปัจจัยร่วม (Contributing factors)',RCA.contrib||'–','','8. มาตรการแก้ไข/ป้องกัน',...RCA.acts.filter(a=>a.a).map((a,i)=>`  ${i+1}) ${a.a} [${(RCA_STR.find(x=>x[0]===a.s)||['',''])[1]}] · ผู้รับผิดชอบ ${a.who||'–'} · กำหนด ${a.due||'–'} · ติดตาม: ${a.kpi||'–'}`),'',
  '9. บทเรียนที่ได้รับ (Lessons learned)',RCA.lesson||'–','',`ทีม RCA: ${RCA.team||'–'}`,`ผู้จัดทำ: ${RCA.by||'–'}`]; return L.join('\n'); }
function rcaPrint(){ const row=(h,v)=>`<tr><th style="width:24%">${h}</th><td><pre>${esc(v||'–')}</pre></td></tr>`;
  const html=`<div class="mk"><div class="mkt">แบบรายงานการวิเคราะห์สาเหตุราก (Root Cause Analysis: RCA)<br><small>เหตุการณ์ความคลาดเคลื่อนทางยา / อุบัติการณ์ด้านยา — กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม</small></div>
  <table class="pt4 grid sm">${row('ชนิดเหตุการณ์',RCA_TN(RCA.type))}${row('ระดับความรุนแรง (NCC MERP)',RCA_SN(RCA.sev))}${row('วันที่เกิด / หน่วยงาน',`${RCA.date||'–'} · ${RCA.ward||'–'}`)}${row('ยาที่เกี่ยวข้อง',RCA.drug)}
  ${row('1. สิ่งที่เกิดขึ้น (What happened)',RCA.what)}${row('2. สิ่งที่ควรจะเป็น',RCA.should)}${row('3. ผลกระทบต่อผู้ป่วย',RCA.impact)}</table>
  <div class="mkh">4. ลำดับเหตุการณ์</div><table class="pt4 grid sm"><tr><th style="width:18%">วัน/เวลา</th><th>เหตุการณ์</th></tr>${RCA.seq.filter(s=>s.t||s.e).map(s=>`<tr><td>${esc(s.t)}</td><td>${esc(s.e)}</td></tr>`).join('')||'<tr><td colspan="2">–</td></tr>'}</table>
  <div class="mkh">5. วิเคราะห์ 5 Whys</div><table class="pt4 grid sm"><tr><th style="width:8%">ลำดับ</th><th>ทำไม (Why?)</th><th>เพราะ (Because)</th></tr>${RCA.why.filter(w=>w.w||w.b).map((w,i)=>`<tr><td>Why ${i+1}</td><td>${esc(w.w)}</td><td>${esc(w.b)}</td></tr>`).join('')||'<tr><td colspan="3">–</td></tr>'}</table>
  <div class="mkh">6. ผังก้างปลา (Fishbone diagram)</div><div class="psvg">${rcaFishSvg()}</div>
  <table class="pt4 grid sm">${row('7. สาเหตุราก (Root cause)',RCA.root)}${row('ปัจจัยร่วม',RCA.contrib)}</table>
  <div class="mkh">8. มาตรการแก้ไขและป้องกัน (Action plan)</div><table class="pt4 grid sm"><tr><th>มาตรการ</th><th>ระดับ</th><th>ผู้รับผิดชอบ</th><th>กำหนดเสร็จ</th><th>ตัวชี้วัด/การติดตาม</th></tr>${RCA.acts.filter(a=>a.a).map(a=>`<tr><td>${esc(a.a)}</td><td>${(RCA_STR.find(x=>x[0]===a.s)||['',''])[1]}</td><td>${esc(a.who)}</td><td>${esc(a.due)}</td><td>${esc(a.kpi)}</td></tr>`).join('')||'<tr><td colspan="5">–</td></tr>'}</table>
  <table class="pt4 grid sm">${row('9. บทเรียนที่ได้รับ',RCA.lesson)}${row('ทีม RCA',RCA.team)}</table>
  <div class="psign">ผู้จัดทำ ${esc(RCA.by||'......................................')} · วันที่ ............................ · หัวหน้างาน ......................................</div></div>`;
  printHtml(html); }
(function(){ if(!$('rFish')) return;
  $('rType').innerHTML=RCA_TYPES.map(([k,n])=>`<option value="${k}">${n}</option>`).join(''); $('rSev').innerHTML='<option value="">— เลือก —</option>'+RCA_SEV.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('rStrRef').innerHTML=RCA_STR.map(([,n,d])=>`<li><b>${n}</b> — ${d}</li>`).join('');
  rcaRender();
  $('rPrint').onclick=rcaPrint; $('rCopy').onclick=()=>{ const t=rcaText(); copyRich(txtHtml(t),t,$('rMsg')); };
  $('rCpImg').onclick=()=>copyImg([...$('rFish').querySelectorAll('svg')],$('rMsg'));
  $('rSaveF').onclick=()=>{ const b=new Blob([JSON.stringify({v:1,rca:RCA},null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`RCA-${RCA.type}-${(RCA.date||'').replace(/\//g,'')||'draft'}.json`; a.click(); };
  $('rOpen').onclick=()=>$('rFile').click(); $('rFile').addEventListener('change',ev=>{ const f=ev.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); if(!o.rca) throw 0; RCA={...RCA0(),...o.rca}; rcaSave(); rcaRender(); }catch(e){ cpMsg($('rMsg'),'ไฟล์ไม่ถูกต้อง'); } }); ev.target.value=''; });
  $('rNew').onclick=()=>{ if(!confirm('เริ่ม RCA ใหม่ (ล้างข้อมูลที่กรอก)?')) return; RCA=RCA0(); rcaSave(); rcaRender(); };
})();
