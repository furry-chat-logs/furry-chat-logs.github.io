const BASE_URL = "https:
let currentEntries = [],
  activeFilters =[],
  searchQuery = "";
const SYSTEM_USERNAME = "Data",
  SYSTEM_USER_ID = "2";
let activeAudio = null,
  activePlayerEl = null,
  pendingScrollIdx = null;
const customSelect = document.getElementById("customSelect"),
  customOptions = document.getElementById("customOptions"),
  selectText = document.getElementById("selectText"),
  options = document.querySelectorAll(".custom-option");
let currentSort = localStorage.getItem("logSortPreference") || "oldest";
const initOption = Array.from(options).find(e => e.dataset.value === currentSort);
initOption && (selectText.textContent = initOption.textContent);
customSelect.addEventListener("click", e => {
  e.stopPropagation();
  customOptions.classList.toggle("show");
  customSelect.classList.toggle("active");
});
options.forEach(e => {
  e.addEventListener("click", ev => {
    var t = ev.target.dataset.value;
    if (t !== currentSort) {
      currentSort = t;
      selectText.textContent = ev.target.textContent;
      localStorage.setItem("logSortPreference", currentSort);
      renderLogs({ jumpToTop: !0 });
    }
  });
});
const searchToggleBtn = document.getElementById("searchToggleBtn"),
  searchWrap = document.getElementById("searchWrap"),
  searchInput = document.getElementById("searchInput"),
  searchClearBtn = document.getElementById("searchClearBtn");
let searchTimeout;
searchToggleBtn.addEventListener("click", e => {
  e.stopPropagation();
  const isOpen = searchWrap.classList.toggle("open");
  searchToggleBtn.classList.toggle("active", isOpen);
  if (isOpen) {
    setTimeout(() => searchInput.focus(), 150);
  } else if (searchInput.value) {
    searchInput.value = "";
    searchQuery = "";
    searchClearBtn.classList.remove("show");
    renderLogs();
  }
});
searchInput.addEventListener("input", () => {
  searchClearBtn.classList.toggle("show", searchInput.value.length > 0);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderLogs();
  }, 150);
});
searchClearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  searchClearBtn.classList.remove("show");
  searchInput.focus();
  renderLogs();
});
const filterToggleBtn = document.getElementById("filterToggleBtn"),
  filterPanel = document.getElementById("filterPanel"),
  filterBadge = document.getElementById("filterBadge");
function addFilter(e, t) {
  t = t.trim();
  if (t) {
    const s = t.toLowerCase();
    if (!activeFilters.some(f => f.type === e && f.value.toLowerCase() === s)) {
      activeFilters.push({ type: e, value: t });
      renderChips();
      renderLogs();
    }
  }
}
function renderChips() {
  const e = document.getElementById("filterChips");
  e.innerHTML = "";
  activeFilters.forEach((t, s) => {
    const a = document.createElement("div");
    a.className = "chip";
    a.innerHTML = ` <span class="chip-label">${"name" === t.type ? "name" : "id"}</span><span>${escapeHTML(t.value)}</span><button class="chip-remove" aria-label="Remove filter" data-index="${s}">×</button> `;
    e.appendChild(a);
  });
  e.querySelectorAll(".chip-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilters.splice(parseInt(btn.dataset.index), 1);
      renderChips();
      renderLogs();
    });
  });
  filterBadge.classList.toggle("show", activeFilters.length > 0);
}
function matchesSearch(e) {
  if (!searchQuery) return true;
  const q = searchQuery;
  return (e.username && e.username.toLowerCase().includes(q)) ||
         (e.userId && String(e.userId).toLowerCase().includes(q)) ||
         (e.message && e.message.toLowerCase().includes(q)) ||
         (e.date && e.date.toLowerCase().includes(q));
}
const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHTML(e) {
  return String(e).replace(/[&<>"']/g, m => htmlEntities[m] || m);
}
function escapeAttr(e) {
  return String(e).replace(/[&"']/g, m => htmlEntities[m] || m);
}
let cachedHighlightSearch = "";
let cachedHighlightRegex = null;
function highlightText(e, t) {
  if (!t) return escapeHTML(e);
  const s = escapeHTML(e);
  if (cachedHighlightSearch !== t) {
    cachedHighlightSearch = t;
    const escaped = escapeHTML(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cachedHighlightRegex = new RegExp(escaped, "gi");
  }
  return s.replace(cachedHighlightRegex, match => `<span class="highlight">${match}</span>`);
}
filterToggleBtn.addEventListener("click", e => {
  e.stopPropagation();
  filterPanel.classList.toggle("show");
  filterToggleBtn.classList.toggle("active", filterPanel.classList.contains("show"));
});
document.addEventListener("keydown", e => {
  if ("Escape" === e.key) {
    let t = false;
    if (lightbox.classList.contains("show")) {
      closeLightbox();
      t = true;
    } else {
      if (searchWrap.classList.contains("open")) {
        searchWrap.classList.remove("open");
        searchToggleBtn.classList.remove("active");
        if (searchInput.value) {
          searchInput.value = "";
          searchQuery = "";
          searchClearBtn.classList.remove("show");
          renderLogs();
        }
        t = true;
      }
      if (filterPanel.classList.contains("show")) {
        filterPanel.classList.remove("show");
        filterToggleBtn.classList.remove("active");
        t = true;
      }
      if (customOptions.classList.contains("show")) {
        customOptions.classList.remove("show");
        customSelect.classList.remove("active");
        t = true;
      }
    }
    if (t) e.preventDefault();
  }
  if ((e.ctrlKey || e.metaKey) && "f" === e.key) {
    e.preventDefault();
    searchWrap.classList.add("open");
    searchToggleBtn.classList.add("active");
    searchInput.focus();
  }
});
document.addEventListener("click", e => {
  customOptions.classList.remove("show");
  customSelect.classList.remove("active");
  if (!filterPanel.contains(e.target) && e.target !== filterToggleBtn) {
    filterPanel.classList.remove("show");
    filterToggleBtn.classList.remove("active");
  }
});
filterPanel.addEventListener("click", e => e.stopPropagation());
document.getElementById("addNameFilter").addEventListener("click", () => {
  const e = document.getElementById("nameFilterInput");
  addFilter("name", e.value);
  e.value = "";
});
document.getElementById("nameFilterInput").addEventListener("keydown", e => {
  if ("Enter" === e.key) document.getElementById("addNameFilter").click();
});
document.getElementById("addIdFilter").addEventListener("click", () => {
  const e = document.getElementById("idFilterInput");
  addFilter("id", e.value);
  e.value = "";
});
document.getElementById("idFilterInput").addEventListener("keydown", e => {
  if ("Enter" === e.key) document.getElementById("addIdFilter").click();
});
document.getElementById("clearFilters").addEventListener("click", () => {
  if (activeFilters.length > 0) {
    activeFilters =[];
    renderChips();
    renderLogs();
  }
});
const PLAY_ICON = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5l10 5.5-10 5.5V2.5z"/></svg>',
  PAUSE_ICON = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>';
let _audioCounter = 0;
const MEDIA_REGEX = /\[media:\s*(https?:\/\/[^\]\s]+)\s*\]/gi;
const URL_REGEX = /https?:\/\/[^\s<>"'\]]+/g;
const IMG_EXT_REGEX = /\.(png|jpg|jpeg|gif|webp)(\?[^"']*)?$/i;
const AUDIO_EXT_REGEX = /\.(mp3|ogg|wav|flac|aac|m4a)(\?[^"']*)?$/i;
const CLASS_CLEAN_REGEX = /[^\w\s-]/g;
const USERNAME_REPLACE_REGEX = /\busername\b/gi;
const CHAT_MSG_REPLACE_REGEX = /\bchat_message\b/gi;
function renderMessageContent(e, t) {
  const COMBINED_TAG_RE = /\[media:\s*(https?:\/\/[^\]\s]+)\s*\]|\[audio:\s*(https?:\/\/[^\]|]+?)(?:\s*\|\s*([^\]]*?))?\s*\]/gi;
  const a =[];
  let r = 0;
  for (var n; null !== (n = COMBINED_TAG_RE.exec(e));) {
    if (n.index > r) a.push({ type: "rawtext", value: e.slice(r, n.index) });
    if (n[1] !== undefined) {
      a.push({ type: "mediatag", url: n[1], raw: n[0] });
    } else {
      a.push({ type: "audiotag", url: n[2].trim(), title: (n[3] || "").trim(), raw: n[0] });
    }
    r = n.index + n[0].length;
  }
  if (r < e.length) a.push({ type: "rawtext", value: e.slice(r) });
  let l = "";
  a.forEach(item => {
    if (item.type === "rawtext") {
      const val = item.value;
      URL_REGEX.lastIndex = 0;
      const nUrls =[];
      let i = 0;
      for (var s; null !== (s = URL_REGEX.exec(val));) {
        if (s.index > i) nUrls.push({ type: "text", value: val.slice(i, s.index) });
        nUrls.push({ type: "url", value: s[0] });
        i = s.index + s[0].length;
      }
      if (i < val.length) nUrls.push({ type: "text", value: val.slice(i) });
      nUrls.forEach(u => {
        if ("text" !== u.type) {
          const urlStr = u.value;
          const escapedUrl = escapeAttr(urlStr);
          if (IMG_EXT_REGEX.test(urlStr)) {
            l += `<br><a class="msg-img-link" href="${escapedUrl}" data-lightbox="true" rel="noopener noreferrer"><img class="msg-img" src="${escapedUrl}" alt="image" loading="lazy" onerror="this.parentElement.style.display='none';"></a>`;
          } else {
            l += `<a class="msg-link" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${highlightText(urlStr, t)}</a>`;
          }
        } else if (u.value) {
          l += highlightText(u.value, t);
        }
      });
    } else if (item.type === "audiotag") {
      const urlStr = item.url;
      const escapedUrl = escapeAttr(urlStr);
      const escapedRaw = escapeHTML(item.raw);
      const label = item.title ? escapeHTML(item.title) : "audio";
      const playerId = "audio-" + _audioCounter++;
      l += `<br><div class="audio-player" data-player-id="${playerId}" data-media-wrap><button class="audio-play-btn" data-player-id="${playerId}">${PLAY_ICON}</button><div class="audio-progress-wrap" data-player-id="${playerId}"><div class="audio-progress-fill"></div></div><span class="audio-label">${label}</span><audio id="${playerId}" src="${escapedUrl}" preload="none" onerror="this.closest('[data-media-wrap]').style.display='none';this.closest('[data-media-wrap]').nextElementSibling.style.display='inline';"></audio></div><span class="msg-link" style="display:none;">${escapedRaw}</span>`;
    } else {
      const urlStr = item.url;
      const escapedUrl = escapeAttr(urlStr);
      const escapedRaw = escapeHTML(item.raw);
      if (IMG_EXT_REGEX.test(urlStr)) {
        l += `<br><a class="msg-img-link" href="${escapedUrl}" data-lightbox="true" rel="noopener noreferrer" data-media-wrap><img class="msg-img" src="${escapedUrl}" alt="image" loading="lazy" onerror="this.closest('[data-media-wrap]').style.display='none';this.closest('[data-media-wrap]').nextElementSibling.style.display='inline';"></a><span class="msg-link" style="display:none;">${escapedRaw}</span>`;
      } else if (AUDIO_EXT_REGEX.test(urlStr)) {
        const playerId = "audio-" + _audioCounter++;
        l += `<br><div class="audio-player" data-player-id="${playerId}" data-media-wrap><button class="audio-play-btn" data-player-id="${playerId}">${PLAY_ICON}</button><div class="audio-progress-wrap" data-player-id="${playerId}"><div class="audio-progress-fill"></div></div><span class="audio-label">audio</span><audio id="${playerId}" src="${escapedUrl}" preload="none" onerror="this.closest('[data-media-wrap]').style.display='none';this.closest('[data-media-wrap]').nextElementSibling.style.display='inline';"></audio></div><span class="msg-link" style="display:none;">${escapedRaw}</span>`;
      } else {
        l += `<a class="msg-link" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedRaw}</a>`;
      }
    }
  });
  return l;
}
const lightbox = document.getElementById("lightbox"),
  lightboxImg = document.getElementById("lightbox-img"),
  lightboxClose = document.getElementById("lightbox-close");
function openLightbox(e) {
  lightboxImg.src = e;
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("show");
  document.body.style.overflow = "";
  setTimeout(() => {
    lightboxImg.src = "";
  }, 200);
}
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});
lightboxClose.addEventListener("click", closeLightbox);
const logEl = document.getElementById("log");
function toggleAudio(e, t, s) {
  if (e && t) {
    if (activeAudio && activeAudio !== e) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      if (activePlayerEl) {
        activePlayerEl.classList.remove("playing");
        const btn = activePlayerEl.querySelector(".audio-play-btn");
        if (btn) btn.innerHTML = PLAY_ICON;
        const fill = activePlayerEl.querySelector(".audio-progress-fill");
        if (fill) fill.style.width = "0%";
      }
      activeAudio = null;
      activePlayerEl = null;
    }
    if (e.paused) {
      e.play().catch(() => {});
      t.classList.add("playing");
      s.innerHTML = PAUSE_ICON;
      activeAudio = e;
      activePlayerEl = t;
    } else {
      e.pause();
      t.classList.remove("playing");
      s.innerHTML = PLAY_ICON;
      activeAudio = null;
    }
  }
}
function updateProgress(e, t) {
  if (e && t) {
    const s = t.querySelector(".audio-progress-fill");
    if (s && e.duration) {
      s.style.width = (e.currentTime / e.duration * 100) + "%";
    }
  }
}
function renderMsgBlock(t, idx) {
  const s = "system" === t.type;
  const a = t.userId ? `<span class="msg-userid">ID: ${highlightText(String(t.userId), searchQuery)}</span>` : "";
  let r = t.userClasses ? escapeAttr(t.userClasses).replace(CLASS_CLEAN_REGEX, " ").trim() : "username";
  let n = t.msgClasses ? escapeAttr(t.msgClasses).replace(CLASS_CLEAN_REGEX, " ").trim() : "chat_message";
  r = r.replace(USERNAME_REPLACE_REGEX, "").trim();
  n = n.replace(CHAT_MSG_REPLACE_REGEX, "").trim();
  const l = ("msg-user " + r).trim();
  const i = ("msg-text " + n).trim();
  const idxAttr = idx !== undefined ? ` data-msg-idx="${idx}"` : "";
  return `<div class="msg-block${s ? " system-msg" : ""}"${idxAttr}>\n <div class="msg-header">\n <div class="msg-user-info">\n <span class="${l}">${highlightText(t.username, searchQuery)}</span>${a}\n </div>\n <span class="msg-date">${escapeHTML(t.date)}</span>\n </div>\n <div class="${i}">${renderMessageContent(t.message, searchQuery)}</div>\n </div>`;
}
async function loadLogs() {
  try {
    const idxRes = await fetch(`${BASE_URL}/index.json?t=${Date.now()}`);
    if (!idxRes.ok) throw new Error(`index.json HTTP ${idxRes.status}`);
    const files = await idxRes.json();
    const results = await Promise.all(
      files.map(async file => {
        try {
          const r = await fetch(`${BASE_URL}/${file}?t=${Date.now()}`);
          if (!r.ok) return [];
          return r.json();
        } catch {
          return [];
        }
      })
    );
    const raw = results.flat();
    const s = raw.map(e => "system" !== e.type ? e : {
      ...e,
      username: SYSTEM_USERNAME,
      userId: SYSTEM_USER_ID
    });
    if (0 === currentEntries.length) {
      currentEntries = s;
      renderLogs();
    } else if (s.length > currentEntries.length) {
      currentEntries = s;
      renderLogs({ isAutoRefresh: !0 });
    }
  } catch (err) {
    console.error("Error loading logs: " + err.message);
  }
}
function renderLogs({
  jumpToTop: e = !1,
  isAutoRefresh: autoRefresh = !1
} = {}) {
  const s = document.getElementById("count"),
    a = document.getElementById("no-results");
  var r = logEl.scrollHeight,
    n = Math.abs((logEl.clientHeight + logEl.scrollTop) - r) <= 30;
  let i = currentEntries.map((entry, idx) => [entry, idx]);
  i.sort((a, b) => Number(a[0].id) - Number(b[0].id));
  if ("oldest" === currentSort) i.reverse();
  const nameFilters = activeFilters.filter(f => f.type === "name").map(f => f.value.toLowerCase());
  let matchingUserIds = new Set();
  if (nameFilters.length > 0) {
    for (let j = 0; j < currentEntries.length; j++) {
      const entry = currentEntries[j];
      if (entry.userId && entry.username && nameFilters.includes(entry.username.toLowerCase())) {
        matchingUserIds.add(String(entry.userId));
      }
    }
  }
  function fastMatchesFilters(entry) {
    if (activeFilters.length === 0) return true;
    return activeFilters.some(f => {
      if (f.type === "id") return String(entry.userId || "") === String(f.value);
      if (f.type === "name") {
        if ((entry.username || "").toLowerCase() === f.value.toLowerCase()) return true;
        if (entry.userId && matchingUserIds.has(String(entry.userId))) return true;
      }
      return false;
    });
  }
  i = i.filter(([entry]) => fastMatchesFilters(entry) && matchesSearch(entry));
  s.textContent = currentEntries.length + " messages total" + (i.length !== currentEntries.length ? ` · ${i.length} shown` : "");
  if (0 === i.length) {
    a.classList.add("show");
    logEl.innerHTML = "";
  } else {
    a.classList.remove("show");
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
      activePlayerEl = null;
    }
    logEl.innerHTML = i.map(([entry, idx]) => renderMsgBlock(entry, idx)).join("");
  }
  logEl.classList.toggle("has-active-filter", activeFilters.length > 0 || !!searchQuery);
  const o = logEl.scrollHeight;
  if (pendingScrollIdx !== null) {
    const jumpEl = logEl.querySelector(`[data-msg-idx="${pendingScrollIdx}"]`);
    if (jumpEl) {
      jumpEl.scrollIntoView({ behavior: "instant", block: "center" });
      jumpEl.classList.add("jump-highlight");
      setTimeout(() => jumpEl.classList.remove("jump-highlight"), 1800);
    }
    pendingScrollIdx = null;
  } else {
    if (e) {
      logEl.scrollTo({top: o, behavior: "smooth"});
    } else if (autoRefresh) {
      if (n) {
        logEl.scrollTo({top: o, behavior: "smooth"});
      } else if ("oldest" === currentSort) {
        logEl.scrollTop += (o - r);
      }
    } else {
      logEl.scrollTop = o;
    }
  }
}
logEl.addEventListener("click", e => {
  if ((activeFilters.length > 0 || searchQuery) && !e.target.closest("a") && !e.target.closest("button") && !e.target.closest(".audio-progress-wrap")) {
    const block = e.target.closest(".msg-block");
    if (block && block.dataset.msgIdx !== "") {
      pendingScrollIdx = parseInt(block.dataset.msgIdx);
      activeFilters =[];
      renderChips();
      searchQuery = "";
      searchInput.value = "";
      searchClearBtn.classList.remove("show");
      searchWrap.classList.remove("open");
      searchToggleBtn.classList.remove("active");
      renderLogs();
      return;
    }
  }
  let link = e.target.closest("a[data-lightbox]");
  if (link) {
    e.preventDefault();
    openLightbox(link.href);
    return;
  }
  let t = e.target.closest(".audio-play-btn");
  if (t) {
    let s = t.dataset.playerId,
      a = logEl.querySelector(`.audio-player[data-player-id="${s}"]`);
    toggleAudio(document.getElementById(s), a, t);
  } else {
    const s = e.target.closest(".audio-progress-wrap");
    if (s) {
      let a = s.dataset.playerId;
      t = logEl.querySelector(`.audio-player[data-player-id="${a}"]`);
      const r = document.getElementById(a);
      if (r && r.duration) {
        const rect = s.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        r.currentTime = percent * r.duration;
        updateProgress(r, t);
      }
    }
  }
});
document.addEventListener("timeupdate", e => {
  if ("AUDIO" === e.target.tagName) {
    const t = e.target;
    if (activePlayerEl) updateProgress(t, activePlayerEl);
  }
}, !0);
document.addEventListener("ended", e => {
  if ("AUDIO" === e.target.tagName) {
    const id = e.target.id;
    const t = logEl.querySelector(`.audio-player[data-player-id="${id}"]`);
    if (t) {
      t.classList.remove("playing");
      const btn = t.querySelector(".audio-play-btn");
      if (btn) btn.innerHTML = PLAY_ICON;
      const fill = t.querySelector(".audio-progress-fill");
      if (fill) fill.style.width = "0%";
    }
    activeAudio = null;
    activePlayerEl = null;
  }
}, !0);
loadLogs();
setInterval(loadLogs, 10000);