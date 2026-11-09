const STORAGE_KEY = "week6:todo-tasks";

// Проверяет, существует ли ключ вообще (даже если там '[]')
export function hasTasksInStorage() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasksToSave) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    return true;
  } catch {
    return false;
  }
}
