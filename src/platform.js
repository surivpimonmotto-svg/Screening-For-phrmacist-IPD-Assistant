/* ===== platform.js — เชื่อมทุกแท็บเป็นแพลตฟอร์มเดียว
 · ข้อมูลผู้ป่วย/Lab อยู่ที่แผงซ้ายชุดเดียว ทุกแท็บใช้ร่วมกัน
 · ใบสั่งยาที่วางในแท็บ "ตรวจใบสั่งยา" = ข้อมูลตั้งต้น → เปิดแท็บอื่น ดึงยาที่เกี่ยวข้องให้อัตโนมัติ
 · ทุกแท็บมีแถบเครื่องมือ: ดึงใบสั่งจากหน้าแรก · วางใบสั่ง/Lab เพิ่ม (เข้าหน้าแรกด้วย) · เริ่มใหม่เฉพาะแท็บ */
const PF_TB=/isoniazid|rifamp|pyrazin|ethamb|\binh\b|\bpza\b|\bemb\b|bedaquil|delaman|linezol|levoflox|moxiflox|clofazim|cycloser|rimstar|akurit|\bfdc\b/i;
const PF_CHEMO=/cyclophos|doxorub|vincris|vinblas|paclitax|docetax|carbopl|cisplat|oxalipl|etopos|rituxi|fluorour|\b5-?fu\b|gemcit|methotrex|cytarab|bleomy|dacarb|irinotec|epirub|ifosf|capecit|bortez|trastuz/i;
const PF_ARV=/tenofov|\btdf\b|\btaf\b|lamivud|\b3tc\b|emtric|\bftc\b|efavir|\befv\b|dolutegr|\bdtg\b|nevirap|zidovud|\bazt\b|lopinav|kaletra|aluvia|atazan|darunav|raltegr|rilpiv|abacav|acriptega|teevir|gpo-?vir|kocitaf|tld\b|teno-?em|alacovir/i;
const PF_LIQ=/\bsyr\b|syrup|susp|suspension|drops?\b|elixir|dry\s*syr|ยาน้ำ|\bsol\b|solution/i;
// [แท็บ, ช่องปลายทาง, ตัวกรองแถว (null = ทุกแถว), ฟังก์ชันหลังเติม, ฟังก์ชันเริ่มใหม่, ชื่อกลุ่ม]
const PF_LINK={
 had:{to:'hPaste',f:r=>r.had,run:()=>hadFromText($('hPaste').value),clr:'hClr',g:'ยา HAD'},
 liq:{to:'lpPaste',f:r=>PF_LIQ.test(r.raw),run:()=>$('lpRead').click(),clr:'lpClr',g:'ยาน้ำ'},
 wf:{to:'wOrder',f:r=>r.drugId==='warfarin'||/warfarin|orfarin/i.test(r.raw),run:()=>$('wParse').click(),clr:'wClr',g:'Warfarin'},
 tbx:{to:'xPaste',f:r=>PF_TB.test(r.raw+' '+((masterOf(r)||[])[1]||'')),run:()=>$('xRun').click(),clr:'xClr',g:'ยา TB'},
 arv:{to:'vPaste',f:r=>PF_ARV.test(r.raw+' '+((masterOf(r)||[])[1]||'')),run:()=>$('vRun').click(),clr:'vClr',g:'ยา ARV'},
 neo:{to:'nePaste',f:null,run:()=>{ $('nePaste').dispatchEvent(new Event('input',{bubbles:true})); if(typeof neoRender==='function') neoRender(); },clr:'neClr',g:'ทุกรายการ'},
 cmt:{to:'cPaste',f:r=>PF_CHEMO.test(r.raw+' '+((masterOf(r)||[])[1]||'')),run:()=>$('cParse').click(),clr:'cClr',g:'ยาเคมีบำบัด'},
 iou:{to:'iPaste',f:null,run:()=>$('iRead').click(),clr:'iClr',g:'ทุกรายการ'},
 dtl:{to:'dtPaste',f:null,run:null,clr:null,auto:false,g:'ทุกรายการ (กด "เพิ่มจากคำสั่ง")'},
 mr:{to:'mrB',f:null,run:null,clr:'mrClr',auto:false,g:'ยาระหว่างนอน รพ. (ช่อง ③)'},
 pk:{to:null,f:r=>/vancomycin|vancocin|colisti|colomycin|polymyxin\s*e/i.test(r.raw+' '+((masterOf(r)||[])[1]||'')),run:pfPk,clr:()=>{ ['vDose','vTau','vTau2'].forEach(id=>$(id).value=''); PK_SHOW.v=PK_SHOW.c=true; renderPk(); },g:'Vancomycin / Colistin'},
};
var PK_SHOW={v:true,c:true}, PF_SIG={};
const pfSig=()=>(typeof rows!=='undefined'?rows:[]).map(r=>r.raw).join('\n');
function pfRows(t){ const L=PF_LINK[t]; const rs=typeof rows!=='undefined'?rows:[]; return L&&L.f?rs.filter(L.f):rs; }
// Vanco/Colistin: เติม dose/interval จากใบสั่ง และแสดงเฉพาะยาที่สั่ง
function pfPk(){ const rs=pfRows('pk'), pt=getPt(); const v=rs.find(r=>/vanco/i.test(r.raw+' '+((masterOf(r)||[])[1]||''))), c=rs.find(r=>/colist|colomycin|polymyxin/i.test(r.raw+' '+((masterOf(r)||[])[1]||'')));
  PK_SHOW.v=!!v||!c; PK_SHOW.c=!!c||!v;
  if(v){ const e=evaluate(v,pt,rows); const D=e.D!=null?e.D:(v.doseUnit==='g'?+v.doseVal*1000:+v.doseVal); if(D>0) $('vDose').value=Math.round(D); if(v.F>0) $('vTau').value=Math.round(24/v.F*10)/10; }
  renderPk(); return [v,c].filter(Boolean).length; }
function pfPatientLine(){ const pt=getPt(), L=pt.lab||{}; const bw=$('bw').value, a=typeof ageTxt==='function'?ageTxt():'';
  const p=[`${sex==='F'?'หญิง':'ชาย'}${a?' '+a:''}`,bw?`${bw} kg`:'<b style="color:#b45309">ไม่มีน้ำหนัก</b>',$('ht').value?`สูง ${$('ht').value}`:'',pt.dial?pt.dial:pt.crcl!=null?`CrCl ${r1(pt.crcl)}`:'<span style="color:#b45309">ไม่มี SCr/CrCl</span>',pt.k!=null?`K ${pt.k}`:'',L.plt!=null?`Plt ${fmtN(L.plt)}`:'',$('allergy').value.trim()?`แพ้: ${esc($('allergy').value.trim())}`:''].filter(Boolean);
  return p.join(' · '); }
function pfBar(t){ const sec=$('p-'+t); if(!sec) return null; let b=$('pf-'+t); if(b) return b;
  sec.insertAdjacentHTML('afterbegin',`<div class="pfbar" id="pf-${t}"><div class="pfl"><span class="pfk">ผู้ป่วย</span> <span class="pfpt"></span></div><div class="pfl"><span class="pfk">ใบสั่ง</span> <span class="pfrx"></span></div>
   <div class="pfbtn">${PF_LINK[t]?`<button type="button" class="btn sm pri" data-pf="pull">⤓ ดึงใบสั่งจากหน้าแรก</button>`:''}<button type="button" class="btn sm" data-pf="paste">📝 วางใบสั่ง / Lab</button><button type="button" class="btn sm pfreset" data-pf="reset">🗑 เริ่มใหม่ (แท็บนี้)</button><button type="button" class="btn sm" data-pf="newpt" title="ล้างผู้ป่วย ใบสั่ง และทุกแท็บ">👤 ผู้ป่วยใหม่</button><span class="pfmsg" style="align-self:center;color:#15803d;font-size:12.5px"></span></div>
   <div class="pfpaste" hidden><textarea rows="3" placeholder="${t==='pk'?'เช่น VANCOMYCIN INJ 1 G 1 g iv q 12 hr หรือ COLISTIN 150 mg iv q 12 hr · Creatinine 0.8 · ':''}วางคำสั่งยาและ/หรือผล Lab (เช่น Potassium 3.3, Creatinine 1.2) — ยาจะถูกเพิ่มเข้าหน้า 'ตรวจใบสั่งยา' และดึงมาแท็บนี้ · Lab เติมแผงผู้ป่วย"></textarea><div style="display:flex;gap:6px;margin-top:4px;align-items:center;flex-wrap:wrap"><button type="button" class="btn sm pri" data-pf="read">อ่าน</button></div></div></div>`);
  b=$('pf-'+t);
  // แท็บที่ไม่มีช่องวางของตัวเอง → เปิดช่องวางใบสั่ง/Lab ให้เห็นทันที
  if(!PF_LINK[t]||!PF_LINK[t].to){ const pp=b.querySelector('.pfpaste'); pp.hidden=false; pp.querySelector('textarea').rows=4; }
  b.querySelector('[data-pf="pull"]')&&(b.querySelector('[data-pf="pull"]').onclick=()=>pfPull(t,true));
  b.querySelector('[data-pf="paste"]').onclick=()=>{ const p=b.querySelector('.pfpaste'); p.hidden=!p.hidden; if(!p.hidden) p.querySelector('textarea').focus(); };
  b.querySelector('[data-pf="read"]').onclick=()=>pfRead(t);
  b.querySelector('[data-pf="reset"]').onclick=()=>pfReset(t);
  b.querySelector('[data-pf="newpt"]').onclick=()=>{ $('clearAll').click(); Object.keys(PF_LINK).forEach(x=>pfReset(x,true)); PF_SIG={}; pfUpdate(t); };
  return b; }
function pfUpdate(t){ const b=pfBar(t); if(!b) return; b.querySelector('.pfpt').innerHTML=pfPatientLine();
  const n=(typeof rows!=='undefined'?rows:[]).length, L=PF_LINK[t], k=L?pfRows(t).length:null;
  b.querySelector('.pfrx').innerHTML=!n?'<span class="hint">ยังไม่มีใบสั่งในหน้าแรก — วางที่แท็บ "ตรวจใบสั่งยา" หรือกด 📝 วางใบสั่ง</span>':`หน้าแรก ${n} รายการ${L?` · เกี่ยวข้องกับแท็บนี้ (${esc(L.g)}) ${k?`<b>${k}</b> รายการ`:'<span class="hint">ไม่มี</span>'}${k&&L.lastN!=null&&PF_SIG[t]===pfSig()?' · <span style="color:#15803d">✓ ดึงแล้ว</span>':PF_SIG[t]&&PF_SIG[t]!==pfSig()?' · <span style="color:#b45309">ใบสั่งหน้าแรกเปลี่ยน — กดดึงใหม่</span>':''}`:''}`; }
function pfPull(t,manual){ const L=PF_LINK[t]; if(!L) return; const rs=pfRows(t);
  if(!rs.length){ PF_SIG[t]=pfSig(); L.lastN=0; pfUpdate(t); if(manual) pfMsg(t,`ไม่พบ${L.g}ในใบสั่งหน้าแรก`); if(t==='pk') pfPk(); return; }
  if(L.to){ const ta=$(L.to); ta.value=rs.map(r=>r.raw).join('\n'); ta.dataset.pfAuto='1'; ta.dispatchEvent(new Event('input',{bubbles:true})); }
  try{ L.run&&L.run(); }catch(e){}
  PF_SIG[t]=pfSig(); L.lastN=rs.length; pfUpdate(t); pfMsg(t,`ดึง ${rs.length} รายการ`); }
function pfMsg(t,m){ const b=$('pf-'+t); if(b){ const e=b.querySelector('.pfmsg'); if(e) e.textContent=m; } }
function pfReset(t,quiet){ const L=PF_LINK[t]; if(L){ if(L.to&&$(L.to)){ $(L.to).value=''; delete $(L.to).dataset.pfAuto; $(L.to).dispatchEvent(new Event('input',{bubbles:true})); }
    try{ if(typeof L.clr==='function') L.clr(); else if(L.clr&&$(L.clr)) $(L.clr).click(); }catch(e){} PF_SIG[t]=pfSig(); L.lastN=null; }
  else { const sec=$('p-'+t); if(sec) sec.querySelectorAll('input[type=number],input:not([type]),input[type=text],textarea').forEach(el=>{ if(el.closest('.pfbar')) return; el.value=''; el.dispatchEvent(new Event('input',{bubbles:true})); }); }
  if(!quiet){ pfUpdate(t); pfMsg(t,'เริ่มใหม่แล้ว — กด ⤓ เพื่อดึงใบสั่งอีกครั้ง'); } }
function pfRead(t){ const b=$('pf-'+t), ta=b.querySelector('.pfpaste textarea'), raw=ta.value; if(!raw.trim()) return; const got=[];
  if(typeof demoClear==='function') demoClear();
  if(typeof EX_TXT!=='undefined'&&$('paste').value===EX_TXT){ $('paste').value=''; rows=[]; } // ล้างใบสั่งตัวอย่างก่อน
  const v=labParse(raw); let nl=0; LAB_DEF.forEach(([k,,,,fld])=>{ if(v[k]==null) return; const el=$(fld||('L_'+k)); if(el){ el.value=v[k]; nl++; } }); if(v.k!=null&&typeof kFromText==='function') kFromText(raw,true); if(nl) got.push(`Lab ${nl} ค่า`);
  const ls=joinLines(labStrip(raw).split(/\n/)).map(parseLine).filter(Boolean); if(ls.length){ rows=rows.concat(ls); $('paste').value=($('paste').value.trim()?$('paste').value.trim()+'\n':'')+ls.map(r=>r.raw).join('\n'); got.push(`ยา ${ls.length} รายการ (เพิ่มในหน้าแรกแล้ว)`); }
  renderRows(); ta.value=''; if(ls.length&&PF_LINK[t]) pfPull(t); else try{ PF_LINK[t]&&PF_LINK[t].run&&PF_LINK[t].run(); }catch(e){}
  if(t==='had'||t==='pk') { try{ t==='had'?renderHad():renderPk(); }catch(e){} }
  pfUpdate(t); pfMsg(t,got.length?'อ่านได้: '+got.join(' · '):'อ่านไม่ได้'); }
// เปิดแท็บ → ดึงอัตโนมัติเมื่อใบสั่งหน้าแรกเปลี่ยน และช่องยังว่าง/เคยดึงอัตโนมัติ (ไม่ทับข้อความที่ผู้ใช้พิมพ์เอง)
tab=(orig=>function(n){ orig(n); if(n==='screen') return; pfBar(n); const L=PF_LINK[n];
  if(L&&L.auto!==false&&PF_SIG[n]!==pfSig()&&(typeof rows!=='undefined'&&rows.length)){ const ta=L.to?$(L.to):null; if(!ta||!ta.value.trim()||ta.dataset.pfAuto==='1') pfPull(n); }
  pfUpdate(n); })(tab);
Object.values(PF_LINK).forEach(L=>{ const ta=L.to&&$(L.to); if(ta) ta.addEventListener('input',e=>{ if(e.isTrusted) delete ta.dataset.pfAuto; }); });
TABS.forEach(t=>{ if(t!=='screen') $('t-'+t).onclick=()=>tab(t); });
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{ if(e.target&&e.target.closest&&e.target.closest('.pfbar')) return; const cur=TABS.find(t=>$('p-'+t)&&!$('p-'+t).hidden); if(cur&&cur!=='screen'&&$('pf-'+cur)) pfUpdate(cur); }));
// ---- วางใบสั่งที่ไม่ซ้ำกับใบเดิมเลย → ถามว่าเป็นผู้ป่วยรายใหม่หรือไม่ (กันข้อมูล/Lab ของคนก่อนค้าง)
var pfPrevRaw=[];
doParse=(orig=>function(replace){ const prev=pfPrevRaw.slice(), wasEx=typeof EX_TXT!=='undefined'&&prev.join('\n')===joinLines(EX_TXT.split(/\n/)).join('\n');
  const r=orig.apply(this,arguments); const now=(typeof rows!=='undefined'?rows:[]).map(x=>x.raw.trim());
  const norm=s=>s.toUpperCase().replace(/\s+/g,' ').slice(0,30), ps=new Set(prev.map(norm)), overlap=now.some(x=>ps.has(norm(x)));
  const hasPt=['ageIn','bw','scr','allergy'].some(id=>$(id)&&$(id).value)||(typeof LAB_DEF!=='undefined'&&LAB_DEF.some(([k,,,,f])=>{ const el=$(f||('L_'+k)); return el&&el.value!==''; }));
  pfAsk(replace&&prev.length&&now.length&&!overlap&&!wasEx&&hasPt);
  pfPrevRaw=now; return r; })(doParse);
function pfAsk(show){ let b=$('newPtAsk'); if(!b){ const a=$('pasteSt')||$('paste'); if(!a) return; a.insertAdjacentHTML('afterend',`<div id="newPtAsk" class="band w" style="margin:6px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap" hidden><span>⚠ <b>ใบสั่งชุดใหม่ไม่ซ้ำกับชุดเดิมเลย</b> — เป็นผู้ป่วยรายใหม่หรือไม่? ข้อมูลผู้ป่วย/Lab ของคนก่อนยังค้างอยู่</span><button type="button" class="btn sm pri" id="npYes">ใช่ — ล้างข้อมูลผู้ป่วยเดิม (คงใบสั่งใหม่)</button><button type="button" class="btn sm" id="npNo">ไม่ใช่ (คนเดิม)</button></div>`); b=$('newPtAsk');
    $('npNo').onclick=()=>{ b.hidden=true; };
    $('npYes').onclick=()=>{ const t=$('paste').value; $('clearAll').click(); Object.keys(PF_LINK).forEach(x=>pfReset(x,true)); PF_SIG={}; if(typeof tbrReset==='function') tbrReset(); $('paste').value=t; pfPrevRaw=[]; doParse(true); b.hidden=true; $('ageIn').focus(); }; }
  b.hidden=!show; }
// ---- วางแล้วได้แต่ตัวเลข (มักเป็น AN/HN/เลขใบสั่งที่ติดมาจากคลิปบอร์ด) → ลบทันที + บอกวิธีคัดลอกคำสั่งยา
(function(){ const IDS=['paste','hPaste','lpPaste','dtPaste','xPaste','wOrder','vPaste','nePaste','cPaste','iPaste','mrA1','mrA2','mrB','mrC'];
  const onlyId=t=>/^[\s\d\-\/.,:]+$/.test(t)&&(t.replace(/\D/g,'').length>=6);
  IDS.forEach(id=>{ const ta=$(id); if(!ta) return; ta.addEventListener('input',e=>{ const t=ta.value; if(!t.trim()||!onlyId(t)) return;
    ta.value=''; ta.dispatchEvent(new Event('input',{bubbles:true})); let m=$(id+'IdMsg'); if(!m){ ta.insertAdjacentHTML('afterend',`<div id="${id}IdMsg" class="band w" style="margin:6px 0;font-size:13px"></div>`); m=$(id+'IdMsg'); }
    m.hidden=false; m.innerHTML=`⚠ <b>ที่วางเป็นตัวเลขอย่างเดียว</b> (น่าจะเป็น AN/HN/เลขใบสั่ง — ลบให้แล้ว ไม่เก็บ) · คลิปบอร์ดไม่มีข้อความคำสั่งยา<br>วิธีคัดลอกคำสั่งยา: ① ลากคลุมตั้งแต่ชื่อยาถึงวิธีใช้ แล้วกด Ctrl+C (ไม่ใช่ดับเบิลคลิกที่เลข) · ② ถ้าหน้า HIS คัดลอกไม่ได้: กด <b>Win+Shift+S</b> ครอบตารางยา แล้วกด Ctrl+V ในช่องนี้ (อ่านจากรูป) <button type="button" class="btn sm" style="margin-left:6px">ปิด</button>`;
    m.querySelector('button').onclick=()=>{ m.hidden=true; }; setTimeout(()=>{ if(m) m.hidden=true; },20000); }); }); })();
