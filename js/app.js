"use strict";

(async () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const allFonts = window.KHATPLAY_FONT_CONFIG.slots;
  const fonts = allFonts.filter(font => font.enabled);
  const pending = window.KHATPLAY_FONT_CONFIG.pendingLicense;
  const byId = new Map(allFonts.map(font => [font.id, font]));
  const LEGACY_STORAGE_KEY = "khatplay:design:v1";
  const STORAGE_KEY = "khatplay:design:v2";
  const THEME_KEY = "khatplay:theme:v1";
  const sizes = {
    square: { name: "پست مربعی", width: 1080, height: 1080, safeTop: 0, safeBottom: 0 },
    portrait: { name: "پست عمودی", width: 1080, height: 1350, safeTop: 0, safeBottom: 0 },
    story: { name: "استوری اینستاگرام", width: 1080, height: 1920, safeTop: 250, safeBottom: 340 },
    telegram: { name: "استوری تلگرام", width: 1080, height: 1920, safeTop: 180, safeBottom: 200 },
    threads: { name: "Threads", width: 1080, height: 1350, safeTop: 0, safeBottom: 0 },
    whatsapp: { name: "استاتوس واتساپ", width: 1080, height: 1920, safeTop: 210, safeBottom: 280 }
  };
  const backgrounds = [
    { name: "دریا", mode: "gradient", a: "#153b3a", b: "#208c7b" },
    { name: "مرجان", mode: "gradient", a: "#632c3b", b: "#e36e58" },
    { name: "آفتاب", mode: "gradient", a: "#e4a331", b: "#f2d66a" },
    { name: "شب", mode: "gradient", a: "#182638", b: "#394c6b" },
    { name: "یاس", mode: "gradient", a: "#f2e9dc", b: "#d9b59c" },
    { name: "جنگل", mode: "gradient", a: "#174c3d", b: "#9dc66d" },
    { name: "قرمز", mode: "solid", a: "#a8323e", b: "#a8323e" },
    { name: "شفاف", mode: "transparent", a: "#ffffff", b: "#ffffff" }
  ];
  const templates = [
    { id:"morning-note", title:"صبح تازه", tag:"انرژی", text:"امروز\nاز نو شروع کن", font:"peyda", weight:700, bg:0, align:"center", line:1.25 },
    { id:"quiet-quote", title:"نقل‌قول", tag:"مینیمال", text:"آرام‌تر برو\nدورتر می‌رسی", font:"dana", weight:400, bg:4, align:"center", line:1.55 },
    { id:"sale", title:"تخفیف ویژه", tag:"فروش", text:"فقط امروز\n۳۰٪ تخفیف", font:"yekan-bakh", weight:700, bg:2, align:"center", line:1.2 },
    { id:"poem", title:"یک بیت", tag:"ادبی", text:"بگذار کلمات\nنفس بکشند", font:"anjoman", weight:400, bg:0, align:"center", line:1.8 },
    { id:"launch", title:"به‌زودی", tag:"اعلان", text:"یک اتفاق تازه\nدر راه است", font:"pinar", weight:650, bg:3, align:"center", line:1.35 },
    { id:"birthday", title:"تولد", tag:"جشن", text:"تولدت مبارک\nبهترین‌ها سهم تو", font:"peyda", weight:700, bg:1, align:"center", line:1.45 },
    { id:"thank-you", title:"سپاس", tag:"قدردانی", text:"ممنونم که\nهستی", font:"dana", weight:700, bg:5, align:"center", line:1.5 },
    { id:"new-post", title:"پست جدید", tag:"شبکه اجتماعی", text:"این‌جا را\nاز دست نده", font:"yekan-bakh", weight:700, bg:3, align:"right", line:1.35 },
    { id:"weekend", title:"آخر هفته", tag:"روزمره", text:"کمی مکث\nکمی زندگی", font:"anjoman", weight:400, bg:4, align:"center", line:1.8 },
    { id:"brand", title:"هویت برند", tag:"برند", text:"با فکر تو\nشکل می‌گیرد", font:"pinar", weight:700, bg:5, align:"right", line:1.4 },
    { id:"reminder", title:"یادآوری", tag:"انگیزشی", text:"تو از پسش\nبرمی‌آیی", font:"peyda", weight:700, bg:0, align:"center", line:1.4 },
    { id:"number", title:"شمارش معکوس", tag:"رویداد", text:"۳\n۲\n۱\nشروع!", font:"yekan-bakh", weight:700, bg:1, align:"center", line:1.05 }
  ];
  const defaultState = {
    text: "بگذار کلمات نفس بکشند", fontId: "dana", weight: 400, format: "story",
    size: 110, line: 1.5, tracking: 0, align: "center", autoFit: false, numberMode: "auto",
    textColor: "#ffffff", autoContrast: true, bg1: "#153b3a", bg2: "#208c7b", bgMode: "gradient",
    shadowColor: "#071d1b", shadow: true, shadowBlur: 18, borderColor: "#f0c84b", border: false, borderWidth: 2,
    safe: true, fontQuery: "", category: "all", favoritesOnly: false, favorites: [], compare: []
  };
  let state = { ...defaultState };
  let history = [];
  let redoStack = [];
  let lastHistoryAt = 0;
  let saveTimer;
  let toastTimer;
  let renderToken = 0;
  let scheduledDraw = 0;
  let readyFonts = new Set();
  let fontErrors = new Map();
  const canvas = $("#stage");
  const ctx = canvas.getContext("2d");
  const faDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arDigits = "٠١٢٣٤٥٦٧٨٩";

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function toFa(value) { return String(value).replace(/[0-9]/g, digit => faDigits[Number(digit)]); }
  function normalizeDigits(value) {
    if (state.numberMode === "auto") return value;
    const target = state.numberMode === "persian" ? faDigits : state.numberMode === "arabic" ? arDigits : "0123456789";
    return String(value).replace(/[0-9۰-۹٠-٩]/g, digit => {
      const index = /[۰-۹]/.test(digit) ? "۰۱۲۳۴۵۶۷۸۹".indexOf(digit) : /[٠-٩]/.test(digit) ? "٠١٢٣٤٥٦٧٨٩".indexOf(digit) : Number(digit);
      return target[index] || digit;
    });
  }
  function currentFont() { return byId.get(state.fontId) || fonts[0]; }
  function familyFor(font) { return font.family || "Khat Dana"; }
  function fontWeightFor(font, weight = state.weight) {
    if (font.variable) return Number(weight);
    return font.weights.reduce((closest, candidate) => Math.abs(candidate - weight) < Math.abs(closest - weight) ? candidate : closest, font.weights[0]);
  }
  function historySnapshot() {
    const now = Date.now();
    if (now - lastHistoryAt > 450) {
      history.push(clone(state));
      if (history.length > 60) history.shift();
      redoStack = [];
      lastHistoryAt = now;
    }
    updateHistoryButtons();
  }
  function scheduleDraw() {
    if (scheduledDraw) return;
    scheduledDraw = requestAnimationFrame(() => { scheduledDraw = 0; draw(); });
  }
  function change(mutator, { record = true, render = true } = {}) {
    if (record) historySnapshot();
    mutator(state);
    syncControls();
    if (render) scheduleDraw();
    renderFonts();
    renderCompare();
    persist();
  }
  function persist() {
    clearTimeout(saveTimer);
    $("#saveState").textContent = "در حال ذخیره…";
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $("#saveState").textContent = "آخرین طرح ذخیره شد"; }
      catch (_) { $("#saveState").textContent = "ذخیره‌سازی در دسترس نیست"; }
    }, 220);
  }
  function toast(message) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2300);
  }
  async function loadFont(font, weight = state.weight, sampleText = state.text || font.sample, size = state.size) {
    if (!font?.enabled || !font.files) return false;
    const actualWeight = fontWeightFor(font, weight);
    const key = `${font.id}:${actualWeight}`;
    try {
      const loaded = await document.fonts.load(`${actualWeight} ${size}px "${familyFor(font)}"`, normalizeDigits(sampleText || font.sample));
      if (loaded.length && loaded.every(face => face.status === "loaded")) {
        readyFonts.add(key);
        fontErrors.delete(font.id);
        return true;
      }
    } catch (_) {}
    fontErrors.set(font.id, `فونت «${font.faName}» بارگذاری نشد. فایل و مسیر آن را بررسی کنید.`);
    const card = $(`[data-font="${font.id}"]`);
    const tag = card && $(".font-card__tag", card);
    if (tag) {
      tag.textContent = "خطای بارگذاری";
      tag.classList.add("is-error");
    }
    return false;
  }
  function wrapText(text, maxWidth, fontSize) {
    const paragraphs = String(text).replace(/\r/g, "").split("\n");
    const lines = [];
    for (const paragraph of paragraphs) {
      if (!paragraph) { lines.push(""); continue; }
      const words = paragraph.split(/\s+/);
      let line = "";
      for (let word of words) {
        let candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) { lines.push(line); line = ""; }
        while (ctx.measureText(word).width > maxWidth && Array.from(word).length > 1) {
          const chars = Array.from(word);
          let part = "";
          while (chars.length && ctx.measureText(part + chars[0]).width <= maxWidth) part += chars.shift();
          lines.push(part || chars.shift());
          word = chars.join("");
        }
        candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word; }
        else line = candidate;
      }
      lines.push(line);
    }
    return lines;
  }
  function measureAt(text, font, weight, size, maxWidth, lineRatio) {
    ctx.font = `${weight} ${size}px "${familyFor(font)}", sans-serif`;
    const lines = wrapText(text, maxWidth, size);
    const widest = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width + Math.max(0, Array.from(line).length - 1) * state.tracking * size), 0);
    return { lines, width: widest, height: lines.length * size * lineRatio };
  }
  function contrastColor() {
    const base = state.bgMode === "solid" ? state.bg1 : state.bgMode === "gradient" ? state.bg1 : "#888888";
    const other = state.bgMode === "gradient" ? state.bg2 : base;
    const channels = [1, 3, 5].map(index => (parseInt(base.slice(index, index + 2), 16) + parseInt(other.slice(index, index + 2), 16)) / 510)
      .map(value => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2] > .42 ? "#172321" : "#ffffff";
  }
  function fitSize(text, font, weight, width, height) {
    let low = 12, high = Math.min(350, Math.max(width, height)), best = low;
    for (let index = 0; index < 19; index++) {
      const mid = (low + high) / 2;
      const measure = measureAt(text, font, weight, mid, width, state.line);
      if (measure.width <= width && measure.height <= height) { best = mid; low = mid; }
      else high = mid;
    }
    return Math.floor(best);
  }
  function draw() {
    const token = ++renderToken;
    const font = currentFont();
    const weight = font.variable ? Number(state.weight) : (state.weight >= 550 ? 700 : 400);
    $("#renderStatus").textContent = "آماده‌سازی قلم…";
    loadFont(font, weight).then(loaded => {
      if (token !== renderToken) return;
      if (!loaded) {
        $("#renderStatus").textContent = "خطای بارگذاری فونت";
        $("#fontError").textContent = fontErrors.get(font.id) || `فونت «${font.faName}» بارگذاری نشد.`;
        $("#fontError").hidden = false;
        return;
      }
      $("#renderStatus").textContent = "آماده";
      $("#fontError").hidden = true;
      paintCanvas(font, weight);
    });
  }
  function paintCanvas(font, weight) {
    const format = sizes[state.format] || sizes.story;
    const W = format.width, H = format.height;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (state.bgMode !== "transparent") {
      if (state.bgMode === "solid") ctx.fillStyle = state.bg1;
      else {
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, state.bg1);
        gradient.addColorStop(1, state.bg2);
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, W, H);
    }
    const pad = Math.round(W * .105);
    const safeTop = state.safe ? format.safeTop : 0;
    const safeBottom = state.safe ? format.safeBottom : 0;
    const areaW = W - pad * 2, areaH = H - safeTop - safeBottom - pad * 1.1;
    const text = normalizeDigits(state.text.trim() || "متن تو این‌جا می‌درخشد");
    const size = state.autoFit ? fitSize(text, font, weight, areaW, areaH) : Number(state.size);
    const metrics = measureAt(text, font, weight, size, areaW, state.line);
    const lineH = size * state.line;
    const top = safeTop + (areaH - metrics.height) / 2;
    const x = state.align === "right" ? W - pad : state.align === "left" ? pad : W / 2;
    ctx.font = `${weight} ${size}px "${familyFor(font)}", sans-serif`;
    ctx.textAlign = state.align;
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.lineJoin = "round";
    ctx.letterSpacing = `${state.tracking * size}px`;
    ctx.fillStyle = state.autoContrast ? contrastColor() : state.textColor;
    ctx.lineWidth = Number(state.borderWidth) * Math.max(1, size / 100);
    ctx.strokeStyle = state.borderColor;
    ctx.shadowColor = state.shadow ? state.shadowColor : "transparent";
    ctx.shadowBlur = state.shadow ? Number(state.shadowBlur) * W / 1080 : 0;
    ctx.shadowOffsetY = state.shadow ? size * .045 : 0;
    metrics.lines.forEach((line, index) => {
      if (!line) return;
      const y = top + index * lineH + lineH / 2;
      if (state.border && state.borderWidth > 0) ctx.strokeText(line, x, y, areaW);
      ctx.fillText(line, x, y, areaW);
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    $("#stageFrame").style.aspectRatio = `${W} / ${H}`;
    $("#stageFrame").style.background = state.bgMode === "transparent" ? "#ffffff" : state.bgMode === "solid" ? state.bg1 : `linear-gradient(135deg,${state.bg1},${state.bg2})`;
    $("#safeOverlay").classList.toggle("is-on", state.safe && (format.safeTop > 0 || format.safeBottom > 0));
    $("#previewFormatName").textContent = format.name;
    $("#dimensions").textContent = `${toFa(W)} × ${toFa(H)} px`;
    $("#activeFontLabel").textContent = font.faName;
    $("#sizeValue").textContent = toFa(size);
  }
  function renderFontCategories() {
    const cats = [["all", "همه"], ["body", "بدنه"], ["display", "تیتر"], ["decorative", "دکوراتیو"]];
    $("#categoryTabs").innerHTML = cats.map(([key, label]) => `<button type="button" role="tab" aria-selected="${state.category === key}" class="${state.category === key ? "is-active" : ""}" data-category="${key}">${label}</button>`).join("");
  }
  function renderFonts() {
    const query = state.fontQuery.trim().toLocaleLowerCase("fa");
    const entries = allFonts.filter(font => {
      if (font.category && state.category !== "all" && font.category !== state.category) return false;
      if (state.favoritesOnly && !state.favorites.includes(font.id)) return false;
      return !query || `${font.faName} ${font.latinName} ${font.category || ""}`.toLocaleLowerCase("fa").includes(query);
    });
    $("#fontGrid").innerHTML = entries.map(font => {
      const disabled = !font.enabled;
      const selected = state.fontId === font.id;
      const familyStyle = disabled ? "" : `font-family:'${familyFor(font)}',sans-serif;font-weight:${fontWeightFor(font, font.weights[0])}`;
      const category = font.category === "body" ? "بدنه" : font.category === "display" ? "تیتر" : "دکوراتیو";
      return `<article class="font-card ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}" data-font="${font.id}" tabindex="${disabled ? "-1" : "0"}" aria-disabled="${disabled}" aria-label="${font.faName}${disabled ? "، فایل در دسترس نیست" : ""}">
        <div class="font-card__meta"><span class="font-card__name">${font.faName} · ${font.latinName}</span><span class="font-card__tag ${fontErrors.has(font.id) ? "is-error" : ""}">${fontErrors.has(font.id) ? "خطای بارگذاری" : disabled ? "جایگزین آزاد لازم است" : category}</span></div>
        <div class="font-card__sample" style="${familyStyle}">${font.sample}</div>
        ${disabled ? "" : `<div class="font-card__actions"><button class="mini-action ${state.favorites.includes(font.id) ? "is-on" : ""}" data-action="favorite" aria-label="افزودن ${font.faName} به علاقه‌مندی‌ها" title="علاقه‌مندی">${state.favorites.includes(font.id) ? "★" : "☆"}</button><button class="mini-action ${state.compare.includes(font.id) ? "is-on" : ""}" data-action="compare" aria-label="مقایسه ${font.faName}" title="مقایسه">⇄</button></div>`}
      </article>`;
    }).join("");
    $("#fontCount").textContent = `${toFa(fonts.length)} قلم آماده`;
    $("#favoritesFilter").setAttribute("aria-pressed", String(state.favoritesOnly));
    $("#slotNote").hidden = pending.length === 0;
    $("#slotNote").textContent = pending.length ? `${pending.length} جایگاه در انتظار فایل فونت؛ ${pending.map(font => `${font.faName} (${font.status})`).join("، ")}.` : "";
  }
  function renderBackgrounds() {
    $("#backgroundSwatches").innerHTML = backgrounds.map((background, index) => `<button class="swatch" type="button" data-background="${index}" title="${background.name}" aria-label="پس‌زمینه ${background.name}" style="background:${background.mode === "transparent" ? "repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 50%/10px 10px" : background.mode === "solid" ? background.a : `linear-gradient(135deg,${background.a},${background.b})`}"></button>`).join("");
  }
  function renderTemplates() {
    $("#templateList").innerHTML = templates.map(template => `<button type="button" class="template-card" data-template="${template.id}" style="--template-color:${backgrounds[template.bg].a}"><strong>${template.title}</strong><span>${template.tag} · ${template.text.replace("\n", " ")}</span></button>`).join("");
  }
  function renderCompare() {
    $("#compareCount").textContent = `${toFa(state.compare.length)} از ۳`;
    $("#compareList").innerHTML = state.compare.length ? state.compare.map(id => {
      const font = byId.get(id);
      return `<div class="compare-chip"><div class="compare-chip__head"><span>${font.faName}</span><button type="button" data-remove-compare="${id}" aria-label="حذف ${font.faName} از مقایسه">×</button></div><div class="compare-sample" style="font-family:'${familyFor(font)}',sans-serif;font-weight:${state.weight}">${state.text || "نمونه متن"}</div></div>`;
    }).join("") : "<p>از کارت فونت‌ها برای مقایسه استفاده کن.</p>";
  }
  function syncControls() {
    $("#textInput").value = state.text;
    $("#charCount").textContent = `${toFa(state.text.replace(/\s/g, "").length)} نویسه`;
    $("#formatSelect").value = state.format;
    $("#sizeRange").value = state.size;
    const weights = currentFont().weights;
    const minWeight = Math.min(...weights), maxWeight = Math.max(...weights);
    $("#weightRange").min = minWeight;
    $("#weightRange").max = maxWeight;
    $("#weightRange").step = currentFont().variable ? "25" : Math.max(1, maxWeight - minWeight);
    $("#weightRange").value = state.weight;
    $("#weightRange").disabled = currentFont().weights.length === 1;
    $("#lineRange").value = state.line;
    $("#trackingRange").value = state.tracking;
    $("#numberMode").value = state.numberMode;
    $("#autoFitToggle").checked = state.autoFit;
    $("#sizeRange").disabled = state.autoFit;
    $("#textColor").value = state.textColor;
    $("#textColor").disabled = state.autoContrast;
    $("#autoContrastToggle").checked = state.autoContrast;
    $("#backgroundColor").value = state.bg1;
    $("#backgroundColor2").value = state.bg2;
    $("#backgroundColor2").disabled = state.bgMode !== "gradient";
    $("#shadowColor").value = state.shadowColor;
    $("#shadowRange").value = state.shadowBlur;
    $("#shadowRange").disabled = !state.shadow;
    $("#shadowToggle").checked = state.shadow;
    $("#borderColor").value = state.borderColor;
    $("#borderRange").value = state.borderWidth;
    $("#borderRange").disabled = !state.border;
    $("#borderToggle").checked = state.border;
    $("#backgroundMode").value = state.bgMode;
    $("#safeToggle").checked = state.safe;
    $("#sizeValue").textContent = state.autoFit ? "خودکار" : toFa(state.size);
    $("#weightValue").textContent = toFa(state.weight);
    $("#lineValue").textContent = toFa(Number(state.line).toFixed(2).replace(".", "٫"));
    $("#trackingValue").textContent = toFa(Number(state.tracking).toFixed(3).replace(".", "٫"));
    $("#shadowValue").textContent = toFa(state.shadowBlur);
    $("#borderValue").textContent = toFa(state.borderWidth);
    $$("[data-align]").forEach(button => button.classList.toggle("is-active", button.dataset.align === state.align));
    renderFontCategories();
  }
  function updateHistoryButtons() {
    $("#undoButton").disabled = history.length === 0;
    $("#redoButton").disabled = redoStack.length === 0;
  }
  function undo() {
    if (!history.length) return;
    redoStack.push(clone(state)); state = history.pop(); syncControls(); renderFonts(); draw(); renderCompare(); persist(); updateHistoryButtons();
  }
  function redo() {
    if (!redoStack.length) return;
    history.push(clone(state)); state = redoStack.pop(); syncControls(); renderFonts(); draw(); renderCompare(); persist(); updateHistoryButtons();
  }
  function setTemplate(id) {
    const template = templates.find(item => item.id === id);
    if (!template) return;
    const background = backgrounds[template.bg];
    change(next => {
      next.text = template.text; next.fontId = template.font; next.weight = template.weight;
      next.bg1 = background.a; next.bg2 = background.b; next.bgMode = background.mode;
      next.align = template.align; next.line = template.line; next.format = "story"; next.autoFit = true;
    });
    toast(`قالب «${template.title}» اعمال شد`);
  }
  function download(blob, extension) {
    if (!blob) { toast("ساخت تصویر ممکن نشد"); return; }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `khatplay-${state.format}-${Date.now()}.${extension}`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  }
  async function exportImage(type) {
    await loadFont(currentFont(), state.weight);
    draw();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    canvas.toBlob(blob => download(blob, type === "image/jpeg" ? "jpg" : "png"), type, type === "image/jpeg" ? .94 : 1);
  }
  async function copyImage() {
    await loadFont(currentFont(), state.weight);
    draw();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    canvas.toBlob(async blob => {
      if (!blob) { toast("ساخت تصویر ممکن نشد"); return; }
      try {
        if (!navigator.clipboard || !window.ClipboardItem) throw new Error("clipboard-unavailable");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast("تصویر کپی شد");
      } catch (_) { download(blob, "png"); toast("کپی در این صفحه در دسترس نیست؛ PNG دانلود شد"); }
    }, "image/png", 1);
  }
  $("#textInput").addEventListener("input", event => change(next => { next.text = event.target.value; }));
  $("#formatSelect").addEventListener("change", event => change(next => { next.format = event.target.value; }));
  $("#sizeRange").addEventListener("input", event => change(next => { next.size = Number(event.target.value); next.autoFit = false; }));
  $("#weightRange").addEventListener("input", event => change(next => { next.weight = Number(event.target.value); }));
  $("#lineRange").addEventListener("input", event => change(next => { next.line = Number(event.target.value); }));
  $("#trackingRange").addEventListener("input", event => change(next => { next.tracking = Number(event.target.value); }));
  $("#numberMode").addEventListener("change", event => change(next => { next.numberMode = event.target.value; }));
  $("#autoFitToggle").addEventListener("change", event => change(next => { next.autoFit = event.target.checked; }));
  $("#textColor").addEventListener("input", event => change(next => { next.textColor = event.target.value; next.autoContrast = false; }));
  $("#autoContrastToggle").addEventListener("change", event => change(next => { next.autoContrast = event.target.checked; }));
  $("#backgroundColor").addEventListener("input", event => change(next => { next.bg1 = event.target.value; }));
  $("#backgroundColor2").addEventListener("input", event => change(next => { next.bg2 = event.target.value; }));
  $("#shadowColor").addEventListener("input", event => change(next => { next.shadowColor = event.target.value; }));
  $("#shadowRange").addEventListener("input", event => change(next => { next.shadowBlur = Number(event.target.value); }));
  $("#shadowToggle").addEventListener("change", event => change(next => { next.shadow = event.target.checked; }));
  $("#borderColor").addEventListener("input", event => change(next => { next.borderColor = event.target.value; }));
  $("#borderRange").addEventListener("input", event => change(next => { next.borderWidth = Number(event.target.value); }));
  $("#borderToggle").addEventListener("change", event => change(next => { next.border = event.target.checked; }));
  $("#backgroundMode").addEventListener("change", event => change(next => { next.bgMode = event.target.value; }));
  $("#safeToggle").addEventListener("change", event => change(next => { next.safe = event.target.checked; }));
  $("#alignChips").addEventListener("click", event => {
    const button = event.target.closest("[data-align]");
    if (button) change(next => { next.align = button.dataset.align; });
  });
  $("#fontGrid").addEventListener("click", async event => {
    const card = event.target.closest("[data-font]");
    if (!card) return;
    const font = byId.get(card.dataset.font);
    if (!font?.enabled) { toast(font?.reason || "این جایگاه هنوز فایل فونت ندارد"); return; }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "favorite") {
      change(next => { next.favorites = next.favorites.includes(font.id) ? next.favorites.filter(id => id !== font.id) : [...next.favorites, font.id]; }, { render: false });
      return;
    }
    if (action === "compare") {
      if (state.compare.includes(font.id)) change(next => { next.compare = next.compare.filter(id => id !== font.id); }, { render: false });
      else if (state.compare.length >= 3) toast("حداکثر سه قلم برای مقایسه انتخاب کن");
      else {
        await loadFont(font, state.weight);
        change(next => { next.compare = [...next.compare, font.id]; }, { render: false });
      }
      return;
    }
    const loaded = await loadFont(font, state.weight);
    if (!loaded) {
      renderToken++;
      $("#renderStatus").textContent = "خطای بارگذاری فونت";
      $("#fontError").textContent = fontErrors.get(font.id) || `فونت «${font.faName}» بارگذاری نشد.`;
      $("#fontError").hidden = false;
      toast("بارگذاری فونت انجام نشد");
      return;
    }
    change(next => { next.fontId = font.id; next.weight = font.variable ? next.weight : 400; });
  });
  $("#fontGrid").addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") event.target.closest("[data-font]")?.click();
  });
  $("#fontGrid").addEventListener("pointerover", event => {
    const card = event.target.closest("[data-font]");
    if (!card || card.contains(event.relatedTarget)) return;
    const font = byId.get(card.dataset.font);
    if (font?.enabled) loadFont(font, state.weight).then(loaded => { if (loaded) { const sample = card.querySelector(".font-card__sample"); if (sample) sample.style.fontFamily = `"${familyFor(font)}"`; } });
  });
  $("#categoryTabs").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) change(next => { next.category = button.dataset.category; }, { record: false, render: false });
  });
  $("#fontSearch").addEventListener("input", event => {
    state.fontQuery = event.target.value;
    renderFonts();
  });
  $("#favoritesFilter").addEventListener("click", () => change(next => { next.favoritesOnly = !next.favoritesOnly; }, { render: false }));
  $("#backgroundSwatches").addEventListener("click", event => {
    const button = event.target.closest("[data-background]");
    if (!button) return;
    const background = backgrounds[Number(button.dataset.background)];
    change(next => { next.bgMode = background.mode; next.bg1 = background.a; next.bg2 = background.b; });
  });
  $("#templateList").addEventListener("click", event => { const card = event.target.closest("[data-template]"); if (card) setTemplate(card.dataset.template); });
  $("#compareList").addEventListener("click", event => { const button = event.target.closest("[data-remove-compare]"); if (button) change(next => { next.compare = next.compare.filter(id => id !== button.dataset.removeCompare); }, { render: false }); });
  $("#downloadPng").addEventListener("click", () => exportImage("image/png"));
  $("#downloadJpg").addEventListener("click", () => exportImage("image/jpeg"));
  $("#copyImage").addEventListener("click", copyImage);
  $("#undoButton").addEventListener("click", undo);
  $("#redoButton").addEventListener("click", redo);
  $("#surpriseButton").addEventListener("click", () => {
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    const background = backgrounds[Math.floor(Math.random() * (backgrounds.length - 1))];
    change(next => { next.fontId = font.id; next.weight = font.variable ? 650 : 700; next.bgMode = background.mode; next.bg1 = background.a; next.bg2 = background.b; next.align = ["center", "right", "left"][Math.floor(Math.random() * 3)]; next.autoFit = true; next.shadow = true; });
    toast("یک ترکیب تازه آماده شد");
  });
  $("#themeButton").addEventListener("click", () => {
    const theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
  });

  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    const saved = JSON.parse(storedState || localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") {
      state = { ...defaultState, ...saved, fontQuery: "" };
      if (!storedState) state.autoFit = false;
    }
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === "dark" || theme === "light") document.body.dataset.theme = theme;
  } catch (_) { state = { ...defaultState }; }
  if (!fonts.some(font => font.id === state.fontId)) state.fontId = "dana";
  state.compare = state.compare.filter(id => fonts.some(font => font.id === id)).slice(0, 3);
  state.favorites = state.favorites.filter(id => fonts.some(font => font.id === id));
  renderBackgrounds();
  renderTemplates();
  syncControls();
  renderFonts();
  renderCompare();
  await loadFont(currentFont(), state.weight);
  draw();
})();