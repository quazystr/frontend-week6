export async function request(path, options = {}) {
  const { method = "GET", body, signal } = options;

  // Жесткий таймаут 5 секунд для всех запросов
  const timeoutSignal = AbortSignal.timeout(5000);

  try {
    const response = await fetch(path, {
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

    // Обработка ответов без тела (например, 204 No Content)
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    // Стандартизируем ошибки для простоты обработки в main.js
    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    if (error.name === "TypeError") {
      throw new Error("NETWORK");
    }
    if (error.name === "SyntaxError") {
      throw new Error("SYNTAX");
    }
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
