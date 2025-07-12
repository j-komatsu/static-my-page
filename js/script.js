let currentSectionId = "";
let currentEditingIndex = -1;
let favoriteSections = JSON.parse(localStorage.getItem('favoriteSections')) || [];

// ヘッダーリンクのデータ管理
const headerLinksKey = 'headerLinks_global';
let headerLinksData = JSON.parse(localStorage.getItem(headerLinksKey)) || [
  { text: 'Google', url: 'https://www.google.co.jp/' },
  { text: 'Claude', url: 'https://claude.ai/' }
];

// お気に入りセクション機能
function toggleSectionFavorite(sectionId) {
  const index = favoriteSections.indexOf(sectionId);
  const button = document.querySelector(`#${sectionId} .favorite-btn`);
  
  if (index === -1) {
    // お気に入りに追加
    favoriteSections.push(sectionId);
    button.classList.add('active');
    button.textContent = '⭐';
  } else {
    // お気に入りから削除
    favoriteSections.splice(index, 1);
    button.classList.remove('active');
    button.textContent = '☆';
  }
  
  localStorage.setItem('favoriteSections', JSON.stringify(favoriteSections));
  updateSectionOrder();
}

// お気に入りに基づいてセクション順序を更新
function updateSectionOrder() {
  const sectionGrid = document.querySelector('.section-grid');
  const sections = Array.from(sectionGrid.children);
  
  // お気に入りセクションとそれ以外に分ける
  const favoriteSectionElements = [];
  const otherSectionElements = [];
  
  sections.forEach(section => {
    if (favoriteSections.includes(section.id)) {
      favoriteSectionElements.push(section);
    } else {
      otherSectionElements.push(section);
    }
  });
  
  // グリッドをクリアして、お気に入り → その他の順で再配置
  sectionGrid.innerHTML = '';
  [...favoriteSectionElements, ...otherSectionElements].forEach(section => {
    sectionGrid.appendChild(section);
  });
}

// ページ読み込み時にお気に入り状態を復元
function restoreFavoriteStates() {
  favoriteSections.forEach(sectionId => {
    const button = document.querySelector(`#${sectionId} .favorite-btn`);
    if (button) {
      button.classList.add('active');
      button.textContent = '⭐';
    }
  });
  updateSectionOrder();
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
const sectionSubtitlesKey = `sectionSubtitles_${document.title.replace(/\s+/g, "_")}`;
const mainTitleKey = `mainTitle_${window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_")}`;
let linksData = {};


// 各セクションのリンクを描画
function renderLinks() {
  console.log('Current linksData:', linksData);
  for (const [sectionId, links] of Object.entries(linksData)) {
    const linkGrid = document.querySelector(`#${sectionId} .link-grid`);
    const linkList = document.querySelector(`#${sectionId} .link-list`);

    // 新しいカードスタイルのセクションの場合
    if (linkGrid) {
      linkGrid.innerHTML = ""; // 既存のリンクを削除
      links.forEach((link, index) => {
        // 既存のリンクデータの安全な取得
        const text = link.text || '';
        const url = link.url || '';
        const inline = link.inline || false;
        
        const linkCard = document.createElement("div");
        linkCard.className = `link-card${inline ? ' inline' : ''}`;
        
        // リンク要素を作成
        const linkElement = document.createElement("a");
        linkElement.href = url;
        linkElement.target = "_blank";
        linkElement.className = "link-card-content";
        linkElement.innerHTML = `
          <div class="link-info">
            <div class="link-title">${text}</div>
          </div>
        `;
        
        // カードにリンクを追加
        linkCard.appendChild(linkElement);
        
        linkGrid.appendChild(linkCard);
      });
    }
    // 従来のリストスタイルのセクションの場合
    else if (linkList) {
      linkList.innerHTML = ""; // 既存のリンクを削除
      links.forEach(({ text, url }) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${url}" target="_blank">${text}</a>`;
        linkList.appendChild(listItem);
      });
    }
  }
}

// サブタイトル編集機能
function editSectionSubtitle(sectionId) {
  const subtitleElement = document.querySelector(`#${sectionId} .section-subtitle`);
  const inputElement = document.getElementById(`${sectionId}-subtitle-input`);
  
  if (subtitleElement && inputElement) {
    // 現在のテキストを入力フィールドに設定
    inputElement.value = subtitleElement.textContent;
    
    // 表示を切り替え
    subtitleElement.style.display = 'none';
    inputElement.style.display = 'block';
    inputElement.focus();
    inputElement.select();
  }
}

function saveSectionSubtitle(sectionId) {
  const subtitleElement = document.querySelector(`#${sectionId} .section-subtitle`);
  const inputElement = document.getElementById(`${sectionId}-subtitle-input`);
  
  if (subtitleElement && inputElement) {
    const newSubtitle = inputElement.value.trim();
    
    if (newSubtitle !== '') {
      // 新しいサブタイトルを保存
      subtitleElement.textContent = newSubtitle;
      
      // ローカルストレージに保存
      const storedSubtitles = JSON.parse(localStorage.getItem(sectionSubtitlesKey) || '{}');
      storedSubtitles[sectionId] = newSubtitle;
      localStorage.setItem(sectionSubtitlesKey, JSON.stringify(storedSubtitles));
    }
    
    // 表示を元に戻す
    inputElement.style.display = 'none';
    subtitleElement.style.display = 'block';
  }
}

// 個別のリンクを編集
function editLinkItem(sectionId, index) {
  console.log('editLinkItem called:', sectionId, index);
  currentSectionId = sectionId;
  currentEditingIndex = index;
  
  const links = linksData[sectionId] || [];
  const link = links[index];
  
  console.log('Link data:', link);
  
  if (link) {
    // 編集中のリンクカードをハイライト
    highlightEditingLink(sectionId, index);
    
    // 単一編集モードでモーダルを開く
    openSingleEditMode(link, sectionId);
  } else {
    console.error('Link not found:', sectionId, index);
  }
}

// 単一編集モードでモーダルを開く
function openSingleEditMode(link, sectionId) {
  // モーダルタイトルを変更
  document.getElementById('modal-title').textContent = 'リンクの編集';
  
  // 単一編集モードを表示、一覧モードを非表示
  document.getElementById('single-edit-mode').style.display = 'block';
  document.getElementById('list-edit-mode').style.display = 'none';
  
  // セクション名を取得
  const sectionName = document.querySelector(`#${sectionId} .section-title-text`)?.textContent || sectionId;
  
  // 現在のリンク情報を表示
  const currentDetails = document.getElementById('current-link-details');
  if (currentDetails) {
    currentDetails.innerHTML = `
      <div><strong>セクション:</strong> ${sectionName}</div>
      <div><strong>現在のテキスト:</strong> ${link.text || 'テキストなし'}</div>
      <div><strong>現在のURL:</strong> ${link.url || 'URLなし'}</div>
      <div><strong>表示形式:</strong> ${link.inline ? '1行表示' : '通常表示'}</div>
    `;
  }
  
  // フォームに現在の値を設定
  document.getElementById('edit-link-text').value = link.text || '';
  document.getElementById('edit-link-url').value = link.url || '';
  document.getElementById('edit-link-inline').checked = link.inline || false;
  
  // モーダルを表示
  document.getElementById('modal').style.display = 'flex';
}

// 編集した内容を保存
function saveEditedLink() {
  const text = document.getElementById('edit-link-text').value.trim();
  const url = document.getElementById('edit-link-url').value.trim();
  const inline = document.getElementById('edit-link-inline').checked;
  
  if (!text || !url) {
    alert('リンクテキストとURLを入力してください。');
    return;
  }
  
  if (!linksData[currentSectionId]) {
    linksData[currentSectionId] = [];
  }
  
  // リンクデータを更新
  linksData[currentSectionId][currentEditingIndex] = { text, url, inline };
  
  // データを保存して表示を更新
  saveLinks();
  renderLinks();
  
  // モーダルを閉じる
  closeModal();
}

// 単一編集をキャンセル
function cancelSingleEdit() {
  closeModal();
}

// 編集中のリンクをハイライト
function highlightEditingLink(sectionId, index) {
  // 全てのediting状態をクリア
  document.querySelectorAll('.link-card.editing').forEach(card => {
    card.classList.remove('editing');
  });
  
  // 編集対象をハイライト
  const linkGrid = document.querySelector(`#${sectionId} .link-grid`);
  if (linkGrid) {
    const linkCards = linkGrid.querySelectorAll('.link-card');
    if (linkCards[index]) {
      linkCards[index].classList.add('editing');
      
      // スクロールして見えるようにする
      linkCards[index].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }
}


// 個別のリンクを削除
function removeLinkItem(sectionId, index) {
  if (!linksData[sectionId]) return;
  
  if (confirm('このリンクを削除しますか？')) {
    linksData[sectionId].splice(index, 1);
    saveLinks();
    renderLinks();
  }
}


// 編集モードをキャンセル（一覧モード用）
function cancelEdit() {
  // フォームをクリア
  document.getElementById('new-link-text').value = '';
  document.getElementById('new-link-url').value = '';
  document.getElementById('new-link-inline').checked = false;
}

// リンクを編集するためのモーダルを表示（一覧モード）
function editLinks(sectionId) {
  currentSectionId = sectionId;
  currentEditingIndex = -1; // 一覧モードでは編集インデックスをリセット
  
  // モーダルタイトルを変更
  document.getElementById('modal-title').textContent = 'リンクの管理';
  
  // 一覧編集モードを表示、単一編集モードを非表示
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'block';
  
  const modalLinkList = document.getElementById("modal-link-list");
  modalLinkList.innerHTML = ""; // モーダル内のリンクリストをクリア

  // 入力フィールドをリセット
  document.getElementById("new-link-text").value = ""; // リンクテキストをクリア
  document.getElementById("new-link-url").value = ""; // リンクURLをクリア
  document.getElementById("new-link-inline").checked = false;

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
        ${link.inline ? '<span class="inline-badge">1行表示</span>' : ''}
      </div>
      <div class="link-item-actions">
        <button onclick="editLinkFromModal('${sectionId}', ${index})">編集</button>
        <button onclick="removeLink(${index})">削除</button>
      </div>
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

// モーダルからリンクを編集
function editLinkFromModal(sectionId, index) {
  editLinkItem(sectionId, index);
}


// モーダルを閉じる
function closeModal() {
  document.getElementById("modal").style.display = "none";
  
  // 全ての編集状態をリセット
  currentEditingIndex = -1;
  
  // ハイライトを削除
  document.querySelectorAll('.link-card.editing').forEach(card => {
    card.classList.remove('editing');
  });
  
  // モーダルの表示状態をリセット
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'block';
}

// リンクを追加
function addLink() {
  const text = document.getElementById("new-link-text").value.trim();
  const url = document.getElementById("new-link-url").value.trim();
  const inline = document.getElementById("new-link-inline").checked;

  if (!text || !url) {
    alert("リンクテキストとURLを入力してください！");
    return;
  }

  // 現在のセクションにリンクを追加
  if (!linksData[currentSectionId]) {
    linksData[currentSectionId] = [];
  }
  linksData[currentSectionId].push({ text, url, inline });

  // ローカルストレージに保存
  saveLinks();
  renderLinks(); // セクションを再描画
  editLinks(currentSectionId); // モーダル内のリストも更新
  
  // フォームをクリア
  document.getElementById("new-link-text").value = '';
  document.getElementById("new-link-url").value = '';
  document.getElementById("new-link-inline").checked = false;
}


// ローカルストレージにリンクデータを保存
function saveLinks() {
  try {
    localStorage.setItem(pageKey, JSON.stringify(linksData));
  } catch (error) {
    console.error('リンクデータの保存に失敗しました:', error);
    alert('データの保存に失敗しました。ストレージの容量が不足している可能性があります。');
  }
}

// ページロード時にリンクデータを読み込む
window.onload = function () {
  // プロジェクトデータの読み込み
  loadProjects();
  
  // プロジェクトナビゲーションの更新
  updateProjectNavigation();
  
  // メインタイトルの読み込み
  const storedMainTitle = localStorage.getItem(mainTitleKey);
  if (storedMainTitle) {
    document.getElementById("main-title").textContent = storedMainTitle;
    document.title = storedMainTitle;
  }
  
  // お気に入り状態の復元
  restoreFavoriteStates();
  
  // ヘッダーリンクの表示
  renderHeaderLinks();

  // セクション名の読み込み
  const storedSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");
  for (const [sectionId, name] of Object.entries(storedSectionNames)) {
    const title = document.querySelector(`#${sectionId} h2`);
    if (title) {
      title.textContent = name;
    }
  }
  
  // サブタイトルの読み込み
  const storedSubtitles = JSON.parse(localStorage.getItem(sectionSubtitlesKey) || "{}");
  for (const [sectionId, subtitle] of Object.entries(storedSubtitles)) {
    const subtitleElement = document.querySelector(`#${sectionId} .section-subtitle`);
    if (subtitleElement) {
      subtitleElement.textContent = subtitle;
    }
  }

  // リンクデータの読み込み
  const storedLinks = localStorage.getItem(pageKey);
  if (storedLinks) {
    linksData = JSON.parse(storedLinks);
  }

  // リンクのレンダリング
  renderLinks();
  
  // URLハッシュに基づいてビューを切り替え
  const hash = window.location.hash.substring(1);
  if (hash && hash !== 'main') {
    // プロジェクトが存在する場合のみ切り替え
    const projectExists = projects.some(p => p.id === hash);
    if (projectExists) {
      switchView(hash);
    } else {
      switchView('main');
    }
  } else {
    switchView('main');
  }
  
  // MyPageタブのクリックイベントを設定
  const mainTab = document.querySelector('a[data-view="main"]');
  if (mainTab) {
    mainTab.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('main');
    });
  }
  
  // 初期状態でプロジェクトが空かつMyPageが開始されていない場合のメッセージ表示
  const myPageStarted = localStorage.getItem(myPageStartedKey) === 'true';
  if (projects.length === 0 && !myPageStarted) {
    showWelcomeMessage();
  }
};

// ページロード時にナビゲーションリンクのテキストを更新
function updateNavigationLinksOnLoad() {
  const navLinksKey = `navTitles_global`;
  const storedNavTitles = JSON.parse(localStorage.getItem(navLinksKey) || "{}");
  
  // 各ページのタイトルを取得してナビゲーションリンクを更新
  const linkMappings = [
    { pageId: "project-a", linkSelector: 'a[href="project-a.html"]' },
    { pageId: "project-b", linkSelector: 'a[href="project-b.html"]' },
    { pageId: "project-c", linkSelector: 'a[href="project-c.html"]' },
    { pageId: "project-d", linkSelector: 'a[href="project-d.html"]' }
  ];
  
  linkMappings.forEach(mapping => {
    const link = document.querySelector(mapping.linkSelector);
    if (link && storedNavTitles[mapping.pageId]) {
      link.textContent = storedNavTitles[mapping.pageId];
    }
  });
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

//セクション名の編集と保存機能を追加 --------------------------------------------------

// メインタイトルの編集機能 --------------------------------------------------

// メインタイトルの編集
function editMainTitle() {
  const title = document.getElementById("main-title");
  const input = document.getElementById("main-title-input");
  
  input.value = title.textContent;
  title.style.display = "none";
  input.style.display = "block";
  input.focus();
  input.select();
}

// メインタイトルの保存
function saveMainTitle() {
  const title = document.getElementById("main-title");
  const input = document.getElementById("main-title-input");
  
  if (input.value.trim() !== "") {
    const newTitle = input.value.trim();
    title.textContent = newTitle;
    
    // ローカルストレージに保存
    localStorage.setItem(mainTitleKey, newTitle);
    
    // ページのdocument.titleも更新
    document.title = newTitle;
    
    // 他のページのナビゲーションリンクも更新
    updateNavigationLinksInOtherPages(newTitle);
    
    // 現在のページのナビゲーションボタンも更新
    updateCurrentPageNavigationButton(newTitle);
  }
  
  input.style.display = "none";
  title.style.display = "block";
}

// 他のページのナビゲーションリンクのテキストを更新
function updateNavigationLinksInOtherPages(newTitle) {
  const currentPage = document.title;
  const pageMapping = {
    "My Page": "main",
    "プロジェクトA": "project-a", 
    "プロジェクトB": "project-b",
    "プロジェクトC": "project-c",
    "プロジェクトD": "project-d"
  };
  
  const currentPageId = pageMapping[currentPage];
  if (currentPageId) {
    const navLinksKey = `navTitles_global`;
    const storedNavTitles = JSON.parse(localStorage.getItem(navLinksKey) || "{}");
    storedNavTitles[currentPageId] = newTitle;
    localStorage.setItem(navLinksKey, JSON.stringify(storedNavTitles));
  }
}

// 現在のページのナビゲーションボタンを更新
function updateCurrentPageNavigationButton(newTitle) {
  // 現在のページのプロジェクトリンクを更新
  const currentHash = window.location.hash.substring(1);
  if (currentHash && currentHash !== 'main') {
    const currentProjectLink = document.querySelector(`a[href="#${currentHash}"]`);
    if (currentProjectLink) {
      currentProjectLink.textContent = newTitle;
    }
    
    // プロジェクトデータも更新
    const project = projects.find(p => p.id === currentHash);
    if (project) {
      project.name = newTitle;
      saveProjects();
    }
  }
}

// メインタイトルでのEnterキー処理
function handleMainTitleKeypress(event) {
  if (event.key === "Enter") {
    saveMainTitle();
  }
}

// SPA機能 - プロジェクト管理 --------------------------------------------------
const projectsKey = 'projects_data';
const myPageStartedKey = 'mypage_started';
let projects = [];

// プロジェクトデータの読み込み
function loadProjects() {
  const stored = localStorage.getItem(projectsKey);
  if (stored) {
    projects = JSON.parse(stored);
  }
}

// プロジェクトデータの保存
function saveProjects() {
  try {
    localStorage.setItem(projectsKey, JSON.stringify(projects));
  } catch (error) {
    console.error('プロジェクトデータの保存に失敗しました:', error);
    alert('データの保存に失敗しました。ストレージの容量が不足している可能性があります。');
  }
}

// プロジェクトナビゲーションの更新
function updateProjectNavigation() {
  const projectLinks = document.getElementById('project-links');
  projectLinks.innerHTML = '';
  
  projects.forEach(project => {
    const link = document.createElement('a');
    link.href = `#${project.id}`;
    link.className = 'navigation-link nav-tab';
    link.setAttribute('data-view', project.id);
    link.textContent = project.name;
    link.addEventListener('contextmenu', (e) => showDeleteMenu(e, project.id));
    projectLinks.appendChild(link);
  });
  
  // タブクリックイベントを追加
  addTabClickEvents();
}

// タブクリックイベントの追加
function addTabClickEvents() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      switchView(view);
      updateActiveTab(e.target);
    });
  });
}

// ビュー切り替え機能
function switchView(viewId) {
  // 全てのビューを非表示
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  if (viewId === 'main') {
    document.getElementById('main-view').classList.add('active');
    updateMainTitle('My Page');
    // MyPageタブをアクティブにする
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    const mainTab = document.querySelector('a[data-view="main"]');
    if (mainTab) {
      mainTab.classList.add('active');
    }
  } else {
    // プロジェクトビューを表示
    showProjectView(viewId);
    // 対応するタブをアクティブにする
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`a[href="#${viewId}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
  
  // URLハッシュを更新
  window.location.hash = viewId;
}

// プロジェクトビューの表示
function showProjectView(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  let projectView = document.getElementById(`${projectId}-view`);
  if (!projectView) {
    projectView = createProjectView(project);
    document.getElementById('project-views').appendChild(projectView);
  }
  
  projectView.classList.add('active');
  updateMainTitle(project.name);
  
  // リンクを再描画してアクションボタンが正しく表示されるようにする
  renderLinks();
  
  // お気に入り状態を復元
  restoreFavoriteStates();
}

// プロジェクトビューの作成
function createProjectView(project) {
  const view = document.createElement('div');
  view.id = `${project.id}-view`;
  view.className = 'view';
  
  // カテゴリ配列（セクションごとに異なるカテゴリを割り当て）
  const categories = ['work', 'social', 'dev', 'entertainment', 'news', 'shopping'];
  const categoryNames = ['作業関連のリンク', 'ソーシャル・コミュニケーション', '開発・技術関連', 'エンターテイメント', 'ニュース・情報収集', 'ショッピング・サービス'];
  
  view.innerHTML = `
    <div class="section-grid">
      ${[1,2,3,4,5,6].map(i => `
        <div class="section enhanced-section" id="${project.id}-section${i}" data-category="${categories[i-1]}">
          <div class="section-header">
            <div class="section-title-area">
              <h2 onclick="editSectionName('${project.id}-section${i}')" class="section-title-text">セクション${i}</h2>
              <input type="text" id="${project.id}-section${i}-input" class="section-name-input" onblur="saveSectionName('${project.id}-section${i}')" />
            </div>
            <div class="section-actions">
              <button class="action-btn favorite-btn" onclick="toggleSectionFavorite('${project.id}-section${i}')" title="お気に入り">⭐</button>
              <button class="action-btn edit-btn" onclick="editLinks('${project.id}-section${i}')" title="編集">✏️</button>
            </div>
          </div>
          <div class="link-grid">
            <!-- リンクはrenderLinks()によって動的に生成される -->
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // 新しいプロジェクトのサンプルリンクデータを初期化
  initializeProjectLinks(project.id, categories, categoryNames);
  
  return view;
}

// プロジェクトのサンプルリンクデータを初期化
function initializeProjectLinks(projectId, categories, categoryNames) {
  for (let i = 1; i <= 6; i++) {
    const sectionId = `${projectId}-section${i}`;
    
    // 既にデータが存在する場合はスキップ
    if (linksData[sectionId] && linksData[sectionId].length > 0) {
      continue;
    }
    
    // サンプルリンクデータを作成
    linksData[sectionId] = [
      {
        text: `サンプルリンク${i}-1`,
        url: `https://example${i}.com`,
        inline: false
      },
      {
        text: `サンプルリンク${i}-2`,
        url: `https://example${i}.com`,
        inline: false
      }
    ];
  }
  
  // データを保存
  saveLinks();
}

// アクティブタブの更新
function updateActiveTab(activeTab) {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  activeTab.classList.add('active');
}

// メインタイトルの更新
function updateMainTitle(title) {
  const titleElement = document.getElementById('main-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
}

// 新しいプロジェクトの追加
function addNewProject() {
  const name = prompt('プロジェクト名を入力してください:');
  if (!name) return;
  
  // 入力値の検証
  const trimmedName = name.trim();
  if (!trimmedName) {
    alert('プロジェクト名は空にできません。');
    return;
  }
  
  if (trimmedName.length > 50) {
    alert('プロジェクト名は50文字以内で入力してください。');
    return;
  }
  
  // 重複チェック
  if (projects.some(p => p.name === trimmedName)) {
    alert('同じ名前のプロジェクトが既に存在します。');
    return;
  }
  
  const id = `project-${Date.now()}`;
  const newProject = { id, name: trimmedName, sections: [] };
  
  projects.push(newProject);
  saveProjects();
  updateProjectNavigation();
  
  // 最初のプロジェクトが追加された場合、ウェルカムメッセージを隠す
  if (projects.length === 1) {
    hideWelcomeMessage();
    // プロジェクト作成時もMyPage開始フラグを設定
    localStorage.setItem(myPageStartedKey, 'true');
  }
  
  // 作成したプロジェクトを選択状態にする
  switchView(id);
}

// フッターからのページ削除ダイアログ
function showDeleteProjectDialog() {
  if (projects.length === 0) {
    alert('削除可能なページがありません。');
    return;
  }
  
  // モーダルを作成してプルダウン選択で削除対象を選択
  createDeleteProjectModal();
}

// プロジェクト削除用モーダルの作成
function createDeleteProjectModal() {
  // 既存のモーダルがあれば削除
  const existingModal = document.getElementById('delete-project-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // モーダル要素を作成
  const modal = document.createElement('div');
  modal.id = 'delete-project-modal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <h3>ページ削除</h3>
      <div class="delete-form">
        <label for="project-select">削除するページを選択してください:</label>
        <select id="project-select" class="project-select">
          <option value="">選択してください...</option>
          ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="modal-buttons">
        <button id="delete-confirm-btn" onclick="confirmDeleteProject()" disabled>削除</button>
        <button onclick="closeDeleteProjectModal()">キャンセル</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  
  // プルダウン選択時のイベントリスナー
  const selectElement = document.getElementById('project-select');
  const deleteButton = document.getElementById('delete-confirm-btn');
  
  selectElement.addEventListener('change', function() {
    deleteButton.disabled = !this.value;
  });
}

// プロジェクト削除の確認
function confirmDeleteProject() {
  const selectElement = document.getElementById('project-select');
  const selectedProjectId = selectElement.value;
  
  if (!selectedProjectId) {
    alert('削除するページを選択してください。');
    return;
  }
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  if (!selectedProject) {
    alert('選択されたページが見つかりません。');
    return;
  }
  
  if (confirm(`「${selectedProject.name}」を削除しますか？`)) {
    deleteProject(selectedProject.id);
    closeDeleteProjectModal();
  }
}

// プロジェクト削除モーダルを閉じる
function closeDeleteProjectModal() {
  const modal = document.getElementById('delete-project-modal');
  if (modal) {
    modal.remove();
  }
}

// ヘッダーリンク関連の関数
function renderHeaderLinks() {
  const container = document.getElementById('header-links-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 最大5個までのリンクを表示
  const linksToShow = headerLinksData.slice(0, 5);
  
  linksToShow.forEach(link => {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.target = '_blank';
    linkElement.className = 'header-link';
    linkElement.textContent = link.text;
    container.appendChild(linkElement);
  });
}

function saveHeaderLinks() {
  localStorage.setItem(headerLinksKey, JSON.stringify(headerLinksData));
}

function editHeaderLinks() {
  // モーダルのタイトルを変更
  document.getElementById('modal-title').textContent = 'ヘッダーリンクの編集';
  
  // 他のモードを非表示にして、ヘッダーリンク編集モードを表示
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'none';
  document.getElementById('header-links-edit-mode').style.display = 'block';
  
  // ヘッダーリンクのリストを描画
  renderHeaderLinksModal();
  
  // モーダルを表示
  document.getElementById('modal').style.display = 'flex';
}

function renderHeaderLinksModal() {
  const list = document.getElementById('modal-header-link-list');
  list.innerHTML = '';
  
  headerLinksData.forEach((link, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <div class="header-link-info">
        <div class="header-link-title">${link.text}</div>
        <div class="header-link-url">${link.url}</div>
      </div>
      <div class="link-actions">
        <button onclick="editHeaderLinkItem(${index})">編集</button>
        <button onclick="removeHeaderLink(${index})">削除</button>
      </div>
    `;
    list.appendChild(listItem);
  });
}

function addHeaderLink() {
  const textInput = document.getElementById('new-header-link-text');
  const urlInput = document.getElementById('new-header-link-url');
  
  const text = textInput.value.trim();
  const url = urlInput.value.trim();
  
  if (!text || !url) {
    alert('リンクテキストとURLを入力してください。');
    return;
  }
  
  // 最大5個まで
  if (headerLinksData.length >= 5) {
    alert('ヘッダーリンクは最大5個までです。');
    return;
  }
  
  headerLinksData.push({ text, url });
  saveHeaderLinks();
  renderHeaderLinks();
  renderHeaderLinksModal();
  
  // 入力フィールドをクリア
  textInput.value = '';
  urlInput.value = '';
}

function removeHeaderLink(index) {
  if (confirm('このリンクを削除しますか？')) {
    headerLinksData.splice(index, 1);
    saveHeaderLinks();
    renderHeaderLinks();
    renderHeaderLinksModal();
  }
}

function editHeaderLinkItem(index) {
  const link = headerLinksData[index];
  const newText = prompt('リンクテキストを入力してください:', link.text);
  if (newText === null) return;
  
  const newUrl = prompt('URLを入力してください:', link.url);
  if (newUrl === null) return;
  
  if (!newText.trim() || !newUrl.trim()) {
    alert('リンクテキストとURLを入力してください。');
    return;
  }
  
  headerLinksData[index] = { text: newText.trim(), url: newUrl.trim() };
  saveHeaderLinks();
  renderHeaderLinks();
  renderHeaderLinksModal();
}

function cancelHeaderEdit() {
  closeModal();
}

// プロジェクト削除メニューの表示
function showDeleteMenu(e, projectId) {
  e.preventDefault();
  
  if (confirm('このプロジェクトを削除しますか？')) {
    deleteProject(projectId);
  }
}

// プロジェクトの削除
function deleteProject(projectId) {
  projects = projects.filter(p => p.id !== projectId);
  saveProjects();
  updateProjectNavigation();
  
  // プロジェクトビューも削除
  const projectView = document.getElementById(`${projectId}-view`);
  if (projectView) {
    projectView.remove();
  }
  
  // メインビューに戻る
  switchView('main');
  
  // 全てのプロジェクトが削除された場合、MyPageが開始されていなければウェルカムメッセージを表示
  const myPageStarted = localStorage.getItem(myPageStartedKey) === 'true';
  if (projects.length === 0 && !myPageStarted) {
    showWelcomeMessage();
  }
}

// ウェルカムメッセージの表示
function showWelcomeMessage() {
  const mainView = document.getElementById('main-view');
  const welcomeDiv = document.createElement('div');
  welcomeDiv.id = 'welcome-message';
  welcomeDiv.className = 'welcome-message';
  welcomeDiv.innerHTML = `
    <div class="welcome-content">
      <h2>🎉 My Pageへようこそ！</h2>
      <p>パーソナルページ管理システムを始めましょう。<br>
      まずはMyPageでリンクを整理してみませんか？</p>
      
      <div class="welcome-actions">
        <button onclick="startMyPage()" class="start-mypage-btn">
          📄 MyPageを始める
        </button>
        <button onclick="addNewProject()" class="add-project-btn">
          📂 新しいプロジェクトを追加
        </button>
      </div>
      
      <div class="welcome-features">
        <h3>✨ 主な機能</h3>
        <ul>
          <li>📄 MyPage: メインのリンク管理ページ</li>
          <li>📂 プロジェクトページの追加・削除</li>
          <li>📝 セクションとリンクの管理</li>
          <li>🔄 ドラッグ&ドロップでリンクの並び替え</li>
          <li>💾 データの自動保存</li>
          <li>📤 エクスポート・インポート機能</li>
        </ul>
      </div>
    </div>
  `;
  
  // 既存のセクショングリッドを隠す
  const sectionGrid = mainView.querySelector('.section-grid');
  if (sectionGrid) {
    sectionGrid.style.display = 'none';
  }
  
  mainView.appendChild(welcomeDiv);
}

// ウェルカムメッセージを隠す
function hideWelcomeMessage() {
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }
  
  // セクショングリッドを表示
  const sectionGrid = document.querySelector('#main-view .section-grid');
  if (sectionGrid) {
    sectionGrid.style.display = 'grid';
  }
}

// MyPageを始める機能 --------------------------------------------------
function startMyPage() {
  // MyPage開始フラグを保存
  localStorage.setItem(myPageStartedKey, 'true');
  hideWelcomeMessage();
  // MyPageタブをアクティブにする
  switchView('main');
}

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