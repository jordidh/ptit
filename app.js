var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
//var logger = require('morgan');
const config = require('./config/config');
const pino = require('pino-http')();
const logger = require('pino')();

var PersistentData = require('./database/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
var data = new PersistentData().getInstance();
(async function databaseInit() {
  let res = await data.CheckDatabaseTables();
  if (res.error.length > 0) {
    logger.error(res.error[0]);
  } else {
    logger.info(res.result[0]);
  }
})();

module.exports = app;
