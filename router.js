// define all functions served in the backend
define(['jquery','underscore','fs','http','querystring','crypto','params','async'],
function($,_,fs,http,querystring,crypto,par,async) {

    var Router = function() {}; //empty constructor



    Router.prototype.Login = function(req, res,next){
	console.log("Login to app");
	par.pass.authenticate('local', { session: true }, 
          function(err, user, info) {
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
    };

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.


    Router.prototype.ensureAuthenticated = function(req, res){
	console.log("Checking if req.body is auth");
	if (req.isAuthenticated()) { 
	    //return next();  
	    //res.render('account', { user: req.user });  
	    res.json({ user: req.user});
	}
	//res.redirect('/login')
	//res.json({ user: _.omit(user, ['password', 'auth_token']) });
	res.json({ error: "Client has no valid login cookies."  });
    };


    // Generate an opentok session 
    // https://tokbox.com/opentok/tutorials/create-token/node/index.html
    Router.prototype.startSession = function(req, res) {

      console.log("startSession:: request start session");

      par.opentok.createSession({}, function(error, session){
	  if(error) {
	      console.log("startSession:: Error obtaining session ID: ", error.message);
	  }else{
              console.log("startSession:: Session created with ID: ", session.sessionId);
              // generate a token
              var tokenId = par.opentok.generateToken(session.sessionId);
              console.log("startSession:: Got token ",tokenId);
	      // return session
              res.send({
		  apiKey: par.env.opentok_key,
		  session: session.sessionId,
		  token: tokenId
              });
	  }
      });
    };

    // Start opentok archive
    Router.prototype.startArchive = function(req, res, next) {
	console.log("startArchive:: start recording with session ID: ", req.params.session);
	par.opentok.startArchive(req.params.session, { name: 'archive_sample' }, 
          function(err, archive) {
	    if(err) {
		console.log("startArchive:: Error starting archive: " + err.message, err);
		res.statusCode = "500";
		return res.send(err.message);
	    }
	    console.log("startArchive:: Archive started:",archive);
	    res.send(archive);
	});
    };

    // Stop opentok archive
    Router.prototype.stopArchive = function(req, res, next) {
	par.opentok.stopArchive(req.params.archive, 
          function(err, archive) {
	    if(err) {
		console.log('Error stopping archive: ' + err.message);
		return next(err);
            }
            res.send(archive);
	}); 
    };

    // Get archived video
    Router.prototype.getArchive = function(req, res, next) {
	// req.params.archive
	// I cannot pass a sign url to a video player so will make video public
	// and then delete it --> is this what we are doing?
	s3 = new par.aws.S3();
	var bucket = 'opentok-videos' + '/' + par.env.opentok_key + '/' + req.params.archive;
	console.log('bucket',bucket,req.params);
	var params = { Bucket: bucket, Key: 'archive.mp4', };
	// first check if video exists...
	s3.headObject(params, function(err, data) {
	    if (err){
		console.log('ERR');
		console.log(err, err.stack); // an error occurred
		return res.send({error: err.code}); // send error
	    } else {
		console.log('it seems it exists');
		console.log(data);           // successful response
		s3.getSignedUrl('getObject', params, function (err, ur) {
		    console.log('The URL is', ur);
		    if(err) res.send({error:err.code});
		    else res.send({url:ur});
		});
	    }
	});
    };


    function get_title(item,callback){
       var dd = new par.aws.DynamoDB();
       console.log('get title',item);
        var query_params = {
         TableName: par.env.questions, // require     
            KeyConditions: { 'iid':
             { ComparisonOperator: 'EQ',
               AttributeValueList: [ { S: 'default_iid' } ],  
             },
               'qid':
             { ComparisonOperator: 'EQ',
               AttributeValueList: [ { S: item.qid } ],  
             },
             },
             AttributesToGet: [
		  'title'
             ],
         };
	 dd.query(query_params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else{     
             //console.log(data);

             //console.log(data.Items[0].title.S);           // successful response
	       //kaka
	     //console.log('this is the data entry',data.Items[0].title.S);
             item.title = data.Items[0].title.S;
             callback(null,item);
           }
         }.bind(item));
     }

    function request_access(item,callback) {
      // req.params.archive
      // I cannot pass a sign url to a video player so will make video public
      // and then delete it

      s3 = new par.aws.S3();
	var bucket = 'opentok-videos' + '/' + '44757122' + '/' + item.content;
      //var bucket = 'opentok-videos' + '/' + par.env.apiKey + '/' + item.content;
      //console.log('bucket',bucket,req.params);
      var params = { Bucket: bucket, Key: 'archive.mp4', };
      // first check if video exists...
      s3.headObject(params, function(err, data) {
       if (err){
           console.log('ERR');
           console.log(err, err.stack); // an error occurred
           //return res.send({error: err.code}); // send error
           //return err.code; // send error
           callback(err.code,item);
       } 
       else {
         console.log('it seems it exists');
         console.log(data);           // successful response
         s3.getSignedUrl('getObject', params, function (err, ur) {
          console.log('The URL is', params, ur);
          //if(err) res.send({error:err.code});
          //else res.send({url:ur});
          if(err) callback(err.code,item);
          else{ 
            item.url = ur;
            callback(null,item);
          } 
        });

       }
      });
    }

    // Get list of videos for a given user

    Router.prototype.getFullArchive = function(req, res, next) {
      // req.params.archive
      // I cannot pass a sign url to a video player so will make video public
      // and then delete it
       console.log('get full archive');
       params = this;
       var dd = new par.aws.DynamoDB();
         console.log('check answers of user',req.user.id);
         var query_params = {
         TableName: par.env.answers, // require     
            KeyConditions: { 'userid':
             { ComparisonOperator: 'EQ',
               AttributeValueList: [ { S: req.user.id} ],  
             },
             'qid':
             { ComparisonOperator: 'GT',
               AttributeValueList: [ { S: '0'} ],  
             },
             },
             AttributesToGet: [
                'qtype', 'content','qid'
             ],
             //this does not work, we do not know why
             /*QueryFilter:{  'qtype':
             { ComparisonOperator: 'EQ',
               AttributeValueList: [ { S: 'video'} ],  
             },
             },*/

         };
       dd.query(query_params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else{     
             console.log('response',data);           // successful response
             answers = [];
             console.log(data.Items);
             // need to return an object for each elem
             // filter post search
             data.Items.forEach(function(entry) {
                // we should generate a signed url here...
                //console.log(entry);
                var item = { 
                   'qid': entry.qid.S,
                   //'title': entry.title.S,
                   'qtype': entry.qtype.S,
                   'content': entry.content.S,
                };
                //if('time_wait' in entry) item.time_wait = entry.time_wait.N;
                if(item.qtype==='video') answers.push(item);
             });
             async.map(answers,get_title,function(err,results){
               console.log('finish',err,results);
		 
             async.map(results,request_access,function(err,results){
               console.log('finish',err,results);
               //asnwers.push(item);
               res.send(results);
             });

             });
             

             //answers = answers.reverse();
             //console.log('after async',answers);

           }
         });
     };



    // Save a response to DB
    Router.prototype.saveAnswer = function(req, res){ 

      console.log("POST to /api/apianswers");
       var user = req.body;
       //create simple user id

       // answer hash also encodes created data
       var hash = req.user.id + ':' + req.body.qid ;

       // TODO: add uplaod Id
       var answer = {
            'userid': { 'S': req.user.id },
            //'userid': { 'S': req.user.id },
            'qtype': { 'S': req.body.qtype },
            'qid': { 'S': req.body.qid },
            'work_time' : { 'N': String(req.body.work_time) },
          };
      /* var answer = {
            '_id': { 'S': hash },
            'userid': { 'S': req.user.id },
            'qtype': { 'S': req.body.qtype },
            'qid': { 'S': req.body.qid },
            'work_time' : { 'N': String(req.body.work_time) },
          };*/

       if('wait_time' in req.body) answer.wait_time = { 'N': String(req.body.wait_time) };
       if('content' in req.body) answer.content = { 'S': req.body.content };
       console.log(answer);

       dd = new par.aws.DynamoDB();
       dd.putItem({
          'TableName': par.env.answers,
          'Item': answer
        }, function(err, data) {
             if( !err ) {
		 //console.log( 'entry created. try to upload file' );
                res.send(answer);
		      } else {
                console.log("Error",err);
                return console.log(err)
                // note that error may content user attributes
                // which may trigger .save success
                // do not return full error object
                return res.send(err.message);
			      }     
           // everything is fine. update second DB
          console.log('update DB with', req.user.i,req.body.qid);
          if(req.body.qid!=='0'){
          var params = {
	     Key: {
	      userid: {
		S: req.user.id
	     }},
	    TableName: par.env.sessions, //
	    AttributeUpdates: {
		last: {
		     Action: 'PUT',
		     Value: { S: req.body.qid  },
		}
	     }};
	     dd.updateItem(params, function(err, data) {
		 if (err) console.log(err, err.stack); // an error occurred
		 else res.send(answer);           // successful response
	     });
           }else{
             res.send(answer); 
           }
           //return res.send(answer);  
        });

   

    };

    // Get questions left form interview
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
    };  

    /*
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


    };*/


    /*
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
       


    };*/

    /*
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
    }*/


    /*
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

    }*/

    /*
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

    };*/


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
  /* Router.prototype.Login = function(req, res){
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
  
   };*/

    // get missing questions
    Router.prototype.GetQuestions = function(req, res){
	// get status of interview, check status, and then retrieve questions
	//console.log('Request questions',req);
	console.log('Request questions for session with user',req.user);
	// req.user is available thanks to passport
	dd = new par.aws.DynamoDB();
	
	function get_missing_questions(err,data){
	    params = this;
	    var dd = new par.aws.DynamoDB();

	    if(err) res.json({ err: 'Error starting session' + err });
	    else{
		console.log('Scan questions in Table ', par.env.questions);
		// get id last 
		var last_response = '0';
		if('last' in data.Item) last_response = data.Item.last.S;
		console.log('last',last_response);

		// send expired only 
		if(last_response<12){//send expired only if is uncompleted
		    if('expires' in data.Item){
			var expires = parseInt(data.Item.expires.S, 10);
			var now = parseInt((new Date).getTime().toString(),10);
			//console.log('compare times',expires,now);
			if(now>expires){ 
			    console.log('session expired');
			    // res.json returns model with new fields
			    res.send('SESSION_EXPIRED');
			}
		    }
		}
		
		/* var scan_params = {
		   TableName: params.env.questions, // require     
		   K 
		   AttributesToGet: [
		   'qid', 'status', 'title', 'time_response', 'time_wait', 'qtype',
		   ], 
		   QueryFilter: { 'qid': 
		   { ComparisonOperator: 'GT',
		   AttributeValueList: [ { S: last_response } ],  
		   } 
		   },
		   };*/
		


		var query_params = {
		    TableName: par.env.questions, // require     
		    KeyConditions: { 'iid':
				     { ComparisonOperator: 'EQ',
				       AttributeValueList: [ { S: 'default_iid' } ],  
				     },
				     'qid':
				     { ComparisonOperator: 'GT',
				       AttributeValueList: [ { S: last_response } ],  
				     },
				   },
		    AttributesToGet: [
			'qid', 'status', 'title', 'time_response', 'time_wait', 'qtype',
		    ],
		    /*  QueryFilter:{  'qtype':
			{ ComparisonOperator: 'EQ',
			AttributeValueList: [ { S: 'video'} ],  
			},
			},*/
		    
		};


	 dd.query(query_params, function(err, data) {
           if (err) console.log(err, err.stack); // an error occurred
           else{     
             //console.log(data);           // successful response
             console.log("success retrieving questions");
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
             //questions = questions.reverse();
             res.send(questions);
           }
         });
        }
     }

     var item = {
            'userid': { 'S': req.user.id }
     };
     dd.getItem({
            'TableName': par.env.sessions,
            'Key': item,
     }, get_missing_questions.bind(par));

     
   };


   // @desc: logins in a user
   Router.prototype.Signup = function(req, res){
     
       // check if email is a valid email
       // id is 
       //var user_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
       //TODO: change username for email
       var user = req.body;
       var user_hash = crypto.createHmac('sha1', par.env.hash_key).update(user.username).digest('hex');
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
	  var AWS = par.aws;
	  dd = new AWS.DynamoDB();
	  dd.putItem({
		    'TableName': par.env.accounts,
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



