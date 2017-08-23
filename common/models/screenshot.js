'use strict';

let webdriverio = require('webdriverio');
let wdOptions = {
  host: '35.192.39.206',
  port: 4444,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

module.exports = Screenshot => {
  Screenshot.screenshot = (req, res, url, next) => {
    let AccessToken = Screenshot.app.models.AccessToken;

    AccessToken.findForRequest(req, {}, (aux, accesstoken) => {
      let UserModel = Screenshot.app.models.User;
      UserModel.findById(accesstoken.userId, (error, user) => {
        if (error) {
          return next(error);
        }

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
          .end(() => {
          });
      });
    });
  };

  Screenshot.remoteMethod('screenshot', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
      {arg: 'url', type: 'string', required: true}
    ],
    isStatic: true,
    returns: [
      {arg: 'body', type: 'file', root: true},
      {arg: 'Content-Type', type: 'image/png', http: {target: 'header'}},
    ],
    http: {path: '/', verb: 'get'}
  });
};
