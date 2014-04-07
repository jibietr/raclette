// Module dependencies.


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


   app.use('/api/docs', function (req, res, next) {
            // imageVersions are taken from upload.configure()
       console.log("api docs");
         
        });
  
    // Configure server
    // So far the server will load the static content in site/index.html
    app.configure( function() {
      //parses request body and populates request.body
      app.use( express.bodyParser() );
      //app.use(express.bodyParser({keepExtensions:true,uploadDir:path.join(__dirname,'/docs')}));


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
    mongoose.connect( 'mongodb://localhost/library_database' );

    //Schemas
    var User = new mongoose.Schema({
	name: String,
	email: String,
	country: String,
	cover: String,
	resume: String,
	joined: Date,
   });

    //Models
    var UserModel = mongoose.model( 'User', User );

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

       console.log(request.form);

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
      //upload.fileHandler();
      
      upload.fileHandler({
                uploadDir: function () {
                    return __dirname + '/docs/' + request.sessionID
                },
                uploadUrl: function () {
                    return '/docs/' + request.sessionID
                }
            })(request, response, next);


 	user.save( function( err ) {
	    if( !err ) {
		return console.log( 'created' );
	    } else {
		return console.log( err );
	    }
	    return response.send( user );
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



    //app.use('/api/docs', upload.fileHandler());

/*
*/


    //Start server
    var port = 8080;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });
});
///Connect to database
//mongoose.connect( 'mongodb://localhost/library_database' );


//Schemas
