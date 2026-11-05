import { getJson } from "./api.js";

async function runTests() {
  console.log("=== Тест 1: Задачи пользователя 1 ===");
  try {
    const todos = await getJson(
      "https://jsonplaceholder.typicode.com/todos?userId=1",
    );
    console.log(`Всего задач: ${todos.length}`);
    const firstThreeTitles = todos.slice(0, 3).map((task) => task.title);
    console.log("Первые три названия:", firstThreeTitles);
  } catch (error) {
    console.error("Ошибка:", error.message);
  }

  console.log("\n=== Тест 2: Задачи пользователя 1 с лимитом 5 ===");
  try {
    const limitedTodos = await getJson(
      "https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5",
    );
    console.log(`Всего задач с лимитом: ${limitedTodos.length}`);
  } catch (error) {
    console.error("Ошибка:", error.message);
  }

  console.log("\n=== Тест 3: Несуществующий ID (99999) ===");
  // Делаем "сырой" fetch без нашей функции getJson, чтобы показать, что бывает без проверки response.ok
  const rawResponse = await fetch(
    "https://jsonplaceholder.typicode.com/todos/99999",
  );
  console.log("Статус ответа:", rawResponse.status);

  const rawBody = await rawResponse.json();
  console.log("Тело ответа:", rawBody);
}

runTests();
