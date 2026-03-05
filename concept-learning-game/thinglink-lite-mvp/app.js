const slideList = document.getElementById("slideList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toggleAddModeBtn = document.getElementById("toggleAddMode");
const addSceneBtn = document.getElementById("addScene");
const editSceneBtn = document.getElementById("editScene");
const deleteSceneBtn = document.getElementById("deleteScene");
const exportJsonBtn = document.getElementById("exportJson");

const tagDialog = document.getElementById("tagDialog");
const dialogHeading = document.getElementById("dialogHeading");
const tagTitleInput = document.getElementById("tagTitleInput");
const tagBodyInput = document.getElementById("tagBodyInput");
const tagYoutubeInput = document.getElementById("tagYoutubeInput");
const tagMedia = document.getElementById("tagMedia");
const saveTagBtn = document.getElementById("saveTag");
const deleteTagBtn = document.getElementById("deleteTag");
const closeDialog = document.getElementById("closeDialog");

const sceneDialog = document.getElementById("sceneDialog");
const sceneDialogHeading = document.getElementById("sceneDialogHeading");
const sceneTitleInput = document.getElementById("sceneTitleInput");
const scenePanoramaInput = document.getElementById("scenePanoramaInput");
const sceneImageUpload = document.getElementById("sceneImageUpload");
const saveSceneBtn = document.getElementById("saveScene");
const closeSceneDialogBtn = document.getElementById("closeSceneDialog");

let current = 0;
let viewer;
let addMode = false;
let editState = { tagIndex: null, pitch: null, yaw: null };
let sceneEditMode = "new";

function currentScene() { return SCENES[current]; }

function hotspot(hotSpotDiv, args) {
  hotSpotDiv.classList.add("custom-hotspot");
  hotSpotDiv.addEventListener("click", () => {
    editState = { tagIndex: args.tagIndex, pitch: args.tag.pitch, yaw: args.tag.yaw };
    openTagDialog(args.tag, false);
  });
}

function openTagDialog(tag, isNew) {
  dialogHeading.textContent = isNew ? "새 태그 추가" : "태그 편집";
  tagTitleInput.value = tag?.title || "";
  tagBodyInput.value = tag?.body || "";
  tagYoutubeInput.value = tag?.youtubeId || "";
  renderMediaPreview();
  deleteTagBtn.style.display = isNew ? "none" : "inline-block";
  tagDialog.showModal();
}

function renderMediaPreview() {
  const youtubeId = tagYoutubeInput.value.trim();
  tagMedia.innerHTML = youtubeId ? `<iframe src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen></iframe>` : "";
}

function buildViewer(scene) {
  viewer = pannellum.viewer("viewer", {
    type: "equirectangular",
    panorama: scene.panorama,
    autoLoad: true,
    hotSpots: scene.tags.map((tag, tagIndex) => ({
      pitch: tag.pitch, yaw: tag.yaw, cssClass: "custom-hotspot",
      createTooltipFunc: hotspot, createTooltipArgs: { tag, tagIndex }
    }))
  });

  document.getElementById("viewer").onclick = (e) => {
    if (!addMode || !viewer) return;
    const coords = viewer.mouseEventToCoords(e);
    if (!coords) return;
    editState = { tagIndex: null, pitch: coords[0], yaw: coords[1] };
    openTagDialog({ title: "", body: "", youtubeId: "" }, true);
  };
}

function renderScene(index) {
  if (!SCENES.length) return;
  current = Math.max(0, Math.min(index, SCENES.length - 1));
  if (viewer) { viewer.destroy(); viewer = null; }
  buildViewer(currentScene());
  renderSlides();
}

function renderSlides() {
  slideList.innerHTML = "";
  SCENES.forEach((scene, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}. ${scene.title}`;
    btn.classList.toggle("active", i === current);
    btn.addEventListener("click", () => renderScene(i));
    li.appendChild(btn);
    slideList.appendChild(li);
  });
}

function upsertTag() {
  const title = tagTitleInput.value.trim();
  if (!title) return alert("제목은 필수입니다.");
  const payload = {
    pitch: editState.pitch,
    yaw: editState.yaw,
    title,
    body: tagBodyInput.value.trim(),
    ...(tagYoutubeInput.value.trim() ? { youtubeId: tagYoutubeInput.value.trim() } : {})
  };
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
    sceneDialogHeading.textContent = "새 슬라이드 추가";
    sceneTitleInput.value = "";
    scenePanoramaInput.value = "";
  } else {
    sceneDialogHeading.textContent = "슬라이드 수정";
    sceneTitleInput.value = currentScene().title;
    scenePanoramaInput.value = currentScene().panorama;
  }
  sceneImageUpload.value = "";
  sceneDialog.showModal();
}

function saveScene() {
  const title = sceneTitleInput.value.trim();
  const panorama = scenePanoramaInput.value.trim();
  if (!title || !panorama) return alert("제목과 360 이미지 URL은 필수입니다.");

  if (sceneEditMode === "new") {
    SCENES.push({ id: `slide-${Date.now()}`, title, panorama, tags: [] });
    renderScene(SCENES.length - 1);
  } else {
    currentScene().title = title;
    currentScene().panorama = panorama;
    renderScene(current);
  }
  sceneDialog.close();
}

function deleteScene() {
  if (SCENES.length <= 1) return alert("최소 1개 슬라이드는 남겨야 합니다.");
  if (!confirm(`현재 슬라이드 '${currentScene().title}' 을(를) 삭제할까요?`)) return;
  SCENES.splice(current, 1);
  renderScene(Math.max(0, current - 1));
}

function exportJson() {
  const blob = new Blob([JSON.stringify(SCENES, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenes-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function handleSceneImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있어요.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === "string") {
      scenePanoramaInput.value = result;
    }
  };
  reader.readAsDataURL(file);
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
saveTagBtn.addEventListener("click", upsertTag);
deleteTagBtn.addEventListener("click", removeTag);
closeDialog.addEventListener("click", () => tagDialog.close());

saveSceneBtn.addEventListener("click", saveScene);
closeSceneDialogBtn.addEventListener("click", () => sceneDialog.close());
sceneImageUpload.addEventListener("change", handleSceneImageUpload);

renderScene(0);
