export function renderStatus(status, errorMessage, importBtn, retryBtn) {
  const statusBlock = document.getElementById("status");
  const statusText = document.getElementById("status-text");

  if (!statusBlock || !statusText) return;

  // Сбрасываем все модификаторы состояния перед установкой нового
  statusBlock.classList.remove("status--loading", "status--error");

  if (status === "loading") {
    statusBlock.hidden = false;
    statusBlock.classList.add("status--loading"); // Добавляем только модификатор
    statusText.textContent = "Загрузка...";
    if (retryBtn) retryBtn.hidden = true;

    if (importBtn) {
      importBtn.disabled = true;
      importBtn.textContent = "Импорт...";
    }
  } else if (status === "error") {
    statusBlock.hidden = false;
    statusBlock.classList.add("status--error"); // Добавляем только модификатор
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

export function renderTasks(tasks, pendingIds, filter, listElement, template) {
  listElement.replaceChildren();

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  for (const task of filtered) {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.dataset.id = task.id;

    const isPending = pendingIds.has(task.id);

    if (isPending) {
      clone.classList.add("task--pending");
    }

    const checkbox = clone.querySelector(".task__check");
    checkbox.checked = task.done;
    checkbox.disabled = isPending;

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

      // ✅ ИСПРАВЛЕНИЕ: убираем старые модификаторы приоритета и добавляем новый
      badge.classList.remove("badge--low", "badge--normal", "badge--high");
      badge.classList.add(`badge--${task.priority}`);
    }

    const removeBtn = clone.querySelector(".task__remove");
    removeBtn.disabled = isPending;

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

    // ✅ ИСПРАВЛЕНИЕ: управление через classList
    alertBlock.classList.remove("alert--success", "alert--danger");
    alertBlock.classList.add("alert--danger");

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

    // ✅ ИСПРАВЛЕНИЕ: управление через classList
    alertBlock.classList.remove("alert--success", "alert--danger");
    alertBlock.classList.add("alert--success");

    alertText.textContent = message;
    alertBlock.hidden = false;

    alertTimeoutId = setTimeout(() => {
      alertBlock.hidden = true;
    }, 3000);
  }
}
