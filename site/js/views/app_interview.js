define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'collections/questionnaire',
    'models/panel',
    'models/session',
    'views/question',
    'views/panel',
    'views/login'],
  function($,_,bootstrap,Backbone,Questionnaire,Panel,Session,QuestionView,PanelView,LoginView) {

    var questionnaireView = Backbone.View.extend({

      //el: '#application',
      tagName: "div",
      id: "questionnaire",

      initialize: function() {
	this.renderLogin();
      },

      events:{
	 'click #submit-question':'saveQuestion',
	 'click #start-interview': 'initInterview',
	 'click #continue-interview': 'goToNext' 
      },

      initInterview: function(){
	  this.question = this.collection.at(0);
	  this.renderQuestion();
      },
     
      renderLogin: function(){
	this.session = new Session();      
	var panelView = new LoginView({ model: this.session});
	this.listenTo(this.session,'loginSuccesful',this.initSession);
	this.$el.html(panelView.render().el);
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

      renderPanel: function(){
	var panel = new Panel({ type: 'start', num_questions: this.collection.length });
	console.log(panel);
	var panelView = new PanelView({ 
	 model: panel 
	 });
	this.$el.html(panelView.render().el);
	return this;
      },

     renderQuestion: function() {
          // copy user id param from session
          this.question.set('userid',this.session.get("userid"));
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




