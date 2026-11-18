/* ===== liqpaste.js — แท็บยาน้ำเด็ก: วางใบสั่งยา (หลายรายการ) → คำนวณทุกตัว · ตรวจขนาดด้วยกฎหน้าคัดกรอง · โหลดเข้าเครื่องคำนวณ · เพิ่มลงแผ่นพับทีเดียว */
let lpRows=[];
function lpFind(r){ const m=masterOf(r); let x=m?LIQ.find(l=>l.code===m[0]):null;
  if(!x&&r.drugId){ const c=LIQ.filter(l=>l.kb&&l.kb.id===r.drugId&&l.conc); const sm=(r.raw.match(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*(\d+(?:\.\d+)?)\s*ml/i)); x=(sm&&c.find(l=>Math.abs(l.conc-(+sm[1]/+sm[2]))<0.01))||c[0]||null; if(x&&c.length>1&&!sm) r._lpMulti=c.map(l=>l.name); }
  if(!x){ const w=(r.raw.match(/[A-Za-z][A-Za-z\-]{3,}/g)||[]).map(s=>s.toUpperCase()).filter(s=>!/^(SYR|SUSP|DROP|DROPS|TAB|DRY|SYRUP|ORAL)$/.test(s)); if(w.length){ const N=l=>(l.name+' '+(l.gname||'')).toUpperCase(); x=LIQ.find(l=>N(l).includes(w[0])&&(!w[1]||N(l).includes(w[1])))||LIQ.find(l=>N(l).includes(w[0])); } }
  return x; }
function lpCalc(r){ const x=lpFind(r), conc=x&&x.conc?x.conc:null; let ml=null, amt=null;
  const dv=+r.doseVal; if(r.doseUnit==='ml') ml=dv; else if(/tsp|ช้อนชา/i.test(r.doseUnit||'')) ml=dv*5; else if(conc&&dv>0&&/^(mg|mcg|iu|unit|g)$/i.test(r.doseUnit||'')) ml=dv*(r.doseUnit==='g'?1000:1)/conc;
  if(ml!=null&&conc) amt=ml*conc;
  const h=(r.raw.match(/ทุก\s*(\d+)\s*(?:-\s*(\d+))?\s*(?:ชั่วโมง|ชม|hr|h)/i)||[]); const prn=!!r.prn;
  const label=prn?(h[1]?`ทุก ${h[1]}${h[2]?'-'+h[2]:''} ชั่วโมง`:'เมื่อมีอาการ'):((FREQ_OPTS.find(o=>Math.abs(+o[0]-(r.F||0))<0.01)||['',r.F?`วันละ ${r.F} ครั้ง`:'—'])[1]);
  const sym=prn?((r.raw.match(/เวลา\s*([ก-๙]+(?:หรือ[ก-๙]+)?)/)||[])[1]||'มีอาการ'):'';
  return {x,conc,ml,amt,label,prn,F:r.F||null,h,sym}; }
function lpRender(){ const out=$('lpOut'); if(!out) return; if(!lpRows.length){ out.innerHTML=''; return; } const pt=getPt(), bw=+pt.bw||null;
  const ICON={flag:'⛔',warn:'⚠️',ok:'✅',info:'ℹ️'}, ORD={flag:0,warn:1,ok:2,info:3}, AGE=/อายุ\s*0\s*ปี|ระบุอายุเป็น|ไม่มีน้ำหนัก|ใส่น้ำหนัก|ไม่มีอายุ|^ทารกแรกเกิด \(อายุ/, k2=x=>fmtN(Math.round(x*100)/100);
  const ptNotes=new Set(); const sumTxt={flag:'ต้อง consult แพทย์',warn:'ทบทวนก่อนจ่าย',ok:'ขนาดเหมาะสม',none:'ไม่มีเกณฑ์ในฐาน — ตรวจเอง',nr:'ไม่มีเกณฑ์ในฐาน — ตรวจเอง'};
  const cards=lpRows.map((r,i)=>{ const c=lpCalc(r); let e=evaluate(r,pt,lpRows); if(c.amt!=null&&e.items.some(it=>/คำนวณ mg ไม่ได้/.test(it.txt))){ const r2=Object.assign({},r,{doseVal:c.amt,doseUnit:'mg',strength:null}); try{ const e2=evaluate(r2,pt,lpRows.map(x=>x===r?r2:x)); if(!e2.items.some(it=>/คำนวณ mg ไม่ได้/.test(it.txt))) e=e2; }catch(_){} }
    const u=c.x?c.x.u:'mg', fa=x=>u==='mg'&&x<1?fmtN(r1(x*1000))+' mcg':fmtN(r1(x))+' '+u;
    const its=e.items.filter(it=>{ if(AGE.test(it.txt)){ ptNotes.add(it.txt); return false; } return true; }).sort((a,b)=>(ORD[a.lvl]??4)-(ORD[b.lvl]??4));
    const main=its.filter(it=>it.lvl!=='info'), info=its.filter(it=>it.lvl==='info');
    const st=main.some(x=>x.lvl==='flag')?'flag':main.some(x=>x.lvl==='warn')?'warn':main.some(x=>x.lvl==='ok')?'ok':(e.status==='flag'||e.status==='warn'?'none':e.status||'none');
    const freq=c.prn?'PRN '+c.label:(typeof llFreqTh==='function'&&c.F?llFreqTh(c.F,false):c.label), sig=(r.raw.match(/(?:รับประทาน|ทาน|กิน|หยด|ป้อน|ให้)[^\n]*/)||[''])[0];
    const L=[]; L.push(['คำสั่ง',esc(sig||r.raw)]);
    if(r._lpMulti) L.push(['หมายเหตุ',`<span class="hint">ไม่ระบุความแรง — ใช้ ${esc(c.x.name)} (มี ${r._lpMulti.length} ขนาด: ${esc(r._lpMulti.join(' / '))})</span>`]);
    L.push(['ความแรง',c.conc?(u==='mg'&&c.conc<0.1?`${fmtN(r1(c.conc*1000))} mcg/ml`:`${fmtN(c.conc)} ${esc(u)}/ml`):'<span class="hint">ไม่ทราบความแรง — เลือกยาในเครื่องคำนวณด้านล่าง</span>']);
    if(c.ml!=null&&c.amt!=null){ const perDay=c.F&&!c.prn?c.amt*c.F:null;
      L.push(['ได้ยา',`${fmtMl(c.ml)} ml × ${fmtN(c.conc)} = <b>${fa(c.amt)}/ครั้ง</b>${perDay!=null?` · ${freq} = <b>${fa(perDay)}/วัน</b>`:` · ${esc(freq)}`}`]);
      if(bw) L.push(['ต่อน้ำหนัก',perDay!=null?`${fa(perDay)} ÷ ${fmtN(bw)} kg = <b>${k2(perDay/bw)} ${esc(u)}/kg/วัน</b>${c.F>1?` <span class="hint">(${k2(c.amt/bw)} ${esc(u)}/kg/ครั้ง)</span>`:''}`:`${fa(c.amt)} ÷ ${fmtN(bw)} kg = <b>${k2(c.amt/bw)} ${esc(u)}/kg/ครั้ง</b>`]);
      else L.push(['ต่อน้ำหนัก','<span class="hint">ใส่น้ำหนักในแผงผู้ป่วย</span>']); }
    else L.push(['ได้ยา',`<span class="hint">อ่านขนาดไม่ได้</span> · ${esc(freq)}`]);
    return `<div class="lpc" data-st="${st}"><div class="lpc-h"><b>${esc(c.x?c.x.name:r.raw.slice(0,50))}</b>${c.x?'':' <span class="hint">ไม่พบในบัญชียาน้ำ</span>'}<span class="pill ${st}" style="margin-left:auto">${ST_TXT[st]||'—'}</span></div>
      <dl class="lpc-dl">${L.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      ${main.length?`<div class="lpc-k">ผลตรวจ</div><ul class="lpc-ul">${main.map(it=>`<li>${ICON[it.lvl]||'•'} ${esc(it.txt)}</li>`).join('')}</ul>`:''}
      ${info.length?`<details class="lpc-more"><summary>ข้อมูลเพิ่มเติม (${info.length})</summary><ul class="lpc-ul">${info.map(it=>`<li>${ICON.info} ${esc(it.txt)}</li>`).join('')}</ul></details>`:''}
      <div class="lpc-f"><span class="lpc-s ${st}">สรุป: ${sumTxt[st]||'—'}</span><span style="margin-left:auto;white-space:nowrap"><button type="button" class="btn sm" data-lpl="${i}" ${c.x?'':'disabled'}>คำนวณละเอียด</button> <button type="button" class="btn sm" data-lpa="${i}" ${c.ml!=null?'':'disabled'}>+ แผ่นพับ</button></span></div></div>`; });
  out.innerHTML=(ptNotes.size?`<div class="lpc-pt">⚠️ ข้อมูลผู้ป่วย: ${[...ptNotes].map(esc).join(' · ')}</div>`:'')+cards.join('')+
   `<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button type="button" class="btn sm pri" id="lpAll">+ เพิ่มทุกรายการลงแผ่นพับ</button><span class="toast" id="lpMsg"></span></div>`;
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
(function(){ if(!$('lpPaste')) return; $('lpRead').onclick=lpRead; $('lpPaste').addEventListener('paste',()=>setTimeout(lpRead,0)); $('lpClr').onclick=()=>{ $('lpPaste').value=''; lpRows=[]; lpRender(); };
  $('lpFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('lpMsg0'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('lpPaste').value=rows.map(r=>r.raw).join('\n'); lpRead(); };
  ['bw','ageIn','ageU'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',()=>lpRows.length&&lpRender()); el.addEventListener('change',()=>lpRows.length&&lpRender()); } }); })();
