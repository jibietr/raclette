
var app = app || {};

$(function() {
    console.log("Initalize questions");
    var questions = [
       { qid: 'question1', title: 'Q1: Tell me about your previous experience in XY', status: 'completed', video: 'Unkown' },
       { qid: 'question2', title: 'Q2: Why do you want to do a phd?', status: 'uncompleted', video: 'Unkown' },
       { qid: 'question3', title: 'Q3: What do you do to handle stress', video: 'Unkown' }
    ];
    var docs = [{ type: 'CV' }];
    new app.ApplicationView(questions);
});


