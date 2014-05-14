define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'views/faq',
    'views/app_interview'],
  function($,_,bootstrap,Backbone,FAQ,AppInt) {


    var router = Backbone.Router.extend({
	/* define the route and function maps for this router */
	routes: {
            "faq" : "showFAQ",
	    "*other": "defaultRoute"
	},

        showFAQ: function(){
          console.log('Show FAQ');
          this.loadView(new FAQ());
        },

	defaultRoute: function(other){
          console.log('Invalid. You attempted to reach:' + other);
          this.loadView(new AppInt());           
	  
	},
        // clean after yourself        
        // http://mikeygee.com/blog/backbone.html
        loadView : function(view) {
          if(this.view) this.view.remove();
          this.view = view;
          $("#application").html(this.view.render().$el);
          console.log("this view",this.view);
        }
    });


  return router;

});




