'use strict';

let config = require('../config/config');
let webdriverio = require('webdriverio');
let wdOptions = {
  host: config.selenium.hub,
  port: 4444,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

module.exports = Screenshot => {
  Screenshot.screenshot = (token, url, next) => {
    let ScreenshotAnalytics = Screenshot.app.models.ScreenshotAnalytics;
    let screenshotToken = Screenshot.app.models.screenshotTokens;
    let UserModel = Screenshot.app.models.User;

    screenshotToken.findOne({include: ['user'], where: {token: token}}, (err, screenToken) => {
      if (err || !screenToken) {
        return next('Invalid token');
      }

      UserModel.findById(screenToken.userId, (err, user) => {

        if (err || !user) {
          return next('Invalid user');
        }

        ScreenshotAnalytics.create({
          screenshotTokensId: screenToken.id,
          userId: user.id
        }, err => {
          if (err) {
            return next('An error occurred');
          }


          console.log(wdOptions);
          let client = webdriverio.remote(wdOptions);

          client
            .init()
            .url(url)
            .screenshot()
            .then((img) => {
              next(null, new Buffer(img.value, 'base64'), 'image/png');
            })
            .catch((err) => {
              next(err);
            })
            .end();
        });
      });
    });
  };

  Screenshot.remoteMethod('screenshot', {
    accepts: [
      {arg: 'token', type: 'string', required: true},
      {arg: 'url', type: 'string', required: true}
    ],
    isStatic: true,
    returns: [
      {arg: 'body', type: 'file', root: true},
      {arg: 'Content-Type', type: 'image/png', http: {target: 'header'}}
    ],
    http: {path: '/', verb: 'get'}
  });
};
