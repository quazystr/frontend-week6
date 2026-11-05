import { loadJson, saveJson } from "./storage.js";

// Очищаем хранилище перед тестами для чистоты эксперимента (опционально, но полезно)
localStorage.removeItem("week6:test1");
localStorage.removeItem("week6:test2");
localStorage.removeItem("week6:test3");
localStorage.removeItem("week6:test4");
localStorage.removeItem("week6:test5");

console.log("=== Проверка loadJson и saveJson ===\n");

// 1. Ключа нет
console.log("1. Ключа нет:", loadJson("test1", "fallback_value"));

// 2. Лежит '[1,2]'
localStorage.setItem("week6:test2", "[1,2]");
console.log("2. Валидный JSON [1,2]:", loadJson("test2", "fallback_value"));

// 3. Лежит оборванная строка '{"a":'
localStorage.setItem("week6:test3", '{"a":');
console.log('3. Оборванная строка {"a":', loadJson("test3", "fallback_value"));

// 4. Лежит строка 'undefined'
localStorage.setItem("week6:test4", "undefined");
console.log('4. Строка "undefined":', loadJson("test4", "fallback_value"));

// 5. saveJson с объектом, который ссылается сам на себя
const circularObj = {};
circularObj.self = circularObj;

const saveResult = saveJson("test5", circularObj);
console.log("5. saveJson с циклической ссылкой (вернул):", saveResult);

// Дополнительная проверка: убедимся, что приложение не упало и код выполняется дальше
console.log("\n✅ Приложение продолжает работать после всех проверок!");
