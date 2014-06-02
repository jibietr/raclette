define([
    'jquery',
    'underscore',
    'backbone',
    'models/archive_entry'],
  function($,_,Backbone,archive_entry) {

    var questionnaire = Backbone.Collection.extend({
      model: archive_entry,  
      url: '/api/archive', 

      /*initialize: function(){
         console.log("init collection");
      }*/

    });

    
    
   return questionnaire;


});
