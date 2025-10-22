const { escapeHtml } = require('../shared/escapeHtml');

async function render(data = {}, opts = {}) {
  return `<section aria-label="Ошибка 500">
    <h1>Ошибка 500</h1>
    <p>${escapeHtml(data?.message || 'Internal Server Error')}</p>
  </section>`;
}

module.exports = { render };