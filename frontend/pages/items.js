/**
 * Items page — portado de src/pages/Items.jsx
 */

const TABS = ['Todos', 'Links', 'Textos', 'Arquivos', 'Códigos'];

const NuckleoItems = {
    state: {
        items: [],
        loading: false,
        activeTab: 'Todos',
        selectedItem: null,
    },

    async init() {
        const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        if (!user?.email) {
            this.renderLoginRequired();
            return;
        }

        await this.loadItems(user.email);
        this.render();
    },

    async loadItems(email) {
        this.state.loading = true;
        this.render();

        try {
            const itemsRes = await window.Nuckleo.apiFetch('/items?created_by=' + encodeURIComponent(email));
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
        } catch (e) {
            this.state.items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
        }

        this.state.loading = false;
    },

    setTab(tab) {
        this.state.activeTab = tab;
        this.render();
    },

    getFilteredItems() {
        if (this.state.activeTab === 'Todos') return this.state.items;
        if (this.state.activeTab === 'Links') return this.state.items.filter(i => i.type === 'link');
        if (this.state.activeTab === 'Textos') return this.state.items.filter(i => i.type === 'note');
        if (this.state.activeTab === 'Arquivos') return this.state.items.filter(i => i.type === 'file');
        if (this.state.activeTab === 'Códigos') return this.state.items.filter(i => i.type === 'code');
        return this.state.items;
    },

    renderLoginRequired() {
        const content = document.getElementById('items-content');
        content.innerHTML = '<div class="empty-state"><p class="text-muted">Faça login para ver seus itens.</p></div>';
    },

    render() {
        const content = document.getElementById('items-content');
        if (!content) return;

        const filtered = this.getFilteredItems();

        content.innerHTML = `
            <div class="page-header">
                <h1>${NuckleoIcons.icon('file-text', 'icon')} Itens</h1>
                <p class="text-muted">Todos os seus links, textos, arquivos e códigos</p>
            </div>

            <div class="tabs">
                ${TABS.map(tab => `
                    <button class="tab ${this.state.activeTab === tab ? 'active' : ''}" onclick="NuckleoItems.setTab('${tab}')">
                        ${tab}
                    </button>
                `).join('')}
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

        if (filtered.length === 0) {
            content.innerHTML += '<div class="empty-state"><p>Nenhum item encontrado.</p></div>';
            return;
        }

        const itemsHtml = filtered.map(item => window.NuckleoCards.renderItemCard(item)).join('');
        content.innerHTML += `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${itemsHtml}
            </div>
        `;
    },
};

window.NuckleoItems = NuckleoItems;

document.addEventListener('DOMContentLoaded', () => NuckleoItems.init());