// 効率化ツール - JavaScript

// 現在のツールとフォーマット
let currentTool = 'regex';
let currentFormat = 'json';

// 正規表現プリセット定義
const regexPresets = {
  'email': {
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    testString: `メールアドレスのテスト:
有効: user@example.com, test.email+tag@domain.co.jp, admin123@company.org
無効: invalid.email, @domain.com, user@, test@domain, user@domain.`
  },
  'phone-jp': {
    pattern: '0\\d{1,4}-\\d{1,4}-\\d{4}',
    testString: `日本の電話番号:
有効: 03-1234-5678, 090-1234-5678, 0120-123-456, 06-1234-5678
無効: 12-3456-7890, 03-12345-678, 90-1234-5678`
  },
  'url': {
    pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+',
    testString: `URL形式のテスト:
有効: https://example.com, http://test.jp/path?param=value, https://sub.domain.com:8080/api/v1
無効: ftp://example.com, example.com, http://`
  },
  'ipv4': {
    pattern: '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
    testString: `IPv4アドレス:
有効: 192.168.1.1, 10.0.0.1, 255.255.255.255, 127.0.0.1
無効: 256.1.1.1, 192.168.1, 192.168.1.256, abc.def.ghi.jkl`
  },
  'date-iso': {
    pattern: '\\d{4}-\\d{2}-\\d{2}',
    testString: `ISO日付形式 (YYYY-MM-DD):
有効: 2024-01-15, 2023-12-31, 2025-07-04
無効: 24-01-15, 2024/01/15, 2024-1-1, 15-01-2024`
  },
  'date-jp': {
    pattern: '\\d{4}年\\d{1,2}月\\d{1,2}日',
    testString: `日本の日付形式:
有効: 2024年1月15日, 2023年12月31日, 2025年7月4日
無効: 2024年1月, 24年1月15日, 2024/1/15, 2024-01-15`
  },
  'postal-jp': {
    pattern: '\\d{3}-\\d{4}',
    testString: `日本の郵便番号:
有効: 123-4567, 100-0001, 999-9999
無効: 1234567, 123-456, 12-34567, abc-defg`
  },
  'credit-card': {
    pattern: '\\d{4}-\\d{4}-\\d{4}-\\d{4}',
    testString: `クレジットカード番号形式:
有効: 1234-5678-9012-3456, 4111-1111-1111-1111
無効: 123456789012345, 1234-567-8901-2345, abcd-efgh-ijkl-mnop`
  },
  'password-strong': {
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    testString: `強いパスワード (8文字以上、大小英字・数字・記号を含む):
有効: Password123!, MySecur3P@ss, StrongP@ssw0rd
無効: password, Password, Password123, 12345678, Pass123`
  },
  'html-tag': {
    pattern: '<[^>]+>',
    testString: `HTMLタグ:
有効: <div>, <p class="text">, <img src="image.jpg" alt="test">, </div>
無効: <div, div>, < div >, <>`
  },
  'css-hex': {
    pattern: '#[0-9a-fA-F]{3,6}',
    testString: `CSS色コード:
有効: #fff, #000000, #ff5733, #A1B2C3
無効: #gg, #12345, #1234567, fff, 0x123456`
  },
  'file-extension': {
    pattern: '\\.[a-zA-Z0-9]+$',
    testString: `ファイル拡張子:
有効: file.txt, image.jpg, script.js, document.pdf, data.json
無効: file, .file, file., file.`
  },
  'number-int': {
    pattern: '^-?\\d+$',
    testString: `整数:
有効: 123, -456, 0, 999999
無効: 12.34, 1.0, abc, 12a, +123`
  },
  'number-float': {
    pattern: '^-?\\d+(\\.\\d+)?$',
    testString: `小数 (整数含む):
有効: 123, 123.45, -456.78, 0.1, -0.5
無効: .5, 123., abc, 12.34.56`
  },
  'alphanumeric': {
    pattern: '^[a-zA-Z0-9]+$',
    testString: `英数字のみ:
有効: abc123, Test123, user01, ABC
無効: abc-123, user@domain, test_123, 日本語123`
  },
  'whitespace': {
    pattern: '\\s+',
    testString: `空白文字:
スペース、タブ、改行が含まれる文字列:
"hello world", "line1	tab	line2", "text
newline", "  spaces  "`
  }
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // 初期状態の設定
  switchTool('regex');
  switchFormat('json');
});

// ツール切り替え機能
function switchTool(toolName) {
  currentTool = toolName;
  
  // タブの状態更新
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[onclick="switchTool('${toolName}')"]`).classList.add('active');
  
  // コンテンツの表示切り替え
  document.querySelectorAll('.tool-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${toolName}-tool`).classList.add('active');
}

// 正規表現プリセット読み込み機能
function loadRegexPreset() {
  const selectElement = document.getElementById('regex-presets');
  const selectedValue = selectElement.value;
  
  if (!selectedValue || !regexPresets[selectedValue]) {
    return;
  }
  
  const preset = regexPresets[selectedValue];
  
  // パターンと テスト文字列を設定
  document.getElementById('regex-pattern').value = preset.pattern;
  document.getElementById('test-string').value = preset.testString;
  
  // 結果をクリア
  document.getElementById('regex-results').innerHTML = '正規表現パターンを入力してテストを実行してください';
  document.getElementById('regex-matches').innerHTML = 'マッチした部分がここに表示されます';
  
  // 適切なフラグを設定（プリセットに応じて）
  const flagG = document.getElementById('flag-g');
  const flagI = document.getElementById('flag-i');
  const flagM = document.getElementById('flag-m');
  
  // デフォルトでグローバルフラグはON
  flagG.checked = true;
  
  // 特定のパターンに応じてフラグを調整
  if (selectedValue === 'email' || selectedValue === 'url') {
    flagI.checked = true; // 大文字小文字を無視
  } else {
    flagI.checked = false;
  }
  
  if (selectedValue === 'whitespace') {
    flagM.checked = true; // 複数行モード
  } else {
    flagM.checked = false;
  }
}

// フォーマット切り替え機能
function switchFormat(formatName) {
  currentFormat = formatName;
  
  // フォーマットタブの状態更新
  document.querySelectorAll('.format-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[onclick="switchFormat('${formatName}')"]`).classList.add('active');
}

// 正規表現テスター機能
function testRegex() {
  const pattern = document.getElementById('regex-pattern').value;
  const testString = document.getElementById('test-string').value;
  const flagG = document.getElementById('flag-g').checked;
  const flagI = document.getElementById('flag-i').checked;
  const flagM = document.getElementById('flag-m').checked;
  
  const resultsDiv = document.getElementById('regex-results');
  const matchesDiv = document.getElementById('regex-matches');
  
  if (!pattern) {
    resultsDiv.innerHTML = '⚠️ 正規表現パターンを入力してください';
    matchesDiv.innerHTML = '';
    return;
  }
  
  if (!testString) {
    resultsDiv.innerHTML = '⚠️ テスト文字列を入力してください';
    matchesDiv.innerHTML = '';
    return;
  }
  
  try {
    // フラグの組み立て
    let flags = '';
    if (flagG) flags += 'g';
    if (flagI) flags += 'i';
    if (flagM) flags += 'm';
    
    const regex = new RegExp(pattern, flags);
    const matches = testString.match(regex);
    
    // 結果の表示
    if (matches) {
      resultsDiv.innerHTML = `
        <div class="success-result">
          ✅ <strong>マッチしました！</strong><br>
          📊 マッチ数: ${matches.length}個<br>
          🎯 パターン: <code>${pattern}</code><br>
          🏁 フラグ: <code>${flags || '(なし)'}</code>
        </div>
      `;
      
      // マッチした部分をハイライト表示
      let highlightedText = testString;
      const allMatches = [];
      
      if (flagG) {
        // グローバルマッチの場合
        let match;
        const globalRegex = new RegExp(pattern, flags);
        while ((match = globalRegex.exec(testString)) !== null) {
          allMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (!flagG) break;
        }
      } else {
        // 最初のマッチのみ
        const match = regex.exec(testString);
        if (match) {
          allMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      // マッチした部分の詳細表示
      let matchDetails = '<div class="matches-list">';
      allMatches.forEach((match, index) => {
        matchDetails += `
          <div class="match-item">
            <strong>マッチ ${index + 1}:</strong> 
            <span class="match-text">"${match.text}"</span>
            <span class="match-position">(位置: ${match.index})</span>
        `;
        if (match.groups.length > 0) {
          matchDetails += `<br><small>グループ: ${match.groups.map((g, i) => `$${i+1}="${g}"`).join(', ')}</small>`;
        }
        matchDetails += '</div>';
      });
      matchDetails += '</div>';
      
      matchesDiv.innerHTML = matchDetails;
      
    } else {
      resultsDiv.innerHTML = `
        <div class="error-result">
          ❌ <strong>マッチしませんでした</strong><br>
          🎯 パターン: <code>${pattern}</code><br>
          🏁 フラグ: <code>${flags || '(なし)'}</code>
        </div>
      `;
      matchesDiv.innerHTML = '<div class="no-matches">マッチする部分がありませんでした</div>';
    }
    
  } catch (error) {
    resultsDiv.innerHTML = `
      <div class="error-result">
        ❌ <strong>正規表現エラー</strong><br>
        💬 ${error.message}
      </div>
    `;
    matchesDiv.innerHTML = '';
  }
}

// 正規表現テスターのクリア
function clearRegex() {
  document.getElementById('regex-pattern').value = '';
  document.getElementById('test-string').value = '';
  document.getElementById('regex-results').innerHTML = '正規表現パターンを入力してテストを実行してください';
  document.getElementById('regex-matches').innerHTML = 'マッチした部分がここに表示されます';
}

// JSON/XML整形機能
function formatData() {
  const inputData = document.getElementById('input-data').value;
  const outputField = document.getElementById('output-data');
  
  if (!inputData.trim()) {
    outputField.value = '';
    showValidationResult('⚠️ データを入力してください', 'warning');
    return;
  }
  
  try {
    if (currentFormat === 'json') {
      // JSON整形
      const parsed = JSON.parse(inputData);
      outputField.value = JSON.stringify(parsed, null, 2);
      showValidationResult('✅ JSON整形が完了しました', 'success');
    } else if (currentFormat === 'xml') {
      // XML整形（簡易版）
      const formatted = formatXML(inputData);
      outputField.value = formatted;
      showValidationResult('✅ XML整形が完了しました', 'success');
    }
  } catch (error) {
    showValidationResult(`❌ 整形エラー: ${error.message}`, 'error');
    outputField.value = '';
  }
}

// データ圧縮機能
function compressData() {
  const inputData = document.getElementById('input-data').value;
  const outputField = document.getElementById('output-data');
  
  if (!inputData.trim()) {
    outputField.value = '';
    showValidationResult('⚠️ データを入力してください', 'warning');
    return;
  }
  
  try {
    if (currentFormat === 'json') {
      // JSON圧縮
      const parsed = JSON.parse(inputData);
      outputField.value = JSON.stringify(parsed);
      showValidationResult('✅ JSON圧縮が完了しました', 'success');
    } else if (currentFormat === 'xml') {
      // XML圧縮（改行・スペース除去）
      const compressed = inputData.replace(/>\s+</g, '><').replace(/\n\s*/g, '');
      outputField.value = compressed;
      showValidationResult('✅ XML圧縮が完了しました', 'success');
    }
  } catch (error) {
    showValidationResult(`❌ 圧縮エラー: ${error.message}`, 'error');
    outputField.value = '';
  }
}

// データ検証機能
function validateData() {
  const inputData = document.getElementById('input-data').value;
  
  if (!inputData.trim()) {
    showValidationResult('⚠️ データを入力してください', 'warning');
    return;
  }
  
  try {
    if (currentFormat === 'json') {
      // JSON検証
      const parsed = JSON.parse(inputData);
      const stats = analyzeJSON(parsed);
      showValidationResult(`
        ✅ <strong>有効なJSONです</strong><br>
        📊 統計情報:<br>
        • オブジェクト数: ${stats.objects}<br>
        • 配列数: ${stats.arrays}<br>
        • プロパティ数: ${stats.properties}<br>
        • 文字数: ${inputData.length}
      `, 'success');
    } else if (currentFormat === 'xml') {
      // XML検証（簡易版）
      const parser = new DOMParser();
      const doc = parser.parseFromString(inputData, 'text/xml');
      const parseError = doc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        showValidationResult(`❌ 無効なXMLです<br>${parseError[0].textContent}`, 'error');
      } else {
        showValidationResult(`
          ✅ <strong>有効なXMLです</strong><br>
          📊 統計情報:<br>
          • 要素数: ${doc.getElementsByTagName('*').length}<br>
          • 文字数: ${inputData.length}
        `, 'success');
      }
    }
  } catch (error) {
    showValidationResult(`❌ 検証エラー: ${error.message}`, 'error');
  }
}

// フォーマッターのクリア
function clearFormatter() {
  document.getElementById('input-data').value = '';
  document.getElementById('output-data').value = '';
  showValidationResult('データを入力して検証ボタンを押してください', 'info');
}

// 出力結果をコピー
function copyOutput() {
  const outputField = document.getElementById('output-data');
  outputField.select();
  document.execCommand('copy');
  
  // 一時的にボタンテキストを変更
  const copyBtn = document.querySelector('.copy-btn');
  const originalText = copyBtn.textContent;
  copyBtn.textContent = '✅ コピー完了';
  copyBtn.style.background = '#4CAF50';
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = '';
  }, 2000);
}

// サンプルデータ読み込み
function loadSample(sampleType) {
  const samples = {
    'json': {
      input: `{
  "users": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "age": 30,
      "skills": ["JavaScript", "Python", "SQL"]
    },
    {
      "id": 2,
      "name": "佐藤花子",
      "email": "sato@example.com",
      "age": 25,
      "skills": ["Java", "Spring", "MySQL"]
    }
  ],
  "total": 2
}`,
      tool: 'formatter',
      format: 'json'
    },
    'xml': {
      input: `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>田中太郎</name>
    <email>tanaka@example.com</email>
    <age>30</age>
    <skills>
      <skill>JavaScript</skill>
      <skill>Python</skill>
      <skill>SQL</skill>
    </skills>
  </user>
  <user id="2">
    <name>佐藤花子</name>
    <email>sato@example.com</email>
    <age>25</age>
    <skills>
      <skill>Java</skill>
      <skill>Spring</skill>
      <skill>MySQL</skill>
    </skills>
  </user>
</users>`,
      tool: 'formatter',
      format: 'xml'
    },
    'regex-email': {
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      testString: `メールアドレスのテスト:
有効: user@example.com, test.email+tag@domain.co.jp, admin123@company.org
無効: invalid.email, @domain.com, user@, test@domain, user@domain.`,
      tool: 'regex'
    },
    'regex-phone': {
      pattern: '0\\d{1,4}-\\d{1,4}-\\d{4}',
      testString: `日本の電話番号:
有効: 03-1234-5678, 090-1234-5678, 0120-123-456, 06-1234-5678
無効: 12-3456-7890, 03-12345-678, 90-1234-5678`,
      tool: 'regex'
    }
  };
  
  const sample = samples[sampleType];
  if (!sample) return;
  
  // ツールを切り替え
  if (sample.tool !== currentTool) {
    switchTool(sample.tool);
  }
  
  if (sample.tool === 'regex') {
    document.getElementById('regex-pattern').value = sample.pattern;
    document.getElementById('test-string').value = sample.testString;
  } else if (sample.tool === 'formatter') {
    switchFormat(sample.format);
    document.getElementById('input-data').value = sample.input;
  }
}

// ヘルパー関数
function formatXML(xml) {
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let formatted = xml.replace(reg, '$1\r\n$2$3');
  let pad = 0;
  
  return formatted.split('\r\n').map(line => {
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (line.match(/^<\/\w/) && pad > 0) {
      pad -= 1;
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    
    const padding = PADDING.repeat(pad);
    pad += indent;
    
    return padding + line;
  }).join('\r\n');
}

function analyzeJSON(obj, stats = { objects: 0, arrays: 0, properties: 0 }) {
  if (Array.isArray(obj)) {
    stats.arrays++;
    obj.forEach(item => analyzeJSON(item, stats));
  } else if (typeof obj === 'object' && obj !== null) {
    stats.objects++;
    Object.keys(obj).forEach(key => {
      stats.properties++;
      analyzeJSON(obj[key], stats);
    });
  }
  return stats;
}

function showValidationResult(message, type) {
  const resultDiv = document.getElementById('validation-output');
  resultDiv.innerHTML = message;
  resultDiv.className = `validation-message ${type}`;
}