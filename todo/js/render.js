export function renderStatusBlock(status, errorMessage) {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const retryBtn = document.getElementById("retry-btn");

  if (status === "loading") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--loading";
    statusText.textContent = "Загрузка...";
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

export function showSuccessAlert(message) {
  const alertBlock = document.getElementById("action-alert");
  const alertText = document.getElementById("alert-text");

  if (alertBlock && alertText) {
    alertBlock.className = "alert alert--success";
    alertText.textContent = message;
    alertBlock.hidden = false;

    // Автоматически скрываем через 3 секунды для хорошего UX
    setTimeout(() => {
      alertBlock.hidden = true;
    }, 3000);
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
