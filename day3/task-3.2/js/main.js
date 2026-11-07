import { getJson, getErrorMessage } from "./api.js";

// ==========================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==========================================
const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  products: [],
  error: "",
  currentUrl: "../data/products.json", // Текущий URL для загрузки
};

// ==========================================
// DOM-ЭЛЕМЕНТЫ
// ==========================================
const statusBlock = document.getElementById("status");
const statusText = document.getElementById("status-text");
const retryBtn = document.getElementById("retry-btn");
const cardList = document.getElementById("card-list");
const productTemplate = document.getElementById("product-template");
const dataSourceSelect = document.getElementById("data-source");

// ==========================================
// ОТРИСОВКА (ОДНА ФУНКЦИЯ НА ВСЁ)
// ==========================================
function render() {
  // 1. Блок состояния
  if (state.status === "loading") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--loading";
    statusText.textContent = "Загрузка товаров...";
    retryBtn.hidden = true;
    retryBtn.disabled = true;
  } else if (state.status === "error") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--error";
    statusText.textContent = state.error;
    retryBtn.hidden = false;
    retryBtn.disabled = false;
  } else {
    statusBlock.hidden = true;
  }

  // 2. Список карточек
  if (state.status === "success") {
    cardList.hidden = false;
    renderCards();
  } else {
    cardList.hidden = true;
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
  if (state.status === "loading") return;

  state.status = "loading";
  state.error = "";
  render();

  try {
    state.products = await getJson(state.currentUrl);
    state.status = "success";
  } catch (error) {
    state.error = getErrorMessage(error);
    state.status = "error";
  }

  render();
}

// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

// Изменение источника данных
dataSourceSelect.addEventListener("change", () => {
  state.currentUrl = dataSourceSelect.value;
  loadProducts();
});

// Кнопка "Повторить"
retryBtn.addEventListener("click", () => {
  loadProducts();
});

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================
loadProducts();
