define([
    'jquery',
    'underscore',
    'backbone'],//use models/user for username/pwd
  function($,_,Backbone,User) {

    var progress = Backbone.Model.extend({

        defaults: {
            status: 'init',
        },


    });
    
    return progress;
});

