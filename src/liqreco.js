/* ===== liqreco.js — แท็บยาน้ำเด็ก: ขนาดแนะนำตามน้ำหนักจาก "ตารางยาเด็ก" ที่หน้าคัดกรองใช้ (KB peds · ตาราง รพ.มค 2568)
 · เลือกยา/เปลี่ยนน้ำหนัก → คำนวณ mg/kg → mg/ครั้ง → ml/ครั้ง (ปัดให้ตวงได้) และเติมขนาดให้อัตโนมัติ (จนกว่าผู้ใช้จะแก้เอง)
 · เริ่มต้นที่ Paracetamol syrup แทน Vit D3 */
function lrFreq(note){ const m=String(note||'').match(/q\s*(\d+)(?:\s*-\s*(\d+))?\s*h/i); if(!m) return null; return {a:+m[1],b:m[2]?+m[2]:null}; }
function lrRound(ml,lo,hi){ const st=ml<1?0.1:ml<10?0.5:1, r=x=>Math.round(x/st)*st; let v=r(ml); if(lo!=null&&v<lo-1e-9) v=Math.ceil(lo/st-1e-9)*st; if(hi!=null&&v>hi+1e-9) v=Math.floor(hi/st+1e-9)*st; return Math.round(v*100)/100; }
function lrReco(){ const x=liqCur, p=x&&x.kb&&x.kb.peds, bw=+$('lBw').value||+$('bw').value||null;
  if(!x) return null;
  if(x.kb&&typeof PED_BAND!=='undefined'&&PED_BAND[x.kb.id]){ if(!(bw>0)) return {msg:'ใส่น้ำหนัก (kg) เพื่อคำนวณขนาดแนะนำ'}; const b=pedBand(x.kb.id,bw), ml=Math.round(b.mg/x.conc*100)/100;
    return {ml,mg:b.mg,F:2,fq:{a:12},prn:false,src:b.B.src,S:[`① น้ำหนัก ${fmtN(bw)} kg`,`② ตาราง: ${b.lab} → ${fmtN(b.mg)} mg/ครั้ง ${b.B.tx}`,`③ ${fmtN(b.mg)} mg ÷ ${fmtN(x.conc)} mg/ml = ${fmtMl(ml)} ml/ครั้ง วันละ 2 ครั้ง`,`④ รักษา 5 วัน = ${fmtN(Math.round(ml*10*100)/100)} ml${x.bottle?` → ${Math.ceil(ml*10/x.bottle-1e-9)} ขวด (${x.bottle} ml)`:''}`,`⑤ ${b.B.px}`]}; }
  if(!p) return {msg:'ยานี้ยังไม่มีขนาดเด็กในฐาน — กรอกขนาดที่สั่งเอง'};
  if(p.type==='age') return {msg:`ขนาดตามอายุ: ${p.note}`,age:true};
  if(!(bw>0)) return {msg:'ใส่น้ำหนัก (kg) เพื่อคำนวณขนาดแนะนำ'};
  const ag=+$('age').value; if(bw>=40||(ag>=15&&$('ageU').value!=='m')) return {msg:`น้ำหนัก ${fmtN(bw)} kg${ag?` อายุ ${ag} ปี`:''} — ใช้ขนาดผู้ใหญ่ (ตารางยาเด็กใช้กับ <40 kg)${x.kb.adult&&x.kb.adult.txt?' · '+x.kb.adult.txt:''}`}; if(!(x.conc>0)||!p.kg) return {msg:p.note||''};
  const [a,b]=p.kg, fq=lrFreq(p.note), u=x.u, src=p.src||SRC_PED, S=[];
  let F, prn=x.kb.id==='para'||x.kb.id==='ibu'&&false; const LF=liqF();
  if(p.type==='dose'){ F=fq?24/fq.a:LF.F; if(x.kb.id==='para') p.maxDose=p.maxDose||1000; }
  else { F=fq?Math.round(24/(fq.b||fq.a)):(LF.F||1); if(!(F>0)) F=1; }
  const perLo=p.type==='dose'?a*bw:a*bw/F, perHi0=p.type==='dose'?b*bw:b*bw/F;
  let perHi=perHi0; if(p.max) perHi=Math.min(perHi,p.max/F); if(p.maxDose) perHi=Math.min(perHi,p.maxDose);
  const mlLo=perLo/x.conc, mlHi=perHi/x.conc, mid=(Math.min(perLo,perHi)+perHi)/2, ml=lrRound(mid/x.conc,mlLo,mlHi), mg=ml*x.conc;
  const rg=(m,n,d=1)=>{ const f=v=>fmtN(Math.round(v*10**d)/10**d); return Math.abs(m-n)<1e-9?f(m):`${f(m)}–${f(n)}`; };
  S.push(`① น้ำหนัก ${fmtN(bw)} kg`);
  S.push(`② ขนาดตามตาราง: ${rg(a,b,2)} ${u}/kg/${p.type==='dose'?'ครั้ง':'วัน'}${p.note?' — '+p.note:''}`);
  if(p.type==='day') S.push(`③ ต่อวัน ${rg(a*bw,b*bw)} ${u}${p.max?` (สูงสุด ${fmtN(p.max)} ${u}/วัน)`:''} ÷ ${F} ครั้ง (ทุก ${24/F} ชม.) = ${rg(perLo,perHi)} ${u}/ครั้ง`);
  else S.push(`③ ต่อครั้ง ${rg(perLo,perHi)} ${u}${perHi<perHi0?' (จำกัดตามขนาดสูงสุด)':''}`);
  S.push(`④ ปริมาตร: ÷ ${fmtN(x.conc)} ${u}/ml = ${rg(mlLo,mlHi,2)} ml/ครั้ง`);
  S.push(`⑤ แนะนำ ${fmtMl(ml)} ml/ครั้ง (= ${fmtN(Math.round(mg*10)/10)} ${u}${p.type==='day'?` × ${F} = ${fmtN(Math.round(mg*F*10)/10)} ${u}/วัน = ${fmtN(Math.round(mg*F/bw*100)/100)} ${u}/kg/วัน`:` = ${fmtN(Math.round(mg/bw*100)/100)} ${u}/kg/ครั้ง`})${fq?` ทุก ${fq.a}${fq.b?'-'+fq.b:''} ชม.`:''}`);
  const tb=typeof pedTblRow==='function'?pedTblRow(x.kb.id,bw,''):[]; tb.forEach(t=>S.push(`⑥ ตาราง รพ. (${t.t.lab}): ${t.col} kg → ${t.v} ${t.t.u}/ครั้ง ${t.near}`.trimEnd()));
  return {ml,mg,F,fq,prn,S,src}; }
function lrApply(R){ if(!R||R.ml==null) return; $('lDU').value='ml'; $('lDose').value=R.ml;
  if(R.prn){ $('lMode').value='prn'; liqFreqOpts(); const key=R.fq?(R.fq.b?`${R.fq.a}-${R.fq.b}`:String(R.fq.a)):'4-6'; const k=LIQ_PRN.findIndex(o=>o[2]===key); if(k>=0) $('lF').value=k; }
  else { if($('lMode').value==='prn'){ $('lMode').value='reg'; liqFreqOpts(); } const k=LIQ_REG.findIndex(o=>Math.abs(+o[0]-R.F)<0.01); if(k>=0) $('lF').value=k; } }
renderLiq=(orig=>function(){ orig.apply(this,arguments); const out=$('lOut'); if(!out) return; const R=lrReco(); if(!R) return;
  const box=`<div class="band" style="margin:0 0 10px;background:var(--surface);border-left:4px solid #ec4899"><b>ขนาดแนะนำตามน้ำหนัก</b> <span class="hint">(${esc(R.src||SRC_PED)})</span>${R.S?`<div style="white-space:pre-line;margin-top:4px;font-size:13.5px">${esc(R.S.join('\n'))}</div><button type="button" class="btn sm pri" id="lrUse" style="margin-top:6px">ใช้ขนาดแนะนำ ${fmtMl(R.ml)} ml</button>`:`<div class="hint" style="margin-top:4px">${esc(R.msg)}</div>`}</div>`;
  out.insertAdjacentHTML('afterbegin',box); const bt=$('lrUse'); if(bt) bt.onclick=()=>{ lrApply(R); $('lDose').dataset.manual='1'; renderLiq(); }; })(renderLiq);
// เติมขนาดแนะนำอัตโนมัติเมื่อเลือกยา/เปลี่ยนน้ำหนัก (จนกว่าผู้ใช้แก้ขนาดเอง)
function lrAuto(){ if($('lDose').dataset.manual==='1') return; const R=lrReco(); if(R&&R.ml!=null){ lrApply(R); renderLiq(); } }
pickLiq=(orig=>function(){ $('lDose').dataset.manual=''; orig.apply(this,arguments); lrAuto(); })(pickLiq);
['lDose','lDU'].forEach(id=>$(id).addEventListener('input',e=>{ if(e.isTrusted) $('lDose').dataset.manual='1'; }));
['lBw','bw'].forEach(id=>$(id).addEventListener('input',()=>setTimeout(lrAuto,0)));
// เริ่มต้นที่ Paracetamol syrup
(function(){ const pa=LIQ.find(x=>x.kb&&x.kb.id==='para'&&/120\s*MG/i.test(x.name))||LIQ.find(x=>x.kb&&x.kb.id==='para'); if(!pa) return;
  $('lDrug').value=pa.code+' · '+pa.name; $('lMode').value='prn'; liqFreqOpts(); $('lDays').value=''; $('lDose').value=''; pickLiq(); })();
