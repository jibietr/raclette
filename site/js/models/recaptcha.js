define([
    'jquery',
    'underscore',
    'backbone',
    'backbone-validation'],
  function($,_,Backbone,validation) {

    // silly trick to valide that file is a pdf ...

    var applicant = Backbone.Model.extend({

     url: '/api/check_recaptcha',

     // this will be used by backbone-validation
     validation: {
      response: {
	required: true,
        msg: 'Please complete the Recaptcha'
       }
    }


 

    });

    return applicant;

});
   
