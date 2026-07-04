/**
 * Recents page — portado de src/pages/Recents.jsx
 */

const NuckleoRecents = {
    state: {
        items: [],
        loading: false,
        selectedItem: null,
    },

    async init() {
        const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        if (!user?.email) {
            this.renderLoginRequired();
            return;
        }

        await this.loadRecents(user.email);
        this.render();
    },

    async loadRecents(email) {
        this.state.loading = true;
        this.render();

        try {
            const itemsRes = await window.Nuckleo.apiFetch('/items?created_by=' + encodeURIComponent(email));
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
        } catch (e) {
            this.state.items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
        }

        // Sort by updated_date
        this.state.items.sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
        this.state.items = this.state.items.slice(0, 50);

        this.state.loading = false;
    },

    renderLoginRequired() {
        const content = document.getElementById('recents-content');
        content.innerHTML = '<div class="empty-state"><p class="text-muted">Faça login para ver itens recentes.</p></div>';
    },

    render() {
        const content = document.getElementById('recents-content');
        if (!content) return;

        content.innerHTML = `
            <div class="page-header">
                <h1>${NuckleoIcons.icon('clock', 'icon')} Recentes</h1>
                <p class="text-muted">Itens acessados ou editados recentemente</p>
            </div>
        `;

        if (this.state.loading) {
            content.innerHTML += `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${[1,2,3,4,5,6].map(() => '<div class="card skeleton"></div>').join('')}
                </div>
            `;
            return;
        }

        if (this.state.items.length === 0) {
            content.innerHTML += '<div class="empty-state"><p>Nenhuma atividade recente.</p></div>';
            return;
        }

        const itemsHtml = this.state.items.map(item => window.NuckleoCards.renderItemCard(item)).join('');
        content.innerHTML += `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${itemsHtml}
            </div>
        `;
    },
};

window.NuckleoRecents = NuckleoRecents;

document.addEventListener('DOMContentLoaded', () => NuckleoRecents.init());