export function isEmpty(text) {
  if (typeof text !== "string") return false;
  return text.trim() === "";
}

export function isValidName(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= 2 && trimmed.length <= 40;
}

export function isEmail(text) {
  if (typeof text !== "string") return false;

  const trimmed = text.trim();
  if (trimmed === "") return false;

  // Разделяем по символу @
  const parts = trimmed.split("@");

  // Должен быть ровно один символ @ (значит, частей должно быть ровно 2)
  if (parts.length !== 2) return false;

  const localPart = parts[0];
  const domainPart = parts[1];

  // До @ не пусто
  if (localPart === "") return false;

  // После @ есть точка
  if (!domainPart.includes(".")) return false;

  // Точка не является последним символом
  if (domainPart.endsWith(".")) return false;

  return true;
}

export function getGrade(score) {
  // 1. Явно отсекаем null, boolean, пустые строки и строки из пробелов
  if (score === null || typeof score === "boolean") {
    return "некорректный балл";
  }
  if (typeof score === "string" && score.trim() === "") {
    return "некорректный балл";
  }

  // 2. Пытаемся преобразовать в число (строка "80" станет числом 80)
  const num = Number(score);

  // 3. Проверяем, что получилось валидное число в диапазоне 0-100
  if (Number.isNaN(num) || num < 0 || num > 100) {
    return "некорректный балл";
  }

  // 4. Определяем оценку
  if (num >= 90) return "отлично";
  if (num >= 75) return "хорошо";
  if (num >= 60) return "удовлетворительно";

  // Если число валидно и меньше 60, оно автоматически попадает сюда (0-59)
  return "не сдано";
}
