require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const { connectRedis } = require('./config/redis.config');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// 1. Trust proxy in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 2. Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URLS.split(','),
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { 
  stream: logger.stream 
}));

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Session configuration (for flash messages)
const RedisStore = connectRedis(session);
app.use(
  session({
    store: new RedisStore({
      client: require('./config/redis.config').redisClient,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Flash messages and Passport
app.use(flash());
require('./config/passport.config')(passport);
app.use(passport.initialize());
app.use(passport.session());

// 3. Static files and views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 4. Routes
app.use('/', require('./routes/index.routes'));

// 5. Error handling
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
app.use(errorConverter);
app.use(errorHandler);

// 6. 404 Handler (must be last!)
app.use('*', (req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('errors/404');
  }
  if (req.accepts('json')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).send('Not found');
});

module.exports = app;