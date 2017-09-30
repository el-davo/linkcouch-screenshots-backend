'use strict';

let crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = process.env.cipherPassword || 'f0a01968-90cd-11e7-abc4-cec278b6b50a';

module.exports = S3Credentials => {
  S3Credentials.observe('persist', (ctx, next) => {
    let cipher = crypto.createCipher(algorithm, password);

    let keyCipher = cipher.update(ctx.data.key, 'utf8', 'hex');
    let secretKeyCipher = cipher.update(ctx.data.secretKey, 'utf8', 'hex');
    let bucketCipher = cipher.update(ctx.data.bucket, 'utf8', 'hex');

    ctx.data.key = keyCipher;
    ctx.data.secretKey = secretKeyCipher;
    ctx.data.bucket = bucketCipher;

    next();
  });

  S3Credentials.observe('loaded', (ctx, next) => {
    let decipher = crypto.createDecipher(algorithm, password);

    let keyCipher = decipher.update(ctx.data.key, 'hex', 'utf8');
    let secretKeyCipher = decipher.update(ctx.data.secretKey, 'hex', 'utf8');
    let bucketCipher = decipher.update(ctx.data.bucket, 'hex', 'utf8');

    ctx.data.key = keyCipher;
    ctx.data.secretKey = secretKeyCipher;
    ctx.data.bucket = bucketCipher;

    next();
  });
};
