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

export function fromRemoteTodo(item) {
  if (!item || typeof item !== "object") return null;

  const transformed = {
    id: `remote-${item.id}`, // Строка с префиксом и номером
    title: typeof item.title === "string" ? item.title.trim() : "",
    done: Boolean(item.completed),
    priority: "normal",
    createdAt: new Date().toISOString(),
  };

  // Если после трансформации задача не валидна, возвращаем null
  return isValidTask(transformed) ? transformed : null;
}
