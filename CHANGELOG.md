# CHANGELOG — IPD Screening Assistant

รูปแบบการเขียน (เพิ่มรายการใหม่ไว้ **บนสุด**):
```
## vX.Y.Z — วันที่ — ผู้แก้
- แก้อะไร  (ที่มา: เอกสาร/ใบ DUE/ป้าย)
- ผู้ตรวจทาน: …
```

---

## v0.6.7 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- HAD: ผลตรวจจัดเป็นโครงสร้างเดียวกันทุกยา — คำนวณได้ (Conc/Rate/dose) → มาตรฐาน (Usual dose · Max dose/rate · Max conc · ที่มา) → เหมาะสมเพราะ / ไม่เหมาะสมเพราะ → ยังไม่มีข้อมูลข้อใด → จำนวนจ่าย
- เพิ่มตาราง HAD_STD ใน kb.js (ค่า null = ยังไม่มีข้อมูล เติมทีละข้อได้)
- Fentanyl: ประเมิน mcg/kg/h เทียบ 0.7–10 และ conc ≤50 mcg/ml ⚑ (อ้างอิงทั่วไป รอคู่มือ HAD รพ.)
- ขนาด amp อ่านจากชื่อยาในคำสั่ง (เช่น 0.5 MG/10ML = 500 mcg) — แก้จำนวนจ่าย fentanyl ที่เคยคิดเป็น 100 mcg/amp (24 → 5 amp/วัน)
- หน่วยในแถวยา HAD แสดง mcg/mEq ตามจริง (เดิมแสดง mg)

## v0.6.6 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- อ่านคำสั่งรูปแบบ paperless ที่วิธีใช้อยู่บรรทัดถัดไปแบบย่อหน้า/ขึ้นต้นด้วยตัวเลข (เช่น "CEF-3 (CEFTRIAXONE) 1G." แล้วบรรทัดใหม่ "2 g + NSS(100) 100 ml IV drip in 1 hr q24hr") — เดิมแยกเป็น 2 รายการ อ่านความถี่ไม่ได้
- HAD: อ่านสารน้ำแบบ "+ NSS(100) 1000 ml" ได้ (KCl 40 mEq ใน 1000 ml rate 80 → 40 mEq/L, 3.2 mEq/h)
- ที่มา: เคสทดลองใช้ 30 ต.ค. 69 (Ceftriaxone, KCl, Calcium gluconate, Morphine, Metoclopramide)

## v0.6.5 — 29 ต.ค. 69 — Motto
- แท็บ Vanco/Colistin: Colistin ใช้ขนาดตามคู่มือ/DUE รพ. เป็นหลัก — LD 300 mg CBA, ปรับตาม CrCl (≥80 150 q8-12h · 40–80 150 q12h · 20–40 100 q12h · <20 150 q24h · HD วันไม่ฟอก 150 q24h / วันฟอก 200 mg หลังฟอก); Garonzik เป็น "อ้างอิงเพิ่ม" (ที่มา: ใบ DUE Colistin, คู่มือ รพ.)
- ข้อความ Colistin: ระบุ indication + ระยะเวลา + loading ใน note (ที่มา: ป้ายห้องยา รพ.)

## v0.6.3 – v0.6.4 — 28 ต.ค. 69
- ช่องอายุเลือกหน่วยได้ (ปี/เดือน/วัน) + เตือนทารกแรกเกิด (<28 วัน) ว่ายังไม่มีกฎขนาดยา neonate
- DUE ตาม FLOW ATB แยกเวร (เวรเช้า 08–16 น.) — Pre-authorized: Colistin, Ceftazidime/avibactam, Tigecycline, Sitafloxacin, Linezolid · Post-authorized: Meropenem, Ertapenem, Imipenem, Pip/Tazo, Vancomycin
- ยาน้ำ: โหมด PRN (ทุก 4–6 ชม. เมื่อมีอาการ)
- แก้การแสดงน้ำหนักทศนิยม (2.25 ไม่ปัดเป็น 2.3)

## v0.6.0 – v0.6.2 — 27 ต.ค. 69
- **แท็บ ADR ครบชุด**: timeline ยา/อาการ/แล็บ, latency เทียบชนิดผื่น, Naranjo หลายยา, WHO-UMC, RegiSCAR, SCORTEN, ALDEN, EuroSCAR (AGEP), PEN-FAST, MALA, chest wall rigidity, Lund-Browder, จำแนกผื่น, ฟอร์ม HPVC และ MKH-FR-PHA-048, พิมพ์ A4 เป็นหลักฐาน HA, บันทึก/เปิดไฟล์ JSON
- แพ้ยาข้ามกลุ่ม (cross.js) — beta-lactam side chain, NSAIDs, AEDs, sulfonamides
- แก้ "ทุก 4-6 ชั่วโมง" / q4-6h ให้อ่านได้

## v0.5.0 – v0.5.2 — 27 ต.ค. 69
- แท็บ Timeline/จ่ายต่อ (refer ไปฉีดต่อ, "จนครบ N วัน" vs "ต่ออีก N วัน")
- แท็บ Warfarin: ตารางรายสัปดาห์, คำนวณจำนวนจ่าย N สัปดาห์, แปลงเป็นเม็ด 3 mg (ความแรงเดียวของ รพ.), แนวทางปรับตาม INR
- Warfarin DI 14 กลุ่ม (ที่มา: ทะเบียนคู่ยา DI Warfarin รพ.มค V1.2)
- กฎจากป้าย: Metformin ตาม eGFR, KCl, ATB ซ้ำซ้อน

## v0.4.0 – v0.4.6 — 27 ต.ค. 69
- เครื่องคำนวณจาก "รวมสูตรคำนวณ" ห้องยา: Dextrose, Opioid (OME), Vancomycin/Colistin
- ATB lock therapy (5 ml)
- HAD: บอกเหตุผล + มาตรฐานความเข้มข้น (peripheral/central) และช่วงขนาด/สูงสุด
- ปรับหน้าตา: มีมิติ, สีสดใส, สีไล่ระดับแยกแต่ละแท็บ

## v0.3 – v0.3.9 — 26–27 ต.ค. 69 (เริ่มทดลองใช้ 27 ต.ค. 69)
- รวมบรรทัดวิธีใช้ที่แยกบรรทัด (รับประทาน/ครั้งละ…)
- แก้ "ครั้งละ 5.5 ซีซี" อ่านเป็นปริมาตร
- Warfarin สูตรรายวัน ("0.5 tab จ พ ศ", "ยกเว้น ศ ครึ่งเม็ด")
- เพิ่ม Itraconazole ที่อยู่ในบัญชียา รพ.

## v0.1 – v0.2 — 26 ต.ค. 69
- ต้นแบบแรก: วางคำสั่งจาก paperless → ตรวจขนาดยาตามไต/HD/เด็ก/TB/HAD/ยาซ้ำซ้อน จากเอกสาร DIS รพ.
