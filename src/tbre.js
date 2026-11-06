/* ===== tbre.js — ผื่นแพ้ยาวัณโรค: คัดกรอง SCAR (RegiSCAR DRESS score · SJS/TEN · AGEP) → แผน rechallenge ทีละตัวด้วยเม็ดยาในบัญชี รพ.
 อ้างอิง: แนวทางการควบคุมวัณโรคประเทศไทย 2564 · WHO Treatment of TB guidelines (drug reactions) · ATS/CDC/IDSA 2016 · Kardaun RegiSCAR 2007/2013 · DIC มหิดล
 ⚠ ช่วยวางแผน — แผนจริงต้องตกลงกับแพทย์ */
const TBR_DRUG={inh:['H','Isoniazid',100],rifam:['R','Rifampicin',300],emb:['E','Ethambutol',400],pza:['Z','Pyrazinamide',500]};
const TBR_ORDER={hrez:['inh','rifam','emb','pza'],rhez:['rifam','inh','emb','pza'],hre:['inh','rifam','emb']};
const TBR_ALT={pza:'2HRE/7HR (รวม 9 เดือน)',emb:'2HRZ/4HR (6 เดือน)',inh:'6REZ + levofloxacin (6 เดือน)',rifam:'ไม่มี R: 12–18 เดือน (H E Z + levofloxacin ± injectable ช่วงแรก) — ปรึกษาแพทย์ TB/คลินิก TB'};
const TBR_SIGNS=[
 ['fev','ไข้ ≥38.5 °C'],['muc','แผล/อักเสบที่เยื่อบุ (ปาก ตา อวัยวะเพศ)'],['bli','ตุ่มน้ำ/ผิวหนังหลุดลอก (Nikolsky +)'],['tgt','target / atypical target lesion'],
 ['pus','ตุ่มหนองเล็กจำนวนมาก (ไม่ใช่รูขุมขน)'],['pain','ผิวหนังเจ็บ/แสบร้อน'],['face','หน้าบวม'],['lymph','ต่อมน้ำเหลืองโต ≥2 ตำแหน่ง (>1 cm)'],
 ['bsa','ผื่น >50% ของพื้นที่ผิว'],['feat','ผื่นมีลักษณะเข้าได้กับ DRESS ≥2 ข้อ (บวม แข็ง purpura ลอกเป็นขุย)'],['atyp','atypical lymphocyte'],
 ['kid','ไตผิดปกติ (Cr ↑ >1.5 เท่าของเดิม)'],['lung','ปอด/หัวใจ/อวัยวะอื่นผิดปกติ'],['res15','ผื่นหายช้า ≥15 วัน'],['excl','ตรวจแยกสาเหตุอื่นแล้ว ≥3 อย่าง (ไวรัส/เพาะเชื้อ/ANA)'],
 ['resolved','ผื่นยุบ/หายแล้ว (เหลือรอยดำได้)']];
function tbrEval(){ const pt=getPt(), L=pt.lab||{}, c=id=>!!($('tbr_'+id)&&$('tbr_'+id).checked), out=[];
  const uln=+$('tbrUln').value||41, alt=L.alt!=null?+L.alt:null, ast=L.ast!=null?+L.ast:null, tb=L.tbil!=null?+L.tbil:null;
  const eosP=L.eos!=null?+L.eos:null, wbc=L.wbc!=null?+L.wbc:null, eosA=eosP!=null&&wbc!=null?(wbc<200?wbc*1000:wbc)*eosP/100:null;
  const liver=(alt!=null&&alt>2*uln)||(ast!=null&&ast>2*uln);
  // RegiSCAR (DRESS)
  let s=0; const sc=[]; const P=(v,t)=>{ s+=v; sc.push(`${t} ${v>0?'+':''}${v}`); };
  P(c('fev')?0:-1,'ไข้'); if(c('lymph')) P(1,'ต่อมน้ำเหลือง');
  if(eosA!=null||eosP!=null){ const a=eosA||0, p=eosP||0; if(a>=1500||p>=20) P(2,'eosinophil'); else if(a>=700||p>=10) P(1,'eosinophil'); }
  if(c('atyp')) P(1,'atypical lymph'); if(c('bsa')) P(1,'ผื่น >50%'); P(c('feat')?1:-1,'ลักษณะผื่น');
  const org=(liver?1:0)+(c('kid')?1:0)+(c('lung')?1:0); if(org) P(Math.min(org,2),`อวัยวะ ${org}`); P(c('res15')?0:-1,'หาย ≥15 วัน'); if(c('excl')) P(1,'แยกสาเหตุอื่น');
  const dress=s<2?['ไม่ใช่ DRESS','ok']:s<=3?['possible DRESS','warn']:s<=5?['probable DRESS','flag']:['definite DRESS','flag'];
  const sjs=c('bli')||c('tgt')&&c('muc')||(c('muc')&&c('pain')), agep=c('pus');
  let verdict, lvl;
  if(sjs){ verdict='สงสัย SJS/TEN — ห้าม rechallenge ยาที่ใช้อยู่ช่วงเกิดผื่น · ส่งแพทย์ผิวหนัง · ใช้สูตรยาทดแทนที่ไม่มียาที่สงสัย'; lvl='flag'; }
  else if(agep){ verdict='สงสัย AGEP — ไม่ rechallenge ยาที่สงสัย · ปรึกษาแพทย์ผิวหนัง'; lvl='flag'; }
  else if(dress[1]==='flag'){ verdict=`RegiSCAR ${s} = ${dress[0]} — ไม่ rechallenge (หรือทำเฉพาะเมื่อผู้เชี่ยวชาญตัดสินใจ) · ใช้สูตรยาทดแทน`; lvl='flag'; }
  else if(c('fev')&&c('face')||c('fev')&&(c('lymph')||(eosA>=700||eosP>=10)||liver)){ verdict=`สัญญาณเตือน DRESS ระยะแรก (ไข้ร่วมกับ${[c('face')&&'หน้าบวม',c('lymph')&&'ต่อมน้ำเหลืองโต',(eosA>=700||eosP>=10)&&'eosinophil สูง',liver&&'ตับอักเสบ'].filter(Boolean).join(', ')}) · RegiSCAR ${s} — ยังไม่ rechallenge จนกว่าจะแยก DRESS ได้ (CBC diff, atypical lymph, LFT, Cr ซ้ำ)`; lvl='flag'; }
  else if(c('muc')){ verdict=`มีเยื่อบุอักเสบ 1 ตำแหน่ง (ยังไม่มีตุ่มน้ำ/target) — ตรวจตาและปากซ้ำ ถ้าแผลลุกลามสงสัย SJS ระยะแรก · rechallenge เมื่อแพทย์ยืนยันว่าไม่ใช่ SCAR`; lvl='warn'; }
  else if(dress[1]==='warn'){ verdict=`RegiSCAR ${s} = possible DRESS — rechallenge ได้เฉพาะเมื่อแพทย์พิจารณาแล้ว ติดตามใกล้ชิด (CBC eos, LFT, Cr) ใช้ขนาดเริ่มต่ำ`; lvl='warn'; }
  else { verdict=`ผื่นไม่รุนแรง (MP/exanthem ไม่มีสัญญาณ SCAR · RegiSCAR ${s}) — rechallenge ทีละตัวได้${c('resolved')?'':' เมื่อผื่นยุบ'}`; lvl='ok'; }
  const pre=[];
  if(!c('resolved')) pre.push(['warn','ผื่นยังไม่ยุบ — รอให้ผื่นยุบก่อนเริ่ม rechallenge (รอยดำหลงเหลือได้)']);
  if(alt!=null||ast!=null){ const m=Math.max(alt||0,ast||0); pre.push([m>=2*uln?'warn':'ok',`ALT ${alt??'–'} / AST ${ast??'–'} U/L (ULN ${uln}) = ${fmtN(Math.round(m/uln*100)/100)} เท่า${m>=2*uln?' — ควรรอให้ <2 เท่า ULN ก่อนเริ่ม (ATS) หรือเริ่มจากยาที่ไม่พิษต่อตับ (E) ก่อน':' (<2 เท่า ULN เริ่มได้)'}${m>uln?' · มีตับอักเสบเล็กน้อยร่วม: ติดตาม LFT ทุก 3–7 วันระหว่าง rechallenge':''}`]); }
  else pre.push(['info','ไม่มี ALT/AST — ตรวจก่อนเริ่ม (ยาวัณโรคทำให้ตับอักเสบได้ และตับผิดปกติเป็นเกณฑ์ DRESS)']);
  if(eosP==null) pre.push(['info','ไม่มี eosinophil — ส่ง CBC + diff (เกณฑ์ DRESS)']); else pre.push([eosA>=700||eosP>=10?'warn':'ok',`Eosinophil ${eosP}%${eosA!=null?` (~${fmtN(Math.round(eosA))}/µL)`:''}`]);
  if(tb!=null&&tb>2) pre.push(['warn',`Total bilirubin ${tb} mg/dL สูง — ระวังตับ`]);
  $('tbrScar').innerHTML=`<div class="band ${lvl==='flag'?'r':lvl==='warn'?'w':''}" style="margin:6px 0;${lvl==='ok'?'background:#f0fdf4;border-color:#16a34a;color:#14532d':''}"><b>${esc(verdict)}</b></div>
   <ul class="msgs">${pre.map(([l,t])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(t)}</span></li>`).join('')}</ul>
   <p class="hint" style="margin:4px 0 0">RegiSCAR: ${esc(sc.join(' · '))} = <b>${s}</b> (&lt;2 ไม่ใช่ · 2–3 possible · 4–5 probable · ≥6 definite) — ยังไม่รวมผล skin biopsy</p>`;
  window.tbrState={lvl,s,dress:dress[0],sjs,agep,alt,ast,uln,eosP,eosA};
  tbrPlan(); }
function tbrFull(id){ const L=window.tbLast&&window.tbLast.rec&&window.tbLast.rec.find(r=>r.id===id); const v=+($('tbrD_'+id)&&$('tbrD_'+id).value); return v>0?v:L?L.mg:null; }
function tbrSteps(id,full,n){ if(!(full>0)) return []; const fr=n===2?[0.5,1]:[1/3,2/3,1]; return fr.map((f,i)=>{ if(i===fr.length-1) return {mg:full,b:tbTabs(id,full)}; const b=tbTabs(id,Math.max(full*f,TBR_DRUG[id][2]*(TB_HALF[id]?0.5:1))); return {mg:b?b.t:full*f,b}; }); }
function tbrTabTxt(id,b){ if(!b) return ''; return b.c.filter(([,k])=>k).map(([s,k])=>`${s} mg × ${fmtN(k)}`).join(' + '); }
function tbrPlan(){ const out=$('tbrOut'); if(!out) return; const st=window.tbrState||{}, ord=TBR_ORDER[$('tbrOrd').value]||TBR_ORDER.hrez, n=+$('tbrDays').value||3, d0=tlDate($('tbrStart').value,'0:00');
  const use=ord.filter(id=>$('tbrU_'+id)&&$('tbrU_'+id).checked), miss=use.filter(id=>!(tbrFull(id)>0));
  if(st.lvl==='flag'){ out.innerHTML=`<div class="band r" style="margin:0"><b>ไม่สร้างแผน rechallenge</b> — ผลคัดกรองเข้าได้กับ SCAR · ใช้สูตรยาทดแทนที่ไม่มียาที่สงสัย และปรึกษาแพทย์ TB/ผิวหนัง</div>`; $('tbrNote').value=''; return; }
  if(!use.length){ out.innerHTML='<div class="empty">เลือกยาที่จะ rechallenge</div>'; return; }
  if(miss.length){ out.innerHTML=`<div class="empty">ใส่ขนาดเต็มของ ${miss.map(id=>TBR_DRUG[id][1]).join(', ')} (mg) — หรือกด "ตรวจ" ด้านบนให้คำนวณจากน้ำหนัก</div>`; return; }
  const days=[], have={}; let day=0;
  use.forEach(id=>{ const S=tbrSteps(id,tbrFull(id),n); S.forEach((x,k)=>{ day++; have[id]=x; const row={day,add:id,step:k,doses:{}}; Object.keys(have).forEach(j=>row.doses[j]=have[j]); days.push(JSON.parse(JSON.stringify(row))); }); have[id]=S[S.length-1]; });
  const dt=i=>d0?tlFmt(new Date(d0.getTime()+(i-1)*864e5),false):'';
  const H=`<div style="overflow-x:auto"><table class="ctbl" style="font-size:13px"><thead><tr><th>วันที่</th>${d0?'<th>วัน</th>':''}${use.map(id=>`<th>${TBR_DRUG[id][0]} ${TBR_DRUG[id][1]}</th>`).join('')}<th>หมายเหตุ</th></tr></thead><tbody>
   ${days.map(r=>`<tr${r.step===0?' style="border-top:2px solid var(--accent)"':''}><td><b>${r.day}</b></td>${d0?`<td>${dt(r.day)}</td>`:''}${use.map(id=>{ const x=r.doses[id]; return `<td${id===r.add?' style="background:rgba(59,130,246,.10)"':''}>${x?`<b>${fmtN(Math.round(x.mg))} mg</b><div class="hint">${esc(tbrTabTxt(id,x.b))}</div>`:'<span class="hint">–</span>'}</td>`; }).join('')}<td style="font-size:12px">${r.step===0?`เริ่ม ${TBR_DRUG[r.add][1]}`:r.step===n-1?`${TBR_DRUG[r.add][1]} ขนาดเต็ม`:''}</td></tr>`).join('')}
   </tbody></table></div>
   <p style="margin:6px 0 2px">ครบ ${days.length} วัน → ให้สูตรเต็มต่อ${use.length<4&&!use.includes('pza')?' (ไม่มี Z: '+TBR_ALT.pza+')':''}</p>
   <ul class="msgs">${[
    ['info','ประเมินผื่น ไข้ เยื่อบุ ทุกวัน (เช้า) ก่อนให้ยามื้อถัดไป · ผื่นกลับมา → หยุดยาตัวที่เพิ่งเพิ่ม บันทึกแพ้ยา (Naranjo/บัตรแพ้ยา) แล้วข้ามไปตัวถัดไป'],
    ['info',`ตับ: ALT/AST ทุก 3–7 วันระหว่าง rechallenge${st.alt!=null&&st.alt>st.uln?' (ค่าตับยังสูงเล็กน้อย)':''} · ALT >3 เท่ามีอาการ หรือ >5 เท่า → หยุด`],
    ['info','ผื่นกลับมาเมื่อเพิ่มยาตัวใด → สูตรทดแทน: '+Object.entries(TBR_ALT).filter(([k])=>use.includes(k)).map(([k,v])=>`${TBR_DRUG[k][0]}: ${v}`).join(' · ')],
    ['info','ระหว่าง rechallenge ห้ามเริ่มยาใหม่ที่ไม่จำเป็น (แปลผลยาก) · ให้ antihistamine ได้ แต่อาจบดบังผื่นระยะแรก']
   ].map(([l,t])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(t)}</span></li>`).join('')}</ul>`;
  out.innerHTML=H;
  const ln=[`Plan: Rechallenge ยา TB ทีละตัว (${use.map(id=>TBR_DRUG[id][0]).join('→')}) ตัวละ ${n} วัน${d0?` เริ่ม ${dt(1)}`:''}`,
   `SCAR screen: ${st.sjs?'สงสัย SJS/TEN':st.agep?'สงสัย AGEP':`ไม่มีสัญญาณ SJS/TEN/AGEP · RegiSCAR ${st.s} (${st.dress})`}${st.alt!=null?` · ALT ${st.alt}/AST ${st.ast??'–'}`:''}${st.eosP!=null?` · Eos ${st.eosP}%`:''}`,
   ...days.map(r=>`  D${r.day}${d0?` (${dt(r.day)})`:''}: `+use.filter(id=>r.doses[id]).map(id=>`${TBR_DRUG[id][0]} ${fmtN(Math.round(r.doses[id].mg))} mg (${tbrTabTxt(id,r.doses[id].b)})`).join(' + ')),
   `Monitor: ผื่น/ไข้/เยื่อบุทุกวัน · LFT ทุก 3–7 วัน · ผื่นกลับมา → หยุดตัวที่เพิ่งเพิ่ม แจ้งแพทย์ ปรับสูตร`];
  $('tbrNote').value=ln.join('\n'); }
(function(){ const box=$('tbrBox'); if(!box) return;
  box.innerHTML=`<h2>ผื่นแพ้ยาวัณโรค — คัดกรอง SCAR → แผน Rechallenge</h2>
   <p class="hint" style="margin:0 0 6px">ใช้น้ำหนัก/Lab (ALT AST TB WBC Eos) จากแผงผู้ป่วย · ขนาดเต็มจากตาราง TB ด้านบน (แก้ได้) · เม็ดยาตามบัญชี รพ. (H 100 · R 300/450 · E 400 หักครึ่งได้ · Z 500)</p>
   <details open><summary style="cursor:pointer;font-weight:700">① อาการเตือน SCAR / เกณฑ์ RegiSCAR (ติ๊กที่พบ)</summary>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:2px 12px;margin:6px 0">${TBR_SIGNS.map(([k,t])=>`<label style="display:flex;gap:6px;align-items:flex-start;font-size:13.5px"><input type="checkbox" id="tbr_${k}"${k==='resolved'?' ':''}> ${esc(t)}</label>`).join('')}</div>
    <label class="f" style="max-width:220px">ULN ของ ALT/AST (U/L)<input id="tbrUln" type="number" value="41"></label></details>
   <div id="tbrScar"></div>
   <details open style="margin-top:8px"><summary style="cursor:pointer;font-weight:700">② แผน Rechallenge</summary>
    <div class="grid2" style="margin-top:6px">
     <label class="f">ลำดับยา<select id="tbrOrd"><option value="hrez">H → R → E → Z (Z สุดท้าย — ตัวที่ทำให้ผื่นบ่อย)</option><option value="rhez">R → H → E → Z</option><option value="hre">H → R → E (ไม่ rechallenge Z)</option></select></label>
     <label class="f">วันต่อยา 1 ตัว<select id="tbrDays"><option value="3">3 วัน (1/3 → 2/3 → เต็ม)</option><option value="2">2 วัน (ครึ่ง → เต็ม)</option></select></label>
     <label class="f">วันเริ่ม (dd/mm/yy)<input id="tbrStart" placeholder="เช่น 7/11/69"></label>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px 12px;margin:6px 0">${Object.entries(TBR_DRUG).map(([id,[ab,nm]])=>`<label class="f"><span><input type="checkbox" id="tbrU_${id}" checked> ${ab} ${nm} — ขนาดเต็ม (mg)</span><input id="tbrD_${id}" type="number" step="any" placeholder="อัตโนมัติจากน้ำหนัก"></label>`).join('')}</div>
   </details>
   <div id="tbrOut"></div>
   <label class="f" style="margin-top:8px">ข้อความสำหรับ Pharmacist note (แก้ไขได้)<textarea id="tbrNote" rows="7" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:var(--ink)"></textarea></label>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn sm pri" id="tbrCp">คัดลอก note</button><button type="button" class="btn sm" id="tbrPr">พิมพ์ตาราง rechallenge (ให้หอผู้ป่วย)</button><button type="button" class="btn sm" id="tbrFill">ดึงยา TB จากคำสั่งที่วาง</button><span class="toast" id="tbrMsg"></span></div>
   <p class="hint">อ้างอิง: แนวทางการควบคุมวัณโรคประเทศไทย 2564 · WHO TB treatment guideline (management of drug reactions) · ATS/CDC/IDSA 2016 · Kardaun SH, RegiSCAR (Br J Dermatol 2013) · DIC คณะเภสัชศาสตร์ มหิดล — <b>แผนจริงต้องตกลงกับแพทย์</b></p>`;
  box.addEventListener('input',e=>{ if(e.target.id==='tbrNote') return; tbrEval(); }); box.addEventListener('change',e=>{ if(e.target.id==='tbrNote') return; tbrEval(); });
  $('tbrCp').onclick=()=>copyRich(txtHtml($('tbrNote').value),$('tbrNote').value,$('tbrMsg'));
  $('tbrPr').onclick=()=>{ const t=$('tbrOut').querySelector('table'); if(!t) return; printHtml(`<div style="font-family:Sarabun,Tahoma,sans-serif"><h3 style="margin:0 0 4px">ตาราง Rechallenge ยาวัณโรค</h3><p style="margin:0 0 6px">หอผู้ป่วย ............ เตียง ......... (ห้ามระบุชื่อในระบบ — เขียนด้วยมือ)</p>${t.outerHTML}<p>ประเมินผื่น/ไข้/เยื่อบุ ทุกเช้าก่อนให้ยา · ผื่นกลับมา: หยุดยาตัวที่เพิ่งเพิ่ม แจ้งแพทย์และเภสัชกร</p><p>เภสัชกร ............................ โทร ............</p></div>`); };
  $('tbrFill').onclick=()=>{ if(typeof tbRender==='function') tbRender(); const rws=joinLines(($('xPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean); let n=0;
    rws.forEach(r=>{ const m=(r.raw+' '+((masterOf(r)||[])[1]||'')).toLowerCase(); const id=/isoniazid|\binh\b/.test(m)?'inh':/rifamp/.test(m)?'rifam':/ethamb/.test(m)?'emb':/pyrazin/.test(m)?'pza':null; if(!id) return;
      const e=evaluate(r,getPt(),rws); const mg=e&&e.D?e.D:null; if(mg){ $('tbrD_'+id).value=Math.round(mg); n++; } });
    Object.keys(TBR_DRUG).forEach(id=>{ const has=rws.some(r=>new RegExp({inh:'isoniazid|\\binh\\b',rifam:'rifamp',emb:'ethamb',pza:'pyrazin'}[id],'i').test(r.raw+' '+((masterOf(r)||[])[1]||''))); if(rws.length) $('tbrU_'+id).checked=has; });
    if(rws.length&&!rws.some(r=>/pyrazin/i.test(r.raw+' '+((masterOf(r)||[])[1]||'')))) $('tbrOrd').value='hre';
    cpMsg($('tbrMsg'),n?`ดึงขนาดยา ${n} ตัวจากคำสั่ง`:'ไม่พบยา TB ในคำสั่งที่วาง — ใช้ขนาดตามน้ำหนัก'); tbrEval(); };
  ['bw','alt','ast','L_alt','L_ast','L_eos','L_wbc','L_tbil'].forEach(id=>{ const el=$(id); el&&el.addEventListener('input',tbrEval); });
  $('t-tbx').addEventListener('click',()=>setTimeout(tbrEval,50)); tbrEval(); })();
