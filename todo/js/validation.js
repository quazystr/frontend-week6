export function isValidTitle(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

export function isValidTask(task) {
  if (!task || typeof task !== "object") return false;
  if (typeof task.id !== "string" || !task.id) return false;
  if (!isValidTitle(task.title)) return false;
  if (typeof task.done !== "boolean") return false;
  if (!["low", "normal", "high"].includes(task.priority)) return false;
  if (typeof task.createdAt !== "string") return false;
  return true;
}

export function transformExternalTask(externalTask) {
  return {
    id: crypto.randomUUID(), // Генерируем свой ID
    title:
      typeof externalTask.title === "string"
        ? externalTask.title.trim()
        : "Без названия",
    done: Boolean(externalTask.completed),
    priority: "normal",
    createdAt: new Date().toISOString(),
  };
}
