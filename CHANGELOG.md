# CHANGELOG — IPD Screening Assistant

รูปแบบการเขียน (เพิ่มรายการใหม่ไว้ **บนสุด**):
```
## vX.Y.Z — วันที่ — ผู้แก้
- แก้อะไร  (ที่มา: เอกสาร/ใบ DUE/ป้าย)
- ผู้ตรวจทาน: …
```

---

## v0.9.2 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- ADR: ปุ่ม **พิมพ์แบบรายงาน HPVC + 048 (ฉบับ รพ. 2561)** — หน้า 1 แบบรายงานเหตุการณ์ไม่พึงประสงค์ (HPVC) ติ๊ก ☑ ตามข้อมูลที่กรอก + หน้าถัดไป MKH-FR-PHA-048 · ช่องชื่อ/HN/AN/เลขบัตรเว้นเส้นประให้เขียนด้วยมือ
- หัวข้อ 7 เพิ่ม: ชนิดรายงาน · ประเภทผลิตภัณฑ์ · สาเหตุการเกิด · ผู้แจ้ง/ผู้วินิจฉัย · Initial/Follow up

## v0.9.1 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- ผล Lab: อ่านรูปแบบที่คัดลอกจาก HIS แบบชื่อ Lab อยู่บรรทัดหนึ่ง ค่าอยู่บรรทัดถัดไปได้ (เดิมอ่านไม่ได้)

## v0.9.0 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- **แพ้ยาข้ามกลุ่ม** (cross.js) เพิ่มจากสไลด์ Drug Allergy & Cross-Reactivity (update): Macrolide · Quinolone (ตารางแนะนำตาม generation) · Azole/nitroimidazole (โครงสร้างร่วม) · PPI · Antihistamine (สายยาแม่-เมแทบอไลต์ + กลุ่มโครงสร้าง) · Statin (type I/II) · คำค้นกลุ่ม เช่น "แพ้ quinolone", "แพ้ PPI"
- **ยาต้านการแข็งตัวของเลือด** (Academic in-service Gen-med2): เพิ่ม Dabigatran (ปรับตามไต + DI P-gp/CYP3A4 + อายุ ≥75/น้ำหนัก ≤60) · Enoxaparin prophylaxis CrCl <30 = 30 mg OD · เตือนใช้ anticoagulant ≥2 ตัว พร้อมวิธีเปลี่ยนยา · Warfarin ในหญิงตั้งครรภ์ตามไตรมาส
- **ADR ยาวัณโรค**: AST/ALT >5×ULN (หรือ >3× + อาการ) → หยุด HRZ + แนวทาง rechallenge · bilirubin ขึ้นเด่นกับ rifampicin · INH ไม่มี pyridoxine
- **Opioid (palliative)**: regular opioid ไม่มียาระบาย/ไม่มี rescue dose · morphine ใน CrCl <30/HD · pethidine ต่อเนื่อง · tramadol >400 mg/วัน
- **ยาจิตเวช (antipsychotics)**: ขนาดเกินช่วงปกติ + เทียบ chlorpromazine · ใช้ >1 ตัว · DI ผ่าน CYP1A2/2D6/3A4 · Clozapine + ANC
- แท็บใหม่ **คู่มือย่อ**: anticoagulant (ไต, DI, เปลี่ยนยา, ยาแก้ฤทธิ์, ตั้งครรภ์) · ADR ยาวัณโรค (ตาราง rechallenge) · palliative (แปลงขนาด opioid, naloxone, หอบ) · antipsychotics · cross-allergy สรุป
- Timeline/จ่ายต่อ: เพิ่ม **นับเม็ดยาถึงวันนัด (ARV/ยาต่อเนื่อง)** จากไฟล์คำนวณยา ARV — ยาเหลือ + สั่งเพิ่ม เทียบจำนวนถึงนัด → ขาด/เกิน/ควรจ่าย

## v0.8.0 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- แท็บใหม่ **"แผนภาพ Timeline ยา"** (dtl.js) — แผนภาพลำดับเวลาการใช้ยาทั่วไป (ไม่จำกัดเฉพาะ ADR)
  - วางคำสั่งยาจาก paperless → เพิ่มเป็นรายการยา (อ่าน "start 24-30/10/69" เป็นวันเริ่ม-หยุดให้) หรือเพิ่มเอง · แก้/ลบในตาราง
  - เพิ่มอาการไม่พึงประสงค์ ▼ · ผล Lab ● · ความเห็นเภสัชกร ◆
  - สัญลักษณ์: ○ เริ่มยา · ◀ ได้รับมาก่อน/ต่อจากหน้าก่อน · ◉ หยุดยา · ▶ กำลังใช้ยาอยู่ (ถึงวันที่จัดทำ)
  - ตั้งจำนวนวันต่อหน้า แบ่งหน้าอัตโนมัติ · พิมพ์/ส่งออก PDF แนวนอน A4 · บันทึก/เปิดไฟล์ (.json) · จำข้อมูลในเครื่องนี้
  - ไม่เก็บชื่อ/HN — ตอนพิมพ์มีเส้นประให้เขียนด้วยมือ

## v0.7.2 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- แท็บเคมีบำบัด: **วางคำสั่งยา** (แบบ paperless) → เลือกสูตรที่ตรงให้อัตโนมัติ → เติมขนาดที่สั่ง → **คำนวณย้อนกลับ** เป็น mg/m² · mg/kg · AUC แล้วเทียบสูตร ±5%
  - แยก 5-FU bolus/push กับ infusion 22–24 ชม. ได้ · รองรับคำสั่งที่เขียน "85 mg/m2" · แสดงยาเคมีที่ไม่อยู่ในสูตร
- Fentanyl patch (TTS 25/50 mcg/hr): ไม่ถูกตรวจเป็น HAD infusion อีก · ตรวจความถี่ q72h (q48h บางราย) · OME ×2 · วิธีแปะ/ข้อห้าม ตามแผ่นพับ รพ. · เตือนเมื่อใช้ร่วม opioid อื่น
- ADR → แบบประเมินเฉพาะ: เพิ่ม Phlebitis scale (grade 0–4 + การดูแล)

## v0.7.1 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- ยาพ่น Asthma/COPD (policy.js) ตามมาตรการควบคุมค่าใช้จ่ายด้านยา ปีงบ 2570 (มติประชุม 29/09/2569):
  - ทุกยาพ่น (MDI/Accuhaler/Ellipta/Respimat/Turbuhaler): เตือนตรวจยาพ่นเดิม (MR) ใน 48 ชม. · มียาเดิม → สติ๊กเกอร์จำนวน 0 + "ใช้ยาเดิมของผู้ป่วย" · ไม่มี → consult แพทย์
  - Anoro, Spiolto, Symbicort: start เฉพาะ Staff MED/Chest MED · Trelegy: เฉพาะ Chest MED
  - Symbicort + Reliever MDI (Salbutamol/Berodual): ไม่แนะนำ
  - Reliever MDI: 1 หลอด/4 เดือน ครั้งละ 1 หลอด (เตือนเมื่อระบุ #2 ขึ้นไป)
  - Pre-OP: ใช้ Nebulizer แทน MDI หรือใช้ยาเดิม

## v0.7.0 — 30 ต.ค. 69 — Motto (ผ่าน Claude)
- **ผล Lab** (กล่องใหม่ในแผงผู้ป่วย): วางผล Lab ที่คัดลอกจากหน้าจอเภสัช HIS แล้วกด "อ่านค่า Lab" — เติม Cr/K/Mg/INR/CrCl/eGFR และ WBC, Neutrophil, Plt, Hb, Albumin, AST/ALT, Bilirubin, Ca, Phos, Na ฯลฯ
  - คำนวณ ANC = WBC × Neutrophil% · Corrected Ca = Ca + 0.8×(4 − Alb) · เตือน ANC <1,500, Plt <100,000, AST/ALT >3×ULN, T.bil >3 ⚑
- **ตรวจสูตร ARV** (lab.js → arvChk): ยาเม็ดรวมซ้ำกับยาเดี่ยว, 3TC+FTC, TDF+TAF, จำนวน NRTI/ยาหลัก, PI ไม่ boost (RTV/COBI), DTG + Rifampicin/Phenytoin/EFV ต้อง q12h (ARV Screening IPD 2568), RPV/PI + Rifampicin, RPV/ATV + PPI ⚑, ATV ใน HD
- **เคมีบำบัด**: แท็บใหม่ "เคมีบำบัด" คำนวณขนาดตามสูตรในชีท CMT รพ. (24.3.2023) — BSA Mosteller, Carboplatin Calvert, Trastuzumab mg/kg, Vincristine max 2 mg, เทียบขนาดที่แพทย์สั่ง ±5% ⚑
  - หน้าตรวจใบสั่งยา: ยาเคมีบำบัดแสดง mg/m² และสูตรที่ใกล้ที่สุด + เตือน ANC/Plt
- ⚑ = เกณฑ์ทั่วไป ยังไม่ใช่เอกสาร รพ.

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
