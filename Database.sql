-- ユーザーテーブル
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    preferred_language VARCHAR(10) DEFAULT 'ja'
);

-- トイレ情報テーブル
CREATE TABLE toilets (
    toilet_id SERIAL PRIMARY KEY,
    toilet_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- トイレ設備テーブル
CREATE TABLE toilet_facilities (
    facility_id SERIAL PRIMARY KEY,
    toilet_id INT REFERENCES toilets(toilet_id) ON DELETE CASCADE,
    has_baby_bed BOOLEAN DEFAULT FALSE,
    has_multi_purpose BOOLEAN DEFAULT FALSE,
    has_ostomy BOOLEAN DEFAULT FALSE,
    has_hand_dryer BOOLEAN DEFAULT FALSE,
    has_toilet_paper BOOLEAN DEFAULT FALSE,
    has_western_toilet BOOLEAN DEFAULT FALSE,
    has_japanese_toilet BOOLEAN DEFAULT FALSE,
    has_urinal BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- トイレ評価テーブル
CREATE TABLE toilet_ratings (
    rating_id SERIAL PRIMARY KEY,
    toilet_id INT REFERENCES toilets(toilet_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id),
    cleanliness_rating INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(toilet_id, user_id)
);

-- トイレ写真テーブル
CREATE TABLE toilet_photos (
    photo_id SERIAL PRIMARY KEY,
    toilet_id INT REFERENCES toilets(toilet_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id),
    photo_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE
);

-- トイレ報告テーブル（なかった報告・不足設備報告）
CREATE TABLE toilet_reports (
    report_id SERIAL PRIMARY KEY,
    toilet_id INT REFERENCES toilets(toilet_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id),
    report_type VARCHAR(50) NOT NULL, -- 'not_found', 'missing_facility', 'broken_facility'
    facility_type VARCHAR(50), -- 報告対象の設備タイプ
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, resolved, rejected
);

-- アクセスログテーブル（オプション - 統計目的）
CREATE TABLE access_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    toilet_id INT REFERENCES toilets(toilet_id),
    action_type VARCHAR(50) NOT NULL, -- 'view', 'search', 'rate', 'report', etc.
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成（パフォーマンス向上用）
CREATE INDEX idx_toilets_location ON toilets(latitude, longitude);
CREATE INDEX idx_toilets_active ON toilets(is_active);
CREATE INDEX idx_toilet_reports_status ON toilet_reports(status);
CREATE INDEX idx_toilet_ratings_toilet ON toilet_ratings(toilet_id);

[out:json][timeout:300];
// 日本全国のトイレを取得
area["name"="日本"]->.japan;
(
  node["amenity"="toilets"](area.japan);
  way["amenity"="toilets"](area.japan);
  relation["amenity"="toilets"](area.japan);
);
out body;
>;
out skel qt;