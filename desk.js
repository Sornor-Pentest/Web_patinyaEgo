/*
  Cyber Desk — เครื่องมือส่วนตัวสำหรับงาน Pentest (เพิ่มเข้าเว็ป sornorEgo)
  ใช้งาน: วางไฟล์นี้ข้าง index.html แล้วเพิ่มใน <head> บรรทัดเดียว
      <script src="desk.js" defer></script>
  ปุ่ม "Cyber Desk" จะถูกเพิ่มเข้าแถวเมนูหลัก (.main-nav) ให้อัตโนมัติ
  ทำงานใน Shadow DOM จึงไม่ชนกับ CSS/JS เดิม ข้อมูลเก็บใน localStorage คีย์ "sornorEgo-desk-v1"
*/
(() => {
"use strict";

// ---------- fonts ----------
if (!document.querySelector("link[data-desk-font]")) {
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.dataset.deskFont = "1";
  l.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@500;600;700;800&display=swap";
  document.head.appendChild(l);
}

// ---------- dialog frame (outside shadow) ----------
const gs = document.createElement("style");
gs.textContent = `
#desk-dialog{width:min(1240px,97vw);height:min(92vh,900px);max-width:none;max-height:none;padding:0;margin:auto;
  border:1px solid rgba(255,255,255,.14);border-radius:26px;overflow:hidden;color:#f1f4ff;background:#061442;
  box-shadow:0 30px 80px rgba(0,0,0,.55)}
#desk-dialog::backdrop{background:rgba(3,8,28,.74);backdrop-filter:blur(4px)}
#desk-host{display:block;height:100%}
@media (max-width:820px){#desk-dialog{width:100vw;height:100dvh;border:0;border-radius:0}}`;
document.head.appendChild(gs);

const dlg = document.createElement("dialog");
dlg.id = "desk-dialog"; dlg.setAttribute("aria-label", "Cyber Desk");
const host = document.createElement("div");
host.id = "desk-host";
dlg.appendChild(host);
document.body.appendChild(dlg);
["keydown", "keyup", "keypress"].forEach(t => host.addEventListener(t, e => e.stopPropagation()));
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

const CSS = `
*{box-sizing:border-box}
:host{display:block;height:100%;color:var(--text);font:14.5px/1.6 "IBM Plex Sans Thai",Manrope,system-ui,sans-serif;
  --navy:#061442;--panel:#0a1f5c;--panel-2:#0f2872;--line:rgba(255,255,255,.1);--text:#f1f4ff;--muted:#a3b3e6;
  --blue:#3f5df0;--blue-2:#5a76ff;--yellow:#ffe84d;--ink:#061442;--code:rgba(0,0,0,.3);--ok:#4cd6a0;color-scheme:dark}
[hidden]{display:none!important}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--yellow);outline-offset:2px}
.mono,code,pre,textarea.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace}

.app{display:grid;grid-template-columns:250px minmax(0,1fr);gap:16px;height:100%;padding:16px;
  background:radial-gradient(900px 420px at 90% -8%,rgba(63,93,240,.4),transparent 62%),var(--navy)}
aside{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:20px 14px;
  display:flex;flex-direction:column;gap:22px;overflow:auto;min-height:0}
.brand{display:flex;gap:12px;align-items:center;padding:0 6px}
.logo{width:40px;height:40px;border-radius:12px;background:var(--blue);display:grid;place-items:center;flex:none}
.logo svg{width:21px;height:21px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.brand b{display:block;font:800 18px/1.1 Manrope,sans-serif}
.brand small{display:block;color:var(--muted);font-size:12px;margin-top:4px}
nav{display:flex;flex-direction:column;gap:3px}
nav button{display:flex;align-items:center;gap:11px;background:none;border:0;padding:7px 10px;border-radius:13px;
  color:var(--muted);text-align:left;font:600 14px Manrope,"IBM Plex Sans Thai",sans-serif}
nav button .ic{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.07);display:grid;place-items:center;flex:none}
nav button .ic svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
nav button .lbl{flex:1}
nav button:hover{background:rgba(255,255,255,.06);color:var(--text)}
nav button[aria-selected="true"]{background:var(--blue);color:#fff}
nav button[aria-selected="true"] .ic{background:rgba(255,255,255,.2)}
nav .n{font:600 12px Manrope,sans-serif;background:rgba(255,255,255,.12);border-radius:99px;padding:0 8px;min-width:24px;text-align:center}
nav .n:empty{display:none}
.side-tools{margin-top:auto;display:flex;flex-direction:column;gap:6px}
.hint{margin:6px 6px 0;font-size:12px;color:var(--muted)}

main{overflow:auto;min-width:0;min-height:0;padding:0 6px 24px 0}
main::-webkit-scrollbar{width:10px}
main::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:99px}
.hero{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,1fr);gap:14px;margin-bottom:18px}
.hero-main{position:relative;overflow:hidden;border-radius:20px;padding:26px 28px;
  background:linear-gradient(135deg,#3f5df0,#2541c8)}
.hero-main:before{content:"";position:absolute;right:-70px;top:-80px;width:250px;height:250px;border-radius:50%;
  border:36px solid rgba(255,255,255,.09)}
.hero-main:after{content:"";position:absolute;right:80px;bottom:-100px;width:190px;height:190px;border-radius:50%;
  background:rgba(255,255,255,.07)}
.hero-main>*{position:relative;z-index:1}
.hero-tag{display:inline-block;margin-bottom:14px;padding:2px 12px;border-radius:99px;background:rgba(255,255,255,.17);
  font:600 12px Manrope,sans-serif}
.hero h1{margin:0;font:800 34px/1.1 Manrope,sans-serif;letter-spacing:-.01em}
.hero p{margin:10px 0 0;max-width:48ch;color:#dfe6ff}
.hero-stat{background:var(--yellow);color:var(--ink);border-radius:20px;padding:22px 24px;display:flex;flex-direction:column;gap:8px;justify-content:center}
.hero-stat span{font-weight:600}
.hero-stat b{font:800 46px/1 Manrope,sans-serif}
.hero-stat small{opacity:.72;font-weight:500}
.prog{height:8px;border-radius:99px;background:rgba(6,20,66,.18);overflow:hidden}
.prog i{display:block;height:100%;background:var(--ink);border-radius:99px}

.bar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.bar input[type=search]{flex:1;min-width:180px;padding:11px 18px;border:1px solid var(--line);background:var(--panel);border-radius:99px;color:var(--text)}
.primary{background:var(--blue);color:#fff;border:0;border-radius:99px;padding:11px 22px;font-weight:600}
.primary:hover{background:var(--blue-2)}
.ghost{background:none;border:1px solid rgba(255,255,255,.24);border-radius:99px;padding:9px 18px;color:var(--text)}
.ghost:hover{background:rgba(255,255,255,.08)}
.side-tools .ghost{text-align:left;border-radius:13px;color:var(--muted);padding:8px 14px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:-4px 0 16px}
.chip{border:1px solid var(--line);background:none;border-radius:99px;padding:2px 13px;font-size:13px;color:var(--muted)}
.chip[aria-pressed="true"]{background:var(--yellow);border-color:var(--yellow);color:var(--ink);font-weight:600}

.list{display:flex;flex-direction:column;gap:12px}
.item{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px 18px}
.item h3{margin:0;font:700 15.5px/1.4 Manrope,"IBM Plex Sans Thai",sans-serif;display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.item h3 a{color:inherit;text-decoration:none}
.item h3 a:hover{color:var(--yellow);text-decoration:underline}
.item pre{margin:10px 0 0;padding:12px 14px;background:var(--code);border-radius:12px;overflow-x:auto;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px;font-size:12.5px;color:var(--muted)}
.tag{background:rgba(255,255,255,.09);border-radius:99px;padding:0 10px}
.acts{margin-left:auto;display:flex;gap:4px}
.acts button{background:none;border:0;color:var(--muted);padding:2px 10px;border-radius:99px;font-size:13px}
.acts button:hover{background:rgba(255,255,255,.1);color:var(--text)}
.url{font-size:12.5px;color:var(--muted);word-break:break-all}
.sev{font:700 12px Manrope,sans-serif;padding:2px 11px;border-radius:99px;color:#fff;flex:none}
.s-Critical{background:#d23b4b}.s-High{background:#e5772b}.s-Medium{background:#b88a13}.s-Low{background:#3f5df0}.s-Info{background:#5f6d94}

.task{display:flex;gap:12px;align-items:center}
.state{flex:none;width:86px;border:1px solid var(--line);background:none;border-radius:99px;padding:3px 0;font-size:12.5px}
.state[data-s="doing"]{border-color:var(--yellow);color:var(--yellow)}
.state[data-s="done"]{border-color:var(--ok);color:var(--ok)}
.task .t{flex:1}
.task.done .t b{text-decoration:line-through;color:var(--muted);font-weight:400}
.due{font-size:12.5px;color:var(--muted)}
.due.late{color:#ff8f8f;font-weight:600}

.empty{border:1px dashed rgba(255,255,255,.22);border-radius:18px;padding:34px 20px;text-align:center;color:var(--muted)}
.chk{display:flex;flex-direction:row;align-items:flex-start;gap:10px;color:var(--text);font-size:14px;padding:4px 0;cursor:pointer}
.chk input{width:auto;margin-top:6px;accent-color:var(--yellow)}
.chk input:checked+span{color:var(--muted);text-decoration:line-through}
.grp{margin:0 0 6px}
.tool textarea,.tool input{width:100%;margin-top:10px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.25);color:var(--text);font-size:13px}
.tool textarea{min-height:90px;resize:vertical}
.btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.btns .ghost{padding:6px 14px;font-size:13px}
.cv{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:10px}
.cvres{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;margin-top:12px;padding:14px 18px;border-radius:16px;background:var(--yellow);color:var(--ink)}
.cvres b{font:800 36px/1 Manrope,sans-serif}
.cvres span{font-weight:700}
.cvres code{flex-basis:100%;font-size:12.5px;word-break:break-all}
.ref .scroll{overflow-x:auto;margin-top:8px}
.ref table{width:100%;border-collapse:collapse;font-size:13.5px}
.ref td{padding:6px 10px;border-top:1px solid var(--line);vertical-align:top}
.ref td:first-child{font-family:"JetBrains Mono",ui-monospace,monospace;white-space:nowrap;width:1%;color:var(--yellow)}
.ref td:last-child{color:var(--muted)}

.md{margin-top:10px;font-size:14px;line-height:1.65;word-break:break-word}
.md h4,.md h5,.md h6{margin:14px 0 4px;font-size:14.5px}
.md p{margin:6px 0}.md ul,.md ol{margin:6px 0;padding-left:22px}
.md code{background:var(--code);padding:1px 6px;border-radius:6px;font-size:12.5px}
.md pre{margin:8px 0;padding:12px 14px;background:var(--code);border-radius:12px;overflow-x:auto;font-size:13px;white-space:pre-wrap}
.md pre code{background:none;padding:0}
.md blockquote{margin:6px 0;padding:2px 12px;border-left:3px solid var(--blue-2);color:var(--muted)}
.md a{color:var(--yellow)}.md hr{border:0;border-top:1px solid var(--line)}
#form .md{border-top:1px solid var(--line);padding-top:6px;max-height:260px;overflow:auto}

dialog{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:22px;padding:0;width:min(640px,94vw)}
dialog::backdrop{background:rgba(3,8,28,.72)}
dialog form{padding:24px;display:flex;flex-direction:column;gap:14px}
dialog h2,.rbox h2{margin:0;font:800 19px Manrope,sans-serif}
label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted)}
label input,label textarea,label select{padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.25);color:var(--text)}
label textarea{min-height:150px;resize:vertical;font-size:13px}
select{color-scheme:dark;cursor:pointer}
select option,select optgroup{background:#0a1f5c;color:#f1f4ff;font-size:14px;padding:6px 10px}
select option:checked,select option:hover{background:#3f5df0;color:#fff}
.row{display:flex;gap:8px;justify-content:flex-end}
.rbox{padding:24px;display:flex;flex-direction:column;gap:14px}
.rbox textarea{min-height:340px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:rgba(0,0,0,.25);color:var(--text);font-size:13px;resize:vertical}
#rdlg{width:min(780px,94vw)}
.toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:var(--yellow);color:var(--ink);font-weight:600;
  padding:8px 18px;border-radius:99px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s}
.toast.on{opacity:1}

@media (max-width:820px){
  .app{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);padding:10px;gap:10px}
  aside{flex-direction:row;flex-wrap:wrap;align-items:center;padding:12px;gap:10px;overflow:visible}
  nav{flex-direction:row;order:3;width:100%;overflow-x:auto}
  nav button{white-space:nowrap}
  .side-tools{margin:0 0 0 auto;flex-direction:row}
  .hint{display:none}
  .hero{grid-template-columns:1fr}
  .hero h1{font-size:28px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const HTML = `
<div class="app">
  <aside>
    <div class="brand">
      <span class="logo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <span><b>Cyber Desk</b><small>Personal pentest toolkit</small></span>
    </div>
    <nav id="nav" role="tablist"></nav>
    <div class="side-tools">
      <button class="ghost" id="export">ส่งออกข้อมูล (JSON)</button>
      <button class="ghost" id="import">นำเข้าข้อมูล</button>
      <input type="file" id="file" accept="application/json" hidden>
      <button class="ghost" id="close">ปิด</button>
      <p class="hint">ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น</p>
    </div>
  </aside>
  <main>
    <section class="hero" id="hero"></section>
    <div class="bar">
      <input type="search" id="q" placeholder="ค้นหา..." aria-label="ค้นหา">
      <button class="ghost" id="report">Generate report (MD)</button><button class="primary" id="add"></button>
    </div>
    <div class="chips" id="chips"></div>
    <div class="list" id="list"></div>
  </main>
</div>
<dialog id="dlg"><form method="dialog" id="form"></form></dialog>
<dialog id="rdlg"><div class="rbox"><h2>Report draft (Markdown)</h2>
  <textarea id="rtext" class="mono" readonly spellcheck="false"></textarea>
  <div class="row"><button class="ghost" id="rclose">ปิด</button><button class="ghost" id="rcopy">คัดลอก</button><button class="primary" id="rdl">Download .md</button></div></div></dialog>
<div class="toast" id="toast" role="status"></div>
`;

const root = host.attachShadow({ mode: "open" });
root.innerHTML = `<style>${CSS}</style>` + HTML;

// ================= data =================
const KEY = "sornorEgo-desk-v1";
const SEV = ["Critical", "High", "Medium", "Low", "Info"];
const TAGS = ["tags", "Tags (คั่นด้วยเครื่องหมายจุลภาค)", "input"];
const SCHEMA = {
  findings: { label: "Findings", add: "เพิ่ม Finding", empty: "ยังไม่มี Finding บันทึกช่องโหว่ที่เจอระหว่างทดสอบไว้ที่นี่",
    fields: [["title", "Finding title", "input"], ["client", "Client / Project", "input"], ["target", "Target (URL / endpoint / host)", "input"],
      ["severity", "Severity", "select", SEV], ["cvss", "CVSS (score and vector)", "input"],
      ["status", "Status", "select", ["Open", "Reported", "Fixed", "Accepted risk"]],
      ["body", "Description / Steps to reproduce / Remediation", "textarea"], TAGS] },
  checklist: { label: "Checklist", view: "check" },
  tools: { label: "Toolbox", view: "tools" },
  cmds: { label: "Commands", view: "cmds", search: true },
  refs: { label: "Reference", view: "refs", search: true },
  notes: { label: "Notes", add: "เพิ่มโน้ต", empty: "ยังไม่มีโน้ต เขียนด้วย Markdown แล้วดูพรีวิวได้ทันที",
    fields: [["title", "Title", "input"], ["body", "Content (Markdown)", "textarea"], TAGS] },
  snippets: { label: "Snippets", add: "เพิ่ม Snippet", empty: "ยังไม่มี Snippet เก็บคำสั่งหรือเนื้อหาที่ใช้บ่อยไว้ที่นี่",
    fields: [["title", "Title", "input"], ["body", "Command / Content", "textarea"], TAGS] },
  tasks: { label: "Tasks", add: "เพิ่ม Task", empty: "ยังไม่มี Task เพิ่มสิ่งที่ต้องทำเป็นรายการแรก",
    fields: [["title", "Task", "input"], ["due", "Due date", "date"], TAGS] },
  links: { label: "Links", add: "เพิ่ม Link", empty: "ยังไม่มี Link บันทึกเว็บหรือเครื่องมือที่ใช้บ่อยไว้ที่นี่",
    fields: [["title", "Name", "input"], ["url", "URL", "url"], TAGS] }
};
const IC = {
  findings: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v4M12 16h.01"/>',
  checklist: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 3h6v4H9z"/><path d="m9 14 2 2 4-4"/>',
  tools: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  cmds: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  refs: '<path d="M5 4h13a1 1 0 0 1 1 1v15H6a1 1 0 0 1-1-1z"/><path d="M5 19a2 2 0 0 1 2-2h12"/>',
  notes: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  snippets: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  tasks: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  links: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.7-1.7"/>'
};
const $ = s => root.querySelector(s);
let db = { findings: [], checks: {}, notes: [], snippets: [], tasks: [], links: [] };
let tab = "findings", tagFilter = "", editing = null;

try { const raw = localStorage.getItem(KEY); if (raw) db = Object.assign(db, JSON.parse(raw)); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast("บันทึกลงเบราว์เซอร์ไม่ได้"); } }
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("on"), 1800); }
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tagsOf = it => (it.tags || "").split(",").map(s => s.trim()).filter(Boolean);
const chipsOf = it => tab === "findings" ? [it.client].filter(Boolean) : tagsOf(it);
const safeUrl = u => /^https?:\/\//i.test(u) ? u : "https://" + u;

// ================= chrome =================
const checkTotal = () => CHECK.reduce((n, g) => n + g[1].length, 0);
const checkDone = () => Object.values(db.checks).filter(Boolean).length;

function renderNav() {
  const cnt = k => k === "checklist" ? `${checkDone()}/${checkTotal()}` : SCHEMA[k].view ? "" : db[k].length;
  $("#nav").innerHTML = Object.keys(SCHEMA).map(k =>
    `<button role="tab" data-tab="${k}" aria-selected="${k === tab}"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg></span><span class="lbl">${SCHEMA[k].label}</span><span class="n">${cnt(k)}</span></button>`).join("");
}

function renderHero() {
  const open = db.findings.filter(f => f.status === "Open").length;
  const hi = db.findings.filter(f => f.severity === "Critical" || f.severity === "High").length;
  const pct = Math.round(checkDone() / checkTotal() * 100);
  const todo = db.tasks.filter(t => t.status !== "done").length;
  const H = {
    findings: ["Findings", "บันทึกช่องโหว่ที่เจอ จัดระดับ Severity แล้วสร้างรายงานได้ทันที", "Open findings", open, `${hi} Critical / High`],
    checklist: ["Checklist", "ขั้นตอนทดสอบเว็ปแอปตามแนว OWASP ติ๊กตามที่ทำเสร็จ", "Completed", `${checkDone()}/${checkTotal()}`, null, pct],
    tools: ["Toolbox", "Encode / Decode, CVSS, JWT, Hash และ Timestamp ทำงานในเบราว์เซอร์ ไม่ส่งข้อมูลออกไปไหน", "Tools", 5, "Runs locally"],
    cmds: ["Commands", "คำสั่งของเครื่องมือที่ใช้บ่อย ค้นหาแล้วคัดลอกได้", "Commands", CMDS.length, "nmap, ffuf, sqlmap, curl"],
    refs: ["Reference", "HTTP status, Common ports และ OWASP Top 10 ไว้เปิดดูระหว่างทดสอบ", "Entries", REFS.reduce((n, r) => n + r[1].length, 0), "Searchable"],
    notes: ["Notes", "จดโน้ตด้วย Markdown พร้อมพรีวิวสด", "Notes", db.notes.length, null],
    snippets: ["Snippets", "เก็บคำสั่งหรือเนื้อหาที่ใช้บ่อย กดคัดลอกได้ทันที", "Snippets", db.snippets.length, null],
    tasks: ["Tasks", "รายการงานพร้อมสถานะและกำหนดส่ง", "Open tasks", todo, null],
    links: ["Links", "เก็บลิงก์เครื่องมือและบทความที่ใช้บ่อย", "Links", db.links.length, null]
  }[tab];
  const [title, desc, label, val, sub, pr] = H;
  $("#hero").innerHTML = `<div class="hero-main"><span class="hero-tag">Cyber Desk</span><h1>${title}</h1><p>${desc}</p></div>
    <div class="hero-stat"><span>${label}</span><b>${val}</b>${pr != null ? `<div class="prog"><i style="width:${pr}%"></i></div>` : ""}${sub ? `<small>${esc(sub)}</small>` : ""}</div>`;
}

function render() {
  renderNav(); renderHero();
  const view = SCHEMA[tab].view;
  $(".bar").hidden = !!view && !SCHEMA[tab].search;
  $("#chips").hidden = !!view;
  $("#add").hidden = !!view;
  $("#report").hidden = tab !== "findings";
  if (view) { ({ check: viewCheck, tools: viewTools, cmds: viewCmds, refs: viewRefs })[view](); return; }
  $("#add").textContent = SCHEMA[tab].add;
  const q = $("#q").value.trim().toLowerCase();
  const all = db[tab];
  const tags = [...new Set(all.flatMap(chipsOf))].sort();
  if (tagFilter && !tags.includes(tagFilter)) tagFilter = "";
  $("#chips").innerHTML = tags.map(t => `<button class="chip" data-tag="${esc(t)}" aria-pressed="${t === tagFilter}">${esc(t)}</button>`).join("");

  let items = all.filter(it => (!tagFilter || chipsOf(it).includes(tagFilter)) &&
    (!q || JSON.stringify(Object.values(it)).toLowerCase().includes(q)));
  if (tab === "findings") {
    const so = Object.fromEntries(SEV.map((v, i) => [v, i]));
    items = items.slice().sort((a, b) => so[a.severity] - so[b.severity]);
  } else if (tab === "tasks") {
    const order = { doing: 0, todo: 1, done: 2 };
    items = items.slice().sort((a, b) => order[a.status] - order[b.status] || (a.due || "9").localeCompare(b.due || "9"));
  } else items = items.slice().reverse();

  if (!items.length) {
    $("#list").innerHTML = `<div class="empty">${all.length ? "ไม่พบรายการที่ตรงกับการค้นหา" : SCHEMA[tab].empty}</div>`;
    return;
  }
  $("#list").innerHTML = items.map(card).join("");
}

function acts(it, copy) {
  return `<span class="acts">${copy ? `<button data-a="copy" data-id="${it.id}">คัดลอก</button>` : ""}
    <button data-a="edit" data-id="${it.id}">แก้ไข</button><button data-a="del" data-id="${it.id}">ลบ</button></span>`;
}
const tagHtml = it => tagsOf(it).map(t => `<span class="tag">${esc(t)}</span>`).join("");

function card(it) {
  if (tab === "findings")
    return `<article class="item"><h3><span>${esc(it.title)}</span><span class="sev s-${esc(it.severity)}">${esc(it.severity)}</span></h3>
      ${it.target ? `<div class="url mono">${esc(it.target)}</div>` : ""}${it.cvss ? `<div class="url mono">CVSS ${esc(it.cvss)}</div>` : ""}${it.body ? `<pre>${esc(it.body)}</pre>` : ""}
      <div class="meta">${it.client ? `<span class="tag">${esc(it.client)}</span>` : ""}<span class="tag">${esc(it.status)}</span>${tagHtml(it)}${acts(it, false)}</div></article>`;
  if (tab === "notes")
    return `<article class="item"><h3>${esc(it.title)}</h3><div class="md">${md(it.body)}</div>
      <div class="meta">${tagHtml(it)}${acts(it, true)}</div></article>`;
  if (tab === "snippets")
    return `<article class="item"><h3>${esc(it.title)}</h3><pre>${esc(it.body)}</pre>
      <div class="meta">${tagHtml(it)}${acts(it, true)}</div></article>`;
  if (tab === "links")
    return `<article class="item"><h3><a href="${esc(safeUrl(it.url))}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a></h3>
      <div class="url mono">${esc(it.url)}</div><div class="meta">${tagHtml(it)}${acts(it, true)}</div></article>`;
  const today = new Date().toISOString().slice(0, 10);
  const late = it.due && it.status !== "done" && it.due < today;
  const label = { todo: "To do", doing: "Doing", done: "Done" }[it.status];
  return `<article class="item task ${it.status === "done" ? "done" : ""}">
    <button class="state" data-a="cycle" data-id="${it.id}" data-s="${it.status}" title="เปลี่ยนสถานะ">${label}</button>
    <div class="t"><b>${esc(it.title)}</b>
      <div class="meta">${it.due ? `<span class="due ${late ? "late" : ""}">Due ${esc(it.due)}${late ? " (overdue)" : ""}</span>` : ""}${tagHtml(it)}</div></div>
    ${acts(it, false)}</article>`;
}

function openForm(item, prefill) {
  editing = item || null;
  const src = item || prefill || {};
  const s = SCHEMA[tab];
  const clients = [...new Set(db.findings.map(f => f.client).filter(Boolean))];
  $("#form").innerHTML = `<h2>${item ? "แก้ไข" : s.add}</h2>` + s.fields.map(([k, label, type, opts]) => {
    let ctl;
    if (type === "select") ctl = `<select name="${k}">${opts.map(o => `<option ${o === (src[k] ?? (k === "severity" ? "Medium" : opts[0])) ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    else if (type === "textarea") ctl = `<textarea name="${k}" class="mono">${esc(src[k])}</textarea>`;
    else ctl = `<input name="${k}" type="${type}" value="${esc(src[k])}" ${k === "client" ? 'list="clients"' : ""} ${k === "title" || k === "url" ? "required" : ""}>`;
    return `<label>${label}${ctl}${k === "client" ? `<datalist id="clients">${clients.map(c => `<option value="${esc(c)}">`).join("")}</datalist>` : ""}</label>`;
  }).join("") + (tab === "notes" ? `<div class="md" id="prev"></div>` : "") +
    `<div class="row"><button type="button" class="ghost" id="cancel">ยกเลิก</button><button class="primary" value="ok">บันทึก</button></div>`;
  if (tab === "notes") $("#prev").innerHTML = md(src.body || "");
  $("#dlg").showModal();
  $("#form [name=title]").focus();
}

$("#form").addEventListener("click", e => { if (e.target.id === "cancel") $("#dlg").close(); });
$("#form").addEventListener("submit", e => {
  const data = Object.fromEntries(new FormData(e.target));
  if (editing) Object.assign(editing, data);
  else db[tab].push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...(tab === "tasks" ? { status: "todo" } : {}), ...data });
  save(); render(); toast("บันทึกแล้ว");
});

$("#nav").addEventListener("click", e => {
  const b = e.target.closest("[data-tab]"); if (!b) return;
  tab = b.dataset.tab; tagFilter = ""; $("#q").value = ""; render(); $("main").scrollTop = 0;
});
$("#chips").addEventListener("click", e => {
  const b = e.target.closest("[data-tag]"); if (!b) return;
  tagFilter = tagFilter === b.dataset.tag ? "" : b.dataset.tag; render();
});
$("#list").addEventListener("click", async e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const it = db[tab].find(x => x.id === b.dataset.id); if (!it) return;
  const a = b.dataset.a;
  if (a === "edit") openForm(it);
  else if (a === "del") { if (confirm("ลบรายการนี้?")) { db[tab] = db[tab].filter(x => x !== it); save(); render(); toast("ลบแล้ว"); } }
  else if (a === "cycle") { it.status = { todo: "doing", doing: "done", done: "todo" }[it.status]; save(); render(); }
  else if (a === "copy") {
    try { await navigator.clipboard.writeText(tab === "links" ? it.url : it.body); toast("คัดลอกแล้ว"); }
    catch (err) { toast("คัดลอกไม่สำเร็จ"); }
  }
});
$("#add").onclick = () => openForm();
$("#q").addEventListener("input", render);

// ---- export / import ----
$("#export").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }));
  a.download = "cyber-desk-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click(); URL.revokeObjectURL(a.href);
};
$("#import").onclick = () => $("#file").click();
$("#file").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!confirm("นำเข้าจะแทนที่ข้อมูลปัจจุบันทั้งหมด ดำเนินการต่อ?")) return;
    db = { findings: d.findings || [], checks: d.checks || {}, notes: d.notes || [], snippets: d.snippets || [], tasks: d.tasks || [], links: d.links || [] };
    save(); render(); toast("นำเข้าแล้ว");
  } catch (err) { toast("ไฟล์ไม่ถูกต้อง"); }
  e.target.value = "";
};

// ================= checklist =================
const CHECK = [
  ["Recon", ["Enumerate subdomains and in-scope assets", "Identify tech stack and versions", "Check robots.txt, sitemap.xml and exposed files", "Review JavaScript for endpoints and leaked secrets"]],
  ["Authentication", ["Password policy and account lockout / rate limiting", "Forgot-password flow and reset token handling", "MFA bypass", "Default credentials", "User enumeration through error messages"]],
  ["Session", ["Cookie flags: HttpOnly, Secure, SameSite", "Session invalidation after logout", "Session fixation", "CSRF protection"]],
  ["Authorization", ["IDOR / BOLA", "Vertical and horizontal privilege escalation", "Direct access to admin pages via URL", "Forced browsing"]],
  ["Input validation", ["SQL injection", "XSS (reflected, stored, DOM)", "Command injection", "SSRF", "Path traversal / LFI", "XXE", "File upload (type, size, storage location)"]],
  ["API", ["Mass assignment", "Rate limiting", "Excessive data exposure in responses", "JWT checks (alg, expiry, signature)"]],
  ["Configuration", ["Security headers (CSP, HSTS, X-Frame-Options)", "TLS configuration", "CORS policy", "Debug mode, stack traces, directory listing", "Known vulnerable dependencies"]],
  ["Business logic", ["Workflow step skipping", "Race conditions", "Client-side tampering (price, quantity)"]],
  ["Reporting", ["Capture evidence and screenshots for every finding", "Rate severity with justification", "Write remediation recommendations", "Clean up test data left in the target system"]]
];
function viewCheck() {
  $("#list").innerHTML = `<div class="meta" style="margin:0 0 4px">Progress ${checkDone()}/${checkTotal()}
    <span class="acts"><button data-op="chkreset">Reset all</button></span></div>` +
    CHECK.map(([g, items], gi) => `<section class="item"><h3 class="grp">${g}</h3>` +
      items.map((t, i) => { const k = gi + "." + i;
        return `<label class="chk"><input type="checkbox" data-k="${k}" ${db.checks[k] ? "checked" : ""}><span>${t}</span></label>`; }).join("") +
      `</section>`).join("");
}
$("#list").addEventListener("change", e => {
  const k = e.target.dataset.k; if (!k) return;
  db.checks[k] = e.target.checked; save(); renderNav(); renderHero();
  $("#list .meta").firstChild.textContent = `Progress ${checkDone()}/${checkTotal()} `;
});

// ================= toolbox =================
const te = new TextEncoder(), td = new TextDecoder();
const toB64 = s => { let b = ""; te.encode(s).forEach(x => b += String.fromCharCode(x)); return btoa(b); };
const fromB64 = s => td.decode(Uint8Array.from(atob(s.trim().replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const CONV = {
  b64e: toB64, b64d: fromB64,
  urle: encodeURIComponent, urld: decodeURIComponent,
  hexe: s => hex(te.encode(s)),
  hexd: s => td.decode(Uint8Array.from(s.replace(/\s|0x/g, "").match(/../g) || [], h => parseInt(h, 16))),
  hte: esc,
  htd: s => new DOMParser().parseFromString(s, "text/html").documentElement.textContent
};
function tsConv(v) {
  let d;
  if (/^-?\d+(\.\d+)?$/.test(v)) { let n = Number(v); if (Math.abs(n) < 1e11) n *= 1000; d = new Date(n); }
  else d = new Date(v);
  if (isNaN(d)) throw 0;
  return `Unix (seconds): ${Math.floor(d / 1000)}\nUnix (milliseconds): ${d.getTime()}\nISO (UTC): ${d.toISOString()}\nLocal time: ${d.toLocaleString("th-TH")}`;
}
function viewTools() {
  const b = (op, t) => `<button class="ghost" data-op="${op}">${t}</button>`;
  $("#list").innerHTML = `
  <section class="item tool"><h3>Encode / Decode</h3>
    <textarea id="c-in" class="mono" placeholder="Input text" spellcheck="false"></textarea>
    <div class="btns">${b("b64e", "Base64 encode")}${b("b64d", "Base64 decode")}${b("urle", "URL encode")}${b("urld", "URL decode")}${b("hexe", "Hex encode")}${b("hexd", "Hex decode")}${b("hte", "HTML encode")}${b("htd", "HTML decode")}</div>
    <textarea id="c-out" class="mono" readonly placeholder="Output" spellcheck="false"></textarea>
    <div class="btns">${b("cpout", "Copy output")}${b("swap", "Use output as input")}</div></section>
  <section class="item tool"><h3>CVSS 3.1 Calculator</h3>
    <div class="cv" id="cvss">${CV.map(([k, n, o]) => `<label>${n}<select id="cv-${k}">${o.map(([c, t]) => `<option value="${c}">${t}</option>`).join("")}</select></label>`).join("")}</div>
    <div id="cv-out" class="cvres"></div>
    <div class="btns">${b("cvcopy", "Copy vector")}${b("cvfinding", "Create finding from score")}</div></section>
  <section class="item tool"><h3>JWT Decoder (signature is not verified)</h3>
    <textarea id="j-in" class="mono" placeholder="eyJhbGciOi..." spellcheck="false"></textarea>
    <div class="btns">${b("jwt", "Decode")}</div><pre id="j-out" hidden></pre></section>
  <section class="item tool"><h3>Hash</h3>
    <textarea id="h-in" class="mono" placeholder="Text to hash" spellcheck="false"></textarea>
    <div class="btns">${b("SHA-1", "SHA-1")}${b("SHA-256", "SHA-256")}${b("SHA-512", "SHA-512")}</div><pre id="h-out" hidden></pre></section>
  <section class="item tool"><h3>Timestamp</h3>
    <input id="ts-in" class="mono" placeholder="Unix time or date, e.g. 1700000000 or 2026-11-13T10:00:00Z" spellcheck="false">
    <div class="btns">${b("ts", "Convert")}${b("tsnow", "Now")}</div><pre id="ts-out" hidden></pre></section>`;
  cvssCalc();
}
function show(id, text) { const el = $(id); el.textContent = text; el.hidden = false; }
$("#list").addEventListener("click", async e => {
  const bt = e.target.closest("[data-op]"); if (!bt) return;
  const op = bt.dataset.op;
  try {
    if (CONV[op]) $("#c-out").value = CONV[op]($("#c-in").value);
    else if (op === "cpout") { await navigator.clipboard.writeText($("#c-out").value); toast("คัดลอกแล้ว"); }
    else if (op === "swap") { $("#c-in").value = $("#c-out").value; $("#c-out").value = ""; }
    else if (op === "jwt") {
      const p = $("#j-in").value.trim().split(".");
      if (p.length < 2) throw 0;
      const h = JSON.parse(fromB64(p[0])), pl = JSON.parse(fromB64(p[1]));
      let out = "// header\n" + JSON.stringify(h, null, 2) + "\n\n// payload\n" + JSON.stringify(pl, null, 2) + "\n";
      for (const k of ["iat", "nbf", "exp"]) if (typeof pl[k] === "number") out += `\n${k}: ${new Date(pl[k] * 1000).toISOString()}`;
      if (typeof pl.exp === "number" && pl.exp * 1000 < Date.now()) out += "  (expired)";
      if (/^none$/i.test(h.alg)) out += "\n\nWarning: alg is none";
      show("#j-out", out);
    }
    else if (op.startsWith("SHA")) show("#h-out", hex(await crypto.subtle.digest(op, te.encode($("#h-in").value))));
    else if (op === "ts") show("#ts-out", tsConv($("#ts-in").value.trim()));
    else if (op === "tsnow") { $("#ts-in").value = Math.floor(Date.now() / 1000); show("#ts-out", tsConv($("#ts-in").value)); }
    else if (op === "cvcopy") { await navigator.clipboard.writeText(cvssCalc.res.vec); toast("คัดลอกแล้ว"); }
    else if (op === "cvfinding") {
      const r = cvssCalc.res; tab = "findings"; tagFilter = ""; render();
      openForm(null, { severity: r.sev, cvss: `${r.score.toFixed(1)} ${r.vec}` });
    }
    else if (op === "cpcmd") { await navigator.clipboard.writeText(CMDS[+bt.dataset.i][2]); toast("คัดลอกแล้ว"); }
    else if (op === "chkreset") { if (confirm("ล้างเครื่องหมายใน Checklist ทั้งหมด?")) { db.checks = {}; save(); render(); } }
  } catch (err) { toast("ทำไม่สำเร็จ: ข้อมูลไม่ถูกรูปแบบหรือเบราว์เซอร์ไม่รองรับ"); }
});

// ---- CVSS 3.1 ----
const CV = [
  ["AV", "Attack Vector", [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]]],
  ["AC", "Attack Complexity", [["L", "Low"], ["H", "High"]]],
  ["PR", "Privileges Required", [["N", "None"], ["L", "Low"], ["H", "High"]]],
  ["UI", "User Interaction", [["N", "None"], ["R", "Required"]]],
  ["S", "Scope", [["U", "Unchanged"], ["C", "Changed"]]],
  ["C", "Confidentiality", [["H", "High"], ["L", "Low"], ["N", "None"]]],
  ["I", "Integrity", [["H", "High"], ["L", "Low"], ["N", "None"]]],
  ["A", "Availability", [["H", "High"], ["L", "Low"], ["N", "None"]]]
];
function cvssCalc() {
  const v = Object.fromEntries(CV.map(([k]) => [k, $("#cv-" + k).value]));
  const AV = { N: .85, A: .62, L: .55, P: .2 }[v.AV], AC = { L: .77, H: .44 }[v.AC], UI = { N: .85, R: .62 }[v.UI];
  const ch = v.S === "C";
  const PR = { N: .85, L: ch ? .68 : .62, H: ch ? .5 : .27 }[v.PR];
  const w = { H: .56, L: .22, N: 0 };
  const iss = 1 - (1 - w[v.C]) * (1 - w[v.I]) * (1 - w[v.A]);
  const imp = ch ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const ex = 8.22 * AV * AC * PR * UI;
  const ru = x => { const i = Math.round(x * 100000); return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10; };
  const score = imp <= 0 ? 0 : ru(Math.min((ch ? 1.08 : 1) * (imp + ex), 10));
  const sev = score === 0 ? "Info" : score < 4 ? "Low" : score < 7 ? "Medium" : score < 9 ? "High" : "Critical";
  const vec = "CVSS:3.1/" + CV.map(([k]) => k + ":" + v[k]).join("/");
  cvssCalc.res = { score, sev, vec };
  $("#cv-out").innerHTML = `<b>${score.toFixed(1)}</b><span>${sev}</span><code>${vec}</code>`;
}
$("#list").addEventListener("change", e => { if (e.target.closest("#cvss")) cvssCalc(); });

// ================= commands =================
const CMDS = [
  ["nmap", "Basic scan (default scripts + version detection)", "nmap -sC -sV -oA scan TARGET"],
  ["nmap", "Scan all TCP ports", "nmap -p- --min-rate 1000 -T4 -oA allports TARGET"],
  ["nmap", "Scan common UDP ports", "nmap -sU --top-ports 50 TARGET"],
  ["nmap", "Web scan with NSE (headers and methods)", "nmap -p 80,443 --script http-headers,http-methods TARGET"],
  ["nmap", "Check known vulnerabilities with NSE vuln scripts", "nmap --script vuln -p PORT TARGET"],
  ["ffuf", "Directory and file discovery", "ffuf -u https://TARGET/FUZZ -w wordlist.txt -mc 200,204,301,302,403"],
  ["ffuf", "Virtual host discovery", 'ffuf -u https://TARGET -H "Host: FUZZ.TARGET" -w subdomains.txt -fs SIZE'],
  ["ffuf", "Parameter discovery", 'ffuf -u "https://TARGET/page?FUZZ=1" -w params.txt -fs SIZE'],
  ["gobuster", "Directory discovery with file extensions", "gobuster dir -u https://TARGET -w wordlist.txt -x php,txt,bak"],
  ["gobuster", "Subdomain discovery via DNS", "gobuster dns -d TARGET -w subdomains.txt"],
  ["sqlmap", "Test a parameter in a URL", 'sqlmap -u "https://TARGET/page?id=1" --batch --dbs'],
  ["sqlmap", "Use a request file saved from a proxy", "sqlmap -r req.txt --batch --level 3 --risk 2"],
  ["nikto", "Basic web server scan", "nikto -h https://TARGET"],
  ["curl", "Show full response headers", "curl -i https://TARGET"],
  ["curl", "Show headers only", "curl -I https://TARGET"],
  ["curl", "Send through a proxy (Burp) and skip certificate check", "curl -k -v --proxy http://127.0.0.1:8080 https://TARGET"],
  ["curl", "Send JSON with POST", 'curl -X POST -H "Content-Type: application/json" -d "{}" https://TARGET/api'],
  ["curl", "Show status code only", 'curl -s -o /dev/null -w "%{http_code}" https://TARGET'],
  ["openssl", "Inspect server certificate and TLS", "openssl s_client -connect TARGET:443 -servername TARGET"],
  ["openssl", "Read certificate file details", "openssl x509 -in cert.pem -text -noout"],
  ["dig", "Query DNS records", "dig TARGET ANY +noall +answer"],
  ["dig", "Test zone transfer", "dig axfr TARGET @NAMESERVER"]
];
function viewCmds() {
  const q = $("#q").value.trim().toLowerCase();
  const rows = CMDS.map((c, i) => [c, i]).filter(([c]) => !q || c.join(" ").toLowerCase().includes(q));
  $("#list").innerHTML = rows.length ? rows.map(([[t, d, c], i]) =>
    `<article class="item"><h3><span>${esc(d)}</span><span class="tag">${esc(t)}</span></h3><pre>${esc(c)}</pre>
     <div class="meta"><span>Replace TARGET with an authorized target</span><span class="acts"><button data-op="cpcmd" data-i="${i}">คัดลอก</button></span></div></article>`).join("")
    : `<div class="empty">ไม่พบคำสั่งที่ตรงกับการค้นหา เพิ่มคำสั่งของคุณเองได้ที่แท็บ Snippets</div>`;
}

// ================= reference =================
const REFS = [
  ["HTTP status", [
    ["200", "OK", "Success"], ["201", "Created", "Often seen after POST"], ["204", "No Content", "Success with no body"],
    ["301", "Moved Permanently", "Permanent redirect"], ["302", "Found", "Temporary redirect, check for open redirect"], ["304", "Not Modified", "Use cached copy"],
    ["307 / 308", "Temporary / Permanent Redirect", "Redirect that preserves the method"], ["400", "Bad Request", "Malformed request"],
    ["401", "Unauthorized", "Not authenticated"], ["403", "Forbidden", "Authenticated but not permitted, compare with 404"],
    ["404", "Not Found", "Resource not found"], ["405", "Method Not Allowed", "Try other methods"], ["409", "Conflict", "Conflicts with current state"],
    ["413", "Payload Too Large", "Body exceeds the limit"], ["415", "Unsupported Media Type", "Content-Type not supported"],
    ["429", "Too Many Requests", "Rate limiting in place"], ["500", "Internal Server Error", "Look for stack traces or leaked errors"],
    ["502", "Bad Gateway", "Upstream returned an invalid response"], ["503", "Service Unavailable", "Service is down or overloaded"], ["504", "Gateway Timeout", "Upstream timed out"]]],
  ["Common ports", [
    ["21", "FTP", "Check anonymous login"], ["22", "SSH", "Check version and auth methods"], ["23", "Telnet", "Unencrypted"], ["25", "SMTP", "Check open relay"],
    ["53", "DNS", "Check zone transfer"], ["80", "HTTP", "Web"], ["110 / 143", "POP3 / IMAP", "Email"], ["111", "RPC", "portmapper"],
    ["135 / 139 / 445", "MSRPC / NetBIOS / SMB", "Windows file sharing"], ["161", "SNMP (UDP)", "Check community strings"],
    ["389 / 636", "LDAP / LDAPS", "Directory service"], ["443", "HTTPS", "Encrypted web"], ["1433", "MSSQL", "Database"],
    ["1521", "Oracle DB", "Database"], ["2049", "NFS", "Check exposed exports"], ["3306", "MySQL", "Database"], ["3389", "RDP", "Remote desktop"],
    ["5432", "PostgreSQL", "Database"], ["5900", "VNC", "Remote desktop"], ["6379", "Redis", "Check for missing auth"],
    ["8080 / 8443", "HTTP / HTTPS alternate", "Admin panels or hidden apps"], ["9200", "Elasticsearch", "Check public exposure"], ["27017", "MongoDB", "Check for missing auth"]]],
  ["OWASP Top 10:2021 with example CWEs (newer editions may categorize differently, verify at owasp.org)", [
    ["A01", "Broken Access Control", "CWE-22, 284, 352, 639, 862"], ["A02", "Cryptographic Failures", "CWE-259, 319, 327"],
    ["A03", "Injection", "CWE-78, 79, 89"], ["A04", "Insecure Design", "CWE-209, 434, 501"],
    ["A05", "Security Misconfiguration", "CWE-16, 611"], ["A06", "Vulnerable and Outdated Components", "CWE-1104"],
    ["A07", "Identification and Authentication Failures", "CWE-287, 384, 798"], ["A08", "Software and Data Integrity Failures", "CWE-502, 829"],
    ["A09", "Security Logging and Monitoring Failures", "CWE-117, 778"], ["A10", "Server-Side Request Forgery", "CWE-918"]]]
];
function viewRefs() {
  const q = $("#q").value.trim().toLowerCase();
  const out = REFS.map(([title, rows]) => {
    const r = rows.filter(x => !q || x.join(" ").toLowerCase().includes(q));
    return r.length ? `<section class="item ref"><h3 class="grp">${esc(title)}</h3><div class="scroll"><table>${
      r.map(x => `<tr>${x.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div></section>` : "";
  }).join("");
  $("#list").innerHTML = out || `<div class="empty">ไม่พบรายการที่ตรงกับการค้นหา</div>`;
}

// ================= markdown (minimal) =================
function md(src) {
  const blocks = [];
  const t = esc(src).replace(/```\w*\n([\s\S]*?)```/g, (m, c) => { blocks.push(`<pre><code>${c}</code></pre>`); return "\u0000" + (blocks.length - 1) + "\u0000"; });
  const inline = x => x
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const out = []; let list = null, para = [];
  const fp = () => { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } };
  const fl = () => { if (list) { out.push(`<${list.t}>${list.i.map(x => "<li>" + inline(x) + "</li>").join("")}</${list.t}>`); list = null; } };
  for (const line of t.split("\n")) {
    let m;
    if ((m = line.match(/^\u0000(\d+)\u0000$/))) { fp(); fl(); out.push(blocks[m[1]]); }
    else if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { fp(); fl(); const n = Math.min(m[1].length + 3, 6); out.push(`<h${n}>${inline(m[2])}</h${n}>`); }
    else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) { fp(); if (!list || list.t !== "ul") { fl(); list = { t: "ul", i: [] }; } list.i.push(m[1]); }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { fp(); if (!list || list.t !== "ol") { fl(); list = { t: "ol", i: [] }; } list.i.push(m[1]); }
    else if ((m = line.match(/^&gt;\s?(.*)$/))) { fp(); fl(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if (/^-{3,}$/.test(line.trim())) { fp(); fl(); out.push("<hr>"); }
    else if (!line.trim()) { fp(); fl(); }
    else { fl(); para.push(line); }
  }
  fp(); fl();
  return out.join("");
}
$("#form").addEventListener("input", e => { if (tab === "notes" && e.target.name === "body") $("#prev").innerHTML = md(e.target.value); });

// ================= report =================
function makeReport() {
  const so = Object.fromEntries(SEV.map((v, i) => [v, i]));
  const list = db.findings.filter(f => !tagFilter || f.client === tagFilter).sort((a, b) => so[a.severity] - so[b.severity]);
  if (!list.length) { toast("ยังไม่มี Finding ให้สร้างรายงาน"); return; }
  let o = `# Penetration Test Report\n\n- Client / Project: ${tagFilter || "All"}\n- Report date: ${new Date().toISOString().slice(0, 10)}\n- Total findings: ${list.length}\n\n`;
  o += "## Summary\n\n| Severity | Count |\n|---|---|\n" + SEV.map(v => `| ${v} | ${list.filter(f => f.severity === v).length} |`).join("\n") + "\n\n## Findings\n\n";
  list.forEach((f, i) => {
    o += `### ${i + 1}. ${f.title} [${f.severity}]\n\n`;
    if (f.client && !tagFilter) o += `- Client / Project: ${f.client}\n`;
    if (f.target) o += `- Target: \`${f.target}\`\n`;
    if (f.cvss) o += `- CVSS: ${f.cvss}\n`;
    o += `- Status: ${f.status}\n\n`;
    if (f.body) o += f.body.trim() + "\n\n";
  });
  $("#rtext").value = o;
  $("#rdlg").showModal();
}
$("#report").onclick = makeReport;
$("#rclose").onclick = () => $("#rdlg").close();
$("#rcopy").onclick = async () => { try { await navigator.clipboard.writeText($("#rtext").value); toast("คัดลอกแล้ว"); } catch (e) { toast("คัดลอกไม่สำเร็จ"); } };
$("#rdl").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([$("#rtext").value], { type: "text/markdown" }));
  a.download = "pentest-report-" + new Date().toISOString().slice(0, 10) + ".md";
  a.click(); URL.revokeObjectURL(a.href);
};

// ================= open / close =================
$("#close").onclick = () => dlg.close();
const mainNav = document.querySelector(".main-nav");
let openBtn = document.getElementById("desk-open");
if (openBtn && mainNav && !mainNav.contains(openBtn)) { openBtn.className = "nav-link"; mainNav.appendChild(openBtn); }
if (!openBtn) {
  openBtn = document.createElement("button");
  openBtn.type = "button"; openBtn.id = "desk-open"; openBtn.textContent = "Cyber Desk";
  if (mainNav) { openBtn.className = "nav-link"; mainNav.appendChild(openBtn); }
  else {
    openBtn.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:50;padding:10px 18px;border-radius:99px;border:0;background:#3f5df0;color:#fff;font-weight:600;cursor:pointer";
    document.body.appendChild(openBtn);
  }
}
openBtn.addEventListener("click", e => { e.stopPropagation(); render(); dlg.showModal(); });

render();
})();