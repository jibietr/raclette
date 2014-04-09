define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {

    var question = Backbone.Model.extend({

     url: '/api/answers',

     // if no defaults, then undefined...
     // we can add as defaults: 
     // userid, qtype, qid, content, created, time_wait, time_response, title
      
    });

    return question;

});
   
