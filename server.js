//Module dependencies.


var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: 'site/js',
    //this is server side stuff...
    //these does not seem to be used...
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
   

    function _upload(response, file, name) {

    var fileRootName = name,
        fileExtension = file.extension ,
        //filePathBase = config.upload_dir + '/',
        filePathBase = __dirname + '/uploads/',
        
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    file.contents = file.contents.split(',').pop();

    fileBuffer = new Buffer(file.contents, "base64");

    fs.writeFileSync(filePath, fileBuffer);
   
   };


   app.use('/api/docs', function (req, res, next) {

       console.log("api docs");
         
        });
  
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
    mongoose.connect( 'mongodb://localhost/idiap-scg-april2014' );

    //Schemas
    var User = new mongoose.Schema({
	name: String,
	email: String,
	country: String,
	cover: String,
	resume: String,
	joined: Date,
   });

   // QUESTION: should userid and qid be ObjectIds?
   var Answer = new mongoose.Schema({
       userid: String, 
       qtype: String,
       qid: String,
       content: [mongoose.Schema.Types.Mixed],  
       created: Date, 
       wait_time: Number,
       work_time: Number,
   }); 


   var Question = new mongoose.Schema({
       qid: { type: String, required: true, unique: true },
       qtype: { type: String, required: true },
       title: { type: String, required: true }, 
       time_wait: { type: Number},
       time_response: { type: Number, required: true},
   }); 

    //Models
    var UserModel = mongoose.model( 'User', User );
    var AnswerModel = mongoose.model( 'Answer', Answer);
    var QuestionModel = mongoose.model( 'Question', Question);

    //Get a list of all users
    app.get( '/api/users', function( request, response ) {
	return UserModel.find( function( err, users ) {
	    if( !err ) {
		return response.send( users );
	    } else {
		return console.log( err );
	    }
	});
    });


    app.get( '/api/questions', function( request, response ) {
	return QuestionModel.find( function( err, questions ) {
	    if( !err ) {
		return response.send(questions);
	    } else {
		return console.log( err );
	    }
	});
    });


    app.get( '/api/answers', function( request, response ) {
	return AnswerModel.find( function( err, answers ) {
	    if( !err ) {
		return response.send( answers );
	    } else {
		return console.log( err );
	    }	});
    });


    app.post('/api/upload_video',function(request, response) {
      // TODO: check for errors
      // writing audio file to disk
      var filename = new Date().toString(11);
      //console.log(request.body.audio.extension);
      console.log(request.body);
      //_upload(response, request.body.audio, filename);
      //_upload(response, request.body.video, filename);

      //merge(response, files);
      // this is a success
      console.log("Done with upload");
      response.send({});   

   });




   app.post('/upload',function(request,response){

	fs.readFile(request.files.resume.path, function (err, data) {

	      //File Name
	      var fileName = request.files.resume.name

	     // If there's an error
	     if(!fileName)
	     {
		console.log("There was an error")
		response.redirect("/");
		response.end();
	     }
	     else
	     {
		//Path of upload folder where you want to upload fies
		var newPath = __dirname + "/docs/" + fileName;
                console.log("write in " + newPath);
		// write file to uploads folder
	fs.writeFile(newPath, data, function (err) {

		   // let's see uploaded file
		   response.redirect("/uploads/" + fileName);

	       });
	     }
	  });

     console.log(request);
   });


    app.get('/uploads/:file', function (req, res){

    file = req.params.file;
    var img = fs.readFileSync(__dirname + "/docs/" + file);
    res.writeHead(200, {'Content-Type': 'image/jpg'});
    res.end(img, 'binary'); 
    });



    //Insert a new user
    app.post( '/api/users', function( request, response ,next) {
       console.log("api users");

       console.log(request);

	var user = new UserModel({
	    name: request.body.name,
	    email: request.body.email,
	    country: request.body.country,
	    cover: request.body.cover,
	    resume: request.body.resume,
	    joined: request.body.joined
	});

      // upload supporting material using /api/docs as a route
      // with express this is as simple as moving the file from 
      // the tmp directory...
      //upload.fileHandleans();
      
 
 	user.save( function( err ) {
	    if( !err ) {
		return console.log( 'created' );
	    } else {
		return console.log( err );
	    }
	    return response.send( user );
	});
    });


    // insert new answer with collection.create
    app.post( '/api/answers', function(request,response) {
      console.log("POST to /api/answers");
      //console.log(request.body);
      //console.log(request.body.audioJSON);
      //console.log(request);
      // save to mongodb
      var answer = new AnswerModel({
       userid: request.body.userid, 
       qtype: request.body.qtype,
       qid: request.body.qid,
       content: request.body.content,  
       created: request.body.created, 
       wait_time: request.body.wait_time,
       work_time: request.body.work_time,
      }); 
       
      console.log("save in mongodb");
      answer.save( function( err ) {
	    if( !err ) { 
                //console.log(answer);
                //console.log(request.body.qtype);
                //if(answer.qtype=="video"){
                
                if(request.body.qtype=="video"){
                     
                    console.log("should save video here");
                    //console.log(request.body.qtype);
                    _upload(response, request.body.audio, answer._id);
                    _upload(response, request.body.video, answer._id);
                }
                //_upload(request.body.audio,
		console.log( 'answer created!!!' );
                console.log(answer);
                return response.send(answer);
	    } else {
		return console.log( err );
	    }
	    return response.send(answer);
            //return response.send({});
      });

    });

    //Get a single book by id
    app.get( '/api/users/:id', function( request, response ) {
	return UserModel.findById( request.params.id, function( err, user ) {
	    if( !err ) {
		return response.send( user );
	    } else {
		return console.log( err );
	    }
	});
    });

    //Update a user
    app.put( '/api/users/:id', function( request, response ) {
	console.log( 'Updating user ' + request.body.name );
	return UserModel.findById( request.params.id, function( err, user ) {
	    user.name = request.body.name;
	    user.email = request.body.email;
	    user.country =  request.body.country;
	    user.cover =  request.body.cover;
	    user.resume = request.body.resume;
	    user.joined = request.body.joined;  

	   return user.save( function( err ) {
		if( !err ) {
		    console.log( 'user updated' );
		} else {
		    console.log( err );
		}
		return response.send( user );
	    });
	});
    });


    //Delete a book
    app.delete( '/api/users/:id', function( request, response ) {
	console.log( 'Deleting user with id: ' + request.params.id );
	return UserModel.findById( request.params.id, function( err, user ) {
	    return user.remove( function( err ) {
		if( !err ) {
		    console.log( 'User removed' );
		    return response.send( '' );
		} else {
		    console.log( err );
		}
	    });
	});
    });

    //Start server
    var port = 8080;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });
});
///Connect to database
//mongoose.connect( 'mongodb://localhost/library_database' );

function merge(response, files) {
    // detect the current operating system
    var isWin = !!process.platform.match( /^win/ );

    if (isWin) {
        ifWin(response, files);
    } else {
        ifMac(response, files);
    }
}


function serveStatic(response, pathname) {

    var extension = pathname.split('.').pop(),
        extensionTypes = {
            'js': 'application/javascript',
            'webm': 'video/webm',
            'gif': 'image/gif'
        };

    response.writeHead(200, {
        'Content-Type': extensionTypes[extension]
    });
    if (extensionTypes[extension] == 'video/webm')
        response.end(fs.readFileSync('.' + pathname));
    else
        response.end(fs.readFileSync('./static' + pathname));
}

function ifWin(response, files) {
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + files.audio.name;
    var videoFile = __dirname + '\\uploads\\' + files.video.name;
    var mergedFile = __dirname + '\\uploads\\' + files.audio.name.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + audioFile + " " + videoFile + " " + mergedFile + '';
    exec(command, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

            fs.unlink(audioFile);
            fs.unlink(videoFile);
        }
    });
}

function ifMac(response, files) {
    // its probably *nix, assume ffmpeg is available
    var audioFile = __dirname + '/uploads/' + files.audio.name;
    var videoFile = __dirname + '/uploads/' + files.video.name;
    var mergedFile = __dirname + '/uploads/' + files.audio.name.split('.')[0] + '-merged.webm';
    var util = require('util'),
        exec = require('child_process').exec;
    //child_process = require('child_process');

    var command = "ffmpeg -i " + audioFile + " -itsoffset -00:00:01 -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;

    exec(command, function (error, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);

        if (error) {
            console.log('exec error: ' + error);
            response.statusCode = 404;
            response.end();

        } else {
            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);
        }

    });
}


//Schemas
