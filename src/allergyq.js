/* ===== allergyq.js — แท็บ ADR: "ตอบคำถามแพ้ยา" — ผู้ป่วยมีประวัติแพ้ยา จะให้ยานี้ได้หรือไม่ · แพ้ข้ามกลุ่มไหม · ต้องจัดการอย่างไร · ใช้ยาอะไรแทน
 · วางประวัติแพ้ยา (จากหน้าต่างแพ้ยาใน HIS ได้) + คำถาม/ยาที่จะให้ → แยกชนิดปฏิกิริยา · ตรวจ side chain (cross.js) · คำแนะนำตามชนิดปฏิกิริยา · ข้อความตอบ (แก้ไขได้)
 อ้างอิง: AAAAI/ACAAI Drug allergy: a 2022 practice parameter update (Khan DA, JACI 2022) · ASHP/IDSA surgical prophylaxis 2013 · beta-lactam side chain chart (cross.js) */
const AQ_GEN_PEN=['Penicillin (ไม่ระบุตัว)',/penicillin|เพนนิ|เพนิซิล/i,'bl',{c:'pen',s:'?'}];
const AQ_RX={
 scar:[/sjs|\bten\b|stevens|toxic\s*epid|dress|dihs|agep|ผิว(หนัง)?หลุด|ตุ่มน้ำ|ปาก(เปื่อย|เป็นแผล)|ตาแดง.*ผื่น|exfoliat/i,'แพ้ยารุนแรงทางผิวหนังชนิดล่าช้า (SCAR)'],
 organ:[/nephritis|ไตอักเสบ|hepatitis|ตับอักเสบ|hemoly|เม็ดเลือดแดงแตก|serum\s*sickness|thrombocyto|เกล็ดเลือดต่ำ|neutropen/i,'ปฏิกิริยาต่ออวัยวะ/เลือด (ไม่ใช่ IgE)'],
 ana:[/anaphyla|แน่นหน้าอก|หายใจไม่(อิ่ม|ออก)|หอบ|wheez|bronchosp|หลอดลม|hypotens|ความดัน(ต่ำ|ตก)|shock|ช็อก|หมดสติ|oxygen|ออกซิเจน|epinephrine|adrenaline|stridor|เสียงแหบ/i,'Anaphylaxis / immediate รุนแรง (IgE)'],
 imm:[/ลมพิษ|urticar|angioedema|ปากบวม|ตาบวม|หน้าบวม|บวม/i,'Immediate ไม่รุนแรง — ลมพิษ/angioedema (IgE)'],
 mpe:[/\bmp\b|maculopap|exanthem|ผื่นแดง|ผื่น(คัน)?|rash|คัน/i,'ผื่นชนิดล่าช้าไม่รุนแรง (MPE/exanthem)'],
 intol:[/คลื่นไส้|อาเจียน|ท้องเสีย|ปวดหัว|เวียนหัว|ใจสั่น|intoleran|gi\s*upset/i,'ผลข้างเคียง/intolerance (ไม่ใช่การแพ้)'],
};
const AQ_ORDER=['scar','organ','ana','imm','mpe','intol'];
const aqNorm=t=>String(t||'').replace(/([A-Za-z])_([A-Za-z])/g,'$1$2');
function aqParseHist(text){ const T=aqNorm(text), parts=T.split(/\n\s*\n|(?=\n[A-Z][A-Z0-9 .\-\/()\[\]]{3,}\n)/).map(s=>s.trim()).filter(Boolean), out=[];
  (parts.length?parts:[T]).forEach(p=>{ let ds=xaFind(p); if(!ds.length&&AQ_GEN_PEN[1].test(p)) ds=[AQ_GEN_PEN]; if(!ds.length) return;
    const k=AQ_ORDER.find(x=>AQ_RX[x][0].test(p))||'unk', y=(p.match(/\b(19|20)\d{2}\b/)||[])[0]||((p.match(/\b25\d{2}\b/)||[])[0]?String(+p.match(/\b25\d{2}\b/)[0]-543):null);
    ds.forEach(d=>{ if(!out.some(o=>o.d[0]===d[0])) out.push({d,k,y:y?+y:null,txt:p.replace(/\s+/g,' ').slice(0,180)}); }); });
  // ชื่อยาแพ้แบบสั้น (เช่น "tazocin, penicillin") ที่ไม่มีอาการกำกับ
  return out; }
function aqTargets(q){ const T=aqNorm(q), set=[]; xaFind(T).forEach(d=>set.push(d));
  if(!set.length&&typeof rows!=='undefined') rows.forEach(r=>xaFind(aqNorm(r.raw+' '+((masterOf(r)||[])[1]||''))).forEach(d=>{ if(!set.some(x=>x[0]===d[0])) set.push(d); }));
  return set; }
function aqEval(){ const H=aqParseHist($('aqHist').value+'\n'+($('allergy').value||'')), Q=$('aqQ').value, TG=aqTargets(Q), out=$('aqOut');
  if(!H.length){ out.innerHTML='<div class="empty">วางประวัติแพ้ยา (ชื่อยา + อาการ + ปี) — เช่น คัดลอกจากหน้าต่างแพ้ยาใน HIS</div>'; $('aqNote').value=''; return; }
  if(!TG.length){ out.innerHTML='<div class="empty">พิมพ์คำถาม/ยาที่จะให้ (เช่น "วันนี้ให้ cefazolin หรือ ceftriaxone ได้ไหม") หรือกด "ดึงยาจากใบสั่ง"</div>'; }
  const now=new Date().getFullYear(), worst=AQ_ORDER.find(k=>H.some(h=>h.k===k))||'unk', sev=worst==='scar'||worst==='organ', ana=worst==='ana';
  const surg=/\bor\b|ผ่าตัด|pre-?op|surg|prophyla|เตรียมไป\s*or|ก่อนผ่าตัด/i.test(Q+' '+(typeof rows!=='undefined'?rows.map(r=>r.raw).join(' '):''));
  const res=TG.map(t=>{ const pairs=H.map(h=>({h,p:xaPair(h.d,t,{severe:h.k==='scar'||h.k==='organ'})||{lvl:'info',txt:'คนละกลุ่มยา — ไม่มีการแพ้ข้ามทางโครงสร้าง'}}));
    const bad=pairs.find(x=>x.p.lvl==='flag'), bl=t[2]==='bl'&&H.some(h=>h.d[2]==='bl'), gen=H.some(h=>h.d===AQ_GEN_PEN);
    let verdict, lvl, how=[];
    if(bad){ verdict='ไม่ควรให้'; lvl='flag'; }
    else if(bl&&sev){ verdict='หลีกเลี่ยง (ประวัติ SCAR/ปฏิกิริยาต่ออวัยวะต่อ beta-lactam)'; lvl='flag'; }
    else if(bl&&ana){ verdict='ให้ได้ — ระวังและเฝ้าระวังใกล้ชิด'; lvl='warn';
      how=[t[3].c==='carb'?'Carbapenem: แพ้ข้าม <1% — ให้ขนาดเต็มได้ (AAAAI/ACAAI 2022) เฝ้าระวังครั้งแรก':'R1 side chain ต่างจากยาที่แพ้ — ให้ขนาดเต็มได้โดยไม่ต้องทดสอบผิวหนัง (AAAAI/ACAAI 2022) · ถ้านโยบาย รพ./แพทย์ต้องการเพิ่มความปลอดภัย: 2-step graded challenge (10% ของขนาด → สังเกต 30 นาที → 90% ที่เหลือ)',
       'ก่อนให้: เตรียม adrenaline 1 mg/ml (ผู้ใหญ่ 0.5 mg IM ต้นขาด้านนอก · เด็ก 0.01 mg/kg สูงสุด 0.5 mg) · เปิดเส้น · ออกซิเจน/อุปกรณ์ช่วยหายใจพร้อม',
       'ระหว่าง/หลังให้: วัด V/S ทุก 15 นาที ในชั่วโมงแรก · สังเกต ผื่น ลมพิษ คัน แน่นหน้าอก หายใจลำบาก ความดันต่ำ อย่างน้อย 30–60 นาที',
       'เกิดอาการ: หยุดยาทันที · adrenaline IM · แจ้งแพทย์ · บันทึกแพ้ยาเพิ่ม · รายงาน ADR'];
      if(surg&&/Cefazolin/.test(t[0])) how.unshift('ยาป้องกันการติดเชื้อก่อนผ่าตัด: cefazolin เป็นยาที่แนะนำแม้มีประวัติ anaphylaxis ต่อ penicillin (R1 เฉพาะตัว ไม่เหมือน penicillin/cephalosporin อื่น) · ให้ภายใน 60 นาทีก่อนลงมีด ในห้องผ่าตัดที่มีวิสัญญีดูแล'); }
    else if(bl&&(worst==='imm'||worst==='mpe'||worst==='unk')){ verdict='ให้ได้'; lvl='ok'; how=['ให้ขนาดเต็มได้ (ประวัติไม่รุนแรง/ไม่ทราบชัด และ side chain ต่างกัน) · สังเกตอาการ 30 นาทีหลังให้ครั้งแรก'+(worst==='mpe'?' · ผื่นชนิดล่าช้าอาจขึ้นหลังได้ยาหลายวัน — นัดดูผื่น':'')]; }
    else if(worst==='intol'){ verdict='ให้ได้ (ประวัติเป็นผลข้างเคียง ไม่ใช่การแพ้)'; lvl='ok'; how=['พิจารณาแก้ไขบันทึกแพ้ยาเป็น "intolerance/ผลข้างเคียง"']; }
    else { verdict='ให้ได้ (ไม่แพ้ข้ามกลุ่ม)'; lvl='ok'; }
    if(gen&&t[2]==='bl'&&t[3].c==='ceph'&&!bad) how.push('ประวัติระบุ "penicillin" ไม่ระบุตัว — เลี่ยง cephalosporin ที่ R1 เหมือน amoxicillin/ampicillin (cephalexin, cefadroxil, cefaclor) และ penicillin G (cefoxitin, cephalothin)');
    return {t,pairs,verdict,lvl,how}; });
  const alts=[]; if(res.some(r=>r.lvl==='flag')||sev){ if(surg) alts.push('ยาป้องกันก่อนผ่าตัดเมื่อห้ามใช้ beta-lactam: clindamycin 900 mg IV (ภายใน 60 นาที) หรือ vancomycin 15 mg/kg IV (เริ่ม 60–120 นาทีก่อนลงมีด) · ถ้าต้องครอบคลุม gram-negative เพิ่ม gentamicin 5 mg/kg หรือ aztreonam');
    else alts.push('ทางเลือกที่ไม่ใช่ beta-lactam ตามตำแหน่งติดเชื้อ: เช่น fluoroquinolone, macrolide, doxycycline, clindamycin, vancomycin, aminoglycoside · aztreonam (ยกเว้นแพ้ ceftazidime)'); }
  const yrs=H.filter(h=>h.y).map(h=>now-h.y), old=yrs.length&&Math.min(...yrs)>=10;
  const tag=l=>`<span class="tag ${l}">${LVL_TXT[l]}</span>`;
  out.innerHTML=`<h2>ผลประเมิน</h2><dl class="rxdl">
   <dt>ประวัติแพ้</dt><dd><ul class="msgs">${H.map(h=>`<li>${tag(h.k==='scar'||h.k==='organ'||h.k==='ana'?'flag':h.k==='imm'?'warn':'info')}<span><b>${esc(h.d[0])}</b> — ${esc(AQ_RX[h.k]?AQ_RX[h.k][1]:'ไม่ทราบอาการ (ถือว่าอาจเป็น IgE)')}${h.y?` · ปี ${h.y} (${now-h.y} ปีก่อน)`:''}<div class="hint">${esc(h.txt)}</div></span></li>`).join('')}</ul>${old?'<p class="hint" style="margin:4px 0 0">ผ่านมา ≥10 ปี: ผู้แพ้ penicillin แบบ IgE ~80% หายแพ้เมื่อเวลาผ่านไป — แต่ยังต้องถือว่าแพ้จนกว่าจะทดสอบ (ส่งปรึกษา delabel ได้)</p>':''}</dd>
   ${res.map(r=>`<dt>${esc(r.t[0])}</dt><dd><div>${tag(r.lvl)} <b>${esc(r.verdict)}</b></div><ul class="msgs" style="margin-top:4px">${r.pairs.map(x=>`<li>${tag(x.p.lvl)}<span>เทียบ ${esc(x.h.d[0])}: ${esc(x.p.txt)}</span></li>`).join('')}${r.how.map(t=>`<li>${tag('info')}<span>${esc(t)}</span></li>`).join('')}</ul></dd>`).join('')}
   ${alts.length?`<dt>ทางเลือก</dt><dd>${esc(alts.join(' · '))}</dd>`:''}</dl>
   <p class="hint">อ้างอิง: AAAAI/ACAAI Drug allergy practice parameter 2022 (Khan DA et al. JACI 2022) · ASHP/IDSA/SIS/SHEA Clinical practice guidelines for antimicrobial prophylaxis in surgery 2013 · ตาราง beta-lactam side chain (cross.js)</p>`;
  const L=[`คำถาม: ${Q.replace(/\s+/g,' ').trim()||'—'}`,
   'ประวัติแพ้ยา: '+H.map(h=>`${h.d[0]} — ${AQ_RX[h.k]?AQ_RX[h.k][1]:'ไม่ทราบอาการ'}${h.y?` (ปี ${h.y})`:''}`).join(' · '),
   ...res.map(r=>[`ยาที่จะให้: ${r.t[0]} → ${r.verdict}`,...r.pairs.map(x=>`  - เทียบ ${x.h.d[0]}: ${x.p.txt}`),...r.how.map(t=>'  • '+t)].join('\n')),
   ...(alts.length?['ทางเลือก: '+alts.join(' · ')]:[]),
   'บันทึก: คงประวัติแพ้ยาเดิมไว้ · ถ้าให้ยาแล้วไม่มีอาการ บันทึกว่า "ทนยา '+TG.map(t=>t[0]).join('/')+' ได้ (วันที่ ...)" เพื่อใช้ครั้งต่อไป',
   'อ้างอิง: AAAAI/ACAAI Drug Allergy Practice Parameter 2022 · ASHP/IDSA Surgical prophylaxis 2013'];
  $('aqNote').value=L.join('\n'); }
(function(){ const sec=$('p-adr'); if(!sec) return; const box=document.createElement('div'); box.className='panel sec'; box.style.margin='0 0 14px'; box.id='aqBox';
  box.innerHTML=`<h2>ตอบคำถามแพ้ยา — ให้ยานี้ได้ไหม · แพ้ข้ามกลุ่มไหม · ต้องจัดการอย่างไร</h2>
   <div class="grid2">
    <label class="f">① ประวัติแพ้ยา <span class="hint">(วาง/พิมพ์: ชื่อยา + อาการ + ปี — คัดลอกจากหน้าต่างแพ้ยาใน HIS ได้ หลายรายการเว้นบรรทัด)</span><textarea id="aqHist" rows="5" placeholder="เช่น&#10;UNASYN 3 G — anaphylaxis แน่นหน้าอก หายใจไม่อิ่ม ได้ oxygen มีผื่นแดง ตาบวม · 26 มี.ค. 2010&#10;&#10;TAZOCIN — ผื่น"></textarea></label>
    <label class="f">② คำถาม / ยาที่จะให้<textarea id="aqQ" rows="5" placeholder="เช่น วันนี้ให้ cefazolin 2 g IV ก่อนผ่าตัด หรือ ceftriaxone ได้ไหม"></textarea></label>
   </div>
   <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><button type="button" class="btn sm pri" id="aqRun">ประเมิน</button><button type="button" class="btn sm" id="aqFromRx">ดึงยาจากใบสั่ง (หน้าแรก)</button><button type="button" class="btn sm" id="aqToPt" title="ใส่ชื่อยาที่แพ้ลงช่องแพ้ยาในแผงผู้ป่วย เพื่อให้หน้าคัดกรองตรวจทุกใบสั่ง">ใส่ลงช่อง "แพ้ยา" ผู้ป่วย</button><button type="button" class="btn sm" id="aqClr">ล้าง</button><span class="toast" id="aqMsg"></span></div>
   <div id="aqOut" style="margin-top:8px"></div>
   <label class="f" style="margin-top:8px">③ ข้อความตอบคำถาม (แก้ไขได้ — คัดลอกไปวางใน HIS/ตอบแพทย์)<textarea id="aqNote" rows="10" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:var(--ink)"></textarea></label>
   <div style="display:flex;gap:6px;margin-top:6px"><button type="button" class="btn sm pri" id="aqCp">คัดลอกคำตอบ</button><span class="toast" id="aqMsg2"></span></div>`;
  const first=sec.querySelector('.panel'); first?sec.insertBefore(box,first):sec.appendChild(box);
  $('aqRun').onclick=aqEval; $('aqHist').addEventListener('input',()=>{ clearTimeout(window.__aqT); window.__aqT=setTimeout(aqEval,300); }); $('aqQ').addEventListener('input',()=>{ clearTimeout(window.__aqT); window.__aqT=setTimeout(aqEval,300); });
  $('aqFromRx').onclick=()=>{ const ds=[]; (typeof rows!=='undefined'?rows:[]).forEach(r=>xaFind(aqNorm(r.raw+' '+((masterOf(r)||[])[1]||''))).forEach(d=>{ if(!ds.includes(d[0])) ds.push(d[0]); }));
    if(!ds.length){ cpMsg($('aqMsg'),'ไม่พบ beta-lactam/ยาที่ตรวจแพ้ข้ามได้ในใบสั่งหน้าแรก'); return; } $('aqQ').value=($('aqQ').value.trim()?$('aqQ').value.trim()+'\n':'')+'ยาที่สั่ง: '+ds.join(', '); aqEval(); };
  $('aqToPt').onclick=()=>{ const H=aqParseHist($('aqHist').value); if(!H.length) return; const cur=$('allergy').value.trim(), add=H.map(h=>h.d===AQ_GEN_PEN?'penicillin':h.d[0].split(/[ /(]/)[0].toLowerCase()+(h.k==='ana'?' (anaphylaxis)':h.k==='scar'?' (SCAR)':'')).filter(x=>!cur.toLowerCase().includes(x.split(' ')[0]));
    $('allergy').value=[cur,...add].filter(Boolean).join(', '); $('allergy').dispatchEvent(new Event('input',{bubbles:true})); cpMsg($('aqMsg'),'ใส่ในช่องแพ้ยาแล้ว — หน้าคัดกรองจะตรวจแพ้ข้ามทุกใบสั่ง'); };
  $('aqClr').onclick=()=>{ ['aqHist','aqQ','aqNote'].forEach(id=>$(id).value=''); $('aqOut').innerHTML=''; };
  $('aqCp').onclick=()=>copyRich(txtHtml($('aqNote').value),$('aqNote').value,$('aqMsg2'));
  $('t-adr')&&$('t-adr').addEventListener('click',()=>setTimeout(()=>{ if($('aqHist').value||$('allergy').value) aqEval(); },60)); })();
