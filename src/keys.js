const fs = require('fs');
const _projectdir = require('path').resolve(__dirname, '..');

// Render Mustache templates
const { render, renderError } = require('./render');

// Load keys page template on starup
const pages = {
  keys: fs.readFileSync(_projectdir + '/views/keys.html', { encoding: 'utf8' }),
};

const viewKeys = (cfg, req, res) => {
  render(cfg, res, pages.keys, {  });
}

exports.viewKeys = viewKeys;
