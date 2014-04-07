define([
    'jquery',
    'underscore',
    'backbone',
    'models/applicant',
    'views/form',
    'views/questionnaire'],
  function($,_,Backbone,Applicant,FormView,InterView) {

    var applicationView = Backbone.View.extend({
    
      el: '#application',
 
      initialize: function()  {
        console.log("initialize application view");

        this.render();
      },

      // render library by rendering each book in its collection
      render: function() {

        //formView = new FormView(); 
        //this.$el.append(formView.render().el);


        var questions = [{ id: 'Q1', type: 'video', title: 'Why do you want to do a phd?', time_wait: '10', time_response: '13' },{ id: 'Q2', type: 'text', title: 'What do you do to handle stress?', time_response: '5' }];

        var interView = new InterView(questions);
        this.$el.append(interView.render().el);
        
      }
    });
  
    return applicationView;
 
});

