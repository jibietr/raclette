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
  'views/login',
  'views/header'],
  function($,_,bootstrap,Backbone,app,FAQ,AppInt,Session,User,LoginView,HeaderView) {


    var router = Backbone.Router.extend({
	/* define the route and function maps for this router */
	routes: {
            "faq" : "showFAQ",
	    "*other": "index"
	},

        initialize: function(){
         //           app.session.on("change:logged_in", this.index.bind(this));   
        //   app.session.on("change:status", this.show.bind(this));   
        },

        showFAQ: function(){
          console.log('Show FAQ');
          this.show(new FAQ());
        },

        index: function(other){
          console.log('Default page. You attempted to reach:',other);
          // Fix for non-pushState routing (IE9 and below)
          var hasPushState = !!(window.history && history.pushState);
          if(!hasPushState) this.navigate(window.location.pathname.substring(1), {trigger: true, replace: true});
          else {
                //this.show(new AppView({ model: this.session }));
               /* if(app.session.get('logged_in')){
                   console.log("Logged In. Update view");
                   this.show( new AppInt({}) );
                }*/
                this.show( new LoginView({}) );
          }               
          //this.loadView(new AppForm());           
	  
	},
        // clean after yourself        
        // http://mikeygee.com/blog/backbone.html
       show: function(view,options) {

            // Every page view in the router should need a header.
            // Instead of creating a base parent view, just assign the view to this
            // so we can create it if it doesn't yet exist
           if(!this.headerView){
                this.headerView = new HeaderView({});
                this.headerView.setElement( $("#header") );
                //this.headerView.setElement( $("#header") ).render();
             }
          console.log('RENDER VIEW',app.session.attributes.status,this.view,view,options);
          //if(view){
          if(this.view) this.view.remove();
          this.view = view;
          //}
 
          $("#application").html(this.view.render().$el);
          
        }
    });


  return router;

});




