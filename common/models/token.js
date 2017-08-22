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
          scopes: ['screenshots'],
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

        AccessToken.find({where: {scopes: {inq: ['screenshots']}}}, (err, tokens) => {
          err ? next(err) : next(err, tokens);
        });
      });
    });
  };

  Token.remoteMethod('token', {
      accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
      returns: {arg: 'token', type: 'object'},
      http: {path: '/', verb: 'post'}
    }
  );

  Token.remoteMethod('getUserTokens', {
      accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
      returns: {arg: 'tokens', type: 'object'},
      http: {path: '/', verb: 'get'}
    }
  );
};
