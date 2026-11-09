let tasks = [];
let filter = "all"; // 'all' | 'active' | 'done'

export function getTasks() {
  return tasks;
}

export function getFilter() {
  return filter;
}

export function setInitialTasks(newTasks) {
  tasks = newTasks;
}

export function addTask(task) {
  tasks.push(task);
}

export function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
  }
}

export function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
}

export function setFilter(newFilter) {
  filter = newFilter;
}

export function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
}
