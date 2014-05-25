define(['jquery','underscore','fs','http','querystring','crypto','passport','passport-local'],
function($,_,fs,http,querystring,crypto,Passport,PassportLocal) {
    // Start with the constructor
    // empty constructor    function Router(me) {

    var params = {};
    //params.

    function findByUsername(username, fn) {
	var id = crypto.createHmac('sha1', params.env.hash_key).update(username).digest('hex').substring(0,8);
	dd = new params.env.aws.DynamoDB();
	var item = {
            '_id': { 'S': id }
	};
	dd.getItem({
	    'TableName': params.env.accounts,
	    'Key': item,
	}, fn);
    }

    function findById(id, fn) {
	dd = new params.env.aws.DynamoDB();
	var item = {
            '_id': { 'S': id }
	};
	dd.getItem({
	    'TableName': params.env.accounts,
	    'Key': item,
	}, fn);
    }

    params.pass = Passport;
    params.pass.serializeUser(function(user, done) {
      done(null, user.id);
    });

    params.pass.deserializeUser(function(id, done) {
      findById(id, function (err, user) {
        done(err, user);
      });
    });

    var LocalStrategy = PassportLocal.Strategy;
    params.pass.use(new LocalStrategy(
      function(username, password, done) {
        // asynchronous verification, for effect...    
	process.nextTick(function () {
	findByUsername(username, function(err, data) {
          if (err) { return done(err); }
	  if(!err) {
	     // now submit files
             console.log('data',data);
             if('Item' in data){
		 var meta = data.Item.pwd.S.split(":");
		 var salt = meta[1];
		 var stored = meta[0];
		 // encrypt+salt password
                  console.log('check if pwd pwd match');
		crypto.pbkdf2(password, salt, 10000, 64, function(err, derivedKey) {
		  if (err) {
		    return reject(err);
		  }
		  var encrypted = derivedKey.toString("base64");
		  // check if passwords match
		  if (stored !== encrypted) {
		    //return res.json({error: 'Incorrect password'});
                    return done(null, false, { message: 'Unknown user ' + username }); 
		  }
                  console.log('Authenticate user');
                  var user = { id: data.Item._id.S, username: username };
                  done(null, user);
		  
		});

             }else{
		 //return res.json({error: 'User does not exist'});
                 return done(null, false, { message: 'Unknown user ' + username }); 
             }
             

	 }else{
             return res.json({error: 'Error with DynamoDB' + err});
             // check that passwords match

	  } 
        });
      });
      }
    ));

/*
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
     };*/

    // And now return the constructor function
    return params;
});



