
var app = app || {};

app.VideoQuestion = Backbone.Model.extend({
    defaults: {
        poster: 'img/screen-record.gif',
        title: 'No title',
        status: 'uncompleted',
        video: 'Unknown',
        qid: 'Unkown',
    }

   /* parse: function( response ) {
	response.id = response._id;
	return response;
    }*/
});
