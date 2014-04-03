define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {

    var question = Backbone.Model.extend({

     //idAttribute: "email", //do we need this?
     url: '/api/question',

     //if no defaults, then undefined...
     defaults:{
       id: 'unknown',
       type: 'video', // video, likert, test
       response: 'unknown',
     }

      
    });

    return question;

});
   
