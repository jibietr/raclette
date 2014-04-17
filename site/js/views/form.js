define([
    'jquery',
    'underscore',
    'bootstrap',
    'jquery.form',
    'backbone',
    'text!templates/form.html',
    'text!templates/countries.html',
    'text!templates/degrees.html',
    'text!templates/status.html',
    'text!templates/open_positions.html',
    'models/applicant',
    'models/file',
    'jquery.iframe',
    'selectize',
    'backbone-validation',
    'jquery.serializeObject',
    's3upload'],
  function($,_,bootstrap,form,Backbone,TmplForm,TmplCountry,TmplDegree,TmplStatus,TmplOpen,Applicant,File,itrans,selectize,validation,serialize,s3upload) {

    // these are nested views..
    // http://codehustler.org/blog/rendering-nested-views-backbone-js/
    _.extend(Backbone.Validation.callbacks, {
    valid: function (view, attr, selector) {
        var $el = view.$('[name=' + attr + ']'), 
            $group = $el.closest('.form-group');
        
        $group.removeClass('has-error');
        $group.find('.help-block').html('').addClass('hidden');
    },
    invalid: function (view, attr, error, selector) { 
        var $el = view.$('[name=' + attr + ']'), 
            $group = $el.closest('.form-group');
     
        $group.addClass('has-error');
        $group.find('.help-block').html(error).removeClass('hidden');
    } 
   });




    var NestedView = Backbone.View.extend({
      
        // now way to pass uncompiled text to initialize
        // let's directly pass the compiled version        
        initialize: function(compTmpl){

          this.template = compTmpl;
        },

        render: function() {
         this.$el.html(this.template());
          return this;
       }
    });


    var BaseView = Backbone.View.extend({
      id: 'sample-page',
      tagName: 'div',
      className: 'ApplicantForm',
      template: _.template(TmplForm),
      //template_country: _.template(Country),

  /*  initialize: function(){
         this.model = new Applicant();
            Backbone.Validation.bind(this);
       console.log("hello");
 
    },*/
   
     renderNested: function( view, selector ) {
        var $element = ( selector instanceof $ ) ? selector : this.$el.find( selector );
        view.setElement( $element ).render();
    },

    events: {
       'hidden.bs.collapse': 'set_hidden_glyph',
       'show.bs.collapse': 'set_show_glyph',
       'click #submit':'submit'
    },

      set_hidden_glyph: function(e){
        $(e.target).prev().find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
      },

      set_show_glyph: function(e){
       $(e.target).prev().find("span").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
      },


      submit: function(e){

       
       e.preventDefault();
      
       // use serialize object to get form data
       var formData = $('#addUser').serializeObject();
       
       // jquery does not include file type. let's get them directly     

       
       $('[type=file]').each(function(i,el){
         formData[el.name] = $(el)[0].value;
       });

       //if('positions' in formData){
       var positions = [];
       
       // positions is not in formData unless it has at least one element
       // this seems to be an issue with selectize.js
       // so we need to check that exists
       if('positions' in formData){ 
        if( typeof formData['positions'] === 'string' ) {
          positions.push(formData['positions']);
       }else{
         formData['positions'].forEach(function(entity){
            positions.push(entity);
         });
       }}
       formData['positions'] = positions;
       //console.log(formData);

       // validates model
       // 
       this.model.save(formData,{
         success: function(model,response) { 
           console.log("success"); 
           console.log(model);
           this.uploadFiles(model);
         }.bind(this),
           error: function(model,response){ 
           console.log("error"); 
           this.trigger('form-submitted','error');//,'Ooops! Something ;
         }.bind(this)}
       );

     
      },

      // this is going to do a second check...
      uploadFiles: function(model){
      
       console.log("upload files using this model",model);
       var id = model.get("_id");
       fileData = { 
          resume: "resume_" + id +  ".pdf", 
          cover_letter: "cover_letter_" + id + ".pdf" 
       };
       var file = new File();
       file.save(fileData,{iframe: true,
                              files: $('form :file'),
                              data: fileData,
                              success: function(model,response) { 
                                   console.log("success"); 
                                   //console.log(model);
                                   this.trigger('form-submitted','success')//,'Submitted!');
                               }.bind(this),
                              error: function(model,response){ 
                                   console.log("error"); 
                                   this.trigger('form-submitted','error');//,'Ooops! Something ;
                              }.bind(this)});


      }

    /*  renderEnd: function(message){
        $(this.el).html("<p>"+message+"</p>");
        return this;
     }*/




    });


    var customView = BaseView.extend({

	initialize: function() {
            this.nationView = new NestedView(_.template(TmplCountry));
	    this.countryView = new NestedView(_.template(TmplCountry));
	    this.degreeView = new NestedView(_.template(TmplDegree));
	    this.statusView = new NestedView(_.template(TmplStatus));
            this.positionsView = new NestedView(_.template(TmplOpen));

            this.model = new Applicant();
            Backbone.Validation.bind(this);
/*, {
      valid: function(view, attr) {
        console.log("model is valid");

      },
      invalid: function(view, attr, error) {
        console.log("model is invalid");
        console.log(attr);
             }}
            );*/
            console.log("backbone validation binding");

	},

	render: function() {
	    this.$el.html( this.template() );
	    this.renderNested( this.nationView, '#nationality' );
            this.renderNested( this.countryView, '#country' );
            this.renderNested( this.degreeView, '#degree' );            
            this.renderNested( this.statusView, '#status' );
            this.renderNested( this.positionsView, '#positions' );
            // initialize select from array?            
	    return this;
	}
    });

    return customView;
});




