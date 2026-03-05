import { STORAGE_BACKUP_KEY, STORAGE_KEY } from "./config.js";

export function normalizeTag(t = {}) {
  return {
    displayMode: "card",
    icon: "i",
    size: "md",
    color: "#f43f5e",
    theme: "dark",
    ...t,
  };
}

export function normalizeScene(scene = {}, i = 0) {
  return {
    id: scene.id || `scene-${Date.now()}-${i}`,
    title: scene.title || `장면 ${i + 1}`,
    type: scene.type || "360",
    panorama: scene.panorama || "",
    tags: Array.isArray(scene.tags) ? scene.tags.map(normalizeTag) : [],
  };
}

export function loadScenes(fallbackScenes = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeScene);
    }
  } catch (_) {}
  return fallbackScenes.map(normalizeScene);
}

export function saveScenes(scenes) {
  const payload = JSON.stringify(scenes);
  localStorage.setItem(STORAGE_KEY, payload);
  localStorage.setItem(STORAGE_BACKUP_KEY, payload);
}

export function resetScenes(fallbackScenes = []) {
  localStorage.removeItem(STORAGE_KEY);
  return fallbackScenes.map(normalizeScene);
}

export function importScenesFromText(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed) || !parsed.length) throw new Error("장면 배열(JSON)이 아닙니다.");
  return parsed.map(normalizeScene);
}
