const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureAuthenticated } = require('../middleware/auth');

// View purchase history
router.get('/', ensureAuthenticated, (req, res) => {
    const userId = req.user.id; // Assuming user is logged in and req.user contains user info

    const query = `
        SELECT games.id AS game_id, games.title, games.price, purchases.purchase_date 
        FROM purchased_items 
        JOIN games ON purchased_items.game_id = games.id 
        JOIN purchases ON purchased_items.purchase_id = purchases.id 
        WHERE purchases.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) throw err;

        res.render('purchases', {
            purchases: results,
            user: req.user
        });
    });
});

// Return game
router.post('/return', ensureAuthenticated, (req, res) => {
    const userId = req.user.id;
    const gameId = req.body.gameId;

    const query = `
        DELETE purchased_items 
        FROM purchased_items 
        JOIN purchases ON purchased_items.purchase_id = purchases.id 
        WHERE purchases.user_id = ? AND purchased_items.game_id = ?
    `;

    db.query(query, [userId, gameId], (err, results) => {
        if (err) throw err;

        req.flash('success_msg', 'Game returned successfully!');
        res.redirect('/purchases');
    });
});

module.exports = router;
