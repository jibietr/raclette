define(['jquery','underscore','fs','http','querystring','crypto'
   //'opentok'],function($,_,fs,OpenTok,) {
   ],function($,_,fs,http,querystring,crypto) {
    // Start with the constructor
    // empty constructor    function Router(me) {

    var Router = function() {};

    /*    Router.prototype.startSession = function(req, res) {
      console.log("request start session");

      req.opentok.createSession('', function(error, result){
	if(error) {
	  util.log("Error obtaining session ID: " + error.message);
	  process.exit();
	}
	req.opentokSession = result;

        console.log("session:",req.opentokSession);
        //console.log("role:",OpenTok.RoleConstants.MODERATOR);

        res.send({
	    apiKey: req.config.apiKey,
	    session: req.opentokSession,
	    token: req.opentok.generateToken({
	      session_id: req.opentokSession,
	      //role: OpenTok.RoleConstants.MODERATOR,
	      connection_data: 'host'
	    })
        });
      });
    };

    Router.prototype.startArchive = function(req, res, next) {
      req.opentok.startArchive(req.params.session, { name: 'my archiving sample' },
      function(err, archive) {
      if(err) {
	console.log('Error starting archive: ' + err.message);
	return next(err);
      }
      res.send(archive);
      });
    };

    Router.prototype.stopArchive = function(req, res, next) {
       req.opentok.stopArchive(req.params.archive, function(err, archive) {
       if(err) {
         console.log('Error stopping archive: ' + err.message);
         return next(err);
        }
        res.send(archive);
     }); 
    };





    Router.prototype.saveAnswer = function(request, response){ 

      console.log("POST to /api/apianswers");
       var user = request.body;
       //create simple user id

       // answer hash also encodes created data
       var answer_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();

       // TODO: add uplaod Id
       var answer = {
            '_id': { 'S': answer_hash },
            'userid': { 'S': request.body.userid },
            'qtype': { 'S': request.body.qtype },
            'qid': { 'S': request.body.qid },
            'work_time' : { 'N': String(request.body.work_time) },
          };
       if('wait_time' in request.body) answer.wait_time = { 'N': String(request.body.wait_time) };
       if('content' in request.body) answer.content = { 'S': request.body.content };
       console.log(answer);

       dd = new AWS.DynamoDB();
       dd.putItem({
          'TableName': request.aws_params.answers,
a          'Item': answer
        }, function(err, data) {
             if( !err ) {
		 //console.log( 'entry created. try to upload file' );
                response.send(answer);
		      } else {
                console.log("Error",err);
                return console.log(err)
                // note that error may content user attributes
                // which may trigger .save success
                // do not return full error object
                return response.send(err.message);
			      }     
           return response.send(answer);  
        });

    };

    Router.prototype.startInterview = function(req, res){ 
        
        console.log("start interview",req.params);
                
        var dd = new AWS.DynamoDB();
        console.log("Use Table",req.aws_params.sessions);
        var params = {
          Key: {
           sid: {
             S: req.params.id
          }},
          TableName: req.aws_params.sessions, // required 
          AttributesToGet: [
            'sid', 'iid', 'userid'
          ],};
        console.log('get params',params);
        dd.getItem(params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred                                 
           console.log("data",data);
           if ('Item' in data){ 
              console.log("exists");

             var session = {
              'id': data.Item.sid.S,
              'iid': data.Item.iid.S,
              'userid': data.Item.userid.S
             };
             res.send(session);                            
           }else{      
             console.log('does not exist');           // successful response 
             res.send('User does not exist');
           }
        });
    }; */
 

    Router.prototype.submitAll = function(req, res){
 
       // create unique Hash as id
       //var date hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
       var user_hash = crypto.createHmac('sha1', req.env_params.hash_key).update(req.body.email).digest('base64');

       // truncate hash
       //http://stackoverflow.com/questions/4567089/hash-function-that-produces-short-hashes

       var user = req.body;

   
       user._id = user_hash;

       uploadFiles(req, user_hash, function(){
         // if success, then try to save model to db
         // even if we had positions convert to an array 
         // iframe converts it back to a string...
         var positions = [];
          user.positions.split(',').forEach(function(target){
            positions.push(target);
	 });

	 var item = {
		  '_id': { 'S': user._id },
		  'name': { 'S': user.name },
		  'email': { 'S': user.email },
		  'nationality': { 'S': user.nationality },
                  'country' : { 'S': user.country },
		  'school': { 'S': user.school },
		  'degree': { 'S': user.degree },
		  'status': { 'S': user.status },
		  'positions' : { 'SS': positions },
		  'source' : { 'S': user.source },
		  'major': { 'S': user.major }
		};
	     if(user.admission!="NA") item.admission = { 'S' : user.admission }; 
	     if(user.graduation!="NA") item.graduation = {'S' : user.graduation};

	     var AWS = req.env_params.aws;
	     dd = new AWS.DynamoDB();
	     dd.putItem({
		'TableName': req.env_params.users,
		'Item': item,
                'Expected': {
                  '_id': { Exists:  false }
                 }
	      }, function(err, data) {
	       if(!err) {
                 // upload and db sucess
		 console.log('submitall: upload and db success'); 
		 res.send(user);
	       } else {
	         console.log('submitall: upload sucess, db error',err);
	         // note that error may content user attributes
	         // which may trigger .save success
	         // do not return full error object
		 return res.send(err.message);
	        }       
	      });
        },function(){//upload error
           res.send('file upload failed');
        });


    };

    Router.prototype.submitUserDoc = function(req, res){
 
       // create unique Hash as id
       //var user_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
       var user_hash = crypto.createHmac('sha1', req.env_params.hash_key).update(req.body.email).digest('hex');
       user_hash = user_hash.substring(0,8);

       var user = req.body;
   
       user._id = user_hash;

         // if success, then try to save model to db
         // even if we had positions convert to an array 
         // iframe converts it back to a string...
         var positions = [];
          user.positions.split(',').forEach(function(target){
            positions.push(target);
	 });

	 var item = {
		  '_id': { 'S': user._id },
		  'name': { 'S': user.name },
		  'email': { 'S': user.email },
		  'nationality': { 'S': user.nationality },
		  'school': { 'S': user.school },
                  'country': { 'S': user.country },
		  'degree': { 'S': user.degree },
		  'status': { 'S': user.status },
		  'positions' : { 'SS': positions },
		  'source' : { 'S': user.source },
		  'major': { 'S': user.major },
                  'date': { 'S': (new Date).getTime().toString() }
		};
	     if(user.admission!="NA") item.admission = { 'S' : user.admission }; 
	     if(user.graduation!="NA") item.graduation = {'S' : user.graduation};

	     var AWS = req.env_params.aws;
	     dd = new AWS.DynamoDB();
	     dd.putItem({
		'TableName': req.env_params.users,
		'Item': item,
                'Expected': {
                  '_id': { Exists:  false }
                 }
	      }, function(err, data) {
	       if(!err) {
                 // upload and db sucess
		 console.log('submitall: upload and db success'); 
                 // now submit files
                 uploadFiles(req, user_hash, function(){
                   res.send(user);
                 },function(err){
                   return res.send(err.message);
                 });
		 
	       } else {
	         console.log('submitall: upload sucess, db error',err);
	         // note that error may content user attributes
	         // which may trigger .save success
	         // do not return full error object
		 return res.send(err.message);
	        }       
	      });
       


    };

    function s3_upload_file(env_params,file,fname,handler){

       console.log("s3 upload file" + file.name);
       var AWS = env_params.aws;
       var bucket = env_params.bucket;
       var s3 = new AWS.S3();
       console.log("bucket",bucket);
       fs.readFile(file.path, function(err, fileBuffer){
              console.log("s3 put " + file.name);
              var params = {
		    Bucket: bucket + "/docs/",
		    Key: fname, // add new name
		    Body: fileBuffer,
		    ACL: 'private',
		    ContentType: file.type
		        };
	         s3.putObject(params, handler);
	     });
    }



    function uploadFiles(req, hash,callbackSuccess, callbackError){

        // extract name and mime from object to upload
        // TODO: check on name...
        var count = 0;
        var max_files = _.keys(req.files).length;
            var handler = function(error, data){
		    count++;
		    if (error){
                        console.log("error" + error);
                        //response.write("Ooops. Something went wrong!");
                        //                        return response.send();
                        //return res.send(error); 
                        callbackError();
			    }else{
				console.log("worked, data: "+ JSON.stringify(data));
			    }    
                    if (count == max_files) {
                        //response.statusCode = 200;
                        console.log("done with all uploads");
                        // we are save returning this
                        //var files = { resume: '.pdf', cover_letter: '.pdf'}
                        //console.log(files);
                        //return res.send(files);
                        callbackSuccess();
			    }
		}
        for(var key in req.files){
          fname = key + "_" + hash + ".pdf" ;
          s3_upload_file(req.env_params,req.files[key],fname,handler);
        }

    }

    Router.prototype.checkRecaptcha = function(req, res){

       //http://stackoverflow.com/questions/7450465/i-keep-receiving-invalid-site-private-key-on-my-recaptcha-validation-request
       var API_HOST = 'www.google.com';
       var API_END_POINT = '/recaptcha/api/verify';
       

       var entry = req.body;
       var query = { 'privatekey': req.env_params.captcha_private,
         'remoteip': req.connection.remoteAddress,
         'challenge': entry.challenge,
         'response': entry.response };

      var data_qs = querystring.stringify(query);
      console.log("quiery",data_qs);

      var req_options = {
	    host: API_HOST,
	    path: API_END_POINT,
	    port: 80,
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': data_qs.length
	    }
	};
     console.log("options",req_options);
    var request = http.request(req_options, function(response) {
        var body = '';
        response.on('error', function(err) {
            //self.error_code = 'recaptcha-not-reachable';
            return res.send(err);
            //callback(false, 'recaptcha-not-reachable');
        });
        response.on('data', function(chunk) {
            body += chunk;
        });
        response.on('end', function() {
            var success, error_code, parts;
            parts = body.split('\n'); //true or false
            result = parts[0];
            error_code = parts[1];
            console.log("he",result,error_code);
            if (result !== 'true') {
                // to trigger err, avoid sending JSON
                return res.send("Captcha failed. Try again");
            }
            // return model ; 
            return res.send(entry); //everything went well
           
        });
    });
    request.write(data_qs, 'utf8');
    request.end();

    };

   // @desc: check a user's auth status based on a cookie 
   Router.prototype.Auth = function(req, res){
      //  check this in database
      //  req.signedCookies.user_id, req.signedCookies.auth_token 
      console.log("Auth request",req.signedCookies);
      // simulate object returned by DB
      var user = { username: 'jansinsa@hotmail.com', id: '1', password: 'default_pwd' };
      if(req.signedCookies.user_id===user.id) res.json({ user: _.omit(user, ['password', 'auth_token']) });
      else res.json({ error: "Client has no valid login cookies."  });


   };

   // @desc: logins in a user
   Router.prototype.Login = function(req, res){
     // read user and pwd from user and check that exist in db
     // if exists, return cookie with user_id and auth_token

     var user = req.body;
     var user_hash = crypto.createHmac('sha1', req.env_params.hash_key).update(user.username).digest('hex').substring(0,8);
     console.log('search ',user.username, user_hash);        
     dd = new req.env_params.aws.DynamoDB();
     var item = {
	'_id': { 'S': user_hash }
     };
     dd.getItem({
       'TableName': req.env_params.accounts,
       'Key': item,
       }, function(err, data) {
       if(!err) {
	     // now submit files
             console.log('data',data);
             if('Item' in data){
		 var meta = data.Item.pwd.S.split(":");
		 var salt = meta[1];
		 var stored = meta[0];
		 // encrypt+salt password
                  console.log('check if pwd pwd match');
		crypto.pbkdf2(user.password, salt, 10000, 64, function(err, derivedKey) {
		  if (err) {
		    return reject(err);
		  }
		  var encrypted = derivedKey.toString("base64");
		  // check if passwords match
		  if (stored !== encrypted) {
		    return res.json({error: 'Incorrect password'});
		  }
                  console.log('Authenticate user');
		  req.passport.authenticate('local', { session:true  },
		    function(req, res) {
		       console.log('return login');
		       res.json(req.user);
		  });
		});

             }else{
		 return res.json({error: 'User does not exist'});

             }
             

	 }else{
             return res.json({error: 'Error with DynamoDB' + err});
             // check that passwords match

	  }       
     });
  
   };

   // @desc: logins in a user
   Router.prototype.Signup = function(req, res){
     
       // check if email is a valid email
       // id is 
       //var user_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
       //TODO: change username for email
       var user = req.body;
       var user_hash = crypto.createHmac('sha1', req.env_params.hash_key).update(user.username).digest('hex');
       user_hash = user_hash.substring(0,8);

	// salted-hash encripted pwd
	var salt = crypto.randomBytes(64).toString('base64');;
	crypto.pbkdf2(req.body.password, salt, 10000, 64, function(err, derivedKey) {
	  if (err) {
	    return reject(err);
	  }
	  var encrypted = derivedKey.toString("base64");
	  var toBeStored = encrypted + ":" + salt;
          var item = {
		  '_id': { 'S': user_hash },
	          'email': { 'S': user.username },
		  'pwd': { 'S': toBeStored }
		};
	  var AWS = req.env_params.aws;
	  dd = new AWS.DynamoDB();
	  dd.putItem({
		    'TableName': req.env_params.accounts,
		    'Item': item,
		  }, function(err, data) {
		   if(!err) {
		     // upload and db sucess
		     console.log('create_user: upload and db success'); 
		     // now submit files
		     res.send(user);
		   } else {
		     console.log('create user: upload sucess, db error',err);
		     return res.send(err.message);
		    }       
	  });
	});
	// combine hash + salt
     };


    // And now return the constructor function
    return Router;
});



