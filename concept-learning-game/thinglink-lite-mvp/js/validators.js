export function validateSceneInput({ title, type, media }) {
  if (!title) return "제목은 필수입니다.";
  if (!media) return "미디어 URL은 필수입니다.";
  if (type === "model") {
    const lower = media.toLowerCase();
    const ok = lower.endsWith(".glb") || lower.endsWith(".gltf") || media.startsWith("blob:") || media.startsWith("data:model") || media.startsWith("https://") || media.startsWith("http://");
    if (!ok) return "3D 모델은 .glb/.gltf URL(또는 업로드 blob URL)을 권장합니다.";
  }
  return null;
}

export function validateTagTitle(title) {
  if (!title || !title.trim()) return "태그 제목은 필수입니다.";
  return null;
}
