// ./pages/home.js
async function render(data = {}, opts = {}) {
  return `<section aria-label="Главная">
    <h1>Добро пожаловать в учебный магазин</h1>
    <p>Это демонстрационная главная страница.</p>
  </section>`;
}

module.exports = { render };