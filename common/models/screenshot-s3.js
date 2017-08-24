'use strict';

let webdriverio = require('webdriverio');
let shajs = require('sha.js');
let wdOptions = {
  host: '35.197.196.140',
  port: 4444,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

module.exports = Screenshot => {
  Screenshot.screenshotS3 = (req, url, next) => {
    let AccessToken = Screenshot.app.models.AccessToken;
    let ScreenshotAnalytics = Screenshot.app.models.ScreenshotAnalytics;

    AccessToken.findForRequest(req, {}, (aux, accesstoken) => {
      let UserModel = Screenshot.app.models.User;

      UserModel.findById(accesstoken.userId, (err, user) => {
        if (err) {
          return next(err);
        }

        ScreenshotAnalytics.create({
          accessTokenId: accesstoken.id,
          userId: user.id
        }, err => {
          if (err) {
            return next(err);
          }

          if (!user.s3Credentials) {
            return next('No s3 credentials found');
          }

          user.s3Credentials((err, s3Credentials) => {
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
                  accessKeyId: s3Credentials.key,
                  secretAccessKey: s3Credentials.privateKey
                });

                let s3 = new AWS.S3();

                let s3Params = {
                  Bucket: s3Credentials.bucket,
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
      {arg: 'url', type: 'string', required: true}
    ],
    isStatic: true,
    returns: {arg: 'screenshot', type: 'object'},
    http: {path: '/', verb: 'get'}
  });
};
