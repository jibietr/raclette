// Set up S3 target for opentok
// RUN with foreman:
// foreman start -f Procfile-opentok


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
    'jquery'], 
  function($){

    var application_root = __dirname;

    //Connect to database
    var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
    var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    var API_KEY = process.env.API_KEY;
    var API_SECRET = process.env.API_SECRET;
 
    var MSG = ">>"; 
    console.log(MSG,"Current AWS setting is:");
    console.log(MSG,"AWS key",AWS_ACCESS_KEY);
    console.log(MSG,"AWS_secret",AWS_SECRET_KEY);
 
    // 

    var headerAuth = {  "X-TB-PARTNER-AUTH": API_KEY + ":" + API_SECRET };
    var dataObj =   {
        "type": "s3",
        "config": {
            "accessKey": AWS_ACCESS_KEY, 
            "secretKey": AWS_SECRET_KEY,
            "bucket": "opentok-videos"
        }
    };
    var urlPartner = "https://api.opentok.com/v2/partner/" + API_KEY + "/archive/storageBeta";
    console.log(MSG,"url",headerAuth);
    console.log(MSG,"header",headerAuth);
    console.log(MSG,"data",dataObj);

    $.ajax({
      url: urlPartner,
      type: 'PUT',
      headers: headerAuth,
      data: JSON.stringify(dataObj),
      contentType: 'application/json',
      success: function(response) {
       console.log("success",response);
      },
      error: function(response){
       console.log("error",response);
      }
    });

   

});


