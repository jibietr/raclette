requirejs([
    'jquery',
    'underscore',
    'backbone',
    'routes/client',
    'models/session'],
function($,_,Backbone,Router,SessionModel) {

    var router = new Router();
    var session = new SessionModel();

    // Copied from 
    // https://github.com/alexanderscott/backbone-login/blob/master/public/main.js
    // Check the auth status upon initialization,
    // before rendering anything or matching routes
    session.checkAuth({
        // Start the backbone routing once we have captured a user's auth status
        complete: function(){
            // HTML5 pushState for URLs without hashbangs
            var hasPushstate = !!(window.history && history.pushState);
            if(hasPushstate) Backbone.history.start({ pushState: true, root: '/' } );
            else Backbone.history.start();
        }
    });
    //console.log(app.root);
    // check rest of related rooter stuff here
    // http://addyosmani.github.io/backbone-fundamentals/#routers
    //Backbone.history.start();
  
});


    
