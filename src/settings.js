const fs = require('fs');
const _projectdir = require('path').resolve(__dirname, '..');

// Render views
const { render, renderError } = require('./render');

// Load index and settings page templates
const pages = {
  settings: fs.readFileSync(_projectdir + '/views/settings.html', { encoding: 'utf8' }),
};

const saveSettings = (cfg, req, res) => {
  try {
    fs.writeFileSync(cfg.homeDir + '/settings/config.js',
    'const cfg = ' +
    JSON.stringify(cfg) +
    '\nexports.cfg = cfg;\n');
    return render(cfg, res, pages.settings, {});
  } catch (error) {
    return renderError(cfg, res, error);
  }
}

const postSettings = (cfg, req, res) => {
  Object.assign(cfg, req.body);

  // Insure image directory exists
  cfg.imagesDir = cfg.imagesDir.trim().replace(/^[/]/,'').replace(/[/]$/,'');
  try {
    fs.mkdirSync(cfg.homeDir + '/public/' + cfg.imagesDir, { recursive: true })
  } catch (e) {}

  return saveSettings(cfg, req, res);
}

exports.postSettings = postSettings;
