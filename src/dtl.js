/* ===== dtl.js — แผนภาพลำดับเวลาการใช้ยา (Drug Timeline) ทั่วไป =====
 ไม่เก็บชื่อ/HN ผู้ป่วย — ตอนพิมพ์มีเส้นประให้เขียนด้วยมือ
*/
const DT0=()=>({hdr:{ward:'',date:'',by:''},dpp:12,start:'',drugs:[],evs:[]});
let DT=DT0(), dtSeq=0;
const DTD=864e5;
const dtDay=s=>{const x=tlDate(s); if(!x) return null; x.setHours(0,0,0,0); return x;};
const dtF=x=>tlFmt(x,false);
function dtSave(){ try{ localStorage.setItem('ipd_dtl',JSON.stringify(DT)); }catch(e){} }
function dtLoadLocal(){ try{ const s=localStorage.getItem('ipd_dtl'); if(s){ DT={...DT0(),...JSON.parse(s)}; dtSeq=Math.max(0,...DT.drugs.map(d=>d.id),...DT.evs.map(e=>e.id)); } }catch(e){} }

/* ---------- นำเข้าจากคำสั่งยา ---------- */
function dtImport(){
  const base=$('dtImpD').value.trim()||dtF(new Date());
  const rows=joinLines($('dtPaste').value.split(/\n/)).map(parseLine).filter(Boolean); let n=0;
  rows.forEach(r=>{ const mm=masterOf(r), d=KB.find(k=>k.id===r.drugId);
    let name=mm?mm[1]:d?d.name:r.raw.split(/\s{2,}| \d/)[0];
    name=name.replace(/\s+/g,' ').trim(); const rw=r.raw.replace(/\s+/g,' '); const ix=rw.toUpperCase().indexOf(name.toUpperCase());
    const sig=rw.slice(ix>=0?ix+name.length:0).replace(/\b(start|due)\b.*$/i,'').trim();
    let sd=base, ed='';
    const m=r.raw.match(/(?:start|เริ่ม)\s*\.?\s*(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/i);
    if(m){ sd=`${m[1]}/${m[3]}/${m[4]}`; if(m[2]) ed=`${m[2]}/${m[3]}/${m[4]}`; }
    DT.drugs.push({id:++dtSeq,name,dose:sig.slice(0,80),sd,ed,prior:false}); n++; });
  $('dtImpMsg').textContent=n?`เพิ่ม ${n} รายการ — ตรวจวันเริ่ม/หยุดในตาราง`:'ไม่พบรายการยา';
  $('dtPaste').value=''; dtRender();
}

/* ---------- ตารางแก้ไข ---------- */
function dtLists(){
  $('dtDrugs').innerHTML=DT.drugs.length?`<table class="ctbl"><thead><tr><th>ยา</th><th>ขนาด/วิธีใช้</th><th>เริ่ม</th><th>หยุด (ว่าง = ใช้อยู่)</th><th>ได้รับมาก่อน</th><th></th></tr></thead><tbody>${DT.drugs.map(d=>`<tr data-id="${d.id}">
    <td><input data-k="name" value="${esc(d.name)}" style="min-width:150px"></td><td><input data-k="dose" value="${esc(d.dose)}" style="min-width:150px"></td>
    <td><input data-k="sd" value="${esc(d.sd)}" placeholder="dd/mm/69" style="width:100px"></td><td><input data-k="ed" value="${esc(d.ed)}" placeholder="dd/mm/69" style="width:100px"></td>
    <td style="text-align:center"><input type="checkbox" data-k="prior" ${d.prior?'checked':''}></td><td><button type="button" class="btn sm" data-del="d">ลบ</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">ยังไม่มีรายการยา</div>';
  const TY={adr:'อาการไม่พึงประสงค์',lab:'ผล Lab',note:'ความเห็นเภสัชกร'};
  $('dtEvs').innerHTML=DT.evs.length?`<table class="ctbl"><thead><tr><th>ชนิด</th><th>วันที่</th><th>รายละเอียด / ชื่อ Lab</th><th>ค่า Lab</th><th></th></tr></thead><tbody>${[...DT.evs].sort((a,b)=>(dtDay(a.d)||0)-(dtDay(b.d)||0)).map(e=>`<tr data-id="${e.id}">
    <td>${TY[e.type]}</td><td><input data-k="d" value="${esc(e.d)}" style="width:100px"></td><td><input data-k="text" value="${esc(e.text)}" style="min-width:200px"></td>
    <td>${e.type==='lab'?`<input data-k="val" value="${esc(e.val||'')}" style="width:80px">`:''}</td><td><button type="button" class="btn sm" data-del="e">ลบ</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">ยังไม่มีเหตุการณ์</div>';
  ['dtDrugs','dtEvs'].forEach(id=>$(id).querySelectorAll('tr[data-id]').forEach(tr=>{ const id2=+tr.dataset.id, arr=id==='dtDrugs'?DT.drugs:DT.evs, o=arr.find(x=>x.id===id2);
    tr.querySelectorAll('[data-k]').forEach(inp=>inp.addEventListener(inp.type==='checkbox'?'change':'input',()=>{ o[inp.dataset.k]=inp.type==='checkbox'?inp.checked:inp.value; dtChart(); dtSave(); }));
    tr.querySelector('[data-del]').onclick=()=>{ arr.splice(arr.indexOf(o),1); dtRender(); }; }));
}

/* ---------- วาดแผนภาพ (แบ่งหน้าตามจำนวนวันต่อหน้า) ---------- */
function dtRange(){
  const ts=[...DT.drugs.flatMap(d=>[dtDay(d.sd),dtDay(d.ed)]),...DT.evs.map(e=>dtDay(e.d))].filter(Boolean).map(x=>x.getTime());
  if(!ts.length) return null;
  let t0=dtDay(DT.start)?.getTime()??Math.min(...ts); const t1=Math.max(...ts, Math.min(...ts));
  // ยาที่ยังใช้อยู่: แสดงถึงวันที่จัดทำ (หรือวันล่าสุดที่มีข้อมูล)
  const hd=dtDay(DT.hdr.date)?.getTime(); const tEnd=Math.max(t1, DT.drugs.some(d=>!d.ed)&&hd?hd:t1);
  return {t0,tEnd};
}
function dtPageSvg(p0,dpp,print){
  const W=1100,L=230,R=30,top=46, cw=(W-L-R)/dpp, x=t=>L+(t-p0)/DTD*cw, pEnd=p0+dpp*DTD;
  const inP=t=>t>=p0&&t<pEnd;
  const evA=DT.evs.filter(e=>e.type==='adr'&&dtDay(e.d)&&inP(dtDay(e.d).getTime()));
  const evN=DT.evs.filter(e=>e.type==='note'&&dtDay(e.d)&&inP(dtDay(e.d).getTime()));
  const labs=[...new Set(DT.evs.filter(e=>e.type==='lab'&&e.text).map(e=>e.text.trim()))];
  const drugs=DT.drugs.filter(d=>d.name&&dtDay(d.sd));
  const aH=evA.length?58:0, nH=evN.length?58:0, dH=30, lH=30;
  const H=top+aH+drugs.length*dH+labs.length*lH+nH+14;
  let g='';
  for(let i=0;i<=dpp;i++){ const tx=L+i*cw; g+=`<line x1="${tx}" y1="${top-8}" x2="${tx}" y2="${H-6}" stroke="#d6d9e0"/>`;
    if(i<dpp){ const dt=new Date(p0+i*DTD); g+=`<text x="${tx+cw/2}" y="${top-16}" font-size="11" text-anchor="middle" fill="#334155">${dt.getDate()}/${dt.getMonth()+1}/${String(dt.getFullYear()+543).slice(2)}</text>`; } }
  g+=`<line x1="${L}" y1="${top-8}" x2="${W-R}" y2="${top-8}" stroke="#94a3b8"/>`;
  let y=top;
  const wrap=(t,n)=>{const out=[];let s=t;while(s.length&&out.length<3){out.push(s.slice(0,n));s=s.slice(n);} if(s.length) out[2]=out[2].slice(0,n-1)+'…'; return out;};
  if(aH){ g+=`<text x="${L-10}" y="${y+16}" font-size="12.5" text-anchor="end" fill="#b91c1c" font-weight="700">อาการไม่พึงประสงค์</text>`;
    evA.forEach(e=>{ const ex=x(dtDay(e.d).getTime())+cw/2; g+=`<path d="M${ex-7},${y+4} L${ex+7},${y+4} L${ex},${y+17} Z" fill="#dc2626"/>`;
      wrap(e.text||'',Math.max(8,Math.floor(cw*1.6/7))).forEach((l,i)=>g+=`<text x="${ex}" y="${y+30+i*11}" font-size="10" text-anchor="middle" fill="#b91c1c">${esc(l)}</text>`); });
    y+=aH; }
  drugs.forEach((d,i)=>{ const s=dtDay(d.sd).getTime(), e=dtDay(d.ed)?.getTime()??null, c='#1d4ed8';
    if(i%2===0) g+=`<rect x="0" y="${y}" width="${W}" height="${dH}" fill="#f1f5f9" opacity=".55"/>`;
    const nm=d.name.length>30?d.name.slice(0,29)+'…':d.name;
    g+=`<text x="${L-10}" y="${y+13}" font-size="12" text-anchor="end" fill="#0f172a" font-weight="600">${esc(nm)}</text>`;
    if(d.dose) g+=`<text x="${L-10}" y="${y+25}" font-size="9.5" text-anchor="end" fill="#64748b">${esc(d.dose.length>40?d.dose.slice(0,39)+'…':d.dose)}</text>`;
    const rep=dtDay(DT.hdr.date)?.getTime(), lim=e==null&&rep!=null&&rep>=s?rep+DTD:pEnd; // ยาที่ยังใช้: ถึงวันที่จัดทำ
    const eEff=e!=null?e+DTD:null; // วันหยุด = ใช้ถึงสิ้นวัน
    const a=Math.max(s,p0), b=Math.min(eEff??lim,pEnd,lim);
    if(b>a){ const ya=y+15, xa=x(a)+(s>=p0?cw/2:0), xb=e!=null&&e<pEnd?x(e)+cw/2:x(b);
      g+=`<line x1="${xa}" y1="${ya}" x2="${xb}" y2="${ya}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
      if(s>=p0) g+= d.prior?`<path d="M${xa+1},${ya-7} L${xa-9},${ya} L${xa+1},${ya+7} Z" fill="${c}"/>`:`<circle cx="${xa}" cy="${ya}" r="6" fill="#fff" stroke="${c}" stroke-width="2.5"/>`;
      else g+=`<path d="M${L+9},${ya-7} L${L-1},${ya} L${L+9},${ya+7} Z" fill="${c}"/>`;
      if(e!=null&&e<pEnd) g+=`<circle cx="${xb}" cy="${ya}" r="6" fill="#fff" stroke="${c}" stroke-width="2.5"/><circle cx="${xb}" cy="${ya}" r="2.6" fill="${c}"/>`;
      else { const xr=Math.min(x(b),W-R); g+=`<path d="M${xr-9},${ya-7} L${xr+1},${ya} L${xr-9},${ya+7} Z" fill="${c}"/>`; } }
    y+=dH; });
  labs.forEach(nm=>{ g+=`<text x="${L-10}" y="${y+19}" font-size="12" text-anchor="end" fill="#7c3aed" font-weight="600">${esc(nm)}</text>`;
    DT.evs.filter(e=>e.type==='lab'&&e.text.trim()===nm&&dtDay(e.d)&&inP(dtDay(e.d).getTime())).forEach(e=>{ const ex=x(dtDay(e.d).getTime())+cw/2;
      g+=`<circle cx="${ex}" cy="${y+8}" r="4" fill="#7c3aed"/><text x="${ex}" y="${y+24}" font-size="11" text-anchor="middle" fill="#5b21b6" font-weight="600">${esc(e.val||'')}</text>`; });
    y+=lH; });
  if(nH){ g+=`<text x="${L-10}" y="${y+16}" font-size="12.5" text-anchor="end" fill="#047857" font-weight="700">ความเห็นเภสัชกร</text>`;
    evN.forEach(e=>{ const ex=x(dtDay(e.d).getTime())+cw/2; g+=`<rect x="${ex-5}" y="${y+5}" width="10" height="10" transform="rotate(45 ${ex} ${y+10})" fill="#059669"/>`;
      wrap(e.text||'',Math.max(8,Math.floor(cw*1.6/7))).forEach((l,i)=>g+=`<text x="${ex}" y="${y+30+i*11}" font-size="10" text-anchor="middle" fill="#047857">${esc(l)}</text>`); });
    y+=nH; }
  return `<svg class="dtsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Drug timeline" style="width:100%;height:auto;background:#fff;font-family:inherit">${g}</svg>`;
}
const DT_LEGEND=`<div class="dtleg"><b>สัญลักษณ์:</b> <span style="color:#1d4ed8">○ เริ่มยา</span> · <span style="color:#1d4ed8">◀ ได้รับมาก่อน/ต่อจากหน้าก่อน</span> · <span style="color:#1d4ed8">◉ หยุดยา</span> · <span style="color:#1d4ed8">▶ กำลังใช้ยาอยู่</span> · <span style="color:#dc2626">▼ อาการไม่พึงประสงค์</span> · <span style="color:#7c3aed">● ผล Lab</span> · <span style="color:#059669">◆ ความเห็นเภสัชกร</span></div>`;
function dtPages(){ const r=dtRange(); if(!r) return []; const dpp=Math.max(3,Math.min(31,+DT.dpp||12)); const out=[];
  for(let p=r.t0;p<=r.tEnd;p+=dpp*DTD) out.push(p); return out.map(p=>({p,dpp})); }
function dtChart(){ const pg=dtPages();
  $('dtChart').innerHTML=pg.length?DT_LEGEND+pg.map((x,i)=>`${pg.length>1?`<div class="hint" style="margin-top:8px">หน้า ${i+1}/${pg.length}</div>`:''}${dtPageSvg(x.p,x.dpp)}`).join(''):'<div class="empty">เพิ่มยา (มีวันเริ่ม) หรือเหตุการณ์ เพื่อสร้างแผนภาพ</div>'; }
function dtRender(){ dtLists(); dtChart(); dtSave(); }

function dtPrint(){ dtChart(); let pa=document.getElementById('printArea'); if(!pa){pa=document.createElement('div');pa.id='printArea';document.body.appendChild(pa);}
  const pg=dtPages(), h=DT.hdr, n=new Date();
  const head=`<div style="text-align:center;font-weight:700;font-size:15pt">แผนภาพลำดับเวลาการใช้ยา (Drug Timeline)</div><div style="text-align:center">กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม</div>
   <table class="pt4"><tr><td>ชื่อผู้ป่วย ..............................................</td><td>HN ....................</td><td>หอผู้ป่วย ${esc(h.ward)||'....................'}</td><td>วันที่ ${esc(h.date)||dtF(n)}</td><td>จัดทำโดย ${esc(h.by)||'..............................'}</td></tr></table>`;
  pa.innerHTML=pg.map((x,i)=>`<div style="${i?'break-before:page;':''}">${head}${DT_LEGEND}<div class="psvg">${dtPageSvg(x.p,x.dpp,true)}</div>${pg.length>1?`<div style="text-align:right;font-size:9pt">หน้า ${i+1}/${pg.length}</div>`:''}</div>`).join('')+
   `<table class="pt4 grid" style="break-before:auto"><tr><th>ยา</th><th>ขนาด/วิธีใช้</th><th>เริ่ม</th><th>หยุด</th></tr>${DT.drugs.map(d=>`<tr><td>${esc(d.name)}${d.prior?' (ได้รับมาก่อน)':''}</td><td>${esc(d.dose)}</td><td>${esc(d.sd)}</td><td>${esc(d.ed||'ยังใช้อยู่')}</td></tr>`).join('')}</table>`+
   (DT.evs.length?`<table class="pt4 grid"><tr><th>วันที่</th><th>ชนิด</th><th>รายละเอียด</th></tr>${[...DT.evs].sort((a,b)=>(dtDay(a.d)||0)-(dtDay(b.d)||0)).map(e=>`<tr><td>${esc(e.d)}</td><td>${{adr:'อาการไม่พึงประสงค์',lab:'ผล Lab',note:'ความเห็นเภสัชกร'}[e.type]}</td><td>${esc(e.text)}${e.type==='lab'?' = '+esc(e.val||''):''}</td></tr>`).join('')}</table>`:'')+
   `<div class="psign">ผู้จัดทำ/เภสัชกร ...................................................... วันที่ ............................</div>`;
  const st=document.createElement('style'); st.id='dtPage'; st.textContent='@page{size:A4 landscape;margin:10mm}'; document.head.appendChild(st);
  const done=()=>{ const s=document.getElementById('dtPage'); if(s) s.remove(); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done); window.print(); setTimeout(done,3000);
}
function dtFileSave(){ const blob=new Blob([JSON.stringify({v:1,dtl:DT},null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); const n=new Date(); a.download=`DrugTimeline-${n.getFullYear()+543}${pad2(n.getMonth()+1)}${pad2(n.getDate())}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
function dtFileOpen(ev){ const f=ev.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); if(!o.dtl) throw 0; DT={...DT0(),...o.dtl}; dtSeq=Math.max(0,...DT.drugs.map(d=>d.id),...DT.evs.map(e=>e.id)); dtHdrFill(); dtRender(); }catch(e){ alert('ไฟล์ไม่ถูกต้อง'); } }); ev.target.value=''; }
function dtHdrFill(){ $('dtWard').value=DT.hdr.ward||''; $('dtDate').value=DT.hdr.date||''; $('dtBy').value=DT.hdr.by||''; $('dtDpp').value=DT.dpp||12; $('dtStart').value=DT.start||''; }

(function(){ if(!$('dtChart')) return;
  dtLoadLocal(); if(!DT.hdr.date) DT.hdr.date=dtF(new Date()); $('dtImpD').value=dtF(new Date()); $('dtEvD').value=dtF(new Date()); $('dtSd').value=dtF(new Date());
  dtHdrFill();
  [['dtWard','ward'],['dtDate','date'],['dtBy','by']].forEach(([id,k])=>$(id).addEventListener('input',()=>{DT.hdr[k]=$(id).value;dtSave();}));
  $('dtDpp').addEventListener('input',()=>{DT.dpp=+$('dtDpp').value||12;dtChart();dtSave();});
  $('dtDppM').onclick=()=>{DT.dpp=Math.max(3,(+DT.dpp||12)-1);$('dtDpp').value=DT.dpp;dtChart();dtSave();};
  $('dtDppP').onclick=()=>{DT.dpp=Math.min(31,(+DT.dpp||12)+1);$('dtDpp').value=DT.dpp;dtChart();dtSave();};
  $('dtStart').addEventListener('input',()=>{DT.start=$('dtStart').value;dtChart();dtSave();});
  $('dtImp').onclick=dtImport;
  $('dtAddD').onclick=()=>{ const nm=$('dtNm').value.trim(); if(!nm) return; DT.drugs.push({id:++dtSeq,name:nm,dose:$('dtDose').value.trim(),sd:$('dtSd').value.trim(),ed:$('dtEd').value.trim(),prior:$('dtPrior').checked}); ['dtNm','dtDose','dtEd'].forEach(i=>$(i).value=''); $('dtPrior').checked=false; dtRender(); };
  $('dtEvT').addEventListener('change',()=>{ $('dtEvVal').hidden=$('dtEvT').value!=='lab'; $('dtEvTx').placeholder=$('dtEvT').value==='lab'?'ชื่อ Lab เช่น Cr, WBC':'รายละเอียด'; });
  $('dtAddE').onclick=()=>{ const tx=$('dtEvTx').value.trim(); if(!tx) return; DT.evs.push({id:++dtSeq,type:$('dtEvT').value,d:$('dtEvD').value.trim(),text:tx,val:$('dtEvVal').value.trim()}); $('dtEvTx').value=''; $('dtEvVal').value=''; dtRender(); };
  $('dtPrint').onclick=dtPrint; $('dtSaveF').onclick=dtFileSave; $('dtOpen').onclick=()=>$('dtFile').click(); $('dtFile').addEventListener('change',dtFileOpen);
  $('dtClr').onclick=()=>{ if(!confirm('ล้างข้อมูล timeline ทั้งหมด?')) return; DT=DT0(); DT.hdr.date=dtF(new Date()); dtHdrFill(); dtRender(); };
  dtRender();
})();
