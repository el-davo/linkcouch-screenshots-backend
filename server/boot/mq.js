let {mq, selenium} = require('../../common/config/config');
let webdriverio = require('webdriverio');
let wdOptions = {
  host: selenium.hub,
  port: 4444,
  desiredCapabilities: {
    browserName: 'chrome'
  }
};

const QUEUE_NAME_IN = 'linkcouch-screenshot-s3';
const QUEUE_NAME_OUT = 'linkcouch-screenshot-s3-response';

module.exports = function enableAuthentication(app) {

  console.log(`amqp://${mq.username}:${mq.password}@${mq.host}`);

  let connection = require('strong-mq')
    .create(`amqp://${mq.username}:${mq.password}@${mq.host}`)
    .open()
    .on('error', console.error);

  let pull = connection.createPullQueue(QUEUE_NAME_IN);
  let push = connection.createPushQueue(QUEUE_NAME_OUT);

  pull.subscribe(function (messageInfo) {
    let screenshotToken = app.models.screenshotToken;
    let UserModel = app.models.UserModel;
    let ScreenshotAnalytics = app.models.ScreenshotAnalytics;

    screenshotToken.findOne({include: ['user'], where: {token: messageInfo.token}}, (err, screenToken) => {
      if (err || !screenToken) {
        return console.info('Invalid Token');
      }

      UserModel.findById(screenToken.userId, (err, user) => {
        if (err || !user) {
          return console.info('User does not exist for the given token');
        }

        s3Credentials.findOne({where: {userId: user.id, name: messageInfo.s3Name}}, (err, s3Creds) => {
          if (err || !s3Creds) {
            return console.info(`Unable to find s3 configuration with the given name`);
          }

          ScreenshotAnalytics.create({
            screenshotTokensId: screenToken.id,
            userId: user.id
          }, err => {
            if (err) {
              return console.error(err);
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
                  Key: `${shajs('sha256').update(messageInfo.url).digest('hex')}.png`,
                  Body: new Buffer(img.value, 'base64')
                };

                s3.upload(s3Params, (err, s3) => {
                  if (err) {
                    return console.error(err);
                  }

                  push.publish({screenshotId: messageInfo.screenshotId, s3});
                });
              })
              .catch((err) => {
                console.error(err);
              })
              .end();
          });
        });
      });
    });
  });
};
