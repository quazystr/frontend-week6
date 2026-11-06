import { getJson } from "./api.js";

async function testExecutionOrder() {
  try {
    console.log("1: до запроса");

    const promise = getJson("../data/products.json");
    console.log("2: после вызова", promise);

    const products = await promise;
    console.log("3: пришло", products.length);
  } catch (error) {
    // "Проверка дня": каждая ошибка поймана и выведена с подписью
    console.error(
      "Ошибка при проверке порядка выполнения:",
      error.name,
      "-",
      error.message,
    );
  }
}

testExecutionOrder();
