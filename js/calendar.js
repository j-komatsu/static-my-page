// カレンダー・スケジュール管理システム

// グローバル変数
let currentDate = new Date();
let currentView = 'month';
let events = JSON.parse(localStorage.getItem('calendar_events')) || [];
let projects = JSON.parse(localStorage.getItem('calendar_projects')) || [];
let editingEventId = null;

// 日本の祝日計算システム
class JapanHolidays {
  constructor() {
    // 固定祝日データ (毎年同じ日付)
    this.fixedHolidays = {
      '01-01': '元日',
      '02-11': '建国記念の日',
      '04-29': '昭和の日',
      '05-03': '憲法記念日',
      '05-04': 'みどりの日',
      '05-05': 'こどもの日',
      '08-11': '山の日',
      '11-03': '文化の日',
      '11-23': '勤労感謝の日',
      '12-23': '天皇誕生日' // 2019年以降
    };

    // 移動祝日の計算ルール
    this.movingHolidays = {
      '成人の日': { month: 1, week: 2, dayOfWeek: 1 }, // 1月第2月曜日
      '海の日': { month: 7, week: 3, dayOfWeek: 1 },   // 7月第3月曜日
      '敬老の日': { month: 9, week: 3, dayOfWeek: 1 }, // 9月第3月曜日
      'スポーツの日': { month: 10, week: 2, dayOfWeek: 1 } // 10月第2月曜日
    };

    // 春分の日・秋分の日の近似計算テーブル (2020-2030年)
    this.equinoxDays = {
      2020: { spring: 20, autumn: 22 },
      2021: { spring: 20, autumn: 23 },
      2022: { spring: 21, autumn: 23 },
      2023: { spring: 21, autumn: 23 },
      2024: { spring: 20, autumn: 22 },
      2025: { spring: 20, autumn: 23 },
      2026: { spring: 20, autumn: 23 },
      2027: { spring: 21, autumn: 23 },
      2028: { spring: 20, autumn: 22 },
      2029: { spring: 20, autumn: 23 },
      2030: { spring: 20, autumn: 23 }
    };
  }

  // 指定した日付が祝日かどうかを判定
  isHoliday(date) {
    // 基本祝日をまずチェック
    const basicHoliday = this.checkBasicHoliday(date);
    if (basicHoliday) {
      return basicHoliday;
    }

    // 振替休日をチェック
    const substitute = this.getSubstituteHoliday(date);
    if (substitute) {
      return substitute;
    }

    return null;
  }

  // 移動祝日の計算
  getMovingHoliday(year, month, day) {
    for (const [name, rule] of Object.entries(this.movingHolidays)) {
      if (rule.month === month) {
        const targetDay = this.getNthWeekday(year, month, rule.week, rule.dayOfWeek);
        if (targetDay === day) {
          return name;
        }
      }
    }
    return null;
  }

  // 指定月の第N週の指定曜日を取得
  getNthWeekday(year, month, week, dayOfWeek) {
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();
    const offset = (dayOfWeek - firstDayOfWeek + 7) % 7;
    const targetDate = 1 + offset + (week - 1) * 7;
    return targetDate;
  }

  // 春分の日・秋分の日の判定
  getEquinoxDay(year, month, day) {
    if (!this.equinoxDays[year]) return null;
    
    if (month === 3 && day === this.equinoxDays[year].spring) {
      return '春分の日';
    }
    if (month === 9 && day === this.equinoxDays[year].autumn) {
      return '秋分の日';
    }
    return null;
  }

  // 振替休日の判定
  getSubstituteHoliday(date) {
    // 祝日が日曜日の場合、翌月曜日が振替休日
    // 連続する祝日の場合は、最初の平日まで繰り下げ
    
    // 今日が月曜日で、前日（日曜日）が祝日かチェック
    if (date.getDay() === 1) {
      const prevDay = new Date(date);
      prevDay.setDate(prevDay.getDate() - 1);
      
      if (prevDay.getDay() === 0) {
        const prevHoliday = this.checkBasicHoliday(prevDay);
        if (prevHoliday) {
          return '振替休日';
        }
      }
    }

    // 連続する祝日の振替処理
    let checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() - 1);
    
    // 前日から遡って連続する祝日をチェック
    while (checkDate.getDay() === 0 || this.checkBasicHoliday(checkDate)) {
      if (checkDate.getDay() === 0 && this.checkBasicHoliday(checkDate)) {
        // 日曜日の祝日が見つかった場合、今日が振替休日
        return '振替休日';
      }
      checkDate.setDate(checkDate.getDate() - 1);
      
      // 無限ループ防止（1週間前まで）
      const oneWeekAgo = new Date(date);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (checkDate < oneWeekAgo) break;
    }

    // 国民の休日（祝日に挟まれた平日）
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const prevHoliday = this.checkBasicHoliday(prevDay);
    const nextHoliday = this.checkBasicHoliday(nextDay);
    
    if (prevHoliday && nextHoliday && date.getDay() !== 0 && date.getDay() !== 6) {
      return '国民の休日';
    }

    return null;
  }

  // 基本祝日チェック（無限ループ防止）
  checkBasicHoliday(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${month}-${day}`;

    // 固定祝日をチェック
    if (this.fixedHolidays[dateStr]) {
      return this.fixedHolidays[dateStr];
    }

    // 移動祝日をチェック
    const movingHoliday = this.getMovingHoliday(year, date.getMonth() + 1, date.getDate());
    if (movingHoliday) {
      return movingHoliday;
    }

    // 春分の日・秋分の日をチェック
    const equinox = this.getEquinoxDay(year, date.getMonth() + 1, date.getDate());
    if (equinox) {
      return equinox;
    }

    return null;
  }

  // 指定年の全祝日を取得
  getYearHolidays(year) {
    const holidays = [];
    
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const holidayName = this.isHoliday(date);
        
        if (holidayName) {
          holidays.push({
            date: date,
            name: holidayName,
            dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          });
        }
      }
    }
    
    return holidays;
  }

  // 営業日判定（土日祝日以外）
  isBusinessDay(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && !this.isHoliday(date);
  }

  // 期間内の営業日数を計算
  getBusinessDaysCount(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (this.isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}

// 祝日計算システムのインスタンス
const holidaySystem = new JapanHolidays();

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  initializeCalendar();
  renderCurrentView();
  updateTodayEvents();
  updateHolidayList();
  updateProjectList();
});

// カレンダー初期化
function initializeCalendar() {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // デフォルトプロジェクトの作成（初回のみ）
  if (projects.length === 0) {
    projects = [
      {
        id: generateId(),
        name: 'デフォルトプロジェクト',
        deadline: null,
        color: '#007bff',
        created: new Date().toISOString()
      }
    ];
    saveProjects();
  }
}

// 表示切り替え
function switchView(view) {
  currentView = view;
  
  // ボタンの状態更新
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${view}"]`).classList.add('active');
  
  // ビューの表示切り替え
  document.querySelectorAll('.calendar-view').forEach(viewEl => {
    viewEl.classList.remove('active');
  });
  document.getElementById(`${view}-view`).classList.add('active');
  
  renderCurrentView();
}

// 現在のビューを描画
function renderCurrentView() {
  updatePeriodText();
  
  switch (currentView) {
    case 'month':
      renderMonthView();
      break;
    case 'week':
      renderWeekView();
      break;
    case 'day':
      renderDayView();
      break;
    case 'year':
      renderYearView();
      break;
  }
}

// 期間テキストの更新
function updatePeriodText() {
  const periodElement = document.getElementById('current-period-text');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  
  switch (currentView) {
    case 'month':
      periodElement.textContent = `${year}年${month + 1}月`;
      break;
    case 'week':
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      periodElement.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
      break;
    case 'day':
      periodElement.textContent = formatDate(currentDate);
      break;
    case 'year':
      periodElement.textContent = `${year}年`;
      break;
  }
}

// 月間ビューの描画
function renderMonthView() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // 6週分のセルを作成
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + week * 7 + day);
      
      const cell = createMonthCell(cellDate, month);
      grid.appendChild(cell);
    }
  }
}

// 月間ビューのセル作成
function createMonthCell(date, currentMonth) {
  const cell = document.createElement('div');
  cell.className = 'calendar-cell';
  
  const isCurrentMonth = date.getMonth() === currentMonth;
  const isToday = isDateToday(date);
  const isSunday = date.getDay() === 0;
  const isSaturday = date.getDay() === 6;
  const holiday = holidaySystem.isHoliday(date);
  
  if (!isCurrentMonth) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');
  if (isSaturday) cell.classList.add('saturday');
  if (isSunday || holiday) cell.classList.add('holiday');
  
  // 日付表示
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  
  if (holiday) {
    dayNumber.title = holiday;
    dayNumber.classList.add('holiday-text');
  }
  
  cell.appendChild(dayNumber);
  
  // 祝日名表示
  if (holiday && isCurrentMonth) {
    const holidayName = document.createElement('div');
    holidayName.className = 'holiday-name';
    holidayName.textContent = holiday;
    cell.appendChild(holidayName);
  }
  
  // この日の予定を表示
  const dayEvents = getEventsForDate(date);
  dayEvents.forEach(event => {
    const eventEl = document.createElement('div');
    eventEl.className = `event event-${event.category}`;
    
    // 複数日予定の表示調整
    if (event.isMultiDay) {
      let displayTitle = event.title;
      if (event.isFirstDay) {
        displayTitle = `📅 ${event.title}`;
      } else if (event.isLastDay) {
        displayTitle = `${event.title} 🏁`;
      } else {
        displayTitle = `▶ ${event.title}`;
      }
      eventEl.textContent = displayTitle;
      eventEl.classList.add('multi-day-event');
    } else {
      eventEl.textContent = event.title;
    }
    
    eventEl.onclick = (e) => {
      e.stopPropagation();
      showEventPopup(event);
    };
    cell.appendChild(eventEl);
  });
  
  // セルクリックで予定追加
  cell.onclick = () => {
    showAddEventModal(date);
  };
  
  return cell;
}

// 週間ビューの描画
function renderWeekView() {
  const weekStart = getWeekStart(currentDate);
  const weekDays = document.getElementById('week-days');
  const weekGrid = document.getElementById('week-grid');
  
  // 週の日付ヘッダー
  weekDays.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    
    const dayHeader = document.createElement('div');
    dayHeader.className = 'week-day-header';
    
    const holiday = holidaySystem.isHoliday(day);
    if (day.getDay() === 0 || day.getDay() === 6 || holiday) {
      dayHeader.classList.add('holiday');
    }
    if (isDateToday(day)) {
      dayHeader.classList.add('today');
    }
    
    dayHeader.innerHTML = `
      <div class="day-name">${['日', '月', '火', '水', '木', '金', '土'][day.getDay()]}</div>
      <div class="day-date">${day.getDate()}</div>
      ${holiday ? `<div class="holiday-name">${holiday}</div>` : ''}
    `;
    
    weekDays.appendChild(dayHeader);
  }
  
  // 時間グリッドの作成
  renderTimeSlots();
  renderWeekEvents(weekStart);
}

// 時間スロットの描画
function renderTimeSlots() {
  const timeSlots = document.getElementById('time-slots');
  timeSlots.innerHTML = '';
  
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
    timeSlots.appendChild(timeSlot);
  }
}

// 週間の予定描画
function renderWeekEvents(weekStart) {
  const weekGrid = document.getElementById('week-grid');
  weekGrid.innerHTML = '';
  
  // 7日分のイベント列を作成
  for (let day = 0; day < 7; day++) {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';
    
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + day);
    
    const dayEvents = getEventsForDate(date);
    dayEvents.forEach(event => {
      const eventEl = createWeekEventElement(event);
      dayColumn.appendChild(eventEl);
    });
    
    weekGrid.appendChild(dayColumn);
  }
}

// 週間ビューのイベント要素作成
function createWeekEventElement(event) {
  const eventEl = document.createElement('div');
  eventEl.className = `week-event event-${event.category}`;
  
  const startTime = event.startTime || '00:00';
  const endTime = event.endTime || '23:59';
  
  // 時間に基づいて位置を計算
  const startHour = parseInt(startTime.split(':')[0]);
  const startMinute = parseInt(startTime.split(':')[1]);
  const endHour = parseInt(endTime.split(':')[0]);
  const endMinute = parseInt(endTime.split(':')[1]);
  
  const top = (startHour + startMinute / 60) * 60; // 1時間 = 60px
  const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60;
  
  eventEl.style.top = `${top}px`;
  eventEl.style.height = `${Math.max(height, 30)}px`;
  
  eventEl.innerHTML = `
    <div class="event-time">${startTime} - ${endTime}</div>
    <div class="event-title">${event.title}</div>
  `;
  
  eventEl.onclick = () => showEventPopup(event);
  
  return eventEl;
}

// 日別ビューの描画
function renderDayView() {
  const dayTitle = document.getElementById('day-title');
  const holidayInfo = document.getElementById('day-holiday-info');
  const businessInfo = document.getElementById('day-business-info');
  const timeSlots = document.getElementById('day-time-slots');
  
  // タイトル更新
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const holiday = holidaySystem.isHoliday(currentDate);
  const isBusinessDay = holidaySystem.isBusinessDay(currentDate);
  
  dayTitle.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日（${weekdays[currentDate.getDay()]}）`;
  
  // 祝日情報
  if (holiday) {
    holidayInfo.textContent = `🎌 ${holiday}`;
    holidayInfo.style.display = 'inline';
  } else {
    holidayInfo.style.display = 'none';
  }
  
  // 営業日情報
  businessInfo.textContent = isBusinessDay ? '💼 営業日' : '🏖️ 非営業日';
  businessInfo.className = isBusinessDay ? 'business-day' : 'non-business-day';
  
  // 時間スロットと予定
  timeSlots.innerHTML = '';
  const dayEvents = getEventsForDate(currentDate);
  
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement('div');
    timeSlot.className = 'day-time-slot';
    
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
    
    const eventContainer = document.createElement('div');
    eventContainer.className = 'event-container';
    
    // この時間の予定を表示
    const hourEvents = dayEvents.filter(event => {
      if (!event.startTime) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
    
    hourEvents.forEach(event => {
      const eventEl = document.createElement('div');
      eventEl.className = `day-event event-${event.category}`;
      eventEl.innerHTML = `
        <div class="event-time">${event.startTime} - ${event.endTime || ''}</div>
        <div class="event-title">${event.title}</div>
      `;
      eventEl.onclick = () => showEventPopup(event);
      eventContainer.appendChild(eventEl);
    });
    
    timeSlot.appendChild(timeLabel);
    timeSlot.appendChild(eventContainer);
    timeSlots.appendChild(timeSlot);
    
    // 時間スロットクリックで予定追加
    eventContainer.onclick = () => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      showAddEventModal(currentDate, timeStr);
    };
  }
}

// 年間ビューの描画
function renderYearView() {
  const yearGrid = document.getElementById('year-grid');
  yearGrid.innerHTML = '';
  
  const year = currentDate.getFullYear();
  
  for (let month = 0; month < 12; month++) {
    const monthContainer = document.createElement('div');
    monthContainer.className = 'year-month';
    
    const monthHeader = document.createElement('div');
    monthHeader.className = 'year-month-header';
    monthHeader.textContent = `${month + 1}月`;
    monthContainer.appendChild(monthHeader);
    
    const miniCalendar = createMiniCalendar(year, month);
    monthContainer.appendChild(miniCalendar);
    
    // 月クリックでその月に移動
    monthContainer.onclick = () => {
      currentDate = new Date(year, month, 1);
      switchView('month');
    };
    
    yearGrid.appendChild(monthContainer);
  }
}

// ミニカレンダー作成
function createMiniCalendar(year, month) {
  const miniCal = document.createElement('div');
  miniCal.className = 'mini-calendar';
  
  // 曜日ヘッダー
  const weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'mini-weekdays';
  ['日', '月', '火', '水', '木', '金', '土'].forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.textContent = day;
    weekdaysRow.appendChild(dayEl);
  });
  miniCal.appendChild(weekdaysRow);
  
  // 日付グリッド
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  for (let week = 0; week < 6; week++) {
    const weekRow = document.createElement('div');
    weekRow.className = 'mini-week';
    
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + week * 7 + day);
      
      const dayEl = document.createElement('div');
      dayEl.className = 'mini-day';
      dayEl.textContent = cellDate.getDate();
      
      if (cellDate.getMonth() !== month) {
        dayEl.classList.add('other-month');
      }
      
      const holiday = holidaySystem.isHoliday(cellDate);
      const isSaturday = cellDate.getDay() === 6;
      const isSunday = cellDate.getDay() === 0;
      
      if (isSaturday && !holiday) {
        dayEl.classList.add('saturday');
      }
      if (isSunday || holiday) {
        dayEl.classList.add('holiday');
      }
      
      if (isDateToday(cellDate)) {
        dayEl.classList.add('today');
      }
      
      // この日に予定があるかチェック
      const dayEvents = getEventsForDate(cellDate);
      if (dayEvents.length > 0) {
        dayEl.classList.add('has-events');
      }
      
      weekRow.appendChild(dayEl);
    }
    
    miniCal.appendChild(weekRow);
    
    // 6週目で月が変わっていたら終了
    if (week === 5 && startDate.getDate() + 7 > lastDay.getDate()) {
      break;
    }
  }
  
  return miniCal;
}

// ナビゲーション
function previousPeriod() {
  switch (currentView) {
    case 'month':
      currentDate.setMonth(currentDate.getMonth() - 1);
      break;
    case 'week':
      currentDate.setDate(currentDate.getDate() - 7);
      break;
    case 'day':
      currentDate.setDate(currentDate.getDate() - 1);
      break;
    case 'year':
      currentDate.setFullYear(currentDate.getFullYear() - 1);
      break;
  }
  renderCurrentView();
}

function nextPeriod() {
  switch (currentView) {
    case 'month':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'week':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'day':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'year':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
  }
  renderCurrentView();
}

function goToToday() {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  renderCurrentView();
}

// ユーティリティ関数
function isDateToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

function getWeekStart(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// イベント管理機能
function getEventsForDate(date) {
  const dateStr = formatDateForStorage(date);
  return events.filter(event => event.date === dateStr);
}

function formatDateForStorage(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 予定追加モーダル
function showAddEventModal(date = null, time = null) {
  editingEventId = null;
  const modal = document.getElementById('event-modal');
  const form = document.getElementById('event-form');
  
  document.getElementById('event-modal-title').textContent = '予定を追加';
  form.reset();
  
  // 複数日チェックボックスをリセット
  document.getElementById('event-multi-day').checked = false;
  toggleMultiDay();
  
  if (date) {
    document.getElementById('event-date').value = formatDateForStorage(date);
  }
  
  if (time) {
    document.getElementById('event-start-time').value = time;
  }
  
  // プロジェクト選択肢を更新
  updateProjectOptions();
  
  document.getElementById('delete-event-btn').style.display = 'none';
  modal.style.display = 'flex';
}

function closeEventModal() {
  document.getElementById('event-modal').style.display = 'none';
  editingEventId = null;
}

function toggleAllDay() {
  const allDay = document.getElementById('event-all-day').checked;
  const startTime = document.getElementById('event-start-time');
  const endTime = document.getElementById('event-end-time');
  
  startTime.disabled = allDay;
  endTime.disabled = allDay;
  
  if (allDay) {
    startTime.value = '';
    endTime.value = '';
  }
}

// 複数日予定の切り替え
function toggleMultiDay() {
  const isMultiDay = document.getElementById('event-multi-day').checked;
  const singleSection = document.getElementById('single-date-section');
  const multiSection = document.getElementById('multi-date-section');
  const singleDateInput = document.getElementById('event-date');
  const startDateInput = document.getElementById('event-start-date');
  const endDateInput = document.getElementById('event-end-date');
  
  if (isMultiDay) {
    singleSection.style.display = 'none';
    multiSection.style.display = 'flex';
    singleDateInput.required = false;
    startDateInput.required = true;
    endDateInput.required = true;
    
    // 単日の日付が設定されている場合、開始日にコピー
    if (singleDateInput.value) {
      startDateInput.value = singleDateInput.value;
    }
  } else {
    singleSection.style.display = 'block';
    multiSection.style.display = 'none';
    singleDateInput.required = true;
    startDateInput.required = false;
    endDateInput.required = false;
    
    // 開始日が設定されている場合、単日にコピー
    if (startDateInput.value) {
      singleDateInput.value = startDateInput.value;
    }
  }
}

function saveEvent() {
  const form = document.getElementById('event-form');
  const isMultiDay = document.getElementById('event-multi-day').checked;
  
  // フォーム検証
  if (isMultiDay) {
    const startDate = document.getElementById('event-start-date').value;
    const endDate = document.getElementById('event-end-date').value;
    
    if (!startDate || !endDate) {
      alert('開始日と終了日を入力してください');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      alert('開始日は終了日より前の日付を選択してください');
      return;
    }
  } else {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
  }
  
  if (isMultiDay) {
    // 複数日予定の保存
    saveMultiDayEvent();
  } else {
    // 単日予定の保存
    saveSingleDayEvent();
  }
}

// 単日予定の保存
function saveSingleDayEvent() {
  const eventData = {
    id: editingEventId || generateId(),
    title: document.getElementById('event-title').value,
    date: document.getElementById('event-date').value,
    category: document.getElementById('event-category').value,
    startTime: document.getElementById('event-all-day').checked ? null : document.getElementById('event-start-time').value,
    endTime: document.getElementById('event-all-day').checked ? null : document.getElementById('event-end-time').value,
    project: document.getElementById('event-project').value,
    description: document.getElementById('event-description').value,
    allDay: document.getElementById('event-all-day').checked,
    isMultiDay: false,
    created: editingEventId ? events.find(e => e.id === editingEventId).created : new Date().toISOString(),
    updated: new Date().toISOString()
  };
  
  if (editingEventId) {
    const index = events.findIndex(e => e.id === editingEventId);
    events[index] = eventData;
  } else {
    events.push(eventData);
  }
  
  saveEvents();
  closeEventModal();
  renderCurrentView();
  updateTodayEvents();
}

// 複数日予定の保存
function saveMultiDayEvent() {
  const baseEventData = {
    title: document.getElementById('event-title').value,
    category: document.getElementById('event-category').value,
    startTime: document.getElementById('event-all-day').checked ? null : document.getElementById('event-start-time').value,
    endTime: document.getElementById('event-all-day').checked ? null : document.getElementById('event-end-time').value,
    project: document.getElementById('event-project').value,
    description: document.getElementById('event-description').value,
    allDay: document.getElementById('event-all-day').checked,
    isMultiDay: true
  };
  
  const startDate = new Date(document.getElementById('event-start-date').value);
  const endDate = new Date(document.getElementById('event-end-date').value);
  const multiDayId = editingEventId || generateId();
  
  // 既存の複数日予定を編集する場合、関連する全ての予定を削除
  if (editingEventId) {
    events = events.filter(e => e.multiDayId !== editingEventId && e.id !== editingEventId);
  }
  
  // 期間中の各日に予定を作成
  const currentDate = new Date(startDate);
  const createdTime = new Date().toISOString();
  
  while (currentDate <= endDate) {
    const dayEventData = {
      ...baseEventData,
      id: generateId(),
      date: formatDateForStorage(currentDate),
      multiDayId: multiDayId,
      multiDayStart: formatDateForStorage(startDate),
      multiDayEnd: formatDateForStorage(endDate),
      isFirstDay: currentDate.getTime() === startDate.getTime(),
      isLastDay: currentDate.getTime() === endDate.getTime(),
      created: createdTime,
      updated: createdTime
    };
    
    events.push(dayEventData);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  saveEvents();
  closeEventModal();
  renderCurrentView();
  updateTodayEvents();
}

function deleteEvent() {
  if (!editingEventId) return;
  
  const event = events.find(e => e.id === editingEventId || e.multiDayId === editingEventId);
  if (!event) return;
  
  const confirmMessage = event.isMultiDay ? 
    'この複数日予定をすべて削除しますか？' : 
    'この予定を削除しますか？';
  
  if (confirm(confirmMessage)) {
    if (event.isMultiDay) {
      // 複数日予定の全ての日を削除
      events = events.filter(e => e.multiDayId !== editingEventId && e.id !== editingEventId);
    } else {
      // 単日予定を削除
      events = events.filter(e => e.id !== editingEventId);
    }
    
    saveEvents();
    closeEventModal();
    renderCurrentView();
    updateTodayEvents();
  }
}

function saveEvents() {
  localStorage.setItem('calendar_events', JSON.stringify(events));
}

// 今日の予定更新
function updateTodayEvents() {
  const today = new Date();
  const todayEvents = getEventsForDate(today);
  const container = document.getElementById('today-events-list');
  
  container.innerHTML = '';
  
  if (todayEvents.length === 0) {
    container.innerHTML = '<div class="no-events">今日の予定はありません</div>';
    return;
  }
  
  todayEvents.sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  }).forEach(event => {
    const eventEl = document.createElement('div');
    eventEl.className = `today-event event-${event.category}`;
    
    const timeStr = event.allDay ? '終日' : `${event.startTime || ''} - ${event.endTime || ''}`;
    
    eventEl.innerHTML = `
      <div class="event-time">${timeStr}</div>
      <div class="event-title">${event.title}</div>
    `;
    
    eventEl.onclick = () => showEventPopup(event);
    container.appendChild(eventEl);
  });
}

// 祝日リスト更新
function updateHolidayList() {
  const container = document.getElementById('holiday-list');
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // 今日から30日先までの祝日を取得
  const holidays = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const holiday = holidaySystem.isHoliday(date);
    
    if (holiday) {
      holidays.push({
        date: date,
        name: holiday,
        daysFromToday: i
      });
    }
  }
  
  container.innerHTML = '';
  
  if (holidays.length === 0) {
    container.innerHTML = '<div class="no-holidays">近日中に祝日はありません</div>';
    return;
  }
  
  holidays.forEach(holiday => {
    const holidayEl = document.createElement('div');
    holidayEl.className = 'holiday-item';
    
    const dayInfo = holiday.daysFromToday === 0 ? '今日' :
                   holiday.daysFromToday === 1 ? '明日' :
                   `${holiday.daysFromToday}日後`;
    
    holidayEl.innerHTML = `
      <div class="holiday-date">${formatDate(holiday.date)}</div>
      <div class="holiday-name">${holiday.name}</div>
      <div class="holiday-days">${dayInfo}</div>
    `;
    
    container.appendChild(holidayEl);
  });
}

// プロジェクト管理
function showProjectModal() {
  const modal = document.getElementById('project-modal');
  modal.style.display = 'flex';
  updateProjectsModal();
}

function closeProjectModal() {
  document.getElementById('project-modal').style.display = 'none';
}

function addProject() {
  const name = document.getElementById('new-project-name').value;
  const deadline = document.getElementById('new-project-deadline').value;
  
  if (!name.trim()) {
    alert('プロジェクト名を入力してください');
    return;
  }
  
  const project = {
    id: generateId(),
    name: name.trim(),
    deadline: deadline || null,
    color: getRandomColor(),
    created: new Date().toISOString()
  };
  
  projects.push(project);
  saveProjects();
  updateProjectsModal();
  updateProjectList();
  updateProjectOptions();
  
  document.getElementById('new-project-name').value = '';
  document.getElementById('new-project-deadline').value = '';
}

function deleteProject(projectId) {
  if (confirm('このプロジェクトを削除しますか？関連する予定も削除されます。')) {
    projects = projects.filter(p => p.id !== projectId);
    events = events.filter(e => e.project !== projectId);
    saveProjects();
    saveEvents();
    updateProjectsModal();
    updateProjectList();
    updateProjectOptions();
    renderCurrentView();
  }
}

function saveProjects() {
  localStorage.setItem('calendar_projects', JSON.stringify(projects));
}

function updateProjectsModal() {
  const container = document.getElementById('projects-list');
  container.innerHTML = '';
  
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-item';
    
    const deadlineStr = project.deadline ? 
      `期限: ${new Date(project.deadline).toLocaleDateString('ja-JP')}` : 
      '期限なし';
    
    projectEl.innerHTML = `
      <div class="project-info">
        <div class="project-name" style="color: ${project.color}">${project.name}</div>
        <div class="project-deadline">${deadlineStr}</div>
      </div>
      <button onclick="deleteProject('${project.id}')" class="delete-btn">削除</button>
    `;
    
    container.appendChild(projectEl);
  });
}

function updateProjectList() {
  const container = document.getElementById('project-list-container');
  container.innerHTML = '';
  
  projects.forEach(project => {
    const projectEl = document.createElement('div');
    projectEl.className = 'project-summary';
    
    // このプロジェクトの予定数を計算
    const projectEvents = events.filter(e => e.project === project.id);
    
    projectEl.innerHTML = `
      <div class="project-color" style="background-color: ${project.color}"></div>
      <div class="project-info">
        <div class="project-name">${project.name}</div>
        <div class="project-stats">${projectEvents.length}件の予定</div>
      </div>
    `;
    
    container.appendChild(projectEl);
  });
}

function updateProjectOptions() {
  const select = document.getElementById('event-project');
  const currentValue = select.value;
  
  select.innerHTML = '<option value="">選択してください</option>';
  
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    select.appendChild(option);
  });
  
  select.value = currentValue;
}

function getRandomColor() {
  const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2', '#e83e8c', '#fd7e14'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 営業日計算
function calculateBusinessDays() {
  const startInput = document.getElementById('calc-start-date');
  const endInput = document.getElementById('calc-end-date');
  const resultDiv = document.getElementById('calc-result');
  
  if (!startInput.value || !endInput.value) {
    resultDiv.innerHTML = '<div class="calc-error">開始日と終了日を入力してください</div>';
    return;
  }
  
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);
  
  if (startDate > endDate) {
    resultDiv.innerHTML = '<div class="calc-error">開始日は終了日より前の日付を選択してください</div>';
    return;
  }
  
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const businessDays = holidaySystem.getBusinessDaysCount(startDate, endDate);
  const holidays = totalDays - businessDays;
  
  // 日付を日本語形式で表示
  const startDateStr = startDate.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
  const endDateStr = endDate.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
  
  resultDiv.innerHTML = `
    <div class="calc-success">
      <div class="calc-period">
        <strong>📅 計算期間</strong><br>
        <span class="period-text">${startDateStr} 〜 ${endDateStr}</span>
      </div>
      <div class="calc-item">
        <span class="calc-label">📆 全期間:</span>
        <span class="calc-value">${totalDays}日間</span>
      </div>
      <div class="calc-item">
        <span class="calc-label">💼 営業日:</span>
        <span class="calc-value">${businessDays}日</span>
      </div>
      <div class="calc-item">
        <span class="calc-label">🏡 休日:</span>
        <span class="calc-value">${holidays}日</span>
      </div>
    </div>
  `;
}

// イベントポップアップ
function showEventPopup(event) {
  const popup = document.getElementById('event-popup');
  const title = document.getElementById('popup-title');
  const details = document.getElementById('popup-details');
  
  title.textContent = event.title;
  
  const project = projects.find(p => p.id === event.project);
  const projectName = project ? project.name : 'なし';
  
  const timeStr = event.allDay ? '終日' : 
    `${event.startTime || ''} - ${event.endTime || ''}`;
  
  // 複数日予定の表示対応
  let dateStr = event.date;
  if (event.isMultiDay && event.multiDayStart && event.multiDayEnd) {
    const startDate = new Date(event.multiDayStart).toLocaleDateString('ja-JP');
    const endDate = new Date(event.multiDayEnd).toLocaleDateString('ja-JP');
    dateStr = `${startDate} - ${endDate} (複数日予定)`;
  } else {
    dateStr = new Date(event.date).toLocaleDateString('ja-JP');
  }
  
  details.innerHTML = `
    <div class="popup-item">
      <span class="popup-label">日時:</span>
      <span class="popup-value">${dateStr} ${timeStr}</span>
    </div>
    <div class="popup-item">
      <span class="popup-label">カテゴリ:</span>
      <span class="popup-value">${getCategoryName(event.category)}</span>
    </div>
    <div class="popup-item">
      <span class="popup-label">プロジェクト:</span>
      <span class="popup-value">${projectName}</span>
    </div>
    ${event.description ? `
      <div class="popup-item">
        <span class="popup-label">詳細:</span>
        <span class="popup-value">${event.description}</span>
      </div>
    ` : ''}
  `;
  
  popup.style.display = 'block';
  popup.dataset.eventId = event.id;
}

function closeEventPopup() {
  document.getElementById('event-popup').style.display = 'none';
}

function editEventFromPopup() {
  const popup = document.getElementById('event-popup');
  const eventId = popup.dataset.eventId;
  const event = events.find(e => e.id === eventId);
  
  if (event) {
    // 複数日予定の場合は代表IDを使用
    editingEventId = event.multiDayId || event.id;
    
    document.getElementById('event-modal-title').textContent = '予定を編集';
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-start-time').value = event.startTime || '';
    document.getElementById('event-end-time').value = event.endTime || '';
    document.getElementById('event-project').value = event.project || '';
    document.getElementById('event-description').value = event.description || '';
    document.getElementById('event-all-day').checked = event.allDay || false;
    
    // 複数日予定の設定
    if (event.isMultiDay && event.multiDayStart && event.multiDayEnd) {
      document.getElementById('event-multi-day').checked = true;
      document.getElementById('event-start-date').value = event.multiDayStart;
      document.getElementById('event-end-date').value = event.multiDayEnd;
    } else {
      document.getElementById('event-multi-day').checked = false;
      document.getElementById('event-date').value = event.date;
    }
    
    toggleMultiDay();
    toggleAllDay();
    updateProjectOptions();
    
    document.getElementById('delete-event-btn').style.display = 'inline-block';
    document.getElementById('event-modal').style.display = 'flex';
  }
  
  closeEventPopup();
}

function deleteEventFromPopup() {
  const popup = document.getElementById('event-popup');
  const eventId = popup.dataset.eventId;
  const event = events.find(e => e.id === eventId);
  
  if (!event) return;
  
  const confirmMessage = event.isMultiDay ? 
    'この複数日予定をすべて削除しますか？' : 
    'この予定を削除しますか？';
  
  if (confirm(confirmMessage)) {
    if (event.isMultiDay && event.multiDayId) {
      // 複数日予定の全ての日を削除
      events = events.filter(e => e.multiDayId !== event.multiDayId && e.id !== event.multiDayId);
    } else {
      // 単日予定を削除
      events = events.filter(e => e.id !== eventId);
    }
    
    saveEvents();
    closeEventPopup();
    renderCurrentView();
    updateTodayEvents();
  }
}

function getCategoryName(category) {
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