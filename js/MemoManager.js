// メモ管理のロジック
let memos = JSON.parse(localStorage.getItem("memos")) || [];
let editingMemoId = null;
let filteredMemos = [];
let searchQuery = "";
let selectedCategory = "";

const memoList = document.getElementById("memo-list");
const memoTitleInput = document.getElementById("memo-title");
const memoContentInput = document.getElementById("memo-content");
const saveButton = document.getElementById("save-button");
const deleteButton = document.getElementById("delete-button");

// 新しい要素の取得
const memoCategorySelect = document.getElementById("memo-category");
const memoTagsInput = document.getElementById("memo-tags");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearSearchBtn = document.getElementById("clear-search-btn");
const categoryFilter = document.getElementById("category-filter");
const templateSelect = document.getElementById("template-select");
const applyTemplateBtn = document.getElementById("apply-template-btn");
const markdownToggle = document.getElementById("markdown-toggle");
const previewToggle = document.getElementById("preview-toggle");
const markdownPreview = document.getElementById("markdown-preview");
const newMemoButton = document.getElementById("new-memo-button");

// メモリストを表示
function renderMemos() {
  memoList.innerHTML = "";
  const memosToShow = filteredMemos.length > 0 ? filteredMemos : memos;
  
  memosToShow.forEach((memo, index) => {
    const listItem = document.createElement("li");
    listItem.className = editingMemoId === memo.id ? "selected-memo" : "";
    listItem.onclick = () => selectMemo(memo.id);
    
    // メモの内容を構造化して表示（タイトルのみ）
    const memoMeta = document.createElement("div");
    memoMeta.className = "memo-meta";
    
    const memoTitle = document.createElement("span");
    memoTitle.className = "memo-title";
    memoTitle.textContent = memo.title || "無題";
    
    const memoCategory = document.createElement("span");
    memoCategory.className = "memo-category";
    memoCategory.textContent = memo.category || "その他";
    
    memoMeta.appendChild(memoTitle);
    memoMeta.appendChild(memoCategory);
    listItem.appendChild(memoMeta);
    
    // ドラッグ&ドロップ機能を追加
    listItem.draggable = true;
    listItem.dataset.index = index;
    listItem.dataset.memoId = memo.id;
    
    // ドラッグハンドルを追加
    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⋮⋮";
    listItem.appendChild(dragHandle);
    
    // ドラッグイベントリスナーを追加
    listItem.addEventListener('dragstart', handleMemoDropStart);
    listItem.addEventListener('dragover', handleMemoDropOver);
    listItem.addEventListener('drop', handleMemoDrop);
    listItem.addEventListener('dragend', handleMemoDropEnd);
    
    memoList.appendChild(listItem);
  });
}

// メモを選択
function selectMemo(id) {
  const memo = memos.find((m) => m.id === id);
  if (memo) {
    editingMemoId = id;
    memoTitleInput.value = memo.title;
    memoContentInput.value = memo.content;
    deleteButton.disabled = false;

    document.querySelectorAll("#memo-list li").forEach((item) => {
      item.classList.remove("selected");
    });

    const selectedItem = [...memoList.children].find(
      (item) => item.textContent === memo.title
    );
    if (selectedItem) {
      selectedItem.classList.add("selected"); // 選択中のクラスを追加
    }
  }
}


// メモを選択
function selectMemo(id) {
  const memo = memos.find((m) => m.id === id);
  if (memo) {
    editingMemoId = id;
    memoTitleInput.value = memo.title;
    memoContentInput.value = memo.content;
    memoCategorySelect.value = memo.category || "その他";
    memoTagsInput.value = memo.tags ? memo.tags.join(', ') : "";
    deleteButton.disabled = false;

    // ボタンのテキストを「更新」に変更
    saveButton.textContent = "更新";

    document.querySelectorAll("#memo-list li").forEach((item) => {
      item.classList.remove("selected");
    });

    const selectedItem = [...memoList.children].find(
      (item) => item.textContent === memo.title
    );
    if (selectedItem) {
      selectedItem.classList.add("selected"); // 選択中のクラスを追加
    }
  }
}

// メモを追加または更新
function saveMemo() {
  const title = memoTitleInput.value.trim();
  const content = memoContentInput.value.trim();

  if (!title) {
    alert("タイトルを入力してください！");
    return;
  }

  const category = memoCategorySelect.value;
  const tags = memoTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

  if (editingMemoId) {
    // 既存メモの更新
    const memo = memos.find((m) => m.id === editingMemoId);
    if (memo) {
      memo.title = title;
      memo.content = content;
      memo.category = category;
      memo.tags = tags;
      memo.updatedAt = new Date().toISOString();
    }
  } else {
    // 新しいメモの追加
    memos.push({ 
      id: Date.now(), 
      title, 
      content, 
      category,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  resetForm();
  updateLocalStorage();
  renderMemos();
}

// フォームをリセット
function resetForm() {
  editingMemoId = null;
  memoTitleInput.value = "";
  memoContentInput.value = "";
  memoCategorySelect.value = "その他";
  memoTagsInput.value = "";
  deleteButton.disabled = true;

  // ボタンのテキストを「メモを追加」に戻す
  saveButton.textContent = "メモを追加";
  
  // プレビューモードをリセット
  if (markdownPreview.style.display !== 'none') {
    togglePreview();
  }
}


// フォームをリセット
function resetForm() {
  editingMemoId = null;
  memoTitleInput.value = "";
  memoContentInput.value = "";
  deleteButton.disabled = true;

  // ボタンのテキストを「メモを追加」に戻す
  saveButton.textContent = "メモを追加";
}


// メモを削除
function deleteMemo() {
  if (editingMemoId) {
    memos = memos.filter((memo) => memo.id !== editingMemoId);
    resetForm();
    updateLocalStorage();
    renderMemos();
  }
}

// フォームをリセット
function resetForm() {
  editingMemoId = null;
  memoTitleInput.value = "";
  memoContentInput.value = "";
  deleteButton.disabled = true;
}

// ローカルストレージを更新
function updateLocalStorage() {
  localStorage.setItem("memos", JSON.stringify(memos));
}

// イベントリスナーを設定
saveButton.addEventListener("click", saveMemo);
deleteButton.addEventListener("click", deleteMemo);

// ドラッグ&ドロップ機能
let draggedMemoElement = null;
let draggedMemoIndex = null;

function handleMemoDropStart(e) {
  draggedMemoElement = this;
  draggedMemoIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleMemoDropOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  // ドロップターゲットのハイライト
  const targetElement = e.currentTarget;
  if (targetElement !== draggedMemoElement) {
    targetElement.classList.add('drag-over');
  }
}

function handleMemoDrop(e) {
  e.preventDefault();
  const targetElement = e.currentTarget;
  const targetIndex = parseInt(targetElement.dataset.index);
  
  if (draggedMemoElement && draggedMemoIndex !== null && draggedMemoIndex !== targetIndex) {
    // メモ配列の順番を変更
    const draggedMemo = memos[draggedMemoIndex];
    memos.splice(draggedMemoIndex, 1);
    memos.splice(targetIndex, 0, draggedMemo);
    
    // ローカルストレージに保存
    updateLocalStorage();
    
    // 表示を更新
    renderMemos();
    
    // 編集中のメモが移動した場合、新しいIDを保持
    if (editingMemoId === parseInt(draggedMemoElement.dataset.memoId)) {
      // 選択状態を維持
      setTimeout(() => selectMemo(editingMemoId), 0);
    }
  }
  
  // クリーンアップ
  targetElement.classList.remove('drag-over');
}

function handleMemoDropEnd(e) {
  this.classList.remove('dragging');
  
  // すべてのドラッグオーバーのハイライトを削除
  document.querySelectorAll('#memo-list li').forEach(item => {
    item.classList.remove('drag-over');
  });
  
  draggedMemoElement = null;
  draggedMemoIndex = null;
}

// 検索機能
function performSearch() {
  searchQuery = searchInput.value.toLowerCase().trim();
  applyFilters();
}

function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  applyFilters();
}

function applyFilters() {
  filteredMemos = memos.filter(memo => {
    const matchesSearch = !searchQuery || 
      memo.title.toLowerCase().includes(searchQuery) ||
      memo.content.toLowerCase().includes(searchQuery) ||
      (memo.tags && memo.tags.some(tag => tag.toLowerCase().includes(searchQuery)));
    
    const matchesCategory = !selectedCategory || memo.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  renderMemos();
}

// テンプレート機能
const templates = {
  meeting: {
    title: "会議メモ - ",
    content: `# 会議メモ

## 日時
- 日付: 
- 時間: 
- 場所: 

## 参加者
- 

## 議題
1. 
2. 
3. 

## 議事録
### 項目1


### 項目2


## アクションアイテム
- [ ] 
- [ ] 
- [ ] 

## 次回会議
- 日時: 
- 議題: `,
    category: "会議"
  },
  idea: {
    title: "アイデア - ",
    content: `# アイデア

## 概要


## 背景・課題


## 解決策・アプローチ


## 期待される効果


## 必要なリソース


## 次のステップ
- [ ] 
- [ ] 
- [ ] `,
    category: "アイデア"
  },
  daily: {
    title: "日報 - ",
    content: `# 日報

## 日付
${new Date().toLocaleDateString('ja-JP')}

## 今日の成果
### 完了したタスク
- 
- 
- 

### 進行中のタスク
- 
- 

## 学んだこと・気づき


## 明日の予定
- [ ] 
- [ ] 
- [ ] 

## 課題・相談事項


`,
    category: "学習"
  },
  project: {
    title: "プロジェクトメモ - ",
    content: `# プロジェクト名

## プロジェクト概要


## 目標・ゴール


## スケジュール
- 開始日: 
- 終了予定日: 
- マイルストーン:
  - [ ] 
  - [ ] 
  - [ ] 

## チームメンバー
- 

## 現在の状況


## 課題・リスク


## 次のアクション
- [ ] 
- [ ] 
- [ ] `,
    category: "その他"
  }
};

function applyTemplate() {
  const templateName = templateSelect.value;
  if (!templateName || !templates[templateName]) return;
  
  const template = templates[templateName];
  memoTitleInput.value = template.title + new Date().toLocaleDateString('ja-JP');
  memoContentInput.value = template.content;
  memoCategorySelect.value = template.category;
  
  templateSelect.value = "";
}

// マークダウン関連機能
function parseMarkdown(text) {
  // 簡易的なマークダウンパーサー
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/gim, '<br>');
}

function togglePreview() {
  if (markdownPreview.style.display === 'none') {
    // プレビューモードに切り替え
    markdownPreview.innerHTML = parseMarkdown(memoContentInput.value);
    markdownPreview.style.display = 'block';
    memoContentInput.style.display = 'none';
    previewToggle.classList.add('active');
    previewToggle.textContent = '編集に戻る';
  } else {
    // 編集モードに戻る
    markdownPreview.style.display = 'none';
    memoContentInput.style.display = 'block';
    previewToggle.classList.remove('active');
    previewToggle.textContent = 'プレビュー';
  }
}

function newMemo() {
  resetForm();
  document.querySelectorAll("#memo-list li").forEach((item) => {
    item.classList.remove("selected");
  });
}

// イベントリスナーを設定
searchBtn.addEventListener("click", performSearch);
clearSearchBtn.addEventListener("click", clearSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") performSearch();
});

categoryFilter.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  applyFilters();
});

applyTemplateBtn.addEventListener("click", applyTemplate);
previewToggle.addEventListener("click", togglePreview);
newMemoButton.addEventListener("click", newMemo);

// リアルタイムマークダウンプレビュー更新
memoContentInput.addEventListener("input", () => {
  if (markdownPreview.style.display !== 'none') {
    markdownPreview.innerHTML = parseMarkdown(memoContentInput.value);
  }
});

// 初期化
renderMemos();
