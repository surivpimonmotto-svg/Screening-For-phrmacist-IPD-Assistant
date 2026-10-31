/* ===== rca.js — RCA เหตุการณ์ด้านยา: ด่านป้องกัน (Swiss cheese) · 5 Whys หลายสาย · ผังก้างปลา · Root cause RC1..n · Action plan · ตัวชี้วัด · แบบฟอร์ม =====
 ไม่เก็บชื่อ/HN ผู้ป่วย — เก็บในเครื่องนี้ (localStorage) และบันทึก/เปิดเป็นไฟล์ .json ได้
*/
const RCA_TYPES=[['PE','Prescribing error'],['TE','Transcribing error'],['PDE','Pre-dispensing error'],['DE','Dispensing error'],['AE','Administration error'],['ALG','แพ้ยาซ้ำ/แพ้ยากลุ่มเดียวกัน'],['ADR','ADR ที่ป้องกันได้'],['OTH','อื่นๆ']];
const RCA_SEV=[['A','A — มีโอกาสเกิด แต่ยังไม่เกิด'],['B','B — เกิด แต่ไม่ถึงผู้ป่วย'],['C','C — ถึงผู้ป่วย ไม่เกิดอันตราย'],['D','D — ถึงผู้ป่วย ต้องเฝ้าระวัง'],['E','E — อันตรายชั่วคราว ต้องรักษา'],['F','F — อันตรายชั่วคราว นอน รพ.นานขึ้น'],['G','G — อันตรายถาวร'],['H','H — ต้องช่วยชีวิต'],['I','I — เสียชีวิต']];
const FB_CAT=[['people','คน (Man)','ความรู้ ทักษะ ความเหนื่อยล้า ภาระงาน'],['method','วิธีการ/กระบวนการ (Method)','ขั้นตอน double check การส่งต่อ WI'],['machine','เครื่องมือ/IT (Machine)','HIS ระบบเตือน ปั๊ม ฉลาก'],['material','ยา/ฉลาก (Material)','LASA บรรจุภัณฑ์ ความแรงหลายขนาด'],['env','สิ่งแวดล้อม (Environment)','แสง เสียง สิ่งรบกวน การจัดวาง'],['comm','การสื่อสาร/นโยบาย (Management)','คำสั่งไม่ชัด ส่งเวร นโยบาย']];
const RCA_HINT={
 PE:[['people','ไม่ทราบค่าไต/น้ำหนักผู้ป่วยขณะสั่ง'],['people','ไม่ทราบประวัติแพ้ยา/กลุ่มยา'],['machine','ไม่มี CPOE / ระบบไม่ตรวจอัตโนมัติขณะสั่ง'],['method','ไม่มีการทบทวนยาเมื่อค่าไตเปลี่ยน'],['material','ชื่อการค้าไม่สื่อกลุ่มยา'],['comm','คำสั่งใช้ยาไม่ครบ/กำกวม']],
 TE:[['comm','ลายมือ/คำย่อไม่ชัด'],['method','ไม่มีการอ่านทวนคำสั่ง (read back)'],['machine','scan order ไม่ชัด'],['people','ภาระงานสูง เร่งรีบ'],['method','คีย์คำสั่งซ้ำ/ไม่ยกเลิกคำสั่งเดิม']],
 PDE:[['material','ยา LASA วางใกล้กัน'],['material','บรรจุภัณฑ์คล้ายกัน'],['method','ไม่มี double check ก่อนส่งต่อ'],['env','มีสิ่งรบกวนขณะจัดยา'],['machine','ฉลากยาพิมพ์ไม่ชัด/ผิด']],
 DE:[['material','ยา LASA (ชื่อ/รูปคล้าย)'],['material','ความแรงหลายขนาด'],['method','ไม่ตรวจสอบยาตามฉลากก่อนจ่าย'],['method','ไม่มี double check ยา HAD'],['people','ภาระงานสูง/อัตรากำลังไม่พอ'],['env','สิ่งรบกวนขณะจ่ายยา'],['machine','ระบบ barcode/scan ไม่ครอบคลุม']],
 AE:[['method','ไม่ตรวจสอบตัวผู้ป่วย 2 identifiers'],['people','คำนวณ rate/dilution ผิด'],['machine','ตั้งปั๊มผิด/ไม่มี smart pump'],['comm','ส่งเวรไม่ครบ'],['method','ไม่มี independent double check ยา HAD'],['env','ผู้ป่วยหนาแน่น/ย้ายเตียง']],
 ALG:[['machine','Alert แพ้ยาเป็น soft stop กดผ่านได้ปุ่มเดียว'],['machine','Alert ไม่แสดงความรุนแรง (เช่น Anaphylaxis)'],['method','ไม่ทวนสอบประวัติแพ้ยาเมื่อรับใหม่/รับย้าย'],['method','ไม่ยืนยันกับญาติเมื่อผู้ป่วยสื่อสารไม่ได้'],['material','ไม่มีสายรัดข้อมือ/ป้ายแพ้ยารุนแรง'],['people','ไม่ทราบว่ายาเป็นกลุ่มเดียวกัน (ชื่อการค้า)'],['comm','ทะเบียนแพ้ยาบันทึกเป็นรายตัว ไม่ระบุกลุ่ม/ความรุนแรง'],['people','alert fatigue / แรงกดดันเวลา']],
 ADR:[['method','ไม่ติดตาม lab ตามแนวทาง'],['people','ไม่ปรับขนาดตามไต/ตับ'],['method','ไม่ประเมิน DI'],['comm','ไม่ส่งต่อข้อมูลการเฝ้าระวัง']],OTH:[]};
const RCA_STR=[['strong','แข็งแรง (Strong)','เปลี่ยนระบบ/forcing function: hard stop, barcode, CPOE, แยกเก็บยา LASA, standardize'],['inter','ปานกลาง (Intermediate)','checklist, double check, เพิ่มอัตรากำลัง, ลดสิ่งรบกวน, software alert, ปรับฉลาก'],['weak','อ่อน (Weak)','อบรม, ตักเตือน, ออกนโยบาย/memo, ทบทวนขั้นตอนเดิม']];
const DEF_ST=[['hole','หลุด'],['part','บางส่วน'],['ok','กั้นได้'],['na','ไม่เกี่ยว']];
const RCA_DEF0=()=>[{n:'ด่านที่ 1 สั่งยา (แพทย์)',st:'',note:''},{n:'ด่านที่ 2 คัดกรอง/จ่ายยา (เภสัชกร)',st:'',note:''},{n:'ด่านที่ 3 บริหารยา (พยาบาล)',st:'',note:''},{n:'ด่านที่ 4 ตรวจพบ/แก้ไข',st:'',note:''}];
const RCA0=()=>({types:['DE'],type:'DE',date:'',ward:'',sev:'',drug:'',what:'',should:'',impact:'',prev:'',caus:'',seq:[{t:'',e:'',d:''}],def:RCA_DEF0(),why:[{c:'',w:'',b:''}],fb:{},rcs:[{id:'RC1',t:''}],root:'',contrib:'',acts:[{a:'',s:'inter',rc:'',who:'',due:''}],kpis:[{k:'',ty:'กระบวนการ',tg:'',src:''}],obs:'',pend:[{t:'',done:''}],lesson:'',team:'',by:''});
let RCA=RCA0();
function rcaMig(o){ const r={...RCA0(),...o}; if(!r.types||!r.types.length) r.types=[r.type||'DE']; if(!r.def||!r.def.length) r.def=RCA_DEF0(); if(!r.rcs||!r.rcs.length) r.rcs=[{id:'RC1',t:r.root||''}]; r.acts=(r.acts||[]).map(a=>({rc:'',...a})); r.why=(r.why||[]).map(w=>({c:'',...w})); r.seq=(r.seq||[]).map(s=>({d:'',...s})); return r; }
function rcaSave(){ try{ localStorage.setItem('ipd_rca',JSON.stringify(RCA)); }catch(e){} }
(function(){ try{ const s=localStorage.getItem('ipd_rca'); if(s) RCA=rcaMig(JSON.parse(s)); }catch(e){} })();

function rcaFields(){ const set=(id,k)=>{ const el=$(id); if(!el) return; el.value=RCA[k]||''; el.oninput=el.onchange=()=>{ RCA[k]=el.value; rcaSave(); rcaChart(); }; };
  [['rDate','date'],['rWard','ward'],['rSev','sev'],['rDrug','drug'],['rWhat','what'],['rShould','should'],['rImpact','impact'],['rPrev','prev'],['rCaus','caus'],['rRoot','root'],['rContrib','contrib'],['rObs','obs'],['rLesson','lesson'],['rTeam','team'],['rBy','by']].forEach(([i,k])=>set(i,k));
  $('rTypes').innerHTML=RCA_TYPES.map(([k,n])=>`<label class="xchip" style="cursor:pointer"><input type="checkbox" value="${k}"${RCA.types.includes(k)?' checked':''}> ${['OTH','ALG','ADR'].includes(k)?'':k+' · '}${n}</label>`).join(' ');
  $('rTypes').querySelectorAll('input').forEach(c=>c.onchange=()=>{ RCA.types=[...$('rTypes').querySelectorAll('input:checked')].map(x=>x.value); RCA.type=RCA.types.includes('ALG')?'ALG':RCA.types[RCA.types.length-1]||'OTH'; rcaSave(); rcaHints(); }); }
function rcaList(host,arr,cols,add,blank){
  $(host).innerHTML=`<table class="ctbl"><thead><tr>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>${arr.map((r,i)=>`<tr data-i="${i}">${cols.map(c=>`<td>${c[2]?`<select data-k="${c[0]}">${c[2].map(o=>`<option value="${o[0]}"${(r[c[0]]||'')===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select>`:c[3]==='chk'?`<input type="checkbox" data-k="${c[0]}"${r[c[0]]?' checked':''}>`:`<${c[3]?'textarea rows="2"':'input'} data-k="${c[0]}" style="width:100%;min-width:${c[4]||80}px" placeholder="${c[5]||''}">${c[3]?esc(r[c[0]]||'')+'</textarea>':''}`}</td>`).join('')}<td><button type="button" class="btn sm" data-del>ลบ</button></td></tr>`).join('')}</tbody></table><button type="button" class="btn sm" data-add style="margin-top:6px">+ ${add}</button>`;
  const h=$(host); h.querySelectorAll('tr[data-i]').forEach(tr=>{ const r=arr[+tr.dataset.i];
    tr.querySelectorAll('[data-k]').forEach(el=>{ if(el.tagName==='INPUT'&&el.type!=='checkbox') el.value=r[el.dataset.k]||''; const up=()=>{ r[el.dataset.k]=el.type==='checkbox'?(el.checked?'1':''):el.value; rcaSave(); rcaChart(); }; el.addEventListener('input',up); el.addEventListener('change',up); });
    tr.querySelector('[data-del]').onclick=()=>{ arr.splice(+tr.dataset.i,1); if(!arr.length) arr.push(blank()); rcaSave(); rcaRender(); }; });
  h.querySelector('[data-add]').onclick=()=>{ arr.push(blank(arr)); rcaSave(); rcaRender(); }; }
function rcaFb(){ $('rFb').innerHTML=FB_CAT.map(([k,n,h])=>`<label class="f"><span><b>${n}</b> <small>${h}</small></span><textarea data-fb="${k}" rows="2" placeholder="1 บรรทัด = 1 สาเหตุ">${esc((RCA.fb[k]||[]).join('\n'))}</textarea></label>`).join('');
  $('rFb').querySelectorAll('[data-fb]').forEach(t=>t.addEventListener('input',()=>{ RCA.fb[t.dataset.fb]=t.value.split('\n').map(x=>x.trim()).filter(Boolean); rcaSave(); rcaChart(); })); }
function rcaHints(){ const hs=[...new Map(RCA.types.flatMap(t=>RCA_HINT[t]||[]).map(h=>[h[1],h])).values()]; $('rHint').innerHTML=hs.length?`<span class="hint">ปัจจัยที่พบบ่อย (คลิกเพิ่มลงก้างปลา):</span> `+hs.map(([c,t],i)=>`<button type="button" class="xchip" data-h="${i}">+ ${esc(t)}</button>`).join(' '):'';
  $('rHint').querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{ const [c,t]=hs[+b.dataset.h]; RCA.fb[c]=[...(RCA.fb[c]||[])]; if(!RCA.fb[c].includes(t)) RCA.fb[c].push(t); rcaSave(); rcaFb(); rcaChart(); }); }
function rcaFishSvg(){ const prob=(RCA.drug||RCA.what||'ปัญหา/เหตุการณ์').slice(0,64);
  const W=1180,H=520,sx=30,ex=960,cy=H/2; let g=`<rect width="${W}" height="${H}" fill="#fff"/><line x1="${sx}" y1="${cy}" x2="${ex}" y2="${cy}" stroke="#1e293b" stroke-width="4"/><path d="M${ex},${cy-80} L${W-15},${cy} L${ex},${cy+80} Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>`;
  const wrap=(t,n,m)=>{const o=[];let cur='';t.split(/\s+/).forEach(w=>{while(w.length>n){if(cur){o.push(cur);cur='';}o.push(w.slice(0,n));w=w.slice(n);}if((cur+' '+w).trim().length>n){o.push(cur);cur=w;}else cur=(cur+' '+w).trim();});if(cur)o.push(cur);
    if(o.length>m){o.length=m;o[m-1]=o[m-1].slice(0,n-1)+'…';}return o;};
  wrap(prob,13,5).forEach((l,i,a)=>g+=`<text x="${ex+62}" y="${cy-((a.length-1)*7.5)+i*15+4}" font-size="12" text-anchor="middle" fill="#991b1b" font-weight="700">${esc(l)}</text>`);
  const C=['#2563eb','#0d9488','#7c3aed','#ea580c','#16a34a','#be185d'];
  FB_CAT.forEach(([k,n],i)=>{ const col=i%3, up=i<3, x=sx+250+col*240, y2=up?50:H-50, c=C[i];
    g+=`<line x1="${x+80}" y1="${cy}" x2="${x}" y2="${y2}" stroke="${c}" stroke-width="3"/><rect x="${x-110}" y="${up?y2-34:y2+6}" width="230" height="26" rx="13" fill="${c}"/><text x="${x+5}" y="${up?y2-16:y2+24}" font-size="12.5" text-anchor="middle" fill="#fff" font-weight="700">${esc(n)}</text>`;
    (RCA.fb[k]||[]).slice(0,6).forEach((t,j)=>{ const f=(j+1)/7, px=x+80*f, py=y2+(cy-y2)*f;
      g+=`<line x1="${px}" y1="${py}" x2="${px-60}" y2="${py}" stroke="${c}" stroke-width="1.5"/><text x="${px-64}" y="${py-3}" font-size="11" text-anchor="end" fill="#0f172a">${esc(t.length>32?t.slice(0,31)+'…':t)}</text>`; }); });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fff" role="img" aria-label="ผังก้างปลา">${g}</svg>`; }
function rcaSwissSvg(){ const ds=RCA.def.filter(d=>d.n), W=1100, H=280, n=Math.max(1,ds.length), gap=(W-200)/n;
  const col={hole:'#ef4444',part:'#f59e0b',ok:'#22c55e',na:'#94a3b8','':'#94a3b8'}; let g=`<rect width="${W}" height="${H}" fill="#fff"/><defs><marker id="rcaAr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#dc2626"/></marker></defs>`;
  const stop=ds.findIndex(d=>d.st==='ok'); const cxs=ds.map((d,i)=>110+i*gap+gap/2);
  ds.forEach((d,i)=>{ const cx=cxs[i], c=col[d.st||'']; g+=`<path d="M${cx-38},60 L${cx+22},40 L${cx+22},190 L${cx-38},210 Z" fill="#fde68a" stroke="#ca8a04" stroke-width="2"/>`;
    if(d.st==='hole'||d.st==='part') g+=`<ellipse cx="${cx-8}" cy="125" rx="${d.st==='hole'?17:9}" ry="${d.st==='hole'?24:13}" fill="#fff" stroke="${c}" stroke-width="3"/>`;
    g+=`<rect x="${cx-48}" y="10" width="80" height="20" rx="10" fill="${c}"/><text x="${cx-8}" y="24" font-size="11.5" text-anchor="middle" fill="#fff" font-weight="700">${(DEF_ST.find(s=>s[0]===d.st)||['','ยังไม่ระบุ'])[1]}</text>`;
    const nm=d.n.replace(/\s*\(.*\)/,''), sub=(d.n.match(/\((.*)\)/)||['',''])[1]; g+=`<text x="${cx-8}" y="232" font-size="12" text-anchor="middle" fill="#0f172a" font-weight="700">${esc(nm.slice(0,22))}</text><text x="${cx-8}" y="248" font-size="11" text-anchor="middle" fill="#475569">${esc(sub.slice(0,24))}</text>`; });
  const endX=stop>=0?cxs[stop]-40:W-20; g+=`<line x1="20" y1="125" x2="${endX}" y2="125" stroke="#dc2626" stroke-width="3" stroke-dasharray="8 5" marker-end="url(#rcaAr)"/><text x="20" y="115" font-size="12" fill="#dc2626" font-weight="700">อันตราย</text>`;
  g+=`<text x="${W-20}" y="${H-10}" font-size="12" text-anchor="end" fill="${stop>=0?'#15803d':'#dc2626'}" font-weight="700">${stop>=0?'ถูกกั้นที่ '+esc(ds[stop].n.replace(/\s*\(.*\)/,'')):'ถึงผู้ป่วย'}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fff" role="img" aria-label="Swiss cheese">${g}</svg>`; }
function rcaChart(){ if($('rFish')) $('rFish').innerHTML=rcaFishSvg(); if($('rSwiss')) $('rSwiss').innerHTML=rcaSwissSvg();
  const n=RCA.acts.filter(a=>a.a), st=['strong','inter','weak'].map(k=>n.filter(a=>a.s===k).length), rcs=RCA.rcs.filter(r=>r.t).map(r=>r.id), un=rcs.filter(id=>!n.some(a=>(a.rc||'').includes(id)));
  if($('rStr')) $('rStr').innerHTML=n.length?`มาตรการ: แข็งแรง ${st[0]} · ปานกลาง ${st[1]} · อ่อน ${st[2]}${st[0]+st[1]===0?' — <b style="color:#dc2626">มีแต่มาตรการระดับอ่อน ควรเพิ่มมาตรการเชิงระบบ</b>':''}${un.length?` · <b style="color:#d97706">สาเหตุรากที่ยังไม่มีมาตรการ: ${un.join(', ')}</b>`:''}`:''; }
function rcaRender(){ rcaFields();
  rcaList('rSeq',RCA.seq,[['t','วัน/เวลา',null,false,100,'เช่น 18.45 น.'],['e','เหตุการณ์',null,true,260],['d','ด่านป้องกัน / ข้อสังเกต',null,true,200]],'เพิ่มลำดับเหตุการณ์',()=>({t:'',e:'',d:''}));
  rcaList('rDef',RCA.def,[['n','ด่านป้องกัน',null,false,200],['st','สถานะ',[['','— เลือก —'],...DEF_ST]],['note','เหตุที่หลุด/กั้นได้',null,true,260]],'เพิ่มด่าน',()=>({n:'',st:'',note:''}));
  rcaList('rWhy',RCA.why,[['c','สาย',null,false,90,'เช่น แพทย์'],['w','ทำไม (Why?)',null,true,200],['b','เพราะ (Because)',null,true,220]],'เพิ่ม Why',a=>({c:(a&&a.length?a[a.length-1].c:''),w:'',b:''}));
  rcaList('rRcs',RCA.rcs,[['id','รหัส',null,false,60],['t','สาเหตุราก (เชิงระบบ)',null,true,360]],'เพิ่มสาเหตุราก',a=>({id:'RC'+((a?a.length:0)+1),t:''}));
  rcaList('rAct',RCA.acts,[['s','ระดับ',RCA_STR.map(x=>[x[0],x[1]])],['a','มาตรการแก้ไข/ป้องกัน',null,true,240],['rc','แก้สาเหตุราก',null,false,90,'RC1, RC2'],['who','ผู้รับผิดชอบ',null,false,110],['due','กำหนดเสร็จ',null,false,80]],'เพิ่มมาตรการ',()=>({a:'',s:'inter',rc:'',who:'',due:''}));
  rcaList('rKpi',RCA.kpis,[['k','ตัวชี้วัด',null,true,220],['ty','ประเภท',[['ผลลัพธ์','ผลลัพธ์'],['กระบวนการ','กระบวนการ'],['โครงสร้าง','โครงสร้าง']]],['tg','เป้าหมาย',null,false,80],['src','แหล่งข้อมูล',null,false,120]],'เพิ่มตัวชี้วัด',()=>({k:'',ty:'กระบวนการ',tg:'',src:''}));
  rcaList('rPend',RCA.pend,[['done','✓',null,'chk'],['t','ข้อมูลที่ต้องตรวจสอบก่อนสรุป',null,false,360]],'เพิ่มรายการ',()=>({t:'',done:''}));
  rcaFb(); rcaHints(); rcaChart(); }
const RCA_SN=k=>(RCA_SEV.find(x=>x[0]===k)||['',k||'–'])[1], RCA_TT=()=>RCA.types.map(k=>{const t=RCA_TYPES.find(x=>x[0]===k);return t?(['ALG','ADR','OTH'].includes(k)?t[1]:`${k} (${t[1]})`):k;}).join(' + ')||'–';
const RCA_SS=k=>(RCA_STR.find(x=>x[0]===k)||['',''])[1], DS=k=>(DEF_ST.find(x=>x[0]===k)||['','–'])[1];
function rcaText(){ const L=['■ รายงานการวิเคราะห์สาเหตุราก (RCA) — เหตุการณ์ด้านยา',`ชนิด: ${RCA_TT()}`,`ความรุนแรง: ${RCA_SN(RCA.sev)} · ป้องกันได้: ${RCA.prev||'–'} · ความสัมพันธ์ยากับอาการ: ${RCA.caus||'–'}`,`วันที่เกิด: ${RCA.date||'–'} · หน่วยงาน: ${RCA.ward||'–'}`,`ยาที่เกี่ยวข้อง: ${RCA.drug||'–'}`,'',
  '1. สิ่งที่เกิดขึ้น (What happened)',RCA.what||'–','','2. สิ่งที่ควรจะเป็น',RCA.should||'–','','3. ผลกระทบต่อผู้ป่วย',RCA.impact||'–','','4. ลำดับเหตุการณ์',...RCA.seq.filter(s=>s.t||s.e).map(s=>`  • ${s.t} — ${s.e}${s.d?` [${s.d}]`:''}`),'',
  '5. ด่านป้องกัน (Swiss cheese)',...RCA.def.filter(d=>d.n).map(d=>`  • ${d.n}: ${DS(d.st)}${d.note?' — '+d.note:''}`),'','6. วิเคราะห์ 5 Whys'];
  let ch=null; RCA.why.filter(w=>w.w||w.b).forEach(w=>{ if(w.c!==ch){ ch=w.c; if(ch) L.push(`  สาย: ${ch}`); } L.push(`   • ทำไม ${w.w} → ${w.b}`); });
  L.push('','7. ผังก้างปลา (ปัจจัยร่วม)',...FB_CAT.filter(([k])=>(RCA.fb[k]||[]).length).map(([k,n])=>`  ${n}: ${(RCA.fb[k]||[]).join(' · ')}`),'','8. สาเหตุราก (Root cause)',...RCA.rcs.filter(r=>r.t).map(r=>`  ${r.id} ${r.t}`));
  if(RCA.root) L.push('  สรุป: '+RCA.root); if(RCA.contrib) L.push('  ปัจจัยที่ทำให้ผลรุนแรงขึ้น/ปัจจัยร่วม: '+RCA.contrib);
  if(RCA.obs) L.push('','9. ข้อสังเกตทางคลินิก',RCA.obs);
  L.push('','10. แผนปฏิบัติการ',...RCA.acts.filter(a=>a.a).map((a,i)=>`  ${i+1}) [${RCA_SS(a.s)}] ${a.a}${a.rc?` · แก้ ${a.rc}`:''} · ผู้รับผิดชอบ ${a.who||'–'} · กำหนด ${a.due||'–'}`),'','11. ตัวชี้วัดติดตาม',...RCA.kpis.filter(k=>k.k).map(k=>`  • ${k.k} (${k.ty}) เป้าหมาย ${k.tg||'–'} · ${k.src||'–'}`));
  const pd=RCA.pend.filter(p=>p.t); if(pd.length) L.push('','12. ข้อมูลที่ต้องตรวจสอบก่อนสรุป',...pd.map(p=>`  ${p.done?'☒':'☐'} ${p.t}`));
  L.push('','บทเรียนที่ได้รับ: '+(RCA.lesson||'–'),`ทีม RCA: ${RCA.team||'–'}`,`ผู้จัดทำ: ${RCA.by||'–'}`); return L.join('\n'); }
function rcaPrint(){ const row=(h,v)=>`<tr><th style="width:24%">${h}</th><td><pre>${esc(v||'–')}</pre></td></tr>`, T=(hd,rows)=>`<table class="pt4 grid sm"><tr>${hd.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.length?rows.join(''):`<tr><td colspan="${hd.length}">–</td></tr>`}</table>`;
  let ch=null; const whyRows=RCA.why.filter(w=>w.w||w.b).map(w=>{ const lab=w.c!==ch?(ch=w.c,esc(w.c||'')):''; return `<tr><td>${lab}</td><td>${esc(w.w)}</td><td>${esc(w.b)}</td></tr>`; });
  const html=`<div class="mk"><div class="mkt">แบบรายงานการวิเคราะห์สาเหตุราก (Root Cause Analysis: RCA)<br><small>เหตุการณ์ความคลาดเคลื่อนทางยา / อุบัติการณ์ด้านยา — กลุ่มงานเภสัชกรรม โรงพยาบาลมหาสารคาม</small></div>
  <table class="pt4 grid sm">${row('ชนิดเหตุการณ์',RCA_TT())}${row('ระดับความรุนแรง (NCC MERP)',RCA_SN(RCA.sev))}${row('ป้องกันได้ / ความสัมพันธ์ยากับอาการ',`${RCA.prev||'–'} · ${RCA.caus||'–'}`)}${row('วันที่เกิด / หน่วยงาน',`${RCA.date||'–'} · ${RCA.ward||'–'}`)}${row('ยาที่เกี่ยวข้อง',RCA.drug)}${row('1. สิ่งที่เกิดขึ้น',RCA.what)}${row('2. สิ่งที่ควรจะเป็น',RCA.should)}${row('3. ผลกระทบต่อผู้ป่วย',RCA.impact)}</table>
  <div class="mkh">4. ลำดับเหตุการณ์</div>${T(['วัน/เวลา','เหตุการณ์','ด่านป้องกัน / ข้อสังเกต'],RCA.seq.filter(s=>s.t||s.e).map(s=>`<tr><td>${esc(s.t)}</td><td>${esc(s.e)}</td><td>${esc(s.d)}</td></tr>`))}
  <div class="mkh">5. ด่านป้องกัน (Swiss cheese)</div><div class="psvg">${rcaSwissSvg()}</div>${T(['ด่าน','สถานะ','เหตุ'],RCA.def.filter(d=>d.n).map(d=>`<tr><td>${esc(d.n)}</td><td>${DS(d.st)}</td><td>${esc(d.note)}</td></tr>`))}
  <div class="mkh">6. วิเคราะห์ 5 Whys</div>${T(['สาย','ทำไม (Why?)','เพราะ (Because)'],whyRows)}
  <div class="mkh">7. ผังก้างปลา (Fishbone diagram)</div><div class="psvg">${rcaFishSvg()}</div>
  <div class="mkh">8. สาเหตุราก (Root cause)</div>${T(['รหัส','สาเหตุราก'],RCA.rcs.filter(r=>r.t).map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.t)}</td></tr>`))}${RCA.root||RCA.contrib||RCA.obs?`<table class="pt4 grid sm">${RCA.root?row('สรุป',RCA.root):''}${RCA.contrib?row('ปัจจัยที่ทำให้ผลรุนแรงขึ้น',RCA.contrib):''}${RCA.obs?row('ข้อสังเกตทางคลินิก',RCA.obs):''}</table>`:''}
  <div class="mkh">9. แผนปฏิบัติการ</div>${T(['ระดับ','มาตรการ','แก้สาเหตุราก','ผู้รับผิดชอบ','กำหนดเสร็จ'],RCA.acts.filter(a=>a.a).map(a=>`<tr><td>${RCA_SS(a.s)}</td><td>${esc(a.a)}</td><td>${esc(a.rc)}</td><td>${esc(a.who)}</td><td>${esc(a.due)}</td></tr>`))}
  <div class="mkh">10. ตัวชี้วัดติดตาม</div>${T(['ตัวชี้วัด','ประเภท','เป้าหมาย','แหล่งข้อมูล'],RCA.kpis.filter(k=>k.k).map(k=>`<tr><td>${esc(k.k)}</td><td>${esc(k.ty)}</td><td>${esc(k.tg)}</td><td>${esc(k.src)}</td></tr>`))}
  ${RCA.pend.some(p=>p.t)?`<div class="mkh">11. ข้อมูลที่ต้องตรวจสอบก่อนสรุป</div><div>${RCA.pend.filter(p=>p.t).map(p=>`${p.done?'☒':'☐'} ${esc(p.t)}`).join('<br>')}</div>`:''}
  <table class="pt4 grid sm">${row('บทเรียนที่ได้รับ',RCA.lesson)}${row('ทีม RCA',RCA.team)}</table>
  <div class="psign">ผู้จัดทำ ${esc(RCA.by||'......................................')} · วันที่ ............................ · หัวหน้างาน ......................................</div></div>`;
  printHtml(html); }
(function(){ if(!$('rFish')) return;
  $('rSev').innerHTML='<option value="">— เลือก —</option>'+RCA_SEV.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('rStrRef').innerHTML=RCA_STR.map(([,n,d])=>`<li><b>${n}</b> — ${d}</li>`).join('');
  rcaRender();
  $('rPrint').onclick=rcaPrint; $('rCopy').onclick=()=>{ const t=rcaText(); copyRich(txtHtml(t),t,$('rMsg')); };
  $('rCpImg').onclick=()=>copyImg([...$('rFish').querySelectorAll('svg')],$('rMsg')); $('rCpSw').onclick=()=>copyImg([...$('rSwiss').querySelectorAll('svg')],$('rMsg'));
  $('rSaveF').onclick=()=>{ const b=new Blob([JSON.stringify({v:2,rca:RCA},null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`RCA-${RCA.types.join('+')}-${(RCA.date||'').replace(/[\/\s]/g,'')||'draft'}.json`; a.click(); };
  $('rOpen').onclick=()=>$('rFile').click(); $('rFile').addEventListener('change',ev=>{ const f=ev.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const o=JSON.parse(t); if(!o.rca) throw 0; RCA=rcaMig(o.rca); rcaSave(); rcaRender(); cpMsg($('rMsg'),'เปิดไฟล์แล้ว'); }catch(e){ cpMsg($('rMsg'),'ไฟล์ไม่ถูกต้อง'); } }); ev.target.value=''; });
  $('rNew').onclick=()=>{ if(!confirm('เริ่ม RCA ใหม่ (ล้างข้อมูลที่กรอก)?')) return; RCA=RCA0(); rcaSave(); rcaRender(); };
})();
