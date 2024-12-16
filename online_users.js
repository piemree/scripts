(function () {
    let currentInterval = null; // Mevcut interval'i tutmak için

    // Stil tanımlarını oluştur - bu kısmı bir kere çalıştırmak yeterli
    function addStyles() {
        if (!document.getElementById('live-viewer-styles')) {
            const style = document.createElement('style');
            style.id = 'live-viewer-styles';
            style.textContent = `
                .live-viewer-counter {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    display: inline-flex;
                }

                .live-viewer-pulse {
                    width: 10px;
                    height: 10px;
                    max-width: 10px;
                    max-height: 10px;
                    min-width: 10px;
                    min-height: 10px;
                    background-color: #4CAF50;
                    border-radius: 50%;
                    position: relative;
                }

                .live-viewer-pulse::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: #4CAF50;
                    border-radius: 50%;
                    animation: pulseAnimation 0.5s infinite;
                }

                @keyframes pulseAnimation {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    70% {
                        transform: scale(2);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }

                .live-viewer-counter-number {
                    font-weight: bold;
                    color: #4CAF50;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Mevcut counter'ı temizle
    function cleanupCounter() {
        const existingCounter = document.querySelector('.live-viewer-counter');
        if (existingCounter) {
            existingCounter.remove();
        }
        if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
        }
    }

    // Counter elementi oluştur
    function createCounterElement() {
        const div = document.createElement('div');
        div.className = 'live-viewer-counter';
        div.innerHTML = `
            <div class="live-viewer-pulse"></div>
            <span>Şu Anda <span class="live-viewer-counter-number">0</span> Kullanıcı Bu Ürünü İnceliyor</span>
        `;
        return div;
    }

    // Sayı animasyonu fonksiyonu
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(start + (end - start) * easeProgress);
            element.textContent = currentValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }

    // Counter güncelleme fonksiyonu
    function updateCounter(counterElement) {
        const currentValue = parseInt(counterElement.textContent);
        const min = 3;
        const max = 30;
        let newValue;

        do {
            const maxChange = 5;
            const change = Math.floor(Math.random() * (maxChange * 2 + 1)) - maxChange;
            newValue = currentValue + change;
        } while (newValue < min || newValue > max);

        animateValue(counterElement, currentValue, newValue, 1000);
    }

    // Ana initialization fonksiyonu
    function init() {
        cleanupCounter(); // Önce mevcut counter'ı temizle
        
        const productElement = document.querySelector('.product-name');
        if (productElement && productElement.classList.length === 1) {
            addStyles(); // Stilleri ekle (eğer eklenmemişse)
            
            const counterElement = createCounterElement();
            productElement.insertAdjacentElement('afterend', counterElement);

            const counterNumber = counterElement.querySelector('.live-viewer-counter-number');
            counterNumber.textContent = Math.floor(Math.random() * (30 - 3 + 1)) + 3;

            currentInterval = setInterval(() => updateCounter(counterNumber), 10000);
        }
    }

    // Route değişikliklerini dinle
    function listenToRouteChanges() {
        // Next.js route değişikliklerini dinle
        if (typeof window !== 'undefined') {
            // Sayfa yüklendiğinde
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }

            // URL değişikliklerini izle
            let lastUrl = window.location.href;
            new MutationObserver(() => {
                const url = window.location.href;
                if (url !== lastUrl) {
                    lastUrl = url;
                    setTimeout(init, 100); // Küçük bir gecikme ile init'i çalıştır
                }
            }).observe(document, { subtree: true, childList: true });
        }
    }

    // Script'i başlat
    listenToRouteChanges();
})();