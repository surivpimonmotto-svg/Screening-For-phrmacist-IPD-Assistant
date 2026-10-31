/* ===== mrplan.js — แผนจ่ายยากลับบ้าน: ช่วงจ่าย (N วัน / ถึงวันนัด) · วันเริ่มกินรายตัว (อังคารหน้า, delay 1 สัปดาห์) ·
   ระยะคอร์ส (6 เดือน) · tapering (ซอง 1, ซอง 2 …) · หักยาเหลือ → จำนวนที่ต้องจ่าย ===== */
const MR_TH_MON={'ม.ค':0,'มกรา':0,'ก.พ':1,'กุมภา':1,'มี.ค':2,'มีนา':2,'เม.ย':3,'เมษา':3,'พ.ค':4,'พฤษภา':4,'มิ.ย':5,'มิถุนา':5,'ก.ค':6,'กรกฎา':6,'ส.ค':7,'สิงหา':7,'ก.ย':8,'กันยา':8,'ต.ค':9,'ตุลา':9,'พ.ย':10,'พฤศจิกา':10,'ธ.ค':11,'ธันวา':11};
const MR_WD={'จันทร์':1,'อังคาร':2,'พุธ':3,'พฤหัส':4,'ศุกร์':5,'เสาร์':6,'อาทิตย์':0};
const mrD0=d=>{ const x=new Date(d); x.setHours(0,0,0,0); return x; }, mrAdd=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const mrAddMon=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,d.getDate());
const mrF=d=>d?tlFmt(d,false):'–', mrFs=d=>d?`${DAY_TH[WD[(d.getDay()+6)%7]]} ${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()+543).slice(2)}`:'–';
const mrYear=(y,base)=>{ y=+y; if(y<100) y+=2500; if(y>2400) y-=543; return y; };
// แปลงข้อความวันที่ → Date (เทียบกับ base): 27/12/69 · 27 ธ.ค. 69 · 27 ธันวาคม · อังคารหน้า · +7 · delay 1 สัปดาห์ · หลัง 3 วัน
function mrDate(s,base){ s=(s||'').trim(); if(!s) return null; base=mrD0(base||new Date());
  let m=s.match(/^\+\s*(\d+)\s*(วัน|d|days?)?$/i); if(m) return mrAdd(base,+m[1]);
  m=s.match(/(?:delay|เลื่อน|หลัง(?:จาก)?|อีก|ถัดไป|after)\s*(\d+)\s*(สัปดาห์|อาทิตย์|wks?|weeks?|w|วัน|days?|d|เดือน|months?)/i);
  if(m){ const n=+m[1], u=m[2]; return /เดือน|month/i.test(u)?mrAddMon(base,n):mrAdd(base,/สัปดาห์|อาทิตย์|w/i.test(u)?n*7:n); }
  m=s.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})(?:\s*[\/\-.]\s*(\d{2,4}))?/); if(m){ let y=m[3]?mrYear(m[3]):base.getFullYear(); let d=new Date(y,+m[2]-1,+m[1]); if(!m[3]&&d<base) d=new Date(y+1,+m[2]-1,+m[1]); return d; }
  m=s.match(/(\d{1,2})\s*(ม\.ค|มกรา|ก\.พ|กุมภา|มี\.ค|มีนา|เม\.ย|เมษา|พ\.ค|พฤษภา|มิ\.ย|มิถุนา|ก\.ค|กรกฎา|ส\.ค|สิงหา|ก\.ย|กันยา|ต\.ค|ตุลา|พ\.ย|พฤศจิกา|ธ\.ค|ธันวา)\S*\s*(\d{2,4})?/);
  if(m){ const mo=MR_TH_MON[m[2]]; let y=m[3]?mrYear(m[3]):base.getFullYear(); let d=new Date(y,mo,+m[1]); if(!m[3]&&d<base) d=new Date(y+1,mo,+m[1]); return d; }
  m=s.match(/(จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์|เสาร์|อาทิตย์)(?:บดี)?\s*(หน้า)?/); if(m){ const t=MR_WD[m[1]]; let k=(t-base.getDay()+7)%7; if(m[2]&&k===0) k=7; let d=mrAdd(base,k);
    if(m[2]){ const wk=x=>{ const a=mrAdd(x,-((x.getDay()+6)%7)); return a.getTime(); }; if(wk(d)===wk(base)) d=mrAdd(d,7); } return d; }
  if(/พรุ่งนี้|tomorrow/i.test(s)) return mrAdd(base,1); if(/วันนี้|today/i.test(s)) return base; return null; }
// ตัดวลี "เริ่มกินวันอังคารหน้า / start 3/11 / delay 1 สัปดาห์" ออกก่อนอ่านขนาดยา (ไม่ให้ตัวอ่านเข้าใจว่าเป็นวันในสัปดาห์)
const MR_START_RE=/(?:เริ่ม(?:กิน|ทาน|ยา)?|start)\s*(?:วัน(?:ที่)?)?\s*(?:(?:จันทร์|อังคาร|พุธ|พฤหัส(?:บดี)?|ศุกร์|เสาร์|อาทิตย์)\s*(?:หน้า)?|\d{1,2}\s*[\/.\-]\s*\d{1,2}(?:\s*[\/.\-]\s*\d{2,4})?|\d{1,2}\s*(?:ม\.ค|ก\.พ|มี\.ค|เม\.ย|พ\.ค|มิ\.ย|ก\.ค|ส\.ค|ก\.ย|ต\.ค|พ\.ย|ธ\.ค)\S*(?:\s*\d{2,4})?|พรุ่งนี้)|(?:delay|เลื่อน|หลัง(?:จาก)?\s*นี้?)\s*\d+\s*(?:สัปดาห์|อาทิตย์|wks?|weeks?|w|วัน|days?|d|เดือน|months?)/gi;
const mrClean=raw=>raw.replace(MR_START_RE,' ').replace(/\s+/g,' ').trim();
// ระยะเวลา: "6 เดือน" "2 wk" "14 วัน" (ไม่นับ "*1 day" ของ tapering)
function mrDurOf(s){ const t=mrClean(s||'').replace(/[x×*]\s*\d+\s*(?:days?|d|วัน)\b/gi,' '); const m=t.match(/(?:^|[\s#(x×*]|นาน|เป็นเวลา|for|plan|ครบ)\s*(\d+)\s*(เดือน|months?|mo\b|สัปดาห์|อาทิตย์|wks?|weeks?|วัน(?!ละ)|days?)/i); return m?`${m[1]} ${m[2]}`:''; }
function mrDurEnd(start,txt){ const m=(txt||'').match(/(\d+)\s*(เดือน|months?|mo|สัปดาห์|อาทิตย์|wks?|weeks?|w|วัน|days?|d)/i); if(m){ const n=+m[1],u=m[2]; return mrAdd(/เดือน|mo/i.test(u)?mrAddMon(start,n):mrAdd(start,/สัปดาห์|อาทิตย์|w/i.test(u)?n*7:n),-1); }
  const d=mrDate(txt,start); return d||null; }
function mrStartOf(s){ const m=(s||'').match(/(?:เริ่ม(?:กิน|ทาน|ยา)?|start)\s*(?:วัน(?:ที่)?)?\s*([^,;]+)/i); if(m) return m[1].trim(); const d=(s||'').match(/(?:delay|เลื่อน)\s*\d+\s*\S+/i); return d?d[0]:''; }
// tapering: "1*2 *1 day ซอง 1  1*1 *1 day ซอง 2  0"
function mrTaper(raw){ const re=/(\d+(?:\.\d+)?|½)\s*[x×*]\s*(\d+)\s*[x×*]\s*(\d+)\s*(?:days?|d|วัน)\b/gi; const st=[...raw.matchAll(re)].map(m=>({u:(m[1]==='½'?0.5:+m[1])*+m[2],n:+m[3],txt:m[0]}));
  return st.length>=1&&(st.length>=2||/ซอง|taper|ลดลง|then/i.test(raw))?st:null; }
function mrQtyOrdered(raw){ const m=raw.match(/(?:#\s*(\d+)|(\d+)\s*(?:เม็ด|tabs?|caps?|แคปซูล)\s*$)/i); return m?+(m[1]||m[2]):null; }
function mrUnitsOn(r,d){ if(r.weekly){ const k=WD[(d.getDay()+6)%7]; let u=0; r.weekly.segs.forEach(s=>{ if(!s.noDays&&s.units!=null&&s.days.includes(k)) u+=s.units*(s.tpd||1); }); return u; }
  const per=r.doseUnit==='unit'?(r.doseVal!==''?+r.doseVal:null):(r.strength&&r.doseVal!==''?+r.doseVal/r.strength:null); return per!=null&&r.F?per*r.F:null; }
// ช่วงการใช้ยา (phase): "3*2 pc x 2 เดือน then 1*1 lifelong" · ยาทุก 36/48/72 ชม. · วันเว้นวัน
const MR_SIGSTART=/\s(?:\d+(?:\.\d+)?|½)\s*[x×*]\s*\d|\s(?:รับประทาน|ครั้งละ|กิน)|\s(?:\d+(?:\.\d+)?|½)\s*(?:เม็ด|tab|cap)/i;
function mrInterval(seg){ let m=seg.match(/\bq\s*(\d+)\s*h|ทุก\s*(\d+)\s*(?:ชม|ชั่วโมง|hr|hours?)/i); if(m){ const h=+(m[1]||m[2]); if(h>24) return h; }
  if(/วันเว้นวัน|\beod\b|\bqod\b|every\s*other\s*day|alternate\s*day/i.test(seg)) return 48;
  m=seg.match(/ทุก\s*(\d+)\s*วัน|every\s*(\d+)\s*days?/i); if(m&&+(m[1]||m[2])>=2) return 24*+(m[1]||m[2]); return null; }
function mrPerDose(r){ return r.doseUnit==='unit'?(r.doseVal!==''?+r.doseVal:null):(r.strength&&r.doseVal!==''?+r.doseVal/r.strength:null); }
function mrPhases(raw,durOverride){ const cl=mrClean(raw), parts=cl.split(/\s*(?:\bthen\b|แล้ว(?:ต่อ)?ด้วย|แล้วลดเป็น|แล้วเป็น|ต่อด้วย|→|=>)\s*/i).filter(Boolean);
  const m=parts[0].match(MR_SIGSTART), prefix=m?parts[0].slice(0,m.index):parts[0].split(/\s+/).slice(0,3).join(' ');
  return parts.map((seg,i)=>{ const txt=i?prefix+' '+seg:seg, r=parseLine(txt.replace(/\b(?:lifelong|life\s*long|ตลอดชีวิต|ตลอดไป|ต่อเนื่อง|long\s*term)\b/gi,' '))||{}; const H=mrInterval(seg);
    const life=/lifelong|life\s*long|ตลอด|ต่อเนื่อง|long\s*term/i.test(seg); let dur=life?'':mrDurOf(i?seg:seg); if(parts.length===1&&durOverride!=null) dur=durOverride;
    return {r,H,per:mrPerDose(r),dur,life,seg:(i?seg:seg.slice(prefix.length)).trim()}; }); }
// วันที่/เวลาให้ยาแบบช่วงชั่วโมง (เริ่มจาก t0) ที่ตกในวัน d
function mrDosesOn(ph,t0,d){ const a=d.getTime(), b=mrAdd(d,1).getTime(), H=ph.H*36e5; if(a+864e5<=t0.getTime()-1) return 0; let k=Math.max(0,Math.ceil((a-t0.getTime())/H)), n=0; for(;t0.getTime()+k*H<b;k++) n++; return n; }
function mrWin(){ const st=mrDate($('mrStart').value)||mrD0(new Date()), un=mrDate($('mrUntil').value,st), n=+$('mrDays').value;
  const end=un?mrAdd(un,-1):n>0?mrAdd(st,n-1):null; return {st,end,days:end?Math.round((end-st)/864e5)+1:null,un}; }
// คำนวณแผนของ 1 แถว
function mrPlan(row){ const c=row.c[0]; if(!c) return null; const r=c.r, raw=r.raw, P=MR.plan[row.key]||(MR.plan[row.key]={}), W=mrWin();
  const autoStart=mrStartOf(raw), autoDur=mrDurOf(raw), sTxt=P.start??autoStart, dTxt=P.dur??autoDur;
  const s=(sTxt&&mrDate(sTxt,W.st))||W.st, notes=[]; if(s<W.st) notes.push('วันเริ่มอยู่ก่อนวันเริ่มยากลับบ้าน');
  const tp=mrTaper(raw); let cEnd=null, phs=null; const tmm=(sTxt||'').match(/(\d{1,2})[:.](\d{2})(?!\s*[\/.\-]\d)/), tm=tmm?[+tmm[1],+tmm[2]]:null;
  if(tp){ cEnd=mrAdd(s,tp.reduce((a,x)=>a+x.n,0)-1); }
  else { phs=mrPhases(raw,P.dur); let d=s, fin=true; phs.forEach(x=>{ x.a=d; if(x.dur){ x.b=mrDurEnd(d,x.dur); d=mrAdd(x.b,1); } else { x.b=null; fin=false; } }); if(fin&&phs.length&&phs[phs.length-1].b) cEnd=phs[phs.length-1].b; }
  let e=W.end; if(cEnd&&(!e||cEnd<e)) e=cEnd; if(!e) return {P,autoStart,autoDur,s,e:null,need:null,notes:['ระบุจำนวนวัน หรือวันนัด'],tp};
  if(e<s) return {P,autoStart,autoDur,s,e,need:0,give:0,notes:[`เริ่มกิน ${mrFs(s)} หลังวันนัด — ไม่ต้องจ่ายรอบนี้`],cEnd,tp};
  let need=null, packs=null;
  if(tp){ let d=s; packs=tp.map((x,i)=>{ const a=d, b=mrAdd(d,x.n-1); d=mrAdd(b,1); return {i:i+1,a,b,q:x.u*x.n,u:x.u}; }); need=packs.reduce((a,x)=>a+x.q,0); }
  else if(r.prn){ need=mrQtyOrdered(raw); notes.push('PRN — ใช้จำนวนตามคำสั่ง/ระบุเอง'); }
  else { const sched=mrSched(phs,s,e,tm); need=sched.need; packs=sched.packs.length>1||phs.some(x=>x.H)?sched.packs:null; if(need==null) notes.push('คำนวณจำนวนเม็ดไม่ได้ — ใส่ "ต้องใช้" เอง');
    phs.forEach(x=>{ if(x.H) notes.push(`${x.H===48?'วันเว้นวัน (ทุก 48 ชม.)':`ทุก ${x.H} ชม.`} — กินวันแรก ${mrFs(s)}${tm?` เวลา ${pad2(tm[0])}:${pad2(tm[1])}`:''} (แก้ช่อง "เริ่มกิน" ถ้าไม่ใช่วันนี้${x.H%24?' · ใส่เวลาได้ เช่น 31/10/69 20:00':''})`); }); }
  if(P.qty!==undefined&&P.qty!=='') need=+P.qty;
  const left=+P.left||0, give=need!=null?Math.max(0,Math.ceil(need-left-1e-9)):null;
  let leftTo=null; if(left>0&&!tp&&need!=null&&phs){ let rem=left; for(let d=s;d<=e;d=mrAdd(d,1)){ const u=mrDayUnits(phs,s,d,tm)||0; if(rem+1e-9<u){ leftTo=mrAdd(d,-1); break; } rem-=u; } if(!leftTo) leftTo=e; }
  if(cEnd&&W.end&&cEnd>W.end){ const tot=phs?mrSched(phs,s,cEnd,tm).need:null; notes.push(`คอร์สถึง ${mrFs(cEnd)}${tot!=null?` (ทั้งคอร์ส ${fmtN(tot)} เม็ด)`:''} — รอบนี้จ่ายถึง ${mrFs(W.end)} ต่อรอบหน้า`); }
  if(phs&&phs.length>1){ const L=phs[phs.length-1]; if(!L.b) notes.push(`ช่วงสุดท้ายใช้ต่อเนื่อง (${L.life?'lifelong':'ไม่ระบุวันสิ้นสุด'}) เริ่ม ${mrFs(L.a)}`); }
  else if(cEnd) notes.push(`ครบคอร์ส ${mrFs(cEnd)}`);
  const oq=mrQtyOrdered(raw); if(oq!=null&&need!=null&&!tp&&Math.abs(oq-need)>0.5) notes.push(`จำนวนในคำสั่ง ${oq} ≠ ที่คำนวณ ${fmtN(need)}`);
  if(leftTo&&left>0) notes.push(`ยาเหลือพอถึง ${mrFs(leftTo)}`);
  return {P,autoStart,autoDur,s,e,need,left,give,packs,notes,cEnd,tp,oq}; }
function mrDayUnits(phs,s,d,tm){ const ph=phs.find(x=>d>=x.a&&(!x.b||d<=x.b)); if(!ph) return 0; if(ph.H){ if(ph.per==null) return null; const t0=new Date(ph.a); if(ph===phs[0]&&tm) t0.setHours(tm[0],tm[1]); else t0.setHours(8,0); return mrDosesOn(ph,t0,d)*ph.per; } return mrUnitsOn(ph.r,d); }
function mrSched(phs,s,e,tm){ let need=0, ok=true; const packs=phs.map((x,i)=>({i:i+1,a:x.a>s?x.a:s,b:x.b&&x.b<e?x.b:e,q:0,u:null,seg:x.seg,H:x.H,dates:[]}));
  for(let d=s;d<=e;d=mrAdd(d,1)){ const i=phs.findIndex(x=>d>=x.a&&(!x.b||d<=x.b)); if(i<0) continue; const u=mrDayUnits(phs,s,d,tm); if(u==null){ ok=false; break; } need+=u; packs[i].q+=u; if(phs[i].H&&u>0){ const ph=phs[i], t0=new Date(ph.a); if(ph===phs[0]&&tm) t0.setHours(tm[0],tm[1]); else t0.setHours(8,0); const H=ph.H*36e5, a=d.getTime(), b=a+864e5; for(let k=Math.max(0,Math.ceil((a-t0.getTime())/H));t0.getTime()+k*H<b;k++) packs[i].dates.push(new Date(t0.getTime()+k*H)); } }
  return {need:ok?need:null,packs:packs.filter(k=>k.a<=k.b&&k.a<=e)}; }
function mrPackLines(p){ if(!p.packs) return []; if(p.tp) return [...p.packs.map(k=>`ซอง ${k.i}: ${mrFs(k.a)}${k.b>k.a?`–${mrFs(k.b)}`:''} วันละ ${wfDayTxt(k.u)} เม็ด รวม ${fmtN(k.q)} เม็ด`),'จากนั้นหยุดยา'];
  return p.packs.map(k=>`${p.packs.length>1?`ช่วง ${k.i} (${k.seg}): `:''}${mrFs(k.a)}–${mrFs(k.b)} = ${fmtN(Math.round(k.q*100)/100)} เม็ด${k.dates.length?` · กินวันที่ ${k.dates.slice(0,10).map(d=>`${DAY_TH[WD[(d.getDay()+6)%7]]} ${d.getDate()}/${d.getMonth()+1}${k.H%24?` ${pad2(d.getHours())}:${pad2(d.getMinutes())}`:''}`).join(', ')}${k.dates.length>10?` … (${k.dates.length} ครั้ง)`:''}`:''}`); }
function mrPackHtml(p){ return mrPackLines(p).map(x=>`<div>${esc(x)}</div>`).join(''); }
function mrPlanTbl(){ const rows=MR.rows.filter(r=>['same','chg','new','eq'].includes(r.st)&&r.c.length); if(!rows.length) return '';
  const W=mrWin();
  return `<h2 style="margin-top:14px">แผนจ่ายยา — ${W.days?`${mrFs(W.st)} ถึง ${mrFs(W.end)} (${W.days} วัน)`:'ระบุจำนวนวัน หรือวันนัด'}</h2>
  <p class="hint" style="margin:0 0 6px">แก้ช่องสีอ่อนได้: <b>เริ่มกิน</b> (เช่น อังคารหน้า · delay 1 สัปดาห์ · 3/11/69) · <b>ระยะคอร์ส</b> (เช่น 6 เดือน · 5 วัน) · <b>ยาเหลือ</b> (เม็ด) · <b>ต้องใช้</b> (ถ้าคำนวณไม่ได้) — ระบบอ่านจากคำสั่งให้ก่อน</p>
  <div style="overflow-x:auto"><table class="ctbl" style="width:100%;font-size:13.5px"><thead><tr><th>ยา / วิธีใช้</th><th>เริ่มกิน</th><th>ระยะคอร์ส</th><th>ช่วงที่จ่ายรอบนี้</th><th>ต้องใช้</th><th>ยาเหลือ</th><th>จ่าย</th><th>หมายเหตุ</th></tr></thead><tbody>
  ${rows.map(r=>{ const p=mrPlan(r), inp=(k,v,ph,w)=>`<input data-pk="${esc(r.key)}" data-pf="${k}" value="${esc(v??'')}" placeholder="${esc(ph||'')}" style="width:${w}px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:color-mix(in srgb,#fde68a 25%,var(--surface))">`;
    return `<tr><td><b>${esc(r.name)}</b><div class="hint">${esc(mrSig(r.c[0].r))}</div></td>
     <td>${inp('start',p.P.start??p.autoStart,'วันเริ่มยากลับบ้าน',120)}<div class="hint">${mrFs(p.s)}</div></td>
     <td>${p.tp?`<span class="hint">tapering ${p.tp.length} ช่วง</span>`:inp('dur',p.P.dur??p.autoDur,'ตามวันนัด',90)}</td>
     <td style="white-space:nowrap">${p.e&&p.e>=p.s?`${mrFs(p.s)} – ${mrFs(p.e)}`:'—'}</td>
     <td>${p.need!=null?fmtN(Math.round(p.need*100)/100):'?'}<div>${inp('qty',p.P.qty,'แก้เอง',60)}</div></td>
     <td>${inp('left',p.P.left,'0',60)}</td>
     <td style="font-size:1.1em"><b>${p.give!=null?p.give:'?'}</b></td>
     <td>${mrPackHtml(p)}${p.notes.map(n=>`<div class="hint" style="color:${/≠|ก่อน|ไม่ได้/.test(n)?'#b45309':''}">• ${esc(n)}</div>`).join('')}</td></tr>`; }).join('')}</tbody></table></div>`; }
function mrPlanLine(r){ const p=mrPlan(r); if(!p||p.give==null) return ''; let t=` → จ่าย ${p.give} เม็ด`; if(p.left) t+=` (ใช้ ${fmtN(p.need)} − เหลือ ${fmtN(p.left)})`;
  if(p.e&&p.e>=p.s) t+=` · กิน ${mrFs(p.s)}–${mrFs(p.e)}`; if(p.packs) t+='\n'+mrPackLines(p).map(x=>'      '+x).join('\n');
  if(p.cEnd&&p.e&&p.cEnd>p.e) t+=` · คอร์สถึง ${mrFs(p.cEnd)}`; if(p.s>mrWin().st) t+=` · ⚠ เริ่มกิน ${mrFs(p.s)} ไม่ใช่วันแรก`; return t; }
