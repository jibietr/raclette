define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/login.html'],
  function($,_,bootstrap,Backbone,TmplLogin) {


    var panelView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      //className: 'PanelContainer',
      template_login: _.template(TmplLogin),
         
    render: function() {

        this.$el.html(this.template_login);
        return this;
    }



    });
    return panelView;
});




