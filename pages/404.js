// ./pages/404.js
async function render(data = {}, opts = {}) {
  return `<section aria-label="Ошибка 404">
    <h1>Ошибка 404</h1>
    <p>Запрошенная страница ${opts.url} не найдена.</p>
    <a href="/" data-link>На главную</a>
  </section>`;
}

module.exports = { render };