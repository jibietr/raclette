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


    startRecording: function(){  
      this.isFirefox = !!navigator.mozGetUserMedia;
      console.log("parent");
      console.log(this.el);
      // fetch video player DOM element from jquery response
      //this.preview = this.$("#camera-preview").get(0);
  
      navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
             
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
            alert(JSON.stringify(error));
        });
     
    },

    stopRecording: function(){
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




