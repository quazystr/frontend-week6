import { hasTasksInStorage, loadTasks, saveTasks } from "./storage.js";
import {
  getTasks,
  getFilter,
  getRequestStatus,
  getErrorMessage,
  setInitialTasks,
  setFilter,
  setRequestStatus,
  addTask,
  toggleTask,
  deleteTask,
  clearCompleted,
} from "./state.js";
import {
  renderTasks,
  renderCounter,
  renderEmptyState,
  renderStatus,
  showSuccessAlert,
  showDangerAlert,
} from "./render.js";
import { isValidTitle, isValidTask, fromRemoteTodo } from "./validation.js";
import { request, getNetworkErrorMessage } from "./api.js";

// DOM-элементы (кэшируем один раз)
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

// ЕДИНАЯ ТОЧКА ОБНОВЛЕНИЯ UI
function updateUI() {
  renderTasks(getTasks(), getFilter(), taskList, taskTemplate);
  renderCounter(getTasks(), counter);
  renderEmptyState(getTasks(), getFilter(), emptyState);

  // Передаем состояние в render, а не манипулируем DOM здесь!
  renderStatus(getRequestStatus(), getErrorMessage(), importBtn, retryBtn);

  const hasCompleted = getTasks().some((t) => t.done);
  clearDoneBtn.disabled = !hasCompleted;

  saveTasks(getTasks());
}

async function fetchInitialTasks() {
  // 1. Меняем состояние
  setRequestStatus("loading");
  // 2. Обновляем UI (он сам покажет загрузку и заблокирует кнопки)
  updateUI();

  try {
    const rawTasks = await request("data/tasks.json");
    const validTasks = rawTasks.filter(isValidTask);
    setInitialTasks(validTasks);
    saveTasks(validTasks);

    setRequestStatus("idle");
    updateUI();
  } catch (error) {
    console.error("Ошибка загрузки стартовых задач:", error);
    showDangerAlert(getNetworkErrorMessage(error));

    setRequestStatus("idle"); // Снимаем загрузку, разблокируем кнопки
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
    setRequestStatus("idle");
    updateUI();
  }
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ (Только мутация состояния + updateUI) ---

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
    updateUI(); // <-- Только это
  }
});

taskList.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".task__check");
  if (checkbox) {
    toggleTask(checkbox.closest(".task").dataset.id);
    updateUI(); // <-- Только это
  }
});

taskList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".task__remove");
  if (removeBtn) {
    deleteTask(removeBtn.closest(".task").dataset.id);
    updateUI(); // <-- Только это
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
    updateUI(); // <-- Только это
  }
});

clearDoneBtn.addEventListener("click", () => {
  clearCompleted();
  updateUI(); // <-- Только это
});

retryBtn.addEventListener("click", () => {
  localStorage.removeItem("week6:todo-tasks");
  fetchInitialTasks(); // Внутри уже есть setRequestStatus + updateUI
});

if (importBtn) {
  importBtn.addEventListener("click", async () => {
    // Проверка состояния, а не атрибута disabled!
    if (getRequestStatus() === "loading") return;

    setRequestStatus("loading");
    updateUI(); // <-- Кнопка заблокируется ЗДЕСЬ, а не в обработчике

    try {
      const remoteData = await request(
        "https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5",
      );

      const transformedTasks = remoteData
        .map(fromRemoteTodo)
        .filter((task) => task !== null);
      const currentTasks = getTasks();
      const currentIds = new Set(currentTasks.map((t) => t.id));

      let addedCount = 0;
      for (const task of transformedTasks) {
        if (!currentIds.has(task.id)) {
          addTask(task);
          currentIds.add(task.id);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        showSuccessAlert(`Импортировано: ${addedCount}`);
      } else {
        showSuccessAlert("Новых задач нет");
      }

      setRequestStatus("idle");
      updateUI();
    } catch (error) {
      console.error("Ошибка импорта:", error);
      showDangerAlert(getNetworkErrorMessage(error));
      setRequestStatus("idle");
      updateUI();
    }
  });
}

// Запуск
init();
