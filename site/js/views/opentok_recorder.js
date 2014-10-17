// main view using opentok
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/opentok.html',
    'tbjs' // caution: do not declare TB obj as it is already available

], 
function($,_,bootstrap,Backbone,TmplOpentok) 
{

    var recorder = Backbone.View.extend({

	template_opentok: _.template(TmplOpentok), 

        defaults: {
            archiveId: null,
            sessionId: null,
            accessAllowed: false
        },

	setAttrs: function(attrs){
	    console.log('set recorder args',attrs);
	    this.el = attrs.el;
	},

	// render opentok container & publish 
	render: function() {
            this.$el.html(this.template_opentok());
	    this.createPublisher();
            return this;
	},
	
	// in case you want to create publisher before session
	createPublisher: function(){
	    // init publisher
	    elem = $(this.el).find('#publisher')[0];      
	    this.publisher = OT.initPublisher(elem);
	    console.log('this view',this.view);
	    // when given webcam access 
	    this.publisher.on("accessAllowed",function(){
		this.accessAllowed = true;
	    }.bind(this));
	    // throw error if publisher ever gets destroy
	    this.publisher.on("destroyed",function(event){
		console.log("DESTROYED!!!"); 
	    });
	    this.publisher.on("streamDestroyed",function(event){
		console.log("AVOID DESTROYING??"); 
		event.preventDefault();
	    });
	},

	// returns accessAllowed
	hasStarted: function(){
	    return this.accessAllowed;
	},

	// record video using opentok 
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

	// stop archive
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

	// this is the function being used to set up opentok session
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
	    this.setinfo("warning","Please, accept request to use camera and micro");
	    // init session from data received from server
	    this.session = OT.initSession(data.session);
	    // init publisher
	    this.publisher = OT.initPublisher(data.apiKey, document.querySelector("#publisher"));

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
	    OT.setLogLevel(OT.NONE);
	    // init session
	    //console.log(
	    this.session = OT.initSession(data.apiKey,data.session);
	    this.sessionId = data.session;      
	    this.tokenId = data.token;
	    // set up session handlers
	    // to archive
	    this.session.on('archiveStarted', function(event) {
		this.archiveId = event.id;
		console.log('ARCHIVE STARTED');
		this.clearInfo();
		this.trigger('recordStarted');
	    }.bind(this));
	    // to stop archive
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
	    // in case of being destroyed...
	    this.session.on('streamDestroyed', function(event) {
		console.log('prevent destroyed?');
		event.preventDefault()
	    }.bind(this));
	},

	getArchiveId: function(){
	    return(this.archiveId);
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
    
    return recorder;
});




