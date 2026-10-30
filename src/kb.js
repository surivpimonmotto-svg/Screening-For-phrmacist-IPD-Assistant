/* ===== ฐานกฎยา v0.1 — ถอดจากเอกสาร รพ.มหาสารคาม (ต้องให้งาน DIS ทวนสอบก่อนใช้จริง) =====
 band: lo ≤ CrCl < hi ; d = dose สูงสุดต่อครั้ง ; t = ขนาดต่อวันสูงสุด [เกณฑ์เข้ม, เกณฑ์บนของช่วง]
 kg:true = หน่วยเป็น mg/kg ; avoid = ห้ามใช้/หลีกเลี่ยง ; nodata = ไม่มีข้อมูล
*/
const B=(lo,hi,txt,d,t,x={})=>({lo,hi,txt,d,t,...x});
const M=(txt,d,t,x={})=>({txt,d,t,...x});
const SRC_RENAL='คู่มือขนาดยาไตบกพร่อง DIS 2568 (Sanford 2023)';
const SRC_HD='สรุปการบริหารยาผู้ป่วย HD (เม.ย. 2566)';
const SRC_TB='ตารางขนาดยา TB ≥15 ปี (มาตรฐาน คกก. รพ.มค. แก้ไข 10/4/2566 ตามแนวทาง TB 2564) / TB เด็ก 21/3/2566';
const SRC_PED='ขนาดยาที่ใช้บ่อยในเด็ก DIS 2568';
const SRC_ARV='ARV Screening IPD 2568';
const SRC_HAD='คู่มือ HAD ห้องยา IPD';
const HDN={
  hs:'HD: ปรับเวลาเป็น hs (วันฟอกให้หลังฟอก)',
  shift:'HD: วันฟอกเลื่อนให้หลังฟอก แล้วตั้งรอบใหม่ตามเวลาที่ให้หลังฟอก',
  one:'HD: ให้ตามรอบปกติ ต้องมีอย่างน้อย 1 dose หลังฟอก ถ้ารอบตรงเวลาฟอกให้เลื่อนมาหลังฟอก',
  extra:'HD: ให้ตามรอบปกติ + extra dose หลัง HD ทันที (ถ้ารอบปกติห่างจากหลังฟอก ≤1 ชม. ให้ขนาดปกติ + extra dose)',
  tb:'HD: ให้ยาหลังฟอกไตเท่านั้น (after HD only) — เภสัชกรปรับวันให้ยาตามวัน HD พร้อมประสานตึก'
};

const KB=[
/* ---------------- Penicillins ---------------- */
{id:'amoxi',name:'Amoxicillin (PO)',match:/amox(y|i)(?!.*clav)(?!.*klav)/i,fam:'penicillin',unit:'mg',
 forms:[[/250\s*mg\s*\/\s*5|syr|susp/i,'250 mg/5 ml syr',50,'ml'],[/500/,'500 mg cap',500],[/250/,'250 mg cap',250]],
 renal:{bands:[B(30,999,'500-1,000 mg q8h (ไม่ต้องปรับ)',1000,3000),B(10,30,'250-500 mg q12h',500,1000),B(0,10,'250-500 mg q24h',500,500)],
  HD:M('250-500 mg q24h (+ extra dose AD)',500,500),CAPD:M('250-500 mg q12h',500,1000),CRRT:M('250-500 mg q8-12h',500,[1000,1500]),hdNote:HDN.hs},
 peds:{type:'day',kg:[20,40],kgHi:90,note:'AOM 80-90 mg/kg/day q12h',src:SRC_PED},src:SRC_RENAL},

{id:'augiv',name:'Amoxicillin/clavulanate IV (Augmentin 1.2 g)',match:/(augmentin|cavumox|amoxy?.{0,4}clav|amoxiclav).*(inj|\biv\b|1\.2\s*g)/i,fam:'penicillin',cls:'blbi',unit:'mg',
 forms:[[/1\.2/,'1.2 g vial',1200,'vial']],
 renal:{bands:[B(30,999,'1.2 g (1 ขวด) IV q8h (ไม่ต้องปรับ)',1200,3600),B(10,30,'1.2 g (1 ขวด) load แล้ว 600 mg (½ ขวด) IV q12h',1200,1200),B(0,10,'1.2 g (1 ขวด) load แล้ว 600 mg (½ ขวด) IV q24h',1200,600)],
  HD:M('1.2 g (1 ขวด) load แล้ว 600 mg (½ ขวด) IV q24h (+ extra dose AD) [ต้นฉบับพิมพ์ "1.2 mg" น่าจะเป็น g]',1200,600),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.extra},src:SRC_RENAL},

{id:'augpo',name:'Amoxicillin/clavulanate PO',match:/(augmentin|amoksiklav|amoxy?.{0,4}clav|amoxiclav)/i,fam:'penicillin',cls:'blbi',unit:'mg (amox)',
 forms:[[/1\s*g|1000|875/i,'1 g tab (875/125)',875],[/625/,'625 mg tab (500/125)',500],[/457/,'457 mg/5 ml susp (amox 400)',80,'ml'],[/228|156/,'susp',50,'ml']],
 renal:{bands:[B(30,999,'500/125 mg q8h หรือ 875/125 mg q12h (ไม่ต้องปรับ)',875,1750,{rx:'Augmentin 1 g 1x2 pc หรือ Amoksiklav 625 mg 1x3 pc'}),B(10,30,'250-500 mg (amox) q12h — ห้ามใช้เม็ด 1 g (875 mg)',500,1000,{rx:'Amoksiklav 625 mg 1x2 pc (ห้ามใช้เม็ด 1 g)'}),B(0,10,'250-500 mg (amox) q24h',500,500,{rx:'Amoksiklav 625 mg 1x1 pc (ห้ามใช้เม็ด 1 g)'})],
  HD:M('250-500 mg (amox) q24h (+ extra dose AD)',500,500,{rx:'Amoksiklav 625 mg 1x1 หลังฟอก (วันฟอกให้หลังฟอก) ห้ามใช้เม็ด 1 g'}),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.extra},
 peds:{type:'day',kg:[25,45],kgHi:90,note:'Sinusitis 45, Otitis media 90 mg/kg/day (ของ amoxicillin) q12h',src:SRC_PED},src:SRC_RENAL},

{id:'ampi',name:'Ampicillin IV',match:/ampicillin(?!.*sulb)/i,fam:'penicillin',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial'],[/500/,'500 mg vial',500,'vial']],
 renal:{bands:[B(50,999,'1-2 g q4-6h (max 12 g/day)',2000,12000),B(30,50,'1-2 g q6-8h',2000,[6000,8000]),B(10,30,'1-2 g q8-12h',2000,[4000,6000]),B(0,10,'1-2 g q12h',2000,4000)],
  HD:M('1-2 g q12h (ให้ 1 dose ของวันฟอกหลังฟอก)',2000,4000),CAPD:M('500-1,000 mg q12h',1000,2000),CRRT:M('1-2 g q8-12h',2000,[4000,6000]),hdNote:HDN.one},src:SRC_RENAL},

{id:'sulperazon',name:'Cefoperazone/sulbactam (Sulperazon)',match:/sulpera|cefoperazone/i,fam:'cephalosporin',cls:'blbi',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],src:'เกณฑ์ ATB ซ้ำซ้อน รพ.มหาสารคาม'},
{id:'unasyn',name:'Ampicillin/sulbactam (Unasyn)',match:/unasyn|ampicillin.{0,4}sulb/i,fam:'penicillin',cls:'blbi',unit:'mg (รวม)',forms:[[/3\s*g|1\.5/i,'3 g vial',3000,'vial']],
 variants:[{name:'ทั่วไป (ไม่ใช่ A. baumannii)',bands:[B(30,999,'1.5-3 g q6h',3000,12000),B(15,30,'1.5-3 g q12h',3000,6000),B(0,15,'1.5-3 g q24h',3000,3000)],
   HD:M('1.5-3 g q24h (วันฟอกให้หลังฟอก)',3000,3000),CAPD:M('3 g q24h',3000,3000),CRRT:M('1.5-3 g q8-12h',3000,[6000,9000])},
  {name:'A. baumannii MDR (sulbactam ขนาดสูง)',bands:[B(30,999,'Unasyn 3 g q6h + Sulperazone 4 g q8h (sulb ~10 g/day)',3000,12000),B(15,30,'Unasyn 3 g q6h',3000,12000),B(0,15,'Unasyn 3 g q8h',3000,9000)],
   HD:{txt:'ไม่มีข้อมูล',nodata:true},CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}}],src:SRC_RENAL},

{id:'cloxa',name:'Cloxacillin IV',match:/cloxacillin/i,fam:'penicillin',unit:'mg',adult:{d:2000,t:12000,txt:'2 g q4-6h (max 12 g/day) ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'dicloxa',name:'Dicloxacillin',match:/dicloxa/i,fam:'penicillin',unit:'mg',forms:[[/62\.5|syr|susp/i,'62.5 mg/5 ml',12.5,'ml'],[/250/,'250 mg cap',250],[/500/,'500 mg',500]],
 adult:{d:500,t:2000,txt:'250-500 mg q6h ไม่ต้องปรับตามไต'},peds:{type:'day',kg:[25,50],note:'<40 kg: 25-50 mg/kg/day q6h',src:SRC_PED},src:SRC_RENAL},

{id:'tazocin',name:'Piperacillin/tazobactam (Tazocin 4.5 g)',match:/tazocin|piperacillin|pip.{0,3}tazo/i,fam:'penicillin',cls:'blbi',unit:'mg',forms:[[/4\.5/,'4.5 g vial',4500,'vial'],[/2\.25/,'2.25 g vial',2250,'vial']],
 variants:[{name:'Non-Pseudomonas',bands:[B(40,999,'3.375 g q6h',3375,13500),B(20,40,'2.25 g q6h',2250,9000),B(0,20,'2.25 g q8h',2250,6750)],
   HD:M('2.25 g q12h (+ extra 0.75 g AD)',2250,4500),CAPD:M('2.25 g q12h',2250,4500),CRRT:M('2.25 g q6h',2250,9000)},
  {name:'Pseudomonas',bands:[B(40,999,'4.5 g q6h (over 30 min)',4500,18000),B(20,40,'3.375 g q6h',3375,13500),B(0,20,'2.25 g q6h',2250,9000)],
   HD:M('2.25 g q8h (+ extra 0.75 g AD)',2250,6750),CAPD:M('2.25 g q8h',2250,6750),CRRT:M('MIC<16: 3.375 g q6h / MIC 16-64: 4.5 g (over 4 h) q8h',4500,13500)}],
 hdNote:HDN.extra,src:SRC_RENAL},

/* ---------------- Cephalosporins ---------------- */
{id:'cefazolin',name:'Cefazolin IV',match:/cefa.?zolin/i,fam:'cephalosporin',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],
 renal:{bands:[B(50,999,'1-2 g q8h (ไม่ต้องปรับ)',2000,6000),B(10,50,'0.5-2 g q8-12h',2000,[4000,6000]),B(0,10,'0.5-1 g q24h',1000,1000)],
  HD:M('0.5-1 g q24h (วันฟอกให้หลังฟอก)',1000,1000),CAPD:M('0.5 g q12h',500,1000),CRRT:M('1-2 g q12h',2000,4000),hdNote:HDN.extra},src:SRC_RENAL},

{id:'cefixime',name:'Cefixime',match:/cefixime/i,fam:'cephalosporin',unit:'mg',forms:[[/syr|susp|\/\s*5/i,'100 mg/5 ml',20,'ml'],[/100/,'100 mg cap',100],[/200/,'200 mg',200]],
 renal:{bands:[B(50,999,'400 mg q24h (ไม่ต้องปรับ)',400,400,{rx:'Cefixime (100) 2x2 pc หรือ 4x1 pc'}),B(10,50,'300 mg q24h',300,300,{rx:'Cefixime (100) 3x1 pc'}),B(0,10,'200 mg q24h',200,200,{rx:'Cefixime (100) 2x1 pc'})],
  HD:M('200 mg q24h (วันฟอกให้หลังฟอก)',200,200,{rx:'Cefixime (100) 2x1 hs (วันฟอกให้หลังฟอก)'}),CAPD:M('200 mg q24h',200,200,{rx:'Cefixime (100) 2x1 pc'}),CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.hs},
 peds:{type:'day',kg:[7,8.5],note:'8 mg/kg/day q12h',src:SRC_PED},src:SRC_RENAL},

{id:'cefdinir',name:'Cefdinir',match:/cefdinir/i,fam:'cephalosporin',unit:'mg',forms:[[/300/,'300 mg cap',300],[/100/,'100 mg',100]],
 renal:{bands:[B(30,999,'300 mg q12h (ไม่ต้องปรับ)',300,600),B(0,30,'300 mg q24h',300,300)],HD:M('300 mg q24h (วันฟอกให้หลังฟอก)',300,300),CAPD:M('300 mg q24h',300,300),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},src:SRC_RENAL},

{id:'cefotaxime',name:'Cefotaxime IV',match:/cefotaxime|claforan/i,fam:'cephalosporin',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],
 renal:{bands:[B(90,999,'2 g q8h',2000,6000),B(50,90,'2 g q8-12h',2000,[4000,6000]),B(10,50,'2 g q12-24h',2000,[2000,4000]),B(0,10,'2 g q24h',2000,2000)],
  HD:M('2 g q24h (+ extra 1 g AD)',2000,[2000,3000]),CAPD:M('0.5-1 g q24h',1000,1000),CRRT:M('2 g q12-24h',2000,[2000,4000]),hdNote:HDN.extra},src:SRC_RENAL},

{id:'ceftazavi',name:'Ceftazidime/avibactam (2.5 g)',match:/zavicefta|avibactam|ceftaz.{0,6}avi/i,fam:'cephalosporin',unit:'mg',forms:[[/2\.5/,'2.5 g vial',2500,'vial']],
 renal:{bands:[B(50,999,'2.5 g q8h',2500,7500),B(30,50,'1.25 g q8h',1250,3750),B(16,30,'0.94 g q12h',940,1880),B(6,16,'0.94 g q24h',940,940),B(0,6,'0.94 g q48h',940,470)],
  HD:M('0.94 g q48h (วันฟอกให้หลังฟอก)',940,470),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.shift},src:SRC_RENAL},

{id:'ceftaz',name:'Ceftazidime (Fortum)',match:/fortum|ceftazidime|\bceftaz\b/i,fam:'cephalosporin',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial'],[/2\s*g/i,'2 g vial',2000,'vial']],
 renal:{bands:[B(90,999,'2 g q8h',2000,6000),B(50,90,'2 g q8-12h',2000,[4000,6000]),B(10,50,'2 g q12-24h',2000,[2000,4000]),B(0,10,'2 g q24h',2000,2000)],
  HD:M('0.5-1 g q24h (วันฟอกให้หลังฟอก)',1000,1000),CAPD:M('Non-PD infect: 1.5-2 g IP q24-48h',2000,[1000,2000]),CRRT:M('1-2 g q8-12h',2000,[4000,6000]),hdNote:HDN.extra},src:SRC_RENAL},

{id:'ceftriaxone',name:'Ceftriaxone',match:/ceftriaxone|cef-?3\b|\bcef3\b/i,fam:'cephalosporin',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],
 adult:{d:2000,t:4000,txt:'1-2 g q12-24h ไม่ต้องปรับตามไต'},src:SRC_RENAL},

{id:'cephalexin',name:'Cephalexin',match:/cefalexin|cephalexin/i,fam:'cephalosporin',unit:'mg',forms:[[/125\s*mg\s*\/\s*5|syr|susp/i,'125 mg/5 ml',25,'ml'],[/500/,'500 mg cap',500],[/250/,'250 mg cap',250]],
 renal:{bands:[B(50,999,'500-1,000 mg q6h (ไม่ต้องปรับ)',1000,4000),B(10,50,'250-1,000 mg q8-12h',1000,[2000,3000]),B(0,10,'250-1,000 mg q24-48h',1000,[500,1000])],
  HD:M('250-500 mg q12-24h (วันฟอกให้หลังฟอก)',500,[500,1000]),CAPD:M('250-500 mg q12-24h',500,[500,1000]),CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.one},
 peds:{type:'day',kg:[25,100],max:4000,note:'25-100 mg/kg/day q6-8h (max 4 g/day)',src:SRC_PED},src:SRC_RENAL},

/* ---------------- Carbapenems ---------------- */
{id:'ertapenem',name:'Ertapenem',match:/ertapenem|invanz/i,fam:'carbapenem',cls:'carbapenem',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],
 renal:{bands:[B(30,999,'1 g q24h',1000,1000),B(0,30,'0.5 g q24h',500,500)],
  HD:M('0.5 g q24h (+ extra 150 mg AD ถ้าให้ยา <6 ชม.ก่อนฟอก) หรือ 0.5 g 3 ครั้ง/สัปดาห์ AD',650,650),CAPD:M('0.5 g q24h',500,500),CRRT:M('0.5-1 g q24h',1000,1000),
  hdNote:'HD: ให้ตามรอบปกติ ถ้าให้ยาก่อนฟอกไม่ถึง 6 ชม. ให้เพิ่ม 150 mg หลังฟอก ถ้ารอบตรงเวลาฟอกให้เลื่อนมาหลังฟอก'},src:SRC_RENAL},

{id:'imipenem',name:'Imipenem/cilastatin',match:/imipenem|tienam/i,fam:'carbapenem',cls:'carbapenem',unit:'mg',forms:[[/500/,'500 mg vial',500,'vial']],
 variants:[{name:'Usual dose',bands:[B(90,999,'500 mg q6h หรือ 1 g q8h',1000,[2000,3000]),B(60,90,'500 mg q6h',500,2000),B(30,60,'500 mg q8h',500,1500),B(15,30,'500 mg q12h',500,1000),B(0,15,'ไม่มีข้อมูล',null,null,{nodata:true})],
   HD:M('500 mg q12h (ให้หลังฟอกและนับรอบใหม่จากหลังฟอก)',500,1000),CAPD:M('125-250 mg q12h',250,500),CRRT:M('0.5-1 g q12h',1000,[1000,2000])},
  {name:'Intermediate susceptibility',bands:[B(90,999,'1 g q6h',1000,4000),B(60,90,'750 mg q8h',750,2250),B(30,60,'500 mg q6h',500,2000),B(15,30,'500 mg q12h',500,1000),B(0,15,'ไม่มีข้อมูล',null,null,{nodata:true})],
   HD:M('500 mg q12h',500,1000),CAPD:M('125-250 mg q12h',250,500),CRRT:M('0.5-1 g q12h',1000,[1000,2000])}],
 hdNote:'HD: ให้ยาหลังฟอกไต แล้วตั้งรอบใหม่ตาม interval เดิม',src:SRC_RENAL},

{id:'meropenem',name:'Meropenem',match:/meropenem|me-?ro-?penem/i,fam:'carbapenem',cls:'carbapenem',unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial'],[/500/,'500 mg vial',500,'vial']],
 variants:[{name:'Mild-moderate',bands:[B(50,999,'1 g q8h',1000,3000),B(25,50,'1 g q12h',1000,2000),B(10,25,'0.5 g q12h',500,1000),B(0,10,'0.5 g q24h',500,500)],
   HD:M('0.5 g q24h (วันฟอกให้หลังฟอก)',500,500),CAPD:M('0.5 g q24h',500,500),CRRT:M('750 mg q8h',750,2250)},
  {name:'Severe / meningitis',bands:[B(50,999,'2 g q8h',2000,6000),B(25,50,'2 g q12h',2000,4000),B(10,25,'1 g q12h',1000,2000),B(0,10,'1 g q24h',1000,1000)],
   HD:M('1 g q24h (วันฟอกให้หลังฟอก)',1000,1000),CAPD:M('1 g q24h',1000,1000),CRRT:M('1.5 g q8h',1500,4500)}],
 hdNote:HDN.shift,src:SRC_RENAL},

/* ---------------- Macrolides / others ---------------- */
{id:'clari',name:'Clarithromycin',match:/clarithro|klacid/i,unit:'mg',forms:[[/500/,'500 mg tab',500],[/250/,'250 mg tab',250]],
 renal:{bands:[B(50,999,'500 mg q12h (ไม่ต้องปรับ)',500,1000),B(10,50,'500 mg q12-24h',500,[500,1000]),B(0,10,'500 mg q24h',500,500)],
  HD:M('500 mg q24h (วันฟอกให้หลังฟอก)',500,500),CAPD:M('500 mg q24h',500,500),CRRT:M('500 mg q12-24h',500,[500,1000]),hdNote:HDN.hs},src:SRC_RENAL},
{id:'azithro',name:'Azithromycin',match:/azithro|zithromax/i,unit:'mg',forms:[[/200\s*mg\s*\/\s*5|syr|susp/i,'200 mg/5 ml',40,'ml'],[/250/,'250 mg cap',250],[/500/,'500 mg',500]],
 adult:{d:500,t:500,txt:'500 mg day1 แล้ว 250 mg OD / IV 500 mg OD ไม่ต้องปรับตามไต'},peds:{type:'day',kg:[5,12],note:'Loading 10 mg/kg day 1 แล้ว 5-12 mg/kg/day',src:SRC_PED},src:SRC_RENAL},
{id:'clinda',name:'Clindamycin',match:/clinda/i,cls:'clinda',unit:'mg',forms:[[/75\s*mg\s*\/\s*5|syr|susp/i,'75 mg/5 ml',15,'ml'],[/300/,'300 mg cap',300],[/150/,'150 mg cap',150],[/600/,'600 mg inj',600,'amp']],
 adult:{d:900,t:4800,txt:'PO 150-450 mg q6-8h, IV 600-900 mg q8h (max 4.8 g/day) ไม่ต้องปรับตามไต'},peds:{type:'day',kg:[8,40],note:'8-40 mg/kg/day q6-8h',src:SRC_PED},src:SRC_RENAL},
{id:'metro',name:'Metronidazole',match:/metronidazole|flagyl/i,cls:'metro',unit:'mg',forms:[[/40\s*mg\s*\/\s*ml|syr|susp/i,'40 mg/ml',40,'ml'],[/500\s*mg\s*\/\s*100|inj|\biv\b/i,'500 mg/100 ml IV',500,'bottle'],[/200/,'200 mg tab',200],[/400/,'400 mg tab',400]],
 renal:{bands:[B(10,999,'7.5 mg/kg q6-8h (max 4 g/day) ไม่ต้องปรับ',null,4000),B(0,10,'7.5 mg/kg q12h',null,[15,20],{kg:true})],
  HD:M('7.5 mg/kg q12h (ให้ 1 dose ของวันฟอกหลังฟอก)',null,[15,20],{kg:true}),CAPD:M('7.5 mg/kg q12h',null,[15,20],{kg:true}),CRRT:M('7.5 mg/kg q6h',null,4000),hdNote:HDN.one},
 peds:{type:'day',kg:[10,30],max:4000,note:'10-30 mg/kg/day q6h (max 4 g/day)',src:SRC_PED},src:SRC_RENAL},

/* ---------------- Aminoglycosides ---------------- */
{id:'amikacin',name:'Amikacin',match:/amikacin|amikin/i,cls:'aminoglycoside',unit:'mg',kgDose:true,forms:[[/500/,'500 mg vial',500,'vial'],[/100/,'100 mg vial',100,'vial']],
 variants:[{name:'Traditional (7.5 mg/kg q12h)',bands:[B(50,999,'7.5 mg/kg q12h',7.5,15,{kg:true}),B(10,50,'7.5 mg/kg q24h',7.5,7.5,{kg:true}),B(0,10,'7.5 mg/kg q48h',7.5,3.75,{kg:true})],
   HD:M('7.5 mg/kg q48h (+ extra 3.75 mg/kg AD)',7.5,[3.75,5.6],{kg:true}),CAPD:M('Peritonitis: 2 mg/kg IP q24h',2,2,{kg:true}),CRRT:M('7.5 mg/kg q24h',7.5,7.5,{kg:true})},
  {name:'Once daily (15 mg/kg q24h)',bands:[B(80,999,'15 mg/kg q24h',15,15,{kg:true}),B(60,80,'12 mg/kg q24h',12,12,{kg:true}),B(40,60,'7.5 mg/kg q24h',7.5,7.5,{kg:true}),B(30,40,'4 mg/kg q24h',4,4,{kg:true}),B(20,30,'7.5 mg/kg q48h',7.5,3.75,{kg:true}),B(10,20,'4 mg/kg q48h',4,2,{kg:true}),B(0,10,'3 mg/kg q72h',3,1,{kg:true})],
   HD:M('3 mg/kg q72h และ AD',3,1,{kg:true}),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}}],
 tb:{adult:{kg:[15,20],max:1000,renal3x:true},ped:{kg:[15,30],max:1000}},hdNote:HDN.extra,src:SRC_RENAL},

{id:'genta',name:'Gentamicin',match:/genta/i,cls:'aminoglycoside',unit:'mg',kgDose:true,forms:[[/80/,'80 mg amp',80,'amp']],
 variants:[{name:'Traditional (1.7-2 mg/kg q8h)',bands:[B(50,999,'1.7-2.0 mg/kg q8h',2,6,{kg:true}),B(10,50,'1.7-2.0 mg/kg q12-24h',2,[2,4],{kg:true}),B(0,10,'1.7-2.0 mg/kg q48h',2,1,{kg:true})],
   HD:M('1.7-2.0 mg/kg q48h (+ extra 0.85-1.0 mg/kg AD)',2,[1,1.5],{kg:true}),CAPD:M('Peritonitis: 0.6 mg/kg IP OD',0.6,0.6,{kg:true}),CRRT:M('1.7-2.0 mg/kg q24h',2,2,{kg:true})},
  {name:'Once daily (5.1 mg/kg q24h)',bands:[B(80,999,'5.1 mg/kg q24h',5.1,5.1,{kg:true}),B(60,80,'4 mg/kg q24h',4,4,{kg:true}),B(40,60,'3.5 mg/kg q24h',3.5,3.5,{kg:true}),B(30,40,'2.5 mg/kg q24h',2.5,2.5,{kg:true}),B(20,30,'4 mg/kg q48h',4,2,{kg:true}),B(10,20,'3 mg/kg q48h',3,1.5,{kg:true}),B(0,10,'2 mg/kg q72h',2,0.67,{kg:true})],
   HD:M('2 mg/kg q72h และ AD',2,0.67,{kg:true}),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}}],
 hdNote:HDN.extra,src:SRC_RENAL},

/* ---------------- Quinolones ---------------- */
{id:'ciproiv',name:'Ciprofloxacin IV',match:/cipro.*(inj|\biv\b|\/\s*100\s*ml)/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/200/,'200 mg/100 ml',200,'bottle'],[/400/,'400 mg',400,'bottle']],
 renal:{bands:[B(30,999,'200-400 mg q8-12h (ไม่ต้องปรับ)',400,1200),B(0,30,'200-400 mg q18-24h',400,[400,533])],
  HD:M('200-400 mg q24h (วันฟอกให้หลังฟอก)',400,400),CAPD:M('200-400 mg q24h',400,400),CRRT:M('200-400 mg q12h',400,800),hdNote:HDN.shift},src:SRC_RENAL},
{id:'cipro',name:'Ciprofloxacin PO',match:/cipro/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/500/,'500 mg tab',500],[/250/,'250 mg tab',250]],
 renal:{bands:[B(50,999,'250-750 mg q12h (ไม่ต้องปรับ)',750,1500,{rx:'Ciprofloxacin (250) 2x2 pc'}),B(30,50,'250-500 mg q12h',500,1000,{rx:'Ciprofloxacin (250) 1-2x2 pc (สูงสุด 2 เม็ด q12h)'}),B(0,30,'250-500 mg q24h',500,500,{rx:'Ciprofloxacin (250) 1-2x1 pc (สูงสุด 2 เม็ด/วัน)'})],
  HD:M('250-500 mg q24h (วันฟอกให้หลังฟอก)',500,500,{rx:'Ciprofloxacin (250) 1-2x1 hs (วันฟอกให้หลังฟอก)'}),CAPD:M('250-500 mg q24h',500,500,{rx:'Ciprofloxacin (250) 1-2x1 pc'}),CRRT:M('250-500 mg q12h',500,1000,{rx:'Ciprofloxacin (250) 1-2x2 pc'}),hdNote:HDN.hs},src:SRC_RENAL},
{id:'levo',name:'Levofloxacin',match:/levoflox|cravit/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/750/,'750 mg/150 ml IV',750,'bottle'],[/500/,'500 mg tab',500],[/250/,'250 mg tab',250]],
 renal:{bands:[B(50,999,'750 mg q24h (ไม่ต้องปรับ)',750,750),B(20,50,'750 mg q48h',750,375),B(0,20,'750 mg ครั้งแรก แล้ว 500 mg q48h',750,[250,375])],
  HD:M('750 mg ครั้งแรก แล้ว 500 mg q48h',750,[250,375]),CAPD:M('750 mg ครั้งแรก แล้ว 500 mg q48h',750,[250,375]),CRRT:M('750 mg ครั้งแรก แล้ว 500 mg q48h',750,[250,375]),hdNote:HDN.shift},
 tb:{adult:{bandsWt:[[0,38,500],[38,50,750],[50,999,1000]],max:1000,renal3x:true,renalCut:30,renalLt:true},ped:{kg:[15,20],max:1500}},src:SRC_RENAL},
{id:'norflox',name:'Norfloxacin',match:/norflox/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/400/,'400 mg tab',400],[/200/,'200 mg tab',200]],
 renal:{bands:[B(30,999,'400 mg q12h (ไม่ต้องปรับ)',400,800),B(0,30,'400 mg q24h',400,400)],HD:M('400 mg q24h',400,400),CAPD:{txt:'Not applicable',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true},hdNote:HDN.hs},src:SRC_RENAL},
{id:'oflox',name:'Ofloxacin',match:/oflox/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/200/,'200 mg tab',200],[/100/,'100 mg',100]],
 renal:{bands:[B(50,999,'200-400 mg q12h (ไม่ต้องปรับ)',400,800),B(10,50,'200-400 mg q24h',400,400),B(0,10,'200 mg q24h',200,200)],
  HD:M('200 mg q24h (วันฟอกให้หลังฟอก)',200,200),CAPD:M('200 mg q24h',200,200),CRRT:M('200-400 mg q24h',400,400),hdNote:HDN.hs},src:SRC_RENAL},
{id:'sitaflox',name:'Sitafloxacin',match:/sitaflox|gracevit/i,fam:'quinolone',cls:'quinolone',unit:'mg',forms:[[/50/,'50 mg tab',50]],
 renal:{bands:[B(50,999,'100 mg BID (ไม่ต้องปรับ)',100,200),B(30,50,'100 mg q24h',100,100),B(10,30,'100 mg q48h',100,50),B(0,10,'ไม่มีข้อมูล',null,null,{nodata:true})],
  HD:{txt:'ไม่มีข้อมูล',nodata:true},CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},verify:'ต้นฉบับมี 3 ค่าใน 4 ช่อง CrCl — แบ่งช่วง 30-49 / 10-29 ตามฉลาก ต้องทวนสอบ',src:SRC_RENAL},

/* ---------------- Others ATB ---------------- */
{id:'colistin',name:'Colistin (mg CBA)',match:/colistin|polymyxin\s*e/i,unit:'mg CBA',forms:[[/150/,'150 mg vial',150,'vial']],
 renal:{bands:[B(80,999,'LD 300 mg แล้ว 150 mg q8-12h',300,[300,450]),B(40,80,'LD 300 mg แล้ว 150 mg q12h',300,300),B(20,40,'LD 300 mg แล้ว 100 mg q12h',300,200),B(0,20,'LD 300 mg แล้ว 150 mg q24h',300,150)],
  HD:M('LD 300 mg แล้ว: วันไม่ฟอก 150 mg q24h / วันฟอก 200 mg หลังฟอก',300,200),CAPD:M('LD 300 mg แล้ว 100 mg q24h',300,100),CRRT:M('150 mg q24h + 13 mg ต่อชั่วโมงที่ทำ CRRT',300,470),
  hdNote:'HD: ให้ตามรอบปกติ ถ้าเวลาปกติอยู่ก่อนฟอก วันฟอกให้เลื่อนมาหลังฟอก'},
 note:'Colistin: ระบุ indication + ระยะเวลา + loading dose ใน note (ป้ายห้องยา รพ.)',src:SRC_RENAL},

{id:'cotrim',name:'Co-trimoxazole (mg TMP)',match:/co-?trimox|bactrim|sulfameth|smx|tmp\s*\/\s*smx/i,fam:'sulfa',unit:'mg TMP',kgDose:true,
 forms:[[/200\s*mg\s*\/\s*5|syr|susp/i,'200/40 mg per 5 ml',8,'ml'],[/800|forte|960/i,'800/160 tab',160],[/400|480/i,'400/80 tab',80]],
 renal:{bands:[B(30,999,'TMP 5-20 mg/kg/day แบ่ง q6-12h (ไม่ต้องปรับ)',null,20,{kg:true}),B(10,30,'TMP 5-10 mg/kg/day แบ่ง q12h',null,10,{kg:true}),B(0,10,'ไม่แนะนำ ถ้าจำเป็น TMP 5-10 mg/kg q24h',null,10,{kg:true,warnAlways:'CrCl<10: ไม่แนะนำให้ใช้'})],
  HD:M('ไม่แนะนำ ถ้าจำเป็น TMP 5-10 mg/kg q24h (วันฟอกให้หลังฟอก)',null,10,{kg:true}),CAPD:M('ไม่แนะนำ ถ้าจำเป็น TMP 5-10 mg/kg q24h',null,10,{kg:true}),CRRT:M('TMP 5 mg/kg q8h',null,15,{kg:true})},
 peds:{type:'day',kg:[6,10],kgHi:20,note:'6-10 mg/kg/day TMP q12h, Severe (melioidosis/PCP) 15-20 mg/kg/day',src:SRC_PED},src:SRC_RENAL},

{id:'vanco',name:'Vancomycin',match:/vanco/i,unit:'mg',kgDose:true,forms:[[/500/,'500 mg vial',500,'vial'],[/1\s*g/i,'1 g vial',1000,'vial']],
 renal:{bands:[B(51,999,'15-20 mg/kg q12h (ไม่เกิน 2 g/dose)',20,40,{kg:true,dmax:2000}),B(20,51,'15-20 mg/kg q24h',20,20,{kg:true,dmax:2000}),B(0,20,'15-20 mg/kg q48h หรือนานกว่า',20,10,{kg:true,dmax:2000})],
  HD:M('MD 7.5-10 mg/kg หลังฟอก เฉพาะวันที่ฟอก',10,10,{kg:true}),CAPD:M('q48-96h หรือ 1 g q7days',null,null,{nodata:true}),CRRT:M('7.5-10 mg/kg q12h',10,20,{kg:true})},
 note:'LD 20-30 mg/kg (ABW, max 3 g) ในการติดเชื้อรุนแรง — แนะนำ TDM',hdNote:'HD: ให้ยาหลังฟอก เฉพาะวันที่ฟอกไต',src:SRC_RENAL},

/* ---------------- Antiviral / antifungal ---------------- */
{id:'acyiv',name:'Acyclovir IV',match:/acyclovir.*(inj|\biv\b|250)/i,unit:'mg',kgDose:true,forms:[[/250/,'250 mg vial',250,'vial']],
 renal:{bands:[B(50,999,'5-12.5 mg/kg q8h',12.5,37.5,{kg:true}),B(10,50,'5-12.5 mg/kg q12-24h',12.5,[12.5,25],{kg:true}),B(0,10,'2.5-6.25 mg/kg q24h',6.25,6.25,{kg:true})],
  HD:M('2.5-6.25 mg/kg q24h (วันฟอกให้หลังฟอก)',6.25,6.25,{kg:true}),CAPD:M('2.5-6.25 mg/kg q24h',6.25,6.25,{kg:true}),CRRT:M('2.5-6.25 mg/kg q24h',6.25,6.25,{kg:true})},note:'อ้วน: ใช้ AdjBW',src:SRC_RENAL},
{id:'acypo',name:'Acyclovir PO',match:/acyclovir/i,unit:'mg',forms:[[/800/,'800 mg tab',800],[/400/,'400 mg tab',400],[/200/,'200 mg tab',200]],
 renal:{bands:[B(25,999,'200 mg q4h / 400 mg q12h / 800 mg q4h (5 ครั้ง)',800,4000),B(10,25,'800 mg q8h (สูตร 800 mg)',800,2400),B(0,10,'200 mg q12h หรือ 800 mg q12h ตามสูตร',800,1600)],
  HD:M('ตามสูตร q12h (+ extra dose AD)',800,1600),CAPD:M('ตามสูตร q12h',800,1600),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},verify:'กฎรวมทุกสูตร — สูตร 200 mg ที่ CrCl<10 ควรเหลือ 200 mg q12h',src:SRC_RENAL},
{id:'oseltamivir',name:'Oseltamivir (Tamiflu)',match:/tamiflu|oseltamivir/i,unit:'mg',forms:[[/15\s*mg\s*\/\s*ml|syr/i,'15 mg/ml syr',15,'ml'],[/75/,'75 mg cap',75],[/45/,'45 mg',45],[/30/,'30 mg',30]],
 variants:[{name:'Prophylaxis',bands:[B(60,999,'75 mg OD x 10 วัน',75,75),B(30,60,'30 mg OD',30,30),B(10,30,'30 mg EOD',30,15),B(0,10,'ไม่มีข้อมูล',null,null,{nodata:true})],HD:{txt:'ไม่มีข้อมูล',nodata:true},CAPD:M('30 mg สัปดาห์ละครั้ง',30,4.3),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},
  {name:'Treatment',bands:[B(60,999,'75 mg BID x 5 วัน',75,150),B(30,60,'30 mg BID',30,60),B(10,30,'30 mg OD',30,30),B(0,10,'ไม่แนะนำ',null,null,{avoid:true})],
   HD:M('30 mg หลังฟอกแต่ละครั้ง วันไม่ฟอกไม่ให้ยา',30,15),CAPD:M('30 mg ครั้งเดียว (หลังเปลี่ยนน้ำยา)',30,30),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}}],
 hdNote:'HD: ให้เฉพาะวันที่ฟอก หลังฟอก',src:SRC_RENAL},
{id:'ganciclovir',name:'Ganciclovir IV',match:/ganciclovir|cymevene/i,unit:'mg',kgDose:true,forms:[[/500/,'500 mg vial',500,'vial']],
 variants:[{name:'Maintenance',bands:[B(70,999,'5 mg/kg q24h',5,5,{kg:true}),B(50,70,'2.5-5 mg/kg q24h',5,[2.5,5],{kg:true}),B(10,50,'0.625-1.25 mg/kg q24h',1.25,1.25,{kg:true}),B(0,10,'0.625 mg/kg 3 ครั้ง/สัปดาห์',0.625,0.27,{kg:true})],
   HD:M('0.625 mg/kg 3 ครั้ง/สัปดาห์ (วันฟอกให้หลังฟอก)',0.625,0.27,{kg:true}),CAPD:M('0.625 mg/kg 3 ครั้ง/สัปดาห์',0.625,0.27,{kg:true}),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},
  {name:'Induction',bands:[B(70,999,'5 mg/kg q12h',5,10,{kg:true}),B(50,70,'2.5 mg/kg q12h',2.5,5,{kg:true}),B(25,50,'2.5 mg/kg q24h',2.5,2.5,{kg:true}),B(10,25,'1.25 mg/kg q24h',1.25,1.25,{kg:true}),B(0,10,'1.25 mg/kg 3 ครั้ง/สัปดาห์',1.25,0.54,{kg:true})],
   HD:M('1.25 mg/kg 3 ครั้ง/สัปดาห์ (วันฟอกให้หลังฟอก)',1.25,0.54,{kg:true}),CAPD:M('1.25 mg/kg 3 ครั้ง/สัปดาห์',1.25,0.54,{kg:true}),CRRT:M('2.5 mg/kg q24h',2.5,2.5,{kg:true})}],
 note:'ยืนยันแล้ว: "242h" ในคู่มือต้นฉบับ = q24h',src:SRC_RENAL},
{id:'fluconazole',name:'Fluconazole',match:/fluconazole|diflucan/i,unit:'mg',forms:[[/200/,'200 mg cap',200],[/100/,'100 mg',100],[/50/,'50 mg',50],[/400|inj/i,'IV',200,'bottle']],
 renal:{bands:[B(50,999,'100-400 mg q24h (Crypto 800-1,200 mg/day)',1200,[400,1200]),B(0,50,'ลด 50% (ปกติ 50-200 mg/day)',600,[200,600])],
  HD:M('วันไม่ฟอกลด 50% / วันฟอกให้ขนาดเต็มหลังฟอก',1200,[400,1200]),CAPD:M('ลด 50%',600,[200,600]),CRRT:M('ขนาดเต็ม',1200,[400,1200])},src:SRC_RENAL},

/* ---------------- TB ---------------- */
{id:'rifinah',name:'Rifinah (INH+RIF เม็ดรวม)',match:/rifinah/i,unit:'tab',note:'ยาเม็ดรวม INH+Rifampicin — ตรวจขนาดแต่ละตัวตามตาราง TB (เทียบ mg ของ INH และ R)',src:SRC_TB},
{id:'inh',name:'Isoniazid (INH)',match:/isoniazid|(^|\s)inh(?=[\s(]|$)/i,unit:'mg',forms:[[/300/,'300 mg tab',300],[/100/,'100 mg tab',100]],
 tb:{adult:{kg:[4,6],max:300,bandsWt:[[0,35,null,1],[35,50,300],[50,70,300],[70,999,300,1]],renalNo:true},ped:{kg:[10,15],max:300}},src:SRC_TB},
{id:'rifam',name:'Rifampicin',match:/rifamp|rifampin/i,unit:'mg',forms:[[/450/,'450 mg cap',450],[/300/,'300 mg cap',300],[/600/,'600 mg',600]],
 tb:{adult:{kg:[8,12],max:600,bandsWt:[[0,35,300,1],[35,50,450],[50,70,600],[70,999,600,1]],renalNo:true},ped:{kg:[10,20],max:600}},src:SRC_TB},
{id:'emb',name:'Ethambutol',match:/ethambutol|\bemb\b/i,unit:'mg',forms:[[/400/,'400 mg tab',400],[/500/,'500 mg tab',500]],
 tb:{adult:{kg:[15,20],max:1600,bandsWt:[[0,35,600,1],[35,50,800],[50,70,1000],[70,999,1200,1]],renal3x:true,capd:'CAPD: 15 mg/kg q48h (คู่มือไต)'},ped:{kg:[15,20],max:1200,renalPed:'CrCl 10-50: q24-36h, <10: q48h, HD: ขนาดปกติหลังฟอก'}},
 hdNote:HDN.tb,src:SRC_TB},
{id:'pza',name:'Pyrazinamide',match:/pyrazinamide|\bpza\b/i,unit:'mg',forms:[[/500/,'500 mg tab',500]],
 tb:{adult:{kg:[20,30],max:2000,bandsWt:[[0,35,1000,1],[35,50,1000],[50,70,1500],[70,999,2000,1]],renal3x:true,capd:'CAPD: 25 mg/kg q24h (คู่มือไต)'},ped:{kg:[30,40],max:2000,renalPed:'GFR ลดลง: 40 mg/kg/day 3 ครั้ง/สัปดาห์'}},hdNote:HDN.tb,src:SRC_TB},
{id:'streptomycin',name:'Streptomycin',match:/streptomycin/i,unit:'mg',forms:[[/1\s*g/i,'1 g vial',1000,'vial']],tb:{adult:{kg:[12,18],max:1000,renal3x:true},ped:{kg:[20,40],max:1000}},note:'ห้ามใช้ในหญิงตั้งครรภ์',preg:'Streptomycin ห้ามใช้ในหญิงตั้งครรภ์',src:SRC_TB},

/* ---------------- ARV ---------------- */
{id:'tld',name:'TLD (TDF/3TC/DTG) — Acriptega',match:/acriptega|\btld\b/i,unit:'tab',warn:[{crcl:50,lvl:'flag',msg:'CrCl<50: ห้ามใช้ ใช้ AZT(100) 3 tab q12h + DTG(50) 1 tab q24h + 3TC ปรับตาม CrCl'}],src:SRC_ARV},
{id:'tenoem',name:'TDF/FTC (Teno-EM)',match:/teno-?em|tdf\s*\/\s*ftc/i,unit:'tab',warn:[{crcl:30,lvl:'flag',msg:'CrCl<30 หรือ HD: ห้ามใช้'},{crcl:50,lvl:'warn',msg:'CrCl 30-49: 1 tab q48h'}],src:SRC_ARV},
{id:'alacovir',name:'ABC/3TC (Alacovir)',match:/alacovir|abc\s*\/\s*3tc/i,unit:'tab',warn:[{crcl:50,lvl:'flag',msg:'CrCl<50: ห้ามใช้ ให้ใช้ยาเม็ดแยกแล้วปรับ 3TC ตาม CrCl'}],src:SRC_ARV},
{id:'zilarvir',name:'AZT/3TC (Zilarvir)',match:/zila(r)?vir|azt\s*\/\s*3tc/i,unit:'tab',warn:[{crcl:50,lvl:'flag',msg:'CrCl<50: ห้ามใช้ ใช้ยาแยกเม็ดแล้วปรับขนาดแต่ละตัว'}],src:SRC_ARV},
{id:'efvfdc',name:'EFV/TDF/FTC (GPOvir-T / Teevir)',match:/gpo-?vir-?t|teevir/i,unit:'tab',warn:[{crcl:50,lvl:'flag',msg:'CrCl<50: ห้ามใช้'}],src:SRC_ARV},
{id:'kocitaf',name:'DTG/FTC/TAF (Kocitaf)',match:/kocitaf/i,unit:'tab',warn:[{crcl:30,lvl:'flag',msg:'CrCl<30: ไม่แนะนำ'}],src:SRC_RENAL},
{id:'taf',name:'Tenofovir alafenamide (TAF 25)',match:/\btaf\b|alafenamide|vemlidy/i,unit:'mg',warn:[{crcl:15,lvl:'flag',msg:'CrCl<15: ห้ามใช้ (HD ให้ 25 mg q24h หลังฟอก ตามคู่มือไต)'}],src:SRC_ARV},
{id:'tdf',name:'Tenofovir disoproxil (TDF 300)',match:/\btdf\b|tenofovir/i,unit:'mg',forms:[[/300/,'300 mg tab',300]],
 renal:{bands:[B(50,999,'300 mg q24h',300,300),B(30,50,'300 mg q48h',300,150),B(10,30,'300 mg สัปดาห์ละ 2 ครั้ง',300,86),B(0,10,'ไม่แนะนำ',null,null,{avoid:true})],HD:M('300 mg q7 วัน (หลังฟอก)',300,43),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},src:SRC_ARV},
{id:'3tc',name:'Lamivudine (3TC)',match:/lamivudine|\b3tc\b/i,unit:'mg',forms:[[/10\s*mg\s*\/\s*ml|syr/i,'10 mg/ml syr',10,'ml'],[/150/,'150 mg tab',150],[/100/,'100 mg (HBV)',100]],
 renal:{bands:[B(50,999,'150 mg q12h หรือ 300 mg q24h',300,300),B(30,50,'150 mg q24h',150,150),B(10,30,'100 mg q24h',100,100),B(0,10,'25-50 mg q24h',50,50)],
  HD:M('25-50 mg q24h (วันฟอกให้หลังฟอก)',50,50),CAPD:M('25-50 mg q24h',50,50),CRRT:M('100 mg วันแรก แล้ว 50 mg q24h',100,50)},note:'ขนาดสำหรับ HIV (HBV ใช้ตารางแยก)',src:SRC_ARV},
{id:'azt',name:'Zidovudine (AZT)',match:/zidovudine|\bazt\b/i,unit:'mg',forms:[[/10\s*mg\s*\/\s*ml|syr/i,'10 mg/ml syr',10,'ml'],[/100/,'100 mg cap',100],[/300/,'300 mg',300]],
 renal:{bands:[B(10,999,'300 mg q12h (<50 kg: 200 mg q12h)',300,600),B(0,10,'100 mg q8h หรือ 300 mg q24h',300,300)],HD:M('100 mg q8h (วันฟอกให้หลังฟอก)',100,300),CAPD:M('100 mg q8h',100,300),CRRT:M('300 mg q12h',300,600),hdNote:HDN.one},src:SRC_ARV},

/* ---------------- Cardio / metabolic ---------------- */
{id:'metformin',name:'Metformin',match:/metformin|glucophage/i,unit:'mg',forms:[[/850/,'850 mg',850],[/500/,'500 mg tab',500],[/1000/,'1000 mg',1000]],
 renal:{basis:'egfr',bands:[B(60,999,'eGFR >60: ไม่เกิน 2,550 mg/day',1000,2550),B(45,60,'eGFR 45-60: ไม่เกิน 2,000 mg/day',1000,2000),
  B(30,45,'eGFR 30-45: ไม่เกิน 1,000 mg/day · ไม่เริ่มยาใหม่ (ก่อนเริ่ม MFM ควรมี eGFR >45)',1000,1000,{warnAlways:'eGFR 30-45: ไม่ควรเริ่ม metformin ใหม่ (แนวทาง รพ.มค: ก่อนเริ่มยาควรมี eGFR >45) — ถ้าใช้อยู่เดิม ไม่เกิน 1,000 mg/day'}),
  B(0,30,'ห้ามใช้ (eGFR <30)',null,null,{avoid:true})],
  HD:{txt:'ห้ามใช้',avoid:true},CAPD:{txt:'ห้ามใช้',avoid:true},CRRT:{txt:'ห้ามใช้',avoid:true}},
 src:'แนวทางการใช้ยา Metformin รพ.มหาสารคาม'},
{id:'simva',name:'Simvastatin',match:/simva/i,cls:'statin',unit:'mg',forms:[[/40/,'40 mg',40],[/20/,'20 mg',20],[/10/,'10 mg',10]],
 renal:{bands:[B(10,999,'10-40 mg OD (max 40)',40,40),B(0,10,'≤10 mg/day',10,10)],HD:M('≤10 mg/day',10,10),CAPD:M('≤10 mg/day',10,10),CRRT:M('ไม่ต้องปรับ',40,40)},preg:'Statin ห้ามใช้ในหญิงตั้งครรภ์',src:SRC_RENAL},
{id:'rosuva',name:'Rosuvastatin',match:/rosuva|crestor/i,cls:'statin',unit:'mg',forms:[[/20/,'20 mg',20],[/10/,'10 mg',10],[/5/,'5 mg',5]],
 renal:{bands:[B(30,999,'20 mg OD (max 20)',20,20),B(0,30,'ไม่เกิน 10 mg/day',10,10)],HD:M('ไม่เกิน 10 mg/day',10,10),CAPD:M('ไม่เกิน 10 mg/day',10,10),CRRT:M('ไม่เกิน 10 mg/day',10,10)},preg:'Statin ห้ามใช้ในหญิงตั้งครรภ์',src:SRC_RENAL},
{id:'atorva',name:'Atorvastatin',match:/atorva|lipitor/i,cls:'statin',unit:'mg',forms:[[/80/,'80 mg',80],[/40/,'40 mg',40],[/20/,'20 mg',20],[/10/,'10 mg',10]],adult:{d:80,t:80,txt:'10-80 mg OD ไม่ต้องปรับตามไต'},preg:'Statin ห้ามใช้ในหญิงตั้งครรภ์',src:SRC_RENAL},
{id:'gemfib',name:'Gemfibrozil',match:/gemfibrozil|\blopid\b/i,unit:'mg',forms:[[/600/,'600 mg',600],[/300/,'300 mg',300]],
 renal:{basis:'egfr',bands:[B(50,999,'600 mg BID (ไม่ต้องปรับ)',600,1200),B(0,50,'เริ่ม 900 mg/day',900,900)],HD:M('เริ่ม 900 mg/day',900,900),CAPD:M('เริ่ม 900 mg/day',900,900),CRRT:M('เริ่ม 900 mg/day',900,900)},src:SRC_RENAL},
{id:'fenofib',name:'Fenofibrate',match:/fenofibrate|lipanthyl/i,unit:'mg',warn:[{crcl:15,lvl:'flag',msg:'CrCl<15: หลีกเลี่ยง'}],src:SRC_RENAL},
{id:'enalapril',name:'Enalapril',match:/enalapril/i,cls:'acei',unit:'mg',forms:[[/20/,'20 mg',20],[/5/,'5 mg',5]],
 renal:{bands:[B(51,999,'5-20 mg q12-24h (max 40)',20,40),B(10,51,'50-100% ของขนาดปกติ',20,[20,40]),B(0,10,'25% ของขนาดปกติ',10,10)],HD:{txt:'ไม่มีข้อมูล',nodata:true},CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},src:SRC_RENAL},
{id:'captopril',name:'Captopril',match:/captopril/i,cls:'acei',unit:'mg',forms:[[/25/,'25 mg',25],[/12\.5/,'12.5 mg',12.5]],adult:{d:50,t:150,txt:'6.25-50 mg q8-12h; ไตบกพร่องเริ่มขนาดต่ำ'},hdNote:'HD: ให้ 50% ของขนาดปกติ q24h, ปรับเวลาเป็น hs',src:SRC_RENAL},
{id:'losartan',name:'Losartan',match:/losartan|lo-?sar-?tan/i,cls:'arb',unit:'mg',forms:[[/100/,'100 mg',100],[/50/,'50 mg',50]],
 renal:{bands:[B(20,999,'25-100 mg OD (HF max 150)',150,150),B(0,20,'เริ่ม 25 mg/day',150,150,{warnAlways:'CrCl<20: เริ่ม 25 mg/day'})],HD:M('เริ่ม 25 mg/day',150,150),CAPD:M('เริ่ม 25 mg/day',150,150),CRRT:M('เริ่ม 25 mg/day',150,150)},src:SRC_RENAL},
{id:'candesartan',name:'Candesartan',match:/candesartan|blopress/i,cls:'arb',unit:'mg',forms:[[/16/,'16 mg',16],[/8/,'8 mg',8]],adult:{d:32,t:32,txt:'2-32 mg OD; CrCl<20 เริ่ม 2 mg'},src:SRC_RENAL},
{id:'amlo',name:'Amlodipine',match:/amlodipine|norvasc/i,cls:'ccb',unit:'mg',forms:[[/10/,'10 mg',10],[/5/,'5 mg',5]],adult:{d:10,t:10,txt:'5-10 mg OD'},src:'—'},
{id:'mani',name:'Manidipine',match:/mani.?dipine|madiplot/i,cls:'ccb',unit:'mg',forms:[[/20/,'20 mg',20],[/10/,'10 mg',10]],adult:{d:20,t:20,txt:'5-20 mg q24h'},src:SRC_RENAL},
{id:'lercan',name:'Lercanidipine',match:/lercanidipine|zanidip/i,cls:'ccb',unit:'mg',adult:{d:20,t:20,txt:'5-20 mg q24h'},src:SRC_RENAL},
{id:'nifedipine',name:'Nifedipine',match:/nifedipine|adalat/i,cls:'ccb',unit:'mg',forms:[[/5/,'5 mg cap',5],[/10/,'10 mg',10]],adult:{d:30,t:90,txt:'10-30 mg q8h (max 90)'},elderly:'Nifedipine (IR): เสี่ยงความดันต่ำ/reflex tachycardia — เลือกยาออกฤทธิ์นาน เช่น amlodipine',src:SRC_RENAL},
{id:'atenolol',name:'Atenolol',match:/atenolol|tenormin/i,cls:'bb',unit:'mg',forms:[[/100/,'100 mg',100],[/50/,'50 mg',50],[/25/,'25 mg',25]],
 renal:{bands:[B(51,999,'50-100 mg q24h',100,100),B(10,51,'25-50 mg q24h',50,50),B(0,10,'25 mg q24h',25,25)],HD:M('25 mg q24h (วันฟอกให้หลังฟอก)',25,25),CAPD:M('25 mg q24h',25,25),CRRT:M('25-50 mg q24h',50,50),hdNote:HDN.hs},src:SRC_RENAL},
{id:'metoprolol',name:'Metoprolol',match:/metoprolol|betaloc/i,cls:'bb',unit:'mg',adult:{d:400,t:400,txt:'50-400 mg/day ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'carvedilol',name:'Carvedilol',match:/carvedilol|dilatrend/i,cls:'bb',unit:'mg',forms:[[/25/,'25 mg',25],[/12\.5/,'12.5 mg',12.5],[/6\.25/,'6.25 mg',6.25]],adult:{d:25,t:50,txt:'6.25-25 mg q12-24h ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'methyldopa',name:'Methyldopa',match:/methyldopa|aldomet/i,unit:'mg',forms:[[/250/,'250 mg',250]],
 renal:{bands:[B(51,999,'250-800 mg q8h (max 2,400)',800,2400),B(10,51,'250-800 mg q8-12h',800,[1600,2400]),B(0,10,'250-800 mg q12-24h',800,[800,1600])],HD:M('250-800 mg q12-24h (วันฟอกให้หลังฟอก)',800,[800,1600]),CAPD:M('250-800 mg q12-24h',800,[800,1600]),CRRT:M('250-800 mg q8-12h',800,[1600,2400]),hdNote:HDN.hs},src:SRC_RENAL},
{id:'hctz',name:'Hydrochlorothiazide',match:/hydrochlorothiazide|\bhctz\b/i,unit:'mg',warn:[{crcl:30,lvl:'warn',msg:'CrCl<30: ไม่แนะนำ (ประสิทธิภาพลดลง)'}],src:SRC_RENAL},
{id:'spirono',name:'Spironolactone',match:/spironolactone|aldactone/i,unit:'mg',warn:[{crcl:50,lvl:'warn',msg:'CrCl ≤50: ลดเหลือ 50% ของขนาดปกติ/ใช้ด้วยความระวัง — ติดตาม K'}],src:SRC_RENAL},
{id:'amiloride',name:'Amiloride',match:/amiloride|moduretic/i,unit:'mg',warn:[{crcl:10,lvl:'flag',msg:'CrCl<10: ไม่แนะนำ'},{crcl:50,lvl:'warn',msg:'CrCl 10-50: ให้ 50% ของขนาดปกติ'}],src:SRC_RENAL},
{id:'mannitol',name:'Mannitol',match:/mannitol/i,unit:'g',warn:[{mode:'HD',lvl:'flag',msg:'HD: Contraindication'}],src:SRC_RENAL},
{id:'allopurinol',name:'Allopurinol',match:/allopurinol|zyloric/i,unit:'mg',forms:[[/300/,'300 mg',300],[/100/,'100 mg',100]],
 renal:{bands:[B(30,999,'300-400 mg/day (max 900)',900,900),B(10,30,'CrCl 10-20: 200 mg/day',200,200,{warnAlways:'ต้นฉบับระบุเฉพาะ CrCl 10-20 — CrCl 21-29 ใช้ดุลยพินิจ'}),B(0,10,'100 mg/day',100,100)],
  HD:M('100 mg วันเว้นวัน เพิ่มได้ถึง 300 mg/day (วันฟอกให้หลังฟอก)',300,[50,300]),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:M('200 mg/day',200,200)},hdNote:'HD: 100 mg q48h เพิ่มได้ถึง 300 mg/day',src:SRC_RENAL},
{id:'colchicine',name:'Colchicine',match:/colchicine/i,unit:'mg',forms:[[/0\.6/,'0.6 mg',0.6]],
 renal:{bands:[B(30,999,'0.6 mg BID-TID (max 2.4 mg/day)',0.6,2.4),B(0,30,'0.6 mg ครั้งเดียว หลีกเลี่ยงใช้ต่อเนื่อง และหยุดยา ≥14 วันก่อนเริ่มใหม่',0.6,0.6)],
  HD:M('0.6 mg ครั้งเดียว หลีกเลี่ยงใช้ต่อเนื่อง',0.6,0.6),CAPD:M('0.6 mg ครั้งเดียว',0.6,0.6),CRRT:M('0.6 mg ครั้งเดียว',0.6,0.6)},src:SRC_RENAL},
{id:'febux',name:'Febuxostat',match:/febuxostat|feburic/i,unit:'mg',warn:[{crcl:30,lvl:'warn',msg:'CrCl<30: เริ่ม 40 mg และติดตามใกล้ชิด'}],src:SRC_RENAL},

/* ---------------- Anticoagulant ---------------- */
{id:'warfarin',name:'Warfarin',match:/warfarin|orfarin|^\s*w\s*\(?\s*\d/i,unit:'mg',forms:[[/5/,'5 mg',5],[/3/,'3 mg',3],[/2/,'2 mg',2]],special:'warfarin',
 elderly:'Anticoagulant: การกำจัดยาลดลง เสี่ยงเลือดออก — ติดตาม INR และอาการเลือดออก',preg:'Warfarin ห้ามใช้ในหญิงตั้งครรภ์',src:'แนวทาง DI warfarin / ทบทวนคำสั่งใช้ยา IPD'},
{id:'enox',name:'Enoxaparin',match:/enoxaparin|clexane/i,unit:'mg',kgDose:true,forms:[[/60/,'60 mg/0.6 ml',60,'syringe'],[/40/,'40 mg/0.4 ml',40,'syringe']],
 renal:{bands:[B(30,999,'1 mg/kg SC q12h หรือ 1.5 mg/kg OD',1.5,2,{kg:true}),B(15,30,'1 mg/kg SC OD',1,1,{kg:true}),B(0,15,'1 mg/kg SC OD (monitor ใกล้ชิด)',1,1,{kg:true})],
  HD:M('หลีกเลี่ยง ถ้าจำเป็น 1 mg/kg SC OD (monitor ใกล้ชิด)',1,1,{kg:true,warnAlways:'HD: หลีกเลี่ยงการใช้'}),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:M('1 mg/kg SC OD',1,1,{kg:true})},
 note:'กฎนี้สำหรับขนาดรักษา — ขนาดป้องกัน (เช่น 40 mg OD) ไม่อยู่ในคู่มือ',elderly:'Anticoagulant: เสี่ยงเลือดออก ติดตามอาการ',src:SRC_RENAL},
{id:'riva',name:'Rivaroxaban (AF)',match:/rivaroxaban|xarelto/i,unit:'mg',forms:[[/20/,'20 mg',20],[/15/,'15 mg',15],[/10/,'10 mg',10]],
 renal:{bands:[B(50,999,'20 mg OD พร้อมอาหารเย็น',20,20),B(15,50,'15 mg OD',15,15),B(0,15,'หลีกเลี่ยง',null,null,{avoid:true})],HD:{txt:'หลีกเลี่ยง',avoid:true},CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:M('15 mg OD',15,15)},
 verify:'ตารางต้นฉบับมีค่าไม่ครบทุกช่อง — ช่วง 15-29 ต้นฉบับอาจระบุ Avoid',src:SRC_RENAL},
{id:'dabi',name:'Dabigatran (AF)',match:/dabigatran|pradaxa/i,unit:'mg',forms:[[/110/,'110 mg',110],[/150/,'150 mg',150]],
 renal:{bands:[B(30,999,'110 mg BID',150,300),B(0,30,'หลีกเลี่ยง',null,null,{avoid:true})],HD:{txt:'หลีกเลี่ยง',avoid:true},CAPD:{txt:'หลีกเลี่ยง',avoid:true},CRRT:{txt:'หลีกเลี่ยง',avoid:true}},elderly:'Anticoagulant: เสี่ยงเลือดออก',src:SRC_RENAL},
{id:'apixaban',name:'Apixaban (AF)',match:/apixaban|eliquis/i,unit:'mg',forms:[[/5/,'5 mg',5],[/2\.5/,'2.5 mg',2.5]],special:'apixaban',elderly:'Anticoagulant: เสี่ยงเลือดออก',src:SRC_RENAL},

/* ---------------- Analgesic / misc ---------------- */
{id:'para',name:'Paracetamol',match:/paracetamol|acetaminophen|tylenol|sara\b/i,unit:'mg',forms:[[/120\s*mg\s*\/\s*5|syr/i,'120 mg/5 ml',24,'ml'],[/250\s*mg\s*\/\s*5/i,'250 mg/5 ml',50,'ml'],[/500/,'500 mg tab',500],[/325/,'325 mg tab',325]],
 adult:{d:1000,t:4000,txt:'500-1,000 mg q4-6h (max 4 g/day)'},peds:{type:'dose',kg:[10,15],note:'10-15 mg/kg/dose q4-6h',src:SRC_PED},src:SRC_PED},
{id:'ibu',name:'Ibuprofen',match:/ibuprofen|brufen/i,cls:'nsaid',unit:'mg',forms:[[/100\s*mg\s*\/\s*5|syr|susp/i,'100 mg/5 ml',20,'ml'],[/400/,'400 mg',400],[/200/,'200 mg',200]],
 adult:{d:800,t:3200,txt:'200-800 mg q6-8h'},peds:{type:'dose',kg:[5,10],maxKgDay:40,note:'5-10 mg/kg/dose q6-8h (max 40 mg/kg/day)',src:SRC_PED},warn:[{crcl:30,lvl:'warn',msg:'NSAID ในผู้ป่วย CrCl<30 — พิจารณาความเสี่ยงต่อไต'}],src:SRC_PED},
{id:'naproxen',name:'Naproxen',match:/naproxen/i,cls:'nsaid',unit:'mg',forms:[[/250/,'250 mg',250],[/500/,'500 mg',500]],adult:{d:500,t:1000,txt:'250-500 mg BID'},warn:[{crcl:30,lvl:'warn',msg:'NSAID ในผู้ป่วย CrCl<30 — พิจารณาความเสี่ยงต่อไต'}],src:'—'},
{id:'diclofenac',name:'Diclofenac',match:/diclofenac|voltaren/i,cls:'nsaid',unit:'mg',warn:[{crcl:30,lvl:'warn',msg:'NSAID ในผู้ป่วย CrCl<30 — พิจารณาความเสี่ยงต่อไต'}],src:'—'},
{id:'omepo',name:'Omeprazole',match:/omeprazole|losec/i,cls:'ppi',unit:'mg',forms:[[/40/,'40 mg inj',40,'vial'],[/20/,'20 mg cap',20]],adult:{d:80,t:160,txt:'20-40 mg OD-BID (GI bleed IV ตาม protocol)'},src:'—'},
{id:'domperidone',name:'Domperidone',match:/domperidone|motilium/i,unit:'mg',forms:[[/5\s*mg\s*\/\s*5|syr|susp/i,'5 mg/5 ml',1,'ml'],[/10/,'10 mg tab',10]],adult:{d:10,t:30,txt:'10 mg TID'},peds:{type:'dose',kg:[0.2,0.25],note:'0.25 mg/kg/dose q8h',src:SRC_PED},src:SRC_PED},
{id:'cpm',name:'Chlorpheniramine',match:/chlorphen|\bcpm\b/i,unit:'mg',forms:[[/2\s*mg\s*\/\s*5|syr/i,'2 mg/5 ml',0.4,'ml'],[/4/,'4 mg tab',4],[/10/,'10 mg inj',10,'amp']],adult:{d:10,t:24,txt:'4 mg q4-6h (max 24 mg/day)'},
 peds:{type:'day',kg:[0.3,0.35],kgHi:1,max:12,note:'0.35 mg/kg/day q4-6h; urticaria 1 mg/kg/day (max 12 mg/day)',src:SRC_PED},elderly:'Anticholinergic: ปัสสาวะขัด ท้องผูก สับสน — ระวังอายุ >75 ใช้ loratadine แทน',src:SRC_PED},


/* ---------------- v0.3: ยาที่เกิด PE บ่อย ---------------- */
{id:'aspirin',name:'Aspirin',match:/aspirin|\basa\b|aspent/i,cls:'antiplatelet',unit:'mg',forms:[[/81/,'81 mg tab',81],[/300|325/,'300 mg tab',300]],
 adult:{d:650,t:4000,txt:'ACS 81-325 mg/day · ป้องกัน 75-162 mg/day · แก้ปวด/ลดไข้ 325-650 mg q4h'},
 warn:[{mode:'HD',lvl:'info',msg:'HD: วันฟอกให้ยาหลังฟอก'},{mode:'CAPD',lvl:'info',msg:'CAPD: ไม่ต้องปรับขนาด'},{crcl:10,lvl:'flag',msg:'CrCl <10: หลีกเลี่ยงการใช้ (คู่มือไต)'}],src:SRC_RENAL},
{id:'clopidogrel',name:'Clopidogrel',match:/clopidogrel|plavix|apolets/i,cls:'antiplatelet',unit:'mg',forms:[[/75/,'75 mg tab',75]],adult:{d:600,t:600,txt:'LD 300-600 mg แล้ว 75 mg/day ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'ticagrelor',name:'Ticagrelor',match:/ticagrelor|brilinta/i,cls:'antiplatelet',unit:'mg',forms:[[/90/,'90 mg tab',90]],adult:{d:180,t:270,txt:'LD 180 mg แล้ว 90 mg BID ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'cilostazol',name:'Cilostazol',match:/cilostazol|pletaal/i,unit:'mg',forms:[[/100/,'100 mg tab',100],[/50/,'50 mg',50]],adult:{d:100,t:200,txt:'100 mg q12h (ac หรือ pc 2 ชม.) ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'hydralazine',name:'Hydralazine',match:/hydralazine|apresoline/i,unit:'mg',forms:[[/50/,'50 mg tab',50],[/25/,'25 mg tab',25],[/20\s*mg|inj/i,'20 mg inj',20,'amp']],adult:{d:100,t:300,txt:'25-50 mg q8h (max 300 mg/day) ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'propranolol',name:'Propranolol',match:/propranolol|inderal/i,cls:'bb',unit:'mg',forms:[[/40/,'40 mg',40],[/10/,'10 mg tab',10]],adult:{d:160,t:320,txt:'80-160 mg BID (max 320 mg/day) ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'doxy',name:'Doxycycline',match:/doxycycline|vibramycin/i,unit:'mg',forms:[[/100/,'100 mg cap',100]],adult:{d:200,t:200,txt:'100 mg q12h ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'nystatin',name:'Nystatin suspension',match:/nystatin/i,unit:'unit',forms:[[/./,'100,000 unit/ml',100000,'ml']],adult:{d:600000,t:2400000,txt:'500,000 unit (5 ml) วันละ 4 ครั้ง ไม่ต้องปรับตามไต'},src:SRC_RENAL},
{id:'dtg',name:'Dolutegravir (DTG 50)',match:/dolutegravir|\bdtg\b/i,unit:'mg',forms:[[/10|dispers/i,'10 mg dispersible',10],[/50/,'50 mg tab',50]],special:'dtg',
 adult:{d:50,t:100,txt:'50 mg q24h (ใช้ร่วม Rifampicin/Phenytoin/EFV: 50 mg q12h)'},src:SRC_ARV},
{id:'glipizide',name:'Glipizide',match:/glipizide|minidiab/i,unit:'mg',forms:[[/5/,'5 mg tab',5]],adult:{d:20,t:40,txt:'2.5-20 mg/ครั้ง (max 40 mg/day; >15 mg/day ให้แบ่ง)'},
 elderly:'Sulfonylurea: เสี่ยงน้ำตาลต่ำ เริ่มขนาดต่ำ',verify:'ไม่มีในเอกสารที่ส่งมา — ร่างตามฉลาก FDA รอยืนยัน',src:'ร่างกฎ (FDA label) รอยืนยัน'},
{id:'alfuzosin',name:'Alfuzosin',match:/alfuzosin|xatral/i,unit:'mg',forms:[[/10/,'10 mg tab',10]],adult:{d:10,t:10,txt:'10 mg OD หลังอาหาร (ห้ามหัก/บด)'},
 warn:[{crcl:30,lvl:'warn',msg:'CrCl <30: ใช้ด้วยความระวัง'}],elderly:'Alpha-blocker: เสี่ยง orthostatic hypotension',verify:'ไม่มีในเอกสารที่ส่งมา — ร่างตามฉลาก รอยืนยัน',src:'ร่างกฎ (ฉลาก) รอยืนยัน'},
{id:'gabapentin',name:'Gabapentin',match:/gabapentin|neurontin/i,unit:'mg',forms:[[/600/,'600 mg',600],[/300/,'300 mg cap',300],[/100/,'100 mg cap',100]],
 renal:{bands:[B(60,999,'900-3,600 mg/day แบ่ง TID',1200,3600),B(30,60,'400-1,400 mg/day แบ่ง BID',700,1400),B(15,30,'200-700 mg/day OD',700,700),B(0,15,'100-300 mg/day OD',300,300)],
  HD:M('ขนาดตาม CrCl (100-300 mg/day) + เสริม 125-350 mg หลังฟอก',350,[300,650]),CAPD:{txt:'ไม่มีข้อมูล',nodata:true},CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},
 verify:'ไม่มีในเอกสารที่ส่งมา — ร่างตามฉลาก FDA รอยืนยัน',src:'ร่างกฎ (FDA label) รอยืนยัน'},
{id:'tramadol',name:'Tramadol',match:/tramadol|tramol/i,unit:'mg',forms:[[/50/,'50 mg cap',50],[/100/,'100 mg inj',100,'amp']],
 renal:{bands:[B(30,999,'50-100 mg q4-6h (max 400 mg/day)',100,400),B(0,30,'50-100 mg q12h (max 200 mg/day)',100,200)],HD:M('50-100 mg q12h (max 200 mg/day) ให้หลังฟอก',100,200),CAPD:M('50-100 mg q12h (max 200 mg/day)',100,200),CRRT:{txt:'ไม่มีข้อมูล',nodata:true}},
 elderly:'อายุ >75 ปี: max 300 mg/day — เสี่ยงซึม/ชัก',verify:'ไม่มีในเอกสารที่ส่งมา — ร่างตามฉลาก FDA รอยืนยัน',src:'ร่างกฎ (FDA label) รอยืนยัน'},
/* inhalers: ตรวจจำนวนสูด + ซ้ำซ้อนกลุ่ม ICS/LABA/LAMA */
{id:'seretideacc',name:'Seretide Accuhaler (ICS/LABA)',match:/seretide\s*accu|seretide.*\(50\/(100|250|500)\)/i,comp:['ics','laba'],unit:'สูด',forms:[[/./,'1 สูด',1,'puff']],adult:{d:1,t:2,txt:'1 สูด วันละ 2 ครั้ง'},src:'ฉลากยา'},
{id:'seretideevo',name:'Seretide Evohaler (ICS/LABA)',match:/seretide\s*evo|seretide.*\(25\/(50|125|250)\)/i,comp:['ics','laba'],unit:'กด',forms:[[/./,'1 กด',1,'puff']],adult:{d:2,t:4,txt:'2 กด วันละ 2 ครั้ง'},src:'ฉลากยา'},
{id:'symbicort',name:'Symbicort (ICS/LABA)',match:/symbicort|budesonide.{0,4}formoterol/i,comp:['ics','laba'],unit:'สูด',forms:[[/./,'1 สูด',1,'puff']],adult:{d:2,t:8,txt:'1-2 สูด วันละ 2 ครั้ง (SMART เพิ่มได้ รวมไม่เกิน 8 สูด/วันโดยปกติ)'},src:'ฉลากยา'},
{id:'spiolto',name:'Spiolto Respimat (LAMA/LABA)',match:/spiolto/i,comp:['lama','laba'],unit:'กด',forms:[[/./,'1 กด',1,'puff']],adult:{d:2,t:2,txt:'2 กด วันละครั้ง'},src:'ฉลากยา'},
{id:'anoro',name:'Anoro Ellipta (LAMA/LABA)',match:/anoro/i,comp:['lama','laba'],unit:'สูด',forms:[[/./,'1 สูด',1,'puff']],adult:{d:1,t:1,txt:'1 สูด วันละครั้ง'},note:'ชนิดผงต้องสูดแรงพอ — ผู้ป่วยหอบมาก/ไม่มีแรงสูดควรเลือกรูปแบบอื่น',src:'ฉลากยา / ข้อมูล NON-PE ห้องยา'},
{id:'tiotropium',name:'Tiotropium (Spiriva, LAMA)',match:/tiotropium|spiriva/i,comp:['lama'],unit:'dose',forms:[[/./,'1 dose',1,'puff']],adult:{d:2,t:2,txt:'HandiHaler 1 cap OD / Respimat 2 กด OD'},src:'ฉลากยา'},
{id:'berodual',name:'Berodual (SABA/SAMA)',match:/berodual|ipratropium/i,comp:['saba','sama'],unit:'กด',forms:[[/./,'1 กด',1,'puff']],src:'ฉลากยา'},
/* ยาที่มีประจุ 2+ — ใช้ตรวจคู่กับ DTG */
{id:'calcarb',name:'Calcium carbonate (Chalk)',match:/chalk|calcium\s*carb|caco3/i,cls:'cation',unit:'mg',src:SRC_ARV},
{id:'triferdine',name:'Triferdine (Fe 60.81 mg + Folic 0.4 mg + Iodine 150 mcg)',match:/triferdine/i,special:'tri',cls:'cation',unit:'mg Fe',noMasterStrength:true,
 forms:[[/./,'1 เม็ด = Ferrous fumarate 185 mg (Fe 60.81 mg)',60.81]],
 adult:{d:61,t:61,warnOnly:true,txt:'ฉลาก: วันละ 1 เม็ด (ป้องกันขาดไอโอดีน เหล็ก โฟลิก ในหญิงตั้งครรภ์/ให้นมบุตร) — ถ้าใช้รักษาภาวะขาดเหล็ก ยืนยันขนาดกับแพทย์'},
 peds:{type:'day',kg:[1,6],kgHi:6,zones:[[0,2.5,'ขนาดป้องกัน'],[2.5,99,'ขนาดรักษา']],max:130,note:'ไม่ใช่สูตรสำหรับเด็ก (มีไอโอดีน/โฟลิก) — พิจารณาใช้ Ferdek drop หรือ Ferrous fumarate แทน',src:'ฉลาก Triferdine'},
 note:'ยาบำรุงครรภ์: Fe 60.81 mg (ferrous fumarate 185 mg) + Folic acid 0.4 mg + Iodine 0.15 mg ต่อเม็ด',src:'ฉลากยา Triferdine'},
{id:'ferrous',name:'Ferrous (คิดเป็น elemental iron)',match:/ferrous|ferro|ferdek|ferdex|\bfbc\b|iron\b/i,cls:'cation',unit:'mg Fe',noMasterStrength:true,
 forms:[[/drop|ferdek|ferdex|0\.6/i,'Ferdek drop 45 mg/0.6 ml (Fe 15 mg/0.6 ml = 25 mg/ml)',25,'ml'],[/200/,'Ferrous fumarate 200 mg tab (Fe ≈65 mg)',65]],
 peds:{type:'day',kg:[1,6],kgHi:6,zones:[[0,2.5,'ขนาดป้องกัน (1-2 mg Fe/kg/วัน, max 65 mg)'],[2.5,99,'ขนาดรักษา (3-6 mg Fe/kg/วัน นาน 3 เดือน)']],max:130,note:'รักษาภาวะโลหิตจางจากขาดเหล็ก 3-6 mg Fe/kg/วัน แบ่ง 1-2 ครั้ง นาน 3 เดือน (ป้องกัน 1-2 mg/kg/วัน max 65 mg) · 6-12 ปี รักษา 65 mg BID (max 130 mg/วัน)',src:'MSF Essential Drugs (รอเทียบ DIH)'},
 note:'คิดขนาดเป็นธาตุเหล็ก (elemental) — ขนาดพิษ 20 mg Fe/kg',verify:'ขนาดยาเด็กจาก MSF/แหล่งเปิด — รอ DIS เทียบ Drug Information Handbook',src:'MSF Essential Drugs / MIMS (Ferdek)'},
{id:'vitd3',name:'Vitamin D3 (cholecalciferol) — "Vit D" ที่ไม่ระบุชนิด = D3',match:/vit(amin)?\.?\s*d3|cholecalciferol|vit(amin)?\.?\s*d(?![2a-z0-9])/i,unit:'IU',noMasterStrength:true,forms:[[/./,'800 IU/ml drop',800,'ml']],
 peds:{type:'age',note:'ป้องกัน <1 ปี 400 IU/วัน, ≥1 ปี 600 IU/วัน · รักษา (≥12 สัปดาห์): <1 ปี 2,000, 1-12 ปี 3,000-6,000, >12 ปี 6,000 IU/วัน + Ca 500 mg/วัน',src:'Global Consensus Nutritional Rickets 2016'},
 verify:'ขนาดยาเด็กจาก Global Consensus 2016 — รอ DIS เทียบ DIH',src:'Global Consensus Nutritional Rickets 2016 (รอเทียบ DIH)'},
{id:'vitd2',name:'Vitamin D2 (ergocalciferol) 20,000 IU',match:/vit(amin)?\.?\s*d2|ergocalciferol/i,unit:'IU',noMasterStrength:true,forms:[[/./,'20,000 IU cap',20000]],
 adult:{d:100000,t:100000,txt:'ผู้ใหญ่: ไม่ตรวจขนาด (หน้างานพบปัญหาน้อย)'},
 peds:{type:'age',note:'D2 เทียบเท่า D3 เมื่อให้ทุกวัน · 20,000 IU สัปดาห์ละครั้ง ≈ 2,860 IU/วัน',src:'Global Consensus Nutritional Rickets 2016'},
 verify:'ขนาดยาเด็กจาก Global Consensus 2016 — รอ DIS เทียบ DIH',src:'Global Consensus Nutritional Rickets 2016 (รอเทียบ DIH)'},
{id:'vite',name:'Vitamin E (tocopherol)',match:/vit(amin)?\.?\s*e\b|tocopher/i,unit:'IU',noMasterStrength:true,forms:[[/./,'50 IU/ml drop',50,'ml']],special:'vite',
 peds:{type:'day',kg:[0.6,2],kgHi:12,note:'ภาวะขาด (malabsorption) 1 unit/kg/วัน · ทารกคลอดก่อนกำหนด <1 kg 6-12 unit/kg/วัน · cholestasis ใช้ขนาดสูงกว่าตามแพทย์เฉพาะทาง',src:'AHFS (Drugs.com) / UK SmPC'},
 verify:'ขนาดยาเด็กจาก AHFS/UK SmPC — รอ DIS เทียบ DIH',src:'AHFS / UK SmPC (รอเทียบ DIH)'},
{id:'antacid',name:'Antacid (Al/Mg)',match:/antacid|alum.*milk|aluminium|alumina|magnesium\s*hydrox/i,cls:'cation',unit:'ml',src:SRC_ARV},
{id:'zinc',name:'Zinc',match:/\bzinc\b/i,cls:'cation',unit:'mg',src:SRC_ARV},
/* ---------------- Elderly / special flags only ---------------- */
{id:'diazepam',name:'Diazepam',match:/diazepam|valium/i,unit:'mg',elderly:'Long-acting BZD ห้ามใช้ใน ≥65 ปี ตามแนวทาง IPD: เสี่ยงหกล้ม/สับสน — ใช้ lorazepam แทน',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'chlordiaz',name:'Chlordiazepoxide',match:/chlordiazepoxide|librax/i,unit:'mg',elderly:'Long-acting BZD ห้ามใช้ใน ≥65 ปี ตามแนวทาง IPD',src:'ทบทวนคำสั่งใช้ยา IPD'},
{id:'clonazepam',name:'Clonazepam',match:/clonazepam|rivotril/i,unit:'mg',elderly:'Long-acting BZD: เสี่ยงหกล้ม — ลดขนาดช้าๆ ใช้ยาค่าครึ่งชีวิตสั้นแทน',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'amitrip',name:'Amitriptyline',match:/amitriptyline|tryptanol/i,unit:'mg',elderly:'TCA: ฤทธิ์ anticholinergic สูง — ลดขนาด/กินก่อนนอน หรือใช้ SSRI/SNRI',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'phenobarb',name:'Phenobarbital',match:/phenobarb/i,unit:'mg',elderly:'Barbiturate: เสี่ยงติดยา หกล้ม และ DI (CYP inducer)',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'pethidine',name:'Pethidine',match:/pethidine|meperidine/i,unit:'mg',elderly:'Pethidine: ซึม สับสน metabolite ทำให้ชัก — ใช้ morphine/fentanyl แทน',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'hydroxyzine',name:'Hydroxyzine',match:/hydroxyzine|atarax/i,unit:'mg',elderly:'Anticholinergic: ระวังอายุ >75 ปี',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'doxazosin',name:'Doxazosin',match:/doxazosin|cardura/i,unit:'mg',adult:{d:16,t:16,txt:'1-16 mg OD'},elderly:'Doxazosin: เสี่ยง orthostatic hypotension',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'flunarizine',name:'Flunarizine',match:/flunarizine|sibelium/i,unit:'mg',elderly:'Flunarizine: กด CNS เพิ่ม parkinsonism/หกล้ม — ใช้ขนาดต่ำสุด หยุดเมื่อหมดข้อบ่งใช้',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'digoxin',name:'Digoxin',match:/digoxin|lanoxin/i,unit:'mg',special:'digoxin',elderly:'Narrow therapeutic index: ติดตามระดับยาและอาการพิษ',src:SRC_HAD},
{id:'phenytoin',name:'Phenytoin',match:/phenytoin|dilantin/i,unit:'mg',elderly:'Narrow therapeutic index: ติดตามระดับยา',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},
{id:'theoph',name:'Theophylline',match:/theophylline|theo-?dur/i,unit:'mg',elderly:'Narrow therapeutic index: ติดตามระดับยา',src:'แนวทางเฝ้าระวังยาผู้สูงอายุ'},

/* ---------------- HAD / antidotes (ชี้ไปแท็บคำนวณ) ---------------- */
{id:'kcl',name:'Potassium chloride inj',match:/pot.*chloride|\bkcl\b/i,unit:'mEq',special:'kcl',src:SRC_HAD},
{id:'mgso4',name:'Magnesium sulfate inj',match:/magnesium sulf|mgso4/i,unit:'g',special:'mgso4',src:SRC_HAD},
{id:'ne',name:'Norepinephrine',match:/norepinephrine|levophed|norpin/i,unit:'mg',special:'had',src:SRC_HAD},
{id:'adr',name:'Adrenaline',match:/adrenaline|epinephrine/i,unit:'mg',special:'had',src:SRC_HAD},
{id:'dopa',name:'Dopamine',match:/dopamine/i,unit:'mg',special:'had',src:SRC_HAD},
{id:'dobu',name:'Dobutamine',match:/dobutamine|dobutex/i,unit:'mg',special:'had',src:SRC_HAD},
{id:'nica',name:'Nicardipine inj',match:/nicardipine|cardepine/i,unit:'mg',special:'had',src:SRC_HAD},
{id:'fenta',name:'Fentanyl inj',match:/fentanyl(?!.*(tts|patch|แผ่น|transdermal|durogesic))/i,unit:'mcg',special:'had',src:SRC_HAD},
{id:'heparin',name:'Heparin',match:/heparin/i,unit:'unit',special:'had',src:SRC_HAD},
{id:'naloxone',name:'Naloxone',match:/naloxone/i,unit:'mg',special:'antidote',note:'ผู้ใหญ่ non-dependence 0.4-2 mg IV ซ้ำทุก 2-3 นาที / dependence 0.1-0.2 mg; เด็ก 0.01 mg/kg (max 2 mg/dose)',src:'ยาต้านพิษ DIS 2564'},
{id:'benztropine',name:'Benztropine',match:/benztropine|bentropine|cogentin/i,unit:'mg',special:'antidote',note:'ผู้ใหญ่ 1-2 mg IV; เด็ก >3 ปี 0.02 mg/kg IV (max 1 mg)',src:'ยาต้านพิษ DIS 2564'},
{id:'protamine',name:'Protamine',match:/protamine/i,unit:'mg',special:'antidote',note:'1 mg ต่อ heparin 100 unit หรือ enoxaparin 1 mg (max 50 mg/dose)',src:'ยาต้านพิษ DIS 2564'},
{id:'nac',name:'N-Acetylcysteine IV',match:/acetylcysteine.*(inj|\biv\b)|\bnac\b.*(inj|\biv\b)|fluimucil.*inj/i,unit:'mg',special:'antidote',note:'IV ≥40 kg: 150 mg/kg/1h → 50 mg/kg/4h → 100 mg/kg/16h (ใช้น้ำหนักจริงไม่เกิน 110 kg)',src:'ยาต้านพิษ DIS 2564'}
];

/* คู่ยาซ้ำซ้อนตามเกณฑ์ รพ. */
const DUP_PAIRS=[
 ['carbapenem','metro','Carbapenem + Metronidazole ซ้ำซ้อน (ยกเว้นรักษา AAC) — confirm แพทย์'],
 ['blbi','metro','BLBI + Metronidazole ซ้ำซ้อน (ยกเว้นรักษา AAC) — confirm แพทย์'],
 ['carbapenem','clinda','Carbapenem + Clindamycin ซ้ำซ้อน — confirm แพทย์'],
 ['blbi','clinda','BLBI + Clindamycin ซ้ำซ้อน — confirm แพทย์'],
 ['acei','arb','ACEI + ARB ร่วมกัน — เสี่ยงไตเสื่อม/K สูง ยืนยันความจำเป็น']
];
const DUP_SPECIAL=[[ 'tazocin','aminoglycoside','Tazocin + Aminoglycoside — confirm ความจำเป็น (เกณฑ์ ATB ซ้ำซ้อน รพ.)'],
 ['dtg','cation','DTG + ยาที่มีประจุ 2+ (Ca, Fe, Zn, antacid) — ให้ห่างกันอย่างน้อย 6 ชม.'],['tld','cation','TLD (มี DTG) + ยาที่มีประจุ 2+ — ให้ห่างกันอย่างน้อย 6 ชม.'],['kocitaf','cation','Kocitaf (มี DTG) + ยาที่มีประจุ 2+ — ให้ห่างกันอย่างน้อย 6 ชม.']];
const COMP_NAME={ics:'ICS',laba:'LABA',lama:'LAMA',saba:'SABA',sama:'SAMA'};
const ATB_IDS=['amoxi','augiv','augpo','ampi','unasyn','tazocin','cefazolin','cefixime','cefdinir','cefotaxime','ceftazavi','ceftaz','cephalexin','ertapenem','imipenem','meropenem','clari','metro','amikacin','genta','ciproiv','cipro','levo','norflox','oflox','sitaflox','colistin','cotrim','vanco','acyiv','acypo','oseltamivir','ganciclovir','fluconazole'];
const CLS_NAME={carbapenem:'Carbapenem',blbi:'BLBI',aminoglycoside:'Aminoglycoside',quinolone:'Quinolone',statin:'Statin',acei:'ACEI',arb:'ARB',ccb:'CCB (DHP)',bb:'Beta-blocker',nsaid:'NSAID',ppi:'PPI',metro:'Metronidazole',clinda:'Clindamycin'};

/* HAD calculator profiles */
const HAD={
 ne:{name:'Norepinephrine',amp:4,ampTxt:'4 mg/4 ml',u:'mg',dose:'mcgkgmin',range:[0.04,0.6],max:2,maxDay:68,periph:0.016,maxConc:0.08,dil:'D5W เท่านั้น (ห้าม NSS, Sod. bicarb)',ne:true},
 adr:{name:'Adrenaline',amp:1,ampTxt:'1 mg/1 ml',u:'mg',dose:'mcgkgmin',range:[0.05,1],max:1,periph:0.1,maxConc:0.1,dil:'',note:'1:10 = ยา 10 amp ในน้ำ 100 ml (0.1 mg/ml) จ่ายยา 10 amp ต่อสารน้ำ 100 ml ปัดเป็นทวีคูณของ 10',tenth:true},
 dopa:{name:'Dopamine',amp:250,ampTxt:'250 mg/10 ml',u:'mg',dose:'mcgkgmin',range:[2,20],max:50,periph:2,maxConc:3.2,dil:''},
 dobu:{name:'Dobutamine',amp:250,ampTxt:'250 mg/amp',u:'mg',dose:'mcgkgmin',range:[2,15],max:40,periph:2,maxConc:5,dil:''},
 nica:{name:'Nicardipine',amp:2,ampTxt:'2 mg/2 ml (ตามคู่มือ)',u:'mg',dose:'mgh',range:[3,15],max:15,dil:'',note:'เริ่ม 3-5 mg/h เพิ่มครั้งละ 0.5-1 mg ทุก 15 นาที max 15 mg/h'},
 fenta:{name:'Fentanyl',amp:100,ampTxt:'100 mcg/2 ml',u:'mcg',dose:'mcgh',dil:'',note:'ใบ ยส.5 เบิกได้สูงสุด 30 amp/ใบ — ไม่ใช้ตารางสารน้ำ',rangeKgH:[0.7,10],maxConcMcg:50},
 kcl:{name:'Potassium chloride',amp:20,ampTxt:'20 mEq/amp',u:'mEq',dose:'meqh',dil:'ห้าม IV push / IM'},
 mg:{name:'Magnesium sulfate',amp:1,ampTxt:'1 g/amp',u:'g',dose:'gh',max:4,maxDay:40,maxConc:200,dil:''},
 hep:{name:'Heparin',amp:25000,ampTxt:'25,000 unit/5 ml',u:'unit',dose:'uh',max:2000,maxDay:48000,dil:'ผสมให้ได้ 100 unit/ml'}
};
/* ค่ามาตรฐานที่แสดงในสรุป HAD — null = ยังไม่มีข้อมูล (เติมได้ทีละข้อ) · ⚑ = อ้างอิงทั่วไป ยังไม่ใช่คู่มือ รพ. */
const HAD_STD={
 ne:{usual:'0.04–0.6 mcg/kg/min',maxDose:'2 mcg/kg/min · ≤68 mg/วัน',maxConc:'peripheral ≤0.016 mg/ml · central ≤0.08 mg/ml',src:SRC_HAD},
 adr:{usual:'0.05–1 mcg/kg/min',maxDose:'1 mcg/kg/min',maxConc:'≤0.1 mg/ml',src:SRC_HAD},
 dopa:{usual:'2–20 mcg/kg/min',maxDose:'50 mcg/kg/min',maxConc:'peripheral ≤2 mg/ml · central ≤3.2 mg/ml',src:SRC_HAD},
 dobu:{usual:'2–15 mcg/kg/min',maxDose:'40 mcg/kg/min',maxConc:'peripheral ≤2 mg/ml · central ≤5 mg/ml',src:SRC_HAD},
 nica:{usual:'เริ่ม 3–5 mg/h เพิ่มครั้งละ 0.5–1 mg/h ทุก 15 นาที',maxDose:'15 mg/h',maxConc:null,src:SRC_HAD},
 fenta:{usual:'0.7–10 mcg/kg/h (continuous infusion ICU analgesia/sedation) ⚑',maxDose:null,maxConc:'50 mcg/ml (ยาไม่เจือจาง) ⚑',src:'⚑ อ้างอิงทั่วไป (SCCM PADIS / Lexicomp) — รอคู่มือ HAD รพ.'},
 kcl:{usual:'ตามระดับ K และข้อบ่งใช้',maxDose:'peripheral ≤10 mEq/h · central ≤40 mEq/h',maxConc:'peripheral ≤80 mEq/L · central ≤150 mEq/L · fluid restrict ≤200 mEq/L',src:'ป้าย KCl รพ.'},
 mg:{usual:'ตามข้อบ่งใช้',maxDose:'4 g/h · 40 g/วัน',maxConc:'200 mg/ml',src:SRC_HAD},
 hep:{usual:'ตามข้อบ่งใช้ (ตาราง bolus/infusion ในแท็บคำนวณ HAD)',maxDose:'2,000 unit/h · 48,000 unit/วัน',maxConc:'ผสม 100 unit/ml',src:SRC_HAD}
};
const HADKEY={ne:'ne',adr:'adr',dopa:'dopa',dobu:'dobu',heparin:'hep',kcl:'kcl',mgso4:'mg',nica:'nica',fenta:'fenta'};
const HEP_IND=[['Acute MI with fibrinolytic',60,4000,12,1000],['ACS, mechanical valve',70,5000,15,1200],['PE & ventricular/atrial thrombus',80,10000,18,1800],['Peripheral arterial embolism / DVT',80,5000,18,1000]];
const BOTTLE=[[8,100,2],[10,250,1],[16,250,2],[21,500,1],[31,250,3],[45,500,2],[60,500,3]];

/* ---------- Warfarin DI: ทะเบียนคู่ยา DI รพ.มหาสารคาม (DI Warfarin Consult&Monitor for IPD V1.2) ---------- */
const SRC_WDI='ทะเบียนคู่ยา DI Warfarin รพ.มหาสารคาม (Consult&Monitor IPD V1.2)';
const WDI_SHORT='INR baseline ไม่เกิน 1 สัปดาห์ · ขอ target INR · INR ทุก 3 วันหลังเริ่มใช้ร่วม · INR ซ้ำ Day 5 หลังหยุด';
const WARF_DI=[
 {re:/itracon|sporal/i,name:'Itraconazole',form:'short',eff:'major · ↑INR (2-5 วัน)',mg:'ควรหลีกเลี่ยงการใช้ร่วมกัน · ถ้าจำเป็น: INR สูงขึ้นพิจารณาลด warfarin หรือหยุด antifungal'},
 {re:/flucon|diflucan/i,name:'Fluconazole',form:'short',eff:'major · ↑INR (2-3 วัน)',mg:'INR สูงขึ้นพิจารณาลด warfarin หรือหยุด antifungal · ผู้ป่วยโรคไตพิจารณาลด warfarin 25-30%'},
 {re:/azithro|roxithro|clarithro|erythromy|zithromax|klacid/i,name:'Macrolide',form:'short',eff:'major · ↑INR เสี่ยงเลือดออก (3-5 วัน)',mg:'ควรหลีกเลี่ยง โดยเฉพาะ erythromycin/clarithromycin (รุนแรง erythro > clarithro > azithro > roxi) · ถ้าจำเป็นใช้ azithro/roxi'},
 {re:/ciproflox|norflox|oflox|levoflox|cravit/i,name:'Fluoroquinolone',form:'short',eff:'major · ↑INR เสี่ยงเลือดออก (3-5 วัน)',mg:'ควรหลีกเลี่ยง พิจารณา ATB กลุ่มอื่น (รุนแรง cipro > norflox > oflox > levo)'},
 {re:/metronid|flagyl/i,name:'Metronidazole',form:'short',eff:'major · ↑ฤทธิ์ warfarin เสี่ยงเลือดออก (3-5 วัน)',mg:'ควรหลีกเลี่ยงถ้าเป็นไปได้'},
 {re:/co-?trimox|bactrim|sulfameth|smx|tmp\s*\/\s*smx/i,name:'Co-trimoxazole',form:'short',eff:'major · ↑INR (2-5 วัน)',mg:'รุนแรงมาก · พิจารณาลด warfarin 25-40%'},
 {re:/celecox|celebrex|etoricox|etolicox|arcoxia/i,name:'COX-2 inhibitor',form:'short',eff:'moderate · ↑ฤทธิ์ warfarin เสี่ยงเลือดออก (โดยเฉพาะผู้สูงอายุ)',mg:'ใช้ร่วมได้ไม่เกิน 3 วัน · เกิน 3 วัน INR ทุก 3 วัน · INR >2.5 พิจารณาเปลี่ยนเป็นยาที่ไม่ใช่ NSAID หรือลด warfarin 10-15%',mon:'INR baseline · ถ้าใช้ร่วมเกิน 3 วัน INR ทุก 3 วัน'},
 {re:/amiodar|cordarone/i,name:'Amiodarone',form:'long',eff:'major · ↑INR moderate-severe (3-7 วัน)',mg:'ลด warfarin 25-50% ตามขนาด amiodarone (IV loading อาจรุนแรงกว่า PO) ค่อยๆ ปรับภายใน 12 สัปดาห์',mon:'INR ทุก 1-2 สัปดาห์ช่วง 6-8 สัปดาห์แรก · หลังปรับขนาดติดตามภายใน 3-7 วัน'},
 {re:/fluoxet|prozac/i,name:'Fluoxetine',form:'long',eff:'moderate · ↑ฤทธิ์ warfarin',mg:'พิจารณาลด warfarin',mon:'ติดตามอาการเลือดออก PT/INR ใกล้ชิด'},
 {re:/valpro|depakin/i,name:'Valproic acid',form:'long',eff:'major · ↑INR ↑เสี่ยงเลือดออก (3-5 วัน)',mg:'ปรับขนาด warfarin ตาม INR',mon:'INR ภายใน 3 วันหลังเริ่มใช้ร่วม'},
 {re:/phenytoin|dilantin/i,name:'Phenytoin',form:'long',eff:'moderate · ช่วงแรก ↑เลือดออก ระยะยาว ↓INR',mg:'ปรับ warfarin ตาม INR',mon:'INR ภายใน 1 สัปดาห์หลังเริ่ม · ต่อมา INR อาจลด (enzyme inducer) · หลังหยุด INR ภายใน 1-2 สัปดาห์'},
 {re:/phenobarb/i,name:'Phenobarbital',form:'long',eff:'moderate · ↓INR (1-2 สัปดาห์) · หลังหยุด INR สูงขึ้น เสี่ยงเลือดออก',mg:'ปรับ warfarin ช่วง 1-2 สัปดาห์ · หลังหยุด phenobarbital พิจารณาลด warfarin หรือเปลี่ยนเป็น benzodiazepine',mon:'INR ใกล้ชิดเมื่อเริ่ม/หยุด · หลังหยุดเฝ้าระวังต่อ 2-3 สัปดาห์ถึง >1 เดือน'},
 {re:/carbamaz|tegretol/i,name:'Carbamazepine',form:'long',eff:'moderate-severe · ↓INR (10-35 วัน) · หลังหยุด INR สูงขึ้น',mg:'อาจเพิ่ม warfarin ช่วง 1-2 สัปดาห์ · หลังหยุด 2-4 สัปดาห์พิจารณาลด warfarin',mon:'INR ใกล้ชิดเมื่อเริ่ม/หยุด'},
 {re:/rifamp|rifinah|rimstar/i,name:'Rifampicin',form:'long',eff:'moderate · ↓INR · หลังหยุด INR สูงขึ้น (ผลอยู่ได้ถึง 5 สัปดาห์)',mg:'เพิ่ม warfarin ตาม INR · หลังหยุดพิจารณาลด warfarin',mon:'INR ภายใน 1-2 สัปดาห์หลังเริ่ม · หลังหยุด INR ภายใน 1 สัปดาห์ และติดตามต่อถึง 5 สัปดาห์'},
];
/* ---------- Antibiotic lock therapy (ALT) 5 ml: เอกสาร ALT ห้องยา (IDSA 2009 / Justo & Bookstaver 2014) ---------- */
const SRC_ALT='Antibiotic Lock Therapy 5 ml (IDSA 2009 / Justo & Bookstaver 2014)';
const ALT={
 vanco:{c:2.5,hep:2500,prep:'Vancomycin 500 mg + NSS 10 ml → ดูด 0.25 ml (12.5 mg) + Heparin 5,000 u/ml 2.5 ml + NSS 2.25 ml = 5 ml'},
 ceftaz:{c:5,hep:2500,prep:'Ceftazidime 1 g + NSS 10 ml → ดูด 0.25 ml (25 mg) + Heparin 5,000 u/ml 2.5 ml + NSS 2.25 ml = 5 ml',note:'IDSA แนะนำ 0.5 mg/ml + heparin 100 u/ml แต่เตรียมยาก จึงใช้ 5 mg/ml + 2,500 u/ml'},
 cefazolin:{c:5,hep:2500,prep:'Cefazolin 1 g + NSS 5 ml → ดูด 1 ml (200 mg) + NSS 19 ml (10 mg/ml) → ดูด 2.5 ml (25 mg) + Heparin 5,000 u/ml 2.5 ml = 5 ml'},
 ciproiv:{c:0.2,hep:2500,prep:'Ciprofloxacin 200 mg/100 ml ดูด 0.5 ml (1 mg) + Heparin 5,000 u/ml 2.5 ml + NSS 2 ml = 5 ml'},
 genta:{c:1,hep:2500,prep:'Gentamicin 80 mg/2 ml ดูด 0.5 ml (20 mg) + NSS 9.5 ml (2 mg/ml) → ดูด 2.5 ml (5 mg) + Heparin 5,000 u/ml 2.5 ml = 5 ml'},
 cloxa:{c:100,hep:1000},
 tazocin:{c:10,hep:100,note:'ความเข้มข้นคิดเป็น piperacillin/tazobactam'},
 levo:{c:[0.05,5],hep:0,note:'ไม่ผสม heparin (no additives) · ยาคงตัวไม่ดี เปลี่ยนยาทุกวัน'},
 cotrim:{c:10,hep:100,alt:{c:16,hep:0},prep:'Bactrim 80 mg TMP/5 ml ดูด 3.1 ml (50 mg TMP) + Heparin 5,000 u/ml 0.1 ml + D5W 1.8 ml = 5 ml',note:'เจือจางด้วย D5W เท่านั้น (ไม่เข้ากับ NSS) · ถ้าใช้ 16 mg TMP/ml ไม่ต้องผสม heparin'},
 colistin:{c:0.8,hep:1000,prep:'Colistin 150 mg + NSS 5 ml → ดูด 1 ml (30 mg) + NSS 9 ml (3 mg/ml) → ดูด 1.3 ml (4 mg) + Heparin 5,000 u/ml 1 ml + NSS 2.7 ml = 5 ml'},
};
ALT.cipro=ALT.ciproiv;
const ALT_GEN='ALT ใช้ร่วมกับ systemic ATB · ค้างไว้อย่างน้อย 8-12 ชม./วัน เปลี่ยนใหม่ทุก 24 ชม. (HD: ทุกครั้งที่ฟอก) · ถอดสายถ้ายังมีอาการ >36 ชม. หรือเชื้อยังขึ้น >72 ชม.';

/* ---------- ATB DUE: FLOW ประเมินการใช้ยา ATB รพ.มค (Pre-authorized ID / Post-authorized; เวรเช้า 08-16 น.) ---------- */
const DUE=[
 {re:/colistin|polymyxin\s*e/i,name:'Colistin',t:'pre'},
 {re:/ceftaz\w*\s*[+\/]\s*avi|avibactam|zavicefta/i,name:'Ceftazidime/avibactam',t:'pre'},
 {re:/tigecyc|tigacil|tygacil/i,name:'Tigecycline',t:'pre'},
 {re:/sitaflox|gracevit/i,name:'Sitafloxacin',t:'pre'},
 {re:/linezolid|lineaz|zyvox/i,name:'Linezolid',t:'pre'},
 {re:/meropenem|meronem/i,name:'Meropenem',t:'post'},
 {re:/ertapenem|invanz/i,name:'Ertapenem',t:'post'},
 {re:/imipenem|tienam/i,name:'Imipenem/cilastatin (Tienam)',t:'post'},
 {re:/tazocin|piperacillin|pip.{0,3}tazo/i,name:'Piperacillin/tazobactam',t:'post'},
 {re:/vanco/i,name:'Vancomycin',t:'post'}];
