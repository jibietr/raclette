

// define app as an empty object if it's not already defined
var app = app || {};

app.ApplicationView = Backbone.View.extend({
   
    el: '#application',

    initialize: function(questions)  {
        console.log("initialize application view");
        //this.doc_collection = new app.SupportingDocs(docs);
        this.video_collection = new app.VideoQuestionnaire( questions );
        //this.collection.fetch({reset: true}); // NEW
        this.render();
        //this.listenTo( this.collection, 'add', this.renderBook );
        //this.listenTo( this.collection, 'reset', this.render ); // NEW
    },

  
    // render library by rendering each book in its collection
    render: function() {
        //this.doc_collection.each(function( item ) {
        //    this.renderDoc( item );
        //}, this );
        this.video_collection.each(function( item ) {
            this.renderVideoQuestion( item );
        }, this );
    },

     // render a book by creating a BookView and appending the
    // element it renders to the library's element
    renderVideoQuestion: function( item ) {
        var videoQuestionView = new app.VideoQuestionView({
            model: item
        });
        this.$el.append(videoQuestionView.render().el );
    },

    renderDoc: function( item ) {
        var renderDoc = new app.DocView({
            model: item
        });
        this.$el.append(DocView.render().el );
    }
});

