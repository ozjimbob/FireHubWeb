var express = require('express');
const uuidv1 = require('uuid/v1');
var router = express.Router();
var multer = require('multer');
var db = require("../db");
var path = require('path');
var unzip = require('unzip');
var archiver = require('archiver');
var fs = require('fs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Function for recursive file deletion
var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
          fs.readdirSync(path).forEach(function(file, index){
                  var curPath = path + "/" + file;
                        if (fs.lstatSync(curPath).isDirectory()) { // recurse
                                  deleteFolderRecursive(curPath);
                                        } else { // delete file
                                                  fs.unlinkSync(curPath);
                                                        }
                            });
              fs.rmdirSync(path);
                }
};


var cp = require('child_process');

var storage = multer.diskStorage({
 destination: function(req,file,cb){
	cb(null,__basedir + '/storage')
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


// Handler to retrieve fields list from a geofile
router.post('/flistt',async(req,res,next) =>{

  var file = "storage/" + req.body.file;
  var layer = req.body.layer;
  var field = req.body.field;
  
  // console.log('ogrinfo '+file+' -dialect SQLITE -sql "select distinct '+field+' from '+layer+';" | grep '+field+' | cut -d "=" -f2 | sed "s/^[ \t]*//;s/[ \t]*$//"')

  cp.exec('ogrinfo '+file+' -sql "select distinct '+field+' from '+layer+'" | grep "'+field+' (String)" | cut -d "=" -f2 | sed "s/^[ \t]*//;s/[ \t]*$//"', async (error,stdout,stderr)=> {
  console.log(stdout)
  console.log(stderr)
  var str = stdout.split("\n");
  // str = str.map(function(v){return v.slice(1,-1)});
  //str = str.slice(1,-1);
  str = str.filter(x => x!="")
   
  console.log(str)
  res.json({"contents": str});
 });


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
  const  pack_list = await db.query('select datapacks.*,users.name as username from datapacks left join users on datapacks.user_id = users.user_id where datapacks.user_id = $1 or datapacks.private = false order by uploaded_at desc',[req.session.user_id]);
  res.render('list_dp',{pl: pack_list.rows,title:'FireTools Datapacks'});
});


router.get('/list_an',async (req,res,next) =>{
  const  pack_list = await db.query('select analysis.* from analysis left join users on analysis.user_id = users.user_id where analysis.user_id = $1 order by created_at desc',[req.session.user_id]);
  res.render('list_an',{pl: pack_list.rows,title:'FireTools Analyses'});
});


router.post('/define_analysis',async (req,res,next) =>{
  this_dp = req.body.datapack_id;
  const pack_data = await db.query('select datapacks.* from datapacks where datapack_id = $1 and user_id = $2',[this_dp,req.session.user_id]);
  if(pack_data.rowCount!=1){
    res.render('unauth',{title:'FireTools',message:'You are unauthorized to define an analysis based on this datapack.'});
    return;
  };
  res.locals.client_pack = JSON.stringify(pack_data.rows[0]);
  res.render('define_analysis',{title:'FireTools',pack_data:pack_data.rows[0]});
});



// View analysis


router.get('/view_an/:an_uuid',async(req,res,next) => {
  const analysis_query = await db.query('select * from analysis where analysis_id = $1 and user_id = $2;',[req.params.an_uuid,req.session.user_id]);
  if(analysis_query.rowCount!=1){
    res.render('unauth',{title:'FireTools',message:'You are unauthorized to view this analysis.'});
    return;
  }
  var aq = analysis_query.rows[0];
  const log_query = await db.query('select * from analysis_log where analysis_id = $1 order by log_time asc;',[req.params.an_uuid]);

  var webroot = req.protocol + '://' + req.get('host') + '/tiles/' + req.params.an_uuid+ '/'

  if(aq.status == "Completed"){
    res.render("view_completed_analysis",{analysis_query:aq, log:log_query, webroot:webroot});
    return;
  }

  if(aq.status == "Creating" || aq.status == "In Progress" || aq.status=="Error"){
    res.render("view_progress_analysis",{analysis_query:aq, log:log_query, webroot:webroot});
    return;
  }


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
  var an_size = req.body.an_size;
  var an_status = 'In Progress';
  console.log(an_user);

  console.log("send start email")
  

  var stemail =  await db.query('select * from users where user_id = $1;',[an_user])
 var eml = stemail.rows[0].email;
 const msg = {
          to: eml,
          from: 'test@example.com',
          subject: 'FireTools Analysis ' + an_name + " launched",
          text: 'FireTools analysis ' + an_name + ' has started (analysis id: ' + an_uuid + '). Click here to view the progress:\n http://' + process.env.SERVER_DOMAIN + "/firetools/view_an/" + an_uuid + "",
          html: 'FireTools analysis ' + an_name + ' has started (analysis id: ' + an_uuid + '). <a href="http://' + process.env.SERVER_DOMAIN + '/firetools/view_an/' + an_uuid + '">Click here to view the progress.</a> '
 };
      sgMail.send(msg);
 

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
 
  var spawn = require('child_process').spawn,
  run_an    = spawn('R/launch_server.r', [an_uuid, 'storage/' + an_pack_id + '/', 'output/' + an_uuid + '/config_linux.r', 'output/' + an_uuid , an_size]);

  run_an.stdout.on('data', function (data) {
    if(data.toString().length > 4 & data.toString().substring(0,2)!="  |"){ 
      const {rows} = db.query('insert into analysis_log (analysis_id,log_text,status) VALUES ($1,$2,$3);',
       [an_uuid,data.toString(),"Log"]);
    }
  });

  run_an.stderr.on('data', function (data) {
    if(data.toString().length > 4 & data.toString().substring(0,2)!="  |"){
      const {rows} = db.query('insert into analysis_log (analysis_id,log_text,status) VALUES ($1,$2,$3);',
       [an_uuid,data.toString(),"Error"]);
    }
    
  });

  run_an.on('exit', async (code) =>{
    if(code.toString() == "0"){
      console.log("Clean exit")
      const {rows} = db.query("update analysis set status='Completed', completed_at=CURRENT_TIMESTAMP where analysis_id = $1;",[an_uuid]);
      
      // move map directory
      fs.renameSync("output/" + an_uuid + "/output/maps","maps/" + an_uuid)
      
        // move tile directory
      fs.renameSync("output/" + an_uuid + "/output/tiles","public/tiles/" + an_uuid)
    console.log("Sending email")
    var stemail =  await db.query('select * from users where user_id = $1;',[an_user])
    var eml = stemail.rows[0].email;
      const msg = {
          to: eml,
          from: 'test@example.com',
          subject: 'FireTools Analysis ' + an_name + " complete.",
          text: 'FireTools analysis ' + an_name + ' is complete (analysis id: ' + an_uuid + '). Click here to view and download the results:\n http://' + process.env.SERVER_DOMAIN + "/firetools/view_an/" + an_uuid + "",
          html: 'FireTools analysis ' + an_name + ' is complete (analysis id: ' + an_uuid + '). <a href="http://' + process.env.SERVER_DOMAIN + '/firetools/view_an/' + an_uuid + '">Click here to view and download the results.</a> '};
      sgMail.send(msg);
    console.log("email sent")

      // zip directory for download
      // zip.folder("output/"+an_uuid,"output/" + an_uuid + ".zip")
      
      // define zip output location
      var output = fs.createWriteStream('output/'+an_uuid+'.zip');
      var archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
      });

      // listen for all archive data to be written
      // // 'close' event is fired only when a file descriptor is involved
      output.on('close', function() {
         console.log(archive.pointer() + ' total bytes');
         console.log('archiver has been finalized and the output file descriptor has closed.');
         deleteFolderRecursive('output/'+an_uuid);
       });

      // This event is fired when the data source is drained no matter what was the data source.
      // // It is not part of this library but rather from the NodeJS Stream API.
      // // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', function() {
         console.log('Data has been drained');
      });
      console.log("Creating pipe")
       archive.pipe(output);
       // add directory
      console.log("archiving directory")
       archive.directory('output/'+an_uuid, false);
      console.log("finalizing")

       archive.finalize();

        
    }else{
      console.log("Error exit")
      const {rows} = db.query("update analysis set status='Error', completed_at=CURRENT_TIMESTAMP where analysis_id = $1;",[an_uuid]);

    console.log("Sending email")
    var stemail =  await db.query('select * from users where user_id = $1;',[an_user])
    var eml = stemail.rows[0].email;
      const msg = {
          to: eml,
          from: 'test@example.com',
          subject: 'FireTools Analysis ' + an_name + " ERROR.",
          text: 'FireTools analysis ' + an_name + ' quit with an error (analysis id: ' + an_uuid + '). Click here to view the log:\n http://' + process.env.SERVER_DOMAIN + "/firetools/view_an/" + an_uuid + "",
          html: 'FireTools analysis ' + an_name + ' quit with an error (analysis id: ' + an_uuid + '). <a href="http://' + process.env.SERVER_DOMAIN + '/firetools/view_an/' + an_uuid + '">Click here to view the log.</a> '};
      sgMail.send(msg);
    console.log("email sent")
    }


    console.log('child process exited with code ' + code.toString());

  });

  // When analysis complete, flag  database, send alert email
  res.redirect('list_an');


});

// Download analysis pack zip
router.get('/dl_analysis/:uuid', async(req, res, next) =>{
  const dl_query = await db.query('select * from analysis where analysis_id = $1;',[req.params.uuid]);
  if(dl_query.rowCount!=1){
    res.render('unauth',{title:'FireTools',message:'This analysis pack does not exist.'});
    return;
  };
  res.download('output/' + req.params.uuid + ".zip");
});

// Delete analysis
router.get('/del_an/:uuid',async(req,res,next)=>{
  // Delete from database
  const {rows} = db.query("delete from analysis where analysis_id = $1;",[req.params.uuid]);
  // Delete output 
  deleteFolderRecursive('maps/'+req.params.uuid);
  deleteFolderRecursive('public/tiles/'+req.params.uuid);
  if(fs.existsSync('output/' + req.params.uuid + '.zip')){fs.unlinkSync('output/' + req.params.uuid + '.zip')};
  res.redirect('/firetools/list_an');
  
});

// Delete datapack
router.get('/del_dp/:uuid',async(req,res,next)=>{
  // Delete from database
  const {rows} = db.query("delete from datapacks where datapack_id = $1;",[req.params.uuid]);
  // Delete output 
  deleteFolderRecursive('storage/'+req.params.uuid);
  res.redirect('/firetools/list_dp');
  
});
module.exports = router;
