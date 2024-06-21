-- Use the database
USE game_market;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create the games table
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255)
);

-- Create the purchases table
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the purchased_items table
CREATE TABLE purchased_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    game_id INT,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    UNIQUE (purchase_id, game_id)  -- Ensure a game can only be purchased once per user
);

-- Create the carts table
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create the cart_items table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    game_id INT,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    UNIQUE (cart_id, game_id)  -- Ensure no duplicates of the same game in the cart
);

-- Insert sample data into the users table
INSERT INTO users (username, email, password) VALUES
('testuser1', 'testuser1@example.com', '$2a$10$7j9TL9.PF20d1b3Nh48NZO0P1fsZfOEHrvwWZ1cOp9SGclp1FBMSy'), -- password: testpassword1
('testuser2', 'testuser2@example.com', '$2a$10$7j9TL9.PF20d1b3Nh48NZO0P1fsZfOEHrvwWZ1cOp9SGclp1FBMSy'); -- password: testpassword1

-- Insert sample data into the games table
INSERT INTO games (title, description, price, image_url) VALUES
('Game 1', 'Description for Game 1', 19.99, 'https://via.placeholder.com/150'),
('Game 2', 'Description for Game 2', 29.99, 'https://via.placeholder.com/150'),
('Game 3', 'Description for Game 3', 39.99, 'https://via.placeholder.com/150'),
('Game 4', 'Description for Game 4', 49.99, 'https://via.placeholder.com/150'),
('Game 5', 'Description for Game 5', 59.99, 'https://via.placeholder.com/150');
