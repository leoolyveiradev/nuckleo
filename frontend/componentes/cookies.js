/**
 * Cookie consent banner + GDPR compliance
 */

const NuckleoCookies = {
    consentKey: 'nuckleo_cookie_consent',
    analyticsKey: 'nuckleo_analytics_consent',

    init() {
        const consent = localStorage.getItem(this.consentKey);
        if (consent) {
            this.applyConsent(JSON.parse(consent));
            return;
        }
        this.showBanner();
    },

    showBanner() {
        const existing = document.getElementById('cookie-banner');
        if (existing) {
            existing.classList.add('show');
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'show';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Usamos cookies para melhorar sua experiência. Ao continuar, você aceita nossa <a href="/pages/privacy.html">Política de Privacidade</a>.</p>
                <div class="cookie-actions">
                    <button class="btn-ghost btn-sm" onclick="NuckleoCookies.acceptEssential()">Apenas essenciais</button>
                    <button class="btn-primary btn-sm" onclick="NuckleoCookies.acceptAll()">Aceitar todos</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
    },

    acceptEssential() {
        const consent = { essential: true, analytics: false, timestamp: Date.now() };
        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        this.applyConsent(consent);
        this.hideBanner();
    },

    acceptAll() {
        const consent = { essential: true, analytics: true, timestamp: Date.now() };
        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        this.applyConsent(consent);
        this.initAnalytics();
        this.hideBanner();
    },

    applyConsent(consent) {
        if (consent.analytics) {
            this.initAnalytics();
        }
    },

    initAnalytics() {
        // Placeholder for analytics (GA4, etc)
        console.log('[analytics] inicializado');
    },

    hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();
    },
};

window.NuckleoCookies = NuckleoCookies;

document.addEventListener('DOMContentLoaded', () => NuckleoCookies.init());