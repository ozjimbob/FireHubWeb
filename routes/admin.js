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

// Add user

router.get('/add_user',function(req,res,next){
  res.render('add_user',{title: 'FireTools Admin Add User'});
});


// Edit user

router.get('/edit_user/:u_uuid',async(req,res,next)=>{
    console.log(req.params.u_uuid)
    const user_exists = await db.query('select * from users where user_id = $1',[req.params.u_uuid])
    if(user_exists.rowCount==0){
        res.render('unauth',{title:'FireTools',message:'This user does not exist.'});
        return;
    }
    res.render('edit_user',{title: 'FireTools Admin Add User',ul:user_exists.rows[0]});
});

// List Logs 

router.get('/list_logs',async(req,res,next)=>{

    const  pack_list = await db.query('select analysis.* from analysis left join users on analysis.user_id = users.user_id order by created_at desc');
    res.render('list_logs',{pl: pack_list.rows,title:'FireTools Analyses'});
});

// List users

router.get('/list_users',async(req,res,next)=>{

  const user_list = await db.query('select * from users order by email asc');
  res.render('list_users',{title: 'FireTools User List', ul:user_list.rows});
});

// Do Add User

router.post('/do_add_user',async(req,res,next)=>{
var name = req.body.name;

    var email = req.body.email;
const user_exists = await db.query('select * from users where email = $1',[email]);
if(user_exists.rowCount!=0){
  res.render('unauth',{title:'FireTools',message:'This user email address already exists.'});
  return;
}


var password = req.body.password;
var admin = Boolean(req.body.admin);
let hash = bcrypt.hashSync(password, 10);

const {rows} = await db.query('insert into users (name,email,password,admin) VALUES ($1,$2,$3,$4);',
 [name,email,hash,admin]);  

res.render('done_add_user',{title: 'FireTools User Added'});

});


// Do Edit User

router.post('/do_edit_user',async(req,res,next)=>{
    var name = req.body.name;
    var user_id = req.body.user_id;
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
    var admin = Boolean(req.body.admin);
    let hash = bcrypt.hashSync(password, 10);

    if(password == ""){
        console.log("Edit: No password change")
        const {rows} = await db.query('update users set (name,email,admin) = ($1,$2,$3) where user_id = $4',[name,email,admin,user_id])
    }else{
        console.log("Edit: Password change")
        const {rows} = await db.query('update users set (name,email,admin,password) = ($1,$2,$3,$4) where user_id = $5',[name,email,admin,hash,user_id])
    }
    res.render('done_edit_user',{title: 'FireTools User Edited'});

});

module.exports = router;
