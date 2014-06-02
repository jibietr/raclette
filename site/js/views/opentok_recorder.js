define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'tbjs'], // caution: do not declare TB obj as it is already available
  function($,_,bootstrap,Backbone) {

    var recorder = Backbone.View.extend({



    // in case you want to create publisher before session
    createPublisher: function(){
      TB.setLogLevel(TB.NONE);                                                                                                
      //console.log('this elemennt',this.el);
      elem = $(this.el).find("#publisher")[0];
      // this does not work! it may affect archive id?
      //elem = document.querySelector("#publisher");
      this.publisher = TB.initPublisher(elem);
      console.log('this view',this.view);
      this.publisher.on("accessAllowed",function(){
         //this.set({ status: 'accepted'});
         console.log('access allowed');
         console.log('this publisher stream?');
      }.bind(this));
      this.publisher.on("destroyed",function(){
         console.log("publisher destroyed");
      });
    /*  this.meter = this.$("#meter");
       canvasContext = this.meter[0].getContext("2d");
            canvasContext.clearRect(0, 0, 25, 300);
            canvasContext.fillStyle = '#A4A4A4';
      var average = 100;
            canvasContext.fillRect(0,300-average,25,300);*/
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

    hostSession: function(data){
     

      TB.setLogLevel(TB.NONE);
      var session = TB.initSession(data.session);
      var publisher = TB.initPublisher(document.querySelector("#publisher"));
      this.sessionId = data.session;      

      console.log('connect apikey:',data.apiKey,'+ token:',data.token);
      session.connect(data.apiKey,data.token, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        session.publish(publisher);
      });

     //for some reason this stopped triggering...
    /* session.on('archiveStarted', function(event) {
          //this.archiveId = event.id;
          console.log("ARCHIVE STARTED");
         // this.clearInfo();
        //  this.model.trigger('recordStarted');
      });*/

      session.on('archiveStopped', function(event) {
	  //this.archiveId = null;
	  console.log("ARCHIVE STOPPED");
          //this.publisher.destroy();
         // this.session.disconnect();
          //this.model.trigger('recordStopped');
      });
      publisher.on("accessAllowed",this.requestRecording.bind(this));
      console.log('this is sesssion with handlers',this.session);

    },


    requestSessionPrePub: function(){
      console.log("start session pre pub");
      $.ajax({
        url: '/start-session',
        type: 'GET',
        success: function(data){ 
         console.log('success pre pub');
         this.hostSessionPrePub(data);
      }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
      });

    },

    hostSessionPrePub: function(data){
     
      // check stream here
      
      // init session
      console.log('host session pre pub');
      //this.setInfo("warning","Please, accept request to use camera and micro");
      this.session = TB.initSession(data.session);
      //this.publisher = TB.initPublisher(data.apiKey, document.querySelector("#publisher"));
      //this.publisher.on("accessAllowed",this.requestRecording.bind(this));
      this.sessionId = data.session;      

      this.session.connect(data.apiKey,data.token, function(err, info) {
        if(err) {
          console.log(err.message || err);
        }
        console.log("let's publish pre pub",this.publisher);
        this.session.publish(this.publisher);

        console.log("published!",this.publisher.stream);
        // we request recording on click button
        //this.requestRecording();
      }.bind(this));


      this.session.on('archiveStarted', function(event) {
          //this.archiveId = event.id;
          console.log("ARCHIVE STARTED");
          //this.clearInfo();
          //this.trigger('recordStarted');
      }.bind(this));

      this.session.on('archiveStopped', function(event) {
	  //this.archiveId = null;
	  console.log("ARCHIVE STOPPED");
          //this.publisher.destroy();
          this.session.disconnect();
          this.trigger('recordStopped');
      }.bind(this));
      console.log('done setting up session handlers',this.session);
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
           this.archiveId = data.id;
           console.log('success request start',data);
           this.clearInfo();
           this.trigger('recordStarted');
        }.bind(this),
      error: function(data) {
        alert('woops!'); //or whatever
      }
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
          this.trigger('recordStopped');
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




