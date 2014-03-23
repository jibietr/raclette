
var app = app || {};

app.Doc = Backbone.Model.extend({
    defaults: {
        file: 'Unknown',
        type: 'Unknown'      
    }

   /* parse: function( response ) {
	response.id = response._id;
	return response;
    }*/
});
