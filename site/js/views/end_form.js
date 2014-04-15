define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/bye_form.html'],
  function($,_,bootstrap,Backbone,Tmpl) {


    var byeView = Backbone.View.extend({
      tagName: 'div',
      template: _.template(Tmpl),


    render: function(status) {
        //console.log(this.pp);
        this.$el.html( this.template({ status: status }));
        return this;
    }
	


    });
    return byeView;
});




