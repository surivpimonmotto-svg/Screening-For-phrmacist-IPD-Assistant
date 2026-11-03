/* ===== liqpaste.js — แท็บยาน้ำเด็ก: วางใบสั่งยา (หลายรายการ) → คำนวณทุกตัว · ตรวจขนาดด้วยกฎหน้าคัดกรอง · โหลดเข้าเครื่องคำนวณ · เพิ่มลงแผ่นพับทีเดียว */
let lpRows=[];
function lpFind(r){ const m=masterOf(r); let x=m?LIQ.find(l=>l.code===m[0]):null;
  if(!x){ const w=(r.raw.match(/[A-Za-z][A-Za-z\-]{3,}/g)||[]).map(s=>s.toUpperCase()).filter(s=>!/^(SYR|SUSP|DROP|DROPS|TAB|DRY|SYRUP|ORAL)$/.test(s)); if(w.length) x=LIQ.find(l=>l.name.toUpperCase().includes(w[0])&&(!w[1]||l.name.toUpperCase().includes(w[1])))||LIQ.find(l=>l.name.toUpperCase().includes(w[0])); }
  return x; }
function lpCalc(r){ const x=lpFind(r), conc=x&&x.conc?x.conc:null; let ml=null, amt=null;
  const dv=+r.doseVal; if(r.doseUnit==='ml') ml=dv; else if(/tsp|ช้อนชา/i.test(r.doseUnit||'')) ml=dv*5; else if(conc&&dv>0&&/^(mg|mcg|iu|unit|g)$/i.test(r.doseUnit||'')) ml=dv*(r.doseUnit==='g'?1000:1)/conc;
  if(ml!=null&&conc) amt=ml*conc;
  const h=(r.raw.match(/ทุก\s*(\d+)\s*(?:-\s*(\d+))?\s*(?:ชั่วโมง|ชม|hr|h)/i)||[]); const prn=!!r.prn;
  const label=prn?(h[1]?`ทุก ${h[1]}${h[2]?'-'+h[2]:''} ชั่วโมง`:'เมื่อมีอาการ'):((FREQ_OPTS.find(o=>Math.abs(+o[0]-(r.F||0))<0.01)||['',r.F?`วันละ ${r.F} ครั้ง`:'—'])[1]);
  const sym=prn?((r.raw.match(/เวลา\s*([ก-๙]+(?:หรือ[ก-๙]+)?)/)||[])[1]||'มีอาการ'):'';
  return {x,conc,ml,amt,label,prn,F:r.F||null,h,sym}; }
function lpRender(){ const out=$('lpOut'); if(!out) return; if(!lpRows.length){ out.innerHTML=''; return; } const pt=getPt();
  out.innerHTML=`<div style="overflow-x:auto"><table class="ctbl" style="font-size:13px"><thead><tr><th>ยา</th><th>ความเข้มข้น</th><th>ครั้งละ</th><th>ความถี่</th><th>ตรวจขนาด</th><th></th></tr></thead><tbody>${lpRows.map((r,i)=>{ const c=lpCalc(r), e=evaluate(r,pt,lpRows), top=e.items.filter(it=>it.lvl!=='info').slice(0,2), st=e.status;
    return `<tr><td><b>${esc(c.x?c.x.name:r.raw.slice(0,40))}</b>${c.x?'':'<div class="hint">ไม่พบในบัญชียาน้ำ</div>'}</td><td>${c.conc?(c.x.u==='mg'&&c.conc<0.1?`${fmtN(r1(c.conc*1000))} mcg/ml`:`${fmtN(c.conc)} ${c.x.u}/ml`):'<span class="hint">—</span>'}</td><td>${c.ml!=null?`<b>${fmtMl(c.ml)} ml</b>${c.amt!=null?`<div class="hint">${c.x.u==='mg'&&c.amt<1?fmtN(r1(c.amt*1000))+' mcg':fmtN(r1(c.amt))+' '+c.x.u}</div>`:''}`:'<span class="hint">อ่านขนาดไม่ได้</span>'}</td><td>${esc(c.prn?'PRN '+c.label:(typeof llFreqTh==='function'&&c.F?llFreqTh(c.F,false):c.label))}</td>
      <td><span class="pill ${st}">${ST_TXT[st]||'—'}</span>${top.map(it=>`<div style="font-size:12px;margin-top:2px">${esc(it.txt.slice(0,140))}</div>`).join('')}</td>
      <td style="white-space:nowrap"><button type="button" class="btn sm" data-lpl="${i}" ${c.x?'':'disabled'}>คำนวณ</button> <button type="button" class="btn sm" data-lpa="${i}" ${c.ml!=null?'':'disabled'}>+ แผ่นพับ</button></td></tr>`; }).join('')}</tbody></table></div>
   <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button type="button" class="btn sm pri" id="lpAll">+ เพิ่มทุกรายการลงแผ่นพับ</button><span class="toast" id="lpMsg"></span></div>`;
  out.querySelectorAll('[data-lpl]').forEach(b=>b.onclick=()=>lpLoad(lpRows[+b.dataset.lpl]));
  out.querySelectorAll('[data-lpa]').forEach(b=>b.onclick=()=>{ lpAdd(lpRows[+b.dataset.lpa]); cpMsg($('lpMsg'),'เพิ่มลงแผ่นพับแล้ว'); });
  $('lpAll').onclick=()=>{ let n=0; lpRows.forEach(r=>{ if(lpAdd(r)) n++; }); cpMsg($('lpMsg'),`เพิ่ม ${n} รายการลงแผ่นพับ`); const el=$('llOut'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }; }
function lpAdd(r){ const c=lpCalc(r); if(c.ml==null||!$('llAdd')) return false;
  window.liqLast={name:c.x?c.x.name:r.raw.slice(0,40),ml:c.ml,amt:c.amt,uu:c.x?c.x.u:'mg',F:c.F||1,prn:c.prn,maxCount:c.prn?Math.floor(24/(+c.h[1]||6)):null,sym:c.sym,label:c.prn?c.label:c.label,days:+$('lDays').value||null,nb:null,bottle:c.x?c.x.bottle:0,kb:c.x&&c.x.kb?c.x.kb.id:(r.drugId||null)};
  $('llAdd').click(); return true; }
function lpLoad(r){ const c=lpCalc(r); if(!c.x) return; $('lDrug').value=c.x.code+' · '+c.x.name; $('lDrug').dispatchEvent(new Event('change'));
  if(c.ml!=null){ $('lDose').value=+c.ml.toFixed(2); $('lDU').value='ml'; }
  $('lMode').value=c.prn?'prn':'reg'; $('lMode').dispatchEvent(new Event('change'));
  if(c.prn){ const k=c.h[1]?LIQ_PRN.findIndex(o=>o[2]===(c.h[2]?c.h[1]+'-'+c.h[2]:c.h[1])):-1; if(k>=0) $('lF').value=k; }
  else { const k=LIQ_REG.findIndex(o=>Math.abs(+o[0]-(c.F||0))<0.01); if(k>=0) $('lF').value=k; }
  $('lF').dispatchEvent(new Event('change')); if(typeof renderLiq==='function') renderLiq(); const o=$('lOut'); if(o) o.scrollIntoView({behavior:'smooth',block:'start'}); }
function lpRead(){ lpRows=joinLines(($('lpPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean); lpRender(); }
(function(){ if(!$('lpPaste')) return; $('lpRead').onclick=lpRead; $('lpClr').onclick=()=>{ $('lpPaste').value=''; lpRows=[]; lpRender(); };
  $('lpFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('lpMsg0'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('lpPaste').value=rows.map(r=>r.raw).join('\n'); lpRead(); };
  ['bw','ageIn','ageU'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',()=>lpRows.length&&lpRender()); el.addEventListener('change',()=>lpRows.length&&lpRender()); } }); })();
