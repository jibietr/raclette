// Shows start / wait/ end HTML pages
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html'],
  function($,_,bootstrap,Backbone,Tmpl_start,Tmpl_wait,Tmpl_end) {

    var panelView = Backbone.View.extend({

	id: 'panel-view',
	tagName: 'div',
	template_start: _.template(Tmpl_start),
	template_wait: _.template(Tmpl_wait),
	template_end: _.template(Tmpl_end),
        
	render: function() {
            this.$el.html( this["template_" + this.model.get("type")](this.model.toJSON()));
            return this;
	}

    });

    return panelView;
});




