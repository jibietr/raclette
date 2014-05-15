requirejs([
    'jquery',
    'underscore',
    'backbone',
    'routes/index'],
function($,_,Backbone,Router) {

    var router = new Router();
    //console.log(app.root);
    // check rest of related rooter stuff here
    // http://addyosmani.github.io/backbone-fundamentals/#routers
    Backbone.history.start();
  
});


    
