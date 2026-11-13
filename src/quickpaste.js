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
  [['ptPaste','ptParse'],['labPaste','labParse']].forEach(([ta,btn])=>{ $(ta).addEventListener('paste',()=>setTimeout(()=>{ if(!$(ta).value.trim()) return; $(btn).click(); if(ta==='labPaste') $('labPaste').value=''; qpSum(); },0)); });
  $('labParse').addEventListener('click',()=>setTimeout(()=>{ $('labPaste').value=''; qpSum(); },0));
  $('ptParse').addEventListener('click',()=>setTimeout(qpSum,0));
  const aside=document.querySelector('aside.pt'); aside.addEventListener('input',e=>{ if(e.target&&/ptPaste|labPaste/.test(e.target.id)) return; qpSum(); }); aside.addEventListener('change',()=>qpSum()); aside.addEventListener('click',e=>{ if(e.target.closest('#sexM,#sexF,#labClear')) setTimeout(qpSum,0); });
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#clearAll,[data-pf="newpt"],#npYes')) setTimeout(qpSum,50); });
  if(typeof renderRows==="function") renderRows=(o=>function(){ const r=o.apply(this,arguments); try{ qpSum(); }catch(e){} return r; })(renderRows);
  qpSum(); })();
