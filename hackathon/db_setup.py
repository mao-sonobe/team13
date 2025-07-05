import requests
import sqlite3
import json
import time

def fetch_toilets_from_osm(bbox):
    query = f"""
    [out:json][timeout:25];
    (
        node["amenity"="toilets"]({bbox});
        way["amenity"="toilets"]({bbox});
        relation["amenity"="toilets"]({bbox});
    );
    out center;
    """

    url = "https://overpass-api.de/api/interpreter"
    response = requests.post(url, data={'data': query})
    response.raise_for_status()
    data = response.json()

    toilets = []
    for el in data.get('elements', []):
        lat = el.get('lat') or el.get('center', {}).get('lat')
        lon = el.get('lon') or el.get('center', {}).get('lon')
        tags = el.get('tags', {})

        toilet = {
            'id': el['id'],
            'name': tags.get('name', '公共トイレ'),
            'lat': lat,
            'lng': lon,
            'address': tags.get('full') or tags.get('street') or '住所不明',
            'facilities': json.dumps([
                *(["ベビーベッド"] if tags.get('changing_table') == 'yes' else []),
                *(["多目的トイレ"] if tags.get('wheelchair') == 'yes' else []),
                *(["オストメイト"] if tags.get('ostomy') == 'yes' else []),
                *(["ハンドドライヤー"] if tags.get('hand_dryer') == 'yes' else [])
            ]),
            'rating': 3.0,
            'cleanliness': 3,
            'comments': json.dumps([])
        }

        toilets.append(toilet)

    return toilets

def save_toilets_to_db(toilets, db_path='toilets.db'):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS toilets (
            id INTEGER PRIMARY KEY,
            name TEXT,
            lat REAL,
            lng REAL,
            address TEXT,
            facilities TEXT,
            rating REAL,
            cleanliness INTEGER,
            comments TEXT
        )
    ''')

    for toilet in toilets:
        c.execute('''
            INSERT OR REPLACE INTO toilets (id, name, lat, lng, address, facilities, rating, cleanliness, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            toilet['id'],
            toilet['name'],
            toilet['lat'],
            toilet['lng'],
            toilet['address'],
            toilet['facilities'],
            toilet['rating'],
            toilet['cleanliness'],
            toilet['comments']
        ))

    conn.commit()
    conn.close()

# 全国をカバーする bbox 一覧（例）
japan_bboxes = [
    "43.00,141.20,43.15,141.40",  # 北海道
    "38.20,140.85,38.35,141.05",  # 仙台
    "35.60,139.60,35.75,139.80",  # 東京
    "35.10,136.85,35.25,137.05",  # 名古屋
    "34.65,135.45,34.75,135.55",  # 大阪
    "34.35,132.45,34.45,132.55",  # 広島
    "33.55,130.35,33.65,130.45",  # 福岡
    "34.33,134.03,34.40,134.10",  # 高松
    "26.19,127.64,26.23,127.70",  # 那覇
]

# 実行
if __name__ == '__main__':
    all_toilets = []
    for bbox in japan_bboxes:
        try:
            print(f"Fetching bbox: {bbox}")
            toilets = fetch_toilets_from_osm(bbox)
            save_toilets_to_db(toilets)
            all_toilets.extend(toilets)
            print(f"✅ {len(toilets)} 件取得")
            time.sleep(5)  # API負荷を避けるための待機
        except Exception as e:
            print(f"❌ 取得失敗: {bbox} - {e}")

    print(f"\n🏁 合計 {len(all_toilets)} 件のトイレを保存しました")
