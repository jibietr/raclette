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


    // there should be checkouts for all required params...
    if(!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_KEY)){
	console.error('You must set AWS Key and Secret in .env');                                                          
	process.exit(); 
    }

    if(!(process.env.OPENTOK_KEY && process.env.OPENTOK_SECRET)){
	console.error('You must set Opentok Key and Secret in .env');                                                          
	process.exit(); 
    }

    // routes served
    app.get('/start-archive/:session', routes.startArchive);
    app.get('/get-archive/:archive', routes.getArchive);
    app.get('/stop-archive/:archive', routes.stopArchive);
    app.get('/start-session', routes.startSession);
    app.post('/api/answers', routes.saveAnswer);
    app.get('/api/session/:id', routes.startInterview);
    app.get('/api/archive', routes.getFullArchive);
    app.get('/api/questions', routes.GetQuestions);
    // login a user
    app.post('/api/auth/login', routes.Login);
    /*app.get('/api/auth', routes.ensureAuthenticated,function(req, res){
     res.json({ user: req.user});
    });*/
    app.get('/api/auth', routes.ensureAuthenticated);




    //var s3 = new AWS.S3();
    AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_KEY
    });
    AWS.config.update({region: 'eu-west-1'});
    params.aws = AWS;
    //app.request.env_params = {
    params.env = {
	opentok_key: process.env.OPENTOK_KEY,
	bucket: process.env.S3_ASSETS,
	users: process.env.DB_PREFIX + "-users",
	accounts: process.env.DB_PREFIX + "-accounts",
	codes: process.env.DB_PREFIX + "-codes",
	questions: process.env.DB_PREFIX + "-questions",
	answers: process.env.DB_PREFIX + "-answers",
	sessions: process.env.DB_PREFIX + "-sessions",
	//captcha_private: process.env.CAPTCHA_PRIVATE,
	hash_key: process.env.HASH_KEY
    };

    var opentok = new OpenTok(process.env.OPENTOK_KEY, process.env.OPENTOK_SECRET);
    params.opentok = opentok;


    //TODO: 
    function checkDB(tableName){
	var dd = new AWS.DynamoDB();
	// create table only if it does not exist
	dd.describeTable({ TableName: tableName }, function(err, data) {
	    if(err){
		if(err.code == 'ResourceNotFoundException'){ // table does not exist
		    console.log('Check DB Error: Table ' + tableName + ' does not exist!'); 
		    process.exit();
		}else console.log(err, err.stack); // a different error occurred
	    }else{
		console.log('Check DB: Table ' + tableName + ' already exists');
	    }  
	});
    }


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

    /* this would be the only one created for the form app
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
      TableName: params.env.users, // required
    };*/
   
    // this is the only empty table created...
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
      TableName: params.env.answers, // required
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
    //InitDB(AnswerParams);
    // use timer as walk around to time limitation to access dynamodb
    //setTimeout(InitDB(AnswerParams),1000);

    // Check that DBs already exist!
    checkDB(params.env.sessions);
    checkDB(params.env.codes);
    checkDB(params.env.questions);
    InitDB(AnswerParams);
 
    //Start server
    var port = process.env.PORT || 8080;
    app.listen( port, function() {
      console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
    });

});
