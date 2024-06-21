module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            if (!req.session.cartId && req.user.cartId) {
                req.session.cartId = req.user.cartId;
            }
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.is_admin) {
            console.log('Admin access granted');
            return next();
        }
        console.log('Admin access denied');
        req.flash('error_msg', 'You do not have permission to view that resource');
        res.redirect('/');
    }
};
