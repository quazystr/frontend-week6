// Храним ID таймера для управления скрытием алерта
let alertTimeoutId = null;

export function showDangerAlert(message) {
  const alertBlock = document.getElementById("action-alert");
  const alertText = document.getElementById("alert-text");

  if (alertBlock && alertText) {
    // Если уже есть активный таймер скрытия, сбрасываем его!
    // Это гарантирует, что новое сообщение провисит полные 5 секунд.
    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
    }

    alertBlock.className = "alert alert--danger";
    alertText.textContent = message;
    alertBlock.hidden = false;

    alertTimeoutId = setTimeout(() => {
      alertBlock.hidden = true;
    }, 5000);
  }
}

export function showSuccessAlert(message) {
  const alertBlock = document.getElementById("action-alert");
  const alertText = document.getElementById("alert-text");

  if (alertBlock && alertText) {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);

    alertBlock.className = "alert alert--success";
    alertText.textContent = message;
    alertBlock.hidden = false;

    alertTimeoutId = setTimeout(() => {
      alertBlock.hidden = true;
    }, 3000);
  }
}

// ... (остальные функции renderTasks, renderCounter, renderEmptyState, renderStatusBlock остаются без изменений)
export function renderStatusBlock(status, errorMessage) {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const retryBtn = document.getElementById("retry-btn");

  if (status === "loading") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--loading";
    statusText.textContent = errorMessage || "Загрузка...";
    retryBtn.hidden = true;
  } else if (status === "error") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--error";
    statusText.textContent = errorMessage || "Произошла ошибка";
    retryBtn.hidden = false;
  } else {
    statusBlock.hidden = true;
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
