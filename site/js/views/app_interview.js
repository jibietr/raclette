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
    'text!templates/setup.html',    
    'text!templates/test.html',
    'text!templates/wrap.html',
    'text!templates/expired.html',
    'text!templates/textbar.html',
    'text!templates/interintro.html',
    'text!templates/interexamples.html',
    'views/opentok',
    'models/progress'],
  function($,_,bootstrap,Backbone,app,Questionnaire,Archive,Panel,Session,TestView,QuestionView,PanelView,ArchiveView,Recorder,TmplSetup,TmplTest,TmplWrap,TmplExpired,TmplBar,TmplIntro,TmplExamples,OpentokView,Progress) {

    var questionnaireView = Backbone.View.extend({

      tagName: "div",
      id: 'app-view',
      template_setup: _.template(TmplSetup),
      template_test: _.template(TmplTest),
      template_wrap: _.template(TmplWrap),
      template_expired: _.template(TmplExpired),
      template_bar: _.template(TmplBar),
      template_intro: _.template(TmplIntro),
      template_examples: _.template(TmplExamples),

      initialize: function() {
        // this is what we do to set up the session
        // we need to check state of interview here. if done, 
        // will show last page...
        //$( "<p>Test</p>" ).insertBefore(this.$el);
        //this.$el.before(this.template_bar());
        //this.renderBar();
        app.session.on("change:status", this.render.bind(this)); 
        //this.progress = new Progress();
        //app.session.on("change:status", this.onStatusChange, this);
 
        this.panel = new Panel();
        this.panelView = new PanelView({ 
	  model: this.panel
	});
    
	this.collection = new Questionnaire();
	this.collection.fetch({reset: true, //initialize collection from db
	  success: function(collection,response){ 
          console.log('INTERVIEW STILL ACTIVE',collection,response);
          //this.total = collection.length;
          if(collection.length===0) app.session.set({ status: 'finished'});
          else app.session.set({ status: 'intro'});//intro
          //app.session.set({ status: 'intro'});



	 }, error: function(collection,response){
          // check error here interview expried?
          if(response.responseText=="SESSION_EXPIRED"){
              app.session.set({ status: 'expired'});
          }
	}.bind(this)});        

      },

      events:{
	 'click #intro-continue':'onIntroContinue',
	 'click #examples-continue':'onExamplesContinue',
	 'click #start-interview': 'onStartInterview',
	 'click #continue-interview': 'onContinue',
         'click #setup-done': 'onSetupDone' ,
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

 


      renderInterview: function(){
	  this.question = this.collection.at(0);
	  this.renderQuestion();
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
        if(status==='wait') return this.renderPanel();
        if(status==='expired') return this.renderExpired();
        if(status==='interview') return this.renderQuestion();
        if(status==='intro') return this.renderIntro();
        if(status==='examples') return this.renderExamples();
	return this;
      },


     renderExpired: function(){
        this.$el.html(this.template_expired());
       return this;

     },

     renderExamples: function(){
        this.$el.html(this.template_examples());
       return this;

     },

     renderBar: function(){
       console.log('render bar!!');
       this.$el.before(this.template_bar());
       $('#nav_welcome').addClass('active');
       this.$el.html();
       return this;
     },
   
     setBar: function(elem){
       console.log('set bar',elem);
       $('#nav_welcome').removeClass('active');
       $('#nav_setup').removeClass('active');
       $('#nav_test').removeClass('active');
       $('#nav_interview').removeClass('active');
       $('#nav_'+elem).addClass('active');
     },

      renderIntro: function(){
 
        //this.renderBar();
        //this.setBar('welcome');
        console.log('render welcome',this.collection.length);
        
        this.$el.html(this.template_intro({num_questions: this.collection.length }));
        // this may cause problems. not sure if has to be separated in two calls
 	return this;
      },

      renderSetup: function(){
        window.scrollTo(0,0);
        //this.setBar('setup');
        console.log('render setup');
        this.$el.html(this.template_setup());
        // this may cause problems. not sure if has to be separated in two calls
        elem = $(this.el).find("#opentok_container")[0];
        this.Recorder = new Recorder({ el: elem, model: this.model});
        this.Recorder.createPublisher();
 	return this;
      },


      renderTest: function(){
        // what do we stop here?
        //this.setBar('test');


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
          //this.setBar('interview');
          // copy user id param from session
          //this.question.set('userid',this.session.get("userid"));
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




