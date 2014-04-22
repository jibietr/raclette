// Inititalize DynamoDB with values from JSON FILE
// RUN with foreman:
// foreman start -f Procfile-init-db


var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    shim: {
        'lib/jquery' : {
            exports: '$'  
        },
     }
});

requirejs([
    'path',
    'jquery',
    'fs', 
    'aws-sdk'], 
  function(path,$,fs,AWS){

    var application_root = __dirname;

    //Connect to database
    var dd = new AWS.DynamoDB();
    var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
    var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    var TABLENAME = process.env.PARAM2;

    var MSG = "push-interview:"
    console.log(MSG,"Current AWS setting is:");
    console.log(MSG,"AWS key",AWS_ACCESS_KEY);
    console.log(MSG,"AWS_secret",AWS_SECRET_KEY);
    console.log(MSG,"TABLENAME",TABLENAME);

    AWS.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    AWS.config.update({region: 'eu-west-1'});

    // define a question in DynamoDB
    var Question = {
      AttributeDefinitions: [{ // required
          AttributeName: 'qid', // required
          AttributeType: 'S', // required
        },],
      KeySchema: [{ // required                                                                                                  
          AttributeName: 'qid', // required                                                                                      
          KeyType: 'HASH', // required
        },],
      ProvisionedThroughput: { // required
          ReadCapacityUnits: 1, // required
          WriteCapacityUnits: 1, // required
        },
      TableName: TABLENAME, // required
    };

   console.log(MSG,"Create DynamoDB instance");
   var dd = new AWS.DynamoDB();

   function load(file){

        filePathBase = __dirname + '/docs/' +  file + ".json"
        console.log(MSG,"Load file",filePathBase);

	fs.readFile(filePathBase, 'utf8', function (err, data) {
	    if (err) {
		console.log('Error: ' + err);
		return;
	    }

	    data = JSON.parse(data); 
            $.each(data, function(index, value) {

                // create dd item from file entry
                var Question = {
		    'qid': { 'S': value.qid },
		    'qtype': { 'S': value.qtype },
		    'title': { 'S': value.title },
		    'time_response': { 'N': value.time_response },
		
		  };
                // this is optional
                if('time_wait' in value) Question.time_wait = ({ 'N': value.time_wait });

		// insert to DB
                dd.putItem({
		  'TableName': TABLENAME,
		  'Item': Question
		}, function(err, data) {
		     if( !err ) {
			console.log(MSG,'Entry created with id',Question.qid);
		     } else {
			console.log(err);
		    }
                });

            });
	    //console.log(data);
	});
    }

   // create table only if it does not exist                                                                                     
   console.log(MSG,"Describe Table",TABLENAME);   
   dd.describeTable({ TableName: TABLENAME }, function(err, data) {
      if(err){
	   if(err.code == 'ResourceNotFoundException'){ // table does not exist   
              dd.createTable(Question, function(err, data) {
		       if (err) console.log(err, err.stack); // an error occurred
                       else{  
                          console.log(MSG,"Table created");
                          console.log(data);        }   // successful response
           });
         }else console.log(err, err.stack); // an error occurred
      }else{
       console.log(MSG,"Table " + TABLENAME + " already exists");
      }
      // now load questions from file
      load(TABLENAME);
    });
   

});


