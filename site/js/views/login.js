// not used! login class with user and pwd
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    'text!templates/login.html'
],
function($,_,bootstrap,Backbone,app,TmplLogin) {

    var loginView = Backbone.View.extend({

	tagName: 'div',
	id: 'login-view',
	template_login: _.template(TmplLogin),

	events: { 
            'click #login-btn': 'onLoginAttempt',
	}, 
	
	setInfo: function(message){
            this.clearInfo(); // clear classes if any 
            this.info.find("p").addClass('text-danger').text(message);
            this.info.addClass('bg-danger').removeClass('hidden');
	},
	
	clearInfo: function(){
            this.info.removeClass("bg-warning").removeClass("bg-danger").addClass("hidden");
            this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
	},

	// get login info
	onLoginAttempt: function(evt){
            if(evt) evt.preventDefault();
	    this.info = this.$("#InfoContainer");
            var code = $('#code').val(); // get code
            if(!code){ return this.setInfo('Please, introduce your code'); }
            app.session.login({
		username: code, // use code as username is passport
		password: 'x', // default pwd required by passport
            }, {
		success: function(mod, res){ // sucess login
		    this.clearInfo();
		}.bind(this),
		error: function(mod, res){ // error login
		    this.setInfo(mod.error.error);
		}.bind(this)
            });
	},

	render: function() {
            //console.log('Render log-view',app.session.user);
	    this.$el.html(this.template_login());
            return this;
	}
    });

    return loginView;
});




