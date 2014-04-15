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
    'mongoose',
    'jquery',
    'fs', 
    'underscore',
    'backbone'], 
  function(express,path,mongoose,$,fs,_,Backbone){
    var application_root = __dirname;
    var app = express();
   

    // function _upload(response, file, name) {

   //  var fileRootName = name,
   //      fileExtension = file.extension ,
   //      //filePathBase = config.upload_dir + '/',
   //      filePathBase = __dirname + '/uploads/',
        
   //      fileRootNameWithBase = filePathBase + fileRootName,
   //      filePath = fileRootNameWithBase + '.' + fileExtension,
   //      fileID = 2,
   //      fileBuffer;

   //  while (fs.existsSync(filePath)) {
   //      filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
   //      fileID += 1;
   //  }

   //  file.contents = file.contents.split(',').pop();

   //  fileBuffer = new Buffer(file.contents, "base64");

   //  fs.writeFileSync(filePath, fileBuffer);
   
   // };


  
    // Configure seer
    // So far the server will load the static content in site/index.html
    app.configure( function() {
      //parses requesody and populates request.body
      app.use( express.bodyParser() );
      //app.use(express.bodyParser({keepExtensions:true,uploadDir:path.join(__dirname,'/docs')}));
      //app.use(express.json());
      //app.use(express.urlencoded());

	//checks request.body for HTTP method overrides
	app.use( express.methodOverride() );
        //app.use(express.multipart());
	//perform route lookup based on url and HTTP method
	app.use( app.router );
	//Where to serve static content
        console.log('Use %s as dirname',application_root);
        app.use( express.static( path.join( application_root, 'site') ) );
	//Show all errors in development
	app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
        
    });
    
    app.get( '/api', function( request, response ) {
	response.send( 'Library API is running' );
    });

    //Connect to database
    //
    var uristring =
        process.env.MONGOLAB_URI ||
        process.env.MONGOHQ_URL ||
        'mongodb://localhost/idiap-scg-april2014';

    
    mongoose.connect(uristring, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });

    // Define a keyword-like schema for positions
    var Positions = new mongoose.Schema({
       position: String, 
        
    });

    // A user 
    var User = new mongoose.Schema({
	name: String,
	email: String,
        nationality: String,
        school: String,
       	country: String,
        degree: String,
        status: String,
        major: String,
        positions: [ Positions ],
	joined: Date,
   });

   // QUESTION: should userid and qid be ObjectIds?
   // var Answer = new mongoose.Schema({
   //     userid: String, 
   //     qtype: String,
   //     qid: String,
   //     content: [mongoose.Schema.Types.Mixed],  
   //     created: Date, 
   //     wait_time: Number,
   //     work_time: Number,
   // }); 


   // var Question = new mongoose.Schema({
   //     qid: { type: String, required: true, unique: true },
   //     qtype: { type: String, required: true },
   //     title: { type: String, required: true }, 
   //     time_wait: { type: Number},
   //     time_response: { type: Number, required: true},
   // }); 

    //Models
    var UserModel = mongoose.model( 'User', User );
    //var AnswerModel = mongoose.model( 'Answer', Answer);
    //var QuestionModel = mongoose.model( 'Question', Question);

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


   //  app.get( '/api/questions', function( request, response ) {
   // 	return QuestionModel.find( function( err, questions ) {
   // 	    if( !err ) {
   // 		return response.send(questions);
   // 	    } else {
   // 		return console.log( err );
   // 	    }
   // 	});
   //  });


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
       //console.log(request.body);
       //console.log(JSON.stringify(request.body.positions[0]));

       // not sure how to pass this object directly from the backbone model
       // so we are passing it as an array, and we create it here
       var positions = [];
       request.body.positions.split(",").forEach(function(target){
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
		console.log( 'entry created. try to upload file' );
                //console.log(request.files);
                multiple_file_upload(user,request.files,response);
	     } else {
		return console.log( err );
	    }
	});
    });


    // insert new answer with collection.create
    // app.post( '/api/answers', function(request,response) {
    //   console.log("POST to /api/answers");

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
    var port = 5000;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });
});
