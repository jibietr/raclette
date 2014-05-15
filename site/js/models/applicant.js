define([
    'jquery',
    'underscore',
    'backbone',
    'backbone-validation'],
  function($,_,Backbone,validation) {

    // silly trick to valide that file is a pdf ...
    _.extend(Backbone.Validation.validators, {
      file_size: function(value, attr, customValue, model) {
        //console.log("valide size");
        if(value){
          size = value.split(' ').pop();
          console.log("size",size);
          if(size>2097152){ return "error"; }
        }
      },
      is_pdf: function(value, attr, customValue, model) {
        //console.log("valide pdf");
        if(value){
          type = value.split(' ')[0];
          console.log("extension",type);
          if(type!="application/pdf"){ return "error"; }
        }
      }
    });


    var applicant = Backbone.Model.extend({

     url: '/api/submitAll',

     // this will be used by backbone-validation
     validation: {
      name: {
	required: true,
        msg: 'required'
       },
      email: [{
        required: true,
        msg: 'please enter a valid email address'
      },{
        pattern: 'email',
        msg: 'please enter a valid email address'
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
      cover_letter: [{
        required: true,
        msg: 'please upload your motivation letter in pdf'
      },{
        is_pdf: 1,
        msg: 'file must be a pdf'
      },{
        file_size: 1,
        msg: 'file is too big. Upload a file smaller than 2MB'
      }],
      resume: [{
        required: true,
        msg: 'please upload your resume in pdf'
      },{
        is_pdf: 1,
        msg: 'file must be a pdf'
      },{
        file_size: 1,
        msg: 'file is too big. Upload a file smaller than 2MB'
      }],
      source: {
	required: true,
        msg: 'required'
      },
      admission: {
	required: true,
        msg: 'required'
      },
      graduation: {
	required: true,
        msg: 'required'
      }


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
   
