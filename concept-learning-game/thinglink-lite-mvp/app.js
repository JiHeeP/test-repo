const slideList = document.getElementById("slideList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toggleAddModeBtn = document.getElementById("toggleAddMode");
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

let current = 0;
let viewer;
let addMode = false;
let editState = { tagIndex: null, pitch: null, yaw: null };

function currentScene() {
  return SCENES[current];
}

function hotspot(hotSpotDiv, args) {
  hotSpotDiv.classList.add("custom-hotspot");
  hotSpotDiv.addEventListener("click", () => {
    editState = { tagIndex: args.tagIndex, pitch: args.tag.pitch, yaw: args.tag.yaw };
    openDialog(args.tag, false);
  });
}

function openDialog(tag, isNew) {
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
  tagMedia.innerHTML = youtubeId
    ? `<iframe src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen></iframe>`
    : "";
}

function buildViewer(scene) {
  viewer = pannellum.viewer("viewer", {
    type: "equirectangular",
    panorama: scene.panorama,
    autoLoad: true,
    hotSpots: scene.tags.map((tag, tagIndex) => ({
      pitch: tag.pitch,
      yaw: tag.yaw,
      cssClass: "custom-hotspot",
      createTooltipFunc: hotspot,
      createTooltipArgs: { tag, tagIndex }
    }))
  });

  const container = document.getElementById("viewer");
  container.onclick = (e) => {
    if (!addMode || !viewer) return;
    const coords = viewer.mouseEventToCoords(e);
    if (!coords) return;
    editState = { tagIndex: null, pitch: coords[0], yaw: coords[1] };
    openDialog({ title: "", body: "", youtubeId: "" }, true);
  };
}

function renderScene(index) {
  current = index;
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  buildViewer(currentScene());

  [...slideList.querySelectorAll("button")].forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
  });
}

function renderSlides() {
  slideList.innerHTML = "";
  SCENES.forEach((scene, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}. ${scene.title}`;
    btn.addEventListener("click", () => renderScene(i));
    li.appendChild(btn);
    slideList.appendChild(li);
  });
}

function upsertTag() {
  const title = tagTitleInput.value.trim();
  const body = tagBodyInput.value.trim();
  const youtubeId = tagYoutubeInput.value.trim();
  if (!title) {
    alert("제목은 필수입니다.");
    return;
  }

  const payload = {
    pitch: editState.pitch,
    yaw: editState.yaw,
    title,
    body,
    ...(youtubeId ? { youtubeId } : {})
  };

  if (editState.tagIndex === null) {
    currentScene().tags.push(payload);
  } else {
    currentScene().tags[editState.tagIndex] = payload;
  }

  tagDialog.close();
  renderScene(current);
}

function removeTag() {
  if (editState.tagIndex === null) return;
  currentScene().tags.splice(editState.tagIndex, 1);
  tagDialog.close();
  renderScene(current);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(SCENES, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenes-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

prevBtn.addEventListener("click", () => {
  const next = (current - 1 + SCENES.length) % SCENES.length;
  renderScene(next);
});

nextBtn.addEventListener("click", () => {
  const next = (current + 1) % SCENES.length;
  renderScene(next);
});

toggleAddModeBtn.addEventListener("click", () => {
  addMode = !addMode;
  toggleAddModeBtn.classList.toggle("active", addMode);
  toggleAddModeBtn.textContent = `태그 추가 모드: ${addMode ? "ON" : "OFF"}`;
});

exportJsonBtn.addEventListener("click", exportJson);
tagYoutubeInput.addEventListener("input", renderMediaPreview);
saveTagBtn.addEventListener("click", upsertTag);
deleteTagBtn.addEventListener("click", removeTag);
closeDialog.addEventListener("click", () => tagDialog.close());

renderSlides();
renderScene(0);
