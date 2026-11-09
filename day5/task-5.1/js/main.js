import { request, getErrorMessage } from "./api.js";

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  data: null,
  error: "",
  selectedUserId: null,
};

// Счетчик для защиты от состояния гонки (race condition)
let requestToken = 0;

const userSelect = document.getElementById("user-select");
const statusBlock = document.querySelector(".status");
const statusText = document.getElementById("status-text");
const retryBtn = document.getElementById("retry-btn");
const userCard = document.getElementById("user-card");

const cardName = document.getElementById("card-name");
const cardEmail = document.getElementById("card-email");
const cardCity = document.getElementById("card-city");
const cardCompany = document.getElementById("card-company");
const cardTodos = document.getElementById("card-todos");

function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  // Управление select
  userSelect.disabled = isLoading;

  // Управление блоком состояния
  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) {
    statusText.textContent = "Загрузка данных...";
    retryBtn.hidden = true;
  }

  if (isError) {
    statusText.textContent = state.error;
    retryBtn.hidden = false;
  }

  // Управление карточкой
  userCard.hidden = !isSuccess;

  if (isSuccess && state.data) {
    cardName.textContent = state.data.name;
    cardEmail.textContent = state.data.email;
    cardCity.textContent = state.data.city;
    cardCompany.textContent = state.data.company;
    cardTodos.textContent = state.data.todosText;
  }
}

async function loadUserData(userId) {
  if (!userId) return;

  state.selectedUserId = userId;

  // 1. Увеличиваем счетчик и запоминаем текущее значение
  const currentToken = ++requestToken;

  state.status = "loading";
  state.error = "";
  state.data = null;
  render();

  try {
    // 2. Параллельные независимые запросы
    const [user, todos] = await Promise.all([
      request(`/users/${userId}`),
      request(`/todos?userId=${userId}`),
    ]);

    // 3. ЗАЩИТА ОТ ГОНКИ: если пока шли запросы, пользователь выбрал другого,
    // мы игнорируем результат этого "устаревшего" запроса.
    if (currentToken !== requestToken) {
      return;
    }

    // 4. Формируем данные для отображения
    const completedCount = todos.filter((todo) => todo.completed).length;

    state.data = {
      name: user.name,
      email: user.email,
      city: user.address.city,
      company: user.company.name,
      todosText: `Выполнено: ${completedCount} из ${todos.length}`,
    };

    state.status = "success";
  } catch (error) {
    // Проверка на гонку при ошибке
    if (currentToken !== requestToken) return;

    state.error = getErrorMessage(error);
    state.status = "error";
  }

  render();
}

// Обработчик выбора пользователя
userSelect.addEventListener("change", (event) => {
  loadUserData(event.target.value);
});

// Обработчик кнопки "Повторить"
retryBtn.addEventListener("click", () => {
  if (state.selectedUserId) {
    loadUserData(state.selectedUserId);
  }
});

// Инициализация: загрузка списка пользователей для select
async function init() {
  try {
    const users = await request("/users");

    // Очищаем select и добавляем опции
    userSelect.innerHTML = "";
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });

    // Загружаем данные для первого пользователя по умолчанию
    if (users.length > 0) {
      userSelect.value = users[0].id;
      loadUserData(users[0].id);
    }
  } catch (error) {
    userSelect.innerHTML = '<option value="">Ошибка загрузки списка</option>';
    state.status = "error";
    state.error = getErrorMessage(error);
    render();
  }
}

init();
