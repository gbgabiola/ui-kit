const form = document.querySelector('#task-form');
const taskList = document.querySelector('.collection');
const filter = document.querySelector('#filter');
const input = document.querySelector('#task');
const storageKey = 'uik-demo-tasks';
let tasks = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  tasks = Array.isArray(saved) ? saved.filter((task) => typeof task === 'string') : [];
} catch { /* Start with an empty list when storage is unavailable. */ }

function render() {
  taskList.replaceChildren();
  tasks.forEach((task, index) => {
    if (!task.toLowerCase().includes(filter.value.toLowerCase())) return;
    const item = document.createElement('li');
    item.className = 'collection-item';
    const text = document.createElement('span');
    text.textContent = task;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-item secondary-content';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${task}`);
    remove.addEventListener('click', () => { tasks.splice(index, 1); save(); });
    item.append(text, remove);
    taskList.append(item);
  });
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(tasks)); } catch { /* Tasks remain usable for this visit. */ }
  render();
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const task = input.value.trim();
  if (!task) { input.focus(); return; }
  tasks.push(task);
  input.value = '';
  save();
  input.focus();
});
filter.addEventListener('input', render);
document.querySelector('.clear-tasks').addEventListener('click', () => { tasks = []; save(); });
render();
