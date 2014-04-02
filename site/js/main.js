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
    },
    shim: {
        'jquery' : {
            exports: '$'  
        },
        'underscore' : {
            exports: '_'  
        },
        'boostrap': {
            deps: ['jquery']
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});
