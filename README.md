# patinya ego

เว็บคลังคอร์สส่วนตัวสำหรับ Windows / Desktop เขียนด้วย HTML, CSS และ JavaScript โดยไม่ใช้เฟรมเวิร์กหรือขั้นตอน build

## เปิดใช้งาน

แตกไฟล์ ZIP แล้วเปิด `index.html` ด้วย Microsoft Edge หรือ Google Chrome หรือใช้ลิงก์เว็บส่วนตัวที่ส่งในแชต

ไฟล์หลัก:

- `index.html` — โครงสร้างหน้าเว็บและหน้าต่างฟอร์ม
- `styles.css`, `liquid.css` — ดีไซน์และการจัดวาง
- `app.js` — ข้อมูลคอร์สและการทำงานของคลังคอร์ส
- `threatmap.js` — แผนที่ cyber threat map แบบจำลอง (ข้อมูลสุ่ม ไม่ใช่เหตุการณ์จริง)
- `desk.js` — **Cyber Desk** เครื่องมือส่วนตัวสำหรับงาน penetration testing
- `desk-logic.js` — logic ของ Cyber Desk ที่ไม่ผูกกับ DOM (SM-2 spaced repetition, roadmap progress, import validation)
- `desk-data.js` — ข้อมูลเริ่มต้น: detection probes, wordlists, flashcards และ penetration testing roadmap
- `assets/` — ภาพประกอบ, favicon และข้อมูลแผนที่โลก
- `tests/` — unit tests ด้วย Node.js

ลำดับการโหลดสคริปต์ใน `index.html` ต้องเป็น `desk-logic.js` → `desk-data.js` → `desk.js`

ฟอนต์ Manrope และ IBM Plex Sans Thai โหลดจาก Google Fonts หากไม่มีอินเทอร์เน็ตจะใช้ฟอนต์ระบบแทน

## ฟังก์ชัน

- ค้นหาคอร์ส กรองหมวดหมู่และสถานะ เรียงลำดับ และสลับการ์ด/รายการ
- เพิ่มและแก้ไขคอร์ส พร้อมลิงก์เข้าเรียนหรือโฟลเดอร์วิดีโอ
- เปลี่ยนรูปปกคอร์สจากไฟล์ JPG, PNG หรือ WebP พร้อมดูตัวอย่างก่อนบันทึก รูปจะถูกย่อและบันทึกในเบราว์เซอร์ รวมอยู่ในไฟล์สำรอง JSON
- เพิ่มบทเรียนและลิงก์รายบท เช็กบทที่เรียนจบเพื่อคำนวณความคืบหน้า
- แก้ไขชื่อและลิงก์ของแต่ละบทเรียนจากปุ่มดินสอข้างบท โดยเก็บสถานะเรียนจบเดิมไว้
- ใส่ลิงก์คลิปสอนและสไลด์เรียนแยกกันในแต่ละบท พร้อมปุ่มเปิดคลิปและสไลด์ใต้ชื่อบท ลิงก์บทเรียนที่บันทึกไว้เดิมจะแสดงในช่องคลิปสอน
- บันทึกรายการโปรดและโน้ตส่วนตัว
- นำคอร์สออกและกู้คืนจากเมนู ME
- สำรองข้อมูล JSON และนำเข้ากลับจากเมนู ME
- Ctrl+K เพื่อค้นหา

## Cyber Desk

เปิดจากปุ่ม **Cyber Desk** บนแถบเมนู ทำงานในเบราว์เซอร์ทั้งหมด ไม่ส่งข้อมูลออกไปที่ไหน

| แท็บ | ใช้ทำอะไร |
|---|---|
| Findings | บันทึก vulnerability ที่เจอ จัด Severity และ CVSS แล้วสร้าง report เป็น Markdown |
| Checklist | web application testing checklist ตามแนว OWASP |
| **Roadmap** | penetration testing roadmap 9 phases ตั้งแต่ Foundations ถึง Certifications ติ๊กความคืบหน้าได้ และมี badge **Current focus** บอก phase ที่ควรทำต่อ |
| Toolbox | Encode / Decode, CVSS 3.1 calculator, JWT decoder, Hash, Timestamp |
| Commands | คำสั่งของ nmap, ffuf, gobuster, sqlmap, curl, openssl, dig |
| **Payloads** | เก็บ probe, payload และ **Wordlist** แยกตาม category (XSS, SQL Injection, SSTI, Path Traversal, Command Injection, SSRF, Open Redirect) คัดลอกได้ และ Wordlist ดาวน์โหลดเป็น `.txt` ไปใช้กับ ffuf / gobuster ได้ |
| Reference | HTTP status, common ports, OWASP Top 10 |
| **CVE Tracker** | ติดตาม CVE ที่อยากศึกษา พร้อม product, Severity, CVSS, status (Watching / Reading / Lab tested / Done), reference link และโน้ต Markdown ถ้าใส่ CVE ID ถูกรูปแบบ จะมีลิงก์ไป NVD ให้ |
| **Flashcards** | ทบทวนด้วย **spaced repetition** (อัลกอริทึมแบบ SM-2) |
| Notes / Snippets / Tasks / Links | โน้ต Markdown, คำสั่งที่ใช้บ่อย, to-do และลิงก์ |

### Payloads และ Wordlist

- กดปุ่ม **เพิ่มชุดเริ่มต้น** เพื่อโหลด detection probes (เช่น reflection marker, boolean pair, arithmetic probe สำหรับ SSTI) และ wordlist ขนาดเล็ก กดซ้ำไม่ทำให้รายการซ้ำ
- ชุดเริ่มต้นเป็น probe สำหรับตรวจว่า input ถูก reflect, evaluate หรือ fetch หรือไม่ ไม่ใช่ exploit สำเร็จรูป เพิ่ม payload ของคุณเองได้ตามต้องการ
- ใช้กับระบบที่ **ได้รับอนุญาต (authorized)** และอยู่ใน scope เท่านั้น

### Flashcards (spaced repetition)

- กด **เพิ่มชุดเริ่มต้น** เพื่อโหลดการ์ด common ports และ concepts พื้นฐาน เช่น CIA triad, MITRE ATT&CK tactics, CVSS metrics หรือเพิ่มการ์ดของตัวเองก็ได้
- แต่ละครั้งที่ทบทวน เลือก **Again / Hard / Good / Easy** ระบบจะคำนวณวันที่ต้องกลับมาทบทวนใหม่ (ปุ่มแสดงจำนวนวันที่จะถัดไปให้เห็นล่วงหน้า)
- ตอบ Again การ์ดจะกลับมาในวันเดียวกัน ส่วน Good และ Easy จะห่างออกไปเรื่อย ๆ ตัวเลข `due/total` ที่แท็บแสดงจำนวนการ์ดที่ถึงกำหนดแล้ว
- วันที่คิดตามเวลาท้องถิ่นของเครื่อง

### Penetration Testing Roadmap

phases: Foundations, Tooling & Methodology, Web Application Security, Network & Infrastructure, Privilege Escalation & Post-Exploitation, Active Directory, Hands-on Practice, Reporting & Professional Skills และ Certifications แต่ละ phase มีลิงก์แหล่งเรียนที่เป็นทางการ เช่น PortSwigger Web Security Academy, OWASP WSTG, MITRE ATT&CK, TryHackMe และ Hack The Box

## ข้อมูลที่บันทึก

เปลี่ยนรูปปกได้จากปุ่ม **เปลี่ยนรูปปก** บนรูปในหน้าคอร์ส หรือเมนู **แก้ไขข้อมูลคอร์ส** เลือกรูปแล้วกดบันทึก ส่วนชื่อและลิงก์รายบทแก้ไขได้ด้วยปุ่มดินสอข้างบทเรียน แล้วกด **บันทึกบทเรียน**

ข้อมูลบันทึกด้วย localStorage ในเบราว์เซอร์และ origin ที่ใช้งาน ไม่ซิงก์ข้ามเครื่อง เบราว์เซอร์ หรือระหว่างไฟล์ในเครื่องกับลิงก์เว็บ ใช้เมนู ME > สำรองข้อมูลเป็นไฟล์ เพื่อย้ายข้อมูลหรือเก็บสำรอง การล้างข้อมูลเว็บไซต์อาจทำให้ข้อมูลที่บันทึกหาย

เริ่มต้นด้วยคลังคอร์สว่าง สามารถเพิ่มคอร์สของคุณได้จากปุ่มเพิ่มคอร์สใหม่ คอร์สตัวอย่างจากเวอร์ชันเดิมจะถูกนำออกจากข้อมูลในเบราว์เซอร์อัตโนมัติเมื่อเปิดเว็บ โดยคอร์สที่คุณเพิ่มเองยังอยู่ตามเดิม

เวอร์ชันนี้เป็นคลังจัดเก็บลิงก์และติดตามการเรียน ไฟล์วิดีโอยังเก็บอยู่ที่แพลตฟอร์มหรือพื้นที่จัดเก็บเดิม

ข้อมูลของ Cyber Desk แยกเก็บใน localStorage คีย์ `sornorEgo-desk-v1` (คลังคอร์สใช้คีย์ `coursevault.v1`) สำรองได้จากปุ่ม **ส่งออกข้อมูล (JSON)** ใน Cyber Desk การนำเข้าจะแทนที่ข้อมูล Cyber Desk ปัจจุบันทั้งหมด และไฟล์สำรองจากเวอร์ชันเก่าที่ไม่มี Payloads / CVE / Flashcards / Roadmap ยังนำเข้าได้ปกติ

ข้อมูลเก็บในเบราว์เซอร์แบบไม่เข้ารหัส อย่าบันทึก credential จริงหรือข้อมูลลูกค้าที่เป็นความลับไว้ใน Notes, Snippets หรือ Findings

## ทดสอบ

รันทุกเทสต์ด้วย Node.js (ไม่ต้องติดตั้งแพ็กเกจเพิ่ม):

```
node --test
```

- `tests/app.test.cjs` — การบันทึกรูปปก การแก้ไขบทเรียน และลิงก์คลิป/สไลด์ (ใช้ DOM จำลอง)
- `tests/desk-logic.test.cjs` — SM-2 scheduling, due-card ordering, roadmap progress, seed merging, import normalization และความถูกต้องของข้อมูลเริ่มต้น

## แนวทางดีไซน์

ได้แรงบันดาลใจด้านสี แสง และตัวอักษรจาก [CyberSafe — Cybersecurity Landing Page Design](https://www.behance.net/gallery/253420645/CyberSafe-Cybersecurity-Landing-Page-Design) และปรับโครงสร้างให้เป็นคลังคอร์สส่วนตัว ไม่ได้นำภาพต้นฉบับมาใช้

ไอคอนและภาพปกคอร์สเป็น SVG ที่เขียนสำหรับโปรเจกต์นี้ ภาพ hero สร้างด้วย built-in ImageGen และเก็บที่ `assets/hero-book.png`

Prompt ที่ใช้สร้างภาพ hero:

> Use case: stylized-concept. Asset type: cinematic website hero background for a private online course library called CourseVault. Create a premium photorealistic 3D render of a single sculptural open book made from layered smoked translucent glass and polished dark chrome, with brilliant electric ice-blue light radiating between the pages. One very thin metallic orbital ring wraps the book diagonally. The book floats above a dark reflective surface, realistic caustics, subtle blue haze and film grain, physically rendered, exquisite high-end editorial art direction. Extremely dark midnight navy backdrop (#040e1c), electric blue lighting, no purple, no green. Wide landscape 16:9 composition, book positioned in the right half, left half dark with negative space for website copy, book well within the frame. Beautiful dramatic side lighting, tactile glass page edges, understated futuristic aesthetic. No text, no letters, no logos, no UI, no watermark.