/* ---------- Cross-allergy: Beta-lactam (side chain), NSAIDs, ยากันชัก (aromatic), Sulfonamide ----------
   อ้างอิง: Beta-lactam cross-allergy chart (Interior Health Authority) · EAACI/ENDA NSAID classification (Kowalski 2013, Doña 2020)
   · AED cross-reactivity (aromatic AEDs) · Sulfonamide antibiotic vs non-antibiotic (arylamine N4) */
const XA=[ // [name, regex, group, attrs]
 // beta-lactams: c=class pen/ceph/carb/mono, s=side-chain group, s2=similar side-chain group
 ['Amoxicillin',/amoxi|amoksiklav|augmentin|cavumox/i,'bl',{c:'pen',s:'amp'}],
 ['Ampicillin',/ampicillin|unasyn/i,'bl',{c:'pen',s:'amp'}],
 ['Penicillin G/V',/penicillin\s*(g|v)|pen\s*g\b|benzyl\s*penic|phenoxymethyl|benzathine/i,'bl',{c:'pen',s:'benz'}],
 ['Cloxacillin / Dicloxacillin',/cloxacillin/i,'bl',{c:'pen',s:'clox'}],
 ['Piperacillin/tazobactam',/piperacillin|tazocin|pip.{0,3}tazo/i,'bl',{c:'pen',s:'pip'}],
 ['Cefazolin',/cefazolin/i,'bl',{c:'ceph',s:'cfz'}],
 ['Cephalexin',/cephalexin|cefalexin/i,'bl',{c:'ceph',s:'amp'}],
 ['Cefadroxil',/cefadroxil/i,'bl',{c:'ceph',s:'amp'}],
 ['Cefaclor',/cefaclor/i,'bl',{c:'ceph',s:'amp'}],
 ['Cefprozil',/cefprozil/i,'bl',{c:'ceph',s:'amp2'}],
 ['Cefoxitin',/cefoxitin/i,'bl',{c:'ceph',s:'thie'}],
 ['Cefuroxime',/cefuroxime/i,'bl',{c:'ceph',s:'mxi2'}],
 ['Cefoperazone/sulbactam',/cefoperazone|sulpera/i,'bl',{c:'ceph',s:'pip'}],
 ['Cefixime',/cefixime/i,'bl',{c:'ceph',s:'atz'}],
 ['Cefdinir',/cefdinir/i,'bl',{c:'ceph',s:'atz'}],
 ['Cefotaxime',/cefotaxime/i,'bl',{c:'ceph',s:'mxi'}],
 ['Ceftriaxone',/ceftriaxone|cef-?3\b/i,'bl',{c:'ceph',s:'mxi'}],
 ['Cefpodoxime',/cefpodoxime/i,'bl',{c:'ceph',s:'mxi'}],
 ['Ceftazidime',/ceftazidime|fortum|zavicefta|ceftaz/i,'bl',{c:'ceph',s:'caz'}],
 ['Cefepime',/cefepime/i,'bl',{c:'ceph',s:'mxi'}],
 ['Aztreonam',/aztreonam/i,'bl',{c:'mono',s:'caz'}],
 ['Ertapenem',/ertapenem|invanz/i,'bl',{c:'carb'}],
 ['Imipenem/cilastatin',/imipenem|tienam/i,'bl',{c:'carb'}],
 ['Meropenem',/meropenem|meronem/i,'bl',{c:'carb'}],
 // NSAIDs: k=chemical class, x=COX selectivity (1 strong COX-1, p preferential COX-2, 2 selective COX-2, a paracetamol)
 ['Aspirin',/aspirin|\basa\b|acetylsalicyl/i,'ns',{k:'Salicylate',x:'1'}],
 ['Ibuprofen',/ibuprofen|brufen/i,'ns',{k:'Propionic acid',x:'1'}],
 ['Naproxen',/naproxen/i,'ns',{k:'Propionic acid',x:'1'}],
 ['Ketoprofen',/ketoprofen/i,'ns',{k:'Propionic acid',x:'1'}],
 ['Flurbiprofen',/flurbiprofen/i,'ns',{k:'Propionic acid',x:'1'}],
 ['Diclofenac',/diclofenac|voltaren/i,'ns',{k:'Phenylacetic acid',x:'1'}],
 ['Aceclofenac',/aceclofenac/i,'ns',{k:'Phenylacetic acid',x:'1'}],
 ['Indomethacin',/indomethacin|indometacin/i,'ns',{k:'Indole acetic acid',x:'1'}],
 ['Sulindac',/sulindac/i,'ns',{k:'Indole acetic acid',x:'1'}],
 ['Ketorolac',/ketorolac/i,'ns',{k:'Pyrrole acetic acid',x:'1'}],
 ['Etodolac',/etodolac/i,'ns',{k:'Heteroaryl acetic acid',x:'p'}],
 ['Piroxicam',/piroxicam/i,'ns',{k:'Oxicam',x:'1'}],
 ['Meloxicam',/meloxicam/i,'ns',{k:'Oxicam',x:'p'}],
 ['Tenoxicam',/tenoxicam/i,'ns',{k:'Oxicam',x:'1'}],
 ['Mefenamic acid',/mefenamic|ponstan/i,'ns',{k:'Fenamate',x:'1'}],
 ['Celecoxib',/celecoxib|celebrex/i,'ns',{k:'Coxib',x:'2'}],
 ['Etoricoxib',/etoricoxib|etolicoxib|arcoxia/i,'ns',{k:'Coxib',x:'2'}],
 ['Parecoxib',/parecoxib|dynastat/i,'ns',{k:'Coxib',x:'2'}],
 ['Nimesulide',/nimesulide/i,'ns',{k:'Sulfonanilide',x:'p'}],
 ['Metamizole (Dipyrone)',/metamizole|dipyrone|novalgin/i,'ns',{k:'Pyrazolone',x:'1'}],
 ['Paracetamol',/paracetamol|acetaminophen|tylenol|sara\b/i,'ns',{k:'Para-aminophenol',x:'a'}],
 // AEDs: ar=aromatic
 ['Carbamazepine',/carbamaz|tegretol/i,'aed',{ar:1,hla:1}],['Oxcarbazepine',/oxcarbaz|trileptal/i,'aed',{ar:1,hla:1}],['Phenytoin',/phenytoin|dilantin/i,'aed',{ar:1,hla:1}],['Fosphenytoin',/fosphenytoin/i,'aed',{ar:1,hla:1}],
 ['Phenobarbital',/phenobarb/i,'aed',{ar:1}],['Primidone',/primidone/i,'aed',{ar:1}],['Lamotrigine',/lamotrig/i,'aed',{ar:1}],
 ['Valproate',/valpro|depakin/i,'aed',{ar:0}],['Levetiracetam',/levetirac|keppra/i,'aed',{ar:0}],['Topiramate',/topiramate/i,'aed',{ar:0}],['Gabapentin',/gabapentin/i,'aed',{ar:0}],['Pregabalin',/pregabalin|lyrica/i,'aed',{ar:0}],['Lacosamide',/lacosamide/i,'aed',{ar:0}],['Clonazepam',/clonazepam/i,'aed',{ar:0}],
 // Sulfonamides: ab=antibiotic (arylamine), dap=dapsone
 ['Co-trimoxazole',/co-?trimox|bactrim|sulfameth|\bsmx\b|tmp\s*\/\s*smx/i,'sul',{ab:1}],['Sulfadiazine',/sulfadiazine|silver\s*sulf/i,'sul',{ab:1}],['Sulfasalazine',/sulfasalaz|salazopyrin/i,'sul',{ab:1}],['Dapsone',/dapsone/i,'sul',{ab:1,dap:1}],
 ['Furosemide',/furosemide|lasix/i,'sul',{ab:0}],['Hydrochlorothiazide',/hydrochlorothiaz|\bhctz\b/i,'sul',{ab:0}],['Indapamide',/indapamide/i,'sul',{ab:0}],['Acetazolamide',/acetazolamide|diamox/i,'sul',{ab:0}],
 ['Glipizide',/glipizide/i,'sul',{ab:0}],['Glibenclamide',/glibenclamide|glyburide/i,'sul',{ab:0}],['Gliclazide',/gliclazide/i,'sul',{ab:0}],['Celecoxib (sulfonamide)',/celecoxib/i,'sul',{ab:0}],['Topiramate (sulfamate)',/topiramate/i,'sul',{ab:0}],['Zonisamide',/zonisamide/i,'sul',{ab:0}],['Sumatriptan',/sumatriptan/i,'sul',{ab:0}]];
const XA_GRP={bl:'Beta-lactam',ns:'NSAIDs',aed:'ยากันชัก (AEDs)',sul:'Sulfonamide'};
const XA_SIM=[['amp','amp2'],['mxi','mxi2'],['mxi','atz'],['benz','thie']];
const XA_SEVERE=/sjs|\bten\b|stevens|toxic\s*epid|dress|dihs|agep|scar|exfoliat|nephritis|hepatitis|hemolytic|ไตอักเสบ|ตับอักเสบ/i;
function xaFind(text){ const t=(text||'').trim(); if(!t) return []; return XA.filter(x=>x[1].test(t)); }
function xaSplit(text){ return (text||'').split(/[,;\n\/]|และ|\+/).map(s=>s.trim()).filter(Boolean); }
/* เทียบยาแพ้ a กับยาที่จะใช้ b → {lvl:'flag'|'warn'|'ok', txt} หรือ null ถ้าไม่เกี่ยวกัน */
function xaPair(a,b,o={}){
  if(a[0]===b[0]) return {lvl:'flag',txt:`ยาเดียวกับที่แพ้ (${a[0]})`};
  if(a[2]!==b[2]){ // ข้ามกลุ่ม: กรณี sulfonamide-celecoxib/topiramate ถูกจัดใน XA ทั้งสองกลุ่ม จัดการด้านล่าง
    return null; }
  const A=a[3],B=b[3];
  if(a[2]==='bl'){
    if(o.severe) return {lvl:'flag',txt:'แพ้ beta-lactam แบบรุนแรงชนิดล่าช้า (SCAR / ไตอักเสบ / ตับอักเสบ / hemolytic anemia) — หลีกเลี่ยง beta-lactam ทุกตัว'};
    if(A.c==='pen'&&B.c==='pen') return {lvl:'flag',txt:'penicillin ด้วยกัน — ปฏิกิริยาจาก beta-lactam ring (มีหลักฐานทางคลินิก) ห้ามใช้'};
    if(A.c==='carb'&&B.c==='carb') return {lvl:'flag',txt:'carbapenem ด้วยกัน — เสี่ยงทางทฤษฎีจาก ring (ยังไม่มีการศึกษา) ห้ามใช้'};
    if(A.s&&A.s===B.s) return {lvl:'flag',txt:`side chain (R1) เหมือนกัน — มีหลักฐานแพ้ข้าม ห้ามใช้`};
    if(A.s&&B.s&&XA_SIM.some(([x,y])=>(A.s===x&&B.s===y)||(A.s===y&&B.s===x))) return {lvl:'flag',txt:'side chain คล้ายกัน — มีโอกาสแพ้ข้าม ห้ามใช้'};
    if(A.c==='mono'||B.c==='mono') return {lvl:'ok',txt:'aztreonam ไม่แพ้ข้ามกับ beta-lactam อื่น (ยกเว้น ceftazidime ซึ่ง side chain เหมือนกัน)'};
    if(A.c==='carb'||B.c==='carb') return {lvl:'ok',txt:'penicillin/cephalosporin กับ carbapenem — แพ้ข้าม <1% ใช้ได้ (ถ้าเคย anaphylaxis ให้ test dose / graded challenge)'};
    return {lvl:'ok',txt:'โครงสร้าง side chain ต่างกัน — ถือว่าใช้ได้ (ถ้าเคย anaphylaxis ให้ graded challenge ภายใต้การดูแล)'};
  }
  if(a[2]==='ns'){
    const type=o.nsType||'unk';
    if(A.x==='a'&&B.x!=='a') return {lvl:'warn',txt:'แพ้ paracetamol — ไม่ได้บ่งว่าแพ้ NSAIDs เสมอ ประเมินเป็นรายกรณี'};
    if(type==='sel'){ if(A.k===B.k) return {lvl:'flag',txt:`แพ้แบบ selective (true allergy) — กลุ่มโครงสร้างเดียวกัน (${A.k}) ห้ามใช้`}; return {lvl:'ok',txt:`แพ้แบบ selective — ต่างกลุ่มโครงสร้าง (${A.k} vs ${B.k}) ใช้ได้`}; }
    // cross-intolerant (pseudoallergy) หรือไม่ทราบ
    const unk=type==='unk'; const same=A.k===B.k;
    if(B.x==='1') return {lvl:'flag',txt:`${same?'กลุ่มเดียวกัน · ':''}ยับยั้ง COX-1 แรง — ${unk?'ถ้าเป็นแบบ cross-intolerance (pseudoallergy) จะแพ้ข้ามทุกตัวที่ยับยั้ง COX-1':'แบบ cross-intolerance แพ้ข้ามได้'} ห้ามใช้`};
    if(B.x==='p') return {lvl:'warn',txt:`preferential COX-2 — ${same?'กลุ่มโครงสร้างเดียวกับที่แพ้ ห้ามใช้ถ้าเป็น selective · ':''}แบบ cross-intolerance มักทนได้ที่ขนาดต่ำ ให้ challenge ภายใต้การดูแล`};
    if(B.x==='2') return {lvl:same?'flag':'warn',txt:same?'กลุ่มเดียวกัน (coxib) — ห้ามใช้':'selective COX-2 — ส่วนใหญ่ทนได้ในแบบ cross-intolerance แนะนำ challenge ครั้งแรกภายใต้การดูแล'};
    if(B.x==='a') return {lvl:'warn',txt:'paracetamol — แบบ cross-intolerance ส่วนใหญ่ทนได้ที่ ≤500 mg ต่อครั้ง ระวังขนาดสูง'};
  }
  if(a[2]==='aed'){
    if(A.ar&&B.ar) return {lvl:'flag',txt:`ยากันชักกลุ่ม aromatic ด้วยกัน — แพ้ข้ามได้ 40–58% ห้ามใช้${B.hla?' (HLA-B*15:02 สัมพันธ์กับ SJS/TEN)':''}`};
    if(A.ar&&!B.ar) return {lvl:'ok',txt:'non-aromatic — ใช้แทนได้'};
    return {lvl:'ok',txt:'ไม่พบการแพ้ข้ามที่ชัดเจน'};
  }
  if(a[2]==='sul'){
    if(A.ab&&B.ab) return B.dap||A.dap?{lvl:'warn',txt:'dapsone กับ sulfonamide antibiotic — มีรายงานแพ้ข้าม (arylamine) ระวัง/หลีกเลี่ยง'}:{lvl:'flag',txt:'sulfonamide antibiotic ด้วยกัน (arylamine N4) ห้ามใช้'};
    if(A.ab&&!B.ab) return {lvl:'ok',txt:'non-antibiotic sulfonamide — ไม่มี arylamine แพ้ข้ามต่ำ ใช้ได้ (ระวังในผู้ที่แพ้ยาหลายกลุ่ม)'};
    if(!A.ab&&B.ab) return {lvl:'ok',txt:'แพ้ non-antibiotic sulfonamide — ไม่แพ้ข้ามกับ sulfonamide antibiotic'};
    return {lvl:'ok',txt:'non-antibiotic sulfonamide ด้วยกัน — แพ้ข้ามต่ำ'};
  }
  return null; }
/* ตรวจยาที่จะใช้ (ข้อความ) กับประวัติแพ้ยา (ข้อความ) → รายการผล */
function xaCheck(allergyText,drugText,o={}){ const out=[]; const sev=o.severe??XA_SEVERE.test(allergyText||'');
  const ds=xaFind(drugText); if(!ds.length) return out;
  for(const part of xaSplit(allergyText)){ const as=xaFind(part);
    if(!as.length){ // แพ้ระบุเป็นกลุ่ม
      if(/penicillin|เพนนิ/i.test(part)) ds.filter(d=>d[2]==='bl').forEach(d=>out.push(d[3].c==='pen'?{a:part,d:d[0],lvl:'flag',txt:'แพ้ penicillin — penicillin ทุกตัวห้ามใช้'}:sev?{a:part,d:d[0],lvl:'flag',txt:'แพ้ penicillin แบบรุนแรงชนิดล่าช้า — หลีกเลี่ยง beta-lactam ทุกตัว'}:{a:part,d:d[0],lvl:'warn',txt:'แพ้ penicillin (ไม่ระบุตัว) — ตรวจ side chain: amoxicillin/ampicillin ≈ cephalexin/cefadroxil/cefaclor · ระบุชื่อยาที่แพ้เพื่อประเมินให้แม่นขึ้น'}));
      else if(/sulfa|ซัลฟา/i.test(part)) ds.filter(d=>d[2]==='sul').forEach(d=>out.push(d[3].ab?{a:part,d:d[0],lvl:'flag',txt:'แพ้ sulfa — sulfonamide antibiotic ห้ามใช้'}:{a:part,d:d[0],lvl:'ok',txt:'non-antibiotic sulfonamide แพ้ข้ามต่ำ — ใช้ได้ (ยืนยันว่าแพ้ sulfa antibiotic)'}));
      else if(/nsaid/i.test(part)) ds.filter(d=>d[2]==='ns').forEach(d=>out.push(d[3].x==='1'?{a:part,d:d[0],lvl:'flag',txt:'แพ้ NSAIDs — ยับยั้ง COX-1 แรง ห้ามใช้'}:{a:part,d:d[0],lvl:'warn',txt:'แพ้ NSAIDs — ระบุชนิด/ตัวยาเพื่อแยก true allergy หรือ cross-intolerance'}));
      else if(/cephalo|เซฟา/i.test(part)) ds.filter(d=>d[2]==='bl'&&d[3].c==='ceph').forEach(d=>out.push({a:part,d:d[0],lvl:'warn',txt:'แพ้ cephalosporin (ไม่ระบุตัว) — ระบุชื่อยาที่แพ้เพื่อเทียบ side chain'}));
      continue; }
    for(const a of as) for(const d of ds){ const r=xaPair(a,d,{...o,severe:sev}); if(r) out.push({a:a[0],d:d[0],...r}); } }
  return out; }
