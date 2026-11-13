/*
  Cyber Desk — เครื่องมือส่วนตัวสำหรับงาน Pentest (เพิ่มเข้าเว็ป sornorEgo)
  ใช้งาน: วางไฟล์นี้ข้าง index.html แล้วเพิ่มในหน้า 2 จุด
    1) <script src="desk.js" defer></script>  (ใน <head>)
    2) <button class="button button-ghost" id="desk-open" type="button">Cyber Desk</button>  (ใน .header-actions)
  ทำงานใน Shadow DOM จึงไม่ชนกับ CSS/JS เดิม ข้อมูลเก็บใน localStorage คีย์ "sornorEgo-desk-v1"
*/
(() => {
"use strict";

// ---------- ฟอนต์ monospace (ถ้ายังไม่มี) ----------
if (!document.querySelector('link[data-desk-font]')) {
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.dataset.deskFont = "1";
  l.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
}

// ---------- กรอบ dialog (นอก shadow) ----------
const gs = document.createElement("style");
gs.textContent = `
#desk-dialog{width:min(1180px,96vw);height:min(90vh,860px);max-width:none;max-height:none;padding:0;margin:auto;
  border:1px solid rgba(255,255,255,.16);border-radius:14px;overflow:hidden;color:#eef2ff;
  background:linear-gradient(160deg,#0b1d5c,#061442)}
#desk-dialog::backdrop{background:rgba(3,8,28,.72);backdrop-filter:blur(4px)}
#desk-host{display:block;height:100%}
@media (max-width:760px){#desk-dialog{width:100vw;height:100dvh;border:0;border-radius:0}}`;
document.head.appendChild(gs);

const dlg = document.createElement("dialog");
dlg.id = "desk-dialog"; dlg.setAttribute("aria-label", "Cyber Desk");
const host = document.createElement("div");
host.id = "desk-host";
dlg.appendChild(host);
document.body.appendChild(dlg);
// กันคีย์ลัดของหน้าเดิม (เช่น Ctrl K) มารบกวนตอนพิมพ์ในหน้านี้
["keydown", "keyup", "keypress"].forEach(t => host.addEventListener(t, e => e.stopPropagation()));
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

const CSS = `:host{display:block;height:100%;color:var(--text);font:15px/1.6 "IBM Plex Sans Thai",system-ui,sans-serif;
  --bg:rgba(2,8,32,.45);--surface:rgba(255,255,255,.055);--line:rgba(255,255,255,.14);--text:#eef2ff;--muted:#9db0e6;
  --accent:#6f9bff;--accent-ink:#061442;--code:rgba(0,0,0,.3);--ok:#4cc38a;--warn:#e6b84e;color-scheme:dark}

*{box-sizing:border-box}
.mono,code,pre,textarea.mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.app{display:grid;grid-template-columns:230px 1fr;min-height:100vh}
aside{border-right:1px solid var(--line);padding:22px 16px;display:flex;flex-direction:column;gap:22px;
  position:sticky;top:0;height:100vh}
.brand{font-weight:600;font-size:18px;letter-spacing:.01em}
.brand small{display:block;font-weight:400;font-size:12px;color:var(--muted)}
nav{display:flex;flex-direction:column;gap:4px}
nav button{display:flex;justify-content:space-between;align-items:center;background:none;border:0;
  padding:9px 12px;border-radius:6px;text-align:left;color:var(--muted)}
nav button:hover{background:var(--surface)}
nav button[aria-selected="true"]{background:var(--surface);color:var(--text);font-weight:500;
  box-shadow:inset 3px 0 0 var(--accent)}
nav .n{font-size:12px;color:var(--muted)}
.side-tools{margin-top:auto;display:flex;flex-direction:column;gap:6px}
.ghost{background:none;border:1px solid var(--line);border-radius:6px;padding:7px 10px;color:var(--muted);text-align:left}
.ghost:hover{color:var(--text);border-color:var(--muted)}

main{padding:26px clamp(16px,4vw,44px);max-width:980px;width:100%}
.bar{display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap}
.bar input[type=search]{flex:1;min-width:180px;padding:10px 14px;border:1px solid var(--line);
  background:var(--surface);border-radius:6px}
.primary{background:var(--accent);color:var(--accent-ink);border:0;border-radius:6px;padding:10px 18px;font-weight:500}
.primary:hover{filter:brightness(1.08)}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:-8px 0 18px}
.chip{border:1px solid var(--line);background:none;border-radius:99px;padding:2px 11px;font-size:13px;color:var(--muted)}
.chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}

.list{display:flex;flex-direction:column;gap:10px}
.item{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px 16px}
.item h3{margin:0;font-size:15px;font-weight:600;display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.item h3 a{color:inherit;text-decoration:none}
.item h3 a:hover{color:var(--accent);text-decoration:underline}
.item pre{margin:10px 0 0;padding:12px 14px;background:var(--code);border-radius:6px;overflow-x:auto;
  font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px;font-size:12.5px;color:var(--muted)}
.tag{background:var(--code);border-radius:4px;padding:1px 8px}
.acts{margin-left:auto;display:flex;gap:4px}
.acts button{background:none;border:0;color:var(--muted);padding:2px 8px;border-radius:4px;font-size:13px}
.acts button:hover{background:var(--code);color:var(--text)}
.url{font-size:12.5px;color:var(--muted);word-break:break-all}

.task{display:flex;gap:12px;align-items:center}
.state{flex:none;width:86px;border:1px solid var(--line);background:none;border-radius:6px;padding:3px 0;font-size:12.5px}
.state[data-s="doing"]{border-color:var(--warn);color:var(--warn)}
.state[data-s="done"]{border-color:var(--ok);color:var(--ok)}
.task .t{flex:1}
.task.done .t b{text-decoration:line-through;color:var(--muted);font-weight:400}
.due{font-size:12.5px;color:var(--muted)}
.due.late{color:#d64545;font-weight:500}

[hidden]{display:none!important}
label select{padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text)}
.sev{font-size:12px;font-weight:500;padding:1px 10px;border-radius:99px;color:#fff;flex:none}
.s-Critical{background:#c0392b}.s-High{background:#d9722b}.s-Medium{background:#a9791c}.s-Low{background:#3a6fd8}.s-Info{background:#6b7686}
.chk{flex-direction:row;align-items:flex-start;gap:10px;color:var(--text);font-size:14px;padding:4px 0;cursor:pointer}
.chk input{padding:0;border:0;width:auto;margin-top:6px}
.chk input:checked+span{color:var(--muted);text-decoration:line-through}
.grp{margin:0 0 6px;font-size:14px;font-weight:600}
.tool textarea,.tool input{width:100%;padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;margin-top:10px}
.tool textarea{min-height:90px;resize:vertical}
.btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.bar .ghost{padding:10px 14px}
.cv{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:10px}
.ref .scroll{overflow-x:auto;margin-top:8px}
.ref table{width:100%;border-collapse:collapse;font-size:13.5px}
.ref td{padding:6px 10px;border-top:1px solid var(--line);vertical-align:top}
.ref td:first-child{font-family:"JetBrains Mono",ui-monospace,monospace;white-space:nowrap;width:1%}
.ref td:last-child{color:var(--muted)}
.md{margin-top:10px;font-size:14px;line-height:1.65;word-break:break-word}
.md h4,.md h5,.md h6{margin:14px 0 4px;font-size:14.5px}
.md p{margin:6px 0}.md ul,.md ol{margin:6px 0;padding-left:22px}
.md code{font-family:"JetBrains Mono",ui-monospace,monospace;background:var(--code);padding:1px 5px;border-radius:4px;font-size:12.5px}
.md pre{margin:8px 0;padding:12px 14px;background:var(--code);border-radius:6px;overflow-x:auto;font-size:13px;white-space:pre-wrap}
.md pre code{background:none;padding:0}
.md blockquote{margin:6px 0;padding:2px 12px;border-left:3px solid var(--line);color:var(--muted)}
.md a{color:var(--accent)}.md hr{border:0;border-top:1px solid var(--line)}
#form .md{border-top:1px solid var(--line);padding-top:6px;max-height:260px;overflow:auto}
.rbox{padding:22px;display:flex;flex-direction:column;gap:14px}
.rbox h2{margin:0;font-size:17px}
.rbox textarea{min-height:340px;padding:10px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;resize:vertical}
#rdlg{width:min(760px,94vw)}
.empty{border:1px dashed var(--line);border-radius:8px;padding:34px 20px;text-align:center;color:var(--muted)}

dialog{border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:10px;
  padding:0;width:min(620px,94vw)}
dialog::backdrop{background:rgba(10,14,20,.55)}
dialog form{padding:22px;display:flex;flex-direction:column;gap:14px}
dialog h2{margin:0;font-size:17px}
label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted)}
label input,label textarea{padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text)}
label textarea{min-height:150px;resize:vertical;font-size:13px}
.row{display:flex;gap:8px;justify-content:flex-end}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);
  padding:8px 16px;border-radius:6px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s}
.toast.on{opacity:1}

@media (max-width:760px){
  .app{grid-template-columns:1fr}
  aside{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;padding:14px 16px;
    border-right:0;border-bottom:1px solid var(--line);gap:12px}
  nav{flex-direction:row;order:3;width:100%;overflow-x:auto}
  nav button{white-space:nowrap;gap:8px}
  .side-tools{margin:0 0 0 auto;flex-direction:row}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}

.app{height:100%;min-height:0}
aside{position:static;height:100%;overflow:auto}
main{max-width:none;height:100%;overflow:auto}
dialog{background:#0c1f66}
.toast{color:#061442}
@media (max-width:760px){.app{grid-template-rows:auto minmax(0,1fr)}aside{height:auto;overflow:visible}}
`;
const HTML = `
<div class="app">
  <aside>
    <div class="brand">Cyber Desk<small>เครื่องมือส่วนตัว ข้อมูลเก็บในเบราว์เซอร์นี้</small></div>
    <nav id="nav" role="tablist"></nav>
    <div class="side-tools">
      <button class="ghost" id="export">ส่งออกข้อมูล (JSON)</button>
      <button class="ghost" id="import">นำเข้าข้อมูล</button>
      <input type="file" id="file" accept="application/json" hidden>
      <button class="ghost" id="close">ปิด</button>
    </div>
  </aside>
  <main>
    <div class="bar">
      <input type="search" id="q" placeholder="ค้นหา..." aria-label="ค้นหา">
      <button class="ghost" id="report">สร้างรายงาน (MD)</button><button class="primary" id="add"></button>
    </div>
    <div class="chips" id="chips"></div>
    <div class="list" id="list"></div>
  </main>
</div>
<dialog id="dlg"><form method="dialog" id="form"></form></dialog>
<dialog id="rdlg"><div class="rbox"><h2>ร่างรายงาน (Markdown)</h2>
  <textarea id="rtext" class="mono" readonly spellcheck="false"></textarea>
  <div class="row"><button class="ghost" id="rclose">ปิด</button><button class="ghost" id="rcopy">คัดลอก</button><button class="primary" id="rdl">ดาวน์โหลด .md</button></div></div></dialog>
<div class="toast" id="toast" role="status"></div>
`;
const root = host.attachShadow({ mode: "open" });
root.innerHTML = `<style>${CSS}</style>` + HTML;


const KEY = "sornorEgo-desk-v1";
const SEV = ["Critical","High","Medium","Low","Info"];
const SCHEMA = {
  findings: { label: "ข้อพบ", add: "เพิ่มข้อพบ", empty: "ยังไม่มีข้อพบ บันทึกช่องโหว่ที่เจอระหว่างทดสอบไว้ที่นี่",
    fields: [["title","ชื่อข้อพบ","input"],["client","งาน / ลูกค้า","input"],["target","เป้าหมาย (URL / endpoint / host)","input"],
      ["severity","ระดับความรุนแรง","select",SEV],["cvss","CVSS (คะแนน และ vector)","input"],["status","สถานะ","select",["Open","Reported","Fixed","Accepted risk"]],
      ["body","รายละเอียด / ขั้นตอน reproduce / ข้อเสนอแนะ","textarea"],["tags","แท็ก (คั่นด้วยเครื่องหมายจุลภาค)","input"]] },
  checklist: { label: "เช็กลิสต์", view: "check" },
  tools: { label: "เครื่องมือ", view: "tools" },
  cmds: { label: "คำสั่ง", view: "cmds", search: true },
  refs: { label: "ตารางอ้างอิง", view: "refs", search: true },
  notes: { label: "โน้ต MD", add: "เพิ่มโน้ต", empty: "ยังไม่มีโน้ต เขียนด้วย Markdown แล้วดูพรีวิวได้ทันที",
    fields: [["title","หัวข้อ","input"],["body","เนื้อหา (Markdown)","textarea"],["tags","แท็ก (คั่นด้วยเครื่องหมายจุลภาค)","input"]] },
  snippets: { label: "สนิปเป็ต", add: "เพิ่มสนิปเป็ต", empty: "ยังไม่มีสนิปเป็ต เก็บคำสั่งหรือโน้ตที่ใช้บ่อยไว้ที่นี่",
    fields: [["title","หัวข้อ","input"],["body","คำสั่ง / เนื้อหา","textarea"],["tags","แท็ก (คั่นด้วยเครื่องหมายจุลภาค)","input"]] },
  tasks: { label: "งาน", add: "เพิ่มงาน", empty: "ยังไม่มีงาน เพิ่มสิ่งที่ต้องทำเป็นรายการแรก",
    fields: [["title","งาน","input"],["due","กำหนดส่ง","date"],["tags","แท็ก (คั่นด้วยเครื่องหมายจุลภาค)","input"]] },
  links: { label: "ลิงก์", add: "เพิ่มลิงก์", empty: "ยังไม่มีลิงก์ บันทึกเว็บหรือเครื่องมือที่ใช้บ่อยไว้ที่นี่",
    fields: [["title","ชื่อ","input"],["url","URL","url"],["tags","แท็ก (คั่นด้วยเครื่องหมายจุลภาค)","input"]] }
};
const $ = s => root.querySelector(s);
let db = { findings: [], checks: {}, notes: [], snippets: [], tasks: [], links: [] };
let tab = "findings", tagFilter = "", editing = null;

try { const raw = localStorage.getItem(KEY); if (raw) db = Object.assign(db, JSON.parse(raw)); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast("บันทึกลงเบราว์เซอร์ไม่ได้"); } }
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("on"), 1800); }
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const chipsOf = it => tab === "findings" ? [it.client].filter(Boolean) : tagsOf(it);
const tagsOf = it => (it.tags || "").split(",").map(s => s.trim()).filter(Boolean);
const safeUrl = u => /^https?:\/\//i.test(u) ? u : "https://" + u;

const checkTotal = () => CHECK.reduce((n, g) => n + g[1].length, 0);
const checkDone = () => Object.values(db.checks).filter(Boolean).length;
function renderNav() {
  const cnt = k => k === "checklist" ? `${checkDone()}/${checkTotal()}` : SCHEMA[k].view ? "" : db[k].length;
  $("#nav").innerHTML = Object.keys(SCHEMA).map(k =>
    `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${SCHEMA[k].label}<span class="n">${cnt(k)}</span></button>`).join("");
}

function render() {
  renderNav();
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
  const label = { todo: "ต้องทำ", doing: "กำลังทำ", done: "เสร็จแล้ว" }[it.status];
  return `<article class="item task ${it.status === "done" ? "done" : ""}">
    <button class="state" data-a="cycle" data-id="${it.id}" data-s="${it.status}" title="เปลี่ยนสถานะ">${label}</button>
    <div class="t"><b>${esc(it.title)}</b>
      <div class="meta">${it.due ? `<span class="due ${late ? "late" : ""}">กำหนด ${esc(it.due)}${late ? " (เลยกำหนด)" : ""}</span>` : ""}${tagHtml(it)}</div></div>
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
  tab = b.dataset.tab; tagFilter = ""; $("#q").value = ""; render();
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

// export / import
$("#export").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }));
  a.download = "patinya-workspace-" + new Date().toISOString().slice(0, 10) + ".json";
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

// ---- checklist ----
const CHECK = [
  ["Recon", ["Enumerate subdomain และ asset ใน scope","ระบุ tech stack และเวอร์ชัน","ตรวจ robots.txt, sitemap.xml และไฟล์ที่ไม่ควรเปิดเผย","ทบทวน JavaScript หา endpoint และ secret ที่หลุด"]],
  ["Authentication", ["นโยบายรหัสผ่านและการล็อกบัญชี (lockout / rate limit)","ฟังก์ชันลืมรหัสผ่านและ reset token","MFA bypass","Default credentials","ข้อความ error เผยว่ามี username หรือไม่ (user enumeration)"]],
  ["Session", ["Cookie flags: HttpOnly, Secure, SameSite","Session ถูก invalidate หลัง logout","Session fixation","การป้องกัน CSRF"]],
  ["Authorization", ["IDOR / BOLA","Privilege escalation แนวตั้งและแนวนอน","เข้าถึงหน้า admin ตรงผ่าน URL","Forced browsing"]],
  ["Input validation", ["SQL injection","XSS (reflected, stored, DOM)","Command injection","SSRF","Path traversal / LFI","XXE","File upload (ประเภท ขนาด ที่เก็บไฟล์)"]],
  ["API", ["Mass assignment","Rate limiting","Response เปิดเผยข้อมูลเกินจำเป็น","ตรวจ JWT (alg, expiry, signature)"]],
  ["Configuration", ["Security headers (CSP, HSTS, X-Frame-Options)","TLS configuration","CORS policy","Debug mode, stack trace, directory listing","Dependency ที่มีช่องโหว่ที่รู้จัก"]],
  ["Business logic", ["ข้ามลำดับขั้นตอนได้หรือไม่","Race condition","ค่าที่แก้ฝั่ง client ได้ (ราคา จำนวน)"]],
  ["รายงาน", ["เก็บ evidence และ screenshot ทุกข้อพบ","จัดระดับความรุนแรงพร้อมเหตุผล","เขียนข้อเสนอแนะการแก้ไข","ลบข้อมูลทดสอบที่สร้างไว้ในระบบเป้าหมาย"]]
];
function viewCheck() {
  $("#list").innerHTML = `<div class="meta" style="margin:0 0 4px">ความคืบหน้า ${checkDone()}/${checkTotal()}
    <span class="acts"><button data-op="chkreset">รีเซ็ตทั้งหมด</button></span></div>` +
    CHECK.map(([g, items], gi) => `<section class="item"><h3 class="grp">${g}</h3>` +
      items.map((t, i) => { const k = gi + "." + i;
        return `<label class="chk"><input type="checkbox" data-k="${k}" ${db.checks[k] ? "checked" : ""}><span>${t}</span></label>`; }).join("") +
      `</section>`).join("");
}
$("#list").addEventListener("change", e => {
  const k = e.target.dataset.k; if (!k) return;
  db.checks[k] = e.target.checked; save(); renderNav();
  $("#list .meta").firstChild.textContent = `ความคืบหน้า ${checkDone()}/${checkTotal()} `;
});

// ---- toolbox ----
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
  return `unix (วินาที): ${Math.floor(d / 1000)}\nunix (มิลลิวินาที): ${d.getTime()}\nISO (UTC): ${d.toISOString()}\nเวลาท้องถิ่น: ${d.toLocaleString("th-TH")}`;
}
function viewTools() {
  const b = (op, t) => `<button class="ghost" data-op="${op}">${t}</button>`;
  $("#list").innerHTML = `
  <section class="item tool"><h3>แปลงรหัส / ถอดรหัส</h3>
    <textarea id="c-in" class="mono" placeholder="ใส่ข้อความ" spellcheck="false"></textarea>
    <div class="btns">${b("b64e","Base64 encode")}${b("b64d","Base64 decode")}${b("urle","URL encode")}${b("urld","URL decode")}${b("hexe","Hex encode")}${b("hexd","Hex decode")}${b("hte","HTML encode")}${b("htd","HTML decode")}</div>
    <textarea id="c-out" class="mono" readonly placeholder="ผลลัพธ์" spellcheck="false"></textarea>
    <div class="btns">${b("cpout","คัดลอกผลลัพธ์")}${b("swap","ใช้ผลลัพธ์เป็นอินพุต")}</div></section>
  <section class="item tool"><h3>ตัวคำนวณ CVSS 3.1</h3>
    <div class="cv" id="cvss">${CV.map(([k, n, o]) => `<label>${n}<select id="cv-${k}">${o.map(([c, t]) => `<option value="${c}">${t}</option>`).join("")}</select></label>`).join("")}</div>
    <pre id="cv-out" class="mono"></pre>
    <div class="btns">${b("cvcopy","คัดลอก vector")}${b("cvfinding","สร้างข้อพบจากคะแนนนี้")}</div></section>
  <section class="item tool"><h3>ถอดรหัส JWT (ไม่ตรวจลายเซ็น)</h3>
    <textarea id="j-in" class="mono" placeholder="eyJhbGciOi..." spellcheck="false"></textarea>
    <div class="btns">${b("jwt","ถอดรหัส")}</div><pre id="j-out" hidden></pre></section>
  <section class="item tool"><h3>แฮช</h3>
    <textarea id="h-in" class="mono" placeholder="ข้อความที่ต้องการแฮช" spellcheck="false"></textarea>
    <div class="btns">${b("SHA-1","SHA-1")}${b("SHA-256","SHA-256")}${b("SHA-512","SHA-512")}</div><pre id="h-out" hidden></pre></section>
  <section class="item tool"><h3>Timestamp</h3>
    <input id="ts-in" class="mono" placeholder="Unix time หรือวันที่ เช่น 1700000000 หรือ 2026-11-13T10:00:00Z" spellcheck="false">
    <div class="btns">${b("ts","แปลง")}${b("tsnow","ตอนนี้")}</div><pre id="ts-out" hidden></pre></section>`;
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
      if (typeof pl.exp === "number" && pl.exp * 1000 < Date.now()) out += "  (หมดอายุแล้ว)";
      if (/^none$/i.test(h.alg)) out += "\n\nคำเตือน: alg เป็น none";
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
    else if (op === "chkreset") { if (confirm("ล้างเครื่องหมายในเช็กลิสต์ทั้งหมด?")) { db.checks = {}; save(); render(); } }
  } catch (err) { toast("ทำไม่สำเร็จ: ข้อมูลไม่ถูกรูปแบบหรือเบราว์เซอร์ไม่รองรับ"); }
});

// ---- CVSS 3.1 ----
const CV = [
  ["AV","Attack Vector",[["N","Network"],["A","Adjacent"],["L","Local"],["P","Physical"]]],
  ["AC","Attack Complexity",[["L","Low"],["H","High"]]],
  ["PR","Privileges Required",[["N","None"],["L","Low"],["H","High"]]],
  ["UI","User Interaction",[["N","None"],["R","Required"]]],
  ["S","Scope",[["U","Unchanged"],["C","Changed"]]],
  ["C","Confidentiality",[["H","High"],["L","Low"],["N","None"]]],
  ["I","Integrity",[["H","High"],["L","Low"],["N","None"]]],
  ["A","Availability",[["H","High"],["L","Low"],["N","None"]]]
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
  $("#cv-out").textContent = `${score.toFixed(1)}  ${sev}\n${vec}`;
}
$("#list").addEventListener("change", e => { if (e.target.closest("#cvss")) cvssCalc(); });

// ---- command reference ----
const CMDS = [
  ["nmap","สแกนพื้นฐาน (default scripts + เวอร์ชัน)","nmap -sC -sV -oA scan TARGET"],
  ["nmap","สแกนทุกพอร์ต TCP","nmap -p- --min-rate 1000 -T4 -oA allports TARGET"],
  ["nmap","สแกน UDP พอร์ตที่พบบ่อย","nmap -sU --top-ports 50 TARGET"],
  ["nmap","สแกนเว็ปด้วย NSE (headers และ methods)","nmap -p 80,443 --script http-headers,http-methods TARGET"],
  ["nmap","ตรวจช่องโหว่ที่รู้จักด้วย NSE vuln","nmap --script vuln -p PORT TARGET"],
  ["ffuf","ค้นหา directory และไฟล์","ffuf -u https://TARGET/FUZZ -w wordlist.txt -mc 200,204,301,302,403"],
  ["ffuf","ค้นหา virtual host",'ffuf -u https://TARGET -H "Host: FUZZ.TARGET" -w subdomains.txt -fs SIZE'],
  ["ffuf","ค้นหา parameter",'ffuf -u "https://TARGET/page?FUZZ=1" -w params.txt -fs SIZE'],
  ["gobuster","ค้นหา directory พร้อมนามสกุลไฟล์","gobuster dir -u https://TARGET -w wordlist.txt -x php,txt,bak"],
  ["gobuster","ค้นหา subdomain ด้วย DNS","gobuster dns -d TARGET -w subdomains.txt"],
  ["sqlmap","ทดสอบ parameter ผ่าน URL",'sqlmap -u "https://TARGET/page?id=1" --batch --dbs'],
  ["sqlmap","ใช้ไฟล์ request ที่บันทึกจาก proxy","sqlmap -r req.txt --batch --level 3 --risk 2"],
  ["nikto","สแกนเว็ปเซิร์ฟเวอร์เบื้องต้น","nikto -h https://TARGET"],
  ["curl","ดู response header ทั้งหมด","curl -i https://TARGET"],
  ["curl","ดูเฉพาะ header","curl -I https://TARGET"],
  ["curl","ส่งผ่าน proxy (Burp) ข้ามการตรวจใบรับรอง","curl -k -v --proxy http://127.0.0.1:8080 https://TARGET"],
  ["curl","ส่ง JSON ด้วย POST",'curl -X POST -H "Content-Type: application/json" -d "{}" https://TARGET/api'],
  ["curl","ดูเฉพาะ status code",'curl -s -o /dev/null -w "%{http_code}" https://TARGET'],
  ["openssl","ตรวจใบรับรองและ TLS ของเซิร์ฟเวอร์","openssl s_client -connect TARGET:443 -servername TARGET"],
  ["openssl","อ่านรายละเอียดไฟล์ใบรับรอง","openssl x509 -in cert.pem -text -noout"],
  ["dig","ดูเรคคอร์ด DNS","dig TARGET ANY +noall +answer"],
  ["dig","ทดสอบ zone transfer","dig axfr TARGET @NAMESERVER"]
];
function viewCmds() {
  const q = $("#q").value.trim().toLowerCase();
  const rows = CMDS.map((c, i) => [c, i]).filter(([c]) => !q || c.join(" ").toLowerCase().includes(q));
  $("#list").innerHTML = rows.length ? rows.map(([[t, d, c], i]) =>
    `<article class="item"><h3><span>${esc(d)}</span><span class="tag">${esc(t)}</span></h3><pre>${esc(c)}</pre>
     <div class="meta"><span>แทน TARGET ด้วยเป้าหมายที่ได้รับอนุญาต</span><span class="acts"><button data-op="cpcmd" data-i="${i}">คัดลอก</button></span></div></article>`).join("")
    : `<div class="empty">ไม่พบคำสั่งที่ตรงกับการค้นหา เพิ่มคำสั่งของคุณเองได้ที่แท็บสนิปเป็ต</div>`;
}

// ---- reference tables ----
const REFS = [
  ["HTTP status", [
    ["200","OK","สำเร็จ"],["201","Created","สร้างข้อมูลสำเร็จ มักเจอหลัง POST"],["204","No Content","สำเร็จ ไม่มี body"],
    ["301","Moved Permanently","redirect ถาวร"],["302","Found","redirect ชั่วคราว ตรวจ open redirect"],["304","Not Modified","ใช้แคช"],
    ["307 / 308","Temporary / Permanent Redirect","redirect โดยคงเมธอดเดิม"],["400","Bad Request","request ผิดรูปแบบ"],
    ["401","Unauthorized","ยังไม่ได้ยืนยันตัวตน"],["403","Forbidden","ยืนยันแล้วแต่ไม่มีสิทธิ์ ลองเทียบกับ 404"],
    ["404","Not Found","ไม่พบ resource"],["405","Method Not Allowed","ลองเมธอดอื่น"],["409","Conflict","ข้อมูลขัดแย้งกับสถานะปัจจุบัน"],
    ["413","Payload Too Large","body ใหญ่เกินกำหนด"],["415","Unsupported Media Type","Content-Type ไม่รองรับ"],
    ["429","Too Many Requests","มี rate limit"],["500","Internal Server Error","ดู stack trace หรือ error ที่หลุดออกมา"],
    ["502","Bad Gateway","เซิร์ฟเวอร์ต้นทางตอบผิดปกติ"],["503","Service Unavailable","บริการไม่พร้อม"],["504","Gateway Timeout","เซิร์ฟเวอร์ต้นทางไม่ตอบทันเวลา"]]],
  ["พอร์ตที่พบบ่อย", [
    ["21","FTP","ตรวจ anonymous login"],["22","SSH","ตรวจเวอร์ชันและวิธียืนยันตัวตน"],["23","Telnet","ไม่เข้ารหัส"],["25","SMTP","ตรวจ open relay"],
    ["53","DNS","ตรวจ zone transfer"],["80","HTTP","เว็ป"],["110 / 143","POP3 / IMAP","อีเมล"],["111","RPC","portmapper"],
    ["135 / 139 / 445","MSRPC / NetBIOS / SMB","Windows file sharing"],["161","SNMP (UDP)","ตรวจ community string"],
    ["389 / 636","LDAP / LDAPS","directory service"],["443","HTTPS","เว็ปแบบเข้ารหัส"],["1433","MSSQL","ฐานข้อมูล"],
    ["1521","Oracle DB","ฐานข้อมูล"],["2049","NFS","ตรวจ export ที่เปิดอยู่"],["3306","MySQL","ฐานข้อมูล"],["3389","RDP","remote desktop"],
    ["5432","PostgreSQL","ฐานข้อมูล"],["5900","VNC","remote desktop"],["6379","Redis","ตรวจว่าไม่มี auth"],
    ["8080 / 8443","HTTP / HTTPS ทางเลือก","แผงจัดการ หรือแอปที่ซ่อนอยู่"],["9200","Elasticsearch","ตรวจว่าเปิดสาธารณะหรือไม่"],["27017","MongoDB","ตรวจว่าไม่มี auth"]]],
  ["OWASP Top 10:2021 และตัวอย่าง CWE (ฉบับใหม่กว่าอาจจัดหมวดต่างไป ตรวจที่ owasp.org)", [
    ["A01","Broken Access Control","CWE-22, 284, 352, 639, 862"],["A02","Cryptographic Failures","CWE-259, 319, 327"],
    ["A03","Injection","CWE-78, 79, 89"],["A04","Insecure Design","CWE-209, 434, 501"],
    ["A05","Security Misconfiguration","CWE-16, 611"],["A06","Vulnerable and Outdated Components","CWE-1104"],
    ["A07","Identification and Authentication Failures","CWE-287, 384, 798"],["A08","Software and Data Integrity Failures","CWE-502, 829"],
    ["A09","Security Logging and Monitoring Failures","CWE-117, 778"],["A10","Server-Side Request Forgery","CWE-918"]]]
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

// ---- markdown (minimal) ----
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

// ---- report ----
function makeReport() {
  const so = Object.fromEntries(SEV.map((v, i) => [v, i]));
  const list = db.findings.filter(f => !tagFilter || f.client === tagFilter).sort((a, b) => so[a.severity] - so[b.severity]);
  if (!list.length) { toast("ยังไม่มีข้อพบให้สร้างรายงาน"); return; }
  let o = `# รายงานผลการทดสอบเจาะระบบ\n\n- งาน / ลูกค้า: ${tagFilter || "ทั้งหมด"}\n- วันที่สร้างรายงาน: ${new Date().toISOString().slice(0, 10)}\n- จำนวนข้อพบ: ${list.length}\n\n`;
  o += "## สรุป\n\n| ระดับ | จำนวน |\n|---|---|\n" + SEV.map(v => `| ${v} | ${list.filter(f => f.severity === v).length} |`).join("\n") + "\n\n## รายละเอียดข้อพบ\n\n";
  list.forEach((f, i) => {
    o += `### ${i + 1}. ${f.title} [${f.severity}]\n\n`;
    if (f.client && !tagFilter) o += `- งาน / ลูกค้า: ${f.client}\n`;
    if (f.target) o += `- เป้าหมาย: \`${f.target}\`\n`;
    if (f.cvss) o += `- CVSS: ${f.cvss}\n`;
    o += `- สถานะ: ${f.status}\n\n`;
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

render();

// ---------- เปิด / ปิด ----------
$("#close").onclick = () => dlg.close();
let openBtn = document.getElementById("desk-open");
if (!openBtn) {
  openBtn = document.createElement("button");
  openBtn.type = "button"; openBtn.textContent = "Cyber Desk";
  openBtn.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:50;padding:10px 16px;border-radius:99px;border:1px solid rgba(255,255,255,.2);background:#0b1d5c;color:#eef2ff;cursor:pointer";
  document.body.appendChild(openBtn);
}
openBtn.addEventListener("click", () => { render(); dlg.showModal(); });
})();