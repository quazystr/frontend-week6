export async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`Сервер ответил ошибкой ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

export function getErrorMessage(error) {
  if (error.name === "TypeError") {
    return "Нет соединения с сервером";
  }
  if (error.status === 404) {
    return "Данные не найдены";
  }
  if (error.name === "SyntaxError") {
    return "Сервер прислал испорченные данные";
  }
  if (error.status) {
    return `Ошибка сервера: ${error.status}`;
  }
  return "Произошла неизвестная ошибка";
}
