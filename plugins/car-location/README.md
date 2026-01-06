# 🚗 Car Location Plugin

Otopark ve araç park yeri takip eklentisi. Haritadan bağımsız, modüler ve kolay entegre edilebilir.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Özellikler

- 🎯 **iOS Tarzı Picker** - Kat, Blok ve Numara seçimi
- 💾 **IndexedDB Depolama** - Kalıcı veri saklama
- 📡 **Cross-Tab Sync** - BroadcastChannel ile sekme senkronizasyonu
- 📸 **Fotoğraf Desteği** - Otomatik sıkıştırma ile
- 🎨 **Renk Kodlama** - Park yeri bölge renkleri
- 📱 **Responsive** - Mobil ve masaüstü uyumlu
- 🔌 **Modüler** - Backend ve Frontend ayrı

## 📁 Dosya Yapısı

```
plugins/car-location/
├── backend/
│   ├── js/
│   │   └── core.js          # Veri yönetimi, IndexedDB, Broadcast
│   └── data/
│       └── parking-spots.json # Park yeri verileri
├── frontend/
│   ├── js/
│   │   └── ui.js            # UI componentleri, Picker
│   └── css/
│       └── styles.css       # Tüm stiller
├── examples/
│   ├── basic.html           # Temel kullanım
│   ├── cdn-usage.html       # CDN ile kullanım
│   └── with-map.html        # Harita entegrasyonu
├── plugin.js                # Ana giriş noktası
└── README.md
```

## 🚀 Hızlı Başlangıç

### 1. Dosyaları Ekle

```html
<!-- CSS -->
<link rel="stylesheet" href="plugins/car-location/frontend/css/styles.css">

<!-- JavaScript -->
<script src="plugins/car-location/backend/js/core.js"></script>
<script src="plugins/car-location/frontend/js/ui.js"></script>
<script src="plugins/car-location/plugin.js"></script>
```

### 2. HTML Container

```html
<div id="app"></div>
```

### 3. Plugin'i Başlat

```javascript
const plugin = new CarLocationPlugin({
    containerId: 'app',
    dataPath: 'plugins/car-location/backend/data/parking-spots.json'
});

await plugin.init();
```

## 📦 CDN Kullanımı

GitHub'a yükledikten sonra jsDelivr ile kullanabilirsiniz:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/plugins/car-location/frontend/css/styles.css">

<script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/plugins/car-location/backend/js/core.js"></script>
<script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/plugins/car-location/frontend/js/ui.js"></script>
<script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/plugins/car-location/plugin.js"></script>
```

## ⚙️ Ayarlar

```javascript
const plugin = new CarLocationPlugin({
    // Zorunlu
    containerId: 'app',                    // Container element ID
    dataPath: 'path/to/parking-spots.json', // Park yeri verisi
    
    // Opsiyonel
    dbName: 'CarLocationPluginDB',         // IndexedDB adı
    dbVersion: 1,                          // IndexedDB versiyonu
    channelName: 'clp_channel',            // BroadcastChannel adı
    autoRender: true                       // Otomatik render
});
```

## 📚 API

### Metodlar

```javascript
// Başlatma
await plugin.init();

// Mevcut seçimi al
const selection = plugin.getSelection();
// { floor: 'B1', column: 'A', number: '01', spotCode: 'A01', color: {...} }

// Programatik seçim
plugin.setSelection('B2', 'C', '03');

// Tüm kayıtları al
const parkings = plugin.getParkings();

// Manuel kayıt ekle
await plugin.addParking({ 
    note: 'Asansör yanında',
    photo: 'base64...'  // Opsiyonel
});

// Kayıt sil (index ile)
await plugin.deleteParking(0);

// Listeyi yenile
plugin.refresh();

// Plugin'i kaldır
plugin.destroy();
```

### Callbacks

```javascript
// Navigate butonu tıklandığında
plugin.setNavigateCallback((parking, index) => {
    console.log('Navigate:', parking.parkingSpot);
    // Harita navigasyonu veya başka işlem
});

// Veri değiştiğinde
plugin.onDataChange = (parkings) => {
    console.log('Kayıt sayısı:', parkings.length);
};
```

## 🎨 Tema Özelleştirme

CSS değişkenlerini override ederek temayı değiştirebilirsiniz:

```css
:root {
    --clp-primary: #8b5cf6;        /* Ana renk */
    --clp-primary-dark: #7c3aed;
    --clp-secondary: #10b981;       /* İkincil renk */
    --clp-danger: #ef4444;          /* Tehlike rengi */
    --clp-bg: #f8fafc;              /* Arka plan */
    --clp-card-bg: #ffffff;         /* Kart arka planı */
    --clp-text: #1e293b;            /* Metin rengi */
    --clp-border: #e2e8f0;          /* Border rengi */
    --clp-radius: 12px;             /* Border radius */
}
```

## 📋 Veri Formatı

### parking-spots.json

```json
{
  "colors": {
    "MH1": { "name": "Kırmızı", "ral": "RAL2002", "hex": "#CB2821" },
    "MH2": { "name": "Lacivert", "ral": "RAL5002", "hex": "#00387B" }
  },
  "floors": {
    "-1": "B1",
    "-2": "B2"
  },
  "parkingSpots": [
    { "id": "carpark-1001", "spot": "A01", "floor": -1, "color": "MH1" },
    { "id": "carpark-1002", "spot": "A02", "floor": -1, "color": "MH1" }
  ]
}
```

### Kayıtlı Park Verisi

```javascript
{
    parkingSpot: "A01",
    floor: "B1",
    color: { code: "MH1", name: "Kırmızı", hex: "#CB2821" },
    note: "Asansör yanında",
    photo: "data:image/jpeg;base64,...",
    duration: 1,  // Gün
    timestamp: "2025-01-06T10:30:00.000Z"
}
```

## 🔧 Sadece Core Kullanımı

UI olmadan sadece veri yönetimi için:

```javascript
const core = new CLPCore({
    dbName: 'MyDB',
    channelName: 'my_channel'
});

await core.init('path/to/parking-spots.json');

// Veri işlemleri
await core.addParking({ note: 'Test' });
const parkings = core.getParkings();
await core.deleteParking(0);
```

## 🔧 Sadece UI Kullanımı

Kendi veri kaynağınızla:

```javascript
// Picker
const picker = new CLPPicker({
    onValueChange: (colId, value) => console.log(colId, value)
});

picker.init('my', [
    { id: 'floor', elementId: 'col-floor', contentId: 'content-floor', data: ['B1', 'B2'] },
    { id: 'column', elementId: 'col-column', contentId: 'content-column', data: ['A', 'B', 'C'] }
]);

// Notification
CLPUIComponents.showNotification('Mesaj', 'success');

// Photo Modal
CLPUIComponents.openPhotoModal('image-url.jpg');

// Car Card HTML
const cardHtml = CLPUIComponents.createCarCard(parkingData, 0);
```

## 📱 Harita Entegrasyonu

`examples/with-map.html` dosyasında Leaflet.js ile entegrasyon örneği bulunmaktadır.

## 🌐 Tarayıcı Desteği

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

**Gereksinimler:**
- IndexedDB desteği
- ES6+ JavaScript

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

