'use strict';
const _projectdir = require('path').resolve(__dirname, '../..');

// Site configuration
const { cfg } = require('../../config');
const log = require('../services/logger');

// ------
// Directory maintenance on server startup
const fs = require('fs');
//cfg.keysDir = cfg.keysDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
cfg.messagesDir = cfg.messagesDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
log.info('Home:      %s', cfg.homeDir);
log.info('Images:    %s', cfg.homeDir + '/public/' + cfg.messagesDir);
log.info('Keys:      %s', cfg.homeDir + '/public/' + cfg.keysDir);
log.info('Lockboxes: %s', cfg.homeDir + '/public/' + cfg.lockboxesDir);
//log.info('Keys   directory: %s', cfg.key.publicDir);

// Clear uploads directory
try {
  fs.rmdirSync(cfg.homeDir + '/uploads', { recursive: true });
} catch (e) {}

// Insure working directories exist
['/public/' + cfg.messagesDir, '/public/' + cfg.keysDir,
  '/public/' + cfg.lockboxesDir, '/uploads', '/keys/db']
.forEach(dir => {
  try {
    fs.mkdirSync(cfg.homeDir + dir, { recursive: true })
  } catch (e) {}
});

// Express web server
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

// Enable CORS
app.use(cors(cfg.corsOptions));

// Image files are uploaded for processing
app.use(fileUpload());

// Assign steganography routes to server app
require('./routes').routes(express, app);

  // Open pcp keys database
require('../services').init(cfg)
  .then(() => {
    // Fire up the server!
    app.listen(cfg.listenPort, () => {
      log.info('Steganography server listening on port: %s', cfg.listenPort);
    })
  });
