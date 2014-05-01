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
      console.log("init chrono");
      console.log(params.status);
       this.type = params.type; // countdown, normal
       this.status = params.status;
       if(this.type=='countdown'){
          this.seconds = params.seconds ;
          this.total = this.seconds;
          this.timer_count = setInterval(function() {   this.decr()}.bind(this), 1000);
       }else{// this is for a normal clock up
          this.seconds = 0; 
          this.total = params.seconds;
          this.timer_count = setInterval(function() {   this.incr()}.bind(this), 1000);
       }
       this.timer_stop = setTimeout(function(){ 
          this.stop(); 
        }.bind(this), (this.total)*1000+500 );
       this.timer_warn = setTimeout(function(){
         this.warning = true;
         this.warn(false);
        }.bind(this), (this.total-10)*1000);
       // we control style here
       //$(this.el).find("button").addClass('btn-primary');  
       this.warning = false;
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

    warn: function(active){
       console.log("warning",active,this.el);
       // add warning and change ..
       clearTimeout(this.timer_warn);
       
       if(active){
         $(this.el).removeClass('bg-warning');
         $(this.el).find("p").removeClass('text-warning');
         this.timer_warn = setTimeout(function(){ this.warn(); }.bind(this), 500);
       }else{
          $(this.el).addClass('bg-warning');
          $(this.el).find("p").addClass('text-warning');
         
          this.timer_warn = setTimeout(function(){ this.warn(true); }.bind(this), 500);
       }
       
    },

    
    // this is controled from outside
    stop: function(){ 
      time = this.getTime();
      //console.log("stop from chrono");
      clearTimeout(this.timer_warn);
      clearInterval(this.timer_count);
      clearInterval(this.timer_stop);       
      this.trigger("chrono_stop",time);
    },

    getTime: function(){
       var seconds = ((this.type =='countdown') ? this.total-this.seconds : this.seconds); 
       return seconds;
    },

   // show current time
    render: function() {
      //console.log("render",this.status);
      //console.log(this.seconds);
       // using  MM:SS format both countdown and up
      var minutes = Math.floor(this.seconds / 60);
      var seconds = this.seconds - minutes * 60;
      message = minutes + ":" + seconds;
      minutes = ("0" + minutes).slice(-2);
      seconds = ("0" + seconds).slice(-2);
      this.$el.html(this.template({ status: this.status, min: minutes, sec: seconds, warning: this.warning }));
      return this;
    },


   close: function() {
      // in case stop was not triggered
       console.log("close chrono");

   }

    });
    //console.log("load QuestionView");
    return view;
});




