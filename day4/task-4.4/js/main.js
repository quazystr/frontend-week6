import { request, getErrorMessage } from "./api.js";

const searchInput = document.getElementById("search-input");
const searchHint = document.getElementById("search-hint");
const statusBlock = document.querySelector(".status");
const statusText = document.getElementById("status-text");
const resultsList = document.getElementById("results-list");
const postTemplate = document.getElementById("post-template");

let searchTimeout = null;
let abortController = null;

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  results: [],
  error: "",
};

function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  // Управление статусом
  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) statusText.textContent = "Поиск...";
  if (isError) statusText.textContent = state.error;

  // Управление списком
  resultsList.hidden = !isSuccess;

  if (isSuccess) {
    resultsList.replaceChildren();

    if (state.results.length === 0) {
      // Создаем элемент списка для сообщения "Ничего не найдено"
      const emptyItem = document.createElement("li");
      emptyItem.className = "card";
      emptyItem.textContent = `Ничего не найдено по запросу «${searchInput.value.trim()}»`;
      resultsList.appendChild(emptyItem);
    } else {
      for (const post of state.results) {
        const clone = postTemplate.content.firstElementChild.cloneNode(true);
        clone.querySelector(".card__title").textContent = post.title;
        clone.querySelector(".card__text").textContent = post.body;
        resultsList.appendChild(clone);
      }
    }
  } else {
    resultsList.replaceChildren();
  }
}

function handleInput() {
  // 1. Очищаем предыдущий таймер
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const query = searchInput.value.trim();

  // 2. Валидация: пустая строка или только пробелы
  if (query === "") {
    searchHint.textContent = "Введите запрос";
    state.status = "idle";
    state.results = [];
    state.error = "";

    // Отменяем текущий запрос, если он идет
    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    render();
    return;
  } else {
    searchHint.textContent = "";
  }

  // 3. Устанавливаем новый таймер на 300 мс
  searchTimeout = setTimeout(async () => {
    // 4. Отменяем предыдущий запрос, если он еще выполняется
    if (abortController) {
      abortController.abort();
    }

    // 5. Создаем новый контроллер для текущего запроса
    abortController = new AbortController();

    state.status = "loading";
    state.error = "";
    render();

    try {
      // Передаем signal в request
      const data = await request(`/posts?q=${encodeURIComponent(query)}`, {
        signal: abortController.signal,
      });

      state.results = data;
      state.status = "success";
    } catch (error) {
      const message = getErrorMessage(error);
      if (message) {
        // Если это не AbortError (который возвращает null)
        state.error = message;
        state.status = "error";
      }
    }

    render();
  }, 300);
}

searchInput.addEventListener("input", handleInput);

// Инициализация
render();
