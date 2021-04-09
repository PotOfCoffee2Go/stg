const fs = require('fs');
const _projectdir = require('path').resolve(__dirname, '..');

// Render Mustache templates
const { render, renderError } = require('./render');

// Message en/decryption and embedding into image
const { embed, digUp } = require('@mykeels/steganography');

// OpenPGP interface
const { pgp } = require('./keydb');

// Load keys page template on starup
const pages = {
  promptprimarykeys: fs.readFileSync(_projectdir + '/src/views/promptprimarykeys.html', { encoding: 'utf8' }),
};

const embedKey = async (srcpath, dstpath, payload, pw) => {
  console.log(srcpath, dstpath);
  const buffer = await embed(srcpath, payload, pw);
  fs.writeFileSync(dstpath, buffer);
}

// Construct keys and embed in images
const postData = async (cfg, req) => {
  let type = 'key';
  let keys = await pgp.genkey(req.body.keyname, req.body.keyemail, req.body.keycomment);
  let keyinfo = {
    name: req.body.keyname, email: req.body.keyemail, comment: req.body.keycomment,
  };

  keyinfo.keyarmored = keys.publicKeyArmored;

  cfg.publicKey.put({publicKeyArmored: keys.publicKeyArmored})
    .then(() => cfg.publicKey.compactDb())

  let message = JSON.stringify(keyinfo, null, 2);
  let payload = JSON.stringify({ type, message }, null, 2);
  await embedKey(
    cfg.key.primary.publicDefaultImage,
    cfg.key.primary.publicKeyImage,
    payload,'');

  keyinfo.keyarmored = keys.privateKeyArmored;
  message = JSON.stringify(keyinfo, null, 2);
  payload = JSON.stringify({ type, message }, null, 2);
  await embedKey(
    cfg.key.primary.privateDefaultImage,
    cfg.key.primary.privateKeyImage,
    payload,'');
}


const promptPrimaryKeys = (cfg, req, res) => {
  return render(cfg, res, pages.promptprimarykeys, {  });
}

const genPrimaryKeys = (cfg, req, res) => {
  postData(cfg, req);
  return renderError(cfg, res, 'made it');
}

exports.promptPrimaryKeys = promptPrimaryKeys;
exports.genPrimaryKeys = genPrimaryKeys;

