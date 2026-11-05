const PREFIX = "week6:";

export function loadJson(key, fallback) {
  const fullKey = PREFIX + key;
  const raw = localStorage.getItem(fullKey);

  // Если ключа нет, getItem вернет null
  if (raw === null) {
    return fallback;
  }

  // Пытаемся распарсить JSON. Если строка невалидна, сработает catch
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function saveJson(key, value) {
  const fullKey = PREFIX + key;

  try {
    // JSON.stringify упадет с ошибкой на циклических ссылках
    const jsonString = JSON.stringify(value);
    localStorage.setItem(fullKey, jsonString);
    return true;
  } catch (error) {
    // Ловим ошибку и возвращаем false, чтобы приложение не упало
    return false;
  }
}
