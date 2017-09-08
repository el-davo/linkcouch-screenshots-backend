'use strict';

let config = require('../config/config');

module.exports = S3Validator => {
  S3Validator.verifyS3Config = (req, s3Config, next) => {
    let AccessToken = S3Validator.app.models.AccessToken;

    AccessToken.findForRequest(req, {}, () => {
      let AWS = require('aws-sdk');

      let s3 = new AWS.S3({
        accessKeyId: s3Config.key,
        secretAccessKey: s3Config.secretKey,
        s3ForcePathStyle: true,
        endpoint: new AWS.Endpoint(`http://${config.aws.s3_endpoint}:${config.aws.port}`)
      });

      let s3Params = {
        Bucket: s3Config.bucket
      };

      s3.listMultipartUploads(s3Params, (err) => {
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
