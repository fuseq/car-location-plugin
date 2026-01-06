/**
 * Car Location Plugin
 * Park yeri seçme, kaydetme ve senkronizasyon
 */

class CarLocationPlugin {
    constructor(options = {}) {
        this.options = {
            dataPath: options.dataPath || 'backend/data/parking-spots.json',
            dbName: options.dbName || 'CarLocationPluginDB',
            ...options
        };

        // Services
        this.dataService = null;
        this.storageService = null;

        // State
        this.initialized = false;
        this.savedParkings = [];
        this.selectedFloor = 'B1';
        this.selectedColumn = '';
        this.selectedNumber = '';
        this.selectedColor = null;

        // Callbacks
        this.onDataChange = null;
    }

    /**
     * Plugin'i başlat
     */
    async init() {
        try {
            // Servisleri başlat
            this.dataService = new CLPDataService();
            this.storageService = new CLPStorageService(this.options.dbName);

            // Storage'ı başlat
            await this.storageService.init();

            // Veri yükle
            await this.dataService.loadFromJSON(this.options.dataPath);

            // İlk kat için değerleri ayarla
            const floors = this.dataService.getFloorNames();
            if (floors.length > 0) {
                this.selectedFloor = floors[0];
                this.updateColumnsForFloor(this.selectedFloor);
            }

            // Kayıtlı park yerlerini yükle
            this.savedParkings = await this.storageService.getAllParkings();

            // Cross-tab sync
            this.storageService.onBroadcast(async (type, data) => {
                console.log('[CLP] Broadcast:', type, data);
                this.savedParkings = await this.storageService.getAllParkings();
                if (this.onDataChange) this.onDataChange(type, data);
            });

            this.initialized = true;
            console.log('[CLP] Plugin başlatıldı -', this.dataService.getSpotCount(), 'park yeri');

            return true;
        } catch (error) {
            console.error('[CLP] Başlatma hatası:', error);
            return false;
        }
    }

    /**
     * Kat için sütunları güncelle
     */
    updateColumnsForFloor(floorName) {
        this.selectedFloor = floorName;
        const columns = this.dataService.getColumnsForFloor(floorName);
        
        if (columns.length > 0) {
            this.selectedColumn = columns[0];
            this.updateNumbersForColumn(floorName, this.selectedColumn);
        }
    }

    /**
     * Sütun için numaraları güncelle
     */
    updateNumbersForColumn(floorName, column) {
        this.selectedColumn = column;
        const numbers = this.dataService.getNumbersForColumn(floorName, column);
        
        if (numbers.length > 0) {
            this.selectedNumber = numbers[0];
        }
        
        this.updateSelectedColor();
    }

    /**
     * Seçili rengi güncelle
     */
    updateSelectedColor() {
        const spotCode = this.selectedColumn + this.selectedNumber;
        const spotInfo = this.dataService.getSpotInfo(this.selectedFloor, spotCode);
        this.selectedColor = spotInfo?.color || null;
    }

    /**
     * Picker değer değişikliği handler
     */
    handlePickerChange(columnId, value) {
        if (columnId === 'floor') {
            this.updateColumnsForFloor(value);
        } else if (columnId === 'column') {
            this.updateNumbersForColumn(this.selectedFloor, value);
        } else if (columnId === 'number') {
            this.selectedNumber = value;
            this.updateSelectedColor();
        }
        
        return {
            floor: this.selectedFloor,
            column: this.selectedColumn,
            number: this.selectedNumber,
            color: this.selectedColor,
            spotCode: this.selectedColumn + this.selectedNumber
        };
    }

    /**
     * Seçili değerleri al
     */
    getSelectedValues() {
        return {
            floor: this.selectedFloor,
            column: this.selectedColumn,
            number: this.selectedNumber,
            color: this.selectedColor,
            spotCode: this.selectedColumn + this.selectedNumber
        };
    }

    /**
     * Park kaydı ekle
     */
    async addParking(additionalData = {}) {
        const spotCode = this.selectedColumn + this.selectedNumber;
        const spotInfo = this.dataService.getSpotInfo(this.selectedFloor, spotCode);

        const parkingData = {
            parkingSpot: spotCode,
            floor: this.selectedFloor,
            color: spotInfo?.color || this.selectedColor,
            timestamp: new Date().toISOString(),
            ...additionalData
        };

        const id = await this.storageService.addParking(parkingData);
        this.savedParkings = await this.storageService.getAllParkings();
        
        return { id, data: parkingData };
    }

    /**
     * Park kaydı sil
     */
    async deleteParking(id) {
        await this.storageService.deleteParking(id);
        this.savedParkings = await this.storageService.getAllParkings();
    }

    /**
     * Tüm kayıtları al
     */
    getParkings() {
        return [...this.savedParkings];
    }

    /**
     * Kayıtları yenile
     */
    async refreshParkings() {
        this.savedParkings = await this.storageService.getAllParkings();
        return this.savedParkings;
    }

    /**
     * Picker için kat verisi
     */
    getFloorsForPicker() {
        return this.dataService.getFloorNames();
    }

    /**
     * Picker için sütun verisi (renkli)
     */
    getColumnsForPicker(floorName = null) {
        return this.dataService.getColumnsDataForPicker(floorName || this.selectedFloor);
    }

    /**
     * Picker için numara verisi
     */
    getNumbersForPicker(floorName = null, column = null) {
        return this.dataService.getNumbersForColumn(
            floorName || this.selectedFloor, 
            column || this.selectedColumn
        );
    }

    /**
     * Servislere erişim
     */
    getDataService() { return this.dataService; }
    getStorageService() { return this.storageService; }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarLocationPlugin;
}

