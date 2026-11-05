import { getJson } from "./api.js";

// 1. Функция строгой проверки одной задачи
function isValidTodo(item) {
  // Сначала проверяем, что это объект и не null
  if (typeof item !== "object" || item === null) {
    return false;
  }

  // userId и id должны быть целыми числами больше нуля
  if (!Number.isInteger(item.userId) || item.userId <= 0) return false;
  if (!Number.isInteger(item.id) || item.id <= 0) return false;

  // title должен быть строкой и не быть пустым после trim
  if (typeof item.title !== "string" || item.title.trim() === "") return false;

  // completed должен быть строго булевым значением (true или false)
  if (typeof item.completed !== "boolean") return false;

  return true;
}

// 2. Функция фильтрации массива
function pickValid(items) {
  // Если пришел не массив, сразу возвращаем пустой массив (защита от ошибок)
  if (!Array.isArray(items)) {
    return [];
  }

  // Оставляем только те элементы, которые проходят проверку isValidTodo
  return items.filter(isValidTodo);
}

// 3. Запуск тестов
async function runTests() {
  console.log("=== Тест 1: Проверка реального ответа API ===");
  try {
    const rawTodos = await getJson(
      "https://jsonplaceholder.typicode.com/todos?userId=1",
    );
    const validTodos = pickValid(rawTodos);
    console.log(
      `Всего получено: ${rawTodos.length}, Валидных после фильтрации: ${validTodos.length}`,
    );
  } catch (error) {
    console.error("Ошибка загрузки:", error.message);
  }

  console.log("\n=== Тест 2: Ручной массив с мусором ===");
  const manualArray = [
    null, // Не объект
    "задача", // Строка, а не объект
    { id: "1", title: "x", completed: false, userId: 1 }, // id - строка, а не число
    { id: 2, title: "   ", completed: false, userId: 1 }, // title состоит только из пробелов
    { id: 3, title: "ok", completed: "false", userId: 1 }, // completed - строка, а не boolean
    { id: 4, title: "Правильная задача", completed: true, userId: 1 }, // Единственная валидная задача
  ];

  const filteredManual = pickValid(manualArray);
  console.log("Отфильтрованный массив:", filteredManual);
  console.log(`Осталось задач: ${filteredManual.length} (ожидается ровно 1)`);

  console.log("\n=== Тест 3: Передача объекта вместо массива ===");
  const resultForObject = pickValid({});
  console.log("Результат pickValid({}):", resultForObject);
  console.log("Это массив?", Array.isArray(resultForObject));
  console.log("Ошибка не выброшена? Да, код выполнился дальше.");
}

runTests();
