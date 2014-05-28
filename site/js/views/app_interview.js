define([
   'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'collections/questionnaire',
    'models/panel',
    'models/session',
    'views/test',
    'views/question',
    'views/panel',
    'models/opentok_setup',
    'text!templates/setup.html',    
    'text!templates/test.html',
    'views/opentok'],
  function($,_,bootstrap,Backbone,app,Questionnaire,Panel,Session,TestView,QuestionView,PanelView,Recorder,TmplSetup,TmplTest,OpentokView) {

    var questionnaireView = Backbone.View.extend({

      tagName: "div",
      id: 'app-view',
      template_setup: _.template(TmplSetup),
      template_test: _.template(TmplTest),

      initialize: function() {
        // this is what we do to set up the session
        
        this.renderSetup(); //setup view
        // attach opentok view to opentok container
        //elem = $(this.el).find("#opentok_container")[0];
        //this.opentokView = new OpentokView();
        //this.opentokView.$el.appendTo(elem);
        // render and start video are called only once.
        // afterwards we keep attaching and detaching the view
        //this.opentokView.render();
        //this.opentokView.startVideo();

      },

      events:{
	 'click #submit-question':'saveQuestion',
	 'click #start-interview': 'initInterview',
	 'click #continue-interview': 'goToNext',
         'click #setup-done': 'renderTest' ,
     },


      initInterview: function(){
	  this.question = this.collection.at(0);
	  this.rendeQuestion();
      },
 

      render: function(){
	return this;
      },

      renderSetup: function(){
        console.log('render setup');
        this.$el.html(this.template_setup());
 	return this;
      },

      initSession: function(){
	// TODO: modifiy so it uses the iid from session to retriev interview
	// now, interview iid is fixed in server
	this.collection = new Questionnaire();
	this.collection.fetch({reset: true, //initialize collection from db
	  success: function(collection,response){ 
	  console.log(collection);
	  this.renderPanel();          
	 }.bind(this), error: function(model,response){
	  console.log(response);
	}});        
      },

     /* renderSetup: function(){
	//TODO: delete view
        this.$el.html(this.template_setup());
        return this;
      },*/

      renderTest: function(){
	//TODO: 
        // what do we stop here?
        //this.opentokView.$el.detach();
        console.log('render test');
        this.testView = new TestView();
        //this.testView.setRecorderView(this.opentokView);
        //this.opentokView.remove();
        console.log('test view',this.testView);
	this.$el.html(this.testView.render().el);

        
        this.testView.startVideo();
        return this;
        //this.$el.html(this.view.render().el);
        //this.listenTo(this.question,'setup-done',this.renderTest);
        //return this;
      },

      renderPanel: function(){
        // if length==0, questionnare completed
        if(this.collection.length===0){
           var panel = new Panel({ type: 'end', num_questions: this.collection.length });
        }else{
           var panel = new Panel({ type: 'start', num_questions: this.collection.length });
        }
 	console.log(panel);
	var panelView = new PanelView({ 
	 model: panel 
	 });
	this.$el.html(panelView.render().el);
	return this;
      },

     renderQuestion: function() {
          // copy user id param from session
          //this.question.set('userid',this.session.get("userid"));
	  this.questionView = new QuestionView({
		  model: this.question
	      });
	  this.$el.html(this.questionView.render().el);
	  this.listenTo(this.question,'question-done',this.goToWait);
	  //this.$el.html(questionView.render().el);
	  //this.renderChrono();
	  console.log("render new view");
      },

      renderWait: function(){
	  var left = this.collection.length;
	  var attrs = ((left > 0)? { num: left, type: 'wait'} : { type: 'end'});  
	  var panel = new Panel(attrs);
	  this.waitView = new PanelView({
		  model: panel
	      });
	  this.$el.html(this.waitView.render().el);
	  return this;
      },


     
     // this function will be called either by a submit or a                                                                          // crono-based stop event                                                                                                      
      goToWait: function(){
	 // we need to read response and sync the question.                                                                              

	//this.question.set("created",new Date().toISOString());
	//this.question.set("passedbyave",false);
	//console.log("saveQuestion-> check for stream");      

	//console.log(this.question);

	//this.question.save();
	//this.collection.create({ caca: "de vaca" });//POST to api
	console.log("wait");
	this.collection.remove(this.question);
	this.questionView.remove();
	// go to next question
	this.renderWait();
     },

     goToNext: function(){
	 console.log("go to next");
	 this.waitView.remove();
	 this.question = this.collection.at(0);   
	 this.renderQuestion();
     }
     /*    renderChrono: function(){
        var time = this.question.get('time_wait');
        var chronoView = new ChronoView({ seconds: time });
        //var chronoView = new ChronoView('60');
        this.$("#ChronoContainer").html(chronoView.render().el);
     },*/

    // render a question by creating a question view                                                                                 // and appending the element it renders ...                                                                                      // call this function with item being current question                                                                 

    });
    console.log("load questionnaire");
    return questionnaireView;
});




