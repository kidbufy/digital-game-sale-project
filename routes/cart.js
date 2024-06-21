const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureAuthenticated } = require('../middleware/auth');

// Middleware to initialize cart in session
router.use(ensureAuthenticated, (req, res, next) => {
    if (!req.session.cartId) {
        db.query('SELECT id FROM carts WHERE user_id = ?', [req.user.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                req.session.cartId = results[0].id;
            } else {
                db.query('INSERT INTO carts (user_id) VALUES (?)', [req.user.id], (err, result) => {
                    if (err) throw err;
                    req.session.cartId = result.insertId;
                });
            }
            next();
        });
    } else {
        next();
    }
});

// View cart
router.get('/', (req, res) => {
    if (!req.session.cartId) {
        return res.render('cart', { cartItems: [], user: req.user });
    }

    db.query('SELECT games.* FROM cart_items JOIN games ON cart_items.game_id = games.id WHERE cart_items.cart_id = ?', [req.session.cartId], (err, results) => {
        if (err) throw err;
        res.render('cart', {
            cartItems: results,
            user: req.user
        });
    });
});

// Add to cart
router.post('/add', (req, res) => {
    const userId = req.user.id;
    const gameId = req.body.gameId;

    if (!req.session.cartId) {
        db.query('INSERT INTO carts (user_id) VALUES (?)', [userId], (err, result) => {
            if (err) throw err;
            req.session.cartId = result.insertId;
            addCartItem(req.session.cartId, userId, gameId, res);
        });
    } else {
        addCartItem(req.session.cartId, userId, gameId, res);
    }
});

function addCartItem(cartId, userId, gameId, res) {
    db.query('SELECT * FROM cart_items WHERE cart_id = ? AND game_id = ?', [cartId, gameId], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            return res.redirect('/cart');
        } else {
            db.query('SELECT * FROM purchased_items JOIN purchases ON purchased_items.purchase_id = purchases.id WHERE purchases.user_id = ? AND purchased_items.game_id = ?', [userId, gameId], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    return res.redirect('/cart');
                } else {
                    db.query('INSERT INTO cart_items (cart_id, game_id) VALUES (?, ?)', [cartId, gameId], (err, result) => {
                        if (err) throw err;
                        return res.redirect('/cart');
                    });
                }
            });
        }
    });
}

// Remove from cart
router.post('/remove', (req, res) => {
    const gameId = req.body.gameId;
    db.query('DELETE FROM cart_items WHERE cart_id = ? AND game_id = ?', [req.session.cartId, gameId], (err, result) => {
        if (err) throw err;
        res.redirect('/cart');
    });
});

// Checkout
router.post('/checkout', (req, res) => {
    const userId = req.user.id;
    const cartId = req.session.cartId;

    if (!cartId) {
        req.flash('error_msg', 'Your cart is empty.');
        return res.redirect('/cart');
    }

    db.query('SELECT game_id FROM cart_items WHERE cart_id = ?', [cartId], (err, results) => {
        if (err) throw err;

        const gameIds = results.map(item => item.game_id);
        if (gameIds.length === 0) {
            req.flash('error_msg', 'Your cart is empty.');
            return res.redirect('/cart');
        }

        gameIds.forEach(gameId => {
            db.query('SELECT price FROM games WHERE id = ?', [gameId], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    const gamePrice = result[0].price;

                    db.query('INSERT INTO purchases (user_id) VALUES (?)', [userId], (err, purchaseResult) => {
                        if (err) throw err;
                        const purchaseId = purchaseResult.insertId;

                        db.query('INSERT INTO purchased_items (purchase_id, game_id, price_at_purchase) VALUES (?, ?, ?)', [purchaseId, gameId, gamePrice], (err, result) => {
                            if (err) throw err;
                        });

                        db.query('DELETE FROM cart_items WHERE cart_id = ? AND game_id = ?', [cartId, gameId], (err, result) => {
                            if (err) throw err;
                        });
                    });
                } else {
                    console.error("Error: Game price not found");
                    return res.redirect('/cart');
                }
            });
        });

        // Delete all cart items before deleting the cart
        db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId], (err, result) => {
            if (err) throw err;
            db.query('DELETE FROM carts WHERE id = ?', [cartId], (err, result) => {
                if (err) throw err;
                req.session.cartId = null;
                req.flash('success_msg', 'Purchase successful!');
                res.redirect('/purchases');
            });
        });
    });
});

// Route to calculate total price of items in the cart
router.get('/total', ensureAuthenticated, (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT SUM(g.price) AS total FROM cart_items ci JOIN games g ON ci.game_id = g.id JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) throw err;
        res.json({ total: results[0].total });
    });
});

module.exports = router;
