// Shows full video archive download links for a given user.
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
	    // fetch all exisiting entries in archive
            this.collection = new Archive();
            this.collection.fetch(
		{reset: true, //initialize collection from db
		 success: function(collection,response){
		     this.getEntries();
		 }.bind(this), error: function(collection,response){
		     // check error here interview expried?       
		     console.log('failed',response); 
		 }.bind(this)});
            return this;
	},
	
	getEntries: function(){
	    this.$el.html( this.template());
	    elem = this.$('#archive_entries');
	    this.collection.each(function(entry) {
		console.log('log item.', entry.attributes);
		//entry.attributes.title= 'default';
		elem.append(this.template_entry(entry.attributes));
	    }.bind(this));
	}
    });
    
    return archiveView;
});




