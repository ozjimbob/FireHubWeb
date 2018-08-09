var express = require('express');
const uuidv1 = require('uuid/v1');
var router = express.Router();
var multer = require('multer');
var db = require("../db");


var storage = multer.diskStorage({
 destination: function(req,file,cb){
	cb(null,'/home/grant/apps/FireHubWeb/storage')
},
 filename: function(req,file,cb){
	cb(null,uuidv1())}
});

var upload = multer({storage:storage});


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  res.render('firetools', { title: 'FireTools' });
});


// GET upload datapack (upload_dp) to upload and define new file

router.get('/upload_dp',function(req,res,next){
        console.log("RENDER UPLAOD");
        res.render('upload_dp',{title: 'FireTools Upload'});
//	res.render('firetools', { title: 'FireTools' });
});


// Define upload file processing function
var dpUpload = upload.fields([{name:'name',maxCount:1},
				{name:'description',maxCount:1},
				{name:'data_year',maxCount:1},
				{name:'private',maxCount:1},
				{name:'file',maxCount:1}]);



// Process uploaded file

router.post('/post_upload',dpUpload, async (req,res,next) =>{
	// here we deal with the file
  
  var dp_name = req.body['name'];
  var dp_description = req.body['description'];
  var dp_private = Boolean(req.body['private']);
  var dp_datayear = req.body['data_year'];
  var this_user_id =req.session.user_id; 
  var dp_filename = req.files.file[0].filename;
  var dp_size = req.files.file[0].size;
  var dp_filepath = req.files.file[0].path;
  console.log(dp_private);
const {rows} = await db.query('insert into datapacks (datapack_id,user_id,name,description,data_year,size,private,file_path) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
    [dp_filename,this_user_id,dp_name,dp_description,dp_datayear,dp_size,dp_private,dp_filepath]);


 res.render('upload_done',{o_filename:dp_filename, o_size:dp_size});

//  console.log(req.body['file']);
});

module.exports = router;
