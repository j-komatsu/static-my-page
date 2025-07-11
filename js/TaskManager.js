// タスク管理のロジック
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingTaskId = null;

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
}

// タスク要素を作成
function createTaskElement(task) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-item";
  taskDiv.dataset.taskId = task.id;
  taskDiv.draggable = true;
  
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
  
  taskDiv.innerHTML = `
    <div class="drag-handle">⋮⋮</div>
    <div class="task-title">${priorityBadge}${task.title}</div>
    <div class="task-description">${task.description || ""}</div>
    ${dueDateInfo}
    ${progressBar}
  `;
  
  // クリックで編集モーダルを開く
  taskDiv.addEventListener("click", (e) => {
    if (!e.target.classList.contains("drag-handle")) {
      openEditModal(task.id);
    }
  });
  
  // ドラッグイベントリスナーを追加
  taskDiv.addEventListener("dragstart", handleDragStart);
  taskDiv.addEventListener("dragend", handleDragEnd);
  
  return taskDiv;
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
    task.title = title;
    task.description = editTaskDescription.value.trim();
    task.priority = editTaskPriority.value;
    task.dueDate = editTaskDueDate.value || null;
    task.progress = parseInt(editTaskProgress.value);
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
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ドラッグ&ドロップ機能
let draggedElement = null;
let draggedTaskId = null;

function handleDragStart(e) {
  draggedElement = this;
  draggedTaskId = parseInt(this.dataset.taskId);
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
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
  
  if (draggedTaskId && draggedElement) {
    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      updateLocalStorage();
      renderTasks();
    }
  }
  
  taskList.classList.remove("drag-over");
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

// タスクリストにドラッグ&ドロップイベントを追加
document.querySelectorAll(".task-list").forEach(taskList => {
  taskList.addEventListener("dragover", handleDragOver);
  taskList.addEventListener("dragleave", handleDragLeave);
  taskList.addEventListener("drop", handleDrop);
});

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

// 初期化
updateTimerDisplay();
renderTasks();