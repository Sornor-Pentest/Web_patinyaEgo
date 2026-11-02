# patinya ego

เว็บคลังคอร์สส่วนตัวสำหรับ Windows / Desktop เขียนด้วย HTML, CSS และ JavaScript โดยไม่ใช้เฟรมเวิร์กหรือขั้นตอน build

## เปิดใช้งาน

แตกไฟล์ ZIP แล้วเปิด `index.html` ด้วย Microsoft Edge หรือ Google Chrome หรือใช้ลิงก์เว็บส่วนตัวที่ส่งในแชต

ไฟล์หลัก:

- `index.html` — โครงสร้างหน้าเว็บและหน้าต่างฟอร์ม
- `styles.css` — ดีไซน์และการจัดวาง
- `app.js` — ข้อมูลคอร์สและการทำงานทั้งหมด
- `assets/` — ภาพประกอบและ favicon

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

## ข้อมูลที่บันทึก

เปลี่ยนรูปปกได้จากปุ่ม **เปลี่ยนรูปปก** บนรูปในหน้าคอร์ส หรือเมนู **แก้ไขข้อมูลคอร์ส** เลือกรูปแล้วกดบันทึก ส่วนชื่อและลิงก์รายบทแก้ไขได้ด้วยปุ่มดินสอข้างบทเรียน แล้วกด **บันทึกบทเรียน**

ข้อมูลบันทึกด้วย localStorage ในเบราว์เซอร์และ origin ที่ใช้งาน ไม่ซิงก์ข้ามเครื่อง เบราว์เซอร์ หรือระหว่างไฟล์ในเครื่องกับลิงก์เว็บ ใช้เมนู ME > สำรองข้อมูลเป็นไฟล์ เพื่อย้ายข้อมูลหรือเก็บสำรอง การล้างข้อมูลเว็บไซต์อาจทำให้ข้อมูลที่บันทึกหาย

เริ่มต้นด้วยคลังคอร์สว่าง สามารถเพิ่มคอร์สของคุณได้จากปุ่มเพิ่มคอร์สใหม่ คอร์สตัวอย่างจากเวอร์ชันเดิมจะถูกนำออกจากข้อมูลในเบราว์เซอร์อัตโนมัติเมื่อเปิดเว็บ โดยคอร์สที่คุณเพิ่มเองยังอยู่ตามเดิม

เวอร์ชันนี้เป็นคลังจัดเก็บลิงก์และติดตามการเรียน ไฟล์วิดีโอยังเก็บอยู่ที่แพลตฟอร์มหรือพื้นที่จัดเก็บเดิม

ทดสอบการบันทึกรูปปกและการแก้ไขบทเรียนด้วย Node.js: `node --test tests/app.test.cjs` (ใช้ DOM จำลองสำหรับทดสอบ logic ไม่ต้องติดตั้งแพ็กเกจเพิ่ม)

## แนวทางดีไซน์

ได้แรงบันดาลใจด้านสี แสง และตัวอักษรจาก [CyberSafe — Cybersecurity Landing Page Design](https://www.behance.net/gallery/253420645/CyberSafe-Cybersecurity-Landing-Page-Design) และปรับโครงสร้างให้เป็นคลังคอร์สส่วนตัว ไม่ได้นำภาพต้นฉบับมาใช้

ไอคอนและภาพปกคอร์สเป็น SVG ที่เขียนสำหรับโปรเจกต์นี้ ภาพ hero สร้างด้วย built-in ImageGen และเก็บที่ `assets/hero-book.png`

Prompt ที่ใช้สร้างภาพ hero:

> Use case: stylized-concept. Asset type: cinematic website hero background for a private online course library called CourseVault. Create a premium photorealistic 3D render of a single sculptural open book made from layered smoked translucent glass and polished dark chrome, with brilliant electric ice-blue light radiating between the pages. One very thin metallic orbital ring wraps the book diagonally. The book floats above a dark reflective surface, realistic caustics, subtle blue haze and film grain, physically rendered, exquisite high-end editorial art direction. Extremely dark midnight navy backdrop (#040e1c), electric blue lighting, no purple, no green. Wide landscape 16:9 composition, book positioned in the right half, left half dark with negative space for website copy, book well within the frame. Beautiful dramatic side lighting, tactile glass page edges, understated futuristic aesthetic. No text, no letters, no logos, no UI, no watermark.
