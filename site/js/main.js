requirejs.config({
    deps: [ 'app' ],
    baseUrl: 'js',
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
        //'jquery.form' : 'lib/jquery.form.min',
        'bootstrap' : 'lib/bootstrap.min',
        'RecordRTC' : 'lib/RecordRTC',
        //'jquery.fileupload' : 'lib/jquery.fileupload',
        //'jquery.ui.widget' : 'lib/jquery.ui.widget',
        'jquery.iframe': 'lib/jquery.iframe-transport',
        'jquery.serializeObject': 'lib/jquery.serializeObject',
        'selectize': 'lib/standalone/selectize',
        'datepicker' : 'lib/bootstrap-datepicker',
        'backbone-validation': 'lib/backbone-validation',
        //'s3upload': 'lib/s3upload',
        //'lodash' : 'lib/lodash.min',
        'aws-sdk': 'lib/aws-sdk-2.0.0-rc13.min',
        'scriptcam': 'lib/scriptcam',
        'swfobject': 'lib/swfobject',
        'tbjs': 'lib/TB.min',
        //'tb': 'https://swww.tokbox.com/webrtc/v2.2/js/TB.min',

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




