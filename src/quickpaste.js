/* ===== quickpaste.js — แผงผู้ป่วย: วางข้อมูลผู้ป่วย + Lab ต่อกันด้านบน · อ่านทันทีเมื่อวาง · สรุปค่าที่อ่านได้ให้เห็นในที่เดียว ===== */
const QP_RNG={scr:[0.5,1.2],bun:[7,20],wbc:[4000,11000],neu:[40,75],hb:[12,17],hct:[36,50],plt:[150000,450000],alb:[3.5,5],ast:[0,40],alt:[0,40],tbil:[0,1.2],dbil:[0,0.3],ca:[8.5,10.5],phos:[2.5,4.5],mgl:[1.8,2.4],na:[135,145],k:[3.5,5],hco3:[22,28],ph:[7.35,7.45],lact:[0,2],inr:[0,1.2],cpk:[0,200],uric:[2.5,7],alp:[40,130],egfrIn:[60,999],crclIn:[60,999]};
function qpVal(k,fld){ const el=$(fld||('L_'+k)); return el&&el.value!==''?+el.value:null; }
function qpSum(){ const box=$('ptSum'); if(!box) return; const P=[], age=$('ageIn').value;
  P.push(`<span class="chip">${typeof sex!=='undefined'&&sex==='F'?'หญิง':'ชาย'}</span>`);
  if(age) P.push(`<span class="chip">อายุ ${age} ${({y:'ปี',m:'เดือน',d:'วัน'})[$('ageU').value]}</span>`);
  if($('bw').value) P.push(`<span class="chip">BW ${$('bw').value} kg</span>`); else P.push('<span class="chip hi">ไม่มีน้ำหนัก</span>');
  if($('ht').value) P.push(`<span class="chip">สูง ${$('ht').value} cm</span>`);
  if($('mode').value) P.push(`<span class="chip hi">${$('mode').value}</span>`);
  const al=$('allergy').value.trim(); if(al) P.push(`<span class="chip hi">แพ้: ${esc(al)}</span>`);
  const L=[]; LAB_DEF.forEach(([k,nm,u,,fld])=>{ const v=qpVal(k,fld); if(v==null) return; const r=QP_RNG[k], c=r?(v>r[1]?' hi':v<r[0]?' lo':''):'';
    L.push(`<span class="chip${c}" title="${esc(nm)} ${u||''}">${esc(nm.replace('Total Bilirubin','TB').replace('Direct Bilirubin','DB').replace('Hemoglobin','Hb').replace('Hematocrit','Hct').replace('Creatinine','Cr').replace('Platelet','Plt').replace('Neutrophil','Neu').replace('Lymphocyte','Lym').replace('Eosinophil','Eos').replace('Magnesium','Mg').replace('Phosphorus','PO4').replace('Calcium','Ca').replace('Sodium','Na').replace('Potassium','K').replace('Albumin','Alb'))} ${v>=1000?fmtN(v):v}${c===' hi'?'↑':c===' lo'?'↓':''}</span>`); });
  const pt=typeof getPt==='function'?getPt():{}; if(pt.crcl!=null&&$('crclIn').value==='') L.push(`<span class="chip">CrCl (คำนวณ) ${Math.round(pt.crcl)}</span>`);
  box.innerHTML=`<div><b class="k">ผู้ป่วย</b> ${P.join('')}</div>`+(L.length?`<div><b class="k">Lab ${L.length} ค่า</b> ${L.join('')}</div>`:'<div class="hint">ยังไม่มี Lab — วางในช่อง ② ได้เลย</div>'); }
(function(){ if(!$('ptSum')) return;
  // อ่านทันทีเมื่อวาง (ข้อความ) — ช่องว่างพร้อมวางชุดต่อไป
  const done=(ta,n)=>{ if(!$(ta+'St')) $(ta).insertAdjacentHTML('afterend',`<div class="pstate" id="${ta}St" hidden></div>`); const c=$(ta+'St'); $(ta).classList.remove('pasted'); if(!c) return; c.hidden=false; c.innerHTML=`<b>✓ วางสำเร็จ อ่านแล้ว ${n} บรรทัด</b><span class="ps2"> · ช่องว่างพร้อมวางชุดต่อไป</span>`; };
  [['ptPaste','ptParse'],['labPaste','labParse']].forEach(([ta,btn])=>{ const go=()=>{ const v=$(ta).value; if(!v.trim()) return; const n=v.split(/\n/).filter(l=>l.trim()).length; $(btn).click(); $(ta).value=''; done(ta,n); qpSum(); };
    $(ta).addEventListener('paste',()=>setTimeout(go,0)); $(btn).addEventListener('click',()=>{ const v=$(ta).value; if(v.trim()) setTimeout(()=>done(ta,v.split(/\n/).filter(l=>l.trim()).length),0); },true); });
  $('labParse').addEventListener('click',()=>setTimeout(()=>{ $('labPaste').value=''; $('labPaste').classList.remove('pasted'); qpSum(); },0));
  $('ptParse').addEventListener('click',()=>setTimeout(qpSum,0));
  const aside=document.querySelector('aside.pt'); aside.addEventListener('input',e=>{ if(e.target&&/ptPaste|labPaste/.test(e.target.id)) return; qpSum(); }); aside.addEventListener('change',()=>qpSum()); aside.addEventListener('click',e=>{ if(e.target.closest('#sexM,#sexF,#labClear')) setTimeout(qpSum,0); });
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#clearAll,[data-pf="newpt"],#npYes')) setTimeout(qpSum,50); });
  if(typeof renderRows==="function") renderRows=(o=>function(){ const r=o.apply(this,arguments); try{ qpSum(); }catch(e){} return r; })(renderRows);
  qpSum(); })();

// ---- ตัวกั้นแผงผู้ป่วย: ลากปรับความกว้าง · ปุ่มซ่อน/แสดง · จำค่าไว้ในเบราว์เซอร์นี้
(function(){ const sp=$('ptSplit'), W=document.querySelector('.wrap'); if(!sp||!W) return; const MIN=240, MAX=()=>Math.min(720,Math.round(innerWidth*0.55)), DEF=320;
  const ls=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const setW=w=>{ w=Math.max(MIN,Math.min(MAX(),Math.round(w))); W.style.setProperty('--ptw',w+'px'); return w; };
  const setC=c=>{ W.classList.toggle('ptc',c); $('ptTog').textContent=c?'▶':'◀'; $('ptTog').title=c?'แสดงแผงข้อมูลผู้ป่วย':'ซ่อนแผงข้อมูลผู้ป่วย'; };
  const w0=+ls('ipd.ptw'); if(w0) setW(w0); setC(ls('ipd.ptc')==='1');
  let st=null;
  sp.addEventListener('pointerdown',e=>{ if(e.target.closest('button')||W.classList.contains('ptc')) return; st={x:e.clientX,w:document.querySelector('aside.pt').getBoundingClientRect().width}; sp.classList.add('drag'); sp.setPointerCapture(e.pointerId); document.body.style.userSelect='none'; });
  sp.addEventListener('pointermove',e=>{ if(!st) return; setW(st.w+(e.clientX-st.x)); });
  const end=()=>{ if(!st) return; st=null; sp.classList.remove('drag'); document.body.style.userSelect=''; ls('ipd.ptw',parseInt(getComputedStyle(W).getPropertyValue('--ptw'))); };
  sp.addEventListener('pointerup',end); sp.addEventListener('pointercancel',end);
  sp.addEventListener('dblclick',e=>{ if(e.target.closest('button')) return; setW(DEF); ls('ipd.ptw',DEF); });
  sp.addEventListener('keydown',e=>{ if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight') return; const cur=parseInt(getComputedStyle(W).getPropertyValue('--ptw'))||DEF; ls('ipd.ptw',setW(cur+(e.key==='ArrowRight'?20:-20))); e.preventDefault(); }); sp.tabIndex=0;
  $('ptTog').onclick=()=>{ const c=!W.classList.contains('ptc'); setC(c); ls('ipd.ptc',c?'1':'0'); };
})();
