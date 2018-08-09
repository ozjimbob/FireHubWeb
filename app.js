var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
//var multer = require('multer');
//var upload = multer({dest:'uploads/'})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fireToolsRouter = require('./routes/firetools');

var app = express();

// Connect to database

const db = require('./db');


function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);
	myRex =  new RegExp("^\/firetools");
    // don't serve /secure to those not logged in
	// you should add to this list, for each and every secure url
//	if (req.url === '/firetools' && (!req.session || !req.session.authenticated)) {
//		res.render('unauthorised', { status: 403 });
//		return;
//	}
  if (myRex.test(req.url) &&  (!req.session || !req.session.authenticated)){
  res.render('unauthorised', { status: 403 });
  return;
  }

	next();
}



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(session({secret:'poloniUs'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use(checkAuth);

// Set up JQuery and Bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// Set up main routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/firetools',fireToolsRouter);

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
  res.render('error');
});

module.exports = app;
