const config = require('./config');
const NeDB = require('./nedb');
const PGP = require('./pgp');
const PublicKey = require('./public-key');
const LockBox = require('./lockbox');

async function init(keysPath, boxesPath) {
  const pgp = new PGP();
  const publicKeyDb = new NeDB();
  const publicKey = new PublicKey(pgp, publicKeyDb);
  await publicKeyDb.init(keysPath);

  const lockBoxDb = new NeDB();
  const lockBox = new LockBox(lockBoxDb, publicKey);
  await lockBoxDb.init(boxesPath);

  return { publicKey, lockBox };
}

exports.init = init;
