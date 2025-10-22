// ./components/Header.js
const { escapeHtml } = require('../shared/escapeHtml');

function renderHeader(props = {}) {
  const menu = Array.isArray(props.menu) ? props.menu : [
    { title: 'Главная', href: '/' },
    { title: 'Каталог', href: '/catalog' },
    { title: 'Контакты', href: '/contacts' }
  ];

  const logoHtml = props.logo && props.logo.src
    ? `<a class="siteLogo__link" href="/" data-link aria-label="${escapeHtml(props.logo.alt || 'Главная')}">
         <img class="siteLogo__image" src="${escapeHtml(props.logo.src)}" alt="${escapeHtml(props.logo.alt || '')}" width="120" height="40">
       </a>`
    : `<a class="siteLogo__link" href="/" data-link aria-label="Главная">Учебный магазин</a>`;

  const items = menu.map(item => {
    const isCurrent = props.currentPath === item.href;
    return `<li class="mainNav__item${isCurrent ? ' mainNav__item-active' : ''}">
      <a class="mainNav__link" href="${escapeHtml(item.href)}" data-link ${isCurrent ? 'aria-current="page"' : ''}>${escapeHtml(item.title)}</a>
    </li>`;
  }).join('\n');

  return `
  <header class="header" role="banner" itemscope itemtype="https://schema.org/WPHeader" aria-label="Шапка сайта">
    <div class="header__inner">
      <div class="siteLogo">
        ${logoHtml}
      </div>
      <nav class="mainNav" role="navigation" aria-label="Основная навигация" itemscope itemtype="https://schema.org/SiteNavigationElement">
        <ul class="mainNav__list">
          ${items}
        </ul>
      </nav>
    </div>
  </header>`;
}

module.exports = { renderHeader };