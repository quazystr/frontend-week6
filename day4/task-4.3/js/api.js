const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function request(path, options = {}) {
  const { method = "GET", body, timeout = 5000 } = options;

  // Создаем сигнал, который автоматически прервет запрос через указанное время
  const timeoutSignal = AbortSignal.timeout(timeout);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: timeoutSignal,
    });

    if (!response.ok) {
      const error = new Error(`Сервер ответил ошибкой ${response.status}`);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    // AbortSignal.timeout выбрасывает ошибку с именем 'AbortError'
    if (error.name === "AbortError") {
      throw error;
    }

    if (error.name === "TypeError") {
      const networkError = new Error("Нет соединения с сервером");
      networkError.name = "TypeError";
      throw networkError;
    }

    throw error;
  }
}

export function getErrorMessage(error) {
  // Проверяем, был ли это именно таймаут
  if (error.name === "AbortError") {
    if (error.message.includes("timeout")) {
      return "Сервер не ответил за 3 секунды";
    }
    return null; // Обычная отмена запроса, не показываем ошибку
  }

  if (error.name === "TypeError") return "Нет соединения с сервером";
  if (error.status === 404) return "Данные не найдены";
  if (error.name === "SyntaxError") return "Сервер прислал испорченные данные";
  if (error.status) return `Ошибка сервера: ${error.status}`;

  return "Произошла неизвестная ошибка";
}
