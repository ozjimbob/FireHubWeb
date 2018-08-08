var express = require('express');
const uuidv4 = require('uuid/v4');
var router = express.Router();
var multer = require('multer');

var storage = multer.diskStorage({
 destination: function(req,file,cb){
	cb(null,'/home/grant/apps/FireHubWeb/storage')
},
 filename: function(req,file,cb){
	cb(null,uuidv4() + '.zip')}
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

router.post('/post_upload',dpUpload,function(req,res,next){
	// here we deal with the file
   	console.log(req);

});

module.exports = router;
