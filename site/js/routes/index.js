define([
  'jquery',
  'underscore',
  'bootstrap',
  'backbone',
  'app',
  'views/faq', 
  'views/app_interview', // AppInt
  //'views/app_form'
  'models/session',  
  'models/user',
  'views/login'
  ],
  function($,_,bootstrap,Backbone,app,FAQ,AppInt,Session,User,LoginView) {


    var router = Backbone.Router.extend({
	/* define the route and function maps for this router */
	routes: {
            "faq" : "showFAQ",
	    "*other": "index"
	},

        initialize: function(){
           app.session.on("change:logged_in", this.index.bind(this));   
        },

        showFAQ: function(){
          console.log('Show FAQ');
          this.show(new FAQ());
        },

        index: function(other){
          //console.log('Default page. You attempted to reach:' + other);
          // Fix for non-pushState routing (IE9 and below)
          var hasPushState = !!(window.history && history.pushState);
          if(!hasPushState) this.navigate(window.location.pathname.substring(1), {trigger: true, replace: true});
          else {
                //this.show(new AppView({ model: this.session }));
                if(app.session.get('logged_in')){
                   console.log("Logged In. Update view");
                   this.show( new AppInt({}) );
                }
                else this.show( new LoginView({}) );
          }               
          //this.loadView(new AppForm());           
	  
	},
        // clean after yourself        
        // http://mikeygee.com/blog/backbone.html
       show: function(view) {
          if(this.view) this.view.remove();
          this.view = view;
          $("#application").html(this.view.render().$el);
          
        }
    });


  return router;

});




