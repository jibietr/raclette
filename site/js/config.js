// Loaded using data-main entry in index.html
// http://requirejs.org/docs/api.html#config
requirejs.config({
    deps: [ 'main' ], // dependencies
    baseUrl: 'js', // root path to all module lookups
    paths: {
        'models': 'models',
        'collections' : 'collections',
        'views' : 'views',
        'templates' : 'templates',
        'text' :  'lib/text',
        'routes': 'routes',
        'jquery' : 'lib/jquery',
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone-min',
        'bootstrap' : 'lib/bootstrap.min',
        'jquery.iframe': 'lib/jquery.iframe-transport',
        'jquery.serializeObject': 'lib/jquery.serializeObject',
        'selectize': 'lib/standalone/selectize',
        'datepicker' : 'lib/bootstrap-datepicker',
        'backbone-validation': 'lib/backbone-validation',
        'aws-sdk': 'lib/aws-sdk-2.0.0-rc13.min',
        'tbjs': 'lib/opentok.min',
        'recaptcha': 'lib/recaptcha_ajax',
        'parsley': 'lib/parsley',
        'utils': 'lib/utils', 
    },
    // use shim for dependencies that do not use define
    shim: {
        'jquery' : {
            exports: '$'  
        },
        'underscore' : {
            exports: '_'  
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone-validation': {
            deps: ['backbone','underscore'],
        },
        'selectize':{
           deps: ['jquery']
        }, 
        'jquery.serializeObject':{
           deps: ['jquery']
        },
        'datepicker':{
           deps: ['bootstrap','jquery']
        },
        'jquery.iframe':{
           deps: ['jquery']
        },
   }
});




