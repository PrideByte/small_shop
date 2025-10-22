CREATE TABLE categories (
  	id INT PRIMARY KEY AUTO_INCREMENT,
	parent_id INT NULL,
  	name TEXT(1024) NOT NULL,
  	slug VARCHAR(512) NOT NULL,
    full_path TEXT(1024) NOT NULL,
  	FOREIGN KEY (parent_id) REFERENCES categories(id),
    UNIQUE KEY unique_slug_per_parent (slug, parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  	id INT PRIMARY KEY AUTO_INCREMENT,
	category_id INT NULL,
  	name TEXT(1024) NOT NULL,
  	slug VARCHAR(512) NOT NULL,
    description TEXT(1024),
    price DECIMAL(11, 2) NOT NULL,
    image TEXT(1024),
  	FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
