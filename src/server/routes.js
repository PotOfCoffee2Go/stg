'use strict';
const _projectdir = require('path').resolve(__dirname, '../..');
const log = require('../services/logger');

// En(De)crypt text and embed/extract to/from images
const { encryptImage, decryptImage } = require('../stegano');
// Directory listing of stored encrypted images
const { viewImagesDir, viewKeysDir, viewBoxesDir  } = require('../viewdirs');
// Stored encrypted keys
const { promptPrimaryKeys, genPrimaryKeys } = require('../primarykeys');
// Stored encrypted lockboxes
const { promptLockBox, genLockBox } = require('../lockbox');
// Render views
const { render, renderError } = require('../render');

// Load index page template
const pages = {
  index: require('fs').readFileSync(_projectdir + '/views/index.html', { encoding: 'utf8' }),
};

// ------
// Site routes
const routes = (server) => {
  const {cfg, express, app} = server;
  // Render index.html
  app.get(['/','/index','/index.html'], (req, res) => {
    render(cfg, res, pages.index, {});
  });

  // Encrypt/Decrypt/View requested message within image
  app.post('/encrypt', (req, res) => encryptImage(cfg, req, res));
  app.post('/decrypt/:imagename?', (req, res) => decryptImage(cfg, req, res, 'stegano'));
  app.post('/view/:imagename?', (req, res) => decryptImage(cfg, req, res, 'viewmessage'));

  // Display custom directory listings public keys and embedded images
  app.get('/keysdir', (req, res) => viewKeysDir(cfg, req, res));
  app.get('/boxesdir', (req, res) => viewBoxesDir(cfg, req, res));
  app.get('/messagesdir', (req, res) => viewImagesDir(cfg, req, res));

  // Prompt and generation of primary keys
  app.get('/genkeys', (req, res) => promptPrimaryKeys(cfg, req, res));
  app.post('/genkeys', (req, res) => genPrimaryKeys(cfg, req, res));
  // Prompt and generation of lockboxes
  app.get('/genbox', (req, res) => promptLockBox(cfg, req, res));
  app.post('/genbox', (req, res) => genLockBox(cfg, req, res));

  // ------
  // Static assets
  // Expose any pages in the public directory
  app.use(express.static(cfg.homeDir + '/public'));

  // ------
  // Errors - show few details
  // Request to show error page
  app.get('/error/:error', (req, res) => renderError(cfg, res, req.params.error));

  // Catch common server errors
  app.use((req, res) => res.status(400).send('404: Page "' + req.originalUrl + '" not Found ;('));
  app.use((error, req, res, next) => {
  console.dir(error);
  if (/^CORS/.test(error.message)) {
    return renderError(cfg, res, error.message);
  }
  res.status(500).send('500: Internal Server Error ;(');
  });
}

exports.assignTo = routes;
