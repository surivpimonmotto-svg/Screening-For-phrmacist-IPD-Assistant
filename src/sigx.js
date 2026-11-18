/* ===== sigx.js — รายการเดียวมีวิธีใช้หลายแบบ (เช่น วันละ 1 ครั้ง + วันละ 2 ครั้ง) = คำสั่งซ้ำ/คำสั่งเปลี่ยนที่รวมแถวกัน ===== */
function sigMulti(raw){ const s=String(raw||''), set=new Set(); let m; const re=/วันละ\s*(\d+)\s*ครั้ง|\b(od|bid|tid|qid|hs)\b|\bq\s*(\d+)\s*h/ig;
  while((m=re.exec(s))){ const k=m[1]?m[1]:m[2]?({od:'1',hs:'1',bid:'2',tid:'3',qid:'4'})[m[2].toLowerCase()]:String(Math.round(24/+m[3])); set.add(k); }
  const tk=(s.match(/ครั้งละ\s*([\d.\/]+)\s*(?:เม็ด|แคปซูล|cap|tab|ช้อน|ml|ซีซี)/ig)||[]).map(x=>x.replace(/\s+/g,'')); return {freqs:[...set], doses:[...new Set(tk)]}; }
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items) return r; const add=(l,t)=>{ if(r.items.some(i=>i.txt===t)) return; r.items.push({lvl:l,txt:t}); if(l==='flag') r.status='flag'; else if(l==='warn'&&r.status!=='flag') r.status='warn'; };
  const g=sigMulti(row.raw);
  if(g.freqs.length>1||g.doses.length>1){ add('warn',`รายการนี้มีวิธีใช้มากกว่า 1 แบบ (${g.freqs.length>1?g.freqs.map(f=>'วันละ '+f+' ครั้ง').join(' / '):''}${g.freqs.length>1&&g.doses.length>1?' · ':''}${g.doses.length>1?g.doses.join(' / '):''}) — อาจเป็นคำสั่งซ้ำหรือคำสั่งเปลี่ยนที่ถูกรวมเป็นแถวเดียว · โปรแกรมคำนวณจากวิธีใช้แรกเท่านั้น — ตรวจกับใบสั่งจริงว่าใช้แบบไหน`); }
  // ABC/3TC (600/300) และยาเม็ดรวม ARV วันละครั้ง — ถ้าวันละ 2 ครั้ง = ขนาดซ้ำสองเท่า
  if(/abc\s*600|ala-?co-?vir|kivexa|epzicom|abacavir\s*600/i.test(row.raw)&&(row.F===2||g.freqs.includes('2'))) add('flag',`ABC/3TC (600/300) ให้วันละ 1 ครั้ง — ${row.F===2?'คำสั่งเป็น':'พบ'} "วันละ 2 ครั้ง" = ABC 1,200 mg + 3TC 600 mg/วัน (ซ้ำสองเท่า) · ยืนยันกับแพทย์`);
 }catch(e){} return r; })(evaluate);
// "Augmentin 250 mg iv q 8 hr" — mg ที่ไม่ตรงความแรงขวดใดเลย = ขนาดต่อครั้ง (ไม่ใช่ความแรงผลิตภัณฑ์) → แสดงเป็น 250 mg แทน "1 หน่วย / เลือกความแรง"
parseLine=(orig=>function(line){ const r=orig.apply(this,arguments); try{ if(!r||!r.drugId||r.doseUnit!=='unit'||+r.doseVal!==1||r.strength==null) return r;
  const d=KB.find(k=>k.id===r.drugId); if(!d||!d.forms||!d.forms.length) return r; if(!/\b(iv|im|sc|inj|injection|drip|push)\b|ฉีด/i.test(r.raw)) return r;
  if(d.forms.some(f=>Math.abs(+f[2]-r.strength)<0.01)) return r; if(/(?:ครั้งละ\s*)?\d+(?:\.\d+)?\s*(?:vial|amp|ขวด|เม็ด|tab|cap)/i.test(r.raw)) return r;
  r.doseVal=r.strength; r.doseUnit='mg'; r.strength=null; r.form=null; r.issues=(r.issues||[]).filter(x=>!/สมมุติ 1 หน่วย/.test(x)); r.parsed=true; }catch(e){} return r; })(parseLine);
