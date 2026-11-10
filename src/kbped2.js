/* ===== kbped2.js — ขนาดยาเด็กจากเอกสาร "ขนาดยาในเด็ก" (เอกสารเสริม แนบโดยเภสัชกร) — ใช้เฉพาะยาที่ตาราง รพ.มค 2568 ไม่มี
 ข้อมูลเดิมในฐาน (ตาราง รพ.มค) มาก่อนเสมอ — ไม่เขียนทับ */
const SRC_PED2='ขนาดยาในเด็ก (เอกสารเสริม) — ใช้เมื่อตาราง รพ.มค 2568 ไม่มี';
// รายการกฎตามช่วงอายุ: a=[อายุปี ต่ำ, สูง) · ชนิด: kgDay/kgDose [mg/kg] · mgDose [mg/ครั้ง] · mlDose/mlDay [ml] · tsp [ช้อนชา/ครั้ง] · F=[ต่ำ,สูง] ครั้ง/วัน
const PED2={
 cetirizine:{rules:[{a:[0,99],kgDay:[0.2,0.25],F:[1,2]}],note:'0.25 mg/kg/day แบ่งวันละ 1–2 ครั้ง'},
 erythro:{rules:[{a:[0,99],kgDay:[30,50],F:[3,4]}],note:'30–50 mg/kg/day ทุก 6–8 ชม.'},
 gg:{rules:[{a:[0,2],kgDay:[12,12],tol:0.25,F:[6,6]},{a:[2,6],mgDose:[50,100],F:[4,6]},{a:[6,12],mgDose:[100,200],F:[6,6]}],note:'<2 ปี 12 mg/kg/day ทุก 4 ชม. · 2–5 ปี 50–100 mg/ครั้ง ทุก 4–6 ชม. · 6–11 ปี 100–200 mg/ครั้ง ทุก 4 ชม.'},
 hyoscine:{rules:[{a:[0,1],mgDose:[2.5,2.5],F:[3,3]},{a:[1,6],mgDose:[5,10],F:[3,3]},{a:[6,12],mgDose:[10,20],F:[3,4]}],note:'<1 ปี 2.5 mg/ครั้ง · 1–6 ปี 5–10 mg/ครั้ง วันละ 3 ครั้ง · >6 ปี 10–20 mg/ครั้ง วันละ 3–4 ครั้ง'},
 hydroxyzine:{rules:[{a:[0,99],kgDay:[1,2],F:[3,3]}],note:'1–2 mg/kg/day แบ่งวันละ 3 ครั้ง'},
 carminative:{rules:[{a:[1,6],tsp:[1,1],F:[3,4]}],note:'1–5 ปี 1 ช้อนชา วันละ 3–4 ครั้ง'},
 mom:{rules:[{a:[0,2],kgMlDose:[0.5,0.5],F:[1,1]},{a:[2,6],mlDay:[5,15],F:[1,1]},{a:[6,13],mlDay:[15,30],F:[1,1]}],note:'<2 ปี 0.5 ml/kg/ครั้ง · 2–5 ปี 5–15 ml/วัน · 6–12 ปี 15–30 ml/วัน — วันละครั้งก่อนนอน'},
 mtv:{rules:[{a:[1,6],tsp:[1,1],F:[1,1]},{a:[6,99],tsp:[1,2],F:[1,1]}],note:'1–6 ปี 1 ช้อนชา · >6 ปี 1–2 ช้อนชา วันละครั้ง'},
 roxi:{rules:[{a:[0,99],kgDay:[5,8],F:[2,2],maxDose:150}],note:'5–8 mg/kg/day แบ่งวันละ 2 ครั้ง (สูงสุด 150 mg/ครั้ง)'},
 salbutamol:{rules:[{a:[2,6],kgDose:[0.1,0.2],F:[3,3]},{a:[6,13],mgDose:[2,2],F:[3,4]}],note:'2–6 ปี 0.1–0.2 mg/kg/ครั้ง วันละ 3 ครั้ง · 6–12 ปี 2 mg/ครั้ง วันละ 3–4 ครั้ง'},
 simethicone:{rules:[{a:[0,2],mlDose:[0.3,0.3],F:[3,4]},{a:[2,13],mlDose:[0.6,0.6],F:[3,4]}],note:'<2 ปี 0.3 ml/ครั้ง · 2–12 ปี 0.6 ml/ครั้ง (drop ~67 mg/ml) วันละ 3–4 ครั้ง'},
};
(function(){ const add=(o)=>{ if(!KB.some(x=>x.id===o.id)) KB.push(o); };
  add({id:'cetirizine',name:'Cetirizine',match:/cetiriz|zyrtec/i,unit:'mg',forms:[[/5\s*mg\s*\/\s*5|syr/i,'5 mg/5 ml',1,'ml'],[/10/,'10 mg tab',10]],adult:{d:10,t:10,txt:'10 mg วันละครั้ง'},src:SRC_PED2});
  add({id:'erythro',name:'Erythromycin',match:/erythromycin|erythro\.?\s*(?:estolate|estorate|stearate|ethyl|dry\s*syr)/i,unit:'mg',forms:[[/125\s*mg\s*\/\s*5|dry\s*syr|syr/i,'125 mg/5 ml',25,'ml'],[/250/,'250 mg tab',250]],adult:{d:500,t:4000,txt:'250–500 mg q6h (max 4 g/day)'},src:SRC_PED2});
  add({id:'gg',name:'Glyceryl guaiacolate (GG)',match:/glyceryl\s*guai|guaif|\bgg\s*syr|\bgg\b/i,unit:'mg',forms:[[/./,'100 mg/5 ml syr',20,'ml']],noMasterStrength:true,adult:{d:400,t:2400,txt:'200–400 mg q4h (max 2.4 g/day)'},src:SRC_PED2});
  add({id:'hyoscine',name:'Hyoscine butylbromide',match:/hyoscin|buscopan/i,unit:'mg',forms:[[/5\s*mg\s*\/\s*5|syr/i,'5 mg/5 ml',1,'ml'],[/20\s*mg\s*\/\s*ml|inj/i,'20 mg/ml inj',20,'ml'],[/10/,'10 mg tab',10]],adult:{d:20,t:100,txt:'10–20 mg tid–qid (max 100 mg/day)'},src:SRC_PED2});
  add({id:'carminative',name:'Mixt. Carminative',match:/carminat/i,unit:'ml',forms:[[/./,'mixture',1,'ml']],noMasterStrength:true,src:SRC_PED2});
  add({id:'mom',name:'Milk of Magnesia',match:/milk\s*of\s*mag|\bmom\b/i,unit:'ml',forms:[[/./,'susp',1,'ml']],noMasterStrength:true,adult:{d:60,t:60,txt:'30–60 ml ก่อนนอน'},src:SRC_PED2});
  add({id:'mtv',name:'Multivitamin',match:/multivit|\bmtv\b/i,unit:'ml',forms:[[/syr/i,'syrup',1,'ml'],[/drop/i,'drop',1,'ml']],noMasterStrength:true,src:SRC_PED2});
  add({id:'roxi',name:'Roxithromycin',match:/roxithro|rulid/i,unit:'mg',forms:[[/150/,'150 mg tab',150]],adult:{d:150,t:300,txt:'150 mg q12h หรือ 300 mg OD'},src:SRC_PED2});
  add({id:'salbutamol',name:'Salbutamol (oral)',match:/^(?!.*(?:nebul|\bneb\b|mdi|inhal|evohal|accuhal|พ่น|\binh\b)).*(?:salbut|ventolin)/i,unit:'mg',forms:[[/2\s*mg\s*\/\s*5|syr/i,'2 mg/5 ml',0.4,'ml'],[/2\s*mg/,'2 mg tab',2]],adult:{d:4,t:16,txt:'2–4 mg tid–qid'},src:SRC_PED2});
  add({id:'simethicone',name:'Simethicone',match:/simethic|air\s*-?\s*x/i,unit:'mg',forms:[[/67\s*mg\s*\/\s*ml|drop/i,'67 mg/ml drop',67,'ml'],[/80/,'80 mg tab',80]],adult:{d:125,t:500,txt:'40–125 mg หลังอาหาร/ก่อนนอน'},src:SRC_PED2});
  const hx=KB.find(x=>x.id==='hydroxyzine'); if(hx&&!hx.forms) hx.forms=[[/10\s*mg\s*\/\s*5|syr/i,'10 mg/5 ml',2,'ml'],[/10/,'10 mg tab',10]];
})();
