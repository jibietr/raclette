define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'views/question',
    'models/question',
    'text!templates/test.html'],
  function($,_,bootstrap,Backbone,QuestionView,Question,TmplTest) {

    var testView = Backbone.View.extend({
      id: 'test-view',
      tagName: 'div',
      template: _.template(TmplTest),

    events:{
         'click #go-interview':'skip',
         'click #try-question': 'startTest' ,
    },

    // render question and timer                                                                                    
    render: function() {
        this.$el.html(this.template());
        return this;
    },

    // call before start test
    setRecorderView: function(recorder){
      this.recorderView = recorder;
    },

    startTest: function(recorder){
       var test_question = new Question();
       test_question.set({ test: true, title: 'Could you introduce yourself, please?', time_response: '10', time_wait: '15', qtype: 'video', qid: 'test' });
       //this.opentokView.render();
       this.questionView = new QuestionView({
         model: test_question
       });
       // attach question 
       elem = $(this.el).find("#test_question")[0];
       this.questionView.$el.appendTo(elem); 
       this.questionView.render();             
       // connect and render recorder                                                                                
       this.questionView.setRecorderView(this.recorderView);
    }




   });

    console.log("load testView");
    return testView;
});




