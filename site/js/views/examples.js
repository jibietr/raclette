// Shows single HTML page with examples.
// Changes app status to 'setup' on click #examples-continue.
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/interexamples.html',    
    'app',
],
function($,_,bootstrap,Backbone,TmplExamples,app) {
    
    var examplesView = Backbone.View.extend({

	id: 'examples-view',
	tagName: 'div',
	template_examples: _.template(TmplExamples),

	events:{
            'click #examples-continue':'onExamplesContinue',
	},

	onExamplesContinue: function(){
            app.session.set({ status: 'setup'});
	},

	render: function(tempName) {
            window.scrollTo(0,0);
            this.$el.html(this.template_examples());
            return this;
	},

    });

    return examplesView;
});




