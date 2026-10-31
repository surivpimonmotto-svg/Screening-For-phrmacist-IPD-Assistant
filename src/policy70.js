/* ===== policy70.js — มาตรการ/ประกาศ รพ.มค. ปีงบ 2569–2570 (ส่งมา 31 ต.ค. 69) =====
 1) สรุปมาตรการควบคุมค่าใช้จ่ายด้านยาผู้ป่วยใน 2569 (ยาเดิม* กลุ่ม 1–3, ยากลับบ้าน ≤1,500 บาท, จำกัดปริมาณ 33 รายการ, NED1)
 2) แจ้งเภสัช: DUE online · Colistin/Meropenem/Tienam/Vancomycin/Tazocin อนุมัติทุก 10 วัน
 3) เปิด code ยาใหม่ปีงบ 70: Escitalopram 10 mg, Empagliflozin 25 mg
 4) ยามุ่งเป้า (Targeted therapy) · บัญชี จ(2) · การส่งตรวจยีนแพ้ยา HLA-B
*/
const SRC_P69='สรุปมาตรการการควบคุมค่าใช้จ่ายด้านยาผู้ป่วยใน รพ.มหาสารคาม 2569';
// ยาเดิม* (ยาพ่น/insulin ราคาแพง) — กลุ่ม 1 ยาพ่นปาก (มีใน policy.js แล้ว) · กลุ่ม 2 ยาพ่นจมูก · กลุ่ม 3 insulin
const OWN_G2=/avamys|mar-?plus|nasonex|budesonide\s*(?:nasal|ns\b|spray)|rhinocort/i, OWN_G3=/ryzodec|degludec|tresiba|xultophy/i;
// จำกัดปริมาณการสั่งใช้ยาคนไข้กลับบ้าน (สูงสุดต่อครั้ง) — มาตรการ 33 รายการ (อ่านได้ 30 รายการจากภาพ)
const DC_MAX=[[/acetylcyst|\bnac\b|fluimucil/i,'Acetylcysteine powder 200 mg (ซอง)',50],[/alum\s*milk/i,'Alum milk 240 ml (ขวด)',2],[/glucosamine/i,'Glucosamine powder (ซอง)',180],
 [/avamys/i,'Avamys nasal spray 120 dose (ขวด)',2],[/nasonex/i,'Nasonex nasal spray 120 dose (ขวด)',2],[/berodual.*(inh|mdi)|(inh|mdi).*berodual/i,'Berodual inhaler (เครื่อง)',2],
 [/salbutamol.*(mdi|inh)|ventolin.*(mdi|inh|evo)/i,'Salbutamol MDI (เครื่อง)',2],[/azithro/i,'Azithromycin 250 mg (ไม่รวม NTM)',10],[/celecoxib|celebrex/i,'Celecoxib 200 mg',60],
 [/etoricoxib|arcoxia/i,'Etoricoxib 90 mg',30],[/domperidone/i,'Domperidone 10 mg',45],[/ondansetron|onsia/i,'Ondansetron 8 mg tab',20],[/enoxaparin|clexane/i,'Enoxaparin inj 0.4, 0.6 ml (หลอด)',30],
 [/flunarizine/i,'Flunarizine 5 mg',15],[/hyoscine|buscopan/i,'Hyoscine 10 mg tab',10],[/meloxicam/i,'Meloxicam 7.5 mg',30],[/gasym|pancreatin/i,'Gasym (pancreatin+simethicone)',90],
 [/simethicone|air-?x/i,'Simethicone 80 mg',60],[/multivit|\bmvt\b/i,'Multivitamin tab',200],[/vitamin\s*b\s*(?:co|complex)|\bvit\.?\s*b\s*co/i,'Vitamin B complex',200],[/nss.*irrig|irrig.*nss/i,'NSS irrigate 1000 ml (ขวด)',2],
 [/tolperisone/i,'Tolperisone 50 mg',40],[/omeprazole/i,'Omeprazole 20 mg cap',60],[/gabapentin/i,'Gabapentin 100/300 mg',180],[/betahistin/i,'Betahistine 12 mg',180],
 [/tramadol/i,'Tramadol 50 mg',90],[/lactulose/i,'Lactulose syrup 100 ml (ขวด)',5],[/unison/i,'Unison enema 133 ml',10],[/paracetamol|\bpara\b|tylenol/i,'Paracetamol 500 mg',20]];
function dcMaxOf(txt){ return DC_MAX.find(x=>x[0].test(txt))||null; }
// NED1 ฟรีเฉพาะสิทธิ์เบิกได้จ่ายตรง (สิทธิ์อื่นชำระเงิน) — ปรับปรุง 2569
const NED1=[[/acetylcyst.*(?:powder|ซอง)|\bnac\b.*200/i,'Acetylcysteine powder 200 mg'],[/brimonidine|alphagan/i,'Brimonidine eye drop 0.1%'],[/dienogest|visanne/i,'Dienogest 2 mg'],
 [/dinoprostone|prepidil|pege2/i,'Dinoprostone vaginal tab 3 mg'],[/daflon|diosmin/i,'Diosmin+Hesperidin (Daflon) 1000 mg'],[/cyclo-?progynova|norgestrel/i,'Estradiol+Norgestrel (Cyclo-progynova)'],
 [/nepafenac|nevanac/i,'Nepafenac 0.1% eye drop'],[/paracetamol.*supp|suppo.*paracetamol/i,'Paracetamol rectal suppo 325 mg'],[/selenium\s*sulf/i,'Selenium sulfide shampoo 2.5%'],
 [/testosterone\s*gel|androgel/i,'Testosterone gel 50 mg/5 ml'],[/aescin|reparil/i,'Aescin (Reparil)'],[/ketorolac/i,'Ketorolac inj 30 mg — จ่ายตรงฟรี P/O 24 hr'],
 [/parecoxib|dynastat/i,'Parecoxib 40 mg inj — จ่ายตรงฟรี P/O 24 hr'],[/desloratadine|aerius/i,'Desloratadine 5 mg']];
// บัญชี จ(2) ที่ สปสช.สนับสนุน (กองทุน 3 กองทุน) — ต้องลงทะเบียน/อนุมัติ
const J2=/adalimumab|humira|antithymocyte|thymoglobulin|bevacizumab|avastin|bortezomib|velcade|botulinum|botox|avibactam|zavicefta|dasatinib|sprycel|deferasirox|erlotinib|tarceva|imatinib|glivec|imiglucerase|cerezyme|immunoglobulin|\bivig\b|infliximab|remicade|lacosamide.*(?:inj|sterile|sol)|linezolid|zyvox|liposomal\s*amphotericin|ambisome|micafungin|mycamine|nilotinib|tasigna|octreotide\s*lar|sandostatin\s*lar|posaconazole|noxafil|ribavirin|rituximab|mabthera|sofosbuvir|velpatasvir|epclusa|thyrotropin|thyrogen|tocilizumab|actemra|trastuzumab|herceptin|voriconazole|vfend/i;
const TKI=/imatinib|glivec|nilotinib|tasigna|dasatinib|sprycel|ruxolitinib|jakavi/i;
const HLA=[[/allopurinol|zyloric/i,'HLA-B*58:01','Allopurinol','Positive → หลีกเลี่ยง allopurinol ใช้ Benzbromarone (eGFR >20) หรือ Febuxostat · Negative → เริ่ม ≤50 mg/day แล้วค่อยปรับ เฝ้าระวัง ADR 3 เดือน · ระหว่างรอผล คุมอาการด้วย Colchicine/NSAIDs/Steroid ตามไต'],
 [/carbamaz|tegretol/i,'HLA-B*15:02','Carbamazepine','Positive → ห้ามใช้ carbamazepine และเลี่ยงยากันชัก aromatic (oxcarbazepine, lamotrigine, phenytoin, phenobarbital) · ทางเลือก: epilepsy → levetiracetam/valproate · neuropathic pain → gabapentin/pregabalin'],
 [/abacavir|\babc\b|kivexa|triumeq/i,'HLA-B*57:01','Abacavir','Positive → ห้ามใช้ abacavir (hypersensitivity) · เร่งด่วน: ใช้สูตรที่ไม่มี abacavir ไปก่อน · CD4 ดี/ไม่มี OI รอผลได้']];
function fyChk(row,rows,pt,add){ const mm=masterOf(row), s=row.raw+' '+(mm?mm[1]+' '+mm[2]:''); let hit=false;
  if(TKI.test(s)){ add('flag','ยามุ่งเป้า TKI (Imatinib/Nilotinib/Dasatinib/Ruxolitinib): จ่ายเฉพาะผู้ป่วยนอก สั่งโดย Hematologist — ห้ามจ่ายใน IPD หาก admit ให้ใช้ยาเดิมผู้ป่วย'); hit=true; }
  if(/bortezomib|velcade/i.test(s)){ add('warn','Bortezomib (NED): UC/ประกันสังคม สั่งจากแผนก OPD คิดเงินรวม 4 ครั้งใน 1 cycle · สิทธิ์จ่ายตรง IPD: admit อายุรกรรมรวม คีย์ตามจำนวนที่สั่งทั้งหมดเป็น One day'); hit=true; }
  if(J2.test(s)){ add('info','บัญชี จ(2) (สปสช. กองทุน 3 กองทุน) — ตรวจการลงทะเบียน/อนุมัติใช้ยาตามเงื่อนไขก่อนจ่าย'); hit=true; }
  const n1=NED1.find(x=>x[0].test(s)); if(n1){ add('info',`NED1: ${n1[1]} — ฟรีเฉพาะสิทธิ์เบิกได้จ่ายตรง · สิทธิ์อื่นชำระเงิน (${SRC_P69} ข้อ 8)`); hit=true; }
  if(/empagli|jardiance/i.test(s)){ const st=(s.match(/(\d+)\s*mg/i)||[])[1]; add(st==='25'?'warn':'info',`Empagliflozin มี 10 และ 25 mg — ระวังความแรง · ยืนยันข้อบ่งใช้: DM max 25 mg/day · HF หรือ CKD max 10 mg/day${st==='25'?' — คำสั่ง 25 mg: ต้องเป็นข้อบ่งใช้ DM':''}`); hit=true; }
  if(/escitalo|lexapro/i.test(s)&&/15\s*mg/i.test(s)){ add('info','Escitalopram 15 mg (NED) — รพ.เปิด code 10 mg (ED, local made) เข้าแทน · 15 mg หมดแล้วปิด code'); hit=true; }
  if(OWN_G2.test(s)){ add('info','ยาเดิม* กลุ่ม 2 (ยาพ่นจมูก): ผู้ป่วยนำยาเดิมมา → สติ๊กเกอร์จำนวน 0 + "ใช้ยาเดิมของผู้ป่วย" · ไม่ได้นำมา → แพทย์พิจารณาใช้ยาอื่นแทนขณะนอน รพ. ('+SRC_P69+' ข้อ 2)'); hit=true; }
  if(OWN_G3.test(s)){ add('info','ยาเดิม* กลุ่ม 3 (insulin ราคาแพง: Ryzodec/Degludec/Xultophy): มียาเดิม → ใช้ยาเดิมผู้ป่วย (เก็บในตู้เย็นวอร์ด) สติ๊กเกอร์จำนวน 0 · ไม่ได้นำมา: ≤48 ชม.แรกแพทย์พิจารณาใช้ยาอื่นแทน · >48 ชม. นำมาไม่ได้ → แพทย์สั่งและแจ้งพยาบาลเบิกจากห้องยา · insulin ใช้ได้ 6 สัปดาห์หลังเปิด (อุณหภูมิห้อง)'); hit=true; }
  const h=HLA.find(x=>x[0].test(s)); if(h){ add('info',`ยีนแพ้ยา ${h[1]} (${h[2]}): ผู้ป่วยรายใหม่ (ยังไม่เริ่ม/ใช้ไม่เกิน 2–3 เดือน · ไม่เคยตรวจ · ไม่เคยแพ้) → พิจารณาส่งตรวจ (สิทธิ์ สปสช.) · IPD: พยาบาล Notify แพ้ยา "แจ้งเภสัชกรให้คำแนะนำการตรวจยีนแพ้ยา" → เภสัชกรให้ข้อมูล/consent · ${h[3]}`); hit=true; }
  if(/albumin/i.test(s)&&/inj|iv|%|ml|vial|ขวด/i.test(s)&&!/lab|g\/dl/i.test(s)){ add('info','Albumin: ใบ DUE online (ไม่ใช้ใบสแกน) ทั้งวอร์ด paperless และวอร์ด scan'); hit=true; }
  return hit; }
// เพิ่มรายละเอียด DUE ATB: online ทั้งหมด · 5 รายการอนุมัติทุก 10 วัน
(function(){ if(typeof DUE==='undefined') return; DUE.forEach(u=>{ const t='ใบ DUE online (ไม่ใช้ใบสแกน)'; u.x=(/colistin|meropenem|imipenem|piperacillin|vancomycin/i.test(u.name)?'อนุมัติทุก 10 วัน (เดิม 7 วัน) · ':'')+t+(u.x?' · '+u.x:''); }); })();
