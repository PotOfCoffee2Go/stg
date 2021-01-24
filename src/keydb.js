const _projectdir = require('path').resolve(__dirname, '..');

const { datastore } = require('nedb-promise');
var keydb;

const openKeyDb = async () => {
  keydb = datastore({
     filename: _projectdir + '/private/key.db',
     autoload: true // so that we don't have to call loadDatabase()
  })

  return await keydb.count({});
}

exports.openKeyDb = openKeyDb;
