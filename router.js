define(['underscore','fs'
   //'opentok'],function(_,fs,OpenTok) {
   ],function(_,fs) {
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
          'Item': answer
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
       var user_hash = (new Date).getTime().toString() + Math.floor((Math.random()*1000)+1).toString();
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
		  'school': { 'S': user.school },
		  'degree': { 'S': user.degree },
		  'status': { 'S': user.status },
		  'positions' : { 'SS': positions },
		  'source' : { 'S': user.source },
		  'major': { 'S': user.major }
		};
	     if(user.admission!="NA") item.admission = { 'S' : user.admission }; 
	     if(user.graduation!="NA") item.graduation = {'S' : user.graduation};

	     var AWS = req.aws_params.aws;
	     dd = new AWS.DynamoDB();
	     dd.putItem({
		'TableName': req.aws_params.users,
		'Item': item
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

    function s3_upload_file(aws_params,file,fname,handler){

       console.log("s3 upload file" + file.name);
       var AWS = aws_params.aws;
       var bucket = aws_params.bucket;
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
          s3_upload_file(req.aws_params,req.files[key],fname,handler);
        }

    }





    // And now return the constructor function
    return Router;
});



