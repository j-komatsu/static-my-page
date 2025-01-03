# My Page アプリケーション

このアプリケーションは、簡単なプロジェクト管理やリンク編集、メモ管理を行うことができるウェブアプリケーションです。セクションごとにリンクを管理し、編集やエクスポート・インポート機能を備えています。

## 概要

- **目的**: プロジェクトやタスクごとに関連リンクを管理し、メモの作成・編集・削除ができる直感的なツール。
- **主な機能**:
  - セクションごとのリンク管理
  - セクション名の編集
  - リンクの追加・削除
  - データのエクスポート・インポート
  - メモの作成・編集・削除
- **対応画面**:
  - **トップページ**: 全体のプロジェクト概要を表示
  - **各プロジェクトページ (A, B, C, D)**: 各プロジェクト専用のリンク管理画面
  - **メモ管理ページ**: メモの作成・編集・削除を行う画面

## 使い方

### トップページ

1. **プロジェクトへの移動**:
   - 各プロジェクトへのリンク（例: プロジェクトA, B, C, D）が表示されます。
   - 選択したプロジェクトリンクをクリックして移動します。

2. **メモ管理ページへの移動**:
   - 「メモ管理」リンクをクリックして、メモ管理ページに移動します。

3. **Googleリンク**:
   - カラフルなGoogleロゴ風リンクをクリックすると、Googleのページが別タブで開きます。

### プロジェクトページ

1. **セクション管理**:
   - 各プロジェクトは6つのセクションで構成されています。
   - 各セクションは以下の内容を編集可能です。
     - **セクション名**: セクション名をクリックして編集し、フォーカスを外すと保存されます。
     - **リンク**:
       - リンクを追加する場合: 「リンクを編集」ボタンをクリックし、モーダルで入力。

2. **データ管理**:
   - ページ右下にある「エクスポート」「インポート」ボタンでデータの保存・復元が可能です。
     - **エクスポート**: 現在のデータをJSONファイルとして保存。
     - **インポート**: 保存したJSONファイルをアップロードしてデータを復元。

### メモ管理ページ

1. **メモの作成**:
   - タイトルと内容を入力して「メモを追加」ボタンをクリックすると、新しいメモが作成されます。

2. **メモの編集**:
   - メモ一覧から編集したいメモをクリックすると、タイトルと内容がフォームに表示されます。
   - 編集後、「メモを追加」ボタンをクリックすると変更が保存されます。

3. **メモの削除**:
   - メモ一覧から削除したいメモを選択し、「メモを削除」ボタンをクリックすると、そのメモが削除されます。

## 注意事項

- **ローカルストレージ**:
  - 各プロジェクトページおよびメモページのデータはブラウザのローカルストレージに保存されます。
  - 同一ブラウザ・同一デバイス以外ではデータを引き継ぐことはできません。
- **JSONフォーマット**:
  - インポート機能は正しいJSONフォーマットのデータを必要とします。
  - 不正なデータをインポートすると動作が不安定になる可能性があります。

## 備考

- **推奨ブラウザ**:
  - 最新のGoogle Chrome、Mozilla Firefox、Microsoft Edgeを推奨します。
- **拡張性**:
  - 必要に応じて、セクション数やデザインを調整可能。
  - メモ機能を拡張してカテゴリ別管理などを追加可能。
- **カスタマイズ**:
  - スタイル (CSS) を変更することでデザインを自由にカスタマイズできます。
  - JavaScriptのロジックを拡張して追加機能を実装することも可能です。

---

## 開発者向け情報

### ファイル構成

アプリケーションのファイル構成は以下の通りです。

- **index.html** (トップページ)
- **project-a.html** (プロジェクトAページ)
- **project-b.html** (プロジェクトBページ)
- **project-c.html** (プロジェクトCページ)
- **project-d.html** (プロジェクトDページ)
- **memo-page.html** (メモ管理ページ)
- **script.js** (アプリケーションのロジック)
- **MemoManager.js** (メモ管理ページ用ロジック)
- **style.css** (スタイルシート)
- **MemoManager.css** (メモ管理ページ用スタイルシート)

### 各ファイルの役割

1. **index.html**:  
   アプリケーションのトップページ。全体のプロジェクトリンクを管理。

2. **project-a.html ～ project-d.html**:  
   各プロジェクトページ。セクションごとのリンクやタイトルを管理。

3. **memo-page.html**:  
   メモ管理ページ。メモの作成・編集・削除が可能。

4. **script.js**:  
   アプリケーション全体の機能を担うJavaScriptファイル。リンクの編集やエクスポート・インポート、セクション名の編集を実装。

5. **MemoManager.js**:  
   メモ管理ページ専用のJavaScriptファイル。メモの作成・編集・削除、ローカルストレージとの同期を実装。

6. **style.css**:  
   アプリケーションの全体的なデザインを定義するスタイルシート。

7. **MemoManager.css**:  
   メモ管理ページ専用のデザインを定義するスタイルシート。

---

これでメモページの追加と利用方法が反映されたREADMEとなります。不明点や追加項目があればお知らせください！
