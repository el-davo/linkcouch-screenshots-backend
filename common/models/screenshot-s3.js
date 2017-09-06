'use strict';

let webdriverio = require('webdriverio');
let shajs = require('sha.js');
let wdOptions = {
  host: '104.199.41.57',
  port: 4444,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

module.exports = Screenshot => {
  Screenshot.screenshotS3 = (req, token, s3Name, url, next) => {
    let ScreenshotAnalytics = Screenshot.app.models.ScreenshotAnalytics;
    let screenshotToken = Screenshot.app.models.screenshotTokens;
    let UserModel = Screenshot.app.models.User;
    let s3Credentials = Screenshot.app.models.s3Credentials;

    screenshotToken.findOne({include: ['user'], where: {token: token}}, (err, screenToken) => {
      if (err || !screenToken) {
        return next('Invalid token');
      }

      UserModel.findById(screenToken.userId, (err, user) => {

        if (err || !user) {
          return next('User does not exist for the given token');
        }

        s3Credentials.findOne({where: {userId: user.id, name: s3Name}}, (err, s3Creds) => {
          if (err || !s3Creds) {
            return next(`Unable to find s3 configuration with the given name`);
          }

          ScreenshotAnalytics.create({
            screenshotTokensId: screenToken.id,
            userId: user.id
          }, err => {
            if (err) {
              return next(err);
            }

            let client = webdriverio.remote(wdOptions);

            client
              .init()
              .url(url)
              .screenshot()
              .then((img) => {
                let AWS = require('aws-sdk');

                AWS.config.update({
                  accessKeyId: s3Creds.key,
                  secretAccessKey: s3Creds.secretKey
                });

                let s3 = new AWS.S3();

                let s3Params = {
                  Bucket: s3Creds.bucket,
                  Key: `${shajs('sha256').update(url).digest('hex')}.png`,
                  Body: new Buffer(img.value, 'base64')
                };

                s3.upload(s3Params, (err, data) => {
                  next(err, data);
                });
              })
              .catch((err) => {
                next(err);
              })
              .end();
          });
        });
      });
    });
  };

  Screenshot.remoteMethod('screenshotS3', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'token', type: 'string', required: true},
      {arg: 's3Name', type: 'string', required: true},
      {arg: 'url', type: 'string', required: true},
    ],
    isStatic: true,
    returns: {arg: 'screenshot', type: 'object'},
    http: {path: '/', verb: 'get'}
  });
};
