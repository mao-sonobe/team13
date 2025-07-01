// 地図とマーカーの変数
let map;
let marker;

// 地図の初期化
function initMap() {
    // 東京駅周辺を初期表示
    map = L.map('mini-map').setView([35.6812, 139.7671], 16);
    
    // OpenStreetMapのタイルレイヤーを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map.setView([pos.lat, pos.lng], 16);
                
                // 初期マーカー設定
                marker = L.marker([pos.lat, pos.lng], {
                    draggable: true
                }).addTo(map);
                
                // マーカードラッグ時の処理
                marker.on('dragend', function() {
                    // 逆ジオコーディングでアドレス取得（実装省略）
                    const latlng = marker.getLatLng();
                    console.log(`マーカー位置: ${latlng.lat}, ${latlng.lng}`);
                });
            },
            () => {
                console.log('位置情報を取得できませんでした');
                
                // デフォルト位置にマーカー設定
                marker = L.marker([35.6812, 139.7671], {
                    draggable: true
                }).addTo(map);
            }
        );
    } else {
        // デフォルト位置にマーカー設定
        marker = L.marker([35.6812, 139.7671], {
            draggable: true
        }).addTo(map);
    }
    
    // 地図クリック時にマーカー移動
    map.on('click', (event) => {
        const latlng = event.latlng;
        
        if (marker) {
            marker.setLatLng(latlng);
        } else {
            marker = L.marker(latlng, {
                draggable: true
            }).addTo(map);
        }
    });
}

// フォーム送信処理
document.getElementById('toilet-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // フォームからデータ取得
    const name = document.getElementById('toilet-name').value;
    const address = document.getElementById('toilet-address').value;
    
    const facilities = [];
    document.querySelectorAll('input[name="facilities"]:checked').forEach(checkbox => {
        facilities.push(checkbox.value);
    });
    
    // 位置情報取得
    let lat = null;
    let lng = null;
    
    if (marker) {
        const position = marker.getLatLng();
        lat = position.lat;
        lng = position.lng;
    }
    
    // 本番環境では、ここでAPIにデータを送信
    console.log({
        name,
        address,
        facilities,
        lat,
        lng
    });
    
    // 送信成功を表示
    alert('トイレ情報が登録されました！');
    
    // マップページに戻る
    window.location.href = 'index.html';
});

// ページ読み込み時に地図を初期化
document.addEventListener('DOMContentLoaded', initMap);