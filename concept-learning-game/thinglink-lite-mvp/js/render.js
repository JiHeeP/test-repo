import { hexToAlpha } from "./utils.js";

export function applyHotspotStyle(el, tag) {
  el.dataset.icon = tag.icon || "i";
  el.classList.add(`hotspot-${tag.size || "md"}`);
  el.style.background = tag.color || "#f43f5e";
  el.style.boxShadow = `0 0 0 6px ${hexToAlpha(tag.color || "#f43f5e", 0.25)}`;
}

export function build360({ viewerEl, scene, onHotspotClick, onAddTag }) {
  const viewer = pannellum.viewer(viewerEl.id, {
    type: "equirectangular",
    panorama: scene.panorama,
    autoLoad: true,
    hotSpots: scene.tags.map((tag, tagIndex) => ({
      pitch: tag.pitch,
      yaw: tag.yaw,
      createTooltipFunc: (hotSpotDiv, args) => {
        hotSpotDiv.classList.add("custom-hotspot");
        applyHotspotStyle(hotSpotDiv, args.tag);
        if (args.tag.displayMode === "text") {
          const badge = document.createElement("span");
          badge.className = "text-badge";
          badge.textContent = args.tag.title;
          hotSpotDiv.appendChild(badge);
        }
        hotSpotDiv.addEventListener("click", () => onHotspotClick(args.tag, tagIndex));
      },
      createTooltipArgs: { tag, tagIndex },
    })),
  });

  viewerEl.onclick = (e) => {
    const coords = viewer.mouseEventToCoords(e);
    if (!coords) return;
    onAddTag({ pitch: coords[0], yaw: coords[1] });
  };

  return viewer;
}

export function buildOverlay({ layerEl, tags, onHotspotClick, onAddTag, onDragEnd }) {
  layerEl.innerHTML = "";

  tags.forEach((tag, tagIndex) => {
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

    dot.addEventListener("pointerdown", (ev) => {
      dragging = true;
      moved = false;
      dot.classList.add("dragging");
      dot.setPointerCapture(ev.pointerId);
    });

    dot.addEventListener("pointermove", (ev) => {
      if (!dragging) return;
      moved = true;
      const rect = layerEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
      dot.style.left = `${x}%`;
      dot.style.top = `${y}%`;
      onDragEnd(tagIndex, x, y, false);
    });

    dot.addEventListener("pointerup", () => {
      dragging = false;
      dot.classList.remove("dragging");
      onDragEnd(tagIndex, null, null, true);
    });

    dot.addEventListener("click", () => {
      if (moved) return;
      onHotspotClick(tag, tagIndex);
    });

    layerEl.appendChild(dot);
  });

  layerEl.onclick = (e) => {
    if (e.target !== layerEl) return;
    const rect = layerEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddTag({ x, y });
  };
}
