const STORAGE_KEY = "thinglink-lite-scenes-v2";

const sceneList = document.getElementById("sceneList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toggleAddModeBtn = document.getElementById("toggleAddMode");
const togglePresentationBtn = document.getElementById("togglePresentation");
const addSceneBtn = document.getElementById("addScene");
const editSceneBtn = document.getElementById("editScene");
const deleteSceneBtn = document.getElementById("deleteScene");
const exportJsonBtn = document.getElementById("exportJson");
const resetStorageBtn = document.getElementById("resetStorage");

const viewer360 = document.getElementById("viewer360");
const flatViewer = document.getElementById("flatViewer");
const flatImage = document.getElementById("flatImage");
const flatLayer = document.getElementById("flatLayer");
const modelViewerWrap = document.getElementById("modelViewerWrap");
const modelViewer = document.getElementById("modelViewer");
const modelLayer = document.getElementById("modelLayer");

const tagDialog = document.getElementById("tagDialog");
const dialogHeading = document.getElementById("dialogHeading");
const tagTitleInput = document.getElementById("tagTitleInput");
const tagBodyInput = document.getElementById("tagBodyInput");
const tagDisplayMode = document.getElementById("tagDisplayMode");
const tagIconInput = document.getElementById("tagIconInput");
const tagSizeInput = document.getElementById("tagSizeInput");
const tagColorInput = document.getElementById("tagColorInput");
const tagThemeInput = document.getElementById("tagThemeInput");
const tagYoutubeInput = document.getElementById("tagYoutubeInput");
const tagHtmlInput = document.getElementById("tagHtmlInput");
const tagMedia = document.getElementById("tagMedia");
const saveTagBtn = document.getElementById("saveTag");
const deleteTagBtn = document.getElementById("deleteTag");
const closeDialog = document.getElementById("closeDialog");

const sceneDialog = document.getElementById("sceneDialog");
const sceneDialogHeading = document.getElementById("sceneDialogHeading");
const sceneTitleInput = document.getElementById("sceneTitleInput");
const sceneTypeInput = document.getElementById("sceneTypeInput");
const scenePanoramaInput = document.getElementById("scenePanoramaInput");
const sceneImageUpload = document.getElementById("sceneImageUpload");
const saveSceneBtn = document.getElementById("saveScene");
const closeSceneDialogBtn = document.getElementById("closeSceneDialog");

let current = 0;
let viewer;
let addMode = false;
let presentationMode = false;
let sceneEditMode = "new";
let editState = { tagIndex: null, pitch: null, yaw: null, x: null, y: null };
let SCENES = loadScenes();

function normalizeTag(t = {}) {
  return {
    displayMode: "card",
    icon: "i",
    size: "md",
    color: "#f43f5e",
    theme: "dark",
    ...t,
  };
}

function normalizeScene(scene = {}, i = 0) {
  return {
    id: scene.id || `scene-${Date.now()}-${i}`,
    title: scene.title || `장면 ${i + 1}`,
    type: scene.type || "360",
    panorama: scene.panorama || "",
    tags: Array.isArray(scene.tags) ? scene.tags.map(normalizeTag) : [],
  };
}

function loadScenes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeScene);
    }
  } catch (_) {}
  return (window.SCENES || []).map(normalizeScene);
}

function saveScenes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SCENES));
}

function currentScene() {
  return SCENES[current];
}

function sanitizeHtml(html) {
  if (!window.DOMPurify) return html;
  return window.DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });
}

function renderMediaPreview() {
  const mode = tagDisplayMode.value;
  if (mode === "html" && tagHtmlInput.value.trim()) {
    tagMedia.innerHTML = sanitizeHtml(tagHtmlInput.value);
    return;
  }

  if (tagYoutubeInput.value.trim()) {
    tagMedia.innerHTML = `<iframe src="https://www.youtube.com/embed/${tagYoutubeInput.value.trim()}" allowfullscreen></iframe>`;
    return;
  }

  const theme = tagThemeInput.value;
  tagMedia.innerHTML = `<div class="preview-card ${theme}"><div class="preview-text">${tagTitleInput.value || "제목 미리보기"}</div><div>${tagBodyInput.value || "본문 미리보기"}</div></div>`;
}

function openTagDialog(tag, isNew) {
  dialogHeading.textContent = isNew ? "새 태그 추가" : "태그 편집";
  tagTitleInput.value = tag?.title || "";
  tagBodyInput.value = tag?.body || "";
  tagDisplayMode.value = tag?.displayMode || "card";
  tagIconInput.value = tag?.icon || "i";
  tagSizeInput.value = tag?.size || "md";
  tagColorInput.value = tag?.color || "#f43f5e";
  tagThemeInput.value = tag?.theme || "dark";
  tagYoutubeInput.value = tag?.youtubeId || "";
  tagHtmlInput.value = tag?.html || "";
  renderMediaPreview();
  deleteTagBtn.style.display = isNew ? "none" : "inline-block";
  tagDialog.showModal();
}

function applyHotspotStyle(el, tag) {
  el.dataset.icon = tag.icon || "i";
  el.classList.add(`hotspot-${tag.size || "md"}`);
  el.style.background = tag.color || "#f43f5e";
  el.style.boxShadow = `0 0 0 6px ${hexToAlpha(tag.color || "#f43f5e", 0.25)}`;
}

function hexToAlpha(hex, alpha) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hotspot(hotSpotDiv, args) {
  const { tag, tagIndex } = args;
  hotSpotDiv.classList.add("custom-hotspot");
  applyHotspotStyle(hotSpotDiv, tag);

  if (tag.displayMode === "text") {
    const badge = document.createElement("span");
    badge.className = "text-badge";
    badge.textContent = tag.title;
    hotSpotDiv.appendChild(badge);
  }

  hotSpotDiv.addEventListener("click", () => {
    if (presentationMode && tag.displayMode === "html" && tag.html) {
      tagMedia.innerHTML = sanitizeHtml(tag.html);
      tagDialog.showModal();
      return;
    }
    editState = { tagIndex, pitch: tag.pitch, yaw: tag.yaw, x: tag.x, y: tag.y };
    openTagDialog(tag, false);
  });
}

function build360Scene(scene) {
  viewer = pannellum.viewer("viewer360", {
    type: "equirectangular",
    panorama: scene.panorama,
    autoLoad: true,
    hotSpots: scene.tags.map((tag, tagIndex) => ({
      pitch: tag.pitch,
      yaw: tag.yaw,
      createTooltipFunc: hotspot,
      createTooltipArgs: { tag, tagIndex },
    })),
  });

  viewer360.onclick = (e) => {
    if (!addMode || !viewer) return;
    const coords = viewer.mouseEventToCoords(e);
    if (!coords) return;
    editState = { tagIndex: null, pitch: coords[0], yaw: coords[1], x: null, y: null };
    openTagDialog({ title: "", body: "", displayMode: "card" }, true);
  };
}

function makeOverlayHotspot(tag, tagIndex, layerEl) {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "flat-hotspot";
  dot.style.left = `${tag.x}%`;
  dot.style.top = `${tag.y}%`;
  applyHotspotStyle(dot, tag);

  if (tag.displayMode === "text") {
    const txt = document.createElement("span");
    txt.className = "text-badge flat-text";
    txt.textContent = tag.title;
    dot.appendChild(txt);
  }

  let moved = false;
  let dragging = false;

  const onPointerMove = (ev) => {
    if (!dragging) return;
    moved = true;
    const rect = layerEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    SCENES[current].tags[tagIndex].x = x;
    SCENES[current].tags[tagIndex].y = y;
  };

  dot.addEventListener("pointerdown", (ev) => {
    dragging = true;
    moved = false;
    dot.classList.add("dragging");
    dot.setPointerCapture(ev.pointerId);
  });

  dot.addEventListener("pointermove", onPointerMove);

  dot.addEventListener("pointerup", () => {
    dragging = false;
    dot.classList.remove("dragging");
    saveScenes();
  });

  dot.addEventListener("click", () => {
    if (moved) return;
    editState = { tagIndex, pitch: null, yaw: null, x: tag.x, y: tag.y };
    openTagDialog(tag, false);
  });

  return dot;
}

function bindOverlayAdd(layerEl) {
  layerEl.onclick = (e) => {
    if (!addMode) return;
    if (e.target !== layerEl) return;
    const rect = layerEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    editState = { tagIndex: null, pitch: null, yaw: null, x, y };
    openTagDialog({ title: "", body: "", displayMode: "card" }, true);
  };
}

function buildFlatScene(scene) {
  flatImage.src = scene.panorama;
  flatLayer.innerHTML = "";

  scene.tags.forEach((tag, tagIndex) => {
    flatLayer.appendChild(makeOverlayHotspot(tag, tagIndex, flatLayer));
  });

  bindOverlayAdd(flatLayer);
}

function buildModelScene(scene) {
  modelViewer.src = scene.panorama;
  modelLayer.innerHTML = "";

  scene.tags.forEach((tag, tagIndex) => {
    modelLayer.appendChild(makeOverlayHotspot(tag, tagIndex, modelLayer));
  });

  bindOverlayAdd(modelLayer);
}

function renderScene(index) {
  if (!SCENES.length) return;
  current = Math.max(0, Math.min(index, SCENES.length - 1));
  const scene = currentScene();

  if (viewer) {
    viewer.destroy();
    viewer = null;
  }

  if (scene.type === "flat") {
    viewer360.classList.add("hidden");
    modelViewerWrap.classList.add("hidden");
    flatViewer.classList.remove("hidden");
    buildFlatScene(scene);
  } else if (scene.type === "model") {
    viewer360.classList.add("hidden");
    flatViewer.classList.add("hidden");
    modelViewerWrap.classList.remove("hidden");
    buildModelScene(scene);
  } else {
    flatViewer.classList.add("hidden");
    modelViewerWrap.classList.add("hidden");
    viewer360.classList.remove("hidden");
    build360Scene(scene);
  }

  renderSceneList();
}

function renderSceneList() {
  sceneList.innerHTML = "";
  SCENES.forEach((scene, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}. ${scene.title} [${scene.type}]`;
    btn.classList.toggle("active", i === current);
    btn.addEventListener("click", () => renderScene(i));
    li.appendChild(btn);
    sceneList.appendChild(li);
  });
}

function upsertTag() {
  const title = tagTitleInput.value.trim();
  if (!title) return alert("제목은 필수입니다.");

  const payload = normalizeTag({
    title,
    body: tagBodyInput.value.trim(),
    displayMode: tagDisplayMode.value,
    icon: tagIconInput.value,
    size: tagSizeInput.value,
    color: tagColorInput.value,
    theme: tagThemeInput.value,
    ...(tagYoutubeInput.value.trim() ? { youtubeId: tagYoutubeInput.value.trim() } : {}),
    ...(tagHtmlInput.value.trim() ? { html: tagHtmlInput.value.trim() } : {}),
  });

  if (currentScene().type === "flat" || currentScene().type === "model") {
    payload.x = editState.x;
    payload.y = editState.y;
  } else {
    payload.pitch = editState.pitch;
    payload.yaw = editState.yaw;
  }

  if (editState.tagIndex === null) currentScene().tags.push(payload);
  else currentScene().tags[editState.tagIndex] = payload;

  saveScenes();
  tagDialog.close();
  renderScene(current);
}

function removeTag() {
  if (editState.tagIndex === null) return;
  currentScene().tags.splice(editState.tagIndex, 1);
  saveScenes();
  tagDialog.close();
  renderScene(current);
}

function openSceneDialog(mode) {
  sceneEditMode = mode;
  if (mode === "new") {
    sceneDialogHeading.textContent = "새 장면 추가";
    sceneTitleInput.value = "";
    sceneTypeInput.value = "360";
    scenePanoramaInput.value = "";
  } else {
    const scene = currentScene();
    sceneDialogHeading.textContent = "장면 수정";
    sceneTitleInput.value = scene.title;
    sceneTypeInput.value = scene.type;
    scenePanoramaInput.value = scene.panorama;
  }
  sceneImageUpload.value = "";
  sceneDialog.showModal();
}

function saveScene() {
  const title = sceneTitleInput.value.trim();
  const type = sceneTypeInput.value;
  const panorama = scenePanoramaInput.value.trim();
  if (!title || !panorama) return alert("제목과 이미지 URL은 필수입니다.");

  if (sceneEditMode === "new") {
    SCENES.push(normalizeScene({ id: `scene-${Date.now()}`, title, type, panorama, tags: [] }));
    saveScenes();
    renderScene(SCENES.length - 1);
  } else {
    const scene = currentScene();
    scene.title = title;
    scene.type = type;
    scene.panorama = panorama;
    saveScenes();
    renderScene(current);
  }
  sceneDialog.close();
}

function deleteScene() {
  if (SCENES.length <= 1) return alert("최소 1개 장면은 남겨야 합니다.");
  if (!confirm(`현재 장면 '${currentScene().title}' 을(를) 삭제할까요?`)) return;
  SCENES.splice(current, 1);
  saveScenes();
  renderScene(Math.max(0, current - 1));
}

function handleSceneImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const isModel = file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf") || file.type.includes("gltf");
  if (isModel) {
    sceneTypeInput.value = "model";
    const objectUrl = URL.createObjectURL(file);
    scenePanoramaInput.value = objectUrl;
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("이미지 또는 3D 모델(.glb/.gltf) 파일만 업로드할 수 있어요.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      scenePanoramaInput.value = reader.result;
      if (sceneTypeInput.value === "model") sceneTypeInput.value = "flat";
    }
  };
  reader.readAsDataURL(file);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(SCENES, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenes-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetStorage() {
  if (!confirm("로컬 저장된 장면 데이터를 초기화할까요?")) return;
  localStorage.removeItem(STORAGE_KEY);
  SCENES = (window.SCENES || []).map(normalizeScene);
  renderScene(0);
}

function togglePresentation() {
  presentationMode = !presentationMode;
  document.body.classList.toggle("presentation", presentationMode);
  togglePresentationBtn.textContent = presentationMode ? "발표 모드 종료" : "발표 모드";
}

prevBtn.addEventListener("click", () => renderScene((current - 1 + SCENES.length) % SCENES.length));
nextBtn.addEventListener("click", () => renderScene((current + 1) % SCENES.length));

toggleAddModeBtn.addEventListener("click", () => {
  addMode = !addMode;
  toggleAddModeBtn.classList.toggle("active", addMode);
  toggleAddModeBtn.textContent = `태그 추가 모드: ${addMode ? "ON" : "OFF"}`;
});

togglePresentationBtn.addEventListener("click", togglePresentation);
addSceneBtn.addEventListener("click", () => openSceneDialog("new"));
editSceneBtn.addEventListener("click", () => openSceneDialog("edit"));
deleteSceneBtn.addEventListener("click", deleteScene);
exportJsonBtn.addEventListener("click", exportJson);
resetStorageBtn.addEventListener("click", resetStorage);

tagYoutubeInput.addEventListener("input", renderMediaPreview);
tagHtmlInput.addEventListener("input", renderMediaPreview);
tagDisplayMode.addEventListener("change", renderMediaPreview);
tagThemeInput.addEventListener("change", renderMediaPreview);
tagTitleInput.addEventListener("input", renderMediaPreview);
tagBodyInput.addEventListener("input", renderMediaPreview);
saveTagBtn.addEventListener("click", upsertTag);
deleteTagBtn.addEventListener("click", removeTag);
closeDialog.addEventListener("click", () => tagDialog.close());

saveSceneBtn.addEventListener("click", saveScene);
sceneImageUpload.addEventListener("change", handleSceneImageUpload);
closeSceneDialogBtn.addEventListener("click", () => sceneDialog.close());

renderScene(0);
