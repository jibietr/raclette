define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'text!templates/login.html'],
  function($,_,bootstrap,Backbone,app,TmplLogin) {

    var loginView = Backbone.View.extend({

      tagName: 'div',
      id: 'login-view',
      template_login: _.template(TmplLogin),

      events: { 
        'click #login-btn': 'onLoginAttempt',
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

        this.info = this.$("#InfoContainer");

        var code = $('#code').val(); 
        console.log("code",$('#code').val());
        if(!code){ return this.setInfo('Please, introduce your code'); }

        //interview = new Interview({ id: code });

        //this.info = this.$("InfoContainer");

        app.session.login({
          username: code,
          password: 'x',
        }, {
          success: function(mod, res){
             console.log("SUCCESS", mod, res);
             this.clearInfo();
          }.bind(this),
          error: function(mod, res){
             console.log("ERROR", mod, res);
             //console.log("error",error);
             this.setInfo(mod.error.error);
           }.bind(this)
        });
        
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




