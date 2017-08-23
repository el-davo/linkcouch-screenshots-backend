'use strict';

module.exports = app => {
  let ds = app.datasources.db;

  ds.autoupdate(err => {
    if (err) throw err;
  });
};
