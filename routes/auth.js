define(['jquery','underscore','fs','http','querystring','crypto'
   //'opentok'],function($,_,fs,OpenTok,) {
   ],function($,_,fs,http,querystring,crypto) {
    // Start with the constructor
    // empty constructor    function Router(me) {


    


    var Router = function() {};

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



