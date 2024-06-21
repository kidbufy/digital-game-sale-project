const express = require('express');
const router = express.Router();
const db = require('../db');

// Games page
router.get('/', (req, res) => {
    db.query('SELECT * FROM games', (err, results) => {
        if (err) throw err;
        res.render('games', {
            title: 'Games',
            games: results,
            user: req.user // Ensure the user object is passed to the view
        });
    });
});

module.exports = router;
