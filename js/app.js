/* =====================================================
   Todo List Dashboard — app.js
   All application logic for the dashboard and its widgets
   ===================================================== */

// ===== StorageManager =====
// Centralises all localStorage interactions

const StorageManager = {
  KEYS: {
    TASKS: 'tdl_tasks',
    LINKS: 'tdl_links',
  },

  /**
   * Load data from localStorage by key
   * @param {string} key - The storage key
   * @returns {any|null} - Parsed data or null on error/missing
   */
  load(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`StorageManager: Failed to load key "${key}"`, error);
      return null;
    }
  },

  /**
   * Save data to localStorage by key
   * @param {string} key - The storage key
   * @param {any} value - The data to serialize and save
   */
  save(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`StorageManager: Failed to save key "${key}"`, error);
    }
  },
};


// ===== GreetingWidget =====
// Displays current time, date, and time-based greeting

const GreetingWidget = {
  _timeEl: null,
  _dateEl: null,
  _messageEl: null,
  _intervalId: null,

  init() {
    this._timeEl = document.getElementById('greeting-time');
    this._dateEl = document.getElementById('greeting-date');
    this._messageEl = document.getElementById('greeting-message');

    this._render();

    // Align interval to next minute boundary
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      this._render();
      this._intervalId = setInterval(() => this._render(), 60000);
    }, msUntilNextMinute);
  },

  _render() {
    const now = new Date();
    this._timeEl.textContent = this._formatTime(now);
    this._dateEl.textContent = this._formatDate(now);
    // Use 'Welcome' fallback if date is invalid (Requirement 1.8)
    if (isNaN(now.getTime())) {
      this._messageEl.textContent = 'Welcome';
    } else {
      this._messageEl.textContent = this._getGreeting(now.getHours());
    }
  },

  _formatTime(date) {
    if (isNaN(date.getTime())) {
      return '--:--';
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  _formatDate(date) {
    if (isNaN(date.getTime())) {
      return '';
    }
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  },

  _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 17) {
      return 'Good Afternoon';
    } else if (hour >= 18 && hour <= 20) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  },
};


// ===== FocusTimerWidget =====
// 25-minute countdown timer with Start, Stop, Reset controls

const FocusTimerWidget = {
  _remaining: 1500, // 25 * 60 seconds
  _intervalId: null,
  _isRunning: false,

  _displayEl: null,
  _completeEl: null,
  _startBtn: null,
  _stopBtn: null,
  _resetBtn: null,

  init() {
    this._displayEl = document.getElementById('timer-display');
    this._completeEl = document.getElementById('timer-complete');
    this._startBtn = document.getElementById('timer-start');
    this._stopBtn = document.getElementById('timer-stop');
    this._resetBtn = document.getElementById('timer-reset');

    this._startBtn.addEventListener('click', () => this._start());
    this._stopBtn.addEventListener('click', () => this._stop());
    this._resetBtn.addEventListener('click', () => this._reset());

    this._render();
  },

  _render() {
    this._displayEl.textContent = this._formatTime(this._remaining);
  },

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  _start() {
    if (this._isRunning) {
      return; // idempotent
    }
    this._isRunning = true;
    this._intervalId = setInterval(() => this._tick(), 1000);
  },

  _stop() {
    if (!this._isRunning) {
      return; // idempotent
    }
    this._isRunning = false;
    clearInterval(this._intervalId);
    this._intervalId = null;
  },

  _reset() {
    this._stop();
    this._remaining = 1500;
    this._displayEl.classList.remove('timer__display--complete');
    this._completeEl.hidden = true;
    this._render();
  },

  _tick() {
    if (this._remaining <= 0) {
      this._stop();
      return;
    }
    this._remaining--;
    this._render();

    if (this._remaining === 0) {
      this._stop();
      this._displayEl.classList.add('timer__display--complete');
      this._completeEl.hidden = false;
    }
  },
};


// ===== TodoListWidget =====
// Full CRUD task manager with localStorage persistence

const TodoListWidget = {
  _tasks: [],
  _editingId: null,

  _inputEl: null,
  _addBtnEl: null,
  _listEl: null,
  _charLimitMsgEl: null,

  init() {
    this._inputEl = document.getElementById('todo-input');
    this._addBtnEl = document.getElementById('todo-add-btn');
    this._listEl = document.getElementById('todo-list');
    this._charLimitMsgEl = document.getElementById('todo-char-limit-msg');

    this._addBtnEl.addEventListener('click', () => this._handleAdd());
    this._inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._handleAdd();
      }
    });

    this._listEl.addEventListener('click', (e) => this._handleListClick(e));

    this._loadFromStorage();
    this._render();
  },

  _loadFromStorage() {
    const data = StorageManager.load(StorageManager.KEYS.TASKS);
    if (Array.isArray(data)) {
      this._tasks = data;
    } else {
      this._tasks = [];
    }
  },

  _saveToStorage() {
    StorageManager.save(StorageManager.KEYS.TASKS, this._tasks);
  },

  _handleAdd() {
    const description = this._inputEl.value;
    this._addTask(description);
  },

  _addTask(description) {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      this._charLimitMsgEl.hidden = true;
      return;
    }
    if (trimmed.length > 200) {
      this._charLimitMsgEl.hidden = false;
      return;
    }

    this._charLimitMsgEl.hidden = true;

    const task = {
      id: Date.now().toString(),
      description: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    this._tasks.push(task);
    this._saveToStorage();
    this._inputEl.value = '';
    this._render();
  },

  _deleteTask(id) {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) {
      return;
    }
    this._tasks = this._tasks.filter((t) => t.id !== id);
    this._saveToStorage();
    this._render();
  },

  _toggleTask(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this._saveToStorage();
      this._render();
    }
  },

  _startEdit(id) {
    if (this._editingId !== null) {
      this._cancelEdit();
    }
    this._editingId = id;
    this._render();
  },

  _confirmEdit(id, newDescription) {
    const trimmed = newDescription.trim();
    if (trimmed.length === 0) {
      return; // reject empty
    }
    const task = this._tasks.find((t) => t.id === id);
    if (task) {
      task.description = trimmed;
      this._saveToStorage();
    }
    this._editingId = null;
    this._render();
  },

  _cancelEdit() {
    this._editingId = null;
    this._render();
  },

  _render() {
    this._listEl.innerHTML = '';
    this._tasks.forEach((task) => {
      const itemEl = this._renderTask(task);
      this._listEl.appendChild(itemEl);
    });
  },

  _renderTask(task) {
    const li = document.createElement('li');
    li.className = 'todo__item';
    li.dataset.id = task.id;

    const isEditing = this._editingId === task.id;

    if (isEditing) {
      // Edit mode
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'todo__edit-input';
      input.value = task.description;
      input.dataset.id = task.id;

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn btn--primary';
      saveBtn.textContent = 'Save';
      saveBtn.dataset.action = 'save';
      saveBtn.dataset.id = task.id;

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn--secondary';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.dataset.action = 'cancel';

      const actions = document.createElement('div');
      actions.className = 'todo__item-actions';
      actions.appendChild(saveBtn);
      actions.appendChild(cancelBtn);

      li.appendChild(input);
      li.appendChild(actions);

      // Focus the input
      setTimeout(() => input.focus(), 0);
    } else {
      // Display mode
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo__checkbox';
      checkbox.checked = task.completed;
      checkbox.dataset.action = 'toggle';
      checkbox.dataset.id = task.id;
      checkbox.setAttribute('aria-label', `Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`);

      const description = document.createElement('span');
      description.className = 'todo__description';
      if (task.completed) {
        description.classList.add('todo__description--completed');
      }
      description.textContent = task.description;

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn--secondary';
      editBtn.textContent = 'Edit';
      editBtn.dataset.action = 'edit';
      editBtn.dataset.id = task.id;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn--secondary';
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.action = 'delete';
      deleteBtn.dataset.id = task.id;

      const actions = document.createElement('div');
      actions.className = 'todo__item-actions';
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(description);
      li.appendChild(actions);
    }

    return li;
  },

  _handleListClick(event) {
    const target = event.target;
    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'toggle' && id) {
      this._toggleTask(id);
    } else if (action === 'edit' && id) {
      this._startEdit(id);
    } else if (action === 'delete' && id) {
      this._deleteTask(id);
    } else if (action === 'save' && id) {
      const input = target.closest('.todo__item').querySelector('.todo__edit-input');
      if (input) {
        this._confirmEdit(id, input.value);
      }
    } else if (action === 'cancel') {
      this._cancelEdit();
    }
  },
};


// ===== QuickLinksWidget =====
// User-defined panel of labelled URL shortcut buttons

const QuickLinksWidget = {
  _links: [],

  _labelInputEl: null,
  _urlInputEl: null,
  _addBtnEl: null,
  _panelEl: null,
  _placeholderEl: null,
  _labelErrorEl: null,
  _urlErrorEl: null,

  init() {
    this._labelInputEl = document.getElementById('link-label-input');
    this._urlInputEl = document.getElementById('link-url-input');
    this._addBtnEl = document.getElementById('link-add-btn');
    this._panelEl = document.getElementById('links-panel');
    this._placeholderEl = document.getElementById('links-placeholder');
    this._labelErrorEl = document.getElementById('link-label-error');
    this._urlErrorEl = document.getElementById('link-url-error');

    this._addBtnEl.addEventListener('click', () => this._handleAdd());
    this._panelEl.addEventListener('click', (e) => this._handlePanelClick(e));

    this._loadFromStorage();
    this._render();
  },

  _loadFromStorage() {
    const data = StorageManager.load(StorageManager.KEYS.LINKS);
    if (Array.isArray(data)) {
      this._links = data;
    } else {
      // Seed default links on first load
      this._links = [
        { id: 'default-google',    label: 'Google',          url: 'https://www.google.com',              createdAt: Date.now() },
        { id: 'default-gmail',     label: 'Gmail',           url: 'https://mail.google.com',             createdAt: Date.now() + 1 },
        { id: 'default-calendar',  label: 'Google Calendar', url: 'https://calendar.google.com',         createdAt: Date.now() + 2 },
      ];
      this._saveToStorage();
    }
  },

  _saveToStorage() {
    StorageManager.save(StorageManager.KEYS.LINKS, this._links);
  },

  _handleAdd() {
    const label = this._labelInputEl.value.trim();
    const url = this._urlInputEl.value.trim();
    this._addLink(label, url);
  },

  _addLink(label, url) {
    this._labelErrorEl.hidden = true;
    this._urlErrorEl.hidden = true;

    let hasError = false;

    if (label.length === 0) {
      this._labelErrorEl.textContent = 'Label is required.';
      this._labelErrorEl.hidden = false;
      hasError = true;
    }

    if (url.length === 0) {
      this._urlErrorEl.textContent = 'URL is required.';
      this._urlErrorEl.hidden = false;
      hasError = true;
    } else if (!this._validateUrl(url)) {
      this._urlErrorEl.textContent = 'URL must start with http:// or https://';
      this._urlErrorEl.hidden = false;
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const link = {
      id: Date.now().toString(),
      label,
      url,
      createdAt: Date.now(),
    };

    this._links.push(link);
    this._saveToStorage();
    this._labelInputEl.value = '';
    this._urlInputEl.value = '';
    this._render();
  },

  _deleteLink(id) {
    this._links = this._links.filter((l) => l.id !== id);
    this._saveToStorage();
    this._render();
  },

  _openLink(url) {
    if (!this._validateUrl(url)) {
      alert('Invalid URL');
      return;
    }
    window.open(url, '_blank');
  },

  _validateUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  },

  _render() {
    // Clear panel except placeholder
    this._panelEl.innerHTML = '';
    this._panelEl.appendChild(this._placeholderEl);

    if (this._links.length === 0) {
      this._placeholderEl.hidden = false;
    } else {
      this._placeholderEl.hidden = true;
      this._links.forEach((link) => {
        const itemEl = this._renderLink(link);
        this._panelEl.appendChild(itemEl);
      });
    }
  },

  _renderLink(link) {
    const container = document.createElement('div');
    container.className = 'links__item';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'links__btn';
    btn.dataset.action = 'open';
    btn.dataset.url = link.url;
    btn.setAttribute('aria-label', `Open ${link.label}`);

    // Truncate label to 50 characters
    const displayLabel = link.label.length > 50 ? link.label.substring(0, 50) : link.label;
    btn.textContent = displayLabel;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'links__delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = link.id;
    deleteBtn.setAttribute('aria-label', `Delete ${link.label}`);

    container.appendChild(btn);
    container.appendChild(deleteBtn);

    return container;
  },

  _handlePanelClick(event) {
    const target = event.target;
    const action = target.dataset.action;

    if (action === 'open') {
      const url = target.dataset.url;
      if (url) {
        this._openLink(url);
      }
    } else if (action === 'delete') {
      const id = target.dataset.id;
      if (id) {
        this._deleteLink(id);
      }
    }
  },
};


// ===== Main Initialization =====

document.addEventListener('DOMContentLoaded', () => {
  GreetingWidget.init();
  FocusTimerWidget.init();
  TodoListWidget.init();
  QuickLinksWidget.init();
});
