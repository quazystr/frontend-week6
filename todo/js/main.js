import { hasTasksInStorage, loadTasks, saveTasks } from "./storage.js";
import {
  getTasks,
  getFilter,
  getStatus,
  setInitialTasks,
  setFilter,
  setStatus,
  addTask,
  toggleTask,
  deleteTask,
  clearCompleted,
} from "./state.js";
import {
  renderTasks,
  renderCounter,
  renderEmptyState,
  renderStatusBlock,
} from "./render.js";
import {
  isValidTitle,
  isValidTask,
  transformExternalTask,
} from "./validation.js";
import { loadInitialTasks, importFromExternalApi } from "./api.js";

// DOM
const form = document.querySelector(".task-form");
const titleInput = document.getElementById("task-title");
const taskList = document.querySelector(".task-list");
const taskTemplate = document.querySelector(".task-template");
const counter = document.querySelector(".counter");
const emptyState = document.querySelector(".empty");
const filters = document.querySelector(".filters");
const clearDoneBtn = document.querySelector(".clear-done-btn");
const importBtn = document.querySelector(".import-btn");
const retryBtn = document.getElementById("retry-btn");

// Обновление всего UI
function updateUI() {
  renderTasks(getTasks(), getFilter(), taskList, taskTemplate);
  renderCounter(getTasks(), counter);
  renderEmptyState(getTasks(), getFilter(), emptyState);
  renderStatusBlock(getStatus(), window.errorMessage || ""); // Передаем текущий статус

  const hasCompleted = getTasks().some((t) => t.done);
  clearDoneBtn.disabled = !hasCompleted;

  // Сохраняем при любом изменении
  saveTasks(getTasks());
}

// Логика загрузки стартовых задач
async function fetchInitialTasks() {
  setStatus("loading");
  updateUI(); // Показываем "Загрузка...", форма при этом остается активной

  try {
    const rawTasks = await loadInitialTasks();
    const validTasks = rawTasks.filter(isValidTask);

    setInitialTasks(validTasks);
    saveTasks(validTasks);

    setStatus("idle");
    updateUI();
  } catch (error) {
    console.error("Ошибка загрузки стартовых задач:", error);
    setStatus("error", "Не удалось загрузить стартовые задачи");
    setInitialTasks([]); // Приложение работает с пустым списком
    updateUI();
  }
}

// Инициализация приложения
async function init() {
  // КЛЮЧЕВОЕ УСЛОВИЕ: если ключа нет ВОВСЕ
  if (!hasTasksInStorage()) {
    await fetchInitialTasks();
  } else {
    // Ключ есть (даже если там '[]') - не запрашиваем сервер
    const savedTasks = loadTasks().filter(isValidTask);
    setInitialTasks(savedTasks);
    setStatus("idle");
    updateUI();
  }
}

// --- Обработчики событий ---

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value;

  if (isValidTitle(title)) {
    addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      priority: "normal",
      createdAt: new Date().toISOString(),
    });
    titleInput.value = "";
    updateUI();
  }
});

taskList.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".task__check");
  if (checkbox) {
    toggleTask(checkbox.closest(".task").dataset.id);
    updateUI();
  }
});

taskList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".task__remove");
  if (removeBtn) {
    deleteTask(removeBtn.closest(".task").dataset.id);
    updateUI();
  }
});

filters.addEventListener("click", (event) => {
  const btn = event.target.closest(".filters__button");
  if (btn) {
    document.querySelectorAll(".filters__button").forEach((b) => {
      b.classList.remove("filters__button--active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("filters__button--active");
    btn.setAttribute("aria-pressed", "true");
    setFilter(btn.dataset.filter);
    updateUI();
  }
});

clearDoneBtn.addEventListener("click", () => {
  clearCompleted();
  updateUI();
});

// Кнопка "Повторить" для стартовой загрузки
retryBtn.addEventListener("click", () => {
  // Сбрасываем хранилище, чтобы триггернуть загрузку заново
  localStorage.removeItem("week6:todo-tasks");
  fetchInitialTasks();
});

if (importBtn) {
  importBtn.addEventListener("click", async () => {
    try {
      setStatus("loading");
      updateUI();

      const externalTasks = await importFromExternalApi();
      const validTransformed = externalTasks
        .map(transformExternalTask)
        .filter(isValidTask);

      validTransformed.forEach(addTask);
      setStatus("idle");
      updateUI();
    } catch (error) {
      setStatus("error", "Не удалось импортировать задачи");
      updateUI();
    }
  });
}

// Запуск
init();
