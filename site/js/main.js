requirejs.config({
    deps: [ 'app' ],
    baseUrl: 'js',
    paths: {
        'models': 'models',
        'collections' : 'collections',
        'views' : 'views',
        'templates' : 'templates',
        'text' :  'lib/text',
        '04A5202F.htm': '04A5202F.htm',       
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
        's3upload': 'lib/s3upload',
        'lodash' : 'lib/lodash.min',
        'aws-sdk': 'lib/aws-sdk-2.0.0-rc13.min',
        'scriptcam': 'lib/scriptcam',
        'swfobject': 'lib/swfobject',
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
            deps: ['backbone'],
        },
        'selectize':{
           deps: ['jquery']
        }, 
        'jquery.serializeObject':{
           deps: ['jquery']
        },
        's3upload': {
           deps: ['jquery','lodash']
        },
        'scriptcam': {
           deps: ['jquery','swfobject']
        },

        }
});
