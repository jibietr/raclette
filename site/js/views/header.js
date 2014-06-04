define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'app',
    "text!templates/textbar.html"],
function($,_,bootstrap,Backbone,app,Tmpl) {

    var HeaderView = Backbone.View.extend({

        template: _.template(Tmpl),

        initialize: function () {
            //_.bindAll(this);

            // Listen for session logged_in state changes and re-render
            app.session.on("change:logged_in", this.onLoginStatusChange.bind(this));
            app.session.on("change:status", this.render.bind(this));

        },

        
        events: {
            "click #logout-link" : "onLogoutClick",
            "click #remove-account-link" : "onRemoveAccountClick"
        },


      
        onLoginStatusChange: function(evt){
            console.log('HEADER LOGIN');
            this.render();
            //if(app.session.get("logged_in")) app.showAlert("Success!", "Logged in as "+app.session.user.get("username"), "alert-success");
            //else app.showAlert("See ya!", "Logged out successfully", "alert-success");
        },

      /*  onLogoutClick: function(evt) {
            evt.preventDefault();
            app.session.logout({});  // No callbacks needed b/c of session event listening
        },

        onRemoveAccountClick: function(evt){
            evt.preventDefault();
            app.session.removeAccount({});
        },*/


        render: function () {
            console.log("RENDER::", app.session.user.toJSON(), app.session.toJSON());
            this.$el.html(this.template());
            $('#nav_welcome').removeClass('active');
            $('#nav_setup').removeClass('active');
            $('#nav_test').removeClass('active');
            $('#nav_interview').removeClass('active');
            var status =  app.session.attributes.status;
            if(status=='finished') status = 'interview';
            if(status==='setup')  status = 'setup';
            if(status==='test')  status = 'test'; 
            if(status==='wait')  status = 'interview';
            if(status==='expired') status = 'interview';
            if(status==='intro') status= 'welcome';
            $('#nav_'+status).addClass('active');

            return this;
        }

    });

    return HeaderView;
});
