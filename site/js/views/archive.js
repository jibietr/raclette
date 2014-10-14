define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'collections/archive',
    'text!templates/fullarchive.html',
    'text!templates/archive_entry.html'],
  function($,_,bootstrap,Backbone,Archive,Tmpl,Tmpl_entry) {


    var archiveView  = Backbone.View.extend({
      id: 'archive-view',
      tagName: 'div',
      template: _.template(Tmpl),
      template_entry: _.template(Tmpl_entry),


    render: function() {
        console.log('render archive');
        this.collection = new Archive();
        this.collection.fetch({reset: true, //initialize collection from db
          success: function(collection,response){
            this.getEntries();
             
         }.bind(this), error: function(collection,response){
          // check error here interview expried?       
            console.log('failed',response); 
         }.bind(this)});

        // collection exists?
        //console.log('colection?',this.collection);
        // append each one of the models.


        return this;
    },

    getEntries: function(){
      this.$el.html( this.template());
      elem = this.$('#archive_entries');
      this.collection.each(function(entry) {
        console.log('log item.', entry.attributes);
       // elem.append(this.template_entry(entry.attributes));
        //this.getArchive(entry.attributes.content);
    }.bind(this));
    }





    });
    return archiveView;
});




