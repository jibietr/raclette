define(['jquery','underscore','fs','http','querystring','crypto','passport','passport-local'],
function($,_,fs,http,querystring,crypto,Passport,PassportLocal) {
    // Start with the constructor
    // empty constructor    function Router(me) {

    var params = {};
    //params.

    function findByCode(code, fn) {
        console.log('find code',code);
	dd = new params.env.aws.DynamoDB();
	var item = {
            'code': { 'S': code }
	};
	dd.getItem({
	    'TableName': params.env.codes,
	    'Key': item,
	}, fn);
    }

    params.pass = Passport;
    params.pass.serializeUser(function(user, done) {
      done(null, user.code);
    });

    params.pass.deserializeUser(function(code, done) {
      findByCode(code, function (err, data) {
        //var user = { id: data.Item.userid.S };
        var user = { id: data.Item.userid.S, code: data.Item.code.S };
        done(err, user);
      });
    });

    var LocalStrategy = PassportLocal.Strategy;
    params.pass.use(new LocalStrategy(
      function(username, password, done) {
        // asynchronous verification, for effect...    
	process.nextTick(function () { 
        // we will only check if username exists...
	findByCode(username, function(err, data) {
          if (err) {
               console.log('error');
               return done(err); }
	  if(!err) {
	     // now submit files
             console.log('data',data);
             if('Item' in data){
                  //var user = { id: username };
                  var user = { id: data.Item.userid.S, code: data.Item.code.S };
                  return done(null, user);
		//});
             }else{
		 //return res.json({error: 'User does not exist'});
                 console.log('Unkown code');
                 return done(null, false, { error: 'Unknown code' });
             }
	 }
        });
      });
      }


    ));
    // And now return the constructor function
    return params;
});



