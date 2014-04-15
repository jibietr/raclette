define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/welcome_form.html',
    'backbone-validation'],
  function($,_,bootstrap,Backbone,Tmpl,TOS,validation) {


    var welcomeView = Backbone.View.extend({
      tagName: 'div',
      template: _.template(Tmpl),
         
    events:{
        'click #agree':  'checkTOS'
    },

    render: function() {
        this.$el.html( this.template());
        return this;
    },

    checkTOS: function() {
        console.log(this.$el.find('.help-block'));
        if($('#checkbox').is(":checked")){
          $group = this.$el.find('.form-group');
          $group.removeClass('has-error');
          $group.find('.help-block').addClass('hidden');
          this.trigger('tos-agree');
        }else{ 
          $group = this.$el.find('.form-group');
          $group.addClass('has-error');
          $group.find('.help-block').html('To continue, you must agree on the TOS').removeClass('hidden');
        }
       
    }


    });
    return welcomeView;
});




