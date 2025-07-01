-- toilets テーブル: トイレの基本情報を格納します。
-- BOOLEAN型のカラムを追加して、特定の属性の有無を効率的に管理します。
CREATE TABLE toilets (
    id INT PRIMARY KEY AUTO_INCREMENT,                          -- トイレ情報ID (主キー)
    address VARCHAR(255) NOT NULL,                              -- 住所
    latitude DECIMAL(9, 6) NOT NULL,                            -- 緯度
    longitude DECIMAL(9, 6) NOT NULL,                           -- 経度
    is_multipurpose BOOLEAN DEFAULT FALSE,                      -- 多目的トイレか (はい/いいえ)
    is_wheelchair_accessible BOOLEAN DEFAULT FALSE,             -- 車椅子で利用可能か (はい/いいえ)
    has_diaper_changing_station BOOLEAN DEFAULT FALSE,          -- おむつ交換台があるか (はい/いいえ)
    is_24_hours BOOLEAN DEFAULT FALSE,                          -- 24時間利用可能か (はい/いいえ)
    has_washlet BOOLEAN DEFAULT FALSE,                          -- ウォシュレットがあるか (はい/いいえ)
    has_ostomy_equipment BOOLEAN DEFAULT FALSE,                 -- オストメイト設備があるか (はい/いいえ)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP              -- 登録時間
);

-- photos テーブル: トイレの写真を格納します。toiletsテーブルとは1対多の関係です。
CREATE TABLE photos (
    id INT PRIMARY KEY AUTO_INCREMENT,                          -- 写真ID (主キー)
    toilet_id INT NOT NULL,                                     -- トイレ情報ID (外部キー)
    photo_url VARCHAR(255) NOT NULL,                            -- 写真のURL
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,            -- アップロード時間
    FOREIGN KEY (toilet_id) REFERENCES toilets(id) ON DELETE CASCADE
);

-- equipment テーブル: 設備のマスターリストを格納します。（例: 「ウォシュレット」「オストメイト設備」など）
-- 上記のBOOLEAN項目以外の、より詳細な設備を管理します。
CREATE TABLE equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,                          -- 設備ID (主キー)
    name VARCHAR(100) NOT NULL UNIQUE                           -- 設備名
);

-- toilet_equipment テーブル: どのトイレにどの設備があるかを管理する中間テーブルです。（多対多）
CREATE TABLE toilet_equipment (
    toilet_id INT NOT NULL,                                     -- トイレ情報ID (外部キー)
    equipment_id INT NOT NULL,                                  -- 設備ID (外部キー)
    PRIMARY KEY (toilet_id, equipment_id),                      -- 複合主キー
    FOREIGN KEY (toilet_id) REFERENCES toilets(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

-- reviews テーブル: トイレの評価やコメント、問題報告を格納します。
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,                          -- レビューID (主キー)
    toilet_id INT NOT NULL,                                     -- トイレ情報ID (外部キー)
    rating INT CHECK (rating >= 1 AND rating <= 5),             -- 評価 (1から5の5段階評価)
    comment TEXT,                                               -- コメント
    is_problem_report BOOLEAN DEFAULT FALSE,                    -- これが問題報告であるか (はい/いいえ)
    problem_details TEXT,                                       -- 問題報告の詳細
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,             -- 投稿日
    FOREIGN KEY (toilet_id) REFERENCES toilets(id) ON DELETE CASCADE
);