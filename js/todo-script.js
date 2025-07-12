// DOM要素の取得
const taskList = document.getElementById('todo-task-list');
const recurringList = document.getElementById('todo-recurring-list');
const newTaskInput = document.getElementById('todo-new-task');
const taskTypeSelect = document.getElementById('todo-task-type');
const addTaskBtn = document.getElementById('todo-add-task-btn');
const clearCompletedBtn = document.getElementById('todo-clear-completed');

// データ構造
let tasks = [];
let recurringTasks = [];
let completionStats = [];

// ローカルストレージからデータをロード
const loadData = () => {
    tasks = JSON.parse(localStorage.getItem('todo-tasks')) || [];
    recurringTasks = JSON.parse(localStorage.getItem('todo-recurring-tasks')) || [];
    completionStats = JSON.parse(localStorage.getItem('todo-completion-stats')) || [];
    
    renderTasks();
    renderRecurringTasks();
    updateStats();
};

// ローカルストレージにデータを保存
const saveData = () => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    localStorage.setItem('todo-recurring-tasks', JSON.stringify(recurringTasks));
    localStorage.setItem('todo-completion-stats', JSON.stringify(completionStats));
};

// タスクIDの生成
const generateTaskId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 通常タスクをDOMに追加
const addTaskToDOM = (task, container) => {
    const li = document.createElement('li');
    li.className = `todo-task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.taskId = task.id;
    
    li.innerHTML = `
        <input type="checkbox" class="todo-task-checkbox" ${task.completed ? 'checked' : ''} title="タスク完了">
        <span class="todo-task-text">${task.text}</span>
        <button class="add-subtask-btn" onclick="addSubtask('${task.id}')">+サブ</button>
        <button class="delete-btn" onclick="deleteTask('${task.id}')">削除</button>
    `;
    
    // チェックボックスイベント
    const checkbox = li.querySelector('.todo-task-checkbox');
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        li.classList.toggle('completed', task.completed);
        
        // 完了統計を記録
        if (task.completed) {
            recordCompletion(task.id);
        }
        
        saveData();
        updateStats();
    });
    
    container.appendChild(li);
    
    // サブタスクを表示
    if (task.subtasks && task.subtasks.length > 0) {
        const subtaskContainer = document.createElement('div');
        subtaskContainer.className = 'subtask-container';
        
        task.subtasks.forEach(subtask => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = `subtask-item ${subtask.completed ? 'completed' : ''}`;
            subtaskDiv.innerHTML = `
                <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                       onchange="toggleSubtask('${task.id}', '${subtask.id}')">
                <span>${subtask.text}</span>
                <button class="delete-btn" onclick="deleteSubtask('${task.id}', '${subtask.id}')">削除</button>
            `;
            subtaskContainer.appendChild(subtaskDiv);
        });
        
        container.appendChild(subtaskContainer);
    }
};

// 繰り返しタスクをDOMに追加
const addRecurringTaskToDOM = (task, container) => {
    const li = document.createElement('li');
    li.className = `todo-task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.taskId = task.id;
    
    const typeText = task.type === 'daily' ? '日次' : '週次';
    const nextDue = getNextDueDate(task);
    
    li.innerHTML = `
        <input type="checkbox" class="todo-task-checkbox" ${task.completed ? 'checked' : ''} title="タスク完了">
        <span class="todo-task-text">${task.text}</span>
        <span class="recurring-badge">${typeText}</span>
        <span class="next-due">次回: ${nextDue}</span>
        <button class="delete-btn" onclick="deleteRecurringTask('${task.id}')">削除</button>
    `;
    
    // チェックボックスイベント
    const checkbox = li.querySelector('.todo-task-checkbox');
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            // 完了時の処理
            recordCompletion(task.id);
            
            // 次回の繰り返しタスクを生成
            task.lastCompleted = new Date().toISOString();
            task.completed = false;
            checkbox.checked = false;
            
            // 次回期限を更新
            li.querySelector('.next-due').textContent = `次回: ${getNextDueDate(task)}`;
        }
        
        saveData();
        updateStats();
    });
    
    container.appendChild(li);
};

// 次回期限日を計算
const getNextDueDate = (task) => {
    const lastCompleted = task.lastCompleted ? new Date(task.lastCompleted) : new Date();
    const next = new Date(lastCompleted);
    
    if (task.type === 'daily') {
        next.setDate(next.getDate() + 1);
    } else if (task.type === 'weekly') {
        next.setDate(next.getDate() + 7);
    }
    
    return next.toLocaleDateString('ja-JP');
};

// タスクをレンダリング
const renderTasks = () => {
    taskList.innerHTML = '';
    tasks.forEach(task => addTaskToDOM(task, taskList));
};

// 繰り返しタスクをレンダリング
const renderRecurringTasks = () => {
    recurringList.innerHTML = '';
    recurringTasks.forEach(task => addRecurringTaskToDOM(task, recurringList));
};

// 新規タスク追加
const addNewTask = () => {
    const taskText = newTaskInput.value.trim();
    const taskType = taskTypeSelect.value;
    
    if (!taskText) return;
    
    const newTask = {
        id: generateTaskId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: []
    };
    
    if (taskType === 'single') {
        tasks.push(newTask);
        renderTasks();
    } else {
        newTask.type = taskType;
        newTask.lastCompleted = null;
        recurringTasks.push(newTask);
        renderRecurringTasks();
    }
    
    newTaskInput.value = '';
    saveData();
};

// サブタスク追加
const addSubtask = (taskId) => {
    const subtaskText = prompt('サブタスクの内容を入力してください:');
    if (!subtaskText) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!task.subtasks) task.subtasks = [];
    
    task.subtasks.push({
        id: generateTaskId(),
        text: subtaskText,
        completed: false
    });
    
    renderTasks();
    saveData();
};

// サブタスクの完了切り替え
const toggleSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;
    
    subtask.completed = !subtask.completed;
    
    renderTasks();
    saveData();
};

// タスク削除
const deleteTask = (taskId) => {
    if (confirm('このタスクを削除しますか？')) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        saveData();
    }
};

// 繰り返しタスク削除
const deleteRecurringTask = (taskId) => {
    if (confirm('この繰り返しタスクを削除しますか？')) {
        recurringTasks = recurringTasks.filter(t => t.id !== taskId);
        renderRecurringTasks();
        saveData();
    }
};

// サブタスク削除
const deleteSubtask = (taskId, subtaskId) => {
    if (confirm('このサブタスクを削除しますか？')) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
            renderTasks();
            saveData();
        }
    }
};

// 完了を記録
const recordCompletion = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    
    let record = completionStats.find(r => r.date === today);
    if (!record) {
        record = { date: today, completions: [] };
        completionStats.push(record);
    }
    
    record.completions.push({
        taskId: taskId,
        completedAt: new Date().toISOString()
    });
    
    // 30日以上古いデータを削除
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    completionStats = completionStats.filter(r => new Date(r.date) >= thirtyDaysAgo);
};

// 統計を更新
const updateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);
    
    // 今日の完了率
    const todayTasks = tasks.filter(t => t.createdAt.startsWith(today));
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const todayRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
    
    // 今週の完了率
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekStart);
    const weekCompleted = weekTasks.filter(t => t.completed).length;
    const weekRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;
    
    // 今月の完了率
    const monthTasks = tasks.filter(t => new Date(t.createdAt) >= monthStart);
    const monthCompleted = monthTasks.filter(t => t.completed).length;
    const monthRate = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0;
    
    // 統計表示を更新
    document.getElementById('today-completion').textContent = `${todayRate}%`;
    document.getElementById('week-completion').textContent = `${weekRate}%`;
    document.getElementById('month-completion').textContent = `${monthRate}%`;
    
    // グラフを描画
    drawCompletionChart();
};

// 完了率グラフを描画
const drawCompletionChart = () => {
    const canvas = document.getElementById('completion-chart');
    const ctx = canvas.getContext('2d');
    
    // 高DPI対応
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 過去7日間のデータを取得
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = tasks.filter(t => t.createdAt.startsWith(dateStr));
        const completed = dayTasks.filter(t => t.completed).length;
        const rate = dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0;
        
        last7Days.push({
            date: dateStr,
            rate: rate,
            label: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
        });
    }
    
    // グラフを描画
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxRate = 100;
    
    // 背景グリッド
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // 横線
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // 縦線
    for (let i = 0; i < 7; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
    }
    
    // データライン
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    last7Days.forEach((day, index) => {
        const x = padding + (chartWidth / 6) * index;
        const y = padding + chartHeight - (day.rate / maxRate) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // データポイント
    ctx.fillStyle = '#4a90e2';
    last7Days.forEach((day, index) => {
        const x = padding + (chartWidth / 6) * index;
        const y = padding + chartHeight - (day.rate / maxRate) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // ラベル
    ctx.fillStyle = '#666';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    
    last7Days.forEach((day, index) => {
        const x = padding + (chartWidth / 6) * index;
        ctx.fillText(day.label, x, height - 10);
        ctx.fillText(`${Math.round(day.rate)}%`, x, padding + chartHeight - (day.rate / maxRate) * chartHeight - 10);
    });
};

// 完了タスクをすべて削除
const clearCompletedTasks = () => {
    if (confirm('完了したタスクをすべて削除しますか？')) {
        tasks = tasks.filter(t => !t.completed);
        renderTasks();
        saveData();
        updateStats();
    }
};

// イベントリスナーの設定
addTaskBtn.addEventListener('click', addNewTask);
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewTask();
});
clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// 初期化
loadData();