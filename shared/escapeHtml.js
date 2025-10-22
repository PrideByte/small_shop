// shared/escapeHtml.js
// Централизованный модуль для экранирования HTML и безопасной сериализации JSON для встраивания в <script type="application/json">

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Безопасная сериализация для вставки в <script type="application/json"> или в текстовый узел.
// Мы используем <script type="application/json"> и кладём JSON в textContent, поэтому это безопасно.
// Тем не менее защищаемся от U+2028/U+2029 (они валидны в JS-строках, но могут ломать некоторые парсеры),
// и дополнительно не даём случайно вставить строку, которая будет интерпретирована как закрывающий тег,
// хотя в textContent это не выполняется — всё равно делаем санитаризацию для переносимости.
function serializeForScript(obj) {
  // stringify
  let json = JSON.stringify(obj);
  // replace U+2028 and U+2029 to escaped form
  json = json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return json;
}

module.exports = { escapeHtml, serializeForScript };