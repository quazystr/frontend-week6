import { formatPrice, formatDate } from "./format.js";

console.log("=== Проверка formatPrice ===");
console.log("пустая строка:", formatPrice(""));
console.log("null:", formatPrice(null));
console.log('строка "abc":', formatPrice("abc"));
console.log("число 0:", formatPrice(0));
console.log("отрицательное число:", formatPrice(-150));
console.log("валидное число 1500:", formatPrice(1500));

console.log("=== Проверка formatDate ===");
console.log("пустая строка:", formatDate(""));
console.log("null:", formatDate(null));
console.log('строка "abc":', formatDate("abc"));
console.log("число 0 (эпоха Unix):", formatDate(0));
console.log("валидная ISO строка:", formatDate("2026-10-20T10:15:00.000Z"));
console.log('неверная дата "2026-13-45":', formatDate("2026-13-45"));
