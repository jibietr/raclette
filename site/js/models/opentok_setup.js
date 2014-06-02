define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'tbjs'], // caution: do not declare TB obj as it is already available
  function($,_,bootstrap,Backbone) {

    var recorder = Backbone.Model.extend({

    defaults: {
       status: 'off'
    },

  //  createPublisher: function()

    initialize: function(){
       // silent TB messages
      console.log('publish on initialize',document.querySelector("#publisher"));
    },


    createPublisher: function(elem){
      //TB.setLogLevel(TB.NONE);
     // var publisherProperties = { insertMode: 'append', width: 400, height:300, frameRate: 30, resolution: "1280x720", style: { buttonDisplayMode: 'on' } };
      this.publisher = TB.initPublisher(elem);
      console.log('this view',this.view);
      this.publisher.on("accessAllowed",function(){
         this.set({ status: 'accepted'});
         console.log('access allowed');
	 console.log('this publisher stream?',this.publisher.stream);
      }.bind(this));
      //console.log('publisher style',this.publisher.getStyle());
      this.publisher.on("destroyed",function(){
         console.log("publisher destroyed");
      });
      /*this.publisher.on('streamCreated', function(event){
         console.log('Current frameRate:', event.stream.frameRate);
         console.log('Current resolution:', event.stream.videoDimensions.width,'x',event.stream.videoDimensions.height);
      });*/

    },



    stopVideo: function(){
     //this.session.unpublish(this.publisher);
     this.publisher.destroy();
    },

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

    requestSessionPrepPub: function(){
      console.log("start session");
      $.ajax({
        url: '/start-session',
        type: 'GET',
        success: function(data){ 
          this.hostSessionPrePub(data);
      }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
      });
    },

    hostSession: function(data){
     
      // init session
      //this.setInfo("warning","Please, accept request to use camera and micro");
      console.log('Host session',this.get('status'));
      this.set({ status: 'wait-accept'});
     
      this.session = TB.initSession(data.session);
      this.sessionId = data.session;      

      this.session.on('sessionConnected', function(event) {
        console.log('event on session connected',event.streams);
        console.log("let's publish");
        // request recording
        this.requestRecording();
      }.bind(this));
      
      /*this.session.connect(data.apiKey,data.token, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        console.log("let's publish");
        var publisher = this.session.publish(this.publisher);
        console.log("published!",publisher);
        
        //this.requestRecording();
      }.bind(this));*/


      this.session.on('archiveStarted', function(event) {
          this.archiveId = event.id;
          console.log("ARCHIVE STARTED");
          //this.clearInfo();
          this.trigger('recordStarted');
          //this.set({ status: 'recording'});
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
	  //this.archiveId = null;
	  console.log("ARCHIVE STOPPED");
          //this.publisher.destroy();
          this.session.disconnect();
          this.trigger('recordStopped');
      }.bind(this));

      // connect here
      this.session.connect(data.apiKey,data.token);

    },

    getArchiveId: function(){
      return(this.archiveId);
    },
    
    requestRecording: function(){
      //this.setInfo("warning","Wait while we start recording");
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
      //this.setInfo("info","Wait while we switch the recording off");
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




