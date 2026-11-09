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
  showSuccessAlert,
  showDangerAlert,
} from "./render.js";
import { isValidTitle, isValidTask, fromRemoteTodo } from "./validation.js";
import { request, getNetworkErrorMessage } from "./api.js"; // <-- НОВЫЙ ИМПОРТ

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
  renderStatusBlock(getStatus(), ""); // Текст ошибки теперь в alert, здесь только статус загрузки

  const hasCompleted = getTasks().some((t) => t.done);
  clearDoneBtn.disabled = !hasCompleted;

  if (importBtn) {
    const isLoading = getStatus() === "loading";
    importBtn.disabled = isLoading;
    importBtn.textContent = isLoading ? "Импорт..." : "Импортировать задачи";
  }

  saveTasks(getTasks());
}

async function fetchInitialTasks() {
  setStatus("loading");
  updateUI();

  try {
    const rawTasks = await request("data/tasks.json");
    const validTasks = rawTasks.filter(isValidTask);
    setInitialTasks(validTasks);
    saveTasks(validTasks);
    setStatus("idle");
    updateUI();
  } catch (error) {
    console.error("Ошибка загрузки стартовых задач:", error);
    showDangerAlert(getNetworkErrorMessage(error)); // <-- Показываем понятную ошибку
    setStatus("idle"); // <-- Возвращаем кнопку в доступное состояние
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

if (importBtn) {
  importBtn.addEventListener("click", async () => {
    if (getStatus() === "loading") return;

    setStatus("loading");
    updateUI();

    try {
      // <-- Используем универсальный request
      const remoteData = await request(
        "https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5",
      );

      const transformedTasks = remoteData
        .map(fromRemoteTodo)
        .filter((task) => task !== null);

      const currentTasks = getTasks();
      const currentIds = new Set(currentTasks.map((t) => t.id));

      let addedCount = 0;
      const trulyNewTasks = [];

      for (const task of transformedTasks) {
        if (!currentIds.has(task.id)) {
          trulyNewTasks.push(task);
          currentIds.add(task.id);
          addedCount++;
        }
      }

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
      showDangerAlert(getNetworkErrorMessage(error)); // <-- Показываем понятную ошибку
      setStatus("idle"); // <-- Возвращаем кнопку в доступное состояние
      updateUI();
    }
  });
}

init();
