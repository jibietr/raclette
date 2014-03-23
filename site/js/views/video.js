

var app = app || {};

app.VideoQuestionView = Backbone.View.extend({
    tagName: 'div',
    className: 'VideoQuestionContainer',
    template: _.template( $( '#VideoQuestionTemplate' ).html() ),

    render: function() {
        //this.el is what we defined in tagName. use $el to get access to jQuery html() function
        this.$el.html( this.template( this.model.toJSON() ) );

        return this;
    }
});
