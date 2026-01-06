/**
 * Car Location Plugin - Core Services
 * Data Service + Storage Service (IndexedDB + BroadcastChannel)
 */

/* ========================================
   DATA SERVICE
   ======================================== */

class CLPDataService {
    constructor() {
        this.parkingData = null;
        this.colors = {};
        this.floors = {};
        this.spots = [];
    }

    async loadFromJSON(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            this.parkingData = await response.json();
            this.colors = this.parkingData.colors || {};
            this.floors = this.parkingData.floors || {};
            this.spots = this.parkingData.parkingSpots || [];
            return true;
        } catch (error) {
            console.error('[CLPData] Yükleme hatası:', error);
            return false;
        }
    }

    setData(data) {
        this.parkingData = data;
        this.colors = data.colors || {};
        this.floors = data.floors || {};
        this.spots = data.parkingSpots || [];
    }

    getFloorNames() {
        return Object.values(this.floors);
    }

    getFloorNumber(floorName) {
        const entry = Object.entries(this.floors).find(([k, v]) => v === floorName);
        return entry ? parseInt(entry[0]) : null;
    }

    getFloorName(floorNumber) {
        return this.floors[floorNumber.toString()] || null;
    }

    getColumnsForFloor(floorName) {
        const floorNum = this.getFloorNumber(floorName);
        if (floorNum === null) return [];
        const spotsOnFloor = this.spots.filter(s => s.floor === floorNum);
        return [...new Set(spotsOnFloor.map(s => s.spot.charAt(0)))].sort();
    }

    getNumbersForColumn(floorName, column) {
        const floorNum = this.getFloorNumber(floorName);
        if (floorNum === null) return [];
        const spotsInColumn = this.spots.filter(s => s.floor === floorNum && s.spot.charAt(0) === column);
        return [...new Set(spotsInColumn.map(s => s.spot.substring(1)))].sort((a, b) => parseInt(a) - parseInt(b));
    }

    getSpotInfo(floorName, spotCode) {
        const floorNum = this.getFloorNumber(floorName);
        if (floorNum === null) return null;
        const spot = this.spots.find(s => s.floor === floorNum && s.spot === spotCode);
        if (!spot) return null;
        return {
            id: spot.id,
            spot: spot.spot,
            floor: floorNum,
            floorName: floorName,
            colorCode: spot.color,
            color: this.colors[spot.color] || null
        };
    }

    getColumnColor(floorName, column) {
        const floorNum = this.getFloorNumber(floorName);
        if (floorNum === null) return null;
        const spot = this.spots.find(s => s.floor === floorNum && s.spot.charAt(0) === column);
        return spot ? this.colors[spot.color] : null;
    }

    getColumnsDataForPicker(floorName) {
        return this.getColumnsForFloor(floorName).map(col => ({
            text: col,
            value: col,
            color: this.getColumnColor(floorName, col)?.hex || null
        }));
    }

    getColor(colorCode) { return this.colors[colorCode] || null; }
    getAllColors() { return { ...this.colors }; }
    getSpotCount() { return this.spots.length; }
    isLoaded() { return this.spots.length > 0; }
}


/* ========================================
   STORAGE SERVICE (IndexedDB + BroadcastChannel)
   ======================================== */

class CLPStorageService {
    constructor(dbName = 'CLPDatabase', dbVersion = 1) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.db = null;
        this.broadcastChannel = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                this.db = request.result;
                this.initBroadcastChannel();
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('parkings')) {
                    const store = db.createObjectStore('parkings', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    initBroadcastChannel() {
        try {
            this.broadcastChannel = new BroadcastChannel('clp_channel');
        } catch (e) {
            console.warn('[CLPStorage] BroadcastChannel desteklenmiyor');
        }
    }

    broadcast(type, data = {}) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
        }
    }

    onBroadcast(callback) {
        if (this.broadcastChannel) {
            this.broadcastChannel.onmessage = (e) => callback(e.data.type, e.data.data);
        }
    }

    async addParking(data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readwrite');
            const request = tx.objectStore('parkings').add({
                ...data,
                timestamp: data.timestamp || new Date().toISOString()
            });
            request.onsuccess = () => {
                this.broadcast('parking_added', { id: request.result, data });
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateParking(id, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readwrite');
            const request = tx.objectStore('parkings').put({ ...data, id });
            request.onsuccess = () => {
                this.broadcast('parking_updated', { id, data });
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteParking(id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readwrite');
            const request = tx.objectStore('parkings').delete(id);
            request.onsuccess = () => {
                this.broadcast('parking_deleted', { id });
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllParkings() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readonly');
            const request = tx.objectStore('parkings').getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async getParking(id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readonly');
            const request = tx.objectStore('parkings').get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllParkings() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['parkings'], 'readwrite');
            const request = tx.objectStore('parkings').clear();
            request.onsuccess = () => {
                this.broadcast('parkings_cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setSetting(key, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['settings'], 'readwrite');
            const request = tx.objectStore('settings').put({ key, value, updatedAt: new Date().toISOString() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key, defaultValue = null) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['settings'], 'readonly');
            const request = tx.objectStore('settings').get(key);
            request.onsuccess = () => resolve(request.result?.value ?? defaultValue);
            request.onerror = () => reject(request.error);
        });
    }

    async cleanExpiredParkings(durationField = 'duration') {
        const parkings = await this.getAllParkings();
        const now = new Date();
        let count = 0;
        
        for (const p of parkings) {
            if (p[durationField] && p.timestamp) {
                const elapsed = now - new Date(p.timestamp);
                if (elapsed >= p[durationField] * 24 * 60 * 60 * 1000) {
                    await this.deleteParking(p.id);
                    count++;
                }
            }
        }
        return count;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CLPDataService, CLPStorageService };
}

