
var app = app || {};

app.Candidate = Backbone.Model.extend({
    defaults: {
        name: 'Unknown',
        photo: 'img/chiken.png',
        joined: 'Unknown'   
    }
});
