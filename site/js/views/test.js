define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'views/question',
    'models/question',
    'views/archive',
    'text!templates/setup-1.html',
    'text!templates/setup-2.html',
    'text!templates/test.html',
    'text!templates/interexamples.html',    
    'text!templates/archive.html',
    'views/opentok_recorder',
    'app',
],
function($,_,bootstrap,Backbone,QuestionView,Question,ArchiveView,TmplSetup,TmplSetup2,TmplTest,TmplExamples,TmplArchive,Recorder,app) {
    
    var testView = Backbone.View.extend({
	id: 'test-view',
	tagName: 'div',
	template_setup: _.template(TmplSetup),
	template_setup2: _.template(TmplSetup2),
	template_test: _.template(TmplTest),
	template_examples: _.template(TmplExamples),
	template_archive: _.template(TmplArchive),

	events:{
	    'click #setup-done': 'startTest' ,
            'click #go-interview':'skip',
            'click #try-question': 'startTest' ,
            'click #try-again': 'startTest' ,
	},

	skip: function(){
	    this.trigger('test-done');
	    //this.progress.set({ status: 'interview'});
	},
	
	renderSetup2: function(){
            window.scrollTo(0,0);
            this.$el.html(this.template_setup2());
            elem = $(this.el).find("#opentok_container")[0];
	    console.log('render setup 2',elem);
	    app.Recorder = new Recorder({ el: elem} );
	    //this.Recorder.setAttrs({ el: elem });
            app.Recorder.createPublisher();
	    return this;
	},

	renderSetup: function(tempName) {
            window.scrollTo(0,0);
            this.$el.html(this.template_setup());
            return this;
	},

	renderExamples: function(tempName) {
            window.scrollTo(0,0);
            this.$el.html(this.template_examples());
            return this;
	},
	
	// render question and timer                                                                                    

	render: function(tempName) {
            window.scrollTo(0,0);
            this.$el.html(this.template_test());
            return this;
	},

    // call before start test
    setRecorder: function(recorder){
      this.Recorder = recorder;
    },

    startTest: function(recorder){
       // remove if they exists (multiple tests)
	//this.Recorder.$el.detach();   
	//this.render('test');
	this.$el.html(this.template_test());

	console.log('start test');
     if(this.test_question) delete this.test_question;
       if(this.QuestionView){ 
           this.questionView.remove();
           delete this.questionView;
       } 
       // remove archive view if any
       $(this.el).find("#playback").empty();
       $(this.el).find("#info-continue").addClass('hidden');
       $(this.el).find("#try-again").removeClass('hidden');
       $(this.el).find("#try-question").addClass('hidden');
       

       this.test_question = new Question();
       this.test_question.set({ test: true, title: 'Could you introduce yourself, please?', time_response: '240', time_wait: '60', qtype: 'video', qid: '0' });
       //this.opentokView.render();
       this.questionView = new QuestionView({
         model: this.test_question
       });
       // attach question 
       elem = $(this.el).find("#test_question")[0];
       this.questionView.$el.appendTo(elem); 
       this.questionView.render();             
       // connect and render recorder                                                                                
	console.log('setup recorder',app.Recorder);
       this.questionView.setRecorder(app.Recorder);
       this.listenTo(this.test_question,'question-done',this.renderArchive);
    },


    renderArchive: function(){
      //need to request access to a video using S3
      console.log('SHOW VIDEO',this.test_question);
      // remove question view      
      app.Recorder.$el.detach();
      this.questionView.remove();
      //this.archiveView = new ArchiveView();
      //.console.log('playback element',$(this.el).find("#playback")[0]);  
      // render template
      $(this.el).find("#playback").html(this.template_archive());
      this.info = this.$("#InfoContainer");
      // model was udpated after save, so add .S
      var archiveId = this.test_question.get('content').S;
      this.setInfo('info',"Wait while we play back the video");    
      this.tryCount =  0;
      this.retryLimit = 3;
      setTimeout(function(){ this.getArchive(archiveId) }.bind(this), 5000);

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
    },


    playbackVideo: function(url){
        // hide ajax loader
        $(this.el).find("#info-continue").removeClass('hidden');
        $(this.el).find('img').addClass('hidden');
        this.clearInfo();    
        elem = $(this.el).find('#playback').append('<video width="320" height="240" controls autoplay></video>');
        //url = "https://s3-eu-west-1.amazonaws.com/opentok-videos/44757122/b3c3463f-1040-4eb2-9e28-8575b4309d36/archive.mp4?AWSAccessKeyId=AKIAJYTQW3FHLXSOSKOA&Expires=1401619994&Signature=0cnmPEn6vOolT5qfVo4l73lD%2Fxk%3D";
        console.log('play this url',url);
        console.log('archive tag', $(this.el).find('video'));
        elem = $(this.el).find('video').append('<source src="'+ url + '" type="video/mp4">');

    },


    getArchive: function(archiveId){
      $.ajax({
       url: '/get-archive/' + archiveId,
       type: 'GET',
       contentType: 'application/json',
       success: function(data){
          console.log('got archive',data);
          if('error' in data){
            if (data.error =='NotFound') {
               this.tryCount++;
               if(this.tryCount<this.retryLimit) setTimeout(function(){ this.getArchive() }.bind(this), 5000);
               else this.setInfo('warning','Ooops, something went wrong!');
            }
          }else{
          //this.renderArchive(data.url);
            this.url = data.url;
            this.playbackVideo(this.url);
         }
      }.bind(this),
        error : function(error) {
          console.log('error',error);
      }
      });
    },




   });

    console.log("load testView");
    return testView;
});




