const bcrypt = require('bcryptjs');

const password = 'adminpassword'; // Replace with your desired password
const saltRounds = 10;

bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        console.log(`Hashed password: ${hash}`);
    });
});
