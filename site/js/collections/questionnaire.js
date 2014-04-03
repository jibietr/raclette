define([
    'jquery',
    'underscore',
    'backbone',
    'models/question'],
  function($,_,Backbone,question) {

    var questionnaire = Backbone.Collection.extend({
      model: question,  

      initialize: function(){
         console.log("init collection");
      }

    });

    
    
   return questionnaire;


});
