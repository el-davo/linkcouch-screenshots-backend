'use strict';

module.exports = S3Validator => {

  S3Validator.verifyS3Config = (req, s3Config, next) => {
    let AccessToken = S3Validator.app.models.AccessToken;

    AccessToken.findForRequest(req, {}, (aux, accesstoken) => {
      let AWS = require('aws-sdk');

      AWS.config.update({
        accessKeyId: s3Config.key,
        secretAccessKey: s3Config.secretKey
      });

      let s3 = new AWS.S3();

      let s3Params = {
        Bucket: s3Config.bucket,
        Key: 'bla.txt',
        Body: 'bla'
      };

      s3.upload(s3Params, (err) => {
        next(null, !err);
      });
    });
  };

  S3Validator.remoteMethod('verifyS3Config', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 's3Config', type: 'object', required: true}
    ],
    isStatic: true,
    returns: {arg: 'success', type: 'boolean'},
    http: {path: '/verifyS3Config', verb: 'post'}
  });
};
