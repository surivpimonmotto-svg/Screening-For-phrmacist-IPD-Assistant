/* อายุ: กรอกเป็น ปี / เดือน / วัน → เก็บเป็นปีใน #age */
function ageSync(){ const v=$('ageIn').value, u=$('ageU').value; $('age').value=v===''?'':+(u==='d'?v/365:u==='m'?v/12:+v).toFixed(5); $('age').dispatchEvent(new Event('input',{bubbles:true})); }
function ageSyncIn(){ const a=$('age').value; if(a===''){ $('ageIn').value=''; return; } const y=+a; if(y<1/12){ $('ageU').value='d'; $('ageIn').value=Math.round(y*365); } else if(y<2&&Math.abs(y*12-Math.round(y*12))<0.01&&y<1){ $('ageU').value='m'; $('ageIn').value=Math.round(y*12); } else { $('ageU').value='y'; $('ageIn').value=+y.toFixed(2); } }
function ageTxt(){ const v=$('ageIn')?$('ageIn').value:$('age').value; if(v==='') return ''; const u=$('ageU')?$('ageU').value:'y'; return `${v} ${u==='d'?'วัน':u==='m'?'เดือน':'ปี'}`; }
/* ===== UI ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LVL_TXT={flag:'ปรับ',warn:'ทบทวน',ok:'OK',info:'ข้อมูล'};
const ST_TXT={flag:'ต้อง consult',warn:'ทบทวน',ok:'OK',none:'ไม่มีกฎ'};
const UNITS=[['mg','mg'],['mcg','mcg'],['mEq','mEq'],['g','g'],['unit','เม็ด/หน่วย'],['ml','ml'],['mgkg','mg/kg']];
const FREQ_OPTS=[['6','q4h'],['4','q6h / QID'],['3','q8h / TID'],['2','q12h / BID'],['1.3333','q18h'],['1','q24h / OD'],['0.6667','q36h'],['0.5','q48h'],['0.3333','q72h'],['0.4286','3 ครั้ง/สัปดาห์'],['0.2857','2 ครั้ง/สัปดาห์'],['0.1429','สัปดาห์ละครั้ง'],['5','วันละ 5 ครั้ง']];
const SORTED=[...KB].sort((a,b)=>a.name.localeCompare(b.name));
let sex='M', rows=[], noteAll=false;

const EX_PT={age:72,bw:55,ht:165,scr:2.0,k:4.1};
const EX_TXT=`CEFIXIME 100 MG CAP. 2x2 pc
FORTUM 1 G. INJ. 2 g iv q 8 hr
SIMVASTATIN 20 MG 1x1 hs
METFORMIN 500 MG 1x2 pc
ETHAMBUTOL 400 MG TAB 2x1
WARFARIN 3 MG TAB 1x1 hs
ENALAPRIL 5 MG TABLET 1x2
LO-SAR-TAN 50 MG TAB. 1x1
AMOXY+CLAVULANATE 1G TAB. 1x2 pc`;

function getPt(){return calcPatient({sex,age:$('age').value,bw:$('bw').value,ht:$('ht').value,scr:$('scr').value,mode:$('mode').value,wbasis:$('wbasis').value==='abw'?'none':$('wbasis').value,
  inr:$('inr').value,k:$('k').value,mgl:$('mgl').value,crclIn:$('crclIn').value,egfrIn:$('egfrIn').value,allergy:$('allergy').value,preg:$('preg').checked,tb:$('tb').checked,lab:labRead()});}
function labRead(){const o={};LAB_EXTRA.forEach(([k])=>{const el=$('L_'+k);if(el&&el.value!=='')o[k]=+el.value;});return o;}

function renderCalc(pt){
  const parts=[];
  if(pt.dial){parts.push(`<div class="band w"><b>${pt.dial}</b> — ใช้กฎ ${pt.dial} แทนช่วง CrCl</div>`);}
  if(pt.isPed){
    parts.push(`<div class="big"><span class="n">${pt.schwartz!=null?r0(pt.schwartz):'–'}</span><span class="u">ml/min/1.73m²</span></div><div class="lab hint">eGFR (bedside Schwartz) · ผู้ป่วยเด็ก &lt;15 ปี ใช้กฎขนาดยาตามน้ำหนัก</div>`);
  } else {
    const his=pt.crclSrc==='HIS';
    parts.push(`<div><div class="hint">${his?'CrCl จากหน้าจอ HIS':'CrCl (Cockcroft-Gault)'}</div><div class="big"><span class="n">${pt.crcl!=null?r1(pt.crcl):'–'}</span><span class="u">ml/min</span></div><div class="hint">${his?(pt.crclCalc!=null?`คำนวณเอง (CG) ได้ ${r1(pt.crclCalc)} ml/min`:'ใช้ค่าที่กรอก'):pt.crcl!=null?`ใช้น้ำหนัก ${r1(pt.dw)} kg (${esc(pt.wlab)})`:'ต้องมี อายุ + น้ำหนัก + SCr หรือกรอก CrCl จาก HIS'}</div></div>`);
    if(his&&pt.crclCalc!=null&&Math.abs(pt.crclCalc-pt.crcl)>Math.max(5,0.2*pt.crcl)) parts.push(`<div class="band w">CrCl จาก HIS ต่างจากที่คำนวณเกิน 20% — ตรวจน้ำหนัก/SCr ที่ใช้</div>`);
  }
  const kv=[[pt.egfrSrc==='HIS'?'eGFR (HIS)':'eGFR CKD-EPI 2021',pt.egfr!=null?r0(pt.egfr):'–'],['IBW',pt.ibw?r1(pt.ibw)+' kg':'–'],['AdjBW',pt.adjbw&&pt.obese?r1(pt.adjbw)+' kg':'–'],['BMI',pt.bmi?r1(pt.bmi):'–'],['BSA (Mosteller)',pt.bsa?pt.bsa.toFixed(2)+' m²':'–']];
  parts.push(`<dl class="kv">${kv.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`);
  if(pt.obese&&!pt.isPed) parts.push(`<div class="band w">น้ำหนักเกิน 130% IBW — ใช้ ${esc(pt.wlab)} คำนวณ</div>`);
  if(+pt.age>=65) parts.push(`<div class="band">ผู้สูงอายุ ≥65 ปี — ตรวจยาเฝ้าระวังผู้สูงอายุ</div>`);
  if(+pt.age>=15&&+pt.age<18) parts.push(`<div class="band w">อายุ 15-17 ปี — Cockcroft-Gault ออกแบบสำหรับผู้ใหญ่ ใช้ด้วยดุลยพินิจ</div>`);
  const la=labAlerts(pt.lab||{},pt);
  if(la.length) parts.push(`<div class="labal">${la.map(([l,t])=>`<div class="band ${l==='flag'?'f':l==='warn'?'w':''}">${esc(t)}</div>`).join('')}</div>`);
  const ls=$('labSum'); if(ls){ const L=pt.lab||{}; ls.textContent=[L.anc!=null?'ANC '+fmtN(Math.round(L.anc)):'',L.plt!=null?'Plt '+fmtN(L.plt):'',L.cacorr!=null?'cCa '+(Math.round(L.cacorr*10)/10):''].filter(Boolean).join(' · '); }
  const gs=(id,txt,c)=>{const el=$('gs-'+id); if(el){el.textContent=txt||''; el.className='gs'+(c?' '+c:'');}}; const Lb=pt.lab||{};
  gs('renal',pt.dial?pt.dial:pt.crcl!=null?`CrCl ${r1(pt.crcl)}`:'',pt.dial||(pt.crcl!=null&&pt.crcl<30)?'f':pt.crcl!=null&&pt.crcl<60?'w':'');
  gs('coag',[pt.inr!=null?`INR ${pt.inr}`:'',Lb.plt!=null?`Plt ${fmtN(Math.round(Lb.plt/1000))}k`:''].filter(Boolean).join(' · '),(pt.inr>3||(Lb.plt!=null&&Lb.plt<50000))?'f':(pt.inr>2||(Lb.plt!=null&&Lb.plt<100000))?'w':'');
  { const mx=Math.max(Lb.ast||0,Lb.alt||0); gs('liver',mx?`AST/ALT ${Lb.ast??'–'}/${Lb.alt??'–'}`:Lb.tbil!=null?`T.bil ${Lb.tbil}`:'',mx>200?'f':mx>120||(Lb.tbil>3)?'w':''); }
  gs('lyte',[pt.k!=null?`K ${pt.k}`:'',Lb.na!=null?`Na ${Lb.na}`:''].filter(Boolean).join(' · '),(pt.k!=null&&(pt.k<3||pt.k>=6))||(Lb.na!=null&&(Lb.na<125||Lb.na>155))?'f':(pt.k!=null&&(pt.k<3.5||pt.k>5))||(Lb.na!=null&&(Lb.na<135||Lb.na>145))?'w':'');
  gs('cbc',Lb.anc!=null?`ANC ${fmtN(Math.round(Lb.anc))}`:'',Lb.anc!=null&&Lb.anc<500?'f':Lb.anc!=null&&Lb.anc<1500?'w':'');
  $('calc').innerHTML=parts.join('');
}

function unitOpts(sel){return UNITS.map(([v,l])=>`<option value="${v}"${v===sel?' selected':''}>${l}</option>`).join('')}
function freqOpts(F){const has=FREQ_OPTS.some(([v])=>F!=null&&Math.abs(+v-F)<0.002);
  return (F==null?'<option value="" selected>? ความถี่</option>':'')+(has||F==null?'':`<option value="${F}" selected>${esc(freqLabel(F))}</option>`)+FREQ_OPTS.map(([v,l])=>`<option value="${v}"${F!=null&&Math.abs(+v-F)<0.002?' selected':''}>${l}</option>`).join('');}
function drugOpts(id){return `<option value=""${!id?' selected':''}>— ไม่พบในฐาน —</option>`+SORTED.map(d=>`<option value="${d.id}"${d.id===id?' selected':''}>${esc(d.name)}</option>`).join('')}

function renderRows(){
  const pt=getPt(); renderCalc(pt);
  const host=$('rows');
  if(!rows.length){host.innerHTML='<div class="empty">ยังไม่มีรายการยา — วางข้อความคำสั่งใช้ยาแล้วกด "แยกรายการ" หรือคีย์จาก scan order</div>';$('sum').innerHTML='';buildNote([],pt);return;}
  const evs=rows.map(r=>evaluate(r,pt,rows));
  const cnt={flag:0,warn:0,ok:0,none:0}; evs.forEach(e=>cnt[e.status]++);
  $('sum').innerHTML=`<span class="pill flag">ต้อง consult ${cnt.flag}</span><span class="pill warn">ทบทวน ${cnt.warn}</span><span class="pill ok">OK ${cnt.ok}</span><span class="pill none">ไม่มีกฎ ${cnt.none}</span>`;
  host.innerHTML=rows.map((r,i)=>{const e=evs[i],d=e.drug;
    const forms=d&&d.forms?`<select class="ctl formsel" data-i="${i}" data-k="formIdx" aria-label="รูปแบบ/ความแรง">${r.formIdx<0?'<option value="-1" selected>เลือกความแรง</option>':''}${d.forms.map((f,j)=>`<option value="${j}"${j===r.formIdx?' selected':''}>${esc(f[1])}</option>`).join('')}</select>`:'<span class="hint formsel">—</span>';
    const calc=e.hadOut?`= ${fmtN(e.hadOut.dose)} ${esc(e.hadOut.doseU||'')} · ${esc(e.hadOut.concTxt||fmtN(e.hadOut.conc)+' '+(d.unit||'mg')+'/ml')} · ${r.had.rate} ml/h`:r.had?'':e.D!=null?`= ${fmtN(e.D)} ${esc(d?d.unit:'mg')}/ครั้ง${e.T!=null?` · ${fmtN(e.T)}/วัน`:''}${d&&d.kgDose&&pt.dw?` · ${fmtN(e.D/pt.dw)} mg/kg/ครั้ง`:''}`:'';
    return `<article class="row ${e.status}">
      <div class="rh"><span class="pill ${e.status}">${ST_TXT[e.status]}</span><span class="nm">${esc(d?d.name:e.master?e.master[1]:'ไม่พบยาในฐาน')}</span>${e.master?`<span class="code" title="รหัสยา HIS">${esc(e.master[0])}</span>`:''}<span class="calcline">${calc}</span></div>
      ${r.raw?`<div class="raw">${esc(r.raw)}</div>`:''}
      <div class="ed">
        <select class="ctl drugsel" data-i="${i}" data-k="drugId" aria-label="ยา">${drugOpts(r.drugId)}</select>
        ${forms}
        <input class="ctl" type="number" step="any" value="${esc(r.doseVal)}" data-i="${i}" data-k="doseVal" aria-label="ขนาดต่อครั้ง">
        <select class="ctl" data-i="${i}" data-k="doseUnit" aria-label="หน่วย">${unitOpts(r.doseUnit)}</select>
        <select class="ctl" data-i="${i}" data-k="F" aria-label="ความถี่">${freqOpts(r.F)}</select>
        <button class="x" type="button" data-del="${i}" aria-label="ลบรายการ">✕</button>
      </div>
      ${e.items.length?`<ul class="msgs">${e.items.map(m=>`<li><span class="tag ${m.lvl}">${LVL_TXT[m.lvl]}</span><span>${esc(m.txt)}</span></li>`).join('')}</ul>`:''}
    </article>`}).join('');
  buildNote(evs,pt);
}

let noteHtml='';
function cnPref(k,v){ try{ if(v===undefined) return localStorage.getItem('ipd_cn_'+k)||''; localStorage.setItem('ipd_cn_'+k,v); }catch(e){ return ''; } }
function buildNote(evs,pt){
  if(!rows.length){$('note').value='';noteHtml='';return}
  const n=new Date(), p2=x=>String(x).padStart(2,'0'), dt=`${p2(n.getDate())}/${p2(n.getMonth()+1)}/${n.getFullYear()+543} เวลา ${p2(n.getHours())}:${p2(n.getMinutes())} น.`;
  const ward=$('cnWard').value.trim(), who=`${$('cnTitle').value} ${$('cnName').value.trim()||'..............................'}`, tel=$('cnTel').value.trim();
  const L=pt.lab||{}, fx=v=>fmtN(Math.round(v*100)/100);
  const ptl=[`${sex==='F'?'หญิง':'ชาย'} อายุ ${ageTxt()||'–'} · น้ำหนัก ${$('bw').value||'–'} kg${$('ht').value?` · ส่วนสูง ${$('ht').value} cm`:''}`];
  if(pt.dial) ptl.push(`การบำบัดทดแทนไต: ${pt.dial}`);
  else if(pt.isPed) ptl.push(`eGFR (Schwartz) ${pt.schwartz!=null?r0(pt.schwartz):'–'} ml/min/1.73m²`);
  else ptl.push(`${$('scr').value?`SCr ${$('scr').value} mg/dL → `:''}CrCl ${pt.crcl!=null?r1(pt.crcl):'–'} ml/min (${pt.crclSrc==='HIS'?'จาก HIS':'Cockcroft-Gault'})${pt.egfr!=null?` · eGFR ${r0(pt.egfr)}`:''}`);
  const lb=[pt.k!=null&&`K ${pt.k}`,pt.mg!=null&&`Mg ${pt.mg}`,pt.inr!=null&&`INR ${pt.inr}`,L.anc!=null&&`ANC ${fmtN(Math.round(L.anc))}`,L.plt!=null&&`Plt ${fmtN(L.plt)}`,(L.ast!=null||L.alt!=null)&&`AST/ALT ${L.ast??'–'}/${L.alt??'–'}`,L.tbil!=null&&`T.bil ${L.tbil}`,L.alb!=null&&`Alb ${L.alb}`].filter(Boolean);
  if(lb.length) ptl.push('Lab: '+lb.join(' · '));
  ptl.push(`ประวัติแพ้ยา: ${$('allergy').value.trim()||'ไม่มี/ไม่ทราบ'}${pt.preg?' · ตั้งครรภ์/ให้นมบุตร':''}`);
  const probs=[];
  rows.forEach((r,i)=>{ const e=evs[i]; if(!noteAll&&!['flag','warn'].includes(e.status)) return;
    const d=e.drug, mm=e.master, nm=d?d.name:mm?mm[1]:r.raw.slice(0,50), u=d?unitTxt(d):'mg';
    const req=e.status==='flag'?'ขอพิจารณาปรับ':e.status==='warn'?'ขอ confirm':e.status==='ok'?'เหมาะสม':'ไม่มีกฎในฐาน';
    const dose=e.D!=null&&r.F!=null?`${fmtN(e.D)} ${u}/ครั้ง × ${freqLabel(r.F)} = ${fmtN(e.T)} ${u}/วัน`:e.D!=null?`${fmtN(e.D)} ${u}/ครั้ง`:'';
    const why=e.items.filter(m=>noteAll?m.lvl!=='info':(m.lvl==='flag'||m.lvl==='warn')).map(m=>m.txt);
    const rec=e.sugg&&(e.sugg.rx||e.sugg.txt)?`${e.sugg.where?e.sugg.where.replace(/\s+/g,' ')+': ':''}${e.sugg.rx||e.sugg.txt}`:'';
    const alt=e.items.some(m=>/^ประวัติแพ้/.test(m.txt)&&m.lvl!=='info')&&typeof xaAlt==='function'?xaAlt($('allergy').value,nm+' '+r.raw):null;
    probs.push({nm,req,lvl:e.status,raw:r.raw,dose,why,rec,src:d&&d.src?d.src:'',alt:alt&&alt.txt}); });
  // แจ้งเพื่อทราบ: ประวัติแพ้ยาที่ประเมินแล้วใช้ได้ (แพ้ข้ามต่ำ)
  const infos=[]; rows.forEach((r,i)=>{ const e=evs[i]; const al=e.items.filter(m=>m.lvl==='info'&&/^ประวัติแพ้/.test(m.txt)); if(!al.length||['flag'].includes(e.status)) return;
    const d=e.drug, mm=e.master, nm=d?d.name:mm?mm[1]:r.raw.slice(0,50);
    al.forEach(m=>{ const mt=m.txt.match(/^ประวัติแพ้ (.+?) → (.+?): (.*)$/); const BL=d&&typeof XA!=='undefined'&&XA.some(x=>x[2]==='bl'&&x[1].test(nm));
      const alt=typeof xaAlt==='function'?xaAlt($('allergy').value,nm+' '+r.raw):null; infos.push({nm,raw:r.raw,a:mt?mt[1]:'',why:mt?mt[3]:m.txt,bl:BL,alt:alt&&alt.txt}); }); });
  const allergyTxt=$('allergy').value.trim();
  const ask=probs.some(p=>p.lvl==='flag')?'จึงเรียนมาเพื่อโปรดพิจารณาปรับขนาด/ทบทวนคำสั่งใช้ยาตามข้อเสนอข้างต้น':probs.some(p=>p.lvl==='warn')?'จึงเรียนมาเพื่อโปรด confirm คำสั่งใช้ยาดังกล่าว':infos.length?'จึงเรียนมาเพื่อโปรดทราบ':'ทุกรายการผ่านเกณฑ์ในฐานกฎ';
  const LN='━'.repeat(34);
  const T=[LN,'ใบปรึกษาแพทย์เรื่องการใช้ยา (Pharmacist Consult)',`${ward?'หอผู้ป่วย '+ward+' · ':''}วันที่ ${dt}`,LN,'','■ ข้อมูลผู้ป่วย',...ptl.map(x=>'  • '+x),'',`■ ปัญหาที่พบ (${probs.length} รายการ)`];
  probs.forEach((p,i)=>{ T.push('',`${i+1}) ${p.nm} — ${p.req}`); T.push(`   คำสั่งยา   : ${p.raw}`); if(p.dose) T.push(`   ขนาดที่สั่ง : ${p.dose}`);
    p.why.forEach((w,j)=>T.push(`   ${j?'          ':'เหตุผล     '}: ${w}`)); if(p.rec) T.push(`   ข้อเสนอ    : ${p.rec}`); if(p.alt) T.push(`   ทางเลือก   : ${p.alt}`); if(p.src) T.push(`   อ้างอิง     : ${p.src}`); });
  if(!probs.length) T.push(infos.length?'  ไม่พบปัญหาขนาดยา':'  ทุกรายการผ่านเกณฑ์ในฐานกฎ');
  if(infos.length){ T.push('',`■ แจ้งเพื่อทราบ — ประวัติแพ้ยา (${infos.length} รายการ)`);
    infos.forEach((x,i)=>{ T.push('',`${i+1}) ${x.nm} — แจ้งเพื่อทราบ (ไม่ต้องเปลี่ยนยา)`,`   ประวัติแพ้  : ${allergyTxt||x.a}`,`   คำสั่งยา   : ${x.raw}`,`   การประเมิน : ${x.why}`);
      if(x.bl) T.push(`   เหตุผล     : การแพ้ข้ามระหว่าง penicillin กับ cephalosporin ขึ้นกับความคล้ายของ side chain (R1) มากกว่า beta-lactam ring`,`               เมื่อ R1 ต่างกัน อุบัติการณ์แพ้ข้าม <1–2% · ผู้ที่แพ้ penicillin แบบไม่รุนแรง (เช่น MP rash, urticaria`,`               ที่ไม่ใช่ anaphylaxis/SCAR) ใช้ cephalosporin ที่ R1 ต่างได้โดยไม่ต้องทดสอบก่อน`,`               (AAAAI/ACAAI Drug Allergy Practice Parameter 2022)`);
      T.push(`   ข้อเสนอ    : ให้ยาได้ตามคำสั่ง · เฝ้าระวังอาการแพ้หลังให้ยาครั้งแรก (ผื่น คัน บวม หายใจลำบาก) หากเกิดอาการให้หยุดยาและแจ้งแพทย์`); if(x.alt) T.push(`   ทางเลือก   : (หากแพทย์ต้องการเปลี่ยน) ${x.alt}`); }); }
  T.push('',ask,'',`ลงชื่อ ${who}`,`เภสัชกร งานบริการเภสัชกรรมผู้ป่วยใน กลุ่มงานเภสัชกรรม รพ.มหาสารคาม${tel?' · โทร '+tel:''}`,LN);
  $('note').value=T.join('\n');
  const C={flag:'#b91c1c',warn:'#b45309',ok:'#15803d',none:'#475569'};
  noteHtml=`<div style="font-family:Sarabun,Tahoma,sans-serif;font-size:15px;line-height:1.55;color:#111">
<div style="font-size:18px;font-weight:700;border-bottom:2px solid #1d4ed8;padding-bottom:4px">ใบปรึกษาแพทย์เรื่องการใช้ยา (Pharmacist Consult)</div>
<div style="color:#475569">${ward?'หอผู้ป่วย '+esc(ward)+' · ':''}วันที่ ${dt}</div>
<div style="font-weight:700;margin-top:10px">ข้อมูลผู้ป่วย</div><ul style="margin:2px 0 6px 18px;padding:0">${ptl.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
<div style="font-weight:700">ปัญหาที่พบ (${probs.length} รายการ)</div>
${probs.map((p,i)=>`<div style="border-left:4px solid ${C[p.lvl]};padding:4px 10px;margin:8px 0;background:#f8fafc"><div><b>${i+1}) ${esc(p.nm)}</b> — <b style="color:${C[p.lvl]}">${esc(p.req)}</b></div>
<table style="border-collapse:collapse;font-size:14px"><tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">คำสั่งยา</td><td>${esc(p.raw)}</td></tr>${p.dose?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ขนาดที่สั่ง</td><td><b>${esc(p.dose)}</b></td></tr>`:''}${p.why.length?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">เหตุผล</td><td>${p.why.map(w=>esc(w)).join('<br>')}</td></tr>`:''}${p.rec?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ข้อเสนอ</td><td><b style="color:#1d4ed8">${esc(p.rec)}</b></td></tr>`:''}${p.alt?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ทางเลือก</td><td><b style="color:#047857">${esc(p.alt)}</b></td></tr>`:''}${p.src?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">อ้างอิง</td><td style="font-size:12.5px">${esc(p.src)}</td></tr>`:''}</table></div>`).join('')}
${infos.length?`<div style="font-weight:700;margin-top:10px">แจ้งเพื่อทราบ — ประวัติแพ้ยา</div>${infos.map((x,i)=>`<div style="border-left:4px solid #1d4ed8;padding:4px 10px;margin:8px 0;background:#eff6ff"><div><b>${i+1}) ${esc(x.nm)}</b> — <b style="color:#1d4ed8">แจ้งเพื่อทราบ (ไม่ต้องเปลี่ยนยา)</b></div><table style="border-collapse:collapse;font-size:14px"><tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ประวัติแพ้</td><td>${esc(allergyTxt||x.a)}</td></tr><tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">คำสั่งยา</td><td>${esc(x.raw)}</td></tr><tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">การประเมิน</td><td>${esc(x.why)}</td></tr>${x.bl?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">เหตุผล</td><td>การแพ้ข้ามระหว่าง penicillin กับ cephalosporin ขึ้นกับความคล้ายของ side chain (R1) มากกว่า beta-lactam ring เมื่อ R1 ต่างกัน อุบัติการณ์แพ้ข้าม &lt;1–2% · ผู้ที่แพ้ penicillin แบบไม่รุนแรง (ไม่ใช่ anaphylaxis/SCAR) ใช้ cephalosporin ที่ R1 ต่างได้โดยไม่ต้องทดสอบก่อน <span style="font-size:12.5px">(AAAAI/ACAAI Drug Allergy Practice Parameter 2022)</span></td></tr>`:''}<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ข้อเสนอ</td><td><b style="color:#1d4ed8">ให้ยาได้ตามคำสั่ง · เฝ้าระวังอาการแพ้หลังให้ยาครั้งแรก (ผื่น คัน บวม หายใจลำบาก) หากเกิดอาการให้หยุดยาและแจ้งแพทย์</b></td></tr>${x.alt?`<tr><td style="vertical-align:top;padding:1px 8px 1px 0;color:#475569;white-space:nowrap">ทางเลือก</td><td><b style="color:#047857">(หากแพทย์ต้องการเปลี่ยน) ${esc(x.alt)}</b></td></tr>`:''}</table></div>`).join('')}`:''}<p style="margin:10px 0">${esc(ask)}</p><div style="text-align:right">ลงชื่อ ${esc(who)}<br><span style="font-size:13px;color:#475569">เภสัชกร งานบริการเภสัชกรรมผู้ป่วยใน กลุ่มงานเภสัชกรรม รพ.มหาสารคาม${tel?' · โทร '+esc(tel):''}</span></div></div>`;
}
function copyRich(html,text,okEl){ const done=m=>{ if(okEl){ okEl.textContent=m; setTimeout(()=>okEl.textContent='',2200);} };
  try{ if(window.ClipboardItem&&navigator.clipboard.write&&html){ navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]).then(()=>done('คัดลอกแล้ว'),()=>navigator.clipboard.writeText(text).then(()=>done('คัดลอกแล้ว (ข้อความ)'),()=>done('คัดลอกไม่ได้ — เลือกข้อความแล้วกด Ctrl+C'))); return; }
    navigator.clipboard.writeText(text).then(()=>done('คัดลอกแล้ว'),()=>done('คัดลอกไม่ได้ — กด Ctrl+C')); }catch(e){ done('คัดลอกไม่ได้ — กด Ctrl+C'); } }
function printHtml(html,landscape){ let pa=document.getElementById('printArea'); if(!pa){pa=document.createElement('div');pa.id='printArea';document.body.appendChild(pa);} pa.innerHTML=html;
  if(landscape){ const st=document.createElement('style'); st.id='pgL'; st.textContent='@page{size:A4 landscape;margin:10mm}'; document.head.appendChild(st); const rm=()=>{const s=document.getElementById('pgL'); if(s) s.remove();}; window.addEventListener('afterprint',rm,{once:true}); setTimeout(rm,4000); }
  window.print(); }
/* events: rows */
$('rows').addEventListener('change',ev=>{const t=ev.target,i=+t.dataset.i,k=t.dataset.k; if(k==null||isNaN(i))return; const r=rows[i];
  if(k==='F') r.F=t.value===''?null:+t.value;
  else if(k==='formIdx') r.formIdx=+t.value;
  else if(k==='drugId'){r.drugId=t.value; const d=KB.find(x=>x.id===r.drugId); r.formIdx=d&&d.forms?(d.forms.findIndex(f=>r.strength!=null&&f[2]===r.strength)):-1; if(d&&d.forms&&r.formIdx<0&&d.forms.length===1)r.formIdx=0;}
  else r[k]=t.value;
  if(r.issues) r.issues=r.issues.filter(x=>!(k==='F'&&/ความถี่/.test(x))&&!(k==='doseVal'&&/จำนวน/.test(x)));
  renderRows();});
$('rows').addEventListener('click',ev=>{const b=ev.target.closest('[data-del]'); if(!b)return; rows.splice(+b.dataset.del,1); renderRows();});

/* events: input modes */
function setMode(paste){$('mPaste').setAttribute('aria-pressed',paste);$('mKey').setAttribute('aria-pressed',!paste);$('pasteBox').hidden=!paste;$('keyBox').hidden=paste;}
$('mPaste').onclick=()=>setMode(true); $('mKey').onclick=()=>setMode(false);
function doParse(replace){const ls=joinLines($('paste').value.split(/\n/)).map(parseLine).filter(Boolean); rows=replace?ls:rows.concat(ls); renderRows();}
$('parseRep').onclick=()=>doParse(true); $('parseAdd').onclick=()=>doParse(false);
$('clearRows').onclick=()=>{rows=[];renderRows();};
// เริ่มเคสใหม่: ล้างข้อมูลผู้ป่วย + ข้อความ + รายการยา เพื่อไม่ให้ค่าของผู้ป่วยคนก่อนค้าง
$('clearAll').onclick=()=>{
  ['age','ageIn','bw','ht','scr','crclIn','egfrIn','inr','k','mgl','allergy','paste','hBw','lBw'].forEach(id=>{const el=$(id); if(el) el.value='';});
  $('mode').value=''; $('wbasis').value='auto'; $('preg').checked=false; $('tb').checked=false;
  sex='M'; $('sexM').setAttribute('aria-pressed',true); $('sexF').setAttribute('aria-pressed',false);
  rows=[]; const ex=document.getElementById('exNote'); if(ex) ex.remove();
  $('ageU').value='y'; renderRows(); renderHad(); renderLiq(); $('ageIn').focus();
};
$('dmList').innerHTML=DM.map(m=>`<option value="${esc(m[0]+' · '+m[1])}">`).join('')+SORTED.filter(d=>!DM.some(m=>m[8]===d.id)).map(d=>`<option value="${esc(d.name)}">`).join('');
$('kUnit').innerHTML=unitOpts('mg'); $('kFreq').innerHTML=FREQ_OPTS.map(([v,l])=>`<option value="${v}"${v==='2'?' selected':''}>${l}</option>`).join('');
$('kAdd').onclick=()=>{const v=$('kDrug').value.trim(); if(!v) return;
  const code=v.split(' · ')[0], m=DM.find(x=>x[0]===code), kd=SORTED.find(d=>d.name===v);
  const base=m?m[1]:kd?kd.name:v; const r=parseLine(base); if(!r) return;
  r.F=+$('kFreq').value; r.issues=[]; r.parsed=true;
  const st=+$('kSt').value, per=$('kStPer').value;
  if(st>0) r.stated={v:st,per,raw:`${st} mg/kg/${per}`};
  if($('kDose').value!==''){ r.doseVal=$('kDose').value; r.doseUnit=$('kUnit').value; }
  else if(st>0){ r.fromStated=true; r.doseUnit='mgkg'; r.doseVal=per==='day'?Math.round(st/r.F*1000)/1000:st; }
  else { r.doseVal=''; }
  const iv=+$('kIvVol').value, im=+$('kIvMin').value; if(iv>0||im>0) r.iv={vol:iv||null,min:im||null,rate:null};
  r.raw=base+' (คีย์จาก scan)'+(st>0?` · ${st} mg/kg/${per}`:'')+(iv>0?` · ผสม ${iv} ml`:'')+(im>0?` นาน ${im} นาที`:'');
  ['kSt','kIvVol','kIvMin'].forEach(id=>$(id).value='');
  if(kd&&!r.drugId) r.drugId=kd.id;
  rows.push(r); $('kDose').value=''; $('kDrug').value=''; renderRows();};
$('kDrug').addEventListener('change',()=>{const m=DM.find(x=>x[0]===$('kDrug').value.split(' · ')[0]); if(m&&m[7]) $('kUnit').value=m[7][0]==='ml'?'ml':'unit';});

/* events: patient */
function setSex(s){sex=s;$('sexM').setAttribute('aria-pressed',s==='M');$('sexF').setAttribute('aria-pressed',s==='F');renderRows();renderHad();}
$('sexM').onclick=()=>setSex('M'); $('sexF').onclick=()=>setSex('F');
['age','bw','ht','scr','crclIn','egfrIn','inr','k','mgl','allergy'].forEach(id=>$(id).addEventListener('input',()=>{renderRows(); if(id==='bw'){ $('hBw').value=$('bw').value; renderHad(); }}));
['mode','wbasis','preg','tb'].forEach(id=>$(id).addEventListener('change',renderRows));

/* note */
function setNote(all){noteAll=all;$('nProb').setAttribute('aria-pressed',!all);$('nAll').setAttribute('aria-pressed',all);renderRows();}
$('nProb').onclick=()=>setNote(false); $('nAll').onclick=()=>setNote(true);
$('copyNote').onclick=()=>copyRich(noteHtml,$('note').value,$('toast'));
$('printNote').onclick=()=>{ if(noteHtml) printHtml(noteHtml); };
[['cnName','name'],['cnTitle','title'],['cnTel','tel'],['cnWard','ward']].forEach(([id,k])=>{ const el=$(id); const v=cnPref(k); if(v&&k!=='ward') el.value=v; el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{ if(k!=='ward') cnPref(k,el.value); renderRows(); }); });

/* tabs */
const TABS=['screen','had','liq','dex','opi','pk','tl','dtl','wf','cmt','crrt','adr','rca','ref','kb'];
function tab(n){TABS.forEach(t=>{$('t-'+t).setAttribute('aria-selected',t===n);$('p-'+t).hidden=t!==n;});}
TABS.forEach(t=>$('t-'+t).onclick=()=>tab(t));

/* HAD */
$('hDrug').innerHTML=Object.entries(HAD).map(([k,h])=>`<option value="${k}">${h.name} (${h.ampTxt})</option>`).join('');
$('hInd').innerHTML=HEP_IND.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join('');
const HAD_EX={ne:[8,125,15],adr:[10,100,10],dopa:[250,250,10],dobu:[250,250,10],nica:[10,100,25],fenta:[500,100,5],kcl:[40,1000,80],mg:[20,460,25],hep:[10000,100,10]};
function loadHadEx(){const k=$('hDrug').value,e=HAD_EX[k]; $('hAmt').value=e[0];$('hVol').value=e[1];$('hRate').value=e[2];$('hAmp').value=+(e[0]/HAD[k].amp).toFixed(2);}
function hadNote(k,h,o,cu){
  const st=o.checks.some(c=>c.lvl==='flag')?'ต้อง consult':o.checks.some(c=>c.lvl==='warn')?'ทบทวน':'OK (check2)';
  const amt=$('hAmt').value, amp=$('hAmp').value, vol=$('hVol').value, rate=$('hRate').value, bw=$('hBw').value;
  const lineSel=$('hLine'), line=lineSel&&lineSel.value?lineSel.options[lineSel.selectedIndex].text:'';
  const S=(typeof HAD_STD!=='undefined'&&HAD_STD[k])||{}, ic={ok:'✓',warn:'⚠',flag:'✗',info:'•'};
  const L=[`■ ${h.name} — ผล: ${st}`,
   `  สูตรผสม : ${amt} ${h.u}${amp?` (${amp} amp)`:''} ใน ${vol} ml${line?` · สาย ${line}`:''}`,
   `  Rate    : ${rate} ml/h`,
   `  Dose    : ${o.dose!=null?fmtN(o.dose)+' '+(o.doseU||''):'–'}${bw?` (BW ${bw} kg)`:''}`,
   `  Conc    : ${o.concTxt||fmtN(o.conc)+' '+cu}`,
   `  จ่าย     : ${o.ampDispense??'–'} amp/วัน${o.bottle&&o.bottle[0]?` (${o.bottle[0]})`:''}`,
   '','  ผลตรวจ',...o.checks.map(c=>`   ${ic[c.lvl]||'•'} ${c.txt}`)];
  if(S.usual||S.maxDose||S.maxConc) L.push('','  มาตรฐาน',`   Usual dose : ${S.usual||'ยังไม่มีข้อมูล'}`,`   Max dose   : ${S.maxDose||'ยังไม่มีข้อมูล'}`,`   Max conc   : ${S.maxConc||'ยังไม่มีข้อมูล'}`);
  L.push('','  ผู้ตรวจ ............................ (check2)');
  return L.join('\n'); }
function renderHad(){
  const k=$('hDrug').value,h=HAD[k];
  $('hAmtLab').textContent=`ปริมาณยาในขวด (${h.u})`; $('hInfo').textContent=[h.ampTxt,h.dil,h.note].filter(Boolean).join(' · ');
  $('hLineW').hidden=!(k==='kcl'||HAD[k].periph!=null); $('hLine').querySelector('[value=restrict]').hidden=k!=='kcl'; if(k!=='kcl'&&$('hLine').value==='restrict') $('hLine').value='peripheral'; $('hIndW').hidden=k!=='hep';
  const pt=getPt(); if(!$('hBw').value&&$('bw').value) $('hBw').value=$('bw').value;
  const o=hadCalc(k,{bw:$('hBw').value,amt:$('hAmt').value,vol:$('hVol').value,rate:$('hRate').value,line:$('hLine').value,hepInd:$('hInd').value,crcl:pt.dial?0:pt.crcl});
  if(o.conc==null){$('hOut').innerHTML='<div class="empty">กรอกปริมาณยา ปริมาตร และ rate</div>';return}
  const cu=h.u==='mcg'?'mcg/ml':h.u==='mEq'?'mEq/ml':h.u==='g'?'g/ml':h.u==='unit'?'unit/ml':'mg/ml';
  const kv=[['ความเข้มข้น',o.concTxt||`${fmtN(o.conc)} ${cu}`],['ต่อชั่วโมง',`${fmtN(o.perH)} ${h.u}/h`],['ต่อวัน (24 ชม.)',`${fmtN(o.perDay)} ${h.u}`],['สารน้ำต่อวัน',`${r0(o.volDay)} ml`]];
  if(o.maxRate) kv.push([`Rate สูงสุดที่ ${h.range[1]} mcg/kg/min`,`${r1(o.maxRate)} ml/h`]);
  if(o.bottle) kv.push(['เตรียมต่อวัน (ประหยัดยาสุด)',o.bottle[0]]);
  if(o.alt) kv.push(['เทียบ',o.alt.txt]);
  kv.push(['จ่ายยาต่อวัน',`${o.ampDispense} amp`]);
  $('hOut').innerHTML=`<h2>ผลคำนวณ</h2>
   <div class="big" style="margin-bottom:12px"><span class="n">${fmtN(o.dose)}</span><span class="u">${esc(o.doseU||'')}</span></div>
   <dl class="kv" style="margin-bottom:12px">${kv.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>
   <ul class="msgs">${o.checks.map(m=>`<li><span class="tag ${m.lvl}">${LVL_TXT[m.lvl]}</span><span>${esc(m.txt)}</span></li>`).join('')}</ul>
   <p class="hint" style="margin:12px 0 4px">ข้อความ note</p>
   <div class="inrow" style="justify-content:flex-end;margin:-26px 0 4px"><button class="btn sm pri" id="hCopy" type="button">คัดลอก</button><span class="toast" id="hToast"></span></div>
   <div class="note" id="hNote" style="min-height:auto;white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px;line-height:1.6">${esc(hadNote(k,h,o,cu))}</div>`;
  $('hCopy').onclick=()=>copyRich('',hadNote(k,h,o,cu),$('hToast'));
}
$('hDrug').addEventListener('change',()=>{loadHadEx();renderHad();});
$('hAmp').addEventListener('input',()=>{const a=+$('hAmp').value;if(a>0)$('hAmt').value=+(a*HAD[$('hDrug').value].amp).toFixed(3);renderHad();});
['hAmt','hVol','hRate','hBw'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='hAmt'){const a=+$('hAmt').value;$('hAmp').value=a>0?+(a/HAD[$('hDrug').value].amp).toFixed(2):'';}renderHad();}));
['hLine','hInd'].forEach(id=>$(id).addEventListener('change',renderHad));


/* ===== ยาน้ำเด็ก: แปลงขนาด ↔ ml และจำนวนขวด ===== */
function bottleOf(name){const ms=[...name.matchAll(/(?<![\/\d.])(\d+(?:\.\d+)?)\s*ML\b(?!\s*\/)/gi)]; return ms.length?+ms[ms.length-1][1]:null;}
const LIQ=DM.map(m=>{const kb=m[8]?KB.find(k=>k.id===m[8]):null; let conc=null,u='mg';
  const looksLiq=/syr|susp|drop|elixir|solution|sus\.|ml/i.test(m[1])&&!/inj|infusion|nss|\bd5|เบอร์|ล้าง/i.test(m[1]+m[4]);
  if(!looksLiq) return null;
  if(kb&&kb.forms){const f=kb.noMasterStrength?kb.forms.find(f=>f[3]==='ml'&&f[0].test(m[1])):(m[7]&&m[7][0]==='ml'?null:kb.forms.find(f=>f[3]==='ml'&&f[0].test(m[1]))); if(f){conc=f[2];u=kb.unit||'mg';}}
  if(conc==null&&m[7]&&m[7][0]==='ml'){conc=m[7][1];u='mg';}
  if(conc==null){const iu=m[1].match(/(\d+(?:,\d+)?)\s*IU\s*\/\s*ML/i); if(iu){conc=+iu[1].replace(',','');u='IU';}}
  return {code:m[0],name:m[1],conc,u:/^mg/.test(u)&&u!=='mg Fe'?'mg':u,bottle:bottleOf(m[1]),kb};}).filter(Boolean);
$('liqList').innerHTML=LIQ.map(x=>`<option value="${esc(x.code+' · '+x.name)}">`).join('');
const LIQ_REG=FREQ_OPTS.map(([v,l])=>[v,l,v]);
const LIQ_PRN=[['6','ทุก 4 ชั่วโมง','4'],['6','ทุก 4-6 ชั่วโมง','4-6'],['4','ทุก 6 ชั่วโมง','6'],['4','ทุก 6-8 ชั่วโมง','6-8'],['3','ทุก 8 ชั่วโมง','8'],['2','ทุก 12 ชั่วโมง','12'],['1','วันละ 1 ครั้ง','24']];
function liqFreqOpts(){ const prn=$('lMode').value==='prn'; const cur=$('lF').value; const L=prn?LIQ_PRN:LIQ_REG;
  $('lF').innerHTML=L.map(([v,l,k],i)=>`<option value="${i}">${l}</option>`).join(''); $('lF').value=prn?'1':String(LIQ_REG.findIndex(x=>x[0]==='1'));
  document.querySelectorAll('[data-prn]').forEach(x=>x.hidden=!prn); if(prn){ const isPara=liqCur&&liqCur.kb&&liqCur.kb.id==='para'; $('lMax').value=isPara?5:Math.floor(+LIQ_PRN[+$('lF').value][0]); } }
const liqF=()=>{ const prn=$('lMode').value==='prn', o=(prn?LIQ_PRN:LIQ_REG)[+$('lF').value]||LIQ_REG[0]; const mx=+$('lMax').value; return {prn,F:prn&&mx>0?Math.min(mx,+o[0]):+o[0],label:o[1],maxCount:prn?(mx>0?Math.min(mx,+o[0]):+o[0]):null}; };
$('lMode').addEventListener('change',()=>{liqFreqOpts();renderLiq();});
$('lF').addEventListener('change',()=>{ if($('lMode').value==='prn'&&!(liqCur&&liqCur.kb&&liqCur.kb.id==='para')) $('lMax').value=Math.floor(+LIQ_PRN[+$('lF').value][0]); });
['lSym','lMax'].forEach(id=>$(id).addEventListener('input',()=>renderLiq()));
liqFreqOpts();
let liqCur=null;
function pickLiq(){const c=$('lDrug').value.split(' · ')[0]; liqCur=LIQ.find(x=>x.code===c)||null;
  if(liqCur){ $('lConc').value=liqCur.conc??''; $('lCU').value=['mg','IU','unit','mg Fe'].includes(liqCur.u)?liqCur.u:'mg'; $('lBottle').value=liqCur.bottle??''; }
  if($('lMode').value==='prn'&&liqCur&&liqCur.kb&&liqCur.kb.id==='para') $('lMax').value=5;
  renderLiq();}
function fmtMl(ml){return ml<1?ml.toFixed(2).replace(/0$/,''):ml<10?(Math.round(ml*10)/10).toString():r1(ml)}
function renderLiq(){
  const conc=+$('lConc').value, cu=$('lCU').value, dose=+$('lDose').value, du=$('lDU').value, days=+$('lDays').value, bottle=+$('lBottle').value; const LF=liqF(), F=LF.F;
  const bw=+$('lBw').value||+$('bw').value||null, age=+$('age').value;
  if(!$('lBw').value&&$('bw').value) $('lBw').value=$('bw').value;
  const out=$('lOut');
  if(!(conc>0&&dose>0)){out.innerHTML='<div class="empty">เลือกยา แล้วกรอกขนาดที่สั่งต่อครั้ง</div>';return}
  let amt, ml; const uu=cu;
  if(du==='amt'){amt=dose; ml=dose/conc;}
  else if(du==='ml'){ml=dose; amt=dose*conc;}
  else if(du==='tsp'){ml=dose*5; amt=ml*conc;}
  else { if(!bw){out.innerHTML='<div class="empty">ใส่น้ำหนักเพื่อคำนวณขนาดต่อ kg</div>';return} amt=dose*bw; ml=amt/conc; }
  const mlDay=ml*F, total=days>0?mlDay*days:null, nb=total&&bottle>0?Math.ceil(total/bottle-1e-9):null, lasts=bottle>0&&mlDay>0?bottle/mlDay:null;
  const name=liqCur?liqCur.name:'ยาน้ำ', fl=LF.prn?`เวลา${$('lSym').value||'มีอาการ'} ${LF.label} (ไม่เกินวันละ ${LF.maxCount} ครั้ง)`:LF.label;
  const tsp=ml>=1.25?` (≈ ${r1(ml/5)} ช้อนชา)`:'';
  const kv=[['ต่อครั้ง',`${fmtN(amt)} ${uu} = ${fmtMl(ml)} ml${tsp}`],[LF.prn?`ต่อวัน (สูงสุด ${LF.maxCount} ครั้ง)`:'ต่อวัน',`${LF.prn?'ไม่เกิน ':''}${fmtN(amt*F)} ${uu} = ${fmtMl(mlDay)} ml`]];
  const ageBased=liqCur&&liqCur.kb&&liqCur.kb.peds&&liqCur.kb.peds.type==='age';
  if(bw&&!ageBased) kv.push(['ต่อ kg',`${fmtN(amt/bw)} ${uu}/kg/ครั้ง · ${fmtN(amt*F/bw)} ${uu}/kg/วัน`]);
  if(ageBased) kv.push(['วิธีคิดขนาด','ตามอายุ เป็น IU/วัน (ไม่คิดต่อ kg)']);
  if(total!=null) kv.push([`รวม ${days} วัน${LF.prn?' (ถ้าใช้สูงสุดทุกวัน)':''}`,`${fmtMl(total)} ml`]);
  if(lasts) kv.push([`1 ขวด ${bottle} ml ใช้ได้`,`${Math.floor(lasts)} วัน`]);
  if(nb) kv.push(['จำนวนขวดที่จ่าย',`${nb} ขวด`]);
  // check via rule engine
  const checks=[];
  if(liqCur&&liqCur.kb){ const pt=getPt(); const row={raw:'',drugId:liqCur.kb.id,formIdx:-1,doseVal:+amt.toFixed(4),doseUnit:'mg',F,issues:[],prn:LF.prn};
    const ev=evaluate(row,{...pt,dw:bw||pt.dw,bw:bw||pt.bw},[row]); ev.items.filter(i=>!/⚑|ไม่ต้องปรับตามไต$|^ใช้เมื่อมีอาการ/.test(i.txt)).forEach(i=>checks.push(i)); }
  if(ageBased&&nb&&nb>3) checks.push({lvl:'warn',txt:`ต้องจ่าย ${nb} ขวด — ขนาดรักษาด้วย D3 drop ${conc} IU/ml ใช้ยามาก พิจารณาปรึกษาแพทย์เรื่องรูปแบบยาที่เหมาะกว่า`});
  if(LF.prn) checks.push({lvl:'info',txt:`ใช้เมื่อมีอาการ (PRN) — ตรวจขนาดที่ความถี่สูงสุด ${LF.maxCount} ครั้ง/วัน · จำนวนขวดคิดแบบใช้สูงสุดทุกวัน อาจจ่ายน้อยกว่านี้ตามดุลยพินิจ`});
  if(ml<0.1) checks.push({lvl:'warn',txt:`ปริมาตร ${fmtMl(ml)} ml น้อยมาก — ตวงด้วย syringe 1 ml ให้แม่นยำ`});
  else if(ml<1) checks.push({lvl:'info',txt:`ตวง ${fmtMl(ml)} ml ด้วย syringe 1 ml หรือหลอดหยดที่มีขีด`});
  const sticker=`${name} ${LF.prn?`กินครั้งละ ${fmtMl(ml)} ml${tsp} ${fl}`:`กิน ${fmtMl(ml)} ml${tsp} ${fl}`} (${fmtN(amt)} ${uu}/ครั้ง)${nb?` · จ่าย ${nb} ขวด`:''}${total!=null?` (${days} วัน ใช้ ${fmtMl(total)} ml)`:''}`;
  out.innerHTML=`<h2>ผลคำนวณ</h2>
   <div class="big" style="margin-bottom:12px"><span class="n">${fmtMl(ml)}</span><span class="u">ml / ครั้ง</span></div>
   <dl class="kv" style="margin-bottom:12px">${kv.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>
   ${checks.length?`<ul class="msgs">${checks.map(m=>`<li><span class="tag ${m.lvl}">${LVL_TXT[m.lvl]}</span><span>${esc(m.txt)}</span></li>`).join('')}</ul>`:''}
   <p class="hint" style="margin:12px 0 4px">ข้อความฉลาก/note</p><div class="note" style="min-height:auto">${esc(sticker)}</div>`;
}
$('lDrug').addEventListener('change',pickLiq);
['lConc','lDose','lDays','lBottle','lBw'].forEach(id=>$(id).addEventListener('input',renderLiq));
['lCU','lDU','lF'].forEach(id=>$(id).addEventListener('change',renderLiq));


/* KB table */
function bandsTxt(v){const b=(v.bands||[]).map(x=>`<div><span class="calcline">${v.basis==='egfr'?'eGFR':'CrCl'} ${x.hi>=999?'≥'+x.lo:x.lo===0?'<'+x.hi:x.lo+'–'+(x.hi-1)}</span> ${esc(x.txt)}</div>`).join('');
  const m=['HD','CAPD','CRRT'].filter(k=>v[k]).map(k=>`<div><span class="calcline">${k}</span> ${esc(v[k].txt)}</div>`).join(''); return b+m;}
let kbMode='rules';
function setKb(m){kbMode=m;$('kbR').setAttribute('aria-pressed',m==='rules');$('kbG').setAttribute('aria-pressed',m==='gap');renderKB();}
function renderKB(){ const mapped=DM.filter(m=>m[8]).length, peMapped=DM.filter(m=>m[8]).reduce((a,m)=>a+m[9],0), peAll=DM.reduce((a,m)=>a+m[9],0);
  $('kbsum').textContent=`บัญชียา IPD ${DM.length.toLocaleString()} รายการ · เชื่อมกับกฎแล้ว ${mapped} รายการ · ครอบคลุม PE ปี 2569 ที่ชื่อตรงบัญชี ${peMapped}/${peAll} ครั้ง (${Math.round(100*peMapped/peAll)}%)`;
  if(kbMode==='gap') return renderGap();
  renderRules();}
function renderGap(){const q=$('kbq').value.trim().toLowerCase();
  const list=DM.filter(m=>!m[8]&&(!q||(m[0]+' '+m[1]+' '+m[2]+' '+m[6]).toLowerCase().includes(q))).sort((a,b)=>b[9]-a[9]||a[1].localeCompare(b[1])).slice(0,400);
  const fl=f=>[f.includes('H')?'HAD':'',f.includes('C')?'เคมีบำบัด':'',f.includes('N')?'ยาเสพติด':''].filter(Boolean).join(', ');
  $('kbt').innerHTML=`<thead><tr><th>รหัส</th><th>ชื่อยา</th><th>กลุ่ม</th><th>Flag</th><th>PE 2569</th></tr></thead><tbody>${list.map(m=>`<tr><td class="m">${esc(m[0])}</td><td>${esc(m[1])}</td><td class="hint">${esc(m[6])}</td><td class="vf">${fl(m[5])}</td><td class="m">${m[9]||''}</td></tr>`).join('')}</tbody>`;}
function renderRules(){const q=$('kbq').value.trim().toLowerCase();
  const list=SORTED.filter(d=>!q||d.name.toLowerCase().includes(q)||d.id.includes(q));
  $('kbt').innerHTML=`<thead><tr><th>ยา</th><th>กฎ</th><th>แหล่งอ้างอิง</th></tr></thead><tbody>${list.map(d=>{
    let rule='';
    const vs=variantsOf(d); if(vs.length) rule+=vs.map(v=>(v.name?`<div><b>${esc(v.name)}</b></div>`:'')+bandsTxt(v)).join('<hr style="border:0;border-top:1px dashed var(--line);margin:4px 0">');
    if(d.tb){ if(d.tb.adult){const a=d.tb.adult; rule+=`<div><b>TB ผู้ใหญ่</b> ${a.kg?a.kg.join('-')+' mg/kg':''} max ${a.max}${a.bandsWt?' · ตาราง '+a.bandsWt.map(b=>`${b[0]===0?'<'+b[1]:b[1]>=999?'≥'+b[0]:b[0]+'-'+(b[1]-1)} kg: ${b[2]==null?'ตามน้ำหนัก':b[2]+(b[3]?' (หรือตามน้ำหนัก)':'')}`).join(', '):''}${a.renal3x?` · CrCl ${a.renalLt?'<':'≤'}30: ขนาดเดิม 3 ครั้ง/สัปดาห์, HD ให้หลังฟอกเท่านั้น`:''}${a.renalNo?' · CrCl ≤30: ไม่ปรับ':''}</div>`;}
      if(d.tb.ped){const p=d.tb.ped; rule+=`<div><b>TB เด็ก</b> ${p.kg?p.kg.join('-')+' mg/kg/day':''} max ${p.max}</div>`;} }
    if(d.peds) rule+=`<div><b>เด็ก</b> ${esc(d.peds.note)}</div>`;
    if(d.adult) rule+=`<div>${esc(d.adult.txt)}</div>`;
    if(d.warn) rule+=d.warn.map(w=>`<div>${esc(w.msg)}</div>`).join('');
    if(d.elderly) rule+=`<div><b>≥65 ปี</b> ${esc(d.elderly)}</div>`;
    if(d.special&&!rule) rule=`<div>${esc(d.note||'ตรวจเงื่อนไขพิเศษ / ใช้แท็บ HAD')}</div>`;
    return `<tr><td><b>${esc(d.name)}</b>${d.verify?`<div class="vf">⚑ ${esc(d.verify)}</div>`:''}</td><td>${rule}</td><td class="hint">${esc(d.src||'')}</td></tr>`}).join('')}</tbody>`;}
$('kbq').addEventListener('input',renderKB); $('kbR').onclick=()=>setKb('rules'); $('kbG').onclick=()=>setKb('gap');

/* boot with marked example */
$('ver').textContent=`ต้นแบบ v0.14.0 · กฎ ${KB.length} รายการ · บัญชียา ${DM.length.toLocaleString()}`;
$('age').value=EX_PT.age;ageSyncIn();$('bw').value=EX_PT.bw;$('ht').value=EX_PT.ht;$('scr').value=EX_PT.scr;$('k').value=EX_PT.k;
$('paste').value=EX_TXT; $('paste').placeholder='วางรายการยาจากระบบ paperless ที่นี่';
doParse(true); loadHadEx(); renderHad(); renderKB();
{const d3=LIQ.find(x=>/VIT D3/i.test(x.name)); if(d3){$('lDrug').value=d3.code+' · '+d3.name; pickLiq(); $('lDose').value=400; $('lDays').value=30; renderLiq();}}
const exNote=document.createElement('p');exNote.id='exNote';exNote.className='hint';exNote.style.margin='0 0 10px';exNote.textContent='ข้อมูลที่แสดงเป็นเคสตัวอย่าง (ชาย 72 ปี SCr 2.0) — กด "เริ่มเคสใหม่" ก่อนกรอกผู้ป่วยจริงทุกครั้ง';
$('sum').before(exNote);

/* ---------- ผสม Dextrose (ชีต น้ำเกลือดูดออก / เติมเข้า) ---------- */
const DEX_BASE=[['NSS',0,[100,250,1000]],['D-5-S',5,[1000]],['D-5-S/2 (D-5-N/2)',5,[1000]],['D-5-S/3 (D-5-N/3)',5,[500]],['D-5-S/4 (D-5-N/4)',5,[500]],['D-5-S/5 (D-5-N/5)',5,[500]],['D-5-W',5,[100,500,1000]],['D-10-S/2 (D-10-N/2)',10,[1000]],['อื่นๆ (กรอก % เอง)',null,[]]];
$('dBase').innerHTML=DEX_BASE.map((b,i)=>`<option value="${i}">${b[0]}${b[2].length?` · ${b[2].join('/')} ml`:''}</option>`).join('');
$('dBase').value='6'; $('dB').value=5;
function renderDex(){
  const V=+$('dVol').value, t=+$('dTgt').value/100, b=+$('dB').value/100, c=+$('dC').value/100;
  if(!(V>0&&$('dTgt').value!==''&&$('dB').value!==''&&c>0)){$('dOut').innerHTML='<div class="empty">กรอกปริมาตร และ % dextrose</div>';return}
  const msgs=[]; let kv=[];
  if(t<=b) msgs.push(['warn',`% ที่ต้องการ (${fmtN(t*100)}%) ไม่สูงกว่าสารน้ำตั้งต้น (${fmtN(b*100)}%) — ไม่ต้องเติม dextrose`]);
  else if(t>=c) msgs.push(['flag',`% ที่ต้องการต้องต่ำกว่าความเข้มข้นที่ใช้เติม (${fmtN(c*100)}%)`]);
  else {
    const X=(t-b)*V/(c-b), Y=(t-b)*V/(c-t), vial=n=>Math.ceil(n/50-1e-9);
    kv=[['วิธีที่ 1: ดูดออกแล้วเติม',`ดูดสารน้ำออก ${r1(X)} ml → เติม ${fmtN(c*100)}% dextrose ${r1(X)} ml`],['ปริมาตรสุดท้าย',`${r0(V)} ml`],['ใช้ 50% Dextrose (50 ml)',`${vial(X)} vial`],
        ['วิธีที่ 2: เติมเข้าโดยไม่ดูดออก',`เติม ${fmtN(c*100)}% dextrose ${r1(Y)} ml`],['ปริมาตรสุดท้าย ',`${r0(V+Y)} ml`],['ใช้ 50% Dextrose (50 ml) ',`${vial(Y)} vial`]];
    if(X>V) msgs.push(['flag','ปริมาตรที่ต้องดูดออกมากกว่าสารน้ำในถุง']);
    msgs.push(['info',`ตรวจกลับ วิธีที่ 1: (${fmtN(b*100)}% × ${r0(V-X)} + ${fmtN(c*100)}% × ${r1(X)}) / ${r0(V)} = ${fmtN(((b*(V-X)+c*X)/V)*100)}%`]);
    msgs.push(['info',`ตรวจกลับ วิธีที่ 2: (${fmtN(b*100)}% × ${r0(V)} + ${fmtN(c*100)}% × ${r1(Y)}) / ${r0(V+Y)} = ${fmtN(((b*V+c*Y)/(V+Y))*100)}%`]);
    if(t>0.125) msgs.push(['warn',`Dextrose ${fmtN(t*100)}% (>12.5%) — ยืนยันว่าให้ทาง central line (ความเข้มข้นสูง เสี่ยง phlebitis ทาง peripheral)`]);
  }
  $('dOut').innerHTML=`<h2>ผลคำนวณ</h2>
   <div class="big" style="margin-bottom:12px"><span class="n">${fmtN(t*100)}%</span><span class="u">dextrose จาก ${esc(DEX_BASE[+$('dBase').value][0])} ${r0(V)} ml</span></div>
   ${kv.length?`<dl class="kv" style="margin-bottom:12px">${kv.map(([a,x])=>`<dt>${a}</dt><dd>${x}</dd>`).join('')}</dl>`:''}
   <ul class="msgs">${msgs.map(([l,m])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`).join('')}</ul>`;
}
$('dBase').addEventListener('change',()=>{const b=DEX_BASE[+$('dBase').value]; if(b[1]!=null) $('dB').value=b[1]; if(b[2].length&&!b[2].includes(+$('dVol').value)) $('dVol').value=b[2][b[2].length>1?1:0]; renderDex();});
['dVol','dTgt','dB','dC'].forEach(id=>$(id).addEventListener('input',renderDex));
renderDex();

/* ---------- Opioid OME (ชีต Opioid-คำนวณ dose / ประเมินปรับ dose) ---------- */
const OPI=[['fpatch','Fentanyl patch','mcg/hr',2,'×2'],
 ['finj','Fentanyl inj','mcg/day',0.3,'×0.3'],
 ['methadone','Methadone tab','mg/day',4,'×4'],
 ['minj','Morphine inj','mg/day',3,'×3'],
 ['mpo','Morphine oral (MST, IR, syrup)','mg/day',1,'×1'],
 ['pinj','Pethidine inj','mg/day',0.3,'×0.3']];
$('oTbl').innerHTML=`<table class="otbl" style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left">ยา</th><th>เมื่อวาน</th><th>วันนี้</th></tr></thead><tbody>${OPI.map(o=>`<tr><td style="padding:4px 6px 4px 0">${o[1]}<div class="hint" style="margin:0">${o[2]} · OME ${o[4]}</div></td><td><input id="oy_${o[0]}" type="number" step="any" inputmode="decimal" style="width:100%;min-width:70px;padding:8px;border:1px solid var(--line,#ccd);border-radius:8px;font:inherit;background:transparent;color:inherit"></td><td><input id="ot_${o[0]}" type="number" step="any" inputmode="decimal" style="width:100%;min-width:70px;padding:8px;border:1px solid var(--line,#ccd);border-radius:8px;font:inherit;background:transparent;color:inherit"></td></tr>`).join('')}</tbody></table>`;
function renderOpi(){
  const sum=p=>OPI.reduce((a,o)=>a+(+$(p+o[0]).value||0)*o[3],0), has=p=>OPI.some(o=>$(p+o[0]).value!=='');
  const Y=sum('oy_'), T=sum('ot_'), hy=has('oy_'), ht=has('ot_'), pct=$('oPct').value;
  if(!hy&&!ht){$('oOut').innerHTML='<div class="empty">กรอกขนาดยา opioid ที่ได้รับต่อวัน</div>';return}
  const kv=[], msgs=[];
  if(hy) kv.push(['OME เมื่อวาน',`${fmtN(Y)} mg/day`]);
  if(ht) kv.push(['OME วันนี้ (ตามคำสั่ง)',`${fmtN(T)} mg/day`]);
  let big=ht?T:Y;
  if(hy&&ht&&Y>0){const ch=(T-Y)*100/Y; kv.push(['% เปลี่ยนแปลง',`${ch>=0?'+':''}${fmtN(ch)}%`]);
    msgs.push(ch>30?['flag',`เพิ่มขึ้น ${fmtN(ch)}% (>30% ต่อวัน) — โปรด consult แพทย์`]:['ok',`เปลี่ยนแปลง ${fmtN(ch)}% — ไม่เกิน 30% ต่อวัน`]);}
  if(pct!==''&&hy){const atc=Y*(100+ +pct)/100; big=atc; kv.push([`ATC วันนี้ (ปรับ ${pct}%)`,`${fmtN(atc)} mg/day`]); if(+pct>30) msgs.push(['flag','ปรับเพิ่มเกิน 30% ต่อวัน']);}
  const base=pct!==''&&hy?Y*(100+ +pct)/100:(ht?T:Y);
  kv.push(['Breakthrough pain (10-20% ของ ATC)',`${fmtN(base*0.1)} – ${fmtN(base*0.2)} mg oral morphine/ครั้ง`]);
  kv.push(['เทียบเป็น morphine inj',`${fmtN(base*0.1/3)} – ${fmtN(base*0.2/3)} mg/ครั้ง`]);
  if(['oy_','ot_'].some(p=>+$(p+'methadone').value>0)) msgs.push(['warn','Methadone: อัตราแปลงไม่เป็นเส้นตรง (×4 ใช้ได้ที่ขนาดต่ำ) — ห้ามใช้ตารางนี้คำนวณการเปลี่ยนไปเป็น methadone ปรึกษาแพทย์/แนวทาง palliative']);
  if(['oy_','ot_'].some(p=>+$(p+'fpatch').value>0)) msgs.push(['info','Fentanyl patch: ออกฤทธิ์เต็มที่ 12-24 ชม. หลังติด และยังมีผลต่อ ~17 ชม. หลังลอก — ระวังช่วงเปลี่ยนยา']);
  if(['oy_','ot_'].some(p=>+$(p+'pinj').value>0)) msgs.push(['info','Pethidine inj ใช้ ×0.3 (pethidine 100 mg ฉีด ≈ morphine 10 mg ฉีด) · ชีตห้องยาเดิมใช้ ×0.1 ซึ่งเป็นค่าของ pethidine ชนิดรับประทาน']);
  msgs.push(['info','ใช้เทียบขนาดเท่านั้น — เมื่อเปลี่ยนชนิด opioid ให้ลดขนาดลง 25-50% (incomplete cross-tolerance)']);
  $('oOut').innerHTML=`<h2>ผลคำนวณ</h2>
   <div class="big" style="margin-bottom:12px"><span class="n">${fmtN(big)}</span><span class="u">mg oral morphine/day</span></div>
   <dl class="kv" style="margin-bottom:12px">${kv.map(([a,x])=>`<dt>${a}</dt><dd>${x}</dd>`).join('')}</dl>
   <ul class="msgs">${msgs.map(([l,m])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`).join('')}</ul>`;
}
OPI.forEach(o=>['oy_','ot_'].forEach(p=>$(p+o[0]).addEventListener('input',renderOpi))); $('oPct').addEventListener('input',renderOpi);
renderOpi();

/* ---------- Vancomycin PK + Colistin (ชีต Vancomycin / Colistin) ---------- */
function renderPk(){
  const pt=getPt(), bw=+$('bw').value||null, crcl=pt.crcl, out=[], li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  let h='<h2>Vancomycin</h2>';
  if(pt.isPed) h+='<div class="empty">สูตร population PK นี้สำหรับผู้ใหญ่</div>';
  else if(pt.dial) h+=`<div class="empty">ผู้ป่วย ${esc(pt.dial)} — ใช้ dosing ตามกฎ ${esc(pt.dial)} และวัดระดับยา (สูตรนี้ใช้ CrCl)</div>`;
  else if(!(bw>0&&crcl>0)) h+='<div class="empty">กรอกอายุ น้ำหนัก SCr (หรือ CrCl จาก HIS)</div>';
  else {
    const CL=0.65*crcl*0.06, Vd=0.7*bw, k=CL/Vd, t12=0.693/k;
    const tauA=[6,8,12,24,36,48,72].reduce((a,b)=>Math.abs(b-t12)<Math.abs(a-t12)?b:a);
    const tau2=+$('vTau2').value||tauA, e2=Math.exp(-k*tau2), dFor=c=>c*Vd*(1-e2)/e2;
    const kv=[['CrCl',`${fmtN(crcl)} ml/min (${pt.crclSrc==='HIS'?'HIS':'CG, '+pt.wlab})`],['CL',`${fmtN(CL)} L/h`],['Vd (0.7 L/kg × TBW)',`${fmtN(Vd)} L`],['Ke',`${fmtN(k)} /h`],['t½',`${fmtN(t12)} h`],
      [`Dose ที่ trough 10 mg/L (q${tau2}h)`,`${r0(dFor(10))} mg`],[`Dose ที่ trough 15 mg/L (q${tau2}h)`,`${r0(dFor(15))} mg`],[`Dose ที่ trough 20 mg/L (q${tau2}h)`,`${r0(dFor(20))} mg`]];
    const D=+$('vDose').value, tau=+$('vTau').value; let big=null;
    if(D>0&&tau>0){ const e=Math.exp(-k*tau), tr=D*e/(Vd*(1-e)), pk=(D/Vd)*Math.exp(-k*2)/(1-e), auc=D*(24/tau)/CL; big=tr;
      kv.push(['Predicted Css trough',`${fmtN(tr)} mg/L`],['Predicted Css max (2 ชม.หลังให้)',`${fmtN(pk)} mg/L`],['AUC24 (ประมาณ)',`${r0(auc)} mg·h/L`]);
      out.push(li(tr>=10&&tr<=20?'ok':'warn',tr<10?`Trough ${fmtN(tr)} mg/L ต่ำกว่า 10 — dose ไม่เหมาะสม`:tr>20?`Trough ${fmtN(tr)} mg/L สูงกว่า 20 — dose ไม่เหมาะสม เสี่ยงพิษต่อไต`:`Trough ${fmtN(tr)} mg/L อยู่ในช่วง 10-20 (UTI/SSTI 10-15 · severe/CNS/endocarditis/osteomyelitis/pneumonia 15-20)`));
      out.push(li(pk>40?'warn':'ok',pk>40?`Css max ${fmtN(pk)} mg/L >40 — ขนาดยาสูง ระวังพิษต่อหู (ototoxicity 1-9%)`:`Css max ${fmtN(pk)} mg/L ≤40`));
      out.push(li('info',`AUC24 ≈ ${r0(auc)} (เป้าหมาย 400-600 ตาม ASHP/IDSA 2020 สำหรับ MRSA รุนแรง) — ค่าประมาณจาก CL ประชากร ควรยืนยันด้วยระดับยาจริง`)); }
    else out.push(li('info','กรอก dose และ interval ที่แพทย์สั่ง เพื่อทำนาย trough/peak'));
    if(pt.obese) out.push(li('warn','ผู้ป่วยอ้วน (>130% IBW): Vd ใช้ TBW ตามชีต — ค่าทำนายคลาดเคลื่อนได้มาก'));
    h+=(big!=null?`<div class="big" style="margin-bottom:12px"><span class="n">${fmtN(big)}</span><span class="u">mg/L predicted trough</span></div>`:'')+`<dl class="kv" style="margin-bottom:12px">${kv.map(([a,x])=>`<dt>${a}</dt><dd>${x}</dd>`).join('')}</dl><ul class="msgs">${out.join('')}</ul>`;
  }
  h+='<h2 style="margin-top:20px">Colistin (mg CBA)</h2>';
  const ht=+$('ht').value||null;
  if(!(bw>0)) h+='<div class="empty">กรอกน้ำหนัก</div>';
  else { const kd=KB.find(x=>x.id==='colistin'), m=[], kv=[];
    let hosp=null; if(kd){ if(pt.dial&&kd.renal[pt.dial]) hosp=kd.renal[pt.dial].txt; else if(crcl>0){const b=kd.renal.bands.find(b=>crcl>=b.lo&&crcl<b.hi); if(b) hosp=b.txt;} }
    kv.push(['Loading dose','300 mg CBA ครั้งเดียว (ไม่ปรับตามไต)']);
    kv.push([`ขนาดตามคู่มือปรับยาตามไต รพ.${pt.dial?` (${pt.dial})`:crcl>0?` (CrCl ${fmtN(crcl)})`:''}`,hosp?esc(hosp):'กรอก CrCl / SCr หรือเลือกการบำบัดทดแทนไต']);
    if(pt.dial==='HD') m.push(li('info','HD: ให้ตามรอบปกติ ถ้าเวลาปกติตรงก่อนฟอก วันฟอกให้เลื่อนมาหลังฟอก'));
    if(!pt.dial&&crcl>0&&ht>0&&pt.bsa){ const crn=crcl*1.73/pt.bsa, md=2.5*(1.5*crn+30);
      kv.push(['อ้างอิงเพิ่ม: Garonzik 2.5 × (1.5 × CrCln + 30)',`${r0(md)} mg CBA/วัน (CrCln ${fmtN(crn)} ml/min/1.73m²)`]);
      m.push(li('info','สูตร Garonzik ใช้ประกอบเท่านั้น — ยึดขนาดตามคู่มือปรับยาตามไตของ รพ. เป็นหลัก'));}
    m.push(li('info',`Loading 300 mg CBA ตามคู่มือ รพ. และ international consensus 2019 (ฉลาก FDA คิดตามน้ำหนัก 5 mg/kg = ${r0(5*bw)} mg)`));
    h+=`<dl class="kv" style="margin-bottom:12px">${kv.map(([a,x])=>`<dt>${a}</dt><dd>${x}</dd>`).join('')}</dl><ul class="msgs">${m.join('')}</ul>`; }
  $('pkOut').innerHTML=h;
}
['vDose','vTau','vTau2'].forEach(id=>$(id).addEventListener('input',renderPk));
document.addEventListener('input',()=>{if(!$('p-pk').hidden) renderPk();}); document.addEventListener('change',()=>{if(!$('p-pk').hidden) renderPk();});
$('t-pk').addEventListener('click',renderPk);

/* ---------- Timeline ยา + คำนวณจำนวนจ่ายต่อ (refer / ยาครบวัน) ---------- */
const TL=[]; let tlId=0;
const pad2=n=>String(n).padStart(2,'0');
function tlDate(d,t){ const m=(d||'').trim().match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})$/); if(!m) return null;
  let y=+m[3]; if(y<100) y+=2500; if(y>2400) y-=543;
  const tm=(t||'').trim().match(/^(\d{1,2})(?:\s*[:.]\s*(\d{2}))?/); const hh=tm?+tm[1]:0, mm=tm&&tm[2]?+tm[2]:0;
  const x=new Date(y,+m[2]-1,+m[1],hh,mm); return isNaN(x)?null:x;}
const tlFmt=(x,time=true)=>`${pad2(x.getDate())}/${pad2(x.getMonth()+1)}/${x.getFullYear()+543}${time?' '+pad2(x.getHours())+':'+pad2(x.getMinutes()):''}`;
const tlFmtS=x=>`${x.getDate()}/${x.getMonth()+1}`;
function tlSetNow(){const n=new Date(); $('tlAsD').value=tlFmt(n,false); $('tlAsT').value=pad2(n.getHours())+':'+pad2(n.getMinutes());}
function tlAddRow(pre={}){ const id=++tlId; const r={id,order:'',name:'',dose:'',units:1,ulab:'vial',tau:24,sd:'',st:'08:00',mode:'total',n:'',ud:'',ut:'',...pre}; TL.push(r);
  const el=document.createElement('div'); el.className='tlrow'; el.id='tl'+id;
  el.innerHTML=`<div style="display:flex;gap:8px;align-items:end"><label class="f" style="flex:1">คำสั่งยา (วางจาก paperless ได้)<input data-k="order" placeholder="เช่น CEF-3 (CEFTRIAXONE) 1G. 2 g iv q 12 hr start 5/10/2569 8.00"></label><button class="btn sm" data-del type="button" title="ลบรายการ">✕</button></div>
   <div class="tlg">
    <label class="f">ชื่อยา<input data-k="name"></label>
    <label class="f">ขนาดต่อครั้ง<input data-k="dose" placeholder="2 g"></label>
    <label class="f">จ่ายต่อครั้ง<input data-k="units" type="number" step="any" inputmode="decimal"></label>
    <label class="f">หน่วยจ่าย<input data-k="ulab" placeholder="vial / amp / เม็ด"></label>
    <label class="f">ทุกกี่ชั่วโมง (q h)<input data-k="tau" type="number" step="any" inputmode="decimal"></label>
    <label class="f">วันเริ่ม (dose แรก)<input data-k="sd" placeholder="5/10/2569"></label>
    <label class="f">เวลา dose แรก<input data-k="st" placeholder="08:00"></label>
    <label class="f">ระยะเวลา<select data-k="mode"><option value="total">ครบ N วัน นับจากวันเริ่ม</option><option value="more">ต่ออีก N วัน นับจากวันที่คำนวณ</option><option value="doses">ครบ N ครั้ง (รวมที่ให้แล้ว)</option><option value="until">ให้ถึงวันเวลา (รวม dose นั้น)</option></select></label>
    <label class="f" data-show="n">N<input data-k="n" type="number" step="any" inputmode="decimal"></label>
    <label class="f" data-show="u">ถึงวันที่<input data-k="ud" placeholder="24/10/2569"></label>
    <label class="f" data-show="u">เวลา<input data-k="ut" placeholder="20:00"></label>
   </div><div class="tlres" data-res></div>`;
  $('tlRows').appendChild(el);
  el.querySelectorAll('[data-k]').forEach(i=>{i.value=r[i.dataset.k]??''; i.addEventListener('input',()=>{r[i.dataset.k]=i.value; if(i.dataset.k==='order') tlFromOrder(r,el); renderTl();}); i.addEventListener('change',()=>{r[i.dataset.k]=i.value;renderTl();});});
  el.querySelector('[data-del]').onclick=()=>{TL.splice(TL.indexOf(r),1);el.remove();renderTl();};
  renderTl(); }
function tlFromOrder(r,el){ const L=r.order; if(!L.trim()) return; const p=parseLine(L); if(!p) return;
  const mm=masterOf(p), d=KB.find(x=>x.id===p.drugId);
  const set=(k,v)=>{ if(v==null||v==='') return; r[k]=v; const i=el.querySelector(`[data-k="${k}"]`); if(i) i.value=v; };
  set('name',d?d.name:mm?mm[1]:L.split(/\s+/).slice(0,3).join(' '));
  if(p.F) set('tau',+(24/p.F).toFixed(2));
  const D=d?rowDose(p,d,getPt()):null, unitLab=mm?mm[3]:'';
  if(D!=null){ set('dose',`${fmtN(D)} ${d.unit||'mg'}`); const st=p.strength||(mm&&mm[7]&&mm[7][0]==='u'?mm[7][1]:null);
    if(st){ const u=D/st; set('units',/vial|amp|ขวด/i.test(unitLab)?Math.ceil(u-1e-9):+u.toFixed(2)); } }
  else if(p.doseUnit==='unit') set('units',p.doseVal);
  if(p.doseUnit==='ml'&&p.doseVal){ set('units',p.doseVal); set('ulab','ml'); const bm=(mm?mm[1]:L).match(/[-(]\s*(\d+)\s*ML\)?/i); r.bottle=bm?+bm[1]:null; }
  else { r.bottle=null; if(unitLab) set('ulab',unitLab); }
  const dm=L.match(/(?:start|เริ่ม|st\.?)\s*:?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})(?:\s*(?:เวลา)?\s*(\d{1,2}[:.]\d{2}))?/i)||L.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})(?:\s*(\d{1,2}[:.]\d{2}))?/);
  if(dm){ set('sd',dm[1]); if(dm[2]) set('st',dm[2].replace('.',':')); }
  const nm=L.match(/(?:จนครบ|ให้ครบ|ครบ|ต่ออีก|ต่อ|อีก|x|×|for)\s*(\d+)\s*(?:วัน|days?|d\b)/i); if(nm){ set('n',nm[1]); set('mode',/ครบ/.test(nm[0])?'total':/ต่อ|อีก/.test(nm[0])?'more':'total'); r.det=nm[0]; } else r.det=null;
}
function tlCalc(r,asof){ const s=tlDate(r.sd,r.st), tau=+r.tau, N=+r.n; if(!s||!(tau>0)) return {err:'กรอกวันเริ่มและความถี่'};
  const H=3600e3, t=k=>new Date(s.getTime()+k*tau*H); let end=null, total=null;
  if(r.mode==='total'){ if(!(N>0)) return {err:'กรอกจำนวนวัน'}; end=new Date(s.getTime()+N*24*H); total=Math.ceil(N*24/tau-1e-9); }
  else if(r.mode==='doses'){ if(!(N>0)) return {err:'กรอกจำนวนครั้ง'}; total=Math.round(N); }
  else if(r.mode==='until'){ const u=tlDate(r.ud,r.ut); if(!u) return {err:'กรอกวันสิ้นสุด'}; total=Math.floor((u-s)/(tau*H)+1e-9)+1; }
  else { if(!(N>0)) return {err:'กรอกจำนวนวัน'}; if(!asof) return {err:'กรอกวันที่คำนวณ'}; }
  let given=asof?Math.max(0,Math.ceil((asof-s)/(tau*H)-1e-9)):0;
  if(r.mode==='more'){ const add=Math.ceil(N*24/tau-1e-9); total=given+add; }
  given=Math.min(given,total); const rem=total-given;
  return {s,tau,total,given,rem,first:rem?t(given):null,last:t(total-1),firstDose:s,units:(+r.units||0)*rem,days:rem*tau/24};
}
function renderTl(){
  const asof=tlDate($('tlAsD').value,$('tlAsT').value), notes=[], bars=[];
  for(const r of TL){ const el=$('tl'+r.id); if(!el) continue;
    el.querySelectorAll('[data-show="n"]').forEach(x=>x.hidden=r.mode==='until'); el.querySelectorAll('[data-show="u"]').forEach(x=>x.hidden=r.mode!=='until');
    const c=tlCalc(r,asof), box=el.querySelector('[data-res]');
    if(c.err){ box.innerHTML=`<span class="hint">${esc(c.err)}</span>`; continue; }
    const ul=r.ulab||'หน่วย', nm=r.name||'ยา';
    box.innerHTML=`ทั้งคอร์ส <b>${c.total}</b> ครั้ง (${tlFmt(c.s)} → ${tlFmt(c.last)}) · ให้แล้ว <b>${c.given}</b> ครั้ง${asof?` (ก่อน ${tlFmt(asof)})`:''}<br>
      <span style="font-size:1.05rem">ต้องจ่ายต่อ <b style="font-size:1.25rem;color:var(--accent)">${c.rem}</b> ครั้ง ≈ ${fmtN(c.days)} วัน${r.units?` = <b style="font-size:1.25rem;color:var(--accent)">${fmtN(c.units)}</b> ${esc(ul)}${r.bottle&&/^ml$/i.test(ul)?` (ขวด ${r.bottle} ml = <b>${Math.ceil(c.units/r.bottle-1e-9)}</b> ขวด)`:''}`:''}</span>
      ${c.rem?`<br>dose ถัดไป ${tlFmt(c.first)} · dose สุดท้าย ${tlFmt(c.last)}`:'<br>ครบคอร์สแล้ว ไม่ต้องจ่ายต่อ'}
      ${(r.mode==='total'||r.mode==='more')?(()=>{const o=tlCalc({...r,mode:r.mode==='total'?'more':'total'},asof); return o.err?'':`<div class="hint" style="margin-top:4px">${r.det?`อ่านจากคำสั่ง "${esc(r.det)}" → ${r.mode==='total'?'ครบ N วันนับจากวันเริ่ม':'ต่ออีก N วันนับจากวันนี้'} · `:''}ถ้าแพทย์หมายถึง${r.mode==='total'?`ต่ออีก ${r.n} วันนับจากวันนี้`:`ครบ ${r.n} วันนับจากวันเริ่ม`} จะต้องจ่าย ${o.rem} ครั้ง${r.units?` = ${fmtN(o.units)} ${esc(ul)}`:''} (สิ้นสุด ${tlFmt(o.last)}) — ถ้าคำสั่งไม่ชัด ยืนยันกับแพทย์</div>`;})():''}`;
    notes.push(`${nm}${r.dose?' '+r.dose:''} q${fmtN(c.tau)}h เริ่ม ${tlFmt(c.s)} ${r.mode==='more'?`ต่ออีก ${r.n} วัน`:r.mode==='doses'?`ครบ ${r.n} ครั้ง`:r.mode==='until'?'ให้ถึง':`ครบ ${r.n} วัน`} สิ้นสุด ${tlFmt(c.last)} · ให้แล้ว ${c.given} ครั้ง · เหลือ ${c.rem} ครั้ง${c.rem?` (${tlFmt(c.first)} – ${tlFmt(c.last)})`:''}${r.units?` → จ่าย ${fmtN(c.units)} ${ul}${r.bottle&&/^ml$/i.test(ul)?` (${Math.ceil(c.units/r.bottle-1e-9)} ขวด ${r.bottle} ml)`:''}`:''}`);
    bars.push({nm,c}); }
  $('tlNote').value=notes.join('\n');
  if(!bars.length){$('tlChart').innerHTML='<div class="empty">เพิ่มรายการยาเพื่อดู timeline</div>';return}
  const H=3600e3, D=24*H, t0=new Date(Math.min(...bars.map(b=>b.c.s.getTime()),asof?asof.getTime():Infinity)); t0.setHours(0,0,0,0);
  const tEnd=Math.max(...bars.map(b=>b.c.last.getTime()+b.c.tau*H),asof?asof.getTime()+D:0), days=Math.ceil((tEnd-t0)/D);
  const W=1000,L=170,R=70,rowH=34,top=34,Hh=top+bars.length*rowH+10, x=t=>L+(t-t0)/(days*D)*(W-L-R);
  const step=days<=21?1:days<=45?2:days<=100?7:14; let g='';
  for(let i=0;i<=days;i+=step){const tx=x(t0.getTime()+i*D); g+=`<line x1="${tx}" y1="${top-6}" x2="${tx}" y2="${Hh-6}" stroke="var(--line2)"/><text x="${tx}" y="${top-12}" font-size="11" text-anchor="middle">${tlFmtS(new Date(t0.getTime()+i*D))}</text>`;}
  bars.forEach((b,i)=>{ const y=top+i*rowH+8, c=b.c, s=c.s.getTime(), e=c.last.getTime()+c.tau*H, cut=c.first?c.first.getTime():e;
    g+=`<text x="${L-8}" y="${y+12}" font-size="12" text-anchor="end" style="fill:var(--ink)">${esc(b.nm.length>22?b.nm.slice(0,21)+'…':b.nm)}</text>`;
    g+=`<rect x="${x(s)}" y="${y}" width="${Math.max(1,x(cut)-x(s))}" height="16" rx="3" fill="var(--muted)" opacity=".45"><title>ให้แล้ว ${c.given} ครั้ง</title></rect>`;
    if(c.rem) g+=`<rect x="${x(cut)}" y="${y}" width="${Math.max(1,x(e)-x(cut))}" height="16" rx="3" fill="var(--accent)"><title>ต้องจ่ายต่อ ${c.rem} ครั้ง</title></rect>`;
    if(c.total<=150) for(let k=0;k<c.total;k++){const tx=x(s+k*c.tau*H); g+=`<line x1="${tx}" y1="${y+2}" x2="${tx}" y2="${y+14}" stroke="var(--surface)" stroke-width="1"/>`;}
    g+=`<text x="${Math.min(x(e)+4,W-R)}" y="${y+12}" font-size="11">${c.rem?`เหลือ ${c.rem}`:'ครบ'}</text>`; });
  if(asof){const ax=x(asof.getTime()); g+=`<line x1="${ax}" y1="${top-6}" x2="${ax}" y2="${Hh-4}" stroke="var(--flag)" stroke-width="2"/><text x="${ax+4}" y="${Hh-6}" font-size="11" style="fill:var(--flag)">วันที่คำนวณ</text>`;}
  $('tlChart').innerHTML=`<svg class="tlsvg" viewBox="0 0 ${W} ${Hh+6}" role="img" aria-label="Timeline ยา">${g}</svg>
   <p class="hint" style="margin:6px 0 0">แถบเทา = ให้แล้ว · แถบเขียว = ต้องจ่ายต่อ · ขีดในแถบ = เวลาให้ยาแต่ละครั้ง · เส้นแดง = วันเวลาที่คำนวณ</p>`;
}
$('tlNow').onclick=()=>{tlSetNow();renderTl();}; $('tlAdd').onclick=()=>tlAddRow();
['tlAsD','tlAsT'].forEach(id=>$(id).addEventListener('input',renderTl));
tlSetNow(); tlAddRow();

/* ---------- Warfarin weekly + dispensing (ชีต Warfarin V1.3) ---------- */
const WD=['Mo','Tu','We','Th','Fr','Sa','Su'];
$('wTbl').innerHTML=`<thead><tr><th style="text-align:left">สูตร</th><th>ความแรง</th>${WD.map(d=>`<th>${DAY_TH[d]}</th>`).join('')}</tr></thead><tbody>${['old','new'].map(k=>`<tr><td>${k==='old'?'เดิม':'ใหม่'}</td><td><select id="w_${k}_s"><option value="3" selected>3 mg (รพ.มค)</option><option value="5">5 mg (รพ.อื่น)</option><option value="2">2 mg (รพ.อื่น)</option><option value="1">1 mg (รพ.อื่น)</option></select></td>${WD.map(d=>`<td><input id="w_${k}_${d}" type="number" step="0.25" inputmode="decimal" style="width:100%;min-width:44px;padding:8px 2px;text-align:center;border:1px solid var(--line);border-radius:6px;background:var(--surface)"></td>`).join('')}</tr>`).join('')}</tbody>`;
const WF_ADJ={2:[[1.5,'เพิ่มขนาดยาต่อสัปดาห์ 10-20%'],[2.0,'เพิ่มขนาดยาต่อสัปดาห์ 5-10%'],[3.05,'คงขนาดยาเดิม'],[4.0,'ลดขนาดยาต่อสัปดาห์ 5-10%'],[5.0,'หยุดยา 1 วัน และลดขนาดยาต่อสัปดาห์ 10%'],[Infinity,'INR >5: ปรับตามตารางที่ 2 (หยุดยา ± vitamin K1)']],
 2.5:[[1.6,'เพิ่มขนาดยาต่อสัปดาห์ 10-20%'],[2.5,'เพิ่มขนาดยาต่อสัปดาห์ 5-10%'],[3.6,'คงขนาดยาเดิม'],[4.5,'ลดขนาดยาต่อสัปดาห์ 5-10%'],[5.0,'หยุดยา 1 วัน และลดขนาดยาต่อสัปดาห์ 10%'],[Infinity,'INR >5: ปรับตามตารางที่ 2 (หยุดยา ± vitamin K1)']]};

/* ---------- Warfarin: ปรับขนาด % ต่อสัปดาห์ → เสนอสูตรใหม่ · ปฏิทินกินยา (วันที่ 1 = วันเริ่มกิน) ---------- */
const WF_PCTS=[-20,-15,-10,-5,5,10,15,20];
// กระจายจำนวนครึ่งเม็ดให้เท่ากันที่สุดใน 7 วัน (มีขนาดต่างกันไม่เกิน 2 แบบ) — วันที่ได้มากกว่าเว้นระยะห่างเท่า ๆ กัน เริ่มวันจันทร์
function wfSpread(halves){ const b=Math.floor(halves/7), e=halves-b*7, u=Array(7).fill(b/2); const pos=new Set(); for(let i=0;i<e;i++) pos.add(Math.floor(i*7/e)); pos.forEach(i=>u[i]+=0.5); return u; }
const wfDayTxt=x=>x==null||x===0?'หยุด':`${Math.floor(x)>0?Math.floor(x):''}${Math.abs(x-Math.floor(x)-0.5)<1e-9?'½':Math.abs(x-Math.floor(x)-0.25)<1e-9?'¼':Math.abs(x-Math.floor(x)-0.75)<1e-9?'¾':''}`||'0';
function wfPatTxt(u){ const g={}; u.forEach((x,i)=>{ const k=wfDayTxt(x||0); (g[k]=g[k]||[]).push(DAY_TH[WD[i]]); }); const ks=Object.keys(g); if(ks.length===1) return `${ks[0]==='หยุด'?'หยุด':ks[0]+' เม็ด'} ทุกวัน`;
  const main=ks.sort((a,b)=>g[b].length-g[a].length)[0]; return ks.filter(k=>k!==main).map(k=>`${g[k].join(' ')} ${k==='หยุด'?'หยุดยา':k+' เม็ด'}`).join(' · ')+` · วันอื่น ${main==='หยุด'?'หยุดยา':main+' เม็ด'}`; }
function wfPills(x){ if(!x) return '<span style="color:var(--muted)">หยุด</span>'; let h=''; const f=Math.floor(x), r=x-f;
  for(let i=0;i<f;i++) h+='<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#f59e0b" stroke="#b45309"/></svg>';
  if(r>1e-9) h+=`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="#b45309"/><path d="M8,1 A7,7 0 0,0 8,15 Z" fill="#f59e0b"/></svg>`; return h; }
function wfAdjRender(){ const box=$('wAdj'); if(!box) return;
  { const pt=getPt(); let rec=[]; if(pt.inr!=null){ const t=+$('wTgt').value, row=WF_ADJ[t].find(r=>pt.inr<r[0]), m=row[1].match(/(เพิ่ม|ลด)ขนาดยาต่อสัปดาห์ (\d+)(?:-(\d+))?%/); if(m){ const a=+m[2], b=+(m[3]||m[2]), sg=m[1]==='เพิ่ม'?1:-1; rec=WF_PCTS.filter(v=>Math.sign(v)===sg&&Math.abs(v)>=a&&Math.abs(v)<=b); } }
    $('wPctB').querySelectorAll('[data-wp]').forEach(b=>{ const on=rec.includes(+b.dataset.wp); b.style.outline=on?'2px solid var(--accent)':''; b.title=on?`ตามตารางปรับยา (INR ${pt.inr})`:''; }); } const o=wfRead('old'), n=wfRead('new'), base=o.any?o:n.any?n:null;
  if(!base){ box.innerHTML='<span class="hint">กรอกสูตรเดิมก่อน แล้วเลือก % ที่ต้องการปรับ</span>'; return; }
  const W=base.u.reduce((a,x)=>a+(x||0)*base.s,0), pct=+$('wPct').value, s=+$('w_new_s').value||WF_HOSP;
  if(!pct||!(W>0)){ box.innerHTML=`<span class="hint">สูตร${o.any?'เดิม':'ปัจจุบัน'} ${fmtN(W)} mg/สัปดาห์ — เลือก % ที่ต้องการปรับ</span>`; return; }
  const T=W*(1+pct/100), H=Math.round(T/(s/2)); const opts=[H-2,H-1,H,H+1,H+2].filter(h=>h>0).map(h=>{ const u=wfSpread(h), w=u.reduce((a,x)=>a+x*s,0); return {u,w,ch:(w-W)*100/W}; }).filter(x=>Math.sign(x.ch)===Math.sign(pct)&&Math.abs(x.ch)>0.01).sort((a,b)=>Math.abs(a.w-T)-Math.abs(b.w-T)).slice(0,3).sort((a,b)=>a.w-b.w);
  box.innerHTML=`<div style="margin-bottom:6px">${o.any?'สูตรเดิม':'สูตรปัจจุบัน'} <b>${fmtN(W)}</b> mg/สัปดาห์ ${pct>0?'เพิ่ม':'ลด'} ${Math.abs(pct)}% → เป้าหมาย <b>${fmtN(T)}</b> mg/สัปดาห์ (เม็ด ${s} mg)</div>
   <table class="ctbl" style="width:100%;text-align:center"><thead><tr><th style="text-align:left">ทางเลือก</th>${WD.map(d=>`<th>${DAY_TH[d]}</th>`).join('')}<th>mg/สัปดาห์</th><th>เปลี่ยน</th><th></th></tr></thead><tbody>${opts.map((x,i)=>`<tr${Math.abs(x.w-T)===Math.min(...opts.map(y=>Math.abs(y.w-T)))?' style="font-weight:700"':''}><td style="text-align:left;font-weight:400">${esc(wfPatTxt(x.u))}</td>${x.u.map(v=>`<td>${wfDayTxt(v)}</td>`).join('')}<td>${fmtN(x.w)}</td><td style="color:${Math.abs(x.ch)>20?'var(--flag)':'inherit'}">${x.ch>=0?'+':''}${fmtN(Math.round(x.ch*10)/10)}%</td><td><button type="button" class="btn sm" data-wopt="${i}">ใช้เป็นสูตรใหม่</button></td></tr>`).join('')}</tbody></table>
   <p class="hint" style="margin:6px 0 0">กระจายขนาดให้ใกล้เคียงกันทุกวัน (ต่างกันไม่เกินครึ่งเม็ด) · ตัวหนา = ใกล้เป้าหมายที่สุด · ตรวจสอบกับแพทย์ก่อนใช้</p>`;
  box.querySelectorAll('[data-wopt]').forEach(b=>b.onclick=()=>{ const x=opts[+b.dataset.wopt]; if(!o.any&&n.any){ WD.forEach((d,i)=>$('w_old_'+d).value=n.u[i]??''); $('w_old_s').value=n.s; } WD.forEach((d,i)=>$('w_new_'+d).value=x.u[i]); renderWf(); }); }
const TH_DAYF={Mo:'จันทร์',Tu:'อังคาร',We:'พุธ',Th:'พฤหัสบดี',Fr:'ศุกร์',Sa:'เสาร์',Su:'อาทิตย์'};
const wfTabTh=x=>{ if(!x) return 'งดยา'; const f=Math.floor(x+1e-9), r=x-f; const h=Math.abs(r-0.5)<1e-9, q=Math.abs(r-0.25)<1e-9, q3=Math.abs(r-0.75)<1e-9;
  if(!f) return h?'ครึ่งเม็ด':q?'1/4 เม็ด':q3?'3/4 เม็ด':`${fmtN(x)} เม็ด`; return `${f} เม็ด${h?'ครึ่ง':q?' 1/4':q3?' 3/4':''}`; };
// ข้อความภาษาไทยสำหรับผู้ป่วย: กลุ่มวันที่ขนาดเท่ากัน (ช่วงวันติดกันใช้ "–")
function wfPatThai(u,s){ const g=new Map(); u.forEach((x,i)=>{ const k=String(x||0); if(!g.has(k)) g.set(k,[]); g.get(k).push(i); });
  const runs=ix=>{ const o=[]; let a=ix[0],b=ix[0]; for(let j=1;j<=ix.length;j++){ if(ix[j]===b+1){ b=ix[j]; continue; } o.push(a===b?`วัน${TH_DAYF[WD[a]]}`:`วัน${TH_DAYF[WD[a]]}–วัน${TH_DAYF[WD[b]]}`); a=b=ix[j]; } return o.join(', '); };
  if(g.size===1){ const x=+[...g.keys()][0]; return [x?`ทุกวัน ครั้งละ ${wfTabTh(x)}`:'งดยาทุกวัน']; }
  return [...g.entries()].sort((a,b)=>a[1][0]-b[1][0]).map(([k,ix])=>{ const x=+k; return `${runs(ix)} ${x?`ครั้งละ ${wfTabTh(x)}`:'งดยา'}`; }); }
const TH_MON=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function wfPillSvg(cx,cy,x){ let g=''; const f=Math.floor(x+1e-9), r=x-f, n=f+(r>1e-9?1:0), gap=22; let px=cx-(n-1)*gap/2;
  for(let i=0;i<f;i++,px+=gap) g+=`<circle cx="${px}" cy="${cy}" r="9" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>`;
  if(r>1e-9) g+=`<circle cx="${px}" cy="${cy}" r="9" fill="#fff" stroke="#b45309" stroke-width="1.5"/><path d="M${px},${cy-9} A9,9 0 0,0 ${px},${cy+9} Z" fill="#f59e0b"/>`; return g; }
// ปฏิทินรายเดือน (SVG) ครอบคลุมวันที่ 1 ถึงวันสุดท้ายที่จ่าย + วันนัด — ใช้ทั้งหน้าจอ พิมพ์ คัดลอก/บันทึกรูป
function wfCal(cur,st,days,appt){ const s0=st||(()=>{const d=new Date(); d.setHours(0,0,0,0); return d;})(), N=Math.max(7,Math.min(days||28,186));
  const key=d=>d.getFullYear()*10000+d.getMonth()*100+d.getDate(), info=new Map(); const list=[];
  for(let i=0;i<N;i++){ const d=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate()+i), u=cur.u[(d.getDay()+6)%7]||0; info.set(key(d),{n:i+1,u}); list.push(`วันที่ ${i+1} (${DAY_TH[WD[(d.getDay()+6)%7]]} ${tlFmt(d,false)}) — ${u?`${wfDayTxt(u)} เม็ด (${fmtN(u*cur.s)} mg)`:'หยุดยา'}`); }
  const last=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate()+N-1), ap=appt||new Date(last.getFullYear(),last.getMonth(),last.getDate()+1);
  const svgs=[]; let y0=s0.getFullYear(), m0=s0.getMonth(); const endM=(ap>last?ap:last);
  while(y0*12+m0<=endM.getFullYear()*12+endM.getMonth()){
    const first=new Date(y0,m0,1), dim=new Date(y0,m0+1,0).getDate(), lead=(first.getDay()+6)%7, rows=Math.ceil((lead+dim)/7), W=700, CW=100, CH=70;
    const pl=wfPatThai(cur.u.map(x=>x||0),cur.s), oneLine=pl.join(' · '), lines=oneLine.length<=78?[oneLine]:pl.slice(0,4), tm=(($('wTime')||{}).value||'').trim();
    const head=[`วาร์ฟาริน (Warfarin) เม็ดละ ${fmtN(cur.s)} มิลลิกรัม${tm?` · รับประทาน${tm.replace(/^รับประทาน/,'')}`:''}`,...lines];
    const top=44+head.length*20+30, H=top+rows*CH+8;
    let g=`<rect width="${W}" height="${H}" fill="#fff"/><text x="${W/2}" y="28" font-size="20" font-weight="700" text-anchor="middle" fill="#0f172a">${TH_MON[m0]} ${y0+543}</text>`;
    head.forEach((t,i)=>g+=`<text x="${W/2}" y="${52+i*20}" font-size="${i?14:14.5}" font-weight="${i?600:700}" text-anchor="middle" fill="${i?'#1e293b':'#b45309'}">${esc(t)}</text>`);
    WD.forEach((d,i)=>g+=`<rect x="${i*CW}" y="${top-28}" width="${CW}" height="26" fill="${i>4?'#fef3c7':'#e0e7ff'}"/><text x="${i*CW+CW/2}" y="${top-10}" font-size="14" font-weight="700" text-anchor="middle" fill="#1e293b">${DAY_TH[d]}</text>`);
    for(let k=0;k<rows*7;k++){ const day=k-lead+1, x=(k%7)*CW, y=top+Math.floor(k/7)*CH; if(day<1||day>dim){ g+=`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="#f8fafc" stroke="#cbd5e1"/>`; continue; }
      const dt=new Date(y0,m0,day), c=info.get(key(dt)), isAp=key(dt)===key(ap);
      const fill=isAp?'#fee2e2':c?(c.u?'#fff':'#e2e8f0'):'#f8fafc';
      g+=`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="${fill}" stroke="#94a3b8"/>`;
      g+=`<text x="${x+6}" y="${y+16}" font-size="14" font-weight="700" fill="${c||isAp?'#0f172a':'#94a3b8'}">${day}</text>`;
      if(c){ g+=`<text x="${x+CW-6}" y="${y+15}" font-size="10.5" text-anchor="end" fill="#2563eb" font-weight="700">วันที่ ${c.n}</text>`;
        if(c.u){ g+=wfPillSvg(x+CW/2,y+36,c.u)+`<text x="${x+CW/2}" y="${y+63}" font-size="13" font-weight="700" text-anchor="middle" fill="#0f172a">${wfDayTxt(c.u)} เม็ด</text>`; }
        else g+=`<text x="${x+CW/2}" y="${y+46}" font-size="14" font-weight="700" text-anchor="middle" fill="#64748b">หยุดยา</text>`;
        if(c.n===1) g+=`<rect x="${x+1.5}" y="${y+1.5}" width="${CW-3}" height="${CH-3}" fill="none" stroke="#16a34a" stroke-width="3"/><text x="${x+5}" y="${y+30}" font-size="10" fill="#16a34a" font-weight="700">เริ่ม</text>`;
        if(c.n===N) g+=`<rect x="${x+1.5}" y="${y+1.5}" width="${CW-3}" height="${CH-3}" fill="none" stroke="#d97706" stroke-width="3" stroke-dasharray="6 3"/><text x="${x+4}" y="${y+30}" font-size="9.5" fill="#b45309" font-weight="700">สุดท้าย</text>`; }
      if(isAp) g+=`<text x="${x+CW/2}" y="${y+44}" font-size="13" font-weight="700" text-anchor="middle" fill="#b91c1c">นัด/เจาะ INR</text>`; }
    svgs.push(`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;margin:0 0 10px;border-radius:8px" role="img" aria-label="ปฏิทิน ${TH_MON[m0]}" font-family="Sarabun,Tahoma,sans-serif">${g}</svg>`);
    m0++; if(m0>11){ m0=0; y0++; } }
  return {svgs,html:svgs.join(''),list,s0,N,last,ap,auto:!st}; }


function wfRead(k){const s=+$(`w_${k}_s`).value; const u=WD.map(d=>$(`w_${k}_${d}`).value===''?null:+$(`w_${k}_${d}`).value); return {s,u,any:u.some(x=>x!=null)};}
function renderWf(){
  const o=wfRead('old'), n=wfRead('new'), pt=getPt(), msgs=[], kv=[], li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`;
  wfAdjRender();
  if(!n.any&&!o.any){$('wOut').innerHTML='<div class="empty">กรอกจำนวนเม็ดในแต่ละวัน หรือวางคำสั่งยา</div>';return}
  const mgw=r=>r.u.reduce((a,x)=>a+(x||0)*r.s,0), tw=r=>r.u.reduce((a,x)=>a+(x||0),0);
  const cur=n.any?n:o;
  if(o.any) kv.push(['เดิม',`${fmtN(mgw(o))} mg/สัปดาห์ (${fmtN(tw(o))} เม็ด ${o.s} mg)`]);
  if(n.any) kv.push(['ใหม่',`${fmtN(mgw(n))} mg/สัปดาห์ (${fmtN(tw(n))} เม็ด ${n.s} mg)`]);
  if(o.any&&n.any&&mgw(o)>0){const ch=(mgw(n)-mgw(o))*100/mgw(o); kv.push(['เปลี่ยนแปลง',`${ch>=0?'+':''}${fmtN(ch)}%`]); if(Math.abs(ch)>20) msgs.push(li('warn',`ปรับขนาด ${fmtN(ch)}% ต่อสัปดาห์ — มากกว่าช่วงในตารางปรับยา (สูงสุด 20%) ยืนยันกับแพทย์`));}
  const miss=WD.filter((d,i)=>cur.u[i]==null); if(miss.length&&miss.length<7) msgs.push(li('warn',`ไม่ได้ระบุวัน ${miss.map(d=>DAY_TH[d]).join(', ')} — นับเป็นหยุดยา (ใส่ 0 ถ้าตั้งใจหยุด)`));
  const mx=Math.max(...cur.u.map(x=>(x||0)*cur.s)); if(mx>10) msgs.push(li('warn',`วันที่สูงสุด ${fmtN(mx)} mg (>10 mg/วัน) — ยืนยันขนาด`));
  if(cur.u.some(x=>x&&Math.abs(x*2-Math.round(x*2))>1e-9)) msgs.push(li('warn','มีขนาดที่ไม่ใช่ทวีคูณของครึ่งเม็ด — แบ่งเม็ดยาไม่ได้'));
  // dispensing
  const st=tlDate($('wStart').value,'0:00'), wk=+$('wWeeks').value, un=tlDate($('wUntil').value,'0:00');
  let days=null, big=null;
  if(st&&un) days=Math.round((un-st)/864e5); else if(wk>0) days=Math.round(wk*7);
  if(days>0){ let tot=0, cnt={}; if(st){ for(let i=0;i<days;i++){const d=new Date(st.getTime()+i*864e5); const k=WD[(d.getDay()+6)%7]; tot+=cur.u[WD.indexOf(k)]||0; cnt[k]=(cnt[k]||0)+1;} }
    else tot=tw(cur)*days/7;
    big=Math.ceil(tot-1e-9);
    kv.push(['ช่วงที่จ่าย',st?`${tlFmt(st,false)} – ${tlFmt(new Date(st.getTime()+(days-1)*864e5),false)} (${days} วัน)`:`${days} วัน (${fmtN(days/7)} สัปดาห์)`]);
    kv.push(['ต้องกินรวม',`${fmtN(tot)} เม็ด`],['จ่าย',`${big} เม็ด ${cur.s} mg`]);
    if(!st&&days%7) msgs.push(li('info','ไม่ครบสัปดาห์ — กรอกวันเริ่มเพื่อนับตามวันจริง'));
    if(st) msgs.push(li('info',`นับตามวันจริง: ${WD.filter(d=>cnt[d]&&cur.u[WD.indexOf(d)]).map(d=>`${DAY_TH[d]} ${fmtN(cur.u[WD.indexOf(d)])} เม็ด × ${cnt[d]} วัน`).join(' · ')}`)); }
  else kv.push(['จ่าย 1 / 2 / 4 สัปดาห์',`${Math.ceil(tw(cur)-1e-9)} / ${Math.ceil(tw(cur)*2-1e-9)} / ${Math.ceil(tw(cur)*4-1e-9)} เม็ด`]);
  let conv='';
  if(cur.s!==WF_HOSP){ const c=wfTo3(cur.u.map(x=>(x||0)*cur.s)); 
    msgs.push(li(Math.abs(c.pct)>10?'flag':'warn',`สูตรนี้ใช้เม็ด ${cur.s} mg (รพ.อื่น) — รพ.มค มีเฉพาะ ${WF_HOSP} mg: เทียบได้ ${fmtN(c.W3)} mg/สัปดาห์ (เดิม ${fmtN(c.W)} mg, ${c.pct>=0?'+':''}${fmtN(c.pct)}%)${c.exact?' แบ่งได้พอดีทุกวัน':' — บางวันขนาดเปลี่ยน ยืนยันกับแพทย์'}`));
    const st2=tlDate($('wStart').value,'0:00'); let tot3=null; if(days>0){ tot3=0; if(st2){for(let i=0;i<days;i++){const d=new Date(st2.getTime()+i*864e5); tot3+=c.u[(d.getDay()+6)%7];}} else tot3=c.u.reduce((a,x)=>a+x,0)*days/7; }
    conv=`<h2 style="margin-top:16px">เทียบเป็นเม็ด ${WF_HOSP} mg ของ รพ.มค</h2><table style="border-collapse:collapse;width:100%;text-align:center;font-size:14px;margin-bottom:8px"><tr>${WD.map(d=>`<th>${DAY_TH[d]}</th>`).join('')}</tr>
      <tr style="color:var(--muted)">${cur.u.map(x=>`<td>${fmtN((x||0)*cur.s)} mg</td>`).join('')}</tr><tr style="font-weight:600">${c.u.map(x=>`<td>${fmtN(x)} เม็ด</td>`).join('')}</tr></table>
      <dl class="kv"><dt>รวม</dt><dd>${fmtN(c.W3)} mg/สัปดาห์ (${fmtN(c.u.reduce((a,x)=>a+x,0))} เม็ด)</dd>${tot3!=null?`<dt>จ่าย (${days} วัน)</dt><dd><b>${Math.ceil(tot3-1e-9)} เม็ด ${WF_HOSP} mg</b></dd>`:''}</dl>
      <button class="btn sm" id="wUse3" type="button" style="margin-top:8px">ใช้เป็นสูตรใหม่ (${WF_HOSP} mg)</button>`; }
  const cal=cur.any?wfCal(cur,st,days,un):null; let wfCalBox='';
  if(cal){ const pat=wfPatTxt(cur.u.map(x=>x||0)), first=cal.list.slice(0,7);
    wfCalBox=`<h2 style="margin-top:16px">${n.any?'สูตรใหม่':'สูตร'} — วันที่ 1 = ${DAY_TH[WD[(cal.s0.getDay()+6)%7]]} ${tlFmt(cal.s0,false)}</h2>
     ${cal.auto?'<p class="hint" style="margin:0 0 6px">ยังไม่กรอกวันเริ่มกินยาสูตรใหม่ — ใช้วันนี้เป็นวันที่ 1</p>':''}
     <div style="margin-bottom:6px">${esc(pat)} (เม็ด ${cur.s} mg · ${fmtN(mgw(cur))} mg/สัปดาห์)</div>
     <ol style="margin:0 0 10px;padding-left:0;list-style:none;columns:2;font-size:14px">${first.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>
     <h2 style="margin-top:6px">ปฏิทินกินยา Warfarin (${cal.N} วัน · ${tlFmt(cal.s0,false)} – ${tlFmt(cal.last,false)} · ${cal.svgs.length} เดือน)</h2>
     <div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px"><button class="btn sm pri" id="wCalPr" type="button">พิมพ์ปฏิทิน / บันทึก PDF</button><button class="btn sm" id="wCalPng" type="button">บันทึกรูป PNG</button><button class="btn sm" id="wCalImg" type="button">คัดลอกรูป</button><button class="btn sm" id="wCalCp" type="button">คัดลอกข้อความรายวัน</button><span class="toast" id="wCalMsg"></span></div>
     <div id="wCal">${cal.html}</div>
     <p class="hint" style="margin:4px 0 0">กรอบเขียว = วันที่ 1 (เริ่ม) · กรอบส้มประ = วันสุดท้ายที่มียา · ช่องเทา = หยุดยา · ช่องแดง = วันนัด (ช่อง "ถึงวันนัด" หรือวันถัดจากวันสุดท้าย) · พิมพ์: เลือกเครื่องพิมพ์ หรือ "บันทึกเป็น PDF" ในหน้าต่างพิมพ์ — 2 เดือนต่อหน้า A4</p>`; }
  if(pt.inr!=null){const t=+$('wTgt').value, row=WF_ADJ[t].find(r=>pt.inr<r[0]); msgs.push(li(pt.inr>=(t===2?4:4.5)?'flag':pt.inr>(t===2?3:3.5)||pt.inr<t?'warn':'ok',`INR ${pt.inr} (เป้าหมาย ${t===2?'2.0-3.0':'2.5-3.5'}): ${row[1]}`));}
  else msgs.push(li('info','กรอก INR ในแผงข้อมูลผู้ป่วย เพื่อดูคำแนะนำปรับขนาดตามตาราง'));
  $('wOut').innerHTML=`<h2>ผลคำนวณ</h2>${big!=null?`<div class="big" style="margin-bottom:12px"><span class="n">${big}</span><span class="u">เม็ด ${cur.s} mg ที่ต้องจ่าย</span></div>`:''}
   <dl class="kv" style="margin-bottom:12px">${kv.map(([a,x])=>`<dt>${a}</dt><dd>${x}</dd>`).join('')}</dl><ul class="msgs">${msgs.join('')}</ul>${conv}${wfCalBox}`;
  if(cal&&$('wCalCp')){ const pat=wfPatTxt(cur.u.map(x=>x||0)), txt=`Warfarin ${cur.s} mg — ${pat} (${fmtN(mgw(cur))} mg/สัปดาห์)\nเริ่มวันที่ 1 = ${tlFmt(cal.s0,false)}\n`+cal.list.join('\n');
    $('wCalCp').onclick=()=>copyRich(txtHtml(txt),txt,$('wCalMsg'));
    const hd=`<div class="mkt" style="margin-bottom:2mm">ปฏิทินการกินยา Warfarin (วาร์ฟาริน) เม็ดละ ${cur.s} mg</div><p style="margin:0 0 1mm">${fmtN(mgw(cur))} mg/สัปดาห์ · เริ่มกินวันที่ 1 = ${tlFmt(cal.s0,false)} ถึง ${tlFmt(cal.last,false)} (${cal.N} วัน) · นัดครั้งต่อไป ${tlFmt(cal.ap,false)}</p><p style="margin:0 0 2mm;font-size:12px">🟠 = 1 เม็ด · ◐ = ครึ่งเม็ด · ช่องเทา = หยุดยา · กินเวลาเดิมทุกวัน · ลืมกิน: กินทันทีที่นึกได้ภายในวันเดียวกัน ถ้าข้ามวันแล้วให้ข้ามไป ห้ามกินเพิ่มเป็น 2 เท่า · เลือดออกผิดปกติ/อุจจาระดำ ให้รีบมาโรงพยาบาล</p>`;
    const pages=[]; for(let i=0;i<cal.svgs.length;i+=2) pages.push(cal.svgs.slice(i,i+2).map(x=>x.replace('style="width:100%;','style="width:100%;max-height:118mm;')).join(''));
    $('wCalPr').onclick=()=>printHtml(pages.map((pg,i)=>`<div class="mk" style="${i?'page-break-before:always;':''}">${hd}${pg}${i===pages.length-1?'<p style="margin-top:2mm">ผู้จ่ายยา ............................ โทร ............................</p>':''}</div>`).join(''));
    const svgEls=()=>[...$('wCal').querySelectorAll('svg')];
    $('wCalPng').onclick=()=>saveImg(svgEls(),`warfarin-calendar-${tlFmt(cal.s0,false).replace(/\//g,'')}.png`,$('wCalMsg'));
    $('wCalImg').onclick=()=>copyImg(svgEls(),$('wCalMsg')); }
  if($('wUse3')) $('wUse3').onclick=()=>{const c=wfTo3(cur.u.map(x=>(x||0)*cur.s)); if(n.any&&o.any===false){WD.forEach((d,i)=>$('w_old_'+d).value=n.u[i]??''); $('w_old_s').value=n.s;} else if(n.any){WD.forEach((d,i)=>$('w_old_'+d).value=n.u[i]??''); $('w_old_s').value=n.s;} $('w_new_s').value=String(WF_HOSP); WD.forEach((d,i)=>$('w_new_'+d).value=c.u[i]); renderWf();};
}
// วางคำสั่งยา Warfarin (หลายบรรทัด) → เติมตารางเดิม/ใหม่
function wfRowOf(r,L){ if(!r) return null; const s=(r.weekly&&r.weekly.mgU)||r.strength||(()=>{const m=L.match(/warfarin[^\n]*?(\d+(?:\.\d+)?)\s*mg/i);return m?+m[1]:null;})(); const u=Array(7).fill(null);
  if(r.weekly){ r.weekly.segs.filter(x=>!x.noDays&&x.units!=null).forEach(x=>x.days.forEach(d=>u[WD.indexOf(d)]=x.units*(x.tpd||1))); (r.weekly.off||[]).forEach(d=>u[WD.indexOf(d)]=0); }
  else { let un=r.doseUnit==='unit'?+r.doseVal:(s&&r.doseVal?+r.doseVal/s:null); if(un==null||isNaN(un)||!r.F) return null; const per=un*r.F; if(Math.abs(r.F-1)>0.01&&r.F<1) return null; u.fill(per); }
  return {s,u,disp:dispOf(L)}; }
function wfSet(k,x){ if(x.s&&[...$(`w_${k}_s`).options].some(o=>+o.value===x.s)) $(`w_${k}_s`).value=String(x.s); WD.forEach((d,i)=>$(`w_${k}_${d}`).value=x.u[i]==null?'':x.u[i]); }
function wfParse(){ const raw=$('wOrder').value; if(!raw.trim()) return;
  const lines=joinLines(raw.split(/\n/)); const hits=[];
  lines.forEach(L=>{ if(!/warfarin|orfarin|มาร์ฟาริน|วาร์ฟาริน/i.test(L)) return; const r=parseLine(L); const x=wfRowOf(r,L); if(x) hits.push({...x,L,tag:/เดิม|\bold\b|ก่อนปรับ/i.test(L)?'old':/ใหม่|\bnew\b|ปรับเป็น/i.test(L)?'new':null}); });
  if(!hits.length){ $('wMsg').textContent='ไม่พบคำสั่ง Warfarin ที่อ่านได้ — ตรวจรูปแบบคำสั่ง หรือกรอกเองในตาราง'; return; }
  const to=(document.querySelector('input[name="wTo"]:checked')||{}).value||'auto'; const done=[];
  if(to!=='auto'){ wfSet(to,hits[hits.length-1]); done.push(to==='old'?'เดิม':'ใหม่'); }
  else if(hits.length===1){ const k=hits[0].tag||'new'; wfSet(k,hits[0]); done.push(k==='old'?'เดิม':'ใหม่'); }
  else { const o=hits.find(h=>h.tag==='old')||hits[0], n=hits.find(h=>h.tag==='new')||hits[hits.length-1]; wfSet('old',o); wfSet('new',n); done.push('เดิม','ใหม่'); }
  const dp=hits[hits.length-1].disp; if(dp) $('wWeeks').value=+(dp.days/7).toFixed(2);
  { const L=hits[hits.length-1].L, t=/ก่อนนอน|\bhs\b/i.test(L)?'ก่อนนอน':/หลังอาหารเย็น|\bpc\s*(?:เย็น|dinner)/i.test(L)?'หลังอาหารเย็น':/หลังอาหารเช้า/.test(L)?'หลังอาหารเช้า':/เย็น/.test(L)?'ตอนเย็น':null; if(t) $('wTime').value=`วันละ 1 ครั้ง ${t}`; }
  const miss=hits.some(h=>h.u.some(v=>v==null));
  $('wMsg').textContent=`อ่านได้ ${hits.length} รายการ → แถว${done.join(' + ')}${hits.length>2?' (มีมากกว่า 2 รายการ ใช้รายการแรก/สุดท้าย)':''}${miss?' · บางวันไม่ได้ระบุ (ช่องว่าง)':''} — ตรวจตัวเลขในตารางก่อนใช้`;
  $('wOrder').value=''; renderWf(); }
$('wParse').onclick=wfParse; $('wOrder').addEventListener('paste',()=>setTimeout(wfParse,0));
$('wClr').onclick=()=>{ ['old','new'].forEach(k=>{ WD.forEach(d=>$(`w_${k}_${d}`).value=''); $(`w_${k}_s`).value=String(WF_HOSP); }); $('wWeeks').value=''; $('wMsg').textContent=''; $('wAdj')&&($('wPct').value=''); renderWf(); };
['wStart','wWeeks','wUntil','wTgt','wTime'].forEach(id=>$(id).addEventListener('input',renderWf)); $('wPct').addEventListener('change',renderWf); $('wPctB').innerHTML=WF_PCTS.map(v=>`<button type="button" class="btn sm" data-wp="${v}">${v>0?'+':''}${v}%</button>`).join(''); $('wPctB').querySelectorAll('[data-wp]').forEach(b=>b.onclick=()=>{ $('wPct').value=b.dataset.wp; renderWf(); }); $('wPct').addEventListener('input',renderWf); $('wTgt').addEventListener('change',renderWf);
['old','new'].forEach(k=>{$(`w_${k}_s`).addEventListener('change',renderWf); WD.forEach(d=>$(`w_${k}_${d}`).addEventListener('input',renderWf));});
$('t-wf').addEventListener('click',renderWf); $('inr').addEventListener('input',()=>{if(!$('p-wf').hidden)renderWf();});
renderWf();

$('ageIn').addEventListener('input',ageSync); $('ageU').addEventListener('change',ageSync);

/* ---------- กล่องผล Lab ---------- */
(function(){ const g=$('labGrid'); if(!g) return;
  const GRP={bun:'renal',uric:'renal',cpk:'liver',alp:'liver',plt:'coag',ast:'liver',alt:'liver',tbil:'liver',dbil:'liver',alb:'liver',na:'lyte',ca:'lyte',phos:'lyte',hco3:'lyte'};
  LAB_EXTRA.forEach(([k,n,un])=>{ const host=$('lg-'+(GRP[k]||'cbc'))||g; host.insertAdjacentHTML('beforeend',`<label class="f"><span>${n}${un?` <small>(${un})</small>`:''}</span><input id="L_${k}" type="number" inputmode="decimal" step="any"></label>`); });
  LAB_EXTRA.forEach(([k])=>$('L_'+k).addEventListener('input',()=>{renderRows(); if(!$('p-cmt').hidden) renderCmt();}));
  $('labParse').onclick=()=>{ const v=labParse($('labPaste').value); let n=0;
    LAB_DEF.forEach(([k,,,,fld])=>{ if(v[k]==null) return; const el=$(fld||('L_'+k)); if(el){ el.value=v[k]; n++; } });
    $('labMsg').textContent=n?`อ่านได้ ${n} ค่า — ตรวจตัวเลขก่อนใช้`:'อ่านค่าไม่ได้ — กรอกเองในช่อง';
    if(v.egfrIn==null&&v.crclIn==null&&v.scr!=null) {} renderRows(); if(!$('p-cmt').hidden) renderCmt(); };
  $('labClear').onclick=()=>{ LAB_EXTRA.forEach(([k])=>$('L_'+k).value=''); $('labPaste').value=''; $('labMsg').textContent=''; renderRows(); };
})();

/* ---------- แท็บเคมีบำบัด ---------- */
let cmtOrd={}, cmtF={}, cmtExtra=[], cmtRaw={};
function renderCmt(){ const pt=getPt(); const r=CHEMO_REG.find(x=>x.id===$('cReg').value)||CHEMO_REG[0];
  const auc=+$('cAuc').value||5, g=carboGfr(pt), L=pt.lab||{};
  const head=[];
  head.push(`<div class="kv2">BSA (Mosteller) <b>${pt.bsa?pt.bsa.toFixed(2)+' m²':'– ใส่ส่วนสูง+น้ำหนัก'}</b> · BW <b>${pt.bw||'–'}</b> kg · CrCl <b>${pt.crcl!=null?r1(pt.crcl):'–'}</b> · ANC <b>${L.anc!=null?fmtN(Math.round(L.anc)):'–'}</b> · Plt <b>${L.plt!=null?fmtN(L.plt):'–'}</b></div>`);
  const al=[]; if(L.anc!=null&&L.anc<1500) al.push(['f',`ANC ${fmtN(Math.round(L.anc))} <1,500 — ตรวจเกณฑ์ก่อนให้ยา ⚑`]); if(L.plt!=null&&L.plt<100000) al.push(['w',`Platelet ${fmtN(L.plt)} <100,000 ⚑`]); if(L.anc==null) al.push(['','ยังไม่มี ANC — ใส่ WBC และ Neutrophil (%) ในกล่องผล Lab (แผงซ้าย)']);
  if(L.tbil!=null&&L.tbil>3) al.push(['w',`Total bilirubin ${L.tbil} — พิจารณาปรับขนาดยาที่ขับทางตับ`]);
  const rows=r.d.map((x,i)=>{ const [n,v,t,day,note]=x; let calc=null,basis='';
    if(t==='m2'||t==='m2day'){ basis=`${v} mg/m²${t==='m2day'?'/วัน':''}`; if(pt.bsa) calc=v*pt.bsa; }
    else if(t==='kg'){ basis=`${v} mg/kg`; if(+pt.bw>0) calc=v*pt.bw; }
    else if(t==='auc'){ basis=`AUC ${auc} × (GFR+25)`; if(g!=null) calc=auc*(g+25); }
    let cap=''; if(/vincristine/i.test(n)&&calc>2){ cap=' → cap 2 mg'; calc=2; }
    const ord=+(cmtOrd[i]||0), F=t==='m2day'?(+cmtF[i]||2):1, ordCmp=ord*F;
    let st='', back='';
    if(ord>0){ // คำนวณย้อนกลับ
      if(t==='m2'||t==='m2day'){ if(pt.bsa) back=`${fmtN(Math.round(ordCmp/pt.bsa*10)/10)} mg/m²${t==='m2day'?'/วัน':''}`; }
      else if(t==='kg'){ if(+pt.bw>0) back=`${fmtN(Math.round(ord/pt.bw*100)/100)} mg/kg`; }
      else if(t==='auc'){ if(g!=null) back=`AUC ${fmtN(Math.round(ord/(g+25)*10)/10)}`; }
      if(t==='m2day') back+=` (${fmtN(ord)} mg × ${F}/วัน)`; }
    if(calc&&ord>0){ const d=(ordCmp-calc)/calc*100; let lv=Math.abs(d)<=CHEMO_TOL?'ok':Math.abs(d)<=10?'warn':'flag';
      if(/vincristine/i.test(n)&&ord>2) lv='flag';
      st=`<span class="tag ${lv}">${lv==='ok'?'OK':lv==='warn'?'ทบทวน':'ปรับ'}</span> ${d>0?'+':''}${fmtN(Math.round(d*10)/10)}%${/vincristine/i.test(n)&&ord>2?' · เกิน max 2 mg':''}`; }
    return `<tr><td><b>${esc(n)}</b>${note?`<div class="hint">${esc(note)}</div>`:''}${cmtRaw[i]?`<div class="hint mono">${esc(cmtRaw[i])}</div>`:''}</td><td>${basis}</td><td class="num"><b>${calc!=null?fmtN(Math.round(calc*10)/10)+' mg':'–'}</b>${cap}${t==='m2day'&&calc?`<div class="hint">ครั้งละ ${fmtN(Math.round(calc/2))} mg วันละ 2 ครั้ง</div>`:''}</td><td>${esc(day||'')}</td><td><input id="cOrd${i}" data-i="${i}" type="number" inputmode="decimal" step="any" style="width:100px" value="${ord>0?ord:''}">${t==='m2day'?`<div class="hint">ต่อครั้ง</div>`:''}</td><td class="num">${back||'–'}</td><td>${st}</td></tr>`; }).join('');
  const ex=cmtExtra.length?`<div class="band w">ยาเคมีบำบัดในคำสั่งที่ไม่อยู่ในสูตร ${esc(r.name)}: ${cmtExtra.map(x=>esc(x.drug+' '+(x.dose!=null?fmtN(x.dose)+' mg':''))+(pt.bsa&&x.dose?` (= ${fmtN(Math.round(x.dose/pt.bsa*10)/10)} mg/m²)`:'')).join(' · ')} — ตรวจว่าเลือกสูตรถูกหรือไม่</div>`:'';
  $('cOut').innerHTML=head.join('')+al.map(([c,t])=>`<div class="band ${c}">${esc(t)}</div>`).join('')+ex+
   `<div style="overflow-x:auto"><table class="ctbl"><thead><tr><th>ยา</th><th>ขนาดตามสูตร</th><th>คำนวณได้</th><th>วัน</th><th>แพทย์สั่ง (mg)</th><th>คำนวณย้อนกลับ</th><th>ผล (±${CHEMO_TOL}%)</th></tr></thead><tbody>${rows}</tbody></table></div>`+
   (r.note?`<p class="hint">${esc(r.note)}</p>`:'')+`<p class="hint">ที่มา: ${SRC_CMT} · BSA Mosteller = √(ส่วนสูง × น้ำหนัก / 3600) · Carboplatin: Calvert AUC × (GFR + 25) ใช้ CrCl cap 125 ⚑ · เกณฑ์ ANC ≥1,500 / Plt ≥100,000 และ ±${CHEMO_TOL}% เป็นเกณฑ์ทั่วไป ⚑</p>`;
  $('cOut').querySelectorAll('input[id^="cOrd"]').forEach(el=>el.addEventListener('change',()=>{cmtOrd[el.dataset.i]=el.value;renderCmt();}));
}
function cmtParse(){
  const rows=joinLines($('cPaste').value.split(/\n/)).map(parseLine).filter(Boolean);
  const items=[]; rows.forEach(row=>{ const mm=masterOf(row); const s=row.raw+' '+(mm?mm[1]+' '+mm[2]:'');
    const h=CHEMO_MATCH.find(([,re])=>re.test(s)); if(!h) return;
    const cd=chemoDose(row); items.push({drug:h[0],dose:cd.mg??(cd.perM2&&getPt().bsa?Math.round(cd.perM2*getPt().bsa*10)/10:null),F:row.F,raw:row.raw}); });
  if(!items.length){ $('cMsg').textContent='ไม่พบยาเคมีบำบัดในคำสั่ง'; return; }
  const names=[...new Set(items.map(x=>x.drug))];
  const score=r=>{const rs=new Set(r.d.map(x=>chemoBase(x[0]))); const hit=names.filter(n=>rs.has(n)).length; return [hit, -(rs.size-hit)];};
  const best=[...CHEMO_REG].sort((a,b)=>{const A=score(a),B=score(b);return B[0]-A[0]||B[1]-A[1];})[0];
  $('cReg').value=best.id; cmtOrd={}; cmtF={}; cmtRaw={};
  const used=new Set();
  best.d.forEach((x,i)=>{ const base=chemoBase(x[0]); const cand=items.filter((it,k)=>it.drug===base&&!used.has(k));
    let pick=cand[0];
    if(cand.length>1){ const bol=/push|bolus/i.test(x[0]), inf=/hr|infus/i.test(x[0]);
      pick=cand.find(it=>bol?/push|bolus/i.test(it.raw):inf?/\d+\s*(hr|h|ชม)|infus|drip/i.test(it.raw)&&!/push|bolus/i.test(it.raw):true)||cand[0]; }
    if(pick){ const k=items.indexOf(pick); used.add(k); if(pick.dose!=null) cmtOrd[i]=pick.dose; if(pick.F) cmtF[i]=pick.F; cmtRaw[i]=pick.raw; } });
  cmtExtra=items.filter((_,k)=>!used.has(k));
  $('cMsg').textContent=`พบยาเคมีบำบัด ${items.length} รายการ → เลือกสูตร ${best.name} ให้อัตโนมัติ (เปลี่ยนสูตรได้)`;
  renderCmt();
}
(function(){ if(!$('cReg')) return;
  $('cReg').innerHTML=[...new Set(CHEMO_REG.map(r=>r.ca))].map(ca=>`<optgroup label="${ca}">${CHEMO_REG.filter(r=>r.ca===ca).map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</optgroup>`).join('');
  $('cReg').addEventListener('change',()=>{ cmtOrd={}; cmtF={}; cmtRaw={}; cmtExtra=[]; renderCmt(); }); $('cParse').onclick=cmtParse; $('cClr').onclick=()=>{$('cPaste').value='';$('cMsg').textContent='';cmtOrd={};cmtF={};cmtRaw={};cmtExtra=[];renderCmt();}; $('cAuc').addEventListener('input',renderCmt);
  $('t-cmt').addEventListener('click',renderCmt);
  ['bw','ht','scr','crclIn','age'].forEach(id=>$(id).addEventListener('input',()=>{ if(!$('p-cmt').hidden) renderCmt(); }));
})();
