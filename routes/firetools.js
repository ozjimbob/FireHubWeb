var express = require('express');
const uuidv1 = require('uuid/v1');
var router = express.Router();
var multer = require('multer');
var db = require("../db");
var path = require('path');
var unzip = require('unzip');
var fs = require('fs');

var storage = multer.diskStorage({
 destination: function(req,file,cb){
	cb(null,'/home/grant/apps/FireHubWeb/storage')
},
 filename: function(req,file,cb){
	cb(null,uuidv1())}
  });

var upload = multer({storage:storage,
  fileFilter: function(req,file,cb){
    var ext = path.extname(file.originalname);
    if(ext !== '.zip'){
      req.fileValidationError = "Forbidden extension";
      return cb(null,false,req.fileValidationError);
  }
    cb(null,true);
  }});



/* GET home page. */
router.get('/', function(req, res, next) {
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
  if(req.fileValidationError){
    res.render('upload_error');
    
  }else{
  
  var dp_name = req.body['name'];
  var dp_description = req.body['description'];
  var dp_private = Boolean(req.body['private']);
  var dp_datayear = req.body['data_year'];
  var this_user_id =req.session.user_id; 
  var dp_filename = req.files.file[0].filename;
  var dp_size = req.files.file[0].size;
  var dp_filepath = req.files.file[0].path;
  
  // Extract zip contents to directory, remove zip file
  fs.renameSync(dp_filepath,dp_filepath + ".zip");
  fs.createReadStream(dp_filepath + ".zip").pipe(unzip.Extract({ path: dp_filepath }));
  fs.unlinkSync(dp_filepath + ".zip");

const {rows} = await db.query('insert into datapacks (datapack_id,user_id,name,description,data_year,size,private,file_path) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
    [dp_filename,this_user_id,dp_name,dp_description,dp_datayear,dp_size,dp_private,dp_filepath]);


 res.render('upload_done',{o_filename:dp_filename, o_size:dp_size});
  };
//  console.log(req.body['file']);
});

router.get('/list_dp',async (req,res,next) =>{
  const  pack_list = await db.query('select datapacks.*,users.name from datapacks left join users on datapacks.user_id = users.user_id where datapacks.user_id = $1 or datapacks.private = false order by uploaded_at desc',[req.session.user_id]);
  res.render('list_dp',{pl: pack_list.rows});
});

module.exports = router;
