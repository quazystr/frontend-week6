const STORAGE_KEY = "week6:todo-tasks";

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
