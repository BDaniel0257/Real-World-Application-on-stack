CREATE DATABASE IF NOT EXISTS blueplate_restaurant
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blueplate_restaurant;

CREATE TABLE IF NOT EXISTS meals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  emoji VARCHAR(20) NOT NULL DEFAULT '🍽️',
  available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Preparing','Ready','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  meal_id INT UNSIGNED NULL,
  meal_name VARCHAR(120) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO meals (name, category, description, price, emoji, available) VALUES
('Classic Beef Burger','Burgers','Juicy beef patty with lettuce, tomato and house sauce.',65.00,'🍔',1),
('Margherita Pizza','Pizza','Pizza topped with cheese, tomato and fresh herbs.',90.00,'🍕',1),
('Crispy Fried Chicken','Chicken','Crispy fried chicken with a delicious house seasoning.',75.00,'🍗',1),
('Fresh Orange Juice','Drinks','Refreshing orange juice served chilled.',20.00,'🥤',1),
('Jollof Rice with Chicken','Local Favourites','Ghana-style jollof rice served with seasoned chicken.',80.00,'🍛',1),
('Chocolate Cake','Desserts','Rich chocolate cake for a sweet finish.',35.00,'🍰',1);
