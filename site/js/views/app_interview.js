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
    'views/opentok',
    'models/progress'],
  function($,_,bootstrap,Backbone,app,Questionnaire,Archive,Panel,Session,TestView,QuestionView,PanelView,ArchiveView,Recorder,TmplSetup,TmplTest,TmplWrap,TmplExpired,TmplBar,OpentokView,Progress) {

    var questionnaireView = Backbone.View.extend({

      tagName: "div",
      id: 'app-view',
      template_setup: _.template(TmplSetup),
      template_test: _.template(TmplTest),
      template_wrap: _.template(TmplWrap),
      template_expired: _.template(TmplExpired),
      template_bar: _.template(TmplBar),

      initialize: function() {
        // this is what we do to set up the session
        // we need to check state of interview here. if done, 
        // will show last page...
        //$( "<p>Test</p>" ).insertBefore(this.$el);
        //this.$el.before(this.template_bar());
        this.renderBar();

        this.progress = new Progress();
        this.progress.on("change:status", this.onStatusChange, this);
 
        this.panel = new Panel();
        this.panelView = new PanelView({ 
	  model: this.panel
	});
    
	this.collection = new Questionnaire();
	this.collection.fetch({reset: true, //initialize collection from db
	  success: function(collection,response){ 
          console.log('INTERVIEW STILL ACTIVE',collection,response);
          if(collection.length===0) this.progress.set({ status: 'finished'});
          this.total = collection.length;
          this.progress.set({ status: 'setup'});

	 }.bind(this), error: function(collection,response){
          // check error here interview expried?
          if(response.responseText=="SESSION_EXPIRED"){
              this.progress.set({ status: 'expired'});
          }
	}.bind(this)});        

      },

      onStatusChange: function(){
        var status =  this.progress.attributes.status;
        if(status==='finished') this.renderPanel();
        if(status==='setup') this.renderSetup();
        if(status==='test') this.renderTest();
        if(status==='wait') this.renderPanel();
        if(status==='expired') this.renderExpired();
        if(status==='interview') this.renderQuestion();
        

      },

      events:{
	 //'click #submit-question':'saveQuestion',
	 'click #start-interview': 'onStartInterview',
	 'click #continue-interview': 'onContinue',
         'click #setup-done': 'onSetupDone' ,
     },
     

     onSetupDone: function(){
       this.progress.set({ status: 'test'});
     },

      onStartInterview: function(){
        this.progress.set({ status: 'interview'});
      },

      renderInterview: function(){
	  this.question = this.collection.at(0);
	  this.renderQuestion();
      },

      onContinue: function(){
        this.progress.set({ status: 'interview'});
      },
 

      render: function(){
	return this;
      },


     renderExpired: function(){
        this.$el.html(this.template_expired());
       return this;

     },

     renderBar: function(elem){
       this.$el.before(this.template_bar());
       $('#nav_welcome').addClass('active');

     },
   
     setBar: function(elem){
       console.log('set bar',elem);
       $('#nav_welcome').removeClass('active');
       $('#nav_setup').removeClass('active');
       $('#nav_test').removeClass('active');
       $('#nav_interview').removeClass('active');
       $('#nav_'+elem).addClass('active');
     },

      renderSetup: function(){
        this.renderBar('setup');
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
        this.setBar('test');


        this.Recorder.$el.detach();
        console.log('render test');
        this.testView = new TestView();
        //this.testView.setProgress(this.progress);
        console.log('test view',this.testView);
	this.$el.html(this.testView.render().el);
        this.testView.setRecorder(this.Recorder);
        this.listenTo(this.testView,'test-done',function(){
          this.testView.remove();
          this.progress.set({ status: 'wait' });
        }.bind(this));
        return this;

      },


     renderPanel: function(){ 
           this.setBar('interview');
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
     },
 
     renderQuestion: function() {
          this.setBar('interview');
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
              this.progress.set({ status: 'wait' });
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




