define([
    'jquery',
    'underscore',
    'backbone',
    'models/interview'],
  function($,_,Backbone,question) {

    var interview = Backbone.Collection.extend({
      model: interview,  
      url: '/api/session', 

      /*initialize: function(){
         console.log("init collection");
      }*/

    });

    
    
   return interview;


});
