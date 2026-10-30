/* ===== Engine: patient calc, parser, rule evaluation ===== */
const LV={ok:0,info:1,warn:2,flag:3};
const r1=x=>x==null||isNaN(x)?'–':(Math.round(x*10)/10).toLocaleString('en-US');
const r0=x=>x==null||isNaN(x)?'–':Math.round(x).toLocaleString('en-US');
const fmtN=x=>{if(x==null||isNaN(x))return'–';const a=Math.abs(x);return a>=100?r0(x):a>=10?r1(x):a>=0.1||a===0?(Math.round(x*100)/100).toString():(+x.toPrecision(2)).toString()};

function calcPatient(p){
  const o={...p};
  const age=+p.age, bw=+p.bw, ht=+p.ht, scr=+p.scr, fem=p.sex==='F';
  o.isPed = age>0 && age<15; o.pna=age>0?Math.round(age*365):null; o.neo=age>0&&age*365<28; o.infant=age>0&&age<1;
  if(ht>0){const inch=ht/2.54; o.ibw = (fem?45.5:50)+2.3*(inch-60); if(o.ibw<0)o.ibw=null;}
  if(o.isPed && age>0) o.ibw = age<=6 ? 2*age+8 : (7*age-5)/2;
  if(bw>0&&ht>0){o.bmi=bw/((ht/100)**2); o.bsa=Math.sqrt(ht*bw/3600);}
  if(o.ibw&&bw>0){o.adjbw=o.ibw+0.4*(bw-o.ibw); o.obese = bw>1.3*o.ibw;}
  // dosing weight
  let wb=p.wbasis||'auto', dw=bw||null, wlab='ABW';
  if(wb==='ibw'&&o.ibw){dw=Math.min(o.ibw,bw||o.ibw);wlab='IBW'}
  else if(wb==='adj'&&o.adjbw&&o.obese){dw=o.adjbw;wlab='AdjBW'}
  else if(wb==='auto'&&o.obese&&!o.isPed){dw=o.ibw;wlab='IBW (อ้วน >130% IBW)'}
  o.dw=dw; o.wlab=wlab;
  if(age>0&&scr>0&&dw>0&&!o.isPed){o.crcl=((140-age)*dw)/(72*scr)*(fem?0.85:1);}
  if(age>0&&scr>0&&!o.isPed){const k=fem?0.7:0.9,a=fem?-0.241:-0.302;o.egfr=142*Math.min(scr/k,1)**a*Math.max(scr/k,1)**-1.2*0.9938**age*(fem?1.012:1);}
  if(o.isPed&&ht>0&&scr>0){o.schwartz=0.413*ht/scr;}
  o.crclCalc=o.crcl; o.egfrCalc=o.egfr; o.crclSrc='CG'; o.egfrSrc='calc';
  if(+p.crclIn>0){o.crcl=+p.crclIn;o.crclSrc='HIS';}
  if(+p.egfrIn>0){o.egfr=+p.egfrIn;o.egfrSrc='HIS'; if(o.isPed) o.schwartz=+p.egfrIn;}
  o.inr=p.inr===''||p.inr==null?null:+p.inr; o.k=p.k===''||p.k==null?null:+p.k; o.mg=p.mgl===''||p.mgl==null?null:+p.mgl;
  o.dial = ['HD','CAPD','CRRT'].includes(p.mode)?p.mode:null;
  o.lab=typeof labCalc==='function'?labCalc(p.lab||{}):{};
  return o;
}


/* ---------- day-of-week regimens (e.g. warfarin) ---------- */
const DAYS=['จ','อ','พ','พฤ','ศ','ส','อา'];
function daysIn(seg){
  let s=' '+seg.replace(/วัน(?=[จอพศส])/g,' ')+' ';
  const full=[[/จันทร์/g,' Mo '],[/อังคาร/g,' Tu '],[/พุธ/g,' We '],[/พฤหัสบดี|พฤหัส/g,' Th '],[/ศุกร์/g,' Fr '],[/เสาร์/g,' Sa '],[/อาทิตย์/g,' Su '],
   [/\bmon\w*/gi,' Mo '],[/\btue\w*/gi,' Tu '],[/\bwed\w*/gi,' We '],[/\bthu\w*/gi,' Th '],[/\bfri\w*/gi,' Fr '],[/\bsat\w*/gi,' Sa '],[/\bsun\w*/gi,' Su ']];
  full.forEach(([re,c])=>s=s.replace(re,c));
  const sep='(?=[\\s\\-,/.]|ถึง|$)', pre='(^|[\\s\\-,/.]|ถึง)';
  [['พฤ','Th'],['อา','Su'],['จ','Mo'],['อ','Tu'],['พ','We'],['ศ','Fr'],['ส','Sa']].forEach(([a,c])=>{s=s.replace(new RegExp(pre+a+'\\.?'+sep,'g'),`$1 ${c} `)});
  const ord=['Mo','Tu','We','Th','Fr','Sa','Su'], set=new Set();
  s=s.replace(/(Mo|Tu|We|Th|Fr|Sa|Su)\s*(?:-|–|ถึง|to)\s*(Mo|Tu|We|Th|Fr|Sa|Su)/g,(m,a,b)=>{let i=ord.indexOf(a);const j=ord.indexOf(b);for(let n=0;n<7;n++){set.add(ord[i]);if(i===j)break;i=(i+1)%7;}return ' ';});
  (s.match(/Mo|Tu|We|Th|Fr|Sa|Su/g)||[]).forEach(d=>set.add(d));
  return set;
}
const DAY_TH={Mo:'จ',Tu:'อ',We:'พ',Th:'พฤ',Fr:'ศ',Sa:'ส',Su:'อา'};
const WK_DISP_RE=/(?:จ่าย(?:ยา)?|dispense|#|x|×)\s*(\d+(?:\.\d+)?)\s*(สัปดาห์|สป\.?|wks?|weeks?|วัน|days?|เดือน)/i;
function dispOf(sig){const m=sig.match(WK_DISP_RE); if(!m) return null; const n=+m[1], u=m[2]; return {days:/วัน|day/i.test(u)?n:/เดือน/.test(u)?n*28:n*7,txt:m[0].trim()};}
function parseWeekly(sig){
  sig=sig.replace(WK_DISP_RE,' ').replace(/ครึ่ง\s*(?:เม็ด|tab)?/g,' 0.5 เม็ด ');
  // แยกช่วงเมื่อมีขนาดยาใหม่ตามหลังกลุ่มวัน เช่น "0.5 tab จ พ ศ 1*1 อาทิตย์"
  sig=sig.replace(/((?:จันทร์|อังคาร|พุธ|พฤหัส(?:บดี)?|ศุกร์|เสาร์|อาทิตย์|(?:^|\s)(?:จ|อ|พ|พฤ|ศ|ส|อา)\.?)\s+)(?=(?:\d+(?:\.\d+)?|\d*[½¼¾])\s*(?:[x×*]\s*\d|tab|tabs|เม็ด))/g,'$1 และ ');
  if(!/จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์|เสาร์|อาทิตย์|(^|[\s\-,])(จ|อ|พ|พฤ|ศ|ส|อา)\.?(?=[\s\-,/]|ถึง|$)|\b(mon|tue|wed|thu|fri|sat|sun)/i.test(sig)) return null;
  if(/สัปดาห์ละ|ครั้ง\s*\/\s*(สัปดาห์|wk)/.test(sig)&&!/และ|,|;/.test(sig)) {/* TB style: let freq parser handle unless multiple segments */}
  let off=new Set(), exc=null; const om=sig.match(/(ยกเว้น|หยุด|งด|เว้น|\boff\b)(.*)$/i);
  if(om){ const xu=/ยกเว้น|เว้น/.test(om[1])&&om[2].match(/(\d+(?:\.\d+)?|\d*[½¼¾])\s*(?:[x×*]\s*\d|tab|tabs|เม็ด)/i);
    if(xu) exc={days:[...daysIn(om[2])],units:num(xu[1]),raw:om[0].trim()}; else off=daysIn(om[2]); sig=sig.slice(0,om.index);}
  if(exc&&exc.days.length){ const base=sig.trim(); const all=new Set(['Mo','Tu','We','Th','Fr','Sa','Su']); const bd=daysIn(base); const bdays=bd.size?bd:all; exc.days.forEach(d=>bdays.delete(d));
    const bm=base.match(/(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*[x×*]\s*\d/)||base.match(/ครั้งละ\s*(\d+(?:\.\d+)?|\d*[½¼¾])/)||base.match(/(?:^|\s)(\d+(?:\.\d+)?|\d*[½¼¾])(?=\s*(?:เม็ด|tab))/i);
    if(bm){ const segs=[{units:num(bm[1]),days:[...bdays],raw:base,noDays:false,noUnits:false},{units:exc.units,days:exc.days,raw:exc.raw,noDays:false,noUnits:false}];
      return {segs,covered:[...bdays,...exc.days],off:[]}; } }
  const parts=sig.split(/\s*(?:และ|,|;|\+|\bthen\b)\s*/).filter(x=>x.trim());
  const segs=[]; let last=null;
  for(const p of parts){
    const d=/ทุกวัน|daily|\bod\b/i.test(p)&&daysIn(p).size===0?new Set(['Mo','Tu','We','Th','Fr','Sa','Su']):daysIn(p);
    off.forEach(x=>d.delete(x));
    let m=p.match(/(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*[x×*]\s*\d/)||p.match(/ครั้งละ\s*(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)/)||p.match(/(?:^|\s)(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)(?=\s|เม็ด|tab|$)/);
    const units=m?num(m[1]):null;
    if(units==null&&d.size===0) continue;
    segs.push({units:units??(last?last.units:null),days:[...d],raw:p.trim(),noDays:d.size===0,noUnits:units==null});
    if(units!=null) last={units};
  }
  if(!segs.length) return null;
  if(!segs.length) return null;
  const covered=new Set(); segs.forEach(s=>s.days.forEach(x=>covered.add(x)));
  return {segs,covered:[...covered],off:[...off]};
}

/* ---------- parsing ---------- */
const FRAC={'½':0.5,'¼':0.25,'¾':0.75};
function num(s){if(s==null)return NaN;s=String(s).trim();
  let m=s.match(/^(\d+)?\s*([½¼¾])$/); if(m) return (+(m[1]||0))+FRAC[m[2]];
  m=s.match(/^(\d+)\s*\/\s*(\d+)$/); if(m) return m[1]/m[2];
  return parseFloat(s);}
const normMatch=s=>s.replace(/_/g,'').replace(/(\w)-(?=\w)/g,'$1');
function findDrug(line){const n=normMatch(line);return KB.find(d=>d.match.test(n))||null}

const FREQS=[
 ['q4h',6],['q6h',4],['q8h',3],['q12h',2],['q18h',24/18],['q24h',1],['q36h',24/36],['q48h',0.5],['q72h',1/3],
 ['3 ครั้ง/สัปดาห์',3/7],['2 ครั้ง/สัปดาห์',2/7],['สัปดาห์ละครั้ง',1/7],['วันละ 5 ครั้ง',5]];
function freqLabel(F){if(F==null)return'?';const f=FREQS.find(x=>Math.abs(x[1]-F)<0.005);if(f)return f[0];return (Math.round(F*100)/100)+' ครั้ง/วัน'}

function parseFreq(s){
  let m;
  if(m=s.match(/สัปดาห์ละ\s*(\d)\s*ครั้ง|(\d)\s*(?:ครั้ง|times?|x)\s*\/\s*(?:สัปดาห์|สป|wk|week)/i)) return (+(m[1]||m[2]))/7;
  if(/สัปดาห์ละครั้ง|\bweekly\b|ทุกสัปดาห์/i.test(s)) return 1/7;
  if(/\bmwf\b|จ\.?\s*-?\s*พ\.?\s*-?\s*ศ/i.test(s)) return 3/7;
  if(m=s.match(/q\s*(\d+)\s*(?:d|day|days|วัน)\b|ทุก\s*(\d+)\s*วัน/i)) return 1/(+(m[1]||m[2]));
  if(m=s.match(/q\s*(\d+(?:\.\d+)?)(?:\s*-\s*\d+)?\s*(?:h|hr|hrs|hour|ชม|ชั่วโมง)|ทุก\s*(\d+)(?:\s*-\s*\d+)?\s*(?:ชม|ชั่วโมง)/i)) return 24/(+(m[1]||m[2]));
  if(/\beod\b|วันเว้นวัน/i.test(s)) return 0.5;
  if(m=s.match(/วันละ\s*(\d+)\s*ครั้ง/)) return +m[1];
  if(m=s.match(/(?:^|\s)(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*[x×*]\s*(\d+)/)) return +m[2];
  if(/3\s*มื้อ/.test(s)) return /ก่อนนอน/.test(s)?4:3;
  { const meals=['เช้า','กลางวัน','เที่ยง','เย็น','ก่อนนอน'].filter(w=>s.includes(w)).length; if(meals>=1) return meals; }
  if(/\bwbd\b/i.test(s)) return 2/7; if(/\bwod\b/i.test(s)) return 1/7; if(/\bq2wk\b|ทุก\s*2\s*สัปดาห์/i.test(s)) return 1/14;
  if(/\bq1m\b|ทุก\s*1?\s*เดือน/i.test(s)) return 1/30; if(/\bfid\b/i.test(s)) return 5;
  if(m=s.match(/\bq(\d+)(?:-\d+)?\b(?!\s*(?:wk|m|d)\b)/i)) return 24/(+m[1]);
  if(m=s.match(/\b(?:T|P|A|WM)(\d{1,2})\b/)){const map={T1:1,T2:2,T3:3,T4:4,T6:1,T12:2,T19:2,P1:1,P2:2,P3:3,P4:4,P5:1,P6:2,P9:2,P20:1,A1:1,A2:2,A3:3,A4:4,A5:1,A9:1,WM1:1,WM2:2,WM3:3,WM4:1};const v=map[m[0]];if(v)return v;}
  if(/3\s*มื้อ/.test(s)) return /ก่อนนอน/.test(s)?4:3;
  { const tm=s.match(/\b\d{1,2}[.:]\d{2}\b/g); if(tm&&tm.length>=2) return tm.length; }
  if(/\bqid\b/i.test(s))return 4; if(/\btid\b/i.test(s))return 3; if(/\bbid\b/i.test(s))return 2;
  if(/\b(od|qd|hs|daily|once)\b|q\s*day|วันละครั้ง|ก่อนนอน|ครั้งเดียว|\bstat\b/i.test(s)) return 1;
  return null;
}

const DOSE_RE=/(?<![\/\d])(?<!\d\.)(\d+(?:\.\d+)?)\s*(mg|gm|g|mcg|µg|meq|units?|iu|mu)(?![a-z])(?!\s*\/\s*kg)/gi;
let DM_IDX=null;
function findMaster(line){ if(typeof DM==='undefined') return null;
  if(!DM_IDX){DM_IDX={byCode:{},list:DM.map(m=>[m[1].toUpperCase().replace(/\s+/g,' '),m]).sort((a,b)=>b[0].length-a[0].length)};DM.forEach(m=>DM_IDX.byCode[m[0].toUpperCase()]=m);}
  const U=line.toUpperCase();
  for(const [n,m] of DM_IDX.list){ if(n.length>=4&&U.startsWith(n)) return {m,len:n.length}; }
  const tok=U.split(/\s+/)[0]; if(DM_IDX.byCode[tok]) return {m:DM_IDX.byCode[tok],len:tok.length,byCode:true};
  return null;}
const masterOf=row=>row.master&&typeof DM!=='undefined'?DM_IDX.byCode[row.master.toUpperCase()]:null;
// คำสั่งจาก paperless บางรายการขึ้นวิธีใช้เป็นบรรทัดใหม่ใต้ชื่อยา — ต่อเข้ากับบรรทัดยาก่อนหน้า
const SIG_START=/^(?:รับประทาน|กิน|ครั้งละ|ฉีด|ทา|หยด|พ่น|สูด|อม|เหน็บ|ใช้|ให้|ผสม|เวลา|ก่อน|หลัง|วันละ|ทุก|หยุด|day\s*\d|sig\b|rate\b|q\s*\d|(?:iv|im|sc|po|prn)\b|\d+(?:\.\d+)?\s*(?:x|×|\*|ml|cc|ซีซี|tab|cap|เม็ด|ช้อน)|[½¼¾])/i;
function joinLines(lines){ const out=[];
  for(const raw of lines){ const l=raw.replace(/\s+/g,' ').trim(); if(!l) continue;
    // บรรทัดวิธีใช้ของ paperless: ย่อหน้า หรือขึ้นต้นด้วยตัวเลข (เช่น "  2 g + NSS 100 ml IV q24hr", "7.6 (24-10-69)")
    const cont=/^[ \t\u00a0]{2,}\S/.test(raw)||(/^\d/.test(l)&&!findMaster(l)&&!findDrug(l));
    const isSig=cont||(SIG_START.test(l)&&!findMaster(l)&&!findDrug(l));
    if(isSig&&out.length) out[out.length-1]+=' '+l; else out.push(l); }
  return out;}
function parseLine(raw){
  const line=raw.replace(/\s+/g,' ').trim(); if(!line) return null;
  const fm=findMaster(line);
  const drug=(fm&&fm.m[8]?KB.find(k=>k.id===fm.m[8]):null)||findDrug(fm&&fm.byCode?fm.m[1]+' '+line:line);
  const row={raw:line,drugId:drug?drug.id:'',doseVal:'',doseUnit:'mg',F:null,parsed:true,issues:[],master:fm?fm.m[0]:''};
  // split name zone / sig zone
  const sm=line.match(/\s(?:\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*[x×*]\s*\d|รับประทาน|ครั้งละ|\b(?:iv|im|sc|po|ivd|iv drip|drip|push)\b|\bq\s*\d|\b(?:od|bid|tid|qid|hs|eod|stat)\b|ทุก\s*\d|วันละ|ฉีด|ช้อนชา/i);
  const cut=fm?fm.len:(sm?sm.index:line.length);
  let name=fm?(fm.byCode?fm.m[1]:line.slice(0,cut)):line.slice(0,cut), sig=line.slice(cut);
  if(/\bthen\b|แล้วต่อด้วย|ต่อด้วย/i.test(sig)){const parts=sig.split(/\bthen\b|แล้วต่อด้วย|ต่อด้วย/i);row.loading=parts[0].trim();sig=parts[parts.length-1];}
  const nameTok=[...name.matchAll(DOSE_RE)], sigTok=[...sig.matchAll(DOSE_RE)];
  let strength=null;
  if(nameTok.length){strength=toUnit(+nameTok[0][1],nameTok[0][2],drug);}
  else {const pm=name.match(/\((\d+(?:\.\d+)?)\)/); if(pm) strength=+pm[1];}
  if(fm&&fm.m[7]&&!(drug&&drug.noMasterStrength)){ if(fm.m[7][0]==='u'){ if(strength==null) strength=fm.m[7][1]; } else row.mlMg=fm.m[7][1]; }
  if(strength==null&&drug&&drug.id==='warfarin'){const wm=name.match(/^\s*w\s*\(?\s*(\d+(?:\.\d+)?)/i); if(wm) strength=+wm[1];}
  let explicit=null, expUnit=null;
  if(sigTok.length){explicit=+sigTok[0][1];expUnit=sigTok[0][2];}
  else if(nameTok.length>=2){const t=nameTok[nameTok.length-1];explicit=+t[1];expUnit=t[2];}
  if(/^mu$/i.test(expUnit||'')) {explicit=null;}
  // ขนาดที่แพทย์ระบุเป็น mg/kg (ต่อครั้ง/ต่อวัน) — ใช้คำนวณกลับ
  const stm=line.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|units?|iu|u)?\s*\/\s*kg\s*\/?\s*(day|d|วัน|dose|ครั้ง)?(?![a-z\/])|(\d+(?:\.\d+)?)\s*(mkd|mkday|mk\s*\/\s*day|mk\s*\/\s*d|mkdose|mk\s*\/\s*dose|mk)(?![a-z])/i);
  if(stm){ let v=+(stm[1]||stm[4]); const tok=(stm[3]||stm[5]||'').toLowerCase().replace(/\s/g,'');
    if(/^mcg/i.test(stm[2]||'')) v=v/1000;
    let per=/day|^d$|วัน|mkd|mk\/d/.test(tok)?'day':/dose|ครั้ง/.test(tok)?'dose':null;
    if(!per){per='dose';row.issues.push('ระบุ mg/kg แต่ไม่บอกว่าต่อครั้งหรือต่อวัน — ถือเป็นต่อครั้ง');}
    row.stated={v,per,raw:stm[0].trim()}; }
  const mgkg=null;
  // form
  let fi=-1;
  if(drug&&drug.forms){
    fi=row.mlMg!=null?drug.forms.findIndex(f=>f[3]==='ml'&&Math.abs(f[2]-row.mlMg)<0.01):-1;
    if(fi<0&&row.mlMg==null) fi=drug.forms.findIndex(f=>f[3]==='ml'&&f[0].test(name));
    if(fi<0&&strength!=null) fi=drug.forms.findIndex(f=>f[3]!=='ml'&&Math.abs(f[2]-strength)<0.01);
    if(fi<0) fi=drug.forms.findIndex(f=>f[0].test(name));
    if(fi<0&&strength==null&&drug.forms.length===1) fi=0;
  }
  row.formIdx=fi; row.strength=strength;
  const form=fi>=0?drug.forms[fi]:null;
  // dose
  const sEnd=nameTok.length?nameTok[0].index+nameTok[0][0].length:(name.match(/\(\d+(?:\.\d+)?\)/)?name.indexOf(name.match(/\(\d+(?:\.\d+)?\)/)[0])+name.match(/\(\d+(?:\.\d+)?\)/)[0].length:0);
  const rest=(fm?' '+sig:name.slice(sEnd)+' '+sig).replace(/^[^\s]*?(cap(sule)?s?|tab(let)?s?|inj|syr(up)?|susp)\.?\)?/i,' ');
  sig=rest;
  { const dv=sig.match(/(?:\bin\b|\+|ผสม(?:ใน)?|ละลาย(?:ใน)?|dilute(?:d)?(?:\s*(?:in|with))?)\s*(?:0\.9\s*%?\s*)?(?:nss|ns|d5w|d5s|d5|swfi|sterile water|sw|น้ำเกลือ|น้ำกลั่น)?\s*(\d+(?:\.\d+)?)\s*(?:ml|cc)(?![a-z\/])/i);
    const dm=sig.match(/(?:\bin\b|over|นาน|drip(?:\s*in)?)\s*(\d+(?:\.\d+)?)\s*(min|mins|นาที|hr|hrs|h|ชม|ชั่วโมง)\b/i);
    const dr=sig.match(/(?:rate\s*)?(\d+(?:\.\d+)?)\s*(?:ml|cc)\s*\/\s*(?:hr|h|ชม)/i);
    if(dv||dr){ row.iv={vol:dv?+dv[1]:null,min:dm?(+dm[1])*(/min|นาที/i.test(dm[2])?1:60):null,rate:dr?+dr[1]:null};
      if(dv) sig=sig.replace(dv[0],' '); if(dr) sig=sig.replace(dr[0],' '); if(dm) sig=sig.replace(dm[0],' '); } }
  if(row.stated) sig=sig.replace(row.stated.raw,' ');
  const vol=sig.match(/(?<![\/\d.])(\d+(?:\.\d+)?|\d*[½¼¾])\s*(ml|cc|ซีซี|มล)(?![a-z])/i), tsp=sig.match(/(\d+(?:\.\d+)?|\d*[½¼¾])\s*ช้อนชา/);
  const cnt=sig.match(/ครั้งละ\s*(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*(เม็ด|แคปซูล|cap|tab|ขวด|vial|amp)?/i)||sig.match(/(?:^|\s)(\d+(?:\.\d+)?|\d*[½¼¾]|\d+\/\d+)\s*[x×*]\s*\d/)||sig.match(/(?:^|\s)(\d+(?:\.\d+)?|\d*[½¼¾])\s*(tab|tabs|cap|caps|เม็ด|แคปซูล|vial|amp|puffs?|กด|สูด|dose|doses)(?![a-z])/i);
  const rngC=sig.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(tab|tabs|cap|caps|เม็ด|แคปซูล|ช้อนชา|ml|cc)/i);
  if(rngC){row.issues.push(`สั่งเป็นช่วง ${rngC[1]}-${rngC[2]} — ตรวจที่ขนาดสูงสุด`);}
  if(rngC&&!mgkg){const n=+rngC[2],u=rngC[3].toLowerCase(); if(u==='ช้อนชา'){row.doseVal=n*5;row.doseUnit='ml';} else if(u==='ml'||u==='cc'){row.doseVal=n;row.doseUnit='ml';} else {row.doseVal=n;row.doseUnit='unit';}}
  else if(mgkg){row.doseVal=+mgkg[1];row.doseUnit='mgkg';}
  else if(explicit!=null && !/^(ml|cc)$/i.test(expUnit)){row.doseVal=toUnit(explicit,expUnit,drug);row.doseUnit='mg';}
  else if(row.stated&&!tsp&&!vol&&!cnt){row.fromStated=true;row.doseVal=row.stated.v;row.doseUnit='mgkg';}
  else if(tsp){row.doseVal=num(tsp[1])*5;row.doseUnit='ml';}
  else if(vol&&(cnt==null||(cnt[2]==null&&/ครั้งละ/.test(cnt[0])))){row.doseVal=num(vol[1]);row.doseUnit='ml';}
  else if(cnt){row.doseVal=num(cnt[1]);row.doseUnit='unit';}
  else if(vol){row.doseVal=num(vol[1]);row.doseUnit='ml';}
  else {row.doseVal=1;row.doseUnit='unit'; if(strength==null){row.issues.push('ไม่ระบุจำนวนต่อครั้ง — สมมุติ 1 หน่วย');row.parsed=false;}}
  if(!form&&strength!=null&&!row.mlMg){row.unitMg=strength;}
  if(drug&&HADKEY[drug.id]){ const L=line;
    const ratio=L.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
    const rate=L.match(/(\d+(?:\.\d+)?)\s*(?:cc|ml|mcd|µd|ud)\s*\/\s*(?:hr|h|ชม|min)|rate\s*(\d+(?:\.\d+)?)/i);
    const dil=(L.match(/\b(nss|0\.9\s*%?\s*nss|ns|d5w|d5s|d5|d10w|swfi|sterile water|nss\/2)\b/i)||[])[1]||'';
    const dvol=L.match(/(?:\+|in|ผสม(?:ใน)?)\s*(?:0\.9\s*%?\s*)?(?:nss|ns|d5w|d5s|d5|swfi)?\s*(?:\(\s*\d+\s*(?:ml)?\s*\)\s*)?(\d+(?:\.\d+)?)\s*(?:ml|cc)?(?![\d.]*\s*(?:mg|mcg|meq|unit|:))/i)||L.match(/(?:สารน้ำ|น้ำเกลือ|\bnss\b|\bd5w\b|\bd5s\b|\bswfi\b)[\s.:=…]*?(?:\(\s*\d+\s*(?:ml)?\s*\)\s*)?(\d+(?:\.\d+)?)[\s.…]*(?:ml|cc|มล)/i)||L.match(/\b(?:nss|d5w|d5s|swfi)\s*\(\s*(\d+)\s*(?:ml)?\s*\)/i);
    let amt=null,vol=null,how='';
    if(ratio){ amt=+ratio[1]; vol=+ratio[2]; how='ratio'; }
    else { const t=[...L.matchAll(DOSE_RE)].filter(x=>!/^\s*$/.test(x[0])); const tk=t.length>=2?t[t.length-1]:t[0]; if(tk) amt=toUnit(+tk[1],tk[2],drug); if(dvol) vol=+dvol[1]; }
    row.had={key:HADKEY[drug.id],amt,vol,rate:rate?+(rate[1]||rate[2]):null,dil:dil.toUpperCase(),line:/central|cvc|cvp|central line/i.test(L)?'central':/periph|\bpl\b|เส้นเลือดส่วนปลาย/i.test(L)?'peripheral':null,how,dvol:dvol?+dvol[1]:null};
    { const H=HAD[row.had.key], am=line.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|meq|g|units?)\s*\/\s*(\d+(?:\.\d+)?)\s*ml/i);
      if(am){ const u=am[2].toLowerCase(), hu=H.u.toLowerCase(); let v=+am[1];
        if(u===hu||(u.startsWith('unit')&&hu==='unit')) row.had.amp=v; else if(u==='mg'&&hu==='mcg') row.had.amp=v*1000; else if(u==='g'&&hu==='mg') row.had.amp=v*1000; else if(u==='mcg'&&hu==='mg') row.had.amp=v/1000;
        if(row.had.amp) row.had.ampTxt=`${am[1]} ${am[2].replace(/^meq$/i,'mEq').replace(/^(MG|MCG|G|UNITS?)$/,x=>x.toLowerCase())}/${am[3]} ml`; } }
    row.issues=[]; row.parsed=true; row.F=null; row.doseVal=amt??''; row.doseUnit=['mcg','mEq','unit','g'].includes(HAD[row.had.key].u)?HAD[row.had.key].u:'mg';
    return row; }
  const wk=parseWeekly(sig);
  if(wk&&(wk.segs.length>1||wk.segs[0].days.length)){
    const mgU=form&&form[3]!=='ml'?form[2]:strength;
    row.weekly=wk; row.issues=row.issues.filter(x=>!/จำนวนต่อครั้ง/.test(x));
    const unitsSet=[...new Set(wk.segs.filter(s=>!s.noDays).map(s=>s.units))];
    wk.segs.filter(s=>s.noDays).forEach(s=>row.issues.push(`ส่วน "${s.raw}" ไม่ระบุวัน — คำสั่งไม่ชัดเจน ยืนยันกับแพทย์`));
    wk.segs.filter(s=>s.noUnits&&!s.noDays).forEach(s=>row.issues.push(`ส่วน "${s.raw}" ไม่ระบุจำนวนเม็ด`));
    const missing=['Mo','Tu','We','Th','Fr','Sa','Su'].filter(d=>!wk.covered.includes(d)&&!wk.off.includes(d));
    if(missing.length&&missing.length<7) row.issues.push(`ระบุวันไม่ครบ 7 วัน (ไม่ระบุ: ${missing.map(d=>DAY_TH[d]).join(', ')}) — หยุดยาวันดังกล่าว หรือคำสั่งไม่ครบ?`);
    const weekUnits=wk.segs.filter(s=>!s.noDays&&s.units!=null).reduce((a,s)=>a+s.units*s.days.length,0);
    wk.weekUnits=weekUnits; wk.mgU=mgU; wk.mgWeek=mgU!=null?weekUnits*mgU:null;
    wk.maxUnits=Math.max(...wk.segs.filter(s=>s.units!=null).map(s=>s.units));
    if(unitsSet.length===1&&unitsSet[0]!=null){row.doseVal=unitsSet[0];row.doseUnit='unit';row.F=wk.covered.length/7;}
    else if(mgU!=null){row.doseVal=Math.round(weekUnits*mgU/7*100)/100;row.doseUnit='mg';row.F=1;row.formIdx=fi; wk.avgOnly=true;}
    else {row.F=null;}
  } else {
    row.F=parseFreq(sig)??parseFreq(line);
  }
  if(row.F==null){row.issues.push('อ่านความถี่ไม่ได้');row.parsed=false;}
  if(row.fromStated&&row.stated.per==='day'&&row.F) row.doseVal=Math.round(row.stated.v/row.F*1000)/1000;
  if(/\bprn\b|as\s*need|(?:เวลา|เมื่อ|ถ้า|หาก)\s*(?:มี)?\s*(?:ปวด|ไข้|อาการ|ไอ|คัน|คลื่นไส้|อาเจียน|นอนไม่หลับ|ท้องเสีย|น้ำมูก|เจ็บ|แน่น|หอบ|ชัก)/i.test(line)) row.prn=true;
  if(!drug){row.parsed=false;}
  return row;
}
function toUnit(v,u,drug){u=(u||'mg').toLowerCase();const du=drug?drug.unit:'mg';
  if(du==='g'){if(u==='mg')return v/1000;return v;}
  if(du==='unit'||du==='mEq')return v;
  if(du==='mcg') return u==='mg'?v*1000:u==='g'?v*1e6:v;
  if(u==='g'||u==='gm')return v*1000; if(u==='mcg'||u==='µg')return v/1000; return v;}

/* dose per administration in drug unit (mg) */
function rowDose(row,drug,pt){
  const v=+row.doseVal; if(!(v>0)) return null;
  const form=drug&&drug.forms&&row.formIdx>=0?drug.forms[row.formIdx]:null;
  switch(row.doseUnit){
    case 'mg': return v;
    case 'g': return v*1000;
    case 'mgkg': return pt.dw?v*pt.dw:null;
    case 'ml': if(form&&form[2]==null) return null; if(form&&form[3]==='ml') return v*form[2]; if(row.mlMg) return v*row.mlMg; return null;
    case 'unit': if(form&&form[2]==null) return null; if(form&&form[3]!=='ml') return v*form[2]; if(row.unitMg) return v*row.unitMg; if(row.strength!=null&&!row.mlMg) return v*row.strength; return null;
  }
  return null;
}

/* ---------- rule evaluation ---------- */
function variantsOf(d){if(d.variants)return d.variants.map(v=>({basis:d.renal?.basis,...v}));if(d.renal)return[{name:'',...d.renal}];return[]}
function pickBand(v,pt){
  if(pt.dial){const b=v[pt.dial];return b?{...b,where:pt.dial}:{txt:'ไม่มีข้อมูล',nodata:true,where:pt.dial};}
  const val=v.basis==='egfr'?pt.egfr:pt.crcl; if(val==null) return null;
  const b=v.bands.find(b=>val>=b.lo&&val<b.hi); if(!b) return null;
  return {...b,where:(v.basis==='egfr'?'eGFR ':'CrCl ')+(b.hi>=999?'≥'+b.lo:b.lo===0?'<'+b.hi:b.lo+'–'+(b.hi-1))};
}
function checkBand(b,D,T,pt){
  if(b.avoid) return {s:'flag',why:'ห้ามใช้/หลีกเลี่ยง'};
  if(b.nodata) return {s:'warn',why:'ไม่มีข้อมูลในเอกสาร'};
  const w=b.kg?(pt.dw||null):1; if(b.kg&&!w) return {s:'warn',why:'ยานี้คิดเป็น mg/kg — กรอกน้ำหนักผู้ป่วย'};
  const Dc=D/w, Tc=T/w; const t=b.t; const tS=Array.isArray(t)?t[0]:t, tP=Array.isArray(t)?t[1]:t;
  if(b.d!=null&&Dc>b.d*1.05) return {s:'flag',why:`ขนาดต่อครั้ง ${fmtN(Dc)}${b.kg?' mg/kg':''} > ${fmtN(b.d)}`};
  if(b.dmax&&D>b.dmax*1.02) return {s:'flag',why:`ขนาดต่อครั้ง ${r0(D)} mg > ${r0(b.dmax)} mg`};
  if(tP!=null&&Tc>tP*1.05) return {s:'flag',why:`ขนาดต่อวัน ${fmtN(Tc)}${b.kg?' mg/kg':''} > ${fmtN(tP)}`};
  if(tS!=null&&Tc>tS*1.05) return {s:'warn',why:`อยู่ช่วงบนของคำแนะนำ (${fmtN(Tc)} > ${fmtN(tS)}${b.kg?' mg/kg':''}/วัน)`};
  return {s:'ok'};
}

/* ขนาดต่ำสุดต่อวันจากข้อความคำแนะนำ (ใช้กับยาต้านจุลชีพ) */
function minDaily(txt){ if(!txt) return null; let t=txt.replace(/,/g,'');
  if(/แล้ว/.test(t)) t=t.split('แล้ว').pop();
  t=t.replace(/\(.*?\)/g,' ');
  const m=t.match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(mg\/kg|g|mg|mu)\b(\/day)?/i); if(!m) return null;
  let v=+m[1]; const u=m[2].toLowerCase(); if(u==='g') v*=1000;
  const kg=u==='mg/kg'; if(m[3]) return {v,kg};
  const after=t.slice(m.index+m[0].length);
  let iv=null; const q=after.match(/q\s*(\d+)(?:\s*-\s*(\d+))?\s*h/i);
  if(q) iv=+(q[2]||q[1]); else if(/\bbid\b/i.test(after)) iv=12; else if(/\btid\b/i.test(after)) iv=8; else if(/\bod\b|ครั้งเดียว/i.test(after)) iv=24;
  if(!iv||/สัปดาห์|q48|q72/.test(after)&&!q) return null;
  return {v:v*24/iv,kg};
}
function unitTxt(d){return d.unit||'mg'}

function evaluate(row,pt,rows){
  const items=[]; const add=(lvl,txt,tag)=>items.push({lvl,txt,tag});
  const d=KB.find(x=>x.id===row.drugId);
  const res={items,drug:d,status:'none',sugg:null};
  const mm=masterOf(row); res.master=mm;
  const mflags=()=>{ if(!mm) return; const f=mm[5]||'';
    if(f.includes('C')&&!res.chemo) add('warn','ยาเคมีบำบัด (บัญชียา รพ.) — คำนวณตาม BSA/AUC ตรวจ lab และ max dose ตามแนวทาง CMT');
    if(f.includes('H')&&!(d&&d.special)) add('info','HAD ตามบัญชียา รพ. — ตรวจข้อบ่งใช้ ขนาด และวิธีบริหาร');
    if(f.includes('N')) add('info','ยาเสพติด — ตรวจ dose/rate และความครบถ้วนใบ ยส.5 / บจ.8'); };
  const dueChk=()=>{ const t=row.raw+' '+(mm?mm[1]+' '+mm[2]:''); const u=DUE.find(x=>x.re.test(t)); if(!u||/\block\b/i.test(row.raw)) return;
    const h=(pt.now||new Date()).getHours(), morning=h>=8&&h<16, shift=morning?'เวรเช้า':h>=16?'เวรบ่าย':'เวรดึก';
    const POST='แพทย์ไม่ต้อง consult ID · เภสัชกรจ่ายยาไปก่อน · ASP team ติดตาม/ประเมินการใช้ยาทุกสัปดาห์';
    const PRE=morning?'เวรเช้า: แพทย์ต้อง consult ID · เภสัชกรจ่ายยาเมื่อ ID อนุมัติ':`${shift}: แพทย์ยังไม่ต้อง consult ID · เภสัชกรจ่ายยาไปก่อนจนถึง dose เวรเช้า · เวรเช้าแพทย์ consult ID แล้วจ่ายต่อเมื่อ ID อนุมัติ`;
    const xtra=u.x?' · '+u.x:'';
    if(u.name==='Colistin'){ const doc=/document|culture|c\/s|sensitiv|เพาะเชื้อ|ผลเชื้อ|ผล\s*c\/s|\bdx\b.*(?:acinetobacter|pseudomonas|kleb|cre|crab)/i.test(row.raw), emp=/empiric/i.test(row.raw);
      if(doc&&!emp) add('info',`DUE Colistin (Documented): ${POST}${xtra}`);
      else if(emp) add('warn',`DUE Pre-authorized (ID): Colistin (Empiric) — ${PRE}${xtra}`);
      else add('warn',`DUE Colistin — ยืนยันว่า Empiric หรือ Documented · Empiric = Pre-authorized (${PRE}) · Documented (มีผลเพาะเชื้อ) = ${POST}${xtra}`);
      return; }
    if(u.t==='pre') add('warn',`DUE Pre-authorized (ID): ${u.name} — ${PRE}${xtra}`);
    else add('info',`DUE Post-authorized: ${u.name} — ${POST}`); };
  const alChk=(nm)=>{ const al=(pt.allergy||'').toLowerCase().trim(); if(!al) return; const gen=(nm||'').toLowerCase().split(/[\s(\/]/)[0]; const mmn=mm?mm[1]+' '+mm[2]:'';
    const xs=typeof xaCheck==='function'?xaCheck(pt.allergy,(nm||'')+' '+row.raw+' '+mmn):[];
    if(gen&&gen.length>3&&al.includes(gen)&&!xs.some(x=>x.lvl==='flag')) add('flag',`ประวัติแพ้ยา: ${gen}`);
    xs.forEach(x=>add(x.lvl==='ok'?'info':x.lvl,`ประวัติแพ้ ${x.a} → ${x.d}: ${x.txt}`));
    if(!xs.length&&d&&d.fam==='quinolone'&&/quinolone|floxacin/.test(al)&&!al.includes(gen)) add('flag','ประวัติแพ้ยากลุ่ม quinolone'); };
  const extChk=()=>{ if(typeof arvChk==='function') res.arv=arvChk(row,rows||[],pt,add); if(typeof chemoChk==='function') res.chemo=chemoChk(row,pt,add); if(typeof inhalerChk==='function') res.inh=inhalerChk(row,rows||[],pt,add); if(typeof fentPatchChk==='function') res.fpatch=fentPatchChk(row,rows||[],pt,add); };
  if(!d){ extChk(); mflags(); dueChk(); alChk(mm?mm[1]:row.raw); add(mm&&(mm[5].includes('C')||res.arv||res.chemo||res.fpatch)?'info':'warn',mm?`ยังไม่มีกฎในฐาน (${mm[6]||mm[4]}) — เภสัชกรตรวจเอง`:'ไม่พบยานี้ในบัญชียา รพ. และฐานกฎ — ตรวจชื่อยา');
    const lv=items.filter(i=>i.lvl!=='info').reduce((m,i)=>Math.max(m,LV[i.lvl]),-1); res.status=lv===3?'flag':(lv===2&&((mm&&mm[5].includes('C')&&!res.chemo)||items.some(i=>i.lvl==='warn'&&/^(ประวัติแพ้|DUE|ARV|เคมีบำบัด|ยาพ่น|Fentanyl patch)/.test(i.txt))))?'warn':items.some(i=>i.lvl==='ok'&&/^(ARV|เคมีบำบัด|Fentanyl patch)/.test(i.txt))?'ok':'none'; return res;}
  mflags(); dueChk();
  if(d.id==='metformin'&&!pt.isPed&&+pt.age>50&&pt.egfr!=null&&pt.egfr<60) add('info','แนวทาง รพ.มค: ผู้ป่วยอายุ >50 ปีที่ eGFR <60 แนะนำติดตาม eGFR อย่างน้อยทุก 6 เดือน');
  if(/\block\b/i.test(row.raw)) return evalLock(row,d,pt,add,res);
  if(row.had){ const h=row.had, H=HAD[h.key]; const bw=+pt.bw||null;
    res.D=h.amt; res.T=null;
    if(!(h.amt>0&&h.vol>0)) add('warn',`HAD: อ่านคำสั่งไม่ครบ — อ่านได้ ยา ${h.amt>0?h.amt+' '+H.u:'–'} · สารน้ำ ${h.vol>0?h.vol+' ml':'–'} · rate ${h.rate!=null?h.rate+' ml/h':'–'} (ต้องมีครบ 3 ค่าจึงคำนวณ dose/conc ได้ เช่น 4:250 rate 10 หรือ 8 mg + D5W 250 ml rate 10 cc/hr) — กรอกในแท็บ "คำนวณ HAD"`);
    else if(h.rate==null) add('warn','HAD: ไม่พบ rate (เช่น 10 cc/hr) — ตรวจ dose ไม่ได้');
    else { const o=hadCalc(h.key,{bw,amt:h.amt,vol:h.vol,rate:h.rate,line:h.line,crcl:pt.dial?0:pt.crcl,amp:h.amp,ampTxt:h.ampTxt});
      const cu=H.u==='mcg'?'mcg/ml':H.u==='mEq'?'mEq/ml':H.u==='g'?'g/ml':H.u==='unit'?'unit/ml':'mg/ml';
      const S=(typeof HAD_STD!=='undefined'&&HAD_STD[h.key])||{};
      // 1) ค่าที่คำนวณได้
      add('info',`คำนวณได้: Conc ${o.concTxt||fmtN(o.conc)+' '+cu} (${H.name} ${h.amt} ${H.u} ใน ${h.vol} ml) · Rate ${h.rate} ml/h = ${o.dose!=null?fmtN(o.dose)+' '+(o.doseU||''):'–'}${o.doseKg!=null?` (${fmtN(o.doseKg)} mcg/kg/h)`:''}${bw?` · BW ${bw} kg`:''}`);
      // 2) ค่ามาตรฐาน
      const nd='ยังไม่มีข้อมูล';
      add('info',`มาตรฐาน: Usual dose ${S.usual||nd} · Max dose/rate ${S.maxDose?S.maxDose+(o.maxRate?` (ขอบบนช่วงปกติ = ${r1(o.maxRate)} ml/h ที่ความเข้มข้นนี้)`:''):nd+(o.maxRate?` (ขอบบน usual dose = ${r1(o.maxRate)} ml/h ที่ความเข้มข้นนี้)`:'')} · Max conc ${S.maxConc||nd}${S.src?` — ที่มา: ${S.src}`:''}`);
      // 3) เหมาะสม/ไม่เหมาะสมเพราะ
      const good=o.checks.filter(c=>c.lvl==='ok').map(c=>c.txt), bad=o.checks.filter(c=>c.lvl==='warn'||c.lvl==='flag');
      if(good.length) add('ok','เหมาะสมเพราะ: '+good.join(' · '));
      bad.forEach(c=>add(c.lvl,'ไม่เหมาะสม/ต้องทบทวนเพราะ: '+c.txt));
      o.checks.filter(c=>c.lvl==='info').forEach(c=>add('info',c.txt));
      if(H.dose==='mcgkgmin'&&!bw) add('warn','HAD: กรอกน้ำหนักผู้ป่วยเพื่อคำนวณ mcg/kg/min');
      const miss=[!S.usual&&'usual dose',!S.maxDose&&'max dose/rate',!S.maxConc&&'max conc'].filter(Boolean);
      if(miss.length) add('info',`ยังไม่มีข้อมูล ${miss.join(', ')} ในฐาน — ประเมินส่วนนี้ไม่ได้ (เติมได้ใน kb.js → HAD_STD)`);
      // 4) การจ่าย
      add('info',`จ่าย: ต่อวัน ${fmtN(o.perDay)} ${H.u} · ${o.ampDispense} amp/วัน (amp ${o.ampTxt})${o.prep?` — ${o.prep}${o.prepAlt?` (${o.prepAlt})`:''}`:''}`);
      res.hadOut=o; }
    if(h.how==='ratio'&&h.dvol&&h.dvol<=h.vol) add('info',`คิด conc ตามอัตราส่วน ${h.amt}:${h.vol} (ยา ${h.amt} ${H.u} ในสารน้ำรวม ${h.vol} ml) — สารน้ำ ${h.dvol} ml คือถุงที่ใช้ผสม`);
    else if(h.how==='ratio'&&h.dvol&&h.dvol>h.vol) add('warn',`คำสั่งระบุทั้ง ${h.amt}:${h.vol} และสารน้ำ ${h.dvol} ml — ตรวจว่าความเข้มข้นจริงคือ ${h.amt}/${h.vol} หรือ ${h.amt}/${h.dvol} ${H.u}/ml (ใช้ ${h.amt}:${h.vol} ในการคำนวณ)`);
    if(h.key==='ne'&&!h.dil) add('info','คำสั่งไม่ระบุชนิดสารน้ำ — Norepinephrine ผสมใน D5W เท่านั้น (คู่มือ HAD รพ.: ห้าม NSS) ห้องยาจ่าย D5W');
    if(h.key==='ne'&&h.dil&&!/^D5/.test(h.dil)) add('flag',`Norepinephrine ต้องผสมใน D5W เท่านั้น (คู่มือ HAD รพ.: incompatible กับ NSS) — คำสั่งระบุ ${h.dil}`);
    if(h.key==='kcl'&&pt.k!=null&&pt.k>=5) add('flag',`K ${pt.k} — ยืนยันข้อบ่งใช้ KCl`);
    if(h.key==='mg'&&(pt.dial||(pt.crcl!=null&&pt.crcl<25))) add('flag','MgSO4: ห้ามใช้เมื่อ CrCl <25');
    add('info','HAD (ยาความเสี่ยงสูง): เภสัชกรตรวจข้อบ่งใช้ dose conc rate ตามคู่มือ HAD รพ. แล้วบันทึก "ok (check2)" = ผ่านการตรวจซ้ำคนที่ 2 · รายละเอียดในแท็บ "คำนวณ HAD"');
    const lv=items.filter(i=>i.lvl!=='info').reduce((m,i)=>Math.max(m,LV[i.lvl]),-1); res.status=lv===3?'flag':lv===2?'warn':'ok'; return res; }
  row.issues&&row.issues.forEach(x=>add('warn','อ่านคำสั่ง: '+x,'parse'));
  if(row.weekly){const w=row.weekly, mu=w.mgU;
    { const wu=w.segs.filter(s=>!s.noDays&&s.units!=null).reduce((a,s)=>a+s.units*s.days.length,0), dp=dispOf(row.raw);
      const tabs=d=>Math.ceil(wu*d/7-1e-9);
      if(wu>0) add('info',dp?`จ่ายตามคำสั่ง "${dp.txt}": ${fmtN(wu)} เม็ด/สัปดาห์ × ${fmtN(dp.days/7)} สัปดาห์ = ${tabs(dp.days)} เม็ด${mu?` (${mu} mg)`:''}${dp.days%7?' — ไม่ครบสัปดาห์ จำนวนขึ้นกับวันเริ่ม ดูแท็บ Warfarin':''}`:`จำนวนจ่าย: ${fmtN(wu)} เม็ด/สัปดาห์ · 2 สัปดาห์ = ${tabs(14)} · 4 สัปดาห์ = ${tabs(28)} เม็ด${mu?` (${mu} mg)`:''}`); }
    const segTxt=w.segs.filter(s=>!s.noDays).map(s=>`${s.days.map(d=>DAY_TH[d]).join(',')} ${s.units??'?'} เม็ด${mu!=null&&s.units!=null?` (${fmtN(s.units*mu)} mg)`:''}`).join(' / ');
    if(w.off&&w.off.length) add('info',`หยุดยา: ${w.off.map(d=>DAY_TH[d]).join(', ')}`);
    add('info',`สูตรรายวันในสัปดาห์: ${segTxt}${w.mgWeek!=null?` = ${fmtN(w.mgWeek)} mg/สัปดาห์ (เฉลี่ย ${fmtN(w.mgWeek/7)} mg/วัน)`:''}`);
    if(mu!=null&&w.maxUnits*mu>10&&row.drugId==='warfarin') add('warn',`Warfarin วันที่สูงสุด ${fmtN(w.maxUnits*mu)} mg/วัน (>10 mg) — ยืนยันขนาด`);}
  const D=rowDose(row,d,pt), F=row.F; const T=D!=null&&F!=null?D*F:null;
  res.D=D;res.T=T;
  if(D==null&&(d.renal||d.variants||d.adult||d.tb||d.peds)) add('warn','คำนวณ mg ไม่ได้ — เลือกรูปแบบยา/หน่วยให้ครบ','parse');
  if(row.prn) add('info',`ใช้เมื่อมีอาการ (PRN) — ตรวจที่ความถี่สูงสุด${F?` ${fmtN(F)} ครั้ง/วัน`:''} · ถ้าคำสั่งเป็นช่วง (เช่น ทุก 4-6 ชม.) ใช้ช่วงสั้นสุด`);
  if(row.stated&&D!=null&&F!=null){ const bw=pt.dw||+pt.bw||null, st=row.stated, perTxt=st.per==='day'?'day':'dose';
    if(!bw) add('warn','แพทย์ระบุเป็น mg/kg — กรอกน้ำหนักเพื่อคำนวณกลับ');
    else if(row.fromStated){ const fm2=d.forms&&row.formIdx>=0?d.forms[row.formIdx]:null, mlp=fm2&&fm2[3]==='ml'?fm2[2]:row.mlMg; 
      add('info',`คำนวณจาก ${st.v} mg/kg/${perTxt} × ${fmtN(bw)} kg = ${fmtN(D)} ${unitTxt(d)}/ครั้ง${mlp?` = ${r1(D/mlp)} ml`:''} (${fmtN(T)}/วัน) — ใช้ตัวเลขนี้จ่ายยา`); }
    else { const exp=st.per==='day'?st.v*bw/F:st.v*bw, diff=(D-exp)/exp;
      const back=`${fmtN(D)} ÷ ${fmtN(bw)} kg = ${fmtN(D/bw)} mg/kg/dose (${fmtN(D*F/bw)} mg/kg/day)`;
      if(Math.abs(diff)<=0.1) add('ok',`คำนวณกลับ: ${back} ตรงกับที่แพทย์ระบุ ${st.v} mg/kg/${perTxt}`);
      else add('flag',`ตัวเลขไม่ตรง: ${st.v} mg/kg/${perTxt} × ${fmtN(bw)} kg = ${fmtN(exp)} mg/ครั้ง แต่สั่ง ${fmtN(D)} mg (${diff>0?'มากกว่า':'น้อยกว่า'} ${r0(Math.abs(diff)*100)}%) · คำนวณกลับ: ${back}`); } }
  if(row.iv&&D!=null){ const iv=row.iv; const parts=[];
    if(iv.vol){ parts.push(`ผสม ${iv.vol} ml → ${fmtN(D/iv.vol)} ${unitTxt(d)}/ml`); }
    let min=iv.min; if(!min&&iv.rate&&iv.vol) min=iv.vol/iv.rate*60;
    if(min){ parts.push(`ให้นาน ${r0(min)} นาที`); if(iv.vol) parts.push(`rate ${r1(iv.vol*60/min)} ml/h`); parts.push(`${fmtN(D/min)} ${unitTxt(d)}/min`); }
    else if(iv.rate) parts.push(`rate ${iv.rate} ml/h`);
    if(parts.length) add('info','IV: '+parts.join(' · ')+' — เทียบ max conc/rate ของยา'); }
  let hit=false;
  const tbCtx = pt.tb || rows.some(r=>['inh','rifam','emb','pza'].includes(r.drugId));
  const useTB = d.tb && (!['levo','amikacin'].includes(d.id) || tbCtx);
  // ---- TB
  if(useTB && D!=null && F!=null){hit=true; evalTB(d,D,F,pt,add,res);}
  // ---- pediatrics
  else if(pt.isPed){ if(pt.neo) add('warn',`ทารกแรกเกิด (อายุ ${pt.pna} วัน): ขนาดยาเด็กในฐานกฎเป็นของเด็กโต ไม่ครอบคลุมทารกแรกเกิด — ขนาดและช่วงห่างขึ้นกับ GA (อายุครรภ์) และ PNA (อายุหลังคลอด) ตรวจกับ Neofax / Lexicomp neonatal หรือแนวทางกุมารเวช`);
    if(d.peds&&D!=null&&F!=null){hit=true;evalPed(d,row,D,F,pt,add,res);}
    else if(d.renal||d.variants||d.adult) add('info','ผู้ป่วยเด็ก: ไม่มีกฎขนาดยาเด็กสำหรับยานี้ในฐาน');
    if((d.renal||d.variants)&&pt.schwartz!=null&&pt.schwartz<50) add('warn',`เด็กไตบกพร่อง (eGFR Schwartz ${r0(pt.schwartz)}) — ปรับขนาดตามแหล่งอ้างอิงเด็ก`);
  }
  // ---- เด็ก: ไม่ควรเกินขนาดสูงสุดของผู้ใหญ่
  if(pt.isPed&&D!=null&&F!=null){ let cap=null;
    if(d.adult) cap={d:d.adult.d,t:d.adult.t,txt:d.adult.txt};
    else { const v0=variantsOf(d).slice(-1)[0]; const b=v0&&v0.bands&&v0.bands.find(b=>b.hi>=999&&!b.kg&&!b.avoid&&!b.nodata); if(b) cap={d:b.d,t:Array.isArray(b.t)?b.t[1]:b.t,txt:b.txt}; }
    if(cap&&((cap.d&&D>cap.d*1.05)||(cap.t&&T>cap.t*1.05))) add('warn',`เด็กได้ ${fmtN(D)} ${unitTxt(d)}/ครั้ง (${fmtN(T)}/วัน) เกินขนาดสูงสุดของผู้ใหญ่ (${cap.txt})`); }
  // ---- renal (adult)
  else if((d.renal||d.variants)&&D!=null&&F!=null){
    const vs=variantsOf(d);
    const evs=vs.map(v=>{const b=pickBand(v,pt);return{v,b,c:b?checkBand(b,D,T,pt):null}});
    if(evs.every(e=>!e.b)){add('warn',(vs[0].basis==='egfr'?'ไม่มี eGFR — กรอก eGFR จาก HIS หรือ อายุ+SCr':'ไม่มี CrCl — กรอก CrCl จาก HIS หรือ อายุ+น้ำหนัก+SCr')+' เพื่อตรวจขนาดยาตามไต');}
    else{
      hit=true;
      const first=evs[0];
      const okIdx=evs.findIndex(e=>e.c&&e.c.s==='ok');
      const where=first.b?first.b.where:'';
      const sug=evs.filter(e=>e.b).map(e=>(vs.length>1?`[${e.v.name}] `:'')+e.b.txt+(e.b.rx?` → สั่ง ${e.b.rx}`:'')).join(' | ');
      res.sugg={where,txt:sug,rx:first.b?first.b.rx:null};
      if(okIdx===0){ add('ok',`${where}: ขนาดเหมาะสม (${first.b.txt})`,'renal');
        if(ATB_IDS.includes(d.id)&&!row.prn){ const md=minDaily(first.b.txt); if(md){ const need=md.kg?(pt.dw?md.v*pt.dw:null):md.v;
          if(need&&T<need*0.75) add('warn',`dose อาจต่ำเกินไป: ${fmtN(T)} ${unitTxt(d)}/วัน < ขนาดต่ำสุดที่แนะนำ ${fmtN(need)}/วัน (${first.b.txt}${first.b.rx?` → สั่ง ${first.b.rx}`:''})`,'low'); } } }
      else if(okIdx>0) add('warn',`${where}: ตรงกับขนาดสำหรับ "${evs[okIdx].v.name}" — ยืนยันข้อบ่งใช้ (ถ้าเป็น ${vs[0].name}: ${first.b.txt})`,'renal');
      else{
        const worst=evs.filter(e=>e.c).sort((a,b)=>LV[a.c.s]-LV[b.c.s])[0]||first;
        add(worst.c.s,`${where}: ${worst.c.why}${worst.c.s!=='ok'?' → แนะนำ '+sug:''}`,'renal');
      }
      evs.forEach(e=>{if(e.b&&e.b.warnAlways&&e===evs[Math.max(okIdx,0)])add('warn',e.b.warnAlways)});
    }
  }
  // ---- adult fixed max
  if(!pt.isPed&&d.adult&&D!=null&&F!=null&&!useTB){hit=true;
    if(D>d.adult.d*1.05||T>d.adult.t*1.05) add(d.adult.warnOnly?'warn':'flag',`${d.adult.warnOnly?'เกินขนาดตามฉลาก':'เกินขนาดสูงสุด'} (${fmtN(D)} ${unitTxt(d)}/ครั้ง, ${fmtN(T)}/วัน) → ${d.adult.txt}`);
    else add('ok',d.adult.txt);
  }
  // ---- warn rules (CrCl cut-offs)
  if(d.warn&&!pt.isPed){const cr=pt.dial?0:pt.crcl;
    for(const w of d.warn){ if(w.mode){if(pt.dial===w.mode){add(w.lvl,w.msg);hit=true;break;}continue;}
      if(cr!=null&&cr<w.crcl){add(w.lvl,w.msg);hit=true;break;} }
    if(pt.crcl==null&&!pt.dial&&d.warn.some(w=>w.crcl)) add('info','ไม่มี CrCl — ตรวจเกณฑ์ไตไม่ได้');
  }
  // ---- specials
  if(d.special) {hit=true;evalSpecial(d,row,D,F,T,pt,add,rows);}
  if(pt.dial==='HD'&&(d.hdNote||d.renal?.hdNote)) add('info',d.hdNote||d.renal.hdNote);
  if(d.note) add('info',d.note);
  if(d.verify) add('info','⚑ ทวนสอบข้อมูลต้นฉบับ: '+d.verify);
  // ---- patient-level
  if(+pt.age>=65&&d.elderly){add(/ห้ามใช้/.test(d.elderly)?'flag':'warn','ผู้สูงอายุ: '+d.elderly);hit=true;}
  if(pt.preg&&d.preg){add('flag','ตั้งครรภ์: '+d.preg);hit=true;}
  alChk(d.name); extChk();
  // ---- duplication
  const others=rows.filter(r=>r!==row&&r.drugId).map(r=>KB.find(x=>x.id===r.drugId)).filter(Boolean);
  if(others.some(o=>o.id===d.id)) add('warn','สั่งยาตัวเดียวกันซ้ำ');
  else if(d.cls&&others.some(o=>o.cls===d.cls)&&!['metro','clinda'].includes(d.cls)) add('warn',`ยากลุ่มเดียวกันซ้ำซ้อน (${CLS_NAME[d.cls]||d.cls}): ${others.filter(o=>o.cls===d.cls).map(o=>o.name).join(', ')}`);
  for(const [a,b,msg] of DUP_PAIRS){ if((d.cls===a&&others.some(o=>o.cls===b))||(d.cls===b&&others.some(o=>o.cls===a))) add('warn',msg); }
  if(d.comp){ for(const o of others.filter(o=>o.comp)){ const sh=d.comp.filter(c=>o.comp.includes(c));
      if(sh.length) add('warn',`ยาพ่นซ้ำซ้อนกลุ่ม ${sh.map(c=>COMP_NAME[c]).join('+')}: ${o.name}`);
      else if((d.comp.includes('lama')&&o.comp.includes('sama'))||(d.comp.includes('sama')&&o.comp.includes('lama'))) add('warn',`Anticholinergic ซ้ำซ้อน (LAMA + SAMA): ${o.name}`); } }
  for(const [a,b,msg] of DUP_SPECIAL){ if((d.id===a&&others.some(o=>o.cls===b))||(d.cls===b&&others.some(o=>o.id===a))) add('warn',msg); }
  const lv=items.filter(i=>i.lvl!=='info').reduce((m,i)=>Math.max(m,LV[i.lvl]),-1);
  res.status = lv===3?'flag':lv===2?'warn':lv>=0||hit?'ok':'none';
  return res;
}

function evalTB(d,D,F,pt,add,res){
  const adult=!pt.isPed, r=adult?d.tb.adult:d.tb.ped, bw=+pt.bw;
  if(!r){add('info','ไม่มีกฎ TB สำหรับกลุ่มอายุนี้');return}
  if(!(bw>0)){add('warn','ยา TB คิดตามน้ำหนัก — กรอกน้ำหนักผู้ป่วย');return}
  const day = F>=0.95 ? D*F : D;
  let tb=null; if(adult&&r.bandsWt) tb=r.bandsWt.find(b=>bw>=b[0]&&bw<b[1])||null;
  const tab=tb?tb[2]:null, calc=tb?!!tb[3]:false;
  const lo=r.kg?r.kg[0]*bw:null, hi=r.kg?Math.min(r.kg[1]*bw,r.max):r.max;
  const rng=r.kg?`${r.kg[0]}-${r.kg[1]} mg/kg = ${r0(lo)}-${r0(hi)} mg (max ${r.max})`:'';
  const wlab=tb?(tb[0]===0?`<${tb[1]}`:tb[1]>=999?`≥${tb[0]}`:`${tb[0]}-${tb[1]-1}`)+' kg':'';
  const exp = calc ? `ตาราง ${wlab}: ${tab!=null?tab+' mg หรือ ':''}คำนวณตามน้ำหนัก ${rng}` : tab!=null?`ตาราง ${wlab}: ${tab} mg/วัน`:rng;
  res.sugg={where:`TB ${adult?'≥15 ปี':'เด็ก'} BW ${bw} kg`,txt:exp};
  const inRange=r.kg&&day>=lo*0.9&&day<=hi*1.1, onTab=tab!=null&&Math.abs(day-tab)<=0.12*tab;
  if(day>r.max*1.02) add('flag',`TB: ${r0(day)} mg/ครั้ง เกิน max ${r.max} mg → ${exp}`);
  else if(onTab) add('ok',`TB: ${r0(day)} mg ตรงตามตาราง ${wlab}`);
  else if(calc&&inRange) add('ok',`TB: ${r0(day)} mg (${r1(day/bw)} mg/kg) คำนวณตามน้ำหนัก ${rng}`);
  else if(inRange) add(tab!=null?'warn':'ok',`TB: ${r0(day)} mg (${r1(day/bw)} mg/kg) อยู่ในช่วง ${rng}${tab!=null?` แต่ต่างจากตาราง ${wlab} (${tab} mg)`:''}`);
  else if(r.kg&&day<lo*0.9) add('warn',`TB: dose ต่ำเกินไป ${r0(day)} mg (${r1(day/bw)} mg/kg) → ${exp}`);
  else if(tab!=null&&day<tab) add('warn',`TB: dose ต่ำเกินไป ${r0(day)} mg → ${exp}`);
  else add('flag',`TB: ${r0(day)} mg ไม่ตรงคำแนะนำ → ${exp}`);
  if(F>1.05) add('warn','ยา TB ควรให้วันละครั้ง (ไม่แบ่งให้)');
  if(adult&&r.renal3x){
    if(pt.dial==='CAPD'){ if(r.capd) add('warn',r.capd); }
    else{
      const cut=r.renalCut||30; const low=pt.crcl!=null&&(r.renalLt?pt.crcl<cut:pt.crcl<=cut); const imp = pt.dial==='HD'||pt.dial==='CRRT'||low;
      if(imp){ if(F>=0.9) add('flag',`${pt.dial||'CrCl ≤'+cut}: ขนาดเดิม ปรับเป็น 3 ครั้ง/สัปดาห์${pt.dial==='HD'?' ให้หลังฟอกเท่านั้น':''}`);
        else if(Math.abs(F-3/7)<0.05) add('ok','ปรับเป็น 3 ครั้ง/สัปดาห์ ตามการทำงานของไตแล้ว');
        else add('warn','ความถี่ไม่ตรงคำแนะนำ (ควร 3 ครั้ง/สัปดาห์)'); }
      else if(F<0.9&&pt.crcl!=null) add('warn','ให้ 3 ครั้ง/สัปดาห์ ทั้งที่ CrCl >'+cut+' — ตรวจสอบ');
      else if(pt.crcl==null&&!pt.dial) add('info','ไม่มี CrCl — ถ้า CrCl ≤30 ต้องปรับเป็น 3 ครั้ง/สัปดาห์');
    }
  }
  if(adult&&r.renalNo&&(pt.dial||(pt.crcl!=null&&pt.crcl<=30))) add('ok','CrCl ≤30/HD: ไม่ต้องปรับขนาด (ตามตาราง TB)');
  if(!adult&&r.renalPed&&pt.schwartz!=null&&pt.schwartz<50) add('warn','เด็กไตบกพร่อง: '+r.renalPed);
}

const VITD_AGE=[[0,1,400,2000,2000],[1,12,600,3000,6000],[12,99,600,6000,6000]];
function evalPed(d,row,D,F,pt,add,res){
  if(d.peds.type==='age'){ const age=+pt.age; const b=VITD_AGE.find(x=>age>=x[0]&&age<x[1]); const T=D*F;
    if(!b){add('warn','ใส่อายุเพื่อตรวจขนาด vitamin D');return}
    const lab=`${b[0]===0?'<1':b[1]===99?'>12':'1-12'} ปี`; res.sugg={where:`อายุ ${lab}`,txt:`ป้องกัน ${b[2]} IU/วัน · รักษา ${b[3]===b[4]?b[3]:b[3]+'-'+b[4]} IU/วัน`};
    const tTxt=`${r0(T)} IU/วัน${F<0.9?' (เฉลี่ย)':''}`;
    if(T>b[4]*1.1) add('flag',`Vitamin D: ${tTxt} สูงกว่าขนาดรักษา (${lab}: ${b[3]===b[4]?b[3]:b[3]+'-'+b[4]} IU/วัน) — ถ้าเป็น stoss dose ครั้งเดียว: <1 ปี 50,000, 1-12 ปี 150,000, >12 ปี 300,000 IU`);
    else if(T>=b[3]*0.9) add('ok',`Vitamin D: ${tTxt} = ขนาดรักษา (${lab}) — ให้ ≥12 สัปดาห์ ร่วม Ca 500 mg/วัน แล้วลดเป็น ${b[2]} IU/วัน`);
    else if(T>=b[2]*0.9&&T<=Math.max(b[2]*1.1,1000)) add('ok',`Vitamin D: ${tTxt} = ขนาดป้องกัน/คงระดับ (${lab}: ${b[2]} IU/วัน)`);
    else if(T<b[2]*0.75) add('warn',`Vitamin D: ${tTxt} ต่ำกว่าขนาดป้องกัน (${lab}: ${b[2]} IU/วัน)`);
    else add('warn',`Vitamin D: ${tTxt} อยู่ระหว่างขนาดป้องกัน (${b[2]}) และขนาดรักษา (${b[3]}) — ยืนยันข้อบ่งใช้`);
    const form=d.forms&&row.formIdx>=0?d.forms[row.formIdx]:null; if(form&&form[3]==='ml') add('info',`${b[2]} IU = ${r1(b[2]/form[2])} ml · ${b[3]} IU = ${r1(b[3]/form[2])} ml`);
    return; }
  const p=d.peds, bw=pt.dw||+pt.bw; if(!(bw>0)){add('warn','ต้องใส่น้ำหนัก');return}
  const form=d.forms&&row.formIdx>=0?d.forms[row.formIdx]:null, mlPer=form&&form[3]==='ml'?form[2]:null;
  const uu=(d.unit||'mg').replace(/^mg.*/,'mg'); const per=p.type==='dose'?D/bw:D*F/bw, lab=p.type==='dose'?`${uu}/kg/ครั้ง`:`${uu}/kg/วัน`;
  const [a,b]=p.kg, hi=p.kgHi||b;
  const rangeMg=p.type==='dose'?[a*bw,b*bw]:[a*bw/F,b*bw/F];
  const mlTxt=mlPer?` = ${r1(rangeMg[0]/mlPer)}-${r1(rangeMg[1]/mlPer)} ml/ครั้ง`:'';
  res.sugg={where:`เด็ก BW ${r1(bw)} kg`,txt:`${a}-${b} ${lab} → ${fmtN(rangeMg[0])}-${fmtN(rangeMg[1])} ${uu}/ครั้ง${mlTxt} (ที่ความถี่ ${freqLabel(F)})`};
  const cur=`${fmtN(per)} ${lab}`;
  if(per>hi*1.1) add('flag',`เด็ก: ${cur} สูงเกิน → ${res.sugg.txt}`);
  else if(per>b*1.1) add('warn',`เด็ก: ${cur} สูงกว่าขนาดปกติ — ใช้ได้ถ้าเป็นข้อบ่งใช้: ${p.note}`);
  else if(per<a*0.9) add('warn',`เด็ก: ${cur} ต่ำเกินไป → ${res.sugg.txt}`);
  else add('ok',`เด็ก: ${cur} อยู่ในช่วง ${a}-${b}${p.zones?' — '+((p.zones.find(z=>per>=z[0]&&per<z[1])||[])[2]||''):''}`);
  if(p.max&&D*F>p.max*1.02) add('flag',`เกิน max ${p.max} mg/วัน`);
  if(p.maxKgDay&&D*F/bw>p.maxKgDay*1.05) add('flag',`เกิน max ${p.maxKgDay} mg/kg/วัน`);
  if(mlPer&&!/drop/i.test(form[1])){const ml=D/mlPer; const q=Math.round(ml/1.25)*1.25; if(ml>=1.25&&Math.abs(ml-q)>0.15) add('info',`ปริมาตร ${r1(ml)} ml/ครั้ง — ตวงยาก ปัดเป็น ${r1(q)} ml (¼ ช้อนชา = 1.25 ml)`); }
}

function warfDI(row,rows){ const out=[];
  for(const r of rows){ if(r===row||r.drugId==='warfarin') continue;
    const mm=masterOf(r), txt=r.raw+' '+(mm?mm[1]+' '+mm[2]:'');
    for(const w of WARF_DI){ const m=txt.match(w.re); if(m&&!out.some(o=>o.w===w&&o.r===r)) out.push({...w,w,r,found:(KB.find(x=>x.id===r.drugId)||{}).name||w.name}); } }
  return out;}
function evalLock(row,d,pt,add,res){
  const L=row.raw, a=d&&ALT[d.id];
  if(d&&d.id==='heparin'){ add('info','Heparin ใน antibiotic lock — ตรวจความเข้มข้นที่รายการยาปฏิชีวนะ'); res.status='ok'; return res; }
  if(!a){ add('warn',`Antibiotic lock: ไม่มี ${d?d.name:'ยานี้'} ในตาราง ALT ของ รพ. — ตรวจความเข้มข้นเอง`); res.status='warn'; return res; }
  const lockV=(L.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)(?!\s*\/)(?![^+]*hep)/gi)||[]).map(s=>parseFloat(s)).pop()||null;
  let conc=null; const cm=L.match(/(\d+(?:\.\d+)?)\s*mg(?:\s*\(?tm[pt]\)?)?\s*\/\s*ml/i);
  if(cm) conc=+cm[1]; else { const mg=L.match(/(\d+(?:\.\d+)?)\s*mg(?!\s*\/)/i); if(mg&&lockV) conc=+mg[1]/lockV; }
  let hep=null; const hm=L.match(/hep\w*[^\d]{0,12}([\d,]+(?:\.\d+)?)\s*(?:u|unit|units|iu)\s*\/\s*ml/i)||L.match(/([\d,]+)\s*(?:u|unit|units|iu)\s*\/\s*ml/i);
  if(hm) hep=+hm[1].replace(/,/g,''); else { const ht=L.match(/hep\w*[^\d]{0,12}([\d,]+)\s*(?:u|unit|units|iu)(?!\s*\/)/i); if(ht&&lockV) hep=+ht[1].replace(/,/g,'')/lockV; }
  const std=[a,a.alt].filter(Boolean), rng=x=>Array.isArray(x.c)?x.c:[x.c*0.85,x.c*1.15];
  const tgt=std.map(s=>`${Array.isArray(s.c)?s.c.join('-'):s.c} mg/ml${s.hep?` + heparin ${s.hep.toLocaleString()} u/ml`:' (ไม่ผสม heparin)'}`).join(' หรือ ');
  res.sugg={where:'Antibiotic lock 5 ml',txt:tgt};
  if(conc==null) add('warn',`Antibiotic lock: อ่านความเข้มข้นไม่ได้ — ตาราง รพ.: ${tgt}`);
  else { const s=std.find(s=>{const [lo,hi]=rng(s);return conc>=lo&&conc<=hi;});
    if(s){ add('ok',`Antibiotic lock ${d.name} ${fmtN(conc)} mg/ml ตรงตาราง`);
      if(hep!=null&&s.hep&&Math.abs(hep-s.hep)/s.hep>0.15) add('warn',`Heparin ${fmtN(hep)} u/ml — ตาราง รพ. ${s.hep.toLocaleString()} u/ml`);
      if(hep!=null&&hep>0&&!s.hep) add('warn','สูตรนี้ไม่ผสม heparin (no additives)');
      if(hep==null&&s.hep) add('info',`ไม่ระบุ heparin — ตาราง รพ. ${s.hep.toLocaleString()} u/ml`); }
    else add('flag',`Antibiotic lock ${d.name} ${fmtN(conc)} mg/ml ไม่ตรงตาราง รพ. (${tgt})`); }
  if(a.prep) add('info','วิธีเตรียม 5 ml: '+a.prep);
  if(a.note) add('info',a.note);
  add('info',ALT_GEN);
  const lv=items_lv(res.items); res.status=lv===3?'flag':lv===2?'warn':'ok'; return res;}
const items_lv=items=>items.filter(i=>i.lvl!=='info').reduce((m,i)=>Math.max(m,LV[i.lvl]),-1);

/* แปลงสูตร warfarin (mg ต่อวัน จ–อา) เป็นเม็ด 3 mg ของ รพ.มค (แบ่งได้ครึ่งเม็ด = 1.5 mg) ให้ mg/สัปดาห์ใกล้เดิมที่สุด */
const WF_HOSP=3;
function wfTo3(mg){ const step=WF_HOSP/2; let u=mg.map(x=>Math.round((x||0)/step)*0.5);
  const W=mg.reduce((a,x)=>a+(x||0),0); const sum=()=>u.reduce((a,x)=>a+x*WF_HOSP,0);
  for(let it=0;it<14;it++){ const d=W-sum(); if(Math.abs(d)<step/2+1e-9) break; const sg=Math.sign(d);
    let best=-1,bv=-Infinity; mg.forEach((x,i)=>{ if(sg<0&&u[i]<=0) return; if((x||0)===0&&sg>0) return; const v=((x||0)-u[i]*WF_HOSP)*sg; if(v>bv){bv=v;best=i;} });
    if(best<0) break; u[best]+=0.5*sg; }
  const W3=sum(); return {u,W,W3,pct:W?(W3-W)*100/W:0,exact:mg.every((x,i)=>Math.abs((x||0)-u[i]*WF_HOSP)<1e-9)};}
function evalSpecial(d,row,D,F,T,pt,add,rows=[]){
  switch(d.special){
    case 'warfarin':
      { const s=row.weekly?row.weekly.mgU:(row.strength||null);
        if(s&&Math.abs(s-WF_HOSP)>1e-9){ let txt=`Warfarin ${s} mg ไม่มีใน รพ.มค (มีเฉพาะ ${WF_HOSP} mg)`;
          if(row.weekly){ const WDx=['Mo','Tu','We','Th','Fr','Sa','Su'], per={}; row.weekly.segs.filter(x=>!x.noDays&&x.units!=null).forEach(x=>x.days.forEach(dd=>per[dd]=x.units*s));
            const c=wfTo3(WDx.map(dd=>per[dd]||0)); txt+=` — เทียบเป็นเม็ด ${WF_HOSP} mg: ${WDx.map((dd,i)=>`${DAY_TH[dd]} ${fmtN(c.u[i])}`).join(' ')} = ${fmtN(c.W3)} mg/สัปดาห์ (เดิม ${fmtN(c.W)} mg, ${c.pct>=0?'+':''}${fmtN(c.pct)}%)`; }
          else if(D!=null){ const exact=Math.abs(D/WF_HOSP*2-Math.round(D/WF_HOSP*2))<1e-9; txt+=` — ${fmtN(D)} mg = ${fmtN(D/WF_HOSP)} เม็ด ${WF_HOSP} mg${exact?'':' (แบ่งครึ่งเม็ดไม่ได้พอดี)'}`;
            if(!exact&&F!=null&&Math.abs(F-1)<0.01){ const c=wfTo3(Array(7).fill(D)); txt+=` · สูตรสัปดาห์ด้วยเม็ด ${WF_HOSP} mg: ${['จ','อ','พ','พฤ','ศ','ส','อา'].map((dd,i)=>`${dd} ${fmtN(c.u[i])}`).join(' ')} = ${fmtN(c.W3)} mg/สัปดาห์ (เดิม ${fmtN(c.W)} mg, ${c.pct>=0?'+':''}${fmtN(c.pct)}%)`; } }
          add('warn',txt+' — ยืนยันสูตรกับแพทย์ / ดูแท็บ Warfarin'); } }
      if(pt.inr==null) add('warn','ไม่มีค่า INR — ประสานแพทย์เจาะ INR ก่อนรับยาทุกครั้ง');
      else if(pt.inr>=4) add('flag',`INR ${pt.inr} — ประสานแพทย์ก่อนจ่ายยา`);
      else if(pt.inr>3) add('warn',`INR ${pt.inr} สูงกว่าเป้าหมายทั่วไป (2-3) — ยืนยันขนาดกับแพทย์`);
      else add('ok',`INR ${pt.inr}`);
      { const hits=warfDI(row,rows);
        hits.forEach(h=>add('flag',`DI Warfarin + ${h.found} (${h.eff}): ${h.mg} · ติดตาม: ${h.mon||WDI_SHORT} — consult แบบฟอร์ม DI warfarin`));
        if(!hits.length) add('info','ไม่พบคู่ DI warfarin ในทะเบียน รพ. (14 กลุ่ม) ในใบสั่งนี้ — ตรวจยาเดิมของผู้ป่วยด้วย'); }
      break;
    case 'apixaban':{
      const c=[]; if(+pt.age>=80)c.push('อายุ ≥80'); if(+pt.bw>0&&+pt.bw<=60)c.push('BW ≤60 kg'); if(+pt.scr>=1.5)c.push('SCr ≥1.5');
      const reduce=c.length>=2, expD=reduce?2.5:5;
      if(D==null||F==null) break;
      if(D>expD*1.05||T>expD*2*1.05) add('flag',`Apixaban: เข้าเกณฑ์ลดขนาด ${c.length}/3 (${c.join(', ')||'–'}) → ควร ${expD} mg BID`);
      else if(!reduce&&D<4) add('warn',`Apixaban: เข้าเกณฑ์ลดขนาดเพียง ${c.length}/3 — ขนาด 2.5 mg อาจต่ำเกินไป (ปกติ 5 mg BID)`);
      else add('ok',`Apixaban ${expD} mg BID (เกณฑ์ลดขนาด ${c.length}/3)`);
      break;}
    case 'digoxin':
      if(pt.k==null) add('info','ไม่มีค่า K — ระวังใช้ใน K <3.5'); else if(pt.k<3.5) add('warn',`K ${pt.k} <3.5 — ระวัง digoxin toxicity`);
      break;
    case 'kcl':
      if(pt.k==null) add('warn','ไม่มีค่า K ในระบบ — โทรถามค่า lab จากหอผู้ป่วย'); else if(pt.k>=5) add('flag',`K ${pt.k} — ยืนยันข้อบ่งใช้ KCl`); else add('ok',`K ${pt.k}`);
      add('info','HAD: ตรวจ conc/rate ในแท็บ "คำนวณ HAD" (peripheral ≤80 mEq/L, ≤10 mEq/h)');
      break;
    case 'mgso4':
      if(pt.crcl!=null&&pt.crcl<25||pt.dial) add('flag','MgSO4: ห้ามใช้เมื่อ CrCl <25 ml/min');
      if(pt.mg==null) add('warn','ไม่มีค่า Mg — ตรวจค่า lab');
      add('info','HAD: max 4 g/h, 40 g/day, conc ≤200 mg/ml — คำนวณในแท็บ HAD');
      break;
    case 'had': add('info','HAD: ตรวจข้อบ่งใช้ + คำนวณ conc/rate/max ในแท็บ "คำนวณ HAD" แล้ว note "ok (check2)"'); break;
    case 'dtg':{
      const ind=rows.filter(r=>r!==row).map(r=>r.drugId).filter(id=>['rifam','rifinah','phenytoin','efvfdc','phenobarb'].includes(id));
      if(D!=null&&F!=null){ const T2=D*F;
        if(ind.length&&T2<95) add('flag',`ใช้ร่วม ${ind.map(i=>KB.find(k=>k.id===i).name).join(', ')}: DTG ต้องเป็น 50 mg q12h (ให้ต่อหลังหยุด inducer 2 สัปดาห์)`);
        else if(!ind.length&&T2>55) add('warn','DTG 50 mg q12h ใช้เฉพาะเมื่อใช้ร่วม inducer (Rifampicin, Phenytoin, EFV) หรือดื้อ INSTI — ยืนยันข้อบ่งใช้');
        else add('ok',ind.length?'DTG 50 mg q12h เหมาะกับการใช้ร่วม inducer':'DTG 50 mg q24h'); }
      break;}
    case 'vite':{ const bw=pt.dw||+pt.bw; if(D!=null&&F!=null&&bw>0&&rows.some(r=>r!==row&&r.drugId==='ferrous')&&D*F/bw>4.5) add('warn',`Vit E ${r1(D*F/bw)} unit/kg/วัน (>4.5) ร่วมกับธาตุเหล็ก — อาจทำให้ตอบสนองต่อการรักษาภาวะขาดเหล็กช้าลง`); break;}
    case 'tri': if(pt.isPed) add('warn','Triferdine เป็นยาบำรุงครรภ์ (มีไอโอดีน/โฟลิก) ไม่ใช่สูตรสำหรับเด็ก — ยืนยันกับแพทย์'); break;
    case 'antidote': add('warn','Trigger tool: มีการสั่ง antidote — ส่งระบบ Notify ทันที'); break;
  }
}

/* ---------- HAD calc ---------- */
function hadCalc(key,inp){
  const h=HAD[key], out={checks:[],h}; const bw=+inp.bw, amt=+inp.amt, vol=+inp.vol, rate=+inp.rate;
  if(!(amt>0&&vol>0&&rate>=0)) return out;
  const add=(lvl,txt)=>out.checks.push({lvl,txt});
  const conc=amt/vol; out.conc=conc; // drug unit per ml
  out.perH=conc*rate; out.perDay=out.perH*24; out.volDay=rate*24;
  if(h.dose==='mcgkgmin'){ if(bw>0){out.dose=conc*1000*rate/(bw*60); out.doseU='mcg/kg/min';
      const ok=out.dose>=h.range[0]&&out.dose<=h.range[1];
      if(out.dose>h.max) add('flag',`Dose ${fmtN(out.dose)} mcg/kg/min เกิน max ${h.max} mcg/kg/min (ช่วงปกติ ${h.range[0]}-${h.range[1]})`);
      else if(!ok) add('warn',`Dose ${fmtN(out.dose)} mcg/kg/min ${out.dose<h.range[0]?'ต่ำกว่า':'สูงกว่า'}ช่วงที่เหมาะสม ${h.range[0]}-${h.range[1]} mcg/kg/min (max ${h.max})`);
      else add('ok',`Dose ${fmtN(out.dose)} mcg/kg/min อยู่ในช่วงที่เหมาะสม ${h.range[0]}-${h.range[1]} mcg/kg/min (max ${h.max})`);
      out.maxRate=h.range[1]*bw*60/(conc*1000);
    } else add('warn','ใส่น้ำหนักผู้ป่วยเพื่อคำนวณ mcg/kg/min'); }
  if(h.dose==='mgh'){out.dose=out.perH;out.doseU='mg/h'; if(out.dose>h.max) add('flag',`${fmtN(out.dose)} mg/h เกิน max ${h.max}`); else add('ok',`${fmtN(out.dose)} mg/h (ช่วง ${h.range[0]}-${h.range[1]})`);}
  if(h.dose==='mcgh'){out.dose=out.perH;out.doseU='mcg/h';
    if(bw>0){ const kh=out.perH/bw; out.doseKg=kh; const r=h.rangeKgH;
      if(r){ if(kh>r[1]) add('warn',`${fmtN(kh)} mcg/kg/h สูงกว่าช่วงทั่วไป ${r[0]}–${r[1]} mcg/kg/h`); else if(kh<r[0]) add('warn',`${fmtN(kh)} mcg/kg/h ต่ำกว่าช่วงทั่วไป ${r[0]}–${r[1]} mcg/kg/h`); else add('ok',`${fmtN(kh)} mcg/kg/h อยู่ในช่วง ${r[0]}–${r[1]} mcg/kg/h`);
        out.maxRate=r[1]*bw/conc; } else add('info',`${fmtN(kh)} mcg/kg/h`); }
    else add('warn','ใส่น้ำหนักผู้ป่วยเพื่อคำนวณ mcg/kg/h');
    if(h.maxConcMcg){ if(conc>h.maxConcMcg*1.01) add('flag',`Conc ${fmtN(conc)} mcg/ml เกิน ${h.maxConcMcg} mcg/ml (ความเข้มข้นยาไม่เจือจาง) — ตรวจการอ่านคำสั่ง`); else add('ok',`Conc ${fmtN(conc)} mcg/ml ≤ ${h.maxConcMcg} mcg/ml`); } }
  if(h.dose==='meqh'){out.dose=out.perH;out.doseU='mEq/h'; const L=conc*1000; out.concTxt=`${fmtN(L)} mEq/L`;
    const lim=inp.line==='central'?[150,40]:inp.line==='restrict'?[200,40]:[80,10];
    const lt=inp.line==='central'?'central':inp.line==='restrict'?'จำกัดน้ำ (fluid restrict)':'peripheral', ks='(ป้าย KCl รพ.: peripheral ≤80 mEq/L, ≤10 mEq/h · central ≤150 mEq/L, ≤40 mEq/h · fluid restrict ≤200 mEq/L)';
    if(L>lim[0]) add('flag',`Conc ${fmtN(L)} mEq/L เกิน ${lim[0]} mEq/L ของ ${lt} ${ks}`); else add('ok',`Conc ${fmtN(L)} mEq/L ≤ ${lim[0]} mEq/L (${lt})`);
    if(out.perH>lim[1]) add('flag',`Rate ${fmtN(out.perH)} mEq/h เกิน ${lim[1]} mEq/h ของ ${lt} ${ks}`); else add('ok',`Rate ${fmtN(out.perH)} mEq/h ≤ ${lim[1]} mEq/h (${lt})`);}
  if(h.dose==='gh'){out.dose=out.perH;out.doseU='g/h'; const mgml=conc*1000; out.concTxt=`${fmtN(mgml)} mg/ml`;
    if(out.perH>h.max) add('flag',`Rate ${fmtN(out.perH)} g/h เกิน 4 g/h`); else add('ok',`Rate ${fmtN(out.perH)} g/h ≤ 4`);
    if(mgml>h.maxConc) add('flag',`Conc ${fmtN(mgml)} mg/ml เกิน 200 mg/ml`);
    if(out.perDay>h.maxDay) add('flag',`ต่อวัน ${fmtN(out.perDay)} g เกิน 40 g/day`); if(inp.crcl!=null&&inp.crcl<25) add('flag','CrCl <25: ห้ามใช้');}
  if(h.dose==='uh'){out.dose=out.perH;out.doseU='unit/h'; if(bw>0) add('info',`${fmtN(out.perH/bw)} unit/kg/h`);
    if(out.perH>h.max) add('flag',`${r0(out.perH)} unit/h เกิน 2,000 unit/h`); else add('ok',`${r0(out.perH)} unit/h ≤ 2,000`);
    if(out.perDay>h.maxDay) add('flag',`ต่อวัน ${r0(out.perDay)} unit เกิน 48,000`);
    const ind=HEP_IND[inp.hepInd]; if(ind&&bw>0){const init=Math.min(ind[3]*bw,ind[4]);const bol=Math.min(ind[1]*bw,ind[2]);
      add(out.perH>init*1.05?'warn':'ok',`${ind[0]}: bolus ${ind[1]} u/kg = ${r0(bol)} u (max ${r0(ind[2])}), เริ่ม ${ind[3]} u/kg/h = ${r0(init)} u/h (max ${r0(ind[4])})`);}}
  if(h.maxConc&&h.dose==='mcgkgmin'){ if(conc>h.maxConc*1.01) add('flag',`Conc ${fmtN(conc)} mg/ml เกิน max ${h.maxConc} mg/ml`);
    else if(h.periph!=null){ const c=`Conc ${fmtN(conc)} mg/ml`, std=`(คู่มือ HAD รพ.: peripheral ≤ ${h.periph} mg/ml · central ≤ ${h.maxConc} mg/ml)`;
      if(conc<=h.periph*1.01) add('ok',`${c} ให้ทาง peripheral หรือ central ได้ ${std}`);
      else if(inp.line==='central') add('ok',`${c} ≤ ${h.maxConc} mg/ml ให้ทาง central line ได้ ${std}`);
      else if(inp.line==='peripheral') add('warn',`${c} เกินขนาดที่ให้ทาง peripheral (≤ ${h.periph} mg/ml) — ให้ทาง central line หรือเจือจางให้ ≤ ${h.periph} mg/ml ${std}`);
      else add('warn',`${c} สูงกว่าที่ให้ทาง peripheral ได้ (≤ ${h.periph} mg/ml) — ยืนยันว่าให้ทาง central line ${std}`); } }
  if(h.maxDay&&h.dose==='mcgkgmin'&&out.perDay>h.maxDay) add('flag',`ต่อวัน ${fmtN(out.perDay)} mg เกิน ${h.maxDay} mg/day`);
  // dispensing
  const per1=inp.amp||h.amp; out.ampDay=out.perDay/per1; out.ampTxt=inp.ampTxt||h.ampTxt;
  if(!['fenta','kcl','mg','hep'].includes(key)&&rate>0){
    // ห้องยาเลือกถุงที่มีจริง (100 / 250 ml) ให้พอใช้ 24 ชม. แล้วใส่ยาให้ได้ความเข้มข้นเท่าคำสั่ง
    // ยาที่เปิดแล้วไม่แบ่งข้ามถุง → ปัด amp ขึ้นต่อถุง · เลือกชุดถุง (250/100 ml ผสมกันได้) ที่ใช้ยาน้อยที่สุด
    const ampPer=bag=>{let p=bag*conc/per1; return h.tenth?Math.ceil(p/10-1e-9)*10:Math.ceil(p-1e-9);};
    const cands=[]; for(let a=0;a<=12;a++) for(let b=0;b<=12;b++){ const v=a*250+b*100; if(!(a+b)||v<out.volDay-1e-9) continue;
      cands.push({a,b,v,amp:a*ampPer(250)+b*ampPer(100),bags:a+b}); }
    cands.sort((x,y)=>x.amp-y.amp||x.bags-y.bags||x.v-y.v);
    const best=cands[0]||{a:0,b:1,v:100,amp:ampPer(100),bags:1};
    const lab=c=>[c.a?`250 ml × ${c.a}`:'',c.b?`100 ml × ${c.b}`:''].filter(Boolean).join(' + ');
    const only250=cands.find(c=>c.b===0), only100=cands.find(c=>c.a===0);
    const main={bag:best.a&&!best.b?250:!best.a?100:'mix',n:best.bags,amp:best.amp,mg:best.v*conc,label:lab(best)};
    const alt=[only250,only100].filter(c=>c&&lab(c)!==lab(best)).map(c=>`${lab(c)} = ${c.amp} amp`).join(' · ');
    out.bottle=[main.label,'']; out.ampDispense=main.amp; out.alt=alt?{txt:alt}:null;
    out.prep=`ประหยัดยาสุด: สารน้ำ ${main.label} + ${h.name} ${main.amp} amp (${fmtN(conc)} ${h.u}/ml เท่าคำสั่ง)`;
    out.prepAlt=alt?`เทียบ: ${alt}`:'';
    if(vol===500) add('info','สารน้ำ 500 ml มีน้อย — พิจารณาเตรียม 250 ml × 2');
  } else out.ampDispense=Math.ceil(out.ampDay-1e-9);
  if(key==='fenta'&&out.ampDispense>30) add('warn','เกิน 30 amp — ใบ ยส.5 เบิกได้สูงสุด 30 amp/ใบ');
  return out;
}
if(typeof module!=='undefined') module.exports={calcPatient,parseLine,evaluate,hadCalc,KB,freqLabel,rowDose};
