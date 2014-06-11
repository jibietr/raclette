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
            sessionId: null,
            accessAllowed: false
        },

    // in case you want to create publisher before session
    createPublisher: function(){
      //elem = document.querySelector("#publisher");

      // elem = this.$('#publisher');
      elem = $(this.el).find('#publisher')[0];      
      this.publisher = OT.initPublisher(elem);
      console.log('this view',this.view);
      this.publisher.on("accessAllowed",function(){
         this.accessAllowed = true;
         //alert('accessalowed');
         //console.log('access allowed');
         //console.log('this publisher stream?');
      }.bind(this));
      this.publisher.on("destroyed",function(event){
         console.log("DESTROYED!!!"); 
      });
      this.publisher.on("streamDestroyed",function(event){
         console.log("AVOID DESTROYING??"); 
	 event.preventDefault();

      });
    },

    hasStarted: function(){
      //console.log('this publisher',this.publisher);
      return this.accessAllowed;
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
      //Ot.Setloglevel(-OT.NONE);
      This.Setinfo("warning","Please, accept request to use camera and micro");
      this.session = OT.initSession(data.session);
      this.publisher = OT.initPublisher(data.apiKey, document.querySelector("#publisher"));
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
      //console.log('host session pre pub');
      OT.setLogLevel(OT.NONE);
      this.session = OT.initSession(data.apiKey,data.session);
      this.sessionId = data.session;      
      this.tokenId = data.token;
 
      this.session.on('archiveStarted', function(event) {
           this.archiveId = event.id;
           console.log('ARCHIVE STARTED');
           this.clearInfo();
           this.trigger('recordStarted');
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
          console.log('ARCHVIE STOPPED');
          this.clearInfo();
          this.archiveId = null;
          this.sessionId = null;
          console.log('try to unpublish');
          this.session.unpublish(this.publisher);
          this.session.disconnect();
          this.trigger('recordStopped');
      }.bind(this));

     this.session.on('streamDestroyed', function(event) {
          console.log('prevent destroyed?');
          event.preventDefault()
      }.bind(this));

      console.log('trying to connect',data.apiKey,data.token);

      console.log('done setting up session handlers',this.session);
    },

    getArchiveId: function(){
      return(this.archiveId);
    },

    
    requestRecording: function(){

      this.setInfo("warning","Wait while we start recording");
      this.session.connect(this.tokenId, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        //console.log("let's publish pre pub",this.publisher);
        this.session.publish(this.publisher);
        //console.log("published!",this.publisher.stream);
        //this.requestRecording();


      $.ajax({
        url: '/start-archive/' + this.sessionId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 
    /*       this.archiveId = data.id;
           console.log('success request start',data);
           this.clearInfo();
           this.trigger('recordStarted');*/
        }.bind(this),
      error: function(data) {
        //alert('woops!'); //or whatever
        // this.setInfo("warning","Wait while we start recording");
        console.log('ERROR start recording',data);
        this.setInfo("danger","Please, try clicking start again");
      }.bind(this)
      });



      }.bind(this));



    },

    stopRecording: function(){
      this.setInfo("info","Wait while we switch the recording off");
      console.log('stop recording this archive:',this.archiveId);
      $.ajax({
        url: '/stop-archive/' + this.archiveId,
        type: 'GET',
        contentType: 'application/json',
        success: function(data){ 

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




