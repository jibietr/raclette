define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'RecordRTC',
    'aws-sdk',],
  function($,_,bootstrap,form,Backbone,recRTC,aws) {

    var recorder = Backbone.View.extend({


    // we could do this in initialization ...   
    setInfoPanel: function(el){
       this.info = el;
    },

    setInfo: function(type){
      this.clearInfo(); // clear classes if any
      if(type=="request"){  
        this.info.find("p").addClass('text-warning').text("Please accept access to webcam and microphone.");
        this.info.addClass('bg-warning').removeClass('hidden');
      }else if(type=="error"){

        this.info.find("p").addClass('text-danger').text("Oops! You denied access to your webcam.");
        this.info.addClass('bg-danger').removeClass('hidden');
      }else if(type=="uploading"){
        this.info.find("p").addClass('text-info').text("Wait while we upload the video.");
        this.info.addClass('bg-info').removeClass('hidden');

      }
    },

    clearInfo: function(){
       this.info.removeClass("bg-warning").removeClass("bg-danger").addClass("hidden");
       this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
    },


    startRecording: function(){  
      console.log("start recording");
      this.setInfo("request");
      this.isFirefox = !!navigator.mozGetUserMedia;

      navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {

            // this is executed on accepted
            this.clearInfo();          
            // thrigger getusermedia-ready to start chrono
            this.trigger("getUserMedia-ready");
            this.el.src = window.URL.createObjectURL(stream);
            this.el.play();
            // RecordRTC is defined in RecordRTC.js
            // make sure that requirejs reference for RecordRTC is diff e.g. recRTC

            this.recordAudio = RecordRTC(stream, {
                bufferSize: 16384
            });
            if (!this.isFirefox) {
                this.recordVideo = RecordRTC(stream, {
                    type: 'video'
                });
            }
            this.recordAudio.startRecording();
            if (!this.isFirefox) {
                this.recordVideo.startRecording();
                console.log("this is the recordVideo");
                console.log(this.recordVideo);
            }
        }.bind(this), function(error) {
            // 
            this.setInfo("error",error);
        }.bind(this));
     
    },

    stopRecording: function(){
         this.setInfo("uploading");
         console.log("stop rec");
                this.recordAudio.stopRecording(function() {
                    if (this.isFirefox) this.getBlobOnStopRecordingCallback();
                });
                // if !isFirefox, we have to stop the two channels
                if (!this.isFirefox) {
                    this.recordVideo.stopRecording();
                    //this.getBlobOnStopRecordingCallback();
                    this.uploadRecording();
                }
    },


   onStopRecordingCallback: function() {
                    this.recordAudio.getDataURL(function(audioDataURL) {
                        if (!this.isFirefox) {
                            this.recordVideo.getDataURL(function(videoDataURL) {
                                this.el.src = '';
                                this.el.poster = 'img/ajax-loader.gif';
                                this.postFilesCallback(audioDataURL,videoDataURL);
                            }.bind(this));
                        } else this.postFilesCallback(audioDataURL);
                    }.bind(this));
    },


    getBlobOnStopRecordingCallback: function() {
      // Get Blob is not asyncrhounous
      if(!this.isFirefox){
         audioBlob = this.recordAudio.getBlob();
         videoBlob = this.recordVideo.getBlob();
         this.el.src = '';                                                                                 
         this.el.poster = 'img/ajax-loader.gif';                                                           
         this.postBlobsCallback(audioBlob,videoBlob);

      }else{                
         audioBlob = this.recordAudio.getBlob();         
         this.postBlobsCallback(audioBlob,videoBlob);
      }
    },

    postFilesCallback: function(audioDataURL, videoDataURL){
                //fileName = "video_file_test";
                var files = { };
                isFirefox = false;
                audioJSON = {
                    extension: (this.isFirefox ? 'webm' : 'wav'),
                    type: this.isFirefox ? 'video/webm' : 'audio/wav',
                    contents: audioDataURL
                };
                if (!isFirefox) {
                    videoJSON = {
                        extension: 'webm',
                        type: 'video/webm',
                        contents: videoDataURL
                    };
                }
                this.model.set({ audio: audioJSON, video: videoJSON});
                //console.log("save from postFIles");
                console.log("save model from recrder");
                this.model.trigger('video-data-ready');

    },

    uploadRecording: function(){
      // request credentials
      $.get("api/getSTS",function(response) {
        console.log(response);
        credentials = response.Credentials;
        this.model.uploadId = response.uploadId;
        
        if(!this.isFirefox){
           this.el.src = '';                                                                                 
           this.el.poster = 'img/ajax-loader.gif';
           this.numObjToUpload = 2;
           this.numObjUploaded = 0;

           this.uploadBlobToS3("audio",credentials);
           this.uploadBlobToS3("video",credentials);
        }else{                
           //audioBlob = this.recordAudio.getBlob();         
           //this.postBlobsCallback(audioBlob,videoBlob);
        }
     }.bind(this));

    },
      


    uploadBlobToS3: function(type,cred){
      console.log("Upload type",type);
      // update AWS with teemporary credentials
      console.log(cred.AccessKeyId);
      console.log(cred.SecretAccessKey);
      AWS.config.update({
         accessKeyId: cred.AccessKeyId,
         secretAccessKey: cred.SecretAccessKey });
      AWS.config.update({region: 'eu-west-1'});

      var s3 = new AWS.S3();
      if(type=="audio"){
        upload_key = this.model.uploadId + ".wav";
        content_type = "audio/wav";
        blob = this.recordAudio.getBlob();
      }else{
        upload_key = this.model.uploadId + ".webm";
        content_type = "video/webm";
        blob = this.recordVideo.getBlob();
      }
      //console.log(Blob);
      var params = {
                  Bucket: "raclette-assets/videos/",
                  Key: upload_key,
                  Body: blob,
                  ACL: 'private',
                  ContentType: content_type,
      }; 
      console.log(params);
      console.log("obj to pupload",this.numObjToUpload);
      s3.putObject(params,function(err,data){
       console.log("err",err);
       console.log("data",data);
       this.numObjUploaded = this.numObjUploaded + 1;
       console.log(this.numObjToUpload);
       console.log(this.numObjUploaded);
       if(this.numObjUploaded == this.numObjToUpload){
            console.log("trigger video-data-ready");
	   this.model.trigger('video-data-ready');
       }}.bind(this));
    }



    });
    //console.log("load QuestionView");
    return recorder;
});




