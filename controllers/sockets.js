var common = require('../common.js'),
    utils = require('../utils.js'),
    redis = common.redis,
    monitor = common.monitor,
    Artifact = require('../models/Artifact.js'),
    User = require('../models/User.js');

module.exports = function(io) {
    io.sockets.on('connection', function(socket){
    
        // Artifact view count
        socket.on('views', function(data) {
            Artifact.addView(data.artifactId);
        });

        // Artifact star count
        socket.on('stars', function(data) {
            Artifact.addStar(data.artifactId);
        });
        
        // More artifacts requested in gallery
        socket.on('get_more_artifacts', function(data) {
            console.log('emitting event for got_more_artifacts. start: ' + data.start + ', stop: ' + data.stop + ', filter: ' + data.filter);
            Artifact.getArtifacts(data.start, data.stop, data.filter, function(err, artifacts) {
                if (err) console.log(err);
                Artifact.getTotalArtifacts(data.filter, function(err, total) {
                    utils.renderJadePartial('views/partials/artifact-grid.jade', {artifacts: artifacts}, function(err, html) {
                        socket.emit('got_more_artifacts', {html: html, total: total});
                        console.log('sending back ' + artifacts.length + ' artifacts.');
                    });
                });
            });
        });

        // Sends an artifact
        socket.on('get_artifact', function(data) {
            console.log("Request for new artifact with id: " + data.artifactId);
            Artifact.getArtifactById(data.artifactId, function(err, artifact) {
                socket.emit('send_artifact', artifact);
            });
        });

        // Save artifact and images that go with it. Also sends email with artifact attachment.
        socket.on('save_artifact', function(data) {
            Artifact.save(data, function(err) {
                if (!err) socket.emit('artifact_saved', {username: data.username});
                else console.log(err);
            });
        });
        
        // Checks to see if a given user exists
        socket.on('user_exists', function(data) {
           console.log('checking to see if ' + data.username + ' is taken...');
           User.exists(data.username, function(err, exists) {
               if (err) console.log(err);
               socket.emit('user_exists', {exists : exists});
           });
        });
        
        // Test mailing
        socket.on('test_mail', function(data) {
           console.log('testing mailing capabilities');
           console.log(data);
           utils.sendMail(data, function(err, res) {
               socket.emit('test_mail_sent', {response : res});
           });
        });


        // Monitor database events
        monitor.monitor(function (err, res) {
            console.log('Now monitoring redis events');
        });

        monitor.on("monitor", function (time, args) {
            console.log(args); // ['HSET', 'urn:artifacts:artifact_7452', 'id', 'artifact_7452']
            // Check to see if the command is an HSET and also that we're setting the 'id' because
            // there are multiple HSETs per artifact and we only want to do this once.
            if (args[0] == 'hset' && args[2] == 'id') {
                console.log('emitting socket event for new data stored');
                socket.emit('new_data_stored', {id: args[3], args: args});
            }
        });
    });
};
