var express = require('express');
var db = require("../db");
var router = express.Router();
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('adminIndex', { title: 'Bushfire Risk Management Web'});
});

router.get('/login',function(req,res,next){
  console.log("Get login");
  res.render('login');
});

router.post('/login', async (req,res,next) =>{
	console.log("Login received");

	const {rows} = await db.query('select * from users where email = $1',[req.body.email]);
	console.log("Query performed");
	const hash = rows[0].password;
	bcrypt.compare(req.body.password, hash, function(errs, resp) {
  			if(resp) {
	        console.log("Logged in");
	        req.session.authenticated=true;
          req.session.email = req.body.email;
				  req.session.admin = rows[0].admin;
				  req.session.name = rows[0].name;
				  req.session.user_id = rows[0].user_id;
          console.log(req.session.admin);
          res.redirect('/firetools');


			  } else {
			   	console.log("Login failed");
		                res.render('/login',{error:"Login failed"});
			  } 
		});
//	if(req.body.email && req.body.email==='test@gmail.com' && req.body.password && req.body.password==='pass'){
//		console.log("Logged in");
//		req.session.authenticated=true;
//		req.session.email = req.body.email;
//		res.redirect('/firetools');
//	}else{
//		console.log("Login failed");
//		res.render('/login',{error:"Login failed"});
//	}	
});

router.get("/logout",function(req,res,next){
	delete req.session.authenticated;
	delete req.session.email;
	delete req.session.admin;
	delete req.session.name;
	delete req.session.user_id;
	res.redirect('/');
});



module.exports = router;