var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
//var multer = require('multer');
//var upload = multer({dest:'uploads/'})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var fireToolsRouter = require('./routes/firetools');
var adminRouter = require('./routes/admin');

var app = express();

global.__basedir = __dirname;

// Connect to database

const db = require('./db');


function checkAuth (req, res, next) {
	// Authenticate firetools zone
  myRex =  new RegExp("^\/firetools");
  if (myRex.test(req.url) &&  (!req.session || !req.session.authenticated)){
    res.render('unauthorised', { status: 403 });
  return;
  }
  // Authenticate admin zone
  myRex = new RegExp("^\/admin");
  if (myRex.test(req.url) && (!req.session || !req.session.authenticated || !req.session.admin)){
    res.render('unauthorised',{status:403});
    return;
  }

	next();
}



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

var sess_options = {
    useAsync: true,
    reapInterval: 5000,
    maxAge: 10000
};



app.use(session({
  store: new FileStore(sess_options),
  secret:'P0lonius',
  resave: false,
  saveUninitialized: false
}));
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ftmaps',express.static(path.join(__dirname, 'maps')));
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
app.use('/admin',adminRouter);

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
