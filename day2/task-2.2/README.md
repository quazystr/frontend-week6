# Day 2, Task 2.2: Три исхода запроса

Функция `loadAndReport(url)` обрабатывает запрос и выводит в консоль строго одну строку, классифицируя результат. Ниже приведены результаты для четырех сценариев.

## 1. Успешная загрузка: `../data/products.json`

- Что в консоли: `ок: 8 товаров`
- Что во вкладке Network: Status 200, Type json, Size ~550 B, Time ~10 ms

## 2. Файл не найден: `../data/missing.json`

- Что в консоли: `сервер ответил ошибкой: 404`
- Что во вкладке Network: Status 404, Type html (Live Server отдает страницу 404), Size ~150 B

## 3. Невалидный JSON: `../data/broken.json`

- Что в консоли: `испорченные данные: SyntaxError`
- Что во вкладке Network: Status 200, Type json, Size ~60 B. Вкладка Preview показывает невалидный JSON с лишней запятой.

## 4. Офлайн режим: `../data/products.json` с галочкой Offline

- Что в консоли: `нет ответа: TypeError`
- Что во вкладке Network: Status (failed), Type fetch, Size 0 B, Time 0 ms. Браузер даже не пытается выйти в сеть.

## Как проверить Offline-режим

1. Открыть DevTools (F12) → вкладка Network (Сеть).
2. Найти выпадающий список рядом с иконкой Wi-Fi (где написано "No throttling").
3. Поставить галочку Offline (Автономный режим).
4. Обновить страницу. Запрос к `products.json` мгновенно упадет с `TypeError`.
