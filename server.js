const fs = require('fs');

// Server home directory
const homeDir = process.cwd();

// ------
// Code modules
// Site default configuration
const { config } = require('./config');
// En(De)code text and embed/extract to/from images
const { encryptImage, decryptImage } = require('./src/stegano');
// Directory listing of stored encoded images
const { viewImagesDir } = require('./src/imagesdir');
// Settings page
const { postSettings } = require('./src/settings');
// Render views
const { render, renderError } = require('./src/render');

// ------
// Setup server directories and configuration

// Clear prior uploads
try {
  fs.rmdirSync(homeDir + '/uploads', { recursive: true });
} catch (e) {}

// Insure working directories exist
['/uploads', '/settings'].forEach(dir => {
  try {
    fs.mkdirSync(homeDir + dir, { recursive: true })
  } catch (e) {}
});

// If settings config does not exist create using defaults
try {
  fs.openSync(homeDir + '/settings/config.js');
} catch (err) {
  if (err.code === 'ENOENT') {
    fs.writeFileSync(homeDir + '/settings/config.js',
    'const cfg = ' +
    JSON.stringify(config) +
    '\nexports.cfg = cfg;\n');
  } else {
    throw err;
  }
}

// Site configuration - includes values from 'settings' page
const { cfg } = require('./settings/config');

// Insure image directory exists
cfg.imagesDir = cfg.imagesDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
try {
  fs.mkdirSync(homeDir + '/public/' + cfg.imagesDir, { recursive: true })
} catch (e) {}

// Load index and settings page templates
const pages = {
  home: fs.readFileSync(homeDir + '/views/home.html', { encoding: 'utf8' }),
  settings: fs.readFileSync(homeDir + '/views/settings.html', { encoding: 'utf8' }),
};

console.log('Home   directory:', homeDir);
console.log('Images directory:', homeDir + '/public/' + cfg.imagesDir);

// ------
// Express web server
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

// CORS insures only local machine can decode messages
//  Don't work :(
app.use(cors({ origin: 'http://localhost' }));

// Image files are uploaded for processing
app.use(fileUpload());

// ------
// Site pages
// Render home page
app.get(['/'], (req, res) => { render(cfg, res, pages.home, {}); });

// Get and Modify configuration settings
app.get('/settings', (req, res) => render(cfg, res, pages.settings, {}));
app.post('/settings', (req, res) => postSettings(cfg, req, res));

// Encode/Decode/View message within an image
app.post('/encrypt', (req, res) => encryptImage(cfg, req, res));
app.post('/decrypt/:imagename?', (req, res) => decryptImage(cfg, req, res, 'stegano'));
app.post('/view/:imagename?', (req, res) => decryptImage(cfg, req, res, 'viewmessage'));

// Display custom directory listing of stored encoded images
app.get('/imagesdir', (req, res) => viewImagesDir(cfg, req, res));

// ------
// Static assets
// Expose any pages in the public and doc directories
app.use(express.static(cfg.homeDir + '/docs'));
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

// Fire up the server!
app.listen(cfg.listenPort, () => {
  console.log('Steganography server listening on port:', cfg.listenPort);
});
