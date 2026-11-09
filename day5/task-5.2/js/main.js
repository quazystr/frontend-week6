import { getErrorMessage, request } from "./api.js";

const CACHE_KEY = "week6:products-cache";

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error' | 'cached'
  products: [],
  error: "",
  cacheTime: null,
};

const cacheAlert = document.getElementById("cache-alert");
const cacheAlertText = document.getElementById("cache-alert-text");
const statusBlock = document.querySelector(".status");
const statusText = document.getElementById("status-text");
const retryBtn = document.getElementById("retry-btn");
const cardList = document.getElementById("card-list");
const productTemplate = document.getElementById("product-template");

// ==========================================
// РАБОТА С КЭШЕМ (Безопасная)
// ==========================================
function saveToCache(products) {
  try {
    const payload = {
      data: products,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Игнорируем ошибки квоты (QuotaExceededError), чтобы не ломать приложение
    console.warn("Не удалось сохранить кэш:", e);
  }
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Простая валидация структуры кэша
    if (
      !parsed ||
      !Array.isArray(parsed.data) ||
      typeof parsed.timestamp !== "number"
    ) {
      return null; // Испорченный кэш игнорируется
    }

    return parsed;
  } catch (e) {
    // Если JSON.parse упал (ручная порча данных в DevTools), возвращаем null
    // Приложение не сломается, а просто подумает, что кэша нет
    return null;
  }
}

// ==========================================
// ОТРИСОВКА
// ==========================================
function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isSuccess = state.status === "success";
  const isCached = state.status === "cached";

  // 1. Управление алертом кэша
  if (isCached) {
    cacheAlert.hidden = false;
    const date = new Date(state.cacheTime);
    // Форматируем время как "14:05"
    const timeString = date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    cacheAlertText.textContent = `Нет связи с сервером. Показаны данные от ${timeString}`;
  } else {
    cacheAlert.hidden = true;
  }

  // 2. Управление блоком состояния (загрузка/ошибка)
  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) {
    statusText.textContent = "Загрузка товаров...";
    retryBtn.hidden = true;
  } else if (isError) {
    statusText.textContent = state.error;
    retryBtn.hidden = false;
  }

  // 3. Управление списком карточек
  const shouldShowCards = isSuccess || isCached;
  cardList.hidden = !shouldShowCards;

  if (shouldShowCards) {
    renderCards();
  } else {
    cardList.replaceChildren();
  }
}

function renderCards() {
  cardList.replaceChildren();
  for (const product of state.products) {
    const clone = productTemplate.content.firstElementChild.cloneNode(true);
    clone.querySelector(".card__title").textContent = product.title;
    clone.querySelector(".card__text").textContent = product.category;
    clone.querySelector(".card__price").textContent =
      `${product.price.toLocaleString("ru-RU")} руб.`;
    cardList.appendChild(clone);
  }
}

// ==========================================
// ЗАГРУЗКА ДАННЫХ
// ==========================================
async function loadProducts() {
  state.status = "loading";
  state.error = "";
  render();

  try {
    const data = await request("../data/products.json");

    if (!Array.isArray(data)) {
      throw new SyntaxError("Ожидался массив товаров");
    }

    state.products = data;
    state.status = "success";

    // Успешная загрузка: сохраняем в кэш
    saveToCache(data);
  } catch (error) {
    // Ошибка сети или сервера: пытаемся достать кэш
    const cached = loadFromCache();

    if (cached) {
      state.products = cached.data;
      state.cacheTime = cached.timestamp;
      state.status = "cached"; // Специальный статус для отображения карточек + алерта
    } else {
      state.error = getErrorMessage(error);
      state.status = "error";
    }
  }

  render();
}

// ==========================================
// ОБРАБОТЧИКИ
// ==========================================
retryBtn.addEventListener("click", () => {
  loadProducts();
});

// Инициализация
loadProducts();
