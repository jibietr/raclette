requirejs([
    'jquery',
    'underscore',
    'backbone',
    'routes/index',
    'app',
    'models/session'],
  function($,_,Backbone,Router,app,SessionModel) {

    // for some reason app is undefined...
    console.log("app",app);
    //var hi = app();
    //console.log("router",Router);
    
    app.session = new SessionModel();
    var router = new Router();

    // Copied from 
    // https://github.com/alexanderscott/backbone-login/blob/master/public/main.js
    // Check the auth status upon initialization,
    // before rendering anything or matching routes

    console.log("start backbone routing once we captured user's auth status");
    app.session.checkAuth({
        // Start the backbone routing once we have captured a user's auth status
        complete: function(){
            // HTML5 pushState for URLs without hashbangs
            var hasPushstate = !!(window.history && history.pushState);
            // there is a strange behavior here that does not let me go to #faq
            // so i comment it for the moment...
            //if(hasPushstate) Backbone.history.start({ pushState: true, root: '/' } );
            //else Backbone.history.start();
            Backbone.history.start();
        }
    });

  
});


    
