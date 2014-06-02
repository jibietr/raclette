define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/fullarchive.html',
    'text!templates/archive_entry.html'],
  function($,_,bootstrap,Backbone,Tmpl,Tmpl_entry) {


    var archiveView  = Backbone.View.extend({
      id: 'archive-view',
      tagName: 'div',
      template: _.template(Tmpl),
      template_entry: _.template(Tmpl_entry),
         
    render: function() {
        this.$el.html( this.template());
        // collection exists?
        console.log('colection?',this.collection);
        // append each one of the models.
        elem = this.$('#archive_entries');
        this.collection.each(function(entry) {
           console.log('log item.', entry.attributes);

           elem.append(this.template_entry(entry.attributes));
        }.bind(this));

        return this;
    }



    });
    return archiveView;
});




