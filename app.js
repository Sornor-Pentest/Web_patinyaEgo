"use strict";

const ICONS = {
  vault:
    '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10M7.5 9.5l9-5"/>',
  play: '<path d="m9 5 11 7-11 7V5Z"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-down": '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  sort: '<path d="M4 6h16M4 12h11M4 18h6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',
  book: '<path d="M12 6c-3-2-6-2-10-2v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-1 9 5-3 5 3-1-9"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>',
  pen: '<path d="m14 3 7 7-11 11H3v-7L14 3Zm-3 3 7 7M3 21l5-5"/>',
  spark:
    '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 4 13 4 18 0m-9 1v3"/>',
  layers:
    '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  external:
    '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  note: '<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-3 3 5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  folder: '<path d="M3 5h7l2 3h9v13H3V5Z"/>',
  restore: '<path d="M3 11a9 9 0 1 1 2 7m-2-7V4m0 7h7M12 7v5l4 2"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`;
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const uid = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const CATEGORY = {
  cybersecurity: { label: "Cybersecurity", icon: "pen", tone: "blue" },
  development: { label: "Development", icon: "code", tone: "teal" },
  ai: { label: "AI & Technology", icon: "spark", tone: "silver" },
  business: { label: "Business", icon: "briefcase", tone: "green" },
  creative: { label: "Creative", icon: "layers", tone: "amber" },
  other: { label: "อื่น ๆ", icon: "folder", tone: "rose" },
};
const STORAGE_KEY = "coursevault.v1";
const progress = (course) =>
  course.lessons.length
    ? Math.round(
        (course.lessons.filter((l) => l.done).length / course.lessons.length) *
          100,
      )
    : 0;
const statusOf = (course) =>
  progress(course) === 100
    ? "completed"
    : progress(course) > 0
      ? "in-progress"
      : "not-started";
const statusLabel = (course) =>
  ({
    completed: "เรียนจบแล้ว",
    "in-progress": "กำลังเรียน",
    "not-started": "ยังไม่เริ่มเรียน",
  })[statusOf(course)];
const formatHours = (hours) =>
  Number(hours) % 1 ? Number(hours).toFixed(1) : String(Number(hours));
function safeURL(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
function safeCover(value) {
  return typeof value === "string" &&
    value.length <= 1500000 &&
    /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
    ? value
    : "";
}
const emptyState = () => ({
  version: 1,
  courses: [],
  trash: [],
  layout: "grid",
  lastCourse: null,
});
function validateCourses(items) {
  if (!Array.isArray(items) || items.length > 500)
    throw new Error("รูปแบบข้อมูลคอร์สไม่ถูกต้อง");
  const ids = new Set();
  return items.map((c) => {
    if (
      !c ||
      typeof c.id !== "string" ||
      !c.id ||
      c.id.length > 150 ||
      ids.has(c.id) ||
      typeof c.title !== "string" ||
      !c.title.trim() ||
      !Array.isArray(c.lessons) ||
      c.lessons.length > 300
    )
      throw new Error("ข้อมูลคอร์สไม่ครบถ้วนหรือมีรหัสซ้ำ");
    ids.add(c.id);
    const lessonIDs = new Set();
    const lessons = c.lessons.map((l, i) => {
      const id =
        typeof l?.id === "string" && l.id.length < 180 ? l.id : `${c.id}-l${i}`;
      if (lessonIDs.has(id)) throw new Error("รหัสบทเรียนซ้ำกัน");
      lessonIDs.add(id);
      return {
        id,
        title: String(l?.title || `บทที่ ${i + 1}`).slice(0, 160),
        url: safeURL(l?.url),
        slidesUrl: safeURL(l?.slidesUrl),
        done: l?.done === true,
      };
    });
    const category = Object.hasOwn(CATEGORY, c.category) ? c.category : "other";
    return {
      id: c.id,
      title: c.title.trim().slice(0, 120),
      provider: String(c.provider || "คอร์สส่วนตัว").slice(0, 80),
      category,
      hours: Math.min(9999, Math.max(0, Number(c.hours) || 0)),
      tone: [
        "blue",
        "teal",
        "silver",
        "amber",
        "violet",
        "peach",
        "green",
        "rose",
      ].includes(c.tone)
        ? c.tone
        : CATEGORY[category].tone,
      description: String(c.description || "").slice(0, 1000),
      url: safeURL(c.url),
      coverImage: safeCover(c.coverImage),
      sample: c.sample === true,
      favorite: c.favorite === true,
      createdAt: Number(c.createdAt) || Date.now(),
      updatedAt: Number(c.updatedAt) || Date.now(),
      note: String(c.note || "").slice(0, 20000),
      lessons,
    };
  });
}
let state;
let storageFailed = false;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const loaded = JSON.parse(raw);
    // Remove the old starter courses from existing browser data as well.
    const courses = validateCourses(loaded.courses).filter((c) => !c.sample);
    const trash = validateCourses(loaded.trash || []).filter((c) => !c.sample);
    state = {
      version: 1,
      courses,
      trash,
      layout: loaded.layout === "list" ? "list" : "grid",
      lastCourse: courses.some((c) => c.id === loaded.lastCourse)
        ? loaded.lastCourse
        : null,
    };
  } else state = emptyState();
} catch {
  storageFailed = true;
  state = emptyState();
}
let view = "overview",
  category = "all",
  status = "all",
  search = "",
  sort = "recent",
  activeCourse = null,
  toastTimer,
  noteTimer;
let draftCover = "",
  coverRequest = 0,
  coverBusy = false;

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}
function notify(message, undo) {
  const el = $("#toast");
  clearTimeout(toastTimer);
  $("#toast-message").textContent = message;
  el.querySelector("[data-undo]")?.remove();
  if (undo) {
    const button = document.createElement("button");
    button.dataset.undo = "true";
    button.className = "text-button";
    button.textContent = "เลิกทำ";
    button.addEventListener(
      "click",
      () => {
        undo();
        el.classList.remove("visible");
      },
      { once: true },
    );
    el.append(button);
  }
  el.classList.add("visible");
  toastTimer = setTimeout(
    () => el.classList.remove("visible"),
    undo ? 8000 : 3500,
  );
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageFailed = false;
    return true;
  } catch {
    storageFailed = true;
    notify("บันทึกในเบราว์เซอร์ไม่สำเร็จ กรุณาสำรองข้อมูลจากเมนู ME");
    return false;
  }
}
function artwork(course, suffix = "card") {
  const cover = safeCover(course.coverImage);
  if (cover)
    return `<img class="course-cover-image" src="${cover}" alt="${escapeHTML(`รูปปก ${course.title}`)}">`;
  const palettes = {
    blue: ["#0a294c", "#235fa0", "#99ccff"],
    teal: ["#082b32", "#177d88", "#8fe4db"],
    silver: ["#172a3d", "#54718b", "#d0e4f6"],
    amber: ["#352519", "#855b3d", "#dfb383"],
    violet: ["#26223d", "#655286", "#c1b1e6"],
    peach: ["#39282b", "#92695f", "#edc3ac"],
    green: ["#112f29", "#3b7b62", "#a7d5a9"],
    rose: ["#32232d", "#85566e", "#dcb2c0"],
  };
  const [dark, mid, light] = palettes[course.tone] || palettes.blue;
  const id = `art-${course.id.replace(/[^a-zA-Z0-9-]/g, "")}-${suffix}`;
  let object = "";
  if (course.tone === "blue")
    object = `<g transform="translate(154 101) rotate(-17)"><rect x="-80" y="-51" width="141" height="99" rx="9" fill="url(#${id}g)" stroke="${light}" stroke-opacity=".48"/><rect x="-65" y="-38" width="112" height="7" rx="3" fill="${light}" opacity=".24"/><rect x="-65" y="-21" width="45" height="55" rx="5" fill="${dark}" opacity=".8"/><rect x="-10" y="-21" width="57" height="6" rx="3" fill="${light}" opacity=".48"/><rect x="-10" y="-9" width="40" height="4" rx="2" fill="${light}" opacity=".25"/><rect x="-10" y="3" width="57" height="31" rx="4" fill="${light}" opacity=".13"/><rect x="-9" y="10" width="84" height="58" rx="7" fill="${dark}" stroke="${light}" stroke-opacity=".5"/><circle cx="13" cy="33" r="10" fill="none" stroke="${light}" stroke-width="4" opacity=".8"/><path d="M33 26h29m-29 9h21m-21 9h26" stroke="${light}" stroke-width="3" opacity=".5"/></g>`;
  else if (course.tone === "teal")
    object = `<g transform="translate(150 96)"><path d="m0-68 68 36v74L0 78l-68-36v-74L0-68Z" fill="${dark}" stroke="${light}" stroke-opacity=".55"/><path d="m-68-32 68 37 68-37M0 5v73" stroke="${light}" stroke-opacity=".6"/><path d="m-44-18 22-12m-22 25 35-19m-35 32L-9-10m22 35 32-17m-32 30 32-17m-32 30 20-11" stroke="${light}" stroke-width="3" opacity=".6"/><path d="m0-68 68 36L0 5l-68-37L0-68Z" fill="url(#${id}g)"/><path d="m-17-36-13 7 13 7m33-15 13 7-13 7M8-42-7-17" stroke="${light}" stroke-width="2.5" fill="none"/><path d="M-91 54 0 101l91-47M-91 42 0 89l91-47" fill="none" stroke="${light}" opacity=".1"/></g>`;
  else if (course.tone === "silver")
    object = `<g transform="translate(150 100)"><ellipse rx="98" ry="33" transform="rotate(-33)" fill="none" stroke="${light}" opacity=".4"/><circle r="50" fill="url(#${id}s)"/><ellipse rx="49" ry="17" fill="none" stroke="${light}" opacity=".4"/><ellipse rx="49" ry="33" fill="none" stroke="${light}" opacity=".25"/><ellipse rx="49" ry="33" transform="rotate(90)" fill="none" stroke="${light}" opacity=".3"/><ellipse rx="49" ry="17" transform="rotate(90)" fill="none" stroke="${light}" opacity=".4"/><path d="M-92 38c41 14 100-10 153-52" fill="none" stroke="${light}" stroke-width="2.5"/><circle cx="65" cy="-47" r="5" fill="${light}"/><path d="M-12 0h24M0-12v24" stroke="${light}" opacity=".8"/></g>`;
  else if (course.tone === "amber")
    object = `<g transform="translate(155 99) rotate(-18)"><circle r="76" fill="${dark}" stroke="${light}" stroke-opacity=".2"/><circle r="65" fill="url(#${id}s)" stroke="${light}" stroke-opacity=".4"/><circle r="54" fill="${dark}" stroke="${light}" stroke-opacity=".7"/><circle r="43" fill="none" stroke="${light}" stroke-width="9" opacity=".3"/><path d="m0-34 30 17v34L0 34l-30-17v-34L0-34Zm-30 17 30 17 30-17M0 0v34" fill="${mid}" stroke="${light}" stroke-opacity=".6"/><circle r="10" fill="${dark}"/></g>`;
  else if (course.tone === "violet")
    object = `<g transform="translate(150 100) rotate(-28)"><ellipse cx="-22" cy="-10" rx="42" ry="67" fill="none" stroke="${dark}" stroke-width="23"/><ellipse cx="-24" cy="-12" rx="42" ry="67" fill="none" stroke="url(#${id}g)" stroke-width="18"/><ellipse cx="27" cy="14" rx="42" ry="67" fill="none" stroke="${dark}" stroke-width="23"/><ellipse cx="25" cy="12" rx="42" ry="67" fill="none" stroke="url(#${id}g)" stroke-width="18"/><path d="M-19-78c25 4 36 26 36 58" fill="none" stroke="${light}" stroke-width="2" opacity=".8"/></g>`;
  else if (course.tone === "peach")
    object = `<g transform="translate(150 105)"><path d="m-66 14 43-24L23 14-22 40l-44-26Z" fill="${light}" opacity=".75"/><path d="M-66 14v29l44 25V40l-44-26Z" fill="${mid}"/><path d="m-22 40 45-26v29l-45 25V40Z" fill="${dark}" stroke="${light}" stroke-opacity=".3"/><path d="m-21-45 44-25 44 25-44 25-44-25Z" fill="${light}"/><path d="M-21-45v46l44 25v-46l-44-25Z" fill="${mid}"/><path d="m23-20 44-25V1L23 26v-46Z" fill="${dark}" stroke="${light}" stroke-opacity=".4"/><path d="M-78 76 1 119l79-43" fill="none" stroke="${light}" opacity=".15"/></g>`;
  else if (course.tone === "green")
    object = `<g transform="translate(151 100)"><path d="m-70 36 70-38 70 38L0 75l-70-39Z" fill="${dark}" stroke="${light}" stroke-opacity=".35"/><path d="m-64 13 64-35 64 35L0 49l-64-36Z" fill="${mid}" stroke="${light}" stroke-opacity=".5"/><path d="m-58-10 58-32 58 32L0 22l-58-32Z" fill="url(#${id}g)" stroke="${light}" stroke-opacity=".6"/><path d="m-52-33 52-29 52 29L0-4l-52-29Z" fill="${mid}" stroke="${light}" stroke-opacity=".6"/><path d="m-17-35 13 8 23-15" stroke="${light}" stroke-width="3" fill="none"/></g>`;
  else
    object = `<g transform="translate(151 103)"><path d="M-59 49V-1l33-18v50l-33 18Z" fill="${mid}" stroke="${light}" stroke-opacity=".45"/><path d="m-26-19 16 9v50l-16-9v-50Z" fill="${dark}"/><path d="M-13 36v-73l33-18v73l-33 18Z" fill="${mid}" stroke="${light}" stroke-opacity=".6"/><path d="m20-55 16 9v73l-16-9v-73Z" fill="${dark}"/><path d="M33 23V-82l33-18V5L33 23Z" fill="url(#${id}g)" stroke="${light}" stroke-opacity=".6"/><path d="m66-100 16 9V14L66 5v-105Z" fill="${dark}"/><path d="m-76 64 76 42 91-50" stroke="${light}" fill="none" opacity=".25"/></g>`;
  return `<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}b" x2="1" y2="1"><stop stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="${id}g" x2=".9" y2="1"><stop stop-color="${light}"/><stop offset=".4" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient><radialGradient id="${id}s" cx=".3" cy=".2"><stop stop-color="${light}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient><radialGradient id="${id}gl"><stop stop-color="${light}" stop-opacity=".18"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs><path fill="url(#${id}b)" d="M0 0h300v200H0z"/><circle cx="160" cy="75" r="155" fill="url(#${id}gl)"/><path d="M0 160h300M0 180h300M40 0v200M260 0v200" stroke="${light}" stroke-opacity=".05" stroke-width="1"/>${object}<path d="M12 183h9m-4-4v8m262-168h9m-4-4v8" stroke="${light}" stroke-opacity=".35" stroke-width="1"/></svg>`;
}
function continueCourse() {
  return (
    state.courses.find((c) => c.id === state.lastCourse && progress(c) < 100) ||
    state.courses.find((c) => statusOf(c) === "in-progress") ||
    state.courses.find((c) => progress(c) < 100) ||
    state.courses[0]
  );
}
function renderStats() {
  const complete = state.courses.filter(
    (c) => statusOf(c) === "completed",
  ).length;
  const learning = state.courses.filter(
    (c) => statusOf(c) === "in-progress",
  ).length;
  const hours = state.courses.reduce(
    (sum, c) =>
      sum +
      c.hours *
        (c.lessons.filter((l) => l.done).length /
          Math.max(1, c.lessons.length)),
    0,
  );
  const stats = [
    ["book", "คอร์สในคลัง", state.courses.length, "คอร์ส"],
    ["play", "กำลังเรียน", learning, "คอร์ส"],
    ["award", "เรียนจบแล้ว", complete, "คอร์ส"],
    ["clock", "ชั่วโมงที่เรียนแล้ว", Math.round(hours * 10) / 10, "ชั่วโมง"],
  ];
  $("#stats").innerHTML = stats
    .map(
      ([symbol, label, value, unit]) =>
        `<div class="stat"><div class="stat-icon">${icon(symbol)}</div><div><div class="stat-label">${label}</div><div class="stat-value">${String(value).padStart(2, "0")}<small>${unit}</small></div></div></div>`,
    )
    .join("");
  const course = continueCourse();
  $("#hero-resume").innerHTML =
    icon("play") +
    ` ${course ? "เรียนต่อกันเลย" : "เพิ่มคอร์สแรก"} ` +
    icon("arrow-right");
}
function renderFilters() {
  $("#category-row").innerHTML =
    `<button class="category-chip ${category === "all" ? "active" : ""}" data-category="all" aria-pressed="${category === "all"}">${icon("grid")} ทั้งหมด</button>` +
    Object.entries(CATEGORY)
      .filter(
        ([key]) =>
          key !== "other" || state.courses.some((c) => c.category === "other"),
      )
      .map(
        ([key, item]) =>
          `<button class="category-chip ${category === key ? "active" : ""}" data-category="${key}" aria-pressed="${category === key}">${icon(item.icon)} ${item.label}</button>`,
      )
      .join("");
  let base = state.courses.filter((c) => view !== "favorites" || c.favorite);
  if (category !== "all") base = base.filter((c) => c.category === category);
  if (search)
    base = base.filter((c) =>
      `${c.title} ${c.provider} ${c.description} ${CATEGORY[c.category].label}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    );
  const statuses = [
    ["all", "ทั้งหมด", base.length],
    [
      "in-progress",
      "กำลังเรียน",
      base.filter((c) => statusOf(c) === "in-progress").length,
    ],
    [
      "not-started",
      "ยังไม่เริ่ม",
      base.filter((c) => statusOf(c) === "not-started").length,
    ],
    [
      "completed",
      "เรียนจบแล้ว",
      base.filter((c) => statusOf(c) === "completed").length,
    ],
  ];
  $("#status-row").innerHTML = statuses
    .map(
      ([key, label, count]) =>
        `<button class="status-tab ${status === key ? "active" : ""}" data-status="${key}" aria-pressed="${status === key}">${label}<span>${count}</span></button>`,
    )
    .join("");
}
function courseCard(c) {
  const pct = progress(c);
  const status = statusOf(c);
  const done = c.lessons.filter((l) => l.done).length;
  return `<article class="course-card" data-course-id="${escapeHTML(c.id)}"><div class="course-cover">${artwork(c)}<button class="cover-open" data-open="${escapeHTML(c.id)}" aria-label="เปิดคอร์ส ${escapeHTML(c.title)}"></button><span class="cover-category">${escapeHTML(CATEGORY[c.category].label.toUpperCase())}</span><button class="favorite-button" data-favorite="${escapeHTML(c.id)}" aria-label="${c.favorite ? "นำออกจาก" : "เพิ่มใน"}รายการโปรด: ${escapeHTML(c.title)}" aria-pressed="${c.favorite}">${icon("star")}</button><span class="cover-series">${c.sample ? "THE LEARNING COLLECTION" : "YOUR PERSONAL COLLECTION"}</span><span class="cover-time">${formatHours(c.hours)} HRS</span></div><div class="card-body"><div class="card-provider"><i class="provider-dot"></i>${escapeHTML(c.provider)}</div><h3 class="card-title"><button data-open="${escapeHTML(c.id)}">${escapeHTML(c.title)}</button></h3><div class="card-meta"><span>${icon("book")}${c.lessons.length} บทเรียน</span><span>${icon("clock")}${formatHours(c.hours)} ชั่วโมง</span></div><div class="card-progress-head ${status}"><span>${status === "completed" ? "เรียนจบครบทุกบทแล้ว" : `${done} จาก ${c.lessons.length} บทเรียน`}</span><strong>${pct}%</strong></div><div class="progress-track"><span style="width:${pct}%"></span></div><div class="card-bottom"><span class="card-status ${status}"><i></i>${statusLabel(c)}</span><button class="card-go" data-open="${escapeHTML(c.id)}">${pct === 100 ? "ทบทวนคอร์ส" : pct > 0 ? "เรียนต่อ" : "เริ่มเรียน"}${icon("arrow-right")}</button></div></div></article>`;
}
function renderLibrary() {
  let filtered = state.courses.filter(
    (c) =>
      (view !== "favorites" || c.favorite) &&
      (category === "all" || c.category === category) &&
      (status === "all" || statusOf(c) === status) &&
      (!search ||
        `${c.title} ${c.provider} ${c.description} ${CATEGORY[c.category].label}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase())),
  );
  filtered.sort(
    sort === "name"
      ? (a, b) => a.title.localeCompare(b.title, "th")
      : sort === "progress"
        ? (a, b) => progress(b) - progress(a)
        : (a, b) => b.createdAt - a.createdAt,
  );
  $("#course-grid").classList.toggle("list-layout", state.layout === "list");
  $("#course-grid").innerHTML = filtered.length
    ? filtered.map(courseCard).join("")
    : `<div class="empty-state">${icon(view === "favorites" ? "star" : "search")}<h3>${search ? "ไม่พบคอร์สที่ค้นหา" : view === "favorites" ? "เก็บคอร์สที่ชอบไว้ตรงนี้" : "ยังไม่มีคอร์สในรายการนี้"}</h3><p>${search ? "ลองใช้คำค้นอื่น หรือเปลี่ยนหมวดหมู่" : view === "favorites" ? "กดดาวบนการ์ดคอร์ส เพื่อกลับมาหาได้ง่ายขึ้น" : "เพิ่มคอร์สแรก หรือเลือกตัวกรองอื่นเพื่อดูคอร์สในคลัง"}</p><button class="button button-outline" id="empty-action">${search || status !== "all" || category !== "all" ? "ล้างตัวกรอง" : view === "favorites" ? "ไปยังคลังคอร์ส" : "เพิ่มคอร์สแรก"} ${icon("arrow-right")}</button></div>`;
  $("#results-count").textContent =
    `แสดง ${filtered.length} จาก ${state.courses.filter((c) => view !== "favorites" || c.favorite).length} คอร์ส`;
  document.querySelectorAll("[data-layout]").forEach((button) => {
    const active = button.dataset.layout === state.layout;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);
  });
  renderFilters();
}
function renderNotes() {
  const notes = state.courses.filter((c) => c.note.trim());
  $("#notes-grid").innerHTML = notes.length
    ? notes
        .map(
          (c) =>
            `<article class="note-card"><span class="note-icon">${icon("note")}</span><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.note.slice(0, 320))}${c.note.length > 320 ? "…" : ""}</p><button class="text-button" data-open="${escapeHTML(c.id)}">เปิดโน้ต ${icon("arrow-right")}</button></article>`,
        )
        .join("")
    : `<div class="empty-state empty-note">${icon("note")}<h3>พื้นที่สำหรับไอเดียใหม่ ๆ</h3><p>เปิดคอร์ส แล้วจดสิ่งที่ได้เรียนรู้ในช่องโน้ตส่วนตัว</p><button class="button button-outline" data-nav="courses">ไปยังคลังคอร์ส ${icon("arrow-right")}</button></div>`;
}
function render() {
  renderStats();
  renderLibrary();
  renderNotes();
}
function changeView(next, scroll = true) {
  view = next;
  category = "all";
  status = "all";
  search = "";
  $("#search").value = "";
  document.querySelectorAll("[data-nav]").forEach((button) => {
    const active = button.dataset.nav === view;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("#hero").hidden = view !== "overview";
  $("#stats").hidden = view !== "overview";
  $("#library").hidden = view === "notes";
  $("#notes-section").hidden = view !== "notes";
  const labels = {
    overview: [
      "คลังคอร์สของฉัน",
      "CURATED BY YOU",
      "ความรู้ดี ๆ ที่เลือกไว้ ให้พร้อมเรียนเมื่อคุณพร้อม",
    ],
    courses: [
      "คอร์สทั้งหมด",
      "YOUR KNOWLEDGE, ORGANIZED",
      "ทุกคอร์สที่ลงทุนไว้ ค้นหาและกลับมาเรียนได้ง่าย ๆ",
    ],
    favorites: [
      "รายการโปรด",
      "KEEP THE GOOD ONES CLOSE",
      "คอร์สที่ชอบ เก็บไว้ใกล้มืออีกนิด",
    ],
  };
  if (labels[view]) {
    const [title, eyebrow, description] = labels[view];
    $("#library-title").innerHTML = title + '<span class="title-dot">.</span>';
    $("#section-eyebrow").textContent = eyebrow;
    $("#section-description").textContent = description;
  }
  render();
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}
function closeDialog(id) {
  if (id === "course-dialog") {
    clearTimeout(noteTimer);
    saveNote();
  }
  document.getElementById(id).close();
  if (id === "course-dialog") activeCourse = null;
}
function openCourse(id) {
  clearTimeout(noteTimer);
  saveNote();
  activeCourse = id;
  const c = state.courses.find((item) => item.id === id);
  if (!c) return;
  state.lastCourse = id;
  persist();
  renderDetail();
  openDialog("course-dialog");
  renderStats();
}
function lessonRow(lesson, index) {
  const video = safeURL(lesson.url);
  const slides = safeURL(lesson.slidesUrl);
  const title = escapeHTML(lesson.title);
  return `<li class="lesson-item ${lesson.done ? "done" : ""}">
    <input class="lesson-check" type="checkbox" id="lesson-check-${index}" data-lesson="${escapeHTML(lesson.id)}" ${lesson.done ? "checked" : ""} aria-label="เรียนจบแล้ว: ${title}">
    <span class="lesson-index">${String(index + 1).padStart(2, "0")}</span>
    <div class="lesson-content">
      <label class="lesson-name" for="lesson-check-${index}">${title}</label>
      ${video || slides ? `<div class="lesson-resources">
        ${video ? `<a class="lesson-link" href="${escapeHTML(video)}" target="_blank" rel="noopener noreferrer" aria-label="เปิดคลิปสอน ${title}">${icon("play")} คลิปสอน</a>` : ""}
        ${slides ? `<a class="lesson-link" href="${escapeHTML(slides)}" target="_blank" rel="noopener noreferrer" aria-label="เปิดสไลด์เรียน ${title}">${icon("book")} สไลด์</a>` : ""}
      </div>` : ""}
    </div>
    <button class="icon-button lesson-edit" data-edit-lesson="${escapeHTML(lesson.id)}" aria-label="แก้ไขบทเรียน ${title}" title="แก้ไขชื่อ คลิปสอน และสไลด์เรียน">${icon("edit")}</button>
  </li>`;
}
function renderDetail() {
  const c = state.courses.find((item) => item.id === activeCourse);
  if (!c) return;
  const pct = progress(c);
  const done = c.lessons.filter((l) => l.done).length;
  const next = c.lessons.find((l) => !l.done);
  const target = safeURL(next?.url) || safeURL(c.url);
  $("#course-detail").innerHTML =
    `<div class="detail-topbar"><span class="eyebrow">YOUR LEARNING ROOM</span><div><button class="icon-button" data-favorite="${escapeHTML(c.id)}" aria-label="${c.favorite ? "นำออกจาก" : "เพิ่มใน"}รายการโปรด" aria-pressed="${c.favorite}">${icon("star")}</button><button class="icon-button" data-close="course-dialog" aria-label="ปิดหน้าคอร์ส">${icon("x")}</button></div></div><div class="detail-layout"><div class="detail-main"><div class="detail-cover">${artwork(c, "detail")}<button class="cover-edit-button" id="edit-cover">${icon("edit")} เปลี่ยนรูปปก</button><span class="cover-series">${c.sample ? "THE LEARNING COLLECTION" : "YOUR PERSONAL COLLECTION"}</span></div><span class="detail-category">${escapeHTML(CATEGORY[c.category].label.toUpperCase())}</span><h2 class="detail-title" id="detail-title">${escapeHTML(c.title)}</h2><div class="detail-provider">${escapeHTML(c.provider)} · ${formatHours(c.hours)} ชั่วโมง</div><p class="detail-description">${escapeHTML(c.description || "พื้นที่สำหรับการเรียนรู้ครั้งต่อไปของคุณ")}</p>${c.sample ? '<div class="sample-message">คอร์สตัวอย่างสำหรับลองใช้งาน ยังไม่มีวิดีโอจริง<br>ลองเช็กบทเรียนหรือจดโน้ต แล้วค่อยเพิ่มคอร์สของคุณได้เลย</div>' : ""}${target ? `<a class="button button-primary detail-primary" href="${escapeHTML(target)}" target="_blank" rel="noopener noreferrer">${icon("play")} ${pct === 100 ? "เปิดคอร์สเพื่อทบทวน" : "เปิดลิงก์เข้าเรียน"} ${icon("external")}</a>` : `<button class="button button-outline detail-primary" id="add-course-link">${icon("plus")} เพิ่มลิงก์เข้าเรียน</button>`}<div class="detail-small-actions"><button class="text-button" id="edit-course">${icon("edit")} แก้ไขข้อมูลคอร์ส</button><button class="text-button danger" id="delete-course">${icon("trash")} นำออกจากคลัง</button></div></div><div class="detail-aside"><h3>เส้นทางการเรียนรู้</h3><div class="detail-progress"><span>${done} จาก ${c.lessons.length} บทเรียน</span><strong>${pct}%</strong></div><div class="progress-track"><span style="width:${pct}%"></span></div><ol class="lesson-list">${c.lessons.map(lessonRow).join("")}</ol><button class="text-button add-lesson" id="add-lesson">${icon("plus")} เพิ่มบทเรียน</button><div class="note-heading"><h3>โน้ตส่วนตัว</h3><span class="note-state" id="note-state">${storageFailed ? "ยังไม่บันทึก" : "บันทึกอัตโนมัติ"}</span></div><textarea class="course-note" id="course-note" maxlength="20000" placeholder="สิ่งที่ได้เรียนรู้ ไอเดีย หรือจุดที่อยากกลับมาทบทวน..." aria-label="โน้ตส่วนตัว">${escapeHTML(c.note)}</textarea></div></div>`;
}
function updateLesson(lessonId, done) {
  const c = state.courses.find((item) => item.id === activeCourse);
  const lesson = c?.lessons.find((item) => item.id === lessonId);
  if (!lesson) return;
  lesson.done = done;
  c.updatedAt = Date.now();
  saveNote();
  persist();
  const list = $(".lesson-list");
  const scroll = list?.scrollTop || 0;
  renderDetail();
  $(".lesson-list").scrollTop = scroll;
  render();
  if (progress(c) === 100 && done) notify("เก่งมาก เรียนจบคอร์สนี้แล้ว!");
}
function saveNote() {
  const input = $("#course-note");
  const c = state.courses.find((item) => item.id === activeCourse);
  if (!input || !c || input.value === c.note) return;
  c.note = input.value;
  c.updatedAt = Date.now();
  const saved = persist();
  if ($("#note-state"))
    $("#note-state").textContent = saved ? "บันทึกแล้ว" : "บันทึกไม่สำเร็จ";
  renderNotes();
}
function openCourseForm(id) {
  coverRequest++;
  coverBusy = false;
  $("#course-submit").disabled = false;
  $("#course-form").reset();
  $("#edit-id").value = id || "";
  $("#form-error").textContent = "";
  const c = state.courses.find((item) => item.id === id);
  draftCover = safeCover(c?.coverImage);
  $("#cover-error").textContent = "";
  renderCoverPreview();
  $("#form-title").textContent = c ? "แก้ไขข้อมูลคอร์ส" : "เพิ่มคอร์สใหม่";
  $("#form-submit-label").textContent = c ? "บันทึกการแก้ไข" : "เพิ่มลงในคลัง";
  $("#course-lessons").disabled = !!c;
  if (c) {
    $("#course-name").value = c.title;
    $("#course-provider").value = c.provider;
    $("#course-category").value = c.category;
    $("#course-url").value = c.url;
    $("#course-lessons").value = c.lessons.length;
    $("#course-hours").value = c.hours;
    $("#course-description").value = c.description;
  }
  openDialog("form-dialog");
}
function renderCoverPreview() {
  const c = state.courses.find((item) => item.id === $("#edit-id").value);
  $("#cover-preview").innerHTML = artwork(
    {
      id: c?.id || "preview",
      title: c?.title || "คอร์สใหม่",
      tone: c?.tone || CATEGORY[$("#course-category").value].tone,
      coverImage: draftCover,
    },
    "preview",
  );
  $("#remove-cover").hidden = !draftCover;
}
function readCover(file) {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("กรุณาเลือกรูป JPG, PNG หรือ WebP"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("กรุณาเลือกรูปขนาดไม่เกิน 10 MB"));
      return;
    }
    const image = new Image();
    const objectURL = URL.createObjectURL(file);
    image.onerror = () => {
      URL.revokeObjectURL(objectURL);
      reject(new Error("อ่านรูปนี้ไม่ได้ กรุณาเลือกรูปอื่น"));
    };
    image.onload = () => {
      URL.revokeObjectURL(objectURL);
      try {
        const scale = Math.min(
          1,
          1000 / image.naturalWidth,
          700 / image.naturalHeight,
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#0d1725";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const cover = canvas.toDataURL("image/jpeg", 0.82);
        if (!safeCover(cover))
          throw new Error("รูปมีขนาดใหญ่เกินไป กรุณาเลือกรูปอื่น");
        resolve(cover);
      } catch (error) {
        reject(error);
      }
    };
    image.src = objectURL;
  });
}
function openLessonForm(id = "") {
  saveNote();
  const c = state.courses.find((item) => item.id === activeCourse);
  const lesson = c?.lessons.find((item) => item.id === id);
  if (!c || (id && !lesson)) return;
  $("#lesson-form").reset();
  $("#edit-lesson-id").value = id;
  $("#lesson-error").textContent = "";
  $("#lesson-dialog-title").textContent = lesson
    ? "แก้ไขบทเรียน"
    : "เพิ่มบทเรียน";
  if (lesson) {
    $("#lesson-name").value = lesson.title;
    $("#lesson-url").value = lesson.url;
    $("#lesson-slides-url").value = lesson.slidesUrl || "";
  }
  openDialog("lesson-dialog");
}
function restoreCourses(ids) {
  const toRestore = state.trash.filter((c) => ids.includes(c.id));
  state.courses.push(
    ...toRestore.filter((c) => !state.courses.some((item) => item.id === c.id)),
  );
  state.trash = state.trash.filter((c) => !ids.includes(c.id));
  persist();
  render();
  updateSettings();
}
function updateSettings() {
  $("#restore-courses-slot").innerHTML = state.trash.length
    ? `<button class="text-button" id="restore-removed">${icon("restore")} กู้คืนคอร์สที่นำออก (${state.trash.length} คอร์ส)</button>`
    : "";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button,a[data-nav]");
  if (!button) return;
  if (button.dataset.close) {
    closeDialog(button.dataset.close);
    return;
  }
  if (button.dataset.nav) {
    changeView(button.dataset.nav);
    return;
  }
  if (button.dataset.open) {
    openCourse(button.dataset.open);
    return;
  }
  if (button.dataset.editLesson) {
    openLessonForm(button.dataset.editLesson);
    return;
  }
  if (button.dataset.favorite) {
    const c = state.courses.find((item) => item.id === button.dataset.favorite);
    if (c) {
      saveNote();
      c.favorite = !c.favorite;
      persist();
      render();
      if (activeCourse === c.id) renderDetail();
      notify(c.favorite ? "เพิ่มในรายการโปรดแล้ว" : "นำออกจากรายการโปรดแล้ว");
    }
    return;
  }
  if (button.dataset.category) {
    category = button.dataset.category;
    renderLibrary();
    return;
  }
  if (button.dataset.status) {
    status = button.dataset.status;
    renderLibrary();
    return;
  }
  if (button.dataset.layout) {
    state.layout = button.dataset.layout;
    persist();
    renderLibrary();
    return;
  }
  switch (button.id) {
    case "add-course":
      openCourseForm();
      break;
    case "hero-resume": {
      const c = continueCourse();
      c ? openCourse(c.id) : openCourseForm();
      break;
    }
    case "hero-library":
      $("#library").scrollIntoView({ behavior: "smooth" });
      break;
    case "profile-button":
      updateSettings();
      openDialog("settings-dialog");
      break;
    case "edit-course":
    case "add-course-link":
      saveNote();
      openCourseForm(activeCourse);
      break;
    case "edit-cover":
      saveNote();
      openCourseForm(activeCourse);
      $("#course-cover-file").focus();
      break;
    case "remove-cover":
      coverRequest++;
      coverBusy = false;
      $("#course-submit").disabled = false;
      draftCover = "";
      $("#course-cover-file").value = "";
      $("#cover-error").textContent = "";
      renderCoverPreview();
      break;
    case "add-lesson":
      openLessonForm();
      break;
    case "delete-course": {
      const id = activeCourse;
      saveNote();
      const c = state.courses.find((item) => item.id === id);
      if (!c) break;
      state.trash = state.trash.filter((item) => item.id !== id);
      state.trash.push(c);
      state.courses = state.courses.filter((item) => item.id !== id);
      closeDialog("course-dialog");
      persist();
      render();
      notify("นำคอร์สออกแล้ว กู้คืนได้ในเมนู ME", () => restoreCourses([id]));
      break;
    }
    case "restore-removed":
      restoreCourses(state.trash.map((c) => c.id));
      notify("กู้คืนคอร์สแล้ว");
      break;
    case "empty-action":
      if (search || status !== "all" || category !== "all") {
        search = "";
        status = "all";
        category = "all";
        $("#search").value = "";
        renderLibrary();
      } else if (view === "favorites") {
        changeView("courses");
      } else {
        openCourseForm();
      }
      break;
    case "export-data": {
      saveNote();
      const blob = new Blob(
        [
          JSON.stringify(
            {
              app: "CourseVault",
              version: 1,
              exportedAt: new Date().toISOString(),
              courses: state.courses,
              trash: state.trash,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `patinya-ego-backup-${new Date().toLocaleDateString("en-CA")}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("ดาวน์โหลดไฟล์สำรองแล้ว");
      break;
    }
  }
});
document.querySelectorAll(".brand").forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    changeView("overview");
  }),
);
$("#search").addEventListener("input", (event) => {
  search = event.target.value.trim();
  renderLibrary();
});
$("#sort").addEventListener("change", (event) => {
  sort = event.target.value;
  renderLibrary();
});
document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k" &&
    !document.querySelector("dialog[open]")
  ) {
    event.preventDefault();
    if (view === "notes") changeView("courses");
    $("#search").focus();
    $("#search").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
$("#course-dialog").addEventListener("change", (event) => {
  if (event.target.matches("[data-lesson]"))
    updateLesson(event.target.dataset.lesson, event.target.checked);
});
$("#course-dialog").addEventListener("input", (event) => {
  if (event.target.id === "course-note") {
    clearTimeout(noteTimer);
    $("#note-state").textContent = "กำลังบันทึก...";
    noteTimer = setTimeout(saveNote, 400);
  }
});
$("#course-dialog").addEventListener("cancel", () => {
  clearTimeout(noteTimer);
  saveNote();
});
$("#course-dialog").addEventListener("close", () => {
  clearTimeout(noteTimer);
  saveNote();
  activeCourse = null;
});
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        closeDialog(dialog.id);
    }
  }),
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(noteTimer);
    saveNote();
  }
});
window.addEventListener("pagehide", saveNote);
$("#course-cover-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const request = ++coverRequest;
  coverBusy = true;
  $("#course-submit").disabled = true;
  $("#cover-error").textContent = "กำลังเตรียมรูป...";
  try {
    const cover = await readCover(file);
    if (request !== coverRequest) return;
    draftCover = cover;
    renderCoverPreview();
    $("#cover-error").textContent = "";
  } catch (error) {
    if (request === coverRequest)
      $("#cover-error").textContent = error.message || "เปลี่ยนรูปไม่สำเร็จ";
  } finally {
    if (request === coverRequest) {
      coverBusy = false;
      $("#course-submit").disabled = false;
      event.target.value = "";
    }
  }
});
$("#form-dialog").addEventListener("close", () => {
  coverRequest++;
  coverBusy = false;
  $("#course-submit").disabled = false;
});
$("#course-category").addEventListener("change", renderCoverPreview);
$("#course-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = $("#course-name").value.trim();
  const rawURL = $("#course-url").value.trim();
  const url = safeURL(rawURL);
  const cat = $("#course-category").value;
  if (coverBusy) {
    $("#form-error").textContent = "กรุณารอให้เตรียมรูปเสร็จก่อน";
    return;
  }
  if (!title) {
    $("#form-error").textContent = "กรุณาใส่ชื่อคอร์ส";
    return;
  }
  if (rawURL && !url) {
    $("#form-error").textContent =
      "กรุณาใช้ลิงก์ที่ขึ้นต้นด้วย https:// หรือ http://";
    return;
  }
  const id = $("#edit-id").value;
  let c = state.courses.find((item) => item.id === id);
  const previousCourses = state.courses;
  const fields = {
    title,
    provider: $("#course-provider").value.trim() || "คอร์สส่วนตัว",
    category: cat,
    url,
    coverImage: draftCover,
    hours: Number($("#course-hours").value) || 0,
    description: $("#course-description").value.trim(),
    updatedAt: Date.now(),
  };
  if (c) {
    c = { ...c, ...fields, tone: c.sample ? c.tone : CATEGORY[cat].tone };
    state.courses = state.courses.map((item) => (item.id === id ? c : item));
  } else {
    const newID = uid();
    const count = Math.min(
      300,
      Math.max(1, Number($("#course-lessons").value) || 1),
    );
    c = {
      id: newID,
      ...fields,
      tone: CATEGORY[cat].tone,
      createdAt: Date.now(),
      sample: false,
      favorite: false,
      note: "",
      lessons: Array.from({ length: count }, (_, i) => ({
        id: uid(),
        title: `บทที่ ${i + 1}`,
        url: "",
        done: false,
      })),
    };
    state.courses = [c, ...state.courses];
  }
  if (!persist()) {
    state.courses = previousCourses;
    $("#form-error").textContent =
      "บันทึกไม่สำเร็จ พื้นที่เบราว์เซอร์อาจเต็ม ลองใช้รูปที่เล็กลงหรือนำรูปปกออก";
    return;
  }
  closeDialog("form-dialog");
  if (activeCourse === c.id) renderDetail();
  render();
  notify(id ? "บันทึกการแก้ไขแล้ว" : "เพิ่มคอร์สลงในคลังแล้ว");
});
$("#lesson-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const c = state.courses.find((item) => item.id === activeCourse);
  if (!c) return;
  const title = $("#lesson-name").value.trim();
  const raw = $("#lesson-url").value.trim();
  const url = safeURL(raw);
  const rawSlides = $("#lesson-slides-url").value.trim();
  const slidesUrl = safeURL(rawSlides);
  if (!title) {
    $("#lesson-error").textContent = "กรุณาใส่ชื่อบทเรียน";
    return;
  }
  if (raw && !url) {
    $("#lesson-error").textContent = "กรุณาใช้ลิงก์คลิปสอนที่ขึ้นต้นด้วย https:// หรือ http://";
    return;
  }
  if (rawSlides && !slidesUrl) {
    $("#lesson-error").textContent = "กรุณาใช้ลิงก์สไลด์เรียนที่ขึ้นต้นด้วย https:// หรือ http://";
    return;
  }
  const id = $("#edit-lesson-id").value;
  const lesson = c.lessons.find((item) => item.id === id);
  if (id && !lesson) {
    $("#lesson-error").textContent = "ไม่พบบทเรียนที่ต้องการแก้ไข";
    return;
  }
  if (!id && c.lessons.length >= 300) {
    $("#lesson-error").textContent = "เพิ่มได้สูงสุด 300 บทเรียนต่อคอร์ส";
    return;
  }
  saveNote();
  const previousLessons = c.lessons;
  const previousUpdatedAt = c.updatedAt;
  c.lessons = id
    ? c.lessons.map((item) => (item.id === id ? { ...item, title, url, slidesUrl } : item))
    : [...c.lessons, { id: uid(), title, url, slidesUrl, done: false }];
  c.updatedAt = Date.now();
  if (!persist()) {
    c.lessons = previousLessons;
    c.updatedAt = previousUpdatedAt;
    $("#lesson-error").textContent = "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง";
    return;
  }
  const list = $(".lesson-list");
  const scroll = list?.scrollTop || 0;
  closeDialog("lesson-dialog");
  renderDetail();
  $(".lesson-list").scrollTop = scroll;
  render();
  notify(id ? "บันทึกบทเรียนแล้ว" : "เพิ่มบทเรียนแล้ว");
});
$("#import-data").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024)
      throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5 MB");
    const data = JSON.parse(await file.text());
    if (data.app !== "CourseVault" || data.version !== 1)
      throw new Error("กรุณาใช้ไฟล์สำรองจาก patinya ego");
    const courses = validateCourses(data.courses);
    const merged = new Map(state.courses.map((c) => [c.id, c]));
    courses.forEach((c) => merged.set(c.id, c));
    if (merged.size > 500) throw new Error("รองรับสูงสุด 500 คอร์ส");
    state.courses = [...merged.values()];
    state.trash = state.trash.filter((c) => !merged.has(c.id));
    persist();
    render();
    updateSettings();
    notify(`นำเข้าข้อมูล ${courses.length} คอร์สแล้ว`);
  } catch (error) {
    notify(
      error instanceof SyntaxError
        ? "ไม่สามารถอ่านไฟล์ JSON นี้ได้"
        : error.message || "นำเข้าข้อมูลไม่สำเร็จ",
    );
  } finally {
    event.target.value = "";
  }
});

hydrateIcons();
render();
if (storageFailed)
  notify("อ่านข้อมูลที่บันทึกไม่ได้ กรุณาตรวจไฟล์สำรองในเมนู ME");
else persist();