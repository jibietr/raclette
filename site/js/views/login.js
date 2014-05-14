define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/login.html'],
  function($,_,bootstrap,Backbone,TmplLogin) {


    var loginView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      //className: 'PanelContainer',
      template_login: _.template(TmplLogin),

      events: { 
         'click #check-code': 'checkCode' 
      }, 
         
      render: function() {
        this.$el.html(this.template_login);
        return this;
      },

      checkCode: function(){
        var code = $('#code').val(); 
        console.log("code",$('#code').val());
        
        //interview = new Interview({ id: code });
        this.info = this.$("#InfoContainer");
        this.model.set({ id: code });
        console.log("info",this.info);
        this.model.fetch({
          success: function(model,response,error){
           console.log("sucess",model);
           this.clearInfo();
           this.model = model;
           this.model.trigger('loginSuccesful');
          }.bind(this),
          error: function(model,res,error){
           console.log("error",error);
           this.setInfo(res.responseText);
          }.bind(this)
          }
         );
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




