define([
    'jquery',
    'underscore',
    'backbone',
    'backbone-validation'],
  function($,_,Backbone,validation) {

    // silly trick to valide that file is a pdf ...
    _.extend(Backbone.Validation.validators, {
      pdf: function(value, attr, customValue, model) {
        if(value){
          extension = value.split('.').pop();
          if(extension!="pdf"){ return "error"; }
        }
      }
    });


    var applicant = Backbone.Model.extend({

     url: '/api/users',

     // this will be used by backbone-validation
     validation: {
      name: {
	required: true,
        msg: 'required'
       },
      email: [{
        required: true,
        msg: 'Please enter an email address'
      },{
        pattern: 'email',
        msg: 'Please enter a valid email'
      }],
      nationality: {
	required: true,
        msg: 'required'
      },
      school: {
	required: true,
        msg: 'required'
      },
      country: {
	required: true,
        msg: 'required'
      },
      degree: {
	required: true,
        msg: 'required'
      },
      status: {
	required: true,
        msg: 'required'
      },
      major: {
	required: true,
        msg: 'required'
      },
      positions:{
        required: true,
        msg: 'choose at least one position'   
      },
      cover_letter: {
	required: true,
        msg: 'required'
      },
      cover_letter: [{
        required: true,
        msg: 'Please upload a cover letter pdf'
      },{
        pattern: 'pdf',
        msg: 'File must be a pdf'
      }],
      resume: [{
        required: true,
        msg: 'Please upload a resume pdf'
      },{
        pattern: 'pdf',
        msg: 'File must be a pdf'
      }]


    }


    /*
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
      
    },*/


 

    });

    return applicant;

});
   
