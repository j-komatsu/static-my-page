// メモ管理のロジック
let memos = JSON.parse(localStorage.getItem("memos")) || [];
let editingMemoId = null;

const memoList = document.getElementById("memo-list");
const memoTitleInput = document.getElementById("memo-title");
const memoContentInput = document.getElementById("memo-content");
const saveButton = document.getElementById("save-button");
const deleteButton = document.getElementById("delete-button");

// メモリストを表示
function renderMemos() {
  memoList.innerHTML = "";
  memos.forEach((memo) => {
    const listItem = document.createElement("li");
    listItem.textContent = memo.title;
    listItem.className = editingMemoId === memo.id ? "selected-memo" : "";
    listItem.onclick = () => selectMemo(memo.id);
    memoList.appendChild(listItem);
  });
}

// メモを選択
function selectMemo(id) {
  // 選択中のメモを取得
  const memo = memos.find((m) => m.id === id);
  if (memo) {
    editingMemoId = id;
    memoTitleInput.value = memo.title;
    memoContentInput.value = memo.content;
    deleteButton.disabled = false;

    // 既存の選択状態をクリア
    document.querySelectorAll("#memo-list li").forEach((item) => {
      item.classList.remove("selected-memo");
    });

    // 現在選択したメモにクラスを追加
    const selectedItem = [...memoList.children].find(
      (item) => item.textContent === memo.title
    );
    if (selectedItem) {
      selectedItem.classList.add("selected-memo");
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

  if (editingMemoId) {
    const memo = memos.find((m) => m.id === editingMemoId);
    if (memo) {
      memo.title = title;
      memo.content = content;
    }
  } else {
    memos.push({ id: Date.now(), title, content });
  }

  resetForm();
  updateLocalStorage();
  renderMemos();
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

// 初期化
renderMemos();
