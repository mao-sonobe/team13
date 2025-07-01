document.addEventListener('DOMContentLoaded', () => {
    // URLからトイレIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const toiletId = urlParams.get('id');
    
    if (!toiletId) {
        window.location.href = 'index.html';
        return;
    }
    
    // 本来はAPIからデータ取得
    // ダミーデータを使用
    const toiletData = {
        id: toiletId,
        name: '東京駅八重洲口トイレ',
        address: '東京都千代田区丸の内1丁目',
        distance: '210m',
        time: '約3分',
        facilities: [
            { id: 'baby', name: 'ベビーベッド', icon: '👶' },
            { id: 'multipurpose', name: '多目的トイレ', icon: '♿' },
            { id: 'handdryer', name: 'ハンドドライヤー', icon: '💨' }
        ],
        photos: [
            'img/sample-toilet-1.jpeg',
            'img/sample-toilet-2.jpg'
        ]
    };
    
    displayToiletDetails(toiletData);
    
    // ボタンイベントリスナー設定
    document.getElementById('navigate-button').addEventListener('click', () => {
        // Google Mapsで経路案内を開く
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${toiletData.address}`;
        window.open(mapUrl, '_blank');
    });
    
    document.getElementById('not-exist-button').addEventListener('click', () => {
        if (confirm('このトイレが存在しないと報告しますか？')) {
            alert('報告ありがとうございます。確認いたします。');
        }
    });
    
    document.getElementById('missing-facility-button').addEventListener('click', () => {
        // 実際の実装では、モーダルやフォームを表示
        alert('設備の不足または破損を報告する機能は開発中です。');
    });
});

function displayToiletDetails(toilet) {
    document.getElementById('toilet-title').innerText = toilet.name;
    document.getElementById('toilet-address').innerText = toilet.address;
    document.getElementById('toilet-distance').innerText = `${toilet.distance} (${toilet.time})`;
    
    // 設備アイコンの表示
    const facilityContainer = document.querySelector('.facility-icons');
    facilityContainer.innerHTML = '';
    
    toilet.facilities.forEach(facility => {
        const facilityEl = document.createElement('div');
        facilityEl.className = 'facility-icon';
        facilityEl.innerHTML = `
            <div class="icon">${facility.icon}</div>
            <div class="name">${facility.name}</div>
        `;
        facilityContainer.appendChild(facilityEl);
    });
    
    // 写真ギャラリーの表示
    const galleryContainer = document.querySelector('.photo-gallery');
    galleryContainer.innerHTML = '';
    
    if (toilet.photos && toilet.photos.length > 0) {
        toilet.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = toilet.name;
            galleryContainer.appendChild(img);
        });
    } else {
        galleryContainer.innerHTML = '<p>写真はありません</p>';
    }
}