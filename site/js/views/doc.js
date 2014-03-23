

var app = app || {};

app.Doc = Backbone.View.extend({
    tagName: 'div',
    className: 'DocContainer',
    template: _.template( $( '#DocTemplate' ).html() ),

    render: function() {
        //this.el is what we defined in tagName. use $el to get access to jQuery html() function
        this.$el.html( this.template( this.model.toJSON() ) );

        return this;
    }
});
