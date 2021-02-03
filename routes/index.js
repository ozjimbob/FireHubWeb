var express = require('express');
var db = require("../db");
var router = express.Router();
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bushfire Risk Management Web'});
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About - Bushfire Risk Management Web'});
});



router.get('/login/:msg',function(req,res,next){
  res.render('login',{msg:req.params.msg});
});

router.post('/login', async (req,res,next) =>{

	const {rows} = await db.query('select * from users where upper(email) = $1',[req.body.email.toUpperCase()]);
  if(rows.length == 0){
       res.redirect('/login/Login Failed');
  };
	const hash = rows[0].password;
	bcrypt.compare(req.body.password, hash, function(errs, resp) {
  			if(resp) {
	        console.log("Logged in");
	        req.session.authenticated=true;
          req.session.email = req.body.email;
				  req.session.admin = rows[0].admin;
				  req.session.name = rows[0].name;
				  req.session.user_id = rows[0].user_id;
          console.log(req.session);
          res.redirect('/firetools');


			  } else {
		      res.redirect('/login/Login Failed');
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

// View/edit account

router.get('/account',async(req,res,next)=>{
    user_id = req.session.user_id
    const user_exists = await db.query('select * from users where user_id = $1',[user_id])
    if(user_exists.rowCount==0){
        res.render('unauth',{title:'FireTools',message:'This user does not exist.'});
        return;
    }
    res.render('edit_account',{title: 'FireTools Admin Add User',ul:user_exists.rows[0]});
});

// Save account edits

router.post('/do_edit_account',async(req,res,next)=>{
    var name = req.body.name;
    var user_id = req.session.user_id;
    var email = req.body.email;
    console.log(email)
    const user_exists = await db.query('select * from users where email = $1 and user_id <> $2',[email,user_id]);
    console.log(user_exists)
    console.log(user_exists.rowCount)
    if(user_exists.rowCount!=0){
        res.render('unauth',{title:'FireTools',message:'This user email address already exists.'});
        return;
    }

    var password = req.body.password;
    let hash = bcrypt.hashSync(password, 10);

    if(password == ""){
        console.log("Edit: No password change")
        const {rows} = await db.query('update users set (name,email) = ($1,$2) where user_id = $3',[name,email,user_id])
    }else{
        console.log("Edit: Password change")
        const {rows} = await db.query('update users set (name,email,password) = ($1,$2,$3) where user_id = $4',[name,email,hash,user_id])
    }
    res.render('done_edit_user',{title: 'FireTools User Edited'});

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
