const BASE_URL = "https://jsonplaceholder.typicode.com";

export async function request(path, options = {}) {
  const { method = "GET", body, signal } = options;
  const timeoutSignal = AbortSignal.timeout(5000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
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
  if (error.name === "TypeError")
    return "Нет соединения с сервером. Проверьте интернет.";
  if (error.status === 404) return "Данные не найдены";
  if (error.name === "SyntaxError") return "Сервер прислал испорченные данные";
  if (error.status) return `Ошибка сервера: ${error.status}`;
  return "Произошла неизвестная ошибка";
}
