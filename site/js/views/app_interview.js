// main app viewonExam
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'collections/questionnaire',
    'collections/archive',
    'views/info',
    'views/examples',
    'views/setup',
    'views/test',
    'views/interview',
    'views/archive',
    'views/opentok_recorder',
    'views/opentok'
],
function($,_,bootstrap,Backbone,app,Interview,Archive,
InfoView,ExamplesView,SetupView,TestView,InterView,ArchiveView,Recorder,OpentokView){

    var questionnaireView = Backbone.View.extend({

	tagName: "div",
	id: 'app-view',

	initialize: function() {
            // listen to changes in status
            app.session.on("change:status", this.render.bind(this)); 
 
            // check if there are still missing questions to answer
	    this.collection = new Interview();
	    this.collection.fetch({
		reset: true, //initialize collection from db
		success: function(collection,response){ // interview still active
		    //console.log('INTERVIEW STILL ACTIVE',collection,response);
		    //this.total = collection.length;
		    if(collection.length===0){
			//app.session.set({ status: 'finished'}); // no more questions
			app.session.set({ status: 'archive'}); // no more questions
		    }
		    else app.session.set({ status: 'intro'}); // missing questions, go to intro
		},
		error: function(collection,response){
		    // TODO: deal with other potential errors...
		    if(response.responseText=="SESSION_EXPIRED"){
			app.session.set({ status: 'expired'});
		    }
		}.bind(this)});        
	},


	render: function(){
            var status =  app.session.attributes.status;
            console.log('status change',status);
            if(status==='intro') return this.renderInfo('intro');
            if(status==='setup') return this.renderSetup();
            if(status==='test') return this.renderTestNew();
	    if(status==='archive') return this.renderArchive();
            if(status==='expired') return this.renderInfo('expired');
	    if(status==='interview') return this.renderInterview();
            if(status==='examples') return this.renderExamples();
	    return this;
	},


	// interview
	renderInterview: function(){
	    window.scrollTo(0,0);
	    console.log('render interview');
	    interView = new InterView({ collection: this.collection });
	    this.$el.html(interView.render().el);
	},


	renderExamples: function(){
            window.scrollTo(0,0);
            examplesView = new ExamplesView();
	    this.$el.html(examplesView.render().el);
	},

	renderSetup: function(){
            window.scrollTo(0,0);
            setupView = new SetupView();
	    this.$el.html(setupView.render().el);
	},



	renderArchive: function(){
            console.log('render archive');
            archive = new ArchiveView();
	    archive.collection = this.collection;
            this.$el.html(archive.render().el);
            return this;
	},


	// new Info view class
	renderInfo: function(status){
            window.scrollTo(0,0);
            var time_duration = this.collection.length*5;
	    infoView = new InfoView({ num_questions: this.collection.length, duration: time_duration, status: status });
	    this.$el.html(infoView.render().el);
	},
	
      renderTestNew: function(){

        // what do we stop here?
        //this.setBar('test');
        window.scrollTo(0,0);

        this.testView = new TestView();
        //this.testView.setProgress(this.progress);
        console.log('test view',this.testView);
	this.$el.html(this.testView.render().el);

        this.listenTo(this.testView,'test-done',function(){
          this.testView.remove();
          app.session.set({ status: 'interview' }); 
        }.bind(this));
        return this;

      }


    });
    console.log("load questionnaire");
    return questionnaireView;
});




