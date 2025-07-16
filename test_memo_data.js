// メモデータのサンプルと検証用スクリプト
// ブラウザのコンソールで実行してください

// 現在のメモデータを確認
console.log("現在のメモデータ:", JSON.parse(localStorage.getItem('memos') || '[]'));

// サンプルメモデータを作成
const sampleMemos = [
    {
        id: 1642089600000, // 2022-01-13のタイムスタンプ
        title: "会議メモ - プロジェクト開発",
        content: "# 会議メモ\n## 参加者\n- 田中さん\n- 佐藤さん\n\n## 議題\n1. 新機能の仕様確認\n2. スケジュール調整",
        category: "会議",
        tags: ["開発", "プロジェクト"],
        createdAt: "2022-01-13T09:00:00.000Z",
        updatedAt: "2022-01-13T09:30:00.000Z"
    },
    {
        id: 1642176000000, // 2022-01-14のタイムスタンプ
        title: "アイデア - 新機能提案",
        content: "ユーザーが簡単にデータをエクスポートできる機能を追加してはどうか？",
        category: "アイデア",
        tags: ["機能", "UX"],
        createdAt: "2022-01-14T10:00:00.000Z",
        updatedAt: "2022-01-14T10:15:00.000Z"
    },
    {
        id: Date.now(), // 今日のタイムスタンプ
        title: "今日のメモ",
        content: "今日作成されたメモです。",
        category: "その他",
        tags: ["テスト"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// サンプルデータをlocalStorageに保存
localStorage.setItem('memos', JSON.stringify(sampleMemos));

// 保存後のデータを確認
console.log("保存後のメモデータ:", JSON.parse(localStorage.getItem('memos')));

// 今日のメモをフィルタリング
const today = new Date().toISOString().split('T')[0];
const todayMemos = sampleMemos.filter(memo => 
    memo.createdAt && memo.createdAt.startsWith(today)
);
console.log("今日のメモ:", todayMemos);

// 1週間以内のメモをフィルタリング
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const recentMemos = sampleMemos.filter(memo => {
    const memoDate = new Date(memo.updatedAt || memo.createdAt);
    return memoDate >= oneWeekAgo;
});
console.log("1週間以内のメモ:", recentMemos);

// 日時フィルタリング処理のテスト
function testDateFiltering() {
    console.log("\n=== 日時フィルタリングテスト ===");
    
    sampleMemos.forEach(memo => {
        const createdDate = new Date(memo.createdAt);
        const updatedDate = new Date(memo.updatedAt || memo.createdAt);
        
        console.log(`\nメモ: ${memo.title}`);
        console.log(`  作成日時: ${memo.createdAt} (${createdDate.toLocaleDateString('ja-JP')})`);
        console.log(`  更新日時: ${memo.updatedAt} (${updatedDate.toLocaleDateString('ja-JP')})`);
        console.log(`  今日作成?: ${memo.createdAt.startsWith(today)}`);
        console.log(`  1週間以内?: ${updatedDate >= oneWeekAgo}`);
    });
}

testDateFiltering();