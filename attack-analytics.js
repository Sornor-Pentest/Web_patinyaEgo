"use strict";

(() => {
  const STORAGE_KEY = "sornorEgo.attack-analytics-demo.v1";
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const MAX_RECENT = 120;
  const MAX_HOURS = 366 * 24;
  const RANGE = {
    week: { duration: 7 * DAY, buckets: 28, caption: "7 วันที่ผ่านมา", label: "7 วัน" },
    month: { duration: 30 * DAY, buckets: 30, caption: "30 วันที่ผ่านมา", label: "30 วัน" },
    year: { duration: 365 * DAY, buckets: 12, caption: "12 เดือนที่ผ่านมา", label: "1 ปี" },
  };
  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#attack-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let activeRange = "week";
  let recent = [];
  let hourly = {};
  let seen = new Set();
  let saveTimer = 0;
  let resizeObserver = null;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const cutoff = Date.now() - 366 * DAY;
      hourly = Object.fromEntries(
        Object.entries(parsed.hourly || {}).filter(([key, types]) => {
          const stamp = Number(key);
          return Number.isFinite(stamp) && stamp >= cutoff && types && typeof types === "object";
        }).slice(-MAX_HOURS),
      );
      recent = Array.isArray(parsed.recent)
        ? parsed.recent.filter((item) => item && item.type && Number.isFinite(item.timestamp)).slice(0, MAX_RECENT)
        : [];
      recent.forEach((item) => seen.add(eventKey(item)));
    } catch {
      hourly = {};
      recent = [];
    }
  }

  function eventKey(item) {
    return `${item.timestamp}|${item.type}|${item.from || ""}|${item.to || ""}`;
  }

  function persistSoon() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ hourly, recent }));
      } catch {
        // Dashboard remains usable when browser storage is unavailable.
      }
    }, 1200);
  }

  function ingest(raw) {
    if (!raw || !raw.type) return;
    const item = {
      id: raw.id,
      type: String(raw.type),
      severity: ["low", "med", "high"].includes(raw.severity) ? raw.severity : "low",
      from: String(raw.from || ""),
      to: String(raw.to || ""),
      timestamp: Number(raw.timestamp) || Date.now(),
    };
    const key = eventKey(item);
    if (seen.has(key)) return;
    seen.add(key);

    const hourKey = String(Math.floor(item.timestamp / HOUR) * HOUR);
    if (!hourly[hourKey]) hourly[hourKey] = {};
    hourly[hourKey][item.type] = (Number(hourly[hourKey][item.type]) || 0) + 1;

    recent.unshift(item);
    recent = recent.slice(0, MAX_RECENT);
    if (seen.size > MAX_RECENT * 3) seen = new Set(recent.map(eventKey));

    const cutoff = Date.now() - 366 * DAY;
    Object.keys(hourly).forEach((stamp) => {
      if (Number(stamp) < cutoff) delete hourly[stamp];
    });
    persistSoon();
    render();
  }

  function getBuckets(rangeKey) {
    const range = RANGE[rangeKey];
    const now = Date.now();
    const start = now - range.duration;
    const step = range.duration / range.buckets;
    const buckets = Array.from({ length: range.buckets }, (_, index) => ({
      start: start + index * step,
      end: start + (index + 1) * step,
      count: 0,
    }));

    Object.entries(hourly).forEach(([stamp, types]) => {
      const time = Number(stamp);
      if (time < start || time > now) return;
      const index = Math.min(range.buckets - 1, Math.floor((time - start) / step));
      buckets[index].count += Object.values(types).reduce((sum, value) => sum + (Number(value) || 0), 0);
    });
    return buckets;
  }

  function getRankedTypes(rangeKey) {
    const start = Date.now() - RANGE[rangeKey].duration;
    const totals = {};
    Object.entries(hourly).forEach(([stamp, types]) => {
      if (Number(stamp) < start) return;
      Object.entries(types).forEach(([type, count]) => {
        totals[type] = (totals[type] || 0) + (Number(count) || 0);
      });
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }

  function formatBucketLabel(bucket, rangeKey) {
    const date = new Date(bucket.start);
    if (rangeKey === "year") return date.toLocaleDateString("th-TH", { month: "short" });
    if (rangeKey === "month") return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  }

  function drawChart(buckets) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const pad = { top: 18, right: 12, bottom: 34, left: 38 };
    const chartWidth = width - pad.left - pad.right;
    const chartHeight = height - pad.top - pad.bottom;
    const maxCount = Math.max(2, ...buckets.map((bucket) => bucket.count));
    const gridSteps = 4;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "10px Manrope, IBM Plex Sans Thai, sans-serif";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    for (let step = 0; step <= gridSteps; step++) {
      const y = pad.top + (chartHeight * step) / gridSteps;
      const value = Math.ceil(maxCount * (1 - step / gridSteps));
      ctx.strokeStyle = "rgba(140, 174, 255, 0.14)";
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "#829dd0";
      ctx.textAlign = "right";
      ctx.fillText(String(value), pad.left - 8, y);
    }

    const points = buckets.map((bucket, index) => ({
      x: pad.left + (buckets.length <= 1 ? 0 : (chartWidth * index) / (buckets.length - 1)),
      y: pad.top + chartHeight - (bucket.count / maxCount) * chartHeight,
      count: bucket.count,
    }));

    if (points.length) {
      const fill = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
      fill.addColorStop(0, "rgba(83, 157, 255, 0.34)");
      fill.addColorStop(1, "rgba(42, 94, 220, 0.015)");
      ctx.beginPath();
      ctx.moveTo(points[0].x, height - pad.bottom);
      points.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.lineTo(points[points.length - 1].x, height - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = "#72b6ff";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      const labelEvery = Math.max(1, Math.ceil(points.length / 6));
      points.forEach((point, index) => {
        if (index % labelEvery !== 0 && index !== points.length - 1) return;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ddecff";
        ctx.fill();
        ctx.textAlign = index === points.length - 1 ? "right" : "center";
        ctx.fillStyle = "#829dd0";
        ctx.fillText(formatBucketLabel(buckets[index], activeRange), point.x, height - 15);
      });
    }
  }

  function renderLiveTable() {
    const body = $("#attack-live-body");
    const count = $("#attack-live-count");
    const fragment = document.createDocumentFragment();
    const rows = recent.slice(0, 80);
    count.textContent = recent.length.toLocaleString("th-TH");

    if (!rows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.className = "attack-table-empty";
      cell.textContent = "รอเหตุการณ์จำลองจาก threat map…";
      row.append(cell);
      fragment.append(row);
    } else {
      rows.forEach((item) => {
        const row = document.createElement("tr");
        const typeCell = document.createElement("td");
        typeCell.className = "attack-live-table-type";
        typeCell.textContent = item.type;
        const route = document.createElement("span");
        route.className = "attack-live-table-route";
        route.textContent = item.from && item.to ? `${item.from} → ${item.to}` : "Threat map demo";
        typeCell.append(route);

        const severityCell = document.createElement("td");
        const severity = document.createElement("span");
        severity.className = `attack-severity ${item.severity}`;
        severity.textContent = item.severity === "med" ? "MED" : item.severity.toUpperCase();
        severityCell.append(severity);

        const timeCell = document.createElement("td");
        timeCell.className = "attack-table-time";
        timeCell.textContent = new Date(item.timestamp).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        row.append(typeCell, severityCell, timeCell);
        fragment.append(row);
      });
    }
    body.replaceChildren(fragment);
  }

  function renderRankTable() {
    const body = $("#attack-rank-body");
    const fragment = document.createDocumentFragment();
    const ranked = getRankedTypes(activeRange);
    $("#attack-rank-period").textContent = RANGE[activeRange].label;

    if (!ranked.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.className = "attack-table-empty";
      cell.textContent = "ยังไม่มีข้อมูลในช่วงเวลานี้";
      row.append(cell);
      fragment.append(row);
    } else {
      ranked.forEach(([type, total], index) => {
        const row = document.createElement("tr");
        const rank = document.createElement("td");
        rank.textContent = String(index + 1).padStart(2, "0");
        const name = document.createElement("td");
        name.textContent = type;
        const count = document.createElement("td");
        count.className = "attack-rank-count";
        count.textContent = total.toLocaleString("th-TH");
        row.append(rank, name, count);
        fragment.append(row);
      });
    }
    body.replaceChildren(fragment);
  }

  function render() {
    const buckets = getBuckets(activeRange);
    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    $("#attack-chart-total").textContent = total.toLocaleString("th-TH");
    $("#attack-chart-caption").textContent = `เหตุการณ์จำลอง · ${RANGE[activeRange].caption}`;
    drawChart(buckets);
    renderLiveTable();
    renderRankTable();
  }

  document.querySelectorAll("[data-attack-range]").forEach((button) => {
    button.addEventListener("click", () => {
      activeRange = button.dataset.attackRange;
      document.querySelectorAll("[data-attack-range]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      render();
    });
  });

  loadState();
  (window.ThreatMapDemo?.getRecentEvents?.() || []).forEach(ingest);
  window.addEventListener("threatmap:attack", (event) => ingest(event.detail));
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas.parentElement);
  } else {
    window.addEventListener("resize", render);
  }
  render();
})();
