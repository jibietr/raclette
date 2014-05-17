define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/welcome_form.html',
    'backbone-validation',
    'recaptcha',
    'models/recaptcha'],
  function($,_,bootstrap,Backbone,Tmpl,validation,recaptcha,RecaptchaEntry) {



    var welcomeView = Backbone.View.extend({
      tagName: 'div',
      template: _.template(Tmpl),


    initialize: function(){
      console.log("init and binding");
      // Backbone validation requires this.model to be defined before binding
      /*this.model = new RecaptchaEntry();
      Backbone.Validation.bind(this, {
        valid: function(view, attr) {
        // do something
           console.log("valid",view);
       },
      invalid: function(view, attr, error) {
        // do something
          console.log("invalid");
          view.$('.help-block').html(error).removeClass('hidden');
       }
      });*/


    },
         
    events:{
       // 'click [type="checkbox"]': 'showRecaptcha',
        'click #agree':  'checkTOS'
    },

    render: function() {
        this.$el.html( this.template());
        return this;
    },

    checkTOS: function() {
        console.log("check");
        if($('#checkbox').is(":checked")){
          $group = this.$el.find('.form-group');
          $group.removeClass('has-error');
          $group.find('.help-block').addClass('hidden');
          //this.checkRecaptcha();
          this.trigger('tos-agree');
        }else{ 
          this.setError('To continue, you must agree on the TOS');
        }
    },

    setError: function(error){
          $group = this.$el.find('.form-group');
          $group.addClass('has-error');
          $group.find('.help-block').html(error).removeClass('hidden');

    }
   /*
    showRecaptcha: function() {
      Recaptcha.create("6LfaofMSAAAAAIOQJsdVA8UQRLHWuD7mkvcGoQ9T", "captcha", {
             theme: "red",
            callback: Recaptcha.focus_response_field});
    },

    checkRecaptcha: function() {
      console.log("check recaptcha");
      var params = { challenge: Recaptcha.get_challenge(),
       response: Recaptcha.get_response() };
      //before biding, view has to have model
      //if there is no validation, nobody calls it!!
      this.model.save(params,{
         success: function(model,response){ 
            Recaptcha.destroy();
            console.log("Success")
          },
         error: function(model,response){ 
          this.setError(response.responseText);
          Recaptcha.reload();
           }.bind(this),
      });
     }*/
    });
    return welcomeView;
});




