// Site configuration
const { cfg } = require('./config');
// En(De)crypt text and embed/extract to/from images
const { encryptImage, decryptImage } = require('./src/stegano');
// Directory listing of stored encrypted images
const { viewImagesDir } = require('./src/imagesdir');
// Render views
const { render, renderError } = require('./src/render');

// ------
// Directory maintenance on server startup
const fs = require('fs');
cfg.imagesDir = cfg.imagesDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
console.log('Home   directory:', cfg.homeDir);
console.log('Images directory:', cfg.homeDir + '/public/' + cfg.imagesDir);

// Clear uploads directory
try {
  fs.rmdirSync(cfg.homeDir + '/uploads', { recursive: true });
} catch (e) {}

// Insure working directories exist
['/public/' + cfg.imagesDir, '/uploads']
.forEach(dir => {
  try {
    fs.mkdirSync(cfg.homeDir + dir, { recursive: true })
  } catch (e) {}
});

// Load index page template
const pages = {
  home: fs.readFileSync(__dirname + '/views/home.html', { encoding: 'utf8' }),
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
// Site specific pages
// Render index.html
app.get(['/'], (req, res) => {
    render(cfg, res, pages.home, {});
});

// Encrypt/Decrypt/View requested message within image
app.post('/encrypt', (req, res) => encryptImage(cfg, req, res));
app.post('/decrypt/:imagename?', (req, res) => decryptImage(cfg, req, res, 'stegano'));
app.post('/view/:imagename?', (req, res) => decryptImage(cfg, req, res, 'viewmessage'));

// Display custom directory listing of stored embedded images
app.get('/imagesdir', (req, res) => viewImagesDir(cfg, req, res));

// ------
// Static assets
// Expose any pages in the public directories
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
