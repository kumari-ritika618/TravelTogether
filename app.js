const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const destinationBookRoutes = require('./routes/destinationBookRoutes');
const path = require('path');

const app = express();

mongoose.connect('mongodb://localhost:27017/traveltogether_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

app.use(express.static(path.join(__dirname, '/public'), { maxAge: '30d' })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '30d' })); 
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    name: 'adminSession',
    secret: 'your-admin-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(session({
    name: 'userSession',
    secret: 'your-user-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(function(req, res, next) {
    if (req.session.user) {
        res.locals.user = {
            _id: req.session.user._id,
            username: req.session.user.username,
            name: req.session.user.name,
            photo: req.session.user.photo
        };
    }
    next();
});

app.use(function(req, res, next) {
    if (req.session.user) {
        res.cookie('userCookie', req.session.user.username, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    }

    if (req.session.admin) {
        res.cookie('adminCookie', req.session.admin.username, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    }

    next();
});

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/booking', bookingRoutes);
app.use('/desBook', destinationBookRoutes);

app.use((req, res, next) => {
    res.status(404).send("Sorry, the requested page doesn't exist.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
