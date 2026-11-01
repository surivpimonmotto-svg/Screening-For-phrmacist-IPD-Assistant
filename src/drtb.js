/* ===== drtb.js — แท็บ "ยา TB": ส่วนวัณโรคดื้อยา (DR-TB)
 อ้างอิง: แนวทางการบริหารจัดการผู้ป่วยวัณโรคดื้อยา พ.ศ. 2567 (PMDT 2024, กองวัณโรค กรมควบคุมโรค)
 ตาราง 3.1 (mono/poly) · 3.2/3.7 (BPaLM/BPaL) · 3.3 (9 เดือน) · 3.4 (กลุ่มยา A/B/C) · 3.5 (สูตรระยะยาว) · 4.1–4.3 (ADR/DI) · 6.1–6.5 (ภาวะเฉพาะ) */
const DRTB_SRC='แนวทางการบริหารจัดการผู้ป่วยวัณโรคดื้อยา พ.ศ. 2567 (PMDT 2024) กองวัณโรค กรมควบคุมโรค';
const DRTB_PAT=[
 {k:'H',nm:'ดื้อ H (Hr-TB)',reg:[['6 RZE-FQ (Lfx)','6 เดือน','กรณีไม่ดื้อ FQs'],['6 RZE','6 เดือน','เมื่อมีผลดื้อ FQs']]},
 {k:'Z',nm:'ดื้อ Z',reg:[['2 HRE / 7 HR','9 เดือน','']]},
 {k:'E',nm:'ดื้อ E',reg:[['2 HRZ / 4 HR','6 เดือน','']]},
 {k:'HZ',nm:'ดื้อ H + Z',reg:[['12 RE-FQ','12 เดือน','']]},
 {k:'HE',nm:'ดื้อ H + E',reg:[['9–12 RZ-FQ','9–12 เดือน','']]},
 {k:'HEZ',nm:'ดื้อ H + E + Z',reg:[['ปรึกษาผู้เชี่ยวชาญเป็นรายกรณี','','']]},
 {k:'MDR',nm:'MDR/RR-TB (ดื้อ R ± H) — ไม่ดื้อ FQ',reg:[['6 BPaLM = Bdq-Pa-Lzd-Mfx','6 เดือน (26 สัปดาห์)','สูตรหลัก'],['9 เดือน: 4–6 Bdq(6 ด.)-Lfx(Mfx)-Cfz-Z-E-Hh-Lzd(2 ด.) / 5 Lfx(Mfx)-Cfz-Z-E','9 เดือน','ทางเลือก (เช่น อายุ <14 ปี, ตั้งครรภ์ใช้สูตร Lzd 2 เดือน) · Lzd 2 ด. แทน Eto 4 ด. ได้'],['สูตรระยะยาว (longer individualized)','18–20 เดือน','เมื่อใช้ 2 สูตรแรกไม่ได้']]},
 {k:'PRE',nm:'Pre-XDR-TB (MDR + ดื้อ FQ)',reg:[['6 BPaL = Bdq-Pa-Lzd','6 เดือน','สูตรหลัก'],['สูตรระยะยาว (longer individualized)','18–20 เดือน','']]},
 {k:'XDR',nm:'XDR-TB (pre-XDR + ดื้อ Bdq หรือ Lzd)',reg:[['สูตรระยะยาว (longer individualized)','18–20 เดือน','เลือกยาตามกลุ่ม A→B→C · ≥4 ขนานระยะเข้มข้น (บางราย 5) · ≥3 ขนานระยะต่อเนื่อง']]}];
// ตาราง 3.3: ขนาดยา (mg/วัน) ตามช่วงน้ำหนัก 30–35 · 36–45 · 46–55 · 56–70 · >70 kg
const DRTB_9M=[['Bedaquiline (Bdq)',null,'400 mg/วัน × 2 สัปดาห์ → 200 mg 3 ครั้ง/สัปดาห์ (จ/พ/ศ) × 22 สัปดาห์ (รวม 24 สัปดาห์) ทุกช่วงน้ำหนัก'],
 ['Levofloxacin (Lfx)',[500,'500–750',750,750,750]],['หรือ Moxifloxacin (Mfx)',[400,400,400,400,400]],['Clofazimine (Cfz)',[50,100,100,100,100]],
 ['Pyrazinamide (Z)',[1000,1000,1500,1500,'1,500–2,000']],['Ethambutol (E)',[800,800,1000,1000,'1,000–1,200']],['Isoniazid high dose (Hh)',[400,400,600,600,600]],
 ['Linezolid (Lzd) 2 เดือน',[600,600,600,600,600]],['หรือ Ethionamide/Prothionamide 4 เดือน',[500,500,750,750,1000]]];
const DRTB_REN=[['Isoniazid','ไม่ต้องปรับ'],['Rifampicin','ไม่ต้องปรับ'],['Pyrazinamide','25 mg/kg 3 ครั้ง/สัปดาห์'],['Ethambutol','15 mg/kg 3 ครั้ง/สัปดาห์'],['Levofloxacin','750–1,000 mg 3 ครั้ง/สัปดาห์'],['Moxifloxacin','ไม่ต้องปรับ'],['Cycloserine','250 mg/วัน'],['Ethionamide','ไม่ต้องปรับ'],['PAS','ไม่ต้องปรับ'],['Amikacin/Streptomycin','15 mg/kg 2–3 ครั้ง/สัปดาห์'],['Bedaquiline · Linezolid · Clofazimine','ไม่ต้องปรับ'],['Delamanid · Pretomanid','ไม่มีข้อมูล']];
const DRTB_DDI=[[/linezolid|zyvox/i,/sertraline|fluoxetine|escitalopram|citalopram|paroxetine|venlafaxine|duloxetine|amitriptyline|nortriptyline|bupropion|buspirone|dextromethorphan|pseudoephedrine|diphenhydramine|tramadol|triptan/i,'flag','Linezolid + ยาเพิ่ม serotonin → serotonin syndrome — พิจารณาหยุดยาคู่'],
 [/linezolid|zyvox/i,/zidovudine|\bazt\b|co-?trimox|bactrim|sulfameth/i,'warn','Linezolid + AZT/Co-trimoxazole → pancytopenia — ติดตาม CBC ใกล้ชิด'],
 [/linezolid|zyvox/i,/metformin|lamivudine|\b3tc\b|zidovudine|abacavir/i,'warn','Linezolid + metformin/NRTI → เสี่ยง lactic acidosis'],
 [/bedaquiline|sirturo|\bbdq\b/i,/rifampi|\brifam|rifapentine|carbamazepine|phenytoin/i,'flag','Bedaquiline + inducer (rifampicin, carbamazepine, phenytoin) → ระดับ Bdq ลด — หลีกเลี่ยง'],
 [/bedaquiline|sirturo|\bbdq\b/i,/efavirenz|\befv\b|gpo-?vir-?t|teevir/i,'flag','Bedaquiline + EFV → ระดับ Bdq ลด — เปลี่ยนเป็น DTG/RAL (หรือ NVP/RPV)'],
 [/bedaquiline|sirturo|\bbdq\b/i,/lopinavir|aluvia|kaletra|ritonavir|darunavir|atazanavir/i,'warn','Bedaquiline + PI/r → ระดับ Bdq สูง — แนะนำ DTG/RAL · ถ้าจำเป็นใช้ LPV/r ตรวจ ECG ทุก 2 สัปดาห์ใน 8 สัปดาห์แรก'],
 [/bedaquiline|sirturo|\bbdq\b|clofazimine|delamanid|moxiflox|levoflox/i,/clofazimine|delamanid|moxiflox|levoflox|clarithro|azithro|erythro|fluconazole|voriconazole|ketoconazole|ondansetron|domperidone|metoclopramide|haloperidol|citalopram|escitalopram|methadone|amiodarone|sotalol|efavirenz/i,'warn','ยาทำให้ QT ยาวหลายตัวร่วมกัน — ตรวจ ECG (QTcF), K, Mg, Ca สม่ำเสมอ'],
 [/levoflox|moxiflox/i,/antacid|calcium|caco3|chalk|ferrous|\biron\b|zinc|magnes|sucralfate|multivit/i,'warn','FQ + ยาที่มีประจุบวก → ดูดซึมลด: ให้ FQ ก่อน 2 ชม. หรือหลัง 3 ชม. (Mfx: ก่อน 4 ชม./หลัง 8 ชม.; เหล็ก ห่าง 8 ชม.)'],
 [/levoflox|moxiflox/i,/warfarin|orfarin/i,'warn','FQ + warfarin → INR สูง — ติดตาม INR ใกล้ชิด'],
 [/moxiflox/i,/amiodarone|dronedarone|sotalol|quinidine|disopyramide/i,'flag','Moxifloxacin + antiarrhythmic class IA/III → หลีกเลี่ยง (proarrhythmia)'],
 [/cycloserine|terizidone/i,/isoniazid|\binh\b/i,'info','Cycloserine + INH → CNS ADR เพิ่ม — ให้วิตามิน B6'],
 [/amikacin|streptomycin/i,/furosemide|lasix|ethacrynic|mannitol/i,'warn','Aminoglycoside + loop diuretic → พิษต่อหู/ไต — หลีกเลี่ยง ติดตามไต การได้ยิน electrolyte'],
 [/isoniazid|\binh\b/i,/carbamazepine|phenytoin/i,'warn','INH (โดยเฉพาะ high dose) เพิ่มระดับ carbamazepine/phenytoin — ติดตามระดับยา + LFT']];
const DRTB_DOSE=[[/bedaquiline|sirturo|\bbdq\b/i,'Bedaquiline',400,'400 mg/วัน × 2 สัปดาห์ แล้ว 200 mg 3 ครั้ง/สัปดาห์'],[/pretomanid/i,'Pretomanid',200,'200 mg/วัน'],[/linezolid|zyvox/i,'Linezolid',600,'600 mg/วัน (ลดเป็น 300 mg ได้ตาม ADR หลัง 8 สัปดาห์)'],[/moxiflox|avelox/i,'Moxifloxacin',400,'400 mg/วัน'],[/clofazimine|lamprene/i,'Clofazimine',100,'100 mg/วัน (30–35 kg: 50 mg)']];
// mg ต่อครั้งจากข้อความ: ความแรง × จำนวนเม็ด (เช่น "Linezolid 600 mg 2 tab od" = 1,200 mg)
function drtbMg(r){ const t=r.raw, st=t.match(/(\d+(?:\.\d+)?)\s*mg/i); if(!st) return null; const n=t.match(/(\d+(?:\.\d+)?)\s*(?:tab|tabs|cap|caps|เม็ด)\b/i)||t.match(/mg\D{0,12}?(\d+(?:\.\d+)?)\s*[x*]\s*\d/i); return +st[1]*(n?+n[1]:1); }
function drtbRender(){ const out=$('drOut'); if(!out) return; const pt=getPt(), bw=+pt.bw, age=+pt.age, k=$('dPat').value, P=DRTB_PAT.find(x=>x.k===k), rws=joinLines(($('xPaste').value||'').split(/\n/)).map(parseLine).filter(Boolean), txt=rws.map(r=>r.raw+' '+((masterOf(r)||[])[1]||'')), li=(l,m)=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${m}</span></li>`;
  const imp=pt.dial==='HD'||pt.dial==='CRRT'||(pt.crcl!=null&&pt.crcl<30);
  let h=`<h2>สูตรยาตามรูปแบบการดื้อยา — ${esc(P.nm)}</h2><table class="ctbl"><thead><tr><th>สูตร</th><th>ระยะเวลา</th><th>หมายเหตุ</th></tr></thead><tbody>${P.reg.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table>`;
  // เกณฑ์ BPaL(M) / 9 เดือน เทียบกับผู้ป่วย
  if(k==='MDR'||k==='PRE'){ const L=[];
    if(bw>0&&bw<35) L.push(li('flag',`น้ำหนัก ${fmtN(bw)} kg (<35) — ไม่เข้าเกณฑ์ BPaL(M) · พิจารณาสูตร 9 เดือน/ระยะยาว`)); else if(bw>0) L.push(li('ok',`น้ำหนัก ${fmtN(bw)} kg ≥35 — เข้าเกณฑ์น้ำหนัก BPaL(M)`));
    if(age>0&&age<14) L.push(li('flag',`อายุ ${fmtN(age)} ปี (<14) — ยังไม่แนะนำ BPaL(M) · ใช้สูตร 9 เดือน`));
    if(pt.preg) L.push(li('flag','ตั้งครรภ์/ให้นมบุตร — ไม่ใช้ BPaL(M) · พิจารณา 9 เดือนที่มี Lzd 2 เดือน (ดุลยพินิจผู้เชี่ยวชาญ)'));
    L.push(li('info','เกณฑ์อื่น: ไม่ดื้อ/ไม่แพ้ Bdq Pa Lzd Mfx · ไม่เคยได้ยาเหล่านี้ >4 สัปดาห์ (ถ้าเคย ต้องมีผล DST ไว) · ไม่ใช่ TB นอกปอดรุนแรง (TB meningitis, กระดูก/ข้อ) · HIV ใช้ได้'));
    L.push(li('info','9 เดือน: ต้องไม่ดื้อ FQ · ไม่เป็น miliary/TB meningitis · ไม่มีรอยโรคมาก (โพรงปอดทั้ง 2 ข้าง) · สูตร Lzd ต้อง Hb >8, ANC >0.75, Plt >150 ×10⁹/L และไม่มี neuropathy รุนแรง'));
    h+=`<ul class="msgs">${L.join('')}</ul>`; }
  // ขนาดยา (เฉพาะ MDR/pre-XDR/XDR)
  const showD=['MDR','PRE','XDR'].includes(k); const bi=bw>70?4:bw>55?3:bw>45?2:bw>35?1:bw>=30?0:-1;
  if(showD) h+=`<h2>ขนาดยา BPaLM / BPaL (ตาราง 3.2 · 3.7)</h2><table class="ctbl"><thead><tr><th>ยา</th><th>ขนาด/วัน (ทุกช่วงน้ำหนัก)</th></tr></thead><tbody>
   <tr><td>Bedaquiline</td><td>400 mg/วัน × 2 สัปดาห์ → 200 mg 3 ครั้ง/สัปดาห์ × 24 สัปดาห์ (รวม 26 สัปดาห์)</td></tr><tr><td>Pretomanid</td><td>200 mg</td></tr><tr><td>Linezolid</td><td>600 mg (ลดเป็น 300 mg หรือหยุดได้ตาม ADR หลัง 8 สัปดาห์ — ถ้าใช้ไม่ได้ใน 9 สัปดาห์แรก เปลี่ยนเป็นสูตรระยะยาว)</td></tr><tr><td>Moxifloxacin (เฉพาะ BPaLM)</td><td>400 mg</td></tr></tbody></table>
   <p class="hint">Bdq หรือ Pa หยุดชั่วคราวได้ไม่เกิน 14 วันในเดือนแรก · หลัง 1 เดือนหยุดได้ไม่เกิน 1 สัปดาห์ (เกินต้องชดเชยให้ครบ 26 สัปดาห์)</p>
   <h2>ขนาดยาสูตร 9 เดือน (ตาราง 3.3)${bi>=0?` — น้ำหนัก ${fmtN(bw)} kg`:''}</h2><table class="ctbl"><thead><tr><th>ยา</th>${['30–35','36–45','46–55','56–70','>70'].map((b,i)=>`<th${i===bi?' style="background:color-mix(in srgb,var(--accent) 25%,transparent)"':''}>${b} kg</th>`).join('')}</tr></thead><tbody>${DRTB_9M.map(([n,a,t])=>`<tr><td>${esc(n)}</td>${a?a.map((v,i)=>`<td${i===bi?' style="font-weight:800;background:color-mix(in srgb,var(--accent) 18%,transparent)"':''}>${typeof v==='number'?fmtN(v):v}</td>`).join(''):`<td colspan="5">${esc(t)}</td>`}</tr>`).join('')}</tbody></table>
   ${bw>0&&bw<30?'<p class="hint" style="color:var(--flag)">น้ำหนัก <30 kg — ใช้ตารางขนาดยาเด็ก (ตาราง 3.6) ปรึกษาผู้เชี่ยวชาญ</p>':''}`;
  // ไต
  h+=`<h2>ไตเสื่อม CrCl <30 / HD (ตาราง 6.4)${imp?' — ผู้ป่วยรายนี้เข้าเกณฑ์':''}</h2><table class="ctbl"><tbody>${DRTB_REN.map(r=>`<tr><td>${r[0]}</td><td${imp&&!/ไม่ต้องปรับ|ไม่มีข้อมูล/.test(r[1])?' style="font-weight:700;color:#b45309"':''}>${r[1]}</td></tr>`).join('')}</tbody></table>`;
  // ตรวจคำสั่งที่วาง: ขนาด + DI
  if(rws.length){ const L=[];
    rws.forEach((r,i)=>{ const t=txt[i]; DRTB_DOSE.forEach(([re,n,mx,how])=>{ if(!re.test(t)) return; const D=drtbMg(r), F=r.F||(/\bbid\b|\b2\s*[x*]\s*2|q12/i.test(r.raw)?2:1); if(D==null) return; const day=F>=0.95?D*F:D;
      if(day>mx*1.05) L.push(li('flag',`${n} ${fmtN(day)} mg/วัน เกินขนาดในแนวทาง → ${how}`)); else L.push(li('ok',`${n} ${fmtN(day)} mg/วัน — ${how}`)); }); });
    DRTB_DDI.forEach(([a,b,l,m])=>{ const ia=txt.findIndex(t=>a.test(t)); if(ia<0) return; const ib=txt.findIndex((t,j)=>j!==ia&&b.test(t)); if(ib>=0) L.push(li(l,`${esc(m)} <span class="hint">(${esc(rws[ia].raw.slice(0,30))} ↔ ${esc(rws[ib].raw.slice(0,30))})</span>`)); });
    if(L.length) h+=`<h2>ตรวจคำสั่งยาดื้อยาที่วาง</h2><ul class="msgs">${L.join('')}</ul>`; }
  // ภาวะเฉพาะ + ADR
  h+=`<h2>ภาวะเฉพาะ (บทที่ 6)</h2>
   <details class="refbox"${pt.preg?' open':''}><summary>ตั้งครรภ์ / ให้นมบุตร</summary><div class="refbody"><ul><li>ตรวจ urine pregnancy ก่อนเริ่ม · คุมกำเนิดตลอดการรักษา — การตั้งครรภ์ไม่ใช่ข้อห้ามในการรักษา</li><li><b>หลีกเลี่ยง</b> aminoglycoside (streptomycin, kanamycin, amikacin: พิษต่อหูทารก) และ ethionamide/prothionamide (teratogenic)</li><li>WHO: ใช้สูตร 9 เดือนที่มี Lzd 2 เดือน — 4-6 Bdq-Lfx(Mfx)-Cfz-Z-E-Hh-Lzd(2 ด.) / 5 Lfx(Mfx)-Cfz-Z-E (ดุลยพินิจผู้เชี่ยวชาญ) · ไม่ใช้ BPaL(M)</li><li>คำนวณขนาดยาตามน้ำหนักปัจจุบัน · ให้วิตามิน B6 ไม่เกิน 150 mg/วัน (ขนาดสูงลดการดูดซึม FQ และทารกอาจชักจาก B6 withdrawal)</li><li>FDA class: B = E, amox/clav, Bdq · C = H R Z FQs Eto/Pto PAS Cs Lzd clarithro Cfz · D = streptomycin, kanamycin, amikacin</li><li>ให้นมบุตร: ยาผ่านน้ำนมน้อย · แนะนำนมผสม (บาง guideline ให้นมแม่ได้) · แม่สวมหน้ากาก แยกห้องถ้ายังพบเชื้อ</li></ul></div></details>
   <details class="refbox"${pt.lab&&((pt.lab.ast||0)>120||(pt.lab.alt||0)>120)?' open':''}><summary>ตับทำงานผิดปกติ</summary><div class="refbody"><ul><li>ยาส่วนใหญ่ (โดยเฉพาะ <b>Z</b>) เป็นพิษต่อตับ · ไม่ค่อยเป็นพิษ: E, aminoglycoside, FQs (น้อย)</li><li>ระยะตับอักเสบ: เลี่ยง Z ไว้ก่อน → ค่อย ๆ เพิ่มยาเมื่อตับดีขึ้น พร้อม LFT ใกล้ชิด</li><li>Bdq: LFT ก่อนเริ่มและทุกเดือน · Mfx: ระวัง moderate-severe hepatic impairment · Pa: LFT ก่อนเริ่ม สัปดาห์ที่ 2 และทุกเดือน · Dlm: ไม่แนะนำใน moderate-severe · Eto/Pto + R เสี่ยงเพิ่ม · H high dose: LFT ทุกเดือน</li><li>วินิจฉัย hepatitis: AST/ALT >3×ULN มีอาการ หรือ >5×ULN ไม่มีอาการ · กลับมาให้ยาทีละตัวเมื่อ AST/ALT <2×ULN</li></ul></div></details>
   <details class="refbox"><summary>ติดเชื้อ HIV ร่วม</summary><div class="refbody"><ul><li>ARV แนะนำ: TDF หรือ TAF + 3TC หรือ FTC + <b>DTG</b> · ทางเลือก ABC/AZT + 3TC + EFV/RPV</li><li><b>EFV ลดระดับ Bdq</b> → ใช้ NVP, RPV หรือ INSTI แทนในสูตร BPaL(M)/9 เดือน/ระยะยาว</li><li><b>PI/r เพิ่มระดับ Bdq</b> → ใช้ DTG/RAL · ถ้าจำเป็นใช้ LPV/r ตรวจ ECG ทุก 2 สัปดาห์ใน 8 สัปดาห์แรก</li><li>เริ่ม ARV ภายใน 8 สัปดาห์หลังเริ่มยา DR-TB (ทุกระดับ CD4) · CD4 <50: ภายใน 2 สัปดาห์ · TB meningitis: ระวัง เริ่มภายใต้การดูแลใกล้ชิด</li><li>Aminoglycoside + TDF เสี่ยงพิษต่อไต · Lzd + AZT เสี่ยงกดไขกระดูก</li></ul></div></details>
   <details class="refbox"><summary>เด็ก</summary><div class="refbody"><ul><li>BPaL(M) ยังไม่แนะนำ <14 ปี → ใช้สูตร 9 เดือน หรือระยะยาว</li><li>Bdq ใช้ได้อายุ 6–17 ปี (และ <6 ปีในสูตรระยะยาวภายใต้การกำกับใกล้ชิด) · Dlm ใช้ได้ ≥3 ปี (และ <3 ปีภายใต้การกำกับ)</li><li>ขนาดยาตามน้ำหนักใช้ตาราง 3.6 (ไฟล์แนวทาง หน้า 42–54)</li></ul></div></details>
   <h2>ติดตามความปลอดภัย (aDSM · ตาราง 4.1–4.2)</h2>
   <table class="ctbl"><tbody>
    <tr><td><b>QT ยาว</b> (Bdq, Dlm, FQ, Cfz, Pa)</td><td>ECG ก่อนเริ่ม สัปดาห์ 2 และทุกเดือน · QTcF >450 ms (ชาย) / >470 ms (หญิง) = ผิดปกติ ตรวจซ้ำ แก้ K Mg Ca · <b>QTcF >500 ms หรือเพิ่ม >60 ms → หยุดยาที่ทำให้ QT ยาว</b> · กลับมาให้เมื่อ <500 ms อย่างน้อย 1 สัปดาห์ เริ่ม Bdq ก่อนพร้อม ECG สัปดาห์ละครั้ง</td></tr>
    <tr><td><b>กดไขกระดูก</b> (Lzd, Pa)</td><td>CBC ก่อนเริ่มและทุกเดือน · ห้ามเริ่ม Lzd ถ้า Hb <8, ANC <0.75, Plt <50 ×10⁹/L · Grade 1–2 (Hb 8–10.5, Plt 50,000–99,999, ANC 750–1,500): ติดตามใกล้ชิด พิจารณาลด Lzd เหลือ 300 mg · Grade 3–4 (Hb <8, Plt <50,000, ANC <750): หยุด Lzd ทันที</td></tr>
    <tr><td><b>ปลายประสาทอักเสบ</b> (Lzd, H, Cs, FQ)</td><td>ป้องกันด้วย B6 50 mg/วัน (ผู้ใหญ่ สูงสุด 100 mg/วัน) · เด็ก 25 mg/วัน · ลดขนาด/หยุด Lzd · ยาแก้ปวด neuropathic (gabapentin, pregabalin, carbamazepine — ระวัง DI กับ Bdq)</td></tr>
    <tr><td><b>ตาอักเสบ</b> (Lzd, E)</td><td>ตรวจสายตา/ตาบอดสีก่อนเริ่มและทุกเดือนที่ได้ Lzd หรือ E · มีอาการ → หยุดยาทันที ส่งจักษุแพทย์</td></tr>
    <tr><td><b>ไทรอยด์ต่ำ</b> (Eto/Pto, PAS)</td><td>TSH ทุก 3 เดือน · TSH >10: levothyroxine 50 mcg (ผู้สูงอายุ/โรคหัวใจ 12.5–25 mcg)</td></tr>
    <tr><td><b>K/Mg ต่ำ, ไต, หู</b> (aminoglycoside)</td><td>Cr, K, Mg ทุกเดือน · ทดสอบการได้ยิน · หลีกเลี่ยงร่วม loop diuretic</td></tr>
    <tr><td><b>จิตเวช/ชัก</b> (Cs, H, FQ, Dlm)</td><td>B6 · คัดกรองซึมเศร้า · ชัก: หยุดยาที่สงสัย ให้ B6 ≤100 mg (Cs/INH) · phenytoin/carbamazepine ระวัง DI กับ Bdq</td></tr>
    <tr><td><b>Lactic acidosis</b> (Lzd)</td><td>อาการคลื่นไส้ หายใจเร็ว — ตรวจ lactate · หยุด Lzd</td></tr>
    <tr><td><b>ผิวคล้ำ</b> (Cfz)</td><td>แจ้งล่วงหน้า กลับเป็นปกติหลังหยุดยาหลายเดือน</td></tr></tbody></table>
   <h2>กลุ่มยาสำหรับสูตรระยะยาว (ตาราง 3.4)</h2><table class="ctbl"><tbody><tr><td><b>A</b></td><td>Levofloxacin หรือ Moxifloxacin · Bedaquiline · Linezolid</td></tr><tr><td><b>B</b></td><td>Clofazimine · Cycloserine หรือ Terizidone</td></tr><tr><td><b>C</b></td><td>Ethambutol · Delamanid · Pyrazinamide · Imipenem-cilastatin หรือ Meropenem (ให้ร่วม clavulanate) · Amikacin (หรือ Streptomycin) · Ethionamide หรือ Prothionamide · PAS</td></tr></tbody></table>
   <p class="hint">≥4 ขนานระยะเข้มข้น ≥3 ขนานระยะต่อเนื่อง เลือก A→B→C · ไม่ใช้ kanamycin/capreomycin · amikacin เฉพาะ ≥18 ปีที่มีผล DST ไวและติดตาม ADR ได้ · ห้ามใช้ clavulanate เดี่ยว</p>
   <p class="hint" style="margin-top:6px">${esc(DRTB_SRC)} — ไฟล์เต็มใน คู่มือย่อ › เอกสารต้นฉบับ</p>`;
  out.innerHTML=h; }
(function(){ if(!$('drOut')) return; $('dPat').innerHTML=DRTB_PAT.map(x=>`<option value="${x.k}">${x.nm}</option>`).join(''); $('dPat').value='MDR';
  $('dPat').addEventListener('change',drtbRender); $('xPaste').addEventListener('input',()=>setTimeout(drtbRender,550)); $('xRun').addEventListener('click',drtbRender); $('t-tbx').addEventListener('click',drtbRender);
  ['bw','ageIn','ageU','scr','preg','mode','crclIn'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',drtbRender); el.addEventListener('change',drtbRender); } });
  drtbRender(); })();

/* ---------- ตาราง 3.6 ขนาดยาตามช่วงน้ำหนัก (เด็ก/ผู้ใหญ่ <46 kg เป็นหลัก) สูตรระยะยาว · WHO 2022 ----------
 ช่วงน้ำหนัก: 3–<5 · 5–<7 · 7–<10 · 10–<16 · 16–<24 · 24–<30 · 30–<36 · 36–<46 · 46–<56 · 56–<70 · ≥70 kg
 "mL" = ละลายเม็ด/แคปซูลในน้ำ 10 mL แล้วตวงตามจำนวน mL (เชิงอรรถ b) · ช่องที่รวมเซลล์ในตารางต้นฉบับ คัดลอกค่าซ้ำทุกช่วง */
const PDR_BANDS=[3,5,7,10,16,24,30,36,46,56,70], PDR_LAB=['3–<5','5–<7','7–<10','10–<16','16–<24','24–<30','30–<36','36–<46','46–<56','56–<70','≥70'];
const PD_NA='-';
const PDR=[
 ['A','Levofloxacin (Lfx)','100 mg dt (10 mg/mL)',['5 mL (0.5 dt)','1','1.5','2','3',PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA]],
 ['A','Levofloxacin (Lfx)','250 mg tab (25 mg/mL)',['2 mL','5 mL (0.5 tab)','5 mL (0.5 tab)','1','1.5','2','3','3','3','3','3']],
 ['A','Levofloxacin (Lfx)','500 mg tab',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'1','1.5','1.5','1.5','1.5','1.5']],
 ['A','Levofloxacin (Lfx)','750 mg tab',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'1','1','1','1','1']],
 ['A','Moxifloxacin (Mfx)','100 mg dt (10 mg/mL)',['4 mL','8 mL','1.5','2','3','4','4','4',PD_NA,PD_NA,PD_NA]],
 ['A','Moxifloxacin (Mfx)','400 mg tab (40 mg/mL) standard',['1 mL','2 mL','3 mL','5 mL (0.5 tab)','7.5 mL (0.75 tab)','1','1','1','1','1','1']],
 ['A','Moxifloxacin (Mfx)','400 mg tab high dose',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'1','1','1','1','1 หรือ 1.5']],
 ['A','Bedaquiline (Bdq)','20 mg dt','BDQ20'],
 ['A','Bedaquiline (Bdq)','100 mg tab (10 mg/mL)','BDQ100'],
 ['A','Linezolid (Lzd)','20 mg/mL susp',['2 mL','4 mL','6 mL','8 mL','11 mL','14 mL','15 mL','20 mL',PD_NA,PD_NA,PD_NA]],
 ['A','Linezolid (Lzd)','150 mg dt (15 mg/mL)',['2.5 mL','5 mL (0.5 dt)','1','1','2 ᵉ','2 ᵉ','2','3',PD_NA,PD_NA,PD_NA]],
 ['A','Linezolid (Lzd)','600 mg tab (60 mg/mL)',[PD_NA,'1.25 mL','2.5 mL','2.5 mL','5 mL (0.5 tab) ᵉ','5 mL (0.5 tab) ᵉ','5 mL (0.5 tab)','7.5 mL (0.75 tab)','1','1','1']],
 ['B','Clofazimine (Cfz)','50 mg cap/tab',['1 จ/ศ','1 จ/พ/ศ','1 จ/พ/ศ','1','1','2','2','2','2','2','2']],
 ['B','Clofazimine (Cfz)','100 mg cap/tab',[PD_NA,'1 จ/ศ','1 จ/ศ','1 จ/พ/ศ','1 จ/พ/ศ','1','1','1','1','1','1']],
 ['B','Cycloserine/Terizidone (Cs)','125 mg mini cap (12.5 mg/mL)',['2 mL','4 mL','1','2','3','4','4','4',PD_NA,PD_NA,PD_NA]],
 ['B','Cycloserine/Terizidone (Cs)','250 mg cap (25 mg/mL)',['1 mL','2 mL','5 mL','1','2','2','2','2','3','3','3']],
 ['C','Ethambutol (E)','100 mg dt (10 mg/mL)',['5 mL (0.5 dt)','1','2','3','4',PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA]],
 ['C','Ethambutol (E)','400 mg tab (40 mg/mL)',['1.5 mL','3 mL','4 mL','6 mL','1','1.5','2','2','2.5','2.5','2.5–3']],
 ['C','Delamanid (Dlm)','25 mg dt','DLM25'],
 ['C','Delamanid (Dlm)','50 mg tab (5 mg/mL)','DLM50'],
 ['C','Pyrazinamide (Z)','150 mg dt (15 mg/mL)',['5 mL (0.5 dt)','1','2','3','5',PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA]],
 ['C','Pyrazinamide (Z)','400 mg tab (40 mg/mL)',['2.5 mL','5 mL (0.5 tab)','7.5 mL (0.75 tab)','1','2','2.5','3','4','4','4','4–5']],
 ['C','Pyrazinamide (Z)','500 mg tab (50 mg/mL)',['2 mL','5 mL','5 mL','1','1.5','2','2.5','3','3','3','3–4']],
 ['C','Imipenem-cilastatin','500+500 mg vial (ร่วม clavulanate)',['ไม่ใช้ <15 ปี (ใช้ meropenem)','ไม่ใช้ <15 ปี','ไม่ใช้ <15 ปี','ไม่ใช้ <15 ปี','ไม่ใช้ <15 ปี','ไม่ใช้ <15 ปี','2 vials (1 g+1 g) bd','2 vials bd','2 vials bd','2 vials bd','2 vials bd']],
 ['C','Meropenem (Mpm)','1 g vial (20 mL) (ร่วม clavulanate)',['1 mL tid','2 mL tid','4 mL tid','6 mL tid','9 mL tid','11 mL tid','1 vial tid หรือ 2 vials bd','1 vial tid หรือ 2 vials bd','1 vial tid หรือ 2 vials bd','1 vial tid หรือ 2 vials bd','1 vial tid หรือ 2 vials bd']],
 ['C','Amikacin (Am) — ≥18 ปีเท่านั้น','500 mg/2 mL amp',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'3–4 mL','4 mL','4 mL']],
 ['C','Streptomycin (Sm) — ≥18 ปีเท่านั้น','1 g vial',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'คำนวณตามการละลาย','คำนวณตามการละลาย','คำนวณตามการละลาย']],
 ['C','Ethionamide/Prothionamide','125 mg dt (12.5 mg/mL)',['3 mL','7 mL','1','2','3','4','4','4',PD_NA,PD_NA,PD_NA]],
 ['C','Ethionamide/Prothionamide','250 mg tab (25 mg/mL)',[PD_NA,'3 mL','5 mL (0.5 tab)','1','2','2','2','2','3','3','4']],
 ['C','PAS','PAS sodium sachet (≡ 4 g PAS acid)',['0.3 g bd','0.75 g bd','1 g bd','2 g bd','3 g bd','3.5 g bd','4 g bd','4 g bd','4 g bd','4 g bd','4–6 g bd']],
 ['อื่น','Isoniazid high dose (Hh)','50 mg/5 mL soln',['5 mL','9 mL','15 mL','20 mL',PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA]],
 ['อื่น','Isoniazid high dose (Hh)','100 mg dt/tab (10 mg/mL)',['5 mL (0.5 dt)','1','1.5','2','3','4','4','4.5',PD_NA,PD_NA,PD_NA]],
 ['อื่น','Isoniazid high dose (Hh)','300 mg tab',[PD_NA,PD_NA,PD_NA,PD_NA,'1','1.5','1.5','1.5','2','2','2']],
 ['อื่น','Amoxicillin/clavulanate (ร่วม Imp/Mpm)','62.5 mg clav/5 mL (250/62.5) syr',['1.5 mL tid','2 mL tid','3 mL tid','5 mL tid','8 mL tid','10 mL tid','10 mL bd หรือ tid','10 mL bd หรือ tid',PD_NA,PD_NA,PD_NA]],
 ['อื่น','Amoxicillin/clavulanate (ร่วม Imp/Mpm)','500/125 mg tab',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'1 tid','1 bd หรือ tid','1 bd หรือ tid','1 bd หรือ tid','1 bd หรือ tid','1 bd หรือ tid']],
 ['อื่น','Pretomanid (Pa) — เฉพาะ BPaL(M)','200 mg tab',[PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,PD_NA,'1','1','1','1','1']]];
// Bdq/Dlm ขึ้นกับอายุ (เดือน) ด้วย
function pdrSpecial(code,bi,mo){ const a=mo==null?null:mo, L=[];
  const pick=(opts)=>{ if(a==null) return opts.map(o=>o[1]).join(' · '); const o=opts.find(o=>a>=o[0][0]&&a<o[0][1]); return o?o[1]:'—'; };
  const lab=(o)=>o.map(([[x,y],t])=>`${y>=999?`≥${x}`:x===0?`<${y}`:`${x}–<${y}`} ด.: ${t}`);
  if(code==='BDQ20'){ if(bi<=1){ const o=[[[0,3],'1.5 od × 2 สัปดาห์ → 0.5 od จ/พ/ศ × 22 สัปดาห์'],[[3,999],'3 od × 2 สัปดาห์ → 1 od จ/พ/ศ × 22 สัปดาห์']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi===2){ const o=[[[0,3],'1.5 od × 2 สัปดาห์ → 0.5 od จ/พ/ศ'],[[3,6],'3 od × 2 สัปดาห์ → 1 od จ/พ/ศ'],[[6,999],'4 od × 2 สัปดาห์ → 2 od จ/พ/ศ']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi===3){ const o=[[[3,6],'3 od × 2 สัปดาห์ → 1 od จ/พ/ศ'],[[6,999],'6 od × 2 สัปดาห์ → 3 od จ/พ/ศ']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi<=5) return '10 od × 2 สัปดาห์ → 5 od จ/พ/ศ'; return PD_NA; }
  if(code==='BDQ100'){ if(bi<=1){ const o=[[[0,3],'3 mL od × 2 สัปดาห์ → 1 mL จ/พ/ศ'],[[3,999],'6 mL od × 2 สัปดาห์ → 2 mL จ/พ/ศ']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi===2){ const o=[[[0,3],'3 mL od × 2 สัปดาห์ → 1 mL จ/พ/ศ'],[[3,6],'6 mL od × 2 สัปดาห์ → 2 mL จ/พ/ศ'],[[6,999],'8 mL od × 2 สัปดาห์ → 4 mL จ/พ/ศ']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi===3){ const o=[[[3,6],'6 mL od × 2 สัปดาห์ → 2 mL จ/พ/ศ'],[[6,999],'8 mL od × 2 สัปดาห์ → 4 mL จ/พ/ศ']]; return a==null?lab(o).join(' · '):pick(o); }
    if(bi<=5) return '2 od × 2 สัปดาห์ → 1 od จ/พ/ศ'; return '4 od × 2 สัปดาห์ → 2 od จ/พ/ศ (รวม 24 สัปดาห์)'; }
  if(code==='DLM25'){ if(bi===0) return '1 od'; if(bi<=2){ const o=[[[0,3],'1 od'],[[3,999],'1 bd']]; return a==null?lab(o).join(' · '):pick(o); } if(bi===3) return '1 bd'; if(bi<=5) return '2 เช้า + 1 เย็น'; if(bi<=7) return '2 bd'; return PD_NA; }
  if(code==='DLM50'){ if(bi===0) return '5 mL (0.5 tab) od'; if(bi<=2){ const o=[[[0,3],'5 mL (0.5 tab) od'],[[3,999],'5 mL (0.5 tab) bd']]; return a==null?lab(o).join(' · '):pick(o); } if(bi===3) return '5 mL (0.5 tab) bd'; if(bi<=5) return '10 mL (1 tab) เช้า + 5 mL (0.5 tab) เย็น'; if(bi<=7) return '1 bd'; return '2 bd'; }
  return PD_NA; }
function pdrRender(){ const out=$('pdOut'); if(!out) return; const pt=getPt(), bw=+pt.bw, mo=pt.age!==''&&pt.age!=null&&+pt.age>=0&&$('age').value!==''?Math.round(+$('age').value*12*10)/10:null, all=$('pdAll').checked, grp=$('pdGrp').value;
  if(!(bw>=3)){ out.innerHTML='<div class="empty">กรอกน้ำหนัก (≥3 kg) ในแผงผู้ป่วย — ตาราง 3.6 เริ่มที่ 3 kg</div>'; return; }
  let bi=PDR_BANDS.length-1; for(let i=0;i<PDR_BANDS.length;i++) if(bw>=PDR_BANDS[i]) bi=i;
  const rows=PDR.filter(r=>grp==='all'||r[0]===grp);
  const cell=(r,i)=>{ const v=typeof r[3]==='string'?pdrSpecial(r[3],i,i===bi?mo:null):r[3][i]; return v; };
  let h=`<div class="band" style="margin-bottom:8px"><b>น้ำหนัก ${fmtN(bw)} kg → ช่วง ${PDR_LAB[bi]} kg</b>${mo!=null?` · อายุ ${mo<24?fmtN(mo)+' เดือน':fmtN(Math.round(mo/12*10)/10)+' ปี'}`:''}${bw>=46?' · ผู้ใหญ่ ≥46 kg: ใช้ตาราง 3.3 (สูตร 9 เดือน) ด้านบนเป็นหลัก':''}</div>`;
  if(!all){ h+=`<table class="ctbl"><thead><tr><th>กลุ่ม</th><th>ยา</th><th>รูปแบบ</th><th>ขนาด/วัน (ช่วง ${PDR_LAB[bi]} kg)</th></tr></thead><tbody>${rows.map(r=>{ const v=cell(r,bi); return `<tr${v===PD_NA?' style="opacity:.45"':''}><td>${r[0]}</td><td>${esc(r[1])}</td><td class="hint">${esc(r[2])}</td><td><b>${esc(v)}</b></td></tr>`; }).join('')}</tbody></table>`; }
  else { h+=`<div style="overflow-x:auto"><table class="ctbl" style="font-size:12.5px"><thead><tr><th>ยา</th><th>รูปแบบ</th>${PDR_LAB.map((l,i)=>`<th${i===bi?' style="background:color-mix(in srgb,var(--accent) 30%,transparent)"':''}>${l}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[1])}</td><td class="hint">${esc(r[2])}</td>${PDR_LAB.map((l,i)=>`<td${i===bi?' style="font-weight:800;background:color-mix(in srgb,var(--accent) 18%,transparent)"':''}>${esc(cell(r,i))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
  h+=`<ul class="msgs">${[
   ['info','ตัวเลข = จำนวนเม็ด/แคปซูล/ซอง ต่อวัน (od เว้นแต่ระบุ) · "mL" = ละลายเม็ด/แคปซูลผู้ใหญ่ในน้ำ 10 mL แล้วตวงตามจำนวน mL (แนะนำเม็ดกระจายตัว dt ถ้ามี)'],
   ['info','Bdq/Dlm ขึ้นกับอายุ (เดือน) — กรอกอายุในแผงผู้ป่วย (เลือกหน่วย "เดือน" ได้) · Bdq ใช้ได้ 6–17 ปี (และ <6 ปีในสูตรระยะยาวภายใต้การกำกับ) · Dlm ≥3 ปี (และ <3 ปีภายใต้การกำกับ)'],
   ['warn','ᵉ Lzd 150 mg dt หรือ 600 mg tab ในเด็ก 16–<24 kg: ขนาดจะเกิน 10–12 mg/kg/วัน — แพทย์อาจเลือก 1.5 dt หรือ 4 mL ของเม็ด 600 mg ที่ละลายน้ำ 10 mL'],
   ['warn','Cs ในเด็ก 3–<7 kg ใช้ขนาดต่ำกว่าเดิมเพราะเสี่ยง ADR ทางจิตประสาท โดยเฉพาะเมื่อใช้ร่วม Dlm · Cfz เด็ก <24 kg นิยมเม็ด 50 mg · Imp/Mpm ให้ร่วม clavulanate เสมอ'],
   ['info','Hh มักให้ pyridoxine ร่วม (เด็ก 1–2 mg/kg) · ทารกอาจให้ pyridoxine ร่วมกับวิตามินรวมน้ำ · Eto/Pto วันละครั้ง แต่แบ่ง 2 ครั้งได้ · PAS แบ่งทานได้']
  ].map(([l,m])=>`<li><span class="tag ${l}">${LVL_TXT[l]}</span><span>${esc(m)}</span></li>`).join('')}</ul>
  <p class="hint">ตาราง 3.6 ${esc(DRTB_SRC)} (หน้า 42–54 · ที่มา WHO operational handbook module 4, 2022) — ตรวจทานกับต้นฉบับก่อนสั่งใช้</p>`;
  out.innerHTML=h; }
(function(){ if(!$('pdOut')) return; ['pdAll','pdGrp'].forEach(id=>$(id).addEventListener('change',pdrRender)); $('t-tbx').addEventListener('click',pdrRender);
  ['bw','ageIn','ageU','age'].forEach(id=>{ const el=$(id); if(el){ el.addEventListener('input',pdrRender); el.addEventListener('change',pdrRender); } }); pdrRender(); })();
