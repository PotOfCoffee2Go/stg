const fs = require('fs');
const _projectdir = require('path').resolve(__dirname, '..');

// Render Mustache templates
const { render, renderError } = require('./render');

// Message en/decryption and embedding into image
const { embed, digUp } = require('@mykeels/steganography');

// Load page template(s) on startup
const pages = {
  stegano: fs.readFileSync(_projectdir + '/views/stegano.html', { encoding: 'utf8' }),
  viewmessage: fs.readFileSync(_projectdir + '/views/viewmessage.html', { encoding: 'utf8' }),
};

// Insure request has at least one file
const noReqFiles = (req) =>
  (!req.files || Object.keys(req.files).length === 0);

// Check if file exists
const exists = (filepath) => {
  try {
    fs.statSync(filepath);
    return true;
  } catch(e) {
    return false;
  }
}

// Construct common used variables from web request
const postData = (cfg, req, fromImagesDir = false, fromEncrypt = false) => {
  let fname = fromImagesDir ? req.params.imagename : req.files.imageFile.name;
  let iname = fname;
  if (fromEncrypt && cfg.imagePrefix) {
    alreadyPrefixed = new RegExp('^' + cfg.imagePrefix);
    if (!alreadyPrefixed.test(iname)) iname = cfg.imagePrefix +
      '-' + (iname.replace(/-/g,'_'));
  }
  return {
    imageFile: fromImagesDir ? '(unused)' : req.files.imageFile,
    fname: fname,
    iname: iname,
    uploadPath: cfg.homeDir + '/uploads/' + fname,
    imagesPath: cfg.homeDir + '/public/' + cfg.imagesDir + '/' + iname,
    webaddr: req.protocol + '://' + req.get('host') + '/' + cfg.imagesDir + '/' + iname,
    pw: req.body.passphrase || ''
  }
}

// Encrypt payload and embed in image
const encryptImage = (cfg, req, res) => {
  if (noReqFiles(req)) {
    return renderError(cfg,res, 'No image file selected to encrypt.');
  }
  const { imageFile, fname, iname, uploadPath, imagesPath, webaddr, pw } = postData(cfg, req, false, true);
  if (exists(imagesPath) && !cfg.imageOverwrite) {
    return renderError(cfg, res, `Image ${iname} already exists`);
  }
  imageFile.mv(uploadPath, async (err) => {
    if (err) return renderError(cfg, res, err);
    try {
      let message = req.body.message;
      let type = req.body.textType;
      payload = JSON.stringify({ type, message }, null, 2);
      const buffer = await embed(uploadPath, payload, pw);
      fs.writeFileSync(imagesPath, buffer);
      render(cfg, res, pages.stegano, { payload, pw, webaddr, fname: iname });
    } catch (error) {
      return renderError(cfg, res, error, iname);
    }
  });
}

// Extract and decrypt payload from image
const decryptImage = (cfg, req, res, webpage = 'stegano') => {
  if (req.params.imagename) {
    return decryptStored(cfg, req, res, webpage);
  }
  if (noReqFiles(req)) {
    return renderError(cfg, res, 'No image file selected to decrypt.');
  }
  const { imageFile, fname, uploadPath, imagesPath, webaddr, pw } = postData(cfg, req);
  imageFile.mv(imagesPath, async (err) => {
    if (err) return renderError(cfg, res, err);
    try {
      const payload = await digUp(imagesPath, pw);
      render(cfg, res, pages[webpage], { payload, pw, webaddr, fname });
    } catch (error) {
      return renderError(cfg, res, error, fname);
    }
  });
}

const decryptStored = async (cfg, req, res, webpage = 'stegano') => {
  if (!req.params.imagename) {
    return renderError(cfg, res, 'No image file selected to decrypt.');
  }
  const { imageFile, fname, uploadPath, imagesPath, webaddr, pw } = postData(cfg, req, true);
  try {
    const payload = await digUp(imagesPath, pw);
    render(cfg, res, pages[webpage], { payload, pw, webaddr, fname });
  } catch (error) {
    return renderError(cfg, res, error, fname);
  }
}

exports.encryptImage = encryptImage;
exports.decryptImage = decryptImage;
