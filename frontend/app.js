/**
 * Nuckleo — motor global do frontend nativo
 * Gerencia URLs de API (dev local vs Railway em produção)
 */

const NuckleoConfig = {
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',

    get nodeApiUrl() {
        if (this.isProduction) {
            return window.__NUCKLEO_API_NODE__ || 'https://nuckleo-production.up.railway.app/api';
        }
        return window.__NUCKLEO_API_NODE__ || 'http://localhost:3001/api';
    },

    get pythonApiUrl() {
        if (this.isProduction) {
            return window.__NUCKLEO_API_PYTHON__ || 'http://localhost:8000/api';
        }
        return window.__NUCKLEO_API_PYTHON__ || 'http://localhost:8000/api';
    },
};

async function apiFetch(path, options = {}) {
    const base = path.startsWith('/ai') ? NuckleoConfig.pythonApiUrl : NuckleoConfig.nodeApiUrl;
    const url = `${base}${path}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .bottom-nav a').forEach((el) => {
        const href = el.getAttribute('href');
        if (!href) return;
        el.classList.toggle('active', href.endsWith(path) || (path === 'index.html' && href.includes('dashboard')));
    });
}

function applyAiAction(action) {
    if (action === 'suggest_theme_change') {
        const themes = ['theme-cyberpunk', 'theme-matrix'];
        const current = themes.find((t) => document.documentElement.classList.contains(t));
        document.documentElement.classList.remove(...themes);
        const next = current === 'theme-cyberpunk' ? 'theme-matrix' : 'theme-cyberpunk';
        document.documentElement.classList.add(next);
    }
    if (action === 'highlight_create_space') {
        const btn = document.querySelector('[data-action="create-space"]');
        if (btn) {
            btn.style.boxShadow = '0 0 0 3px var(--primary)';
            setTimeout(() => { btn.style.boxShadow = ''; }, 3000);
        }
    }
}

function initAiAgent() {
    const fab = document.getElementById('ai-fab');
    const panel = document.getElementById('ai-panel');
    const closeBtn = document.getElementById('ai-close');
    const form = document.getElementById('ai-form');
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-messages');

    if (!fab || !panel) return;

    const openPanel = () => {
        panel.classList.add('open');
        input?.focus();
    };
    const closePanel = () => panel.classList.remove('open');

    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.contains('open') ? closePanel() : openPanel();
    });
    closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !fab.contains(e.target)) {
            closePanel();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input?.value?.trim();
        if (!text) return;

        messages.innerHTML += `<p><strong>Você:</strong> ${text}</p>`;
        input.value = '';

        try {
            const page = document.body.dataset.page || 'dashboard';
            const data = await apiFetch('/ai/agent', {
                method: 'POST',
                body: JSON.stringify({ message: text, current_page: page }),
            });
            messages.innerHTML += `<p><strong>Agente:</strong> ${data.response}</p>`;
            if (data.action) applyAiAction(data.action);
        } catch {
            messages.innerHTML += '<p><strong>Agente:</strong> Servidor Python offline. Inicie com: <code>uvicorn app.main:app --reload</code></p>';
        }
        messages.scrollTop = messages.scrollHeight;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initAiAgent();
});

window.Nuckleo = { config: NuckleoConfig, apiFetch, applyAiAction };
