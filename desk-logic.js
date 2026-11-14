/*
  Cyber Desk — pure logic (no DOM access), so it can be unit tested with Node.
  Browser: exposes window.DeskLogic.   Node: module.exports.
  Contents: date helpers, SM-2 spaced repetition, roadmap progress, seed merge, import normalisation.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.DeskLogic = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------- dates (local time, so "today" matches the user's calendar day) ----------
  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  // ---------- spaced repetition (SM-2 style) ----------
  // grade: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
  const GRADES = ["Again", "Hard", "Good", "Easy"];
  const MIN_EASE = 1.3;

  function newCard(now = new Date()) {
    return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: ymd(now), seen: 0 };
  }

  // Returns only the scheduling fields; the caller merges them into the card.
  function sm2(card, grade, now = new Date()) {
    if (!Number.isInteger(grade) || grade < 0 || grade > 3) throw new RangeError("grade must be 0, 1, 2 or 3");
    let ease = Number(card.ease) || 2.5;
    let interval = Math.max(0, Math.floor(Number(card.interval) || 0));
    let reps = Math.max(0, Math.floor(Number(card.reps) || 0));
    let lapses = Math.max(0, Math.floor(Number(card.lapses) || 0));

    if (grade === 0) {
      lapses += 1; reps = 0; interval = 0; ease = Math.max(MIN_EASE, ease - 0.2);
    } else {
      if (grade === 1) {
        interval = reps === 0 ? 1 : Math.max(interval + 1, Math.round(interval * 1.2));
        ease = Math.max(MIN_EASE, ease - 0.15);
      } else if (grade === 2) {
        interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(interval + 1, Math.round(interval * ease));
      } else {
        interval = reps === 0 ? 4 : reps === 1 ? 7 : Math.max(interval + 2, Math.round(interval * ease * 1.3));
        ease += 0.15;
      }
      reps += 1;
    }
    return {
      ease: Math.round(ease * 100) / 100, interval, reps, lapses,
      due: ymd(addDays(now, interval)), seen: now.getTime()
    };
  }

  // Cards due on or before `today` (YYYY-MM-DD). Oldest due first; recently seen cards go last.
  function dueCards(cards, today) {
    return cards
      .filter(c => (c.due || today) <= today)
      .sort((a, b) => (a.due || today).localeCompare(b.due || today) || (a.seen || 0) - (b.seen || 0));
  }

  const intervalLabel = n => (n <= 0 ? "today" : n + "d");

  // ---------- roadmap ----------
  // roadmap: [{ items: [[id, text], ...] }, ...]   checks: { [id]: true }
  function roadProgress(roadmap, checks) {
    const phases = roadmap.map(p => ({
      total: p.items.length,
      done: p.items.filter(([id]) => checks && checks[id] === true).length
    }));
    return {
      phases,
      done: phases.reduce((n, p) => n + p.done, 0),
      total: phases.reduce((n, p) => n + p.total, 0)
    };
  }
  const percent = (done, total) => (total ? Math.round((done / total) * 100) : 0);

  // ---------- small helpers ----------
  const nvdUrl = id => {
    const s = String(id || "").trim();
    return /^CVE-\d{4}-\d{4,}$/i.test(s) ? "https://nvd.nist.gov/vuln/detail/" + s.toUpperCase() : "";
  };
  const lineCount = text => String(text ?? "").split(/\r?\n/).filter(l => l.trim()).length;
  const safeFileName = name =>
    String(name ?? "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 60) || "wordlist";

  // Adds seed items whose title is not already in the list. Returns how many were added.
  function mergeSeed(list, seeds, makeId, init) {
    const have = new Set(list.map(x => String(x.title ?? "").trim().toLowerCase()));
    let added = 0;
    for (const s of seeds) {
      const key = s.title.trim().toLowerCase();
      if (have.has(key)) continue;
      have.add(key);
      list.push(Object.assign({ id: makeId() }, s, init ? init() : {}));
      added += 1;
    }
    return added;
  }

  // ---------- storage shape ----------
  const LISTS = ["findings", "notes", "snippets", "tasks", "links", "payloads", "cves", "cards"];
  const MAPS = ["checks", "road"];
  const isObj = x => x !== null && typeof x === "object" && !Array.isArray(x);

  // Always returns a complete db object, tolerating old saves and bad imports.
  function normalizeDb(raw) {
    const d = isObj(raw) ? raw : {};
    const out = {};
    for (const k of LISTS) out[k] = Array.isArray(d[k]) ? d[k].filter(isObj) : [];
    for (const k of MAPS) out[k] = isObj(d[k]) ? d[k] : {};
    return out;
  }

  return {
    ymd, addDays, GRADES, newCard, sm2, dueCards, intervalLabel,
    roadProgress, percent, nvdUrl, lineCount, safeFileName, mergeSeed, normalizeDb, LISTS, MAPS
  };
});