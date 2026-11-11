/* ===== crrt.js — CRRT: ปริมาณน้ำยาต่อวัน · สูตรน้ำยา 25 สูตร (ใบสั่ง CRRT รพ.มหาสารคาม) · จำนวนยาที่ต้องเตรียม/จ่าย =====
 สูตรในตารางคิดต่อ 1,000 ml (ผลรวมทุกช่อง = 1,000 ml) — Final = Na (mEq/L) ของน้ำยาที่ผสมแล้ว
 Na: 7.5% NaHCO3 0.893 · 0.45% NaCl 0.077 · 0.9% NaCl 0.154 · 3% NaCl 0.513 mEq/ml
 ✓ ตรวจกับใบสั่ง CRRT ฉบับจริง (11/11/69) ครบ 25 สูตร — สูตร 22: ภาพอ่าน SW 250 แต่ผลรวมต้อง 1,000 ml และ Na 160.1 จึงเป็น SW 200
*/
const CRRT_NA={b:0.893,h:0.077,n:0.154,s:0.513};
const CRRT_PH=['>7.46','7.36-7.45','7.21-7.35','7.00-7.20','<7.00'];
const CRRT_NAG=['110-120','121-130','131-150','151-160','161-170'];
// [bicarb 7.5%, 0.45%NaCl, 0.9%NaCl, 3%NaCl, SW, Final Na ในใบสั่ง, ยืนยันจากภาพ]
const CRRT_F=[
 [25,0,650,0,325,122.4,1],[50,0,500,0,450,121.6,1],[75,700,0,0,225,120.8,1],[100,0,200,0,700,120,1],[135,0,0,0,865,120.4,1],
 [25,0,700,0,275,130.1,1],[50,0,550,0,400,129.3,1],[75,0,400,0,525,128.5,1],[100,0,0,80,820,130.2,1],[150,0,0,0,850,133.8,1],
 [25,0,775,0,200,141.7,1],[50,900,0,50,0,139.6,1],[75,925,0,0,0,138.1,1],[100,0,0,100,800,140.5,1],[150,0,50,0,800,141.5,1],
 [25,0,850,0,125,153.2,1],[50,0,700,0,250,152.4,1],[75,0,550,0,375,151.6,1],[100,0,400,0,500,150.8,1],[150,0,100,0,750,149.2,1],
 [25,0,900,0,75,160.9,1],[50,0,750,0,200,160.1,1],[75,0,600,0,325,159.3,1],[100,0,450,0,450,158.5,1],[150,0,0,50,800,159.5,1]];
const crrtNa=f=>f[0]*CRRT_NA.b+f[1]*CRRT_NA.h+f[2]*CRRT_NA.n+f[3]*CRRT_NA.s;
function crrtPick(na,ph){ if(na==null||ph==null) return null; const g=na<=120?0:na<=130?1:na<=150?2:na<=160?3:4; const p=ph>=7.46?0:ph>=7.36?1:ph>=7.21?2:ph>=7.00?3:4; return g*5+p+1; }
const CRRT_STOCK={b:['7.5% NaHCO3',50,'amp'],h:['0.45% NaCl',1000,'ถุง'],n:['0.9% NaCl',1000,'ขวด'],s:['3% NaCl',500,'ขวด'],w:['SWI',1000,'ถุง'],k:['KCl (20 mEq/10 ml)',10,'amp']};
function crrtV(id){ const v=($(id)||{}).value; return v===''||v==null?null:+v; }
function renderCrrt(){ const out=$('crOut'); if(!out) return;
  const wt=crrtV('cWt'), dose=crrtV('cDose'), pre=crrtV('cPre')||0, post=crrtV('cPost')||0, qd=crrtV('cQd')||0, hrs=crrtV('cHr')||24, setL=crrtV('cSet')||1, kL=crrtV('cK')||0, fno=crrtV('cF');
  const flow=pre+post+qd, mode=$('cMode').value, na=crrtV('cNa'), ph=crrtV('cPh'), sug=crrtPick(na,ph);
  $('cSug').innerHTML=sug?`แนะนำตามตาราง: <b>สูตร ${sug}</b> (Na ${na} · pH ${ph})${fno&&fno!==sug?` — <span style="color:var(--warn)">ใบสั่งเลือกสูตร ${fno}</span>`:''}`:'<span class="hint">กรอก Na และ pH เพื่อดูสูตรที่ตรงตาราง</span>';
  const L=[], li=(l,m)=>L.push(`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`), kv=[];
  let totMl=null, src='';
  if(flow>0){ totMl=flow*hrs; src=`(Pre ${fmtN(pre)} + Post ${fmtN(post)} + Dialysate ${fmtN(qd)}) = ${fmtN(flow)} ml/hr × ${fmtN(hrs)} ชม.`; }
  else if(wt&&dose){ totMl=dose*wt*hrs; src=`${fmtN(dose)} ml/kg/hr × ${fmtN(wt)} kg × ${fmtN(hrs)} ชม.`; }
  if(wt&&dose){ kv.push(['CRRT dose ที่สั่ง',`${fmtN(dose)} ml/kg/hr × ${fmtN(wt)} kg = <b>${fmtN(dose*wt)}</b> ml/hr`]); }
  if(flow>0&&wt){ const del=flow/wt; kv.push(['Dose จากอัตราไหล',`${fmtN(flow)} ml/hr ÷ ${fmtN(wt)} kg = <b>${fmtN(Math.round(del*10)/10)}</b> ml/kg/hr`]);
    if(dose&&Math.abs(flow-dose*wt)/(dose*wt)>0.1) li('warn',`ผลรวมอัตราไหล ${fmtN(flow)} ml/hr ต่างจาก dose ที่สั่ง ${fmtN(dose*wt)} ml/hr เกิน 10% — ยืนยันกับแพทย์ (ใช้อัตราไหลคำนวณน้ำยา)`);
    if(pre>0&&flow) li('info',`Pre-dilution ${fmtN(Math.round(pre/flow*100))}% ของน้ำยาแทนที่ทั้งหมด — dose ที่ได้ผลจริงต่ำกว่าค่าที่คำนวณ (ทั่วไปตั้งเป้าสั่ง 25–30 ml/kg/hr เพื่อให้ได้จริง ≥20–25)`); }
  // ---- dose จริง (effluent) · pre-dilution correction · filtration fraction · น้ำหนักจริง vs IBW (KDIGO 2012: delivered 20–25 ml/kg/hr ตามน้ำหนักจริง)
  { const abw=crrtV('cAbw'), bfr=crrtV('cBfr'), hct=crrtV('cHct'), uf=crrtV('cUf')||0, eff=flow+uf;
    if(eff>0){ const qp=bfr&&hct?bfr*60*(1-hct/100):null, cf=qp?qp/(qp+pre):null;
      kv.push(['Effluent (pre+post+dialysate+UF)',`${fmtN(pre)} + ${fmtN(post)} + ${fmtN(qd)} + ${fmtN(uf)} = <b>${fmtN(eff)}</b> ml/hr`]);
      const per=(w,lab)=>w?`${lab} ${fmtN(w)} kg → <b>${fmtN(Math.round(eff/w*10)/10)}</b>${cf?` (หลังหัก pre-dilution ×${cf.toFixed(2)} = <b>${fmtN(Math.round(eff*cf/w*10)/10)}</b>)`:''} ml/kg/hr`:'';
      const P0=getPt(), ib=P0.ibw||wt||null, bmi=P0.bmi||null, obese=abw&&ib&&((bmi!=null&&bmi>=30)||(bmi==null&&abw/ib>=1.2)), adj=obese?ib+0.4*(abw-ib):null;
      kv.push(['CRRT dose ที่ได้',[per(abw,'น้ำหนักจริง'),adj?per(Math.round(adj*10)/10,'AdjBW'):'',per(wt,'IBW')].filter(Boolean).join('<br>')||'ใส่น้ำหนัก']);
      if(adj) kv.push(['AdjBW (BMI ≥30)',`IBW ${fmtN(Math.round(ib*10)/10)} + 0.4 × (${fmtN(abw)} − ${fmtN(Math.round(ib*10)/10)}) = <b>${fmtN(Math.round(adj*10)/10)}</b> kg${bmi!=null?` <span class="hint">(BMI ${(Math.round(bmi*10)/10)})</span>`:' <span class="hint">(ไม่มีส่วนสูง — ใช้น้ำหนักจริง/IBW ≥1.2)</span>'}`]);
      if(wt&&P0.ibw&&Math.abs(wt-P0.ibw)/P0.ibw>0.05) li('warn',`IBW ในใบสั่ง ${fmtN(wt)} kg ต่างจาก IBW คำนวณจากส่วนสูง ${$('ht').value} cm (${sex==='F'?'หญิง':'ชาย'}) = ${fmtN(Math.round(P0.ibw*10)/10)} kg — ตรวจน้ำหนัก/ส่วนสูง/เพศ`);
      if(adj){ const da=eff*(cf||1)/abw, dj=eff*(cf||1)/adj, r=x=>fmtN(Math.round(x*10)/10);
        li(dj<20?'warn':da<20?'warn':'ok',`ผู้ป่วยอ้วน${bmi!=null?` (BMI ${r(bmi)})`:''}: dose ที่ได้จริง ต่อน้ำหนักจริง ~${r(da)} · ต่อ AdjBW ~${r(dj)} ml/kg/hr${dj>=20&&da<20?' — ต่อ AdjBW อยู่ในเป้า แต่ต่อน้ำหนักจริงต่ำกว่า 20 (KDIGO ไม่ระบุน้ำหนักในผู้ป่วยอ้วน หลายแห่งใช้ AdjBW) — ยืนยันน้ำหนักที่ใช้กับแพทย์':dj<20?' — ต่ำกว่าเป้า 20–25 แม้คิดจาก AdjBW':' — อยู่ในเป้า 20–25'}`); }
      const wUse=adj?null:(abw||wt); if(wUse){ const dd=eff*(cf||1)/wUse; if(dd<20) li('warn',`Dose ที่ได้จริง ~${fmtN(Math.round(dd*10)/10)} ml/kg/hr (${abw?'น้ำหนักจริง':'IBW'}) ต่ำกว่า 20 — KDIGO แนะนำ delivered 20–25 ml/kg/hr (สั่ง 25–30) คิดจากน้ำหนักจริง`); else if(dd>35) li('info',`Dose ~${fmtN(Math.round(dd*10)/10)} ml/kg/hr สูงกว่า 25–30 — ไม่ได้ประโยชน์เพิ่ม เสียยา/อิเล็กโทรไลต์และยาปฏิชีวนะถูกขจัดมากขึ้น`); else li('ok',`Dose ~${fmtN(Math.round(dd*10)/10)} ml/kg/hr อยู่ในเป้าหมาย KDIGO (20–25 delivered)`); }
      if(!adj&&abw&&wt&&abw/wt>1.3) li('info',`น้ำหนักจริง ${fmtN(abw)} kg สูงกว่า IBW ${fmtN(wt)} kg มาก — dose ต่อ IBW ดูสูง แต่ต่อน้ำหนักจริงอาจต่ำ (KDIGO ใช้น้ำหนักจริง)`);
      if(qp){ const ff=(pre+post+uf)/(qp+pre); kv.push(['Filtration fraction',`(pre ${fmtN(pre)} + post ${fmtN(post)} + UF ${fmtN(uf)}) ÷ (Qp ${fmtN(Math.round(qp))} + pre ${fmtN(pre)}) = <b>${(ff*100).toFixed(1)}%</b> <span class="hint">(Qp = BFR ${fmtN(bfr)} ml/min × 60 × (1 − Hct ${fmtN(hct)}%))</span>`]);
        const lo=+($('cBfr').dataset.lo||0); if(lo&&lo<bfr){ const qpl=lo*60*(1-hct/100), ffl=(pre+post+uf)/(qpl+pre); li(ffl>0.2?'warn':'ok',`ใบสั่งระบุ BFR ${fmtN(lo)}–${fmtN(bfr)} ml/min — ที่ BFR ${fmtN(lo)} FF = ${(ffl*100).toFixed(1)}%${ffl>0.2?' > 20% (ควรรักษา BFR ด้านสูง)':''}`); }
        li(ff>0.25?'flag':ff>0.2?'warn':'ok',`Filtration fraction ${(ff*100).toFixed(1)}% ${ff>0.2?'> 20% — เสี่ยง filter อุดตัน (เพิ่ม BFR หรือเพิ่มสัดส่วน pre-dilution/ลด post)':'≤ 20%'}`); }
      else if(post>0) li('info','ใส่ BFR และ Hct เพื่อคำนวณ filtration fraction (เป้า ≤20%)'); } }
  // ---- น้ำยาเทียบกรด-ด่างของผู้ป่วย
  { const hs=crrtV('cHco3'); if(fno>=1&&fno<=25){ const fh=CRRT_F[fno-1][0]*CRRT_NA.b;
      if((ph!=null&&ph>7.45)||(hs!=null&&hs>30)){ if(fh>30) li('flag',`ผู้ป่วยภาวะด่าง (pH ${ph??'–'} · HCO3 ${hs??'–'}) แต่สูตร ${fno} มี HCO3 ${fh.toFixed(1)} mEq/L — จะเพิ่มด่าง · ตามตารางควรใช้สูตร ${sug||'pH >7.46'} (HCO3 ${sug?(CRRT_F[sug-1][0]*CRRT_NA.b).toFixed(1):'22'} mEq/L) — ยืนยันผล ABG ล่าสุดกับแพทย์`); }
      if(ph!=null&&ph<7.2&&fh<40) li('warn',`ผู้ป่วยกรดรุนแรง (pH ${ph}) แต่สูตร ${fno} HCO3 ${fh.toFixed(1)} mEq/L — ตรวจเลือกสูตรตาม pH`); } }
  // ---- K/Mg/Ca/PO4 จากแผง Lab
  { const P2=getPt(), L2=(P2.lab||{}), ks=P2.k!=null?P2.k:L2.k, mg=L2.mgl!=null?L2.mgl:($('mgl')&&$('mgl').value!==''?+$('mgl').value:null), po4=L2.phos, ca=L2.ca, alb=L2.alb;
    if(ks!=null){ if(ks<3.5&&!(kL>0)) li('warn',`K ${ks} ต่ำ แต่น้ำยาไม่มี KCl — CRRT ดึง K ออก ควรเติม KCl 4 mEq/L`); else if(ks<3.5) li('info',`K ${ks} ต่ำ — น้ำยามี KCl ${kL} mEq/L · ติดตาม K q4–6 ชม.`); if(ks>5.5&&kL>0) li('warn',`K ${ks} สูง แต่เติม KCl ${kL} mEq/L`); }
    if(mg!=null&&mg<2) li('info',`Mg ${mg} — CRRT ขจัด Mg · ทดแทน MgSO4 ตามใบสั่ง ติดตามระดับ`);
    if(po4!=null&&po4>5.5) li('info',`Phosphate ${po4} สูง — CRRT ช่วยลด · ติดตาม (มักต่ำลงหลังทำ 24–48 ชม. — ระวัง hypophosphatemia)`);
    if(ca!=null&&alb!=null){ const cc=ca+0.8*(4-alb); li('info',`Corrected Ca = ${ca} + 0.8 × (4 − ${alb}) = ${cc.toFixed(1)} mg/dL`); } }
  // ---- KCl ที่สั่งใน HIS เทียบที่ต้องใช้ทั้งวัน
  { const ko=crrtV('cKOrd'); if(kL>0&&flow>0){ const need=kL*flow*hrs/1000, amp=Math.ceil(need/20-1e-9); kv.push(['KCl ที่ต้องใช้',`${fmtN(kL)} mEq/L × ${fmtN(Math.round(flow*hrs/100)/10)} L = <b>${fmtN(Math.round(need))}</b> mEq/${fmtN(hrs)} ชม. = <b>${amp}</b> amp (20 mEq/10 ml)`]);
      if(ko!=null&&ko<amp) li('warn',`ใบสั่งจ่าย KCl ${ko} amp (${ko*20} mEq) — พอสำหรับน้ำยา ${fmtN(Math.round(ko*20/kL*10)/10)} L ≈ ${fmtN(Math.round(ko*20/kL/(flow/1000)*10)/10)} ชม. · ทั้ง ${fmtN(hrs)} ชม. ต้องใช้ ${amp} amp — ยืนยันว่าตั้งใจเบิกเพิ่มเป็นรอบหรือไม่`); } }
  if(mode==='SCUF') li('info','SCUF: ไม่มี replacement/dialysate — ไม่ต้องเตรียมน้ำยา');
  if(totMl){ kv.push(['น้ำยาที่ใช้ต่อ '+fmtN(hrs)+' ชม.',`${src} = <b>${fmtN(totMl)}</b> ml ≈ <b>${fmtN(Math.round(totMl/100)/10)}</b> ลิตร`]); }
  let tbl='';
  if(fno>=1&&fno<=25&&totMl){ const f=CRRT_F[fno-1], nSet=Math.ceil(totMl/(setL*1000)-1e-9), sc=setL, Na=crrtNa(f), HCO3=f[0]*CRRT_NA.b;
    kv.push(['จำนวนชุดน้ำยา',`${fmtN(totMl)} ml ÷ ${fmtN(setL*1000)} ml/ชุด = <b>${nSet}</b> ชุด`]);
    const cols=[['b',f[0]],['h',f[1]],['n',f[2]],['s',f[3]],['w',f[4]]]; const kml=kL*setL*0.5; // KCl 20 mEq/10 ml = 2 mEq/ml
    const rows=cols.filter(c=>c[1]>0).map(([k,ml])=>{ const per=ml*sc, day=per*nSet, st=CRRT_STOCK[k]; return {k,name:st[0],per,day,cnt:Math.ceil(day/st[1]-1e-9),unit:st[2],size:st[1]}; });
    if(kL>0){ const day=kml*nSet; rows.push({k:'k',name:`KCl ${fmtN(kL)} mEq/L`,per:kml,day,cnt:Math.ceil(day/10-1e-9),unit:'amp',size:10,meq:kL*setL*nSet}); }
    tbl=`<h2 style="margin-top:14px">สูตร ${fno} — Serum Na ${CRRT_NAG[Math.floor((fno-1)/5)]} · pH ${CRRT_PH[(fno-1)%5]}</h2>
     <table class="ctbl" style="width:100%;text-align:right"><thead><tr><th style="text-align:left">ส่วนประกอบ</th><th>ต่อ 1 ลิตร (ตาราง)</th><th>ต่อชุด ${fmtN(setL)} ลิตร</th><th>รวม ${nSet} ชุด</th><th>ต้องเตรียม</th></tr></thead><tbody>
     ${rows.map(r=>`<tr><td style="text-align:left">${esc(r.name)}</td><td>${fmtN(r.k==='k'?kL*0.5:r.per/sc)} ml</td><td>${fmtN(r.per)} ml</td><td>${fmtN(r.day)} ml${r.meq?` (${fmtN(r.meq)} mEq)`:''}</td><td><b>${r.cnt}</b> ${r.unit} <span class="hint">(${r.size} ml)</span></td></tr>`).join('')}
     </tbody></table>
     <dl class="kv" style="margin-top:8px"><dt>Na ในน้ำยา</dt><dd>${Na.toFixed(1)} mEq/L (ใบสั่ง ${f[5]})</dd><dt>HCO3 ในน้ำยา</dt><dd>${HCO3.toFixed(1)} mEq/L</dd>${kL?`<dt>K ในน้ำยา</dt><dd>${fmtN(kL)} mEq/L</dd>`:''}</dl>`;
    if(!f[6]) li('warn',`สูตร ${fno} อ่านจากภาพใบสั่งได้ไม่ครบ คำนวณย้อนจากค่า Final Na — ตรวจสัดส่วนกับใบสั่ง CRRT ฉบับจริง`);
    if(Math.abs(Na-f[5])>1) li('warn',`Na ที่คำนวณ ${Na.toFixed(1)} ต่างจากค่าในใบสั่ง ${f[5]} — ตรวจสูตร`);
    if(setL!==1) li('info',`ตารางเป็นสูตรต่อ 1,000 ml — ชุด ${fmtN(setL)} ลิตร ต้องใช้ทุกส่วนประกอบ × ${fmtN(setL)} (ถ้าใช้ปริมาณต่อ 1 ลิตรกับถุง ${fmtN(setL)} ลิตร ความเข้มข้น Na/HCO3 จะผิด)`);
    li('info','จำนวนที่ต้องเตรียมคิดจากปริมาณรวมทั้งวัน (ใช้ขวด/ถุงที่เปิดแล้วต่อกับชุดถัดไป) — ถ้าเปิดใหม่ทุกชุด ให้คิดต่อชุดแล้วคูณจำนวนชุด');
    if(sug&&sug!==fno) li('warn',`ค่า Na ${na} / pH ${ph} ตรงกับสูตร ${sug} แต่ใบสั่งเลือกสูตร ${fno}`); }
  else if(totMl) li('info','เลือกสูตรน้ำยา (1–25) เพื่อคำนวณส่วนประกอบ');
  { const ca=crrtV('cCa'), ca24=crrtV('cCa24'), mg=crrtV('cMg'); const ex=[];
    if(ca24){ ex.push(`10% Calcium gluconate ${fmtN(ca24)} ml + 5% DW 100 ml IV drip 24 ชม. = <b>${Math.ceil(ca24/10-1e-9)}</b> amp (10 ml) = ${fmtN(Math.round(ca24*9.3))} mg elemental Ca (${fmtN(Math.round(ca24*0.465*10)/10)} mEq)`); }
    if(ca){ const d=ca*hrs; ex.push(`10% Calcium gluconate ${fmtN(ca)} ml/hr × ${fmtN(hrs)} = ${fmtN(d)} ml = <b>${Math.ceil(d/10-1e-9)}</b> amp (10 ml)`); }
    if(mg){ ex.push(`50% MgSO4 ${fmtN(mg)} ml + 5% DW 100 ml IV drip 24 ชม. = <b>${Math.ceil(mg/2-1e-9)}</b> amp (1 g/2 ml) = ${fmtN(mg*0.5)} g = ${fmtN(Math.round(mg*0.5*8.12*10)/10)} mEq Mg`); }
    if(ex.length) tbl+=`<h2 style="margin-top:14px">ยาอื่นในใบสั่ง</h2><ul style="margin:0;padding-left:18px">${ex.map(x=>`<li>${x}</li>`).join('')}</ul>`; }
  if(!totMl){ out.innerHTML='<div class="empty">กรอกน้ำหนัก + CRRT dose หรือ อัตราไหล (pre/post/dialysate)</div>'; return; }
  out.innerHTML=`<h2>ผลคำนวณ</h2><dl class="kv" style="margin-bottom:10px">${kv.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><ul class="msgs">${L.join('')}</ul>${tbl}`; }
// ---- อ่านใบสั่ง CRRT / หน้าจอ HIS ที่วาง → เติมช่อง (ไม่เก็บชื่อ/HN)
function crrtRead(){ const raw=($('crPaste').value||''); if(!raw.trim()) return 'ยังไม่ได้วางข้อมูล';
  const t=raw.replace(/\r/g,''), got=[], num=x=>x==null?null:+String(x).replace(/,/g,'');
  const set=(id,v,lab)=>{ if(v==null||isNaN(v)) return; $(id).value=v; got.push(lab+' '+v); };
  const g=(re)=>{ const m=t.match(re); return m?m[1]:null; };
  const md=t.match(/\b(CVVHDF|CVVHD|CVVH|SCUF)\b/i); if(md){ $('cMode').value=md[1].toUpperCase(); got.push(md[1].toUpperCase()); }
  set('cWt',num(g(/\bIBW\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)/i)),'IBW');
  const bw=num(g(/(?:น้ำหนัก(?:จริง)?|(?<![A-Za-z])(?:BW|ABW|body\s*weight|weight|Wt))\s*[:=]?\s*(\d{2,3}(?:\.\d+)?)\s*(?:kg|กก)?/i)); if(bw){ set('cAbw',bw,'น้ำหนัก'); if(!$('bw').value){ $('bw').value=bw; $('bw').dispatchEvent(new Event('input',{bubbles:true})); } }
  const ht=num(g(/(?:ส่วนสูง|สูง|height|(?<![A-Za-z])Ht)\s*[:=]?\s*(1\d{2}(?:\.\d)?)\s*(?:cm|ซม)?/i)); if(ht&&!$('ht').value){ $('ht').value=ht; $('ht').dispatchEvent(new Event('input',{bubbles:true})); got.push('สูง '+ht); }
  const bf=t.match(/(?:BFR|blood\s*flow(?:\s*rate)?|Qb)\s*[:=]?\s*(\d{2,3})(?:\s*[-–]\s*(\d{2,3}))?/i); if(bf){ const a=+bf[1], b=bf[2]?+bf[2]:null; $('cBfr').value=b?Math.max(a,b):a; $('cBfr').dataset.lo=b?Math.min(a,b):''; got.push('BFR '+bf[1]+(b?'–'+b:'')); }
  set('cPre',num(g(/pre[\s-]*(?:dilution|filter|replacement)[^\d\n]{0,20}(\d{2,4})/i)),'Pre');
  set('cPost',num(g(/post[\s-]*(?:dilution|filter|replacement)[^\d\n]{0,20}(\d{2,4})/i)),'Post');
  set('cQd',num(g(/dialysate[^\d\n]{0,25}(\d{2,4})/i)),'Dialysate');
  set('cUf',num(g(/(?:set\s*|net\s*)?(?:\bUF\b|ultrafiltration)(?:\s*rate)?[^\d\n]{0,15}(\d{1,4})/i)),'UF');
  set('cF',num(g(/(?:สูตร(?:น้ำยา)?(?:ที่)?|formula|fluid\s*(?:no\.?|#)?)\s*[:=#]?\s*(\d{1,2})\b/i)),'สูตร');
  const dz=num(g(/CRRT\s*dose\s*[:=]?\s*(\d+(?:\.\d+)?)/i)); if(dz!=null){ if(dz<=60) set('cDose',dz,'dose'); else got.push(`⚠ CRRT dose ${dz} (น่าจะเป็น ml/hr ไม่ใช่ ml/kg/hr — ใช้อัตราไหลคำนวณ)`); }
  // labs → ช่อง CRRT + แผง Lab ผู้ป่วย
  const lb=typeof labParse==='function'?labParse(t):{};
  const na=lb.na!=null?lb.na:num(g(/(?:sodium|(?<![A-Za-z])Na)\s*[:=]?\s*(1\d{2}(?:\.\d)?)/i)); set('cNa',na,'Na');
  const ph=lb.ph!=null?lb.ph:num(g(/\bpH\s*[:=]?\s*(\d\.\d{1,3})/i)); set('cPh',ph,'pH');
  const hc=lb.hco3!=null?lb.hco3:num(g(/(?<!Na)HCO3\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)/i)); set('cHco3',hc,'HCO3');
  const hct=lb.hct!=null?lb.hct:num(g(/(?:hematocrit|\bhct)\s*[:=]?\s*(\d{2}(?:\.\d+)?)/i)); set('cHct',hct,'Hct');
  let nl=0; if(typeof LAB_DEF!=='undefined') LAB_DEF.forEach(([k,,,,fld])=>{ if(lb[k]==null) return; const el=$(fld||('L_'+k)); if(el){ el.value=lb[k]; nl++; } }); if(lb.k!=null&&typeof kFromText==='function') kFromText(t,true);
  // ยาในใบสั่ง (ตัดข้อความในวงเล็บ เช่น (20 MEQ/10 ML) (1G/2ML))
  t.split(/\n/).forEach(l0=>{ const l=l0.replace(/\([^)]*\)/g,' ');
    if(/pot\.?\s*chlor|\bkcl\b|potassium\s*chloride/i.test(l)){ const m=l.match(/(\d+(?:\.\d+)?)\s*m?eq\s*\/\s*L\b(?:\s+(\d{1,3})\b(?!\s*(?:ml|cc|amp|mg)))?/i); if(m){ set('cK',+m[1],'KCl mEq/L'); if(m[2]) set('cKOrd',+m[2],'KCl amp'); }
      const a=l.match(/(\d{1,3})\s*(?:amp|แอมป์|vial)/i); if(a&&!(m&&m[2])) set('cKOrd',+a[1],'KCl amp'); }
    else if(/mag\.?\s*sulf|mgso4|magnesium\s*sulf/i.test(l)){ const m=l.replace(/(?:5\s*%\s*)?(?:D\s*\/?\s*5\s*W|DW|NSS)\s*\d+\s*ml/ig,' ').match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b/i); if(m) set('cMg',+m[1],'MgSO4 ml'); }
    else if(/calcium\s*gluc|ca\.?\s*gluc/i.test(l)){ const l2=l.replace(/(?:5\s*%\s*)?(?:D\s*\/?\s*5\s*W|DW|NSS)\s*\d+\s*ml/ig,' '); const h=l2.match(/(\d+(?:\.\d+)?)\s*ml\s*\/\s*(?:hr|h|ชม)/i); if(h) set('cCa',+h[1],'Ca ml/hr'); else { const m=l2.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b/i); if(m) set('cCa24',+m[1],'Ca gluconate ml/24h'); } } });
  if(typeof renderRows==='function'&&nl) try{ renderRows(); }catch(e){}
  if(!$('cWt').value){ const pt=getPt(); if(pt.ibw){ $('cWt').value=Math.round(pt.ibw*10)/10; got.push('IBW (จากส่วนสูง) '+$('cWt').value); } }
  renderCrrt(); const msg=got.length?'อ่านได้: '+got.join(' · ')+(nl?` · Lab ${nl} ค่าเข้าแผงผู้ป่วย`:''):'อ่านไม่พบค่า CRRT'; $('crMsg').textContent=msg; return msg; }
function crrtClear(){ ['cWt','cDose','cPre','cPost','cQd','cF','cNa','cPh','cCa','cMg','cAbw','cBfr','cHct','cUf','cHco3','cKOrd','cCa24','cK','crPaste'].forEach(id=>{ $(id).value=''; }); $('cBfr').dataset.lo=''; $('cHr').value=24; $('crMsg').textContent=''; renderCrrt(); }
(function(){ if(!$('crOut')) return;
  $('crRead').onclick=()=>crrtRead(); $('crClr').onclick=crrtClear;
  $('cFt').innerHTML=`<table class="ctbl" style="width:100%;text-align:center;font-size:13px"><thead><tr><th>สูตร</th><th>Serum Na</th><th>pH</th><th>7.5% NaHCO3</th><th>0.45% NaCl</th><th>0.9% NaCl</th><th>3% NaCl</th><th>SW</th><th>Final Na</th></tr></thead><tbody>${CRRT_F.map((f,i)=>`<tr data-cf="${i+1}" style="cursor:pointer"><td><b>${i+1}</b>${f[6]?'':' ⚑'}</td>${i%5===0?`<td rowspan="5">${CRRT_NAG[i/5]}</td>`:''}<td>${CRRT_PH[i%5]}</td>${f.slice(0,5).map(v=>`<td>${v||'0'}</td>`).join('')}<td>${f[5]}</td></tr>`).join('')}</tbody></table><p class="hint" style="margin:4px 0 0">คลิกแถวเพื่อเลือกสูตร · ทุกสูตรรวม 1,000 ml · ⚑ = อ่านจากภาพได้ไม่ครบ คำนวณย้อนจาก Final Na — ยืนยันกับใบสั่งจริง</p>`;
  $('cFt').querySelectorAll('[data-cf]').forEach(r=>r.onclick=()=>{ $('cF').value=r.dataset.cf; renderCrrt(); });
  ['cWt','cDose','cPre','cPost','cQd','cHr','cSet','cK','cF','cNa','cPh','cCa','cMg','cMode','cAbw','cBfr','cHct','cUf','cHco3','cKOrd','cCa24'].forEach(id=>{ $(id).addEventListener('input',renderCrrt); $(id).addEventListener('change',renderCrrt); });
  $('t-crrt').addEventListener('click',()=>{ const pt=getPt(), L2=pt.lab||{}; if(!$('cWt').value&&pt.ibw) $('cWt').value=Math.round(pt.ibw*10)/10; if(!$('cAbw').value&&pt.bw) $('cAbw').value=pt.bw;
    [['cNa','na'],['cPh','ph'],['cHco3','hco3'],['cHct','hct']].forEach(([id,k])=>{ if(!$(id).value&&L2[k]!=null) $(id).value=L2[k]; }); renderCrrt(); });
  renderCrrt(); })();
