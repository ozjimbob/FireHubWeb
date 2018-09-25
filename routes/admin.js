var express = require('express');
var db = require("../db");
var router = express.Router();
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('adminIndex', { title: 'Fire Hub Web Administration'});
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
});

router.get("/logout",function(req,res,next){
	delete req.session.authenticated;
	delete req.session.email;
	delete req.session.admin;
	delete req.session.name;
	delete req.session.user_id;
	res.redirect('/');
});

router.get('/add_user',function(req,res,next){
  res.render('add_user',{title: 'FireTools Admin Add User'});
});

router.post('/do_add_user',async(req,res,next)=>{
var name = req.body.name;

const user_exists = await db.query('select * from users where email = $1',[email]);
if(user_exists.rowCount!=1){
  res.render('unauth',{title:'FireTools',message:'This user email address already exists.'});
  return;
}


var email = req.body.email;
var password = req.body.password;
var admin = Boolean(req.body.admin);
let hash = bcrypt.hashSync(password, 10);

const {rows} = await db.query('insert into users (name,email,password,admin) VALUES ($1,$2,$3,$4);',
 [name,email,hash,admin]);

res.render('done_add_user',{title: 'FireTools User Added'});

});

module.exports = router;
