var common = require('../common.js'),
    utils = require('../utils.js'),
    redis = common.redis,
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
            var jade = require('jade'),
                fs = require('fs'),
                jadeFn,
                html;
            
            console.log('emitting event for got_more_artifacts. start: ' + data.start + ', stop: ' + data.stop + ', filter: ' + data.filter);
            Artifact.getArtifacts(data.start, data.stop, data.filter, function(err, artifacts) {
                if (err) console.log(err);
                Artifact.getTotalArtifacts(data.filter, function(err, total) {
                    fs.readFile('views/partials/artifact-grid.jade', function(error, template) {
                        if (error) console.log(error);
                        jadeFn = jade.compile(template, {filename: 'views/partials/artifact-grid.jade'});
                        html = jadeFn({locals : {
                            artifacts: artifacts
                        }});
                        socket.emit('got_more_artifacts', { html: html, total: total});
                        console.log('sending back ' + artifacts.length + ' artifacts.');
                    });
                });
            });
        });

        //console.log(socket);
        socket.on('get_artifact', function(data) {
            console.log("Request for new artifact with id: " + data.artifactId);
            Artifact.getArtifactById(data.artifactId, function(err, artifact) {
                socket.emit('send_artifact', artifact);
            });
        });
        socket.on('new_artifact', function(data) {
            console.log("Request for new artifact with id: " + data.artifactId);
        });


        socket.on('save_artifact', function(data) {
            Artifact.save(data, function(err) {
                if (!err) socket.emit('artifact_saved', {username: data.username});
                else console.log(err);
            });
        });
        
        socket.on('user_exists', function(data) {
           console.log('checking to see if ' + data.username + ' is taken...');
           User.exists(data.username, function(err, exists) {
               if (err) console.log(err);
               socket.emit('user_exists', {exists : exists});
           });
        });
    });
};
