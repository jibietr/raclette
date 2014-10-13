//Module dependencies.

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: '.',

    shim: {
        'site/js/lib/jquery' : {
            exports: '$'  
        },
        'site/js/lib/underscore-min' : {
            exports: '_'  
       },
        'site/js/lib/backbone-min': {
            deps: ['underscore-min', 'jquery'],
            exports: 'Backbone'
        },
     
    }
});
requirejs(['jquery', 'backbone'], function($, Backbone) { Backbone.$ = $; });
requirejs([
    'express',
    'path',
    'jquery',
    'underscore',
    'backbone',
    'aws-sdk',
    'router',
    'params',
    'opentok'
], 
function(express,path,$,_,Backbone,AWS,Router,params,OpenTok){
	
	var application_root = __dirname;
	var app = express();

    // Configure server
    // So far the serverem will load the static content in site/index.html
    //parses requesody and populates request.body
    app.use( express.bodyParser() );
    //checks request.body for HTTP method overrides 
    app.use( express.methodOverride() );

    // passport initialize
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(params.pass.initialize());
    app.use(params.pass.session());

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Where to serve static content
    //console.log('Use %s as dirname',application_root);
    app.use( express.static( path.join( application_root, 'site') ) );
    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
        
    var routes = new Router();

    // this is copied-pasted from opentok-example
    var config = {
	port: process.env.PORT,
	apiKey: process.env.API_KEY,
	apiSecret: process.env.API_SECRET
    };

    // set up config access using req
    // set up params 
    //app.request.config = config;  
    params.config = config;
    
    if(!config['TB.js']) {
      config['TB.js'] = 'https://swww.tokbox.com/webrtc/v2.2/js/TB.min.js';
    }

    if(!config.apiEndpoint) {
      config.apiEndpoint = 'https://api.opentok.com';
    }

    // there should be checkouts for all required params...
    if(!(config.apiKey && config.apiSecret)) {
      console.error('You must set apiKey and apiSecret in .env');
      process.exit();
    }

    var opentok = new OpenTok(config.apiKey, config.apiSecret);
    if(config.anvil) {
      opentok.api_url = config.anvil;
    }
    //
    //app.request.opentok = opentok;
    params.opentok = opentok;


    // these are routes served ...

    // opentok related routes
    app.get('/start-archive/:session', routes.startArchive);
    app.get('/get-archive/:archive', routes.getArchive);
    app.get('/stop-archive/:archive', routes.stopArchive);
    app.get('/start-session', routes.startSession);
    app.post('/api/answers', routes.saveAnswer);
    app.get('/api/session/:id', routes.startInterview);
    app.get('/api/archive', routes.getFullArchive);

    //app.post('/api/submitAll', routes.submitUserDoc);
    //app.post('/api/check_recaptcha', routes.checkRecaptcha);
    //app.post('/api/user', routes.updateUser);
    //app.post('/api/auth', routes.signIn);
    //app.get('/faq', routes.getFAQ);

    // login a user
    //app.post('/api/auth/login', routes.Login);
    //app.get('/api/auth', routes.Auth);


    //app.request.passport = Passport;
    //app.post('/api/auth/login',  routes.Login);
    app.post('/api/auth/signup', routes.Signup);
    //app.post('/api/auth/login', routes.Login);
    // is not obvious to me how to integrate this as a route
    /*app.post('/api/auth/login', params.pass.authenticate('local', { session: true }),
       function(req, res) {
          //res.redirect('/');
           console.log('Login OK?');
          res.json({ err: 'Login Ok'});
    });*/


   app.post('/api/auth/login', function(req, res, next) {
    params.pass.authenticate('local', { session: true }, function(err, user, info) {
    //console.log(err);
    //console.log(user);
    if (err) { return res.json({ error: err });  }
    if (!user) {
      return res.json({ error: info });
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      //return res.redirect('/users/' + user.username);
      console.log('return user',user);
      return res.json(user);
    });
     })(req, res, next);
    });



    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
      console.log("Checking if req.body is auth");
      if (req.isAuthenticated()) { return next(); }
      //res.redirect('/login')
      //res.json({ user: _.omit(user, ['password', 'auth_token']) });
      res.json({ error: "Client has no valid login cookies."  });

    }
    app.get('/api/auth', ensureAuthenticated, function(req, res){
     //res.render('account', { user: req.user });
     res.json({ user: req.user});
    });

    
    app.get('/api/questions', routes.GetQuestions);


    //Insert a new user
    app.post( '/api/users', function( request, response ,next) {
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
          source: request.body.source,
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
    //console.log("process params env",process.env);
    var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
    var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    var S3_BUCKET = process.env.PARAM1;
    var TAB_QUESTIONS = process.env.PARAM2 + '-questions';
    var TAB_USERS = process.env.PARAM2 + "-users";
    var TAB_ANSWERS = process.env.PARAM2 + "-answers";
    var TAB_SESSIONS = process.env.PARAM2 + "-sessions";


    //var s3 = new AWS.S3();
    AWS.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    AWS.config.update({region: 'eu-west-1'});

    //app.request.env_params = {
    params.env = {
      aws: AWS,
      bucket: S3_BUCKET,
      users: TAB_USERS,
      accounts: process.env.PARAM2 + "-accounts",
      codes: process.env.PARAM2 + "-codes",
      questions: TAB_QUESTIONS, 
      answers: TAB_ANSWERS,
      sessions: TAB_SESSIONS,
      captcha_private: process.env.CAPTCHA_PRIVATE,
      hash_key: process.env.HASH_KEY
    };

    //params.hash_key = process.env.HASH_KEY;
    //params.env = app.request.env_params;
    
    function InitDB(params){
      var dd = new AWS.DynamoDB();
      // create table only if it does not exist
      dd.describeTable({ TableName: params.TableName }, function(err, data) {
      if(err){
	 if(err.code == 'ResourceNotFoundException'){ // table does not exist
 	    dd.createTable(params, function(err, data) {
	       if (err) console.log(err, err.stack); // an error occurred
	       else     console.log(data);           // successful response
	   });
	 }else console.log(err, err.stack); // an error occurred
      }else{
       console.log('Table ' + params.TableName + ' already exists');
      }  
      });
    }

    var UserParams = {
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
      TableName: TAB_USERS, // required
    };
   
    var AnswerParams = {
      AttributeDefinitions: [ // required
	{
	  AttributeName: 'userid', // required
	  AttributeType: 'S', // required
	},
	{
	  AttributeName: 'qid', // required
	  AttributeType: 'S', // required
	},
      ],
      KeySchema: [ // required
	{
	  AttributeName: 'userid', // required
	  KeyType: 'HASH', // required
	},
	{
	  AttributeName: 'qid', // required
	  KeyType: 'RANGE', // required
	},
      ],
      ProvisionedThroughput: { // required
	ReadCapacityUnits: 1, // required
	WriteCapacityUnits: 1, // required
      },
      TableName: TAB_ANSWERS, // required
    };

    var AccountsParams = {
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
      TableName: params.env.accounts, // required
    };
   
    //InitDB(UserParams);
    // walk around to 
    InitDB(AnswerParams);
    // use timer as walk around to time limitation to access dynamodb
    setTimeout(InitDB(AnswerParams),1000);
 
    //Start server
    var port = process.env.PORT || 8080;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });

});
