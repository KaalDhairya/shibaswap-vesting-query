var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var verifyRequest = require('./routes/auth');
const MongoClient = require("mongodb").MongoClient;
var mongoose = require('mongoose');
var DB = 'mongodb://localhost:27017/vesting';
// var DB = 'mongodb+srv://shib:qXUaCrG3aI5Xfq0f@shibaswap.xslju.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
 }, (err, res) => {
  if (res)
    return console.log("----------------->> MongoDB Connected! <<-----------------")
  else (err)
  console.log(err);
    return console.log("----------------> MongoDB Not Connected! <<---------------")
});


// MongoClient.connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//    }, (error, client) => {
//   if(error) {
//       console.log("Error in connecting mongodb: ", error);
//       throw error;
//   }
//   database = client.db('myFirstDatabase');
//   console.log("Connected to !");
// });


require('./scripts/buryBoneCollection');
require('./scripts/buryLeashCollection');
require('./scripts/buryShibCollection');
require('./scripts/topDogCollection');

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
