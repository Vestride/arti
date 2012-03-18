var common = require('./common.js'),
    redis = common.redis;

module.exports = function(app, express, io) {
    // Express
    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.static(__dirname + '/public'));
        app.use(app.router);
    });

    app.configure('development', function(){
        app.use(express.errorHandler({
            dumpExceptions: true, 
            showStack: true
        }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });

    // Setup the errors
    app.error(function(err, req, res, next){
        console.log("err: " + JSON.stringify(err));
        if (err instanceof NotFound) {
            res.render('404', {locals: { 
                title : '404 - Not Found' 
            }, status: 404});
        } else {
            res.render('500.jade', {locals: { 
                title : 'The Server Encountered an Error',
                error: err 
            }, status: 500});
        }
    });

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // Redis
    redis.on('error', function(err) {
        console.log('db error: ' + err);
    });
    
    // Socket.io
    io.configure('', function(){
        io.set('log level', 1);
    });
};