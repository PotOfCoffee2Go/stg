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

// Construct common used variables from web request
const postData = (cfg, req, fromImagesDir = false) => {
  let fname = fromImagesDir ? req.params.imagename : req.files.imageFile.name;
  let iname = fname;
  if (cfg.imagePrefix) {
    alreadyPrefixed = new RegExp('^' + cfg.imagePrefix);
    if (!alreadyPrefixed.test(iname)) iname = cfg.imagePrefix + iname;
  }
  return {
    imageFile: fromImagesDir ? '(unused)' : req.files.imageFile,
    fname: fname,
    uploadPath: cfg.homeDir + '/uploads/' + fname,
    imagesPath: cfg.homeDir + '/public/images/' + iname,
    webaddr: req.protocol + '://' + req.get('host') + '/images/' + iname,
    pw: req.body.passphrase || ''
  }
}

// Encrypt payload and embed in image
const encryptImage = (cfg, req, res) => {
  if (noReqFiles(req)) {
    return renderError(cfg,res, 'No image file selected to encrypt.');
  }
  const { imageFile, fname, uploadPath, imagesPath, webaddr, pw } = postData(cfg, req);
  imageFile.mv(uploadPath, async (err) => {
    if (err) return render(cfg, res, pages.error, { err, fname });
    try {
      let message = req.body.message,
        type = req.body.textType;
      console.log('3>>>', { type, message });
      payload = JSON.stringify({ type, message }, null, 2);
      const buffer = await embed(uploadPath, payload, pw);
      fs.writeFileSync(imagesPath, buffer);
      render(cfg, res, pages.stegano, { payload, pw, webaddr, fname });
    } catch (error) {
      return renderError(cfg, res, error, fname);
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
    if (err) return render(cfg, res, pages.error, { err, fname });
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
