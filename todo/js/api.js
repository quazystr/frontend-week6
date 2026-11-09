export async function loadInitialTasks() {
  const response = await fetch("data/tasks.json");
  if (!response.ok) {
    throw new Error("Не удалось загрузить стартовые задачи");
  }
  return await response.json();
}

export async function importFromExternalApi() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
  );
  if (!response.ok) {
    throw new Error("Ошибка при импорте задач");
  }
  return await response.json();
}
