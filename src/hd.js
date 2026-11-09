/* ===== hd.js — คำสั่งยาผู้ป่วยฟอกไต (HD) แบบ "วันไม่ฟอก X / วันฟอก Y (HD = อ พฤ ส)"
 · สรุปสูตร · เทียบกับขนาด HD ในฐานข้อมูล (ถ้ามีรูปแบบ วันไม่ฟอก/วันฟอก) · เตือนเมื่อแผงผู้ป่วยยังไม่ตั้ง HD */
evaluate=(orig=>function(row,pt,rows){ const r=orig(row,pt,rows); try{ if(!r||!r.items||!row.hd) return r; const h=row.hd, u=h.u||'mg', add=(l,t)=>{ if(!r.items.some(i=>i.txt===t)) r.items.push({lvl:l,txt:t}); if(l==='warn'&&r.status==='ok') r.status='warn'; if(l==='flag') r.status='flag'; };
  const dTh=h.days.map(d=>DAY_TH[d]).join(' '), nHd=h.days.length, wk=h.non!=null&&h.hd!=null&&nHd?h.non*(7-nHd)+h.hd*nHd:null;
  add('info',`สูตรผู้ป่วยฟอกไต: วันไม่ฟอก ${h.non!=null?fmtN(h.non)+' '+u:'–'} · วันฟอก${dTh?` (${dTh})`:''} ${h.hd!=null?fmtN(h.hd)+' '+u+' (ให้หลังฟอก)':'–'}${wk!=null?` · รวม ${fmtN(wk)} ${u}/สัปดาห์ · จ่ายวันฟอก ${fmtN(h.hd)} / วันอื่น ${fmtN(h.non)}`:''}`);
  if(pt.dial!=='HD') add('warn',`คำสั่งเป็นสูตรฟอกไต (HD) แต่แผงผู้ป่วยยังไม่ได้ตั้ง "การบำบัดทดแทนไต = HD" — ตั้งค่าเพื่อให้ตรวจขนาดตาม HD${pt.crcl!=null?` (ตอนนี้ตรวจตาม CrCl ${r1(pt.crcl)})`:''}`);
  const d=r.drug, hdTxt=d&&d.renal&&d.renal.HD?(d.renal.HD.txt||d.renal.HD.rx||''):'';
  const m=String(hdTxt).replace(/,/g,'').match(/วันไม่ฟอก\s*(\d+(?:\.\d+)?)\s*(?:mg|g|unit)?[^/]*\/\s*วันฟอก\s*(\d+(?:\.\d+)?)/);
  if(m&&pt.dial==='HD'){ const okN=h.non==null||h.non<=+m[1]*1.05, okH=h.hd==null||h.hd<=+m[2]*1.05;
    add(okN&&okH?'ok':'flag',`HD: ${okN&&okH?'ขนาดตรงตามคู่มือ':'ขนาดเกินคู่มือ'} — วันไม่ฟอก ${fmtN(h.non??0)} (≤${m[1]}) · วันฟอก ${fmtN(h.hd??0)} (≤${m[2]}) ${u}`);
    if(okN&&okH) r.items=r.items.filter(i=>!(i.lvl==='flag'&&/ขนาดต่อ(ครั้ง|วัน)/.test(i.txt))); }
 }catch(e){} return r; })(evaluate);
