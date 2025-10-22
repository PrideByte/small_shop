const { escapeHtml } = require('../shared/escapeHtml');

async function render(data = {}, opts = {}) {
  let categories = data.subcategories?.map(c => {
    return `
      <article class="category">
        <a href='/catalog/${c.full_path}' itemprop="name">${escapeHtml(c.name)}</a>
      </article>`
  }).join('\n') || '';

  categories = categories && `
    <div class='categories'>
      <p>Категории</p>
      ${categories}
    </div>
  `;

  let products = data.products?.map(p => {
    return `
    <article class="product" itemscope itemtype="https://schema.org/Product">
      <h2 itemprop="name">
        ${opts?.type === "category" ? `<a href="/catalog/${p.full_path + '/' + p.slug}">` : ''}
        ${escapeHtml(p.name)}
        ${opts?.type === "category" ? `</a>` : ''}
      </h2>
      <img src="${escapeHtml(p.image || '/static/noimage.png')}" alt="${escapeHtml(p.name)}" itemprop="image" width="200" height="200">
      <p itemprop="description">${escapeHtml(p.description || '')}</p>
      <p><strong itemprop="price">${escapeHtml((p.price ?? '').toString())}</strong> ₽</p>
    </article>`
  }).join('\n') || '';

  products = (products && opts?.type === "category")
    ? `
    <div class='products'>
      <p>Товары</p>
      ${products}
    </div>`
    : products;

  const items = (categories + '\n' + products).trim() || '<p>Нет товаров в данной категории!</p>';

  return `<section aria-label="Каталог товаров" aria-describedby="catalog-desc">
    <h1 id="catalog-desc">Каталог товаров</h1>
    ${items}
  </section>`;
}

module.exports = { render };