define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone'],
  function($,_,bootstrap,Backbone) {

    var recorder = Backbone.View.extend({

    requestSession: function(){
      console.log("start session");
      $.ajax({
        url: '/start-session',
        type: 'GET',
        success: function(data){ 
          this.hostSession(data);
      }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
      });

    },

    hostSession: function(data){
     
      // init session
      this.setInfo("warning","Please, accept request to use camera and micro");
      this.session = TB.initSession(data.session);
      this.publisher = TB.initPublisher(data.apiKey, document.querySelector("#publisher"));
      this.publisher.on("accessAllowed",this.requestRecording.bind(this));
      this.sessionId = data.session;      

      this.session.connect(data.apiKey,data.token, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        console.log("let's publish");
        this.session.publish(this.publisher);
        console.log("published!");
        //this.requestRecording();
      }.bind(this));

      this.session.on('archiveStarted', function(event) {
          this.archiveId = event.id;
          console.log("ARCHIVE STARTED");
          this.clearInfo();
          this.model.trigger('recordStarted');
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
	  //this.archiveId = null;
	  console.log("ARCHIVE STOPPED");
          this.publisher.destroy();
          this.session.disconnect();
          this.model.trigger('recordStopped');
      }.bind(this));

    },

    getArchiveId: function(){
      return(this.archiveId);
    },
    
    requestRecording: function(){
      this.setInfo("warning","Wait while we start recording");
      $.ajax({
        url: '/start-archive/' + this.sessionId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 
          console.log('success request start');
      }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
      });

    },

    stopRecording: function(){
      this.setInfo("info","Wait while we switch the recording off");
      $.ajax({
        url: '/stop-archive/' + this.archiveId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 
          console.log('success request stop');
      }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
      });

    },


    // we could do this in initialization ...   
    setInfoPanel: function(el){
       this.info = el;
    },

    setVolume: function(el){
       this.meter = el;

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
    }


    });
    //console.log("load QuestionView");
    return recorder;
});




