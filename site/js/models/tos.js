define([
    'jquery',
    'underscore',
    'backbone',
    'backbone-validation'],
  function($,_,Backbone,validation) {

   var tos = Backbone.Model.extend({
     validation: {
      termsOfUse: {
        acceptance: true,
        msg: 'please accept'
      }
     }
   });

   return tos;

});
   
