import { hasTasksInStorage, loadTasks, saveTasks } from "./storage.js";
import {
  getTasks,
  getFilter,
  getStatus,
  setInitialTasks,
  setFilter,
  setStatus,
  getErrorMessage,
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
  showSuccessAlert,
} from "./render.js";
import { isValidTitle, isValidTask, fromRemoteTodo } from "./validation.js";
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

function updateUI() {
  renderTasks(getTasks(), getFilter(), taskList, taskTemplate);
  renderCounter(getTasks(), counter);
  renderEmptyState(getTasks(), getFilter(), emptyState);
  renderStatusBlock(getStatus(), getErrorMessage());

  const hasCompleted = getTasks().some((t) => t.done);
  clearDoneBtn.disabled = !hasCompleted;

  // Управление состоянием кнопки импорта
  if (importBtn) {
    const isLoading = getStatus() === "loading";
    importBtn.disabled = isLoading;
    importBtn.textContent = isLoading ? "Импорт..." : "Импортировать задачи";
  }

  saveTasks(getTasks());
}

async function fetchInitialTasks() {
  setStatus("loading", "Загрузка стартовых задач...");
  updateUI();

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
    setInitialTasks([]);
    updateUI();
  }
}

async function init() {
  if (!hasTasksInStorage()) {
    await fetchInitialTasks();
  } else {
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

retryBtn.addEventListener("click", () => {
  localStorage.removeItem("week6:todo-tasks");
  fetchInitialTasks();
});

// ОБРАБОТЧИК ИМПОРТА
if (importBtn) {
  importBtn.addEventListener("click", async () => {
    // 1. Защита от двойного клика: если уже грузим, игнорируем нажатие
    if (getStatus() === "loading") return;

    setStatus("loading");
    updateUI(); // Кнопка станет disabled и текст сменится на "Импорт..."

    try {
      const remoteData = await importFromExternalApi();

      // 2. Трансформация и отсев невалидных (null)
      const transformedTasks = remoteData
        .map(fromRemoteTodo)
        .filter((task) => task !== null);

      // 3. Дедупликация: проверяем, каких ID ещё нет в нашем списке
      const currentTasks = getTasks();
      const currentIds = new Set(currentTasks.map((t) => t.id));

      let addedCount = 0;
      const trulyNewTasks = [];

      for (const task of transformedTasks) {
        if (!currentIds.has(task.id)) {
          trulyNewTasks.push(task);
          currentIds.add(task.id); // обновляем Set, чтобы не добавить дубликаты из самого импорта
          addedCount++;
        }
      }

      // 4. Добавление и уведомление
      if (addedCount > 0) {
        for (const task of trulyNewTasks) {
          addTask(task);
        }
        showSuccessAlert(`Импортировано: ${addedCount}`);
      } else {
        showSuccessAlert("Новых задач нет");
      }

      setStatus("idle");
      updateUI();
    } catch (error) {
      console.error("Ошибка импорта:", error);
      setStatus("error", "Не удалось импортировать задачи");
      updateUI();
    }
  });
}

// Запуск
init();
