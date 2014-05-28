define([
    'jquery',
    'underscore',
    'bootstrap',
    //'jquery.form', this was reffered as form
    'backbone',
    'views/chrono',
    'views/opentok_recorder',
    'aws-sdk',
    'text!templates/question.html',
    'text!templates/video.html',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html',
    'text!templates/text.html'],
  function($,_,bootstrap,Backbone,ChronoView,Recorder,aws_sdk,Tmpl_question,Tmpl_video,Tmpl_start,Tmpl_wait,Tmpl_end,Tmpl_text) {

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
      

  /*  events: {
       'click #stop-wait': function(){ this.chronoView.stop(); },
       'click #stop-active': 'stopActive'
    }, */

    // render question and timer                                                                                    
    setRecorderView: function(recorder){
      // attach publisher
      this.recorderView = recorder;
      //elem = this.$("#camera-preview").get(0);
      elem = $(this.el).find("#opentok_container")[0];
      console.log('attach recorder in question',elem);
      this.recorderView.$el.appendTo(elem); 
    },


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
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'wait' });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopWait);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    renderChrono: function(){
        var time = this.model.get('time_response');
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'active' });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopActive);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    stopWait: function(time){
        // stop countdown
        // TODO: save question
       this.model.set("wait_time",time);  
       console.log('stop wait');
        // if question is video type, then start recording
       if(this.question_type=="video"){
         if(this.model.get('test')){ 
         // test recording using opentok default crendentials
           this.recorderView.recorder.requestSession();
           this.listenTo(this.recorderView.recorder,'recordStarted',this.renderChrono);

         }
         /*  console.log("stop wait");
           var cameraPreview =  this.$("#camera-preview").get(0);
           var infoPanel = this.$("#InfoContainer");
           var volume = this.$("#meter");
           this.Recorder = new Recorder({ el: cameraPreview, model: this.model});
           this.Recorder.setInfoPanel(infoPanel);
           //this.Recorder = new Recorder({ el: cameraPreview, model: this.model});
           this.Recorder.requestSession();
           
           //this.Recorder.startRecording();*/
           
        }else{

           this.startActive();
        }

    },


    startActive: function(){
      this.chronoView.remove();
      this.renderChrono();
    },

    stopActive: function(){

        console.log("stop active");
        this.model.set("work_time",this.chronoView.getTime());
        this.chronoView.close();
        if(this.question_type=="video"){
           // get 
           var answer = this.recorderView.recorder.getArchiveId();
           this.model.set("content",answer);
           this.listenTo(this.recorderView.recorder,'recordStopped',this.saveModel);
           this.recorderView.recorder.stopRecording();
        }else if(this.question_type=="text"){
           var answer = $('#textAnswer').val();
           console.log(answer);
           this.model.set("content",answer);
           this.saveModel();
        }
  
    },

    saveModel: function(){
         console.log("save model!",this.model); 

        this.model.save(null, { success: function(model,response){                
             console.log(response);                                                                                   
             console.log("triger question-done");
             this.model.trigger("question-done");
         }.bind(this), error: function(model,response){ console.log("error"); }} );
      
    }

    
    
    });
    //console.log("load QuestionView");
    return questionView;
});




