let currentSectionId = "";

function editLinks(sectionId) {
  currentSectionId = sectionId;
  const linkList = document.querySelector(`#${sectionId} .link-list`);
  const modalLinkList = document.getElementById("modal-link-list");
  modalLinkList.innerHTML = "";

  linkList.querySelectorAll("li").forEach((li, index) => {
    const text = li.querySelector("a").textContent;
    const url = li.querySelector("a").href;
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${text} - <a href="${url}" target="_blank">${url}</a>
      <button onclick="removeLink(${index})">削除</button>
    `;
    modalLinkList.appendChild(listItem);
  });

  document.getElementById("modal").style.display = "flex";
}

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
  const linkList = document.querySelector(`#${currentSectionId} .link-list`);
  linkList.removeChild(linkList.children[index]);
  editLinks(currentSectionId);
}


// ローカルストレージ設定 ------------------------------------------------------------

// ページごとのキーを生成（ページタイトルやURLを利用）
const pageKey = `sectionLinks_${document.title.replace(/\s+/g, "_")}`;
const sectionNamesKey = `sectionNames_${document.title.replace(/\s+/g, "_")}`;
let linksData = {};

// ページロード時にリンクを読み込む
window.onload = function () {
  const storedLinks = localStorage.getItem(pageKey);
  if (storedLinks) {
    linksData = JSON.parse(storedLinks); // ローカルストレージからデータを取得
  }
  renderLinks(); // 各セクションにリンクを反映
};

// 各セクションのリンクを描画
function renderLinks() {
  for (const [sectionId, links] of Object.entries(linksData)) {
    const linkList = document.querySelector(`#${sectionId} .link-list`);
    linkList.innerHTML = ""; // 既存のリンクをクリア
    links.forEach(({ text, url }) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="${url}" target="_blank">${text}</a>`;
      linkList.appendChild(listItem);
    });
  }
}

// リンクを編集するためのモーダルを表示
function editLinks(sectionId) {
  currentSectionId = sectionId;
  const modalLinkList = document.getElementById("modal-link-list");
  modalLinkList.innerHTML = ""; // モーダル内のリンクリストをクリア

  // 現在のリンクを表示
  (linksData[sectionId] || []).forEach((link, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${link.text} - <a href="${link.url}" target="_blank">${link.url}</a>
      <button onclick="removeLink(${index})">削除</button>
    `;
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

  // 現在のセクションのリンクデータを更新
  if (!linksData[currentSectionId]) {
    linksData[currentSectionId] = [];
  }
  linksData[currentSectionId].push({ text, url });

  saveLinks(); // リンクデータを保存
  editLinks(currentSectionId); // モーダル内を再描画
  renderLinks(); // 各セクションを再描画
  document.getElementById("new-link-text").value = "";
  document.getElementById("new-link-url").value = "";
}

// リンクを削除
function removeLink(index) {
  linksData[currentSectionId].splice(index, 1); // 指定したリンクを削除
  saveLinks(); // リンクデータを保存
  editLinks(currentSectionId); // モーダル内を再描画
  renderLinks(); // 各セクションを再描画
}

// リンクデータをローカルストレージに保存
function saveLinks() {
  localStorage.setItem(pageKey, JSON.stringify(linksData));
}

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

// ページロード時にセクション名を読み込む
window.onload = function () {
  const storedSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");
  for (const [sectionId, name] of Object.entries(storedSectionNames)) {
    const title = document.querySelector(`#${sectionId} h2`);
    if (title) {
      title.textContent = name;
    }
  }

  // 既存のリンクデータを読み込む
  const storedLinks = localStorage.getItem(pageKey);
  if (storedLinks) {
    linksData = JSON.parse(storedLinks);
  }
  renderLinks();
};


//セクション名の編集と保存機能を追加 --------------------------------------------------