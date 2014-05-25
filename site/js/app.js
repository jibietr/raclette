// Note: use define here to return the app obj instantiated
// check difference between require and define here
// http://stackoverflow.com/questions/9507606/when-to-use-require-and-when-to-use-define
define([
    'jquery',
    'underscore',
    'backbone'],
  function($,_,Backbone) {
   
    var app = {
        root : "/",                     // The root path to run the application through.
        URL : "/",                      // Base application URL
        API : "/api"                   // Base API URL (used by models & collections)

    };
    $.ajaxSetup({ cache: false });          // force ajax call on all browsers

    console.log("run app.js",app);
    // Things worth checking
    //$.ajaxSetup({ cache: false });
    // Global event aggregator
    //app.eventAggregator = _.extend({}, Backbone.Events);
    return app;
  
});


    
