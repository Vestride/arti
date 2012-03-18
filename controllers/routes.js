var utils = require('../utils.js'),
    Artifact = require('../models/Artifact.js'),
    User = require('../models/User.js'),
    common = require('../common.js'),
    redis = common.redis;

module.exports = function(app, fs) {

    // permalink for the artifact
    app.get('/artifact/:id', function(req, res, next){
        Artifact.getArtifactById(req.params.id, function(err, artifact) {
            if (artifact == null) {
                res.render('message', {locals : {
                    message : req.params.id + ' could not be found.'
                }});
                return;
            }
            var permalink = 'http://' + req.headers.host + req.url;
            var title = artifact.owner ? artifact.owner + '&rsquo;s Artifact - ' + artifact.id : artifact.id;
            var id = artifact.id.split("_")[1];
            res.render('artifact/artifact', {locals: {
                page : 'artifact',
                title : title,
                permalink : permalink,
                artifact : artifact,
                id : id
            }});
        });
    });

    // Our team page. Gets data from the team-members.json file and displays it in
    // random order each time
    app.get('/team', function(req, res) {
        fs.readFile('./models/team-members.json', function(error, content) {
            if (!error) {
                var members = JSON.parse(content);
                
                // Randomize the order of the imposters every time.
                members = members.sort(function() {return 0.5 - Math.random();});
                res.render('team', {locals : { 
                    page : 'team',
                    title: 'Team Members',
                    members : members
                }});
            } else {
                throw new Error('Error reading team-members.json');
            }
        });
    });
    
    app.get('/idea', function(req, res){
        res.render('idea', {locals : {
            page : 'idea',
            title : 'The Idea',
            videojs : true
        }});
    });
    
    // url for the checkin. Id is the id of the artifact
    app.get('/checkin/:id', function(req, res, next) {
        Artifact.getArtifactById(req.params.id, function(err, artifact) {
            if (artifact == null) {
                res.render('message', {locals : {
                    message : req.params.id + ' could not be found.'
                }});
                return;
            }
            if (artifact.processed) {
                console.log('Artifact already processed, nexted!');
                res.redirect('/watch/' + artifact.id);
            }
            res.render('artifact/checkin', {locals : { 
                processingScripts : true,
                page : 'checkin',
                title : 'Check-in for ' + artifact.id,
                artifactId : artifact.id,
                processed : artifact.processed
            }});
        });
    });
    
    // Got to checkin without an id. Shows form that will redirect to correct page
    app.get('/checkin', function(req, res) {
        res.render('artifact/checkin-needs-id', {locals : {
            processingScripts : false,
            page : 'checkin'
        }})
    });
    
    // Redirect for /checkin page when given artifact id
    app.post('/checkin', function(req, res) {
        console.log('redirecting to: /checkin/' + req.body.id)
        res.redirect('/checkin/' + req.body.id);
    });
    
    // Page for watching the artifact be rendered so that no one can save over it
    app.get('/watch/:id', function(req, res){
        console.log('go to watch for: ' + req.params.id);
        Artifact.getArtifactById(req.params.id, function(err, artifact) {
            res.render('artifact/watch', {locals : { 
                processingScripts : true,
                page : 'watch',
                title : 'Watch ' + artifact.id + ' Generate',
                artifactId : artifact.id,
                processed : artifact.processed
            }});
        });
    });
    
    // From the search bar at the top right. Redirects to /user
    app.get('/search', function(req, res) {
        var username = req.param('username');
        console.log('redirecting to /user/' + username);
        res.redirect('/user/' + username);
    });

    // request for a user. Renders all artifacts that this user owns.
    app.get('/user/:username', function(req, res) {
        var username = req.params.username == null ? '' : req.params.username;
        User.exists(username, function(err, exists){
            if (exists) {
                Artifact.getArtifactsByUser(username, function(err, artifacts) {
                    res.render('user/user', {locals : {
                        page : 'user',
                        title : username,
                        artifacts : artifacts,
                        username: username
                    }});
                });
            } else {
                res.render('user/username-not-found', {locals : {
                    page : 'user',
                    title : 'User Not Found',
                    username : username
                }});
            }
        });
    });
    
    // Deletes an artifact from the database (doesn't delete images yet)
    app.get('/delete/this/artifact/:id', function(req, res) {
        console.log('Deleting artifact(' + req.params.id + ')');
        Artifact.del(req.params.id, function(err, artifactId) {
            var message = err ? err : 'Artifact ' + artifactId + ' Deleted';
            res.render('message', {locals : {
                message : message
            }});
        });
    });
    
    // Features an artifact from the database
    app.get('/feature/this/artifact/:id', function(req, res) {
        console.log('Featuring artifact(' + req.params.id + ')');
        Artifact.feature(req.params.id, function(err, artifactId) {
            var message = err ? err : 'Artifact ' + req.params.id + ' Featured';
            res.render('message', {locals : {
                message : message
            }});
        });
    });
    
    // Unfeatures an artifact
    app.get('/unfeature/this/artifact/:id', function(req, res) {
        console.log('Featuring artifact(' + req.params.id + ')');
        Artifact.unfeature(req.params.id, function(err, artifactId) {
            var message = err ? err : 'Artifact ' + req.params.id + ' Unfeatured';
            res.render('message', {locals : {
                message : message
            }});
        });
    });
    
    // Creates a new artifact image for the requested resolution
    app.get('/artifacts/:artifactId/:resolution.png', function(req,res) {
        utils.compositeImage(req.params.artifactId, req.params.resolution, function(err, stdout) {
           var img = fs.readFileSync(__dirname + '/../public/images/' + req.params.artifactId + '_' + req.params.resolution + '.png');
           
           res.writeHead(200, {'Content-Type':'image/png'});
           res.end(img, 'binary');
        });
    });
    
    // Default request aka home page. This is the gallery.
    app.get('/', function(req, res){
        Artifact.getRecentArtifacts(0, 7, function(err, artifacts) {
            Artifact.getTotalArtifacts('recent', function(err, total) {
                res.render('index', {locals : { 
                    page : 'gallery',
                    artifacts : artifacts,
                    total : total
                }});
            });
        });
    });

    //A Route for Creating a 500 Error (Useful to keep around)
    app.get('/500', function(req, res){
        throw new Error('This is a 500 Error');
    });

    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('/*', function(req, res){
        res.render('404', {locals : {}, status: 404});
    });
};
