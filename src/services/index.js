//const config = require('./config');
const NeDB = require('./nedb');
const LockBox = require('./lockbox');
const PGP = require('./pgp');
const PublicKey = require('./public-key');

async function init(cfg) {
  const pgp = new PGP();
  const publicKeyDb = new NeDB();
  const publicKey = new PublicKey(cfg, pgp, publicKeyDb);
  await publicKeyDb.init(cfg.keysDbPath);

  const lockBoxDb = new NeDB();
  const lockBox = new LockBox(lockBoxDb, publicKey);
  await lockBoxDb.init(cfg.boxesDpPath);

  // Give access to the publicKeys and lockboxes
  cfg.publicKey = publicKey;
  cfg.lockBox = lockBox;

  return { publicKey, lockBox };
}

exports.init = init;
