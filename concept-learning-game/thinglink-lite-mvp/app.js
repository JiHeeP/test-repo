const slideList = document.getElementById("slideList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const tagDialog = document.getElementById("tagDialog");
const tagTitle = document.getElementById("tagTitle");
const tagBody = document.getElementById("tagBody");
const tagMedia = document.getElementById("tagMedia");
const closeDialog = document.getElementById("closeDialog");

let current = 0;
let viewer;

function openTag(tag) {
  tagTitle.textContent = tag.title;
  tagBody.textContent = tag.body || "";
  tagMedia.innerHTML = tag.youtubeId
    ? `<iframe src="https://www.youtube.com/embed/${tag.youtubeId}" allowfullscreen></iframe>`
    : "";
  tagDialog.showModal();
}

function hotspot(hotSpotDiv, args) {
  hotSpotDiv.classList.add("custom-hotspot");
  hotSpotDiv.addEventListener("click", () => openTag(args.tag));
}

function buildViewer(scene) {
  viewer = pannellum.viewer("viewer", {
    type: "equirectangular",
    panorama: scene.panorama,
    autoLoad: true,
    hotSpots: scene.tags.map((tag) => ({
      pitch: tag.pitch,
      yaw: tag.yaw,
      cssClass: "custom-hotspot",
      createTooltipFunc: hotspot,
      createTooltipArgs: { tag }
    }))
  });
}

function renderScene(index) {
  current = index;
  const scene = SCENES[index];
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  buildViewer(scene);

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

prevBtn.addEventListener("click", () => {
  const next = (current - 1 + SCENES.length) % SCENES.length;
  renderScene(next);
});

nextBtn.addEventListener("click", () => {
  const next = (current + 1) % SCENES.length;
  renderScene(next);
});

closeDialog.addEventListener("click", () => tagDialog.close());

renderSlides();
renderScene(0);
