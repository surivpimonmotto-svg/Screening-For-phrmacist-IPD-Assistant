/* ===== ocr.js — วางรูป (Snipping Tool / Print Screen) ลงช่องวางข้อความ → อ่านตัวอักษรด้วย Tesseract.js ในเบราว์เซอร์ =====
 ภาพไม่ถูกส่งออกจากเครื่อง · ไฟล์ OCR อยู่ใน vendor/ocr/ ของ repo (GitHub Pages) — ถ้าเปิดจากที่อื่นใช้ CDN jsdelivr แทน
 ผลอ่านจากภาพอาจผิด (1/l, 0/O, 5/S) — ต้องตรวจตัวเลขทุกครั้ง · ตัดชื่อ/HN/AN ออกก่อนใส่ช่อง
*/
const OCR_V='5.1.1';
const OCR_LOCAL=()=>new URL('vendor/ocr/',location.href).href;
const OCR_CDN={lib:`https://cdn.jsdelivr.net/npm/tesseract.js@${OCR_V}/dist/tesseract.min.js`,worker:`https://cdn.jsdelivr.net/npm/tesseract.js@${OCR_V}/dist/worker.min.js`,core:`https://cdn.jsdelivr.net/npm/tesseract.js-core@${OCR_V}`,lang:null};
let OCR_W=null, OCR_LOADING=null;
function ocrScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
async function ocrWorker(msg){ if(OCR_W) return OCR_W; if(OCR_LOADING) return OCR_LOADING;
  OCR_LOADING=(async()=>{ let base=null;
    if(/^https?:/.test(location.protocol)){ try{ await ocrScript(OCR_LOCAL()+'tesseract.min.js'); base=OCR_LOCAL(); }catch(e){} }
    if(!window.Tesseract) await ocrScript(OCR_CDN.lib);
    const opt=base?{workerPath:base+'worker.min.js',corePath:base,langPath:base+'lang'}:{workerPath:OCR_CDN.worker,corePath:OCR_CDN.core};
    msg&&msg('กำลังโหลดตัวอ่านภาษาไทย/อังกฤษ (ครั้งแรกประมาณ 10 MB)…');
    OCR_W=await Tesseract.createWorker(['eng','tha'],1,{...opt,logger:m=>{ if(msg&&m.status==='recognizing text') msg(`กำลังอ่านภาพ… ${Math.round((m.progress||0)*100)}%`); }});
    await OCR_W.setParameters({preserve_interword_spaces:'1',tessedit_pageseg_mode:'4'}); return OCR_W; })();
  try{ return await OCR_LOADING; }catch(e){ OCR_LOADING=null; throw e; } }
// ขยายภาพ 2 เท่า + ขาวดำ ช่วยให้อ่านภาพหน้าจอตัวเล็กได้ดีขึ้น
function ocrPrep(blob){ return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>{ const k=img.width<1600?2:1, c=document.createElement('canvas'); c.width=img.width*k; c.height=img.height*k; const g=c.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(img,0,0,c.width,c.height);
    const d=g.getImageData(0,0,c.width,c.height), p=d.data; let sum=0; for(let i=0;i<p.length;i+=4){ const y=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2]; p[i]=p[i+1]=p[i+2]=y; sum+=y; }
    if(sum/(p.length/4)<128) for(let i=0;i<p.length;i+=4){ p[i]=p[i+1]=p[i+2]=255-p[i]; } // พื้นมืด (dark mode) → กลับสี
    // ขาวดำ + ลบเส้นตาราง (เส้นทึบยาวแนวนอน/แนวตั้ง) ที่ทำให้ OCR อ่านผิด
    const W=c.width,H=c.height, dk=new Uint8Array(W*H); for(let i=0,j=0;i<p.length;i+=4,j++){ const v=p[i]<165?0:255; p[i]=p[i+1]=p[i+2]=v; dk[j]=v===0?1:0; }
    const LH=Math.max(60,W*0.08), LV=Math.max(36,20*k); const wipe=j=>{ const i=j*4; p[i]=p[i+1]=p[i+2]=255; };
    for(let y=0;y<H;y++){ let x=0; while(x<W){ if(!dk[y*W+x]){x++;continue;} let e=x; while(e<W&&dk[y*W+e]) e++; if(e-x>=LH) for(let t=x;t<e;t++) wipe(y*W+t); x=e; } }
    for(let x=0;x<W;x++){ let y=0; while(y<H){ if(!dk[y*W+x]){y++;continue;} let e=y; while(e<H&&dk[e*W+x]) e++; if(e-y>=LV) for(let t=y;t<e;t++) wipe(t*W+x); y=e; } }
    g.putImageData(d,0,0); URL.revokeObjectURL(img.src); res(c); }; img.onerror=rej; img.src=URL.createObjectURL(blob); }); }
function ocrClean(t){ return t.split('\n').map(l=>l.replace(/[|¦]/g,' ').replace(/[“”]/g,'"').replace(/\s{2,}/g,'  ').replace(/^\s+|\s+$/g,'')).filter(l=>/[A-Za-z0-9฀-๿]{2,}/.test(l))
  .map(l=>l.replace(/\b(\d)\s*[xX×*%]\s*(\d)\b/g,'$1x$2').replace(/\bpe\b/g,'pc').replace(/(pc|ac|หลังอาหาร|ก่อนอาหาร)\s*เข้า/g,'$1 เช้า').replace(/\bMG\b/gi,'MG').replace(/\b(\d+)\s*(?:rng|rg|mq)\b/gi,'$1 mg').replace(/(\d)\s*[,.]\s*(\d)\s*(mg|MG|ml|ML)\b/g,'$1.$2 $3').replace(/\b[O0](\d)/g,'0$1')).join('\n'); }
async function ocrImage(blob,ta,msgEl){ const msg=t=>{ if(msgEl){ msgEl.textContent=t; } };
  try{ msg('เตรียมภาพ…'); const c=await ocrPrep(blob), w=await ocrWorker(msg); const r=await w.recognize(c);
    let t=ocrClean(r.data.text||''); t=typeof rcaScrub==='function'?rcaScrub(t):t;
    const conf=Math.round(r.data.confidence||0), drugBox=!['ptPaste','labPaste','rImT'].includes(ta.id); let drop=0;
    // ตัดบรรทัดข้อมูลระบุตัวผู้ป่วย (ชื่อ/HN/AN/อายุ/เลขบัตร) ทิ้งเสมอ
    t=t.split('\n').filter(l=>{ const k=!/name\s*of|hospital\s*n(umber|o)|\b(hn|an)\b\s*[:.]?\s*\d|ชื่อ\s*[-–]?\s*สกุล|ชื่อผู้ป่วย|เลขบัตร|เลขประจำตัว|patient\s*name/i.test(l); if(!k) drop++; return k; }).join('\n');
    // ภาพไม่ชัด (ภาพถ่าย/ลายมือ/สติกเกอร์) → ช่องคำสั่งยา เก็บเฉพาะบรรทัดที่หน้าตาเป็นยา (คำภาษาอังกฤษ ≥4 ตัว + ตัวเลข/หน่วย)
    if(drugBox&&conf<70){ const L0=t.split('\n'); t=L0.filter(l=>/[A-Za-z]{4,}/.test(l)&&/\d|\b(mg|ml|tab|cap|syr|inj|iv|po|od|bid|tid|qid|prn|hs)\b/i.test(l)).join('\n'); drop+=L0.length-t.split('\n').filter(Boolean).length; }
    if(drugBox&&conf<50){ msg(`ภาพนี้อ่านไม่ชัด (ความมั่นใจ ${conf}%) — ไม่ได้ใส่ข้อความให้ เพื่อกันรายการยาขยะ · ใช้ภาพหน้าจอ HIS/paperless (Snipping Tool ตัดชิดรายการยา) แทนภาพถ่ายหรือลายมือ`); if(msgEl) msgEl.style.color='#b91c1c'; return; }
    if(msgEl) msgEl.style.color='';
    if(!t.trim()){ msg(conf<70?`ภาพนี้อ่านไม่ชัด (ความมั่นใจ ${conf}%) และไม่พบบรรทัดที่เป็นรายการยา — ใช้ภาพหน้าจอ HIS ตัดชิดรายการยา`:'อ่านตัวอักษรจากภาพไม่ได้ — ลองตัดภาพให้ชิดรายการยา หรือใช้ Text actions ของ Snipping Tool'); return; }
    const s=ta.selectionStart??ta.value.length, e=ta.selectionEnd??ta.value.length, pre=ta.value.slice(0,s), post=ta.value.slice(e);
    ta.value=pre+(pre&&!pre.endsWith('\n')?'\n':'')+t+(post&&!post.startsWith('\n')?'\n':'')+post; ta.dispatchEvent(new Event('input',{bubbles:true})); if(ta.id==='wOrder'&&typeof wfParse==='function') wfParse();
    msg(`อ่านจากภาพได้ ${t.split('\n').length} บรรทัด (ความมั่นใจ ${conf}%)${drop?` · ตัดบรรทัดที่ไม่ใช่ยา/ข้อมูลระบุตัว ${drop} บรรทัด`:''} — ⚠ ตรวจชื่อยา/ตัวเลขก่อนใช้${conf<70?' · ภาพไม่ชัด ควรใช้ภาพหน้าจอแทนภาพถ่าย':''}`); if(conf<70&&msgEl) msgEl.style.color='#b45309';
    ta.style.outline='3px solid #f59e0b'; setTimeout(()=>ta.style.outline='',4000); }
  catch(e){ msg('โหลดตัวอ่านภาพไม่ได้ (เครือข่ายอาจบล็อก) — ใช้ Snipping Tool → Text actions → Copy all text แทน'); } }
// ผูกกับช่องวางข้อความ: วางรูป (Ctrl+V) · ลากไฟล์รูปมาวาง · ปุ่มเลือกรูป
function ocrAttach(id){ const ta=$(id); if(!ta||ta.dataset.ocr) return; ta.dataset.ocr='1';
  const bar=document.createElement('div'); bar.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0 0;font-size:12.5px';
  bar.innerHTML=`<button type="button" class="btn sm" title="เลือกรูปภาพหน้าจอเพื่ออ่านตัวอักษร (OCR)">📷 อ่านจากรูป</button><input type="file" accept="image/*" hidden><span class="hint">หรือวางรูปจาก Snipping Tool (Ctrl+V) ลงช่องนี้ได้</span><span class="hint" data-om style="color:var(--accent)"></span>`;
  ta.insertAdjacentElement('afterend',bar); const msgEl=bar.querySelector('[data-om]'), fi=bar.querySelector('input');
  bar.querySelector('button').onclick=()=>fi.click(); fi.onchange=()=>{ const f=fi.files[0]; if(f) ocrImage(f,ta,msgEl); fi.value=''; };
  ta.addEventListener('paste',ev=>{ const it=[...(ev.clipboardData||{}).items||[]].find(x=>x.type&&x.type.startsWith('image/')); if(!it) return; const hasText=(ev.clipboardData.getData('text')||'').trim(); if(hasText) return; ev.preventDefault(); ev.stopImmediatePropagation(); ocrImage(it.getAsFile(),ta,msgEl); },true);
  ta.addEventListener('dragover',ev=>{ if([...ev.dataTransfer.items].some(x=>x.type.startsWith('image/'))) ev.preventDefault(); });
  ta.addEventListener('drop',ev=>{ const f=[...ev.dataTransfer.files].find(x=>x.type.startsWith('image/')); if(!f) return; ev.preventDefault(); ocrImage(f,ta,msgEl); }); }
['mrA1','mrA2','mrB','mrC','paste','labPaste','ptPaste','wOrder','rImT','vPaste','hPaste','xPaste','iPaste','lpPaste','nePaste'].forEach(ocrAttach);
