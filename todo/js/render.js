export function renderStatus() {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const retryBtn = document.getElementById("retry-btn");

  const currentStatus = window.appState.getStatus(); // Временный хак, лучше передавать аргументом, но для простоты оставим так или импортируем
  // Правильный подход: передавать статус аргументом. Исправим в main.js.
}

// ПРАВИЛЬНЫЙ ВАРИАНТ (чистая функция):
export function renderStatusBlock(status, errorMessage) {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const retryBtn = document.getElementById("retry-btn");

  if (status === "loading") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--loading";
    statusText.textContent = "Загрузка стартовых задач...";
    retryBtn.hidden = true;
  } else if (status === "error") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--error";
    statusText.textContent = errorMessage || "Не удалось загрузить данные";
    retryBtn.hidden = false;
  } else {
    statusBlock.hidden = true; // 'idle' или 'success'
  }
}

export function renderTasks(tasks, filter, listElement, template) {
  listElement.replaceChildren();
  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  for (const task of filtered) {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.dataset.id = task.id;
    clone.querySelector(".task__check").checked = task.done;
    clone.querySelector(".task__title").textContent = task.title;

    // Бейдж приоритета (если есть в твоем CSS)
    const badge = clone.querySelector(".badge");
    if (badge) {
      const priorityText =
        task.priority === "high"
          ? "Высокий"
          : task.priority === "low"
            ? "Низкий"
            : "Обычный";
      badge.textContent = priorityText;
      badge.className = `badge badge--${task.priority}`;
    }

    listElement.appendChild(clone);
  }
}

export function renderCounter(tasks, counterElement) {
  const active = tasks.filter((t) => !t.done).length;
  counterElement.textContent = `Осталось: ${active} из ${tasks.length}`;
}

export function renderEmptyState(tasks, filter, emptyElement) {
  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });
  emptyElement.hidden = filtered.length > 0;
}
