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
    'jquery.iframe',
    'selectize',
    'backbone-validation',
    'jquery.serializeObject',
    's3upload'],
  function($,_,bootstrap,form,Backbone,TmplForm,TmplCountry,TmplDegree,TmplStatus,TmplOpen,Applicant,itrans,selectize,validation,serialize,s3upload) {

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




      /*render: function() {
        $(this.el).html(this.template());
        return this;
      },*/

      set_hidden_glyph: function(e){
        $(e.target).prev().find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
      },

      set_show_glyph: function(e){
       $(e.target).prev().find("span").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
      },


     updateUploadCount: function(file_id,file_url){
         console.log("response for " + file_id);
         this.formData[file_id] = file_url;
         this.num_uploads++;
         if(this.num_uploads==2){
            console.log("done with uploads");
            this.saveModel();
         }
      },  

     s3upload: function(file_id){
          console.log("create s3");
	  var s3upload = new S3Upload({
	      //file_dom_selector: '#' + id,
              file_dom_selector: '#' + file_id,
	      s3_sign_put_url: '/sign_s3',
              // for the moment this doc will be public...
	      onFinishS3Put: function(public_url) {
		  console.log('Upload completed. Uploaded to: '+ public_url);
                  this.updateUploadCount(file_id,public_url);
	      }.bind(this),
	      onError: function(status) {
		  console.log('Upload error: ' + status);
	      }
	  });
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


       // 1. validate model
       // 2. save files
       // 3. sync model
       this.formData = formData;
       this.model.set(this.formData);
       //if(this.model.isValid(true)){
          // write in file 
          // since model is valid, we know there are two files to be uploaded
        //  this.num_uploads = 0;
         // this.s3upload('resume');
         // this.s3upload('cover_letter');
       this.saveModel();

       //}
       // we can still check that model is valid and make use of the 

       // if server returns model, then calls success
       // otherwise, calls error. not sure how to 
       // deal with messages without returning model
       // check this: 
       // http://stackoverflow.com/questions/16965065/backbone-sync-error-even-after-response-code-200
       /*this.model.save(formData,{ iframe: true,
                              files: $('form :file'),
                              data: formData,
                              success: function(model,response) { 
                                   console.log("success"); 
                                   this.trigger('form-submitted','success')//,'Submitted!');
                               }.bind(this),
                              error: function(model,response){ 
                                   console.log("error"); 
                                   this.trigger('form-submitted','error');//,'Ooops! Something ;
                              }.bind(this)}
       );*/

     
      },

      // this is going to do a second check...
      saveModel: function(){

            this.model.save(this.formData,{
                               success: function(model,response) { 
                                   console.log("success"); 
                                   this.trigger('form-submitted','success'); //,'Submitted!');
                               }.bind(this),
                              error: function(model,response){ 
                                   console.log("error"); 
                                   this.trigger('form-submitted','error');//,'Ooops! Something ;
                              }.bind(this)}
       );


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




