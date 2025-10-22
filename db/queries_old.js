// ./db/queries.js
/**
 * Простейшие заглушки для имитации выборки данных из БД.
 * В реальном проекте тут можно использовать SQL, ORM или GraphQL.
 */

async function getProducts(filter = {}) {
  // Эмуляция товаров
  const allProducts = [
    { name: 'Samsung Galaxy S21', slug: 'samsung-galaxy-s21', categoryPath: 'electronics/phones', description: 'Флагман Samsung', price: 70000, image: '/static/s21.png' },
    { name: 'iPhone 15', slug: 'iphone-15', categoryPath: 'electronics/phones', description: 'Флагман Apple', price: 95000, image: '/static/iphone15.png' },
    { name: 'Sony Bravia TV', slug: 'sony-bravia-tv', categoryPath: 'electronics/tv', description: 'Телевизор Sony', price: 120000, image: '/static/tv.png' },
    { name: 'Whirlpool W7', slug: 'whirlpool-w7', categoryPath: 'appliances/washers', description: 'Стиральная машина', price: 45000, image: '/static/washer.png' }
  ];

  // Если фильтр по категориям
  if (filter.categories) {
    const path = filter.categories.join('/');
    return allProducts.filter(p => p.categoryPath.startsWith(path));
  }

  return allProducts;
}

/**
 * Получение категории по пути (может быть вложенной)
 * @param {string} categoryPath - например 'electronics/phones'
 */
async function getCategoryByPath(categoryPath) {
  const allCategories = [
    { name: 'Электроника', path: 'electronics', description: 'Все электронные устройства' },
    { name: 'Телефоны', path: 'electronics/phones', description: 'Смартфоны и мобильные телефоны' },
    { name: 'Телевизоры', path: 'electronics/tv', description: 'Современные телевизоры' },
    { name: 'Бытовая техника', path: 'appliances', description: 'Техника для дома' },
    { name: 'Стиральные машины', path: 'appliances/washers', description: 'Лучшие стиральные машины' }
  ];

  return allCategories.find(cat => cat.path === categoryPath) || null;
}

/**
 * Получение конкретного товара по slug
 * @param {string} slug - например 'samsung-galaxy-s21'
 */
async function getProductBySlug(slug) {
  const allProducts = await getProducts();
  return allProducts.find(p => p.slug === slug) || null;
}

module.exports = {
  getProducts,
  getCategoryByPath,
  getProductBySlug
};



// async function getProducts() {
//   return [
//     { name: 'Товар 1', image: '/static/images/product1.png', description: 'Описание товара 1', price: 100 },
//     { name: 'Товар 2', image: '/static/images/product2.png', description: 'Описание товара 2', price: 200 }
//   ];
// }

// module.exports = { getProducts };