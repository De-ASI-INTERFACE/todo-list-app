const STORAGE_KEY = 'todo-list-app.tasks';
const THEME_KEY = 'todo-list-app.theme';

let tasks = loadTasks();
let currentFilter = 'all';
let searchQuery = '';

const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const taskTemplate = document.getElementById('taskTemplate');
const emptyState = document.getElementById('emptyState');
const taskSummary = document.getElementById('taskSummary');
const remainingSummary = document.getElementById('remainingSummary');
const filterButtons = document.querySelectorAll('.filter-button');
const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const themeToggle = document.getElementById('themeToggle');

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [
      {
        id: crypto.randomUUID(),
        text: 'Plan your week',
        completed: false,
        priority: 'medium',
        dueDate: '',
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        text: 'Review project goals',
        completed: true,
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        createdAt: Date.now() - 60000,
      },
    ];
  } catch (error) {
    console.error('Failed to load tasks from localStorage', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getVisibleTasks() {
  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !task.completed) ||
      (currentFilter === 'completed' && task.completed);

    const haystack = `${task.text} ${task.priority}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}

function render() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = '';

  visibleTasks.forEach((task) => {
    const fragment = taskTemplate.content.cloneNode(true);
    const item = fragment.querySelector('.task-item');
    const checkbox = fragment.querySelector('.task-checkbox');
    const text = fragment.querySelector('.task-text');
    const priority = fragment.querySelector('.task-priority');
    const date = fragment.querySelector('.task-date');
    const editButton = fragment.querySelector('.edit-button');
    const deleteButton = fragment.querySelector('.delete-button');

    item.classList.toggle('completed', task.completed);
    checkbox.checked = task.completed;
    text.textContent = task.text;
    priority.textContent = task.priority;
    priority.classList.add(task.priority);
    date.textContent = formatDate(task.dueDate);

    checkbox.addEventListener('change', () => toggleTask(task.id));
    editButton.addEventListener('click', () => editTask(task.id));
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(fragment);
  });

  const totalTasks = tasks.length;
  const remainingTasks = tasks.filter((task) => !task.completed).length;

  taskSummary.textContent = `${totalTasks} task${totalTasks === 1 ? '' : 's'}`;
  remainingSummary.textContent = `${remainingTasks} remaining`;
  emptyState.classList.toggle('hidden', visibleTasks.length > 0);
}

function addTask(text, priority, dueDate) {
  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    priority,
    dueDate,
    createdAt: Date.now(),
  });

  saveTasks();
  render();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  render();
}

function editTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const nextText = window.prompt('Edit task', task.text);
  if (nextText === null) return;

  const trimmed = nextText.trim();
  if (!trimmed) {
    alert('Task cannot be empty.');
    return;
  }

  const nextPriority = window.prompt(
    'Edit priority (low, medium, high)',
    task.priority
  );

  if (nextPriority && !['low', 'medium', 'high'].includes(nextPriority.toLowerCase())) {
    alert('Priority must be low, medium, or high.');
    return;
  }

  const rawDueDate = window.prompt('Edit due date (YYYY-MM-DD)', task.dueDate || '');
  if (rawDueDate !== null && rawDueDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(rawDueDate)) {
    alert('Due date must be in YYYY-MM-DD format.');
    return;
  }

  tasks = tasks.map((item) =>
    item.id === taskId
      ? {
          ...item,
          text: trimmed,
          priority: nextPriority ? nextPriority.toLowerCase() : item.priority,
          dueDate: rawDueDate ?? item.dueDate,
        }
      : item
  );

  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  addTask(text, priorityInput.value, dueDateInput.value);
  todoForm.reset();
  priorityInput.value = 'medium';
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    currentFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', (event) => {
  searchQuery = event.target.value;
  render();
});

clearCompletedBtn.addEventListener('click', clearCompleted);
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  applyTheme(isDark ? 'light' : 'dark');
});

initializeTheme();
render();
