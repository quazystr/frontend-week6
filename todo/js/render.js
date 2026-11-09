export function renderStatus(status, errorMessage, importBtn, retryBtn) {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");

  if (!statusBlock || !statusText) return;

  if (status === "loading") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--loading";
    statusText.textContent = "Загрузка...";
    if (retryBtn) retryBtn.hidden = true;

    // Управление доступностью кнопки импорта через render, а не в обработчике!
    if (importBtn) {
      importBtn.disabled = true;
      importBtn.textContent = "Импорт...";
    }
  } else if (status === "error") {
    statusBlock.hidden = false;
    statusBlock.className = "status status--error";
    statusText.textContent = errorMessage || "Произошла ошибка";
    if (retryBtn) retryBtn.hidden = false;

    if (importBtn) {
      importBtn.disabled = false;
      importBtn.textContent = "Импортировать задачи";
    }
  } else {
    // 'idle' или 'success'
    statusBlock.hidden = true;
    if (importBtn) {
      importBtn.disabled = false;
      importBtn.textContent = "Импортировать задачи";
    }
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

// Функции для алертов (успех/ошибка действия)
let alertTimeoutId = null;

export function showDangerAlert(message) {
  const alertBlock = document.getElementById("action-alert");
  const alertText = document.getElementById("alert-text");
  if (alertBlock && alertText) {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
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
