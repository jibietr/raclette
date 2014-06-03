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
    /*setRecorderView: function(recorder){
      // attach publisher
      this.recorderView = recorder;
      //elem = this.$("#camera-preview").get(0);
      elem = $(this.el).find("#opentok_container")[0];
      console.log('attach recorder in question',elem);
      this.recorderView.$el.appendTo(elem); 
    },*/




    render: function() {
        console.log('this model',this.model);
        this.question_type = this.model.get("qtype");
        // apply basic layout
        this.$el.html(this.template_question(this.model.toJSON()));
        // set up question
        this.$("#MainContainer").html(this["template_"+this.question_type](this.model.toJSON()));
        // create publisher if question is video
     

       //this.$el.html(this.template_video());
        if(this.model.get('time_wait')){
          this.renderCountdown();
        }else{
          this.renderChrono();
        }
        return this;
    },

    setRecorder: function(recorder){
        if(this.question_type=="video"){
           var elem =  this.$("#opentok_container").get(0);
           if(!recorder){
             console.log('set info panel recorder', infoPanel);
             this.Recorder = new Recorder({ el: elem, model: this.model});
             this.Recorder.createPublisher();
             this.Recorder.$el.appendTo(elem); 
             var infoPanel = this.$("#InfoContainer");
             this.Recorder.setInfoPanel(infoPanel);
           }else{
             this.Recorder = recorder;
             //console.log('append recorder');
             // we do not need this now, we are using document.queryselector
             this.Recorder.$el.appendTo(elem); 
             var infoPanel = this.$("#InfoContainer");
             this.Recorder.setInfoPanel(infoPanel);
             //init opentok session and publisher
             //this.Recorder.requestSessionPrePub();
           }
        }
    },

    renderCountdown: function(){
        var time = this.model.get('time_wait');
        console.log('render countdown');
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'wait' });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopWait);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    renderChrono: function(){
        var time = this.model.get('time_response');
        console.log('render chrono');
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
         /*if(this.model.get('test')){ 
         // test recording using opentok default crendentials
           this.recorderView.recorder.requestSession();
           

         }*/
         /*  console.log("stop wait");
           var cameraPreview =  this.$("#opentok_container").get(0);
           var infoPanel = this.$("#InfoContainer");
           var volume = this.$("#meter");
           this.Recorder = new Recorder({ el: cameraPreview, model: this.model});
           this.Recorder.setInfoPanel(infoPanel);
           //this.Recorder = new Recorder({ el: cameraPreview, model: this.model});*/
           this.Recorder.requestSession();
           //this.Recorder.requestRecording();
          this.listenTo(this.Recorder,'recordStarted',this.renderChrono);
           
           
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
           var answer = this.Recorder.getArchiveId();
           this.model.set("content",answer);
           this.listenTo(this.Recorder,'recordStopped',this.saveModel);
           console.log('stop recording');
           this.Recorder.stopRecording();
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




