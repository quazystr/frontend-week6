import { request, getErrorMessage } from "./api.js";
import {
  isValidPostTitle,
  isValidPostBody,
  getValidationErrorMessage,
} from "./validation.js";

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  errorMessage: "",
  postId: null,
};

const form = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const bodyInput = document.getElementById("post-body");
const submitBtn = document.getElementById("submit-btn");
const alertBlock = document.getElementById("form-alert");
const alertText = document.getElementById("alert-text");

const fieldTitle = document.getElementById("field-title");
const hintTitle = document.getElementById("hint-title");
const fieldBody = document.getElementById("field-body");
const hintBody = document.getElementById("hint-body");

function setFieldError(fieldEl, hintEl, message) {
  fieldEl.classList.add("field--error");
  hintEl.textContent = message;
}

function clearFieldError(fieldEl, hintEl) {
  fieldEl.classList.remove("field--error");
  hintEl.textContent = "";
}

function validateForm() {
  let isValid = true;
  let firstInvalidField = null;

  if (!isValidPostTitle(titleInput.value)) {
    setFieldError(fieldTitle, hintTitle, getValidationErrorMessage("title"));
    if (!firstInvalidField) firstInvalidField = titleInput;
    isValid = false;
  } else {
    clearFieldError(fieldTitle, hintTitle);
  }

  if (!isValidPostBody(bodyInput.value)) {
    setFieldError(fieldBody, hintBody, getValidationErrorMessage("body"));
    if (!firstInvalidField) firstInvalidField = bodyInput;
    isValid = false;
  } else {
    clearFieldError(fieldBody, hintBody);
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
}

function render() {
  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  // Управление кнопкой
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Отправка..." : "Опубликовать";

  // Управление алертом
  alertBlock.hidden = !isError && !isSuccess;
  alertBlock.className = "alert"; // сброс классов

  if (isError) {
    alertBlock.classList.add("alert--danger");
    alertText.textContent = state.errorMessage;
  } else if (isSuccess) {
    alertBlock.classList.add("alert--success");
    alertText.textContent = `Пост создан, номер ${state.postId}`;
  }
}

// Live-валидация: снятие ошибки при исправлении
titleInput.addEventListener("input", () => {
  if (
    fieldTitle.classList.contains("field--error") &&
    isValidPostTitle(titleInput.value)
  ) {
    clearFieldError(fieldTitle, hintTitle);
  }
});

bodyInput.addEventListener("input", () => {
  if (
    fieldBody.classList.contains("field--error") &&
    isValidPostBody(bodyInput.value)
  ) {
    clearFieldError(fieldBody, hintBody);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (state.status === "loading") return;
  if (!validateForm()) return;

  state.status = "loading";
  state.errorMessage = "";
  state.postId = null;
  render();

  try {
    const response = await request("/posts", {
      method: "POST",
      body: {
        title: titleInput.value.trim(),
        body: bodyInput.value.trim(),
        userId: 1,
      },
    });

    state.postId = response.id;
    state.status = "success";

    // Очищаем форму и ошибки только при успехе
    form.reset();
    clearFieldError(fieldTitle, hintTitle);
    clearFieldError(fieldBody, hintBody);
  } catch (error) {
    state.errorMessage = getErrorMessage(error);
    state.status = "error";
    // Форма НЕ очищается, текст остается в полях
  }

  render();
});

render();
