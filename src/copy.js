/* ===== copy.js — ปุ่มคัดลอก: รายส่วน (หัวข้อ h2) · รายช่อง · ทั้งหน้า (ปุ่มลอยมุมขวาล่าง) =====
 คัดลอกทั้งแบบ rich (วางใน Word/LINE/อีเมลเห็นตาราง) และข้อความล้วน · ช่องกรอกถูกแทนด้วยค่าที่กรอก · ไม่คัดลอกปุ่ม */
function cpClean(nodes){ const box=document.createElement('div'); box.style.cssText='position:fixed;left:-99999px;top:0;width:1000px;background:#fff;color:#000';
  nodes.forEach(n=>box.appendChild(n.cloneNode(true))); document.body.appendChild(box);
  // ค่าในช่องกรอกจริง (clone ไม่พาค่า input ที่ผู้ใช้พิมพ์มา) — เทียบตามลำดับ
  const src=nodes.flatMap(n=>[...n.querySelectorAll?n.querySelectorAll('input,select,textarea'):[]]), dst=[...box.querySelectorAll('input,select,textarea')];
  dst.forEach((el,i)=>{ const o=src[i]; let v=''; if(o){ if(o.tagName==='SELECT') v=o.selectedOptions[0]?o.selectedOptions[0].text:''; else if(o.type==='checkbox'||o.type==='radio') v=o.checked?'☑':''; else if(o.type!=='file') v=o.value; }
    const sp=document.createElement('span'); sp.textContent=v; el.replaceWith(sp); });
  box.querySelectorAll('button,.cpbtn,[data-nocopy],script,style').forEach(x=>x.remove());
  const html=box.innerHTML, text=box.innerText.replace(/\n{3,}/g,'\n\n').trim(); box.remove(); return {html,text}; }
function cpNodes(nodes,msg){ const {html,text}=cpClean(nodes); copyRich(html,text,msg); }
// พิมพ์: หัวกระดาษ (ชื่อแท็บ + วันเวลา) · ตารางกว้าง (>12 คอลัมน์) พิมพ์แนวนอน
function prNodes(nodes,title){ const {html}=cpClean(nodes); const tab=[...document.querySelectorAll('[role="tab"][aria-selected="true"]')].map(t=>t.textContent.trim())[0]||'';
  const wide=nodes.some(n=>[...(n.querySelectorAll?n.querySelectorAll('tr'):[])].some(r=>r.children.length>12));
  printHtml(`<div class="mk"><div style="display:flex;justify-content:space-between;font-size:11px;color:#475569;border-bottom:1px solid #cbd5e1;margin-bottom:6px;padding-bottom:3px"><span>IPD Screening Assistant · ${esc(title||tab)}</span><span>พิมพ์ ${tlFmt(new Date())}</span></div>${html}</div>`,wide); }
function cpBtn(title){ const b=document.createElement('button'); b.type='button'; b.className='btn sm cpbtn'; b.textContent='📋'; b.title=title||'คัดลอกส่วนนี้'; b.style.cssText='padding:1px 7px;margin-left:6px;font-size:12px;vertical-align:middle'; return b; }
// ใส่ปุ่ม 📋 ท้ายหัวข้อ h2 ทุกอันใน host — คัดลอกตั้งแต่หัวข้อจนก่อนหัวข้อถัดไป
function cpSections(host){ if(!host) return; host.querySelectorAll('h2').forEach(h=>{ if(h.querySelector('.cpbtn')) return; const b=cpBtn('คัดลอกหัวข้อนี้'); const m=document.createElement('span'); m.className='toast cpbtn'; m.style.marginLeft='6px';
  const sec=()=>{ const ns=[h]; let n=h.nextElementSibling; while(n&&n.tagName!=='H2'){ ns.push(n); n=n.nextElementSibling; } return ns; };
  b.onclick=()=>cpNodes(sec(),m); const pb=cpBtn('พิมพ์หัวข้อนี้'); pb.textContent='🖨'; pb.onclick=()=>prNodes(sec()); h.appendChild(b); h.appendChild(pb); h.appendChild(m); }); }
// ปุ่มลอย: คัดลอกทั้งหน้า (แท็บที่เปิดอยู่)
(function(){ const fb=document.createElement('button'); fb.type='button'; fb.className='btn pri'; fb.id='cpAll'; fb.textContent='📋 คัดลอกทั้งหน้า';
  fb.title='คัดลอกผลทั้งหมดของแท็บที่เปิดอยู่ (วางใน Word / LINE / อีเมลได้)';
  fb.style.cssText='position:fixed;right:16px;bottom:16px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.25)'; const tm=document.createElement('span'); tm.className='toast'; tm.style.cssText='position:fixed;right:18px;bottom:62px;z-index:50;background:var(--surface);padding:2px 8px;border-radius:6px';

  const curNodes=()=>{ const sec=[...document.querySelectorAll('section[id^="p-"]')].find(s=>!s.hidden); if(!sec) return []; let nodes=[...sec.querySelectorAll('.hres')].filter(x=>x.innerText.trim());
    if(sec.id==='p-screen'){ nodes=[$('sum'),$('rows')].filter(Boolean); const n=$('note'); if(n&&n.value) nodes.push(Object.assign(document.createElement('pre'),{textContent:n.value,style:'white-space:pre-wrap;font-family:inherit'})); } return nodes.length?nodes:[sec]; };
  fb.onclick=()=>{ const ns=curNodes(); if(ns.length) cpNodes(ns,tm); };
  const pb=document.createElement('button'); pb.type='button'; pb.className='btn'; pb.id='prAll'; pb.textContent='🖨 พิมพ์ทั้งหน้า'; pb.title='พิมพ์ผลทั้งหมดของแท็บที่เปิดอยู่ (เลือกเครื่องพิมพ์ หรือบันทึก PDF)';
  pb.style.cssText='position:fixed;right:190px;bottom:16px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.25);background:var(--surface)'; pb.onclick=()=>{ const ns=curNodes(); if(ns.length) prNodes(ns); };
  document.body.appendChild(fb); document.body.appendChild(pb); document.body.appendChild(tm);
  // เมื่อพิมพ์ ซ่อนปุ่มลอย
  const st=document.createElement('style'); st.textContent='@media print{#cpAll,#prAll,.cpbtn{display:none!important}}'; document.head.appendChild(st); })();
// ใส่ปุ่ม 📋 🖨 ให้ทุกหัวข้อ (h2) ทุกแท็บอัตโนมัติ เมื่อเนื้อหาเปลี่ยน
(function(){ let t=0; const secs=()=>[...document.querySelectorAll('section[id^="p-"]')].filter(x=>x.id!=='p-kb'); const run=()=>{ secs().forEach(cpSections); };
  const mo=new MutationObserver(()=>{ clearTimeout(t); t=setTimeout(run,80); }); secs().forEach(h=>mo.observe(h,{childList:true,subtree:true})); run(); })();
