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
function cpBtn(title){ const b=document.createElement('button'); b.type='button'; b.className='btn sm cpbtn'; b.textContent='📋'; b.title=title||'คัดลอกส่วนนี้'; b.style.cssText='padding:1px 7px;margin-left:6px;font-size:12px;vertical-align:middle'; return b; }
// ใส่ปุ่ม 📋 ท้ายหัวข้อ h2 ทุกอันใน host — คัดลอกตั้งแต่หัวข้อจนก่อนหัวข้อถัดไป
function cpSections(host){ if(!host) return; host.querySelectorAll('h2').forEach(h=>{ if(h.querySelector('.cpbtn')) return; const b=cpBtn('คัดลอกหัวข้อนี้'); const m=document.createElement('span'); m.className='toast cpbtn'; m.style.marginLeft='6px';
  b.onclick=()=>{ const ns=[h]; let n=h.nextElementSibling; while(n&&n.tagName!=='H2'){ ns.push(n); n=n.nextElementSibling; } cpNodes(ns,m); }; h.appendChild(b); h.appendChild(m); }); }
// ปุ่มลอย: คัดลอกทั้งหน้า (แท็บที่เปิดอยู่)
(function(){ const fb=document.createElement('button'); fb.type='button'; fb.className='btn pri'; fb.id='cpAll'; fb.textContent='📋 คัดลอกทั้งหน้า';
  fb.title='คัดลอกผลทั้งหมดของแท็บที่เปิดอยู่ (วางใน Word / LINE / อีเมลได้)';
  fb.style.cssText='position:fixed;right:16px;bottom:16px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.25)'; const tm=document.createElement('span'); tm.className='toast'; tm.style.cssText='position:fixed;right:18px;bottom:62px;z-index:50;background:var(--surface);padding:2px 8px;border-radius:6px';
  fb.onclick=()=>{ const sec=[...document.querySelectorAll('section[id^="p-"]')].find(s=>!s.hidden); if(!sec){ return; }
    let nodes=[...sec.querySelectorAll('.hres')].filter(x=>x.innerText.trim()); if(sec.id==='p-screen'){ nodes=[$('sum'),$('rows')].filter(Boolean); const n=$('note'); if(n&&n.value) nodes.push(Object.assign(document.createElement('pre'),{textContent:n.value})); }
    if(!nodes.length) nodes=[sec]; cpNodes(nodes,tm); };
  document.body.appendChild(fb); document.body.appendChild(tm);
  // เมื่อพิมพ์ ซ่อนปุ่มลอย
  const st=document.createElement('style'); st.textContent='@media print{#cpAll{display:none!important}}'; document.head.appendChild(st); })();
// ใส่ปุ่ม 📋 ให้หัวข้อในแผงผล (.hres) ทุกแท็บอัตโนมัติ เมื่อเนื้อหาเปลี่ยน
(function(){ let t=0; const run=()=>{ document.querySelectorAll('.hres').forEach(cpSections); };
  const mo=new MutationObserver(()=>{ clearTimeout(t); t=setTimeout(run,80); }); document.querySelectorAll('.hres').forEach(h=>mo.observe(h,{childList:true,subtree:true})); run(); })();
