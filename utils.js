var im = require('imagemagick');
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
    
    getEmailHtml : function() {
        var html = '<p><b>Hello</b> to myself</p>'+
            '<p>Some message</p>';
        
        return html;
    }
};