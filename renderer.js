// renderer.js
const { escapeHtml, serializeForScript } = require('./shared/escapeHtml');
const { renderHeader } = require('./components/Header');
const { renderFooter } = require('./components/Footer');

const pages = {
  catalog: require('./pages/catalog'),
  home: require('./pages/home'),
  contacts: require('./pages/contacts'),
  '404': require('./pages/404'),
  '500': require('./pages/500')
};

// layout принимает opts и аккуратно рендерит страницу
// opts: { title, metaDescription, body, schema, headerProps, footerProps }
function layout(body, data = {}, opts = {}) {
  const {
    title = 'Учебный магазин',
    description = 'Учебный интернет-магазин',
    schema = { '@type': 'WebPage' },
    url,
    headerProps = {},
    footerProps = {}
  } = opts;

  headerProps.logo = {
    src: '/static/images/logo.webp',
    alt: 'Логотип компании'
  };

  const ldJson = JSON.stringify(Object.assign({ '@context': 'https://schema.org' }, schema));
  const initialDataScript = Object.entries(data).length
    ? `<script type="application/json" id="__INITIAL_DATA__" data-url="${escapeHtml(url)}">${serializeForScript(data)}</script>`
    : '';

  // Добавляем skip-link для доступности (в начале body)
  const skipLink = `<a class="skip-link visibility-hidden" href="#app">Перейти к содержимому</a>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="icon" href="/static/images/favicon.ico">

  <script type="application/ld+json">${ldJson}</script>
  ${initialDataScript}
  <link rel="stylesheet" href="/static/style.css">
  <script defer src="/static/client.js"></script>
</head>
<body>
  ${skipLink}
  ${renderHeader(headerProps)}

  <main id="app" data-root tabindex="-1">
    ${body}
  </main>

  ${renderFooter(footerProps)}
</body>
</html>`;
}

// Универсальная точка входа: renderPage(templateName, data, opts)
async function renderPage(templateName = 'home', data = {}, opts = {}) {
  const tmpl = pages[templateName];
  if (!tmpl) {
    throw new Error('Такой страницы нет!');
  }

  const body = await tmpl.render(data, opts);

  return layout(body, data, opts);
}

module.exports = { renderPage };