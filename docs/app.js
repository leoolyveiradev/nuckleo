/* =============================================================================
   NUCKLEO DOCS — Aplicativo de navegação
   ============================================================================= */

// Document metadata (static, extracted from original MD files)
const docMetadata = {
    'legal/politica-de-privacidade': {
        title: 'Política de Privacidade',
        updated: 'junho de 2026'
    },
    'legal/politica-de-cookies': {
        title: 'Política de Cookies',
        updated: 'junho de 2026'
    },
    'legal/termos-de-uso': {
        title: 'Termos de Uso',
        updated: 'junho de 2026'
    },
    'legal/aviso-legal': {
        title: 'Aviso Legal',
        updated: 'junho de 2026'
    },
    'lgpd/politica-de-seguranca': {
        title: 'Política de Segurança',
        updated: 'junho de 2026'
    },
    'lgpd/registro-de-tratamento': {
        title: 'Registro de Tratamento de Dados',
        updated: 'junho de 2026'
    },
    'lgpd/checklist-conformidade': {
        title: 'Checklist de Conformidade LGPD',
        updated: 'junho de 2026'
    },
    'lgpd/procedimento-incidentes': {
        title: 'Procedimento de Segurança',
        updated: 'junho de 2026'
    },
    'diretrizes/codigo-de-conduta': {
        title: 'Código de Conduta',
        updated: 'junho de 2026'
    },
    'diretrizes/conteudo-e-comunidade': {
        title: 'Diretrizes de Conteúdo e Comunidade',
        updated: 'junho de 2026'
    }
};

// Markdown to HTML simple converter
function mdToHtml(md) {
    let html = md;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Code blocks (```code```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => c.includes('---'))) {
            return ''; // Skip table separator
        }
        const row = cells.map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${row}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');

    // Paragraphs (wrap remaining text blocks)
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*(<h[123]>)/g, '$1');
    html = html.replace(/(<\/h[123]>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<table>)/g, '$1');
    html = html.replace(/(<\/table>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<hr>)/g, '$1');
    html = html.replace(/(<hr>)\s*<\/p>/g, '$1');

    return html;
}

// Load document
async function loadDoc(docPath) {
    const contentEl = document.getElementById('doc-content');
    const titleEl = document.getElementById('doc-title');
    const metaEl = document.getElementById('doc-meta');

    // Get metadata
    const meta = docMetadata[docPath] || { title: 'Documento', updated: '' };

    // Update header
    titleEl.textContent = meta.title;
    metaEl.textContent = `Última atualização: ${meta.updated}`;

    // Show loading
    contentEl.classList.add('loading');
    contentEl.innerHTML = '<p>Carregando...</p>';

    try {
        // Fetch markdown file
        const response = await fetch(`./${docPath}.md`);

        if (!response.ok) {
            throw new Error('Documento não encontrado');
        }

        const md = await response.text();
        const html = mdToHtml(md);

        contentEl.innerHTML = html;

        // Update active link
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.doc === docPath) {
                link.classList.add('active');
            }
        });

        // Update URL without reload
        history.pushState({ doc: docPath }, '', `#${docPath}`);

    } catch (error) {
        contentEl.innerHTML = `<p style="color: #ef4444;">Erro ao carregar documento: ${error.message}</p>`;
    } finally {
        contentEl.classList.remove('loading');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for hash in URL
    const hash = window.location.hash.slice(1);
    const initialDoc = hash || 'legal/politica-de-privacidade';

    // Load initial document
    loadDoc(initialDoc);

    // Handle navigation clicks
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const doc = link.dataset.doc;
            loadDoc(doc);
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.doc) {
            loadDoc(e.state.doc);
        }
    });
});