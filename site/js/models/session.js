define([
    'jquery',
    'underscore',
    'backbone',
    'backbone-validation'],
  function($,_,Backbone,validation) {

   var interview = Backbone.Model.extend({
     urlRoot: '/api/session/' 
   });

   return interview;

});
   
