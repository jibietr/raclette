// routing
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'views/faq', 
    'views/app_interview',
    'views/login',
    'views/header'
],
function($,_,bootstrap,Backbone,app,faqView,AppView,LoginView,HeaderView) {
    
    var router = Backbone.Router.extend({
	 /* define the route and function maps for this router */
	routes: {
            "faq" : "showFAQ",
	    "*other": "showLogin"
	},
	
        initialize: function(){
            // listen to changes in log status
	    console.log('re init router',app.session.get('logged_in'));

        },
	
        showFAQ: function(){
            //console.log('Show FAQ');
            this.show(new faqView());
        },

	isAuth: function(){
	    if(!app.session.get('logged_in')){
		console.log("not logged in"); // show login
		this.show(new LoginView({}));
		return false;
	    }
	    // if not logged in...

	    console.log('yes logged in');
	    return true;
	},

        showLogin: function(other){
          console.log('Default page. You attempted to reach:',other);
          // Fix for non-pushState routing (IE9 and below)
          var hasPushState = !!(window.history && history.pushState);
          if(!hasPushState) this.navigate(window.location.pathname.substring(1), {trigger: true, replace: true});
          else {
              //this.show(new AppView({ model: this.session }));
              if(this.isAuth()){
                  console.log("Logged In. Update view");
		  // Every page view in the router should need a header.
		  // Instead of creating a base parent view, just assign the view to this
		  // so we can create it if it doesn't yet exist
		  if(!this.headerView){
                      this.headerView = new HeaderView({});
                      this.headerView.setElement( $("#header") );
		  }
		  this.show( new AppView({}) );
              }else{ 
		  // be careful where you put this listener. in combination 
		  // with isAuth can result in double renders...
		  app.session.on("change:logged_in", this.showLogin.bind(this));
	      }
          }               
	},

	show: function(view,options) {
            // clean after yourself        
            // http://mikeygee.com/blog/backbone.htmlw
            if(this.view) this.view.remove();
	    this.view = view; //main view
	    $("#application").html(this.view.render().$el);
        }
    });

    return router;
    
});




