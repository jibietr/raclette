// main app view
define([
   'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'collections/questionnaire',
    'collections/archive',
    'models/panel',
    'models/session',
    'views/test',
    'views/question',
    'views/panel',
    'views/archive',
    'views/opentok_recorder',
    'text!templates/setup-1.html',    
    'text!templates/setup-2.html',    
    'text!templates/test.html',
    'text!templates/wrap.html',
    'text!templates/expired.html',
    'text!templates/textbar.html',
    'text!templates/interintro.html',
    'text!templates/interexamples.html',
    'views/opentok',
    'models/progress'
],
function($,_,bootstrap,Backbone,app,Interview,Archive,Panel,
Session,TestView,QuestionView,PanelView,ArchiveView,Recorder,TmplSetup,
TmplSetup2,TmplTest,TmplWrap,TmplExpired,TmplBar,TmplIntro,TmplExamples,
OpentokView,Progress){

    var questionnaireView = Backbone.View.extend({

	tagName: "div",
	id: 'app-view',
	template_setup: _.template(TmplSetup),
	template_setup2: _.template(TmplSetup2),
	template_test: _.template(TmplTest),
	template_wrap: _.template(TmplWrap),
	template_expired: _.template(TmplExpired),
	template_bar: _.template(TmplBar),
	template_intro: _.template(TmplIntro),
	template_examples: _.template(TmplExamples),

	initialize: function() {
            // listen to changes in status
            app.session.on("change:status", this.render.bind(this)); 
 
	    // there are different ways to call renderPanel
	    // and some may assume the panel actually exists...
	    this.panel = new Panel();
            this.panelView = new PanelView({ 
		model: this.panel
	    });
    
            // check if there are still missing questions to answer
	    this.collection = new Interview();
	    this.collection.fetch({
		reset: true, //initialize collection from db
		success: function(collection,response){ // interview still active
		    //console.log('INTERVIEW STILL ACTIVE',collection,response);
		    //this.total = collection.length;
		    if(collection.length===0){
			app.session.set({ status: 'finished'}); // no more questions
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

	// we change status on clicks, and then render on change of status
	events:{
	    'click #intro-continue':'onIntroContinue',
	    'click #examples-continue':'onExamplesContinue',
	    'click #start-interview': 'onStartInterview',
	    'click #continue-interview': 'onContinue',
            'click #setup-done': 'onSetupDone' ,
            'click #setup-continue': 'renderSetup2' ,
	},
     
	onSetupDone: function(){
	 // do we have video??
	 //console.log('did you start video?',this.Recorder.hasStarted());
	 //if(this.Recorder.hasStarted())  this.progress.set({ status: 'test'});
	 app.session.set({ status: 'test'});
	},

	onStartInterview: function(){
          app.session.set({ status: 'interview'});
	},

	onExamplesContinue: function(){
            app.session.set({ status: 'setup'});
	},

	// should this be a different view?
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

	onContinue: function(){
            app.session.set({ status: 'interview'});
	},

	render: function(){
            var status =  app.session.attributes.status;
            console.log('status change',status);
            if(status==='finished') return this.renderPanel();
            if(status==='setup') return this.renderSetup();
            if(status==='test') return this.renderTest();
	    if(status==='archive') return this.renderArchive();
            if(status==='wait') return this.renderPanel();
            if(status==='expired') return this.renderExpired();
            if(status==='interview') return this.renderQuestion();
            if(status==='intro') return this.renderIntro();
            if(status==='examples') return this.renderExamples();
	    return this;
	},

	renderInterview: function(){
	    this.question = this.collection.at(0);
	    this.renderQuestion();
	},
	

	// renders depending on status
	renderExpired: function(){
            window.scrollTo(0,0);
            this.$el.html(this.template_expired());
	    return this;
	},

	renderExamples: function(){
            window.scrollTo(0,0);
            this.$el.html(this.template_examples());
	    return this;
	},


      renderIntro: function(){
          window.scrollTo(0,0);
          console.log('Render intro with ',this.collection.length,' questions');
          var time_duration = this.collection.length*5;
          this.$el.html(this.template_intro({num_questions: this.collection.length, duration: time_duration }));
 	  return this;
      },

      renderSetup: function(){
        window.scrollTo(0,0);
        //this.setBar('setup');
        console.log('render setup');
        this.$el.html(this.template_setup());
        // this may cause problems. not sure if has to be separated in two calls
 	return this;
      },

     renderArchive: function(){
        console.log('render archive');
         archive = new ArchiveView();
         this.$el.html(archive.render().el);
         return this;
      },

      renderSetup2: function(){
        window.scrollTo(0,0);
        //this.setBar('setup');
        console.log('render setup');
        this.$el.html(this.template_setup2());
        // this may cause problems. not sure if has to be separated in two calls
        elem = $(this.el).find("#opentok_container")[0];
        this.Recorder = new Recorder({ el: elem, model: this.model});
        this.Recorder.createPublisher();
 	return this;
      },


      renderTest: function(){
        // what do we stop here?
        //this.setBar('test');
        window.scrollTo(0,0);

        //this.Recorder.$el.detach();
        console.log('render test');
        this.testView = new TestView();
        //this.testView.setProgress(this.progress);
        console.log('test view',this.testView);
	this.$el.html(this.testView.render().el);
        this.testView.setRecorder(this.Recorder);
        this.listenTo(this.testView,'test-done',function(){
          this.testView.remove();
          app.session.set({ status: 'wait' });
        }.bind(this));
        return this;

      },


	renderPanel: function(){
            window.scrollTo(0,0); 
            // it may not exist at the very beginning
            if(this.Recorder) this.Recorder.$el.detach();
            if(this.collection.length===0){ // show last page...
		this.panel.set({ type: 'end', num_questions: this.collection.length });
            }else if(this.collection.length===this.total){
		this.panel.set({ type: 'start', num_questions: this.collection.length });	        
            }else{
		this.panel.set({ type: 'wait', num_questions: this.collection.length });	        
            }
            /*var panelView = new PanelView({ 
              model: panel 
              });*/
            console.log('does panelview eexist?',this.panelView);
            this.$el.html(this.panelView.render().el);
            return this;
	},
 
	renderQuestion: function() {
            window.scrollTo(0,0);
            // detach panel view
            this.panelView.$el.detach();
            // init new question
  	    this.question = this.collection.at(0);   
	    this.questionView = new QuestionView({
	      model: this.question
	  });
	    this.$el.html(this.template_wrap());//question wrapper
            elem = $(this.el).find("#question")[0]; 
            this.questionView.$el.appendTo(elem);                                                                                          this.questionView.render(); 
	    // set up listener
            this.listenTo(this.question,'question-done',function(){
             this.collection.remove(this.question);
	      this.questionView.remove();
              app.session.set({ status: 'wait' });
          }.bind(this));
            // set up recorder...
            this.questionView.setRecorder(this.Recorder);
	    //this.$el.html(questionView.render().el);
	    //this.renderChrono();
	    console.log("render new view");
      }



    });
    console.log("load questionnaire");
    return questionnaireView;
});




