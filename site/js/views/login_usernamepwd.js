define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'text!templates/login-page.html',
    'parsley',
    'utils'],
  function($,_,bootstrap,Backbone,app,TmplLogin) {

    var loginView = Backbone.View.extend({

      tagName: 'div',
      id: 'login-view',
      template_login: _.template(TmplLogin),

      events: { 
        'click #login-btn': 'onLoginAttempt',
        'click #signup-btn' : 'onSignupAttempt',

      }, 
         
      render: function() {
        //this.$el.html(this.template_login);
        console.log('render user',app.session.user);
        this.$el.html(this.template_login({
                user: app.session.user.toJSON()
            }));
            return this;
        return this;
      },

      onLoginAttempt: function(evt){
            if(evt) evt.preventDefault();
            console.log('attempt to login');
            if(this.$("#login-form").parsley('validate')){
                console.log('passed');
                app.session.login({
                    username: this.$("#login-username-input").val(),
                    password: this.$("#login-password-input").val()
                }, {
                    success: function(mod, res){
                        console.log(mod, res);

                    },
                    error: function(mod, res){
                        console.log("ERROR", mod, res);

                    }
                });
            } else {
                // Invalid clientside validations thru parsley                                                                  
                console.log("Did not pass clientside validation");

            }
      },

	onSignupAttempt: function(evt){
            if(evt) evt.preventDefault();
            if(this.$("#signup-form").parsley('validate')){
                app.session.signup({
                    username: this.$("#signup-username-input").val(),
                    password: this.$("#signup-password-input").val(),
                    name: this.$("#signup-name-input").val()
                }, {
                    success: function(mod, res){
                        console.log(mod, res);

                    },
                    error: function(mod, res){
                        console.log("ERROR", mod, res);

                    }
                });
            } else {
                // Invalid clientside validations thru parsley                                                                  
                console.log("Did not pass clientside validation");

            }
        },




      setInfo: function(message){
        this.clearInfo(); // clear classes if any 
        this.info.find("p").addClass('text-danger').text(message);
        this.info.addClass('bg-danger').removeClass('hidden');
      },

      clearInfo: function(){
        this.info.removeClass("bg-warning").removeClass("bg-danger").addClass("hidden");
        this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
      }

    });
    return loginView;
});




