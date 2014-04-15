requirejs.config({
    deps: [ 'app' ],
    baseUrl: 'js',
    paths: {
        'models': 'models',
        'collections' : 'collections',
        'views' : 'views',
        'templates' : 'templates',
        'text' :  'lib/text',
        
        'jquery' : 'lib/jquery',
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone-min',
        'jquery.form' : 'lib/jquery.form.min',
        'bootstrap' : 'lib/bootstrap.min',
        'RecordRTC' : 'lib/RecordRTC',
        'jquery.fileupload' : 'lib/jquery.fileupload',
        'jquery.ui.widget' : 'lib/jquery.ui.widget',
        'jquery.iframe': 'lib/jquery.iframe-transport',
        'jquery.serializeObject': 'lib/jquery.serializeObject',
        'selectize': 'lib/standalone/selectize',
        'backbone-validation': 'lib/backbone-validation',
    },
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
        'selectize':{
           deps: ['jquery']
        }, 
        'jquery.serializeObject':{
           deps: ['jquery']
        },
    }
});
