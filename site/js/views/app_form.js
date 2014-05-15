define([
    'jquery',
    'underscore',
    'backbone',
    'models/applicant',
    'views/welcome_form',
    'views/form',
    'views/end_form'],
  function($,_,Backbone,Applicant,WelcomeView,FormView,EndView) {

    var appForm = Backbone.View.extend({
    
      //el: '#application',
      tagName: 'div',
      id: 'app-form',
 
      initialize: function()  {
        this.renderStart();
      },

      renderStart: function(){
        welcomeView = new WelcomeView();
        this.listenTo(welcomeView,'tos-agree',this.renderForm);
        this.$el.html(welcomeView.render().el);
        
        return this;
      },


      // render library by rendering each book in its collection
      renderForm: function() {
        console.log("renderForm");
        // uncomment this to start form view
        formView = new FormView(); 
        this.$el.html(formView.render().el);
        this.listenTo(formView,'form-submitted',this.renderEnd);        
        
      },

      renderEnd: function(response){
        console.log(response);
        endView = new EndView();
        this.$el.html(endView.render(response).el);
        return this;
      },

    });
  
    return appForm;
 
});

