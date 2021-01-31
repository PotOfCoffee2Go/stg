// Site configuration
const { cfg } = require('./config');
// En(De)crypt text and embed/extract to/from images
const { encryptImage, decryptImage } = require('./src/stegano');
// Directory listing of stored encrypted images
const { viewImagesDir, viewKeysDir, viewBoxesDir  } = require('./src/viewdirs');
// Stored encrypted keys
const { promptPrimaryKeys, genPrimaryKeys } = require('./src/primarykeys');
// Stored encrypted lockboxes
const { promptLockBox, genLockBox } = require('./src/lockbox');
// Render views
const { render, renderError } = require('./src/render');

// ------
// Directory maintenance on server startup
const fs = require('fs');
cfg.keysDir = cfg.keysDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
cfg.imagesDir = cfg.imagesDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
console.log('Home:      ', cfg.homeDir);
console.log('Images:    ', cfg.homeDir + '/public/' + cfg.imagesDir);
console.log('Keys:      ', cfg.homeDir + '/public/' + cfg.keysDir);
console.log('Lockboxes: ', cfg.homeDir + '/public/' + cfg.lockboxesDir);
//console.log('Keys   directory:', cfg.key.publicDir);

// Clear uploads directory
try {
  fs.rmdirSync(cfg.homeDir + '/uploads', { recursive: true });
} catch (e) {}

// Insure working directories exist
['/public/' + cfg.imagesDir, '/public/' + cfg.keysDir,
  '/public/' + cfg.lockboxesDir, '/uploads']
.forEach(dir => {
  try {
    fs.mkdirSync(cfg.homeDir + dir, { recursive: true })
  } catch (e) {}
});

// Load index page template
const pages = {
  index: fs.readFileSync(__dirname + '/views/index.html', { encoding: 'utf8' }),
};

// ------
// Express web server
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

app.use(cors(cfg.corsOptions));

// Image files are uploaded for processing
app.use(fileUpload());

// ------
// Site routes
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
app.get('/imagesdir', (req, res) => viewImagesDir(cfg, req, res));

// Prompt and generation of primary keys
app.get('/genkeys', (req, res) => promptPrimaryKeys(cfg, req, res));
app.post('/genkeys', (req, res) => genPrimaryKeys(cfg, req, res));
// Prompt and generation of lockboxes
app.get('/genbox', (req, res) => promptLockbox(cfg, req, res));
app.post('/genbox', (req, res) => genLockbox(cfg, req, res));

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

// Open pcp keys database
//const { openKeyDb } = require('./src/keydb');
//openKeyDb(cfg)
//  .then((count) => {console.log(`GPG Key database ready - ${count} on file`)})
//  .then(() => {
    // Fire up the server!
    app.listen(cfg.listenPort, () => {
      console.log('Steganography server listening on port:', cfg.listenPort);
    })
//  });


