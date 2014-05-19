define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/faq.html'],
  function($,_,bootstrap,Backbone,Tmpl) {


    var view = Backbone.View.extend({

      //el: '#faq', // this is the same element used by application
      tagName: 'div',
      id: 'faq-view',
      template: _.template(Tmpl),
         
    initialize: function(){
       this.render();
    },

    render: function() {
        this.$el.html( this.template());
        return this;
    }


    });
    return view;
});




