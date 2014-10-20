define([
    'jquery',
    'underscore',
    'backbone',
    'app', // required for params
    'backbone-validation',
    'models/user_code'],//use models/user for username/pwd
  function($,_,Backbone,app,alidation,User) {

    var session = Backbone.Model.extend({


        // Initialize with negative/empty defaults
        // These will be overriden after the initial checkAuth
        defaults: {
            logged_in: false,
            user_id: '',
            status: ''
        },

        initialize: function(){
            //_.bindAll(this,'postAuth');
	    console.log('init session');
            // Singleton user object
            // Access or listen on this throughout any module with app.session.user
            this.user = new User({ });
        },

        url: function(){
            return app.API + '/auth';
        },

        // Fxn to update user attributes after recieving API response
        updateSessionUser: function( userData ){
            console.log("Update user",userData);
            this.user.set( _.pick( userData, _.keys(this.user.defaults) ) );
        },

        /*
         * Check for session from API 
         * The API will parse client cookies using its secret token
         * and return a user object if authenticated
         */
        checkAuth: function(callback, args) {
            console.log("Check auth: check for session from API using fetch",app.API);
            console.log(this);
            var self = this;
            
            this.fetch({  // Check if there are tokens in localstorage
                success: function(mod, res){
                    if(!res.error && res.user){
                        self.updateSessionUser( res.user );
                        self.set({ logged_in : true });
                        console.log("Success auth:",res.user);
                        if('success' in callback) callback.success(mod, res);    
                    } else {
                        self.set({ logged_in : false });
                        console.log("Error from auth:",res.error);
                        if('error' in callback) callback.error(mod, res);    
                    }
                }, error:function(mod, res){
                    // api call did not succeed. set up logged_in to false
                    console.log("API call did not succeed. Set up logged_in to false");
                    self.set({ logged_in : false });
                    if('error' in callback) callback.error(mod, res);    
                }
            }).complete( function(){
                if('complete' in callback) callback.complete();
            });
        },


        /*
         * Abstracted fxn to make a POST request to the auth endpoint
         * This takes care of the CSRF header for security, as well as
         * updating the user and session after receiving an API response
         */
        postAuth: function(opts, callback, args){
            var self = this;
            var postData = _.omit(opts, 'method');
            $.ajax({
                url: this.url() + '/' + opts.method,
                contentType: 'application/json',
                dataType: 'json',
                type: 'POST',
                beforeSend: function(xhr) {
                    // Set the CSRF Token in the header for security
                    var token = $('meta[name="csrf-token"]').attr('content');
                    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
                },
                data:  JSON.stringify( _.omit(opts, 'method') ),
                success: function(res){

                    if( !res.error ){
                        if(_.indexOf(['login', 'signup'], opts.method) !== -1){

                            self.updateSessionUser( res.user || {} );
                            self.set({ logged_in: true });
                            //self.set({ user_id: res.user.id, logged_in: true });
                        } else {

                            self.set({ logged_in: false });
                        }

                        if( callback && 'success' in callback ) callback.success(res);
                    } else {
                        if( callback && 'error' in callback ) callback.error(res);
                    }
                },
                error: function(mod, res){
                    if(callback && 'error' in callback ) callback.error(res);
                }
            }).complete( function(){
                if(callback && 'complete' in callback ) callback.complete(res);
            });
        },


        login: function(opts, callback, args){
            console.log('login',this.url());
            this.postAuth(_.extend(opts, { method: 'login' }), callback);
        },

        logout: function(opts, callback, args){
            this.postAuth(_.extend(opts, { method: 'logout' }), callback);
        },

        signup: function(opts, callback, args){
            this.postAuth(_.extend(opts, { method: 'signup' }), callback);
        },

        /*removeAccount: function(opts, callback, args){
            this.postAuth(_.extend(opts, { method: 'remove_account' }), callback);
        }*/

    });
    
    return session;
});

