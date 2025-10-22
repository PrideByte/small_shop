const mysql = require('mysql2/promise');

class DB {
    constructor(opts) {
        this.pool = mysql.createPool(opts);
    }

    init = async function() {
        const categories = await this.pool.query('SELECT * FROM categories');
        this.categoriesMap = categories[0].reduce((m, e) => m.set(e.full_path, e), new Map());
    }

    getRootCategories = async function() {
        const result = await this.pool.query(`
            SELECT *
            FROM categories
            WHERE ISNULL(parent_id)
        `);

        return result[0];
    }

    getSubcategories = async function(category) {
        if (!category) {
            return [];
        }

        const subcategories = (await this.pool.query(`
            SELECT *
            FROM categories
            WHERE parent_id = ?
        `, [category.id]))[0];

        return subcategories;
    }

    getProductsByCategory = async function(category, filter) {
        if (!category) {
            return [];
        }

        const products = (await this.pool.query(`
            SELECT products.*, categories.full_path AS full_path
            FROM products
            INNER JOIN categories
            ON categories.id = products.category_id
            WHERE category_id = ?
            LIMIT ? OFFSET ?
        `, [category.id, filter.limit, filter.offset]))[0];

        return products;
    }

    getProduct = async function(slug) {
        if (!slug) {
            return [];
        }

        const result = await this.pool.query(`
            SELECT *
            FROM products
            WHERE slug = ?
        `, [slug]);

        return result[0];
    }

    getAllProducts = async function(filter = {}) {
        const result = await this.pool.query(`
            SELECT products.*, categories.full_path AS full_path
            FROM products
            INNER JOIN categories
            ON categories.id = products.category_id
            LIMIT ? OFFSET ?
        `, [filter.limit, filter.offset]);

        return result[0];
    }
}

module.exports = { DB };