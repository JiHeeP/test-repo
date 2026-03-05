import { loadScenes, normalizeScene, normalizeTag, resetScenes, saveScenes, importScenesFromText } from "./storage.js";
import { sanitizeHtml, showStatus } from "./utils.js";
import { validateSceneInput, validateTagTitle } from "./validators.js";
import { build360, buildOverlay } from "./render.js";

const el = {
  sceneList: document.getElementById("sceneList"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  toggleAddModeBtn: document.getElementById("toggleAddMode"),
  togglePresentationBtn: document.getElementById("togglePresentation"),
  addSceneBtn: document.getElementById("addScene"),
  editSceneBtn: document.getElementById("editScene"),
  deleteSceneBtn: document.getElementById("deleteScene"),
  exportJsonBtn: document.getElementById("exportJson"),
  importJsonBtn: document.getElementById("importJson"),
  importJsonInput: document.getElementById("importJsonInput"),
  resetStorageBtn: document.getElementById("resetStorage"),
  statusBar: document.getElementById("statusBar"),

  viewer360: document.getElementById("viewer360"),
  flatViewer: document.getElementById("flatViewer"),
  flatImage: document.getElementById("flatImage"),
  flatLayer: document.getElementById("flatLayer"),
  modelViewerWrap: document.getElementById("modelViewerWrap"),
  modelViewer: document.getElementById("modelViewer"),
  modelLayer: document.getElementById("modelLayer"),

  tagDialog: document.getElementById("tagDialog"),
  dialogHeading: document.getElementById("dialogHeading"),
  tagTitleInput: document.getElementById("tagTitleInput"),
  tagBodyInput: document.getElementById("tagBodyInput"),
  tagDisplayMode: document.getElementById("tagDisplayMode"),
  tagIconInput: document.getElementById("tagIconInput"),
  tagSizeInput: document.getElementById("tagSizeInput"),
  tagColorInput: document.getElementById("tagColorInput"),
  tagThemeInput: document.getElementById("tagThemeInput"),
  tagYoutubeInput: document.getElementById("tagYoutubeInput"),
  tagHtmlInput: document.getElementById("tagHtmlInput"),
  tagMedia: document.getElementById("tagMedia"),
  saveTagBtn: document.getElementById("saveTag"),
  deleteTagBtn: document.getElementById("deleteTag"),
  closeDialog: document.getElementById("closeDialog"),

  sceneDialog: document.getElementById("sceneDialog"),
  sceneDialogHeading: document.getElementById("sceneDialogHeading"),
  sceneTitleInput: document.getElementById("sceneTitleInput"),
  sceneTypeInput: document.getElementById("sceneTypeInput"),
  scenePanoramaInput: document.getElementById("scenePanoramaInput"),
  sceneImageUpload: document.getElementById("sceneImageUpload"),
  saveSceneBtn: document.getElementById("saveScene"),
  closeSceneDialogBtn: document.getElementById("closeSceneDialog"),
};

let scenes = loadScenes(window.SCENES || []);
let current = 0;
let viewer;
let addMode = false;
let presentationMode = false;
let sceneEditMode = "new";
let editState = { tagIndex: null, pitch: null, yaw: null, x: null, y: null };

function currentScene() { return scenes[current]; }
function persist() { saveScenes(scenes); }

function renderMediaPreview() {
  const mode = el.tagDisplayMode.value;
  if (mode === "html" && el.tagHtmlInput.value.trim()) {
    el.tagMedia.innerHTML = sanitizeHtml(el.tagHtmlInput.value);
    return;
  }
  if (el.tagYoutubeInput.value.trim()) {
    el.tagMedia.innerHTML = `<iframe src="https://www.youtube.com/embed/${el.tagYoutubeInput.value.trim()}" allowfullscreen></iframe>`;
    return;
  }
  const theme = el.tagThemeInput.value;
  el.tagMedia.innerHTML = `<div class="preview-card ${theme}"><div class="preview-text">${el.tagTitleInput.value || "제목 미리보기"}</div><div>${el.tagBodyInput.value || "본문 미리보기"}</div></div>`;
}

function openTagDialog(tag, isNew) {
  el.dialogHeading.textContent = isNew ? "새 태그 추가" : "태그 편집";
  el.tagTitleInput.value = tag?.title || "";
  el.tagBodyInput.value = tag?.body || "";
  el.tagDisplayMode.value = tag?.displayMode || "card";
  el.tagIconInput.value = tag?.icon || "i";
  el.tagSizeInput.value = tag?.size || "md";
  el.tagColorInput.value = tag?.color || "#f43f5e";
  el.tagThemeInput.value = tag?.theme || "dark";
  el.tagYoutubeInput.value = tag?.youtubeId || "";
  el.tagHtmlInput.value = tag?.html || "";
  renderMediaPreview();
  el.deleteTagBtn.style.display = isNew ? "none" : "inline-block";
  el.tagDialog.showModal();
}

function renderSceneList() {
  el.sceneList.innerHTML = "";
  scenes.forEach((scene, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}. ${scene.title} [${scene.type}]`;
    btn.classList.toggle("active", i === current);
    btn.onclick = () => renderScene(i);
    li.appendChild(btn);
    el.sceneList.appendChild(li);
  });
}

function beginAddTag(coords) {
  if (!addMode) return;
  editState = { tagIndex: null, pitch: null, yaw: null, x: null, y: null, ...coords };
  openTagDialog({ title: "", body: "", displayMode: "card" }, true);
}

function editTag(tag, tagIndex) {
  editState = { tagIndex, pitch: tag.pitch, yaw: tag.yaw, x: tag.x, y: tag.y };
  openTagDialog(tag, false);
}

function renderScene(index) {
  if (!scenes.length) return;
  current = Math.max(0, Math.min(index, scenes.length - 1));
  const scene = currentScene();

  if (viewer) { viewer.destroy(); viewer = null; }

  el.viewer360.classList.add("hidden");
  el.flatViewer.classList.add("hidden");
  el.modelViewerWrap.classList.add("hidden");

  if (scene.type === "flat") {
    el.flatViewer.classList.remove("hidden");
    el.flatImage.src = scene.panorama;
    buildOverlay({
      layerEl: el.flatLayer,
      tags: scene.tags,
      onHotspotClick: editTag,
      onAddTag: beginAddTag,
      onDragEnd: (i, x, y, finalize) => {
        if (x != null) { scene.tags[i].x = x; scene.tags[i].y = y; }
        if (finalize) persist();
      },
    });
  } else if (scene.type === "model") {
    el.modelViewerWrap.classList.remove("hidden");
    el.modelViewer.src = scene.panorama;
    buildOverlay({
      layerEl: el.modelLayer,
      tags: scene.tags,
      onHotspotClick: editTag,
      onAddTag: beginAddTag,
      onDragEnd: (i, x, y, finalize) => {
        if (x != null) { scene.tags[i].x = x; scene.tags[i].y = y; }
        if (finalize) persist();
      },
    });
  } else {
    el.viewer360.classList.remove("hidden");
    viewer = build360({
      viewerEl: el.viewer360,
      scene,
      onHotspotClick: editTag,
      onAddTag: beginAddTag,
    });
  }

  renderSceneList();
}

function upsertTag() {
  const err = validateTagTitle(el.tagTitleInput.value);
  if (err) return showStatus(el.statusBar, err, "error");

  const payload = normalizeTag({
    title: el.tagTitleInput.value.trim(),
    body: el.tagBodyInput.value.trim(),
    displayMode: el.tagDisplayMode.value,
    icon: el.tagIconInput.value,
    size: el.tagSizeInput.value,
    color: el.tagColorInput.value,
    theme: el.tagThemeInput.value,
    ...(el.tagYoutubeInput.value.trim() ? { youtubeId: el.tagYoutubeInput.value.trim() } : {}),
    ...(el.tagHtmlInput.value.trim() ? { html: el.tagHtmlInput.value.trim() } : {}),
  });

  if (currentScene().type === "360") {
    payload.pitch = editState.pitch;
    payload.yaw = editState.yaw;
  } else {
    payload.x = editState.x;
    payload.y = editState.y;
  }

  if (editState.tagIndex == null) currentScene().tags.push(payload);
  else currentScene().tags[editState.tagIndex] = payload;

  persist();
  el.tagDialog.close();
  renderScene(current);
  showStatus(el.statusBar, "태그 저장 완료", "ok");
}

function removeTag() {
  if (editState.tagIndex == null) return;
  currentScene().tags.splice(editState.tagIndex, 1);
  persist();
  el.tagDialog.close();
  renderScene(current);
  showStatus(el.statusBar, "태그 삭제 완료", "ok");
}

function openSceneDialog(mode) {
  sceneEditMode = mode;
  if (mode === "new") {
    el.sceneDialogHeading.textContent = "새 장면 추가";
    el.sceneTitleInput.value = "";
    el.sceneTypeInput.value = "360";
    el.scenePanoramaInput.value = "";
  } else {
    const scene = currentScene();
    el.sceneDialogHeading.textContent = "장면 수정";
    el.sceneTitleInput.value = scene.title;
    el.sceneTypeInput.value = scene.type;
    el.scenePanoramaInput.value = scene.panorama;
  }
  el.sceneImageUpload.value = "";
  el.sceneDialog.showModal();
}

function saveSceneFromDialog() {
  const input = {
    title: el.sceneTitleInput.value.trim(),
    type: el.sceneTypeInput.value,
    media: el.scenePanoramaInput.value.trim(),
  };
  const err = validateSceneInput(input);
  if (err) return showStatus(el.statusBar, err, "error");

  if (sceneEditMode === "new") {
    scenes.push(normalizeScene({ title: input.title, type: input.type, panorama: input.media, tags: [] }));
    persist();
    el.sceneDialog.close();
    renderScene(scenes.length - 1);
  } else {
    const s = currentScene();
    s.title = input.title;
    s.type = input.type;
    s.panorama = input.media;
    persist();
    el.sceneDialog.close();
    renderScene(current);
  }
  showStatus(el.statusBar, "장면 저장 완료", "ok");
}

function deleteScene() {
  if (scenes.length <= 1) return showStatus(el.statusBar, "최소 1개 장면은 남겨야 합니다.", "error");
  if (!confirm(`현재 장면 '${currentScene().title}' 을(를) 삭제할까요?`)) return;
  scenes.splice(current, 1);
  persist();
  renderScene(Math.max(0, current - 1));
  showStatus(el.statusBar, "장면 삭제 완료", "ok");
}

function handleSceneUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const isModel = /\.(glb|gltf)$/i.test(file.name) || file.type.includes("gltf");

  if (isModel) {
    el.sceneTypeInput.value = "model";
    el.scenePanoramaInput.value = URL.createObjectURL(file);
    showStatus(el.statusBar, "3D 모델 파일 로드됨", "ok");
    return;
  }

  if (!file.type.startsWith("image/")) {
    showStatus(el.statusBar, "이미지 또는 3D 모델 파일만 업로드 가능", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      el.scenePanoramaInput.value = reader.result;
      if (el.sceneTypeInput.value === "model") el.sceneTypeInput.value = "flat";
      showStatus(el.statusBar, "이미지 파일 로드됨", "ok");
    }
  };
  reader.readAsDataURL(file);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(scenes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenes-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      scenes = importScenesFromText(String(reader.result));
      persist();
      renderScene(0);
      showStatus(el.statusBar, "JSON 가져오기 완료", "ok");
    } catch (err) {
      showStatus(el.statusBar, `가져오기 실패: ${err.message}`, "error");
    }
  };
  reader.readAsText(file);
}

function resetStorageAll() {
  if (!confirm("로컬 저장 장면을 초기화할까요?")) return;
  scenes = resetScenes(window.SCENES || []);
  persist();
  renderScene(0);
  showStatus(el.statusBar, "저장 데이터 초기화 완료", "ok");
}

function togglePresentation() {
  presentationMode = !presentationMode;
  document.body.classList.toggle("presentation", presentationMode);
  el.togglePresentationBtn.textContent = presentationMode ? "발표 모드 종료" : "발표 모드";
}

function bindEvents() {
  el.prevBtn.onclick = () => renderScene((current - 1 + scenes.length) % scenes.length);
  el.nextBtn.onclick = () => renderScene((current + 1) % scenes.length);

  el.toggleAddModeBtn.onclick = () => {
    addMode = !addMode;
    el.toggleAddModeBtn.classList.toggle("active", addMode);
    el.toggleAddModeBtn.textContent = `태그 추가 모드: ${addMode ? "ON" : "OFF"}`;
  };

  el.togglePresentationBtn.onclick = togglePresentation;
  el.addSceneBtn.onclick = () => openSceneDialog("new");
  el.editSceneBtn.onclick = () => openSceneDialog("edit");
  el.deleteSceneBtn.onclick = deleteScene;
  el.exportJsonBtn.onclick = exportJson;
  el.importJsonBtn.onclick = () => el.importJsonInput.click();
  el.importJsonInput.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) importJson(file);
    e.target.value = "";
  };
  el.resetStorageBtn.onclick = resetStorageAll;

  [el.tagDisplayMode, el.tagThemeInput, el.tagTitleInput, el.tagBodyInput, el.tagYoutubeInput, el.tagHtmlInput].forEach((node) => {
    node.addEventListener("input", renderMediaPreview);
    node.addEventListener("change", renderMediaPreview);
  });

  el.saveTagBtn.onclick = upsertTag;
  el.deleteTagBtn.onclick = removeTag;
  el.closeDialog.onclick = () => el.tagDialog.close();

  el.saveSceneBtn.onclick = saveSceneFromDialog;
  el.sceneImageUpload.onchange = handleSceneUpload;
  el.closeSceneDialogBtn.onclick = () => el.sceneDialog.close();

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "f") togglePresentation();
    if (e.key === "Escape" && presentationMode) togglePresentation();
  });
}

bindEvents();
renderScene(0);
showStatus(el.statusBar, "초기화 완료", "ok");
