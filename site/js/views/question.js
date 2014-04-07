define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'views/chrono',
    'RecordRTC',
    'text!templates/question.html',
    'text!templates/video.html',
    'text!templates/start.html',
    'text!templates/wait.html',
    'text!templates/end.html',
    'text!templates/text.html'],
  function($,_,bootstrap,form,Backbone,ChronoView,recRTC,Tmpl_question,Tmpl_video,Tmpl_start,Tmpl_wait,Tmpl_end,Tmpl_text) {

    var questionView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      className: 'QuestionContainer',
      template_question: _.template(Tmpl_question),
      template_video: _.template(Tmpl_video),
      template_start: _.template(Tmpl_start),
      template_wait: _.template(Tmpl_wait),
      template_end: _.template(Tmpl_end),
      template_text:  _.template(Tmpl_text),
      

    events: {
       'click #start': 'stopWait',
       'click #stop': 'stopActive'
    }, 

    // render question and timer                                                                                    
    render: function() {

       this.question_type = this.model.get("type");
        // apply basic layout
        this.$el.html(this.template_question(this.model.toJSON()));
        // set up question
        this.$("#MainContainer").html(this["template_"+this.question_type](this.model.toJSON()));

       //this.$el.html(this.template_video());
        if(this.model.get('time_wait')){
          this.renderCountdown();
        }else{
          this.renderChrono();
        }
        return this;
    },

    renderCountdown: function(){
        var time = this.model.get('time_wait');
        this.chronoView = new ChronoView({ seconds: time , type: 'countdown' });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopWait);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    renderChrono: function(){
        var time = this.model.get('time_response');
        this.chronoView = new ChronoView({ seconds: time , type: 'normal'  });
        this.listenTo(this.chronoView, 'chrono_stop', this.stopActive);
        this.$("#ChronoContainer").html(this.chronoView.render().el);
     },

    stopWait: function(){
        this.chronoView.close();
        this.renderChrono();
        //if question is video type, then start recording
        if(this.question_type=="video"){
           this.startRecording();
        }

    },

    stopActive: function(){
        this.chronoView.close();
        if(this.question_type=="video"){
           this.stopRecording();
        }
        this.trigger('question_done');
    },


    startRecording: function(){  
      this.isFirefox = !!navigator.mozGetUserMedia;

      // fetch video player DOM element from jquery response
      this.preview = this.$("#camera-preview").get(0);
  
      navigator.getUserMedia({
            audio: true,
            video: true
        }, function(stream) {
            this.preview.src = window.URL.createObjectURL(stream);
            this.preview.play();
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
                    if (this.isFirefox) this.onStopRecording();
                });

                if (!this.isFirefox) {
                    this.recordVideo.stopRecording();
                    console.log(" from stop recording");
                    console.log(this.recordVideo);
                    this.onStopRecording();
                 }
    },

   onStopRecording: function() {
                    this.recordAudio.getDataURL(function(audioDataURL) {
                        if (!this.isFirefox) {
                            this.recordVideo.getDataURL(function(videoDataURL) {
                                this.postFiles(audioDataURL, videoDataURL);
                            }.bind(this));
                        } else this.postFiles(audioDataURL);
                    }.bind(this));
    },




    postFiles: function(audioDataURL, videoDataURL){

               fileName = "video_file_test";
                var files = { };

                files.audio = {
                    name: fileName + (this.isFirefox ? '.webm' : '.wav'),
                    type: this.isFirefox ? 'video/webm' : 'audio/wav',
                    contents: audioDataURL
                };

                if (!this.isFirefox) {
                    files.video = {
                        name: fileName + '.webm',
                        type: 'video/webm',
                        contents: videoDataURL
                    };
                }

                files.isFirefox = this.isFirefox;

                this.preview.src = '';
               // this.preview.poster = '/ajax-loader.gif';

                this.xhr('/upload_video', JSON.stringify(files), function(_fileName) {
                    var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
                    this.preview.src = href + 'uploads/' + _fileName;
                    this.preview.play();
                    
                    //var h2 = document.createElement('h2');
                    //h2.innerHTML = '<a href="' + this.cameraPreview.src + '">' + cameraPreview.src + '</a>';
                    //document.body.appendChild(h2);
                });

      },

      xhr: function(url, data, callback) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200) {
                        callback(request.responseText);
                    }
                }; 
                console.log(url);
                request.open('POST', url);
                request.send(data);
      }




       


    });
    //console.log("load QuestionView");
    return questionView;
});




