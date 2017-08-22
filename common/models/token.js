'use strict';

module.exports = Token => {
  Token.token = (req, next) => {
    console.log(req);
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
        }, (err, obj) => {
          err ? next(err) : next(err, obj);
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
};
