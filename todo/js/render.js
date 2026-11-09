export function renderTasks(tasks, filter, listElement, template) {
  listElement.replaceChildren();

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });

  for (const task of filteredTasks) {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.dataset.id = task.id;

    const checkbox = clone.querySelector(".task__check");
    checkbox.checked = task.done;

    clone.querySelector(".task__title").textContent = task.title;

    listElement.appendChild(clone);
  }
}

export function renderCounter(tasks, counterElement) {
  const activeCount = tasks.filter((t) => !t.done).length;
  const totalCount = tasks.length;
  counterElement.textContent = `Осталось: ${activeCount} из ${totalCount}`;
}

export function renderEmptyState(tasks, filter, emptyElement) {
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });
  emptyElement.hidden = filteredTasks.length > 0;
}
