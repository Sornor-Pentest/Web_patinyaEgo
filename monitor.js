"use strict";

(() => {
  const API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
  const REFRESH_MS = 60 * 60 * 1000;
  const $ = (selector) => document.querySelector(selector);
  const list = $("#monitor-list");
  if (!list) return;

  let records = [];
  let lastFetch = 0;
  let inFlight = false;
  let refreshTimer = null;

  function metricFor(cve) {
    const metrics = cve.metrics || {};
    const candidates = ["cvssMetricV40", "cvssMetricV31", "cvssMetricV30", "cvssMetricV2"];
    for (const key of candidates) {
      const entry = metrics[key]?.[0];
      if (entry?.cvssData) {
        return {
          score: Number(entry.cvssData.baseScore),
          severity: String(entry.cvssData.baseSeverity || entry.baseSeverity || "").toUpperCase(),
        };
      }
    }
    return { score: null, severity: "NONE" };
  }

  function normalize(item) {
    const cve = item.cve || {};
    const metric = metricFor(cve);
    const descriptions = cve.descriptions || [];
    const description = descriptions.find((entry) => entry.lang === "en")?.value || descriptions[0]?.value || "ไม่มีคำอธิบายจากแหล่งข้อมูล";
    return {
      id: String(cve.id || "").toUpperCase(),
      description,
      published: cve.published || "",
      modified: cve.lastModified || "",
      score: Number.isFinite(metric.score) ? metric.score : null,
      severity: metric.severity || "NONE",
      kevDate: cve.cisaExploitAdd || "",
      kevDue: cve.cisaActionDue || "",
      kevRequired: cve.cisaRequiredAction || "",
    };
  }

  function updateSummary() {
    $("#monitor-total").textContent = records.length.toLocaleString();
    $("#monitor-critical").textContent = records.filter((item) => item.severity === "CRITICAL").length.toLocaleString();
    $("#monitor-kev").textContent = records.filter((item) => item.kevDate).length.toLocaleString();
  }

  function makeBadge(label, className) {
    const badge = document.createElement("span");
    badge.className = `monitor-badge ${className}`;
    badge.textContent = label;
    return badge;
  }

  function render() {
    const query = $("#monitor-search").value.trim().toLowerCase();
    const severity = $("#monitor-severity").value;
    const visible = records.filter((item) => {
      const matchesQuery = !query || `${item.id} ${item.description}`.toLowerCase().includes(query);
      return matchesQuery && (severity === "all" || item.severity === severity);
    });
    const fragment = document.createDocumentFragment();

    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "monitor-empty";
      empty.textContent = records.length ? "ไม่พบรายการที่ตรงกับตัวกรอง" : "ยังไม่มีรายการข้อมูล ลองรีเฟรชอีกครั้ง";
      fragment.append(empty);
      list.replaceChildren(fragment);
      return;
    }

    for (const item of visible) {
      const card = document.createElement("article");
      card.className = "monitor-card";
      const top = document.createElement("div");
      top.className = "monitor-card-top";
      const id = document.createElement("a");
      id.className = "monitor-cve-id";
      id.href = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(item.id)}`;
      id.target = "_blank";
      id.rel = "noopener noreferrer";
      id.textContent = item.id || "CVE ID unavailable";
      top.append(id, makeBadge(item.severity === "NONE" ? "UNRATED" : item.severity, `severity-${item.severity.toLowerCase()}`));
      if (item.kevDate) top.append(makeBadge("CISA KEV", "kev"));

      const description = document.createElement("p");
      description.className = "monitor-description";
      description.textContent = item.description;

      const meta = document.createElement("div");
      meta.className = "monitor-card-meta";
      const published = document.createElement("span");
      published.textContent = `เผยแพร่ ${item.published ? new Date(item.published).toLocaleString("th-TH") : "ไม่ระบุ"}`;
      meta.append(published);
      if (item.score !== null) {
        const score = document.createElement("span");
        score.textContent = `CVSS ${item.score.toFixed(1)}`;
        meta.append(score);
      }
      if (item.kevDate) {
        const kev = document.createElement("span");
        kev.textContent = `เพิ่มใน KEV ${new Date(`${item.kevDate}T00:00:00`).toLocaleDateString("th-TH")}`;
        meta.append(kev);
      }

      card.append(top, description, meta);
      fragment.append(card);
    }

    // Build the refreshed list off-screen, then swap it in once so it never flashes empty.
    list.replaceChildren(fragment);
  }

  async function loadLatest(force = false) {
    if (inFlight || (!force && Date.now() - lastFetch < REFRESH_MS)) return;
    inFlight = true;
    const button = $("#monitor-refresh");
    const status = $("#monitor-status");
    button.disabled = true;
    status.textContent = "กำลังโหลดข้อมูล CVE ล่าสุดจาก NVD…";

    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      pubStartDate: start.toISOString(),
      pubEndDate: end.toISOString(),
      resultsPerPage: "100",
      noRejected: "",
    });

    try {
      const response = await fetch(`${API_URL}?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`NVD ตอบกลับด้วยสถานะ ${response.status}`);
      const data = await response.json();
      records = (data.vulnerabilities || []).map(normalize).filter((item) => item.id).sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
      lastFetch = Date.now();
      $("#monitor-updated").textContent = new Date(lastFetch).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      status.textContent = `พบ ${Number(data.totalResults || records.length).toLocaleString()} รายการที่เผยแพร่ใน 7 วันที่ผ่านมา · แสดงสูงสุด ${records.length} รายการ · ข้อมูลจาก NVD`;
      updateSummary();
      render();
    } catch (error) {
      status.textContent = records.length
        ? `โหลดข้อมูลใหม่ไม่สำเร็จ (${error.message}) กำลังแสดงข้อมูลที่โหลดไว้ก่อนหน้า`
        : `โหลดข้อมูลไม่สำเร็จ (${error.message}) ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง`;
      if (!records.length) render();
    } finally {
      inFlight = false;
      button.disabled = false;
    }
  }

  function onViewChange(event) {
    if (event.detail?.view === "overview") {
      loadLatest();
      if (!refreshTimer) refreshTimer = window.setInterval(() => loadLatest(), REFRESH_MS);
    } else if (refreshTimer) {
      window.clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  $("#monitor-refresh").addEventListener("click", () => loadLatest(true));
  $("#monitor-search").addEventListener("input", render);
  $("#monitor-severity").addEventListener("change", render);
  document.addEventListener("app:viewchange", onViewChange);

  loadLatest();
  refreshTimer = window.setInterval(() => loadLatest(), REFRESH_MS);
})();
