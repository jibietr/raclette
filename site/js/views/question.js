define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'text!templates/video.html',
    'text!templates/unknown.html'],
  function($,_,bootstrap,form,Backbone,Tmpl_video,Tmpl_unknown) {

    var questionView = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      className: 'QuestionContainer',
      template_video: _.template(Tmpl_video),
      template_unknown:  _.template(Tmpl_unknown),

      events: {
       'click #submit':'submit',
      },

    //tagName: 'div',
    //className: 'questionContainer',
    //template: _.template( $( '#questionTemplate' ).html() ),

    // render question renders the template                                                                                      
    render: function() {
        //this.el is what we defined in tagName. use $el to get access to jQuery html() function                                 
        //console.log("question type" + this.model.type);
        var type = this.model.get("type");
        //console.log(this.template);
        //console.log(this["template_"+type])
        //console.log(this.template_video());
        //this.$el.html( this.template_video(this.model.toJSON()));
        //this.$el.html(this.template_video());
        $(this.el).html(this.template_video()); 
        return this;
    }



    });
    //console.log("load QuestionView");
    return questionView;
});




