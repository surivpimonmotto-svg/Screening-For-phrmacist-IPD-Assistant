/* ===== iou.js — แท็บ "ใบค้างยา": ยาขาด/จ่ายไม่ครบ → คำนวณยอดค้างจ่าย · พอถึงวันไหน · พิมพ์ใบค้างยา
 ช่อง: วดป · ชื่อผู้ป่วย AN/HN (เว้นให้เขียนมือ — โปรแกรมไม่เก็บ) · ยาที่สั่งครั้งนี้ · regimen · จำนวนทั้งหมด · ครั้งที่ 1 · ครั้งที่ 2 · ค้างจ่าย · ชื่อผู้ค้าง ภก./ภญ. */
let iouRows=[];
const IOU_TYPES=['ยาขาดคลัง','ยาไม่พอจ่ายครบ','รอสั่งซื้อ/ยืม รพ.อื่น','รออนุมัติ (DUE/นอกบัญชี)','ยาเตรียมพิเศษ/รอผสม','ผู้ป่วยขอรับภายหลัง'];
const IOU_UNITS=['เม็ด','แคปซูล','ขวด','ซอง','หลอด','vial','amp','ml'];
function iouNew(o={}){ return {drug:o.drug||'',sig:o.sig||'',tot:o.tot??'',d1:o.d1??'',d2:o.d2??'',unit:o.unit||'เม็ด',pd:o.pd??''}; }
function iouCalc(r){ const tot=+r.tot||0, d1=+r.d1||0, d2=+r.d2||0, owe=Math.max(0,tot-d1-d2), pd=+r.pd||0; return {tot,d1,d2,owe,pd,days:pd>0?Math.floor((d1+d2)/pd+1e-9):null}; }
function iouRender(){ const out=$('iOut'); if(!out) return; const st=tlDate($('iDate').value,'0:00')||(()=>{const d=new Date(); d.setHours(0,0,0,0); return d;})(), ap=tlDate($('iAp').value,'0:00');
  if(!iouRows.length) iouRows=[iouNew()];
  const inp=(i,k,w,t='text')=>`<input data-i="${i}" data-k="${k}" type="${t}" value="${esc(String(iouRows[i][k]))}" style="width:${w}" ${t==='number'?'step="any" inputmode="decimal"':''}>`;
  const warn=[];
  const body=iouRows.map((r,i)=>{ const c=iouCalc(r); let cover='';
    if(c.days!=null&&(r.d1!==''||r.d2!=='')){ const end=mrAdd(st,c.days-1); cover=`พอ ${c.days} วัน (ถึง ${tlFmt(end,false)})`; if(ap&&end<mrAdd(ap,-1)) warn.push(`${r.drug||'รายการ '+(i+1)}: ยาพอถึง ${tlFmt(end,false)} แต่นัด ${tlFmt(ap,false)} — <b>ขาดยา ${Math.round((ap-end)/864e5)-1} วัน</b> ควรนัดเร็วขึ้นหรือจ่ายเพิ่ม`); }
    return `<tr><td>${inp(i,'drug','170px')}</td><td>${inp(i,'sig','130px')}</td><td>${inp(i,'tot','70px','number')}</td><td>${inp(i,'d1','70px','number')}</td><td>${inp(i,'d2','70px','number')}</td><td><b style="color:${c.owe?'#b91c1c':'#15803d'}">${fmtN(c.owe)}</b></td><td><select data-i="${i}" data-k="unit">${IOU_UNITS.map(u=>`<option${u===r.unit?' selected':''}>${u}</option>`).join('')}</select></td><td>${inp(i,'pd','60px','number')}</td><td class="hint">${cover}</td><td><button type="button" class="btn sm" data-del="${i}">✕</button></td></tr>`; }).join('');
  out.innerHTML=`<h2>รายการค้างจ่าย</h2><div style="overflow-x:auto"><table class="ctbl"><thead><tr><th>ยาที่สั่งครั้งนี้</th><th>Regimen</th><th>จำนวนทั้งหมด</th><th>ครั้งที่ 1 จ่าย</th><th>ครั้งที่ 2 จ่าย</th><th>ค้างจ่าย</th><th>หน่วย</th><th>ใช้/วัน</th><th>ยาที่จ่ายพอ</th><th></th></tr></thead><tbody>${body}</tbody></table></div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn sm" id="iAdd">+ เพิ่มรายการ</button><button type="button" class="btn sm pri" id="iPr">🖨 พิมพ์ใบค้างยา</button><button type="button" class="btn sm" id="iCp">📋 คัดลอกข้อความ</button><span class="toast" id="iMsg"></span></div>
   ${warn.length?`<ul class="msgs">${warn.map(w=>`<li><span class="tag warn">${LVL_TXT.warn}</span><span>${w}</span></li>`).join('')}</ul>`:''}
   <h2 style="margin-top:12px">ตัวอย่างใบค้างยา</h2>${iouHtml(st,ap)}`;
  out.querySelectorAll('input[data-i],select[data-i]').forEach(el=>el.addEventListener('change',()=>{ iouRows[+el.dataset.i][el.dataset.k]=el.value; iouRender(); }));
  out.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ iouRows.splice(+b.dataset.del,1); iouRender(); });
  $('iAdd').onclick=()=>{ iouRows.push(iouNew()); iouRender(); };
  $('iPr').onclick=()=>printHtml(`<div class="mk">${iouHtml(st,ap,true)}<div style="border-top:1px dashed #64748b;margin:10mm 0 6mm"></div>${iouHtml(st,ap,true,'สำเนา (ห้องยา)')}</div>`);
  $('iCp').onclick=()=>{ const t=iouText(st,ap); copyRich(txtHtml(t),t,$('iMsg')); }; }
function iouType(){ return [...document.querySelectorAll('#iType input:checked')].map(x=>x.value); }
function iouHtml(st,ap,pr,copy){ const L=x=>`<span style="display:inline-block;min-width:${x}px;border-bottom:1px dotted #64748b">&nbsp;</span>`, rs=iouRows.filter(r=>r.drug||r.tot);
  return `<div class="wdform" style="font-family:Sarabun,Tahoma,sans-serif;color:#0f172a;background:#fff;padding:${pr?0:'12px'};border:${pr?0:'1px solid #cbd5e1'};border-radius:8px;max-width:760px;font-size:13.5px">
   <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:17px;font-weight:700">ใบค้างยา</div><div style="font-size:11px;color:#475569">กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม${copy?' · '+esc(copy):''}</div></div>
   <p style="margin:6px 0">วันที่ <b>${tlFmt(st,false)}</b> &nbsp; ชื่อผู้ป่วย ${L(210)} &nbsp; AN ${L(80)} &nbsp; HN ${L(80)}</p>
   <p style="margin:4px 0;font-size:12.5px">ประเภทการค้างยา: ${IOU_TYPES.map(t=>`${iouType().includes(t)?'☑':'☐'} ${t}`).join(' &nbsp; ')} &nbsp; ☐ อื่น ๆ ${L(120)}</p>
   <table style="border-collapse:collapse;width:100%;font-size:13px;margin:6px 0" border="1"><tr style="background:#f1f5f9"><th style="padding:3px 5px">ยาที่สั่งครั้งนี้</th><th style="padding:3px 5px">Regimen</th><th style="padding:3px 5px">จำนวนทั้งหมด</th><th style="padding:3px 5px">ครั้งที่ 1 จ่าย</th><th style="padding:3px 5px">ครั้งที่ 2 จ่าย</th><th style="padding:3px 5px">ค้างจ่าย</th></tr>
   ${(rs.length?rs:[iouNew(),iouNew()]).map(r=>{ const c=iouCalc(r), u=r.unit; return `<tr><td style="padding:4px 5px">${esc(r.drug)||'&nbsp;'}</td><td style="padding:4px 5px">${esc(r.sig)}</td><td style="padding:4px 5px;text-align:center">${r.tot!==''?`${fmtN(c.tot)} ${u}`:''}</td><td style="padding:4px 5px;text-align:center">${r.d1!==''?`${fmtN(c.d1)} ${u}`:''}</td><td style="padding:4px 5px;text-align:center">${r.d2!==''?`${fmtN(c.d2)} ${u}`:'…… '+u}</td><td style="padding:4px 5px;text-align:center;font-weight:700">${r.tot!==''?`${fmtN(c.owe)} ${u}`:''}</td></tr>`; }).join('')}</table>
   <p style="margin:6px 0">นัดรับยาที่ค้าง วันที่ ${ap?`<b>${tlFmt(ap,false)}</b>`:L(110)} &nbsp; ผู้ค้างจ่าย ภก./ภญ. ${L(180)} &nbsp; ผู้รับยาครั้งที่ 2 ${L(140)}</p>
   <p style="margin:4px 0 0;font-size:11.5px;color:#475569">กรุณานำใบนี้มาแสดงเมื่อมารับยาที่ค้าง · ถ้ายาหมดก่อนวันนัด ติดต่อห้องยา โทร.043-711750 ต่อ ห้องยาผู้ป่วยนอก 9250, 9246 / ห้องยาผู้ป่วยใน 9248, 9249</p></div>`; }
function iouText(st,ap){ const L=[`ใบค้างยา วันที่ ${tlFmt(st,false)}${ap?` · นัดรับ ${tlFmt(ap,false)}`:''}${iouType().length?` · ประเภท: ${iouType().join(', ')}`:''}`]; iouRows.filter(r=>r.drug).forEach(r=>{ const c=iouCalc(r); L.push(`- ${r.drug}${r.sig?` (${r.sig})`:''}: ทั้งหมด ${fmtN(c.tot)} · ครั้งที่ 1 ${fmtN(c.d1)}${c.d2?` · ครั้งที่ 2 ${fmtN(c.d2)}`:''} · ค้างจ่าย ${fmtN(c.owe)} ${r.unit}`); }); return L.join('\n'); }
// ดึงจากคำสั่งยา (paste / หน้าคัดกรอง): ใช้ชื่อยา + วิธีใช้ · จำนวนทั้งหมดคิดจากวันที่ระบุ
function iouFromText(t){ const days=+$('iDays').value||0; const rs=joinLines(String(t||'').split(/\n/)).map(parseLine).filter(Boolean);
  iouRows=rs.map(r=>{ const mm=masterOf(r), nm=mm?mm[1]:r.raw.replace(/\s+\d.*$/,'').slice(0,40), D=+r.doseVal||0, perUnit=r.doseUnit==='unit'?D:(r.unitMg&&r.doseVal&&r.doseUnit==='mg'?D/r.unitMg:null), F=r.F||null, pd=perUnit&&F?Math.round(perUnit*F*100)/100:'';
    return iouNew({drug:nm,sig:(r.raw.match(/\d+(?:\.\d+)?\s*[x*]\s*\d+.*$|\b(od|bid|tid|qid|hs|q\d+h?).*$/i)||[''])[0].slice(0,30),pd,tot:pd&&days?Math.ceil(pd*days-1e-9):''}); });
  iouRender(); }
(function(){ if(!$('iOut')) return; $('iType').innerHTML=IOU_TYPES.map(t=>`<label style="display:inline-flex;gap:4px;align-items:center;margin-right:10px"><input type="checkbox" value="${t}">${t}</label>`).join(''); $('iType').addEventListener('change',iouRender); ['iDate','iAp'].forEach(id=>$(id).addEventListener('input',iouRender));
  $('iRead').onclick=()=>iouFromText($('iPaste').value); $('iClr').onclick=()=>{ $('iPaste').value=''; iouRows=[iouNew()]; iouRender(); };
  $('iFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('iMsg0'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('iPaste').value=rows.map(r=>r.raw).join('\n'); iouFromText($('iPaste').value); };
  iouRender(); })();
