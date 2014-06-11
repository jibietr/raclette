define([
    'jquery',
    'underscore',
    'bootstrap',
    //'jquery.form', this was reffered as form
    'backbone',
    'views/chrono',
    'views/opentok_recorder',
    'aws-sdk',
    'jquery.serializeObject',
    'text!templates/question.html',
    'text!templates/video.html',
    'text!templates/tipi.html',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html',
    'text!templates/text.html'],
  function($,_,bootstrap,Backbone,ChronoView,Recorder,aws_sdk,serialize,Tmpl_question,Tmpl_video,Tmpl_tipi,Tmpl_start,Tmpl_wait,Tmpl_end,Tmpl_text) {

    var questionView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      className: 'QuestionContainer',
      template_question: _.template(Tmpl_question),
      template_video: _.template(Tmpl_video),
      template_tipi: _.template(Tmpl_tipi),
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
        if(this.model.get('time_wait')){//no time wait means other 
         this.renderWaitTime();
        }else{//tipi 
          this.info = this.$("#InfoContainer");
          this.renderActiveTime();
        }
        return this;
    },


    setInfo: function(type,message){
      this.clearInfo(); // clear classes if any
      if(type=='warning'){  
        this.info.find("p").addClass('text-warning').text(message);
        this.info.addClass('bg-warning').removeClass('hidden');
      }else if(type=='error'){
        this.info.find("p").addClass('text-danger').text(message);
        this.info.addClass('bg-danger').removeClass('hidden');
      }else if(type=='info'){
        this.info.find("p").addClass('text-info').text(message);
        this.info.addClass('bg-info').removeClass('hidden');

      }
    },

    clearInfo: function(){
       this.info.removeClass("bg-warning").removeClass("bg-danger").addClass("hidden");
       this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
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
             this.Recorder.requestSessionPrePub();
           }
        }
    },

    renderWaitTime: function(){
        var time = this.model.get('time_wait');
        console.log('render countdown');
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'wait' });
        this.listenTo(this.chronoView, 'chrono_stop', this.startRecording);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    renderActiveTime: function(){
        var time = this.model.get('time_response');
        console.log('render chrono');
        if(this.question_type=="video"){
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'active' });
        }else{
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' , status: 'count' });
        }
        this.listenTo(this.chronoView, 'chrono_stop', this.stopActive);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    startRecording: function(time){
      // if function was triggered by click, there is no time
      this.model.set("wait_time",time);
      this.Recorder.requestRecording();
      this.listenTo(this.Recorder,'recordStarted',this.renderActiveTime);
    },

    stopActive: function(time){
      // if function was triggered by click, there is no time
      // set time to question
      this.model.set("work_time",time);
      if(this.question_type=="video") this.stopVideo();
      else if(this.question_type=="tipi") this.submitQuestion();

    },

    stopVideo: function(){

      var answer = this.Recorder.getArchiveId();
      this.model.set("content",answer);
      this.listenTo(this.Recorder,'recordStopped',this.saveModel);
      console.log('stop recording');
      this.Recorder.stopRecording();
    },


    submitQuestion: function(){
       //    var answer = $('#textAnswer').val();
       //    console.log(answer);
       //    this.model.set("content",answer);
       //    this.saveModel();
           //var answer = $('#textAnswer').val();
           var formData = $('#tipi').serializeObject();
           if(Object.keys(formData).length<10){
             this.setInfo('error','Please answer the questionnaire completely. Then press submit.');   
             window.scrollTo(0,0);
           }else{
	     this.clearInfo();
             // create content
            var answer =  "";
            for (var key in formData) {
              answer+= key + ":"+ formData[key]+",";
            }
            answer = answer.substring(0, answer.length - 1);
            //console.log('answer',answer);  
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




