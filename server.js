
//Module dependencies.

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: 'site/js',

    paths: {
        'models': 'models',
        'collections' : 'collections',
        'views' : 'views',
        'templates' : 'templates',
        'text' :  'lib/text',
     
    },
    //this should be client side..
    shim: {
        'lib/jquery' : {
            exports: '$'  
        },
        'lib/underscore-min' : {
            exports: '_'  
       },
        'lib/backbone-min': {
            deps: ['underscore-min', 'jquery'],
            exports: 'Backbone'
        }
     
    }
});

requirejs(['jquery', 'backbone'], function($, Backbone) { Backbone.$ = $; });
requirejs([
    'express',
    'path',
    'jquery',
    'fs', 
    'underscore',
    'backbone',
    'aws-sdk'], 
  function(express,path,$,fs,_,Backbone,AWS){
    var application_root = __dirname;
    var app = express();
   

    // Configure seer
    // So far the serverem will load the static content in site/index.html
    app.configure( function() {
      //parses requesody and populates request.body
      app.use( express.bodyParser() );
	//checks request.body for HTTP method overrides
	app.use( express.methodOverride() );
	//perform route lookup based on url and HTTP method
	app.use( app.router );
	//Where to serve static content
        console.log('Use %s as dirname',application_root);
        app.use( express.static( path.join( application_root, 'site') ) );
	//Show all errors in development
	app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
        
    });
    




    //Get a list of all users
   //  app.get( '/api/users', function( request, response ) {
   // 	return UserModel.find( function( err, users ) {
   // 	    if( !err ) {
   // 		return response.send( users );
   // 	    } else {
   // 		return console.log( err );
   // 	    }
   // 	});
   //  });


    /* app.get( '/api/questions', function( request, response ) {
    	return QuestionModel.find( function( err, questions ) {
    	    if( !err ) {
    		return response.send(questions);
    	    } else {
    		return console.log( err );
    	    }
    	});
     });*/


    app.get( '/api/questions', function( request, response ) {

        var dd = new AWS.DynamoDB();
        console.log("Use Table",TABLEQUESTIONS);
        var params = {
          TableName: TABLEQUESTIONS, // required
          AttributesToGet: [
            'qid', 'title', 'time_response', 'time_wait', 'qtype',
          ],};
        dd.scan(params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else{      console.log(data);           // successful response
             questions = [];
             data.Items.forEach(function(entry) {
                console.log(entry);
                var item = { 
                   'qid': entry.qid.S,
                   'title': entry.title.S,
                   'qtype': entry.qtype.S,
                   'time_response': entry.time_response.N,
                };
                if('time_wait' in entry) item.time_wait = entry.time_wait.N;
                questions.push(item);
             });
             response.send(questions);
           }
        });

        /*
    	return QuestionModel.find( function( err, questions ) {
    	    if( !err ) {
    		return response.send(questions);
    	    } else {
    		return console.log( err );
    	    }
    	});*/
     });


   //  app.get( '/api/answers', function( request, response ) {
   // 	return AnswerModel.find( function( err, answers ) {
   // 	    if( !err ) {
   // 		return response.send( answers );
   // 	    } else {
   // 		return console.log( err );
   // 	    }	});
   //  });


   //  app.post('/api/upload_video',function(request, response) {
   //    // TODO: check for errors
   //    // writing audio file to disk
   //    var filename = new Date().toString(11);
   //    //console.log(request.body.audio.extension);
   //    console.log(request.body);
   //    //_upload(response, request.body.audio, filename);
   //    //_upload(response, request.body.video, filename);

   //    //merge(response, files);
   //    // this is a success
   //    console.log("Done with upload");
   //    response.send({});   

   // });




   // App.post('/upload',function(request,response){
          
   //       console.log(request.files.resume.path);
   // 	fs.readFile(request.files.resume.path, function (err, data) {

   // 	      //File Name
   // 	      var fileName = request.files.resume.name

   // 	     // If there's an error
   // 	     if(!fileName)
   // 	     {
   // 		console.log("There was an error")
   // 		//response.redirect("/");
   // 		//response.end();
   // 	     }
   // 	     else
   // 	     {
   // 		//Path of upload folder where you want to upload fies
   // 		var newPath = __dirname + "/docs/" + fileName;
   //              console.log("write in " + newPath);
   // 		// write file to uploads folder
   // 	        fs.writeFile(newPath, data, function (err) {

   // 		   // let's see uploaded file
   // 		   //response.redirect("/uploads/" + fileName);
   //                 //response.send("done!")
   // 	       });
   // 	     }
   // 	  });

   //   console.log(request);
   // });


   
     // it is not clear to me how save expects to get the model as a response to a success
     // i thought user was to be send with the response, but it does not seem to be the case
     function multiple_file_upload(user,files,response){

        var count = 0;
        var max_files = _.keys(files).length;
 
        var handler = function(error, content){
		    count++;
		    if (error){
                        response.statusCode = 500;
                        //response.write("Ooops. Something went wrong!");
                        return response.send();
		    }
		    if (count == max_files) {
                        response.statusCode = 200;
                        //response.write("Form upload successful.");
                        return response.send(user);
		    }
		}
                
                // iterate on files
                //request.files.each
        for(var file_type in files){
          //TODO: i am not sure how _upload_file deals with the handler.
          // does it feel error and content correctly?
          _upload_file(files[file_type],file_type + "_" + user._id, handler);
        }
     }
               
    function _upload_file(file, name, handler) {
       fs.readFile(file.path, function (err, data) {
	   var newPath = __dirname + "/docs/" + name;
           console.log(newPath);
	   fs.writeFile(newPath, data, handler);
       });
    }

    //Insert a new user
    app.post( '/api/users', function( request, response ,next) {
       console.log("POST to /api/users");
       console.log(request.body);
       //console.log(JSON.stringify(request.body.positions[0]));

       // not sure how to pass this object directly from the backbone model
       // so we are passing it as an array, and we create it here
       var positions = [];
       request.body.positions.forEach(function(target){
         positions.push({ position: target });
        });
    

       var user = new UserModel({
	  name: request.body.name,
	  email: request.body.email,
	  nationality: request.body.nationality,
	  school: request.body.school,
	  country: request.body.country,
	  degree: request.body.degree,
	  status: request.body.status,
	  major: request.body.major,
	  positions: positions,
	  joined: request.body.joined
	});

        // upload supporting material using /api/docs as a route
        // with express this is as simple as moving the file from 
        // the tmp directory...
       	user.save( function( err ) {
	    if( !err ) {
		//console.log( 'entry created. try to upload file' );
                //console.log(request.files);
                //multiple_file_upload(user,request.files,response);
                return response.send(user);
	     } else {
		return console.log( err );
	    }
	});
    });

    // 

    var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
    var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    var S3_BUCKET = process.env.PARAM1;
    var TABLEQUESTIONS = process.env.PARAM2;

    //var s3 = new AWS.S3();
    console.log("setup AWS params 3");
    console.log(process.env);
    console.log(AWS_ACCESS_KEY);
    console.log(AWS_SECRET_KEY);
    console.log(S3_BUCKET);
    AWS.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    AWS.config.update({region: 'eu-west-1'});



  /*   app.get('/sign_s3', function(req, res){
        // extract name and mime from object to upload
        // TODO: check on name...
	var object_name = req.query.s3_object_name;
	var mime_type = req.query.s3_object_type;
        
        // create a temporal signature
	var now = new Date();
	var expires = Math.ceil((now.getTime() + 10000)/1000); // 10 seconds from now
	var amz_headers = "x-amz-acl:private";   // grant permissions

        // create request
	var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+S3_BUCKET+"/"+object_name;

	var signature = crypto.createHmac('sha1', AWS_SECRET_KEY).update(put_request).digest('base64');
	signature = encodeURIComponent(signature.trim());
	signature = signature.replace('%2B','+');

	var url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+object_name;

	var credentials = {
	    signed_request: url+"?AWSAccessKeyId="+AWS_ACCESS_KEY+"&Expires="+expires+"&Signature="+signature,
	    url: url
	};
	res.write(JSON.stringify(credentials));
	res.end();
    });*/

    
    function s3_upload_file(file,fname,handler){

          console.log("s3 upload file" + file.name);
	  var s3 = new AWS.S3();	
	  fs.readFile(file.path, function(err, fileBuffer){
              console.log("s3 put " + file.name);
              var params = {
		  Bucket: S3_BUCKET + "/docs/",
		  Key: fname, // add new name
		  Body: fileBuffer,
		  ACL: 'private',
		  ContentType: file.type
	      };
	      s3.putObject(params, handler);
	  });
    }

    
    function InitDB(){
    var dd = new AWS.DynamoDB();
    // use describe table to check status of table?
    var params = {
      AttributeDefinitions: [ // required
	{
	  AttributeName: '_id', // required
	  AttributeType: 'S', // required
	},
      ],
      KeySchema: [ // required
	{
	  AttributeName: '_id', // required
	  KeyType: 'HASH', // required
	},
      ],
      ProvisionedThroughput: { // required
	ReadCapacityUnits: 1, // required
	WriteCapacityUnits: 1, // required
      },
      TableName: 'users', // required

    };
   
    // create table only if it does not exist
    dd.describeTable({ TableName: 'users'}, function(err, data) {
      if(err){
	 if(err.code == 'ResourceNotFoundException'){ // table does not exist
 	    dd.createTable(params, function(err, data) {
	       if (err) console.log(err, err.stack); // an error occurred
	       else     console.log(data);           // successful response
	   });
	 }else console.log(err, err.stack); // an error occurred
      }else{
       console.log("Table 'users' already exists");
      }  
    });
    }

    InitDB();


    //Insert a new user
    app.post( '/s3/users', function( request, response ,next) {


       // create unique hashstag
       var user_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
       console.log("user_hash:",user_hash);

       var user = request.body;
       user._id = user_hash;
       console.log("user",user); 


       var item = {
            '_id': { 'S': user._id },
            'name': { 'S': user.name },
            'email': { 'S': user.email },
            'nationality': { 'S': user.nationality },
            'school': { 'S': user.school },
            'degree': { 'S': user.degree },
            'status': { 'S': user.status },
            'positions' : { 'SS': user.positions },
            'major': { 'S': user.major }
          };

       dd = new AWS.DynamoDB();
       dd.putItem({
          'TableName': 'users',
          'Item': item
        }, function(err, data) {
             if( !err ) {
		//console.log( 'entry created. try to upload file' );
                //console.log(request.files);
                //multiple_file_upload(user,request.files,response);
                //return response.send(user);
                console.log("done"); 
                response.send(user);
	     } else {
                console.log(err)
                // note that error may content user attributes
                // which may trigger .save success
                // do not return full error object
                return response.send(err.message);
	    }       
        });
    });


    app.post('/upload_s3', function(req, res){
        // extract name and mime from object to upload
        // TODO: check on name...
        var count = 0;
   console.log(req.body);
        var max_files = _.keys(req.files).length;
            var handler = function(error, data){
		    count++;
		    if (error){
                        console.log("error" + error);
                        //response.write("Ooops. Something went wrong!");
                        //                        return response.send();
                        return res.send(error);
		    }else{
			console.log("worked, data: "+ JSON.stringify(data));
		    }		    if (count == max_files) {
                        //response.statusCode = 200;
                        console.log("done with all uploads");
                        // we are save returning this
                        var files = { resume: '.pdf', cover_letter: '.pdf'}
                        console.log(files);
                        return res.send(files);
		    }
		}
        for(var key in req.files){
          fname = req.body[key];

          s3_upload_file(req.files[key],fname,handler);
        }

    });

    // insert new answer with collection.create
    // app.post( '/api/answers', function(request,response) {
    //   console.log("POST to /api/apianswers");

    //   // save to mongodb
    //   var answer = new AnswerModel({
    //    userid: request.body.userid, 
    //    qtype: request.body.qtype,
    //    qid: request.body.qid,
    //    content: request.body.content,  
    //    created: request.body.created, 
    //    wait_time: request.body.wait_time,
    //    work_time: request.body.work_time,
    //   }); 
       
    //   console.log("save in mongodb");
    //   answer.save( function( err ) {
    // 	    if( !err ) { 
    //             //console.log(answer);
    //             //console.log(request.body.qtype);
    //             //if(answer.qtype=="video"){
                
    //             if(request.body.qtype=="video"){
                     
    //                 console.log("should save video here");
    //                 //console.log(request.body.qtype);
    //                 _upload(response, request.body.audio, answer._id);
    //                 _upload(response, request.body.video, answer._id);
    //             }
    //             //_upload(request.body.audio,
    // 		console.log( 'answer created!!!' );
    //             console.log(answer);
    //             return response.send(answer);
    // 	    } else {
    // 		return console.log( err );
    // 	    }
    // 	    return response.send(answer);
    //         //return response.send({});
    //   });

    // });
 
 

    //Start server
    var port = process.env.PORT || 8080;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });
});
