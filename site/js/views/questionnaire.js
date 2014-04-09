define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'collections/questionnaire',
    'models/panel',
    'views/question',
    'views/panel'],
  function($,_,bootstrap,Backbone,Questionnaire,Panel,QuestionView,PanelView) {

    var questionnaireView = Backbone.View.extend({
      tagName: 'div',
      id: 'sample-page',
      className: 'questionnaire',

     initialize: function() {
        this.collection = new Questionnaire();
        this.collection.fetch({reset: true,//initialize collection from db
         success: function(){ 
           this.renderStart();
        }.bind(this)}); 
     },

     events:{
        'click #submit':'saveQuestion',
        'click #start': 'initInterview',
        'click #continue': 'goToNext' 
     },

     initInterview: function(){
         this.question = this.collection.at(0);
         this.renderQuestion();
     },
     
    renderStart: function(){
        var panel = new Panel({ type: 'start', num_questions: this.collection.length });
        console.log(panel.type);
        var panelView = new PanelView({ 
          model: panel 
         });
        this.$el.html(panelView.render().el);
        return this;
    },

/*    renderChrono: function(){
        var time = this.question.get('time_wait');
        var chronoView = new ChronoView({ seconds: time });
        //var chronoView = new ChronoView('60');
        this.$("#ChronoContainer").html(chronoView.render().el);
     },*/

    // render a question by creating a question view                                                                                 // and appending the element it renders ...                                                                                      // call this function with item being current question                                                                       
    renderQuestion: function() {

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


    });
    console.log("load questionnaire");
    return questionnaireView;
});




