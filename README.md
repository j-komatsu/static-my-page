# My Page アプリケーション

## 🌐 公開ページ
**[https://j-komatsu.github.io/static-my-page/#main](https://j-komatsu.github.io/static-my-page/#main)**

このアプリケーションは、簡単なプロジェクト管理やリンク編集、メモ管理、TODOリスト管理を行うことができるウェブアプリケーションです。セクションごとにリンクを管理し、編集やエクスポート・インポート機能を備えています。

## 概要

- **目的**: プロジェクトやタスクごとに関連リンクを管理し、メモやTODOリストを直感的に作成・管理できるツール。
- **主な機能**:
  - セクションごとのリンク管理
  - セクション名の編集
  - リンクの追加・削除
  - TODOリストの作成・管理
  - メモの作成・編集・削除
  - データのエクスポート・インポート
- **対応画面**:
  - **トップページ**: 全体のプロジェクト概要を表示
  - **各プロジェクトページ (A, B, C, D)**: 各プロジェクト専用のリンク管理画面
  - **TODOリストページ**: タスクの作成・管理を行う画面
  - **メモ管理ページ**: メモの作成・編集・削除を行う画面

## 使い方

### トップページ

1. **プロジェクトへの移動**:
   - 各プロジェクトへのリンク（例: プロジェクトA, B, C, D）が表示されます。
   - 選択したプロジェクトリンクをクリックして移動します。

2. **TODOリストページへの移動**:
   - 「TODOリスト」リンクをクリックして、タスク管理画面に移動します。

3. **メモ管理ページへの移動**:
   - 「メモ管理」リンクをクリックして、メモ管理ページに移動します。

### TODOリストページ

1. **タスクの追加**:
   - タスク内容を入力し、「追加」ボタンをクリックすると、新しいタスクがリストに表示されます。

2. **タスクの完了**:
   - 各タスクのチェックボックスをクリックすると、そのタスクが完了済みとしてマークされます。

3. **タスクの削除**:
   - 各タスクに付いている「削除」ボタンをクリックすると、そのタスクがリストから削除されます。

4. **完了タスクの一括削除**:
   - 「完了タスクをすべて削除」ボタンをクリックすると、完了済みのタスクが全て削除されます。

---

## 注意事項

- **ローカルストレージ**:
  - TODOリストやメモページのデータはブラウザのローカルストレージに保存されます。
  - 同一ブラウザ・同一デバイス以外ではデータを引き継ぐことはできません。

---

## 開発者向け情報

### ファイル構成

アプリケーションのファイル構成は以下の通りです。

- **index.html** (トップページ)
- **project-a.html** (プロジェクトAページ)
- **project-b.html** (プロジェクトBページ)
- **project-c.html** (プロジェクトCページ)
- **project-d.html** (プロジェクトDページ)
- **todo.html** (TODOリストページ)
- **memo-page.html** (メモ管理ページ)
- **script.js** (アプリケーションのロジック)
- **todo-script.js** (TODOリストページ用ロジック)
- **MemoManager.js** (メモ管理ページ用ロジック)
- **style.css** (スタイルシート)
- **todo-style.css** (TODOリストページ専用スタイルシート)
- **MemoManager.css** (メモ管理ページ用スタイルシート)

### 各ファイルの役割

1. **todo.html**:  
   TODOリストページ。タスク管理機能を提供。

2. **todo-script.js**:  
   TODOリストページ専用のJavaScriptファイル。タスクの追加・削除・完了、ローカルストレージとの連携を実装。

3. **todo-style.css**:  
   TODOリストページ専用のデザインを定義するスタイルシート。

---

## プロジェクト情報

- **開発者**: J.Komatsu
- **プロジェクト**: 静的Webアプリケーション
- **公開**: GitHub Pages
- **最終更新**: 2025年7月
