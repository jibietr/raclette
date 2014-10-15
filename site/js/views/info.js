// Shows 'welcome' and 'has expired' HTML pages.
// Change app.status to 'examples' on click #intro-continue
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'text!templates/interintro.html',
    'text!templates/expired.html'
],
function($,_,bootstrap,Backbone,app,TmplIntro,TmplExpired) {

    var infoView = Backbone.View.extend({

	id: 'info-view',
	tagName: 'div',
	template_intro: _.template(TmplIntro),
        template_expired: _.template(TmplExpired),

	initialize: function(attrs){
	    this.attrs = attrs;
	},

	events:{
            'click #intro-continue':'onIntroContinue',
	},

	onIntroContinue: function(evt){
            // check TOS here                                                                                                                   
            evt.preventDefault();
            if($('#checkbox').is(":checked")){
                $group = this.$el.find('.form-group');
                $group.removeClass('has-error');
                $group.find('.help-block').addClass('hidden');
                app.session.set({ status: 'examples'});
            }else{
                var error = 'To continue, you must agree on the TOS';
                $group = this.$el.find('.form-group');
                $group.addClass('has-error');
                $group.find('.help-block').html(error).removeClass('hidden');
            }
        },
	
	render: function() {
	    if(this.attrs.status=='expired') this.$el.html(this.template_expired());
	    else this.$el.html(this.template_intro({num_questions: this.attrs.num_questions, duration: this.attrs.duration }));
            return this;
	}

    });

    return infoView;
});




