/* ===== tbsum.js — สรุปยาวัณโรคเป็นระบบ (แท็บยา TB)
 ① ผู้ป่วย ② สูตรยา/ระยะ ③ ขนาดยารายตัว ④ Lab baseline/ติดตาม ⑤ อันตรกิริยากับยาอื่นในใบสั่ง (หน้าแรก) ⑥ คำแนะนำ → ข้อความ note
 ที่มา: แนวทางการควบคุมวัณโรคประเทศไทย 2564 · ตาราง TB รพ.มค · Lexicomp/Micromedex (DDI) */
const TBS_ID={inh:/isoniazid|\binh\b/i,rifam:/rifamp|\brif\b/i,pza:/pyrazin|\bpza\b/i,emb:/ethamb|\bemb\b/i,lfx:/levoflox/i,mfx:/moxiflox/i,amk:/amikacin/i,sm:/streptomycin/i,bdq:/bedaquil/i,lzd:/linezol/i,cfz:/clofazim/i,b6:/pyridox|vit(?:amin)?\s*b\s*6|\bb6\b/i};
const TBS_AB={inh:'H',rifam:'R',pza:'Z',emb:'E',lfx:'Lfx',mfx:'Mfx',amk:'Am',sm:'S',bdq:'Bdq',lzd:'Lzd',cfz:'Cfz'};
// อันตรกิริยากับ rifampicin (enzyme inducer) / isoniazid
const TBS_DDI=[
 [/warfarin|orfarin/i,'R','ลดฤทธิ์ warfarin มาก (INR ลด) — มักต้องเพิ่มขนาด 2–3 เท่า · ตรวจ INR ทุก 3–7 วันช่วงเริ่ม/หยุด R','flag'],
 [/rivaroxab|apixab|dabigat|edoxab|xarelto|eliquis|pradaxa/i,'R','ลดระดับ DOAC ชัดเจน — หลีกเลี่ยงร่วมกัน (เปลี่ยนเป็น warfarin/LMWH)','flag'],
 [/lopinav|kaletra|aluvia|atazan|darunav|ritonav/i,'R','ห้ามใช้ร่วม PI — เปลี่ยน R เป็น rifabutin หรือปรับสูตร ARV','flag'],
 [/dolutegr|\bdtg\b|tld\b|acriptega/i,'R','DTG ต้องเพิ่มเป็น 50 mg วันละ 2 ครั้ง ระหว่างใช้ R และต่อ 2 สัปดาห์หลังหยุด R','warn'],
 [/nevirap/i,'R','ไม่แนะนำร่วมกัน (NVP ระดับลด + ตับอักเสบ) — ใช้ EFV แทน','flag'],
 [/tenofovir\s*alafen|\btaf\b|kocitaf/i,'R','TAF ไม่แนะนำร่วม R — ใช้ TDF','warn'],
 [/voricon/i,'R','ห้ามใช้ร่วม (voriconazole ระดับลด >90%)','flag'],
 [/itracon|ketocon|posacon/i,'R','azole ระดับลดมาก — หลีกเลี่ยง/ติดตามผลการรักษา','warn'],
 [/fluconaz/i,'R','fluconazole ระดับลด ~25% — อาจต้องเพิ่มขนาด','info'],
 [/simvast|atorvast|lovast/i,'R','ลดระดับ statin — อาจคุมไขมันไม่ได้ (rosuvastatin/pravastatin ได้รับผลน้อยกว่า)','info'],
 [/amlodip|nifedip|felodip|diltiaz|verapam/i,'R','ลดระดับ CCB — ติดตามความดันโลหิต อาจต้องเพิ่มขนาด','info'],
 [/prednis|dexameth|methylpred|hydrocort/i,'R','ลดฤทธิ์ steroid — มักต้องเพิ่มขนาด ~2 เท่า','warn'],
 [/tacrol|cyclospor|sirolim|everolim/i,'R','ลดระดับยากดภูมิมาก — หลีกเลี่ยง/ตรวจระดับยาใกล้ชิด','flag'],
 [/methadon/i,'R','ลดระดับ methadone — เฝ้าระวังอาการถอนยา อาจต้องเพิ่มขนาด','warn'],
 [/levonorg|ethinyl|desogest|drospir|cyproter|ยาคุม|medroxyprog|etonogest/i,'R','ยาคุมกำเนิดฮอร์โมนไม่ได้ผล — ใช้ถุงยาง/IUD หรือ DMPA','warn'],
 [/levothyrox|euthyrox/i,'R','อาจต้องเพิ่มขนาด levothyroxine — ตรวจ TSH','info'],
 [/glipizid|glibencl|gliclaz|glimepir|pioglit|repaglin/i,'R','ลดระดับยาเบาหวานกลุ่ม SU/TZD — ติดตามน้ำตาล','info'],
 [/digox/i,'R','ลดระดับ digoxin — ติดตามอาการ/ระดับยา','info'],
 [/clarithro/i,'R','ลดระดับ clarithromycin และเพิ่มระดับ rifampicin — พิจารณา azithromycin','warn'],
 [/carbamaz|phenyto|valpro/i,'H','INH เพิ่มระดับ phenytoin/carbamazepine (พิษ) · R ลดระดับยากันชัก — ติดตามระดับยา/อาการ','warn'],
 [/paracet|acetamin|tylenol/i,'H','ใช้ paracetamol ได้ แต่ไม่เกิน 2–3 g/วัน และไม่ใช้ต่อเนื่องนาน ระหว่างยาวัณโรค (เสริมพิษต่อตับ)','info'],
 [/antacid|alum|magnes.*hydrox|sucralf|calcium carb/i,'H','ยาลดกรด/sucralfate ลดการดูดซึม INH/FQ — ให้ห่างกัน ≥2 ชม.','info'],
 [/allopur/i,'Z','PZA เพิ่ม uric acid — allopurinol ไม่ช่วยลด uric acid จาก PZA (pyrazinoic acid) · ติดตามอาการปวดข้อ','info'],
 [/ciproflox|levoflox|moxiflox|ondansetron|domperid|haloper|amiodaron|azithro|quetiap/i,'Bdq/FQ','ระวัง QT ยาวเมื่อใช้ร่วม FQ/Bdq/Cfz — ตรวจ ECG','info'],
];
function tbsRows(){ return joinLines(($('xPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean); }
function tbsIdOf(r){ const t=r.raw+' '+((masterOf(r)||[])[1]||''); return Object.keys(TBS_ID).find(k=>TBS_ID[k].test(t)); }
function tbsRender(){ const out=$('tbsOut'); if(!out) return; const pt=getPt(), L=pt.lab||{}, R=tbsRows(), have={}; R.forEach(r=>{ const id=tbsIdOf(r); if(id) have[id]=r; });
  const tb=Object.keys(have).filter(k=>k!=='b6'); if(!tb.length){ out.innerHTML='<div class="empty">วางคำสั่งยาวัณโรค (หรือกด ⤓ ดึงใบสั่งจากหน้าแรก) แล้วกด "ตรวจ" — จะสรุปสูตรยา ขนาด Lab อันตรกิริยา และข้อความ note ให้</div>'; $('tbsNote').value=''; return; }
  const ab=tb.map(k=>TBS_AB[k]).join(''), fl=['inh','rifam','pza','emb'], first=fl.every(k=>have[k]), cont=have.inh&&have.rifam&&!have.pza&&!have.emb, hre=have.inh&&have.rifam&&have.emb&&!have.pza, sl=tb.some(k=>!fl.includes(k));
  const reg=first?'HRZE — ระยะเข้มข้น (2HRZE) ของสูตรมาตรฐาน 2HRZE/4HR':cont?'HR — ระยะต่อเนื่อง (4HR)':hre?'HRE ไม่มี Z — สูตร 2HRE/7HR (รวม 9 เดือน) เช่น แพ้/ตับอักเสบจาก Z · หรือระยะต่อเนื่องที่ยังให้ E':sl?`มียาแนวที่สอง (${tb.filter(k=>!fl.includes(k)).map(k=>TBS_AB[k]).join(', ')}) — สูตร DR-TB/ทดแทน ยืนยันกับคลินิก TB`:`${ab} — สูตรไม่ครบมาตรฐาน ยืนยันเหตุผล (แพ้ยา/ตับ/ไต)`;
  const P=[], A=(l,t)=>P.push([l,t]);
  // ③ ขนาดยารายตัว
  const D=tb.map(k=>{ const r=have[k], e=evaluate(r,pt,R); const top=e.items.find(i=>/^TB:/.test(i.txt))||e.items.find(i=>i.lvl!=='info'); return [k,r,e,top]; });
  // ④ Lab
  const uln=41, rt=v=>v!=null?`${v} (${fmtN(Math.round(v/uln*10)/10)}×ULN)`:'–';
  const labs=[['ALT',L.alt!=null?rt(L.alt):'–',L.alt!=null&&L.alt>3*uln?'flag':L.alt!=null&&L.alt>uln?'warn':L.alt==null?'warn':'ok'],['AST',L.ast!=null?rt(L.ast):'–',L.ast!=null&&L.ast>3*uln?'flag':L.ast!=null&&L.ast>uln?'warn':L.ast==null?'warn':'ok'],
   ['T.bilirubin',L.tbil!=null?L.tbil+' mg/dL':'–',L.tbil!=null&&L.tbil>2?'warn':L.tbil==null?'info':'ok'],['CrCl',pt.dial||(pt.crcl!=null?r1(pt.crcl)+' ml/min':'–'),pt.dial||(pt.crcl!=null&&pt.crcl<30)?'warn':pt.crcl==null?'warn':'ok'],
   ['Uric acid (Z)',L.uric!=null?L.uric+' mg/dL':'–',have.pza&&L.uric!=null&&L.uric>9?'warn':'info'],['Plt',L.plt!=null?fmtN(L.plt):'–',L.plt!=null&&L.plt<100000?'warn':'info']];
  if(pt.dial||(pt.crcl!=null&&pt.crcl<30)) A('warn',`ไต${pt.dial?' ('+pt.dial+')':` CrCl ${r1(pt.crcl)}`}: E และ Z ให้ 3 ครั้ง/สัปดาห์ (หลังฟอกไตในวันฟอก) · H, R ขนาดเดิม`);
  if((L.alt!=null&&L.alt>3*uln)||(L.ast!=null&&L.ast>3*uln)) A('flag','ค่าตับ >3×ULN — ถ้ามีอาการ (หรือ >5×ULN ไม่มีอาการ) หยุด H R Z · ให้ยาที่ไม่พิษต่อตับ (E + Lfx ± Am) จนค่าตับ <2×ULN แล้วค่อยๆ เริ่มทีละตัว');
  else if((L.alt!=null&&L.alt>uln)||(L.ast!=null&&L.ast>uln)) A('warn','ค่าตับสูงเล็กน้อย — ติดตาม LFT ทุก 1–2 สัปดาห์ในช่วง 2 เดือนแรก');
  if(L.alt==null||L.ast==null) A('warn','ยังไม่มี ALT/AST baseline — ส่งตรวจก่อน/ช่วงเริ่มยา');
  if(have.emb) A('info','E: ตรวจสายตา/ตาบอดสีแดง-เขียว ก่อนเริ่มและทุกเดือน (เด็กเล็กบอกอาการไม่ได้ — ระวัง)');
  if(have.inh&&!have.b6&&!(rows||[]).some(r=>TBS_ID.b6.test(r.raw))) A('info','INH: ยังไม่พบ pyridoxine (B6) — ให้ 10–50 mg/วัน ในกลุ่มเสี่ยง (เบาหวาน สุรา HIV ไตวาย ขาดอาหาร ตั้งครรภ์/ให้นมบุตร)');
  if(pt.preg) A('warn','ตั้งครรภ์: HRZE ใช้ได้ · หลีกเลี่ยง streptomycin/aminoglycoside · ให้ B6 ทุกราย');
  const arv=(rows||[]).some(r=>PF_ARV&&PF_ARV.test(r.raw+' '+((masterOf(r)||[])[1]||'')));
  A(arv?'info':'info',arv?'ผู้ป่วยได้ ARV — ตรวจอันตรกิริยา R กับ ARV ด้านล่าง/แท็บ ARV · เริ่ม ART ภายใน 2 สัปดาห์ (CD4 <50) หรือ 8 สัปดาห์':'ตรวจ Anti-HIV ในผู้ป่วยวัณโรคทุกราย (ถ้ายังไม่มีผล)');
  // ⑤ DDI กับยาอื่นในใบสั่งหน้าแรก
  const others=(rows||[]).filter(r=>!tbsIdOf(r)), dd=[];
  others.forEach(r=>{ const t=r.raw+' '+((masterOf(r)||[])[1]||''); TBS_DDI.forEach(([re,by,msg,l])=>{ if(re.test(t)&&(by.includes('R')&&have.rifam||by==='H'&&have.inh||by==='Z'&&have.pza||by==='Bdq/FQ'&&(have.bdq||have.lfx||have.mfx||have.cfz))&&!dd.some(x=>x[0]===r&&x[2]===msg)) dd.push([r,by,msg,l]); }); });
  const nm=r=>{ const m=masterOf(r); return (m&&m[1]||r.raw).replace(/\s+\d.*$/,'').slice(0,40); };
  const tag=l=>`<span class="tag ${l}">${LVL_TXT[l]}</span>`;
  out.innerHTML=`<h2>สรุปยาวัณโรค</h2>
   <dl class="rxdl">
    <dt>① ผู้ป่วย</dt><dd>${esc(pfPatientLine?pfPatientLine().replace(/<[^>]+>/g,''):'')}</dd>
    <dt>② สูตรยา</dt><dd><b>${esc(reg)}</b>${!first&&!cont?` · ยาที่ไม่มีในใบสั่ง: ${fl.filter(k=>!have[k]).map(k=>TBS_AB[k]).join(', ')||'–'}`:''}</dd>
    <dt>③ ขนาดยา</dt><dd><ul class="msgs">${D.map(([k,r,e,t])=>`<li>${tag(e.status==='flag'?'flag':e.status==='warn'?'warn':e.status==='ok'?'ok':'info')}<span><b>${TBS_AB[k]}</b> ${esc(r.raw.replace(/\s+/g,' ').trim().slice(0,70))} — ${esc(t?t.txt.replace(/^TB:\s*/,''):'—')}</span></li>`).join('')}</ul></dd>
    <dt>④ Lab</dt><dd><div style="display:flex;flex-wrap:wrap;gap:6px">${labs.map(([n,v,l])=>`<span class="pill ${l==='flag'?'flag':l==='warn'?'warn':l==='ok'?'ok':'none'}" style="font-weight:600">${n} ${esc(String(v))}</span>`).join('')}</div>
      <ul class="msgs" style="margin-top:6px">${P.map(([l,t])=>`<li>${tag(l)}<span>${esc(t)}</span></li>`).join('')}</ul></dd>
    <dt>⑤ อันตรกิริยา</dt><dd>${dd.length?`<ul class="msgs">${dd.map(([r,by,msg,l])=>`<li>${tag(l)}<span><b>${esc(nm(r))}</b> + ${by}: ${esc(msg)}</span></li>`).join('')}</ul>`:`<span class="hint">${others.length?`ตรวจยาอื่น ${others.length} รายการในใบสั่งหน้าแรก — ไม่พบอันตรกิริยาสำคัญกับยาวัณโรค`:'ไม่มียาอื่นในใบสั่งหน้าแรก (วางใบสั่งทั้งหมดที่แท็บตรวจใบสั่งยาเพื่อตรวจอันตรกิริยา)'}</span>`}</dd>
    <dt>⑥ คำแนะนำ</dt><dd>กินยาวันละครั้งพร้อมกันทุกเม็ด ตอนท้องว่าง (ก่อนนอน/ก่อนอาหารเช้า 1 ชม.) ทุกวันไม่ขาด (DOT) · ปัสสาวะ/น้ำตาสีส้มจาก R (ปกติ) · อาการตับอักเสบ (เบื่ออาหาร คลื่นไส้ ตัวเหลือง) ผื่น ตามัว ชาปลายมือเท้า → กลับมาพบแพทย์ · งดสุรา</dd>
   </dl>`;
  const nl=[`สรุปยาวัณโรค: ${reg}`,
   ...D.map(([k,r,e,t])=>`  ${TBS_AB[k]}: ${r.raw.replace(/\s+/g,' ').trim()} → ${e.status==='ok'?'OK':e.status==='flag'?'ต้อง consult':'ทบทวน'}${t?' — '+t.txt.replace(/^TB:\s*/,''):''}`),
   `Lab: ${labs.map(([n,v])=>`${n} ${v}`).join(' · ')}`,
   ...P.filter(([l])=>l!=='info').map(([,t])=>'  ⚠ '+t),
   ...(dd.length?['DDI:',...dd.map(([r,by,msg])=>`  ${nm(r)} + ${by}: ${msg}`)]:[]),
   'Monitor: LFT (ทุก 2 สัปดาห์ช่วง 2 เดือนแรก/เมื่อมีอาการ) · สายตา (E) · uric acid/ปวดข้อ (Z) · ผื่น · adherence'];
  $('tbsNote').value=nl.join('\n'); }
// ---- ล้างแผน rechallenge เมื่อเปลี่ยนผู้ป่วย/วางใบสั่งใหม่
function tbrReset(){ if(!$('tbrBox')) return; TBR_SIGNS.forEach(([k])=>{ const el=$('tbr_'+k); if(el) el.checked=false; }); ['tbrStart','tbrNote'].forEach(id=>$(id).value=''); $('tbrUln').value=41;
  Object.keys(TBR_DRUG).forEach(id=>{ $('tbrD_'+id).value=''; $('tbrU_'+id).checked=true; }); $('tbrOrd').value='hrez'; $('tbrDays').value='3'; const d=$('tbrDet'); if(d) d.open=false; if(typeof tbrEval==='function') tbrEval(); }
(function(){ const box=$('tbsBox'); if(!box) return;
  box.innerHTML=`<div id="tbsOut"></div><label class="f" style="margin-top:8px">ข้อความสรุปสำหรับ Pharmacist note (แก้ไขได้)<textarea id="tbsNote" rows="8" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:var(--ink)"></textarea></label>
   <div style="display:flex;gap:6px;margin-top:6px"><button type="button" class="btn sm pri" id="tbsCp">คัดลอกสรุป</button><span class="toast" id="tbsMsg"></span></div>`;
  $('tbsCp').onclick=()=>copyRich(txtHtml($('tbsNote').value),$('tbsNote').value,$('tbsMsg'));
  let lastX=''; const upd=()=>{ if($('p-tbx').hidden) return; const x=$('xPaste').value; if(x!==lastX){ if(lastX&&x.trim()) tbrReset(); lastX=x; } tbsRender(); if(typeof tbrEval==='function') tbrEval(); };
  $('xRun').addEventListener('click',()=>setTimeout(upd,30)); $('t-tbx').addEventListener('click',()=>setTimeout(upd,80));
  ['input','change'].forEach(ev=>document.addEventListener(ev,e=>{ const t=e.target; if(!t||!t.closest||t.closest('#tbsBox')||t.closest('#tbrBox')) return; clearTimeout(window.__tbsT); window.__tbsT=setTimeout(upd,250); }));
  document.addEventListener('click',e=>{ const b=e.target&&e.target.closest&&e.target.closest('#labParse,#ptParse,#clearAll,[data-pf="read"],[data-pf="reset"],[data-pf="newpt"],[data-pf="pull"]'); if(b){ if(/clearAll|newpt|reset/.test(b.id+(b.dataset.pf||''))) { tbrReset(); lastX=''; } setTimeout(upd,120); } }); })();
