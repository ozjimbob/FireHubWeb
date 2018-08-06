var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bushfire Risk Management Web'});
});

router.get('/login',function(req,res,next){
  console.log("Get login");
  res.render('login');
});

router.post('/login',function(req,res,next){
	console.log("Login received");
	if(req.body.email && req.body.email==='test@gmail.com' && req.body.password && req.body.password==='pass'){
		console.log("Logged in");
		req.session.authenticated=true;
		req.session.email = req.body.email;
		res.redirect('/firetools');
	}else{
		console.log("Login failed");
		res.render('/login',{error:"Login failed"});
	}	
});

router.get("/logout",function(req,res,next){
	delete req.session.authenticated;
	res.redirect('/');
});

module.exports = router;
