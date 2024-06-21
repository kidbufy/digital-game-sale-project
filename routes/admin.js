const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Admin dashboard
router.get('/dashboard', ensureAdmin, (req, res) => {
    res.render('admin_dashboard', {
        user: req.user
    });
});

// View all users
router.get('/users', ensureAdmin, (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.render('admin_users', {
            users: results,
            user: req.user
        });
    });
});

// View all purchases
router.get('/purchases', ensureAdmin, (req, res) => {
    db.query('SELECT * FROM purchases', (err, results) => {
        if (err) throw err;
        res.render('admin_purchases', {
            purchases: results,
            user: req.user
        });
    });
});

// Delete a user
router.post('/users/delete', ensureAdmin, (req, res) => {
    const userId = req.body.userId;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) throw err;
        req.flash('success_msg', 'User deleted successfully');
        res.redirect('/admin/users');
    });
});

// Add a game
router.get('/add_game', ensureAdmin, (req, res) => {
    res.render('add_game', {
        user: req.user
    });
});

router.post('/add_game', ensureAdmin, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('add_game', {
                msg: err,
                user: req.user
            });
        } else {
            if (req.file == undefined) {
                res.render('add_game', {
                    msg: 'Error: No File Selected!',
                    user: req.user
                });
            } else {
                const { title, description, price } = req.body;
                const imageUrl = `/uploads/${req.file.filename}`;
                db.query('INSERT INTO games (title, description, price, image_url) VALUES (?, ?, ?, ?)', [title, description, price, imageUrl], (err, result) => {
                    if (err) throw err;
                    req.flash('success_msg', 'Game added successfully');
                    res.redirect('/admin/dashboard');
                });
            }
        }
    });
});

// Manage games
router.get('/manage_games', ensureAdmin, (req, res) => {
    db.query('SELECT * FROM games', (err, results) => {
        if (err) throw err;
        res.render('manage_games', {
            games: results,
            user: req.user
        });
    });
});

// Edit game
router.get('/edit_game/:id', ensureAdmin, (req, res) => {
    const gameId = req.params.id;
    db.query('SELECT * FROM games WHERE id = ?', [gameId], (err, result) => {
        if (err) throw err;
        res.render('edit_game', {
            game: result[0],
            user: req.user
        });
    });
});

router.post('/edit_game/:id', ensureAdmin, (req, res) => {
    const gameId = req.params.id;
    upload(req, res, (err) => {
        if (err) {
            res.render('edit_game', {
                msg: err,
                game: req.body,
                user: req.user
            });
        } else {
            const { title, description, price } = req.body;
            let updateQuery = 'UPDATE games SET title = ?, description = ?, price = ?';
            let queryParams = [title, description, price];
            if (req.file) {
                const imageUrl = `/uploads/${req.file.filename}`;
                updateQuery += ', image_url = ?';
                queryParams.push(imageUrl);
            }
            updateQuery += ' WHERE id = ?';
            queryParams.push(gameId);

            db.query(updateQuery, queryParams, (err, result) => {
                if (err) throw err;
                req.flash('success_msg', 'Game updated successfully');
                res.redirect('/admin/manage_games');
            });
        }
    });
});

module.exports = router;
