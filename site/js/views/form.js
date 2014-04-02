define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'text!templates/form.html',
    'models/applicant'],
  function($,_,bootstrap,form,Backbone,Tmpl,Applicant) {

    var formView = Backbone.View.extend({
      id: 'sample-page',
      tagName: 'div',
      className: 'ApplicantForm',
      template: _.template(Tmpl),

     
      events: {
       'hidden.bs.collapse': 'set_hidden_glyph',
       'show.bs.collapse': 'set_show_glyph',
       //'click #submit':'submit',
      },

      render: function() {
        $(this.el).html(this.template());

        return this;
      },

     set_hidden_glyph: function(e){

       $(e.target).prev().find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    
    },

    set_show_glyph: function(e){

       $(e.target).prev().find("span").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
     },


     submit: function(e){

       e.preventDefault();
       var formData = {};
       console.log("submit form");
       // read form...
       $('.form-group').children( 'input' ).each( function( i, el ) {
        if( $( el ).val() != '' )
        {
            formData[ el.id ] = $( el ).val();

        }
       });


       this.applicant = new Applicant();
       this.applicant.save(formData,
       { error: function() {
          console.log("error save");
        },
        success: function () {
         console.log("succsess save");
       }
      });

       // first init messages to nothing
       $('.field-validation').each(function(i,el){
          $(el).text('');
       });

       
       for (var error in this.applicant.errors){
         var msg = this.$('[data-msg=\''+ error +'\']');
         msg.text(this.applicant.errors[error]);

       }


     
     }  

    });
    console.log("load form");
    return formView;
});




