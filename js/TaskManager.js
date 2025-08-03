// タスク管理のロジック
let tasks = [];
let editingTaskId = null;

// ローカルストレージからタスクを読み込み
try {
  if (window.storageManager) {
    const data = window.storageManager.get('tasks');
    if (data) {
      tasks = data.tasks || data; // 新形式と旧形式の両方に対応
      console.log('Loaded tasks from storageManager:', tasks.length, 'tasks');
    } else {
      console.log('No saved tasks found in storageManager');
    }
  } else {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
      console.log('Loaded tasks from localStorage:', tasks.length, 'tasks');
    } else {
      console.log('No saved tasks found in localStorage');
    }
  }
} catch (error) {
  console.error('Failed to load tasks from localStorage:', error);
  tasks = [];
}

// ポモドーロタイマーの状態
let pomodoroTimer = {
  isRunning: false,
  timeLeft: 25 * 60, // 25分（秒単位）
  mode: 'work', // 'work' または 'break'
  interval: null
};

// DOM要素の取得
const planTasks = document.getElementById("plan-tasks");
const progressTasks = document.getElementById("progress-tasks");
const completedTasks = document.getElementById("completed-tasks");
const newTaskInput = document.getElementById("new-task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskEditModal = document.getElementById("task-edit-modal");
const editTaskTitle = document.getElementById("edit-task-title");
const editTaskDescription = document.getElementById("edit-task-description");
const saveTaskBtn = document.getElementById("save-task-btn");
const deleteTaskBtn = document.getElementById("delete-task-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// 新しい要素の取得
const taskPrioritySelect = document.getElementById("task-priority");
const taskDueDateInput = document.getElementById("task-due-date");
const editTaskPriority = document.getElementById("edit-task-priority");
const editTaskDueDate = document.getElementById("edit-task-due-date");
const editTaskProgress = document.getElementById("edit-task-progress");
const progressValue = document.getElementById("progress-value");
const editTaskStatus = document.getElementById("edit-task-status");

// タイマー要素の取得
const timerTime = document.getElementById("timer-time");
const timerStart = document.getElementById("timer-start");
const timerPause = document.getElementById("timer-pause");
const timerReset = document.getElementById("timer-reset");
const timerModeText = document.getElementById("timer-mode-text");

// タスクを表示
function renderTasks() {
  // 各セクションをクリア
  planTasks.innerHTML = "";
  progressTasks.innerHTML = "";
  completedTasks.innerHTML = "";

  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    
    switch (task.status) {
      case "plan":
        planTasks.appendChild(taskElement);
        break;
      case "progress":
        progressTasks.appendChild(taskElement);
        break;
      case "completed":
        completedTasks.appendChild(taskElement);
        break;
    }
  });
  
  // レンダリング後にドラッグ&ドロップリスナーを再設定
  setupDragAndDropListeners();
}

// タスク要素を作成
function createTaskElement(task) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-item";
  taskDiv.dataset.taskId = task.id;
  taskDiv.draggable = true;
  
  console.log('Creating task element for:', task.id, 'draggable:', taskDiv.draggable);
  
  // 優先度バッジ
  const priorityBadge = task.priority ? `<span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>` : '';
  
  // 期限情報
  const dueDateInfo = task.dueDate ? getDueDateInfo(task.dueDate) : '';
  
  // 進捗バー
  const progress = task.progress || 0;
  const progressBar = `
    <div class="task-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${progress}%完了</div>
    </div>
  `;
  
  // モバイル用の移動ボタン
  const moveButtons = createMoveButtons(task);
  
  taskDiv.innerHTML = `
    <div class="drag-handle">⋮⋮</div>
    <div class="task-title">${priorityBadge}${task.title}</div>
    <div class="task-description">${task.description || ""}</div>
    ${dueDateInfo}
    ${progressBar}
    ${moveButtons}
  `;
  
  // クリックで編集モーダルを開く（移動ボタンとドラッグハンドル以外）
  taskDiv.addEventListener("click", (e) => {
    if (!e.target.classList.contains("drag-handle") && 
        !e.target.classList.contains("move-btn") &&
        !e.target.closest(".mobile-move-buttons")) {
      openEditModal(task.id);
    }
  });
  
  // 移動ボタンのイベントリスナーを追加
  const moveBtns = taskDiv.querySelectorAll('.move-btn');
  moveBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newStatus = btn.dataset.status;
      moveTaskToStatus(task.id, newStatus);
    });
  });
  
  // ドラッグイベントリスナーを追加
  taskDiv.addEventListener("dragstart", handleDragStart);
  taskDiv.addEventListener("dragend", handleDragEnd);
  
  // タッチイベントリスナーを追加（モバイル対応）
  taskDiv.addEventListener("touchstart", handleTouchStart, { passive: false });
  taskDiv.addEventListener("touchmove", handleTouchMove, { passive: false });
  taskDiv.addEventListener("touchend", handleTouchEnd, { passive: false });
  
  return taskDiv;
}

// モバイル用移動ボタンを生成
function createMoveButtons(task) {
  const currentStatus = task.status;
  let buttons = [];
  
  // 現在のステータスに応じて移動可能なボタンを表示
  if (currentStatus === 'plan') {
    buttons.push('<button class="move-btn move-to-progress" data-status="progress">▶ 実行</button>');
    buttons.push('<button class="move-btn move-to-completed" data-status="completed">✓ 完了</button>');
  } else if (currentStatus === 'progress') {
    buttons.push('<button class="move-btn move-to-plan" data-status="plan">◀ 計画</button>');
    buttons.push('<button class="move-btn move-to-completed" data-status="completed">✓ 完了</button>');
  } else if (currentStatus === 'completed') {
    buttons.push('<button class="move-btn move-to-plan" data-status="plan">↩ 計画</button>');
    buttons.push('<button class="move-btn move-to-progress" data-status="progress">↩ 実行</button>');
  }
  
  return `<div class="mobile-move-buttons">${buttons.join('')}</div>`;
}

// タスクを指定したステータスに移動
function moveTaskToStatus(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || task.status === newStatus) return;
  
  console.log('Moving task from', task.status, 'to', newStatus);
  task.status = newStatus;
  
  // 完了ステータスに移動した場合は進捗を100%に設定し、完了日時を記録
  if (newStatus === "completed") {
    task.progress = 100;
    task.completedAt = new Date().toISOString();
  }
  
  updateLocalStorage();
  renderTasks();
}

// 新しいタスクを追加
function addNewTask() {
  const title = newTaskInput.value.trim();
  if (!title) {
    alert("タスク名を入力してください！");
    return;
  }
  
  const newTask = {
    id: Date.now(),
    title: title,
    description: "",
    status: "plan",
    priority: taskPrioritySelect.value,
    dueDate: taskDueDateInput.value || null,
    progress: 0,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  newTaskInput.value = "";
  taskPrioritySelect.value = "medium";
  taskDueDateInput.value = "";
  updateLocalStorage();
  renderTasks();
}

// 編集モーダルを開く
function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  editingTaskId = taskId;
  editTaskTitle.value = task.title;
  editTaskDescription.value = task.description || "";
  editTaskPriority.value = task.priority || "medium";
  editTaskDueDate.value = task.dueDate || "";
  editTaskStatus.value = task.status || "plan";
  editTaskProgress.value = task.progress || 0;
  progressValue.textContent = `${task.progress || 0}%`;
  taskEditModal.style.display = "flex";
}

// モーダルを閉じる
function closeEditModal() {
  editingTaskId = null;
  editTaskTitle.value = "";
  editTaskDescription.value = "";
  taskEditModal.style.display = "none";
}

// タスクを保存
function saveTask() {
  if (!editingTaskId) return;
  
  const title = editTaskTitle.value.trim();
  if (!title) {
    alert("タスク名を入力してください！");
    return;
  }
  
  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    const oldStatus = task.status;
    task.title = title;
    task.description = editTaskDescription.value.trim();
    task.priority = editTaskPriority.value;
    task.dueDate = editTaskDueDate.value || null;
    task.status = editTaskStatus.value;
    task.progress = parseInt(editTaskProgress.value);
    
    // 完了ステータスに変更された場合は完了日時を記録
    if (oldStatus !== "completed" && task.status === "completed") {
      task.progress = 100;
      task.completedAt = new Date().toISOString();
    }
    
    updateLocalStorage();
    renderTasks();
    closeEditModal();
  }
}

// タスクを削除
function deleteTask() {
  if (!editingTaskId) return;
  
  if (confirm("このタスクを削除しますか？")) {
    tasks = tasks.filter(t => t.id !== editingTaskId);
    updateLocalStorage();
    renderTasks();
    closeEditModal();
  }
}

// ローカルストレージを更新
function updateLocalStorage() {
  try {
    if (window.storageManager) {
      window.storageManager.set('tasks', {
        tasks: tasks,
        lastModified: Date.now()
      });
    } else {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    console.log('Tasks saved to localStorage:', tasks.length, 'tasks');
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

// ドラッグ&ドロップ機能
let draggedElement = null;
let draggedTaskId = null;

// タッチ操作用の変数
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let touchDraggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  draggedTaskId = parseInt(this.dataset.taskId);
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedTaskId);
  
  console.log('Drag started for task:', draggedTaskId);
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  
  // すべてのドラッグオーバーのハイライトを削除
  document.querySelectorAll(".task-list").forEach(list => {
    list.classList.remove("drag-over");
  });
  
  draggedElement = null;
  draggedTaskId = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  
  const taskList = e.currentTarget;
  taskList.classList.add("drag-over");
}

function handleDragLeave(e) {
  const taskList = e.currentTarget;
  if (!taskList.contains(e.relatedTarget)) {
    taskList.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  e.preventDefault();
  const taskList = e.currentTarget;
  const newStatus = taskList.dataset.status;
  
  console.log('Drop event:', {
    draggedTaskId,
    newStatus,
    hasElement: !!draggedElement
  });
  
  if (draggedTaskId && draggedElement) {
    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== newStatus) {
      console.log('Moving task from', task.status, 'to', newStatus);
      task.status = newStatus;
      
      // 完了ステータスに移動した場合は進捗を100%に設定し、完了日時を記録
      if (newStatus === "completed") {
        task.progress = 100;
        task.completedAt = new Date().toISOString();
      }
      
      updateLocalStorage();
      renderTasks();
    }
  }
  
  taskList.classList.remove("drag-over");
}

// タッチイベントハンドラー（モバイル対応）
function handleTouchStart(e) {
  if (e.target.classList.contains("drag-handle") || e.target.closest(".drag-handle")) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDraggedElement = this;
    draggedTaskId = parseInt(this.dataset.taskId);
    
    // 長押しでドラッグ開始
    setTimeout(() => {
      if (touchDraggedElement && !isDragging) {
        isDragging = true;
        touchDraggedElement.classList.add("dragging");
        console.log('Touch drag started for task:', draggedTaskId);
      }
    }, 300);
  }
}

function handleTouchMove(e) {
  if (!isDragging || !touchDraggedElement) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  
  // ドラッグ距離が十分でない場合は何もしない
  if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
  
  // 要素の位置を更新
  touchDraggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  
  // ドロップターゲットを検出
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const taskList = elementBelow?.closest('.task-list');
  
  // 既存のハイライトをクリア
  document.querySelectorAll('.task-list').forEach(list => {
    list.classList.remove('drag-over');
  });
  
  // 新しいドロップターゲットをハイライト
  if (taskList && taskList !== touchDraggedElement.parentElement) {
    taskList.classList.add('drag-over');
  }
}

function handleTouchEnd(e) {
  if (!isDragging || !touchDraggedElement) {
    // ドラッグしていない場合はクリック処理
    touchDraggedElement = null;
    return;
  }
  
  const touch = e.changedTouches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const taskList = elementBelow?.closest('.task-list');
  
  if (taskList && draggedTaskId) {
    const newStatus = taskList.dataset.status;
    const task = tasks.find(t => t.id === draggedTaskId);
    
    if (task && task.status !== newStatus) {
      console.log('Touch drop: Moving task from', task.status, 'to', newStatus);
      task.status = newStatus;
      
      // 完了ステータスに移動した場合は進捗を100%に設定
      if (newStatus === "completed") {
        task.progress = 100;
        task.completedAt = new Date().toISOString();
      }
      
      updateLocalStorage();
      renderTasks();
    }
  }
  
  // クリーンアップ
  if (touchDraggedElement) {
    touchDraggedElement.classList.remove("dragging");
    touchDraggedElement.style.transform = '';
  }
  
  document.querySelectorAll('.task-list').forEach(list => {
    list.classList.remove('drag-over');
  });
  
  isDragging = false;
  touchDraggedElement = null;
  draggedTaskId = null;
}

// イベントリスナーの設定
addTaskBtn.addEventListener("click", addNewTask);
newTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addNewTask();
  }
});

saveTaskBtn.addEventListener("click", saveTask);
deleteTaskBtn.addEventListener("click", deleteTask);
cancelEditBtn.addEventListener("click", closeEditModal);

// ドラッグ&ドロップイベントリスナーを設定する関数
function setupDragAndDropListeners() {
  const taskLists = document.querySelectorAll(".task-list");
  console.log('Setting up drag and drop for', taskLists.length, 'task lists');
  
  taskLists.forEach((taskList, index) => {
    // 既存のリスナーをクリア（重複防止）
    taskList.removeEventListener("dragover", handleDragOver);
    taskList.removeEventListener("dragleave", handleDragLeave);
    taskList.removeEventListener("drop", handleDrop);
    
    // 新しいリスナーを追加
    taskList.addEventListener("dragover", handleDragOver);
    taskList.addEventListener("dragleave", handleDragLeave);
    taskList.addEventListener("drop", handleDrop);
    
    console.log(`Task list ${index} (${taskList.dataset.status}) configured for drag and drop`);
  });
}

// モーダルの外側クリックで閉じる
taskEditModal.addEventListener("click", (e) => {
  if (e.target === taskEditModal) {
    closeEditModal();
  }
});

// ヘルパー関数
function getPriorityText(priority) {
  const priorityMap = { high: '高', medium: '中', low: '低' };
  return priorityMap[priority] || '中';
}

function getDueDateInfo(dueDate) {
  if (!dueDate) return '';
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let className = 'due-date-info';
  let text = `期限: ${dueDate}`;
  
  if (diffDays < 0) {
    className += ' due-date-overdue';
    text += ` (${Math.abs(diffDays)}日遅れ)`;
  } else if (diffDays === 0) {
    className += ' due-date-today';
    text += ' (今日)';
  } else if (diffDays <= 3) {
    className += ' due-date-upcoming';
    text += ` (${diffDays}日後)`;
  }
  
  return `<div class="${className}">${text}</div>`;
}

// ポモドーロタイマー機能
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timerTime.textContent = formatTime(pomodoroTimer.timeLeft);
  timerModeText.textContent = pomodoroTimer.mode === 'work' ? '作業時間' : '休憩時間';
}

function startTimer() {
  if (pomodoroTimer.isRunning) return;
  
  pomodoroTimer.isRunning = true;
  timerStart.disabled = true;
  timerPause.disabled = false;
  
  pomodoroTimer.interval = setInterval(() => {
    pomodoroTimer.timeLeft--;
    updateTimerDisplay();
    
    if (pomodoroTimer.timeLeft <= 0) {
      clearInterval(pomodoroTimer.interval);
      pomodoroTimer.isRunning = false;
      
      // モード切り替え
      if (pomodoroTimer.mode === 'work') {
        pomodoroTimer.mode = 'break';
        pomodoroTimer.timeLeft = 5 * 60; // 5分休憩
        alert('作業時間終了！5分間休憩してください。');
      } else {
        pomodoroTimer.mode = 'work';
        pomodoroTimer.timeLeft = 25 * 60; // 25分作業
        alert('休憩時間終了！次の作業を開始してください。');
      }
      
      timerStart.disabled = false;
      timerPause.disabled = true;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  if (!pomodoroTimer.isRunning) return;
  
  clearInterval(pomodoroTimer.interval);
  pomodoroTimer.isRunning = false;
  timerStart.disabled = false;
  timerPause.disabled = true;
}

function resetTimer() {
  clearInterval(pomodoroTimer.interval);
  pomodoroTimer.isRunning = false;
  pomodoroTimer.mode = 'work';
  pomodoroTimer.timeLeft = 25 * 60;
  timerStart.disabled = false;
  timerPause.disabled = true;
  updateTimerDisplay();
}

// イベントリスナーの追加
timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
timerReset.addEventListener('click', resetTimer);

// 進捗スライダーのイベントリスナー
editTaskProgress.addEventListener('input', (e) => {
  progressValue.textContent = `${e.target.value}%`;
});

// DOMが完全に読み込まれた後に初期化
document.addEventListener('DOMContentLoaded', function() {
  updateTimerDisplay();
  renderTasks();
  setupDragAndDropListeners();
  
  // デバッグ用のログ
  console.log('TaskManager initialized');
  console.log('Task lists found:', document.querySelectorAll('.task-list').length);
});