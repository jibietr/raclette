define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'views/chrono',
    'views/recorder',
    'text!templates/question.html',
    'text!templates/video.html',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html',
    'text!templates/text.html'],
  function($,_,bootstrap,form,Backbone,ChronoView,Recorder,Tmpl_question,Tmpl_video,Tmpl_start,Tmpl_wait,Tmpl_end,Tmpl_text) {

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

        this.question_type = this.model.get("qtype");
        // apply basic layout
        this.$el.html(this.template_question(this.model.toJSON()));
        // set up question
        this.$("#MainContainer").html(this["template_"+this.question_type](this.model.toJSON()));

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
        // stop countdown
        // TODO: save question
        this.model.set("wait_time",this.chronoView.getTime());
        this.chronoView.close();
        // start count up
        this.renderChrono();
        // if question is video type, then start recording
        if(this.question_type=="video"){
           var cameraPreview =  this.$("#camera-preview").get(0);
           this.Recorder = new Recorder({ el: cameraPreview, model: this.model });
           // if video, save model has to be a callback on stop recording 
           this.listenTo(this.model,'video-data-ready',this.saveModel);
           this.Recorder.startRecording();
        }

    },

    stopActive: function(){
        this.model.set("work_time",this.chronoView.getTime());
        this.chronoView.close();
        if(this.question_type=="video"){
           this.Recorder.stopRecording();
           //this.Rec
        }else if(this.question_type=="text"){
           this.readForm();
        }
  
    },

    readForm: function(){
        console.log("read form");
        var answer = $('#textAnswer').val();
        console.log(answer);
        this.model.set("content",answer);
        this.saveModel();

    },

    saveModel: function(){
         console.log("save model!");
         this.model.save(null, { success: function(model,response){                
             console.log(response);                                                                                   
             console.log("triger question-done");
             this.model.trigger("question-done");
         }.bind(this), error: function(model,response){ console.log("error"); }} );
         //this.trigger('question-done');
         //console.log("end of save function");
    }


    
    });
    //console.log("load QuestionView");
    return questionView;
});




