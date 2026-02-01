let currentSectionId = "";
let currentEditingIndex = -1;

// モバイルメニューの表示切替機能
function toggleMobileMenu() {
  const fixedGroup = document.querySelector('.fixed-buttons-group');
  const dynamicGroup = document.querySelector('.dynamic-buttons-group');
  
  if (fixedGroup && dynamicGroup) {
    fixedGroup.classList.toggle('show');
    dynamicGroup.classList.toggle('show');
  }
}

// ヘッダーリンクのデータ管理
const headerLinksKey = 'headerLinks_global';
let headerLinksData = JSON.parse(localStorage.getItem(headerLinksKey)) || [
  { text: 'Google', url: 'https://www.google.co.jp/' },
  { text: 'Claude', url: 'https://claude.ai/' }
];

// 初期データが空の場合は強制的にデフォルト値を設定
if (!headerLinksData || headerLinksData.length === 0) {
  headerLinksData = [
    { text: 'Google', url: 'https://www.google.co.jp/' },
    { text: 'Claude', url: 'https://claude.ai/' }
  ];
  localStorage.setItem(headerLinksKey, JSON.stringify(headerLinksData));
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


// レンダリング状態を管理
let renderingInProgress = false;

// 各セクションのリンクを描画
function renderLinks() {
  // 重複レンダリングを防止
  if (renderingInProgress) return;
  renderingInProgress = true;
  
  // 次のイベントループで実行してパフォーマンスを向上
  requestAnimationFrame(() => {
    try {
      renderLinksInternal();
    } finally {
      renderingInProgress = false;
    }
  });
}

function renderLinksInternal() {
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
        
        // ローカルファイルパスの場合はfile://プロトコルを付与
        let processedUrl = url;
        if (url.match(/^[A-Za-z]:\\/) || url.match(/^\\\\/) || url.match(/^\/[^\/]/)) {
          // Windows パス (C:\...) または UNC パス (\\...) または Unix パス (/...)
          processedUrl = `file:///${url.replace(/\\/g, '/')}`;
        }
        
        linkElement.href = processedUrl;
        linkElement.target = "_blank";
        linkElement.className = "link-card-content";
        // data-url 属性を設定（ファビコン読み込み用）
        linkCard.dataset.url = processedUrl;
        
        linkElement.innerHTML = `
          <div class="link-info">
            <div class="link-title">${text}</div>
          </div>
        `;
        
        // カードにリンクを追加
        linkCard.appendChild(linkElement);
        
        linkGrid.appendChild(linkCard);
        
        // ファビコンを読み込み（将来の機能として一時的に無効化）
        // setTimeout(() => {
        //   loadFavicon(linkCard);
        // }, 10);
      });
    }
    // 従来のリストスタイルのセクションの場合
    else if (linkList) {
      linkList.innerHTML = ""; // 既存のリンクを削除
      links.forEach(({ text, url }) => {
        // ローカルファイルパスの場合はfile://プロトコルを付与
        let processedUrl = url;
        if (url.match(/^[A-Za-z]:\\/) || url.match(/^\\\\/) || url.match(/^\/[^\/]/)) {
          // Windows パス (C:\...) または UNC パス (\\...) または Unix パス (/...)
          processedUrl = `file:///${url.replace(/\\/g, '/')}`;
        }
        
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${processedUrl}" target="_blank">${text}</a>`;
        linkList.appendChild(listItem);
      });
    }
  }
}

// デバウンス処理ユーティリティ
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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
  
  // 更新されたリンクのファビコンを読み込み
  setTimeout(() => {
    const updatedLinkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
    updatedLinkCards.forEach(card => {
      loadFavicon(card);
    });
  }, 50);
  
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
    
    // 削除後に残ったリンクのファビコンを読み込み
    setTimeout(() => {
      const remainingLinkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
      remainingLinkCards.forEach(card => {
        loadFavicon(card);
      });
    }, 50);
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
  
  // 一覧編集モードを表示、他のモードを非表示
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'block';
  document.getElementById('header-links-edit-mode').style.display = 'none';
  
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
    
    // リンク項目のドラッグ機能を追加
    listItem.addEventListener('dragstart', handleLinkDragStart);
    listItem.addEventListener('dragover', handleLinkDragOver);
    listItem.addEventListener('drop', handleLinkDrop);
    listItem.addEventListener('dragend', handleLinkDragEnd);
    listItem.addEventListener('dragenter', handleLinkDragEnter);
    listItem.addEventListener('dragleave', handleLinkDragLeave);
    
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
  
  // 新しく追加されたリンクのファビコンを読み込み
  setTimeout(() => {
    const newLinkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
    newLinkCards.forEach(card => {
      loadFavicon(card);
    });
  }, 50);
  
  // フォームをクリア
  document.getElementById("new-link-text").value = '';
  document.getElementById("new-link-url").value = '';
  document.getElementById("new-link-inline").checked = false;
}


// デバウンスされた保存関数
const debouncedSaveLinks = debounce(() => {
  saveLinksImmediate();
}, 300);

// ローカルストレージにリンクデータを保存
function saveLinks() {
  // デバウンス処理を使用して連続した保存操作を制限
  debouncedSaveLinks();
}

// 即座に保存する関数
function saveLinksImmediate() {
  try {
    if (window.storageManager) {
      window.storageManager.set(pageKey, {
        links: linksData,
        lastModified: Date.now()
      });
    } else {
      localStorage.setItem(pageKey, JSON.stringify(linksData));
    }
  } catch (error) {
    console.error('リンクデータの保存に失敗しました:', error);
    alert('データの保存に失敗しました。ストレージの容量が不足している可能性があります。');
  }
}

// 遅延ファビコン読み込み用の変数
let faviconObserver = null;
let loadedFavicons = new Set();

// Intersection Observer を使用したファビコン遅延読み込み
function initLazyFaviconLoading() {
  if (!('IntersectionObserver' in window)) {
    // フォールバック: Intersection Observer がサポートされていない場合は即座に読み込み
    loadAllFavicons();
    return;
  }

  faviconObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.faviconLoaded) {
        loadFavicon(entry.target);
        faviconObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '50px', // 50px 手前で読み込み開始
    threshold: 0.1
  });

  // 初期表示されているリンクカードを監視対象に追加
  observeVisibleLinkCards();
}

// 表示されているリンクカードを監視
function observeVisibleLinkCards() {
  const linkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
  linkCards.forEach(card => {
    if (faviconObserver) {
      faviconObserver.observe(card);
    }
  });
}

// 単一のファビコンを読み込み
function loadFavicon(linkCard) {
  const url = linkCard.dataset.url;
  console.log('Loading favicon for URL:', url);
  
  if (!url || loadedFavicons.has(url)) {
    console.log('Skipping favicon load:', !url ? 'no URL' : 'already loaded');
    return;
  }

  const faviconImg = linkCard.querySelector('.favicon');
  if (!faviconImg) {
    console.log('No favicon img element found');
    return;
  }

  try {
    const urlObj = new URL(url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=16`;
    console.log('Favicon URL:', faviconUrl);
    
    // プリロード用の image オブジェクトを作成
    const tempImg = new Image();
    tempImg.onload = () => {
      console.log('Favicon loaded successfully for:', urlObj.hostname);
      faviconImg.src = faviconUrl;
      linkCard.dataset.faviconLoaded = 'true';
      loadedFavicons.add(url);
    };
    tempImg.onerror = () => {
      console.log('Favicon failed to load for:', urlObj.hostname);
      // エラー時はデフォルトアイコンを設定
      faviconImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/><text x="8" y="12" text-anchor="middle" fill="%23666" font-size="10">🔗</text></svg>';
      linkCard.dataset.faviconLoaded = 'true';
    };
    tempImg.src = faviconUrl;
  } catch (error) {
    console.warn('Invalid URL for favicon:', url, error);
    // 無効なURLの場合はデフォルトアイコンを設定
    faviconImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/><text x="8" y="12" text-anchor="middle" fill="%23666" font-size="10">🔗</text></svg>';
    linkCard.dataset.faviconLoaded = 'true';
  }
}

// 全てのファビコンを即座に読み込み（フォールバック用）
function loadAllFavicons() {
  const linkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
  linkCards.forEach(loadFavicon);
}

// ページロード時にリンクデータを読み込む
window.onload = function () {
  try {
    // ポモドーロタイマーの初期化
    initializePomodoroTimer();

    // 通知の許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

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
    
    // ヘッダーリンクの初期化と表示
    if (!headerLinksData || headerLinksData.length === 0) {
      headerLinksData = [
        { text: 'Google', url: 'https://www.google.co.jp/' },
        { text: 'Claude', url: 'https://claude.ai/' }
      ];
      localStorage.setItem(headerLinksKey, JSON.stringify(headerLinksData));
    }
    renderHeaderLinks();

    // ナビゲーションボタンの描画
    renderNavigationButtons();

    // セクション名の読み込み
    const storedSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");
    for (const [sectionId, name] of Object.entries(storedSectionNames)) {
      const title = document.querySelector(`#${sectionId} h2`);
      if (title) {
        title.textContent = name;
      }
    }

    // リンクデータの読み込み
    if (window.storageManager) {
      const data = window.storageManager.get(pageKey);
      if (data) {
        linksData = data.links || data; // 新形式と旧形式の両方に対応
      }
    } else {
      const storedLinks = localStorage.getItem(pageKey);
      if (storedLinks) {
        linksData = JSON.parse(storedLinks);
      }
    }

    // リンクのレンダリング
    renderLinks();
    
    // ファビコン読み込みを初期化
    setTimeout(() => {
      // 既存のリンクカードのファビコンを読み込み
      const linkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
      linkCards.forEach(card => {
        loadFavicon(card);
      });
      
      // 遅延読み込み機能も初期化
      initLazyFaviconLoading();
    }, 200);
    
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
    console.log('MyPage started:', myPageStarted, 'Projects count:', projects.length);
    
    if (projects.length === 0 && !myPageStarted) {
      console.log('Showing welcome message');
      setTimeout(() => {
        showWelcomeMessage();
      }, 300);
    }
    
    // DOM完全構築後にドラッグ&ドロップ機能を初期化
    setTimeout(() => {
      console.log('Initializing drag and drop...');
      initializeDragAndDrop();
      restoreSectionOrder();
    }, 500);
    
  } catch (error) {
    console.error('Error during initialization:', error);
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

  // ローカルストレージに保存（既存データを保持）
  const existingSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");
  existingSectionNames[sectionId] = title.textContent;
  localStorage.setItem(sectionNamesKey, JSON.stringify(existingSectionNames));
}



// ローカルストレージにセクション名を保存
function saveSectionNamesToStorage() {
  // 既存のセクション名データを読み込み
  const sectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");

  // 現在表示されているセクションのデータで更新（.sectionと.enhanced-sectionの両方）
  document.querySelectorAll(".section, .enhanced-section").forEach((section) => {
    const sectionId = section.id;
    const title = section.querySelector("h2");
    if (title) {
      sectionNames[sectionId] = title.textContent;
    }
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

  projects.forEach((project, index) => {
    const link = document.createElement('a');
    link.href = `#${project.id}`;
    link.className = 'navigation-link nav-tab';
    link.setAttribute('data-view', project.id);
    link.setAttribute('data-project-index', index);
    link.textContent = project.name;
    link.draggable = true; // ドラッグ可能にする

    // ドラッグ開始イベント
    link.addEventListener('dragstart', handleTabDragStart);

    // ドラッグオーバーイベント
    link.addEventListener('dragover', handleTabDragOver);

    // ドロップイベント
    link.addEventListener('drop', handleTabDrop);

    // ドラッグ終了イベント
    link.addEventListener('dragend', handleTabDragEnd);

    link.addEventListener('contextmenu', (e) => showDeleteMenu(e, project.id));
    projectLinks.appendChild(link);
  });

  // タブクリックイベントを追加
  addTabClickEvents();
}

// プロジェクトタブのドラッグ&ドロップ関連の変数
let draggedTab = null;
let draggedTabIndex = null;

// プロジェクトタブのドラッグ開始
function handleTabDragStart(e) {
  const indexAttr = e.target.getAttribute('data-project-index');
  if (indexAttr === null) return; // data-project-indexがない場合は無視

  draggedTab = e.target;
  draggedTabIndex = parseInt(indexAttr);
  e.target.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}

// プロジェクトタブのドラッグオーバー
function handleTabDragOver(e) {
  const indexAttr = e.currentTarget.getAttribute('data-project-index');
  if (indexAttr === null) return; // data-project-indexがない場合は無視

  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';

  // ドラッグ中の要素にホバー効果を追加
  const target = e.currentTarget;
  if (target !== draggedTab && target.classList.contains('nav-tab')) {
    target.style.borderTop = '2px solid #007bff';
  }

  return false;
}

// プロジェクトタブのドロップ
function handleTabDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();

  const dropTarget = e.currentTarget;
  const dropIndexAttr = dropTarget.getAttribute('data-project-index');

  if (dropIndexAttr === null) {
    dropTarget.style.borderTop = '';
    return; // data-project-indexがない場合は無視
  }

  const dropIndex = parseInt(dropIndexAttr);

  // ドラッグ元とドロップ先が異なる場合のみ並び替え
  if (draggedTab !== dropTarget && draggedTabIndex !== null && draggedTabIndex !== dropIndex) {
    // プロジェクト配列を並び替え
    const draggedProject = projects[draggedTabIndex];
    projects.splice(draggedTabIndex, 1);
    projects.splice(dropIndex, 0, draggedProject);

    // localStorageに保存
    saveProjects();

    // ナビゲーションを更新
    updateProjectNavigation();
  }

  // ホバー効果を削除
  dropTarget.style.borderTop = '';

  return false;
}

// プロジェクトタブのドラッグ終了
function handleTabDragEnd(e) {
  e.target.style.opacity = '1';

  // すべてのホバー効果を削除
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.style.borderTop = '';
  });
}

// タブクリックイベントの追加
function addTabClickEvents() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      switchView(view);
    });
  });
}

// アクティブタブの更新
function updateActiveTab(activeTab) {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  if (activeTab) {
    activeTab.classList.add('active');
  }
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
    const activeTab = document.querySelector(`a[data-view="${viewId}"]`);
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
  
  // プロジェクトビューのファビコンを読み込み
  setTimeout(() => {
    const projectLinkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
    projectLinkCards.forEach(card => {
      loadFavicon(card);
    });
  }, 100);
  
  // 新しく作成されたプロジェクトビューでもドラッグ&ドロップを有効にする
  setTimeout(() => {
    initializeDragAndDropForProject(projectId);
    // プロジェクトページのセクション順序も復元
    const projectSectionGrid = projectView.querySelector('.section-grid');
    if (projectSectionGrid) {
      restoreSectionOrderForGrid(projectSectionGrid, projectId);
    }

    // プロジェクトページのセクション名を復元
    restoreSectionNamesForProject(projectId);
  }, 100);
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
  if (!list) return;
  
  // ヘッダーリンクデータを強制確認
  if (!headerLinksData || headerLinksData.length === 0) {
    headerLinksData = [
      { text: 'Google', url: 'https://www.google.co.jp/' },
      { text: 'Claude', url: 'https://claude.ai/' }
    ];
    saveHeaderLinks();
  }
  
  list.innerHTML = '';
  
  headerLinksData.forEach((link, index) => {
    const listItem = document.createElement('li');
    listItem.draggable = true;
    listItem.dataset.index = index;
    
    // ドラッグハンドル
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';
    
    // リンク情報
    const linkInfo = document.createElement('div');
    linkInfo.className = 'header-link-info';
    linkInfo.innerHTML = `
      <div class="header-link-title">${link.text}</div>
      <div class="header-link-url">${link.url}</div>
    `;
    
    // アクションボタン
    const linkActions = document.createElement('div');
    linkActions.className = 'link-actions';
    
    const editButton = document.createElement('button');
    editButton.textContent = '編集';
    editButton.onclick = () => editHeaderLinkItem(index);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.onclick = () => removeHeaderLink(index);
    
    linkActions.appendChild(editButton);
    linkActions.appendChild(deleteButton);
    
    // リストアイテムに追加
    listItem.appendChild(dragHandle);
    listItem.appendChild(linkInfo);
    listItem.appendChild(linkActions);
    
    // ドラッグ&ドロップイベントリスナーを追加
    listItem.addEventListener('dragstart', handleHeaderLinkDragStart);
    listItem.addEventListener('dragover', handleHeaderLinkDragOver);
    listItem.addEventListener('drop', handleHeaderLinkDrop);
    listItem.addEventListener('dragend', handleHeaderLinkDragEnd);
    listItem.addEventListener('dragenter', handleHeaderLinkDragEnter);
    listItem.addEventListener('dragleave', handleHeaderLinkDragLeave);
    
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
  try {
    const link = headerLinksData[index];
    if (!link) {
      console.error('Link not found at index:', index);
      return;
    }
    
    const listItem = document.querySelector(`#modal-header-link-list li:nth-child(${index + 1})`);
    if (!listItem) {
      console.error('List item not found at index:', index);
      return;
    }
    
    // 編集フォームを作成
    const editForm = document.createElement('div');
    editForm.className = 'header-link-edit-form';
    editForm.innerHTML = `
      <div class="edit-form-row">
        <input type="text" class="edit-text-input" value="${link.text}" placeholder="リンクテキスト">
        <input type="url" class="edit-url-input" value="${link.url}" placeholder="URL">
      </div>
      <div class="edit-form-actions">
        <button class="save-btn" onclick="saveHeaderLinkEdit(${index})">保存</button>
        <button class="cancel-btn" onclick="cancelHeaderLinkEdit(${index})">キャンセル</button>
      </div>
    `;
    
    // 元の内容を保存
    listItem.dataset.originalContent = listItem.innerHTML;
    
    // 編集フォームに置き換え
    listItem.innerHTML = '';
    listItem.appendChild(editForm);
    
    // テキストフィールドにフォーカス
    const textInput = editForm.querySelector('.edit-text-input');
    if (textInput) {
      textInput.focus();
      textInput.select();
    }
  } catch (error) {
    console.error('Error in editHeaderLinkItem:', error);
    alert('編集モードの開始に失敗しました。');
  }
}

function saveHeaderLinkEdit(index) {
  try {
    const listItem = document.querySelector(`#modal-header-link-list li:nth-child(${index + 1})`);
    if (!listItem) {
      console.error('List item not found for save:', index);
      return;
    }
    
    const textInput = listItem.querySelector('.edit-text-input');
    const urlInput = listItem.querySelector('.edit-url-input');
    
    if (!textInput || !urlInput) {
      console.error('Input fields not found');
      return;
    }
    
    const newText = textInput.value.trim();
    const newUrl = urlInput.value.trim();
    
    if (!newText || !newUrl) {
      alert('リンクテキストとURLを入力してください。');
      return;
    }
    
    headerLinksData[index] = { text: newText, url: newUrl };
    saveHeaderLinks();
    renderHeaderLinks();
    renderHeaderLinksModal();
  } catch (error) {
    console.error('Error in saveHeaderLinkEdit:', error);
    alert('変更の保存に失敗しました。');
  }
}

function cancelHeaderLinkEdit(index) {
  try {
    const listItem = document.querySelector(`#modal-header-link-list li:nth-child(${index + 1})`);
    if (!listItem) {
      console.error('List item not found for cancel:', index);
      return;
    }
    
    if (listItem.dataset.originalContent) {
      listItem.innerHTML = listItem.dataset.originalContent;
    } else {
      console.error('Original content not found');
      // フォールバック: モーダル全体を再描画
      renderHeaderLinksModal();
    }
  } catch (error) {
    console.error('Error in cancelHeaderLinkEdit:', error);
    // エラー時はモーダル全体を再描画
    renderHeaderLinksModal();
  }
}

function cancelHeaderEdit() {
  closeModal();
}


// ヘッダーリンク用ドラッグ&ドロップハンドラー
function handleHeaderLinkDragStart(e) {
  draggedHeaderLinkElement = this;
  draggedHeaderLinkIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleHeaderLinkDragEnd(e) {
  this.classList.remove('dragging');
  
  // 全てのドロップゾーンハイライトを削除
  const allItems = document.querySelectorAll('#modal-header-link-list li');
  allItems.forEach(item => {
    item.classList.remove('drag-over');
  });
  
  draggedHeaderLinkElement = null;
  draggedHeaderLinkIndex = null;
}

function handleHeaderLinkDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  if (draggedHeaderLinkElement && draggedHeaderLinkElement !== this) {
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
  
  return false;
}

function handleHeaderLinkDragEnter(e) {
  if (draggedHeaderLinkElement && draggedHeaderLinkElement !== this) {
    this.classList.add('drag-over');
  }
}

function handleHeaderLinkDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleHeaderLinkDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (draggedHeaderLinkElement !== this && draggedHeaderLinkIndex !== null) {
    const targetIndex = parseInt(this.dataset.index);
    
    // ヘッダーリンクデータの順番を変更
    const draggedLink = headerLinksData[draggedHeaderLinkIndex];
    headerLinksData.splice(draggedHeaderLinkIndex, 1);
    
    // 新しい位置に挿入
    if (draggedHeaderLinkIndex < targetIndex) {
      headerLinksData.splice(targetIndex - 1, 0, draggedLink);
    } else {
      headerLinksData.splice(targetIndex, 0, draggedLink);
    }
    
    // データを保存して表示を更新
    saveHeaderLinks();
    renderHeaderLinks();
    renderHeaderLinksModal();
  }
  
  this.classList.remove('drag-over');
  return false;
}

// リンク項目のドラッグ&ドロップ機能
let draggedLinkElement = null;
let draggedLinkIndex = null;

// ヘッダーリンク用のドラッグ&ドロップ変数
let draggedHeaderLinkElement = null;
let draggedHeaderLinkIndex = null;

function handleLinkDragStart(e) {
  draggedLinkElement = this;
  draggedLinkIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleLinkDragEnd(e) {
  this.classList.remove('dragging');
  
  // すべてのリンク項目からdrag-overクラスを削除
  document.querySelectorAll('#modal-link-list li').forEach(item => {
    item.classList.remove('drag-over');
  });
  
  draggedLinkElement = null;
  draggedLinkIndex = null;
}

function handleLinkDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleLinkDragEnter(e) {
  if (this !== draggedLinkElement) {
    this.classList.add('drag-over');
  }
}

function handleLinkDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleLinkDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (draggedLinkElement !== this && draggedLinkIndex !== null) {
    const targetIndex = parseInt(this.dataset.index);
    
    // リンクデータの順番を変更
    const draggedLink = linksData[currentSectionId][draggedLinkIndex];
    linksData[currentSectionId].splice(draggedLinkIndex, 1);
    linksData[currentSectionId].splice(targetIndex, 0, draggedLink);
    
    // ローカルストレージに保存
    saveLinks();
    
    // 表示を更新
    renderLinks();
    editLinks(currentSectionId);
    
    // 並び替え後のファビコンを読み込み
    setTimeout(() => {
      const reorderedLinkCards = document.querySelectorAll('.link-card[data-url]:not([data-favicon-loaded])');
      reorderedLinkCards.forEach(card => {
        loadFavicon(card);
      });
    }, 50);
  }
  
  this.classList.remove('drag-over');
  return false;
}

// ドラッグ&ドロップ機能
function initializeDragAndDrop() {
  const sectionGrid = document.querySelector('#main-view .section-grid');
  if (!sectionGrid) {
    console.log('Section grid not found for drag and drop');
    return;
  }

  // 各セクションにドラッグ機能を追加
  const sections = sectionGrid.querySelectorAll('.section');
  console.log('Initializing drag and drop for', sections.length, 'sections');
  
  sections.forEach(section => {
    // 既存のイベントリスナーを削除
    section.removeEventListener('dragstart', handleDragStart);
    section.removeEventListener('dragend', handleDragEnd);
    section.removeEventListener('dragover', handleDragOver);
    section.removeEventListener('drop', handleDrop);
    section.removeEventListener('dragenter', handleDragEnter);
    section.removeEventListener('dragleave', handleDragLeave);
    
    section.draggable = true;
    
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragend', handleDragEnd);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);
    section.addEventListener('dragenter', handleDragEnter);
    section.addEventListener('dragleave', handleDragLeave);
  });
}

// プロジェクト専用のドラッグ&ドロップ初期化
function initializeDragAndDropForProject(projectId) {
  const projectView = document.getElementById(`${projectId}-view`);
  if (!projectView) return;
  
  const sectionGrid = projectView.querySelector('.section-grid');
  if (!sectionGrid) {
    console.log('Project section grid not found for drag and drop:', projectId);
    return;
  }

  const sections = sectionGrid.querySelectorAll('.section');
  console.log('Initializing drag and drop for project', projectId, 'with', sections.length, 'sections');
  
  sections.forEach(section => {
    // 既存のイベントリスナーを削除
    section.removeEventListener('dragstart', handleDragStart);
    section.removeEventListener('dragend', handleDragEnd);
    section.removeEventListener('dragover', handleDragOver);
    section.removeEventListener('drop', handleDrop);
    section.removeEventListener('dragenter', handleDragEnter);
    section.removeEventListener('dragleave', handleDragLeave);
    
    section.draggable = true;
    
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragend', handleDragEnd);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);
    section.addEventListener('dragenter', handleDragEnter);
    section.addEventListener('dragleave', handleDragLeave);
  });
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // すべてのセクションからdrag-overクラスを削除
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('drag-over');
  });
  
  draggedElement = null;
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  if (draggedElement !== this) {
    // 現在のセクションの親グリッドを取得
    const sectionGrid = draggedElement.parentElement;
    const draggedIndex = Array.from(sectionGrid.children).indexOf(draggedElement);
    const targetIndex = Array.from(sectionGrid.children).indexOf(this);
    
    if (draggedIndex < targetIndex) {
      sectionGrid.insertBefore(draggedElement, this.nextSibling);
    } else {
      sectionGrid.insertBefore(draggedElement, this);
    }
    
    // セクションの順序をローカルストレージに保存
    saveSectionOrderForGrid(sectionGrid);
  }
  
  this.classList.remove('drag-over');
  return false;
}

// セクションの順序を保存（メインページ用）
function saveSectionOrder() {
  const sectionGrid = document.querySelector('#main-view .section-grid');
  if (sectionGrid) {
    saveSectionOrderForGrid(sectionGrid);
  }
}

// 指定されたグリッドのセクション順序を保存
function saveSectionOrderForGrid(sectionGrid) {
  const sectionOrder = Array.from(sectionGrid.children).map(section => section.id);
  
  // メインページかプロジェクトページかを判定
  const parentView = sectionGrid.closest('.view');
  const viewId = parentView ? parentView.id.replace('-view', '') : 'main';
  
  const storageKey = viewId === 'main' ? 'sectionOrder' : `sectionOrder_${viewId}`;
  localStorage.setItem(storageKey, JSON.stringify(sectionOrder));
  
  console.log('Saved section order for', viewId, ':', sectionOrder);
}

// セクションの順序を復元（メインページ用）
function restoreSectionOrder() {
  const sectionGrid = document.querySelector('#main-view .section-grid');
  if (sectionGrid) {
    restoreSectionOrderForGrid(sectionGrid, 'main');
  }
}

// 指定されたグリッドのセクション順序を復元
function restoreSectionOrderForGrid(sectionGrid, viewId) {
  const storageKey = viewId === 'main' ? 'sectionOrder' : `sectionOrder_${viewId}`;
  const storedOrder = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  if (storedOrder.length === 0) return;
  
  const sections = Array.from(sectionGrid.children);
  
  // 保存された順序に従ってセクションを並び替え
  storedOrder.forEach(sectionId => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      sectionGrid.appendChild(section);
    }
  });
  
  console.log('Restored section order for', viewId, ':', storedOrder);
}

// プロジェクトページのセクション名を復元
function restoreSectionNamesForProject(projectId) {
  const storedSectionNames = JSON.parse(localStorage.getItem(sectionNamesKey) || "{}");

  // プロジェクトの各セクション（1〜6）のセクション名を復元
  for (let i = 1; i <= 6; i++) {
    const sectionId = `${projectId}-section${i}`;
    const title = document.querySelector(`#${sectionId} h2`);

    if (title && storedSectionNames[sectionId]) {
      title.textContent = storedSectionNames[sectionId];
    }
  }

  console.log('Restored section names for project:', projectId);
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
  
  // プロジェクトのセクション順序データも削除
  localStorage.removeItem(`sectionOrder_${projectId}`);
  
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

// ナビゲーションボタン設定機能 --------------------------------------------------

// デフォルトのナビゲーションボタン定義
const defaultNavigationButtons = [
  { id: 'dashboard', label: 'ダッシュボード', url: 'pages/dashboard.html' },
  { id: 'calendar', label: 'カレンダー', url: 'pages/calendar.html' },
  { id: 'task-manager', label: 'タスク管理', url: 'pages/task-manager.html' },
  { id: 'memo', label: 'メモ管理', url: 'pages/memo-page.html' },
  { id: 'todo', label: 'TODOリスト', url: 'pages/todo.html' },
  { id: 'dev-tools', label: '効率化ツール', url: 'pages/dev-tools.html' },
  { id: 'calculator', label: 'ビジネス計算', url: 'pages/calculator.html' },
  { id: 'sql-templates', label: 'SQLテンプレート', url: 'pages/sql-templates.html' }
];

const navigationSettingsKey = 'navigationSettings_global';
const navigationOrderKey = 'navigationOrder_global';

// ナビゲーションボタンの表示設定を取得
function getNavigationSettings() {
  const stored = localStorage.getItem(navigationSettingsKey);
  if (stored) {
    return JSON.parse(stored);
  }

  // デフォルト設定: すべて表示
  const defaultSettings = {};
  defaultNavigationButtons.forEach(btn => {
    defaultSettings[btn.id] = true;
  });
  return defaultSettings;
}

// ナビゲーションボタンの並び順を取得
function getNavigationOrder() {
  const stored = localStorage.getItem(navigationOrderKey);
  if (stored) {
    return JSON.parse(stored);
  }

  // デフォルト順序: defaultNavigationButtonsの順番
  return defaultNavigationButtons.map(btn => btn.id);
}

// ナビゲーションボタンの並び順を保存
function saveNavigationOrder(order) {
  localStorage.setItem(navigationOrderKey, JSON.stringify(order));
}

// ナビゲーションボタンの表示設定を保存
function saveNavigationSettingsToStorage(settings) {
  localStorage.setItem(navigationSettingsKey, JSON.stringify(settings));
}

// ナビゲーションボタンを描画
function renderNavigationButtons() {
  const container = document.getElementById('fixed-buttons-group');
  if (!container) return;

  container.innerHTML = '';

  const settings = getNavigationSettings();
  const order = getNavigationOrder();

  // 並び順に従ってボタンを描画
  order.forEach(btnId => {
    const btn = defaultNavigationButtons.find(b => b.id === btnId);
    if (btn && settings[btn.id]) {
      const link = document.createElement('a');
      link.href = btn.url;
      link.className = 'navigation-link internal-link';
      link.textContent = btn.label;
      container.appendChild(link);
    }
  });
}

// ナビゲーション設定モーダルを開く
function openNavigationSettings() {
  // モーダルタイトルを変更
  document.getElementById('modal-title').textContent = 'ナビゲーションボタン設定';

  // 他のモードを非表示にして、ナビゲーション設定モードを表示
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'none';
  document.getElementById('header-links-edit-mode').style.display = 'none';
  document.getElementById('navigation-settings-mode').style.display = 'block';

  // 設定リストを描画
  renderNavigationSettingsList();

  // モーダルを表示
  document.getElementById('modal').style.display = 'flex';
}

// ナビゲーション設定リストを描画
function renderNavigationSettingsList() {
  const list = document.getElementById('navigation-buttons-settings');
  if (!list) return;

  list.innerHTML = '';

  const settings = getNavigationSettings();
  const order = getNavigationOrder();

  // 並び順に従ってリストを描画
  order.forEach((btnId, index) => {
    const btn = defaultNavigationButtons.find(b => b.id === btnId);
    if (!btn) return;

    const listItem = document.createElement('li');
    listItem.className = 'navigation-setting-item';
    listItem.draggable = true;
    listItem.dataset.buttonId = btn.id;
    listItem.dataset.index = index;

    // ドラッグハンドル
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `nav-setting-${btn.id}`;
    checkbox.checked = settings[btn.id] !== false;
    checkbox.dataset.buttonId = btn.id;

    const label = document.createElement('label');
    label.htmlFor = `nav-setting-${btn.id}`;
    label.textContent = btn.label;

    listItem.appendChild(dragHandle);
    listItem.appendChild(checkbox);
    listItem.appendChild(label);

    // ドラッグ&ドロップイベントを追加
    listItem.addEventListener('dragstart', handleNavButtonDragStart);
    listItem.addEventListener('dragover', handleNavButtonDragOver);
    listItem.addEventListener('drop', handleNavButtonDrop);
    listItem.addEventListener('dragend', handleNavButtonDragEnd);
    listItem.addEventListener('dragenter', handleNavButtonDragEnter);
    listItem.addEventListener('dragleave', handleNavButtonDragLeave);

    list.appendChild(listItem);
  });
}

// ナビゲーション設定を保存
function saveNavigationSettings() {
  const checkboxes = document.querySelectorAll('#navigation-buttons-settings input[type="checkbox"]');
  const listItems = document.querySelectorAll('#navigation-buttons-settings li');
  const newSettings = {};
  const newOrder = [];

  // 現在の並び順とチェック状態を取得
  listItems.forEach(item => {
    const buttonId = item.dataset.buttonId;
    newOrder.push(buttonId);
  });

  checkboxes.forEach(checkbox => {
    const buttonId = checkbox.dataset.buttonId;
    newSettings[buttonId] = checkbox.checked;
  });

  saveNavigationSettingsToStorage(newSettings);
  saveNavigationOrder(newOrder);
  renderNavigationButtons();
  closeModal();

  alert('設定を保存しました');
}

// ナビゲーション設定をデフォルトに戻す
function resetNavigationSettings() {
  if (!confirm('ナビゲーション設定をデフォルトに戻しますか？')) {
    return;
  }

  const defaultSettings = {};
  defaultNavigationButtons.forEach(btn => {
    defaultSettings[btn.id] = true;
  });

  const defaultOrder = defaultNavigationButtons.map(btn => btn.id);

  saveNavigationSettingsToStorage(defaultSettings);
  saveNavigationOrder(defaultOrder);
  renderNavigationButtons();
  renderNavigationSettingsList();

  alert('デフォルト設定に戻しました');
}

// ナビゲーションボタンのドラッグ&ドロップハンドラー
let draggedNavButton = null;
let draggedNavButtonIndex = null;

function handleNavButtonDragStart(e) {
  draggedNavButton = this;
  draggedNavButtonIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleNavButtonDragEnd(e) {
  this.classList.remove('dragging');

  // 全てのドロップゾーンハイライトを削除
  const allItems = document.querySelectorAll('#navigation-buttons-settings li');
  allItems.forEach(item => {
    item.classList.remove('drag-over');
  });

  draggedNavButton = null;
  draggedNavButtonIndex = null;
}

function handleNavButtonDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  if (draggedNavButton && draggedNavButton !== this) {
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }

  return false;
}

function handleNavButtonDragEnter(e) {
  if (draggedNavButton && draggedNavButton !== this) {
    this.classList.add('drag-over');
  }
}

function handleNavButtonDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleNavButtonDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedNavButton !== this && draggedNavButtonIndex !== null) {
    const targetIndex = parseInt(this.dataset.index);
    const order = getNavigationOrder();

    // 並び順を変更
    const draggedId = order[draggedNavButtonIndex];
    order.splice(draggedNavButtonIndex, 1);
    order.splice(targetIndex, 0, draggedId);

    // 一時的に保存して再描画
    saveNavigationOrder(order);
    renderNavigationSettingsList();
  }

  this.classList.remove('drag-over');
  return false;
}

// ポモドーロタイマー機能 --------------------------------------------------

// ポモドーロタイマーの状態管理
const pomodoroState = {
  isRunning: false,
  isPaused: false,
  currentMode: 'work', // 'work', 'break'
  timeRemaining: 25 * 60, // 秒単位
  sessionCount: 0,
  timerId: null,
  warningSoundPlayed: false // 警告音を鳴らしたかのフラグ
};

// ポモドーロタイマーの設定
const pomodoroSettingsKey = 'pomodoroSettings_global';
const pomodoroVisibilityKey = 'pomodoroVisibility_global';
const pomodoroStateKey = 'pomodoroState_global';

// デフォルト設定
const defaultPomodoroSettings = {
  workTime: 25,
  breakTime: 5,
  autoContinue: false,
  timerVisible: true,
  soundEnabled: true,
  warningSoundEnabled: false,
  notificationEnabled: true
};

// 設定を取得
function getPomodoroSettings() {
  const stored = localStorage.getItem(pomodoroSettingsKey);
  if (stored) {
    return JSON.parse(stored);
  }
  return { ...defaultPomodoroSettings };
}

// 設定を保存
function savePomodoroSettingsToStorage(settings) {
  localStorage.setItem(pomodoroSettingsKey, JSON.stringify(settings));
}

// タイマー状態を保存
function savePomodoroState() {
  const stateToSave = {
    isRunning: pomodoroState.isRunning,
    currentMode: pomodoroState.currentMode,
    timeRemaining: pomodoroState.timeRemaining,
    sessionCount: pomodoroState.sessionCount,
    lastSaveTime: Date.now()
  };
  localStorage.setItem(pomodoroStateKey, JSON.stringify(stateToSave));
}

// タイマー状態を復元
function restorePomodoroState() {
  const stored = localStorage.getItem(pomodoroStateKey);
  if (!stored) return false;

  try {
    const savedState = JSON.parse(stored);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - savedState.lastSaveTime) / 1000);

    pomodoroState.currentMode = savedState.currentMode;
    pomodoroState.sessionCount = savedState.sessionCount;

    // タイマーが動いていた場合、経過時間を考慮
    if (savedState.isRunning) {
      pomodoroState.timeRemaining = Math.max(0, savedState.timeRemaining - elapsedSeconds);

      // 時間が残っている場合は自動的に再開
      if (pomodoroState.timeRemaining > 0) {
        pomodoroState.isRunning = true;
        startPomodoroInterval();
      } else {
        // 時間切れの場合は次のモードに移行
        pomodoroState.timeRemaining = 0;
        handlePomodoroTimerComplete();
      }
    } else {
      pomodoroState.timeRemaining = savedState.timeRemaining;
    }

    return true;
  } catch (e) {
    console.error('Failed to restore pomodoro state:', e);
    return false;
  }
}

// タイマー状態をクリア
function clearPomodoroState() {
  localStorage.removeItem(pomodoroStateKey);
}

// タイマーの初期化
function initializePomodoroTimer() {
  // 保存された状態を復元
  const restored = restorePomodoroState();

  // 復元できなかった場合はデフォルト値を設定
  if (!restored) {
    const settings = getPomodoroSettings();
    pomodoroState.timeRemaining = settings.workTime * 60;
    pomodoroState.currentMode = 'work';
    pomodoroState.sessionCount = 0;
  }

  updatePomodoroDisplay();
  updatePomodoroModeIndicator();
  updatePomodoroSessionCount();
  updatePomodoroTimerColor();

  // タイマーの表示/非表示設定を適用
  const settings = getPomodoroSettings();
  updatePomodoroTimerVisibility(settings.timerVisible !== false);

  // 表示/非表示の状態を復元（最小化）
  const visibility = localStorage.getItem(pomodoroVisibilityKey);
  const container = document.getElementById('pomodoro-timer-container');
  const toggleBtn = document.querySelector('.pomodoro-toggle-btn');

  if (visibility === 'minimized') {
    if (container) container.classList.add('minimized');
    if (toggleBtn) {
      toggleBtn.textContent = '□';
      toggleBtn.setAttribute('title', '展開');
    }
  } else {
    if (container) container.classList.remove('minimized');
    if (toggleBtn) {
      toggleBtn.textContent = '−';
      toggleBtn.setAttribute('title', '最小化');
    }
  }
}

// タイマー表示を更新
function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroState.timeRemaining / 60);
  const seconds = pomodoroState.timeRemaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const displayElement = document.getElementById('pomodoro-timer-display');
  if (displayElement) {
    displayElement.textContent = display;
  }
}

// モード表示を更新
function updatePomodoroModeIndicator() {
  const modeText = document.getElementById('pomodoro-mode-text');
  if (!modeText) return;

  const settings = getPomodoroSettings();

  switch (pomodoroState.currentMode) {
    case 'work':
      modeText.textContent = '作業時間';
      break;
    case 'break':
      modeText.textContent = '休憩時間';
      break;
  }
}

// セッションカウント表示を更新
function updatePomodoroSessionCount() {
  const countElement = document.getElementById('pomodoro-session-count');
  if (countElement) {
    countElement.textContent = `セッション: ${pomodoroState.sessionCount}`;
  }
}

// タイマーの色を更新
function updatePomodoroTimerColor() {
  const timerElement = document.querySelector('.pomodoro-timer');
  if (!timerElement) return;

  // 全てのクラスを削除
  timerElement.classList.remove('normal', 'warning', 'break');

  // 休憩時間
  if (pomodoroState.currentMode === 'break') {
    timerElement.classList.add('break');
  }
  // 作業時間の残り20%以下で警告色
  else if (pomodoroState.currentMode === 'work') {
    const settings = getPomodoroSettings();
    const totalWorkTime = settings.workTime * 60;
    const warningThreshold = totalWorkTime * 0.2;

    if (pomodoroState.timeRemaining <= warningThreshold) {
      timerElement.classList.add('warning');

      // 警告音と通知を出す（一度だけ）
      if (!pomodoroState.warningSoundPlayed) {
        if (settings.warningSoundEnabled) {
          playWarningSound();
        }
        if (settings.notificationEnabled) {
          showPomodoroWarningNotification();
        }
        pomodoroState.warningSoundPlayed = true;
      }
    } else {
      timerElement.classList.add('normal');
    }
  }
  // 平常時
  else {
    timerElement.classList.add('normal');
  }
}

// タイマーのインターバルを開始
function startPomodoroInterval() {
  const startBtn = document.getElementById('pomodoro-start-btn');

  if (startBtn) {
    startBtn.textContent = '一時停止';
    startBtn.classList.add('active');
  }

  // 既存のインターバルをクリア
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
  }

  pomodoroState.timerId = setInterval(() => {
    if (pomodoroState.timeRemaining > 0) {
      pomodoroState.timeRemaining--;
      updatePomodoroDisplay();
      updatePomodoroTimerColor();

      // 1秒ごとに状態を保存
      savePomodoroState();
    } else {
      // タイマー終了
      handlePomodoroTimerComplete();
    }
  }, 1000);
}

// タイマーの開始/一時停止
function togglePomodoroTimer() {
  const startBtn = document.getElementById('pomodoro-start-btn');

  if (!pomodoroState.isRunning) {
    // タイマー開始
    pomodoroState.isRunning = true;
    pomodoroState.isPaused = false;
    startPomodoroInterval();
    savePomodoroState();
  } else {
    // タイマー一時停止
    pomodoroState.isRunning = false;
    pomodoroState.isPaused = true;

    if (startBtn) {
      startBtn.textContent = '再開';
      startBtn.classList.remove('active');
    }

    if (pomodoroState.timerId) {
      clearInterval(pomodoroState.timerId);
      pomodoroState.timerId = null;
    }

    savePomodoroState();
  }
}

// タイマー完了時の処理
function handlePomodoroTimerComplete() {
  const settings = getPomodoroSettings();

  // タイマーを停止
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
    pomodoroState.timerId = null;
  }

  pomodoroState.isRunning = false;

  // 現在のモードを保存（通知用）
  const completedMode = pomodoroState.currentMode;

  // モードに応じた音声通知とブラウザ通知
  if (settings.soundEnabled) {
    if (completedMode === 'work') {
      playWorkCompleteSound(); // 作業終了音
    } else {
      playBreakCompleteSound(); // 休憩終了音
    }
  }

  // ブラウザ通知（モードを渡す）
  showPomodoroNotification(completedMode);

  // 次のモードに移行
  if (completedMode === 'work') {
    // 作業完了 → 休憩へ
    pomodoroState.sessionCount++;
    updatePomodoroSessionCount();
    pomodoroState.currentMode = 'break';
    pomodoroState.timeRemaining = settings.breakTime * 60;
  } else {
    // 休憩完了 → 作業へ
    pomodoroState.currentMode = 'work';
    pomodoroState.timeRemaining = settings.workTime * 60;
  }

  // 警告音フラグをリセット
  pomodoroState.warningSoundPlayed = false;

  // 表示を更新
  updatePomodoroDisplay();
  updatePomodoroModeIndicator();
  updatePomodoroTimerColor();

  // 状態を保存
  savePomodoroState();

  // 自動継続設定がある場合
  if (settings.autoContinue) {
    setTimeout(() => {
      togglePomodoroTimer();
    }, 1000);
  } else {
    resetPomodoroButton();
  }
}

// ボタンをリセット
function resetPomodoroButton() {
  const startBtn = document.getElementById('pomodoro-start-btn');
  if (startBtn) {
    startBtn.textContent = '開始';
    startBtn.classList.remove('active');
  }
}

// タイマーをリセット
function resetPomodoroTimer() {
  // タイマーを停止
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
    pomodoroState.timerId = null;
  }

  pomodoroState.isRunning = false;
  pomodoroState.isPaused = false;
  pomodoroState.warningSoundPlayed = false;

  const settings = getPomodoroSettings();

  // 現在のモードに応じた時間に戻す
  if (pomodoroState.currentMode === 'work') {
    pomodoroState.timeRemaining = settings.workTime * 60;
  } else if (pomodoroState.currentMode === 'break') {
    pomodoroState.timeRemaining = settings.breakTime * 60;
  }

  updatePomodoroDisplay();
  updatePomodoroTimerColor();
  resetPomodoroButton();

  // 状態を保存
  savePomodoroState();
}

// 音声通知を再生
// 作業終了時の音（明るく達成感のある音）
function playWorkCompleteSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    // C6 → E6 → G6 の上昇和音（達成感）
    [1046.5, 1318.5, 1568].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (error) {
    console.error('[Pomodoro] Audio エラー:', error);
  }
}

// 残り20%警告音（注意を促す中音）
function playWarningSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    // A5音を2回（注意喚起）
    [0, 0.25].forEach((delay) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.value = 880; // A5
      osc.type = 'sine';

      const startTime = now + delay;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (error) {
    console.error('[Pomodoro] Audio エラー:', error);
  }
}

// 休憩終了時の音（柔らかく優しい音）
function playBreakCompleteSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    // G6 → E6 の下降音（優しく穏やか）
    [1568, 1318.5].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = now + i * 0.2;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  } catch (error) {
    console.error('[Pomodoro] Audio エラー:', error);
  }
}

// 互換性のため残す（warningで使用）
function playPomodoroSound() {
  playWarningSound();
}

// タイマーの表示/非表示を切り替え
function updatePomodoroTimerVisibility(visible) {
  const container = document.getElementById('pomodoro-timer-container');
  if (container) {
    if (visible) {
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  }
}

// 残り20%の警告通知を表示
function showPomodoroWarningNotification() {
  const settings = getPomodoroSettings();

  // 通知設定が無効の場合は何もしない
  if (!settings.notificationEnabled) {
    return;
  }

  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const remainingMinutes = Math.ceil(pomodoroState.timeRemaining / 60);

    new Notification('⚠️ 残り時間少！', {
      body: `作業時間の残りが${remainingMinutes}分を切りました。`,
      tag: 'pomodoro-warning-' + Date.now(),
      silent: !settings.warningSoundEnabled, // 警告サウンド設定に従う
      requireInteraction: false
    });
  }
}

// ブラウザ通知を表示
function showPomodoroNotification(completedMode) {
  const settings = getPomodoroSettings();

  if (!settings.notificationEnabled) {
    return;
  }

  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    createPomodoroNotification(completedMode);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createPomodoroNotification(completedMode);
      }
    });
  }
}

function createPomodoroNotification(completedMode) {
  const settings = getPomodoroSettings();
  let title = '';
  let message = '';

  // 完了したモードに基づいてメッセージを決定
  if (completedMode === 'work') {
    title = '🍅 作業完了！';
    message = '作業時間が終了しました。休憩しましょう。';
  } else {
    title = '☕ 休憩完了！';
    message = '休憩時間が終了しました。作業を再開しましょう。';
  }

  try {
    const notification = new Notification(title, {
      body: message,
      tag: 'pomodoro-complete-' + Date.now(),
      requireInteraction: true,
      silent: !settings.soundEnabled,
      renotify: true
    });

    notification.onclick = function() {
      window.focus();
      this.close();
    };

    setTimeout(() => {
      if (notification) {
        notification.close();
      }
    }, 15000);

  } catch (error) {
    console.error('[Pomodoro] 通知作成エラー:', error);
  }
}

// 表示/非表示の切り替え
function togglePomodoroVisibility() {
  const container = document.getElementById('pomodoro-timer-container');
  const toggleBtn = document.querySelector('.pomodoro-toggle-btn');

  if (container && toggleBtn) {
    container.classList.toggle('minimized');

    if (container.classList.contains('minimized')) {
      toggleBtn.textContent = '□';
      toggleBtn.setAttribute('title', '展開');
      localStorage.setItem(pomodoroVisibilityKey, 'minimized');
    } else {
      toggleBtn.textContent = '−';
      toggleBtn.setAttribute('title', '最小化');
      localStorage.setItem(pomodoroVisibilityKey, 'visible');
    }
  }
}

// 設定モーダルを開く
function openPomodoroSettings() {
  // モーダルタイトルを変更
  document.getElementById('modal-title').textContent = 'ポモドーロタイマー設定';

  // 他のモードを非表示にして、ポモドーロ設定モードを表示
  document.getElementById('single-edit-mode').style.display = 'none';
  document.getElementById('list-edit-mode').style.display = 'none';
  document.getElementById('header-links-edit-mode').style.display = 'none';
  document.getElementById('navigation-settings-mode').style.display = 'none';
  document.getElementById('pomodoro-settings-mode').style.display = 'block';

  // 現在の設定を入力欄に反映
  const settings = getPomodoroSettings();
  document.getElementById('pomodoro-work-time').value = settings.workTime;
  document.getElementById('pomodoro-break-time').value = settings.breakTime;
  document.getElementById('pomodoro-auto-continue').checked = settings.autoContinue || false;
  document.getElementById('pomodoro-timer-visible').checked = settings.timerVisible !== false;
  document.getElementById('pomodoro-sound-enabled').checked = settings.soundEnabled !== false;
  document.getElementById('pomodoro-warning-sound-enabled').checked = settings.warningSoundEnabled || false;
  document.getElementById('pomodoro-notification-enabled').checked = settings.notificationEnabled !== false;

  // モーダルを表示
  document.getElementById('modal').style.display = 'flex';
}

// 設定を保存
function savePomodoroSettings() {
  const newSettings = {
    workTime: parseInt(document.getElementById('pomodoro-work-time').value),
    breakTime: parseInt(document.getElementById('pomodoro-break-time').value),
    autoContinue: document.getElementById('pomodoro-auto-continue').checked,
    timerVisible: document.getElementById('pomodoro-timer-visible').checked,
    soundEnabled: document.getElementById('pomodoro-sound-enabled').checked,
    warningSoundEnabled: document.getElementById('pomodoro-warning-sound-enabled').checked,
    notificationEnabled: document.getElementById('pomodoro-notification-enabled').checked
  };

  // 入力値の検証
  if (newSettings.workTime < 1 || newSettings.workTime > 60) {
    alert('作業時間は1〜60分の範囲で設定してください。');
    return;
  }
  if (newSettings.breakTime < 1 || newSettings.breakTime > 30) {
    alert('休憩時間は1〜30分の範囲で設定してください。');
    return;
  }

  savePomodoroSettingsToStorage(newSettings);

  // 通知が有効な場合は許可をリクエスト
  if (newSettings.notificationEnabled && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('通知許可が付与されました');
        } else {
          alert('ブラウザ通知を使用するには、通知の許可が必要です。ブラウザの設定から通知を許可してください。');
        }
      });
    } else if (Notification.permission === 'denied') {
      alert('ブラウザ通知が拒否されています。ブラウザの設定から通知を許可してください。');
    }
  }

  // タイマーの表示/非表示を切り替え
  updatePomodoroTimerVisibility(newSettings.timerVisible);

  // タイマーが動いていない場合は時間を更新
  if (!pomodoroState.isRunning) {
    if (pomodoroState.currentMode === 'work') {
      pomodoroState.timeRemaining = newSettings.workTime * 60;
    } else if (pomodoroState.currentMode === 'break') {
      pomodoroState.timeRemaining = newSettings.breakTime * 60;
    }
    updatePomodoroDisplay();
  }

  closeModal();
  alert('設定を保存しました');
}

// 設定をデフォルトに戻す
function resetPomodoroSettings() {
  if (!confirm('ポモドーロタイマー設定をデフォルトに戻しますか？')) {
    return;
  }

  savePomodoroSettingsToStorage(defaultPomodoroSettings);

  // 入力欄を更新
  document.getElementById('pomodoro-work-time').value = defaultPomodoroSettings.workTime;
  document.getElementById('pomodoro-break-time').value = defaultPomodoroSettings.breakTime;
  document.getElementById('pomodoro-auto-continue').checked = defaultPomodoroSettings.autoContinue;
  document.getElementById('pomodoro-sound-enabled').checked = defaultPomodoroSettings.soundEnabled;
  document.getElementById('pomodoro-warning-sound-enabled').checked = defaultPomodoroSettings.warningSoundEnabled;

  // タイマーが動いていない場合は初期化
  if (!pomodoroState.isRunning) {
    initializePomodoroTimer();
  }

  alert('デフォルト設定に戻しました');
}

// ページロード時にポモドーロタイマーを初期化
document.addEventListener('DOMContentLoaded', () => {
  initializePomodoroTimer();

  // 通知の許可をリクエスト
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // ページを離れる前に状態を保存
  window.addEventListener('beforeunload', () => {
    savePomodoroState();
  });

  // ページの可視性が変わったときに状態を保存
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      savePomodoroState();
    }
  });
});

