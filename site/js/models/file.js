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

    var file = Backbone.Model.extend({

     url: '/upload_s3',

     // this will be used by backbone-validation
     validation: {

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
 

    });

    return file;

});
   
