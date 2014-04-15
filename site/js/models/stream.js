define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {

    // this is a silly model that must
    // be initialized with the same attributes 
    // needed to display the template determined by 
    // type
    var stream = Backbone.Model.extend({

     url: '/api/upload_video',

     postFiles: function(audioDataURL, videoDataURL){
                //fileName = "video_file_test";
                var files = { };
                isFirefox = false;
                audioJSON = {
                    //extension: fileName + (this.isFirefox ? '.webm' : '.wav'),
                    type: this.isFirefox ? 'video/webm' : 'audio/wav',
                    contents: audioDataURL
                };

                if (!isFirefox) {
                    videoJSON = {
                        //extension: me + '.webm',
                        type: 'video/webm',
                        contents: videoDataURL
                    };
                }

                //files.isFirefox = this.isFirefox;
                //this is what we are sending to post
                console.log("start saving");

                this.save({ audio: audioJSON, video: videoJSON},
		    { success: function(model,response){
		         this.trigger('video-upload-success');
                         console.log(response);
	            }.bind(this) }

	        );

      }




      
    });

    return stream;

});
   
