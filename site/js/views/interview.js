// Manages interview flow with panel and questions
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'models/panel',
    'views/panel',
    'views/question',
    'models/question',
    'text!templates/wrap.html',    
    'app',
],
function($,_,bootstrap,Backbone,Panel,PanelView,QuestionView,Question,TmplWrap,app) {
    
    var interView = Backbone.View.extend({

	id: 'inter-view',
	tagName: 'div',
	template_wrap: _.template(TmplWrap),

	events:{
	    'click #continue-interview': 'renderQuestion',        
	},
	
	initialize: function(attrs){
	    console.log('Init interview');
	    this.collection = attrs.collection;
	    this.total
	    this.status = 'wait';
	    // init panel here...
	    this.panel = new Panel();
            this.panelView = new PanelView({ 
		model: this.panel
	    });

	},

	render: function(tempName) {
            window.scrollTo(0,0);
            //this.$el.html(this.template_test());
	    //if(this.status=='wait') 
	    this.renderPanel();
	    //else this.renderQuestion();
	    return this;
	},


	renderPanel: function(){
            window.scrollTo(0,0); 
            // it may not exist at the very beginning
            //if(this.Recorder) this.Recorder.$el.detach();
	    if(app.Recorder) app.Recorder.$el.detach();
            if(this.collection.length===0){ // show last page...
		this.panel.set({ type: 'end', num_questions: this.collection.length });
            }else if(this.collection.length===this.total){
		this.panel.set({ type: 'start', num_questions: this.collection.length });        
            }else{
		this.panel.set({ type: 'wait', num_questions: this.collection.length });        
            }
            /*var panelView = new PanelView({ 
              model: panel 
              });*/
            console.log('does panelview eexist in interview?',this.panelView);
            this.$el.html(this.panelView.render().el);
            return this;
	},
 
	renderQuestion: function() {
	    console.log('render question');
            window.scrollTo(0,0);
            // detach panel view
            this.panelView.$el.detach();
            // init new question
	    this.question = this.collection.at(0);   
	    this.questionView = new QuestionView({
		model: this.question
	    });
	    this.$el.html(this.template_wrap());//question wrapper
            elem = $(this.el).find("#question")[0]; 
	    
	    this.questionView.$el.appendTo(elem);                                                                                         
	    this.questionView.render(); 
	    // set up listener
            this.listenTo(this.question,'question-done',function(){
		this.collection.remove(this.question);
		this.questionView.remove();
		this.renderPanel();
		//app.session.set({ status: 'wait' });
            }.bind(this));
            // set up recorder...
            this.questionView.setRecorder();
	    //this.$el.html(questionView.render().el);
	    //this.renderChrono();
	    console.log("render new view");
      }

   });

    return interView;
});




