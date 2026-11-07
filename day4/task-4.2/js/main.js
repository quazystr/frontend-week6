import { request } from "./api.js";

const state = {
  tasks: [],
  error: "",
};

const taskList = document.getElementById("task-list");
const taskTemplate = document.getElementById("task-template");
const actionAlert = document.getElementById("action-alert");
const actionAlertText = document.getElementById("action-alert-text");

// ==========================================
// ОТРИСОВКА
// ==========================================
function render() {
  // Управление глобальным алертом ошибок
  if (state.error) {
    actionAlert.hidden = false;
    actionAlertText.textContent = state.error;
  } else {
    actionAlert.hidden = true;
  }

  // Отрисовка списка
  taskList.replaceChildren();

  for (const task of state.tasks) {
    const clone = taskTemplate.content.firstElementChild.cloneNode(true);

    // Применяем модификаторы
    if (task.isPending) {
      clone.classList.add("task--pending");
    }
    if (task.completed) {
      clone.classList.add("task--done");
    }

    // Заполняем данные
    clone.dataset.id = task.id;

    const checkbox = clone.querySelector(".task__check");
    checkbox.checked = task.completed;
    checkbox.disabled = task.isPending; // Явно отключаем для a11y

    clone.querySelector(".task__title").textContent = task.title;

    const removeBtn = clone.querySelector(".task__remove");
    removeBtn.disabled = task.isPending;

    taskList.appendChild(clone);
  }
}

// ==========================================
// ДЕЙСТВИЯ (меняем состояние только при успехе)
// ==========================================
async function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task || task.isPending) return; // Защита

  const newCompleted = !task.completed;

  // 1. Помечаем как ожидающее, очищаем старые ошибки
  task.isPending = true;
  state.error = "";
  render(); // Показываем task--pending и disabled

  try {
    // 2. Отправляем запрос
    await request(`/todos/${id}`, {
      method: "PATCH",
      body: { completed: newCompleted },
    });

    // 3. УСПЕХ: только теперь меняем реальные данные
    task.completed = newCompleted;
  } catch (error) {
    // 4. ОШИБКА: данные не меняем, просто показываем сообщение
    state.error = "Не удалось обновить задачу. Проверьте соединение.";
  } finally {
    // 5. Снимаем флаг ожидания в любом случае и перерисовываем
    task.isPending = false;
    render();
  }
}

async function deleteTask(id) {
  const taskIndex = state.tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1 || state.tasks[taskIndex].isPending) return;

  // 1. Помечаем как ожидающее
  state.tasks[taskIndex].isPending = true;
  state.error = "";
  render();

  try {
    // 2. Отправляем запрос
    await request(`/todos/${id}`, { method: "DELETE" });

    // 3. УСПЕХ: удаляем из массива
    state.tasks.splice(taskIndex, 1);
  } catch (error) {
    // 4. ОШИБКА: задача остается в массиве
    state.error = "Не удалось удалить задачу. Проверьте соединение.";
  } finally {
    // 5. Если задача не удалилась, isPending станет false и она отрисуется как обычно.
    // Если удалилась, её уже нет в массиве, и render() просто отрисует оставшиеся.
    render();
  }
}

// ==========================================
// ЗАГРУЗКА ДАННЫХ
// ==========================================
async function loadTasks() {
  state.error = "";
  // Можно добавить state.isLoading, но для простоты оставим так
  try {
    const data = await request("/todos?userId=1&_limit=5");
    // Инициализируем флаг isPending для каждой задачи
    state.tasks = data.map((task) => ({ ...task, isPending: false }));
  } catch (error) {
    state.error = "Не удалось загрузить задачи.";
  }
  render();
}

// ==========================================
// ДЕЛЕГИРОВАНИЕ СОБЫТИЙ
// ==========================================
taskList.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".task__check");
  if (!checkbox) return;

  const taskId = Number(checkbox.closest(".task").dataset.id);
  toggleTask(taskId);
});

taskList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".task__remove");
  if (!removeBtn) return;

  const taskId = Number(removeBtn.closest(".task").dataset.id);
  deleteTask(taskId);
});

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================
loadTasks();
