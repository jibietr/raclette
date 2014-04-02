define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {

    var applicant = Backbone.Model.extend({

     //idAttribute: "email", //do we need this?
     url: '/api/users',

     //if no defaults, then undefined...


    validate: function(attrs) {
      console.log("validate");
      var errors = this.errors = {}; //this.errors can be referrenced outside
      //console.log(attrs);
      if (!attrs.name) errors.name = 'required field';
      if (!attrs.email) errors.email = 'required field';
      if (!attrs.country) errors.country = 'required field';
      if (!attrs.resume) errors.resume = 'a resume is required';
      //console.log("show errors " + errors.resume);
      if (!_.isEmpty(errors)){
        errors.has_errors = 'please review missing fields';
        return errors;
    
      } 
      
    },

 

    });

    return applicant;

});
   
