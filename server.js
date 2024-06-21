const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');
const app = express();

// Passport config
require('./config/passport')(passport);

// EJS
app.set('view engine', 'ejs');

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the "public" directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'game_market'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Routes
const indexRoutes = require('./routes/index');
const gameRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const purchasesRoutes = require('./routes/purchases');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/games', gameRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/purchases', purchasesRoutes);
app.use('/admin', adminRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
