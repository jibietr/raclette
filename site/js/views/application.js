
define([
    'jquery',
    'underscore',
    'backbone',
    'models/applicant',
    'views/form'],
 
  function($,_,Backbone,Applicant,FormView) {

    var applicationView = Backbone.View.extend({
    
      el: '#application',
 
      initialize: function()  {
        console.log("initialize application view");
        //this.doc_collection = new app.SupportingDocs(docs);
        //this.applicant = new Applicant();
        //this.video_collection = new app.VideoQuestionnaire( questions );
        //this.collection.fetch({reset: true}); // NEW
        this.render();
        //this.listenTo( this.collection, 'add', this.renderBook );
        //this.listenTo( this.collection, 'reset', this.render ); // NEW
      },

      // render library by rendering each book in its collection
      render: function() {
        formView = new FormView(); 
        this.$el.append(formView.render().el);
      }
    });
  
    return applicationView;
 
});

