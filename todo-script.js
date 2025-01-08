const taskList = document.getElementById('todo-task-list');
const newTaskInput = document.getElementById('todo-new-task');
const addTaskBtn = document.getElementById('todo-add-task-btn');
const clearCompletedBtn = document.getElementById('todo-clear-completed');

// ローカルストレージからタスクをロード
const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem('todo-tasks')) || [];
    taskList.innerHTML = '';
    tasks.forEach(task => addTaskToDOM(task));
};

// ローカルストレージにタスクを保存
const saveTasks = () => {
    const tasks = Array.from(taskList.children).map(li => ({
        text: li.querySelector('.todo-task-text').textContent,
        completed: li.classList.contains('completed')
    }));
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
};

// タスクをDOMに追加
const addTaskToDOM = (task) => {
    const li = document.createElement('li');
    li.className = `todo-task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <input type="checkbox" class="todo-task-checkbox" ${task.completed ? 'checked' : ''} title="タスク完了">
        <span class="todo-task-text">${task.text}</span>
        <button class="todo-delete-btn">削除</button>
    `;
    li.querySelector('.todo-task-checkbox').addEventListener('change', () => {
        li.classList.toggle('completed');
        saveTasks();
    });
    li.querySelector('.todo-delete-btn').addEventListener('click', () => {
        li.remove();
        saveTasks();
    });
    taskList.appendChild(li);
};

// 新規タスク追加
addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
        addTaskToDOM({ text: taskText, completed: false });
        saveTasks();
        newTaskInput.value = '';
    }
});

// 完了タスクをすべて削除
clearCompletedBtn.addEventListener('click', () => {
    Array.from(taskList.children).forEach(li => {
        if (li.classList.contains('completed')) {
            li.remove();
        }
    });
    saveTasks();
});

// ページロード時にタスクを読み込む
loadTasks();
