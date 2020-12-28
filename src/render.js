const fs = require('fs');
const _projectdir = require('path').resolve(__dirname, '..');

// Render mustache templates
const Mustache = require('mustache');

// Load error page template on starup
const pages = {
  error: fs.readFileSync(_projectdir + '/views/error.html', { encoding: 'utf8' }),
};

// Render template with dynamic data
const render = (cfg, res, template, ctx) => {
  ctx.cfg = cfg;
  return res.send(Mustache.render(template, ctx));
}

// Render errror page
const renderError = (cfg, res, error, fname = '') => {
  let ctx = { error, fname };
  return render(cfg, res, pages.error, ctx);
}

exports.render = render;
exports.renderError = renderError;
