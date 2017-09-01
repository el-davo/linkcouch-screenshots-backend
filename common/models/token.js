'use strict';

module.exports = Token => {
  Token.token = (req, next) => {
    let AccessToken = Token.app.models.AccessToken;

    AccessToken.findForRequest(req, {}, (aux, accesstoken) => {
      let UserModel = Token.app.models.User;
      UserModel.findById(accesstoken.userId, (error) => {
        if (error) {
          return next(error);
        }

        AccessToken.create({
          ttl: -1,
          userId: accesstoken.userId,
          scopes: ['screenshots']
        }, (err, token) => {
          err ? next(err) : next(err, token);
        });
      });
    });
  };

  Token.getUserTokens = (req, next) => {
    let AccessToken = Token.app.models.AccessToken;

    AccessToken.findForRequest(req, {}, (aux, accesstoken) => {
      let UserModel = Token.app.models.User;
      UserModel.findById(accesstoken.userId, (error) => {
        if (error) {
          return next(error);
        }

        AccessToken.find({where: {userId: accesstoken.userId, scopes: {inq: ['["screenshots"]']}}}, (err, tokens) => {
          err ? next(err) : next(err, tokens);
        });
      });
    });
  };

  Token.deleteUserToken = (req, tokenId, next) => {
    console.log(tokenId);
    Token.app.models.AccessToken.destroyById(tokenId, next);
  };

  Token.remoteMethod('token', {
    accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
    returns: {arg: 'token', type: 'object'},
    http: {path: '/', verb: 'post'}
  });

  Token.remoteMethod('getUserTokens', {
    accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
    returns: {arg: 'tokens', type: 'object'},
    http: {path: '/', verb: 'get'}
  });

  Token.remoteMethod('deleteUserToken', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'tokenId', type: 'string', required: true}
    ],
    returns: {arg: 'tokens', type: 'object'},
    http: {path: '/', verb: 'delete'}
  });
};
