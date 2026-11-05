import { getJson } from "./api.js";

export async function loadAndReport(url) {
  try {
    const data = await getJson(url);
    console.log(`ок: ${data.length} товаров`);
  } catch (error) {
    if (error.name === "TypeError") {
      console.log("нет ответа: TypeError");
    } else if (error.name === "SyntaxError") {
      console.log("испорченные данные: SyntaxError");
    } else if (error.status) {
      console.log(`сервер ответил ошибкой: ${error.status}`);
    } else {
      console.log(`неизвестная ошибка: ${error.message}`);
    }
  }
}

// === ЗАПУСК ТЕСТОВ ===

console.log("--- Тест 1: Успешная загрузка ---");
loadAndReport("../data/products.json");

console.log("--- Тест 2: Файл не найден (404) ---");
loadAndReport("../data/missing.json");

console.log("--- Тест 3: Невалидный JSON ---");
loadAndReport("../data/broken.json");

console.log("--- Тест 4: Офлайн режим ---");
console.log(
  '⚠️ ВНИМАНИЕ: Чтобы этот тест сработал, открой вкладку Network (Сеть), поставь галочку "Offline" (Автономный режим) и обнови страницу!',
);
loadAndReport("../data/products.json");
