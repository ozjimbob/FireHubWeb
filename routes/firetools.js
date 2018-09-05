var express = require('express');
const uuidv1 = require('uuid/v1');
var router = express.Router();
var multer = require('multer');
var db = require("../db");
var path = require('path');
var unzip = require('unzip');
var fs = require('fs');
var cp = require('child_process');

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
    res.render('upload_error',{title: 'FireTools'});
    
  }else{
  
  var sqlpass = []

  sqlpass.dp_name = req.body['name'];
  sqlpass.dp_description = req.body['description'];
  sqlpass.dp_private = Boolean(req.body['private']);
  sqlpass.dp_datayear = req.body['data_year'];
  sqlpass.this_user_id =req.session.user_id; 
  sqlpass.dp_filename = req.files.file[0].filename;
  sqlpass.dp_size = req.files.file[0].size;
  sqlpass.dp_filepath = req.files.file[0].path;


  // Extract zip contents to directory, remove zip file
  fs.renameSync(sqlpass.dp_filepath,sqlpass.dp_filepath + ".zip");
  fs.createReadStream(sqlpass.dp_filepath + ".zip").pipe(unzip.Extract({ path: sqlpass.dp_filepath }));
  fs.unlinkSync(sqlpass.dp_filepath + ".zip");
  
  res.render('upload_done',{o_filename:sqlpass.dp_filename, o_size:sqlpass.dp_size,title:'FireTools'});


  cp.exec("./R/parse_ogr.r "+sqlpass.dp_filepath,async (error,stdout,stderr)=> {
 var contents = stdout;
const {rows} = await db.query('insert into datapacks (datapack_id,user_id,name,description,data_year,size,private,file_path,contents) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);',
    [sqlpass.dp_filename,sqlpass.this_user_id,sqlpass.dp_name,sqlpass.dp_description,sqlpass.dp_datayear,sqlpass.dp_size,sqlpass.dp_private,sqlpass.dp_filepath,stdout]);

  });

  };
//  console.log(req.body['file']);
});

router.get('/list_dp',async (req,res,next) =>{
  const  pack_list = await db.query('select datapacks.*,users.name from datapacks left join users on datapacks.user_id = users.user_id where datapacks.user_id = $1 or datapacks.private = false order by uploaded_at desc',[req.session.user_id]);
  res.render('list_dp',{pl: pack_list.rows,title:'FireTools'});
});

router.post('/define_analysis',async (req,res,next) =>{
  this_dp = req.body.datapack_id;
  const pack_data = await db.query('select datapacks.* from datapacks where datapack_id = $1 and user_id = $2',[this_dp,req.session.user_id]);
  if(pack_data.rowCount!=1){
    res.render('unauth',{title:'FireTools'});
    return;
  };
  res.locals.client_pack = JSON.stringify(pack_data.rows[0]);
  res.render('define_analysis',{title:'FireTools',pack_data:pack_data.rows[0]});
});

router.post('/start_analysis', async(req,res,next) =>{
  form = req.body;
  // Create database entry
  var an_uuid = uuidv1();
  var an_user = req.session.user_id;
  var an_name = req.body.name;
  var an_description = req.body.description;
  var an_pack_id = req.body.pack_id;
  var an_run_year = req.body.current_year;
  var an_input_dir_hash = req.body.pack_id;
  var an_output_dir_hash = an_uuid;
  var an_status = 'Creating';



  const {rows} = await db.query('insert into analysis (analysis_id,user_id,name,description,datapack_id,run_year,input_dir_hash,output_dir_hash,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);',
       [an_uuid,an_user,an_name,an_description,an_pack_id,an_run_year,an_input_dir_hash, an_output_dir_hash,an_status]);


  // Make output directory
  fs.mkdirSync("output/" + an_uuid);
   
  var an_output_dir = "output/" + an_uuid;
  var config_file = an_output_dir + "/config_linux.r";

  // repair paths
  req.body.corp_gdb = "../inputs" + req.body.corp_gdb;
  req.body.fire_gdb = "../inputs" + req.body.fire_gdb;
  req.body.asset_gdb = "../inputs" + req.body.asset_gdb;
  req.body.veg_gdb = "../inputs" + req.body.veg_gdb;


  // Generate config file (and put in output directory)
  for(var key in form){
    if(form.hasOwnProperty(key)){
      if(form[key].constructor===Array){
        var ar = form[key]
        ar = ar.map(function(item){return "\"" + item + "\""}).join(",")
        var lineout = key + "<-c(" + ar +")";
      }else{
        var lineout = key + "<-\"" + form[key]+"\"";
      }
    }
    fs.appendFileSync(config_file,lineout + "\n");

  }  
  fs.appendFileSync(config_file,'rast_temp<-"output"\nsubextent<-NULL\ngazette_gdb<-""\n')
  // Asynchronously launch analysis
  
  // When analysis complete, flag  database, send alert email

});

module.exports = router;
