# Day 1, Task 1.4: Ошибки загрузки модулей

В ходе выполнения задания были поочередно внесены три ошибки в код из Task 1.1. Ниже задокументированы результаты, вкладки DevTools, где они видны, и способы исправления.

---

## Поломка 1: Отсутствие расширения .js в пути импорта

**Что сделано:** В `main.js` изменен импорт на:  
`import { formatPrice } from './format';`

**Где видна ошибка:**

- **Console:** Выводит ошибку разрешения модуля.
- **Network:** Вкладка Network показывает запрос к файлу `format` со статусом **404 (Not Found)** или ошибкой MIME-type (браузер ожидает JavaScript, а сервер отдает HTML-страницу 404).

**Текст ошибки (Chrome/Edge):**  
`TypeError: Failed to resolve module specifier "./format". Relative references must start with either "/", "./", or "../".`  
_(Или: `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".`)_

**Как исправил:**  
Добавил явное расширение файла, как того требует спецификация ES-модулей в браузере:  
`import { formatPrice } from './format.js';`

---

## Поломка 2: Импорт несуществующей функции

**Что сделано:** В `main.js` изменен импорт на:  
`import { formatMoney } from './format.js';`  
(при этом в `format.js` экспортируется только `formatPrice` и `formatDate`).

**Где видна ошибка:**

- **Console:** Выводит синтаксическую ошибку парсинга модуля.

**Текст ошибки:**  
`SyntaxError: The requested module './format.js' does not provide an export named 'formatMoney'`

**Как исправил:**  
Проверил имя экспорта в исходном файле `format.js` и исправил опечатку в импорте на корректное имя:  
`import { formatPrice } from './format.js';`

---

## Поломка 3: Вызов функции без её импорта

**Что сделано:** В `main.js` полностью удалена строка `import`, но оставлен вызов:  
`console.log('1500:', formatPrice(1500));`

**Где видна ошибка:**

- **Console:** Выводит ошибку времени выполнения (ReferenceError) в момент попытки обратиться к переменной.

**Текст ошибки:**  
`ReferenceError: formatPrice is not defined`  
_(С указанием номера строки в main.js, где произошел вызов)_

**Как исправил:**  
Вернул строку импорта в начало файла `main.js`, чтобы связать имя функции с её реализацией из другого модуля:  
`import { formatPrice } from './format.js';`

---

## Вывод

Браузеры строго контролируют загрузку модулей. Ошибки пути и отсутствующих экспортов ловятся на этапе **загрузки/парсинга** (SyntaxError/TypeError), а попытки использовать неимпортированные переменные ловятся на этапе **выполнения** (ReferenceError). Вкладка Network полезна для диагностики проблем с путями (404), а Console — для диагностики логических и синтаксических ошибок JS.
