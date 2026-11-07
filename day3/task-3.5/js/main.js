import { getJson, getErrorMessage } from "./api.js";

const state = {
  status: "idle",
  users: [],
  error: "",
  url: "https://jsonplaceholder.typicode.com/users",
};

const statusBlock = document.querySelector(".status");
const statusText = document.querySelector(".status__text");
const retryButton = document.querySelector(".status__retry");
const emptyBlock = document.querySelector(".empty");
const cardList = document.querySelector(".card-list");
const userTemplate = document.querySelector(".user-template");
const sourceSelect = document.querySelector(".source__control");
const refreshButton = document.querySelector(".refresh-button");

function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isEmpty = state.status === "success" && state.users.length === 0;
  const hasUsers = state.status === "success" && state.users.length > 0;

  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) {
    statusText.textContent = "Загрузка пользователей...";
  } else if (isError) {
    statusText.textContent = state.error;
  }

  retryButton.hidden = !isError;
  retryButton.disabled = isLoading;
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Загрузка..." : "Обновить";

  emptyBlock.hidden = !isEmpty;
  cardList.hidden = !hasUsers;

  if (hasUsers) {
    renderUsers();
  } else {
    cardList.replaceChildren();
  }
}

function renderUsers() {
  cardList.replaceChildren();

  for (const user of state.users) {
    const card = userTemplate.content.firstElementChild.cloneNode(true);

    // БЕЗОПАСНОЕ ИЗВЛЕЧЕНИЕ ДАННЫХ
    // ?. защищает от ошибки, если address или company отсутствуют
    // ?? подставляет текст, если значение null или undefined

    const name = user.name ?? "Имя не указано";
    const email = user.email ?? "Email не указан";
    const city = user.address?.city ?? "Город не указан";
    const company = user.company?.name ?? "Компания не указана";

    // textContent автоматически экранирует HTML, предотвращая XSS
    card.querySelector(".card__name").textContent = name;
    card.querySelector(".card__email").textContent = email;
    card.querySelector(".card__city").textContent = `Город: ${city}`;
    card.querySelector(".card__company").textContent = `Компания: ${company}`;

    cardList.append(card);
  }
}

async function loadUsers() {
  if (state.status === "loading") return;

  state.status = "loading";
  state.error = "";
  render();

  try {
    const data = await getJson(state.url);

    if (!Array.isArray(data)) {
      throw new SyntaxError("Ожидался массив пользователей");
    }

    state.users = data;
    state.status = "success";
  } catch (error) {
    state.users = [];
    state.error = getErrorMessage(error);
    state.status = "error";
  }

  render();
}

sourceSelect.addEventListener("change", () => {
  state.url = sourceSelect.value;
  loadUsers();
});

retryButton.addEventListener("click", loadUsers);
refreshButton.addEventListener("click", loadUsers);

loadUsers();
