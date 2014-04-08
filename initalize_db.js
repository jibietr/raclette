//Module dependencies.


var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: 'site/js',
    //this is server side stuff...
    //these does not seem to be used...
    paths: {
        'models': 'models',
        'collections' : 'collections',
        'views' : 'views',
        'templates' : 'templates',
        'text' :  'lib/text',
        
    },
    //this should be client side..
    shim: {
        'lib/jquery' : {
            exports: '$'  
        },
        'lib/underscore-min' : {
            exports: '_'  
        },
        'lib/backbone-min': {
            deps: ['underscore-min', 'jquery'],
            exports: 'Backbone'
        }
 
    }
});

requirejs(['jquery', 'backbone'], function($, Backbone) { Backbone.$ = $; });

requirejs([
    'express',
    'path',
    'mongoose',
    'jquery',
    'fs', 
    'underscore',
    'backbone'], 
  function(express,path,mongoose,$,fs,_,Backbone){

    var application_root = __dirname;


    //Connect to database

   
   var Question = new mongoose.Schema({
       qid: { type: String, required: true, unique: true },
       qtype: { type: String, required: true },
       title: { type: String, required: true }, 
       time_wait: { type: Number},
       time_response: { type: Number, required: true},
   }); 

    //Models
    var QuestionModel = mongoose.model( 'Question', Question);
    mongoose.connect( 'mongodb://localhost/idiap-scg-april2014' );

    function load(file){
        filePathBase = __dirname + '/docs/' +  file + ".json"
	fs.readFile(filePathBase, 'utf8', function (err, data) {
	    if (err) {
		console.log('Error: ' + err);
		return;
	    }

	    data = JSON.parse(data);
            $.each(data, function(index, value) {

		var question = new QuestionModel({
		    qid: value.qid,
		    qtype: value.qtype,
                    time_response: value.time_response,
                    time_wait: value.time_wait,
                    title: value.title,
		});

		question.save( function( err ) {
		        if( !err ) {
			    return console.log( 'created' );
			 } else {
			   return console.log( err );
		         }
		        return response.send(question);
	        });
            });
	    //console.log(data);
	});
    }

    load('idiap-scg-april2014');
    



});


