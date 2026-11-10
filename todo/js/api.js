const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export async function request(path, options = {}) {
  const { method = "GET", body, signal } = options;
  const timeoutSignal = AbortSignal.timeout(5000);

  // 🛡 ИСПРАВЛЕННАЯ ЛОГИКА ОПРЕДЕЛЕНИЯ URL:
  let url;
  if (path.startsWith(".") || path.startsWith("http")) {
    // Локальный файл (data/tasks.json) или уже полный URL
    url = path;
  } else {
    // Путь к внешнему API (например, '/todos' или '/todos/1')
    url = `${API_BASE_URL}${path}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: signal ?? timeoutSignal,
    });

    if (!response.ok) {
      const error = new Error(`Ошибка сервера: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    // Стандартизируем ошибки для простоты обработки в main.js
    if (error.name === "AbortError") throw new Error("TIMEOUT");
    if (error.name === "TypeError") throw new Error("NETWORK");
    if (error.name === "SyntaxError") throw new Error("SYNTAX");

    // Пробрасываем ошибки сервера (с status) как есть
    throw error;
  }
}

export function getNetworkErrorMessage(error) {
  if (error.message === "TIMEOUT") return "Сервер не ответил вовремя";
  if (error.message === "NETWORK") return "Нет соединения с сервером";
  if (error.message === "SYNTAX") return "Сервер прислал испорченные данные";
  if (error.status) return `Ошибка сервера: ${error.status}`;
  return "Произошла неизвестная ошибка";
}

// ==========================================
// ФУНКЦИИ ДЛЯ БОНУСНОГО ЗАДАНИЯ (Синхронизация)
// ==========================================

export async function createRemoteTask(task) {
  return await request("/todos", {
    method: "POST",
    body: { title: task.title, completed: task.done, userId: 1 },
  });
}

export async function updateRemoteTask(id, done) {
  return await request(`/todos/${id}`, {
    method: "PATCH",
    body: { completed: done },
  });
}

export async function deleteRemoteTask(id) {
  return await request(`/todos/${id}`, { method: "DELETE" });
}
