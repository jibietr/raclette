//define(['require','jquery',
define(['jquery',
    'underscore',
    'bootstrap',
    'backbone','tbjs'], // caution: do not declare TB obj as it is already available
  function($,_,bootstrap,Backbone) {
  //function(require,$,_,bootstrap,Backbone,tbjs) {
  //function(require) {
   
    // this does not seem to work either
    //var $ = require('jquery');
    //var _ = require('underscore'); 
    //var bootstrap = require('bootstrap');
    //var Backbone = require('backbone');
    //var tbjs = require('tbjs');

    // I am using script in index to load tbjs

    var recorder = Backbone.View.extend({

        defaults: {
            archiveId: null,
            sessionId: null
        },

    // in case you want to create publisher before session
    createPublisher: function(){
      //elem = document.querySelector("#publisher");

      // elem = this.$('#publisher');
      elem = $(this.el).find('#publisher')[0];      
      this.publisher = TB.initPublisher(elem);
      console.log('this view',this.view);
      this.publisher.on("accessAllowed",function(){
         //this.set({ status: 'accepted'});
         console.log('access allowed');
         console.log('this publisher stream?');
      }.bind(this));
      this.publisher.on("destroyed",function(){
         console.log("PUBLISHER DESTROYED");
      });
    },

    hasStarted: function(){
      console.log('this publisher',this.publisher);
      return this.publisher.accessAllowed;
    },
    
    // ask for token and credentials...
    requestSession: function(){
      //this.setInfo("warning","Wait while we start recording");
      console.log("start session");
      $.ajax({
        url: '/start-session',
        type: 'GET',
        success: function(data){ 
          //this.hostSessionPrePub(data);
          this.hostSession(data);
      }.bind(this),
      error: function(data) {
        console.log('ERROR request Session');
        this.setInfo("danger","Ooppps! Problem requesting session");
      }.bind(this)
      });

    },


    requestSessionPrePub: function(){
      //this.setInfo("warning","Wait while we start recording");
      console.log("start session pre pub");
      $.ajax({
        url: '/start-session',
        type: 'GET',
        success: function(data){ 
         console.log('success pre pub');
         this.hostSessionPrePub(data);
      }.bind(this),
      error: function(data) {
        //alert('woops problem requesting session'); //or whateverOA
        this.setInfo("danger","Ooppps! Problem requesting session");
      }.bind(this)
      });

    },



    hostSession: function(data){
      TB.setLogLevel(TB.NONE);
      this.setInfo("warning","Please, accept request to use camera and micro");
      this.session = TB.initSession(data.session);
      this.publisher = TB.initPublisher(data.apiKey, document.querySelector("#publisher"));
      //this.publisher.on("accessAllowed",this.requestRecording.bind(this));
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
          //this.archiveId = event.id;
          console.log("ARCHIVE STARTED");
          //this.clearInfo();
          //this.model.trigger('recordStarted');
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
          //this.archiveId = null;                                                                                              
          console.log("ARCHIVE STOPPED");
          //this.publisher.destroy();

          //this.model.trigger('recordStopped');
      }.bind(this));

   },




    hostSessionPrePub: function(data){
     
      // check stream here
      
      // init session
      console.log('host session pre pub');
      TB.setLogLevel(TB.NONE);
      this.session = TB.initSession(data.session);
      this.sessionId = data.session;      
 /*
      this.session.on('archiveStarted', function(event) {
          //this.archiveId = event.id;
          alert("ARCHIVE STARTED");
          //this.clearInfo();
          //this.trigger('recordStarted');
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
	  //this.archiveId = null;
          alert("ARCHIVE STARTED");
          //this.publisher.destroy();
          //session.disconnect();
          //this.trigger('recordStopped');
      }.bind(this));*/

      this.session.connect(data.apiKey,data.token, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        //console.log("let's publish pre pub",this.publisher);
        this.session.publish(this.publisher);
        //console.log("published!",this.publisher.stream);
        //this.requestRecording();
      }.bind(this));

      console.log('done setting up session handlers',this.session);
    },

    getArchiveId: function(){
      return(this.archiveId);
    },
    
    requestRecording: function(){
      if(this.sessionId==null){
         return this.setInfo("warning","Wait while we intialize the recording");
      }
      this.setInfo("warning","Wait while we start recording");
      $.ajax({
        url: '/start-archive/' + this.sessionId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 
           this.archiveId = data.id;
           console.log('success request start',data);
           this.clearInfo();
           this.trigger('recordStarted');
        }.bind(this),
      error: function(data) {
        //alert('woops!'); //or whatever
        // this.setInfo("warning","Wait while we start recording");
        console.log('ERROR start recording',data);
        this.setInfo("danger","Please, try clicking start again");
      }.bind(this)
      });

    },

    stopRecording: function(){
      this.setInfo("info","Wait while we switch the recording off");
      console.log('stop recording this archive:',this.archiveId);
      $.ajax({
        url: '/stop-archive/' + this.archiveId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 
          console.log('success request stop',data);
          this.clearInfo();
          //this.session.disconnect();
          this.trigger('recordStopped');
      }.bind(this),
      error: function(data) {
        //alert('woops!'); //or whatever
        this.setInfo("danger","Please, try clicking stop again");
      }.bind(this)
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




