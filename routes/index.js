const express = require('express');
const router = express.Router();
const db = require('../db');

// Home route
router.get('/', (req, res) => {
    // Fetch interesting news and game recommendations from the database
    db.query('SELECT * FROM news LIMIT 5', (err, news) => {
        if (err) throw err;
        
        db.query('SELECT * FROM games ORDER BY sales_count DESC LIMIT 5', (err, recommendations) => {
            if (err) throw err;

            res.render('index', {
                news: news,
                recommendations: recommendations,
                user: req.user
            });
        });
    });
});

module.exports = router;
