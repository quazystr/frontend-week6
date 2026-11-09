import { loadTasks, saveTasks } from "./storage.js";
import {
  getTasks,
  getFilter,
  setInitialTasks,
  addTask,
  toggleTask,
  deleteTask,
  setFilter,
  clearCompleted,
} from "./state.js";
import { renderTasks, renderCounter, renderEmptyState } from "./render.js";
import {
  isValidTitle,
  isValidTask,
  transformExternalTask,
} from "./validation.js";
import { loadInitialTasks, importFromExternalApi } from "./api.js";

// DOM-элементы
const form = document.querySelector(".task-form");
const titleInput = document.getElementById("task-title");
const taskList = document.querySelector(".task-list");
const taskTemplate = document.querySelector(".task-template");
const counter = document.querySelector(".counter");
const emptyState = document.querySelector(".empty");
const filters = document.querySelector(".filters");
const clearDoneBtn = document.querySelector(".clear-done-btn");
const importBtn = document.querySelector(".import-btn"); // Убедись, что эта кнопка есть в HTML

// Функция обновления всего UI
function updateUI() {
  renderTasks(getTasks(), getFilter(), taskList, taskTemplate);
  renderCounter(getTasks(), counter);
  renderEmptyState(getTasks(), getFilter(), emptyState);
  saveTasks(getTasks()); // Сохраняем после любого изменения

  const hasCompleted = getTasks().some((t) => t.done);
  clearDoneBtn.disabled = !hasCompleted;
}

// Инициализация
async function init() {
  let tasks = loadTasks();

  // Фильтруем на случай, если в хранилище попал мусор
  tasks = tasks.filter(isValidTask);

  if (tasks.length === 0) {
    try {
      const initialTasks = await loadInitialTasks();
      tasks = initialTasks.filter(isValidTask);
      setInitialTasks(tasks);
      saveTasks(tasks);
    } catch (error) {
      console.error("Ошибка загрузки стартовых задач:", error);
    }
  } else {
    setInitialTasks(tasks);
  }

  updateUI();
}

// Обработчики событий
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
    const taskId = checkbox.closest(".task").dataset.id;
    toggleTask(taskId);
    updateUI();
  }
});

taskList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".task__remove");
  if (removeBtn) {
    const taskId = removeBtn.closest(".task").dataset.id;
    deleteTask(taskId);
    updateUI();
  }
});

filters.addEventListener("click", (event) => {
  const btn = event.target.closest(".filters__button");
  if (btn) {
    // Сброс активных классов
    document.querySelectorAll(".filters__button").forEach((b) => {
      b.classList.remove("filters__button--active");
      b.setAttribute("aria-pressed", "false");
    });

    // Установка нового фильтра
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

if (importBtn) {
  importBtn.addEventListener("click", async () => {
    try {
      const externalTasks = await importFromExternalApi();
      const validTransformed = externalTasks
        .map(transformExternalTask)
        .filter(isValidTask);

      for (const task of validTransformed) {
        addTask(task);
      }
      updateUI();
    } catch (error) {
      alert("Не удалось импортировать задачи. Проверьте соединение.");
    }
  });
}

// Запуск
init();
