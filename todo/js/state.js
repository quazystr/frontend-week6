let tasks = [];
let filter = "all";
let status = "idle"; // 'idle' | 'loading' | 'error'
let errorMessage = "";

export function getTasks() {
  return tasks;
}
export function getFilter() {
  return filter;
}
export function getStatus() {
  return status;
}
export function getErrorMessage() {
  return errorMessage;
}

export function setInitialTasks(newTasks) {
  tasks = newTasks;
}
export function setFilter(newFilter) {
  filter = newFilter;
}

export function setStatus(newStatus, message = "") {
  status = newStatus;
  errorMessage = message;
}

export function addTask(task) {
  tasks.push(task);
}
export function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
}
export function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
}
export function clearCompleted() {
  tasks = tasks.filter((t) => !t.done);
}
