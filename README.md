# Game Store Website with Admin Access

## Description
This project is a game store website built with Node.js, Express, and MySQL. It allows users to browse, purchase, and manage their games. The website includes an admin panel where administrators can manage users and game inventory. Features include user authentication, cart management, purchase history, and more.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Functional Dependencies](#functional-dependencies)
- [Normalization](#normalization)
- [DDL Commands](#ddl-commands)
- [Triggers, Functions, Procedures](#triggers-functions-procedures)
- [SQL Queries](#sql-queries)
- [Architecture and Technologies](#architecture-and-technologies)
- [Team Contributions](#team-contributions)

## Requirements
- Node.js
- MySQL
- Express
- Sequelize ORM

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/gamestore.git
    ```
2. Navigate to the project directory:
    ```bash
    cd gamestore
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up the MySQL database using the provided SQL script.
5. Configure the database connection in the `.env` file.
6. Start the application:
    ```bash
    npm start
    ```

## Usage
- Register a new user account.
- Browse the game catalog.
- Add games to the cart and proceed to checkout.
- View purchase history.
- Admin users can log in to the admin panel to manage users and games.

## Database Schema
The database schema includes the following tables:
- `users`
- `carts`
- `cart_items`
- `games`
- `purchases`
- `purchased_items`

## Functional Dependencies
- Each user can have multiple carts (1:N relationship).
- Each cart can have multiple cart items (1:N relationship).
- Each game can appear in multiple cart items (1:N relationship).
- Each user can have multiple purchases (1:N relationship).
- Each purchase can have multiple purchased items (1:N relationship).
- Each game can appear in multiple purchased items (1:N relationship).

## Normalization
The database is normalized to the third normal form (3NF) to eliminate redundancy and ensure data integrity.

## DDL Commands
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    game_id INT,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url VARCHAR(255),
    sales_count INT DEFAULT 0
);

CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    purchase_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE purchased_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    game_id INT,
    price_at_purchase DECIMAL(10, 2),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);
