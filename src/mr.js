/* ===== mr.js — Medication reconciliation ยากลับบ้าน (ขั้นตอนเภสัชกรคัดกรองก่อนคีย์) =====
 วาง 4 ช่อง: ยาเดิม รพ.มค · ยาเดิม รพ.อื่น/ผู้ป่วยนำมา · ยาระหว่างนอน รพ. · ยากลับบ้าน
 → จับคู่ด้วยชื่อสามัญ (ตัวอ่านเดียวกับหน้าคัดกรอง) → สถานะ เดิม/เปลี่ยน/ใหม่/หยุด/ใช้ยาเดิมผู้ป่วย/เทียบเท่า/ยืนยันกับแพทย์
 → คำเตือน (ยาเดิมหายโดยไม่มีคำสั่งหยุด, หยุดระหว่างนอน รพ. ไม่ได้สั่งกลับ, ซ้ำซ้อน, ผลคัดกรองยากลับบ้าน) → ใบส่งคีย์ให้เจ้าพนักงาน
 ข้อมูลอยู่ในหน้านี้เท่านั้น ไม่บันทึกลงเครื่อง · ตัดชื่อ/HN/AN ออกจากข้อความที่แสดง
*/
const MR_ST=[['same','เดิม','คีย์ตามเดิม'],['chg','เปลี่ยน','คีย์ตามใหม่ (เดิม → ใหม่)'],['new','ใหม่','คีย์ใหม่'],['stop','หยุด','ไม่คีย์ + ยกเลิกรายการเดิมในระบบ'],['own','ใช้ยาเดิมผู้ป่วย','ไม่จ่าย (บันทึกไว้ในรายการ)'],['eq','เทียบเท่า','คีย์ยา รพ.มค แทนยา รพ.อื่น'],['ask','ยืนยันกับแพทย์','ห้ามคีย์จนกว่าแพทย์ยืนยัน']];
const MR_COL={same:'#16a34a',chg:'#d97706',new:'#2563eb',stop:'#64748b',own:'#7c3aed',eq:'#0d9488',ask:'#dc2626'};
const MR_CLS=[['ACEI',/pril\b/i],['ARB',/sartan/i],['Statin',/statin/i],['NSAIDs',/ibuprofen|naproxen|diclofenac|meloxicam|piroxicam|celecoxib|etoricoxib|indomethacin|mefenamic/i],['PPI',/prazole/i],['Benzodiazepine',/azepam|azolam|chlordiazepoxide/i],['CCB (dihydropyridine)',/dipine/i],['Beta-blocker',/olol\b|ilol\b/i],['Sulfonylurea',/glipizide|glibenclamide|gliclazide|glimepiride/i],['Anticoagulant',/warfarin|apixaban|rivaroxaban|dabigatran|edoxaban|enoxaparin|heparin/i],['P2Y12 inhibitor',/clopidogrel|ticagrelor|prasugrel/i],['Loop diuretic',/furosemide|bumetanide/i],['Opioid',/morphine|tramadol|codeine|oxycodone|fentanyl|methadone/i],['Antipsychotic',/haloperidol|risperidone|quetiapine|olanzapine|clozapine|aripiprazole/i]];
const MR_HOLD=/warfarin|apixaban|rivaroxaban|dabigatran|metformin|insulin|glipizide|gliclazide|aspirin|clopidogrel|amlodipine|losartan|enalapril|furosemide|spironolactone|levothyroxine|quetiapine|risperidone|haloperidol|olanzapine|clozapine|valproate|phenytoin|levetiracetam|carbamazepine|prednisolone|statin|digoxin/i;
let MR={rows:[],ov:{},plan:{}};
const mrSrc={a1:'รพ.มค',a2:'รพ.อื่น',b:'ระหว่างนอน รพ.',c:'กลับบ้าน'};
function mrName(r,e){ if(e&&e.drug) return e.drug.name; const m=masterOf(r), w=((m?m[1]:r.raw).match(/[A-Za-z][A-Za-z\-]+/)||[r.raw.split(/\s+/)[0]])[0]; return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase(); }
function mrKey(r){ if(r.drugId) return 'kb:'+r.drugId; const m=masterOf(r); const t=((m?(m[2]||m[1]):r.raw)||'').toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>2&&!/^(tab|tabs|cap|caps|inj|sol|syr|susp|mg|mcg|gm|ml|sr|er|mr|xr|cr|film|coated|the)$/.test(w));
  return 'nm:'+(t[0]||r.raw.toLowerCase().slice(0,12)); }
function mrDaily(r){ if(r.weekly&&r.weekly.mgWeek!=null) return r.weekly.mgWeek/7; const st=r.strength;
  const per=r.doseUnit==='unit'?(st&&r.doseVal!==''?+r.doseVal*st:null):(r.doseVal!==''&&r.doseVal!=null?+r.doseVal:null); return per!=null&&r.F?per*r.F:null; }
function mrParse(txt){ return joinLines((txt||'').split(/\n/)).map(l=>{ const r=parseLine(mrClean(l)); if(r) r.raw=l.replace(/\s+/g,' ').trim(); return r; }).filter(r=>r&&(r.drugId||r.master||/\d+(?:\.\d+)?\s*(mg|mcg|g|ml|iu|units?|tab|cap|เม็ด)\b|\d\s*[x×*]\s*\d/i.test(r.raw))); }
function mrSig(r){ return rcaScrub(r.raw).replace(/\s+/g,' ').trim(); }
function mrRun(){ const pt=getPt(), lists={a1:mrParse($('mrA1').value),a2:mrParse($('mrA2').value),b:mrParse($('mrB').value),c:mrParse($('mrC').value)};
  const evC=lists.c.map(r=>evaluate(r,pt,lists.c)); const map=new Map();
  const add=(k,r,e)=>{ const key=mrKey(r); if(!map.has(key)) map.set(key,{key,name:null,a1:[],a2:[],b:[],c:[]}); const g=map.get(key); g[k].push({r,e}); if(!g.name||k==='c') g.name=mrName(r,e||{drug:r.drugId?KB.find(x=>x.id===r.drugId):null}); };
  ['a1','a2','b'].forEach(k=>lists[k].forEach(r=>add(k,r,null))); lists.c.forEach((r,i)=>add('c',r,evC[i]));
  const rows=[...map.values()].map(g=>{ const A=[...g.a1,...g.a2], inA=A.length>0, inB=g.b.length>0, inC=g.c.length>0, notes=[]; let st='ask', auto='';
    if(inC&&inA){ const dA=mrDaily(A[0].r), dC=mrDaily(g.c[0].r), sA=A[0].r.strength, sC=g.c[0].r.strength;
      if(dA!=null&&dC!=null){ if(Math.abs(dA-dC)/Math.max(dA,dC)<0.01){ st='same'; if(A[0].r.F&&g.c[0].r.F&&Math.abs(A[0].r.F-g.c[0].r.F)>0.01){ st='chg'; auto=`ขนาดต่อวันเท่าเดิม แต่ความถี่เปลี่ยน`; } }
        else { st='chg'; auto=`${fmtN(Math.round(dA*100)/100)} → ${fmtN(Math.round(dC*100)/100)} ${g.c[0].e&&g.c[0].e.drug&&g.c[0].e.drug.unit||'mg'}/วัน (${dC>dA?'เพิ่ม':'ลด'})`; } }
      else { const norm=r=>mrSig(r).toLowerCase().replace(/^\S+\s*/,'').replace(/\d+\s*(เม็ด|tab|cap)\s*$/,''); st=norm(A[0].r)===norm(g.c[0].r)?'same':'ask'; if(st==='ask') auto='คำนวณขนาดต่อวันไม่ได้ — เทียบวิธีใช้เอง'; }
      if(sA&&sC&&sA!==sC) notes.push(`ความแรงเปลี่ยน ${fmtN(sA)} → ${fmtN(sC)} mg`);
      if(!g.a1.length&&g.a2.length){ if(st==='same') st='eq'; notes.push('ยาเดิมจาก รพ.อื่น — รพ.มค จ่ายแทน แจ้งผู้ป่วยไม่ให้กินซ้ำกับยาเดิมที่บ้าน'); } }
    else if(inC&&!inA){ st='new'; auto=inB?'เริ่มระหว่างนอน รพ.':'เริ่มตอนกลับบ้าน'; }
    else if(!inC&&inA){ st='ask'; if(g.a2.length&&!g.a1.length){ auto='ยา รพ.อื่น ไม่อยู่ในยากลับบ้าน — กินต่อจากยาเดิมผู้ป่วย หรือหยุด?'; }
      else auto=inB?'ยาเดิมที่ใช้ระหว่างนอน รพ. แต่ไม่อยู่ในยากลับบ้าน — ลืมสั่ง หรือตั้งใจหยุด?':lists.b.length?'ยาเดิมที่หยุดระหว่างนอน รพ. และไม่ได้สั่งกลับ — ถามแพทย์ว่าตั้งใจหยุดหรือไม่':'ยาเดิมไม่อยู่ในยากลับบ้าน — ลืมสั่ง หรือตั้งใจหยุด?';
      if(MR_HOLD.test(g.name+' '+A[0].r.raw)) notes.push('ยากลุ่มที่มักหยุดชั่วคราว (ยาลดความดัน/เบาหวาน/ต้านการแข็งตัวของเลือด/จิตเวช ฯลฯ) — ระวังลืมสั่งกลับ'); }
    else if(inB){ st='none'; auto='ใช้ระหว่างนอน รพ. ไม่ต่อกลับบ้าน'; }
    if(A.length>1) notes.push(`ยาเดิมซ้ำ ${A.length} รายการ (${A.map(x=>g.a1.includes(x)?'รพ.มค':'รพ.อื่น').join(' + ')})`);
    if(g.c.length>1) notes.push(`ยากลับบ้านสั่งซ้ำ ${g.c.length} รายการ`);
    const ce=g.c[0]&&g.c[0].e; if(ce&&(ce.status==='flag'||ce.status==='warn')) ce.items.filter(x=>(x.lvl==='flag'||x.lvl==='warn')&&!/^อ่านคำสั่ง|ยังไม่มีกฎ|^ไม่พบคู่ DI/.test(x.txt)).slice(0,2).forEach(x=>notes.push(`คัดกรอง: ${x.txt}`));
    return {...g,st:MR.ov[g.key]||st,auto,notes,scr:ce?ce.status:null}; });
  // ซ้ำซ้อนกลุ่มยา ในรายการที่ผู้ป่วยจะกินต่อ
  const fin=rows.filter(r=>r.c.length||(['own','same','eq','chg'].includes(r.st)&&(r.a1.length||r.a2.length)));
  MR_CLS.forEach(([cn,re])=>{ const hit=fin.filter(r=>re.test(r.name+' '+[...r.c,...r.a1,...r.a2].map(x=>x.r.raw).join(' '))); if(hit.length>1) hit.forEach(r=>{ if(r.notes.some(n=>n.includes(`(${cn})`)||n.includes(`ซ้ำซ้อน (${cn}`))) return; r.notes.push(`ซ้ำซ้อนกลุ่ม ${cn}: ${hit.filter(x=>x!==r).map(x=>x.name).join(', ')}`); }); });
  const ord={ask:0,chg:1,new:2,stop:3,own:4,eq:5,same:6,none:7}; rows.sort((a,b)=>ord[a.st]-ord[b.st]);
  MR.rows=rows; mrRender(); }
function mrRender(){ const out=$('mrOut'), rows=MR.rows; if(!rows.length){ out.innerHTML='<div class="empty">วางรายการยาแล้วกด "เปรียบเทียบ"</div>'; return; }
  const cnt={}; rows.forEach(r=>cnt[r.st]=(cnt[r.st]||0)+1);
  const pill=(k,n)=>`<span class="pill" style="background:${MR_COL[k]||'#94a3b8'};color:#fff">${(MR_ST.find(s=>s[0]===k)||['','ไม่ต่อ'])[1]} ${n}</span>`;
  const cell=(arr)=>arr.length?arr.map(x=>`<div style="margin-bottom:2px">${esc(mrSig(x.r))}</div>`).join(''):'<span class="hint">—</span>';
  const opt=st=>MR_ST.map(([k,n])=>`<option value="${k}"${k===st?' selected':''}>${n}</option>`).join('');
  out.innerHTML=`<h2>ผลเปรียบเทียบ</h2><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${Object.entries(cnt).map(([k,n])=>pill(k,n)).join('')}</div>
   ${cnt.ask?`<p style="margin:0 0 8px;color:#dc2626;font-weight:700">มี ${cnt.ask} รายการที่ต้องยืนยันกับแพทย์ก่อนส่งคีย์ — เปลี่ยนสถานะเมื่อได้คำตอบ</p>`:''}
   <div style="overflow-x:auto"><table class="ctbl" style="width:100%;font-size:13.5px"><thead><tr><th>ยา</th><th>ยาเดิม</th><th>ระหว่างนอน รพ.</th><th>ยากลับบ้าน</th><th>สถานะ</th><th>หมายเหตุ / คำเตือน</th></tr></thead><tbody>
   ${rows.map((r,i)=>`<tr style="border-left:5px solid ${MR_COL[r.st]||'#cbd5e1'}"><td><b>${esc(r.name||'')}</b>${r.scr&&r.scr!=='ok'&&r.scr!=='none'?` <span class="pill ${r.scr}">${ST_TXT[r.scr]}</span>`:''}</td>
     <td>${r.a1.length?`<div class="hint">รพ.มค</div>${cell(r.a1)}`:''}${r.a2.length?`<div class="hint">รพ.อื่น</div>${cell(r.a2)}`:''}${!r.a1.length&&!r.a2.length?'<span class="hint">—</span>':''}</td>
     <td>${cell(r.b)}</td><td>${cell(r.c)}</td>
     <td>${r.st==='none'?'<span class="hint">ไม่ต่อ (ไม่ต้องคีย์)</span>':`<select data-mi="${i}" style="font-weight:700;color:${MR_COL[r.st]}">${opt(r.st)}</select>`}</td>
     <td>${r.auto?`<div>${esc(r.auto)}</div>`:''}${r.notes.map(n=>`<div style="color:${/^ซ้ำ|^คัดกรอง|ระวัง/.test(n)?'#b45309':'inherit'}">• ${esc(n)}</div>`).join('')}</td></tr>`).join('')}</tbody></table></div>
   ${mrPlanTbl()}
   <h2 style="margin-top:14px">ใบส่งคีย์ให้เจ้าพนักงาน</h2><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><button class="btn sm" id="mrCp" type="button">คัดลอกใบส่งคีย์</button><button class="btn sm pri" id="mrPr" type="button">พิมพ์ใบส่งคีย์</button><span class="toast" id="mrMsg"></span></div><pre id="mrSheet" style="white-space:pre-wrap;font-family:inherit;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:10px;margin:0"></pre>`;
  out.querySelectorAll('[data-mi]').forEach(s=>s.onchange=()=>{ const r=MR.rows[+s.dataset.mi]; r.st=s.value; MR.ov[r.key]=s.value; mrRender(); });
  out.querySelectorAll('[data-tk]').forEach(el=>el.onchange=()=>{ const P=MR.plan[el.dataset.tk]; if(P&&P.tl){ P.tl[el.dataset.tf]=el.value; } const y=window.scrollY; mrRender(); window.scrollTo(0,y); });
  out.querySelectorAll('[data-pk]').forEach(el=>el.onchange=()=>{ const P=MR.plan[el.dataset.pk]||(MR.plan[el.dataset.pk]={}); P[el.dataset.pf]=el.value; const y=window.scrollY; mrRender(); window.scrollTo(0,y); });
  const t=mrSheet(); $('mrSheet').textContent=t;
  $('mrCp').onclick=()=>copyRich(txtHtml(t),t,$('mrMsg'));
  $('mrPr').onclick=()=>printHtml(`<div class="mk"><div class="mkt">ใบส่งคีย์ยากลับบ้าน (Medication reconciliation)</div>${txtHtml(t)}</div>`); }
function mrSheet(){ const R=MR.rows, W=mrWin(), L=['ใบส่งคีย์ยากลับบ้าน — ผ่านการ reconcile โดยเภสัชกร',`วันที่ ${tlFmt(new Date())}`,W.days?`จ่ายยา ${mrFs(W.st)} ถึง ${mrFs(W.end)} (${W.days} วัน)${W.un?` · นัด ${mrFs(W.un)}`:''}`:'',''];
  const sig=x=>x?mrSig(x.r):'';
  const grp=(st,title,f)=>{ const g=R.filter(r=>r.st===st); if(!g.length) return; L.push(`■ ${title} (${g.length})`); g.forEach(r=>L.push('  '+f(r))); L.push(''); };
  grp('ask','รอยืนยันกับแพทย์ — ห้ามคีย์',r=>`? ${r.name}: ${r.auto||''}`);
  grp('chg','คีย์ตามคำสั่งใหม่ (มีการเปลี่ยนแปลง)',r=>`Δ ${sig(r.c[0])}   [เดิม: ${sig(r.a1[0]||r.a2[0])}]`+mrPlanLine(r));
  grp('new','คีย์ใหม่',r=>`+ ${sig(r.c[0])}`+mrPlanLine(r));
  grp('same','คีย์ตามเดิม',r=>`= ${sig(r.c[0])}`+mrPlanLine(r));
  grp('eq','คีย์ยา รพ.มค แทนยา รพ.อื่น',r=>`≈ ${sig(r.c[0])}   [แทน: ${sig(r.a2[0])}] — แจ้งผู้ป่วยไม่ให้กินซ้ำ`+mrPlanLine(r));
  grp('stop','หยุดยา — ไม่คีย์ และยกเลิกรายการเดิมในระบบ',r=>`✕ ${sig(r.a1[0]||r.a2[0])}`);
  grp('own','ใช้ยาเดิมของผู้ป่วยต่อ — ไม่จ่าย',r=>`◇ ${sig(r.a2[0]||r.a1[0])}`);
  const w=R.filter(r=>r.notes.some(n=>/^ซ้ำ|^คัดกรอง/.test(n))); if(w.length){ L.push('■ ข้อสังเกตเภสัชกร'); w.forEach(r=>r.notes.filter(n=>/^ซ้ำ|^คัดกรอง/.test(n)).forEach(n=>L.push(`  • ${r.name}: ${n}`))); L.push(''); }
  const who=`${($('cnTitle')||{}).value||''} ${(($('cnName')||{}).value||'').trim()||'..............................'}`;
  L.push(`เภสัชกรผู้ reconcile: ${who}   ผู้คีย์: ..............................`); return L.join('\n'); }
const MR_EX={a1:`AMLODIPINE 10 MG TAB 1x1 pc เช้า
METFORMIN 500 MG TAB 1x2 pc
SIMVASTATIN 20 MG TAB 1x1 hs
FUROSEMIDE 40 MG TAB 1x1 pc เช้า`,a2:`Losartan 50 mg 1x1 pc เช้า
Atorvastatin 40 mg 1x1 hs
Omeprazole 20 mg 1x1 ac เช้า`,b:`CEFTRIAXONE 2 G IV OD
OMEPRAZOLE 40 MG IV OD
ENOXAPARIN 40 MG SC OD
AMLODIPINE 10 MG TAB 1x1 pc เช้า
SIMVASTATIN 20 MG TAB 1x1 hs`,c:`AMLODIPINE 5 MG TAB 1x1 pc เช้า
SIMVASTATIN 20 MG TAB 1x1 hs
ATORVASTATIN 40 MG TAB 1x1 hs
CEFIXIME 100 MG CAP 2x2 pc
OMEPRAZOLE 20 MG CAP 1x1 ac เช้า`};
(function(){ if(!$('mrOut')) return;
  $('mrStart').value=tlFmt(new Date(),false); { const n=new Date(); $('mrTime').value=pad2(n.getHours())+':'+pad2(n.getMinutes()); } ['mrStart','mrDays','mrUntil','mrTime'].forEach(id=>$(id).addEventListener('change',()=>{ if(MR.rows.length) mrRender(); $('mrWinTxt').textContent=(w=>w.days?`= ${mrFs(w.st)} ถึง ${mrFs(w.end)} (${w.days} วัน)`:'')(mrWin()); }));
  $('mrRun').onclick=()=>{ MR.ov={}; MR.plan={}; mrRun(); };
  $('mrEx').onclick=()=>{ $('mrA1').value=MR_EX.a1; $('mrA2').value=MR_EX.a2; $('mrB').value=MR_EX.b; $('mrC').value=MR_EX.c; MR.ov={}; MR.plan={}; mrRun(); };
  $('mrClr').onclick=()=>{ ['mrA1','mrA2','mrB','mrC'].forEach(id=>$(id).value=''); MR={rows:[],ov:{},plan:{}}; mrRender(); };
  $('mrFromScr').onclick=()=>{ if(!rows.length){ cpMsg($('mrMsg0'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('mrC').value=rows.map(r=>r.raw).join('\n'); cpMsg($('mrMsg0'),`ดึง ${rows.length} รายการจากหน้าคัดกรองมาเป็นยากลับบ้าน`); };
  mrRender(); })();
