// ブックマーク管理システム
class BookmarkManager {
    constructor() {
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        this.filteredBookmarks = [...this.bookmarks];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.viewMode = 'grid';
        this.selectedBookmarks = new Set();
        this.editingBookmarkId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderBookmarks();
        this.updateStats();
        this.renderTagCloud();
    }

    setupEventListeners() {
        // 検索機能
        document.getElementById('search-btn').addEventListener('click', () => this.performSearch());
        document.getElementById('clear-search-btn').addEventListener('click', () => this.clearSearch());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // フィルタとソート
        document.getElementById('category-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sort-select').addEventListener('change', () => this.applySort());

        // 表示モード切り替え
        document.querySelectorAll('input[name="view-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.viewMode = e.target.value;
                this.renderBookmarks();
            });
        });

        // 一括操作
        document.getElementById('select-all-btn').addEventListener('click', () => this.toggleSelectAll());
        document.getElementById('delete-selected-btn').addEventListener('click', () => this.deleteSelected());

        // ページネーション
        document.getElementById('prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('next-page').addEventListener('click', () => this.changePage(1));

        // モーダル関連
        document.getElementById('save-bookmark-btn').addEventListener('click', () => this.saveBookmark());
        document.getElementById('delete-bookmark-btn').addEventListener('click', () => this.deleteBookmark());
        document.getElementById('fetch-info-btn').addEventListener('click', () => this.fetchSiteInfo());
        
        // サムネイル URL が変更された時のプレビュー
        document.getElementById('bookmark-thumbnail').addEventListener('input', (e) => {
            this.previewThumbnail(e.target.value);
        });
    }

    // 検索機能
    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        this.applyFilters(query);
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        this.applyFilters();
    }

    // フィルタ適用
    applyFilters(searchQuery = '') {
        const categoryFilter = document.getElementById('category-filter').value;
        const selectedTags = Array.from(document.querySelectorAll('.tag-item.active')).map(tag => tag.textContent);
        
        if (!searchQuery) {
            searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
        }

        this.filteredBookmarks = this.bookmarks.filter(bookmark => {
            // 検索クエリによるフィルタ
            const matchesSearch = !searchQuery || 
                bookmark.title.toLowerCase().includes(searchQuery) ||
                bookmark.url.toLowerCase().includes(searchQuery) ||
                bookmark.description.toLowerCase().includes(searchQuery) ||
                bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery));

            // カテゴリによるフィルタ
            const matchesCategory = !categoryFilter || bookmark.category === categoryFilter;

            // タグによるフィルタ
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.some(tag => bookmark.tags.includes(tag));

            return matchesSearch && matchesCategory && matchesTags;
        });

        this.currentPage = 1;
        this.applySort();
    }

    // ソート適用
    applySort() {
        const sortBy = document.getElementById('sort-select').value;
        
        this.filteredBookmarks.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'category':
                    return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.renderBookmarks();
    }

    // ブックマーク表示
    renderBookmarks() {
        const container = document.getElementById('bookmarks-container');
        container.className = this.viewMode === 'grid' ? 'bookmarks-grid' : 'bookmarks-list';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageBookmarks = this.filteredBookmarks.slice(startIndex, endIndex);

        container.innerHTML = '';

        if (pageBookmarks.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">ブックマークが見つかりません</div>';
        } else {
            pageBookmarks.forEach(bookmark => {
                const card = this.createBookmarkCard(bookmark);
                container.appendChild(card);
            });
        }

        this.updatePagination();
        this.updateResultInfo();
    }

    // ブックマークカード作成
    createBookmarkCard(bookmark) {
        const card = document.createElement('div');
        card.className = `bookmark-card ${this.viewMode === 'list' ? 'list-view' : ''}`;
        card.dataset.id = bookmark.id;

        const thumbnail = bookmark.thumbnail ? 
            `<img src="${bookmark.thumbnail}" alt="サムネイル" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">画像なし</div>'">` :
            '<div class="no-image">画像なし</div>';

        const favicon = bookmark.favicon ? 
            `<img src="${bookmark.favicon}" alt="favicon" class="bookmark-favicon" onerror="this.style.display='none'">` :
            '';

        const tags = bookmark.tags.map(tag => 
            `<span class="bookmark-tag">${tag}</span>`
        ).join('');

        if (this.viewMode === 'grid') {
            card.innerHTML = `
                <input type="checkbox" class="bookmark-checkbox" onchange="bookmarkManager.toggleSelection('${bookmark.id}')">
                <div class="bookmark-thumbnail">${thumbnail}</div>
                <div class="bookmark-header">
                    ${favicon}
                    <h3 class="bookmark-title">${bookmark.title}</h3>
                </div>
                <div class="bookmark-url">${bookmark.url}</div>
                <div class="bookmark-description">${bookmark.description}</div>
                <div class="bookmark-meta">
                    <span class="bookmark-category">${bookmark.category}</span>
                    <span class="bookmark-date">${new Date(bookmark.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div class="bookmark-tags">${tags}</div>
            `;
        } else {
            card.innerHTML = `
                <div class="bookmark-thumbnail">${thumbnail}</div>
                <div class="bookmark-info">
                    <div class="bookmark-header">
                        ${favicon}
                        <h3 class="bookmark-title">${bookmark.title}</h3>
                    </div>
                    <div class="bookmark-url">${bookmark.url}</div>
                    <div class="bookmark-description">${bookmark.description}</div>
                    <div class="bookmark-tags">${tags}</div>
                </div>
                <div class="bookmark-actions">
                    <input type="checkbox" class="bookmark-checkbox" onchange="bookmarkManager.toggleSelection('${bookmark.id}')">
                    <span class="bookmark-category">${bookmark.category}</span>
                    <span class="bookmark-date">${new Date(bookmark.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
            `;
        }

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-checkbox')) {
                this.showBookmarkDetail(bookmark);
            }
        });

        return card;
    }

    // ページネーション更新
    updatePagination() {
        const totalPages = Math.ceil(this.filteredBookmarks.length / this.itemsPerPage);
        
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= totalPages;
        document.getElementById('page-info').textContent = `${this.currentPage} / ${totalPages}`;
    }

    // 結果情報更新
    updateResultInfo() {
        const total = this.filteredBookmarks.length;
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(start + this.itemsPerPage - 1, total);
        
        document.getElementById('result-count').textContent = 
            total > 0 ? `${start}-${end} / ${total}件のブックマーク` : '0件のブックマーク';
    }

    // ページ変更
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredBookmarks.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.renderBookmarks();
        }
    }

    // 統計更新
    updateStats() {
        const totalBookmarks = this.bookmarks.length;
        const categories = [...new Set(this.bookmarks.map(b => b.category))].length;
        const allTags = this.bookmarks.flatMap(b => b.tags);
        const uniqueTags = [...new Set(allTags)].length;

        document.getElementById('total-bookmarks').textContent = totalBookmarks;
        document.getElementById('total-categories').textContent = categories;
        document.getElementById('total-tags').textContent = uniqueTags;
    }

    // タグクラウド表示
    renderTagCloud() {
        const tagCloud = document.getElementById('tag-cloud');
        const allTags = this.bookmarks.flatMap(b => b.tags);
        const tagCounts = {};
        
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);

        tagCloud.innerHTML = '';
        sortedTags.forEach(([tag, count]) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.textContent = tag;
            tagElement.title = `${count}件`;
            tagElement.addEventListener('click', () => this.toggleTag(tagElement, tag));
            tagCloud.appendChild(tagElement);
        });
    }

    // タグフィルタ切り替え
    toggleTag(element, tag) {
        element.classList.toggle('active');
        this.applyFilters();
    }

    // 選択切り替え
    toggleSelection(bookmarkId) {
        if (this.selectedBookmarks.has(bookmarkId)) {
            this.selectedBookmarks.delete(bookmarkId);
        } else {
            this.selectedBookmarks.add(bookmarkId);
        }
        
        document.getElementById('delete-selected-btn').disabled = this.selectedBookmarks.size === 0;
    }

    // 全選択切り替え
    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.bookmark-checkbox');
        const allSelected = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(cb => {
            cb.checked = !allSelected;
            const bookmarkId = cb.closest('.bookmark-card').dataset.id;
            if (!allSelected) {
                this.selectedBookmarks.add(bookmarkId);
            } else {
                this.selectedBookmarks.delete(bookmarkId);
            }
        });
        
        document.getElementById('delete-selected-btn').disabled = this.selectedBookmarks.size === 0;
    }

    // 選択削除
    deleteSelected() {
        if (this.selectedBookmarks.size === 0) return;
        
        if (confirm(`選択した${this.selectedBookmarks.size}件のブックマークを削除しますか？`)) {
            this.bookmarks = this.bookmarks.filter(b => !this.selectedBookmarks.has(b.id));
            this.selectedBookmarks.clear();
            this.saveBookmarks();
            this.applyFilters();
            this.updateStats();
            this.renderTagCloud();
        }
    }

    // ブックマーク詳細表示
    showBookmarkDetail(bookmark) {
        const modal = document.getElementById('detail-modal');
        const content = document.getElementById('detail-content');
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${bookmark.thumbnail ? 
                    `<img src="${bookmark.thumbnail}" alt="サムネイル" style="max-width: 100%; max-height: 200px; border-radius: 8px;">` :
                    '<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; color: #999;">画像なし</div>'
                }
            </div>
            <h3>${bookmark.title}</h3>
            <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank">${bookmark.url}</a></p>
            <p><strong>説明:</strong> ${bookmark.description}</p>
            <p><strong>カテゴリ:</strong> ${bookmark.category}</p>
            <p><strong>タグ:</strong> ${bookmark.tags.join(', ')}</p>
            <p><strong>追加日:</strong> ${new Date(bookmark.createdAt).toLocaleString('ja-JP')}</p>
        `;
        
        document.getElementById('edit-bookmark-btn').onclick = () => {
            this.closeDetailModal();
            this.showAddModal(bookmark);
        };
        
        document.getElementById('visit-bookmark-btn').onclick = () => {
            window.open(bookmark.url, '_blank');
        };
        
        modal.style.display = 'block';
    }

    // ブックマーク追加/編集モーダル表示
    showAddModal(bookmark = null) {
        const modal = document.getElementById('bookmark-modal');
        const form = document.getElementById('bookmark-form');
        
        this.editingBookmarkId = bookmark ? bookmark.id : null;
        
        document.getElementById('modal-title').textContent = 
            bookmark ? 'ブックマーク編集' : 'ブックマーク追加';
        
        document.getElementById('delete-bookmark-btn').style.display = 
            bookmark ? 'inline-block' : 'none';
        
        if (bookmark) {
            document.getElementById('bookmark-url').value = bookmark.url;
            document.getElementById('bookmark-title').value = bookmark.title;
            document.getElementById('bookmark-description').value = bookmark.description;
            document.getElementById('bookmark-category').value = bookmark.category;
            document.getElementById('bookmark-tags').value = bookmark.tags.join(', ');
            document.getElementById('bookmark-favicon').value = bookmark.favicon || '';
            document.getElementById('bookmark-thumbnail').value = bookmark.thumbnail || '';
            this.previewThumbnail(bookmark.thumbnail);
        } else {
            form.reset();
            document.getElementById('thumbnail-preview-img').style.display = 'none';
        }
        
        modal.style.display = 'block';
    }

    // サイト情報取得
    async fetchSiteInfo() {
        const url = document.getElementById('bookmark-url').value;
        if (!url) {
            alert('URLを入力してください');
            return;
        }

        try {
            // 簡易的なサイト情報取得（実際のAPIを使用する場合は適切なエンドポイントに変更）
            const domain = new URL(url).hostname;
            
            // タイトルが空の場合はドメイン名を設定
            if (!document.getElementById('bookmark-title').value) {
                document.getElementById('bookmark-title').value = domain;
            }
            
            // ファビコンURLを設定
            if (!document.getElementById('bookmark-favicon').value) {
                document.getElementById('bookmark-favicon').value = `https://www.google.com/s2/favicons?domain=${domain}`;
            }
            
            alert('サイト情報を取得しました');
        } catch (error) {
            alert('無効なURLです');
        }
    }

    // サムネイルプレビュー
    previewThumbnail(url) {
        const preview = document.getElementById('thumbnail-preview-img');
        if (url) {
            preview.src = url;
            preview.style.display = 'block';
            preview.onerror = () => {
                preview.style.display = 'none';
            };
        } else {
            preview.style.display = 'none';
        }
    }

    // ブックマーク保存
    saveBookmark() {
        const form = document.getElementById('bookmark-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const url = document.getElementById('bookmark-url').value;
        const title = document.getElementById('bookmark-title').value;
        const description = document.getElementById('bookmark-description').value;
        const category = document.getElementById('bookmark-category').value;
        const tags = document.getElementById('bookmark-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        const favicon = document.getElementById('bookmark-favicon').value;
        const thumbnail = document.getElementById('bookmark-thumbnail').value;

        const bookmark = {
            id: this.editingBookmarkId || this.generateId(),
            url,
            title,
            description,
            category,
            tags,
            favicon,
            thumbnail,
            createdAt: this.editingBookmarkId ? 
                this.bookmarks.find(b => b.id === this.editingBookmarkId).createdAt :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.editingBookmarkId) {
            const index = this.bookmarks.findIndex(b => b.id === this.editingBookmarkId);
            this.bookmarks[index] = bookmark;
        } else {
            this.bookmarks.unshift(bookmark);
        }

        this.saveBookmarks();
        this.applyFilters();
        this.updateStats();
        this.renderTagCloud();
        this.closeModal();
    }

    // ブックマーク削除
    deleteBookmark() {
        if (!this.editingBookmarkId) return;
        
        if (confirm('このブックマークを削除しますか？')) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== this.editingBookmarkId);
            this.saveBookmarks();
            this.applyFilters();
            this.updateStats();
            this.renderTagCloud();
            this.closeModal();
        }
    }

    // ID生成
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ローカルストレージに保存
    saveBookmarks() {
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    // モーダルを閉じる
    closeModal() {
        document.getElementById('bookmark-modal').style.display = 'none';
        this.editingBookmarkId = null;
    }

    closeDetailModal() {
        document.getElementById('detail-modal').style.display = 'none';
    }
}

// グローバル関数
function showAddModal() {
    bookmarkManager.showAddModal();
}

function closeModal() {
    bookmarkManager.closeModal();
}

function closeDetailModal() {
    bookmarkManager.closeDetailModal();
}

// 初期化
let bookmarkManager;
document.addEventListener('DOMContentLoaded', () => {
    bookmarkManager = new BookmarkManager();
});