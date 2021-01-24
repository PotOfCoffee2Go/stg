const _projectdir = require('path').resolve(__dirname, '..');

const { datastore } = require('nedb-promise');
var db;

const openKeyDb = async () => {
  db = datastore({
     filename: _projectdir + '/private/key.db',
     autoload: true // so that we don't have to call loadDatabase()
  })
  return await db.count({});
};

const record = {
  name: '',
  email: '',
  public: '',
  private: ''
};


const parseBlock = (pgpblock) => {

}

const keydb = {
  findByName: async (name) => {
    let rec = await db.find({name});
    return rec;
  },
  findByEmail: async (email) => {
    let rec = await db.find({email});
    return rec;
  },
  insert: async (pgpblock) => {

  },
  update: async (pgpblock) => {

  },
}


exports.openKeyDb = openKeyDb;
exports.keydb = keydb;
