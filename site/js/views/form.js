define([
    'jquery',
    'underscore',
    'bootstrap',
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
    'recaptcha',
    'models/recaptcha'],
  function($,_,bootstrap,Backbone,TmplForm,TmplCountry,TmplDegree,TmplStatus,TmplOpen,TmplSource,TmplAdm,Applicant,File,itrans,selectize,datepicker,validation,serialize,recaptcha,RecaptchaEntry) {

    // these are nested views..
    // http://codehustler.org/blog/rendering-nested-views-backbone-js/

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

     renderNested: function( view, selector ) {
        var $element = ( selector instanceof $ ) ? selector : this.$el.find( selector );
        view.setElement( $element ).render();
    },

    events: {
       'hidden.bs.collapse': 'set_hidden_glyph',
       'show.bs.collapse': 'set_show_glyph',       
       'click #submit':'submitAll'
    },

    set_hidden_glyph: function(e){
      $(e.target).prev().find("span").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    },

    set_show_glyph: function(e){
      $(e.target).prev().find("span").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
    },

    setValidBlock: function(view, attr, selector){
       var $el = view.$('[name=' + attr + ']'), 
       $group = $el.closest('.form-group');
       $group.removeClass('has-error');
       $group.find('.help-block').html('').addClass('hidden');
    },
   
    setInvalidBlock: function (view, attr, error, selector) {
      var $el = view.$('[name=' + attr + ']'),
      $group = $el.closest('.form-group');
      $group.addClass('has-error');
      $group.find('.help-block').html(error).removeClass('hidden');
      $("#Loader").addClass('hidden');
      this.setInfo('error','Form incompleted. Please review the fields above.');
    },

    readForm: function(){
        var applicant  = new Applicant();

        Backbone.Validation.bind(this, { 
          model: applicant,
          valid: this.setValidBlock.bind(this),
          invalid: this.setInvalidBlock.bind(this)
       }); 

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
       //console.log(formData);

       // add value to admissions if it is internship and no phd
       // in practice, we do not need to check for internship, because
       // if missing, the model won't be valid anyway
       var valid = false;
       for (var i=0;i< positions.length;i++){
         if(positions[i].split("-")[0]=="PHD") valid = true;
       }
       if(!valid) formData['admission'] = 'NA';
       //console.log("admissions",formData['admission']);

       //
       if(formData['status']=="GR"){
         formData['graduation']="NA";
       }
       this.model = applicant;
       return this.model.set(formData,{validate:true}); 
   
    },


    setInfo: function(type,message){
      this.info = $("#InfoContainer");
      this.clearInfo(); // clear classes if an 
      if(type=='warning'){
        //	  this.info.find("p").addClass('text-warning').text(message);
        //  this.info.addClass('bg-warning').removeClass('hidden');
      }else if(type=='error'){
       this.info.addClass('bg-warning')
       this.info.find("p").addClass('text-warning').text(message);
       this.info.removeClass('hidden');
      }else if(type=='info'){
        $("#InfoContainer").removeClass('bg-warning').addClass('bg-info');
        $("#InfoContainer").find("p").addClass('text-info').text(message);
        $("#InfoContainer").removeClass('hidden');
        $("#Loader").removeClass('hidden');
      } 
    },

    clearInfo: function(){
       this.info.removeClass("bg-warning").removeClass('bg-info').removeClass("bg-danger").addClass("hidden");
       this.info.find("p").removeClass('text-danger').addClass('text-warning').removeClass('text-info');
    },

    submitAll: function(e){
        
       // prevent from default routing
       e.preventDefault();
       // set form
       if(this.readForm() && this.setRecaptcha()) this.submitRecaptcha();
       // set and submit recaptcha
       //var this.setRecaptcha();
        
    },

    showRecaptcha: function() {
      Recaptcha.create("6LfaofMSAAAAAIOQJsdVA8UQRLHWuD7mkvcGoQ9T", "recaptcha", {
             theme: "red"});
    },

    setRecaptcha: function() {
      console.log("check recaptcha");
      var params = { challenge: Recaptcha.get_challenge(),
       response: Recaptcha.get_response() };
      //before biding, view has to have model
      //if there is no validation, nobody calls it!!
      var recaptcha = new RecaptchaEntry();
      Backbone.Validation.bind(this, { 
        model: recaptcha,
        valid: this.setValidBlock.bind(this),
        invalid: this.setInvalidBlock.bind(this)
       });
       this.recaptcha = recaptcha;
       return recaptcha.set(params,{validate:true});

    },

    submitForm: function(){
       this.setInfo('info','Wait while we upload the files.');
       this.model.save(null,{iframe: true,
                              files: $('form :file'),
                              data: this.model.attributes,
                              success: function(model,response) { 
                                   //console.log("success"); 
                                   //console.log(model);
                                   this.trigger('form-submitted','success')//,'Submitted!');
                               }.bind(this),
                              error: function(model,response){ 
                                   console.log("error",response)
                                   console.log("error",response.responseText); 
                                   if(response.responseText==="The conditional request failed"){
                                     return this.trigger('form-submitted','exists');
                                   }
                                   return this.trigger('form-submitted','error');//,'Ooops! Something ;
                              }.bind(this)});
    },
      
    submitRecaptcha: function(){

      this.recaptcha.save(null,{
         success: function(model,response){ 
            Recaptcha.destroy();
            console.log("Success")
            this.submitForm();
          }.bind(this),
         error: function(model,response){ 
          this.setInfo('error',response.responseText);
          Recaptcha.reload();
           }.bind(this),
      });
    }


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
            this.showRecaptcha();
	    return this;
	}
    });

    return customView;
});




