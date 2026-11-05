export async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`Сервер ответил ошибкой ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}
