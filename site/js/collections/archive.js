define([
    'jquery',
    'underscore',
    'backbone',
    'models/archive_entry'],
  function($,_,Backbone,archive_entry) {

    var questionnaire = Backbone.Collection.extend({
      model: archive_entry,  
      url: '/api/archive', 

      defaults: {
            user_id: ''
      },

        initialize: function(id){
            this.user_id = id;
        }


      /*initialize: function(){
         console.log("init collection");
      }*/

    });

    
    
   return questionnaire;


});
