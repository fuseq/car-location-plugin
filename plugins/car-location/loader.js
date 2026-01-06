/**
 * Car Location Plugin - Auto Loader
 * Tek satırda tüm plugin dosyalarını yükler
 * 
 * Kullanım:
 * <script src="plugins/car-location/loader.js" data-init="true"></script>
 */

(function() {
    const scriptTag = document.currentScript;
    const basePath = scriptTag.src.replace(/\/loader\.js$/, '');
    
    // Ayarları al
    const autoInit = scriptTag.getAttribute('data-init') === 'true';
    const dataPath = scriptTag.getAttribute('data-path') || basePath + '/backend/data/parking-spots.json';
    
    // Yüklenecek dosyalar
    const cssFiles = [
        'frontend/css/styles.css'
    ];
    
    const jsFiles = [
        'backend/js/core.js',
        'frontend/js/ui.js',
        'plugin.js'
    ];
    
    // CSS yükle
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // JS yükle (sıralı)
    function loadScripts(scripts, callback) {
        let index = 0;
        
        function loadNext() {
            if (index >= scripts.length) {
                if (callback) callback();
                return;
            }
            
            const script = document.createElement('script');
            script.src = scripts[index];
            script.onload = () => {
                index++;
                loadNext();
            };
            script.onerror = () => {
                console.error('[CLPLoader] Yüklenemedi:', scripts[index]);
                index++;
                loadNext();
            };
            document.head.appendChild(script);
        }
        
        loadNext();
    }
    
    // Ana yükleme
    function init() {
        // CSS yükle
        cssFiles.forEach(file => loadCSS(basePath + '/' + file));
        
        // JS dosyalarını yükle
        const fullPaths = jsFiles.map(file => basePath + '/' + file);
        
        loadScripts(fullPaths, () => {
            console.log('[CLPLoader] Tüm dosyalar yüklendi');
            
            // Auto init
            if (autoInit) {
                window.CLPPlugin = new CarLocationPlugin({
                    dataPath: dataPath
                });
                
                window.CLPPlugin.init().then(() => {
                    console.log('[CLPLoader] Plugin başlatıldı');
                    
                    // Custom event
                    document.dispatchEvent(new CustomEvent('clp:ready', {
                        detail: { plugin: window.CLPPlugin }
                    }));
                });
            } else {
                // Custom event - sadece yüklendi
                document.dispatchEvent(new CustomEvent('clp:loaded'));
            }
        });
    }
    
    // DOM hazır olunca başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
