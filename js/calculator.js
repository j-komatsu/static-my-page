// ビジネス計算ツール - JavaScript

// 現在のアクティブタブ
let currentTab = 'finance';

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  switchTab('finance');
});

// タブ切り替え機能
function switchTab(tabName) {
  currentTab = tabName;
  
  // すべてのタブボタンの状態をリセット
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // すべてのタブコンテンツを非表示
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // 選択されたタブを有効化
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// =============================================================================
// 財務・投資計算
// =============================================================================

// 複利計算
function calculateCompoundInterest() {
  const principal = parseFloat(document.getElementById('principal').value);
  const rate = parseFloat(document.getElementById('annual-rate').value) / 100;
  const years = parseInt(document.getElementById('years').value);
  
  if (!principal || !rate || !years) {
    showResult('compound-result', '全ての項目を入力してください', 'error');
    return;
  }
  
  const amount = principal * Math.pow(1 + rate, years);
  const interest = amount - principal;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">元金:</span>
        <span class="result-value">${principal.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">最終金額:</span>
        <span class="result-value result-highlight">${Math.round(amount).toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">利益:</span>
        <span class="result-value">${Math.round(interest).toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">利益率:</span>
        <span class="result-value">${((interest / principal) * 100).toFixed(2)}%</span>
      </div>
    </div>
  `;
  
  showResult('compound-result', html, 'success');
}

// ローン返済計算
function calculateLoan() {
  const amount = parseFloat(document.getElementById('loan-amount').value);
  const rate = parseFloat(document.getElementById('loan-rate').value) / 100 / 12; // 月利
  const years = parseInt(document.getElementById('loan-years').value);
  const months = years * 12;
  
  if (!amount || !rate || !years) {
    showResult('loan-result', '全ての項目を入力してください', 'error');
    return;
  }
  
  const monthlyPayment = amount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - amount;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">借入金額:</span>
        <span class="result-value">${amount.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">月々の返済額:</span>
        <span class="result-value result-highlight">${Math.round(monthlyPayment).toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">総返済額:</span>
        <span class="result-value">${Math.round(totalPayment).toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">総利息:</span>
        <span class="result-value">${Math.round(totalInterest).toLocaleString()}円</span>
      </div>
    </div>
  `;
  
  showResult('loan-result', html, 'success');
}

// ROI計算
function calculateROI() {
  const investment = parseFloat(document.getElementById('investment').value);
  const profit = parseFloat(document.getElementById('profit').value);
  
  if (!investment || profit === undefined) {
    showResult('roi-result', '投資額と利益を入力してください', 'error');
    return;
  }
  
  const roi = (profit / investment) * 100;
  const isProfit = profit >= 0;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">投資額:</span>
        <span class="result-value">${investment.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">利益:</span>
        <span class="result-value" style="color: ${isProfit ? '#28a745' : '#dc3545'}">${profit.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">ROI:</span>
        <span class="result-value result-highlight" style="color: ${isProfit ? '#28a745' : '#dc3545'}">${roi.toFixed(2)}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">判定:</span>
        <span class="result-value">${isProfit ? '利益' : '損失'}</span>
      </div>
    </div>
  `;
  
  showResult('roi-result', html, 'success');
}

// =============================================================================
// プロジェクト管理計算
// =============================================================================

// 工数計算
function calculateManDays() {
  const workHours = parseFloat(document.getElementById('work-hours').value);
  const dailyHours = parseFloat(document.getElementById('daily-hours').value);
  const monthlyDays = parseFloat(document.getElementById('monthly-days').value);
  
  if (!workHours || !dailyHours || !monthlyDays) {
    showResult('mandays-result', '全ての項目を入力してください', 'error');
    return;
  }
  
  const manDays = workHours / dailyHours;
  const manMonths = manDays / monthlyDays;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">作業時間:</span>
        <span class="result-value">${workHours}時間</span>
      </div>
      <div class="result-item">
        <span class="result-label">人日:</span>
        <span class="result-value result-highlight">${manDays.toFixed(1)}人日</span>
      </div>
      <div class="result-item">
        <span class="result-label">人月:</span>
        <span class="result-value result-highlight">${manMonths.toFixed(2)}人月</span>
      </div>
    </div>
  `;
  
  showResult('mandays-result', html, 'success');
}

// プロジェクトコスト計算
function calculateProjectCost() {
  const teamSize = parseInt(document.getElementById('team-size').value);
  const months = parseFloat(document.getElementById('project-months').value);
  const monthlyRate = parseFloat(document.getElementById('monthly-rate').value);
  
  if (!teamSize || !months || !monthlyRate) {
    showResult('project-cost-result', '全ての項目を入力してください', 'error');
    return;
  }
  
  const totalCost = teamSize * months * monthlyRate;
  const personCost = months * monthlyRate;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">チーム構成:</span>
        <span class="result-value">${teamSize}人 × ${months}ヶ月</span>
      </div>
      <div class="result-item">
        <span class="result-label">1人あたりコスト:</span>
        <span class="result-value">${personCost.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">総プロジェクトコスト:</span>
        <span class="result-value result-highlight">${totalCost.toLocaleString()}円</span>
      </div>
      <div class="result-item">
        <span class="result-label">月あたり平均コスト:</span>
        <span class="result-value">${(totalCost / months).toLocaleString()}円/月</span>
      </div>
    </div>
  `;
  
  showResult('project-cost-result', html, 'success');
}

// 稼働率計算
function calculateUtilization() {
  const actualHours = parseFloat(document.getElementById('actual-hours').value);
  const totalHours = parseFloat(document.getElementById('total-hours').value);
  
  if (!actualHours || !totalHours) {
    showResult('utilization-result', '実稼働時間と総稼働時間を入力してください', 'error');
    return;
  }
  
  const utilization = (actualHours / totalHours) * 100;
  const idleHours = totalHours - actualHours;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">稼働率:</span>
        <span class="result-value result-highlight">${utilization.toFixed(1)}%</span>
      </div>
      <div class="percentage-bar">
        <div class="percentage-fill" style="width: ${Math.min(utilization, 100)}%">
          ${utilization.toFixed(1)}%
        </div>
      </div>
      <div class="result-item">
        <span class="result-label">実稼働時間:</span>
        <span class="result-value">${actualHours}時間</span>
      </div>
      <div class="result-item">
        <span class="result-label">空き時間:</span>
        <span class="result-value">${idleHours}時間</span>
      </div>
    </div>
  `;
  
  showResult('utilization-result', html, 'success');
}

// =============================================================================
// データ容量・パフォーマンス計算
// =============================================================================

// データ容量換算
function convertDataSize() {
  const size = parseFloat(document.getElementById('data-size').value);
  const unit = document.getElementById('data-unit').value;
  
  if (!size) {
    showResult('data-size-result', 'データ量を入力してください', 'error');
    return;
  }
  
  // バイトに変換
  const units = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  const bytes = size * units[unit];
  
  const conversions = {
    'Byte': bytes,
    'KB': bytes / units['KB'],
    'MB': bytes / units['MB'],
    'GB': bytes / units['GB'],
    'TB': bytes / units['TB']
  };
  
  let html = '<div class="result-success"><div class="conversion-grid">';
  
  Object.entries(conversions).forEach(([unitName, value]) => {
    html += `
      <div class="conversion-item">
        <div class="conversion-unit">${unitName}</div>
        <div class="conversion-value">${formatNumber(value)}</div>
      </div>
    `;
  });
  
  html += '</div></div>';
  
  showResult('data-size-result', html, 'success');
}

// 転送時間計算
function calculateTransferTime() {
  const fileSize = parseFloat(document.getElementById('file-size').value); // MB
  const bandwidth = parseFloat(document.getElementById('bandwidth').value); // Mbps
  
  if (!fileSize || !bandwidth) {
    showResult('transfer-result', 'ファイルサイズと回線速度を入力してください', 'error');
    return;
  }
  
  const fileSizeBits = fileSize * 8 * 1024 * 1024; // ビットに変換
  const bandwidthBps = bandwidth * 1000 * 1000; // bpsに変換
  const transferTimeSeconds = fileSizeBits / bandwidthBps;
  
  const hours = Math.floor(transferTimeSeconds / 3600);
  const minutes = Math.floor((transferTimeSeconds % 3600) / 60);
  const seconds = Math.floor(transferTimeSeconds % 60);
  
  let timeDisplay = '';
  if (hours > 0) timeDisplay += `${hours}時間 `;
  if (minutes > 0) timeDisplay += `${minutes}分 `;
  timeDisplay += `${seconds}秒`;
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">ファイルサイズ:</span>
        <span class="result-value">${fileSize}MB</span>
      </div>
      <div class="result-item">
        <span class="result-label">回線速度:</span>
        <span class="result-value">${bandwidth}Mbps</span>
      </div>
      <div class="result-item">
        <span class="result-label">転送時間:</span>
        <span class="result-value result-highlight">${timeDisplay}</span>
      </div>
      <div class="result-item">
        <span class="result-label">理論値（秒）:</span>
        <span class="result-value">${transferTimeSeconds.toFixed(2)}秒</span>
      </div>
    </div>
  `;
  
  showResult('transfer-result', html, 'success');
}

// リソース使用率計算
function calculateResourceUsage() {
  const used = parseFloat(document.getElementById('used-resource').value);
  const total = parseFloat(document.getElementById('total-resource').value);
  
  if (!used || !total) {
    showResult('resource-result', '使用量と総容量を入力してください', 'error');
    return;
  }
  
  const usage = (used / total) * 100;
  const available = total - used;
  
  let status = '';
  let statusColor = '';
  if (usage < 50) {
    status = '正常';
    statusColor = '#28a745';
  } else if (usage < 80) {
    status = '注意';
    statusColor = '#ffc107';
  } else {
    status = '警告';
    statusColor = '#dc3545';
  }
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">使用率:</span>
        <span class="result-value result-highlight" style="color: ${statusColor}">${usage.toFixed(1)}%</span>
      </div>
      <div class="percentage-bar">
        <div class="percentage-fill" style="width: ${Math.min(usage, 100)}%; background-color: ${statusColor}">
          ${usage.toFixed(1)}%
        </div>
      </div>
      <div class="result-item">
        <span class="result-label">ステータス:</span>
        <span class="result-value" style="color: ${statusColor}">${status}</span>
      </div>
      <div class="result-item">
        <span class="result-label">使用量:</span>
        <span class="result-value">${used}GB</span>
      </div>
      <div class="result-item">
        <span class="result-label">空き容量:</span>
        <span class="result-value">${available.toFixed(1)}GB</span>
      </div>
    </div>
  `;
  
  showResult('resource-result', html, 'success');
}

// =============================================================================
// ネットワーク・インフラ計算
// =============================================================================

// サブネット計算
function calculateSubnet() {
  const ipAddress = document.getElementById('ip-address').value;
  const subnetMask = document.getElementById('subnet-mask').value;
  
  if (!ipAddress || !subnetMask) {
    showResult('subnet-result', 'IPアドレスとサブネットマスクを入力してください', 'error');
    return;
  }
  
  try {
    const ip = ipAddress.split('.').map(Number);
    const mask = subnetMask.split('.').map(Number);
    
    // ネットワークアドレス計算
    const network = ip.map((octet, index) => octet & mask[index]);
    
    // ブロードキャストアドレス計算
    const broadcast = network.map((octet, index) => octet | (255 - mask[index]));
    
    // 使用可能IPアドレス数計算
    const hostBits = mask.reduce((bits, octet) => {
      return bits + (8 - octet.toString(2).split('1').length + 1);
    }, 0);
    const availableHosts = Math.pow(2, hostBits) - 2; // ネットワークとブロードキャストを除く
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">ネットワークアドレス:</span>
          <span class="result-value">${network.join('.')}</span>
        </div>
        <div class="result-item">
          <span class="result-label">ブロードキャストアドレス:</span>
          <span class="result-value">${broadcast.join('.')}</span>
        </div>
        <div class="result-item">
          <span class="result-label">使用可能ホスト数:</span>
          <span class="result-value result-highlight">${availableHosts}台</span>
        </div>
        <div class="result-item">
          <span class="result-label">最初の使用可能IP:</span>
          <span class="result-value">${network[0]}.${network[1]}.${network[2]}.${network[3] + 1}</span>
        </div>
        <div class="result-item">
          <span class="result-label">最後の使用可能IP:</span>
          <span class="result-value">${broadcast[0]}.${broadcast[1]}.${broadcast[2]}.${broadcast[3] - 1}</span>
        </div>
      </div>
    `;
    
    showResult('subnet-result', html, 'success');
  } catch (error) {
    showResult('subnet-result', '正しいIPアドレスとサブネットマスクを入力してください', 'error');
  }
}

// 可用性計算
function calculateAvailability() {
  const uptime = parseFloat(document.getElementById('uptime').value);
  const downtime = parseFloat(document.getElementById('downtime').value);
  
  if (!uptime || downtime === undefined) {
    showResult('availability-result', '稼働時間と停止時間を入力してください', 'error');
    return;
  }
  
  const totalTime = uptime + downtime;
  const availability = (uptime / totalTime) * 100;
  
  let slaLevel = '';
  if (availability >= 99.99) slaLevel = '99.99% (クラス1)';
  else if (availability >= 99.9) slaLevel = '99.9% (クラス2)';
  else if (availability >= 99.5) slaLevel = '99.5% (クラス3)';
  else if (availability >= 99.0) slaLevel = '99.0% (クラス4)';
  else slaLevel = '99.0%未満';
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">可用性:</span>
        <span class="result-value result-highlight">${availability.toFixed(4)}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">SLAレベル:</span>
        <span class="result-value">${slaLevel}</span>
      </div>
      <div class="result-item">
        <span class="result-label">年間稼働時間:</span>
        <span class="result-value">${uptime}時間</span>
      </div>
      <div class="result-item">
        <span class="result-label">年間停止時間:</span>
        <span class="result-value">${downtime}時間</span>
      </div>
      <div class="result-item">
        <span class="result-label">月間許容停止時間:</span>
        <span class="result-value">${(downtime / 12).toFixed(2)}時間</span>
      </div>
    </div>
  `;
  
  showResult('availability-result', html, 'success');
}

// =============================================================================
// 開発効率計算
// =============================================================================

// バグ密度計算
function calculateBugDensity() {
  const bugCount = parseInt(document.getElementById('bug-count').value);
  const linesOfCode = parseInt(document.getElementById('lines-of-code').value);
  
  if (!bugCount || !linesOfCode) {
    showResult('bug-density-result', 'バグ数とコード行数を入力してください', 'error');
    return;
  }
  
  const density = (bugCount / linesOfCode) * 1000; // 1000行あたりのバグ数
  
  let quality = '';
  let qualityColor = '';
  if (density < 1) {
    quality = '優秀';
    qualityColor = '#28a745';
  } else if (density < 3) {
    quality = '良好';
    qualityColor = '#20c997';
  } else if (density < 5) {
    quality = '普通';
    qualityColor = '#ffc107';
  } else {
    quality = '要改善';
    qualityColor = '#dc3545';
  }
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">バグ密度:</span>
        <span class="result-value result-highlight">${density.toFixed(2)} バグ/1000行</span>
      </div>
      <div class="result-item">
        <span class="result-label">品質レベル:</span>
        <span class="result-value" style="color: ${qualityColor}">${quality}</span>
      </div>
      <div class="result-item">
        <span class="result-label">総バグ数:</span>
        <span class="result-value">${bugCount}個</span>
      </div>
      <div class="result-item">
        <span class="result-label">総コード行数:</span>
        <span class="result-value">${linesOfCode.toLocaleString()}行</span>
      </div>
    </div>
  `;
  
  showResult('bug-density-result', html, 'success');
}

// コードカバレッジ計算
function calculateCodeCoverage() {
  const testedLines = parseInt(document.getElementById('tested-lines').value);
  const totalLines = parseInt(document.getElementById('total-lines').value);
  
  if (!testedLines || !totalLines) {
    showResult('coverage-result', 'テスト済み行数と総コード行数を入力してください', 'error');
    return;
  }
  
  const coverage = (testedLines / totalLines) * 100;
  const untestedLines = totalLines - testedLines;
  
  let level = '';
  let levelColor = '';
  if (coverage >= 90) {
    level = '非常に良い';
    levelColor = '#28a745';
  } else if (coverage >= 80) {
    level = '良い';
    levelColor = '#20c997';
  } else if (coverage >= 70) {
    level = '普通';
    levelColor = '#ffc107';
  } else {
    level = '不十分';
    levelColor = '#dc3545';
  }
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">カバレッジ:</span>
        <span class="result-value result-highlight">${coverage.toFixed(1)}%</span>
      </div>
      <div class="percentage-bar">
        <div class="percentage-fill" style="width: ${Math.min(coverage, 100)}%">
          ${coverage.toFixed(1)}%
        </div>
      </div>
      <div class="result-item">
        <span class="result-label">評価:</span>
        <span class="result-value" style="color: ${levelColor}">${level}</span>
      </div>
      <div class="result-item">
        <span class="result-label">テスト済み:</span>
        <span class="result-value">${testedLines.toLocaleString()}行</span>
      </div>
      <div class="result-item">
        <span class="result-label">未テスト:</span>
        <span class="result-value">${untestedLines.toLocaleString()}行</span>
      </div>
    </div>
  `;
  
  showResult('coverage-result', html, 'success');
}

// =============================================================================
// 時間・効率計算
// =============================================================================

// 作業時間計算
function calculateWorkTime() {
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const breakTime = parseInt(document.getElementById('break-time').value) || 0;
  
  if (!startTime || !endTime) {
    showResult('work-time-result', '開始時刻と終了時刻を入力してください', 'error');
    return;
  }
  
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  
  let workTimeMs = end - start;
  if (workTimeMs < 0) {
    workTimeMs += 24 * 60 * 60 * 1000; // 日跨ぎの場合
  }
  
  const workTimeMinutes = workTimeMs / (1000 * 60) - breakTime;
  const workTimeHours = workTimeMinutes / 60;
  
  const hours = Math.floor(workTimeHours);
  const minutes = Math.round(workTimeMinutes % 60);
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">実働時間:</span>
        <span class="result-value result-highlight">${hours}時間${minutes}分</span>
      </div>
      <div class="result-item">
        <span class="result-label">開始時刻:</span>
        <span class="result-value">${startTime}</span>
      </div>
      <div class="result-item">
        <span class="result-label">終了時刻:</span>
        <span class="result-value">${endTime}</span>
      </div>
      <div class="result-item">
        <span class="result-label">休憩時間:</span>
        <span class="result-value">${breakTime}分</span>
      </div>
      <div class="result-item">
        <span class="result-label">時間（小数）:</span>
        <span class="result-value">${workTimeHours.toFixed(2)}時間</span>
      </div>
    </div>
  `;
  
  showResult('work-time-result', html, 'success');
}

// 時差計算
function calculateTimezone() {
  const baseTime = document.getElementById('base-time').value;
  const baseTimezone = parseInt(document.getElementById('base-timezone').value);
  
  if (!baseTime) {
    showResult('timezone-result', '基準時刻を入力してください', 'error');
    return;
  }
  
  const timezones = [
    { name: '日本（JST）', offset: 9 },
    { name: 'イギリス（GMT）', offset: 0 },
    { name: 'ドイツ（CET）', offset: 1 },
    { name: 'アメリカ東部（EST）', offset: -5 },
    { name: 'アメリカ西部（PST）', offset: -8 },
    { name: 'オーストラリア（AEST）', offset: 10 },
    { name: '中国（CST）', offset: 8 },
    { name: 'インド（IST）', offset: 5.5 }
  ];
  
  const [hours, minutes] = baseTime.split(':').map(Number);
  const baseDateTime = new Date();
  baseDateTime.setHours(hours, minutes, 0, 0);
  
  let html = '<div class="result-success">';
  
  timezones.forEach(tz => {
    const offsetDiff = tz.offset - baseTimezone;
    const targetTime = new Date(baseDateTime.getTime() + offsetDiff * 60 * 60 * 1000);
    
    html += `
      <div class="result-item">
        <span class="result-label">${tz.name}:</span>
        <span class="result-value">${targetTime.toTimeString().slice(0, 5)}</span>
      </div>
    `;
  });
  
  html += '</div>';
  
  showResult('timezone-result', html, 'success');
}

// =============================================================================
// 統計・分析計算
// =============================================================================

// 統計値計算
function calculateStatistics() {
  const dataInput = document.getElementById('data-values').value;
  
  if (!dataInput.trim()) {
    showResult('statistics-result', 'データを入力してください', 'error');
    return;
  }
  
  try {
    const data = dataInput.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    
    if (data.length === 0) {
      showResult('statistics-result', '有効な数値データを入力してください', 'error');
      return;
    }
    
    // 統計値計算
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    
    const sortedData = [...data].sort((a, b) => a - b);
    const median = sortedData.length % 2 === 0
      ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
      : sortedData[Math.floor(sortedData.length / 2)];
    
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">データ数:</span>
          <span class="result-value">${data.length}個</span>
        </div>
        <div class="result-item">
          <span class="result-label">合計:</span>
          <span class="result-value">${sum.toLocaleString()}</span>
        </div>
        <div class="result-item">
          <span class="result-label">平均値:</span>
          <span class="result-value result-highlight">${mean.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="result-label">中央値:</span>
          <span class="result-value result-highlight">${median.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="result-label">標準偏差:</span>
          <span class="result-value">${stdDev.toFixed(2)}</span>
        </div>
        <div class="result-item">
          <span class="result-label">最小値:</span>
          <span class="result-value">${min}</span>
        </div>
        <div class="result-item">
          <span class="result-label">最大値:</span>
          <span class="result-value">${max}</span>
        </div>
        <div class="result-item">
          <span class="result-label">範囲:</span>
          <span class="result-value">${max - min}</span>
        </div>
      </div>
    `;
    
    showResult('statistics-result', html, 'success');
  } catch (error) {
    showResult('statistics-result', '正しい形式でデータを入力してください（例：10,20,30,40,50）', 'error');
  }
}

// 成長率計算
function calculateGrowthRate() {
  const previousValue = parseFloat(document.getElementById('previous-value').value);
  const currentValue = parseFloat(document.getElementById('current-value').value);
  
  if (!previousValue || !currentValue) {
    showResult('growth-result', '前期の値と今期の値を入力してください', 'error');
    return;
  }
  
  const growthRate = ((currentValue - previousValue) / previousValue) * 100;
  const difference = currentValue - previousValue;
  const isGrowth = difference >= 0;
  
  let trend = '';
  if (growthRate > 10) trend = '大幅成長';
  else if (growthRate > 5) trend = '成長';
  else if (growthRate > 0) trend = '微増';
  else if (growthRate > -5) trend = '微減';
  else if (growthRate > -10) trend = '減少';
  else trend = '大幅減少';
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">成長率:</span>
        <span class="result-value result-highlight" style="color: ${isGrowth ? '#28a745' : '#dc3545'}">${growthRate.toFixed(2)}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">トレンド:</span>
        <span class="result-value" style="color: ${isGrowth ? '#28a745' : '#dc3545'}">${trend}</span>
      </div>
      <div class="result-item">
        <span class="result-label">前期:</span>
        <span class="result-value">${previousValue.toLocaleString()}</span>
      </div>
      <div class="result-item">
        <span class="result-label">今期:</span>
        <span class="result-value">${currentValue.toLocaleString()}</span>
      </div>
      <div class="result-item">
        <span class="result-label">差額:</span>
        <span class="result-value" style="color: ${isGrowth ? '#28a745' : '#dc3545'}">${difference > 0 ? '+' : ''}${difference.toLocaleString()}</span>
      </div>
    </div>
  `;
  
  showResult('growth-result', html, 'success');
}

// =============================================================================
// エンコーディング・変換
// =============================================================================

// Base64エンコード
function encodeBase64() {
  const input = document.getElementById('base64-input').value;
  
  if (!input.trim()) {
    showResult('base64-result', '入力テキストを入力してください', 'error');
    return;
  }
  
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">元のテキスト:</span>
          <span class="result-value">${input.length > 50 ? input.substring(0, 50) + '...' : input}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Base64エンコード結果:</span>
        </div>
        <div class="hash-output">${encoded}</div>
      </div>
    `;
    
    showResult('base64-result', html, 'success');
  } catch (error) {
    showResult('base64-result', 'エンコードに失敗しました', 'error');
  }
}

// Base64デコード
function decodeBase64() {
  const input = document.getElementById('base64-input').value;
  
  if (!input.trim()) {
    showResult('base64-result', '入力テキストを入力してください', 'error');
    return;
  }
  
  try {
    const decoded = decodeURIComponent(escape(atob(input)));
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">Base64テキスト:</span>
          <span class="result-value">${input.length > 50 ? input.substring(0, 50) + '...' : input}</span>
        </div>
        <div class="result-item">
          <span class="result-label">デコード結果:</span>
        </div>
        <div class="hash-output">${decoded}</div>
      </div>
    `;
    
    showResult('base64-result', html, 'success');
  } catch (error) {
    showResult('base64-result', '正しいBase64文字列を入力してください', 'error');
  }
}

// URLエンコード
function encodeURL() {
  const input = document.getElementById('url-input').value;
  
  if (!input.trim()) {
    showResult('url-result', '入力URLを入力してください', 'error');
    return;
  }
  
  const encoded = encodeURIComponent(input);
  
  const html = `
    <div class="result-success">
      <div class="result-item">
        <span class="result-label">元のURL:</span>
      </div>
      <div class="hash-output">${input}</div>
      <div class="result-item">
        <span class="result-label">エンコード結果:</span>
      </div>
      <div class="hash-output">${encoded}</div>
    </div>
  `;
  
  showResult('url-result', html, 'success');
}

// URLデコード
function decodeURL() {
  const input = document.getElementById('url-input').value;
  
  if (!input.trim()) {
    showResult('url-result', '入力URLを入力してください', 'error');
    return;
  }
  
  try {
    const decoded = decodeURIComponent(input);
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">エンコードされたURL:</span>
        </div>
        <div class="hash-output">${input}</div>
        <div class="result-item">
          <span class="result-label">デコード結果:</span>
        </div>
        <div class="hash-output">${decoded}</div>
      </div>
    `;
    
    showResult('url-result', html, 'success');
  } catch (error) {
    showResult('url-result', '正しいURLエンコード文字列を入力してください', 'error');
  }
}

// ハッシュ値計算（簡易版）
async function calculateHash() {
  const input = document.getElementById('hash-input').value;
  
  if (!input.trim()) {
    showResult('hash-result', '入力テキストを入力してください', 'error');
    return;
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">元のテキスト:</span>
          <span class="result-value">${input.length > 50 ? input.substring(0, 50) + '...' : input}</span>
        </div>
        <div class="result-item">
          <span class="result-label">SHA-256ハッシュ:</span>
        </div>
        <div class="hash-output">${hashHex}</div>
      </div>
    `;
    
    showResult('hash-result', html, 'success');
  } catch (error) {
    showResult('hash-result', 'ハッシュ計算に失敗しました', 'error');
  }
}

// =============================================================================
// 数値変換
// =============================================================================

// 進数変換
function convertNumber() {
  const input = document.getElementById('number-input').value;
  const inputBase = parseInt(document.getElementById('input-base').value);
  
  if (!input.trim()) {
    showResult('number-result', '入力値を入力してください', 'error');
    return;
  }
  
  try {
    const decimal = parseInt(input, inputBase);
    
    if (isNaN(decimal)) {
      showResult('number-result', '正しい数値を入力してください', 'error');
      return;
    }
    
    const conversions = {
      '2進数': decimal.toString(2),
      '8進数': decimal.toString(8),
      '10進数': decimal.toString(10),
      '16進数': decimal.toString(16).toUpperCase()
    };
    
    let html = '<div class="result-success"><div class="conversion-grid">';
    
    Object.entries(conversions).forEach(([base, value]) => {
      html += `
        <div class="conversion-item">
          <div class="conversion-unit">${base}</div>
          <div class="conversion-value">${value}</div>
        </div>
      `;
    });
    
    html += '</div></div>';
    
    showResult('number-result', html, 'success');
  } catch (error) {
    showResult('number-result', '変換に失敗しました', 'error');
  }
}

// 色コード変換
function convertColor() {
  const hexColor = document.getElementById('hex-color').value;
  
  if (!hexColor.trim()) {
    showResult('color-result', 'HEX色コードを入力してください', 'error');
    return;
  }
  
  try {
    let hex = hexColor.replace('#', '');
    
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    if (hex.length !== 6) {
      throw new Error('Invalid hex color');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // HSL変換
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === rNorm) h = 60 * (((gNorm - bNorm) / diff) % 6);
      else if (max === gNorm) h = 60 * ((bNorm - rNorm) / diff + 2);
      else h = 60 * ((rNorm - gNorm) / diff + 4);
    }
    if (h < 0) h += 360;
    
    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
    
    const html = `
      <div class="result-success">
        <div class="result-item">
          <span class="result-label">カラープレビュー:</span>
        </div>
        <div class="color-preview" style="background-color: #${hex}"></div>
        <div class="result-item">
          <span class="result-label">HEX:</span>
          <span class="result-value">#${hex.toUpperCase()}</span>
        </div>
        <div class="result-item">
          <span class="result-label">RGB:</span>
          <span class="result-value">rgb(${r}, ${g}, ${b})</span>
        </div>
        <div class="result-item">
          <span class="result-label">HSL:</span>
          <span class="result-value">hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)</span>
        </div>
      </div>
    `;
    
    showResult('color-result', html, 'success');
  } catch (error) {
    showResult('color-result', '正しいHEX色コードを入力してください（例：#FF5733）', 'error');
  }
}

// 単位換算
function convertUnit() {
  const value = parseFloat(document.getElementById('unit-value').value);
  const unitType = document.getElementById('unit-type').value;
  
  if (!value) {
    showResult('unit-result', '値を入力してください', 'error');
    return;
  }
  
  let conversions = {};
  
  switch (unitType) {
    case 'length':
      conversions = {
        'メートル': value,
        'フィート': value * 3.28084,
        'インチ': value * 39.3701,
        'ヤード': value * 1.09361,
        'センチメートル': value * 100,
        'ミリメートル': value * 1000
      };
      break;
      
    case 'weight':
      conversions = {
        'キログラム': value,
        'ポンド': value * 2.20462,
        'オンス': value * 35.274,
        'グラム': value * 1000,
        'トン': value / 1000
      };
      break;
      
    case 'temp':
      conversions = {
        '摂氏（°C）': value,
        '華氏（°F）': (value * 9/5) + 32,
        'ケルビン（K）': value + 273.15
      };
      break;
  }
  
  let html = '<div class="result-success"><div class="conversion-grid">';
  
  Object.entries(conversions).forEach(([unit, convertedValue]) => {
    html += `
      <div class="conversion-item">
        <div class="conversion-unit">${unit}</div>
        <div class="conversion-value">${convertedValue.toFixed(2)}</div>
      </div>
    `;
  });
  
  html += '</div></div>';
  
  showResult('unit-result', html, 'success');
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

// 結果表示
function showResult(elementId, content, type = 'info') {
  const element = document.getElementById(elementId);
  element.innerHTML = content;
  
  // CSSクラスをリセット
  element.className = 'result-display';
  
  if (type === 'success') {
    element.classList.add('result-success');
  } else if (type === 'error') {
    element.classList.add('result-error');
  } else {
    element.classList.add('result-info');
  }
}

// 数値フォーマット
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.001) return num.toFixed(6);
  return num.toExponential(2);
}