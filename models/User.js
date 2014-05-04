var common = require('../common.js'),
    fs = require('fs'),
    io = common.io,
    redis = common.redis,
    Artifact = require('./Artifact.js');

var User = {
    
    exists : function(username, fn) {
        redis.exists('urn:users:' + username, function(err, response) {
            if (err) console.log(err);
            fn(err, response === 1);
        });
    },
    
    addArtifact : function(artifactId, username, fn) {
        redis.sadd('urn:users:' + username, artifactId, fn);
    }
    
};
module.exports = User;