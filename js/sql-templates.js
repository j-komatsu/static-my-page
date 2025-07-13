// SQLテンプレート機能のJavaScript
// セキュリティを重視した実装

class SQLTemplateManager {
    constructor() {
        this.templates = this.initializeTemplates();
        this.currentTemplate = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTemplates('basic');
        this.setupSecurityMeasures();
        this.createTooltipElement();
    }

    // セキュリティ設定
    setupSecurityMeasures() {
        // 危険なSQLキーワードの定義
        this.dangerousKeywords = [
            'DROP', 'TRUNCATE', 'DELETE FROM', 'ALTER', 'CREATE', 
            'GRANT', 'REVOKE', 'EXECUTE', 'EXEC', 'xp_', 'sp_'
        ];

        // 入力値のセキュリティチェック
        this.securityPatterns = [
            /(\bdrop\b|\btruncate\b|\bdelete\s+from\b)/i,
            /(\balter\b|\bcreate\b|\bgrant\b|\brevoke\b)/i,
            /(\bexec\b|\bexecute\b|\bxp_|\bsp_)/i,
            /(--|\/\*|\*\/|;.*--)/,
            /(\bunion\b.*\bselect\b|\bor\b.*=.*)/i
        ];
    }

    // テンプレートデータの初期化
    initializeTemplates() {
        return {
            basic: [
                {
                    id: 'basic_select',
                    name: '基本SELECT',
                    description: 'シンプルなSELECT文',
                    template: 'SELECT {{columns}}\nFROM {{table_name}}\nWHERE {{condition}};',
                    example: 'SELECT id, name, email\nFROM users\nWHERE status = \'active\';',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得するカラム (*, column1, column2)', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'select_distinct',
                    name: 'SELECT DISTINCT',
                    description: '重複を除いた取得',
                    template: 'SELECT DISTINCT {{columns}}\nFROM {{table_name}}\nWHERE {{condition}}\nORDER BY {{order_by}};',
                    example: 'SELECT DISTINCT department\nFROM employees\nWHERE status = \'active\'\nORDER BY department;',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得するカラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false },
                        { name: 'order_by', type: 'text', description: 'ソート順', required: false }
                    ]
                },
                {
                    id: 'select_limit',
                    name: 'SELECT with LIMIT',
                    description: '件数制限付き取得',
                    template: 'SELECT {{columns}}\nFROM {{table_name}}\nWHERE {{condition}}\nORDER BY {{order_by}}\nLIMIT {{limit_count}};',
                    example: 'SELECT name, salary\nFROM employees\nWHERE department = \'IT\'\nORDER BY salary DESC\nLIMIT 10;',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得するカラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false },
                        { name: 'order_by', type: 'text', description: 'ソート順', required: true },
                        { name: 'limit_count', type: 'text', description: '取得件数', required: true }
                    ]
                },
                {
                    id: 'basic_insert',
                    name: '基本INSERT',
                    description: 'データ挿入文',
                    template: 'INSERT INTO {{table_name}} ({{columns}})\nVALUES ({{values}});',
                    example: 'INSERT INTO users (name, email, department)\nVALUES (\'John Doe\', \'john@example.com\', \'IT\');',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'columns', type: 'text', description: 'カラム名 (column1, column2)', required: true },
                        { name: 'values', type: 'text', description: '挿入する値 (value1, value2)', required: true }
                    ]
                },
                {
                    id: 'insert_multiple',
                    name: '複数行INSERT',
                    description: '複数レコードの一括挿入',
                    template: 'INSERT INTO {{table_name}} ({{columns}})\nVALUES \n    ({{values1}}),\n    ({{values2}}),\n    ({{values3}});',
                    example: 'INSERT INTO products (name, price, category)\nVALUES \n    (\'Laptop\', 999.99, \'Electronics\'),\n    (\'Mouse\', 29.99, \'Electronics\'),\n    (\'Desk\', 199.99, \'Furniture\');',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'columns', type: 'text', description: 'カラム名 (column1, column2)', required: true },
                        { name: 'values1', type: 'text', description: '1行目の値', required: true },
                        { name: 'values2', type: 'text', description: '2行目の値', required: true },
                        { name: 'values3', type: 'text', description: '3行目の値', required: false }
                    ]
                },
                {
                    id: 'basic_update',
                    name: '基本UPDATE',
                    description: 'データ更新文',
                    template: 'UPDATE {{table_name}}\nSET {{set_clause}}\nWHERE {{condition}};',
                    example: 'UPDATE employees\nSET salary = 75000, department = \'Senior IT\'\nWHERE employee_id = 123;',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'set_clause', type: 'text', description: 'SET句 (column1 = value1)', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: true }
                    ]
                },
                {
                    id: 'basic_delete',
                    name: '基本DELETE',
                    description: 'データ削除文',
                    template: 'DELETE FROM {{table_name}}\nWHERE {{condition}};',
                    example: 'DELETE FROM users\nWHERE status = \'inactive\' AND last_login < \'2023-01-01\';',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: true }
                    ]
                }
            ],
            join: [
                {
                    id: 'inner_join',
                    name: 'INNER JOIN',
                    description: '内部結合クエリ',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nINNER JOIN {{table2}} t2 ON t1.{{join_key}} = t2.{{join_key}}\nWHERE {{condition}};',
                    example: 'SELECT u.name, p.title\nFROM users u\nINNER JOIN posts p ON u.id = p.user_id\nWHERE u.status = \'active\';',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'table2', type: 'table', description: '結合テーブル', required: true },
                        { name: 'join_key', type: 'column', description: '結合キー', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'left_join',
                    name: 'LEFT JOIN',
                    description: '左外部結合クエリ',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nLEFT JOIN {{table2}} t2 ON t1.{{join_key}} = t2.{{join_key}}\nWHERE {{condition}};',
                    example: 'SELECT u.name, p.title\nFROM users u\nLEFT JOIN posts p ON u.id = p.user_id\nWHERE u.department = \'Marketing\';',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'table2', type: 'table', description: '結合テーブル', required: true },
                        { name: 'join_key', type: 'column', description: '結合キー', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'right_join',
                    name: 'RIGHT JOIN',
                    description: '右外部結合クエリ',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nRIGHT JOIN {{table2}} t2 ON t1.{{join_key}} = t2.{{join_key}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'table2', type: 'table', description: '結合テーブル', required: true },
                        { name: 'join_key', type: 'column', description: '結合キー', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'full_outer_join',
                    name: 'FULL OUTER JOIN',
                    description: '完全外部結合クエリ',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nFULL OUTER JOIN {{table2}} t2 ON t1.{{join_key}} = t2.{{join_key}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'table2', type: 'table', description: '結合テーブル', required: true },
                        { name: 'join_key', type: 'column', description: '結合キー', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'cross_join',
                    name: 'CROSS JOIN',
                    description: 'クロス結合（直積）',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nCROSS JOIN {{table2}} t2\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'table2', type: 'table', description: '結合テーブル', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'self_join',
                    name: 'SELF JOIN',
                    description: '自己結合',
                    template: 'SELECT {{select_fields}}\nFROM {{table_name}} t1\nINNER JOIN {{table_name}} t2 ON t1.{{join_condition}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'join_condition', type: 'text', description: '結合条件', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'multiple_join',
                    name: '3テーブル結合',
                    description: '複数テーブルの結合',
                    template: 'SELECT {{select_fields}}\nFROM {{table1}} t1\nINNER JOIN {{table2}} t2 ON t1.{{join_key1}} = t2.{{join_key1}}\nINNER JOIN {{table3}} t3 ON t2.{{join_key2}} = t3.{{join_key2}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'select_fields', type: 'text', description: '取得フィールド', required: true },
                        { name: 'table1', type: 'table', description: '1つ目のテーブル', required: true },
                        { name: 'table2', type: 'table', description: '2つ目のテーブル', required: true },
                        { name: 'table3', type: 'table', description: '3つ目のテーブル', required: true },
                        { name: 'join_key1', type: 'column', description: '1つ目の結合キー', required: true },
                        { name: 'join_key2', type: 'column', description: '2つ目の結合キー', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                }
            ],
            aggregate: [
                {
                    id: 'group_by',
                    name: 'GROUP BY集計',
                    description: 'グループ化による集計',
                    template: 'SELECT {{group_columns}}, {{aggregate_functions}}\nFROM {{table_name}}\nWHERE {{condition}}\nGROUP BY {{group_columns}}\nHAVING {{having_condition}};',
                    example: 'SELECT department, COUNT(*) as emp_count\nFROM employees\nWHERE status = \'active\'\nGROUP BY department\nHAVING COUNT(*) > 5;',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: 'グループ化カラム', required: true },
                        { name: 'aggregate_functions', type: 'text', description: '集計関数 (COUNT(*), SUM(column))', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false },
                        { name: 'having_condition', type: 'text', description: 'HAVING条件', required: false }
                    ]
                },
                {
                    id: 'count_distinct',
                    name: 'COUNT DISTINCT',
                    description: 'ユニーク値の件数取得',
                    template: 'SELECT COUNT(DISTINCT {{column_name}}) as unique_count\nFROM {{table_name}}\nWHERE {{condition}};',
                    example: 'SELECT COUNT(DISTINCT department) as unique_departments\nFROM employees\nWHERE status = \'active\';',
                    placeholders: [
                        { name: 'column_name', type: 'column', description: 'カラム名', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'sum_group',
                    name: 'SUM集計',
                    description: '合計値の計算',
                    template: 'SELECT {{group_columns}}, SUM({{sum_column}}) as total_sum\nFROM {{table_name}}\nWHERE {{condition}}\nGROUP BY {{group_columns}};',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: 'グループ化カラム', required: false },
                        { name: 'sum_column', type: 'column', description: '合計対象カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'avg_group',
                    name: 'AVG集計',
                    description: '平均値の計算',
                    template: 'SELECT {{group_columns}}, AVG({{avg_column}}) as average\nFROM {{table_name}}\nWHERE {{condition}}\nGROUP BY {{group_columns}};',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: 'グループ化カラム', required: false },
                        { name: 'avg_column', type: 'column', description: '平均対象カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'min_max',
                    name: 'MIN/MAX集計',
                    description: '最小値・最大値の取得',
                    template: 'SELECT {{group_columns}}, MIN({{target_column}}) as min_value, MAX({{target_column}}) as max_value\nFROM {{table_name}}\nWHERE {{condition}}\nGROUP BY {{group_columns}};',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: 'グループ化カラム', required: false },
                        { name: 'target_column', type: 'column', description: '対象カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'count_group',
                    name: 'COUNT集計',
                    description: 'レコード数のカウント',
                    template: 'SELECT {{group_columns}}, COUNT(*) as record_count\nFROM {{table_name}}\nWHERE {{condition}}\nGROUP BY {{group_columns}}\nORDER BY record_count DESC;',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: 'グループ化カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                }
            ],
            window: [
                {
                    id: 'row_number',
                    name: 'ROW_NUMBER',
                    description: '行番号付与',
                    template: 'SELECT {{columns}},\n       ROW_NUMBER() OVER (PARTITION BY {{partition_by}} ORDER BY {{order_by}}) as row_num\nFROM {{table_name}}\nWHERE {{condition}};',
                    example: 'SELECT name, salary,\n       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num\nFROM employees\nWHERE status = \'active\';',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'partition_by', type: 'text', description: 'パーティション分割カラム', required: false },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'rank',
                    name: 'RANK',
                    description: '順位付け（同順位あり）',
                    template: 'SELECT {{columns}},\n       RANK() OVER (ORDER BY {{order_by}}) as rank_num\nFROM {{table_name}}\nWHERE {{condition}};',
                    example: 'SELECT name, score,\n       RANK() OVER (ORDER BY score DESC) as rank_num\nFROM students\nWHERE grade = 12;',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'dense_rank',
                    name: 'DENSE_RANK',
                    description: '密な順位付け',
                    template: 'SELECT {{columns}},\n       DENSE_RANK() OVER (ORDER BY {{order_by}}) as dense_rank_num\nFROM {{table_name}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'lag_lead',
                    name: 'LAG/LEAD',
                    description: '前後の行の値を取得',
                    template: 'SELECT {{columns}},\n       LAG({{target_column}}, 1) OVER (ORDER BY {{order_by}}) as previous_value,\n       LEAD({{target_column}}, 1) OVER (ORDER BY {{order_by}}) as next_value\nFROM {{table_name}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'target_column', type: 'column', description: '対象カラム', required: true },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'moving_avg',
                    name: '移動平均',
                    description: '移動平均の計算',
                    template: 'SELECT {{columns}},\n       AVG({{target_column}}) OVER (ORDER BY {{order_by}} ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg\nFROM {{table_name}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'target_column', type: 'column', description: '対象カラム', required: true },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'cumulative_sum',
                    name: '累積合計',
                    description: '累積合計の計算',
                    template: 'SELECT {{columns}},\n       SUM({{target_column}}) OVER (ORDER BY {{order_by}} ROWS UNBOUNDED PRECEDING) as cumulative_sum\nFROM {{table_name}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'target_column', type: 'column', description: '対象カラム', required: true },
                        { name: 'order_by', type: 'text', description: 'ソート順カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                }
            ],
            subquery: [
                {
                    id: 'subquery_where',
                    name: 'WHEREサブクエリ',
                    description: 'WHERE句でのサブクエリ使用',
                    template: 'SELECT {{columns}}\nFROM {{main_table}}\nWHERE {{column_name}} IN (\n    SELECT {{sub_column}}\n    FROM {{sub_table}}\n    WHERE {{sub_condition}}\n);',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'main_table', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'column_name', type: 'column', description: '条件カラム', required: true },
                        { name: 'sub_column', type: 'column', description: 'サブクエリのカラム', required: true },
                        { name: 'sub_table', type: 'table', description: 'サブクエリのテーブル', required: true },
                        { name: 'sub_condition', type: 'text', description: 'サブクエリの条件', required: false }
                    ]
                },
                {
                    id: 'exists_subquery',
                    name: 'EXISTSサブクエリ',
                    description: 'EXISTSでの存在チェック',
                    template: 'SELECT {{columns}}\nFROM {{main_table}} t1\nWHERE EXISTS (\n    SELECT 1\n    FROM {{sub_table}} t2\n    WHERE t1.{{join_column}} = t2.{{join_column}}\n    AND {{sub_condition}}\n);',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'main_table', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'sub_table', type: 'table', description: 'サブクエリのテーブル', required: true },
                        { name: 'join_column', type: 'column', description: '結合キー', required: true },
                        { name: 'sub_condition', type: 'text', description: 'サブクエリの条件', required: false }
                    ]
                },
                {
                    id: 'scalar_subquery',
                    name: 'スカラーサブクエリ',
                    description: 'SELECT句でのサブクエリ',
                    template: 'SELECT {{columns}},\n       (SELECT {{sub_column}} FROM {{sub_table}} WHERE {{sub_condition}}) as {{alias_name}}\nFROM {{main_table}}\nWHERE {{main_condition}};',
                    placeholders: [
                        { name: 'columns', type: 'text', description: '取得カラム', required: true },
                        { name: 'sub_column', type: 'column', description: 'サブクエリのカラム', required: true },
                        { name: 'sub_table', type: 'table', description: 'サブクエリのテーブル', required: true },
                        { name: 'sub_condition', type: 'text', description: 'サブクエリの条件', required: true },
                        { name: 'alias_name', type: 'text', description: 'エイリアス名', required: true },
                        { name: 'main_table', type: 'table', description: 'メインテーブル', required: true },
                        { name: 'main_condition', type: 'text', description: 'メインの条件', required: false }
                    ]
                }
            ],
            cte: [
                {
                    id: 'simple_cte',
                    name: '簡単CTE',
                    description: '共通テーブル式の基本形',
                    template: 'WITH {{cte_name}} AS (\n    SELECT {{cte_columns}}\n    FROM {{cte_table}}\n    WHERE {{cte_condition}}\n)\nSELECT {{main_columns}}\nFROM {{cte_name}}\nWHERE {{main_condition}};',
                    placeholders: [
                        { name: 'cte_name', type: 'text', description: 'CTE名', required: true },
                        { name: 'cte_columns', type: 'text', description: 'CTEのカラム', required: true },
                        { name: 'cte_table', type: 'table', description: 'CTEのソーステーブル', required: true },
                        { name: 'cte_condition', type: 'text', description: 'CTEの条件', required: false },
                        { name: 'main_columns', type: 'text', description: 'メインクエリのカラム', required: true },
                        { name: 'main_condition', type: 'text', description: 'メインクエリの条件', required: false }
                    ]
                },
                {
                    id: 'recursive_cte',
                    name: '再帰CTE',
                    description: '再帰的な共通テーブル式',
                    template: 'WITH RECURSIVE {{cte_name}} AS (\n    -- ベースケース\n    SELECT {{base_columns}}\n    FROM {{base_table}}\n    WHERE {{base_condition}}\n    \n    UNION ALL\n    \n    -- 再帰ケース\n    SELECT {{recursive_columns}}\n    FROM {{recursive_table}} t\n    JOIN {{cte_name}} c ON {{join_condition}}\n)\nSELECT {{final_columns}}\nFROM {{cte_name}};',
                    placeholders: [
                        { name: 'cte_name', type: 'text', description: 'CTE名', required: true },
                        { name: 'base_columns', type: 'text', description: 'ベースケースのカラム', required: true },
                        { name: 'base_table', type: 'table', description: 'ベーステーブル', required: true },
                        { name: 'base_condition', type: 'text', description: 'ベース条件', required: true },
                        { name: 'recursive_columns', type: 'text', description: '再帰ケースのカラム', required: true },
                        { name: 'recursive_table', type: 'table', description: '再帰テーブル', required: true },
                        { name: 'join_condition', type: 'text', description: '結合条件', required: true },
                        { name: 'final_columns', type: 'text', description: '最終結果のカラム', required: true }
                    ]
                }
            ],
            analysis: [
                {
                    id: 'data_quality',
                    name: 'データ品質チェック',
                    description: 'NULL値や重複の確認',
                    template: 'SELECT \n    COUNT(*) as total_rows,\n    COUNT({{check_column}}) as non_null_rows,\n    COUNT(*) - COUNT({{check_column}}) as null_rows,\n    COUNT(DISTINCT {{check_column}}) as unique_values\nFROM {{table_name}};',
                    placeholders: [
                        { name: 'check_column', type: 'column', description: 'チェック対象カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true }
                    ]
                },
                {
                    id: 'statistical_summary',
                    name: '統計サマリー',
                    description: '数値カラムの統計情報',
                    template: 'SELECT \n    COUNT({{numeric_column}}) as count,\n    AVG({{numeric_column}}) as average,\n    MIN({{numeric_column}}) as minimum,\n    MAX({{numeric_column}}) as maximum,\n    STDDEV({{numeric_column}}) as std_deviation\nFROM {{table_name}}\nWHERE {{condition}};',
                    placeholders: [
                        { name: 'numeric_column', type: 'column', description: '数値カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true },
                        { name: 'condition', type: 'text', description: 'WHERE条件', required: false }
                    ]
                },
                {
                    id: 'duplicate_check',
                    name: '重複データ検出',
                    description: '重複レコードの検出',
                    template: 'SELECT {{group_columns}}, COUNT(*) as duplicate_count\nFROM {{table_name}}\nGROUP BY {{group_columns}}\nHAVING COUNT(*) > 1\nORDER BY duplicate_count DESC;',
                    placeholders: [
                        { name: 'group_columns', type: 'text', description: '重複チェック対象カラム', required: true },
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true }
                    ]
                }
            ],
            maintenance: [
                {
                    id: 'table_info',
                    name: 'テーブル情報取得',
                    description: 'テーブルの構造情報',
                    template: 'DESCRIBE {{table_name}};\n-- または\n-- SHOW COLUMNS FROM {{table_name}};',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true }
                    ]
                },
                {
                    id: 'index_info',
                    name: 'インデックス情報',
                    description: 'テーブルのインデックス一覧',
                    template: 'SHOW INDEX FROM {{table_name}};',
                    placeholders: [
                        { name: 'table_name', type: 'table', description: 'テーブル名', required: true }
                    ]
                },
                {
                    id: 'explain_plan',
                    name: '実行計画表示',
                    description: 'SQLの実行計画を表示',
                    template: 'EXPLAIN {{sql_statement}};',
                    placeholders: [
                        { name: 'sql_statement', type: 'textarea', description: '分析対象のSQL文', required: true }
                    ]
                }
            ]
        };
    }

    setupEventListeners() {
        // カテゴリプルダウンのイベント
        document.getElementById('category-select').addEventListener('change', (e) => {
            const category = e.target.value;
            this.switchCategory(category);
        });

        // フォーム関連のイベント
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateSQL();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearForm();
        });

        // 出力関連のイベント
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copySQL();
        });

        document.getElementById('format-btn').addEventListener('click', () => {
            this.formatSQL();
        });

        document.getElementById('validate-btn').addEventListener('click', () => {
            this.validateSQL();
        });

        // フォーム入力の監視
        document.addEventListener('input', (e) => {
            if (e.target.closest('#parameter-form')) {
                this.updateGenerateButton();
                this.performSecurityCheck(e.target.value);
            }
        });
    }

    switchCategory(category) {
        // プルダウンの値を更新
        document.getElementById('category-select').value = category;

        // テンプレート一覧を更新
        this.renderTemplates(category);
    }

    renderTemplates(category) {
        const templateList = document.getElementById('template-list');
        const templates = this.templates[category] || [];

        templateList.innerHTML = templates.map(template => `
            <div class="template-item" data-template-id="${template.id}">
                <div class="template-content">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
                <button class="info-button" data-template-id="${template.id}" title="詳細を表示">
                    <span>?</span>
                </button>
            </div>
        `).join('');

        // テンプレート選択のイベント
        templateList.querySelectorAll('.template-item .template-content').forEach(content => {
            content.addEventListener('click', (e) => {
                const templateId = e.currentTarget.closest('.template-item').dataset.templateId;
                this.selectTemplate(templateId);
            });
        });

        // 説明ボタンのイベント
        templateList.querySelectorAll('.info-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // バブリングを防ぐ
                const templateId = e.currentTarget.dataset.templateId;
                this.toggleTooltip(e.currentTarget, templateId);
            });
        });
    }

    selectTemplate(templateId) {
        // 全カテゴリからテンプレートを検索
        let selectedTemplate = null;
        for (const category in this.templates) {
            selectedTemplate = this.templates[category].find(t => t.id === templateId);
            if (selectedTemplate) break;
        }

        if (!selectedTemplate) return;

        this.currentTemplate = selectedTemplate;

        // 選択状態の更新
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-template-id="${templateId}"]`).classList.add('selected');

        // テンプレート情報の表示
        document.getElementById('selected-template-name').textContent = selectedTemplate.name;
        document.getElementById('selected-template-desc').textContent = selectedTemplate.description;

        // フォームの生成
        this.generateForm(selectedTemplate);
    }

    generateForm(template) {
        const form = document.getElementById('parameter-form');
        
        form.innerHTML = template.placeholders.map(placeholder => `
            <div class="form-group">
                <label for="${placeholder.name}">
                    ${placeholder.description}
                    ${placeholder.required ? '<span style="color: red;">*</span>' : ''}
                </label>
                ${placeholder.type === 'textarea' ? 
                    `<textarea id="${placeholder.name}" name="${placeholder.name}" 
                     placeholder="例: column1, column2" ${placeholder.required ? 'required' : ''}></textarea>` :
                    `<input type="text" id="${placeholder.name}" name="${placeholder.name}" 
                     placeholder="例: ${this.getPlaceholderExample(placeholder.type)}" 
                     ${placeholder.required ? 'required' : ''}>`
                }
            </div>
        `).join('');

        form.style.display = 'flex';
        this.updateGenerateButton();
    }

    getPlaceholderExample(type) {
        const examples = {
            'table': 'users',
            'column': 'user_id',
            'text': 'id, name, email'
        };
        return examples[type] || 'サンプル値';
    }

    updateGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        
        if (!this.currentTemplate) {
            generateBtn.disabled = true;
            return;
        }

        // テンプレートが選択されていれば常にSQL生成を可能にする
        generateBtn.disabled = false;
    }

    performSecurityCheck(value) {
        if (!value) return;

        const hasSecurityIssue = this.securityPatterns.some(pattern => 
            pattern.test(value)
        );

        if (hasSecurityIssue) {
            this.showSecurityWarning(value);
        }
    }

    showSecurityWarning(value) {
        // セキュリティ警告の表示
        const warningDiv = document.createElement('div');
        warningDiv.className = 'security-alert';
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            z-index: 1000;
            max-width: 300px;
        `;
        warningDiv.innerHTML = `
            <strong>🚨 セキュリティ警告</strong><br>
            危険なSQLキーワードが検出されました。<br>
            このツールは学習目的のみでご利用ください。
        `;

        document.body.appendChild(warningDiv);

        setTimeout(() => {
            warningDiv.remove();
        }, 5000);
    }

    generateSQL() {
        if (!this.currentTemplate) return;

        const form = document.getElementById('parameter-form');
        const formData = new FormData(form);
        
        let sql = this.currentTemplate.template;

        // プレースホルダーの置換
        this.currentTemplate.placeholders.forEach(placeholder => {
            let value = formData.get(placeholder.name) || '';
            
            // 空の場合はデフォルト値を使用
            if (!value.trim()) {
                value = this.getDefaultValue(placeholder);
            }
            
            const sanitizedValue = this.sanitizeInput(value);
            const regex = new RegExp(`\\{\\{${placeholder.name}\\}\\}`, 'g');
            sql = sql.replace(regex, sanitizedValue);
        });

        // 生成されたSQLの表示
        document.getElementById('generated-sql').textContent = sql;

        // ボタンの有効化
        document.getElementById('copy-btn').disabled = false;
        document.getElementById('format-btn').disabled = false;
        document.getElementById('validate-btn').disabled = false;
    }

    // デフォルト値を取得する関数
    getDefaultValue(placeholder) {
        const defaultValues = {
            // カラム関連
            'columns': '*',
            'select_fields': '*',
            'select_columns': '*',
            'group_columns': 'column1',
            'check_column': 'id',
            'column_name': 'id',
            'target_column': 'value',
            'numeric_column': 'amount',
            'avg_column': 'amount',
            'sum_column': 'amount',
            'sub_column': 'id',
            'join_key': 'id',
            'join_key1': 'id',
            'join_key2': 'id',
            'cte_columns': '*',
            'main_columns': '*',
            'base_columns': '*',
            'recursive_columns': '*',
            'final_columns': '*',
            'partition_by': 'category',
            'order_by': 'id',
            
            // テーブル関連
            'table_name': 'sample_table',
            'table1': 'table1',
            'table2': 'table2',
            'table3': 'table3',
            'main_table': 'main_table',
            'sub_table': 'sub_table',
            'cte_table': 'source_table',
            'base_table': 'base_table',
            'recursive_table': 'tree_table',
            
            // 条件関連
            'condition': '1=1',
            'main_condition': '1=1',
            'sub_condition': '1=1',
            'cte_condition': '1=1',
            'base_condition': 'parent_id IS NULL',
            'having_condition': 'COUNT(*) > 0',
            'join_condition': 'parent_id = id',
            
            // 値関連
            'values': "'value1', 'value2'",
            'values1': "'value1', 'value2'",
            'values2': "'value3', 'value4'",
            'values3': "'value5', 'value6'",
            'set_clause': 'column1 = value1',
            'limit_count': '10',
            'aggregate_functions': 'COUNT(*)',
            'alias_name': 'result',
            'cte_name': 'sample_cte',
            'sql_statement': 'SELECT * FROM table_name'
        };

        return defaultValues[placeholder.name] || `[${placeholder.description}]`;
    }

    sanitizeInput(input) {
        if (!input) return '';
        
        // 基本的なサニタイズ
        return input
            .replace(/[<>\"']/g, '') // HTMLタグと引用符を除去
            .replace(/\s+/g, ' ')    // 複数の空白を1つに
            .trim();
    }

    clearForm() {
        const form = document.getElementById('parameter-form');
        if (form) {
            form.reset();
            this.updateGenerateButton();
        }

        // SQL出力のクリア
        document.getElementById('generated-sql').textContent = 
            '-- 生成されたSQLがここに表示されます\n-- セキュリティのため、実際のテーブル名は保存されません';

        // ボタンの無効化
        document.getElementById('copy-btn').disabled = true;
        document.getElementById('format-btn').disabled = true;
        document.getElementById('validate-btn').disabled = true;

        // バリデーション結果のクリア
        const validationResult = document.getElementById('validation-result');
        validationResult.style.display = 'none';
    }

    copySQL() {
        const sqlCode = document.getElementById('generated-sql').textContent;
        
        navigator.clipboard.writeText(sqlCode).then(() => {
            this.showNotification('SQLをクリップボードにコピーしました', 'success');
        }).catch(() => {
            this.showNotification('コピーに失敗しました', 'error');
        });
    }

    formatSQL() {
        const sqlElement = document.getElementById('generated-sql');
        let sql = sqlElement.textContent;

        // 基本的なSQL整形
        sql = sql
            .replace(/\bSELECT\b/gi, 'SELECT')
            .replace(/\bFROM\b/gi, '\nFROM')
            .replace(/\bWHERE\b/gi, '\nWHERE')
            .replace(/\bJOIN\b/gi, '\nJOIN')
            .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
            .replace(/\bHAVING\b/gi, '\nHAVING')
            .replace(/\bORDER BY\b/gi, '\nORDER BY')
            .replace(/\bINSERT INTO\b/gi, 'INSERT INTO')
            .replace(/\bUPDATE\b/gi, 'UPDATE')
            .replace(/\bSET\b/gi, '\nSET')
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n');

        sqlElement.textContent = sql;
        this.showNotification('SQLを整形しました', 'success');
    }

    validateSQL() {
        const sql = document.getElementById('generated-sql').textContent;
        const validationResult = document.getElementById('validation-result');

        // 基本的なSQL構文チェック
        const issues = [];

        // セキュリティチェック
        this.securityPatterns.forEach(pattern => {
            if (pattern.test(sql)) {
                issues.push('危険なSQLキーワードが含まれています');
            }
        });

        // 構文チェック
        if (!sql.trim() || sql.includes('{{')) {
            issues.push('未入力のプレースホルダーがあります');
        }

        if (!/;\s*$/i.test(sql.trim())) {
            issues.push('セミコロンで終了していません');
        }

        // 結果の表示
        validationResult.style.display = 'block';
        
        if (issues.length === 0) {
            validationResult.className = 'validation-result success';
            validationResult.innerHTML = '✅ SQL構文に問題は見つかりませんでした';
        } else {
            validationResult.className = 'validation-result error';
            validationResult.innerHTML = `❌ 以下の問題が見つかりました:<br>• ${issues.join('<br>• ')}`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ツールチップ機能
    createTooltipElement() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        document.body.appendChild(this.tooltip);
        this.currentActiveButton = null;

        // 背景クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tooltip') && !e.target.closest('.info-button')) {
                this.hideTooltip();
            }
        });
    }

    toggleTooltip(button, templateId) {
        // 同じボタンが押された場合は閉じる
        if (this.currentActiveButton === button && this.tooltip.classList.contains('show')) {
            this.hideTooltip();
            return;
        }

        // 他のボタンがアクティブな場合は切り替える
        this.showTooltip(button, templateId);
    }

    showTooltip(element, templateId) {
        // 全カテゴリからテンプレートを検索
        let template = null;
        for (const category in this.templates) {
            template = this.templates[category].find(t => t.id === templateId);
            if (template) break;
        }

        if (!template) return;

        this.currentActiveButton = element;

        // ツールチップ内容を生成
        const tooltipContent = `
            <div class="tooltip-title">${template.name}</div>
            <div class="tooltip-description">${template.description}</div>
            ${template.example ? `
                <div class="tooltip-example-label">実行例:</div>
                <div class="tooltip-example">${template.example}</div>
            ` : ''}
            <button class="tooltip-close" onclick="this.closest('.tooltip').classList.remove('show')">×</button>
        `;

        this.tooltip.innerHTML = tooltipContent;
        this.tooltip.classList.remove('tooltip-bottom');

        // 位置を計算
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // ボタンの右側に表示
        let left = rect.right + scrollLeft + 10;
        let top = rect.top + scrollTop;

        // 画面右端を超える場合は左側に表示
        if (left + 350 > window.innerWidth - 10) {
            left = rect.left + scrollLeft - 350 - 10;
            if (left < 10) {
                // 左右どちらも無理な場合は下に表示
                left = rect.left + scrollLeft;
                top = rect.bottom + scrollTop + 10;
                this.tooltip.classList.add('tooltip-bottom');
            }
        }

        // 位置を設定
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        
        // 表示
        this.tooltip.classList.add('show');

        // ボタンのアクティブ状態を更新
        document.querySelectorAll('.info-button').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
            this.currentActiveButton = null;
            
            // すべてのボタンのアクティブ状態を解除
            document.querySelectorAll('.info-button').forEach(btn => btn.classList.remove('active'));
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new SQLTemplateManager();
});