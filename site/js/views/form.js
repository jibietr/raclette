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
    'text!templates/source.html',
    'text!templates/admission.html',
    'models/applicant',
    'models/file',
    'jquery.iframe',
    'selectize',
    'datepicker',
    'backbone-validation',
    'jquery.serializeObject',
    's3upload'],
  function($,_,bootstrap,form,Backbone,TmplForm,TmplCountry,TmplDegree,TmplStatus,TmplOpen,TmplSource,TmplAdm,Applicant,File,itrans,selectize,datepicker,validation,serialize,s3upload) {

    // these are nested views..
    // http://codehustler.org/blog/rendering-nested-views-backbone-js/
    _.extend(Backbone.Validation.callbacks, {
    valid: function (view, attr, selector) {
        var $el = view.$('[name=' + attr + ']'), 
            $group = $el.closest('.form-group');
        
        $group.removeClass('has-error');
        $group.find('.help-block').html('').addClass('hidden');
        
        $("#InfoContainer").addClass('hidden');

    },
    invalid: function (view, attr, error, selector) { 
        var $el = view.$('[name=' + attr + ']'), 
            $group = $el.closest('.form-group');
     
        $group.addClass('has-error');
        $group.find('.help-block').html(error).removeClass('hidden');
 
        $("#InfoContainer").removeClass('bg-info').addClass('bg-warning')
        $("#InfoContainer").find("p").removeClass('text-info').addClass('text-warning').text("Form incompleted. Please review the fields above.");
        $("#InfoContainer").removeClass('hidden');
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
         // we pass extension and size to model
         value = $(el)[0].value;
         formData[el.name] = value; 
         //pass file object
         if(value){
            var type = $(el)[0].files[0].type;
            var size = $(el)[0].files[0].size;        
            // backbone-validation does not accept objects
            formData[el.name] = type + " " + size;  }
       });

       var positions = [];
       // positions may not exist if there was no selection
       // (this seems to be an issue with selectize.js)
       // convert positions to array
       if('positions' in formData){ 
        if( typeof formData['positions'] === 'string' ) { 
          positions.push(formData['positions']);
        }else{
          formData['positions'].forEach(function(entity){
            positions.push(entity);
          });
        }
       }
       formData['positions'] = positions;
       console.log(formData);

       // add value to admissions if it is internship and no phd
       // in practice, we do not need to check for internship, because
       // if missing, the model won't be valid anyway
       var valid = false;
       for (var i=0;i< positions.length;i++){
         if(positions[i].split("-")[0]=="PHD") valid = true;
       }
       if(!valid) formData['admission'] = 'NA';
       console.log("admissions",formData['admission']);

       //
       if(formData['status']=="GR"){
         formData['graduation']="NA";
       }

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
      
       // this is a temporal solution to giving some feedback 
       // f
       $("#InfoContainer").removeClass('bg-warning').addClass('bg-info')
       $("#InfoContainer").find("p").removeClass('text-warning').addClass('text-info').text("Wait while we upload the files.");
       $("#InfoContainer").removeClass('hidden');
       $("#Loader").removeClass('hidden');


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
            this.sourceView = new NestedView(_.template(TmplSource));
            this.admView = new NestedView(_.template(TmplAdm));

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
            this.renderNested( this.sourceView, '#source' );
            this.renderNested( this.admView, '#admission' );
            // initialize select from array?            
	    return this;
	}
    });

    return customView;
});




