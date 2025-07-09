let currentSectionId = "";


function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function addLink() {
  const text = document.getElementById("new-link-text").value;
  const url = document.getElementById("new-link-url").value;

  if (!text || !url) {
    alert("リンクテキストとURLを入力してください！");
    return;
  }

  const linkList = document.querySelector(`#${currentSectionId} .link-list`);
  const newListItem = document.createElement("li");
  newListItem.innerHTML = `<a href="${url}" target="_blank">${text}</a>`;
  linkList.appendChild(newListItem);

  document.getElementById("new-link-text").value = "";
  document.getElementById("new-link-url").value = "";
  editLinks(currentSectionId);
}

function removeLink(index) {
  if (!linksData[currentSectionId]) {
    console.error(`セクション${currentSectionId}のリンクデータが存在しません`);
    return;
  }

  // 指定インデックスのリンクを削除
  linksData[currentSectionId].splice(index, 1);

  // ローカルストレージに保存
  saveLinks();

  // モーダル内とセクション表示を更新
  renderLinks();
  editLinks(currentSectionId); // モーダルも再描画
}




// ローカルストレージ設定 ------------------------------------------------------------

// ページごとのキーを生成（ページタイトルやURLを利用）
const pageKey = `sectionLinks_${document.title.replace(/\s+/g, "_")}`;
const sectionNamesKey = `sectionNames_${document.title.replace(/\s+/g, "_")}`;
let linksData = {};


// 各セクションのリンクを描画
function renderLinks() {
  for (const [sectionId, links] of Object.entries(linksData)) {
    const linkList = document.querySelector(`#${sectionId} .link-list`);

    // リンクリストを一度クリアして再描画
    if (linkList) {
      linkList.innerHTML = ""; // 既存のリンクを削除
      links.forEach(({ text, url }) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${url}" target="_blank">${text}</a>`;
        linkList.appendChild(listItem);
      });
    }
  }
}

// リンクを編集するためのモーダルを表示
function editLinks(sectionId) {
  currentSectionId = sectionId;
  const modalLinkList = document.getElementById("modal-link-list");
  modalLinkList.innerHTML = ""; // モーダル内のリンクリストをクリア

  // 入力フィールドをリセット
  document.getElementById("new-link-text").value = ""; // リンクテキストをクリア
  document.getElementById("new-link-url").value = ""; // リンクURLをクリア

  // 現在のリンクを表示
  (linksData[sectionId] || []).forEach((link, index) => {
    const listItem = document.createElement("li");
    listItem.draggable = true;
    listItem.dataset.index = index;
    listItem.innerHTML = `
      <div class="drag-handle">⋮⋮</div>
      <div class="link-content">
        <span class="link-text">${link.text}</span>
        <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
      </div>
      <button onclick="removeLink(${index})">削除</button>
    `;
    
    // ドラッグイベントリスナーを追加
    listItem.addEventListener('dragstart', handleDragStart);
    listItem.addEventListener('dragover', handleDragOver);
    listItem.addEventListener('drop', handleDrop);
    listItem.addEventListener('dragend', handleDragEnd);
    
    modalLinkList.appendChild(listItem);
  });

  document.getElementById("modal").style.display = "flex";
}


// モーダルを閉じる
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// リンクを追加
function addLink() {
  const text = document.getElementById("new-link-text").value;
  const url = document.getElementById("new-link-url").value;

  if (!text || !url) {
    alert("リンクテキストとURLを入力してください！");
    return;
  }

  // 現在のセクションにリンクを追加
  if (!linksData[currentSectionId]) {
    linksData[currentSectionId] = [];
  }
  linksData[currentSectionId].push({ text, url });

  // ローカルストレージに保存
  saveLinks();
  renderLinks(); // セクションを再描画
  editLinks(currentSectionId); // モーダル内のリストも更新
}


// ローカルストレージにリンクデータを保存
function saveLinks() {
  localStorage.setItem(pageKey, JSON.stringify(linksData));
}

// ページロード時にリンクデータを読み込む
window.onload = function () {
  // セクション名の読み込み
  const storedSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");
  for (const [sectionId, name] of Object.entries(storedSectionNames)) {
    const title = document.querySelector(`#${sectionId} h2`);
    if (title) {
      title.textContent = name;
    }
  }

  // リンクデータの読み込み
  const storedLinks = localStorage.getItem(pageKey);
  if (storedLinks) {
    linksData = JSON.parse(storedLinks);
  }

  // リンクのレンダリング
  renderLinks();
};


// ローカルストレージ設定 ------------------------------------------------------------

// ローカルストレージにデータを保存操作 -----------------------------------------------
// エクスポート機能: ローカルストレージのデータをJSONとしてダウンロード
function exportData() {
  const data = { ...localStorage }; // ローカルストレージのすべてのデータを取得
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); // JSON形式でBlob作成
  const url = URL.createObjectURL(blob);

  // ダウンロード用リンクを生成してクリック
  const a = document.createElement("a");
  a.href = url;
  a.download = "mypage_data.json";
  a.click();

  URL.revokeObjectURL(url); // URLを解放
}

// インポート機能: JSONファイルをローカルストレージに適用
function importData(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("ファイルを選択してください！");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    try {
      const importedData = JSON.parse(reader.result);
      if (typeof importedData !== "object") {
        throw new Error("データ形式が正しくありません！");
      }

      // ローカルストレージにデータを保存
      Object.keys(importedData).forEach((key) => {
        localStorage.setItem(key, importedData[key]);
      });

      alert("データをインポートしました。ページをリロードします！");
      location.reload(); // ページをリロードしてデータを反映
    } catch (error) {
      alert("インポートに失敗しました。正しい形式のJSONファイルを選択してください！");
    }
  };
  reader.readAsText(file); // ファイルをテキストとして読み込む
}

// ローカルストレージにデータを保存操作 -----------------------------------------------

//セクション名の編集と保存機能を追加 --------------------------------------------------
// セクション名を編集モードに切り替える
function editSectionName(sectionId) {
  const title = document.querySelector(`#${sectionId} h2`);
  const input = document.querySelector(`#${sectionId}-input`);

  // 要素が存在しない場合はエラーを出力して処理を中断
  if (!title || !input) {
    console.error(`セクションID ${sectionId} のタイトルまたは入力フィールドが見つかりません`);
    return;
  }

  // 現在のセクション名を入力フィールドに設定
  input.value = title.textContent;

  // セクション名を隠して入力フィールドを表示
  title.style.display = "none";
  input.style.display = "block";
  input.focus();
}



// セクション名を保存して通常モードに戻す
function saveSectionName(sectionId) {
  const title = document.querySelector(`#${sectionId} h2`);
  const input = document.querySelector(`#${sectionId}-input`);

  // 要素が存在しない場合はエラーを出力して処理を中断
  if (!title || !input) {
    console.error(`セクションID ${sectionId} のタイトルまたは入力フィールドが見つかりません`);
    return;
  }

  // 入力された値をセクション名に設定
  if (input.value.trim() !== "") {
    title.textContent = input.value.trim();
  }

  // 入力フィールドを隠してセクション名を表示
  input.style.display = "none";
  title.style.display = "block";

  // ローカルストレージに保存
  saveSectionNamesToStorage();
}



// ローカルストレージにセクション名を保存
function saveSectionNamesToStorage() {
  const sectionNames = {};
  document.querySelectorAll(".section").forEach((section) => {
    const sectionId = section.id;
    const title = section.querySelector("h2").textContent;
    sectionNames[sectionId] = title;
  });
  localStorage.setItem(sectionNamesKey, JSON.stringify(sectionNames));
}

//セクション名の編集と保存機能を追加 --------------------------------------------------

// ドラッグ&ドロップ機能 --------------------------------------------------
let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
  draggedElement = this;
  draggedIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  // ドロップターゲットのハイライト
  const targetElement = e.currentTarget;
  if (targetElement !== draggedElement) {
    targetElement.classList.add('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const targetElement = e.currentTarget;
  const targetIndex = parseInt(targetElement.dataset.index);
  
  if (draggedElement && draggedIndex !== null && draggedIndex !== targetIndex) {
    // リンクデータの順番を変更
    const draggedLink = linksData[currentSectionId][draggedIndex];
    linksData[currentSectionId].splice(draggedIndex, 1);
    linksData[currentSectionId].splice(targetIndex, 0, draggedLink);
    
    // ローカルストレージに保存
    saveLinks();
    
    // 表示を更新
    renderLinks();
    editLinks(currentSectionId);
  }
  
  // クリーンアップ
  targetElement.classList.remove('drag-over');
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // すべてのドラッグオーバーのハイライトを削除
  document.querySelectorAll('#modal-link-list li').forEach(item => {
    item.classList.remove('drag-over');
  });
  
  draggedElement = null;
  draggedIndex = null;
}

// ドラッグ&ドロップ機能 --------------------------------------------------