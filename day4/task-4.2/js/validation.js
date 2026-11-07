export function isValidPostTitle(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function isValidPostBody(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= 10 && trimmed.length <= 1000;
}

export function getValidationErrorMessage(field) {
  if (field === "title") return "Заголовок должен быть от 3 до 100 символов";
  if (field === "body") return "Текст должен быть от 10 до 1000 символов";
  return "Некорректное значение";
}
