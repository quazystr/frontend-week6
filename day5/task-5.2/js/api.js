const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function request(path, options = {}) {
  const { method = "GET", body, signal } = options;
  const timeoutSignal = AbortSignal.timeout(5000);

  // 🛡 УМНАЯ ПРОВЕРКА ПУТИ:
  let url;
  if (path.startsWith("http")) {
    url = path; // Полный внешний URL (если вдруг передадут)
  } else if (path.startsWith(".")) {
    url = path; // Локальный файл (например, '../data/products.json')
  } else {
    url = `${BASE_URL}${path}`; // Путь к API (например, '/users' или '/todos')
  }

  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: signal ?? timeoutSignal,
    });

    if (!response.ok) {
      const error = new Error(`Сервер ответил ошибкой ${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;

    if (error.name === "TypeError") {
      const networkError = new Error("Нет соединения с сервером");
      networkError.name = "TypeError";
      throw networkError;
    }

    throw error;
  }
}

export function getErrorMessage(error) {
  if (error.name === "AbortError") return null;
  if (error.name === "TypeError") return "Нет соединения с сервером";
  if (error.status === 404) return "Данные не найдены";
  if (error.name === "SyntaxError") return "Сервер прислал испорченные данные";
  if (error.status) return `Ошибка сервера: ${error.status}`;
  return "Произошла неизвестная ошибка";
}
