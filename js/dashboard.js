// ダッシュボード機能の実装
class Dashboard {
    constructor() {
        this.workStartTime = null;
        this.isWorking = false;
        this.workTimes = JSON.parse(localStorage.getItem('work-times')) || {};
        this.init();
    }

    init() {
        this.loadAllData();
        this.setupEventListeners();
        this.updateWorkStatus();
        this.drawWorkTimeChart();
        
        // 1分ごとに更新
        setInterval(() => {
            this.updateWorkStatus();
        }, 60000);
    }

    setupEventListeners() {
        document.getElementById('start-work-btn').addEventListener('click', () => this.startWork());
        document.getElementById('stop-work-btn').addEventListener('click', () => this.stopWork());
    }

    // 全データを読み込んで表示を更新
    loadAllData() {
        this.updateTaskStats();
        this.updateMemoStats();
        this.updateTodoStats();
        this.updateWorkTimeStats();
        this.updateCalendarStats();
        this.loadTodayTasks();
        this.loadRecentMemos();
        this.loadTodayEvents();
    }

    // タスク管理の統計を更新
    updateTaskStats() {
        const taskManagerTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const pomodoroData = JSON.parse(localStorage.getItem('pomodoro-data')) || {};
        
        const today = new Date().toISOString().split('T')[0];
        const activeTasks = taskManagerTasks.filter(task => task.status !== 'completed').length;
        const completedToday = taskManagerTasks.filter(task => 
            task.status === 'completed' && task.completedAt && task.completedAt.startsWith(today)
        ).length;
        
        const totalTasks = taskManagerTasks.length;
        const progressRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

        document.getElementById('active-tasks').textContent = activeTasks;
        document.getElementById('completed-today').textContent = completedToday;
        document.getElementById('today-progress').textContent = `${progressRate}%`;
    }

    // メモ管理の統計を更新
    updateMemoStats() {
        const memos = JSON.parse(localStorage.getItem('memos')) || [];
        const today = new Date().toISOString().split('T')[0];
        
        const totalMemos = memos.length;
        const memosToday = memos.filter(memo => 
            memo.createdAt && memo.createdAt.startsWith(today)
        ).length;
        
        const latestMemo = memos.length > 0 ? 
            memos.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0] : null;
        
        const lastUpdate = latestMemo ? 
            new Date(latestMemo.updatedAt || latestMemo.createdAt).toLocaleDateString('ja-JP') : '-';

        document.getElementById('total-memos').textContent = totalMemos;
        document.getElementById('memos-today').textContent = memosToday;
        document.getElementById('last-memo-update').textContent = lastUpdate;
    }

    // TODO統計を更新
    updateTodoStats() {
        const todos = JSON.parse(localStorage.getItem('todo-tasks')) || [];
        const recurringTasks = JSON.parse(localStorage.getItem('todo-recurring-tasks')) || [];
        const today = new Date().toISOString().split('T')[0];
        
        const pendingTodos = todos.filter(todo => !todo.completed).length;
        const completedToday = todos.filter(todo => 
            todo.completed && todo.completedAt && todo.completedAt.startsWith(today)
        ).length;
        const recurringCount = recurringTasks.length;

        document.getElementById('pending-todos').textContent = pendingTodos;
        document.getElementById('completed-todos').textContent = completedToday;
        document.getElementById('recurring-tasks').textContent = recurringCount;
    }

    // 作業時間統計を更新
    updateWorkTimeStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayTime = this.workTimes[today] || 0;
        
        // 今週の合計を計算
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        let weekTotal = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            weekTotal += this.workTimes[dateStr] || 0;
        }

        document.getElementById('today-work-time').textContent = `${Math.round(todayTime / 60)}時間`;
        document.getElementById('week-work-time').textContent = `${Math.round(weekTotal / 60)}時間`;
        
        // 週間サマリーを更新
        this.updateWeeklySummary();
    }

    // 週間サマリーを更新
    updateWeeklySummary() {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        let weekTotal = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayTime = this.workTimes[dateStr] || 0;
            weekTotal += dayTime;
            
            document.getElementById(`${dayNames[i]}-time`).textContent = `${Math.round(dayTime / 60)}h`;
        }
        
        const dailyAverage = weekTotal / 7;
        document.getElementById('week-total').textContent = `${Math.round(weekTotal / 60)}時間`;
        document.getElementById('daily-average').textContent = `${Math.round(dailyAverage / 60)}時間`;
    }

    // 今日のタスクを読み込み
    loadTodayTasks() {
        const taskManagerTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const todos = JSON.parse(localStorage.getItem('todo-tasks')) || [];
        
        // 期限近いタスク
        const urgentTasks = taskManagerTasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        }).slice(0, 5);

        // 今日のTODO
        const today = new Date().toISOString().split('T')[0];
        const todayTodos = todos.filter(todo => 
            !todo.completed && todo.createdAt && todo.createdAt.startsWith(today)
        ).slice(0, 5);

        // 進行中タスク
        const progressTasks = taskManagerTasks.filter(task => 
            task.status === 'progress'
        ).slice(0, 5);

        this.renderTaskList('urgent-tasks', urgentTasks, 'task');
        this.renderTaskList('today-todos', todayTodos, 'todo');
        this.renderTaskList('progress-tasks', progressTasks, 'task');
    }

    // タスクリストをレンダリング
    renderTaskList(containerId, tasks, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (tasks.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'タスクがありません';
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            container.appendChild(li);
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            
            if (type === 'task') {
                const prioritySpan = task.priority ? 
                    `<span class="task-priority priority-${task.priority}">${task.priority}</span>` : '';
                const dueDate = task.dueDate ? 
                    ` (期限: ${new Date(task.dueDate).toLocaleDateString('ja-JP')})` : '';
                li.innerHTML = `${prioritySpan}${task.title}${dueDate}`;
            } else {
                li.textContent = task.text || task.title;
            }
            
            container.appendChild(li);
        });
    }

    // 最近のメモを読み込み
    loadRecentMemos() {
        const memos = JSON.parse(localStorage.getItem('memos')) || [];
        const recentMemos = memos
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 6);

        const container = document.getElementById('recent-memos');
        container.innerHTML = '';

        if (recentMemos.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<div class="memo-title">メモがありません</div>';
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            container.appendChild(li);
            return;
        }

        recentMemos.forEach(memo => {
            const li = document.createElement('li');
            const date = new Date(memo.updatedAt || memo.createdAt).toLocaleDateString('ja-JP');
            const preview = memo.content ? memo.content.substring(0, 80) + '...' : '';
            
            li.innerHTML = `
                <div class="memo-title">${memo.title || '無題'}</div>
                <div class="memo-meta">
                    <span class="memo-category">${memo.category || 'その他'}</span>
                    <span class="memo-date">${date}</span>
                </div>
                <div class="memo-preview">${preview}</div>
            `;
            
            container.appendChild(li);
        });
    }

    // 作業開始
    startWork() {
        this.workStartTime = new Date();
        this.isWorking = true;
        document.getElementById('start-work-btn').disabled = true;
        document.getElementById('stop-work-btn').disabled = false;
        document.getElementById('current-status').textContent = '作業中';
        
        localStorage.setItem('work-session', JSON.stringify({
            startTime: this.workStartTime.toISOString(),
            isWorking: true
        }));
    }

    // 作業終了
    stopWork() {
        if (!this.isWorking || !this.workStartTime) return;
        
        const workEndTime = new Date();
        const workDuration = Math.round((workEndTime - this.workStartTime) / 60000); // 分単位
        const today = new Date().toISOString().split('T')[0];
        
        this.workTimes[today] = (this.workTimes[today] || 0) + workDuration;
        localStorage.setItem('work-times', JSON.stringify(this.workTimes));
        localStorage.removeItem('work-session');
        
        this.isWorking = false;
        this.workStartTime = null;
        document.getElementById('start-work-btn').disabled = false;
        document.getElementById('stop-work-btn').disabled = true;
        document.getElementById('current-status').textContent = '休憩中';
        
        this.updateWorkTimeStats();
        this.drawWorkTimeChart();
    }

    // 作業状態を更新
    updateWorkStatus() {
        // セッション復元
        const session = JSON.parse(localStorage.getItem('work-session') || 'null');
        if (session && session.isWorking) {
            this.workStartTime = new Date(session.startTime);
            this.isWorking = true;
            document.getElementById('start-work-btn').disabled = true;
            document.getElementById('stop-work-btn').disabled = false;
            document.getElementById('current-status').textContent = '作業中';
        }
        
        // 今日の作業時間を更新
        const today = new Date().toISOString().split('T')[0];
        let todayTotal = this.workTimes[today] || 0;
        
        if (this.isWorking && this.workStartTime) {
            const currentSession = Math.round((new Date() - this.workStartTime) / 60000);
            todayTotal += currentSession;
        }
        
        document.getElementById('today-work-time').textContent = `${Math.round(todayTotal / 60)}時間`;
    }

    // カレンダー統計を更新
    updateCalendarStats() {
        const events = JSON.parse(localStorage.getItem('calendar_events')) || [];
        const today = new Date().toISOString().split('T')[0];
        
        // 今日の予定数
        const todayEvents = events.filter(event => event.date === today);
        document.getElementById('today-events').textContent = `${todayEvents.length}件`;
        
        // 次の祝日を計算
        this.updateNextHoliday();
        
        // 月末までの営業日を計算
        this.updateBusinessDaysLeft();
    }

    // 次の祝日を更新
    updateNextHoliday() {
        try {
            // 日本の祝日システムを使用（calendar.jsから）
            if (typeof holidaySystem !== 'undefined') {
                const today = new Date();
                let nextHoliday = null;
                
                // 今日から30日後まで祝日を検索
                for (let i = 0; i <= 30; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() + i);
                    const holiday = holidaySystem.isHoliday(checkDate);
                    
                    if (holiday) {
                        const daysFromNow = i === 0 ? '今日' : i === 1 ? '明日' : `${i}日後`;
                        nextHoliday = `${holiday}（${daysFromNow}）`;
                        break;
                    }
                }
                
                document.getElementById('next-holiday').textContent = nextHoliday || '30日以内になし';
            } else {
                document.getElementById('next-holiday').textContent = '-';
            }
        } catch (error) {
            document.getElementById('next-holiday').textContent = '-';
        }
    }

    // 月末までの営業日を更新
    updateBusinessDaysLeft() {
        try {
            if (typeof holidaySystem !== 'undefined') {
                const today = new Date();
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                let businessDays = 0;
                const current = new Date(today);
                
                while (current <= endOfMonth) {
                    if (holidaySystem.isBusinessDay(current)) {
                        businessDays++;
                    }
                    current.setDate(current.getDate() + 1);
                }
                
                document.getElementById('business-days-left').textContent = `${businessDays}日`;
            } else {
                document.getElementById('business-days-left').textContent = '-';
            }
        } catch (error) {
            document.getElementById('business-days-left').textContent = '-';
        }
    }

    // 今日の予定を読み込み
    loadTodayEvents() {
        const events = JSON.parse(localStorage.getItem('calendar_events')) || [];
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = events.filter(event => event.date === today);
        
        const container = document.getElementById('today-calendar-events');
        container.innerHTML = '';
        
        if (todayEvents.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<div class="task-title">今日の予定はありません</div>';
            li.style.color = '#999';
            li.style.fontStyle = 'italic';
            container.appendChild(li);
            return;
        }
        
        // 時刻順でソート
        todayEvents.sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
        });
        
        todayEvents.forEach(event => {
            const li = document.createElement('li');
            const timeStr = event.allDay ? '終日' : `${event.startTime || ''} - ${event.endTime || ''}`;
            
            li.innerHTML = `
                <div class="task-title">${event.title}</div>
                <div class="task-meta">
                    <span class="task-time">${timeStr}</span>
                    <span class="task-category event-${event.category}">${this.getCategoryName(event.category)}</span>
                </div>
            `;
            
            // 複数日予定の場合は特別なマーク
            if (event.isMultiDay) {
                li.classList.add('multi-day-event');
                if (event.isFirstDay) {
                    li.querySelector('.task-title').innerHTML = `📅 ${event.title}`;
                } else if (event.isLastDay) {
                    li.querySelector('.task-title').innerHTML = `${event.title} 🏁`;
                } else {
                    li.querySelector('.task-title').innerHTML = `▶ ${event.title}`;
                }
            }
            
            container.appendChild(li);
        });
    }

    // カテゴリ名を取得
    getCategoryName(category) {
        const categories = {
            meeting: '会議',
            work: '作業',
            deadline: '締切',
            release: 'リリース',
            personal: '個人',
            other: 'その他'
        };
        return categories[category] || category;
    }

    // 作業時間チャートを描画
    drawWorkTimeChart() {
        const canvas = document.getElementById('work-time-chart');
        const ctx = canvas.getContext('2d');
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 過去7日間のデータを取得
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const workTime = (this.workTimes[dateStr] || 0) / 60; // 時間単位
            
            last7Days.push({
                date: dateStr,
                hours: workTime,
                label: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
            });
        }
        
        // チャート描画
        const padding = 50;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const maxHours = Math.max(8, Math.max(...last7Days.map(d => d.hours)));
        
        // 背景グリッド
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // 横線（時間軸）
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            const hours = maxHours - (maxHours / 4) * i;
            
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
            
            // ラベル
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round(hours)}h`, padding - 10, y + 4);
        }
        
        // 縦線（日付軸）
        for (let i = 0; i < 7; i++) {
            const x = padding + (chartWidth / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // データバー
        ctx.fillStyle = '#4a90e2';
        last7Days.forEach((day, index) => {
            const x = padding + (chartWidth / 6) * index;
            const barWidth = chartWidth / 6 * 0.6;
            const barHeight = (day.hours / maxHours) * chartHeight;
            const y = padding + chartHeight - barHeight;
            
            ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
            
            // 値ラベル
            if (day.hours > 0) {
                ctx.fillStyle = '#333';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${day.hours.toFixed(1)}h`, x, y - 5);
                ctx.fillStyle = '#4a90e2';
            }
        });
        
        // 日付ラベル
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        last7Days.forEach((day, index) => {
            const x = padding + (chartWidth / 6) * index;
            ctx.fillText(day.label, x, canvas.height - 10);
        });
    }
}

// ダッシュボードを初期化
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});