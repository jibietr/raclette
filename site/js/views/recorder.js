define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'RecordRTC'],
  function($,_,bootstrap,form,Backbone,recRTC) {

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
                    if (this.isFirefox) this.onStopRecordingCallback();
                });

                if (!this.isFirefox) {
                    this.recordVideo.stopRecording();
                    console.log(" from stop recording");
                    console.log(this.recordVideo);
                    this.onStopRecordingCallback();
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
                //this.model.set("passedFromRecorder",true);
                //files.isFirefox = this.isFirefox;
                //this is what we are sending to post
                
                this.model.set({ audio: audioJSON, video: videoJSON});
                //console.log("save from postFIles");
                console.log("save model from recrder");
                this.model.trigger('video-data-ready');
                /*this.model.save(//{ audio: audioJSON, video: videoJSON},
			      { success: function(model,response){
				          // this.trigger('video-upload-success');
                         console.log(response);
				              } }
			          ); */

      }




    });
    //console.log("load QuestionView");
    return recorder;
});




