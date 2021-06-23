var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var verifyRequest = require('./routes/auth');

var mongoose = require('mongoose');
var DB = 'mongodb://localhost:27017/vesting';
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
 }, (err, res) => {
  if (res)
    return console.log("----------------->> MongoDB Connected! <<-----------------")
  else (err)
    return console.log("----------------> MongoDB Not Connected! <<---------------")
});
require('./scripts/rewardsCollection');

var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(verifyRequest());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
