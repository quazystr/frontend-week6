import { request, getErrorMessage } from "./api.js";

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  photoCount: 0,
  errorMessage: "",
};

const loadBtn = document.getElementById("load-btn");
const retryBtn = document.getElementById("retry-btn");
const statusBlock = document.querySelector(".status");
const statusText = document.querySelector(".status__text");
const resultBlock = document.getElementById("result");
const resultText = document.getElementById("result-text");

function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  // Кнопка загрузки
  loadBtn.disabled = isLoading;
  loadBtn.textContent = isLoading ? "Загрузка..." : "Загрузить фото";

  // Блок статуса (загрузка или ошибка)
  statusBlock.hidden = !isLoading && !isError;
  statusBlock.classList.toggle("status--loading", isLoading);
  statusBlock.classList.toggle("status--error", isError);

  if (isLoading) statusText.textContent = "Загрузка фото...";
  if (isError) statusText.textContent = "Сервер не ответил за 3 секунды!";

  retryBtn.hidden = !isError;

  // Блок результата (успех)
  resultBlock.hidden = !isSuccess;
  if (isSuccess) {
    resultText.textContent = `Загружено фото: ${state.photoCount}`;
  }
}

async function loadPhotos() {
  if (state.status === "loading") return;

  state.status = "loading";
  state.errorMessage = "";
  state.photoCount = 0;
  render();

  try {
    // Передаем таймаут 3000 мс (3 секунды) вместо стандартных 5000
    const photos = await request("/photos", { timeout: 3000 });

    state.photoCount = photos.length;
    state.status = "success";
  } catch (error) {
    state.errorMessage = getErrorMessage(error);
    state.status = "error";
  }

  render();
}

loadBtn.addEventListener("click", loadPhotos);
retryBtn.addEventListener("click", loadPhotos);

render();
