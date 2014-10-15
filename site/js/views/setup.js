// Initializes Opentok recorder as app.Recorder and requests webcam access.
// Changes app status to 'test' when setup done.
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/setup-1.html', 
    'text!templates/setup-2.html',
    'views/opentok_recorder',
    'app',
],
function($,_,bootstrap,Backbone,TmplSetup,TmplSetup2,Recorder,app) {
    
    var setupView = Backbone.View.extend({

	id: 'setup-view',
	tagName: 'div',
	template_setup: _.template(TmplSetup), // basic info about setup and webcam access
	template_setup2: _.template(TmplSetup2), // display webcam video using opentok container

	events:{
            'click #setup-continue': 'requestWebcamAccess' ,
            'click #setup-done': 'onSetupDone' ,
	},
     
	onSetupDone: function(){
	    app.session.set({ status: 'test'});
	},

	// render template using opentok container definition
	// initialize opentok and request webcam access
	requestWebcamAccess: function(){
            window.scrollTo(0,0);
            this.$el.html(this.template_setup2());
            elem = $(this.el).find("#opentok_container")[0];
	    app.Recorder = new Recorder({ el: elem} );
            app.Recorder.createPublisher();
	    return this;
	},

	// default render basic info
	render: function() {
            window.scrollTo(0,0);
            this.$el.html(this.template_setup());
            return this;
	},

    });

    return setupView;
});




