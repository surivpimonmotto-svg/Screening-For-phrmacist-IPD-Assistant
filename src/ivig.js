/* ===== ivig.js — IVIG (Human normal immunoglobulin) ขนาดต่อ kg · ต่อรอบ · จำนวนขวด · ความเสี่ยง ===== */
const SRC_IVIG='ขนาดมาตรฐานสากล (EDF/EADV pemphigus 2020 · ASH ITP 2019 · AHA Kawasaki 2017 · AAN GBS) · แบบฟอร์มกำกับการใช้ IVIG บัญชี จ(2) ⚑';
const IVIG_RE=/\bivig\b|immunoglobulin|immune\s*globulin|privigen|octagam|intratect|kiovig|ig\s*vena|gamunex|flebogamma|i\.?v\.?\s*-?\s*globulin/i;
if(!KB.some(d=>d.id==='ivig')) KB.push({id:'ivig',name:'IVIG (Human normal immunoglobulin)',match:IVIG_RE,unit:'g',forms:[[/10\s*%/,'10% (10 g/100 ml)',10,'ขวด'],[/5\s*%/,'5% (5 g/100 ml)',5,'ขวด']],note:'คิดเป็น g/kg/วัน และ g/kg/รอบ ตามข้อบ่งใช้ · บัญชี จ(2) ต้องมีแบบฟอร์มกำกับการใช้',src:SRC_IVIG});
const IVIG_IND=[
 [/pemphig|pemphigoid|bullous|\bpv\b|\bbp\b|ten\b|sjs|dermatomyos/i,'Pemphigus/โรคผิวหนังภูมิต้านตนเอง','2 g/kg/รอบ แบ่งให้ 2–5 วัน (0.4–1 g/kg/วัน) ทุก 4 สัปดาห์',2,1],
 [/itp|thrombocytop/i,'ITP','1 g/kg/วัน × 1–2 วัน (รวม 1–2 g/kg) หรือ 0.4 g/kg/วัน × 5 วัน',2,1],
 [/kawasaki/i,'Kawasaki','2 g/kg ครั้งเดียว drip 10–12 ชม.',2,2],
 [/gbs|guillain|cidp|myasthen|\bmg\b/i,'GBS/CIDP/Myasthenia','0.4 g/kg/วัน × 5 วัน (รวม 2 g/kg)',2,1],
 [/hypogamma|\bcvid|immunodefic|replacement/i,'Replacement (ภูมิคุ้มกันบกพร่อง)','0.4–0.6 g/kg ทุก 3–4 สัปดาห์',0.8,0.8]];
function ivigDays(s){ let m=s.match(/(?:[x×*]\s*|นาน\s*|ติดต่อกัน\s*)(\d+)\s*(?:วัน|days?|d\b)/i); if(m) return +m[1];
  m=s.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*\/\s*(\d{1,2})/); if(m&&+m[2]>=+m[1]&&+m[2]-+m[1]<10) return +m[2]-+m[1]+1; return null; }
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items||!IVIG_RE.test(row.raw||'')) return r; const raw=String(row.raw), add=(l,t)=>{ if(r.items.some(i=>i.txt===t)) return; r.items.push({lvl:l,txt:t}); if(l==='flag') r.status='flag'; else if(l==='warn'&&r.status!=='flag') r.status='warn'; else if(l==='ok'&&(!r.status||r.status==='none'||r.status==='nr')) r.status='ok'; };
  r.items=r.items.filter(i=>!/ยังไม่มีกฎในฐาน|ไม่พบยานี้ในบัญชี|อ่านความถี่ไม่ได้/.test(i.txt)); if(r.status==='none'||r.status==='nr') r.status='ok';
  const f=x=>fmtN(Math.round(x*100)/100), bw=pt&&+pt.bw, age=pt&&+pt.age, all=(rows||[]).map(x=>x.raw).join(' ')+' '+((($('paste')||{}).value)||'')+' '+((($('allergy')||{}).value)||'');
  const gm=(raw.replace(/\([^)]*\)/g,' ').match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|กรัม)\b/i)||[])[1], mgm=(raw.match(/(\d{3,6})\s*mg\b/i)||[])[1], g=gm?+gm:mgm?+mgm/1000:null;
  const pct=/10\s*%/.test(raw)?10:5, perB=pct===10?10:5, days=ivigDays(raw);
  const ind=IVIG_IND.find(x=>x[0].test(all)), indTxt=ind?`${ind[1]}: ${ind[2]}`:'ระบุข้อบ่งใช้เพื่อเทียบขนาด (pemphigus/ITP/GBS 2 g/kg/รอบ · Kawasaki 2 g/kg ครั้งเดียว · replacement 0.4–0.6 g/kg)';
  if(g==null){ add('warn',`IVIG — อ่านขนาด (g) จากคำสั่งไม่ได้ · ${indTxt}`); return r; }
  add('info',`จ่าย: ${f(g)} g ÷ ${perB} g/ขวด (${pct}% 100 ml) = ${f(g/perB)} → ${Math.ceil(g/perB-1e-9)} ขวด/ครั้ง · ปริมาตร ${f(g/pct*100)} ml${days?` · ${days} วัน = ${Math.ceil(g/perB-1e-9)*days} ขวด/รอบ`:''}`);
  if(!bw){ add('warn',`IVIG ${f(g)} g — ใส่น้ำหนักเพื่อคิด g/kg · ${indTxt}`); return r; }
  const gk=g/bw, maxD=ind?ind[4]:1, maxC=ind?ind[3]:2;
  add(gk>maxD*1.05&&!(ind&&ind[1]==='Kawasaki')?'warn':'ok',`ขนาดต่อวัน: ${f(g)} g ÷ ${f(bw)} kg = ${f(gk)} g/kg/วัน${ind?` (สูงสุด ${maxD} g/kg/วัน สำหรับ ${ind[1]})`:''}`);
  if(days){ const tot=gk*days; add(tot>maxC*1.05?'flag':tot<maxC*0.8&&maxC>=2?'warn':'ok',`ต่อรอบ: ${f(gk)} × ${days} วัน = ${f(tot)} g/kg/รอบ (${f(g*days)} g) — เป้า ${f(maxC)} g/kg = ${f(maxC*bw)} g${tot>maxC*1.05?' · เกินขนาดต่อรอบ':''}`); }
  else add('warn',`คำสั่งไม่ระบุจำนวนวัน — ยืนยันกับแพทย์: ${indTxt} → ${f(maxC)} g/kg = ${f(maxC*bw)} g/รอบ · ขนาดที่สั่ง ${f(g)} g/วัน → ให้ ${Math.max(1,Math.round(maxC*bw/g))} วันจะได้ ${f(g*Math.max(1,Math.round(maxC*bw/g))/bw)} g/kg`);
  if(age>=18&&bw<35) add('warn',`น้ำหนัก ${f(bw)} kg ในผู้ใหญ่อายุ ${age} ปี — ต่ำมาก ตรวจว่าชั่งจริง (ขนาด IVIG คิดตามน้ำหนัก)`);
  if(pt.bmi!=null&&pt.bmi>=30&&pt.ibw) add('info',`BMI ${f(pt.bmi)} ≥30 — หลายแนวทางคิดขนาดจาก adjusted BW = ${f(pt.ibw+0.4*(bw-pt.ibw))} kg → ${f(g/(pt.ibw+0.4*(bw-pt.ibw)))} g/kg`);
  else if(!$('ht').value&&gk) add('info','ไม่มีส่วนสูง — กรอกเพื่อตรวจ BMI (ถ้า ≥30 พิจารณาคิดขนาดจาก adjusted BW)');
  const vk=g/pct*100/bw; if(vk>10) add('info',`ปริมาตร ${f(g/pct*100)} ml = ${f(vk)} ml/kg/วัน — ระวังน้ำเกิน (หัวใจ/ไต) ปรับสารน้ำอื่น`);
  const bg=(all.match(/\b(AB|A|B|O)\s*(?:Rh|RH)\s*[+\-]?|กรุ๊ป\s*(AB|A|B|O)\b/)||[]); const grp=bg[1]||bg[2];
  if(grp&&grp!=='O') add('warn',`หมู่เลือด ${grp} (ไม่ใช่ O) — เสี่ยง hemolysis จาก IVIG ขนาดสูง (anti-A/anti-B) · ตรวจ Hb ก่อนและ 1–3 วันหลังให้`);
  add('info','การให้: premed Paracetamol + CPM · ให้สารน้ำพอเพียง · เริ่ม rate ต่ำ 30 นาทีแรกแล้วเพิ่มตามยี่ห้อ (คิดเป็น ml/kg/h) · ติดตาม Cr (AKI), Hb (hemolysis), อาการ thrombosis/aseptic meningitis · บัญชี จ(2): ตรวจแบบฟอร์มกำกับการใช้ครบ');
 }catch(e){} return r; })(evaluate);
