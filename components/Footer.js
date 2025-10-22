// ./components/Footer.js
const { escapeHtml } = require('../shared/escapeHtml');

function renderFooter(props = {}) {
  const year = new Date().getFullYear();
  const orgName = props.organizationName || 'Учебный магазин';

  return `
  <footer role="contentinfo" itemscope itemtype="https://schema.org/WPFooter" aria-label="Подвал сайта">
    <div class="footer-inner">
      <p>&copy; ${escapeHtml(String(year))} ${escapeHtml(orgName)}</p>
      ${props.address ? `<address itemprop="address">${escapeHtml(props.address)}</address>` : ''}
    </div>
  </footer>`;
}

module.exports = { renderFooter };