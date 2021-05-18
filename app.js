var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var logger = require('morgan');
const config = require('./config/config');
const pino = require('pino-http')();
const logger = require('pino')();

var PersistentData = require('./database/database');
var data = new PersistentData().getInstance();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// Configure the local strategy for use by Passport.
//
// The local strategy requires a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
let strategy = new LocalStrategy(
  { usernameField: 'username', passReqToCallback: true },
  async function(req, username, password, done) {
    let userFound = await data.findByUsername(username);
    if (userFound.error.length > 0) {
      return done(err);
    }
    
    if (userFound.result.length <= 0) {
      req.flash("message", "No user by that name");
      return done(null, false, { message: "No user by that name" });
    }
    
    if (userFound.result[0].password !== password) {
      req.flash("message", "Not a matching password");
      return done(null, false, { message: "Not a matching password"});
    }

    return done(null, userFound.result[0]);
  }
);

passport.use(strategy);


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  let userFound = await data.findById(id);
  if (userFound.error.length > 0) {
    return done(err);
  }
  if (userFound.result.length <= 0) {
    return done(new Error(`User id ${id} not found`));
  }
  done(null, userFound.result[0]);
});



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(pino);    // Fem servir pino per deixar logs enlloc de morgan

app.use(require('express-session')({ secret: 'secret', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('index', { title: 'Ptit', baseUrl: config.APP_CLIENT_BASE_URL, m_alert: err.message });
});

// Comprobem que la BD té les taules necessàries i sinó les creem
(async function databaseInit() {
  let res = await data.CheckDatabaseTables();
  if (res.error.length > 0) {
    logger.error(res.error[0]);
  } else {
    logger.info(res.result[0]);
  }
})();

module.exports = app;
