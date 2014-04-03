

requirejs([
    'jquery',
    'underscore',
    'backbone',
    'views/questionnaire',
    'views/form'],
function($,_,Backbone,ViewQ,ViewF) {


    var questions = [{ id: 'Q1', type: 'video', 'title': 'Why do you want to do a phd?', time_wait: '30', time_response: '180' },
       { id: 'Q2', type: 'text', title: 'What do you do to handle stress?', time_response: '120' }];

    //console.log("... hardcoded questions " + questions);
    //var appView = new View(questions);
    var appView = new ViewF();
    console.log("... loaded app.js");
  
 });


    
