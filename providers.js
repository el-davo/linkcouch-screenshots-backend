'use strict';

const FACEBOOK_CLIENTID = process.env.facebookClientId || '1423622971026380';
const FACEBOOK_CLIENT_SECRET = process.env.facebookClientSecret || '0035340aef243b62d7565fde65bba18d';
const GITHUB_CLIENT_ID = process.env.githubCLientId || 'test';
const GITHUB_CLIENT_SECRET = process.env.githubClientSecret || 'test';

module.exports = {
  facebook: {
    provider: 'facebook',
    module: 'passport-facebook',
    clientID: FACEBOOK_CLIENTID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    callbackPath: '/auth/facebook/callback',
    authPath: '/auth/facebook',
    successRedirect: '/client/auth.html',
    scope: ['email', 'public_profile'],
    profileFields: ['gender', 'locale', 'name', 'timezone', 'email', 'picture']
  },
  github: {
    provider: 'github',
    module: 'passport-github',
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'https://linkcouch-backend.cfapps.io/auth/github/callback',
    authPath: '/auth/github',
    successRedirect: '/client/auth.html'
  }
};

