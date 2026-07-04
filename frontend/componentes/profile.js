/**
 * Profile page — portado de src/pages/Profile.jsx
 */

const NuckleoProfile = {
    state: {
        user: null,
        spaces: [],
        items: [],
        friends: [],
        activeTab: 'spaces',
        editing: false,
        form: { username: '', bio: '' },
    },

    async init() {
        const storedUser = localStorage.getItem('nuckleo_user');
        if (!storedUser) {
            this.renderLoginPrompt();
            return;
        }

        this.state.user = JSON.parse(storedUser);
        await this.loadData();
        this.render();
    },

    async loadData() {
        const email = this.state.user?.email;
        if (!email) return;

        try {
            const [spacesRes, itemsRes, friendsRes] = await Promise.all([
                window.Nuckleo.apiFetch('/spaces?created_by=' + encodeURIComponent(email)),
                window.Nuckleo.apiFetch('/items?created_by=' + encodeURIComponent(email)),
                window.Nuckleo.apiFetch('/friends'),
            ]);

            this.state.spaces = Array.isArray(spacesRes) ? spacesRes : [];
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
            this.state.friends = Array.isArray(friendsRes) ? friendsRes : [];
        } catch (e) {
            // fallback to localStorage
            this.state.spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || '[]');
            this.state.items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
            this.state.friends = [];
        }
    },

    renderLoginPrompt() {
        const content = document.getElementById('profile-content');
        content.innerHTML = `
            <div class="profile-header">
                <div class="profile-banner"></div>
                <div class="profile-avatar">?</div>
                <div class="profile-info">
                    <h1>Visitante</h1>
                    <p class="text-muted">Faça login para ver seu perfil</p>
                </div>
            </div>
        `;
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    },

    getHandle() {
        const u = this.state.user;
        return u?.username || u?.email?.split('@')[0] || 'usuario';
    },

    getFriendCount() {
        return this.state.friends.filter(f =>
            f.from_user === this.state.user?.email ||
            f.to_user === this.state.user?.email
        ).length;
    },

    render() {
        const content = document.getElementById('profile-content');
        const u = this.state.user;
        const handle = this.getHandle();

        const stats = [
            { label: 'Espaços', value: this.state.spaces.length, icon: 'folder' },
            { label: 'Itens', value: this.state.items.length, icon: 'file-text' },
            { label: 'Amigos', value: this.getFriendCount(), icon: 'users' },
        ];

        const tabs = [
            { id: 'spaces', label: 'Espaços', count: this.state.spaces.length },
            { id: 'items', label: 'Itens', count: this.state.items.length },
            { id: 'pinned', label: 'Favoritos', count: this.state.items.filter(i => i.is_favorite).length },
        ];

        const tabItems = this.state.activeTab === 'pinned'
            ? this.state.items.filter(i => i.is_favorite)
            : this.state[this.state.activeTab === 'spaces' ? 'spaces' : 'items'];

        content.innerHTML = `
            <div class="profile-page">
                <div class="profile-banner"></div>
                <div class="profile-main">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar">
                            ${u?.avatar_url ? `<img src="${u.avatar_url}" alt="" />` : (u?.full_name?.charAt(0) || '?')}
                        </div>
                        <button class="profile-avatar-edit" onclick="NuckleoProfile.openEditModal()">
                            ${NuckleoIcons.icon('camera', 'icon-xs')}
                        </button>
                    </div>
                    <div class="profile-info">
                        <div class="profile-name-row">
                            <h1>${u?.full_name || 'Usuário'}</h1>
                            <p class="profile-handle">@${handle}</p>
                            ${u?.bio ? `<p class="profile-bio">${u.bio}</p>` : ''}
                            <div class="profile-meta">
                                ${u?.created_date ? `<span>${NuckleoIcons.icon('calendar', 'icon-xs')} Entrou em ${this.formatDate(u.created_date)}</span>` : ''}
                                <span>${NuckleoIcons.icon('link', 'icon-xs')} nuckleo.app/u/${handle}</span>
                            </div>
                        </div>
                        <button class="btn-outline" onclick="NuckleoProfile.toggleEdit()">
                            ${NuckleoIcons.icon('pencil', 'icon-xs')} Editar perfil
                        </button>
                    </div>
                </div>

                ${this.state.editing ? this.renderEditForm() : ''}

                <div class="profile-stats">
                    ${stats.map(s => `
                        <button class="stat-item" onclick="NuckleoProfile.setTab('${s.label === 'Amigos' ? 'spaces' : s.label.toLowerCase()}')">
                            <span class="stat-icon">${NuckleoIcons.icon(s.icon, 'icon-sm')}</span>
                            <span class="stat-value">${s.value}</span>
                            <span class="stat-label">${s.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="profile-tabs">
                    ${tabs.map(t => `
                        <button class="tab-item ${this.state.activeTab === t.id ? 'active' : ''}" onclick="NuckleoProfile.setTab('${t.id}')">
                            ${t.label}
                            <span class="tab-count">${t.count}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="profile-grid">
                    ${tabItems.length === 0 ? `
                        <p class="empty-state">
                            ${this.state.activeTab === 'pinned' ? 'Nenhum favorito ainda.' :
                              this.state.activeTab === 'spaces' ? 'Nenhum espaço criado ainda.' : 'Nenhum item criado ainda.'}
                        </p>
                    ` : tabItems.map(item => this.state.activeTab === 'spaces'
                        ? this.renderSpaceCard(item)
                        : this.renderItemCard(item)
                    ).join('')}
                </div>

                <div class="profile-footer">
                    <button class="btn-logout" onclick="NuckleoProfile.logout()">
                        ${NuckleoIcons.icon('log-out', 'icon-xs')} Sair da conta
                    </button>
                </div>
            </div>
        `;

        NuckleoIcons.refreshIcons();
    },

    renderEditForm() {
        return `
            <div class="edit-form">
                <div class="form-group">
                    <label>Nome de usuário (@)</label>
                    <div class="input-with-prefix">
                        <span class="input-prefix">@</span>
                        <input type="text" id="edit-username" value="${this.state.form.username}" placeholder="seunome" />
                    </div>
                </div>
                <div class="form-group">
                    <label>Bio</label>
                    <textarea id="edit-bio" placeholder="Conte algo sobre você...">${this.state.form.bio}</textarea>
                </div>
                <div class="form-actions">
                    <button class="btn-primary" onclick="NuckleoProfile.saveProfile()">Salvar</button>
                    <button class="btn-ghost" onclick="NuckleoProfile.toggleEdit()">Cancelar</button>
                </div>
            </div>
        `;
    },

    renderSpaceCard(space) {
        return `
            <div class="space-card" onclick="window.location.href='/pages/space.html?id=${space.id}'">
                <span class="space-icon">${NuckleoIcons.icon(space.icon || 'folder', 'icon-md')}</span>
                <h3>${space.title}</h3>
                <p class="space-count">${space.item_count || 0} itens</p>
                ${space.visibility === 'public' ? `<span class="space-visibility">${NuckleoIcons.icon('globe', 'icon-xs')}</span>` : ''}
            </div>
        `;
    },

    renderItemCard(item) {
        const labels = { note: 'Nota', link: 'Link', code: 'Código', file: 'Arquivo' };
        return `
            <div class="item-card" onclick="NuckleoModals.openItemDetailModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <span class="item-type-badge">${labels[item.type] || 'Item'}</span>
                <h3>${item.title}</h3>
                <p class="item-preview">${item.content?.substring(0, 80) || 'Sem conteúdo'}</p>
                ${item.is_favorite ? `<span class="item-favorite">${NuckleoIcons.icon('star', 'icon-sm')}</span>` : ''}
            </div>
        `;
    },

    setTab(tabId) {
        this.state.activeTab = tabId;
        this.render();
    },

    toggleEdit() {
        this.state.editing = !this.state.editing;
        if (this.state.editing) {
            this.state.form = {
                username: this.state.user?.username || this.state.user?.email?.split('@')[0] || '',
                bio: this.state.user?.bio || '',
            };
        }
        this.render();
    },

    openEditModal() {
        // Avatar upload would go here
        alert('Upload de avatar em implementação');
    },

    async saveProfile() {
        const username = document.getElementById('edit-username')?.value || '';
        const bio = document.getElementById('edit-bio')?.value || '';

        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

        this.state.user = {
            ...this.state.user,
            username: cleanUsername,
            bio,
        };

        localStorage.setItem('nuckleo_user', JSON.stringify(this.state.user));
        this.state.editing = false;
        this.render();
    },

    logout() {
        localStorage.removeItem('nuckleo_token');
        localStorage.removeItem('nuckleo_user');
        window.location.href = '/index.html';
    },
};

window.NuckleoProfile = NuckleoProfile;

// Auto-init
document.addEventListener('DOMContentLoaded', () => NuckleoProfile.init());