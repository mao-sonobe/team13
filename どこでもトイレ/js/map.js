// 地図とマーカーの変数
let map;
let currentLocationMarker;
let toiletMarkers = [];
let userPosition = null;

// マップの初期化
function initMap() {
    // 東京駅周辺を初期表示
    map = L.map('map-container').setView([35.6812, 139.7671], 15);
    
    // OpenStreetMapのタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // 現在位置にマーカー表示
                currentLocationMarker = L.circleMarker([currentLocation.lat, currentLocation.lng], {
                    color: '#fff',
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    radius: 8,
                    weight: 2
                }).addTo(map);
                
                // 地図を現在地に移動
                map.setView([currentLocation.lat, currentLocation.lng], 16);
                
                // 近くのトイレを検索
                searchNearbyToilets(currentLocation);
            },
            () => {
                console.log('位置情報を取得できませんでした');
                // エラー時はデフォルト位置（東京駅）のトイレを表示
                searchNearbyToilets({ lat: 35.6812, lng: 139.7671 });
            }
        );
    } else {
        // 位置情報が利用できない場合はデフォルト位置のトイレを表示
        searchNearbyToilets({ lat: 35.6812, lng: 139.7671 });
    }
    
    // 登録ボタンの設定
    document.getElementById('add-toilet').addEventListener('click', () => {
        window.location.href = 'add-toilet.html';
    });
    
    // フィルターボタンの設定
    document.getElementById('filter-button').addEventListener('click', () => {
        // MVPではアラートのみ
        alert('フィルター機能は近日公開予定です');
    });
}

function searchNearbyToilets(location) {
    // 本来はAPIからデータ取得
    // ダミーデータを使用
    const dummyToilets = [
        {
            id: 1,
            name: '東京駅八重洲口トイレ',
            lat: 35.6814,
            lng: 139.7672,
            distance: '210m',
            time: '約3分',
            facilities: ['baby', 'multipurpose', 'handdryer']
        },
        {
            id: 2,
            name: '丸の内ビルディングトイレ',
            lat: 35.6811,
            lng: 139.7664,
            distance: '350m',
            time: '約5分',
            facilities: ['baby', 'ostomate']
        },
        {
            id: 3,
            name: '行幸通り公衆トイレ',
            lat: 35.6827,
            lng: 139.7669,
            distance: '420m',
            time: '約6分',
            facilities: ['multipurpose']
        }
    ];

    // 現在地からの距離を計算して追加
    const userLatLng = L.latLng(location.lat, location.lng);
    dummyToilets.forEach(toilet => {
        const toiletLatLng = L.latLng(toilet.lat, toilet.lng);
        const distance = userLatLng.distanceTo(toiletLatLng);  // 単位: メートル

        toilet.distance = distance >= 1000
            ? `${(distance / 1000).toFixed(2)}km`
            : `${Math.round(distance)}m`;
    });

    displayToilets(dummyToilets);
}

function displayToilets(toilets) {
    // 既存のマーカーをクリア
    toiletMarkers.forEach(marker => map.removeLayer(marker));
    toiletMarkers = [];
    
    // マーカー表示
    toilets.forEach(toilet => {
        // カスタムアイコンの作成
        const toiletIcon = L.icon({
            iconUrl: 'img/toilet-pin.jpg',  // トイレアイコン画像へのパス
            iconSize: [32, 32],  // アイコンサイズ
            iconAnchor: [16, 32], // アイコンのアンカーポイント
            popupAnchor: [0, -32] // ポップアップのアンカーポイント
        });
        
        // 画像ファイルがない場合は代替手段としてデフォルトマーカーを使用
        const marker = L.marker([toilet.lat, toilet.lng], {
            icon: toiletIcon, // トイレアイコンがない場合は削除してデフォルトマーカーを使用
            title: toilet.name
        }).addTo(map);
        
        marker.bindPopup(`<b>${toilet.name}</b>
${toilet.distance} (${toilet.time})`);
        
        marker.on('click', () => {
            window.location.href = `toilet-detail.html?id=${toilet.id}`;
        });
        
        toiletMarkers.push(marker);
    });
    
    // リスト表示
    const listContainer = document.querySelector('.toilet-items');
    listContainer.innerHTML = '';
    
    toilets.forEach(toilet => {
        const item = document.createElement('div');
        item.className = 'toilet-item';
        item.innerHTML = `
            <div>
                <div class="toilet-name">${toilet.name}</div>
                <div class="toilet-distance">${toilet.distance} (${toilet.time})</div>
            </div>
            <div class="toilet-info-icon">›</div>
        `;
        
        item.addEventListener('click', () => {
            window.location.href = `toilet-detail.html?id=${toilet.id}`;
        });
        
        listContainer.appendChild(item);
    });
}

// ページ読み込み時に地図を初期化
document.addEventListener('DOMContentLoaded', initMap);