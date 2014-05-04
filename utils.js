var im = require('imagemagick')
  , fs = require('fs')
  , jade = require('jade')
  , nodemailer = require('nodemailer')
  , common = require('./common.js')
  , transport = common.transport;
  
module.exports = {
    isNumber : function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    getRandomInt : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    NotFound : function(msg) {
        this.name = 'NotFound';
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    },
    
    isEmpty : function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)) return false;
        }
        return true;
    },
    
    compositeImage : function(artifactId, resolution, fn) {
        var newName = artifactId + '_' + resolution + '.png'
          , original = './public/artifacts/' + artifactId + '.png'
          , background = './public/backgrounds/' + resolution + '.png'
          , destination = './public/artifacts/' + newName;
          
        im.composite([
            '-gravity',
            'center',
            original,
            background,
            destination
        ], fn);
    },
    
    /**
     * Sends mail to an email address with an attached image
     * 
     * @global transport
     * @global fs
     * @global nodemailer
     * 
     * @param {Object} options options object
     * @param {string} options.artifactId id of the artifact
     * @param {string} options.attachment which attachment size. @see Artifact.saveAllAttachmentSizes()
     * @param {string} options.username username they entered
     * @param {string} options.email email address they entered
     * @param {Function} fn callback function
     */
    sendMail : function(options, fn) {
        var filename = __dirname + '/public/artifacts/' + options.artifactId + '_' + options.attachment + '.png'
        this.getEmailHtml(common.baseUrl, options.username, options.artifactId, options.attachment, function(err, html) {
            var image = fs.readFileSync(filename),
            message = {
                transport: transport,
                from: 'A.R.T.I. <proj.arti@gmail.com>',
                to: options.username + ' <' + options.email + '>',
                subject: 'Your Artifact from A.R.T.I.',
                html: html,
                attachments:[
                    {
                        fileName: options.username + ' artifact.png',
                        contents: image
                    }
                ]
            };

            console.log('Sending mail to ' + options.email);
            nodemailer.sendMail(message, function(error){
                if (error) {
                    console.log('Error occured sending mail');
                    console.log(error.message);
                    return;
                }
                console.log('Message sent successfully!');
                transport.close(); // close the connection pool
                fn();
            });
        });
    },
    
    getEmailHtml : function(domain, username, id, attachment, fn) {
        var jadeFn, html;
        fs.readFile('views/email-blast.jade', function(error, template) {
            if (error) console.log(error);
            jadeFn = jade.compile(template, {filename: 'views/email-blast.jade'});
            html = jadeFn({locals : {
                domain: domain,
                username: username,
                artifactId: id,
                attachment: attachment
            }});
            fn(error, html);
        });
    },

    renderJadePartial : function(templatePath, locals, fn) {
      var jadeFn,
          html;
      templatePath = __dirname + '/' + templatePath;
      fs.readFile(templatePath, function(error, template) {
          if (error) console.log(error);
          jadeFn = jade.compile(template, {filename: templatePath});
          html = jadeFn(locals);
          fn(error, html);
      });
    }
};