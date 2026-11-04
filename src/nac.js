/* ===== nac.js — N-Acetylcysteine (NAC) IV: เครื่องคำนวณ 3 ขวด/SNAP/72 ชม. + ตรวจคำสั่งรายขวด
 รพ.มค: Acetylcysteine inj 300 mg/3 ml (amp) · ผสม D5W · ห้าม IV push · ขวดแรก drip ≥60 นาที (ลด anaphylactoid) · หลังผสมคงตัว 24 ชม. ที่อุณหภูมิห้อง
 ที่มา: Acetadote (acetylcysteine) prescribing information · ยาต้านพิษ DIS 2564 · Lee WM et al. Gastroenterology 2009 (non-acetaminophen ALF) · SNAP regimen (Bateman, Lancet 2014) */
const NAC_AMP=300;
// [ชื่อชุด, รายการขวด [mg/kg, ชม.]]
const NAC_REG={
 std:['มาตรฐาน 3 ขวด (21 ชม.) — พิษ paracetamol',[[150,1],[50,4],[100,16]]],
 snap:['SNAP 2 ขวด (12 ชม.) — ใช้เมื่อ รพ. กำหนด',[[100,2],[200,10]]],
 alf:['ตับวายเฉียบพลันที่ไม่ใช่จาก paracetamol (72 ชม.)',[[150,1],[50,4],[100,16],[100,16],[100,16],[100,16],[18.75,3]]] }; // 1+4+16×4+3 = 72 ชม.
function nacVol(bw,i,reg){ // ปริมาตร D5W ตามน้ำหนัก (Acetadote): ≤20 kg 3/7/14 ml/kg · 21–40 kg 100/250/500 · >40 kg 200/500/1000
  if(reg==='snap') return bw<=40?[100,500][i]:[200,1000][i];
  const k=Math.min(i,2), f=reg==='alf'&&i===6?3/16:1; if(bw<=20) return Math.round([3,7,14][k]*bw*f); if(bw<=40) return Math.round([100,250,500][k]*f); return Math.round([200,500,1000][k]*f); }
function nacCalc(){ const out=$('nacOut'); if(!out) return; const bw0=+$('nacBw').value, reg=$('nacReg').value, R=NAC_REG[reg];
  if(!(bw0>0)){ out.innerHTML='<div class="empty">ใส่น้ำหนักจริง (kg)</div>'; return; }
  const bw=Math.min(bw0,100); let t=0;
  const rows=R[1].map(([mk,h],i)=>{ const mg=Math.round(mk*bw), v=nacVol(bw0,i,reg), st=t; t+=h; return {i,mk,h,mg,amp:Math.ceil(mg/NAC_AMP-1e-9),v,rate:Math.round(v/h*10)/10,perH:Math.round(mk/h*100)/100,st}; });
  const tot=rows.reduce((a,r)=>a+r.mg,0);
  out.innerHTML=`<h2>NAC IV · ${esc(R[0])}</h2>
   <p class="hint" style="margin:0 0 6px">น้ำหนักที่ใช้ ${fmtN(bw)} kg${bw0>100?' (จำกัดที่ 100 kg ตามเอกสารกำกับยา · UK ใช้ 110 kg)':''} · ยา ${NAC_AMP} mg/3 ml ต่อ amp · ผสม D5W</p>
   <div style="overflow-x:auto"><table class="ctbl" style="font-size:13px"><thead><tr><th>ขวด</th><th>ขนาด</th><th>ยา (mg)</th><th>amp</th><th>D5W</th><th>นาน</th><th>Rate</th><th>เริ่มชั่วโมงที่</th></tr></thead><tbody>
   ${rows.map(r=>`<tr><td><b>${r.i+1}</b></td><td>${fmtN(r.mk)} mg/kg <span class="hint">(${fmtN(r.perH)} mg/kg/h)</span></td><td><b>${fmtN(r.mg)}</b></td><td>${r.amp}</td><td>${fmtN(r.v)} ml</td><td>${r.h} ชม.</td><td>${fmtN(r.rate)} ml/h</td><td>${r.st}</td></tr>`).join('')}
   </tbody></table></div>
   <p style="margin:8px 0 4px">รวม ${fmtN(tot)} mg (${fmtN(Math.round(tot/bw))} mg/kg) · ${t} ชม. · จ่ายรวม ${rows.reduce((a,r)=>a+r.amp,0)} amp (เตรียมทีละขวด)</p>
   <ul class="msgs">${[
    ['info','ขวดแรก drip ≥60 นาที ห้าม IV push — anaphylactoid (ผื่น คัน หน้าแดง หลอดลมตีบ) พบมากช่วงขวดแรก: หยุดชั่วคราว ให้ antihistamine แล้วเริ่มใหม่ช้าลง ไม่ใช่การแพ้ที่ต้องหยุดยาถาวร'],
    ['info','ผู้ป่วยน้ำหนักน้อย/เด็ก ≤40 kg: ใช้ปริมาตร D5W น้อยลง (กันน้ำเกินและ hyponatremia) — ≤20 kg คิด ml/kg'],
    ['info','พิษ paracetamol: หลังครบ 21 ชม. ถ้า AST/ALT ยังสูง หรือ INR >2 หรือยังมีระดับยา → ให้ขวด 100 mg/kg/16 ชม. ต่อ จนค่าตับดีขึ้น'],
    ['info','ตับวายเฉียบพลันที่ไม่ใช่จาก paracetamol (เช่น ยา/สมุนไพร/ไวรัส): 150 mg/kg/h × 1 ชม. → 12.5 mg/kg/h × 4 ชม. → 6.25 mg/kg/h × 67 ชม. (รวม 72 ชม.) — ได้ประโยชน์ชัดในผู้ป่วย coma grade I–II'],
    ['info','หลังผสมคงตัว 24 ชม. ที่อุณหภูมิห้อง · ติดตาม K/Na, น้ำตาล, INR, LFT, ปัสสาวะ']
   ].map(([l,x])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(x)}</span></li>`).join('')}</ul>
   <p class="hint">ที่มา: Acetadote prescribing information · ยาต้านพิษ DIS 2564 · Lee WM, Gastroenterology 2009 · SNAP (Bateman, Lancet 2014)</p>`; }
// ---- ตรวจคำสั่ง NAC IV รายขวด: "3700 mg + D5W 500 ml drip in 16 hr"
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items) return r; const raw=row.raw||'';
  if(!/acetylcyst|\bnac\b|fluimucil/i.test(raw)||!/inj|\biv\b|drip|infus|d5w/i.test(raw)) return r;
  const add=(l,t)=>{ if(!r.items.some(i=>i.txt===t)) r.items.push({lvl:l,txt:t}); if(l==='warn'&&r.status!=='flag') r.status='warn'; if(l==='flag') r.status='flag'; };
  const t=raw.replace(/,/g,''), mgs=[...t.matchAll(/(\d+(?:\.\d+)?)\s*mg\b(?!\s*\/)/gi)].map(m=>+m[1]).filter(v=>v!==NAC_AMP||/\b300\s*mg\s*(?:\+|in|ใน)/i.test(t)), mg=mgs.length?mgs[mgs.length-1]:null;
  const du=t.match(/(?:\bin|\bover|นาน|ภายใน)\s*(\d+(?:\.\d+)?)\s*(hrs?|hours?|h\b|ชม|ชั่วโมง|mins?|minutes?|นาที)/i), hr=du?(/min|นาที/i.test(du[2])?+du[1]/60:+du[1]):null;
  const vm=t.match(/(?:d5w|d5s|nss|\bns\b|swfi)\s*(\d+(?:\.\d+)?)\s*(?:ml|cc)/i)||t.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b(?!\s*\/)/i), vol=vm?+vm[1]:null;
  const am=t.match(/#\s*(\d+)\s*amp/i), bw0=+pt.bw, bw=bw0>0?Math.min(bw0,100):null;
  if(mg==null){ add('info','NAC IV: อ่านปริมาณยา (mg) ในขวดไม่ได้ — ตรวจด้วยเครื่องคำนวณ NAC (แท็บ HAD → ยาต้านพิษ)'); return r; }
  if(!bw){ add('warn',`NAC IV ${fmtN(mg)} mg: ไม่มีน้ำหนักผู้ป่วย — NAC คิดตาม mg/kg ต้องใส่น้ำหนักจริง`); return r; }
  if(hr) r.items=r.items.filter(i=>!/อ่านความถี่ไม่ได้/.test(i.txt)); // ยาหยดต่อเนื่องเป็นรายขวด ไม่มีความถี่
  const mk=mg/bw, B=[[150,1,'ขวดที่ 1 (150 mg/kg ใน 1 ชม.)'],[50,4,'ขวดที่ 2 (50 mg/kg ใน 4 ชม.)'],[100,16,'ขวดที่ 3 (100 mg/kg ใน 16 ชม.)'],[100,2,'SNAP ขวดที่ 1 (100 mg/kg ใน 2 ชม.)'],[200,10,'SNAP ขวดที่ 2 (200 mg/kg ใน 10 ชม.)']];
  let best=null; B.forEach(b=>{ const e=Math.abs(mk-b[0])/b[0]+(hr?Math.abs(hr-b[1])/b[1]:0); if(!best||e<best.e) best={b,e}; });
  const b=best.b, ok=Math.abs(mk-b[0])/b[0]<=0.1, okH=hr==null||Math.abs(hr-b[1])/b[1]<=0.15;
  add('info',`คำนวณได้: NAC ${fmtN(mg)} mg ÷ ${fmtN(bw)} kg${bw0>100?' (จำกัด 100 kg)':''} = ${fmtN(Math.round(mk*10)/10)} mg/kg${hr?` ใน ${fmtN(hr)} ชม. (${fmtN(Math.round(mk/hr*100)/100)} mg/kg/h)`:''}${vol?` · ${vol} ml${hr?` → ${fmtN(Math.round(vol/hr*10)/10)} ml/h`:''}`:''}`);
  if(ok&&okH) add('ok',`เหมาะสมเพราะ: ตรงกับ ${b[2]} · ขนาดที่ควรเป็น ${fmtN(Math.round(b[0]*bw))} mg`);
  else add('warn',`NAC: ${fmtN(Math.round(mk*10)/10)} mg/kg${hr?` ใน ${fmtN(hr)} ชม.`:''} ไม่ตรงสูตรมาตรฐาน — ใกล้เคียง ${b[2]} ควรเป็น ${fmtN(Math.round(b[0]*bw))} mg${hr&&!okH?` นาน ${b[1]} ชม.`:''}`);
  if(!hr) add('warn','NAC: ไม่ระบุระยะเวลาหยด (เช่น drip in 16 hr) — ขวดแรกต้อง ≥60 นาที ห้าม IV push');
  else if(b[0]===150&&hr<0.9) add('flag',`NAC ขวดแรกหยดเร็ว (${fmtN(Math.round(hr*60))} นาที) — ต้อง ≥60 นาที เสี่ยง anaphylactoid`);
  if(vol&&bw0<=40){ const lim=bw0<=20?null:b[0]===150?100:b[0]===50?250:500; if(lim&&vol>lim*1.2) add('warn',`NAC: น้ำหนัก ${bw0} kg ควรผสม D5W ~${lim} ml (สั่ง ${vol} ml) — ระวังน้ำเกิน/hyponatremia`); }
  if(am){ const need=Math.ceil(mg/NAC_AMP-1e-9); add(+am[1]===need?'ok':'warn',`จำนวนจ่าย #${am[1]} amp ${+am[1]===need?'=':'≠'} ${fmtN(mg)} ÷ ${NAC_AMP} mg = ${need} amp${+am[1]>need?' (เกิน)':+am[1]<need?' (ไม่พอ)':''}`); }
  if(b[0]===100&&b[1]===16) add('info','ขวด 100 mg/kg/16 ชม. (6.25 mg/kg/h): พิษ paracetamol ให้ต่อจนค่าตับ/INR ดีขึ้น · ตับวายที่ไม่ใช่จาก paracetamol (เช่น จากยา) ให้รวม 72 ชม.');
 }catch(e){} return r; })(evaluate);
(function(){ if(!$('nacOut')) return; const s=()=>{ if($('nacBw').dataset.manual!=='1'&&$('bw').value) $('nacBw').value=$('bw').value; nacCalc(); };
  $('nacBw').addEventListener('input',e=>{ if(e.isTrusted) $('nacBw').dataset.manual='1'; nacCalc(); }); $('nacReg').addEventListener('change',nacCalc);
  $('bw').addEventListener('input',s); s(); })();
