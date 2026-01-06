/**
 * Car Location Plugin - UI Components
 * Bottom Sheet bileşenleri ve iOS Style Picker
 */

/* ========================================
   UI COMPONENTS
   ======================================== */

const CLPUIComponents = {
    
    /**
     * Otopark Sütunu SVG İkonu
     */
    createParkingPillarIcon(spotCode, color = '#2563eb') {
        return `
            <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="2" width="52" height="6" rx="3" fill="${color}"/>
                <rect x="8" y="8" width="44" height="42" fill="white" stroke="${color}" stroke-width="2"/>
                <rect x="8" y="50" width="44" height="22" fill="${color}"/>
                <circle cx="30" cy="30" r="14" fill="white" stroke="${color}" stroke-width="2"/>
                <text x="30" y="35" text-anchor="middle" fill="${color}" font-size="12" font-weight="700" font-family="system-ui">${spotCode}</text>
                <rect x="4" y="72" width="52" height="6" rx="3" fill="${color}"/>
            </svg>
        `;
    },

    /**
     * Araç Kartı HTML
     */
    createCarCard(parking, index) {
        const parkingSpot = parking.parkingSpot || '';
        const floor = parking.floor || '';
        const colorInfo = parking.color;
        const title = `Kat ${floor} · ${parkingSpot}`;

        const savedTime = parking.timestamp ? new Date(parking.timestamp) : new Date();
        const formattedTime = savedTime.toLocaleString('tr-TR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const colorChip = colorInfo 
            ? `<span class="clp-color-chip" style="background: ${colorInfo.hex};">${colorInfo.name}</span>` 
            : '';

        let noteHtml = '';
        if (parking.note) {
            if (parking.note.length > 20) {
                noteHtml = `<div class="clp-car-note scrolling"><div class="marquee-wrapper"><span class="marquee-text">${parking.note}</span><span class="marquee-text">${parking.note}</span></div></div>`;
            } else {
                noteHtml = `<div class="clp-car-note"><span class="marquee-text">${parking.note}</span></div>`;
            }
        }

        const spotColor = colorInfo ? colorInfo.hex : '#2563eb';
        const iconHtml = parking.photo 
            ? `<div class="clp-car-icon has-photo" data-photo="${parking.photo}" style="background-image: url(${parking.photo})"></div>`
            : `<div class="clp-car-icon parking-pillar">${this.createParkingPillarIcon(parkingSpot, spotColor)}</div>`;

        return `
            <div class="clp-car-card" data-index="${index}">
                ${iconHtml}
                <div class="clp-car-info">
                    <div class="clp-car-title">${title}</div>
                    ${noteHtml}
                    <div class="clp-car-time">${formattedTime}</div>
                    ${colorChip}
                </div>
                <div class="clp-car-actions">
                    <button class="clp-btn-circular share" data-index="${index}" title="Paylaş">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                    <button class="clp-btn-circular delete" data-index="${index}" title="Sil">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Bildirim Göster
     */
    showNotification(message, type = 'info', duration = 3000) {
        let notification = document.querySelector('.clp-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'clp-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `clp-notification ${type} show`;

        setTimeout(() => notification.classList.remove('show'), duration);
    },

    /**
     * Fotoğraf Modal
     */
    openPhotoModal(photoUrl) {
        let modal = document.querySelector('.clp-photo-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'clp-photo-modal';
            modal.innerHTML = `
                <div class="clp-photo-modal-overlay"></div>
                <div class="clp-photo-modal-content">
                    <button class="clp-photo-modal-close">&times;</button>
                    <img src="" alt="Fotoğraf">
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.clp-photo-modal-overlay').onclick = () => this.closePhotoModal();
            modal.querySelector('.clp-photo-modal-close').onclick = () => this.closePhotoModal();
        }
        modal.querySelector('img').src = photoUrl;
        modal.classList.add('show');
    },

    closePhotoModal() {
        const modal = document.querySelector('.clp-photo-modal');
        if (modal) modal.classList.remove('show');
    }
};


/* ========================================
   iOS STYLE PICKER
   ======================================== */

class CLPPicker {
    constructor(options = {}) {
        this.ITEM_HEIGHT = options.itemHeight || 36;
        this.onValueChange = options.onValueChange || null;
        this.columns = {};
        this.selectedValues = {};
    }

    init(containerId, columnsConfig) {
        columnsConfig.forEach(config => {
            this.columns[config.id] = {
                element: document.getElementById(config.elementId),
                contentElement: document.getElementById(config.contentId),
                data: config.data || [],
                type: config.type || 'normal'
            };
            this.selectedValues[config.id] = config.defaultValue || (config.data[0]?.value || config.data[0]);
        });

        this.buildAllLists();
        this.setupAllColumns();
        setTimeout(() => this.scrollToInitialValues(), 100);
    }

    buildAllLists() {
        Object.keys(this.columns).forEach(id => this.buildList(id));
    }

    buildList(columnId) {
        const column = this.columns[columnId];
        if (!column?.contentElement) return;
        
        column.contentElement.innerHTML = '';
        column.data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'clp-item';
            div.innerText = item.text || item;
            div.dataset.value = item.value || item;
            if (item.color) div.style.color = item.color;
            column.contentElement.appendChild(div);
        });
    }

    setupAllColumns() {
        Object.keys(this.columns).forEach(id => this.setupColumn(id));
    }

    setupColumn(columnId) {
        const column = this.columns[columnId];
        if (!column?.element) return;

        column.element.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.handleScroll(column.element));
            clearTimeout(column.scrollTimeout);
            column.scrollTimeout = setTimeout(() => this.updateSelectedValue(columnId), 50);
        });

        column.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('clp-item')) {
                const scrollPos = e.target.offsetTop - column.element.clientHeight / 2 + this.ITEM_HEIGHT / 2;
                column.element.scrollTo({ top: scrollPos, behavior: 'smooth' });
            }
        });
    }

    handleScroll(el) {
        const center = el.scrollTop + el.clientHeight / 2;
        el.querySelectorAll('.clp-item').forEach(item => {
            const itemCenter = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(center - itemCenter);
            
            if (distance < el.clientHeight / 2 + 10) {
                const angle = (itemCenter - center) / (el.clientHeight / 2) * 45;
                item.style.transform = `rotateX(${-angle}deg)`;
                item.style.opacity = 1 - Math.pow(distance / (el.clientHeight / 2), 2) * 0.6;
                item.classList.toggle('selected', distance < this.ITEM_HEIGHT / 2);
            } else {
                item.style.transform = '';
                item.style.opacity = 0.3;
                item.classList.remove('selected');
            }
        });
    }

    updateSelectedValue(columnId) {
        const column = this.columns[columnId];
        const selectedEl = column?.element?.querySelector('.selected');
        if (selectedEl) {
            const oldValue = this.selectedValues[columnId];
            this.selectedValues[columnId] = selectedEl.dataset.value;
            if (oldValue !== this.selectedValues[columnId] && this.onValueChange) {
                this.onValueChange(columnId, this.selectedValues[columnId], this.selectedValues);
            }
        }
    }

    scrollToValue(columnId, value) {
        const column = this.columns[columnId];
        if (!column?.element) return;
        
        const targetItem = Array.from(column.element.querySelectorAll('.clp-item')).find(item => item.dataset.value == value);
        if (targetItem) {
            column.element.scrollTop = targetItem.offsetTop - column.element.clientHeight / 2 + this.ITEM_HEIGHT / 2;
            this.handleScroll(column.element);
        }
    }

    scrollToInitialValues() {
        Object.keys(this.columns).forEach(id => this.scrollToValue(id, this.selectedValues[id]));
    }

    updateColumnData(columnId, newData, defaultValue = null) {
        const column = this.columns[columnId];
        if (!column) return;
        
        column.data = newData;
        this.selectedValues[columnId] = defaultValue || (newData[0]?.value || newData[0]);
        this.buildList(columnId);
        setTimeout(() => this.scrollToValue(columnId, this.selectedValues[columnId]), 50);
    }

    getValues() { return { ...this.selectedValues }; }
    getValue(columnId) { return this.selectedValues[columnId]; }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CLPUIComponents, CLPPicker };
}

