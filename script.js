// ================= EDIT ME =================
// Everything you normally change lives in this block.

const SITE = {
  title: "CROCHET STUDIO",
  owner: "YOUR NAME",
  tagline: "WHERE EVERY LOOP BECOMES SOMETHING MORE.",
  about: "Crochet turns one simple strand into structure. Loop by loop, thread becomes texture, texture becomes form, and form becomes artwork you can hold. (Edit this text in script.js.)",
  process: "A hook, a strand, a patient hand. Each stitch is pulled through the one before it, quietly building something that did not exist a moment ago.",
};

const COLORS = {
  cream: "#f3ead9",
  beige: "#d9c7a8",
  brown: "#7a5a3e",
  terracotta: "#c8745a",
  dustyPink: "#d9a398",
  chocolate: "#3a261b",
  red: "#b9452f",
  orange: "#d9803f",
};

const AUDIO_CONFIG = {
  music: { src: "./assets/audio/ambient.mp3", volume: 0.22, loop: true },
  effects: {
    enter:      { src: "./assets/audio/enter.mp3",      volume: 0.30 },
    transition: { src: "./assets/audio/transition.mp3", volume: 0.22 },
    hover:      { src: "./assets/audio/hover.mp3",      volume: 0.15 },
    click:      { src: "./assets/audio/click.mp3",      volume: 0.25 },
  },
};

// ---- SELECTED WORK: copy a block, change the text, done. ----
// Empty array [] shows "NO PROJECTS YET". Set image to "./assets/images/yourfile.jpg" or null.
const selectedWork = [
  // >>> EXAMPLE ENTRY - DELETE OR REPLACE THIS BLOCK <<<
  {
    title: "Example Crochet Piece",
    category: "TEXTILE ART",
    description: "A handmade crochet artwork.",
    url: "https://example.com",
    status: "ONLINE",
    featured: true,
    image: null,
    year: "2026",
  },
  // >>> END EXAMPLE <<<
];

// ---- WEBSITE DIRECTORY ----
const websites = [
  // >>> EXAMPLE ENTRY - DELETE OR REPLACE THIS BLOCK <<<
  {
    name: "My Website",
    description: "My website description.",
    url: "https://example.com",
    status: "LIVE",
    button: "VISIT WEBSITE",
  },
  // >>> END EXAMPLE <<<
];

// ---- SOCIALS: leave "" to hide. github below is only a placeholder - replace or clear it. ----
const SOCIALS = {
  github: "https://github.com/example",
  instagram: "",
  discord: "",
};

// =============== END EDIT ME ===============

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const GSAP_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
const ST_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";

const $ = (s, r = document) => r.querySelector(s);
const isMobile = matchMedia("(max-width: 820px)").matches || matchMedia("(pointer: coarse)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => {
  try { const x = new URL(u, location.href); return ["http:", "https:", "mailto:"].includes(x.protocol) ? x.href : "#"; }
  catch { return "#"; }
};
const state = { target: 0, entered: false };

/* ============================== AUDIO ============================== */
const Sfx = (() => {
  const TAG = "[CROCHET AUDIO]";
  const warned = new Set();
  let unlocked = false, enabled = true, music = null, fadeTimer = 0, lastAny = 0;
  const fx = {}, last = {};
  try { enabled = localStorage.getItem("crochet-sound") !== "off"; } catch (e) { /* storage blocked */ }

  const warnOnce = (key, ...a) => { if (!warned.has(key)) { warned.add(key); console.warn(TAG, ...a); } };
  const make = (cfg, name, loop) => {
    try {
      const a = new Audio();
      a.preload = "none"; a.loop = !!loop; a.volume = cfg.volume ?? 0.2;
      a.addEventListener("error", () => { a.dataset.missing = "1"; warnOnce(name, `Missing or unplayable file for "${name}": ${cfg.src}. The site continues without it.`); });
      a.src = cfg.src;
      return a;
    } catch (e) { warnOnce(name, "Could not create audio for", name, e); return null; }
  };
  const safePlay = (a, name) => {
    if (!a || a.dataset.missing) return;
    try { const p = a.play(); if (p && p.catch) p.catch((e) => warnOnce("p" + name, `Playback blocked/failed for "${name}":`, e && e.message)); }
    catch (e) { warnOnce("p" + name, "Playback error", e); }
  };
  const fadeTo = (a, vol, ms = 1800) => {
    clearInterval(fadeTimer);
    if (!a) return;
    const from = a.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, from + (vol - from) * k));
      if (k >= 1) { clearInterval(fadeTimer); if (vol === 0) a.pause(); }
    }, 60);
  };
  const updateButton = () => {
    const b = $("#sound-toggle"); if (!b) return;
    b.textContent = enabled ? "SOUND ON" : "SOUND OFF";
    b.setAttribute("aria-pressed", String(enabled));
  };
  return {
    updateButton,
    get enabled() { return enabled; },
    unlock() {
      if (unlocked) return; unlocked = true;
      const m = AUDIO_CONFIG.music;
      if (m && m.src) { music = make(m, "music", m.loop); }
      for (const [name, cfg] of Object.entries(AUDIO_CONFIG.effects || {})) fx[name] = make(cfg, name, false);
      if (enabled && music) { const target = music.volume; music.volume = 0; safePlay(music, "music"); fadeTo(music, target); }
    },
    play(name) {
      if (!enabled || !unlocked) return;
      const a = fx[name]; if (!a) return;
      const now = performance.now();
      if (now - lastAny < 70) return;
      if (now - (last[name] || 0) < (name === "hover" ? 450 : 180)) return;
      last[name] = lastAny = now;
      try { a.currentTime = 0; } catch (e) { /* not seekable yet */ }
      safePlay(a, name);
    },
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem("crochet-sound", enabled ? "on" : "off"); } catch (e) { /* ignore */ }
      if (unlocked && music) {
        if (enabled) { const t = AUDIO_CONFIG.music.volume ?? 0.22; music.volume = 0; safePlay(music, "music"); fadeTo(music, t, 900); }
        else fadeTo(music, 0, 500);
      }
      updateButton();
    },
  };
})();

/* ============================ PAGE CONTENT ============================ */
function applyTheme() {
  const map = { cream: "--cream", beige: "--beige", brown: "--brown", terracotta: "--terra", dustyPink: "--pink", chocolate: "--choc", red: "--red", orange: "--orange" };
  for (const [k, v] of Object.entries(map)) if (COLORS[k]) document.documentElement.style.setProperty(v, COLORS[k]);
  document.title = SITE.title;
  $("#site-title").textContent = SITE.title;
  $("#tagline").textContent = SITE.tagline;
  $("#about-text").textContent = SITE.about;
  $("#process-text").textContent = SITE.process;
  $("#gate-owner").textContent = SITE.owner;
  $("#footer").textContent = `\u00A9 ${new Date().getFullYear()} ${SITE.owner}`;
}

function renderWork() {
  const grid = $("#work-grid");
  grid.innerHTML = "";
  const list = Array.isArray(selectedWork) ? selectedWork.filter((w) => w && typeof w === "object") : [];
  if (!list.length) { grid.innerHTML = '<p class="empty">NO PROJECTS YET</p>'; return; }
  [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).forEach((w, i) => {
    const art = document.createElement("article");
    art.className = "card";
    art.dataset.featured = String(!!w.featured);
    art.style.setProperty("--d", `${-i * 1.3}s`);
    const media = w.image ? `<img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy" decoding="async" onerror="this.remove()">` : "";
    const link = w.url ? `<a class="btn" href="${esc(safeUrl(w.url))}" target="_blank" rel="noopener noreferrer" aria-label="Visit project: ${esc(w.title)}">VISIT PROJECT</a>` : "";
    art.innerHTML = `<div class="card-inner">
      <div class="card-media">${media}${w.status ? `<span class="tag">${esc(w.status)}</span>` : ""}${w.featured ? '<span class="tag feat">FEATURED</span>' : ""}</div>
      <div class="card-body"><p class="cat">${esc(w.category)}${w.year ? ` / ${esc(w.year)}` : ""}</p>
      <h3>${esc(w.title)}</h3><p class="desc">${esc(w.description)}</p>${link}</div></div>`;
    const inner = art.firstElementChild;
    if (!reduceMotion) {
      art.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = art.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty("--ry", `${x * 16}deg`);
        inner.style.setProperty("--rx", `${-y * 16}deg`);
      });
      art.addEventListener("pointerleave", () => { inner.style.setProperty("--ry", "0deg"); inner.style.setProperty("--rx", "0deg"); });
    }
    art.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") Sfx.play("hover"); });
    grid.appendChild(art);
  });
}

function renderSites() {
  const ul = $("#site-list");
  ul.innerHTML = "";
  const list = Array.isArray(websites) ? websites.filter((w) => w && typeof w === "object") : [];
  if (!list.length) { ul.innerHTML = '<li class="empty">NO WEBSITES YET</li>'; return; }
  for (const w of list) {
    const li = document.createElement("li");
    li.innerHTML = `<h3>${esc(w.name)}</h3><p>${esc(w.description)}</p>
      ${w.url ? `<a class="btn" href="${esc(safeUrl(w.url))}" target="_blank" rel="noopener noreferrer">${esc(w.button || "VISIT WEBSITE")}</a>` : ""}
      ${w.status ? `<span class="site-status"> ${esc(w.status)}</span>` : ""}`;
    ul.appendChild(li);
  }
}

function renderSocials() {
  const ul = $("#socials");
  ul.innerHTML = "";
  for (const [name, url] of Object.entries(SOCIALS || {})) {
    if (typeof url !== "string" || !url.trim()) continue;
    const li = document.createElement("li");
    li.innerHTML = `<a class="btn" href="${esc(safeUrl(url.trim()))}" target="_blank" rel="noopener noreferrer">${esc(name.toUpperCase())}</a>`;
    ul.appendChild(li);
  }
}

/* ============================ SCROLL STATE ============================ */
const SECTION_STARTS = [0, 0.1, 0.28, 0.46, 0.66, 0.84];
const panels = [...document.querySelectorAll(".panel")];
let currentSection = -1;

function onProgress(p) {
  p = Math.max(0, Math.min(1, p));
  state.target = p;
  $("#progress-bar").style.width = `${p * 100}%`;
  $("#scroll-hint").classList.toggle("gone", p > 0.03);
  let s = 0;
  SECTION_STARTS.forEach((v, i) => { if (p >= v) s = i; });
  if (s !== currentSection) {
    if (currentSection !== -1) Sfx.play("transition");
    currentSection = s;
    panels.forEach((el) => {
      const on = Number(el.dataset.sec) === s;
      el.classList.toggle("on", on);
      el.inert = !on;
      el.setAttribute("aria-hidden", String(!on));
    });
  }
}

function setupScroll(gsap, ST) {
  const raw = () => { const max = document.documentElement.scrollHeight - innerHeight; return max > 0 ? scrollY / max : 0; };
  if (gsap && ST) {
    ST.create({ trigger: "#scroller", start: "top top", end: "bottom bottom", onUpdate: (self) => onProgress(self.progress) });
  } else {
    addEventListener("scroll", () => onProgress(raw()), { passive: true });
  }
  onProgress(raw());
}

function setupEnter(gsap, ST) {
  const gate = $("#gate");
  const enter = () => {
    if (state.entered) return;
    state.entered = true;
    document.documentElement.classList.remove("locked");
    Sfx.unlock();
    Sfx.play("enter");
    if (ST) ST.refresh();
    if (gsap) gsap.to(gate, { opacity: 0, duration: 1.1, ease: "power2.out", onComplete: () => gate.remove() });
    else gate.remove();
    if (gsap && !reduceMotion) gsap.from('.panel[data-sec="0"] .display, .panel[data-sec="0"] .lede', { y: 40, opacity: 0, duration: 1.6, delay: 0.5, stagger: 0.2, ease: "power3.out" });
  };
  $("#enter-btn").addEventListener("click", enter);
  addEventListener("keydown", enter, { once: true });
  addEventListener("pointerdown", enter, { once: true });
}

/* ================================ 3D ================================ */
async function startScene() {
  const THREE = await import(THREE_URL);
  const canvas = $("#scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const cream = new THREE.Color(COLORS.cream);
  const scene = new THREE.Scene();
  scene.background = cream;
  scene.fog = new THREE.Fog(cream, 16, isMobile ? 52 : 72);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);

  const PAL = [COLORS.terracotta, COLORS.dustyPink, COLORS.beige, COLORS.brown, COLORS.red, COLORS.orange, COLORS.cream];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const smooth = (x) => x * x * (3 - 2 * x);

  /* ---------- procedural textures & materials ---------- */
  const cv = (s) => { const c = document.createElement("canvas"); c.width = c.height = s; return c; };
  const finishTex = (c, color) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = isMobile ? 2 : 4;
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const texCache = new Map();
  function yarnTexture(hex, bump) {
    const key = `y${hex}${bump}`; if (texCache.has(key)) return texCache.get(key);
    const s = 256, c = cv(s), g = c.getContext("2d");
    g.fillStyle = bump ? "#808080" : hex; g.fillRect(0, 0, s, s); g.lineCap = "round";
    for (let i = 0; i < 520; i++) {
      const x = rnd(0, s), y = rnd(0, s), len = rnd(10, 30), a = rnd(-1.1, -0.6), light = Math.random() > 0.5;
      g.strokeStyle = bump ? (light ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.45)") : (light ? "rgba(255,248,235,.17)" : "rgba(40,20,10,.17)");
      g.lineWidth = rnd(1.5, 3.5);
      for (const ox of [0, -s]) for (const oy of [0, -s]) {
        g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + Math.cos(a) * len + ox, y + Math.sin(a) * len + oy); g.stroke();
      }
    }
    const t = finishTex(c, !bump); texCache.set(key, t); return t;
  }
  function knitTexture(hex, bump) {
    const key = `k${hex}${bump}`; if (texCache.has(key)) return texCache.get(key);
    const s = 256, n = 16, w = s / n, c = cv(s), g = c.getContext("2d");
    g.fillStyle = bump ? "#303030" : hex; g.fillRect(0, 0, s, s); g.lineCap = "round"; g.lineJoin = "round";
    const V = (x, y, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w / 2, y + w); g.lineTo(x + w, y); g.stroke(); };
    for (let r = -1; r < n; r++) for (let q = 0; q < n; q++) {
      const x = q * w, y = r * w;
      if (bump) V(x, y, "#fff", w * 0.3);
      else { V(x, y + 2, "rgba(40,20,10,.35)", w * 0.34); V(x, y, hex, w * 0.3); V(x, y - 1, "rgba(255,248,235,.22)", w * 0.1); }
    }
    const t = finishTex(c, !bump); texCache.set(key, t); return t;
  }
  const matCache = new Map();
  function yarnMat(hex, { knit = false, rep = [2, 2], bumpScale = 1.8 } = {}) {
    const key = `${hex}|${knit}|${rep}`; if (matCache.has(key)) return matCache.get(key);
    const src = knit ? knitTexture : yarnTexture;
    const map = src(hex, false).clone(), bm = src(hex, true).clone();
    for (const t of [map, bm]) { t.repeat.set(rep[0], rep[1]); t.needsUpdate = true; }
    const m = new THREE.MeshStandardMaterial({ map, bumpMap: bm, bumpScale, roughness: 0.96, metalness: 0 });
    matCache.set(key, m); return m;
  }
  const hookMat = new THREE.MeshStandardMaterial({ color: COLORS.terracotta, roughness: 0.42, metalness: 0.35 });
  const woodMat = new THREE.MeshStandardMaterial({ color: COLORS.brown, roughness: 0.8 });
  const shade = (o) => { if (!isMobile) o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };
  const seg = isMobile ? 20 : 40;

  /* ---------- object builders ---------- */
  function tube(curve, rad, segs) { return new THREE.TubeGeometry(curve, segs ?? (isMobile ? 32 : 56), rad, 5, false); }

  function makeBall(r, hex) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 0.985, seg, seg), yarnMat(hex, { rep: [3, 3] })));
    const wraps = isMobile ? 5 : 9;
    for (let i = 0; i < wraps; i++) {
      const pts = [], ph = rnd(0, 6.28), turns = rnd(2, 3.4);
      const eul = new THREE.Euler(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28));
      for (let k = 0; k <= 70; k++) {
        const t = k / 70, a = t * Math.PI * 2 * turns;
        pts.push(new THREE.Vector3(Math.cos(a), Math.sin(t * Math.PI * 5 + ph) * 0.65, Math.sin(a)).normalize().multiplyScalar(r * 1.005).applyEuler(eul));
      }
      const tint = i % 3 === 0 ? hex : PAL[(i + 2) % PAL.length];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, r * 0.04, 5, false), yarnMat(tint, { rep: [10, 1] })));
    }
    return shade(g);
  }
  function makeHook(len = 3) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 12), hookMat); g.add(shaft);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, len * 0.38, 14), woodMat); handle.position.y = -len * 0.32; g.add(handle);
    const tip = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 14, Math.PI * 1.35), hookMat); tip.position.set(0.05, len / 2, 0); tip.rotation.z = -0.3; g.add(tip);
    return shade(g);
  }
  function makeFlower(hex, petals = 8) {
    const g = new THREE.Group(), pm = yarnMat(hex, { rep: [1, 1] });
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2, p = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), pm);
      p.scale.set(1, 1.5, 0.55); p.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0); p.rotation.z = a - Math.PI / 2; g.add(p);
    }
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.1, 10, 20), yarnMat(COLORS.orange, { rep: [4, 1] })); c.position.z = 0.1; g.add(c);
    return shade(g);
  }
  function makeSpool(hex) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.9, 20), yarnMat(hex, { rep: [3, 2] })));
    for (const y of [-0.5, 0.5]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.09, 24), woodMat); f.position.y = y; g.add(f); }
    return shade(g);
  }
  function makeCoaster(r, cols) {
    const g = new THREE.Group(), rings = Math.max(3, Math.round(r / 0.38));
    for (let i = 0; i < rings; i++) {
      const rr = (i + 0.6) * (r / rings), t = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.15, 8, Math.max(18, Math.round(rr * 18))), yarnMat(cols[i % cols.length], { rep: [Math.max(4, Math.round(rr * 5)), 1] }));
      t.rotation.x = Math.PI / 2; t.scale.z = 0.7; g.add(t);
    }
    return shade(g);
  }
  function makePanel(w, h, hex, border) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), yarnMat(hex, { knit: true, rep: [Math.round(w * 2), Math.round(h * 2)], bumpScale: 2.4 })));
    const bm = yarnMat(border, { rep: [8, 1] }), r = 0.1;
    [[0, h / 2, w, true], [0, -h / 2, w, true], [-w / 2, 0, h, false], [w / 2, 0, h, false]].forEach(([x, y, l, horiz]) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l + r * 2, 10), bm); c.position.set(x, y, 0.02); if (horiz) c.rotation.z = Math.PI / 2; g.add(c);
    });
    return shade(g);
  }

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0xfff0dc, 0.28));
  const hemi = new THREE.HemisphereLight(0xfff1dc, 0xc9a98a, 1.0); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe0b8, 2.3);
  key.castShadow = !isMobile;
  if (!isMobile) { key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; }
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffc7a8, 1.2); scene.add(rim, rim.target);
  const glow1 = new THREE.PointLight(0xd9683f, 70, 28, 2), glow2 = new THREE.PointLight(0xe8a07a, 50, 26, 2);
  scene.add(glow1, glow2);
  const warm = new THREE.Color(0xffe0b8), rosy = new THREE.Color(0xffc2ae);

  /* ---------- room ---------- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), yarnMat(COLORS.beige, { knit: true, rep: [90, 90], bumpScale: 2 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -50; floor.receiveShadow = !isMobile; scene.add(floor);
  for (const sx of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(170, 18), yarnMat(sx < 0 ? COLORS.dustyPink : COLORS.beige, { knit: true, rep: [60, 6], bumpScale: 2 }));
    wall.position.set(sx * 26, 9, -50); wall.rotation.y = -sx * Math.PI / 2; wall.material.side = THREE.DoubleSide; scene.add(wall);
  }

  /* ---------- placed objects ---------- */
  const floaters = [];
  function place(obj, pos, o = {}) {
    obj.position.set(...pos);
    obj.userData.f = { y: pos[1], amp: o.amp ?? 0.25, sp: o.sp ?? 1, ph: Math.random() * 6.28, rot: o.rot ?? 0.15 };
    scene.add(obj); floaters.push(obj); return obj;
  }
  const rug1 = makeCoaster(7, [COLORS.terracotta, COLORS.cream, COLORS.dustyPink, COLORS.brown]); rug1.position.set(0, 0.12, -9); scene.add(rug1);
  const rug2 = makeCoaster(8, [COLORS.dustyPink, COLORS.cream, COLORS.terracotta, COLORS.beige]); rug2.position.set(0, 0.12, -57); scene.add(rug2);

  const heroBall = place(makeBall(1.7, COLORS.terracotta), [0, 1.9, -6], { amp: 0.18, rot: 0.12 });
  // about
  place(makeFlower(COLORS.dustyPink), [-4, 2.2, -15], { rot: 0.25 }).scale.setScalar(1.3);
  place(makeSpool(COLORS.cream), [5, 2.5, -18]);
  place(makeBall(0.75, COLORS.beige), [3.6, 3.3, -9]);
  const hookAbout = place(makeHook(3.2), [-3.2, 3.4, -9]); hookAbout.rotation.z = 0.9;
  place(makeFlower(COLORS.red, 6), [-2, 1.5, -12], { rot: -0.3 });
  place(makeCoaster(1.2, [COLORS.orange, COLORS.cream]), [2.4, 1.6, -13]).rotation.x = 0.6;

  // process
  const piece = new THREE.Group(); piece.position.set(4, 0.1, -34);
  const rows = 11;
  for (let i = 0; i < rows; i++) {
    const r = 0.8 + 0.4 * Math.sin(i * 0.4) - (i > 8 ? 0.06 * (i - 8) : 0), full = i < rows - 1;
    const row = new THREE.Mesh(new THREE.TorusGeometry(r, 0.1, 8, isMobile ? 28 : 44, full ? Math.PI * 2 : Math.PI * 1.35), yarnMat(i % 2 ? COLORS.dustyPink : COLORS.terracotta, { rep: [Math.round(r * 9), 1] }));
    row.rotation.x = Math.PI / 2; row.position.y = 0.1 + i * 0.17; piece.add(row);
  }
  scene.add(shade(piece));
  const procBall = place(makeBall(1.1, COLORS.brown), [7.3, 1.2, -32], { amp: 0.08 });
  const procHook = makeHook(3); procHook.position.set(4.7, 2.2, -33.3); procHook.rotation.z = -0.9; scene.add(procHook);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.045, 8, 16), yarnMat(COLORS.orange, { rep: [3, 1] })); scene.add(loop);

  // gallery
  const gp = [
    [-7.5, 3.2, -53, 0.55, COLORS.terracotta, COLORS.cream], [7.5, 3.2, -53, -0.55, COLORS.dustyPink, COLORS.terracotta],
    [0, 4.2, -66, 0, COLORS.cream, COLORS.brown], [-10, 2.2, -62, 0.7, COLORS.beige, COLORS.red], [10, 2.2, -62, -0.7, COLORS.orange, COLORS.cream],
  ];
  const galleryPanels = gp.map(([x, y, z, ry, c, b]) => { const p = makePanel(4.6, 3.2, c, b); p.rotation.y = ry; p.userData.ry = ry; place(p, [x, y, z], { amp: 0.15, rot: 0 }); return p; });

  // collection orbiters
  const orbiters = [];
  const maker = [() => makeBall(rnd(0.5, 0.9), PAL[Math.floor(rnd(0, 6))]), () => makeFlower(PAL[Math.floor(rnd(0, 6))]), () => makeSpool(PAL[Math.floor(rnd(0, 6))]), () => makeHook(2.4), () => makeCoaster(1, [COLORS.terracotta, COLORS.cream])];
  const nOrb = isMobile ? 7 : 11;
  for (let i = 0; i < nOrb; i++) {
    const o = maker[i % maker.length](); scene.add(o);
    orbiters.push({ o, a: (i / nOrb) * 6.28, rad: rnd(3.2, 7.5), y: rnd(1.2, 5), sp: rnd(0.05, 0.14) * (i % 2 ? 1 : -1), ph: Math.random() * 6 });
  }

  // final sculpture (instanced stitches)
  const sculpt = new THREE.Group(); sculpt.position.set(0, 3.4, -100);
  const R = 3.2, N = isMobile ? 140 : 320;
  sculpt.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.94, 32, 24), yarnMat(COLORS.dustyPink, { rep: [4, 4] })));
  const inst = new THREE.InstancedMesh(new THREE.TorusGeometry(0.34, 0.1, 6, 10), yarnMat("#ffffff", { rep: [1, 1] }), N);
  const d = new THREE.Object3D(), tmp = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
    d.position.set(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
    d.lookAt(d.position.clone().multiplyScalar(2)); d.rotateZ(rnd(0, 6.28)); d.scale.setScalar(rnd(0.85, 1.2)); d.updateMatrix();
    inst.setMatrixAt(i, d.matrix); inst.setColorAt(i, tmp.set(PAL[i % PAL.length]));
  }
  inst.instanceMatrix.needsUpdate = true; inst.instanceColor.needsUpdate = true;
  inst.castShadow = !isMobile; sculpt.add(inst); scene.add(sculpt);

  /* ---------- animated yarn strands ---------- */
  const DEFS = [
    { pts: [[0, 1.9, -6], [3, 3.5, -9], [-2, 2.5, -12], [-4, 2.2, -15]] },
    { pts: [[0, 1.9, -6], [-3, 3, -9], [2, 4, -14], [5, 2.5, -18]] },
    { pts: [[5, 2.5, -18], [2, 1.5, -22], [-1, 3, -26], [3, 2, -31], [4.4, 2.1, -33.4]] },
    { pts: [[7.3, 1.2, -32], [6, 2.8, -32.8], [5.2, 2.4, -33.3], [4.7, 2.6, -33.3]], amp: 0.1, loop: true },
    { pts: [[-8, 4, -40], [-4, 3, -46], [-6, 2, -50], [-7.5, 3.2, -53]] },
    { pts: [[7.5, 3.2, -53], [4, 4.5, -58], [-2, 4, -62], [-7.5, 3.2, -53]] },
    { pts: [[0, 4.2, -66], [3, 4, -70], [-3, 3, -73], [0, 3, -76]] },
    { pts: [[0, 3, -76], [-4, 4, -82], [3, 5, -88], [0, 3.4, -97]] },
    { pts: [[6, 2, -70], [2, 5, -75], [-5, 3, -78], [-6, 2, -72]] },
  ];
  const strands = DEFS.map((def, i) => {
    const base = def.pts.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(base.map((v) => v.clone()), false, "catmullrom", 0.5);
    const rad = def.loop ? 0.045 : 0.055;
    const mesh = new THREE.Mesh(tube(curve, rad), yarnMat(PAL[i % 6], { rep: [14, 1] })); mesh.castShadow = !isMobile; scene.add(mesh);
    return { base, curve, mesh, rad, ph: Math.random() * 6, amp: def.amp ?? 0.4, z: base[0].z, loop: !!def.loop };
  });
  const strandStep = isMobile ? 3 : 2;
  function updateStrands(t, camZ) {
    for (const s of strands) {
      if (Math.abs(s.z - camZ) > 48) continue;
      const pts = s.curve.points;
      for (let i = 1; i < pts.length - 1; i++) {
        const b = s.base[i];
        pts[i].set(b.x + Math.sin(t * 0.55 + s.ph + i * 1.3) * s.amp, b.y + Math.cos(t * 0.45 + s.ph + i) * s.amp * 0.7, b.z + Math.sin(t * 0.4 + s.ph * 2 + i) * s.amp * 0.6);
      }
      s.curve.needsUpdate = true;
      const old = s.mesh.geometry; s.mesh.geometry = tube(s.curve, s.rad); old.dispose();
    }
  }

  /* ---------- particles ---------- */
  const PN = isMobile ? 280 : 900;
  const pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pVel = new Float32Array(PN * 3);
  const pc = new THREE.Color(), pals = [COLORS.cream, COLORS.beige, COLORS.brown, COLORS.terracotta, COLORS.cream];
  for (let i = 0; i < PN; i++) {
    pPos.set([rnd(-18, 18), rnd(0, 10), rnd(14, -112)], i * 3);
    pVel.set([rnd(-0.08, 0.08), rnd(-0.03, 0.06), rnd(-0.06, 0.06)], i * 3);
    pc.set(pals[i % pals.length]); pCol.set([pc.r, pc.g, pc.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: isMobile ? 0.1 : 0.075, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false })));

  /* ---------- camera path ---------- */
  const KEYS = [
    { t: 0,    p: [0, 2, 8],        l: [0, 1.8, -6] },
    { t: 0.15, p: [6.5, 3, -3],     l: [0, 2, -9] },
    { t: 0.25, p: [-5.5, 2.6, -12], l: [0, 1.9, -9] },
    { t: 0.35, p: [-3.5, 2.5, -25], l: [4, 1.7, -33] },
    { t: 0.55, p: [0, 2.9, -46],    l: [0, 2.8, -60] },
    { t: 0.75, p: [4, 3.2, -67],    l: [0, 2.6, -75] },
    { t: 0.9,  p: [-4, 3.5, -90],   l: [0, 3.3, -100] },
    { t: 1,    p: [2.5, 5, -79],    l: [0, 3.3, -100] },
  ];
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.p)), false, "catmullrom", 0.5);
  const lookCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.l)), false, "catmullrom", 0.5);
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  function keyIndex(p) {
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (p <= KEYS[i + 1].t) {
        let l = (p - KEYS[i].t) / (KEYS[i + 1].t - KEYS[i].t);
        l = smooth(l) * 0.4 + l * 0.6; // lingers near each key, accelerates between them
        return (i + l) / (KEYS.length - 1);
      }
    }
    return 1;
  }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { pointer.x = (e.clientX / innerWidth - 0.5) * 2; pointer.y = -(e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  function resize() {
    const w = innerWidth, h = innerHeight, a = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = a; camera.fov = a < 1 ? 62 : 45; camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  /* ---------- loop ---------- */
  const loopCurveTmp = new THREE.Vector3(), tan = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
  let cur = 0, t = 0, frame = 0, last = performance.now(), raf = 0;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; frame++;
    cur += (state.target - cur) * (1 - Math.exp(-dt * (reduceMotion ? 10 : 3.2)));

    const u = keyIndex(cur);
    posCurve.getPoint(u, camPos); lookCurve.getPoint(u, camLook);
    if (!reduceMotion && !isMobile) {
      pointer.sx += (pointer.x - pointer.sx) * 0.05; pointer.sy += (pointer.y - pointer.sy) * 0.05;
      camPos.x += Math.sin(t * 0.35) * 0.12; camPos.y += Math.cos(t * 0.28) * 0.08;
      camLook.x += pointer.sx * 0.9; camLook.y += pointer.sy * 0.5;
    }
    camera.position.copy(camPos); camera.lookAt(camLook);
    if (!reduceMotion && !isMobile) camera.rotateZ(Math.sin(cur * Math.PI * 4) * 0.03);

    // lighting follows the camera and shifts mood from warm studio to rosy finale
    const mood = smooth(Math.min(1, Math.max(0, (cur - 0.55) / 0.45)));
    key.color.copy(warm).lerp(rosy, mood); hemi.intensity = 1.0 - mood * 0.25;
    key.target.position.set(camPos.x, 0, camPos.z - 10); key.position.set(camPos.x + 9, 15, camPos.z + 4);
    rim.target.position.copy(key.target.position); rim.position.set(camPos.x - 8, 9, camPos.z - 24);
    glow1.position.set(camPos.x + 3, 2.5, camPos.z - 5); glow2.position.set(camPos.x - 4, 4, camPos.z - 14);

    if (!reduceMotion) {
      for (const o of floaters) { const f = o.userData.f; o.position.y = f.y + Math.sin(t * f.sp + f.ph) * f.amp; o.rotation.y += f.rot * dt; }
      for (const p of galleryPanels) p.rotation.y = p.userData.ry + pointer.sx * 0.12;
      for (const b of orbiters) {
        b.a += b.sp * dt; b.o.position.set(Math.cos(b.a) * b.rad, b.y + Math.sin(t * 0.7 + b.ph) * 0.3, -74 + Math.sin(b.a) * b.rad * 0.8);
        b.o.rotation.y += dt * 0.3; b.o.rotation.x += dt * 0.1;
      }
      sculpt.rotation.y += dt * 0.12;
      procHook.rotation.z = -0.9 + Math.sin(t * 1.6) * 0.1; procHook.position.y = 2.2 + Math.sin(t * 3.2) * 0.04;
      if (frame % strandStep === 0) updateStrands(t, camPos.z);
      if (frame % (isMobile ? 2 : 1) === 0) {
        for (let i = 0; i < PN; i++) {
          const k = i * 3; pPos[k] += pVel[k] * dt * 2; pPos[k + 1] += pVel[k + 1] * dt * 2; pPos[k + 2] += pVel[k + 2] * dt * 2;
          if (pPos[k + 1] > 10) pPos[k + 1] = 0; else if (pPos[k + 1] < 0) pPos[k + 1] = 10;
          if (pPos[k] > 18 || pPos[k] < -18) pVel[k] *= -1;
        }
        pGeo.attributes.position.needsUpdate = true;
      }
    }
    // yarn pulled through a loop on the process strand
    const ps = strands.find((s) => s.loop);
    if (ps) {
      const lu = reduceMotion ? 0.6 : (t * 0.14) % 1;
      ps.curve.getPoint(lu, loopCurveTmp); ps.curve.getTangent(lu, tan);
      loop.position.copy(loopCurveTmp); loop.quaternion.setFromUnitVectors(up, tan);
      loop.scale.setScalar(0.8 + Math.sin(lu * Math.PI) * 0.7);
    }
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); $("#fallback").hidden = false; });
}

/* ================================ BOOT ================================ */
(async function main() {
  applyTheme();
  renderWork();
  renderSites();
  renderSocials();
  Sfx.updateButton();
  $("#sound-toggle").addEventListener("click", () => Sfx.toggle());
  document.addEventListener("click", (e) => { const b = e.target.closest("a.btn, button"); if (b && !b.dataset.silent && b.id !== "sound-toggle") Sfx.play("click"); });

  let gsap = null, ST = null;
  try {
    const [g, s] = await Promise.all([import(GSAP_URL), import(ST_URL)]);
    gsap = g.gsap || g.default; ST = s.ScrollTrigger || s.default;
    gsap.registerPlugin(ST);
  } catch (e) { console.warn("GSAP failed to load, using plain scroll listener.", e); gsap = ST = null; }

  setupScroll(gsap, ST);
  setupEnter(gsap, ST);

  try { await startScene(); }
  catch (e) { console.error("3D scene failed:", e); $("#fallback").hidden = false; }
})();
