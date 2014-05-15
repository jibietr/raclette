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
        this.current_view = welcomeView;
        return this;
      },


      // render library by rendering each book in its collection
      renderForm: function() {
        this.current_view.remove();
        formView = new FormView(); 
        this.$el.html(formView.render().el);
        this.listenTo(formView,'form-submitted',this.renderEnd);        
        this.current_view = formView;
      },

      renderEnd: function(response){
        this.current_view.remove();
        endView = new EndView();
        this.$el.html(endView.render(response).el);
        this.current_view = endView;
        return this;
      },

    });
  
    return appForm;
 
});

