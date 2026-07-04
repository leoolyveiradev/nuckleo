/**
 * Spaces page — portado de src/pages/Spaces.jsx
 */

const FILTERS = ['Todos', 'Fixados', 'Públicos', 'Privados'];

const NuckleoSpaces = {
    state: {
        spaces: [],
        loading: false,
        activeFilter: 'Todos',
        showCreate: false,
    },

    async init() {
        const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        if (!user?.email) {
            this.renderLoginRequired();
            return;
        }

        await this.loadSpaces(user.email);
        this.render();
    },

    async loadSpaces(email) {
        this.state.loading = true;
        this.render();

        try {
            const spacesRes = await window.Nuckleo.apiFetch('/spaces?created_by=' + encodeURIComponent(email));
            this.state.spaces = Array.isArray(spacesRes) ? spacesRes : [];
        } catch (e) {
            this.state.spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || '[]');
        }

        this.state.loading = false;
    },

    setFilter(filter) {
        this.state.activeFilter = filter;
        this.render();
    },

    openCreateSpace() {
        this.state.showCreate = true;
        window.NuckleoModals.openCreateSpaceModal();
    },

    getFilteredSpaces() {
        if (this.state.activeFilter === 'Fixados') return this.state.spaces.filter(s => s.is_pinned);
        if (this.state.activeFilter === 'Públicos') return this.state.spaces.filter(s => s.visibility === 'public');
        if (this.state.activeFilter === 'Privados') return this.state.spaces.filter(s => s.visibility === 'private');
        return this.state.spaces;
    },

    renderLoginRequired() {
        const content = document.getElementById('spaces-content');
        content.innerHTML = '<div class="empty-state"><p class="text-muted">Faça login para ver seus espaços.</p></div>';
    },

    render() {
        const content = document.getElementById('spaces-content');
        if (!content) return;

        const filtered = this.getFilteredSpaces();

        content.innerHTML = `
            <div class="page-header">
                <div class="header-with-action">
                    <div>
                        <h1>${NuckleoIcons.icon('folder', 'icon')} Ctrl+S</h1>
                        <p class="text-muted">Seus espaços de conhecimento</p>
                    </div>
                    <button class="btn-primary" onclick="NuckleoSpaces.openCreateSpace()">
                        ${NuckleoIcons.icon('plus', 'icon-xs')} Novo Espaço
                    </button>
                </div>
            </div>

            <div class="filters">
                ${FILTERS.map(f => `
                    <button class="filter ${this.state.activeFilter === f ? 'active' : ''}" onclick="NuckleoSpaces.setFilter('${f}')">
                        ${f}
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
            const msg = this.state.activeFilter === 'Todos'
                ? 'Nenhum espaço criado ainda.'
                : `Nenhum espaço ${this.state.activeFilter.toLowerCase()} encontrado.`;
            content.innerHTML += `<div class="empty-state"><p>${msg}</p></div>`;
            return;
        }

        const spacesHtml = filtered.map(space => window.NuckleoCards.renderSpaceCard(space)).join('');
        content.innerHTML += `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${spacesHtml}
            </div>
        `;
    },
};

window.NuckleoSpaces = NuckleoSpaces;

document.addEventListener('DOMContentLoaded', () => NuckleoSpaces.init());