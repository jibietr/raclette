define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'views/chrono',
    'text!templates/question.html',
    'text!templates/video.html',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html',
    'text!templates/text.html'],
  function($,_,bootstrap,form,Backbone,ChronoView,Tmpl_question,Tmpl_video,Tmpl_start,Tmpl_wait,Tmpl_end,Tmpl_text) {

    var questionView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      className: 'QuestionContainer',
      template_question: _.template(Tmpl_question),
      template_video: _.template(Tmpl_video),
      template_start: _.template(Tmpl_start),
      template_wait: _.template(Tmpl_wait),
      template_end: _.template(Tmpl_end),
      template_text:  _.template(Tmpl_text),


    events: {
       'click #start': 'stopWait',
       'click #stop': 'stopActive'
    }, 

    // render question and timer                                                                                    
    render: function() {

        var type = this.model.get("type");
        // apply basic layout
        this.$el.html(this.template_question(this.model.toJSON()));
        // set up question
        //this.$("#QuestionContainer").html(this.model.get("title"));
     
        this.$("#MainContainer").html(this["template_"+type](this.model.toJSON()));

       //this.$el.html(this.template_video());
        if(this.model.get('time_wait')){
          this.renderCountdown();
        }else{
          this.renderChrono();
        }
        return this;
    },

    renderCountdown: function(){
        var time = this.model.get('time_wait');
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopWait);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    renderChrono: function(){
        var time = this.model.get('time_response');
        this.chronoView = new ChronoView({ seconds: time , type: 'normal'  });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopActive);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    stopWait: function(){
        this.chronoView.close();
        this.renderChrono();
    },

    stopActive: function(){
        this.chronoView.close();
        this.trigger('question_done');
    }


    });
    //console.log("load QuestionView");
    return questionView;
});




