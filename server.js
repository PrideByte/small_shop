const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { renderPage } = require('./renderer');
const { DB } = require('./db/queries');

// === Константы ===
const PORT = 8080;
const CACHE_DIR = path.resolve('./cache');
const DB_CONFIG = {
    host: 'localhost',
    user: 'shop_gpt',
    password: 'KY4$}LF}H*)naq?',
    database: 'shop_gpt',
    charset: 'utf8mb4'
};
const PRODUCTS_PER_PAGE = 10;
const dataBase = new DB(DB_CONFIG);

// === Основные структуры ===
const pageCache = new Map();       // { url: filePath }
const generationLocks = new Map(); // { url: Promise }

// === 🔒 Безопасное соединение путей ===
function safeJoin(base, target) {
    const resolvedBase = path.resolve(base);
    const resolvedTarget = path.resolve(base, target);
    const relative = path.relative(resolvedBase, resolvedTarget);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('Path traversal attempt detected');
    }

    return resolvedTarget;
}

// === Работа с кэшем ===

// Чтение HTML из кэша
async function getCachedPage(url) {
    const cachePath = pageCache.get(url);
    if (!cachePath) return null;
    try {
        return await fs.readFile(cachePath, 'utf8');
    } catch {
        deleteCachedPage(url)
        return null;
    }
}

// Запись HTML в кэш
async function writeCachedPage(url, html) {
    const fileName = url.replace(/[^\w]/g, '_') + '.html';
    try {
        const filePath = safeJoin(CACHE_DIR, fileName);
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(filePath, html, 'utf8');
        pageCache.set(url, filePath);
    } catch (err) {
        console.error(`Ошибка записи кэша для ${url}:`, err);
    }
}

// Удаление страницы с диска и Map
async function deleteCachedPage(url) {
    try {
        const filePath = pageCache.get(url);
        if (filePath) {
            await fs.unlink(filePath);
            pageCache.delete(url);
        }
    } catch (err) {
        console.error(`Ошибка при удалении файла ${filePath}:`, err);
    }
}

// === Централизованная генерация и кэширование страниц ===
async function generatePage(url, dataProvider, templateName, statusCode = 200) {
    // Проверяем кэш
    const cached = await getCachedPage(url);
    if (cached) return { html: cached, status: statusCode };

    // Проверяем блокировку (чтобы не было race conditions)
    if (generationLocks.has(url)) {
        const result = await generationLocks.get(url);
        return result;
    }

    // Создаём новую задачу генерации
    const promise = (async () => {
        try {
            const pageData = await dataProvider();
            const { data, ...opts } = (pageData && typeof pageData === 'object') ? pageData : {};

            const html = await renderPage(templateName, data, opts);
            await writeCachedPage(url, html);
            return { html, status: statusCode };
        } catch (err) {
            console.error(`Ошибка генерации страницы ${url}:`, err);
            const html = await renderPage(
                '500',
                {},
                {
                    title: 'Ошибка сервера',
                    url,
                    headerProps: { currentPath: url },
                    footerProps: { organizationName: 'Учебный магазин' }
                }
            );
            return { html, status: 500 };
        }
    })();

    generationLocks.set(url, promise);
    promise.finally(() => generationLocks.delete(url));

    return await promise;
}

// === Вспомогательная отправка HTML ===
function sendHtml(res, html, statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

// === Маршруты ===
const routes = {
    '/catalog': async (req, res) => {
        const { html, status } = await generatePage(
            '/catalog',
            async () => ({
                title: 'Каталог товаров',
                description: 'Просмотрите наш ассортимент продукции',
                data: {
                    products: await dataBase.getAllProducts({ limit: PRODUCTS_PER_PAGE, offset: 0 }),
                    subcategories: await dataBase.getRootCategories()
                },
                type: 'category'
            }),
            'catalog'
        );
        sendHtml(res, html, status);
    },

    '/': async (req, res) => {
        const { html, status } = await generatePage(
            '/',
            async () => ({
                title: 'Главная страница',
                description: 'Добро пожаловать в наш интернет-магазин!',
            }),
            'home'
        );
        sendHtml(res, html, status);
    },

    '/contacts': async (req, res) => {
        const { html, status } = await generatePage(
            '/contacts',
            async () => ({
                title: 'Контакты',
                description: 'Свяжитесь с нами любым удобным способом',
            }),
            'contacts'
        );
        sendHtml(res, html, status);
    },

    '/404': async (req, res) => {
        const { html, status } = await generatePage(
            '/404',
            async () => ({
                title: 'Страница не найдена',
                description: 'Ошибка 404: страница не найдена.',
                url: req.url
            }),
            '404',
            404
        );
        sendHtml(res, html, status);
    }
};

// === Динамические роуты ===
const dynamicRoutes = {
    'category': (category) => async (req, res) => {
        const { html, status } = await generatePage(
            `/catalog/${category.full_path}`,
            async () => ({
                title: `Категория: ${category.name}`,
                description: `Товары в категории "${category.name}"`,
                data: {
                    products: await dataBase.getProductsByCategory(category, { limit: PRODUCTS_PER_PAGE, offset: 0 }),
                    subcategories: await dataBase.getSubcategories(category)
                },
                type: "category",
            }),
            'catalog'
        );
        sendHtml(res, html, status);
    },
    'product': (category, productSlug) => async (req, res) => {
        const product = await dataBase.getProduct(productSlug);
        if (!product.length) {
            return routes['/404'](req, res);
        }
        const { html, status } = await generatePage(
            `/catalog/${category.full_path}/${product[0].slug}`,
            async () => ({
                title: `Товар: ${product[0].name}`,
                description: `Информация о товаре "${product[0].name}" в категории "${category.name}"`,
                data: {
                    products: product
                }
            }),
            'catalog'
        );
        sendHtml(res, html, status);
    }
};

function getDynamicHandler(pathname) {
    const rel = pathname.replace(/^\/catalog\//, '');
    const segments = rel.split('/').filter(Boolean);

    // Проверяем, есть ли категория с таким полным путём
    const catPath = segments.join('/');
    const category = dataBase.categoriesMap?.get(catPath);
    if (category) {
        return dynamicRoutes['category'](category);
    }

    // Иначе, возможно, это товар
    const productSlug = segments.pop();
    const parentPath = segments.join('/');
    const categoryParent = dataBase.categoriesMap?.get(parentPath);

    if (categoryParent) {
        return dynamicRoutes['product'](categoryParent, productSlug);
    }

    return null;
}


// === Безопасные заголовки ===
function setSecurityHeaders(res) {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; '));

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
}

// === Обработка статики ===
async function serveStatic(filePath, res) {
    try {
        const full = path.join(__dirname, filePath);
        const data = await fs.readFile(full);
        const ext = path.extname(full).toLowerCase();
        const types = {
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.html': 'text/html; charset=utf-8'
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
    } catch (err) {
        console.error(err);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
    }
}

async function startServer() {
    await dataBase.init();

    // === Основной HTTP-сервер ===
    http.createServer(async (req, res) => {
        try {
            // Устанавливаем защитные заголовки для каждого ответа
            setSecurityHeaders(res);

            const url = new URL(req.url.replaceAll(/\/{2,}/g, '/'), `http://${req.headers.host}`);
            const pathname = decodeURIComponent(url.pathname).match(/(.+?)\/?$/)[1];

            if (pathname.startsWith('/static/')) {
                await serveStatic(pathname, res);
            } else {
                const handler = routes[pathname] || getDynamicHandler(pathname) || routes['/404'];

                await handler(req, res);
            }
        } catch (err) {
            console.error('Ошибка на сервере:', err);
            const html = await renderPage(
                '500',
                {},
                {
                    title: 'Ошибка сервера',
                    url: '/',
                    headerProps: { currentPath: '/' },
                    footerProps: { organizationName: 'Учебный магазин' }
                }
            );
            sendHtml(res, html, 500);
        }
    }).listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
}

startServer();