/* ===== lab.js — ผล Lab (ANC ฯลฯ) · ตรวจสูตร ARV · ตรวจ/คำนวณยาเคมีบำบัด =====
 ⚑ = เกณฑ์ทั่วไป ยังไม่ใช่เอกสาร รพ. — แก้/ยืนยันได้ในไฟล์นี้
*/

/* ---------- 1) Lab ---------- */
// [key, ชื่อที่แสดง, หน่วย, regex ชื่อในหน้าจอ HIS, ช่องเดิมในแผงผู้ป่วย(ถ้ามี)]
const LAB_DEF=[
 ['crclIn','CrCl','ml/min',/\bcrcl\b|creatinine\s*clearance/i,'crclIn'],
 ['egfrIn','eGFR','',/\begfr\b/i,'egfrIn'],
 ['scr','Creatinine','mg/dL',/\bcreatinine\b(?!\s*clearance)|\bcr\b(?!cl)/i,'scr'],
 ['bun','BUN','mg/dL',/\bbun\b/i],
 ['wbc','WBC','cells/mm³',/\bwbc\b/i],
 ['neu','Neutrophil','%',/\bneutrophils?\b|\bpmn\b/i],
 ['lym','Lymphocyte','%',/\blymphocytes?\b/i],
 ['eos','Eosinophil','%',/\beosinophils?\b/i],
 ['hb','Hemoglobin','g/dL',/\bhemoglobin\b|\bhb\b|\bhgb\b/i],
 ['hct','Hematocrit','%',/\bhematocrit\b|\bhct\b/i],
 ['plt','Platelet','/mm³',/\bplatelets?\b|\bplt\b/i],
 ['alb','Albumin','g/dL',/\balbumin\b/i],
 ['ast','AST','U/L',/\bast\b|\bsgot\b/i],
 ['alt','ALT','U/L',/\balt\b|\bsgpt\b/i],
 ['tbil','Total Bilirubin','mg/dL',/total\s*bilirubin|\btb\b(?=\s)/i],
 ['dbil','Direct Bilirubin','mg/dL',/direct\s*bilirubin|\bdb\b(?=\s)/i],
 ['ca','Calcium','mg/dL',/(?<!ionized\s)\bcalcium\b|\bca\b(?=\s*[\d:])/i],
 ['phos','Phosphorus','mg/dL',/\bphosphorus\b|\bphosphate\b/i],
 ['mgl','Magnesium','mg/dL',/\bmagnesium\b/i,'mgl'],
 ['na','Sodium','mEq/L',/\bsodium\b/i],
 ['k','Potassium','mEq/L',/\bpotassium\b/i,'k'],
 ['hco3','HCO3','mEq/L',/\bhco3\b|bicarbonate/i],
 ['ph','pH','',/\bph\b/i],
 ['lact','Lactate','mmol/L',/\blactate\b/i],
 ['inr','INR','',/\binr\b/i,'inr'],
];
const LAB_EXTRA=LAB_DEF.filter(x=>!x[4]); // ช่องใหม่ในกล่อง Lab

function labParse(txt){
  const out={}; const t=(txt||'').replace(/ /g,' ');
  for(const [key,,,re] of LAB_DEF){
    const src=new RegExp('(?:'+re.source+')[^\\d\\n-]{0,25}?(?:\\n[ \\t:=]*)?(-?[\\d,]*\\.?\\d+)',re.flags.includes('i')?'i':'');
    const m=t.match(src); if(m){ const v=+m[1].replace(/,/g,''); if(!isNaN(v)) out[key]=v; } }
  return out;
}
function labCalc(L){ // L = ค่าดิบจากช่อง
  const o={...L};
  if(o.wbc!=null&&o.wbc>0&&o.wbc<200) o.wbc=o.wbc*1000;   // ×10³ → cells/mm³
  if(o.plt!=null&&o.plt>0&&o.plt<2000) o.plt=o.plt*1000;
  if(o.wbc>0&&o.neu!=null&&o.neu>=0&&o.neu<=100) o.anc=o.wbc*o.neu/100;
  if(o.ca!=null&&o.alb!=null&&o.alb>0) o.cacorr=o.ca+0.8*(4-o.alb);
  return o;
}
function labAlerts(L,pt){ const a=[]; // [lvl, txt]
  if(L.anc!=null){ const c=L.anc<500?['flag','severe neutropenia (<500)']:L.anc<1000?['warn','neutropenia (<1,000)']:L.anc<1500?['warn','ANC <1,500']:['ok','']; a.push([c[0],`ANC ${fmtN(Math.round(L.anc))} /mm³ = WBC ${fmtN(L.wbc)} × Neutrophil ${L.neu}%${c[1]?' — '+c[1]:''}`]); }
  else if(L.wbc!=null||L.neu!=null) a.push(['info','ANC: ต้องมีทั้ง WBC และ Neutrophil (%)']);
  if(L.plt!=null&&L.plt<100000) a.push([L.plt<50000?'flag':'warn',`Platelet ${fmtN(L.plt)} /mm³${L.plt<50000?' (<50,000)':' (<100,000)'}`]);
  const uln=40; if(L.ast!=null||L.alt!=null){ const mx=Math.max(L.ast||0,L.alt||0); if(mx>3*uln) a.push([mx>5*uln?'flag':'warn',`AST/ALT ${L.ast??'–'}/${L.alt??'–'} U/L (>${mx>5*uln?5:3}×ULN ⚑ ULN ${uln}) — ระวังยาที่เป็นพิษต่อตับ / ปรับยาตามการทำงานของตับ`]); }
  if(L.tbil!=null&&L.tbil>3) a.push(['warn',`Total bilirubin ${L.tbil} mg/dL (>3) — ยาที่ต้องปรับตามบิลิรูบิน (เช่น doxorubicin, paclitaxel, docetaxel, irinotecan, vincristine)`]);
  if(L.cacorr!=null) a.push([L.cacorr<8.5||L.cacorr>10.5?'warn':'ok',`Corrected Ca ${fmtN(Math.round(L.cacorr*100)/100)} mg/dL = Ca ${L.ca} + 0.8×(4 − Alb ${L.alb})`]);
  if(L.na!=null&&(L.na<130||L.na>150)) a.push(['warn',`Na ${L.na} mEq/L`]);
  return a;
}

/* ---------- 2) ARV ---------- */
const ARV_CLS={AZT:'NRTI','3TC':'NRTI',FTC:'NRTI',TDF:'NRTI',TAF:'NRTI',ABC:'NRTI',EFV:'NNRTI',RPV:'NNRTI',NVP:'NNRTI',ATV:'PI',DRV:'PI',LPV:'PI',RTV:'boost',COBI:'boost',DTG:'INSTI'};
const ARV_RE=[
 [/acriptega|\btld\b/i,['TDF','3TC','DTG']],
 [/kocitaf/i,['DTG','FTC','TAF']],
 [/gpo-?vir-?t|teevir/i,['TDF','FTC','EFV']],
 [/teno-?em/i,['TDF','FTC']],
 [/alacovir/i,['ABC','3TC']],
 [/zila(r)?vir/i,['AZT','3TC']],
 [/kaletra|aluvia|lopinavir/i,['LPV','RTV']],
 [/zidovudine|\bazt\b/i,['AZT']],
 [/lamivudine|\b3tc\b/i,['3TC']],
 [/emtricitabine|\bftc\b/i,['FTC']],
 [/alafenamide|\btaf\b|vemlidy/i,['TAF']],
 [/tenofovir(?![\s\w]*alafenamide)|\btdf\b/i,['TDF']],
 [/abacavir|\babc\b/i,['ABC']],
 [/efavirenz|\befv\b/i,['EFV']],
 [/rilpivirine|\brpv\b/i,['RPV']],
 [/nevirapine|\bnvp\b/i,['NVP']],
 [/atazanavir|\batv\b/i,['ATV']],
 [/darunavir|\bdrv\b|prezista/i,['DRV']],
 [/ritonavir|\brtv\b/i,['RTV']],
 [/cobicistat|\bcobi\b/i,['COBI']],
 [/dolutegravir|\bdtg\b|tivicay/i,['DTG']],
];
function arvOf(row){ const mm=masterOf(row); const s=row.raw+' '+(mm?mm[1]+' '+mm[2]:'');
  const set=new Set(); for(const [re,c] of ARV_RE) if(re.test(s)) c.forEach(x=>set.add(x));
  if(set.has('TAF')&&!/tenofovir\s*(disoproxil|df\b)|\btdf\b/i.test(s)) set.delete('TDF');
  return [...set]; }
const RE_RIF=/rifampi|\brifam/i, RE_PPI=/omeprazole|esomeprazole|pantoprazole|lansoprazole|rabeprazole|\bppi\b/i, RE_INDUCER=/phenytoin|dilantin|carbamazepine|tegretol|phenobarb/i;
function arvChk(row,rows,pt,add){
  const mine=arvOf(row); if(!mine.length) return false;
  const all=rows.map(r=>({r,c:arvOf(r)})).filter(x=>x.c.length);
  const others=all.filter(x=>x.r!==row);
  const nm=r=>{const mm=masterOf(r);return mm?mm[1]:r.raw.slice(0,40);};
  // ซ้ำ
  for(const o of others){ const sh=mine.filter(c=>o.c.includes(c)); if(sh.length) add('flag',`ARV ซ้ำ: ${sh.join(', ')} อยู่ใน "${nm(o.r)}" ด้วย — ระวังยาเม็ดรวม (combined) ซ้ำกับยาเดี่ยว`); }
  const comp=new Set(all.flatMap(x=>x.c));
  const otherTxt=rows.filter(r=>r!==row).map(r=>r.raw+' '+((masterOf(r)||[])[1]||'')).join(' | ');
  if(mine.includes('3TC')||mine.includes('FTC')){ if(comp.has('3TC')&&comp.has('FTC')) add('flag','ARV: 3TC + FTC ห้ามใช้ร่วมกัน (ยากลุ่มเดียวกัน)'); }
  if((mine.includes('TDF')||mine.includes('TAF'))&&comp.has('TDF')&&comp.has('TAF')) add('flag','ARV: TDF + TAF ห้ามใช้ร่วมกัน (tenofovir ซ้ำ)');
  // ปฏิกิริยาระหว่างยา
  if(mine.includes('DTG')){ const ind=[RE_RIF.test(otherTxt)&&'Rifampicin',RE_INDUCER.test(otherTxt)&&'Phenytoin/Carbamazepine/Phenobarbital',comp.has('EFV')&&'EFV'].filter(Boolean);
    if(ind.length){ const F=row.F; if(F!=null&&F<2) add('flag',`ARV: DTG ใช้ร่วม ${ind.join(', ')} ต้องเป็น 50 mg q12h (ARV Screening IPD 2568) — คำสั่งเป็นวันละ ${fmtN(F)} ครั้ง`); else add('info',`ARV: DTG ใช้ร่วม ${ind.join(', ')} → 50 mg q12h และให้ q12h ต่ออีก 2 สัปดาห์หลังหยุด rifampicin (ARV Screening IPD 2568)`); } }
  if(mine.includes('RPV')){ if(RE_PPI.test(otherTxt)) add('flag','ARV: Rilpivirine + PPI ห้ามใช้ร่วม (RPV ดูดซึมลดลงมาก) ⚑'); if(RE_RIF.test(otherTxt)) add('flag','ARV: Rilpivirine + Rifampicin ห้ามใช้ร่วม ⚑'); }
  if(mine.some(c=>ARV_CLS[c]==='PI')&&RE_RIF.test(otherTxt)) add('flag','ARV: PI + Rifampicin ห้ามใช้ร่วม (ระดับ PI ลดลงมาก — พิจารณา rifabutin) ⚑');
  if(mine.includes('ATV')&&RE_PPI.test(otherTxt)) add('warn','ARV: Atazanavir + PPI — ATV ดูดซึมลดลง หลีกเลี่ยง ⚑');
  if(mine.includes('ATV')&&pt.dial==='HD') add('info','ARV: HD — Naïve: ATV/r 300/100 mg q24h · เคยได้ ARV มาก่อน: ไม่แนะนำ ATV, ATV/r (ARV Screening IPD 2568)');
  // ระดับสูตร — แสดงที่ยา ARV รายการแรกเท่านั้น
  if(all[0]&&all[0].r===row){
    const nrti=[...comp].filter(c=>ARV_CLS[c]==='NRTI'), nn=[...comp].filter(c=>ARV_CLS[c]==='NNRTI'), pi=[...comp].filter(c=>ARV_CLS[c]==='PI'), ins=[...comp].filter(c=>ARV_CLS[c]==='INSTI');
    const anchors=nn.length+pi.length+ins.length;
    const sum=`สูตรที่อ่านได้: ${[...comp].join(' + ')} (NRTI ${nrti.length} · NNRTI ${nn.length} · PI ${pi.length}${comp.has('RTV')?'/r':comp.has('COBI')?'/c':''} · INSTI ${ins.length})`;
    add('info','ARV '+sum);
    if(!anchors){ if(nrti.length) add('warn',`ARV: มีแต่ NRTI (${nrti.join(', ')}) ไม่มียาหลัก NNRTI/PI/INSTI — ถ้าเป็นสูตร HIV ไม่ครบ (ถ้ารักษา HBV อย่างเดียวไม่ต้องมี)`); }
    else {
      if(nn.length>1) add('flag',`ARV: NNRTI ซ้ำ ${nn.join(' + ')}`);
      if(pi.length>1) add('flag',`ARV: PI ซ้ำ ${pi.join(' + ')}`);
      if(nn.length&&pi.length) add('warn','ARV: NNRTI + PI ในสูตรเดียวกัน — ตรวจข้อบ่งใช้');
      if(nn.length&&ins.length) add(nn.includes('EFV')?'info':'warn',`ARV: ${nn.join('/')} + DTG — ${nn.includes('EFV')?'ช่วงเปลี่ยนสูตร DTG ต้องเป็น 50 mg q12h':'ตรวจข้อบ่งใช้'}`);
      if(pi.length&&ins.length) add('info','ARV: PI + DTG — สูตร High DR (0-3 NRTIs + PIs + DTG) ตาม ARV Screening IPD 2568');
      if(nrti.length>2&&!pi.length) add('warn',`ARV: NRTI ${nrti.length} ตัว (${nrti.join(', ')}) — สูตรมาตรฐานใช้ 2 NRTIs ตรวจยาเม็ดรวมซ้ำ`);
      if(nrti.length<2&&!(pi.length&&ins.length)) add('warn',`ARV: NRTI ${nrti.length} ตัว — สูตรมาตรฐานต้องมี 2 NRTIs + ยาหลัก`);
      const unboost=pi.filter(p=>p!=='ATV'&&p!=='LPV'); if(unboost.length&&!comp.has('RTV')&&!comp.has('COBI')) add('flag',`ARV: ${unboost.join(', ')} ต้อง boost ด้วย RTV ทุกครั้ง (ยกเว้น ATV 400 mg)`);
      if((comp.has('RTV')||comp.has('COBI'))&&!pi.length) add('warn','ARV: มี RTV แต่ไม่มี PI — ตรวจคำสั่ง');
    }
  }
  return true;
}

/* ---------- 3) เคมีบำบัด (ตามชีท CMT รพ. 24.3.2023) ---------- */
const SRC_CMT='ชีทคำนวณยาเคมีบำบัด CMT รพ.มค. (24.3.2023)';
// d: [ชื่อยา, ค่า, ชนิด('m2'|'kg'|'auc'|'m2day'), วัน, หมายเหตุ]
const CHEMO_REG=[
 {id:'AC',ca:'Breast',name:'AC',d:[['Doxorubicin',60,'m2'],['Cyclophosphamide',600,'m2']]},
 {id:'CMF',ca:'Breast',name:'CMF',d:[['Methotrexate',40,'m2'],['5-FU',600,'m2']],note:'ชีท CMT ระบุเฉพาะ MTX และ 5-FU — Cyclophosphamide ตามสูตรที่แพทย์สั่ง'},
 {id:'FAC',ca:'Breast',name:'FAC',d:[['Doxorubicin',50,'m2'],['Cyclophosphamide',500,'m2'],['5-FU',500,'m2']]},
 {id:'DOC',ca:'Breast',name:'Taxotere (Docetaxel)',d:[['Docetaxel',75,'m2']]},
 {id:'PAC',ca:'Breast',name:'Taxol (Paclitaxel)',d:[['Paclitaxel',175,'m2']]},
 {id:'TRA',ca:'Breast',name:'Trastuzumab',d:[['Trastuzumab (loading)',8,'kg'],['Trastuzumab (maintenance)',6,'kg']]},
 {id:'MAYO',ca:'Colorectal',name:'MAYO',d:[['Leucovorin',20,'m2'],['5-FU',425,'m2']]},
 {id:'FOLFOX4',ca:'Colorectal',name:'FOLFOX4',d:[['Oxaliplatin',85,'m2'],['Leucovorin',200,'m2'],['5-FU IV push slowly',400,'m2'],['5-FU in 22 hr',600,'m2']]},
 {id:'FOLFOX6',ca:'Colorectal',name:'FOLFOX6',d:[['Oxaliplatin',85,'m2'],['Leucovorin',400,'m2'],['5-FU IV push slowly',400,'m2'],['5-FU in 22 hr',1200,'m2','Day 1'],['5-FU in 24 hr',1200,'m2','Day 2']]},
 {id:'FOLFIRI',ca:'Colorectal',name:'FOLFIRI',d:[['Irinotecan',180,'m2'],['5-FU iv bolus',400,'m2','Day 1-2'],['5-FU in 22 hr',600,'m2','Day 1-2'],['Leucovorin',200,'m2','Day 1-2']]},
 {id:'CAPEOX',ca:'Colorectal',name:'CapeOx',d:[['Capecitabine',2000,'m2day','','ต่อวัน แบ่งให้วันละ 2 ครั้ง'],['Oxaliplatin',130,'m2']]},
 {id:'CISGEM',ca:'CA Bladder',name:'Cis/Gem',d:[['Gemcitabine',1000,'m2','Day 1, 8'],['Cisplatin',70,'m2','Day 1']]},
 {id:'CARBOGEM',ca:'CA Bladder',name:'Carbo/Gem',d:[['Gemcitabine',1000,'m2','Day 1, 8'],['Carboplatin',5,'auc','Day 1']]},
 {id:'CARBO5FU',ca:'CA CHCA/Stomach',name:'Carbo/5-FU',d:[['Carboplatin',5,'auc','Day 1'],['5-FU',1000,'m2','Day 1-4']]},
 {id:'CIS5FU',ca:'CA CHCA/Stomach',name:'Cis/5-FU',d:[['Cisplatin',75,'m2','Day 1'],['5-FU',1000,'m2','Day 1-4']]},
 {id:'CHOP',ca:'DLBCL',name:'R-CHOP',d:[['Vincristine',1.4,'m2','','max 2 mg'],['Doxorubicin',50,'m2'],['Cyclophosphamide',750,'m2'],['Rituximab',375,'m2']]},
];
const CHEMO_MATCH=[['Doxorubicin',/doxorubicin|adriamycin/i],['Cyclophosphamide',/cyclophosphamide|endoxan/i],['Methotrexate',/methotrexate|\bmtx\b/i],['5-FU',/5-?fu\b|fluorouracil/i],['Docetaxel',/docetaxel|taxotere/i],['Paclitaxel',/paclitaxel|taxol/i],['Trastuzumab',/trastuzumab|herceptin/i],['Leucovorin',/leucovorin|leucoverin|folinic/i],['Oxaliplatin',/oxaliplatin/i],['Irinotecan',/irinotecan/i],['Capecitabine',/capecitabine|xeloda/i],['Gemcitabine',/gemcitabine/i],['Cisplatin',/cisplatin/i],['Carboplatin',/carboplatin/i],['Vincristine',/vincristine/i],['Rituximab',/rituximab|mabthera/i]];
const CHEMO_TOL=5; // % ต่างจากสูตรที่ยอมรับ ⚑ (ตั้งค่าได้)
const chemoBase=n=>n.replace(/\s*\(.*$|\s+(iv|in)\b.*$/i,'').trim();
function chemoStd(drug){ const out=[]; for(const r of CHEMO_REG) for(const x of r.d) if(chemoBase(x[0])===drug) out.push({reg:r.name,v:x[1],t:x[2],day:x[3]||'',note:x[4]||''}); return out; }
function carboGfr(pt){ return pt.crcl!=null?Math.min(pt.crcl,125):null; }
function chemoDose(row){ // ขนาด mg ที่สั่ง (และ mg/m² ถ้าแพทย์เขียนมา)
  const raw=row.raw; const pm=raw.match(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*m\s*(?:2|²)/i);
  let mg=row.doseUnit==='mg'&&+row.doseVal>0?+row.doseVal:null;
  if(mg==null||(pm&&mg===+pm[1])){ const t=[...raw.replace(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*(m\s*(?:2|²)|ml|kg)/gi,' ').matchAll(/(\d+(?:\.\d+)?)\s*mg\b(?!\s*\/)/gi)]; if(t.length) mg=+t[t.length-1][1]; else if(pm) mg=null; }
  return {mg,perM2:pm?+pm[1]:null}; }
function chemoChk(row,pt,add){
  const mm=masterOf(row); const s=row.raw+' '+(mm?mm[1]+' '+mm[2]:'');
  const hit=CHEMO_MATCH.find(([,re])=>re.test(s)); if(!hit) return false;
  const drug=hit[0], std=chemoStd(drug);
  const cd=chemoDose(row), D=cd.mg;
  if(cd.perM2&&pt.bsa){ const near=std.filter(x=>x.t==='m2').map(x=>({...x,diff:(cd.perM2-x.v)/x.v*100})).sort((a,b)=>Math.abs(a.diff)-Math.abs(b.diff))[0]; add('info',`เคมีบำบัด: คำสั่งระบุ ${cd.perM2} mg/m² × BSA ${pt.bsa.toFixed(2)} = ${fmtN(Math.round(cd.perM2*pt.bsa*10)/10)} mg${D?` (สั่ง ${fmtN(D)} mg)`:''}${near?` · สูตร ${near.reg} ${near.v} mg/m²`:''}`); }
  const L=pt.lab||{};
  if(L.anc!=null&&L.anc<1500) add('flag',`เคมีบำบัด: ANC ${fmtN(Math.round(L.anc))} <1,500 — ตรวจเกณฑ์ก่อนให้ยา/ปรึกษาแพทย์ ⚑`);
  if(L.plt!=null&&L.plt<100000) add('warn',`เคมีบำบัด: Platelet ${fmtN(L.plt)} <100,000 ⚑`);
  if(L.anc==null) add('info','เคมีบำบัด: ใส่ WBC + Neutrophil (%) ในกล่องผล Lab เพื่อคำนวณ ANC');
  if(D==null){ add('info',`เคมีบำบัด: อ่านขนาด mg จากคำสั่งไม่ได้ — ตรวจในแท็บ "เคมีบำบัด"`); return true; }
  if(drug==='Carboplatin'){ const g=carboGfr(pt); if(g==null) add('warn','เคมีบำบัด: Carboplatin ต้องใช้ CrCl (Calvert: AUC × (GFR+25))');
    else { const auc=D/(g+25); add(auc>7.5?'warn':'info',`เคมีบำบัด: Carboplatin ${fmtN(D)} mg = AUC ${fmtN(Math.round(auc*10)/10)} (GFR ${fmtN(Math.round(g))} ใช้ CrCl cap 125 ⚑) · สูตร CMT AUC 5 = ${fmtN(Math.round(5*(g+25)))} mg — ${SRC_CMT}`); } return true; }
  if(drug==='Trastuzumab'){ if(+pt.bw>0){ const k=D/pt.bw; const m=[8,6].find(v=>Math.abs(k-v)/v*100<=CHEMO_TOL); add(m?'ok':'warn',`เคมีบำบัด: Trastuzumab ${fmtN(D)} mg = ${fmtN(Math.round(k*100)/100)} mg/kg — สูตร CMT: loading 8 mg/kg, maintenance 6 mg/kg${m?` (ตรง ${m} mg/kg)`:''}`); } else add('warn','เคมีบำบัด: ใส่น้ำหนักเพื่อคำนวณ mg/kg'); return true; }
  if(!pt.bsa){ add('warn','เคมีบำบัด: ใส่ส่วนสูง + น้ำหนัก เพื่อคำนวณ BSA'); return true; }
  let per=D, unit='mg/m²';
  if(drug==='Capecitabine'&&row.F){ per=D*row.F; unit='mg/m²/วัน'; }
  const m2=per/pt.bsa;
  const near=std.map(x=>({...x,diff:(m2-x.v)/x.v*100})).sort((a,b)=>Math.abs(a.diff)-Math.abs(b.diff))[0];
  let msg=`เคมีบำบัด: ${drug} ${fmtN(D)} mg${unit.includes('วัน')?` × ${fmtN(row.F)}/วัน`:''} = ${fmtN(Math.round(m2*10)/10)} ${unit} (BSA ${pt.bsa.toFixed(2)} m² Mosteller)`;
  if(near){ const ok=Math.abs(near.diff)<=CHEMO_TOL; msg+=` · ใกล้สูตร ${near.reg} ${near.v} mg/m² = ${fmtN(Math.round(near.v*pt.bsa*(unit.includes('วัน')?1:1)))} mg (ต่าง ${near.diff>0?'+':''}${fmtN(Math.round(near.diff*10)/10)}%)`;
    add(ok?'ok':'warn',msg+(ok?'':` — เกิน ±${CHEMO_TOL}% ตรวจว่าเป็นการลดขนาดตั้งใจหรือไม่`)+` — ${SRC_CMT}`); }
  else add('info',msg);
  if(drug==='Vincristine'&&D>2) add('flag','เคมีบำบัด: Vincristine เกิน max 2 mg/ครั้ง (ชีท CMT)');
  return true;
}
