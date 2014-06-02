define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone,validation) {

    var user = Backbone.Model.extend({

        url: '/api/user',

        initialize: function(){
            //_.bindAll(this);
        
        },

        defaults: {
            id: 0,
            code: '',
            email: ''
        }


    });
    
    return user;
});
