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

const openpgp = require('openpgp');

const pgp = {
  // Receiver public key
  encrypt: async (msg, publics, private, phrase) => {
    // Text message
    const message = msg; // 'Hello, World!';
    // Receivers public keys
    const publicKeysArmored = publics; // [`-----BEGIN PGP PUBLIC KEY BLOCK-----`];
    // Sender private key
    const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----`;
    // Sender passphrase
    const passphrase = phrase; // what the private key is encrypted with

    const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
    await privateKey.decrypt(passphrase)

    const publicKeys = await Promise.all(publicKeysArmored.map(async (key) => {
        return (await openpgp.key.readArmored(key)).keys[0];
    }));

    const { data: encrypted } = await openpgp.encrypt({
        message: openpgp.message.fromText(message),   // input as Message object
        publicKeys,                                   // for encryption
        privateKeys: [privateKey]                     // for signing (optional)
    });
    console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
  },

  decrypt: async(pgpEncrypted, public, private, phrase) => {
    // Encrypted
    const encrypted = pgpEncrypted; // `-----BEGIN PGP MESSAGE-----`;
    // Sender public key
    const publicKeyArmored = public; // `-----BEGIN PGP PUBLIC KEY BLOCK-----`;
    // Receiver private key
    const privateKeyArmored = private; // `-----BEGIN PGP PRIVATE KEY BLOCK-----`;
    // Receiver passphrase
    const passphrase = phrase; // `super long and hard to guess secret` //what the privKey is encrypted with

    const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
    await privateKey.decrypt(passphrase);

    const { data: decrypted } = await openpgp.decrypt({
        message: await openpgp.message.readArmored(encrypted),              // parse armored message
        publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for verification (optional)
        privateKeys: [privateKey]                                           // for decryption
    });
    console.log(decrypted); // 'Hello, World!'
  },

  genkey: async (name, email, phrase) => {
    const key = await openpgp.generateKey({
        userIds: [{ name: name, email: email }], // you can pass multiple user IDs
        rsaBits: 4096,                                              // RSA key size
        passphrase: phrase // 'super long and hard to guess secret'           // protects the private key
    });
    console.log(key);
    return key;
  },
}

exports.openKeyDb = openKeyDb;
exports.keydb = keydb;
exports.pgp = pgp;
