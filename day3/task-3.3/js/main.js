import { getJson, getErrorMessage } from "./api.js";

// ==========================================
// 1. СОСТОЯНИЕ
// ==========================================
const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  products: [],
  error: "",
  url: "../data/products.json",
};

// ==========================================
// 2. DOM-ЭЛЕМЕНТЫ
// ==========================================
const statusBlock = document.querySelector(".status");
const statusText = document.querySelector(".status__text");
const retryButton = document.querySelector(".status__retry");
const emptyBlock = document.querySelector(".empty");
const cardList = document.querySelector(".card-list");
const productTemplate = document.querySelector(".product-template");
const sourceSelect = document.querySelector(".source__control");

// ==========================================
// 3. ОТРИСОВКА
// ==========================================
function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isEmpty = state.status === "success" && state.products.length === 0;
  const hasProducts = state.status === "success" && state.products.length > 0;

  // Блок состояния: только загрузка и ошибка
  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) {
    statusText.textContent = "Загрузка товаров...";
  } else if (isError) {
    statusText.textContent = state.error;
  }

  retryButton.hidden = !isError;
  retryButton.disabled = isLoading;

  // Пустой результат: ни загрузки, ни ошибки
  emptyBlock.hidden = !isEmpty;

  // Список карточек
  cardList.hidden = !hasProducts;
  if (hasProducts) {
    renderCards();
  } else {
    cardList.replaceChildren();
  }
}

function renderCards() {
  cardList.replaceChildren();

  for (const product of state.products) {
    const card = productTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".card__title").textContent = product.title;
    card.querySelector(".card__text").textContent = product.category;
    card.querySelector(".card__price").textContent =
      `${product.price.toLocaleString("ru-RU")} руб.`;

    cardList.append(card);
  }
}

// ==========================================
// 4. ЗАГРУЗКА ДАННЫХ
// ==========================================
async function loadProducts() {
  if (state.status === "loading") return;

  state.status = "loading";
  state.error = "";
  render();

  try {
    const data = await getJson(state.url);

    // Проверяем форму ответа: каталог ждёт массив
    if (!Array.isArray(data)) {
      throw new SyntaxError("Ожидался массив товаров");
    }

    state.products = data;
    state.status = "success";
  } catch (error) {
    state.products = [];
    state.error = getErrorMessage(error);
    state.status = "error";
  }

  // render вне try: ошибка вёрстки не должна маскироваться под ошибку сети
  render();
}

// ==========================================
// 5. ОБРАБОТЧИКИ
// ==========================================
sourceSelect.addEventListener("change", () => {
  state.url = sourceSelect.value;
  loadProducts();
});

retryButton.addEventListener("click", () => {
  loadProducts();
});

// ==========================================
// 6. ИНИЦИАЛИЗАЦИЯ
// ==========================================
loadProducts();
