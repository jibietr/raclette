// Shows a test question for training purposes.
// Allows video recording and watching multiple times.
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'views/question',
    'models/question',
    'text!templates/test.html',
    'text!templates/archive.html',
    'views/opentok_recorder',
    'app',
],
function($,_,bootstrap,Backbone,QuestionView,Question,TmplTest,TmplArchive,Recorder,app) {
    
    var testView = Backbone.View.extend({

	id: 'test-view',
	tagName: 'div',
	template_test: _.template(TmplTest),
	template_archive: _.template(TmplArchive),

	events:{
            'click #go-interview':'skip',
            'click #try-question': 'startTest' ,
            'click #try-again': 'startTest' ,
	},

	skip: function(){
	    this.trigger('test-done');
	},
	
	// render question and timer                                                                                    
	render: function(tempName) {
            window.scrollTo(0,0);
            this.$el.html(this.template_test());
            return this;
	},

	startTest: function(recorder){
	    // i dont' think we need to render this again....
	    // this.$el.html(this.template_test());
	    // delete previous test if any
	    if(this.test_question) delete this.test_question;
	    if(this.QuestionView){ 
		this.questionView.remove();
		delete this.questionView;
	    } 
	    // remove archive view if any
	    // TODO: some browsers had issues and showed multiple players...
	    $(this.el).find("#playback").empty();
	    $(this.el).find("#info-continue").addClass('hidden');
	    $(this.el).find("#try-again").removeClass('hidden');
	    $(this.el).find("#try-question").addClass('hidden');
	    // create test question
	    this.test_question = new Question();
	    this.test_question.set({ test: true,
              title: 'Could you introduce yourself, please?',
              time_response: '240', time_wait: '60', qtype: 'video', qid: '0' });
	    // init question view
	    this.questionView = new QuestionView({
		model: this.test_question
	    });
	    // attach questionView to main view
	    elem = $(this.el).find("#test_question")[0];
	    this.questionView.$el.appendTo(elem).render();             
	    // connect and render recorder                                                                                
	    console.log('setup recorder',app.Recorder);
	    // TODO: can this directly be done through app instead of setRecorder?
	    this.questionView.setRecorder(app.Recorder); 
	    // link event to model so it is cleaned if model is deleted
	    this.listenTo(this.test_question,'question-done',this.renderArchive);
	},

	renderArchive: function(){
	    //need to request access to a video using S3
	    //console.log('SHOW VIDEO',this.test_question);
	    // remove question view      
	    app.Recorder.$el.detach();
	    // remove question view...
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

	// set player 
	// TODO: shall i use a specific HTML5 video player?
	playbackVideo: function(url){
            $(this.el).find("#info-continue").removeClass('hidden');
            $(this.el).find('img').addClass('hidden');
        this.clearInfo();    
            elem = $(this.el).find('#playback').append('<video width="320" height="240" controls autoplay></video>');
            elem = $(this.el).find('video').append('<source src="'+ url + '" type="video/mp4">');
	},

	// ajax request to server to get archive URL
	getArchive: function(archiveId){
	    $.ajax({
		url: '/get-archive/' + archiveId,
		type: 'GET',
		contentType: 'application/json',
		success: function(data){
		    // TODO: we should now that are the actual possible errors...
		    if('error' in data){
			if (data.error =='NotFound') {
			    this.tryCount++;
			    if(this.tryCount<this.retryLimit){
				setTimeout(function(){ this.getArchive() }.bind(this), 5000);
			    }else{
				this.setInfo('warning','Ooops, something went wrong!');
			    }
			}
		    }else{// success
			this.url = data.url;
			this.playbackVideo(this.url);
		    }
		}.bind(this),
		error : function(error) {
		    console.log('error',error);
		}
	    });
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
    });

    return testView;
});




