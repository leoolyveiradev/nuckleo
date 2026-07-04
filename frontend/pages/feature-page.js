/**
 * FeaturePage — página indicativa de funcionalidade em desenvolvimento
 */

function renderFeaturePage(contentId, icon, title, description, badge = 'Em breve') {
    const content = document.getElementById(contentId);
    if (!content) return;

    content.innerHTML = `
        <div class="feature-page">
            <div class="feature-card">
                <div class="feature-icon">
                    ${NuckleoIcons.icon(icon, 'icon-lg')}
                </div>
                <span class="feature-badge">${badge}</span>
                <h1>${title}</h1>
                <p class="text-muted">${description}</p>
            </div>
        </div>
    `;
}

window.renderFeaturePage = renderFeaturePage;