define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'text!templates/chrono.html'],
  function($,_,bootstrap,Backbone,Tmpl_chrono) {

    var view = Backbone.View.extend({
      //id: 'question',
      tagName: 'div',
      className: 'ChronoContainer',
      template: _.template(Tmpl_chrono),
      
     
     initialize: function(params){
       this.type = params.type; // countdown, normal
       if(this.type=='countdown'){
          this.seconds = this.total = params.seconds;
          this.timer_count = setInterval(function() {   this.decr()}.bind(this), 1000);
       }else{
          this.seconds = 0; 
          this.total = params.seconds;
          this.timer_count = setInterval(function() {   this.incr()}.bind(this), 1000);
       }
       this.timer_stop = setInterval(function(){ 
         this.stop() }.bind(this), this.total*1000);
     },

    // update counter and render new time
    incr: function(){
       console.log("decr");
       this.seconds++;
       this.render();
    },

    decr: function(){
       console.log("decr");
       this.seconds= this.seconds-1;
       this.render();
    },

    stop: function(){ 
       this.trigger('chrono_stop');
    },


    getTime: function(){
       var seconds = ((this.type =='countdown') ? this.total-this.seconds : this.seconds); 
       return seconds;
    },

   // show current time
    render: function() {
       console.log("render");
       console.log(this.seconds); 
       this.$el.html(this.template({ time_message: this.seconds , type : this.type }));
       return this;
    },

   close: function() {
      // in case stop was not triggered
       console.log("close chrono");
      clearInterval(this.timer_count);
      clearInterval(this.timer_stop);
   }

    });
    //console.log("load QuestionView");
    return view;
});




