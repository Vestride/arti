var common = require('../common.js'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    io = common.io,
    redis = common.redis,
    transport = common.transport,
    utils = require('../utils.js'),
    User = require('./User.js');

var Artifact = {
    
    /**
     * Gets an artifact from the database
     *
     * @param {string} id id of the artifact
     * @param {function} fn callback to execute with the data
     * @return {object} a javascript object with properties and values from the redis db
     */
    getArtifactById : function(id, fn) {
        return redis.hgetall('urn:artifacts:' + id, function(err, artifact) {
            artifact.featured = artifact.featured == 'true' ? true : false;
            artifact.processed = artifact.processed == 'true' ? true : false;
            artifact.newData = true;
            if (!artifact.id) {
                fn('No artifact with id = "' + id + '" found.', null);
            } else {
                fn(err, artifact);
            }
        });
    },
    
    /**
     * Gets multiple artifacts from the database
     * 
     * @param {int} start zero-based index of where to start taking artifacts from (inclusive). Omit for no limits
     * @param {int} stop zero-based index for stopping point (inclusive). Omit for all / no limits
     * @param {string} filter recent|popular|favorites|featured|user
     * @param {function} fn callback function to execute with data
     * @param {string} [username] limits artifacts to a single username
     * @return {array} returns an array of artifact objects
     */
    getArtifacts : function(start, stop, filter, fn, username) {
        console.log('getArtifacts(' + start + ', ' + stop + ', ' + filter + ', ' + username + ')');
        var artifacts = [],
        callback = function(err, response) {
            // Do some error checking
            if (err || !response) return false;
            if (response.length == 0) fn(err, response);
            // Loop through the results
            response.forEach(function(key, index) {
                Artifact.getArtifactById(key, function(err, artifact) {
                    artifacts.push(artifact);
                    
                    // If this is the last one, execute our callback
                    if (index == response.length - 1) {
                        fn(err, artifacts);
                    }
                });
            });
        };
        
        this.getArtifactKeys(start, stop, filter, username, callback, fn);
        
    },
    
    /**
     * Gets the keys of artifacts to get
     * 
     * @param {int|null} start start position (zero-index)
     * @param {int|null} stop stop position (zero-index)
     * @param {string} filter recent|popular|favorites|user|featured
     * @param {string|null} username if using the user filter, specifies the user
     * @param {function} callback called when array of keys is obtained
     * @param {function} fn
     */
    getArtifactKeys : function(start, stop, filter, username, callback, fn) {
        // Get the keys for the requested artifacts. If either the start or stop values are null
        var all = start == null || stop == null;
        switch (filter) {
            case 'recent':
            case null :
                if (!all)
                    redis.zrevrange('urn:artifacts', start, stop, callback) 
                else 
                    redis.zrevrange('urn:artifacts', 0, -1, callback) 
                break;
            case 'popular':
                if (!all)
                    redis.zrevrange('urn:pageviews', start, stop, callback);
                else
                    redis.zrevrange('urn:pageviews', 0, -1, callback);
                break;
            case 'favorites':
                if (!all)
                    redis.zrevrange('urn:favorites', start, stop, callback);
                else
                    redis.zrevrange('urn:favorites', 0, -1, callback);
                break;
            case 'user':
                redis.smembers('urn:users:' + username, callback);
                break;
            case 'featured':
                redis.smembers('urn:featured', callback);
                break;
            default:
                fn(null, []);
                break;
        }
    },
    
    getRecentArtifacts : function(start, stop, fn) {
        this.getArtifacts(start, stop, 'recent', fn);
    },
    
    getPopularArtifacts : function(start, stop, fn) {
        this.getArtifacts(start, stop, 'popular', fn);
    },
    
    getFavoriteArtifacts : function(start, stop, fn) {
        this.getArtifacts(start, stop, 'favorites', fn);
    },
    
    getArtifactsByUser : function(username, fn) {
        this.getArtifacts(null, null, 'user', fn, username);
    },
    
    /**
     * Gets the total number of artifacts for the specified filter
     * 
     * @param {string} filter
     * @param {function} fn callback
     */
    getTotalArtifacts : function(filter, fn) {
        Artifact.getArtifactKeys(null, null, filter, undefined, function(err, response) {
            fn(err, response.length);
        }, fn);
    },
    
    incrementField : function(artifactId, field) {
        if (!artifactId || !field) {
            console.log("WHERE'S MY ARTIFACT ID!?");
            return;
        }
        redis.hincrby('urn:artifacts:' + artifactId, field, 1, function(err, res){
            if (err) console.log(err);
        });
        
        // Update the sorted set
        var sortedSetKey;
        if (field == 'views') sortedSetKey = 'pageviews';
        else if (field == 'stars') sortedSetKey = 'favorites';
        if (!sortedSetKey) return;
        
        redis.zincrby('urn:' + sortedSetKey, 1, artifactId, function(err, res){
            if (err) console.log(err);
        });
    },
    
    addView : function(artifactId) {
        console.log("Adding view to " + artifactId);
        this.incrementField(artifactId, 'views');
    },
    
    /**
     * Adds a star (favorite) to an artifact
     * 
     * @param {string} artifactId id of the artifact
     */
    addStar : function(artifactId) {
        console.log("Adding star to " + artifactId);
        this.incrementField(artifactId, 'stars');
    },
    
    save : function(request, fn) {
        // Save string to file
        var data = request.uri.replace(/^data:image\/\w+;base64,/, "")
          , buf = new Buffer(data, 'base64')
          , username = request.username
          , artifactId = request.artifactId;
          
        this.saveAllAttachmentSizes(buf, artifactId, request.attachment, function(err, res) {
            // Send them an email if they requested it
            if (request.sendEmail) {
                utils.sendMail(request, function() {
                    fn(err, res);
                });
            }
        });
        
        // Let the hash know we've done it
        redis.hmset('urn:artifacts:' + artifactId, {
            'processed': 'true', 
            'owner': username
        });
        
        // Save to users (request.username)
        User.addArtifact(artifactId, username, function(err, response) {
            console.log('artifact added to user: ' + username + '. response: ' + response);
        });
        
        
        // Save this artifact id to our sorted sets now that it has an image
        // We have to go grab the artifact from the db first because we don't know it's timestamp
        Artifact.getArtifactById(artifactId, function(err, artifact){
            redis.zadd('urn:artifacts', artifact.timestamp, artifact.id);
            redis.zadd('urn:pageviews', 0, artifact.id);
            redis.zadd('urn:favorites', 0, artifact.id);
        });
        fn(null);
    },
    
    saveAllAttachmentSizes : function(buf, artifactId, attachment, fn) {
        console.log("Saving " + artifactId + "'s image");
        var resolutions = [
            "iphone4", "ipad", "android-small", "android-medium", "android-large", 
            "1920x1200", "1920x1080", "1680x1050", "1600x900", "1440x900", "1280x1024", "1280x800"
        ],
        callback = function(err, stdout, stderr) {
            if (err) console.log("error: " + err);
        },
        i;
        
        // Write the original file, then composite the others
        fs.writeFile(__dirname + '/../public/artifacts/' + artifactId + '.png', buf, function(err, response) {
            for (i = 0; i < resolutions.length; i++) {
                if (resolutions[i] == attachment) {
                    utils.compositeImage(artifactId, resolutions[i], fn);
                } else {
                    utils.compositeImage(artifactId, resolutions[i], callback);
                }
            }
        });
    },
    
    feature : function(artifactId, fn) {
        redis.hset('urn:artifacts:' + artifactId, 'featured', 'true');
        redis.sadd('urn:featured', artifactId, fn);
    },
    
    unfeature : function(artifactId, fn) {
        redis.hset('urn:artifacts:' + artifactId, 'featured', 'false');
        redis.srem('urn:featured', artifactId, fn);
    },
    
    /**
     * Deletes an artifact from the database
     * 
     * @param {string} artifactId id of the artifact
     * @param {function} fn callback function
     */
    del : function(artifactId, fn) {
        Artifact.getArtifactById(artifactId, function(err, artifact) {
            // If the artifact doesn't exist, jump out
            if (err || !artifact) {
                fn(err, artifactId)
            } else {
                redis.zrem('urn:artifacts', artifactId, function(err, res) { // Sorted set with timestamps
                    redis.zrem('urn:pageviews', artifactId, function(err, res) { // Sorted set with page views
                        redis.zrem('urn:favorites', artifactId, function(err, res) { // Sorted set with stars
                            if (artifact.owner) {
                                redis.srem('urn:users:' + artifact.owner, artifactId, function(err, res) { //  Remove member from users's set
                                    redis.del('urn:artifacts:' + artifactId, function(err, res) { // artifact hash
                                    fn(err, artifactId); 
                                    });
                                });
                            } else {
                                redis.del('urn:artifacts:' + artifactId, function(err, res) { // artifact hash
                                    fn(err, artifactId);
                                });
                            }
                        });
                    });
                });
            }
        });
    }
};
module.exports = Artifact;