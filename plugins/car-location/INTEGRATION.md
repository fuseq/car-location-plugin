# 🔌 Car Location Plugin - Entegrasyon Rehberi

## 📁 Dosya Yapısı

```
plugins/car-location/
├── frontend/
│   ├── css/
│   │   └── styles.css          # UI stilleri
│   └── js/
│       └── ui.js               # UI bileşenleri + Picker
│
├── backend/
│   ├── js/
│   │   └── core.js             # Data + Storage servisleri
│   └── data/
│       └── parking-spots.json  # Park yeri verileri
│
├── plugin.js                   # Ana plugin sınıfı
├── loader.js                   # Otomatik yükleyici
└── example.html                # Demo
```

---

## 🚀 Hızlı Başlangıç

### Yöntem 1: Auto Loader

```html
<script src="plugins/car-location/loader.js" data-init="true"></script>

<script>
document.addEventListener('clp:ready', (e) => {
    const plugin = e.detail.plugin;
    console.log('Plugin hazır!', plugin.getParkings());
});
</script>
```

### Yöntem 2: Manuel

```html
<link rel="stylesheet" href="plugins/car-location/frontend/css/styles.css">
<script src="plugins/car-location/backend/js/core.js"></script>
<script src="plugins/car-location/frontend/js/ui.js"></script>
<script src="plugins/car-location/plugin.js"></script>

<script>
const plugin = new CarLocationPlugin({
    dataPath: 'plugins/car-location/backend/data/parking-spots.json'
});
await plugin.init();
</script>
```

---

## 🧩 Modüler Kullanım

### Sadece Frontend

```html
<link rel="stylesheet" href="plugins/car-location/frontend/css/styles.css">
<script src="plugins/car-location/frontend/js/ui.js"></script>

<script>
// Bildirim
CLPUIComponents.showNotification('Merhaba!', 'success');

// Araç kartı HTML
const html = CLPUIComponents.createCarCard({
    parkingSpot: 'A01',
    floor: 'B1',
    color: { name: 'Kırmızı', hex: '#CB2821' },
    timestamp: new Date().toISOString()
}, 0);

// Fotoğraf modal
CLPUIComponents.openPhotoModal('photo.jpg');
</script>
```

### Sadece Backend

```html
<script src="plugins/car-location/backend/js/core.js"></script>

<script>
// Data Service
const data = new CLPDataService();
await data.loadFromJSON('parking-spots.json');

const floors = data.getFloorNames();           // ['B1', 'B2']
const columns = data.getColumnsForFloor('B1'); // ['A', 'B', 'C']
const spot = data.getSpotInfo('B1', 'A01');    // { color: {...}, ... }

// Storage Service
const storage = new CLPStorageService('MyDB');
await storage.init();

await storage.addParking({ parkingSpot: 'A01', floor: 'B1' });
const parkings = await storage.getAllParkings();
await storage.deleteParking(id);

// Cross-tab sync
storage.onBroadcast((type, data) => {
    console.log('Diğer sekmede değişiklik:', type);
});
</script>
```

---

## 📋 API Referansı

### CarLocationPlugin

```javascript
const plugin = new CarLocationPlugin({ dataPath: '...' });
await plugin.init();

// Picker değer değişikliği
plugin.handlePickerChange('floor', 'B2');
plugin.handlePickerChange('column', 'A');
plugin.handlePickerChange('number', '01');

// Seçili değerleri al
plugin.getSelectedValues();
// { floor: 'B1', column: 'A', number: '01', spotCode: 'A01', color: {...} }

// Picker verileri
plugin.getFloorsForPicker();      // ['B1', 'B2']
plugin.getColumnsForPicker();     // [{ text: 'A', value: 'A', color: '#...' }]
plugin.getNumbersForPicker();     // ['01', '02', '03']

// CRUD
await plugin.addParking({ note: 'Kapıya yakın' });
await plugin.deleteParking(id);
plugin.getParkings();

// Cross-tab callback
plugin.onDataChange = (type, data) => {
    console.log('Veri değişti:', type);
};
```

### CLPUIComponents

| Metod | Açıklama |
|-------|----------|
| `showNotification(msg, type, duration)` | Bildirim (success/error/info) |
| `createCarCard(parking, index)` | Araç kartı HTML |
| `createParkingPillarIcon(code, color)` | SVG ikon |
| `openPhotoModal(url)` | Fotoğraf modal |
| `closePhotoModal()` | Modal kapat |

### CLPPicker

| Metod | Açıklama |
|-------|----------|
| `init(containerId, columns)` | Picker başlat |
| `updateColumnData(colId, data)` | Sütun güncelle |
| `scrollToValue(colId, value)` | Değere scroll |
| `getValues()` | Tüm değerleri al |

### CLPDataService

| Metod | Açıklama |
|-------|----------|
| `loadFromJSON(path)` | JSON yükle |
| `getFloorNames()` | Kat isimleri |
| `getColumnsForFloor(floor)` | Bloklar |
| `getNumbersForColumn(floor, col)` | Numaralar |
| `getSpotInfo(floor, code)` | Park yeri detayı |
| `getColumnsDataForPicker(floor)` | Picker için renkli veri |

### CLPStorageService

| Metod | Açıklama |
|-------|----------|
| `init()` | IndexedDB başlat |
| `addParking(data)` | Kayıt ekle |
| `deleteParking(id)` | Kayıt sil |
| `getAllParkings()` | Tüm kayıtlar |
| `onBroadcast(callback)` | Cross-tab dinle |
| `broadcast(type, data)` | Diğer sekmelere gönder |

---

## 🎨 CSS Özelleştirme

```css
:root {
    --clp-primary: #2563eb;
    --clp-secondary: #10b981;
    --clp-danger: #ef4444;
    --clp-bg: #f8fafc;
    --clp-text-primary: #1e293b;
    --clp-border: #e2e8f0;
}
```

---

## 📝 Veri Formatı

```json
{
  "colors": {
    "MH1": { "name": "Kırmızı", "ral": "RAL2002", "hex": "#CB2821" }
  },
  "floors": {
    "-1": "B1",
    "-2": "B2"
  },
  "parkingSpots": [
    { "id": "carpark-1001", "spot": "A01", "floor": -1, "color": "MH1" }
  ]
}
```
