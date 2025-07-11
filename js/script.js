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
const mainTitleKey = `mainTitle_${window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_")}`;
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
  
  // 初期状態でプロジェクトが空の場合のメッセージ表示
  if (projects.length === 0) {
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
  localStorage.setItem(projectsKey, JSON.stringify(projects));
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
  } else {
    // プロジェクトビューを表示
    showProjectView(viewId);
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
}

// プロジェクトビューの作成
function createProjectView(project) {
  const view = document.createElement('div');
  view.id = `${project.id}-view`;
  view.className = 'view';
  
  view.innerHTML = `
    <div class="section-grid">
      ${[1,2,3,4,5,6].map(i => `
        <div class="section" id="${project.id}-section${i}">
          <div class="section-title">
            <h2 onclick="editSectionName('${project.id}-section${i}')">セクション${i}</h2>
            <input type="text" id="${project.id}-section${i}-input" class="section-name-input" onblur="saveSectionName('${project.id}-section${i}')" />
          </div>
          <ul class="link-list">
            <li><a href="https://example${i}.com" target="_blank">リンク${i}-1</a></li>
            <li><a href="https://example${i}.com" target="_blank">リンク${i}-2</a></li>
          </ul>
          <button class="edit-button" onclick="editLinks('${project.id}-section${i}')">リンクを編集</button>
        </div>
      `).join('')}
    </div>
  `;
  
  return view;
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
  
  const id = `project-${Date.now()}`;
  const newProject = { id, name, sections: [] };
  
  projects.push(newProject);
  saveProjects();
  updateProjectNavigation();
  
  // 最初のプロジェクトが追加された場合、ウェルカムメッセージを隠す
  if (projects.length === 1) {
    hideWelcomeMessage();
  }
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
  
  // 全てのプロジェクトが削除された場合、ウェルカムメッセージを表示
  if (projects.length === 0) {
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
      <p>まだプロジェクトがありません。<br>
      右下の「ページ追加」ボタンから新しいプロジェクトを作成してみましょう。</p>
      <div class="welcome-features">
        <h3>✨ 主な機能</h3>
        <ul>
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