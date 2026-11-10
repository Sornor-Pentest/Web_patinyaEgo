/* Interactive SIMULATED cyber-threat map for the hero section.
   Every event is generated locally and is NOT real attack data.
   Only RFC 5737 documentation IP ranges are shown, never real addresses. */
(function () {
  "use strict";

  var $ = function (id) {
    return document.getElementById(id);
  };
  var canvas = $("threat-canvas");
  var stage = $("threat-stage");
  var feedList = $("threat-feed-list");
  var countEl = $("threat-count");
  var tipEl = $("threat-tip");
  var infoEl = $("threat-info");
  var filterEl = $("threat-filter");
  if (!canvas || !stage || !window.WORLD_COUNTRIES) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- data ---------- */

  // [city, lat, lon, country name exactly as in the map data]
  var CITY_DATA = [
    ["New York", 40.7, -74.0, "United States of America"],
    ["Dallas", 32.8, -96.8, "United States of America"],
    ["San Jose", 37.3, -121.9, "United States of America"],
    ["Toronto", 43.7, -79.4, "Canada"],
    ["São Paulo", -23.5, -46.6, "Brazil"],
    ["Mexico City", 19.4, -99.1, "Mexico"],
    ["London", 51.5, -0.1, "United Kingdom"],
    ["Frankfurt", 50.1, 8.7, "Germany"],
    ["Paris", 48.9, 2.35, "France"],
    ["Amsterdam", 52.4, 4.9, "Netherlands"],
    ["Stockholm", 59.3, 18.1, "Sweden"],
    ["Moscow", 55.8, 37.6, "Russia"],
    ["Novosibirsk", 55.0, 82.9, "Russia"],
    ["Istanbul", 41.0, 29.0, "Turkey"],
    ["Tel Aviv", 32.1, 34.8, "Israel"],
    ["Tehran", 35.7, 51.4, "Iran"],
    ["Cairo", 30.0, 31.2, "Egypt"],
    ["Lagos", 6.5, 3.4, "Nigeria"],
    ["Johannesburg", -26.2, 28.0, "South Africa"],
    ["Mumbai", 19.1, 72.9, "India"],
    ["Beijing", 39.9, 116.4, "China"],
    ["Seoul", 37.6, 127.0, "South Korea"],
    ["Tokyo", 35.7, 139.7, "Japan"],
    ["Singapore", 1.35, 103.8, "Singapore"],
    ["Jakarta", -6.2, 106.8, "Indonesia"],
    ["Sydney", -33.9, 151.2, "Australia"],
    ["Bangkok", 13.75, 100.5, "Thailand"],
  ];
  var CITIES = CITY_DATA.map(function (c) {
    return { city: c[0], lat: c[1], lon: c[2], country: c[3] };
  });
  var HOME = CITIES[CITIES.length - 1]; // Bangkok: frequent target

  var TYPES = [
    ["Bruteforce SSH port 22", "med"],
    ["SQL Injection attack", "high"],
    ["DDoS on TCP port 443", "high"],
    ["Port scan (SYN sweep)", "low"],
    ["XSS attempt on login form", "med"],
    ["RFI attack on /index.php", "med"],
    ["Malware C2 beacon", "high"],
    ["Searching for sensitive file or directory", "low"],
    ["Non-standard HTTP/2 access", "low"],
    ["Credential stuffing", "med"],
    ["Phishing kit hosting", "med"],
    ["Aggressive number of TCP connections", "med"],
  ];
  var COLORS = { low: "#7fe6ff", med: "#ffd166", high: "#ff7a8a" };
  var TEST_NETS = ["192.0.2.", "198.51.100.", "203.0.113."];

  // countries: unwrap rings that cross the antimeridian, precompute bboxes
  var countries = window.WORLD_COUNTRIES.map(function (c) {
    var rings = c[1].map(function (ring) {
      var wraps = false;
      for (var i = 1; i < ring.length; i++)
        if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) wraps = true;
      var pts = wraps
        ? ring.map(function (p) {
            return [p[0] < 0 ? p[0] + 360 : p[0], p[1]];
          })
        : ring;
      var x0 = 1e9,
        y0 = 1e9,
        x1 = -1e9,
        y1 = -1e9;
      pts.forEach(function (p) {
        if (p[0] < x0) x0 = p[0];
        if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[1] > y1) y1 = p[1];
      });
      return { pts: pts, wraps: wraps, box: [x0, y0, x1, y1] };
    });
    return { name: c[0], rings: rings };
  });
  var countryByName = {};
  countries.forEach(function (c) {
    countryByName[c.name] = c;
  });

  /* ---------- state ---------- */

  var W = 0,
    H = 0,
    dpr = 1;
  var land = document.createElement("canvas");
  var proj = { s: 1, ox: 0, oy: 0, cx: 0, cy: 0, halfW: 0, halfH: 0 };
  var view = { k: 1, x: 0, y: 0 };
  var attacks = [];
  var ripples = [];
  var events = [];
  var stats = {};
  var total = 11320272;
  var evId = 0;
  var nextSpawn = 0;
  var running = false;
  var visible = true;
  var rafId = 0;
  var landDirty = true;
  var staticNow = 0;
  var hovered = null;
  var selected = null;
  var pointer = null; // active drag state
  var lastMouse = null;

  /* ---------- projection (Miller) + view transform ---------- */

  function millerY(latDeg) {
    var p = (latDeg * Math.PI) / 180;
    return 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * p));
  }
  function project(lon, lat) {
    var bx = proj.ox + ((lon * Math.PI) / 180) * proj.s;
    var by = proj.oy - millerY(lat) * proj.s;
    return [
      proj.cx + (bx - proj.cx) * view.k + view.x,
      proj.cy + (by - proj.cy) * view.k + view.y,
    ];
  }
  function unproject(sx, sy) {
    var bx = proj.cx + (sx - view.x - proj.cx) / view.k;
    var by = proj.cy + (sy - view.y - proj.cy) / view.k;
    var lon = ((bx - proj.ox) / proj.s) * (180 / Math.PI);
    var y = (proj.oy - by) / proj.s;
    var lat = (2.5 * Math.atan(Math.exp(0.8 * y)) - 0.625 * Math.PI) * (180 / Math.PI);
    return [lon, lat];
  }

  function clampView() {
    var mx = proj.halfW * (view.k - 1);
    var my = proj.halfH * (view.k - 1);
    view.x = Math.max(-mx, Math.min(mx, view.x));
    view.y = Math.max(-my, Math.min(my, view.y));
  }
  function zoomAt(sx, sy, factor) {
    var nk = Math.max(1, Math.min(8, view.k * factor));
    if (nk === view.k) return;
    var f = nk / view.k;
    view.x = sx - proj.cx - (sx - proj.cx - view.x) * f;
    view.y = sy - proj.cy - (sy - proj.cy - view.y) * f;
    view.k = nk;
    if (nk === 1) {
      view.x = 0;
      view.y = 0;
    }
    clampView();
    canvas.style.touchAction = view.k > 1 ? "none" : "pan-y";
    redraw();
  }
  function resetView() {
    view.k = 1;
    view.x = 0;
    view.y = 0;
    canvas.style.touchAction = "pan-y";
    redraw();
  }

  /* ---------- layout & drawing ---------- */

  function layout() {
    var rect = stage.getBoundingClientRect();
    W = Math.max(320, Math.round(rect.width));
    H = Math.max(260, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    land.width = canvas.width;
    land.height = canvas.height;

    var feedW = W > 760 ? 290 : 0;
    var padX = 16;
    var top = W > 760 ? 84 : 150;
    var bottom = 30;
    var areaW = W - feedW - padX * 2;
    var areaH = H - top - bottom;
    var minY = millerY(-56);
    var maxY = millerY(80);
    var s = Math.min(areaW / (2 * Math.PI), areaH / (maxY - minY));
    proj.s = s;
    proj.ox = padX + areaW / 2;
    proj.oy = top + areaH / 2 + ((maxY + minY) / 2) * s;
    proj.cx = proj.ox;
    proj.cy = top + areaH / 2;
    proj.halfW = Math.PI * s;
    proj.halfH = ((maxY - minY) / 2) * s;
    clampView();
    landDirty = true;
  }

  function tracePath(c, ring, shift) {
    c.beginPath();
    for (var j = 0; j < ring.pts.length; j++) {
      var p = project(ring.pts[j][0] + shift, ring.pts[j][1]);
      if (j === 0) c.moveTo(p[0], p[1]);
      else c.lineTo(p[0], p[1]);
    }
    c.closePath();
  }

  function drawLand() {
    var c = land.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.lineJoin = "round";

    var left = project(-180, 0)[0],
      right = project(180, 0)[0];
    c.save();
    c.beginPath();
    c.rect(left, 0, right - left, H);
    c.clip();

    // graticule
    c.strokeStyle = "rgba(160,200,255,0.09)";
    c.lineWidth = 1;
    var lon, lat, a, b;
    for (lon = -180; lon <= 180; lon += 30) {
      a = project(lon, 80);
      b = project(lon, -56);
      c.beginPath();
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
      c.stroke();
    }
    for (lat = -45; lat <= 75; lat += 30) {
      a = project(-180, lat);
      b = project(180, lat);
      c.beginPath();
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
      c.stroke();
    }

    c.lineWidth = 0.7;
    c.strokeStyle = "#5b8ff0";
    var special = [];
    countries.forEach(function (country) {
      var isSel = country.name === selected;
      var isHov = country.name === hovered;
      if (isSel || isHov) special.push(country);
      c.fillStyle = isSel ? "#2fa4ff" : isHov ? "#2a63d6" : "#1546b8";
      country.rings.forEach(function (ring) {
        var shifts = ring.wraps ? [0, -360] : [0];
        shifts.forEach(function (sh) {
          tracePath(c, ring, sh);
          c.fill();
          c.stroke();
        });
      });
    });
    // bright outline for selected / hovered on top of neighbours
    special.forEach(function (country) {
      c.strokeStyle = country.name === selected ? "#d6f1ff" : "#9cc4ff";
      c.lineWidth = country.name === selected ? 1.6 : 1.1;
      country.rings.forEach(function (ring) {
        var shifts = ring.wraps ? [0, -360] : [0];
        shifts.forEach(function (sh) {
          tracePath(c, ring, sh);
          c.stroke();
        });
      });
    });
    c.restore();
    landDirty = false;
  }

  function arcPoint(p0, cp, p1, t) {
    var u = 1 - t;
    return [
      u * u * p0[0] + 2 * u * t * cp[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * cp[1] + t * t * p1[1],
    ];
  }

  function drawFrame(now) {
    if (landDirty) drawLand();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(land, 0, 0, W, H);

    // home marker (Bangkok)
    var hp = project(HOME.lon, HOME.lat);
    var pulse = (now % 2400) / 2400;
    ctx.beginPath();
    ctx.arc(hp[0], hp[1], 3 + pulse * 14, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(111,180,255," + (0.55 * (1 - pulse)).toFixed(3) + ")";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hp[0], hp[1], 3.2, 0, Math.PI * 2);
    ctx.fillStyle = "#9cc8ff";
    ctx.fill();

    for (var i = attacks.length - 1; i >= 0; i--) {
      var k = attacks[i];
      var p = (now - k.born) / k.dur;
      if (p > 1.4) {
        attacks.splice(i, 1);
        continue;
      }
      var p0 = project(k.a.lon, k.a.lat);
      var p1 = project(k.b.lon, k.b.lat);
      var dx = p1[0] - p0[0],
        dy = p1[1] - p0[1];
      var dist = Math.sqrt(dx * dx + dy * dy);
      var cp = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - dist * 0.28];

      if (p >= 1 && !k.hit) {
        k.hit = true;
        ripples.push({
          x: p1[0],
          y: p1[1],
          born: now,
          color: k.color,
          label: k.b.city,
          lon: k.b.lon,
          lat: k.b.lat,
          dim: k.dim,
        });
      }
      var head = Math.min(p, 1);
      var tail = Math.max(0, p - 0.45);
      var fade = (p > 1 ? Math.max(0, 1 - (p - 1) / 0.4) : 1) * k.dim;
      var steps = 18;
      ctx.lineCap = "round";
      var prev = arcPoint(p0, cp, p1, tail);
      for (var s = 1; s <= steps; s++) {
        var t = tail + ((head - tail) * s) / steps;
        var pt = arcPoint(p0, cp, p1, t);
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(pt[0], pt[1]);
        ctx.strokeStyle = k.color;
        ctx.globalAlpha = (s / steps) * 0.9 * fade;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        prev = pt;
      }
      ctx.globalAlpha = 1;
      if (p < 1) {
        var hd = arcPoint(p0, cp, p1, head);
        ctx.globalAlpha = k.dim;
        ctx.beginPath();
        ctx.arc(hd[0], hd[1], 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = k.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    ctx.font = "600 10px 'IBM Plex Sans Thai', 'Manrope', system-ui, sans-serif";
    for (var r = ripples.length - 1; r >= 0; r--) {
      var rp = ripples[r];
      var age = (now - rp.born) / 1300;
      if (age >= 1) {
        ripples.splice(r, 1);
        continue;
      }
      var pos = project(rp.lon, rp.lat); // follows zoom/pan while it lasts
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 3 + age * 20, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color;
      ctx.globalAlpha = (1 - age) * 0.8 * rp.dim;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.globalAlpha = (1 - age * age) * rp.dim;
      ctx.fillStyle = "#dcebff";
      ctx.fillText(rp.label, pos[0] + 8, pos[1] - 8);
      ctx.globalAlpha = 1;
    }
  }

  function redraw() {
    landDirty = true;
    if (!running) drawFrame(reduceMotion ? staticNow : performance.now());
  }

  /* ---------- hit testing ---------- */

  function inRing(pts, x, y) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0],
        yi = pts[i][1],
        xj = pts[j][0],
        yj = pts[j][1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  }
  function hitCountry(sx, sy) {
    var ll = unproject(sx, sy);
    var lon = ll[0],
      lat = ll[1];
    if (lon < -180 || lon > 180 || lat < -60 || lat > 85) return null;
    var lx = lon < 0 ? lon + 360 : lon; // for rings unwrapped past 180°
    for (var i = 0; i < countries.length; i++) {
      var rings = countries[i].rings;
      for (var j = 0; j < rings.length; j++) {
        var rg = rings[j];
        var x = rg.wraps ? lx : lon;
        var b = rg.box;
        if (x < b[0] || x > b[2] || lat < b[1] || lat > b[3]) continue;
        if (inRing(rg.pts, x, lat)) return countries[i].name;
      }
    }
    return null;
  }

  /* ---------- simulation ---------- */

  function rand(n) {
    return Math.floor(Math.random() * n);
  }
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function fakeIp() {
    return TEST_NETS[rand(TEST_NETS.length)] + (1 + rand(253));
  }
  function statsFor(name) {
    if (!stats[name])
      stats[name] = {
        inn: 150 + rand(2200),
        out: 80 + rand(1500),
        types: {},
      };
    return stats[name];
  }
  function endpointFor(name) {
    var list = CITIES.filter(function (c) {
      return c.country === name;
    });
    if (list.length) return list[rand(list.length)];
    // no city there: use the middle of the country's largest ring
    var c = countryByName[name];
    if (!c) return CITIES[rand(CITIES.length)];
    var best = c.rings[0];
    c.rings.forEach(function (r) {
      var area = (r.box[2] - r.box[0]) * (r.box[3] - r.box[1]);
      var ba = (best.box[2] - best.box[0]) * (best.box[3] - best.box[1]);
      if (area > ba) best = r;
    });
    var lon = (best.box[0] + best.box[2]) / 2;
    if (lon > 180) lon -= 360;
    return { city: name, lat: (best.box[1] + best.box[3]) / 2, lon: lon, country: name };
  }
  function otherCity(notCountry) {
    var c;
    do c = CITIES[rand(CITIES.length)];
    while (c.country === notCountry);
    return c;
  }

  function spawn() {
    var from, to;
    if (selected && Math.random() < 0.5) {
      var mine = endpointFor(selected);
      var other = otherCity(selected);
      if (Math.random() < 0.55) {
        from = other;
        to = mine;
      } else {
        from = mine;
        to = other;
      }
    } else {
      from = CITIES[rand(CITIES.length)];
      to = Math.random() < 0.28 ? HOME : CITIES[rand(CITIES.length)];
      if (from.country === HOME.country && to === HOME) from = otherCity(HOME.country);
      if (to.country === from.country) to = otherCity(from.country);
    }
    var type = TYPES[rand(TYPES.length)];
    var now = new Date();
    var ev = {
      id: ++evId,
      type: type,
      from: from,
      to: to,
      ip: fakeIp(),
      time:
        pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds()),
    };
    events.unshift(ev);
    if (events.length > 150) events.pop();

    var involved = !selected || from.country === selected || to.country === selected;
    attacks.push({
      a: from,
      b: to,
      born: performance.now(),
      dur: 1500 + Math.random() * 1300,
      color: COLORS[type[1]],
      hit: false,
      dim: involved ? 1 : 0.2,
    });

    var sIn = statsFor(to.country);
    sIn.inn++;
    sIn.types[type[0]] = (sIn.types[type[0]] || 0) + 1;
    statsFor(from.country).out++;

    total += 1 + rand(3);
    if (countEl) countEl.textContent = total.toLocaleString("en-US");
    renderFeed(ev.id);
    if (selected) renderInfo();
  }

  /* ---------- feed + info panel ---------- */

  function renderFeed(newId) {
    if (!feedList) return;
    var shown = events
      .filter(function (e) {
        return !selected || e.from.country === selected || e.to.country === selected;
      })
      .slice(0, 14);
    while (feedList.firstChild) feedList.removeChild(feedList.firstChild);
    shown.forEach(function (e) {
      var li = document.createElement("li");
      li.className =
        "threat-item threat-" + e.type[1] + (e.id === newId ? " is-new" : "");
      var dot = document.createElement("i");
      var body = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = e.type[0];
      var route = document.createElement("span");
      route.textContent = e.from.city + " → " + e.to.city;
      var meta = document.createElement("span");
      meta.textContent = e.ip + " · " + e.time;
      body.appendChild(title);
      body.appendChild(route);
      body.appendChild(meta);
      li.appendChild(dot);
      li.appendChild(body);
      feedList.appendChild(li);
    });
    if (!shown.length) {
      var empty = document.createElement("li");
      empty.className = "threat-empty";
      empty.textContent = "กำลังรอเหตุการณ์ของประเทศนี้...";
      feedList.appendChild(empty);
    }
  }

  function renderInfo() {
    if (filterEl) {
      filterEl.hidden = !selected;
      filterEl.textContent = selected ? "แสดงเฉพาะ: " + selected : "";
    }
    if (!infoEl) return;
    infoEl.hidden = !selected;
    if (!selected) return;
    var st = statsFor(selected);
    var top = "—";
    var best = 0;
    Object.keys(st.types).forEach(function (t) {
      if (st.types[t] > best) {
        best = st.types[t];
        top = t;
      }
    });
    $("ti-name").textContent = selected;
    $("ti-in").textContent = st.inn.toLocaleString("en-US");
    $("ti-out").textContent = st.out.toLocaleString("en-US");
    $("ti-top").textContent = "พบมากสุด: " + top;
  }

  function select(name) {
    selected = name;
    attacks.forEach(function (k) {
      k.dim = !selected || k.a.country === selected || k.b.country === selected ? 1 : 0.2;
    });
    renderInfo();
    renderFeed(0);
    redraw();
  }

  /* ---------- pointer / keyboard interaction ---------- */

  function localPoint(e) {
    var r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function setHover(name, pt) {
    if (name !== hovered) {
      hovered = name;
      canvas.style.cursor = name ? "pointer" : view.k > 1 ? "grab" : "default";
      redraw();
    }
    if (!tipEl) return;
    if (name && pt) {
      tipEl.hidden = false;
      tipEl.textContent = name;
      var x = Math.min(pt[0] + 14, W - 180);
      tipEl.style.transform = "translate(" + x + "px," + (pt[1] + 14) + "px)";
    } else {
      tipEl.hidden = true;
    }
  }

  canvas.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    var pt = localPoint(e);
    pointer = { id: e.pointerId, sx: pt[0], sy: pt[1], px: pt[0], py: pt[1], moved: false };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
  });
  canvas.addEventListener("pointermove", function (e) {
    var pt = localPoint(e);
    lastMouse = pt;
    if (pointer && pointer.id === e.pointerId) {
      if (!pointer.moved && Math.hypot(pt[0] - pointer.sx, pt[1] - pointer.sy) > 4)
        pointer.moved = true;
      if (pointer.moved && view.k > 1) {
        view.x += pt[0] - pointer.px;
        view.y += pt[1] - pointer.py;
        clampView();
        canvas.style.cursor = "grabbing";
        setHover(null, null);
        redraw();
      }
      pointer.px = pt[0];
      pointer.py = pt[1];
      return;
    }
    if (e.pointerType === "mouse") setHover(hitCountry(pt[0], pt[1]), pt);
  });
  canvas.addEventListener("pointerup", function (e) {
    if (!pointer || pointer.id !== e.pointerId) return;
    var wasClick = !pointer.moved;
    var pt = localPoint(e);
    pointer = null;
    if (wasClick) {
      var name = hitCountry(pt[0], pt[1]);
      select(name && name !== selected ? name : null);
    }
    canvas.style.cursor = view.k > 1 ? "grab" : hovered ? "pointer" : "default";
  });
  canvas.addEventListener("pointercancel", function () {
    pointer = null;
  });
  canvas.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse") setHover(null, null);
  });
  canvas.addEventListener("dblclick", function (e) {
    var pt = localPoint(e);
    zoomAt(pt[0], pt[1], 1.8);
  });
  canvas.addEventListener(
    "wheel",
    function (e) {
      if (!(e.ctrlKey || e.metaKey)) return; // plain scroll keeps scrolling the page
      e.preventDefault();
      var pt = localPoint(e);
      zoomAt(pt[0], pt[1], e.deltaY < 0 ? 1.25 : 0.8);
    },
    { passive: false },
  );
  canvas.addEventListener("keydown", function (e) {
    var step = 40;
    if (e.key === "+" || e.key === "=") zoomAt(proj.cx, proj.cy, 1.4);
    else if (e.key === "-" || e.key === "_") zoomAt(proj.cx, proj.cy, 0.7);
    else if (e.key === "0") resetView();
    else if (e.key === "Escape") select(null);
    else if (view.k > 1 && e.key.indexOf("Arrow") === 0) {
      if (e.key === "ArrowLeft") view.x += step;
      if (e.key === "ArrowRight") view.x -= step;
      if (e.key === "ArrowUp") view.y += step;
      if (e.key === "ArrowDown") view.y -= step;
      clampView();
      redraw();
    } else return;
    e.preventDefault();
  });

  function onClick(id, fn) {
    var el = $(id);
    if (el) el.addEventListener("click", fn);
  }
  onClick("tm-zoom-in", function () {
    zoomAt(proj.cx, proj.cy, 1.5);
  });
  onClick("tm-zoom-out", function () {
    zoomAt(proj.cx, proj.cy, 1 / 1.5);
  });
  onClick("tm-reset", function () {
    resetView();
    select(null);
  });
  onClick("ti-clear", function () {
    select(null);
  });

  /* ---------- run loop ---------- */

  function loop(now) {
    if (!running) return;
    if (now >= nextSpawn) {
      spawn();
      nextSpawn = now + 450 + Math.random() * 750;
    }
    drawFrame(now);
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduceMotion) return;
    running = true;
    nextSpawn = 0;
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }
  function sync() {
    if (visible && !document.hidden && !stage.closest("[hidden]")) start();
    else stop();
  }

  layout();
  canvas.style.touchAction = "pan-y";
  if (countEl) countEl.textContent = total.toLocaleString("en-US");
  renderInfo();

  if (reduceMotion) {
    staticNow = performance.now();
    for (var n = 0; n < 7; n++) {
      spawn();
      attacks[attacks.length - 1].born = staticNow - 1500;
      attacks[attacks.length - 1].dur = 1200;
    }
    drawFrame(staticNow);
  } else {
    for (var m = 0; m < 6; m++) spawn(); // pre-fill feed
    sync();
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () {
      layout();
      if (!running) drawFrame(reduceMotion ? staticNow : performance.now());
    }).observe(stage);
  } else {
    window.addEventListener("resize", layout);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(stage);
  }
  document.addEventListener("visibilitychange", sync);
})();