var redis = require('redis')
  , nodemailer = require('nodemailer');
    
exports.redis = redis.createClient();
exports.transport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth : {
        user: 'proj.arti@gmail.com',
        pass: 'deadhorsestellnotales'
    }
});
console.log('SMTP configured');
exports.baseUrl = 'http://projectarti.com';