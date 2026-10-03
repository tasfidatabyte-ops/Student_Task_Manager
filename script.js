"use strict";

/* ========================================================================== 
   TaskFlow - Student Task Manager
   Full client-side application logic for the existing index.html
   ========================================================================== */

const STORAGE_KEYS = Object.freeze({
  tasks: "taskflow.tasks.v1",
  theme: "taskflow.theme.v1",
  studentName: "taskflow.studentName.v1"
});

const state = {
  tasks: [],
  searchTerm: "",
  statusFilter: "all",
  categoryFilter: "all",
  sortBy: "newest",
  editingTaskId: null
};

const elements = {};

/* ---------- Application start ---------- */
document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  loadPreferences();
  state.tasks = loadTasks();
  bindEvents();
  setMinimumDeadline();
  updateStaticContent();
  renderApp();
}

function cacheElements() {
  const ids = [
    "sidebar", "sidebar-overlay", "sidebar-open", "sidebar-close",
    "theme-toggle", "current-date", "current-year", "student-name",
    "profile-name", "global-search-input", "open-task-modal",
    "hero-add-task", "board-add-task", "empty-add-task", "task-modal",
    "close-task-modal", "cancel-task", "task-form", "task-id",
    "task-title", "task-description", "task-category", "task-subject",
    "task-status", "task-deadline", "task-time", "task-estimate",
    "task-reminder", "task-tags", "task-starred", "save-task-label",
    "title-character-count", "description-character-count",
    "task-title-error", "task-category-error", "task-deadline-error",
    "task-list", "empty-state", "task-card-template", "toast-region",
    "toast-template", "category-filter", "sort-tasks", "statistics-period",
    "sidebar-task-count", "total-tasks", "completed-tasks", "progress-tasks",
    "overdue-tasks", "completion-rate", "overdue-message",
    "total-task-trend", "all-count", "todo-count", "in-progress-count",
    "completed-count", "completion-ring", "completion-percentage",
    "weekly-completed-count"
  ];

  ids.forEach((id) => {
    elements[toCamelCase(id)] = document.getElementById(id);
  });

  elements.filterTabs = [...document.querySelectorAll(".filter-tab")];
  elements.navLinks = [...document.querySelectorAll(".nav-link")];
  elements.priorityInputs = [...document.querySelectorAll('input[name="priority"]')];
}

function bindEvents() {
  [elements.openTaskModal, elements.heroAddTask, elements.boardAddTask, elements.emptyAddTask]
    .filter(Boolean)
    .forEach((button) => button.addEventListener("click", () => openTaskModal()));

  elements.closeTaskModal?.addEventListener("click", closeTaskModal);
  elements.cancelTask?.addEventListener("click", closeTaskModal);
  elements.taskForm?.addEventListener("submit", handleTaskSubmit);
  elements.taskModal?.addEventListener("click", handleDialogBackdropClick);
  elements.taskModal?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeTaskModal();
  });

  elements.taskTitle?.addEventListener("input", updateCharacterCounts);
  elements.taskDescription?.addEventListener("input", updateCharacterCounts);
  elements.globalSearchInput?.addEventListener("input", handleSearch);
  elements.categoryFilter?.addEventListener("change", handleCategoryFilter);
  elements.sortTasks?.addEventListener("change", handleSort);
  elements.statisticsPeriod?.addEventListener("change", updateStatistics);
  elements.filterTabs.forEach((tab) => tab.addEventListener("click", handleStatusFilter));

  elements.taskList?.addEventListener("click", handleTaskListClick);
  elements.themeToggle?.addEventListener("click", toggleTheme);
  elements.sidebarOpen?.addEventListener("click", openSidebar);
  elements.sidebarClose?.addEventListener("click", closeSidebar);
  elements.sidebarOverlay?.addEventListener("click", closeSidebar);
  elements.navLinks.forEach((link) => link.addEventListener("click", handleNavigation));

  document.addEventListener("keydown", handleKeyboardShortcuts);
  window.addEventListener("resize", handleResize);
}

/* ---------- Task model and persistence ---------- */
function createTask(formData) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: cleanText(formData.get("title")),
    description: cleanText(formData.get("description")),
    category: cleanText(formData.get("category")),
    subject: cleanText(formData.get("subject")),
    priority: cleanText(formData.get("priority")) || "medium",
    status: cleanText(formData.get("status")) || "todo",
    deadline: cleanText(formData.get("deadline")),
    dueTime: cleanText(formData.get("dueTime")),
    estimatedMinutes: numberOrNull(formData.get("estimatedMinutes")),
    reminder: cleanText(formData.get("reminder")) || "none",
    tags: parseTags(formData.get("tags")),
    starred: formData.get("starred") === "on",
    createdAt: now,
    updatedAt: now,
    completedAt: formData.get("status") === "completed" ? now : null
  };
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.tasks);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeTask).filter(Boolean) : [];
  } catch (error) {
    console.error("Unable to load saved tasks:", error);
    showToast("Storage error", "Saved tasks could not be loaded.", "error");
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(state.tasks));
    return true;
  } catch (error) {
    console.error("Unable to save tasks:", error);
    showToast("Storage error", "The latest task changes could not be saved.", "error");
    return false;
  }
}

function normalizeTask(task) {
  if (!task || typeof task !== "object" || !task.id || !task.title) return null;
  return {
    id: String(task.id),
    title: cleanText(task.title),
    description: cleanText(task.description),
    category: cleanText(task.category) || "other",
    subject: cleanText(task.subject),
    priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
    status: ["todo", "in-progress", "completed"].includes(task.status) ? task.status : "todo",
    deadline: cleanText(task.deadline),
    dueTime: cleanText(task.dueTime),
    estimatedMinutes: numberOrNull(task.estimatedMinutes),
    reminder: cleanText(task.reminder) || "none",
    tags: Array.isArray(task.tags) ? task.tags.map(cleanText).filter(Boolean) : [],
    starred: Boolean(task.starred),
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null
  };
}

/* ---------- Add and edit ---------- */
function handleTaskSubmit(event) {
  event.preventDefault();
  clearValidationErrors();

  if (!validateTaskForm()) return;

  const formData = new FormData(elements.taskForm);

  if (state.editingTaskId) {
    updateTask(state.editingTaskId, formData);
  } else {
    const task = createTask(formData);
    state.tasks.unshift(task);
    saveTasks();
    renderApp();
    closeTaskModal();
    showToast("Task created", `“${task.title}” was added successfully.`, "success");
  }
}

function updateTask(taskId, formData) {
  const index = state.tasks.findIndex((task) => task.id === taskId);
  if (index < 0) return;

  const oldTask = state.tasks[index];
  const newStatus = cleanText(formData.get("status")) || "todo";
  const updatedTask = {
    ...oldTask,
    title: cleanText(formData.get("title")),
    description: cleanText(formData.get("description")),
    category: cleanText(formData.get("category")),
    subject: cleanText(formData.get("subject")),
    priority: cleanText(formData.get("priority")) || "medium",
    status: newStatus,
    deadline: cleanText(formData.get("deadline")),
    dueTime: cleanText(formData.get("dueTime")),
    estimatedMinutes: numberOrNull(formData.get("estimatedMinutes")),
    reminder: cleanText(formData.get("reminder")) || "none",
    tags: parseTags(formData.get("tags")),
    starred: formData.get("starred") === "on",
    updatedAt: new Date().toISOString(),
    completedAt: newStatus === "completed"
      ? oldTask.completedAt || new Date().toISOString()
      : null
  };

  state.tasks[index] = updatedTask;
  saveTasks();
  renderApp();
  closeTaskModal();
  showToast("Task updated", `“${updatedTask.title}” was updated.`, "success");
}

function openTaskModal(taskId = null) {
  clearValidationErrors();
  elements.taskForm?.reset();
  state.editingTaskId = taskId;

  if (taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;
    populateTaskForm(task);
    document.getElementById("task-modal-title").textContent = "Edit task";
    elements.saveTaskLabel.textContent = "Save changes";
  } else {
    elements.taskId.value = "";
    const mediumPriority = document.getElementById("priority-medium");
    if (mediumPriority) mediumPriority.checked = true;
    elements.taskStatus.value = "todo";
    document.getElementById("task-modal-title").textContent = "Create a new task";
    elements.saveTaskLabel.textContent = "Create task";
    setMinimumDeadline();
  }

  updateCharacterCounts();
  if (typeof elements.taskModal?.showModal === "function") {
    elements.taskModal.showModal();
  } else {
    elements.taskModal?.setAttribute("open", "");
  }
  requestAnimationFrame(() => elements.taskTitle?.focus());
}

function closeTaskModal() {
  state.editingTaskId = null;
  clearValidationErrors();
  elements.taskForm?.reset();
  updateCharacterCounts();
  if (elements.taskModal?.open && typeof elements.taskModal.close === "function") {
    elements.taskModal.close();
  } else {
    elements.taskModal?.removeAttribute("open");
  }
}

function populateTaskForm(task) {
  elements.taskId.value = task.id;
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskCategory.value = task.category;
  elements.taskSubject.value = task.subject;
  elements.taskStatus.value = task.status;
  elements.taskDeadline.value = task.deadline;
  elements.taskTime.value = task.dueTime;
  elements.taskEstimate.value = task.estimatedMinutes ?? "";
  elements.taskReminder.value = task.reminder;
  elements.taskTags.value = task.tags.join(", ");
  elements.taskStarred.checked = task.starred;

  const priority = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
  if (priority) priority.checked = true;
}

function validateTaskForm() {
  let valid = true;
  const title = elements.taskTitle.value.trim();
  const category = elements.taskCategory.value;
  const deadline = elements.taskDeadline.value;

  if (title.length < 3) {
    setFieldError(elements.taskTitle, elements.taskTitleError, "Enter at least 3 characters.");
    valid = false;
  }

  if (!category) {
    setFieldError(elements.taskCategory, elements.taskCategoryError, "Select a category.");
    valid = false;
  }

  if (!deadline) {
    setFieldError(elements.taskDeadline, elements.taskDeadlineError, "Select a due date.");
    valid = false;
  }

  if (!valid) {
    elements.taskForm.querySelector('[aria-invalid="true"]')?.focus();
    showToast("Check the form", "Please correct the highlighted fields.", "error");
  }

  return valid;
}

function setFieldError(field, errorElement, message) {
  field?.setAttribute("aria-invalid", "true");
  if (errorElement) errorElement.textContent = message;
}

function clearValidationErrors() {
  [elements.taskTitle, elements.taskCategory, elements.taskDeadline]
    .filter(Boolean)
    .forEach((field) => field.removeAttribute("aria-invalid"));
  [elements.taskTitleError, elements.taskCategoryError, elements.taskDeadlineError]
    .filter(Boolean)
    .forEach((message) => { message.textContent = ""; });
}

/* ---------- Task actions ---------- */
function handleTaskListClick(event) {
  const card = event.target.closest(".task-card");
  if (!card) return;
  const taskId = card.dataset.taskId;

  if (event.target.closest(".task-card__complete")) toggleTaskStatus(taskId);
  else if (event.target.closest(".task-card__edit")) openTaskModal(taskId);
  else if (event.target.closest(".task-card__delete")) deleteTask(taskId, card);
  else if (event.target.closest(".task-card__star")) toggleStarred(taskId);
}

function toggleTaskStatus(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const completed = task.status === "completed";
  task.status = completed ? "todo" : "completed";
  task.completedAt = completed ? null : new Date().toISOString();
  task.updatedAt = new Date().toISOString();
  saveTasks();
  renderApp();
  showToast(
    completed ? "Task reopened" : "Task completed",
    `“${task.title}” is now ${completed ? "to do" : "completed"}.`,
    "success"
  );
}

function toggleStarred(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.starred = !task.starred;
  task.updatedAt = new Date().toISOString();
  saveTasks();
  renderTasks();
  showToast(task.starred ? "Marked important" : "Important mark removed", task.title, "info");
}

function deleteTask(taskId, card) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const shouldDelete = window.confirm(`Delete “${task.title}”? This action cannot be undone.`);
  if (!shouldDelete) return;

  card.classList.add("is-deleting");
  window.setTimeout(() => {
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    saveTasks();
    renderApp();
    showToast("Task deleted", `“${task.title}” was removed.`, "error");
  }, prefersReducedMotion() ? 0 : 260);
}

/* ---------- Rendering ---------- */
function renderApp() {
  renderTasks();
  updateStatistics();
  updateCounts();
}

function renderTasks() {
  if (!elements.taskList || !elements.taskCardTemplate) return;
  const tasks = getVisibleTasks();
  elements.taskList.setAttribute("aria-busy", "true");
  elements.taskList.replaceChildren();

  const fragment = document.createDocumentFragment();
  tasks.forEach((task) => fragment.append(createTaskCard(task)));
  elements.taskList.append(fragment);
  elements.taskList.setAttribute("aria-busy", "false");

  if (elements.emptyState) {
    elements.emptyState.hidden = tasks.length > 0;
    const heading = elements.emptyState.querySelector("h3");
    const paragraph = elements.emptyState.querySelector("p");
    if (state.tasks.length > 0 && tasks.length === 0) {
      if (heading) heading.textContent = "No matching tasks";
      if (paragraph) paragraph.textContent = "Try changing your search, status, category, or sorting options.";
    } else {
      if (heading) heading.textContent = "No tasks here yet";
      if (paragraph) paragraph.textContent = "Create your first task and start building a more organized study routine.";
    }
  }
}

function createTaskCard(task) {
  const card = elements.taskCardTemplate.content.firstElementChild.cloneNode(true);
  card.dataset.taskId = task.id;
  card.classList.toggle("is-completed", task.status === "completed");
  card.classList.add("is-new");

  setText(card, ".task-card__category", categoryLabel(task.category));
  const priority = card.querySelector(".task-card__priority");
  priority.textContent = `${capitalize(task.priority)} priority`;
  priority.dataset.priority = task.priority;
  priority.style.color = priorityColor(task.priority);

  setText(card, ".task-card__title", task.title);
  const description = card.querySelector(".task-card__description");
  description.textContent = task.description || "No description provided.";
  setText(card, ".task-card__subject", task.subject || "General");

  const deadline = card.querySelector(".task-card__deadline");
  deadline.dateTime = task.deadline;
  deadline.textContent = formatDeadline(task.deadline, task.dueTime);
  if (isOverdue(task)) deadline.classList.add("is-overdue");

  const tags = card.querySelector(".task-card__tags");
  task.tags.forEach((tag) => {
    const element = document.createElement("span");
    element.textContent = `#${tag}`;
    tags.append(element);
  });
  if (!task.tags.length) tags.hidden = true;

  const completeButton = card.querySelector(".task-card__complete");
  completeButton.setAttribute(
    "aria-label",
    task.status === "completed" ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`
  );

  const starButton = card.querySelector(".task-card__star");
  starButton.textContent = task.starred ? "★" : "☆";
  starButton.setAttribute("aria-pressed", String(task.starred));
  starButton.setAttribute("aria-label", `${task.starred ? "Remove important mark from" : "Mark as important"} ${task.title}`);

  card.querySelector(".task-card__edit").setAttribute("aria-label", `Edit ${task.title}`);
  card.querySelector(".task-card__delete").setAttribute("aria-label", `Delete ${task.title}`);
  return card;
}

function getVisibleTasks() {
  const query = state.searchTerm.toLowerCase();
  const filtered = state.tasks.filter((task) => {
    const searchable = [task.title, task.description, task.subject, task.category, ...task.tags]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesStatus = state.statusFilter === "all" || task.status === state.statusFilter;
    const matchesCategory = state.categoryFilter === "all" || task.category === state.categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return filtered.sort((a, b) => {
    if (a.starred !== b.starred) return Number(b.starred) - Number(a.starred);
    if (state.sortBy === "deadline") return compareDeadlines(a, b);
    if (state.sortBy === "priority") return priorityWeight(b.priority) - priorityWeight(a.priority);
    if (state.sortBy === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/* ---------- Search, filtering and sorting ---------- */
function handleSearch(event) {
  state.searchTerm = event.target.value.trim();
  renderTasks();
}

function handleStatusFilter(event) {
  state.statusFilter = event.currentTarget.dataset.filter || "all";
  elements.filterTabs.forEach((tab) => {
    const active = tab === event.currentTarget;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderTasks();
}

function handleCategoryFilter(event) {
  state.categoryFilter = event.target.value;
  renderTasks();
}

function handleSort(event) {
  state.sortBy = event.target.value;
  renderTasks();
}

/* ---------- Dashboard statistics ---------- */
function updateStatistics() {
  const period = elements.statisticsPeriod?.value || "all";
  const tasks = state.tasks.filter((task) => isWithinPeriod(task.createdAt, period));
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const overdue = tasks.filter(isOverdue).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const weeklyCompleted = state.tasks.filter((task) => task.completedAt && isWithinPeriod(task.completedAt, "week")).length;

  setElementText(elements.totalTasks, total);
  setElementText(elements.completedTasks, completed);
  setElementText(elements.progressTasks, inProgress);
  setElementText(elements.overdueTasks, overdue);
  setElementText(elements.completionRate, `${percentage}% completion rate`);
  setElementText(elements.overdueMessage, overdue ? `${overdue} task${overdue === 1 ? "" : "s"} need attention` : "No overdue tasks");
  setElementText(elements.totalTaskTrend, total ? `${total} task${total === 1 ? "" : "s"} in this period` : "Start by adding a task");
  setElementText(elements.completionPercentage, `${percentage}%`);
  setElementText(elements.weeklyCompletedCount, weeklyCompleted);
  elements.completionRing?.style.setProperty("--progress", percentage);
}

function updateCounts() {
  const counts = {
    all: state.tasks.length,
    todo: state.tasks.filter((task) => task.status === "todo").length,
    progress: state.tasks.filter((task) => task.status === "in-progress").length,
    completed: state.tasks.filter((task) => task.status === "completed").length
  };
  setElementText(elements.sidebarTaskCount, counts.all);
  setElementText(elements.allCount, counts.all);
  setElementText(elements.todoCount, counts.todo);
  setElementText(elements.inProgressCount, counts.progress);
  setElementText(elements.completedCount, counts.completed);
}

/* ---------- Theme ---------- */
function loadPreferences() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (systemDark ? "dark" : "light"));

  const name = localStorage.getItem(STORAGE_KEYS.studentName) || "Student";
  setElementText(elements.studentName, name);
  setElementText(elements.profileName, name);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  if (elements.themeToggle) {
    const dark = theme === "dark";
    elements.themeToggle.setAttribute("aria-pressed", String(dark));
    elements.themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
    elements.themeToggle.textContent = dark ? "☀" : "◐";
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#0b1020" : "#4f46e5"
  );
}

/* ---------- Sidebar and navigation ---------- */
function openSidebar() {
  elements.sidebar?.classList.add("is-open");
  elements.sidebarOverlay?.removeAttribute("hidden");
  elements.sidebarOpen?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarOverlay?.setAttribute("hidden", "");
  elements.sidebarOpen?.setAttribute("aria-expanded", "false");
  document.body.style.removeProperty("overflow");
}

function handleNavigation(event) {
  const targetId = event.currentTarget.getAttribute("href")?.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;

  elements.navLinks.forEach((link) => {
    const active = link === event.currentTarget;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (!target) {
    event.preventDefault();
    showToast("Coming soon", "This section is planned for a future version.", "info");
  }
  if (window.innerWidth < 1200) closeSidebar();
}

/* ---------- Toast notifications ---------- */
function showToast(title, message, type = "info") {
  if (!elements.toastRegion || !elements.toastTemplate) return;
  const toast = elements.toastTemplate.content.firstElementChild.cloneNode(true);
  const icon = toast.querySelector(".toast__icon");
  toast.dataset.type = type;
  icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "i";
  toast.querySelector(".toast__title").textContent = title;
  toast.querySelector(".toast__message").textContent = message;

  const closeButton = toast.querySelector(".toast__close");
  const dismiss = () => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), prefersReducedMotion() ? 0 : 180);
  };
  closeButton.addEventListener("click", dismiss);
  elements.toastRegion.append(toast);
  window.setTimeout(dismiss, 4200);
}

/* ---------- General interface behavior ---------- */
function updateStaticContent() {
  const now = new Date();
  setElementText(elements.currentDate, new Intl.DateTimeFormat(undefined, {
    weekday: "long", month: "long", day: "numeric"
  }).format(now));
  setElementText(elements.currentYear, now.getFullYear());
  updateCharacterCounts();
}

function updateCharacterCounts() {
  setElementText(elements.titleCharacterCount, elements.taskTitle?.value.length || 0);
  setElementText(elements.descriptionCharacterCount, elements.taskDescription?.value.length || 0);
}

function setMinimumDeadline() {
  if (!elements.taskDeadline) return;
  elements.taskDeadline.min = toLocalDateInputValue(new Date());
}

function handleDialogBackdropClick(event) {
  if (event.target !== elements.taskModal) return;
  const rect = elements.taskModal.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) closeTaskModal();
}

function handleKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.globalSearchInput?.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    openTaskModal();
  }
}

function handleResize() {
  if (window.innerWidth >= 1200) closeSidebar();
}

/* ---------- Helper functions ---------- */
function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, character) => character.toUpperCase());
}

function cleanText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function parseTags(value) {
  return [...new Set(String(value ?? "").split(",").map((tag) => cleanText(tag).replace(/^#/, "")).filter(Boolean))].slice(0, 8);
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setText(root, selector, value) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

function setElementText(element, value) {
  if (element) element.textContent = String(value);
}

function capitalize(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function categoryLabel(category) {
  return ({ assignment: "Assignment", project: "Project", exam: "Exam preparation", personal: "Personal", other: "Other" })[category] || "Other";
}

function priorityWeight(priority) {
  return ({ low: 1, medium: 2, high: 3 })[priority] || 0;
}

function priorityColor(priority) {
  return ({ low: "var(--color-success)", medium: "var(--color-warning)", high: "var(--color-danger)" })[priority] || "var(--color-warning)";
}

function compareDeadlines(a, b) {
  if (!a.deadline && !b.deadline) return 0;
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  return new Date(`${a.deadline}T${a.dueTime || "23:59"}`) - new Date(`${b.deadline}T${b.dueTime || "23:59"}`);
}

function formatDeadline(dateValue, timeValue) {
  if (!dateValue) return "No deadline";
  const date = new Date(`${dateValue}T${timeValue || "12:00"}`);
  if (Number.isNaN(date.getTime())) return "Invalid deadline";
  const dateText = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
  if (!timeValue) return dateText;
  return `${dateText}, ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)}`;
}

function isOverdue(task) {
  if (!task.deadline || task.status === "completed") return false;
  const deadline = new Date(`${task.deadline}T${task.dueTime || "23:59:59"}`);
  return !Number.isNaN(deadline.getTime()) && deadline < new Date();
}

function isWithinPeriod(dateValue, period) {
  if (period === "all") return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (period === "week" ? 7 : 30));
  return date >= start && date <= now;
}

function toLocalDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/* ========================================================================== 
   Compact multi-view dashboard enhancements
   ========================================================================== */

const UI_STORAGE_KEYS = Object.freeze({
  activeView: "taskflow.activeView.v1",
  sidebarCollapsed: "taskflow.sidebarCollapsed.v1"
});

let calendarCursor = new Date();

document.addEventListener("DOMContentLoaded", initDashboardEnhancements);

function initDashboardEnhancements() {
  cacheDashboardElements();
  bindDashboardEvents();
  restoreSidebarPreference();
  const initialView = getInitialView();
  switchView(initialView, { updateHash: false, focus: false });
  renderExtendedViews();
}

function cacheDashboardElements() {
  elements.sidebarToggle = document.getElementById("sidebar-toggle");
  elements.viewTitle = document.getElementById("view-title");
  elements.appViews = [...document.querySelectorAll(".app-view")];
  elements.viewLinks = [...document.querySelectorAll("[data-view-link]")];
  elements.calendarPrevious = document.getElementById("calendar-previous");
  elements.calendarToday = document.getElementById("calendar-today");
  elements.calendarNext = document.getElementById("calendar-next");
  elements.calendarMonth = document.getElementById("calendar-month");
  elements.calendarGrid = document.getElementById("calendar-grid");
  elements.calendarEmptyState = document.getElementById("calendar-empty-state");
  elements.analyticsTotalTasks = document.getElementById("analytics-total-tasks");
  elements.analyticsCompletionRate = document.getElementById("analytics-completion-rate");
  elements.analyticsHighPriority = document.getElementById("analytics-high-priority");
  elements.analyticsOverdue = document.getElementById("analytics-overdue");
  elements.categoryAssignmentCount = document.getElementById("category-assignment-count");
  elements.categoryProjectCount = document.getElementById("category-project-count");
  elements.categoryExamCount = document.getElementById("category-exam-count");
  elements.categoryPersonalCount = document.getElementById("category-personal-count");
  elements.categoryList = document.getElementById("category-list");
  elements.settingsThemeToggle = document.getElementById("settings-theme-toggle");
  elements.exportTasks = document.getElementById("export-tasks");
  elements.importTasks = document.getElementById("import-tasks");
  elements.importTasksFile = document.getElementById("import-tasks-file");
}

function bindDashboardEvents() {
  elements.sidebarToggle?.addEventListener("click", toggleSidebarCollapsed);
  elements.viewLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    switchView(link.dataset.viewLink);
  }));
  elements.calendarPrevious?.addEventListener("click", () => changeCalendarMonth(-1));
  elements.calendarToday?.addEventListener("click", () => {
    calendarCursor = new Date();
    renderCalendar();
  });
  elements.calendarNext?.addEventListener("click", () => changeCalendarMonth(1));
  elements.categoryList?.addEventListener("click", handleCategoryCardClick);
  elements.settingsThemeToggle?.addEventListener("click", toggleTheme);
  elements.exportTasks?.addEventListener("click", exportTasksToJson);
  elements.importTasks?.addEventListener("click", () => elements.importTasksFile?.click());
  elements.importTasksFile?.addEventListener("change", importTasksFromJson);
  window.addEventListener("hashchange", handleHashNavigation);
}

function getInitialView() {
  const hashView = window.location.hash.slice(1);
  const storedView = localStorage.getItem(UI_STORAGE_KEYS.activeView);
  return isValidView(hashView) ? hashView : isValidView(storedView) ? storedView : "dashboard";
}

function isValidView(viewId) {
  return Boolean(viewId && document.getElementById(viewId)?.classList.contains("app-view"));
}

function switchView(viewId, options = {}) {
  const { updateHash = true, focus = true } = options;
  if (!isValidView(viewId)) viewId = "dashboard";

  elements.appViews.forEach((view) => {
    const active = view.id === viewId;
    view.classList.toggle("is-active", active);
    view.hidden = !active;
  });

  elements.navLinks.forEach((link) => {
    const active = link.dataset.view === viewId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const view = document.getElementById(viewId);
  setElementText(elements.viewTitle, view?.dataset.viewTitle || "TaskFlow");
  localStorage.setItem(UI_STORAGE_KEYS.activeView, viewId);

  if (updateHash && window.location.hash !== `#${viewId}`) {
    history.pushState(null, "", `#${viewId}`);
  }

  if (viewId === "calendar") renderCalendar();
  if (viewId === "analytics") updateExtendedAnalytics();
  if (viewId === "categories") updateCategoryCounts();
  if (viewId === "tasks") renderTasks();

  if (focus) document.getElementById("main-content")?.focus({ preventScroll: true });
  if (window.innerWidth < 1200) closeSidebar();
}

function handleHashNavigation() {
  const viewId = window.location.hash.slice(1);
  if (isValidView(viewId)) switchView(viewId, { updateHash: false });
}

function toggleSidebarCollapsed() {
  const collapsed = document.body.classList.toggle("sidebar-collapsed");
  localStorage.setItem(UI_STORAGE_KEYS.sidebarCollapsed, String(collapsed));
  updateSidebarToggle(collapsed);
}

function restoreSidebarPreference() {
  const collapsed = localStorage.getItem(UI_STORAGE_KEYS.sidebarCollapsed) === "true";
  document.body.classList.toggle("sidebar-collapsed", collapsed && window.innerWidth >= 1200);
  updateSidebarToggle(collapsed && window.innerWidth >= 1200);
}

function updateSidebarToggle(collapsed) {
  if (!elements.sidebarToggle) return;
  elements.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  elements.sidebarToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  const icon = elements.sidebarToggle.querySelector("span");
  if (icon) icon.textContent = collapsed ? "›" : "‹";
}

/* ---------- Calendar ---------- */
function changeCalendarMonth(offset) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1);
  renderCalendar();
}

function renderCalendar() {
  if (!elements.calendarGrid || !elements.calendarMonth) return;
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const monthTasks = state.tasks.filter((task) => {
    if (!task.deadline) return false;
    const date = new Date(`${task.deadline}T12:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  elements.calendarMonth.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long", year: "numeric"
  }).format(firstDay);
  elements.calendarGrid.replaceChildren();
  elements.calendarGrid.classList.add("calendar-grid");

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const heading = document.createElement("div");
    heading.className = "calendar-weekday";
    heading.textContent = day;
    elements.calendarGrid.append(heading);
  });

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day calendar-day--empty";
    spacer.setAttribute("aria-hidden", "true");
    elements.calendarGrid.append(spacer);
  }

  const todayValue = toLocalDateInputValue(new Date());
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const dateValue = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = monthTasks.filter((task) => task.deadline === dateValue);
    const cell = document.createElement("article");
    cell.className = "calendar-day";
    if (dateValue === todayValue) cell.classList.add("is-today");

    const number = document.createElement("strong");
    number.className = "calendar-day__number";
    number.textContent = day;
    cell.append(number);

    dayTasks.slice(0, 3).forEach((task) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `calendar-task calendar-task--${task.priority}`;
      button.textContent = task.title;
      button.title = task.title;
      button.addEventListener("click", () => openTaskModal(task.id));
      cell.append(button);
    });

    if (dayTasks.length > 3) {
      const more = document.createElement("small");
      more.textContent = `+${dayTasks.length - 3} more`;
      cell.append(more);
    }
    elements.calendarGrid.append(cell);
  }

  if (elements.calendarEmptyState) elements.calendarEmptyState.hidden = monthTasks.length > 0;
}

/* ---------- Analytics and categories ---------- */
function renderExtendedViews() {
  renderCalendar();
  updateExtendedAnalytics();
  updateCategoryCounts();
}

function updateExtendedAnalytics() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.status === "completed").length;
  setElementText(elements.analyticsTotalTasks, total);
  setElementText(elements.analyticsCompletionRate, `${total ? Math.round((completed / total) * 100) : 0}%`);
  setElementText(elements.analyticsHighPriority, state.tasks.filter((task) => task.priority === "high").length);
  setElementText(elements.analyticsOverdue, state.tasks.filter(isOverdue).length);
}

function updateCategoryCounts() {
  const count = (category) => state.tasks.filter((task) => task.category === category).length;
  setElementText(elements.categoryAssignmentCount, count("assignment"));
  setElementText(elements.categoryProjectCount, count("project"));
  setElementText(elements.categoryExamCount, count("exam"));
  setElementText(elements.categoryPersonalCount, count("personal"));
}

function handleCategoryCardClick(event) {
  const card = event.target.closest("[data-category]");
  if (!card) return;
  state.categoryFilter = card.dataset.category;
  if (elements.categoryFilter) elements.categoryFilter.value = state.categoryFilter;
  switchView("tasks");
  renderTasks();
}

/* ---------- Settings import and export ---------- */
function exportTasksToJson() {
  const blob = new Blob([JSON.stringify(state.tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `taskflow-backup-${toLocalDateInputValue(new Date())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Tasks exported", "A JSON backup was downloaded.", "success");
}

async function importTasksFromJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) throw new Error("The JSON root must be an array.");
    const imported = parsed.map(normalizeTask).filter(Boolean);
    if (!imported.length && parsed.length) throw new Error("No valid tasks were found.");
    state.tasks = imported;
    saveTasks();
    renderApp();
    renderExtendedViews();
    showToast("Tasks imported", `${imported.length} task${imported.length === 1 ? "" : "s"} loaded.`, "success");
  } catch (error) {
    console.error("Import failed:", error);
    showToast("Import failed", "Choose a valid TaskFlow JSON backup.", "error");
  } finally {
    event.target.value = "";
  }
}

/* Extend existing functions without changing their original behavior. */
const originalRenderApp = renderApp;
renderApp = function enhancedRenderApp() {
  originalRenderApp();
  renderExtendedViews();
};

const originalHandleNavigation = handleNavigation;
handleNavigation = function enhancedHandleNavigation(event) {
  event.preventDefault();
  const viewId = event.currentTarget.dataset.view || event.currentTarget.getAttribute("href")?.slice(1);
  if (isValidView(viewId)) switchView(viewId);
  else originalHandleNavigation(event);
};

const originalHandleSearch = handleSearch;
handleSearch = function enhancedHandleSearch(event) {
  originalHandleSearch(event);
  if (event.target.value.trim()) switchView("tasks");
};

const originalHandleResize = handleResize;
handleResize = function enhancedHandleResize() {
  originalHandleResize();
  if (window.innerWidth < 1200) document.body.classList.remove("sidebar-collapsed");
  else restoreSidebarPreference();
};
