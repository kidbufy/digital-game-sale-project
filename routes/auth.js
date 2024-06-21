const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            email,
            password,
            password2
        });
    } else {
        // Validation passed
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = {
                    username: username,
                    email: email,
                    password: password,
                    is_admin: false // Default to non-admin user
                };

                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    db.query('INSERT INTO users SET ?', newUser, (err, result) => {
                        if (err) throw err;
                        req.flash('success_msg', 'You are now registered and can log in');
                        res.redirect('/auth/login');
                    });
                }));
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) throw err;
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

// Passport authentication strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return done(null, false, { message: 'That email is not registered' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        const user = results[0];

        db.query('SELECT id FROM carts WHERE user_id = ?', [user.id], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                user.cartId = results[0].id;
            } else {
                user.cartId = null;
            }
            console.log('Deserialized user:', user);
            done(null, user);
        });
    });
});

module.exports = router;
