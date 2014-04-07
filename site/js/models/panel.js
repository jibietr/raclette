define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {

    // this is a silly model that must
    // be initialized with the same attributes 
    // needed to display the template determined by 
    // type
    var panel = Backbone.Model.extend({

     //if no defaults, then undefined...
     defaults:{
       type: 'start', // video, likert, test
    }

      
    });

    return panel;

});
   
