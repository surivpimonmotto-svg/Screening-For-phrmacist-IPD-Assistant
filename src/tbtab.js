/* ===== tbtab.js — แท็บ "ยา TB": ขนาด H R Z E ตามน้ำหนัก (ตาราง TB รพ.มค 10/4/2566 ตามแนวทาง TB 2564 — ใช้ข้อมูลเดียวกับ kb.js) · ปรับตามไต
   · ตรวจคำสั่งที่วาง (ใช้กฎหน้าคัดกรอง) · จำนวนเม็ดตามวันที่จ่าย · ข้อควรระวัง */
const TB_DRUGS=[['inh','H','Isoniazid'],['rifam','R','Rifampicin'],['pza','Z','Pyrazinamide'],['emb','E','Ethambutol']];
const TB_TAB={inh:[300,100],rifam:[450,300],pza:[500],emb:[400,500]};
// เลือกเม็ดยาให้ได้ขนาดพอดี (หรือใกล้ที่สุดไม่เกิน) ด้วยจำนวนเม็ดน้อยสุด — เม็ดเดียวขนาดเดียวก่อน
function tbTabs(id,mg){ const S=TB_TAB[id]||[]; let best=null;
  const consider=c=>{ const t=c.reduce((a,[s,n])=>a+s*n,0), n=c.reduce((a,[,k])=>a+k,0), d=Math.abs(t-mg), one=c.filter(([,k])=>k).length===1; if(!best||d<best.d-1e-9||(Math.abs(d-best.d)<1e-9&&(n<best.n||(n===best.n&&one&&!best.one)))) best={c:c.filter(([,k])=>k),t,n,d,one}; };
  for(let a=0;a<=6;a++){ if(S.length===1){ consider([[S[0],a]]); continue; } for(let b=0;b<=6;b++) consider([[S[0],a],[S[1],b]]); }
  return best; }
const tbTabTxt=b=>b.c.map(([s,n])=>`${s} mg × ${n}`).join(' + ');
function tbRender(){ const out=$('xOut'); if(!out) return; const pt=getPt(), bw=+pt.bw, ped=pt.isPed, days=+$('xDays').value||0, ph=$('xPh').value;
  const imp=pt.dial==='HD'||pt.dial==='CRRT'||(pt.crcl!=null&&pt.crcl<30), cap=pt.dial==='CAPD';
  if(!(bw>0)){ out.innerHTML='<div class="empty">กรอกน้ำหนักในแผงข้อมูลผู้ป่วย (ซ้าย) — ขนาดยา TB คิดตามน้ำหนัก</div>'; return; }
  const want=ph==='cp'?['inh','rifam']:['inh','rifam','pza','emb'];
  const rec=TB_DRUGS.filter(([id])=>want.includes(id)).map(([id,ab,nm])=>{ const d=KB.find(k=>k.id===id), r=ped?d.tb.ped:d.tb.adult;
    let mg=null, how='', band='';
    if(!ped&&r.bandsWt){ const b=r.bandsWt.find(x=>bw>=x[0]&&bw<x[1]); band=b[0]===0?`<${b[1]} kg`:b[1]>=999?`≥${b[0]} kg`:`${b[0]}–${b[1]-1} kg`;
      if(b[2]!=null&&!b[3]){ mg=b[2]; how=`ตาราง ${band}`; } else { const lo=r.kg[0]*bw, hi=Math.min(r.kg[1]*bw,r.max); mg=b[2]!=null?b[2]:Math.min((r.kg[0]+r.kg[1])/2*bw,r.max); how=`${band}: ${b[2]!=null?b[2]+' mg หรือ ':''}คิด ${r.kg[0]}–${r.kg[1]} mg/kg = ${r0(lo)}–${r0(hi)} mg`; } }
    else { const lo=r.kg[0]*bw, hi=Math.min(r.kg[1]*bw,r.max); mg=Math.min((r.kg[0]+r.kg[1])/2*bw,r.max); how=`${r.kg[0]}–${r.kg[1]} mg/kg = ${r0(lo)}–${r0(hi)} mg (max ${r.max})`; }
    const tb=tbTabs(id,mg), freq=(!ped&&r.renal3x&&imp)?'3 ครั้ง/สัปดาห์'+(pt.dial==='HD'?' หลังฟอก':''):'วันละครั้ง';
    return {id,ab,nm,mg:tb.t,how,tb,freq,renal3x:!ped&&r.renal3x&&imp,capd:cap&&r.capd?r.capd:''}; });
  const perWk=x=>x.renal3x?3:7;
  const recH=`<table class="ctbl"><thead><tr><th>ยา</th><th>ขนาด/ครั้ง</th><th>เม็ด</th><th>ความถี่</th><th>ที่มา</th>${days?`<th>จ่าย ${days} วัน</th>`:''}</tr></thead><tbody>${rec.map(x=>`<tr><td><b>${x.ab}</b> ${x.nm}</td><td><b>${fmtN(x.mg)} mg</b></td><td>${tbTabTxt(x.tb)}</td><td>${x.freq}${x.capd?`<div class="hint">${esc(x.capd)}</div>`:''}</td><td class="hint">${esc(x.how)}</td>${days?`<td>${x.tb.c.map(([s,n])=>`${s} mg × <b>${Math.ceil(n*days*perWk(x)/7)}</b> เม็ด`).join('<br>')}</td>`:''}</tr>`).join('')}</tbody></table>`;
  // คำสั่งที่วาง → ตรวจด้วยกฎหน้าคัดกรอง
  const rws=joinLines(($('xPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean);
  const isTB=r=>{ const d=r.drugId&&KB.find(k=>k.id===r.drugId); return (d&&d.tb)||/rifinah|rifafour|rimstar|rimactazid|isoniazid|rifamp|pyrazin|ethambut|streptomycin|levoflox/i.test(r.raw); };
  const tbr=rws.filter(isTB); let chk='';
  if(rws.length){ const LV={flag:3,warn:2,ok:1,info:0};
    chk=tbr.length?`<table class="ctbl"><thead><tr><th>คำสั่ง</th><th>ผลตรวจ</th></tr></thead><tbody>${tbr.map(r=>{ const e=evaluate(r,pt,rws), it=e.items.filter(i=>/^TB|ยาวัณโรค|Rifampicin|INH|CrCl|HD|CAPD|ปรับเป็น|ความถี่|ยา TB|dose|ไม่ต้องปรับ|ตรวจสอบ|ไม่มี CrCl|ยาเม็ดรวม|ห้ามใช้/.test(i.txt)||i.lvl==='flag').sort((a,b)=>LV[b.lvl]-LV[a.lvl]);
      return `<tr><td>${esc(r.raw)}</td><td>${it.length?`<ul class="msgs" style="margin:0">${it.map(i=>`<li><span class="tag ${i.lvl}">${LVL_TXT[i.lvl]}</span><span>${esc(i.txt)}</span></li>`).join('')}</ul>`:'<span class="hint">—</span>'}</td></tr>`; }).join('')}</tbody></table>`:'<p class="hint">ไม่พบยา TB ในข้อความที่วาง</p>';
    const has=id=>tbr.some(r=>r.drugId===id||(id!=='pza'&&id!=='emb'&&/rifinah|rifafour|rimstar|rimactazid/i.test(r.raw))||(/rifafour|rimstar/i.test(r.raw)));
    const miss=want.filter(id=>!has(id)).map(id=>TB_DRUGS.find(x=>x[0]===id)[1]);
    if(tbr.length&&miss.length) chk+=`<ul class="msgs"><li><span class="tag warn">${LVL_TXT.warn}</span><span>ระยะ${ph==='cp'?'ต่อเนื่อง (HR)':'เข้มข้น (HRZE)'}: ไม่พบ ${miss.join(', ')} ในคำสั่ง — ตรวจสูตร (ถ้าแพทย์ตั้งใจงดเพราะ ADR/ตับ/ตา ให้บันทึกเหตุผล)</span></li></ul>`; }
  const notes=[];
  if(imp) notes.push(['warn',`${pt.dial||'CrCl '+fmtN(Math.round(pt.crcl))+' (<30)'}: Z และ E ขนาดเดิม ให้ 3 ครั้ง/สัปดาห์${pt.dial==='HD'?' หลังฟอกเท่านั้น':''} · H และ R ไม่ต้องปรับ`]);
  if(pt.crcl==null&&!pt.dial) notes.push(['info','ไม่มี CrCl — ถ้า <30 ต้องปรับ Z, E เป็น 3 ครั้ง/สัปดาห์']);
  notes.push(['info','Pyridoxine (B6) 10–50 mg/วัน ร่วมกับ INH ในกลุ่มเสี่ยง (เบาหวาน, สุรา, HIV, ไตวาย, ขาดอาหาร, ตั้งครรภ์/ให้นมบุตร)']);
  notes.push(['info','ติดตาม AST/ALT/bilirubin (ตับ) · การมองเห็น/ตาบอดสีแดง-เขียว (E) · uric acid/ปวดข้อ (Z) · ปัสสาวะ/น้ำตาสีส้มจาก R (ปกติ)']);
  if(KB&&pt) notes.push(['info','Rifampicin เป็น enzyme inducer — ตรวจยาร่วม (warfarin, ARV, ยาคุม, azole, steroid) ในหน้าคัดกรอง/แท็บ ARV']);
  out.innerHTML=`<div class="band" style="margin-bottom:8px"><b>${ped?'เด็ก':'ผู้ใหญ่ ≥15 ปี'} · น้ำหนัก ${fmtN(bw)} kg</b>${pt.crcl!=null?` · CrCl ${fmtN(Math.round(pt.crcl))}`:''}${pt.dial?` · ${pt.dial}`:''} · ${ph==='cp'?'ระยะต่อเนื่อง 4HR':'ระยะเข้มข้น 2HRZE'}</div>
   <h2>ขนาดยาที่แนะนำ (ตาราง TB รพ.มค)</h2>${recH}
   ${rws.length?`<h2>ตรวจคำสั่งที่วาง (${tbr.length} รายการ TB)</h2>${chk}`:''}
   <h2>ข้อควรระวัง</h2><ul class="msgs">${notes.map(([l,m])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`).join('')}</ul>
   <p class="hint" style="margin-top:6px">${esc(SRC_TB)}</p>`; }
(function(){ if(!$('xOut')) return; let t=0;
  $('xPaste').addEventListener('input',()=>{ clearTimeout(t); t=setTimeout(tbRender,500); });
  ['xDays'].forEach(id=>$(id).addEventListener('input',tbRender)); $('xPh').addEventListener('change',tbRender);
  $('xRun').onclick=tbRender; $('xClr').onclick=()=>{ $('xPaste').value=''; tbRender(); };
  $('xFromScr').onclick=()=>{ if(typeof rows==='undefined'||!rows.length){ cpMsg($('xMsg'),'หน้าคัดกรองยังไม่มีรายการยา'); return; } $('xPaste').value=rows.map(r=>r.raw).join('\n'); tbRender(); };
  $('t-tbx').addEventListener('click',tbRender);
  ['bw','scr','ageIn','ageU','mode','crclIn'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',tbRender); el.addEventListener('change',tbRender); } });
  tbRender(); })();
