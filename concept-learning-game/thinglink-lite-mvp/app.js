const sceneList = document.getElementById("sceneList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toggleAddModeBtn = document.getElementById("toggleAddMode");
const addSceneBtn = document.getElementById("addScene");
const editSceneBtn = document.getElementById("editScene");
const deleteSceneBtn = document.getElementById("deleteScene");
const exportJsonBtn = document.getElementById("exportJson");

const viewer360 = document.getElementById("viewer360");
const flatViewer = document.getElementById("flatViewer");
const flatImage = document.getElementById("flatImage");
const flatLayer = document.getElementById("flatLayer");

const tagDialog = document.getElementById("tagDialog");
const dialogHeading = document.getElementById("dialogHeading");
const tagTitleInput = document.getElementById("tagTitleInput");
const tagBodyInput = document.getElementById("tagBodyInput");
const tagDisplayMode = document.getElementById("tagDisplayMode");
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
let sceneEditMode = "new";
let editState = { tagIndex: null, pitch: null, yaw: null, x: null, y: null };

function normalizeScene(scene) {
  if (!scene.type) scene.type = "360";
  if (!Array.isArray(scene.tags)) scene.tags = [];
  scene.tags = scene.tags.map((t) => ({ displayMode: "card", ...t }));
  return scene;
}
window.SCENES = window.SCENES.map(normalizeScene);

function currentScene() { return SCENES[current]; }

function renderMediaPreview() {
  if (tagDisplayMode.value === "html" && tagHtmlInput.value.trim()) {
    tagMedia.innerHTML = tagHtmlInput.value;
    return;
  }
  const youtubeId = tagYoutubeInput.value.trim();
  tagMedia.innerHTML = youtubeId ? `<iframe src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen></iframe>` : "";
}

function openTagDialog(tag, isNew) {
  dialogHeading.textContent = isNew ? "새 태그 추가" : "태그 편집";
  tagTitleInput.value = tag?.title || "";
  tagBodyInput.value = tag?.body || "";
  tagDisplayMode.value = tag?.displayMode || "card";
  tagYoutubeInput.value = tag?.youtubeId || "";
  tagHtmlInput.value = tag?.html || "";
  renderMediaPreview();
  deleteTagBtn.style.display = isNew ? "none" : "inline-block";
  tagDialog.showModal();
}

function hotspot(hotSpotDiv, args) {
  const { tag, tagIndex } = args;
  hotSpotDiv.classList.add("custom-hotspot");
  if (tag.displayMode === "text") {
    const badge = document.createElement("span");
    badge.className = "text-badge";
    badge.textContent = tag.title;
    hotSpotDiv.appendChild(badge);
  }
  hotSpotDiv.addEventListener("click", () => {
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

function buildFlatScene(scene) {
  flatImage.src = scene.panorama;
  flatLayer.innerHTML = "";

  scene.tags.forEach((tag, tagIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "flat-hotspot";
    dot.style.left = `${tag.x}%`;
    dot.style.top = `${tag.y}%`;

    if (tag.displayMode === "text") {
      const txt = document.createElement("span");
      txt.className = "text-badge flat-text";
      txt.textContent = tag.title;
      dot.appendChild(txt);
    }

    dot.addEventListener("click", () => {
      editState = { tagIndex, pitch: null, yaw: null, x: tag.x, y: tag.y };
      openTagDialog(tag, false);
    });
    flatLayer.appendChild(dot);
  });

  flatLayer.onclick = (e) => {
    if (!addMode) return;
    if (e.target !== flatLayer) return;
    const rect = flatLayer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    editState = { tagIndex: null, pitch: null, yaw: null, x, y };
    openTagDialog({ title: "", body: "", displayMode: "card" }, true);
  };
}

function renderScene(index) {
  if (!SCENES.length) return;
  current = Math.max(0, Math.min(index, SCENES.length - 1));
  const scene = currentScene();

  if (viewer) { viewer.destroy(); viewer = null; }

  if (scene.type === "flat") {
    viewer360.classList.add("hidden");
    flatViewer.classList.remove("hidden");
    buildFlatScene(scene);
  } else {
    flatViewer.classList.add("hidden");
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

  const payload = {
    title,
    body: tagBodyInput.value.trim(),
    displayMode: tagDisplayMode.value,
    ...(tagYoutubeInput.value.trim() ? { youtubeId: tagYoutubeInput.value.trim() } : {}),
    ...(tagHtmlInput.value.trim() ? { html: tagHtmlInput.value.trim() } : {}),
  };

  if (currentScene().type === "flat") {
    payload.x = editState.x;
    payload.y = editState.y;
  } else {
    payload.pitch = editState.pitch;
    payload.yaw = editState.yaw;
  }

  if (editState.tagIndex === null) currentScene().tags.push(payload);
  else currentScene().tags[editState.tagIndex] = payload;

  tagDialog.close();
  renderScene(current);
}

function removeTag() {
  if (editState.tagIndex === null) return;
  currentScene().tags.splice(editState.tagIndex, 1);
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
    SCENES.push({ id: `scene-${Date.now()}`, title, type, panorama, tags: [] });
    renderScene(SCENES.length - 1);
  } else {
    const scene = currentScene();
    scene.title = title;
    scene.type = type;
    scene.panorama = panorama;
    renderScene(current);
  }
  sceneDialog.close();
}

function deleteScene() {
  if (SCENES.length <= 1) return alert("최소 1개 장면은 남겨야 합니다.");
  if (!confirm(`현재 장면 '${currentScene().title}' 을(를) 삭제할까요?`)) return;
  SCENES.splice(current, 1);
  renderScene(Math.max(0, current - 1));
}

function handleSceneImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") scenePanoramaInput.value = reader.result;
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

prevBtn.addEventListener("click", () => renderScene((current - 1 + SCENES.length) % SCENES.length));
nextBtn.addEventListener("click", () => renderScene((current + 1) % SCENES.length));

toggleAddModeBtn.addEventListener("click", () => {
  addMode = !addMode;
  toggleAddModeBtn.classList.toggle("active", addMode);
  toggleAddModeBtn.textContent = `태그 추가 모드: ${addMode ? "ON" : "OFF"}`;
});

addSceneBtn.addEventListener("click", () => openSceneDialog("new"));
editSceneBtn.addEventListener("click", () => openSceneDialog("edit"));
deleteSceneBtn.addEventListener("click", deleteScene);
exportJsonBtn.addEventListener("click", exportJson);

tagYoutubeInput.addEventListener("input", renderMediaPreview);
tagHtmlInput.addEventListener("input", renderMediaPreview);
tagDisplayMode.addEventListener("change", renderMediaPreview);
saveTagBtn.addEventListener("click", upsertTag);
deleteTagBtn.addEventListener("click", removeTag);
closeDialog.addEventListener("click", () => tagDialog.close());

saveSceneBtn.addEventListener("click", saveScene);
sceneImageUpload.addEventListener("change", handleSceneImageUpload);
closeSceneDialogBtn.addEventListener("click", () => sceneDialog.close());

renderScene(0);
