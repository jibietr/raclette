define([
    'jquery',
    'underscore',
    'bootstrap',
    //'jquery.form', this was reffered as form
    'backbone',
     'models/opentok_setup',
    'aws-sdk',
    'text!templates/opentok.html'],
  function($,_,bootstrap,Backbone,Recorder,aws_sdk,Tmpl) {

    var setupView = Backbone.View.extend({
      id: 'opentok-view',
      tagName: 'div',
      template: _.template(Tmpl),

    events: {
       'click #setup-done': function(){ this.trigger('setup-done'); },
    }, 

    // render question and timer                                                                                    
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    
    startVideo: function(){
        this.recorder = new Recorder();
        elem = $(this.el).find("#publisher")[0];
        this.recorder.createPublisher(elem);
    },

   /* onStatusChange: function(){
      console.log('status change');
      if(this.model.get('status')==='wait-accept') this.setInfo("warning","Please, accept request to use camera and micro");
      if(this.model.get('status')==='access-denied') this.setInfo("warning","Ooops, icro");
    },*/

   /* startSetup: function(){
           //var cameraPreview =  this.$("#camera-preview").get(0);
           this.model = new Setup();
           //this.model.on("change:status", this.onStatusChange.bind(this));
           //this.Setup.setInfoPanel(infoPanel);
           //this.Recorder = new Recorder({ el: cameraPreview, model: this.model});
           this.model.requestSession();
    },*/

   /* setInfo: function(type,message){
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
       this.info = this.$("#InfoContainer");
       this.info.removeClass("bg-warning").removeClass("bg-danger").addClass("hidden");
       this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
    },

    stopWait: function(time){
        // stop countdown
        // TODO: save question
        
        //this.chronoView.close();
        // this.chronoView.stop();
        // start count up
       this.model.set("wait_time",time);  

        // if question is video type, then start recording
        if(this.question_type=="video"){
           console.log("stop wait");
           //this.Recorder.startRecording();
           
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
           this.listenTo(this.model,'recordStopped',this.saveModel);
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
      
    }*/

    
    
    });
    //console.log("load QuestionView");
    return setupView;
});




